/******************************************************************************
 * Project        : EAORCS
 * Module         : Evidence / Reproducibility
 * File           : HashManifestGenerator.js
 * Version        : 2026.1.0-LTS
 * Author         : Enterprise Architecture Authority
 * Organization   : Ujomor Platform
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE
 *
 * Governance:
 * - Policy Governed
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
 *
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Ujomor Platform
 * All Rights Reserved.
 ******************************************************************************/

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Computes a deterministic Merkle root hash from an array of entry objects or sha256 strings.
 *
 * @param {Array<{sha256: string}>|Array<string>} entries
 * @returns {string} Merkle root hex string
 */
function computeMerkleRoot(entries) {
  if (!entries || entries.length === 0) return '';
  let hashes = entries.map(e => {
    const val = typeof e === 'string' ? e : e.sha256;
    return crypto.createHash('sha256').update(val).digest('hex');
  });

  while (hashes.length > 1) {
    const nextLevel = [];
    for (let i = 0; i < hashes.length; i += 2) {
      if (i + 1 < hashes.length) {
        const pair = hashes[i] + hashes[i + 1];
        nextLevel.push(crypto.createHash('sha256').update(pair).digest('hex'));
      } else {
        nextLevel.push(crypto.createHash('sha256').update(hashes[i]).digest('hex'));
      }
    }
    hashes = nextLevel;
  }
  return hashes[0];
}

/**
 * Recursively scans docsDir for .md and .json files, computes SHA-256 hashes,
 * builds a manifest with a Merkle root, and writes evidence/hash_manifest.json.
 *
 * @param {string} docsDir
 * @returns {Object} Manifest object
 */
function generate(docsDir = 'docs') {
  const fullDocsDir = path.resolve(process.cwd(), docsDir);
  const entries = [];

  function walk(currentDir) {
    if (!fs.existsSync(currentDir)) return;
    const items = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(currentDir, item.name);
      if (item.isDirectory()) {
        walk(fullPath);
      } else if (item.isFile()) {
        const ext = path.extname(item.name).toLowerCase();
        if (ext === '.md' || ext === '.json') {
          const relativePath = path.relative(fullDocsDir, fullPath).replace(/\\/g, '/');
          if (relativePath === 'reproducibility_report.md') {
            continue;
          }
          const content = fs.readFileSync(fullPath);
          const sha256 = crypto.createHash('sha256').update(content).digest('hex');
          const stat = fs.statSync(fullPath);

          entries.push({
            file: item.name,
            relativePath: relativePath,
            sha256: sha256,
            sizeBytes: stat.size,
            generatedAt: new Date(stat.mtime).toISOString()
          });
        }
      }
    }
  }

  walk(fullDocsDir);

  entries.sort((a, b) => a.relativePath.localeCompare(b.relativePath));

  const merkleRoot = computeMerkleRoot(entries);

  const manifest = {
    manifestId: `HM-EAORCS-2026.1.0-LTS-${Date.now()}`,
    version: '2026.1.0-lts',
    generatedAt: new Date().toISOString(),
    merkleRoot: merkleRoot,
    fileCount: entries.length,
    files: entries
  };

  const manifestPath = path.resolve(process.cwd(), 'evidence/hash_manifest.json');
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

  return manifest;
}

module.exports = {
  generate,
  computeMerkleRoot
};
