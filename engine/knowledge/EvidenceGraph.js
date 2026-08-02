/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Requirement Knowledge Graph Engine (Stream B)
 * File           : EvidenceGraph.js
 * Version        : 2026.1-LTS (v1.0.0-FROZEN)
 * Author         : Ujomor Systems & Enterprise Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 * - Corporate Policy Governed
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

class EvidenceGraph {
    constructor() {
        this.evidence = new Map(); // evidenceId -> { evidenceId, passportId, hash, timestamp }
        this.evidenceToReq = new Map(); // evidenceId -> Set(reqId)
        this.reqToEvidence = new Map(); // reqId -> Set(evidenceId)
    }

    /**
     * Registers an evidence item/passport in the graph.
     * @param {string} evidenceId Unique evidence ID.
     * @param {string} passportId Associated OSAP Passport ID.
     * @param {string} hash SHA-256 evidence hash.
     */
    addEvidence(evidenceId, passportId, hash) {
        if (!evidenceId) {
            throw new Error('evidenceId is required to addEvidence');
        }

        const evidenceObj = {
            evidenceId,
            passportId: passportId || 'PASSPORT-DEFAULT',
            hash: hash || '0000000000000000000000000000000000000000000000000000000000000000',
            timestamp: new Date().toISOString()
        };

        this.evidence.set(evidenceId, evidenceObj);

        if (!this.evidenceToReq.has(evidenceId)) {
            this.evidenceToReq.set(evidenceId, new Set());
        }

        return evidenceObj;
    }

    /**
     * Connects an evidence item to a requirement ID.
     * @param {string} evidenceId Evidence ID.
     * @param {string} reqId Requirement ID.
     */
    connectEvidenceToReq(evidenceId, reqId) {
        if (!evidenceId || !reqId) {
            throw new Error('evidenceId and reqId are required for connectEvidenceToReq');
        }

        if (!this.evidence.has(evidenceId)) {
            this.addEvidence(evidenceId);
        }

        if (!this.evidenceToReq.has(evidenceId)) {
            this.evidenceToReq.set(evidenceId, new Set());
        }
        this.evidenceToReq.get(evidenceId).add(reqId);

        if (!this.reqToEvidence.has(reqId)) {
            this.reqToEvidence.set(reqId, new Set());
        }
        this.reqToEvidence.get(reqId).add(evidenceId);

        return { evidenceId, reqId };
    }

    /**
     * Gets all evidence objects linked to a specific requirement ID.
     * @param {string} reqId Requirement ID.
     * @returns {Array<object>} Array of evidence objects linked to reqId.
     */
    getEvidenceForReq(reqId) {
        if (!reqId || !this.reqToEvidence.has(reqId)) return [];

        const evIds = this.reqToEvidence.get(reqId);
        const result = [];

        for (const evId of evIds) {
            const evObj = this.evidence.get(evId);
            if (evObj) {
                result.push(evObj);
            }
        }

        return result;
    }

    /**
     * Retrieves an evidence object by ID.
     * @param {string} evidenceId Evidence ID.
     * @returns {object|null} Evidence object or null.
     */
    getEvidence(evidenceId) {
        return this.evidence.get(evidenceId) || null;
    }

    /**
     * Exports complete evidence graph representation.
     * @returns {{ evidence: Array<object>, links: Array<{ evidenceId: string, reqId: string }> }}
     */
    exportGraph() {
        const links = [];

        for (const [evidenceId, reqSet] of this.evidenceToReq.entries()) {
            for (const reqId of reqSet) {
                links.push({
                    evidenceId,
                    reqId
                });
            }
        }

        return {
            evidence: Array.from(this.evidence.values()),
            links
        };
    }
}

module.exports = EvidenceGraph;
