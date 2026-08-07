/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Performance Trend Engine
 * File           : PerformanceTrendEngine.js
 * Version        : 2026.3.1-LTS
 * Author         : Ujomor Systems & Enterprise Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-07
 * Last Modified  : 2026-08-07
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance: Security Reviewed | Architecture Controlled | Protocol Frozen
 * Standards: ISO 27001 | SOC 2 | OWASP ASVS | NIST
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

class PerformanceTrendEngine {
    constructor() {
        this.snapshots = [];
        this.kpiRegistry = new Map([
            ['CLI_STARTUP', { id: 'CLI_STARTUP', name: 'CLI Startup Time', unit: 'ms' }],
            ['WARM_SCAN', { id: 'WARM_SCAN', name: 'Warm Workspace Scan', unit: 'ms' }],
            ['COLD_SCAN', { id: 'COLD_SCAN', name: 'Cold Workspace Scan', unit: 'ms' }],
            ['EVIDENCE_GEN', { id: 'EVIDENCE_GEN', name: 'Evidence Generation', unit: 'ms' }],
            ['FULL_DAG', { id: 'FULL_DAG', name: 'Full Qualification DAG', unit: 'ms' }]
        ]);
    }

    recordBenchmark(version, benchmarks = []) {
        const snap = {
            version,
            timestamp: new Date().toISOString(),
            benchmarks
        };
        this.snapshots.push(snap);
        return { version, timestamp: snap.timestamp, benchmarkCount: benchmarks.length };
    }

    getHistoricalTrend(kpiId, lastN = 10) {
        const history = [];
        const relevantSnaps = this.snapshots.slice(-lastN);

        for (let i = 0; i < relevantSnaps.length; i++) {
            const snap = relevantSnaps[i];
            const bm = snap.benchmarks.find(b => b.kpiId === kpiId);
            const value = bm ? bm.actualValue : null;

            let delta = null;
            let deltaPct = null;

            if (i > 0 && history[i - 1].value !== null && value !== null) {
                const prev = history[i - 1].value;
                delta = value - prev;
                deltaPct = prev !== 0 ? Math.round((delta / prev) * 100) : 0;
            }

            history.push({ version: snap.version, value, delta, deltaPct });
        }

        return history;
    }

    detectRegression(kpiId, currentValue, sloThreshold) {
        const history = this.getHistoricalTrend(kpiId, 5);
        const previousValue = history.length > 0 ? history[history.length - 1].value : null;

        const isRegression = currentValue > sloThreshold;
        let deltaPct = null;
        if (previousValue !== null && previousValue !== 0) {
            deltaPct = Math.round(((currentValue - previousValue) / previousValue) * 100);
        }

        return {
            isRegression,
            currentValue,
            sloThreshold,
            deltaPct,
            previousValue
        };
    }

    generateTrendReport() {
        const kpiIds = Array.from(this.kpiRegistry.keys());
        const kpis = [];

        for (const kpiId of kpiIds) {
            const trend = this.getHistoricalTrend(kpiId, 10);
            let direction = 'INSUFFICIENT_DATA';

            if (trend.length >= 2) {
                const last = trend[trend.length - 1].value;
                const prev = trend[trend.length - 2].value;
                if (last !== null && prev !== null) {
                    if (last < prev) direction = 'IMPROVING';
                    else if (last > prev) direction = 'REGRESSING';
                    else direction = 'STABLE';
                }
            }

            const latestValue = trend.length > 0 ? trend[trend.length - 1].value : null;

            kpis.push({
                kpiId,
                snapshots: trend.length,
                trend: direction,
                latestValue
            });
        }

        return {
            generatedAt: new Date().toISOString(),
            kpis
        };
    }

    exportTrendAsTable(kpiId) {
        const trend = this.getHistoricalTrend(kpiId, 10);
        const lines = [
            `| Version | Value | Delta |`,
            `|---------|-------|-------|`
        ];

        for (const row of trend) {
            const v = row.version.padEnd(7);
            const val = String(row.value ?? 'N/A').padEnd(5);
            const d = row.delta === null ? 'N/A' : (row.delta > 0 ? `+${row.delta}` : String(row.delta));
            lines.push(`| ${v} | ${val} | ${d.padEnd(5)} |`);
        }

        return lines.join('\n');
    }

    computeReliabilityScore(kpiId, sloThreshold) {
        const history = this.getHistoricalTrend(kpiId, 100);
        const total = history.filter(h => h.value !== null).length;
        const passing = history.filter(h => h.value !== null && h.value <= sloThreshold).length;
        const reliabilityPct = total > 0 ? Math.round((passing / total) * 100) : 100;

        return {
            kpiId,
            sloThreshold,
            totalSnapshots: total,
            passing,
            reliabilityPct
        };
    }
}

module.exports = PerformanceTrendEngine;
