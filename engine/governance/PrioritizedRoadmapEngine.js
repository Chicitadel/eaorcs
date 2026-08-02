/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Governance Platform — Stream 3: Prioritized Roadmap Engine
 * File           : PrioritizedRoadmapEngine.js
 * Version        : 2026.1-LTS (v1.0.0-FROZEN)
 * Author         : Architectural Governance Council & Ujomor Systems Engineering
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-02
 * Last Modified  : 2026-08-02
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
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
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

/**
 * PrioritizedRoadmapEngine
 * Categorizes remediation tasks and technical debt into 4 prioritized execution buckets:
 * 1. Immediate (Today)
 * 2. Next Sprint
 * 3. Backlog
 * 4. Future
 */
class PrioritizedRoadmapEngine {
    /**
     * @param {Object} [options] Configuration options
     * @param {number} [options.teamCapacityHoursPerSprint=160] Standard engineering capacity per sprint in hours
     * @param {number} [options.engineeringHourlyRateEUR=115] Standard engineering hourly rate EUR
     * @param {number} [options.engineeringHourlyRateUSD=125] Standard engineering hourly rate USD
     */
    constructor(options = {}) {
        this.options = {
            teamCapacityHoursPerSprint: options.teamCapacityHoursPerSprint || 160,
            engineeringHourlyRateEUR: options.engineeringHourlyRateEUR || 115,
            engineeringHourlyRateUSD: options.engineeringHourlyRateUSD || 125,
            ...options
        };

        this.BUCKET_NAMES = {
            IMMEDIATE: 'Immediate (Today)',
            NEXT_SPRINT: 'Next Sprint',
            BACKLOG: 'Backlog',
            FUTURE: 'Future'
        };
    }

    /**
     * Categorizes findings/remediation tasks into prioritized execution buckets.
     * @param {Array<Object>} input List of findings or remediations
     * @param {Object} [options] Calculation options
     * @returns {Object} Structured prioritized roadmap report
     */
    generateRoadmap(input = [], options = {}) {
        const config = { ...this.options, ...options };
        const items = this._normalizeInputList(input);

        const buckets = {
            [this.BUCKET_NAMES.IMMEDIATE]: { name: this.BUCKET_NAMES.IMMEDIATE, code: 'IMMEDIATE', targetTimeline: 'Today / Emergency Hotfix', items: [], totalEffortHours: 0, totalCostEUR: 0, totalCostUSD: 0, riskReductionPoints: 0 },
            [this.BUCKET_NAMES.NEXT_SPRINT]: { name: this.BUCKET_NAMES.NEXT_SPRINT, code: 'NEXT_SPRINT', targetTimeline: 'Sprint 1 (Next 2 Weeks)', items: [], totalEffortHours: 0, totalCostEUR: 0, totalCostUSD: 0, riskReductionPoints: 0 },
            [this.BUCKET_NAMES.BACKLOG]: { name: this.BUCKET_NAMES.BACKLOG, code: 'BACKLOG', targetTimeline: 'Sprints 2 - 4 (Medium Term)', items: [], totalEffortHours: 0, totalCostEUR: 0, totalCostUSD: 0, riskReductionPoints: 0 },
            [this.BUCKET_NAMES.FUTURE]: { name: this.BUCKET_NAMES.FUTURE, code: 'FUTURE', targetTimeline: 'Future Quarters (Long Term / Vision)', items: [], totalEffortHours: 0, totalCostEUR: 0, totalCostUSD: 0, riskReductionPoints: 0 }
        };

        let totalTasks = 0;
        let grandTotalHours = 0;

        for (const item of items) {
            totalTasks++;
            const priority = this._determinePriorityBucket(item);
            const effortHours = item.effortHours || item.remediationHours || this._estimateEffortHours(item.severity);
            const riskPoints = this._calculateRiskReductionPoints(item.severity, item.domain);
            const costEUR = Math.round(effortHours * config.engineeringHourlyRateEUR);
            const costUSD = Math.round(effortHours * config.engineeringHourlyRateUSD);

            const roadmapItem = {
                id: item.id || `REM-${Math.floor(Math.random() * 8999 + 1000)}`,
                title: item.title || item.name || 'Remediation Task',
                domain: item.domain || 'Code',
                severity: (item.severity || 'MEDIUM').toUpperCase(),
                bucket: priority,
                effortHours,
                costEUR,
                costUSD,
                riskReductionPoints: riskPoints,
                recommendedOwnerRole: this._suggestOwnerRole(item.domain),
                actionSteps: item.actionSteps || [`Resolve ${item.domain} governance finding.`]
            };

            const bucketObj = buckets[priority];
            bucketObj.items.push(roadmapItem);
            bucketObj.totalEffortHours += effortHours;
            bucketObj.totalCostEUR += costEUR;
            bucketObj.totalCostUSD += costUSD;
            bucketObj.riskReductionPoints += riskPoints;

            grandTotalHours += effortHours;
        }

        // Round effort hours and format costs
        for (const bKey of Object.keys(buckets)) {
            const b = buckets[bKey];
            b.totalEffortHours = Number(b.totalEffortHours.toFixed(1));
            b.formattedCostEUR = `€${b.totalCostEUR.toLocaleString()}`;
            b.formattedCostUSD = `$${b.totalCostUSD.toLocaleString()}`;
            b.itemCount = b.items.length;
        }

        const totalSprintsNeeded = Number((grandTotalHours / config.teamCapacityHoursPerSprint).toFixed(1));

        return {
            totalRemediationTasks: totalTasks,
            totalEffortHours: Number(grandTotalHours.toFixed(1)),
            teamCapacityHoursPerSprint: config.teamCapacityHoursPerSprint,
            estimatedSprintsToComplete: totalSprintsNeeded,
            buckets,
            capacityPlanning: {
                immediateCapacityHours: buckets[this.BUCKET_NAMES.IMMEDIATE].totalEffortHours,
                nextSprintCapacityHours: buckets[this.BUCKET_NAMES.NEXT_SPRINT].totalEffortHours,
                backlogCapacityHours: buckets[this.BUCKET_NAMES.BACKLOG].totalEffortHours,
                futureCapacityHours: buckets[this.BUCKET_NAMES.FUTURE].totalEffortHours,
                isNextSprintOverCapacity: buckets[this.BUCKET_NAMES.NEXT_SPRINT].totalEffortHours > config.teamCapacityHoursPerSprint
            },
            executiveSummary: this._buildExecutiveSummary(buckets, grandTotalHours, totalSprintsNeeded)
        };
    }

    // --- Private Helper Methods ---

    _normalizeInputList(input) {
        if (Array.isArray(input)) return input;
        if (input && Array.isArray(input.findings)) return input.findings;
        if (input && Array.isArray(input.evaluatedFindings)) return input.evaluatedFindings;
        if (input && typeof input === 'object') return [input];
        return [];
    }

    _determinePriorityBucket(item) {
        const severity = (item.severity || item.level || 'MEDIUM').toUpperCase();
        const domain = (item.domain || item.category || 'Code').toUpperCase();
        const blastRadius = (item.blastRadius || 'LOCAL').toUpperCase();
        const riskScore = item.riskScore || item.financialRiskEUR || 0;

        // Immediate (Today): Critical findings, active zero-day, emergency zero-trust/auth breaches
        if (severity === 'CRITICAL' || blastRadius === 'GLOBAL' || riskScore >= 150000) {
            return this.BUCKET_NAMES.IMMEDIATE;
        }

        // Next Sprint: High severity or critical security/architectural items
        if (severity === 'HIGH' || domain === 'SECURITY' || domain === 'INFRASTRUCTURE' || riskScore >= 45000) {
            return this.BUCKET_NAMES.NEXT_SPRINT;
        }

        // Backlog: Medium severity items, testing gaps, standard code debt
        if (severity === 'MEDIUM' || domain === 'TESTING' || domain === 'CODE') {
            return this.BUCKET_NAMES.BACKLOG;
        }

        // Future: Low severity, documentation, or structural enhancements
        return this.BUCKET_NAMES.FUTURE;
    }

    _estimateEffortHours(severity) {
        const sev = (severity || 'MEDIUM').toUpperCase();
        switch (sev) {
            case 'CRITICAL': return 32;
            case 'HIGH': return 16;
            case 'MEDIUM': return 8;
            case 'LOW': return 3;
            case 'INFORMATIONAL': return 1;
            default: return 6;
        }
    }

    _calculateRiskReductionPoints(severity, domain) {
        const sev = (severity || 'MEDIUM').toUpperCase();
        const dom = (domain || 'Code').toUpperCase();

        const basePoints = {
            CRITICAL: 100,
            HIGH: 50,
            MEDIUM: 20,
            LOW: 5,
            INFORMATIONAL: 1
        }[sev] || 20;

        const domainMult = {
            SECURITY: 1.5,
            INFRASTRUCTURE: 1.3,
            ARCHITECTURE: 1.2,
            TESTING: 1.1,
            CODE: 1.0,
            DOCUMENTATION: 0.8
        }[dom] || 1.0;

        return Math.round(basePoints * domainMult);
    }

    _suggestOwnerRole(domainStr) {
        const dom = String(domainStr).toUpperCase();
        if (dom.includes('SEC')) return 'Lead Security Engineer';
        if (dom.includes('INFRA') || dom.includes('OPS')) return 'DevOps / Site Reliability Engineer';
        if (dom.includes('ARCH')) return 'Principal Systems Architect';
        if (dom.includes('TEST') || dom.includes('QA')) return 'Quality Assurance Architect';
        if (dom.includes('DOC')) return 'Technical Writer / Governance Officer';
        return 'Senior Software Engineer';
    }

    _buildExecutiveSummary(buckets, grandTotalHours, totalSprints) {
        const immediateCount = buckets[this.BUCKET_NAMES.IMMEDIATE].items.length;
        const nextSprintCount = buckets[this.BUCKET_NAMES.NEXT_SPRINT].items.length;

        let focusNotice = 'Standard engineering velocity maintenance.';
        if (immediateCount > 0) {
            focusNotice = `CRITICAL: ${immediateCount} emergency remediation item(s) must be executed TODAY.`;
        } else if (nextSprintCount > 0) {
            focusNotice = `High-priority focus: ${nextSprintCount} task(s) queued for Next Sprint.`;
        }

        return {
            immediateActionRequired: immediateCount > 0,
            immediateCount,
            nextSprintCount,
            totalSprintsRequired: totalSprints,
            recommendationMessage: `${focusNotice} Complete roadmap effort requires ${grandTotalHours} hours across ~${totalSprints} sprint(s).`
        };
    }
}

module.exports = PrioritizedRoadmapEngine;
