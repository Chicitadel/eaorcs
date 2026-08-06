/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Multi-Tenant MSP Storage Governor
 * File           : MultiTenantStorageGovernor.js
 * Version        : 2026.2-LTS (v1.1.0-FROZEN Master Specification)
 * Author         : Architectural Governance Council & Platform Engineering
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Architecture Authority Approved & RATIFIED
 * - UAIGOS 3.0.0 & DPA/PDA v1.1.0-FROZEN Compliant
 * - ISO 27001 / SOC 2 / OWASP ASVS / NIST SP 800-161 / SLSA Level 4 Enforced
 *
 * Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class MultiTenantStorageGovernor {
  constructor(baseStorageDir) {
    this.baseStorageDir = baseStorageDir || path.join(process.cwd(), 'storage', 'tenants');
    if (!fs.existsSync(this.baseStorageDir)) {
      fs.mkdirSync(this.baseStorageDir, { recursive: true });
    }
  }

  /**
   * Get isolated tenant directory
   */
  getTenantDir(tenantId) {
    const safeTenant = (tenantId || 'default').replace(/[^a-zA-Z0-9_-]/g, '_');
    const tenantDir = path.join(this.baseStorageDir, safeTenant);
    if (!fs.existsSync(tenantDir)) {
      fs.mkdirSync(tenantDir, { recursive: true });
    }
    return tenantDir;
  }

  /**
   * Store payload with tenant encapsulation and SHA256 checksum
   */
  storeTenantArtifact(tenantId, artifactKey, data) {
    const tenantDir = this.getTenantDir(tenantId);
    const safeKey = artifactKey.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filePath = path.join(tenantDir, `${safeKey}.json`);

    const rawData = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    const checksum = crypto.createHash('sha256').update(rawData).digest('hex');

    const envelope = {
      tenant_id: tenantId,
      artifact_key: artifactKey,
      checksum_sha256: checksum,
      stored_at: new Date().toISOString(),
      payload: rawData
    };

    fs.writeFileSync(filePath, JSON.stringify(envelope, null, 2), 'utf8');

    return {
      status: 'STORED',
      tenant_id: tenantId,
      artifact_key: artifactKey,
      checksum_sha256: checksum,
      path: filePath
    };
  }

  /**
   * Read tenant artifact with integrity verification
   */
  readTenantArtifact(tenantId, artifactKey) {
    const tenantDir = this.getTenantDir(tenantId);
    const safeKey = artifactKey.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filePath = path.join(tenantDir, `${safeKey}.json`);

    if (!fs.existsSync(filePath)) {
      throw new Error(`Tenant artifact ${artifactKey} not found for tenant ${tenantId}`);
    }

    const envelope = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const currentChecksum = crypto.createHash('sha256').update(envelope.payload).digest('hex');

    if (currentChecksum !== envelope.checksum_sha256) {
      throw new Error(`Integrity verification failed for tenant artifact ${artifactKey}`);
    }

    return {
      tenant_id: envelope.tenant_id,
      artifact_key: envelope.artifact_key,
      checksum_verified: true,
      data: envelope.payload
    };
  }
}

module.exports = MultiTenantStorageGovernor;
