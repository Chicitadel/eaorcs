/******************************************************************************
 * Project        : EAORCS
 * Module         : Encrypted AirPackage Security Engine
 * File           : engine/security/AirPackageEngine.js
 * Version        : 2026.3.0-LTS
 * Author         : Enterprise Architecture & Security Governance Board
 * Organization   : Air Roofers Governance Directorate
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : ENTERPRISE
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
 * Copyright (c) 2026 Air Roofers Governance Directorate
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const crypto = require('crypto');

class AirPackageEngine {
  constructor(secretKey = null) {
    // 256-bit key for AES-256-GCM container encryption
    this.key = secretKey || crypto.scryptSync('AirRoofers_SDPA_Secret_Seed', 'salt', 32);
  }

  /**
   * Package and encrypt a policy or solution pack into an .airpkg structure
   * @param {Object} packManifest 
   * @param {Object} contents 
   * @returns {Object} Encrypted AirPackage object (.airpkg)
   */
  createPackage(packManifest, contents) {
    if (!packManifest.capabilityId || !packManifest.issuer || !packManifest.licenseTier) {
      throw new Error('Invalid package manifest: missing required capability metadata.');
    }

    const payloadRaw = JSON.stringify({
      manifest: packManifest,
      contents,
      timestamp: new Date().toISOString()
    });

    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);
    
    let encrypted = cipher.update(payloadRaw, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    const manifestSignature = crypto
      .createHmac('sha256', this.key)
      .update(`${packManifest.capabilityId}:${packManifest.version}:${packManifest.licenseTier}`)
      .digest('hex');

    return {
      format: 'AIRPKG_V1',
      capabilityId: packManifest.capabilityId,
      version: packManifest.version || '1.0.0',
      licenseTier: packManifest.licenseTier,
      issuer: packManifest.issuer,
      signature: manifestSignature,
      iv: iv.toString('hex'),
      authTag,
      encryptedData: encrypted,
      integrityHash: crypto.createHash('sha256').update(encrypted).digest('hex')
    };
  }

  /**
   * Verify and unpack an .airpkg container
   * @param {Object} airpkg 
   * @param {string} userLicenseTier 
   * @returns {Object} Unpacked contents
   */
  verifyAndUnpack(airpkg, userLicenseTier = 'ENTERPRISE') {
    if (airpkg.format !== 'AIRPKG_V1') {
      throw new Error('Unsupported package format. Expected AIRPKG_V1');
    }

    // Verify HMAC signature
    const expectedSignature = crypto
      .createHmac('sha256', this.key)
      .update(`${airpkg.capabilityId}:${airpkg.version}:${airpkg.licenseTier}`)
      .digest('hex');

    if (airpkg.signature !== expectedSignature) {
      throw new Error('AirPackage signature verification failed: Package is tampered or invalid signature.');
    }

    // License tier check
    const tiers = ['COMMUNITY', 'PROFESSIONAL', 'ENTERPRISE', 'SOVEREIGN'];
    const requiredLevel = tiers.indexOf(airpkg.licenseTier);
    const currentLevel = tiers.indexOf(userLicenseTier);

    if (currentLevel < requiredLevel) {
      throw new Error(`Entitlement Failure: Package requires license tier ${airpkg.licenseTier}, user has ${userLicenseTier}`);
    }

    // Decrypt container
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      this.key,
      Buffer.from(airpkg.iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(airpkg.authTag, 'hex'));

    let decrypted = decipher.update(airpkg.encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  }
}

module.exports = AirPackageEngine;
