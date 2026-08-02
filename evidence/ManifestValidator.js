/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Evidence Verification System / Manifest Validator
 * File           : ManifestValidator.js
 * Version        : 2026.1.0-LTS
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | GOVERNMENT | CONFIDENTIAL
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
 * - Architecture Authority: APPROVED
 * - Security Authority: APPROVED
 * - Governance Authority: APPROVED
 * - Deployment Authority: APPROVED
 *
 * Copyright (c) 2026 Ujomor Systems. All Rights Reserved.
 ******************************************************************************/

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class ManifestValidator {
  constructor(baseDir = process.cwd()) {
    this.baseDir = baseDir;
  }

  /**
   * Validates evidence/requirement_manifest.json against physical filesystem
   * @param {Object} options 
   * @returns {Object} { valid: boolean, total: number, verified: number, broken: Array, drifted: Array }
   */
  validate(options = {}) {
    const baseDir = options.baseDir || this.baseDir || process.cwd();
    const manifestPath = path.join(baseDir, 'evidence', 'requirement_manifest.json');

    if (!fs.existsSync(manifestPath)) {
      throw new Error(`Requirement manifest file not found at: ${manifestPath}. Run ManifestGenerator first.`);
    }

    const rawData = fs.readFileSync(manifestPath, 'utf8');
    const manifestData = JSON.parse(rawData);
    const requirements = manifestData.requirements || [];

    const broken = [];
    const drifted = [];
    let verifiedCount = 0;

    for (const req of requirements) {
      const implPath = path.resolve(baseDir, req.implementation);
      const testPath = path.resolve(baseDir, req.test);
      const evPath = path.resolve(baseDir, req.evidence);

      const implExists = fs.existsSync(implPath);
      const testExists = fs.existsSync(testPath);
      const evExists = fs.existsSync(evPath);

      if (!implExists || !testExists || !evExists) {
        broken.push({
          id: req.id,
          description: req.description,
          missingFiles: [
            !implExists ? `implementation (${req.implementation})` : null,
            !testExists ? `test (${req.test})` : null,
            !evExists ? `evidence (${req.evidence})` : null
          ].filter(Boolean)
        });
        continue;
      }

      // Re-hash implementation file to check for code drift
      let currentHash = null;
      try {
        const content = fs.readFileSync(implPath);
        currentHash = crypto.createHash('sha256').update(content).digest('hex');
      } catch (err) {
        currentHash = null;
      }

      if (req.implementationHash && currentHash !== req.implementationHash) {
        drifted.push({
          id: req.id,
          implementation: req.implementation,
          expectedHash: req.implementationHash,
          currentHash
        });
      } else {
        verifiedCount++;
      }
    }

    const isValid = broken.length === 0 && drifted.length === 0;

    return {
      valid: isValid,
      total: requirements.length,
      verified: verifiedCount,
      broken,
      drifted
    };
  }

  static validate(options = {}) {
    return new ManifestValidator(options.baseDir).validate(options);
  }
}

module.exports = ManifestValidator;
