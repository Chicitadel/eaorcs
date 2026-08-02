/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Air Roofers Product Lifecycle Orchestration
 * File           : LifecycleAuditTrail.js
 * Version        : 2026.1-LTS (v1.0.0-FROZEN)
 * Author         : Air Roofers Architecture Authority / Ujomor Systems
 * Organization   : Air Roofers SASU / Chicitadel Platform Engineering
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Air Roofers Integration Guide Compliant
 * - ISO 27001 Audit Trail Standards (Cryptography & Immutability)
 * - Architecture Frozen (ADR-001)
 * - OSAP Passport Evidence Enabled
 ******************************************************************************/

const crypto = require('crypto');

class LifecycleAuditTrail {
    constructor() {
        this.records = [];
        this.GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';
    }

    record(stageId, tenantId, status, detail = {}, actor = 'Air Roofers Architecture Authority', action = 'EXECUTE_STAGE') {
        const previousHash = this.records.length > 0
            ? this.records[this.records.length - 1].hash
            : this.GENESIS_HASH;

        const entry = {
            index: this.records.length,
            timestamp: new Date().toISOString(),
            stageId,
            tenantId,
            actor,
            action,
            status,
            detail,
            previousHash,
            hash: ''
        };

        entry.hash = this._computeHash(entry);
        this.records.push(Object.freeze(entry));
        return entry;
    }

    _computeHash(entry) {
        const payload = `${entry.index}|${entry.timestamp}|${entry.stageId}|${entry.tenantId}|${entry.actor}|${entry.action}|${entry.status}|${JSON.stringify(entry.detail)}|${entry.previousHash}`;
        return crypto.createHash('sha256').update(payload).digest('hex');
    }

    getTrail(tenantId) {
        if (!tenantId) {
            return [...this.records];
        }
        return this.records.filter(r => r.tenantId === tenantId);
    }

    exportJson(tenantId) {
        const trail = this.getTrail(tenantId);
        const exportMetadata = {
            exportedAt: new Date().toISOString(),
            tenantId: tenantId || 'ALL',
            recordCount: trail.length,
            complianceStandard: 'ISO 27001 / UAIGOS-2026.1-LTS',
            integrityVerified: this.verifyIntegrity().valid,
            trail
        };
        return JSON.stringify(exportMetadata, null, 2);
    }

    verifyIntegrity() {
        let expectedPrevHash = this.GENESIS_HASH;

        for (let i = 0; i < this.records.length; i++) {
            const record = this.records[i];

            if (record.previousHash !== expectedPrevHash) {
                return {
                    valid: false,
                    brokenIndex: i,
                    error: `Previous hash mismatch at index ${i}. Expected ${expectedPrevHash}, got ${record.previousHash}`
                };
            }

            const computedHash = this._computeHash(record);
            if (record.hash !== computedHash) {
                return {
                    valid: false,
                    brokenIndex: i,
                    error: `Tampered hash at index ${i}. Record hash is ${record.hash}, recomputed is ${computedHash}`
                };
            }

            expectedPrevHash = record.hash;
        }

        return {
            valid: true,
            count: this.records.length,
            genesisHash: this.GENESIS_HASH,
            latestHash: expectedPrevHash
        };
    }
}

module.exports = LifecycleAuditTrail;
