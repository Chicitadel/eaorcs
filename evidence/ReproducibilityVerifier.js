/******************************************************************************
 * Project        : EAORCS
 * Module         : Evidence / Reproducibility
 * File           : ReproducibilityVerifier.js
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
const { computeMerkleRoot } = require('./HashManifestGenerator');

/**
 * Loads a manifest and re-hashes all listed files, comparing individual hashes
 * and recomputing the overall Merkle root to prove reproducibility.
 *
 * @param {string} manifestPath - Path to evidence/hash_manifest.json
 * @param {string} docsDir - Base directory for documentation files
 * @returns {Object} Verification results
 */
function verify(manifestPath = 'evidence/hash_manifest.json', docsDir = 'docs') {
  const fullManifestPath = path.resolve(process.cwd(), manifestPath);
  if (!fs.existsSync(fullManifestPath)) {
    throw new Error(`Manifest file not found at ${fullManifestPath}`);
  }

  const manifest = JSON.parse(fs.readFileSync(fullManifestPath, 'utf8'));
  const fullDocsDir = path.resolve(process.cwd(), docsDir);

  let matched = 0;
  const drifted = [];
  const recomputedEntries = [];

  for (const entry of manifest.files) {
    const filePath = path.join(fullDocsDir, entry.relativePath);
    if (!fs.existsSync(filePath)) {
      drifted.push({
        file: entry.relativePath,
        stored: entry.sha256,
        recomputed: null,
        match: false,
        reason: 'FILE_MISSING'
      });
      continue;
    }

    const content = fs.readFileSync(filePath);
    const recomputed = crypto.createHash('sha256').update(content).digest('hex');
    const match = (recomputed === entry.sha256);

    if (match) {
      matched++;
    } else {
      drifted.push({
        file: entry.relativePath,
        stored: entry.sha256,
        recomputed: recomputed,
        match: false,
        reason: 'HASH_MISMATCH'
      });
    }

    recomputedEntries.push({
      relativePath: entry.relativePath,
      sha256: recomputed
    });
  }

  recomputedEntries.sort((a, b) => a.relativePath.localeCompare(b.relativePath));

  const recomputedMerkleRoot = computeMerkleRoot(recomputedEntries);
  const merkleMatch = (recomputedMerkleRoot === manifest.merkleRoot);

  const isReproducible = (matched === manifest.fileCount) && (drifted.length === 0) && merkleMatch;
  const verdict = isReproducible ? 'REPRODUCIBLE' : 'DRIFT_DETECTED';

  return {
    verdict,
    totalFiles: manifest.fileCount,
    matched,
    drifted,
    storedMerkleRoot: manifest.merkleRoot,
    recomputedMerkleRoot,
    merkleMatch
  };
}

module.exports = {
  verify
};
