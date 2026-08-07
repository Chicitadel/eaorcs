/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS ADR Registry
 * File           : ADRRegistryEngine.js
 * Version        : 2026.3.1-LTS
 * Author         : Ujomor Systems & Enterprise Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-07
 * Last Modified  : 2026-08-07
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance: Security Reviewed | Architecture Controlled | Protocol Frozen
 * CORP: Recommendation C — Formal ADR schema
 * Standards: ISO 27001 | SOC 2 | OWASP ASVS | NIST
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

class ADRRegistryEngine {
    constructor() {
        this.adrs = new Map();
        
        // Pre-seed DEC-01 through DEC-11
        for (let i = 1; i <= 11; i++) {
            const decNum = i.toString().padStart(2, '0');
            this.adrs.set(`DEC-${decNum}`, {
                adrId: `DEC-${decNum}`,
                status: 'Accepted',
                context: `Context for DEC-${decNum} involving architectural design.`,
                decision: `Decision details for DEC-${decNum}, typically filesystem or logic choices.`,
                alternatives: 'Alternative approaches considered and discarded.',
                consequences: 'System behavior impact and trade-offs.',
                supersededBy: null,
                evidence: `Hash or link for DEC-${decNum} evidence`,
                owner: 'Ujomor Governance',
                effectiveDate: '2026-08-01',
                history: [{ status: 'Accepted', timestamp: new Date().toISOString(), supersededBy: null }]
            });
        }
    }

    validateADRSchema(record) {
        const requiredFields = ['status', 'context', 'decision', 'alternatives', 'consequences', 'supersededBy', 'evidence', 'owner', 'effectiveDate'];
        const missing = [];
        for (const field of requiredFields) {
            if (record[field] === undefined) {
                missing.push(field);
            }
        }
        return {
            valid: missing.length === 0,
            missing
        };
    }

    registerADR(adrId, record) {
        const validation = this.validateADRSchema(record);
        if (!validation.valid) {
            return {
                adrId,
                registeredAt: null,
                valid: false,
                errors: validation.missing
            };
        }
        
        const newRecord = { ...record, adrId, history: [{ status: record.status, timestamp: new Date().toISOString(), supersededBy: record.supersededBy }] };
        this.adrs.set(adrId, newRecord);
        
        return {
            adrId,
            registeredAt: new Date().toISOString(),
            valid: true,
            errors: []
        };
    }

    updateADRStatus(adrId, newStatus, supersededBy = null) {
        const adr = this.adrs.get(adrId);
        if (!adr) throw new Error(`ADR not found: ${adrId}`);
        
        const validTransitions = {
            'Proposed': ['Accepted', 'Rejected'],
            'Accepted': ['Deprecated', 'Superseded', 'Rejected'],
            'Deprecated': ['Rejected'],
            'Superseded': ['Rejected'],
            'Rejected': []
        };
        
        const fromStatus = adr.status;
        if (!validTransitions[fromStatus] || !validTransitions[fromStatus].includes(newStatus)) {
             throw new Error(`Invalid transition from ${fromStatus} to ${newStatus}`);
        }
        
        if (newStatus === 'Superseded' && !supersededBy) {
            throw new Error(`SupersededBy required when transitioning to Superseded`);
        }
        
        adr.status = newStatus;
        adr.supersededBy = supersededBy;
        
        const timestamp = new Date().toISOString();
        adr.history.push({ status: newStatus, timestamp, supersededBy });
        
        return {
            adrId,
            fromStatus,
            toStatus: newStatus,
            updatedAt: timestamp,
            allowed: true
        };
    }

    listADRs(filter = {}) {
        let results = Array.from(this.adrs.values());
        if (filter.status) {
            results = results.filter(a => a.status === filter.status);
        }
        if (filter.owner) {
            results = results.filter(a => a.owner === filter.owner);
        }
        return results;
    }

    getADR(adrId) {
        return this.adrs.get(adrId);
    }

    getADRHistory(adrId) {
        const adr = this.adrs.get(adrId);
        if (!adr) throw new Error(`ADR not found: ${adrId}`);
        return {
            adrId,
            history: adr.history
        };
    }

    exportADRRegistry(format = 'json') {
        const adrs = Array.from(this.adrs.values());
        if (format === 'json') {
            return JSON.stringify(adrs, null, 2);
        } else if (format === 'markdown') {
            let md = '# ADR Registry\n\n';
            for (const adr of adrs) {
                md += `## ${adr.adrId}: ${adr.status}\n`;
                md += `**Context:** ${adr.context}\n`;
                md += `**Decision:** ${adr.decision}\n\n`;
            }
            return md;
        }
        throw new Error('Unsupported format');
    }

    searchADRs(query) {
        const lowerQuery = query.toLowerCase();
        const results = [];
        for (const adr of this.adrs.values()) {
            if (adr.decision.toLowerCase().includes(lowerQuery) || 
                adr.context.toLowerCase().includes(lowerQuery) || 
                adr.consequences.toLowerCase().includes(lowerQuery)) {
                results.push(adr);
            }
        }
        return results;
    }
}

module.exports = ADRRegistryEngine;
