/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Stream KPI
 * File           : StreamKPIEngine.js
 * Version        : 2026.3.1-LTS
 * Author         : Ujomor Systems & Enterprise Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-07
 * Last Modified  : 2026-08-07
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance: Security Reviewed | Architecture Controlled | Protocol Frozen
 * CORP: Recommendation B — Quantitative KPIs
 * Standards: ISO 27001 | SOC 2 | OWASP ASVS | NIST
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

class StreamKPIEngine {
    constructor() {
        this.kpis = new Map();
        this.results = [];
        
        const initialKPIs = [
            { streamId: 'S3', kpiId: 'COLD_SCAN', name: 'Cold workspace scan', unit: 'ms', sloThreshold: 2000 },
            { streamId: 'S3', kpiId: 'WARM_SCAN', name: 'Warm (cached) scan', unit: 'ms', sloThreshold: 200 },
            { streamId: 'S10', kpiId: 'CLI_STARTUP', name: 'CLI startup time', unit: 'ms', sloThreshold: 500 },
            { streamId: 'S10', kpiId: 'CLI_MEMORY', name: 'CLI memory usage', unit: 'MB', sloThreshold: 150 },
            { streamId: 'S11', kpiId: 'DASH_LOAD', name: 'Dashboard load', unit: 'ms', sloThreshold: 2000 },
            { streamId: 'S7', kpiId: 'EVIDENCE_GEN', name: 'Evidence package generation', unit: 'ms', sloThreshold: 30000 },
            { streamId: 'S4', kpiId: 'FULL_DAG', name: 'Full qualification DAG', unit: 'ms', sloThreshold: 60000 }
        ];

        initialKPIs.forEach(kpi => this.registerStreamKPI(kpi.streamId, kpi));
    }

    registerStreamKPI(streamId, kpi) {
        const key = `${streamId}::${kpi.kpiId}`;
        this.kpis.set(key, { ...kpi, streamId });
    }

    measureKPI(streamId, kpiId, measurementFn) {
        const kpi = this.getKPI(streamId, kpiId);
        if (!kpi) throw new Error(`KPI not found: ${streamId}::${kpiId}`);
        
        const actualValue = measurementFn();
        const result = {
            streamId,
            kpiId,
            actualValue,
            sloThreshold: kpi.sloThreshold,
            sloPassed: actualValue <= kpi.sloThreshold,
            measuredAt: new Date().toISOString()
        };
        
        this.results.push(result);
        return result;
    }

    checkAllSLOs() {
        const passing = [];
        const failing = [];
        
        for (const res of this.results) {
            if (res.sloPassed) passing.push(res.kpiId);
            else failing.push(res.kpiId);
        }
        
        return {
            passing,
            failing,
            overallPassed: failing.length === 0 && this.results.length > 0
        };
    }

    generateKPIReport() {
        const allRegistrations = Array.from(this.kpis.values());
        const { passing, failing } = this.checkAllSLOs();
        const totalChecked = passing.length + failing.length;
        const compliance = `${passing.length}/${totalChecked}`;
        
        return {
            reportedAt: new Date().toISOString(),
            totalKPIs: this.kpis.size,
            sloCompliance: compliance,
            kpis: allRegistrations,
            results: this.results
        };
    }

    getKPI(streamId, kpiId) {
        return this.kpis.get(`${streamId}::${kpiId}`);
    }

    listKPIs(streamId = null) {
        const all = Array.from(this.kpis.values());
        if (streamId) {
            return all.filter(k => k.streamId === streamId);
        }
        return all;
    }
}

module.exports = StreamKPIEngine;
