/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Enterprise Command Center Engine Test Suite
 * File           : EnterpriseCommandCenterEngine.test.js
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
 * CORP: Subsystem 1 — Enterprise Command Center Engine & HTTP Server Test Verification
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
const fs = require('fs');
const http = require('http');
const EnterpriseCommandCenterEngine = require('../../engine/operations/EnterpriseCommandCenterEngine');

function httpGet(urlStr) {
    return new Promise((resolve, reject) => {
        http.get(urlStr, { agent: false }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({ statusCode: res.statusCode, headers: res.headers, body: data });
            });
        }).on('error', reject);
    });
}

function httpPost(urlStr) {
    return new Promise((resolve, reject) => {
        const parsed = new URL(urlStr);
        const req = http.request({
            hostname: parsed.hostname,
            port: parsed.port,
            path: parsed.pathname,
            method: 'POST',
            agent: false,
            headers: { 'Content-Type': 'application/json' }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({ statusCode: res.statusCode, headers: res.headers, body: data });
            });
        });
        req.on('error', reject);
        req.end();
    });
}

async function runEnterpriseCommandCenterEngineTests() {
    console.log('================================================================');
    console.log('  TEST SUITE: EnterpriseCommandCenterEngine (Subsystem 1)');
    console.log('================================================================\n');

    const workspaceRoot = path.resolve(__dirname, '../../');
    const engine = new EnterpriseCommandCenterEngine(workspaceRoot);

    // Test 1: discoverWorkspaceState()
    console.log('[1/4] Testing discoverWorkspaceState(workspaceRoot)...');
    const state = engine.discoverWorkspaceState(workspaceRoot);

    assert.ok(state.scannedAt, 'scannedAt must be set');
    assert.strictEqual(state.workspaceRoot, workspaceRoot);
    assert.ok(state.fileStats.totalFiles > 10, 'Should find files in workspace');
    assert.ok(state.fileStats.jsFiles > 5, 'Should count JS files');
    assert.ok(state.fileStats.totalLoc > 1000, 'Should estimate total LOC');
    assert.ok(state.testSuitesCount > 0, 'Should detect test suites');
    assert.ok(Array.isArray(state.testSuites), 'testSuites must be array');
    assert.ok(state.sastFindings && typeof state.sastFindings.total === 'number', 'sastFindings must be object');
    assert.ok(state.technicalDebt && typeof state.technicalDebt.todosCount === 'number', 'technicalDebt must be tracked');
    
    // Check descriptors
    assert.ok(state.descriptors.capabilitiesYaml.exists, 'capabilities.yaml descriptor should exist');
    assert.ok(state.descriptors.productYaml.exists, 'product.yaml descriptor should exist');
    assert.ok(state.descriptors.releaseYaml.exists, 'release.yaml descriptor should exist');
    assert.ok(state.descriptors.digitalTwinYaml.exists, 'digital_twin.yaml descriptor should exist');

    console.log(`  -> Workspace state discovered: ${state.fileStats.totalFiles} files, ${state.testSuitesCount} test suites, ${state.fileStats.totalLoc} LOC.\n`);

    // Test 2: generateDashboardJson()
    console.log('[2/4] Testing generateDashboardJson(workspaceRoot, options)...');
    const testDashboardPath = path.join(workspaceRoot, 'ecc_dashboard.json');
    const dashboard = engine.generateDashboardJson(workspaceRoot, { outputPath: testDashboardPath });

    assert.strictEqual(dashboard.title, 'EAORCS Enterprise Command Center (ECC)');
    assert.ok(dashboard.liveMetrics.healthScore > 0, 'Health score must be computed');
    assert.ok(dashboard.liveMetrics.slsaLevel === 'SLSA LEVEL 4');
    assert.ok(Array.isArray(dashboard.federationStatus.products), 'Federation status must list products');
    assert.ok(Array.isArray(dashboard.liveStreamStatuses), 'Live stream statuses must be array');
    assert.ok(dashboard.digitalTwinNodeHealth.nodes.length >= 5, 'Digital twin health must list nodes');
    assert.ok(fs.existsSync(testDashboardPath), 'ecc_dashboard.json file must be generated on disk');

    console.log(`  -> ecc_dashboard.json generated successfully. Health Score: ${dashboard.liveMetrics.healthScore}%\n`);

    // Test 3: executeGovernedPipeline()
    console.log('[3/4] Testing executeGovernedPipeline(options)...');
    const pipelineResult = engine.executeGovernedPipeline({ workspaceRoot });

    assert.ok(pipelineResult.pipelineId.startsWith('EXEC-GOV-'), 'Pipeline ID format check');
    assert.strictEqual(pipelineResult.status, 'PASSED');
    assert.strictEqual(pipelineResult.stagesExecuted.length, 7, 'Must execute exactly 7 pipeline stages');

    const expectedStages = ['Discover', 'Audit', 'Plan', 'Execute', 'Certify', 'Package', 'Regenerate'];
    pipelineResult.stagesExecuted.forEach((stage, idx) => {
        assert.strictEqual(stage.stage, idx + 1);
        assert.strictEqual(stage.name, expectedStages[idx]);
        assert.ok(stage.status === 'SUCCESS' || stage.status === 'WARNING');
    });

    assert.ok(pipelineResult.summary.attestationHash, 'Attestation SHA-256 hash must be generated');
    assert.strictEqual(pipelineResult.summary.passedStages, 7);

    console.log(`  -> 7-stage Governed Pipeline executed. Attestation Hash: ${pipelineResult.summary.attestationHash.substring(0, 16)}...\n`);

    // Test 4: startEccHttpServer() and REST API endpoints
    console.log('[4/4] Testing startEccHttpServer() and REST API endpoints...');
    const testPort = 8091;
    const server = await engine.startEccHttpServer(testPort, { workspaceRoot });

    try {
        // Test GET /api/status
        const statusRes = await httpGet(`http://127.0.0.1:${testPort}/api/status`);
        assert.strictEqual(statusRes.statusCode, 200);
        const statusJson = JSON.parse(statusRes.body);
        assert.strictEqual(statusJson.serverStatus, 'ONLINE');
        assert.ok(statusJson.liveMetrics);

        // Test GET /api/digital-twin
        const twinRes = await httpGet(`http://127.0.0.1:${testPort}/api/digital-twin`);
        assert.strictEqual(twinRes.statusCode, 200);
        const twinJson = JSON.parse(twinRes.body);
        assert.ok(twinJson.nodes && twinJson.nodes.length >= 5);

        // Test GET /api/technical-debt
        const debtRes = await httpGet(`http://127.0.0.1:${testPort}/api/technical-debt`);
        assert.strictEqual(debtRes.statusCode, 200);
        const debtJson = JSON.parse(debtRes.body);
        assert.ok(typeof debtJson.todosCount === 'number');

        // Test POST /api/execute-governed-pipeline
        const pipeRes = await httpPost(`http://127.0.0.1:${testPort}/api/execute-governed-pipeline`);
        assert.strictEqual(pipeRes.statusCode, 200);
        const pipeJson = JSON.parse(pipeRes.body);
        assert.strictEqual(pipeJson.status, 'PASSED');
        assert.strictEqual(pipeJson.stagesExecuted.length, 7);

        // Test GET /
        const uiRes = await httpGet(`http://127.0.0.1:${testPort}/`);
        assert.strictEqual(uiRes.statusCode, 200);
        assert.ok(uiRes.body.includes('EAORCS Enterprise Command Center'));

        console.log('  -> HTTP Server & REST API endpoints verified successfully.\n');
    } finally {
        await engine.stopEccHttpServer();
    }

    console.log('================================================================');
    console.log('  ALL TESTS PASSED SUCCESSFULLY! (EnterpriseCommandCenterEngine)');
    console.log('================================================================');
}

runEnterpriseCommandCenterEngineTests().then(() => {
    process.exit(0);
}).catch(err => {
    console.error('Test failure:', err);
    process.exit(1);
});
