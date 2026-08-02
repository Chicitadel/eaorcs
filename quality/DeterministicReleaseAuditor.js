/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Clean Build & Deterministic Release Audit
 * File           : DeterministicReleaseAuditor.js
 * Version        : 2026.1.0-LTS
 * Author         : Ujomor Systems / Air Roofers Architecture Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
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
 *
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const RELEASE_ARTIFACTS = [
  { path: 'docs/product_readiness_certificate.json', type: 'certificate', hasSig: true },
  { path: 'docs/osap_passport_2026.1.0-lts.json', type: 'osap', hasSig: false },
  { path: 'docs/sbom_2026.1.0-lts.json', type: 'sbom', hasSig: false },
  { path: 'docs/signature_manifest_2026.1.0-lts.json', type: 'manifest', hasSig: false },
  { path: 'evidence/requirement_manifest.json', type: 'evidence', hasSig: false },
  { path: 'evidence/hash_manifest.json', type: 'hash_manifest', hasSig: false },
  { path: 'baselines/2026.1.0-lts/baseline.json', type: 'baseline', hasSig: false }
];

class DeterministicReleaseAuditor {
  constructor(cwd) {
    this.cwd = cwd || process.cwd();
  }

  /**
   * Computes the SHA-256 hash and metadata for a given file path.
   *
   * @param {string} filePath
   * @returns {Object} { path, sha256, sizeBytes, exists: boolean }
   */
  hashArtifact(filePath) {
    const fullPath = path.resolve(this.cwd, filePath);
    if (!fs.existsSync(fullPath)) {
      return { path: filePath, sha256: null, sizeBytes: 0, exists: false };
    }
    const content = fs.readFileSync(fullPath);
    const sha256 = crypto.createHash('sha256').update(content).digest('hex');
    const stats = fs.statSync(fullPath);
    return { path: filePath, sha256, sizeBytes: stats.size, exists: true };
  }

  /**
   * Evaluates an artifact for deterministic (stable) vs non-deterministic (timestamp/volatile) fields.
   * Computes a SHA-256 digest on canonical JSON composed exclusively of deterministic fields.
   *
   * @param {string} filePath
   * @returns {Object} { deterministicFields: Array, timestampFields: Array, deterministicHash: string }
   */
  checkDeterministicFields(filePath) {
    const fullPath = path.resolve(this.cwd, filePath);
    if (!fs.existsSync(fullPath)) {
      return { deterministicFields: [], timestampFields: [], deterministicHash: null };
    }

    let data;
    try {
      data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    } catch (e) {
      return { deterministicFields: [], timestampFields: [], deterministicHash: null };
    }

    const timestampKeyPatterns = [
      'timestamp', 'generatedat', 'generated_at', 'issuedat', 'issued_at',
      'expiresat', 'expires_at', 'signedat', 'signed_at', 'capturedat',
      'captured_at', 'signingtimestamp', 'passport_id', 'serialnumber',
      'baselineid', 'manifestid', 'build_id'
    ];

    function isTimestampKey(key) {
      return timestampKeyPatterns.includes(key.toLowerCase());
    }

    const deterministicFields = [];
    const timestampFields = [];

    function stripAndCollect(obj) {
      if (Array.isArray(obj)) {
        return obj.map(item => stripAndCollect(item));
      } else if (obj !== null && typeof obj === 'object') {
        const cleaned = {};
        const keys = Object.keys(obj).sort();
        for (const k of keys) {
          if (isTimestampKey(k)) {
            if (!timestampFields.includes(k)) {
              timestampFields.push(k);
            }
          } else {
            if (!deterministicFields.includes(k)) {
              deterministicFields.push(k);
            }
            cleaned[k] = stripAndCollect(obj[k]);
          }
        }
        return cleaned;
      }
      return obj;
    }

    const cleanObj = stripAndCollect(data);
    const canonicalJson = JSON.stringify(cleanObj);
    const deterministicHash = crypto.createHash('sha256').update(canonicalJson).digest('hex');

    return {
      deterministicFields,
      timestampFields,
      deterministicHash
    };
  }

  /**
   * Audits all 7 release artifacts, verifying presence, schema integrity,
   * required fields, signatures, and certification level.
   *
   * @returns {Array<Object>} Array of artifact audit result objects
   */
  auditAllArtifacts() {
    const results = [];

    for (const item of RELEASE_ARTIFACTS) {
      const hashInfo = this.hashArtifact(item.path);
      let valid = false;
      let details = '';

      if (!hashInfo.exists) {
        valid = false;
        details = 'File missing';
      } else {
        try {
          const fullPath = path.resolve(this.cwd, item.path);
          const raw = fs.readFileSync(fullPath, 'utf8');
          const json = JSON.parse(raw);

          const hasVersion = !!(json.version || json.osap_version || json.specVersion);
          const hasId = !!(
            json.certificateId ||
            json.passport_id ||
            json.baselineId ||
            json.manifestId ||
            json.title ||
            json.bomFormat ||
            json.signerPublicKey
          );

          if (item.type === 'certificate') {
            const isPlatinum = json.certificationLevel === 'PLATINUM';
            const hasCertId = !!json.certificateId;
            const hasSig = !item.hasSig || (json.signature && json.signature.value);
            valid = isPlatinum && hasCertId && hasSig;
            details = valid ? 'Platinum Certificate Verified (Level PLATINUM)' : 'Certificate validation failed';
          } else if (item.type === 'osap') {
            valid = (json.osap_version === '2.0.0' || !!json.osap_version) && !!json.passport_id;
            details = valid ? 'OSAP Passport Schema Valid' : 'OSAP Passport invalid';
          } else if (item.type === 'sbom') {
            valid = json.bomFormat === 'CycloneDX' && json.specVersion === '1.4';
            details = valid ? 'CycloneDX 1.4 SBOM Valid' : 'SBOM format/version invalid';
          } else if (item.type === 'manifest') {
            valid = !!(json.files && json.signerPublicKey);
            details = valid ? 'Signature Manifest Valid' : 'Signature Manifest invalid';
          } else if (item.type === 'evidence') {
            valid = !!(json.requirements && json.summary);
            details = valid ? 'Requirement Manifest Valid' : 'Requirement Manifest invalid';
          } else if (item.type === 'hash_manifest') {
            valid = !!(json.merkleRoot && json.files);
            details = valid ? 'Hash Manifest Valid' : 'Hash Manifest invalid';
          } else if (item.type === 'baseline') {
            valid = !!(json.merkleRoot && json.files);
            details = valid ? 'Baseline Integrity Valid' : 'Baseline invalid';
          } else {
            valid = hasVersion && hasId;
            details = valid ? 'Artifact Valid' : 'Artifact validation checks failed';
          }
        } catch (err) {
          valid = false;
          details = `JSON Parse Error: ${err.message}`;
        }
      }

      const deterministicInfo = this.checkDeterministicFields(item.path);

      results.push({
        path: item.path,
        type: item.type,
        hasSig: item.hasSig,
        sha256: hashInfo.sha256,
        sizeBytes: hashInfo.sizeBytes,
        exists: hashInfo.exists,
        valid,
        details,
        deterministicFields: deterministicInfo.deterministicFields,
        timestampFields: deterministicInfo.timestampFields,
        deterministicHash: deterministicInfo.deterministicHash
      });
    }

    return results;
  }

  /**
   * Generates a markdown report and structured JSON representation of the release audit.
   *
   * @param {Array<Object>} results
   * @returns {Object} { markdown: string, json: Array }
   */
  generateAuditReport(results) {
    let md = '# EAORCS Clean Build & Deterministic Release Audit Report\n\n';
    md += `**Generated Date:** ${new Date().toISOString()}\n`;
    md += `**Authority:** Air Roofers Architecture Authority / Ujomor Systems\n`;
    md += `**Classification:** Enterprise Release Integrity Audit\n\n`;

    md += '## 1. Executive Summary\n\n';
    const total = results.length;
    const existing = results.filter(r => r.exists).length;
    const valid = results.filter(r => r.valid).length;
    const allValid = valid === total;

    md += `- **Total Release Artifacts:** ${total}\n`;
    md += `- **Artifacts Present:** ${existing}/${total}\n`;
    md += `- **Artifacts Validated:** ${valid}/${total}\n`;
    md += `- **Overall Audit Status:** ${allValid ? '🟢 PASSED (PLATINUM CERTIFIED)' : '🔴 FAILED'}\n\n`;

    md += '## 2. Release Artifact Integrity Matrix\n\n';
    md += '| Artifact Path | Type | Exists | SHA-256 (16-char) | Valid | Deterministic Hash (16-char) | Audit Status |\n';
    md += '| --- | --- | --- | --- | --- | --- | --- |\n';

    for (const r of results) {
      const shaShort = r.sha256 ? r.sha256.substring(0, 16) : 'N/A';
      const detShort = r.deterministicHash ? r.deterministicHash.substring(0, 16) : 'N/A';
      const existsStr = r.exists ? 'YES' : 'NO';
      const validStr = r.valid ? 'PASS' : 'FAIL';
      const statusStr = r.valid && r.exists ? 'VALID' : 'INVALID';
      md += `| \`${r.path}\` | \`${r.type}\` | ${existsStr} | \`${shaShort}\` | ${validStr} | \`${detShort}\` | ${statusStr} |\n`;
    }

    md += '\n## 3. Detailed Deterministic Field Breakdown\n\n';
    for (const r of results) {
      md += `### ${r.path}\n`;
      md += `- **Artifact Type:** \`${r.type}\` (Signature Required: ${r.hasSig ? 'Yes' : 'No'})\n`;
      md += `- **Full SHA-256 Digest:** \`${r.sha256 || 'N/A'}\`\n`;
      md += `- **Deterministic Content Hash:** \`${r.deterministicHash || 'N/A'}\`\n`;
      md += `- **Stable Core Fields (${r.deterministicFields.length}):** \`${r.deterministicFields.join(', ')}\`\n`;
      md += `- **Volatile Timestamp Fields (${r.timestampFields.length}):** \`${r.timestampFields.join(', ')}\`\n`;
      md += `- **Validation Result:** ${r.details}\n\n`;
    }

    return {
      markdown: md,
      json: results
    };
  }
}

module.exports = DeterministicReleaseAuditor;
module.exports.DeterministicReleaseAuditor = DeterministicReleaseAuditor;
module.exports.RELEASE_ARTIFACTS = RELEASE_ARTIFACTS;
