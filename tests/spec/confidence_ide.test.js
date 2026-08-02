/******************************************************************************
 * Project        : Universal Autonomous Engineering System (EAORCS)
 * Module         : Confidence Engine & IDE Integration Test Suite
 * File           : confidence_ide.test.js
 * Version        : 1.0.0
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Platform
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | GOVERNMENT
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
 * Copyright (c) 2026 Ujomor Platform. All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');

const { BlueprintConfidenceEngine } = require('../../engine/confidence/BlueprintConfidenceEngine.js');
const { CertificationConfidenceEngine } = require('../../engine/confidence/CertificationConfidenceEngine.js');
const { OperationalConfidenceEngine } = require('../../engine/confidence/OperationalConfidenceEngine.js');
const { ProcurementConfidenceEngine } = require('../../engine/confidence/ProcurementConfidenceEngine.js');
const { RequirementLookupProvider } = require('../../engine/ide/RequirementLookupProvider.js');
const { TraceabilityNavigator } = require('../../engine/ide/TraceabilityNavigator.js');
const { CoverageVisualizer } = require('../../engine/ide/CoverageVisualizer.js');

function runTest(name, fn) {
    process.stdout.write(`Testing ${name}... `);
    try {
        fn();
        console.log('✔ PASSED');
    } catch (err) {
        console.log('❌ FAILED');
        console.error(err);
        process.exitCode = 1;
        throw err;
    }
}

console.log('================================================================');
console.log(' EAORCS Stream E & F: Confidence Engine & IDE Test Suite');
console.log('================================================================\n');

// 1. Test BlueprintConfidenceEngine
runTest('BlueprintConfidenceEngine', () => {
    const engine = new BlueprintConfidenceEngine();

    const sampleAst = {
        title: 'EAORCS Audit Stream Engine',
        description: 'Complete audit stream engine specification for compliance verification.',
        version: '1.0.0',
        author: 'Architecture Authority',
        inputs: [
            { name: 'ast', type: 'object', required: true },
            { name: 'config', type: 'object', required: false }
        ],
        outputs: [
            { name: 'score', type: 'number', min: 0, max: 100 }
        ],
        rules: [
            { id: 'RULE-001', condition: 'score >= 70', action: 'APPROVE' }
        ],
        constraints: [
            { id: 'CONST-001', rule: 'Zero external dependencies' }
        ],
        requirements: [
            {
                id: 'REQ-001',
                title: 'Blueprint Confidence Scoring',
                description: 'Engine shall compute clarity, completeness, consistency, and unambiguity scores.',
                type: 'FUNCTIONAL',
                priority: 'HIGH'
            },
            {
                id: 'REQ-002',
                title: 'Certification Verification Graph',
                description: 'Engine shall verify cryptographic proofs and test coverage.',
                type: 'VERIFICATION',
                priority: 'CRITICAL',
                dependencies: ['REQ-001']
            }
        ]
    };

    const evalResult = engine.evaluateSpecConfidence(sampleAst);
    assert.strictEqual(typeof evalResult.score, 'number', 'Score should be a number');
    assert(evalResult.score >= 0 && evalResult.score <= 100, 'Score should be between 0 and 100');
    assert.strictEqual(typeof evalResult.breakdown.clarity, 'number');
    assert.strictEqual(typeof evalResult.breakdown.completeness, 'number');
    assert.strictEqual(typeof evalResult.breakdown.consistency, 'number');
    assert.strictEqual(typeof evalResult.breakdown.unambiguity, 'number');

    const computed = engine.computeSpecScore();
    assert.strictEqual(computed.score, evalResult.score);
    assert.deepStrictEqual(computed.breakdown, evalResult.breakdown);
});

// 2. Test CertificationConfidenceEngine
runTest('CertificationConfidenceEngine', () => {
    const certEngine = new CertificationConfidenceEngine();

    const traceabilityResults = {
        totalRequirements: 10,
        coveredRequirements: 9,
        linkDepth: 4,
        orphanedCount: 0
    };

    const evidenceGraph = {
        nodes: [
            { id: 'proof-1', type: 'proof', verified: true },
            { id: 'proof-2', type: 'proof', verified: true }
        ],
        tests: [
            { name: 'unit_test_1', passed: true },
            { name: 'unit_test_2', passed: true }
        ]
    };

    const certResult = certEngine.computeCertificationConfidence(traceabilityResults, evidenceGraph);
    assert.strictEqual(typeof certResult.score, 'number');
    assert(certResult.score >= 80, 'Certification score should be high for clean evidence');
    assert.strictEqual(certEngine.getConfidenceScore(), certResult.score);
});

// 3. Test OperationalConfidenceEngine
runTest('OperationalConfidenceEngine', () => {
    const opsEngine = new OperationalConfidenceEngine();

    const healthLogs = [
        { status: 'HEALTHY', latencyMs: 12 },
        { status: 'HEALTHY', latencyMs: 15 },
        { status: 'HEALTHY', latencyMs: 10 }
    ];

    const testResults = {
        passed: 45,
        total: 50,
        complianceScore: 95
    };

    const opsResult = opsEngine.computeOperationalConfidence(healthLogs, testResults);
    assert.strictEqual(typeof opsResult.score, 'number');
    assert(opsResult.score >= 70, 'Operational score should reflect high pass rate and healthy logs');
    assert.strictEqual(opsEngine.getOperationalScore(), opsResult.score);
});

// 4. Test ProcurementConfidenceEngine
runTest('ProcurementConfidenceEngine', () => {
    const procEngine = new ProcurementConfidenceEngine();

    const specScore = 92;
    const certScore = 88;
    const opsScore = 90;

    const indexResult = procEngine.generateProcurementIndex(specScore, certScore, opsScore);
    assert.strictEqual(typeof indexResult.procurementIndex, 'number');
    assert.strictEqual(indexResult.procurementIndex, 90);
    assert(indexResult.tier.startsWith('AAA'), 'Tier should be AAA for score >= 90');
    assert.strictEqual(indexResult.riskLevel, 'LOW');

    const summary = procEngine.getExecutiveSummary();
    assert.strictEqual(summary.readiness, 'ACQUISITION_APPROVED');
    assert.strictEqual(summary.procurementIndex, 90);
});

// 5. Test RequirementLookupProvider
runTest('RequirementLookupProvider', () => {
    const provider = new RequirementLookupProvider();

    provider.registerRequirements([
        {
            id: 'REQ-001',
            title: 'Blueprint Confidence Scoring',
            description: 'Computes clarity and completeness.',
            status: 'ACTIVE',
            priority: 'HIGH'
        }
    ]);

    const sampleFilePath = path.join(__dirname, 'virtual_test_file.js');
    const sampleCode = `
    // Implements @req REQ-001 specification
    function computeConfidence() {
        return 100;
    }
    `;
    provider.setVirtualBuffer(sampleFilePath, sampleCode);

    const posMatch = provider.getRequirementAtPosition(sampleFilePath, 2, 20);
    assert(posMatch !== null, 'Should find requirement at position');
    assert.strictEqual(posMatch.reqId, 'REQ-001');

    const hover = provider.getRequirementHover('REQ-001');
    assert.strictEqual(hover.contents.kind, 'markdown');
    assert(hover.contents.value.includes('Blueprint Confidence Scoring'));
});

// 6. Test TraceabilityNavigator
runTest('TraceabilityNavigator', () => {
    const navigator = new TraceabilityNavigator();

    const targetFile = path.join(__dirname, 'sample_code.js');
    navigator.registerLink('REQ-100', targetFile, 15, '// Implementation for @req REQ-100');

    const reqLinks = navigator.findRequirementForCode(targetFile, 15);
    assert.strictEqual(reqLinks.length, 1);
    assert.strictEqual(reqLinks[0].reqId, 'REQ-100');

    const codeLocs = navigator.findCodeForRequirement('REQ-100');
    assert.strictEqual(codeLocs.length, 1);
    assert.strictEqual(codeLocs[0].line, 15);
});

// 7. Test CoverageVisualizer
runTest('CoverageVisualizer', () => {
    const visualizer = new CoverageVisualizer();

    const engineDir = path.resolve(__dirname, '../../engine');
    const heatmap = visualizer.generateHeatmapData(engineDir);

    assert(heatmap !== null, 'Heatmap data should be generated');
    assert(heatmap.summary.totalFiles > 0, 'Total files scanned should be > 0');

    const dirCoverage = visualizer.getCoverageByDirectory();
    assert(typeof dirCoverage === 'object' && Object.keys(dirCoverage).length > 0, 'Directory coverage map should be populated');
});

console.log('\n✅ All 7 Confidence & IDE Integration Engine tests passed successfully!\n');
