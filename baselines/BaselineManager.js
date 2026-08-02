/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness Certification System (EAORCS)
 * Module         : Versioned Qualification Baselines (Stream Epsilon)
 * File           : BaselineManager.js
 * Version        : 2026.1.0-LTS
 * Author         : EAORCS Platform Engineering Team & Architectural Governance Council
 * Organization   : Chicitadel / Air Roofers SASU
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 ******************************************************************************/

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Baseline Lifecycle Manager
 * Handles capturing, comparing, promoting, and listing qualification baselines.
 */
class BaselineManager {
  /**
   * @param {string} baselinesDir Directory where baselines are stored
   */
  constructor(baselinesDir = 'baselines') {
    this.baselinesDir = baselinesDir;
  }

  /**
   * Computes the Merkle Root for a collection of file objects.
   * Algorithm:
   * 1. Sort files by relativePath (alphanumerically)
   * 2. SHA-256 hash each file's sha256 value
   * 3. Iteratively hash pairs (if odd, last item hashes with itself)
   * 4. Return final root as hex string
   *
   * @param {Array<{relativePath: string, sha256: string}>} files 
   * @returns {string} Merkle root hex string
   * @private
   */
  _computeMerkleRoot(files) {
    if (!files || files.length === 0) {
      return crypto.createHash('sha256').update('').digest('hex');
    }

    // Sort files by relativePath alphanumerically
    const sorted = [...files].sort((a, b) => a.relativePath.localeCompare(b.relativePath));

    // SHA-256 hash each file's sha256 value to produce leaf node hashes
    let layer = sorted.map(f => crypto.createHash('sha256').update(f.sha256).digest('hex'));

    // Iteratively hash pairs until a single root hash remains
    while (layer.length > 1) {
      const nextLayer = [];
      for (let i = 0; i < layer.length; i += 2) {
        const left = layer[i];
        const right = (i + 1 < layer.length) ? layer[i + 1] : left;
        const combined = crypto.createHash('sha256').update(left + right).digest('hex');
        nextLayer.push(combined);
      }
      layer = nextLayer;
    }

    return layer[0];
  }

  /**
   * Walks the specified docsDir and computes SHA-256 hashes and file sizes for all .md and .json files.
   * 
   * @param {string} docsDir Path to documentation directory
   * @returns {Array<{relativePath: string, sha256: string, sizeBytes: number}>}
   * @private
   */
  _walkDocsDir(docsDir) {
    const fileList = [];
    if (!fs.existsSync(docsDir)) {
      return fileList;
    }

    const walk = (currentDir) => {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (ext === '.md' || ext === '.json') {
            // Ignore baseline output report to ensure self-consistency
            if (entry.name === 'baseline_report.md') {
              continue;
            }
            const relativePath = path.relative(docsDir, fullPath).replace(/\\/g, '/');
            const fileBuffer = fs.readFileSync(fullPath);
            const sha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex');
            const sizeBytes = fileBuffer.length;
            fileList.push({ relativePath, sha256, sizeBytes });
          }
        }
      }
    };

    walk(docsDir);
    return fileList.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
  }

  /**
   * Capture current docs/ state as a baseline for given version.
   *
   * @param {string} version Target version identifier (e.g., '2026.1.0-lts')
   * @param {string} docsDir Documentation directory path
   * @returns {Object} Baseline manifest object
   */
  capture(version, docsDir = 'docs') {
    const files = this._walkDocsDir(docsDir);
    const capturedAt = new Date().toISOString();
    const merkleRoot = this._computeMerkleRoot(files);
    const timeFormatted = capturedAt.replace(/[:.]/g, '-');
    const baselineId = `BASELINE-EAORCS-${version}-${timeFormatted}`;

    const baselineObj = {
      baselineId,
      version,
      capturedAt,
      fileCount: files.length,
      merkleRoot,
      files
    };

    const targetDir = path.join(this.baselinesDir, version);
    fs.mkdirSync(targetDir, { recursive: true });

    const targetFile = path.join(targetDir, 'baseline.json');
    fs.writeFileSync(targetFile, JSON.stringify(baselineObj, null, 2), 'utf8');

    return baselineObj;
  }

  /**
   * Compare current docs/ state against stored baseline for given version.
   *
   * @param {string} version Version baseline to compare against
   * @param {string} docsDir Current documentation directory path
   * @returns {Object} Comparison result object with verdict and drift details
   */
  compare(version, docsDir = 'docs') {
    const baselinePath = path.join(this.baselinesDir, version, 'baseline.json');
    if (!fs.existsSync(baselinePath)) {
      throw new Error(`Baseline not found for version '${version}' at path: ${baselinePath}`);
    }

    const baselineData = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
    const currentFiles = this._walkDocsDir(docsDir);

    const baselineMap = new Map(baselineData.files.map(f => [f.relativePath, f]));
    const currentMap = new Map(currentFiles.map(f => [f.relativePath, f]));

    const matched = [];
    const added = [];
    const removed = [];
    const changed = [];

    for (const curr of currentFiles) {
      if (!baselineMap.has(curr.relativePath)) {
        added.push(curr);
      } else {
        const base = baselineMap.get(curr.relativePath);
        if (base.sha256 === curr.sha256) {
          matched.push(curr);
        } else {
          changed.push({
            relativePath: curr.relativePath,
            expectedSha256: base.sha256,
            actualSha256: curr.sha256,
            sizeBytes: curr.sizeBytes
          });
        }
      }
    }

    for (const base of baselineData.files) {
      if (!currentMap.has(base.relativePath)) {
        removed.push(base);
      }
    }

    const driftCount = added.length + removed.length + changed.length;
    const verdict = driftCount === 0 ? 'BASELINE_MATCH' : 'DRIFT_DETECTED';

    return {
      version,
      verdict,
      matched,
      added,
      removed,
      changed,
      driftCount
    };
  }

  /**
   * Promote a version's baseline as the canonical release baseline.
   * Copies baselines/{version}/baseline.json to baselines/current.json with promotedAt timestamp.
   *
   * @param {string} version Version to promote
   * @returns {Object} Promoted baseline manifest object
   */
  promote(version) {
    const baselinePath = path.join(this.baselinesDir, version, 'baseline.json');
    if (!fs.existsSync(baselinePath)) {
      throw new Error(`Baseline not found for version '${version}' at path: ${baselinePath}`);
    }

    const baselineData = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
    baselineData.promotedAt = new Date().toISOString();

    fs.mkdirSync(this.baselinesDir, { recursive: true });
    const currentPath = path.join(this.baselinesDir, 'current.json');
    fs.writeFileSync(currentPath, JSON.stringify(baselineData, null, 2), 'utf8');

    return baselineData;
  }

  /**
   * List all stored qualification baselines.
   *
   * @returns {Array<{version: string, baselineId: string, capturedAt: string, fileCount: number, merkleRoot: string}>}
   */
  list() {
    if (!fs.existsSync(this.baselinesDir)) {
      return [];
    }

    const entries = fs.readdirSync(this.baselinesDir, { withFileTypes: true });
    const baselines = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const baselinePath = path.join(this.baselinesDir, entry.name, 'baseline.json');
        if (fs.existsSync(baselinePath)) {
          try {
            const data = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
            baselines.push({
              version: data.version,
              baselineId: data.baselineId,
              capturedAt: data.capturedAt,
              fileCount: data.fileCount,
              merkleRoot: data.merkleRoot
            });
          } catch (err) {
            // Ignore malformed baseline manifests
          }
        }
      }
    }

    return baselines.sort((a, b) => a.version.localeCompare(b.version));
  }
}

module.exports = BaselineManager;
