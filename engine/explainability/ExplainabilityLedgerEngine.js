/******************************************************************************
 * Project        : EAORCS STK
 * Module         : Explainability Ledger Engine (Stream 5)
 * File           : engine/explainability/ExplainabilityLedgerEngine.js
 * Version        : 1.0.0
 * Author         : Enterprise Architecture & Operational Resilience Governance
 * Organization   : Ujomor Platform
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
 * Copyright (c) 2026 Ujomor Platform
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const crypto = require('crypto');

/**
 * ExplainabilityLedgerEngine
 * 
 * Unified Explainability & Reasoning Ledger generator answering:
 * 1. Why?
 * 2. Based on what evidence?
 * 3. Which policies?
 * 4. Which regulations?
 * 5. Which ADRs?
 * 6. What alternatives?
 * 7. Confidence level
 * 8. Consequences if ignored
 */
class ExplainabilityLedgerEngine {
    /**
     * @param {Object} config 
     * @param {string} [config.systemId='EAORCS-EXPLAINABILITY-LEDGER']
     * @param {boolean} [config.enforceStrictValidation=true]
     */
    constructor(config = {}) {
        this.systemId = config.systemId || 'EAORCS-EXPLAINABILITY-LEDGER';
        this.enforceStrictValidation = config.enforceStrictValidation !== false;

        // In-memory ledger storage (recordId -> record)
        this.ledgerMap = new Map();
        // Sequential index of record IDs for lineage tracking
        this.ledgerChain = [];
    }

    /**
     * Calculate SHA-256 fingerprint for tamper-proof ledger integrity
     * @param {Object} payload 
     * @param {string} [previousHash='GENESIS_HASH']
     * @returns {string} SHA-256 hash string
     */
    calculateRecordHash(payload, previousHash = 'GENESIS_HASH') {
        const canonicalString = JSON.stringify({
            previousHash,
            why: payload.why,
            evidence: payload.evidence,
            policies: payload.policies,
            regulations: payload.regulations,
            adrs: payload.adrs,
            alternatives: payload.alternatives,
            confidence: payload.confidence,
            consequencesIfIgnored: payload.consequencesIfIgnored,
            timestamp: payload.timestamp
        });
        return crypto.createHash('sha256').update(canonicalString).digest('hex');
    }

    /**
     * Generate a Unified Explanation Record answering all 8 key questions
     * 
     * @param {Object} input
     * @param {string} input.targetId - ID of action, recommendation, or decision being explained
     * @param {string} input.why - Primary reasoning and motive
     * @param {Array<string|Object>} input.evidence - Concrete evidence, metrics, code references
     * @param {Array<string>} input.policies - Governed policies applied (e.g. ['POL-SEC-001'])
     * @param {Array<string>} input.regulations - Statutory/compliance standards (e.g. ['ISO 27001', 'SOC 2'])
     * @param {Array<string>} input.adrs - Architectural Decision Records referenced (e.g. ['ADR-004'])
     * @param {Array<Object>} input.alternatives - Considered alternative paths & rejection reasons
     * @param {number|Object} input.confidence - Confidence level (0.0 - 1.0 or { score, rationale })
     * @param {string|Object} input.consequencesIfIgnored - Risk exposure & potential SLA/security impact
     * @param {string} [input.actor] - Human author or governance role
     * @returns {Object} Immutably hashed Explanation Record
     */
    recordExplanation(input) {
        if (!input || typeof input !== 'object') {
            throw new Error('ExplainabilityLedgerEngine: input must be a valid object');
        }

        const why = input.why || 'No rationale specified';
        const evidence = Array.isArray(input.evidence) ? input.evidence : (input.evidence ? [input.evidence] : []);
        const policies = Array.isArray(input.policies) ? input.policies : (input.policies ? [input.policies] : []);
        const regulations = Array.isArray(input.regulations) ? input.regulations : (input.regulations ? [input.regulations] : []);
        const adrs = Array.isArray(input.adrs) ? input.adrs : (input.adrs ? [input.adrs] : []);
        const alternatives = Array.isArray(input.alternatives) ? input.alternatives : (input.alternatives ? [input.alternatives] : []);
        
        let confidenceScore = 0.95;
        let confidenceRationale = 'High confidence based on verified architecture rules and automated policy evaluation.';
        
        if (typeof input.confidence === 'number') {
            confidenceScore = Math.max(0, Math.min(1, input.confidence));
        } else if (input.confidence && typeof input.confidence === 'object') {
            confidenceScore = Math.max(0, Math.min(1, Number(input.confidence.score) || 0.95));
            confidenceRationale = input.confidence.rationale || confidenceRationale;
        }

        const consequencesIfIgnored = typeof input.consequencesIfIgnored === 'string'
            ? { description: input.consequencesIfIgnored, severity: 'HIGH' }
            : (input.consequencesIfIgnored || { description: 'Non-compliance with governance standards and architecture drift.', severity: 'HIGH' });

        if (this.enforceStrictValidation) {
            if (!input.why) {
                throw new Error('ExplainabilityLedgerEngine Validation Error: "why" rationale is required.');
            }
            if (evidence.length === 0) {
                throw new Error('ExplainabilityLedgerEngine Validation Error: "evidence" is required.');
            }
        }

        const timestamp = new Date().toISOString();
        const recordId = `exp_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
        const previousHash = this.ledgerChain.length > 0 
            ? this.ledgerMap.get(this.ledgerChain[this.ledgerChain.length - 1]).recordHash 
            : 'GENESIS_HASH';

        const recordPayload = {
            recordId,
            targetId: input.targetId || 'DECISION_GLOBAL',
            actor: input.actor || 'Governance Authority',
            timestamp,
            // The 8 Core Explainability Dimensions:
            why,
            evidence,
            policies,
            regulations,
            adrs,
            alternatives,
            confidence: {
                score: confidenceScore,
                percent: `${(confidenceScore * 100).toFixed(1)}%`,
                classification: confidenceScore >= 0.85 ? 'HIGH_CONFIDENCE' : (confidenceScore >= 0.6 ? 'MEDIUM_CONFIDENCE' : 'LOW_CONFIDENCE'),
                rationale: confidenceRationale
            },
            consequencesIfIgnored
        };

        const recordHash = this.calculateRecordHash(recordPayload, previousHash);
        const record = {
            ...recordPayload,
            previousHash,
            recordHash
        };

        this.ledgerMap.set(recordId, record);
        this.ledgerChain.push(recordId);

        return record;
    }

    /**
     * Retrieve an explanation record by ID
     * @param {string} recordId 
     * @returns {Object|null}
     */
    getExplanation(recordId) {
        return this.ledgerMap.get(recordId) || null;
    }

    /**
     * Query explanation records matching specific criteria
     * @param {Object} filter
     * @param {string} [filter.targetId]
     * @param {string} [filter.policyId]
     * @param {string} [filter.regulation]
     * @param {string} [filter.adrId]
     * @param {number} [filter.minConfidence]
     * @returns {Array<Object>} Matching explanation records
     */
    queryLedger(filter = {}) {
        const results = [];
        for (const recordId of this.ledgerChain) {
            const record = this.ledgerMap.get(recordId);
            if (!record) continue;

            if (filter.targetId && record.targetId !== filter.targetId) continue;
            if (filter.policyId && !record.policies.includes(filter.policyId)) continue;
            if (filter.regulation && !record.regulations.some(r => r.toLowerCase().includes(filter.regulation.toLowerCase()))) continue;
            if (filter.adrId && !record.adrs.includes(filter.adrId)) continue;
            if (filter.minConfidence && record.confidence.score < filter.minConfidence) continue;

            results.push(record);
        }
        return results;
    }

    /**
     * Verify cryptographic chain integrity of the ledger
     * @returns {Object} Integrity audit results
     */
    verifyLedgerIntegrity() {
        let valid = true;
        const auditLog = [];

        for (let i = 0; i < this.ledgerChain.length; i++) {
            const recordId = this.ledgerChain[i];
            const record = this.ledgerMap.get(recordId);
            const expectedPrevHash = i === 0 
                ? 'GENESIS_HASH' 
                : this.ledgerMap.get(this.ledgerChain[i - 1]).recordHash;

            if (record.previousHash !== expectedPrevHash) {
                valid = false;
                auditLog.push({ index: i, recordId, error: 'Previous hash mismatch (chain broken)' });
            }

            const computedHash = this.calculateRecordHash(record, record.previousHash);
            if (computedHash !== record.recordHash) {
                valid = false;
                auditLog.push({ index: i, recordId, error: 'Record content hash mismatch (tampered data)' });
            }
        }

        return {
            valid,
            totalRecordsEvaluated: this.ledgerChain.length,
            errors: auditLog,
            auditedAt: new Date().toISOString()
        };
    }

    /**
     * Generate a human and machine readable summary report for a given record
     * @param {string} recordId 
     * @returns {string} Formatted explanation string
     */
    generateExplanationReport(recordId) {
        const r = this.getExplanation(recordId);
        if (!r) return `Explanation record [${recordId}] not found.`;

        return `================================================================================
UNIFIED EXPLAINABILITY & REASONING LEDGER RECORD
Record ID    : ${r.recordId}
Target ID    : ${r.targetId}
Timestamp    : ${r.timestamp}
Actor        : ${r.actor}
Record Hash  : ${r.recordHash}
--------------------------------------------------------------------------------
1. WHY? (Rationale)
   ${r.why}

2. BASED ON WHAT EVIDENCE?
${r.evidence.map(e => `   - ${typeof e === 'string' ? e : JSON.stringify(e)}`).join('\n')}

3. WHICH POLICIES?
${r.policies.map(p => `   - ${p}`).join('\n') || '   - None'}

4. WHICH REGULATIONS?
${r.regulations.map(reg => `   - ${reg}`).join('\n') || '   - None'}

5. WHICH ADRs?
${r.adrs.map(a => `   - ${a}`).join('\n') || '   - None'}

6. WHAT ALTERNATIVES CONSIDERED?
${r.alternatives.map(alt => `   - Alternative: ${alt.name || alt.title || 'Option'}\n     Reason Rejected: ${alt.rejectionReason || alt.reason || 'N/A'}`).join('\n') || '   - No alternatives evaluated'}

7. CONFIDENCE LEVEL
   Score: ${r.confidence.percent} (${r.confidence.classification})
   Rationale: ${r.confidence.rationale}

8. CONSEQUENCES IF IGNORED
   Severity: ${r.consequencesIfIgnored.severity || 'HIGH'}
   Impact: ${r.consequencesIfIgnored.description}
================================================================================`;
    }

    /**
     * Export full ledger state
     */
    exportLedger() {
        const records = this.ledgerChain.map(id => this.ledgerMap.get(id));
        return {
            systemId: this.systemId,
            totalCount: records.length,
            records
        };
    }

    /**
     * Import ledger state
     * @param {Object} importedData 
     */
    importLedger(importedData) {
        if (!importedData || !Array.isArray(importedData.records)) return;
        this.ledgerMap.clear();
        this.ledgerChain = [];
        for (const record of importedData.records) {
            if (record && record.recordId) {
                this.ledgerMap.set(record.recordId, record);
                this.ledgerChain.push(record.recordId);
            }
        }
    }
}

module.exports = ExplainabilityLedgerEngine;
