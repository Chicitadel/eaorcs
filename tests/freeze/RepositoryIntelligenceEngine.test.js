/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Repository Intelligence Engine Test Suite
 * File           : RepositoryIntelligenceEngine.test.js
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
 * CORP: Subsystem 1 — Repository Intelligence Engine Test Verification
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
const RepositoryIntelligenceEngine = require('../../engine/intelligence/RepositoryIntelligenceEngine');

async function testRepositoryIntelligenceEngine() {
    console.log('[TEST] Starting RepositoryIntelligenceEngine Test Verification...');

    const workspaceRoot = path.resolve(__dirname, '../../');
    const engine = new RepositoryIntelligenceEngine(workspaceRoot);

    // Test 1: analyzeRepository()
    console.log('[TEST] 1. Verifying analyzeRepository()...');
    const analysis = engine.analyzeRepository();

    assert.ok(analysis, 'Analysis result should be defined');
    assert.strictEqual(typeof analysis.workspaceRoot, 'string', 'workspaceRoot should be string');
    assert.ok(analysis.metrics.totalFiles > 0, 'Total files count should be > 0');
    assert.ok(analysis.metrics.totalLines > 0, 'Total lines count should be > 0');
    assert.ok(analysis.metrics.totalBytes > 0, 'Total bytes count should be > 0');
    assert.ok(analysis.metrics.totalJsFiles > 0, 'Total JS files count should be > 0');
    assert.ok(analysis.syntaxStats, 'syntaxStats should exist');
    assert.ok(Array.isArray(analysis.syntaxStats.classes), 'syntaxStats.classes should be array');
    assert.ok(Array.isArray(analysis.syntaxStats.functions), 'syntaxStats.functions should be array');
    assert.ok(Array.isArray(analysis.syntaxStats.apis), 'syntaxStats.apis should be array');

    // Verification of contracts
    assert.ok(analysis.contracts, 'contracts verification block should exist');
    assert.strictEqual(typeof analysis.contracts.verificationRate, 'number', 'verificationRate should be number');
    assert.ok(Array.isArray(analysis.contracts.manifests), 'manifests should be array');

    // Verification of technical debt
    assert.ok(analysis.technicalDebt, 'technicalDebt block should exist');
    assert.ok(Array.isArray(analysis.technicalDebt.items), 'debt items should be array');
    assert.ok(analysis.technicalDebt.summary.totalItems >= 0, 'totalItems should be >= 0');

    // Verification of graph
    assert.ok(analysis.graph, 'graph synthesis block should exist');
    assert.ok(Array.isArray(analysis.graph.nodes), 'graph.nodes should be array');
    assert.ok(Array.isArray(analysis.graph.edges), 'graph.edges should be array');
    assert.ok(analysis.graph.nodes.length > 0, 'graph nodes should be > 0');

    // Verification of summary scores
    assert.ok(analysis.summary.readinessScore > 0, 'readinessScore should be > 0');
    assert.ok(analysis.summary.healthIndex > 0, 'healthIndex should be > 0');
    assert.ok(['HEALTHY', 'WARNING', 'CRITICAL'].includes(analysis.summary.status), 'Status should be valid string enum');
    console.log(`[PASS] analyzeRepository() passed. Analyzed ${analysis.metrics.totalFiles} files (${analysis.metrics.totalLines} lines), Readiness Score: ${analysis.summary.readinessScore}`);

    // Test 2: queryIntelligence() - Bottlenecks
    console.log('[TEST] 2. Verifying queryIntelligence() — Bottlenecks...');
    const botResp = engine.queryIntelligence('Diagnose platform bottlenecks');
    assert.strictEqual(botResp.intent, 'BOTTLENECK_DIAGNOSIS', 'Intent should be BOTTLENECK_DIAGNOSIS');
    assert.ok(botResp.diagnosis.includes('Diagnosis'), 'Diagnosis text should exist');
    assert.ok(Array.isArray(botResp.bottlenecks), 'bottlenecks array should exist');
    assert.ok(Array.isArray(botResp.remediation), 'remediation array should exist');
    console.log('[PASS] queryIntelligence() Bottlenecks passed.');

    // Test 3: queryIntelligence() - Blocked Streams
    console.log('[TEST] 3. Verifying queryIntelligence() — Blocked Streams...');
    const streamResp = engine.queryIntelligence('Show blocked streams in EAORCS backlog');
    assert.strictEqual(streamResp.intent, 'STREAM_STATUS', 'Intent should be STREAM_STATUS');
    assert.ok(Array.isArray(streamResp.blockedStreams), 'blockedStreams array should exist');
    console.log('[PASS] queryIntelligence() Stream Status passed.');

    // Test 4: queryIntelligence() - Missing Docs
    console.log('[TEST] 4. Verifying queryIntelligence() — Missing Docs...');
    const docResp = engine.queryIntelligence('Find missing docs and JSDoc headers');
    assert.strictEqual(docResp.intent, 'DOCUMENTATION_GAP', 'Intent should be DOCUMENTATION_GAP');
    assert.ok(Array.isArray(docResp.missingDocs), 'missingDocs array should exist');
    console.log('[PASS] queryIntelligence() Missing Docs passed.');

    // Test 5: Static Helper Methods
    console.log('[TEST] 5. Verifying Static Helpers...');
    const staticAnalysis = RepositoryIntelligenceEngine.analyzeRepository(workspaceRoot);
    assert.ok(staticAnalysis.metrics.totalFiles > 0, 'Static analyzeRepository should work');

    const staticQuery = RepositoryIntelligenceEngine.queryIntelligence('Tech debt overview', workspaceRoot);
    assert.strictEqual(staticQuery.intent, 'TECH_DEBT', 'Static queryIntelligence should work');
    console.log('[PASS] Static helpers passed.');

    console.log('\n===============================================================');
    console.log(' ALL REPOSITORY INTELLIGENCE ENGINE TESTS PASSED SUCCESSFULLY');
    console.log('===============================================================\n');
}

testRepositoryIntelligenceEngine().catch((err) => {
    console.error('[TEST FAIL] RepositoryIntelligenceEngine error:', err);
    process.exit(1);
});
