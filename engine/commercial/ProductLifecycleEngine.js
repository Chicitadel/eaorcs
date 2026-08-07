/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Product Lifecycle
 * File           : ProductLifecycleEngine.js
 * Version        : 2026.3.1-LTS
 * Author         : Ujomor Systems & Enterprise Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-07
 * Last Modified  : 2026-08-07
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance: Security Reviewed | Architecture Controlled | Protocol Frozen
 * CORP: Recommendation J — Extended commercial lifecycle
 * Standards: ISO 27001 | SOC 2 | OWASP ASVS | NIST
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

const crypto = require('crypto');

class ProductLifecycleEngine {
    constructor() {
        this.lifecycles = new Map();
        
        // Defined phases in order
        this.phases = [
            'Qualification',
            'Readiness',
            'Authorization',
            'Publication',
            'Evidence Freeze',
            'Operational Monitoring',
            'Maintenance',
            'Retirement'
        ];
    }

    initializeLifecycle(releaseId, profileId) {
        const initialPhase = 'Evidence Freeze';
        const timestamp = new Date().toISOString();
        const evidenceHash = crypto.createHash('sha256').update(`${releaseId}-${profileId}`).digest('hex');
        
        const record = {
            releaseId,
            profileId,
            currentPhase: initialPhase,
            history: [{ phase: initialPhase, timestamp, evidenceHash }],
            events: [],
            isRetired: false
        };
        
        this.lifecycles.set(releaseId, record);
        return record;
    }

    canTransition(releaseId, toPhase) {
        const record = this.lifecycles.get(releaseId);
        if (!record) return { canTransition: false, reason: 'Lifecycle record not found' };
        
        if (record.isRetired) {
            return { canTransition: false, reason: 'Release is retired' };
        }
        
        const currentIndex = this.phases.indexOf(record.currentPhase);
        const toIndex = this.phases.indexOf(toPhase);
        
        if (toIndex <= currentIndex) {
            return { canTransition: false, reason: 'Cannot transition backwards or to same phase' };
        }
        
        if (toIndex - currentIndex !== 1 && toPhase !== 'Retirement') {
             // Optional: strict sequential transitions except maybe going straight to retirement
            return { canTransition: false, reason: 'Must transition sequentially' };
        }

        return { canTransition: true, reason: '' };
    }

    _transition(releaseId, toPhase, evidenceData) {
        const check = this.canTransition(releaseId, toPhase);
        if (!check.canTransition) {
            throw new Error(check.reason);
        }
        
        const record = this.lifecycles.get(releaseId);
        const timestamp = new Date().toISOString();
        const evidenceHash = crypto.createHash('sha256').update(JSON.stringify(evidenceData)).digest('hex');
        
        record.currentPhase = toPhase;
        record.history.push({ phase: toPhase, timestamp, evidenceHash });
        
        if (toPhase === 'Retirement') {
            record.isRetired = true;
        }
        
        return record;
    }

    transitionToOperationalMonitoring(releaseId, evidence = {}) {
        return this._transition(releaseId, 'Operational Monitoring', evidence);
    }

    recordOperationalEvent(releaseId, event) {
        const record = this.lifecycles.get(releaseId);
        if (!record) throw new Error('Lifecycle record not found');
        if (record.isRetired) throw new Error('Cannot record events on retired release');
        if (record.currentPhase !== 'Operational Monitoring' && record.currentPhase !== 'Maintenance') {
            throw new Error(`Events can only be recorded during Ops/Maintenance (current: ${record.currentPhase})`);
        }
        
        const eventId = `EVT-${Date.now()}`;
        const recordedAt = new Date().toISOString();
        record.events.push({ ...event, eventId, recordedAt });
        
        return { eventId, recordedAt };
    }

    transitionToMaintenance(releaseId, maintenancePlan = {}) {
        return this._transition(releaseId, 'Maintenance', maintenancePlan);
    }

    retireRelease(releaseId, retirementPlan = {}) {
        return this._transition(releaseId, 'Retirement', retirementPlan);
    }

    getLifecycleStatus(releaseId) {
        const record = this.lifecycles.get(releaseId);
        if (!record) return null;
        
        return {
            releaseId: record.releaseId,
            currentPhase: record.currentPhase,
            history: record.history,
            events: record.events,
            isRetired: record.isRetired
        };
    }

    generateLifecycleReport(releaseId) {
        const record = this.lifecycles.get(releaseId);
        if (!record) return null;
        return {
            reportGeneratedAt: new Date().toISOString(),
            ...record
        };
    }
}

module.exports = ProductLifecycleEngine;
