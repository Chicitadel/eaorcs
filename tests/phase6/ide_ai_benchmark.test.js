/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Phase 6 IDE Adapters & AI Benchmark Verification Test Suite
 * File           : ide_ai_benchmark.test.js
 * Version        : 2026.1-LTS (v1.0.0)
 * Author         : Enterprise Architecture Authority & Verification Team
 * Organization   : Ujomor Systems & Enterprise Governance Authority
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | RESTRICTED
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
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance Authority
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');

const ProductionIdeAdapterSuite = require('../../engine/ide/ProductionIdeAdapterSuite');
const AiPrecisionRecallBenchmark = require('../../engine/ai/AiPrecisionRecallBenchmark');

async function runTestSuite() {
    console.log('================================================================');
    console.log('  EAORCS PHASE 6: PRODUCTION IDE ADAPTERS & AI BENCHMARK SUITE');
    console.log('================================================================\n');

    let totalTests = 0;
    let passedTests = 0;

    function test(description, fn) {
        totalTests++;
        try {
            fn();
            passedTests++;
            console.log(`  ✓ [PASS] ${description}`);
        } catch (err) {
            console.error(`  ff [FAIL] ${description}`);
            console.error(`    Error: ${err.message}`);
            throw err;
        }
    }

    // ------------------------------------------------------------------------
    // SECTION 1: Production IDE Adapter Suite Verification
    // ------------------------------------------------------------------------
    console.log('[SECTION 1] Testing Production IDE Adapter Suite...\n');

    const ideSuite = new ProductionIdeAdapterSuite();

    test('Supported IDEs listing contains 7 major families', () => {
        const supported = ideSuite.listSupportedIdes();
        assert.ok(Array.isArray(supported));
        assert.strictEqual(supported.length, 7);
        const expectedIdes = ['VS Code', 'JetBrains', 'Visual Studio', 'Eclipse', 'Neovim', 'Cursor', 'Windsurf'];
        expectedIdes.forEach(ide => {
            assert.ok(supported.includes(ide), `Expected ${ide} in supported list`);
        });
    });

    test('Custom IDE Adapter registration & capabilities override', () => {
        const result = ideSuite.registerIdeAdapter('Zed', {
            version: '2026.2-DEV',
            supportsInlineDecorations: true,
            customCapabilities: { highSpeedSyntax: true }
        });
        assert.strictEqual(result.registered, true);
        assert.strictEqual(result.ideName, 'Zed');
        const list = ideSuite.listSupportedIdes();
        assert.ok(list.includes('Zed'));
    });

    test('LSP initialize request across all 7 major IDE families', () => {
        const ides = ['VS Code', 'JetBrains', 'Visual Studio', 'Eclipse', 'Neovim', 'Cursor', 'Windsurf'];
        ides.forEach(ide => {
            const res = ideSuite.handleLspRequest(ide, 'initialize', { id: 101 });
            assert.strictEqual(res.jsonrpc, '2.0');
            assert.strictEqual(res.id, 101);
            assert.ok(res.result.capabilities);
            assert.strictEqual(res.result.serverInfo.targetIde, ide);
        });
    });

    test('LSP textDocument/didOpen & textDocument/didChange processing', () => {
        const res = ideSuite.handleLspRequest('VS Code', 'textDocument/didOpen', {
            textDocument: { uri: 'engine/ide/ProductionIdeAdapterSuite.js' },
            id: 102
        });
        assert.strictEqual(res.jsonrpc, '2.0');
        assert.strictEqual(res.result.status, 'PROCESSED');
        assert.ok(Array.isArray(res.result.diagnostics));
        assert.ok(Array.isArray(res.result.decorations));
    });

    test('LSP textDocument/publishDiagnostics and hover provider', () => {
        const diagRes = ideSuite.handleLspRequest('Cursor', 'textDocument/publishDiagnostics', {
            filePath: 'engine/ai/AiPrecisionRecallBenchmark.js',
            id: 103
        });
        assert.strictEqual(diagRes.result.kind, 'full');
        assert.ok(Array.isArray(diagRes.result.items));

        const hoverRes = ideSuite.handleLspRequest('Windsurf', 'textDocument/hover', {
            filePath: 'engine/ai/AiPrecisionRecallBenchmark.js',
            position: { line: 10, character: 5 },
            id: 104
        });
        assert.ok(hoverRes.result.contents.value.includes('EAORCS Governance Traceability'));
        assert.ok(hoverRes.result.contents.value.includes('Windsurf'));
    });

    test('LSP CodeAction provider & DAP protocol requests', () => {
        const codeActionRes = ideSuite.handleLspRequest('JetBrains', 'textDocument/codeAction', {
            filePath: 'engine/ide/ProductionIdeAdapterSuite.js',
            id: 105
        });
        assert.ok(Array.isArray(codeActionRes.result));
        assert.strictEqual(codeActionRes.result.length, 2);

        const dapRes = ideSuite.handleLspRequest('Neovim', 'dap/initialize', { id: 106 });
        assert.strictEqual(dapRes.result.dapVersion, '1.51');
        assert.strictEqual(dapRes.result.status, 'DAP_SESSION_READY');
    });

    test('Traceability decorations for all 7 major IDE families', () => {
        const ides = ['VS Code', 'JetBrains', 'Visual Studio', 'Eclipse', 'Neovim', 'Cursor', 'Windsurf'];
        ides.forEach(ide => {
            const decs = ideSuite.getTraceabilityDecoration(ide, 'engine/ide/ProductionIdeAdapterSuite.js');
            assert.ok(Array.isArray(decs));
            assert.ok(decs.length > 0);
            const dec = decs[0];
            assert.strictEqual(dec.status, 'COMPLIANT');
            assert.ok(dec.complianceScore >= 90.0);
            assert.ok(dec.requirementId.startsWith('REQ-EAORCS-'));
        });
    });

    test('Diagnostic items generation & enforcement checks', () => {
        const diags = ideSuite.getDiagnosticItems('engine/ide/ProductionIdeAdapterSuite.js');
        assert.ok(Array.isArray(diags));
        const zeroDepErrors = diags.filter(d => d.code === 'EAORCS-DEP-001');
        assert.strictEqual(zeroDepErrors.length, 0, 'No zero-dependency violations should be present');
    });

    // ------------------------------------------------------------------------
    // SECTION 2: AI Precision & Recall Benchmark Verification
    // ------------------------------------------------------------------------
    console.log('\n[SECTION 2] Testing AI Precision & Recall Benchmark Suite...\n');

    const benchmark = new AiPrecisionRecallBenchmark();

    test('Gold-standard dataset loading (built-in requirement_extraction_v1)', () => {
        const dataset = benchmark.loadGoldStandardDataset('requirement_extraction_v1');
        assert.ok(Array.isArray(dataset));
        assert.strictEqual(dataset.length, 10);
        const relevantCount = dataset.filter(i => i.isRelevant).length;
        assert.strictEqual(relevantCount, 7);
    });

    test('Gold-standard dataset loading (built-in drift_detection_v1)', () => {
        const dataset = benchmark.loadGoldStandardDataset('drift_detection_v1');
        assert.ok(Array.isArray(dataset));
        assert.strictEqual(dataset.length, 5);
        const driftCount = dataset.filter(i => i.expectedDrift).length;
        assert.strictEqual(driftCount, 3);
    });

    test('Model performance evaluation on perfect predictions (100% Precision & Recall)', () => {
        benchmark.loadGoldStandardDataset('requirement_extraction_v1');
        const perfectPredictions = new Set(['REQ-001', 'REQ-002', 'REQ-004', 'REQ-005', 'REQ-007', 'REQ-008', 'REQ-010']);

        const metrics = benchmark.evaluateModelPerformance(perfectPredictions);
        assert.strictEqual(metrics.precision, 1.0);
        assert.strictEqual(metrics.recall, 1.0);
        assert.strictEqual(metrics.f1Score, 1.0);
        assert.strictEqual(metrics.accuracy, 1.0);
        assert.deepStrictEqual(metrics.confusionMatrix, { tp: 7, fp: 0, fn: 0, tn: 3 });
    });

    test('Model performance evaluation on partial / noisy predictions', () => {
        benchmark.loadGoldStandardDataset('requirement_extraction_v1');
        const noisyPredictions = ['REQ-001', 'REQ-002', 'REQ-003', 'REQ-004', 'REQ-005', 'REQ-007', 'REQ-008', 'REQ-010'];

        const metrics = benchmark.evaluateModelPerformance(noisyPredictions);
        assert.strictEqual(metrics.confusionMatrix.tp, 7);
        assert.strictEqual(metrics.confusionMatrix.fp, 1);
        assert.strictEqual(metrics.confusionMatrix.fn, 0);
        assert.strictEqual(metrics.confusionMatrix.tn, 2);
        assert.strictEqual(metrics.precision, 0.875);
        assert.strictEqual(metrics.recall, 1.0);
        assert.strictEqual(metrics.f1Score, 0.9333);
        assert.strictEqual(metrics.accuracy, 0.9);
    });

    test('Drift detection benchmark evaluation', () => {
        const driftDataset = benchmark.loadGoldStandardDataset('drift_detection_v1');
        const predictions = [
            { id: 'DRIFT-001', expectedDrift: true },
            { id: 'DRIFT-002', expectedDrift: false },
            { id: 'DRIFT-003', expectedDrift: true },
            { id: 'DRIFT-004', expectedDrift: false },
            { id: 'DRIFT-005', expectedDrift: true }
        ];

        const metrics = benchmark.evaluateModelPerformance(predictions, driftDataset);
        assert.strictEqual(metrics.precision, 1.0);
        assert.strictEqual(metrics.recall, 1.0);
        assert.strictEqual(metrics.f1Score, 1.0);
        assert.deepStrictEqual(metrics.confusionMatrix, { tp: 3, fp: 0, fn: 0, tn: 2 });
    });

    test('Edge cases & zero-division handling in computeMetrics', () => {
        const emptyMetrics = benchmark.computeMetrics({ tp: 0, fp: 0, fn: 0, tn: 0 });
        assert.strictEqual(emptyMetrics.precision, 0);
        assert.strictEqual(emptyMetrics.recall, 0);
        assert.strictEqual(emptyMetrics.f1Score, 0);
        assert.strictEqual(emptyMetrics.accuracy, 0);
        assert.deepStrictEqual(emptyMetrics.confusionMatrix, { tp: 0, fp: 0, fn: 0, tn: 0 });
    });

    console.log('\n================================================================');
    console.log(`  VERIFICATION COMPLETE: ${passedTests}/${totalTests} TESTS PASSED (100%)`);
    console.log('================================================================\n');
}

runTestSuite().catch(err => {
    console.error('Test Suite Failed:', err);
    process.exit(1);
});
