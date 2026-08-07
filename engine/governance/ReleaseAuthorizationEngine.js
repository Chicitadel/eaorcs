/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Release Authorization
 * File           : ReleaseAuthorizationEngine.js
 * Version        : 2026.3.1-LTS
 * Author         : Ujomor Systems & Enterprise Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-07
 * Last Modified  : 2026-08-07
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 * - Corporate Policy Governed
 *
 * CORP: Stream S6
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/
const crypto = require('crypto');

class ReleaseAuthorizationEngine {
    constructor() {
        this.releases = new Map();
        this.phases = [
            'Qualification',
            'Readiness',
            'Authorization',
            'Publication',
            'Evidence Freeze'
        ];
    }

    initializeRelease(releaseId, profileId) {
        if (this.releases.has(releaseId)) {
            throw new Error(`Release ${releaseId} already exists`);
        }
        const record = {
            releaseId,
            profileId,
            phase: 'Qualification',
            history: [{
                phase: 'Qualification',
                timestamp: Date.now(),
                evidenceHash: null
            }],
            isFrozen: false
        };
        this.releases.set(releaseId, record);
        return record;
    }

    advancePhase(releaseId, evidence) {
        const record = this.releases.get(releaseId);
        if (!record) {
            throw new Error(`Release ${releaseId} not found`);
        }
        if (record.isFrozen) {
            throw new Error(`Release ${releaseId} is already in Evidence Freeze`);
        }

        const currentIndex = this.phases.indexOf(record.phase);
        if (currentIndex === this.phases.length - 1) {
            throw new Error(`Cannot advance past ${this.phases[this.phases.length - 1]}`);
        }

        const nextPhase = this.phases[currentIndex + 1];
        
        const evidenceHash = crypto.createHash('sha256').update(JSON.stringify(evidence || {})).digest('hex');
        
        const fromPhase = record.phase;
        record.phase = nextPhase;
        record.history.push({
            phase: nextPhase,
            timestamp: Date.now(),
            evidenceHash
        });

        if (nextPhase === 'Evidence Freeze') {
            record.isFrozen = true;
        }

        return {
            releaseId,
            fromPhase,
            toPhase: nextPhase,
            advancedAt: Date.now()
        };
    }

    getPhaseStatus(releaseId) {
        const record = this.releases.get(releaseId);
        if (!record) {
            throw new Error(`Release ${releaseId} not found`);
        }
        return {
            phase: record.phase,
            history: record.history
        };
    }

    canAdvance(releaseId) {
        const record = this.releases.get(releaseId);
        if (!record) {
            return { canAdvance: false, reason: 'Release not found' };
        }
        if (record.isFrozen) {
            return { canAdvance: false, reason: 'Already in Evidence Freeze' };
        }
        return { canAdvance: true, reason: 'Can advance to next phase' };
    }

    freezeEvidence(releaseId) {
        const record = this.releases.get(releaseId);
        if (!record) {
            throw new Error(`Release ${releaseId} not found`);
        }
        if (record.phase !== 'Publication') {
            throw new Error(`Cannot freeze evidence from phase ${record.phase}`);
        }
        
        return this.advancePhase(releaseId, { freezeReason: 'Manual Freeze' });
    }

    getReleaseRecord(releaseId) {
        const record = this.releases.get(releaseId);
        if (!record) {
            throw new Error(`Release ${releaseId} not found`);
        }
        return record;
    }

    recordIndependentVerificationResult(releaseId, report) {
        const rec = this.releases.get(releaseId);
        if (!rec) throw new Error(`Release ${releaseId} not found`);
        const evidenceHash = require('crypto').createHash('sha256').update(JSON.stringify(report)).digest('hex');
        rec.independentVerification = {
            passed: report.overallPassed === true,
            reportId: report.reportId || evidenceHash.slice(0, 16),
            recordedAt: new Date().toISOString(),
            evidenceHash
        };
        return rec.independentVerification;
    }

    requiresIndependentVerification(profileId = 'Enterprise') {
        const restricted = ['Enterprise', 'Government', 'Sovereign', 'PROFILE-ENTERPRISE', 'PROFILE-GOVERNMENT', 'PROFILE-SOVEREIGN'];
        return restricted.includes(profileId);
    }
}

module.exports = ReleaseAuthorizationEngine;
