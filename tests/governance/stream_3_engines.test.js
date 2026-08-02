/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Governance Platform — Stream 3 Test Suite
 * File           : stream_3_engines.test.js
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

const assert = require('assert');
const path = require('path');

// Require Stream 3 Engines
const BusinessImpactEngine = require('../../engine/governance/BusinessImpactEngine.js');
const TechnicalDebtEngine = require('../../engine/governance/TechnicalDebtEngine.js');
const PrioritizedRoadmapEngine = require('../../engine/governance/PrioritizedRoadmapEngine.js');
const MaturityProgressionEngine = require('../../engine/governance/MaturityProgressionEngine.js');
const HistoricalTrendEngine = require('../../engine/governance/HistoricalTrendEngine.js');

function runStream3TestSuite() {
    console.log('====================================================');
    console.log(' Running Stream 3 Governance Engines Test Suite');
    console.log('====================================================\n');

    const results = [];

    // Test 1: Require all CommonJS modules successfully
    try {
        assert.strictEqual(typeof BusinessImpactEngine, 'function');
        assert.strictEqual(typeof TechnicalDebtEngine, 'function');
        assert.strictEqual(typeof PrioritizedRoadmapEngine, 'function');
        assert.strictEqual(typeof MaturityProgressionEngine, 'function');
        assert.strictEqual(typeof HistoricalTrendEngine, 'function');
        results.push({ test: 'Require CommonJS Stream 3 engines', passed: true });
    } catch (err) {
        results.push({ test: 'Require CommonJS Stream 3 engines', passed: false, error: err.message });
    }

    // Test 2: BusinessImpactEngine calculations
    try {
        const engine = new BusinessImpactEngine({ hourlyRevenueRateEUR: 10000 });
        
        const singleImpact = engine.calculateFindingImpact({
            id: 'SEC-001',
            title: 'Critical Auth Token Bypass',
            severity: 'CRITICAL',
            domain: 'SECURITY',
            blastRadius: 'GLOBAL'
        });

        assert.ok(singleImpact.financialRiskEUR > 150000, 'Financial risk EUR should reflect critical security finding');
        assert.ok(singleImpact.estimatedDowntimeHours > 20, 'Estimated downtime hours should be calculated');
        assert.strictEqual(singleImpact.customerImpactSeverity, 'EXTREME', 'Customer impact severity should be EXTREME for global critical finding');
        assert.ok(singleImpact.revenueImpact.formattedEUR.includes('€'), 'Formatted currency EUR should contain € symbol');

        const aggregate = engine.calculateAggregateImpact([
            { id: 'SEC-001', severity: 'CRITICAL', domain: 'SECURITY', blastRadius: 'GLOBAL' },
            { id: 'INF-002', severity: 'HIGH', domain: 'INFRASTRUCTURE', blastRadius: 'REGIONAL' },
            { id: 'DOC-003', severity: 'LOW', domain: 'DOCUMENTATION', blastRadius: 'LOCAL' }
        ]);

        assert.strictEqual(aggregate.totalFindingsEvaluated, 3);
        assert.ok(aggregate.totalFinancialRiskEUR > 200000);
        assert.strictEqual(aggregate.severityBreakdown.CRITICAL, 1);
        assert.ok(aggregate.domainBreakdown.SECURITY.count === 1);

        results.push({ test: 'BusinessImpactEngine financial risk & downtime calculations', passed: true });
    } catch (err) {
        results.push({ test: 'BusinessImpactEngine financial risk & downtime calculations', passed: false, error: err.message });
    }

    // Test 3: TechnicalDebtEngine 6-domain breakdown & debt ratio
    try {
        const engine = new TechnicalDebtEngine({ baselineProjectHours: 2000 });
        const findings = [
            { id: 'ARCH-1', category: 'Architecture', severity: 'HIGH' },
            { id: 'CODE-1', category: 'Code', severity: 'MEDIUM' },
            { id: 'SEC-1', category: 'Security', severity: 'CRITICAL' },
            { id: 'DOC-1', category: 'Documentation', severity: 'LOW' },
            { id: 'TEST-1', category: 'Testing', severity: 'MEDIUM' },
            { id: 'INFRA-1', category: 'Infrastructure', severity: 'HIGH' }
        ];

        const report = engine.analyzeTechnicalDebt(findings);

        assert.strictEqual(Object.keys(report.domains).length, 6, 'Should compute breakdown across all 6 domains');
        assert.ok(report.overallTechnicalDebtPercentage > 0, 'Overall technical debt percentage should be > 0');
        assert.ok(['A', 'B', 'C', 'D', 'F'].includes(report.overallHealthGrade), 'Should compute overall health grade');
        assert.strictEqual(report.domains.Security.findingCount, 1);
        assert.strictEqual(report.domains.Architecture.findingCount, 1);

        results.push({ test: 'TechnicalDebtEngine 6-domain breakdown & percentage calculation', passed: true });
    } catch (err) {
        results.push({ test: 'TechnicalDebtEngine 6-domain breakdown & percentage calculation', passed: false, error: err.message });
    }

    // Test 4: PrioritizedRoadmapEngine 4-bucket categorization
    try {
        const engine = new PrioritizedRoadmapEngine();
        const findings = [
            { id: 'EMERGENCY-1', severity: 'CRITICAL', domain: 'Security', blastRadius: 'GLOBAL' },
            { id: 'SPRINT-1', severity: 'HIGH', domain: 'Infrastructure' },
            { id: 'BACKLOG-1', severity: 'MEDIUM', domain: 'Testing' },
            { id: 'FUTURE-1', severity: 'LOW', domain: 'Documentation' }
        ];

        const roadmap = engine.generateRoadmap(findings);

        assert.strictEqual(roadmap.buckets['Immediate (Today)'].items.length, 1);
        assert.strictEqual(roadmap.buckets['Next Sprint'].items.length, 1);
        assert.strictEqual(roadmap.buckets['Backlog'].items.length, 1);
        assert.strictEqual(roadmap.buckets['Future'].items.length, 1);
        assert.ok(roadmap.totalEffortHours > 0);
        assert.ok(roadmap.estimatedSprintsToComplete > 0);

        results.push({ test: 'PrioritizedRoadmapEngine 4-bucket categorization', passed: true });
    } catch (err) {
        results.push({ test: 'PrioritizedRoadmapEngine 4-bucket categorization', passed: false, error: err.message });
    }

    // Test 5: MaturityProgressionEngine 6-level evaluation
    try {
        const engine = new MaturityProgressionEngine();
        
        const eval1 = engine.evaluateMaturity({ qualityScore: 98, testCoverage: 95, telemetryScore: 94 });
        assert.strictEqual(eval1.maturityLevelNumber, 6);
        assert.strictEqual(eval1.maturityLevelName, 'Autonomous');

        const eval2 = engine.evaluateMaturity({ qualityScore: 65, testCoverage: 70, telemetryScore: 68 });
        assert.strictEqual(eval2.maturityLevelNumber, 4);
        assert.strictEqual(eval2.maturityLevelName, 'Measured');
        assert.ok(eval2.gapAnalysis.weakDimensions.length >= 0);
        assert.strictEqual(eval2.progressionRoadmap.targetLevel, 5);

        results.push({ test: 'MaturityProgressionEngine 6-level evaluation', passed: true });
    } catch (err) {
        results.push({ test: 'MaturityProgressionEngine 6-level evaluation', passed: false, error: err.message });
    }

    // Test 6: HistoricalTrendEngine Jan -> Jul trend charts
    try {
        const engine = new HistoricalTrendEngine();
        
        // Record a new run
        engine.recordAuditRun({
            runId: 'RUN-202607-02',
            timestamp: '2026-07-28T12:00:00Z',
            qualityScore: 99.1,
            technicalDebtPercentage: 2.8,
            totalFindings: 2,
            maturityLevel: 6
        });

        const trend = engine.getTrendProgression();
        assert.ok(trend.monthlyData.length >= 7, 'Should cover Jan -> Jul monthly data');
        assert.strictEqual(trend.monthlyData[0].month, 'Jan');
        assert.strictEqual(trend.monthlyData[6].month, 'Jul');
        assert.strictEqual(trend.trajectory, 'IMPROVING');

        const chart = engine.generateTrendChartData();
        assert.ok(chart.asciiChart.includes('Quality Score Trend'), 'ASCII chart should contain header');
        assert.ok(chart.svgSparkline.includes('<svg'), 'SVG sparkline should produce valid SVG tag');
        assert.strictEqual(chart.jsonChartData.labels[0], 'Jan');
        assert.strictEqual(chart.jsonChartData.labels[6], 'Jul');

        results.push({ test: 'HistoricalTrendEngine Jan -> Jul trend charts', passed: true });
    } catch (err) {
        results.push({ test: 'HistoricalTrendEngine Jan -> Jul trend charts', passed: false, error: err.message });
    }

    // Print Test Summary
    let passedCount = 0;
    for (const r of results) {
        if (r.passed) {
            console.log(`  ✓ PASS: ${r.test}`);
            passedCount++;
        } else {
            console.log(`  ✗ FAIL: ${r.test} - Error: ${r.error}`);
        }
    }

    console.log(`\nStream 3 Test Summary: ${passedCount}/${results.length} tests passed.\n`);

    if (passedCount !== results.length) {
        process.exit(1);
    }
}

runStream3TestSuite();
