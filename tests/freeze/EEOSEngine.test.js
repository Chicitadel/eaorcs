/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Enterprise Executive Operating System (EEOS) Test Suite
 * File           : EEOSEngine.test.js
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
 * CORP: Subsystem 1 — EEOSEngine & Server REST API Verification
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
const http = require('http');
const path = require('path');
const EEOSEngine = require('../../engine/enterprise/EEOSEngine');

function httpRequest(urlStr, options = {}, body = null) {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(urlStr);
        const reqOpts = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port,
            path: parsedUrl.pathname + parsedUrl.search,
            method: options.method || 'GET',
            headers: options.headers || {}
        };

        const req = http.request(reqOpts, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk.toString(); });
            res.on('end', () => {
                let parsed = null;
                try { parsed = JSON.parse(data); } catch (e) { parsed = data; }
                resolve({ statusCode: res.statusCode, headers: res.headers, body: parsed });
            });
        });

        req.on('error', reject);
        if (body) {
            req.write(typeof body === 'string' ? body : JSON.stringify(body));
        }
        req.end();
    });
}

async function testEEOSEngine() {
    console.log('[TEST] Starting EEOSEngine Test Verification...');

    const workspaceRoot = path.resolve(__dirname, '../../');
    const engine = new EEOSEngine({ workspace: workspaceRoot, port: 8090, role: 'Architect' });

    // Test 1: Workspace Aggregation (5 Workspaces)
    console.log('[TEST] 1. Verifying Workspace State Aggregation...');
    const state = engine.aggregateWorkspaceState();
    assert.ok(state.workspaces, 'workspaces container should exist');

    const ws = state.workspaces;
    assert.ok(ws.missionControl, '1. Mission Control workspace missing');
    assert.ok(ws.federationExplorer, '2. Federation Explorer workspace missing');
    assert.ok(ws.repositoryExplorer, '3. Repository Explorer workspace missing');
    assert.ok(ws.executionStudio, '4. Execution Studio workspace missing');
    assert.ok(ws.digitalTwinStudio, '5. Digital Twin Studio workspace missing');

    assert.strictEqual(ws.missionControl.title, '1. Mission Control');
    assert.strictEqual(ws.federationExplorer.title, '2. Federation Explorer');
    assert.strictEqual(ws.repositoryExplorer.title, '3. Repository Explorer');
    assert.strictEqual(ws.executionStudio.title, '4. Execution Studio');
    assert.strictEqual(ws.digitalTwinStudio.title, '5. Digital Twin Studio');
    console.log('[PASS] All 5 workspaces aggregated successfully.');

    // Test 2: Role-based Views (6 Roles)
    console.log('[TEST] 2. Verifying 6 Role-Based Views...');
    const roles = ['Architect', 'Developer', 'QA', 'Operations', 'Executive', 'Customer'];

    roles.forEach(role => {
        const view = engine.getRoleView(role);
        assert.strictEqual(view.requestedRole, role);
        assert.strictEqual(view.viewProfile.role, role);
        assert.ok(view.viewProfile.primaryWorkspace, `Primary workspace for ${role} should be defined`);
        assert.ok(Array.isArray(view.viewProfile.focusedPanels), `Focused panels for ${role} should be array`);
        assert.ok(Array.isArray(view.viewProfile.actionPermissions), `Permissions for ${role} should be array`);
    });
    console.log('[PASS] All 6 role-based views verified.');

    // Test 3: Historical Trends Computation
    console.log('[TEST] 3. Verifying Historical Readiness Trends...');
    const trends = engine.computeHistoricalTrends();
    assert.ok(Array.isArray(trends.readinessTrend), 'readinessTrend array missing');
    assert.ok(Array.isArray(trends.techDebtReduction), 'techDebtReduction array missing');
    assert.strictEqual(trends.summary.initialReadiness, 0.78);
    assert.ok(trends.readinessTrend.length >= 5, 'Should have at least 5 readiness milestones');
    console.log('[PASS] Historical readiness trends computed.');

    // Test 4: Universal Search Index
    console.log('[TEST] 4. Verifying Universal Search Index (Ctrl+K)...');
    const index = engine.buildSearchIndex();
    assert.ok(Array.isArray(index), 'Search index should be array');
    assert.ok(index.length > 0, 'Search index should contain items');

    const searchRes = engine.search('Mission Control');
    assert.ok(searchRes.totalResults > 0, 'Search for Mission Control should return results');
    assert.ok(searchRes.results.length > 0, 'Search results list should not be empty');

    const apiSearch = engine.search('status');
    assert.ok(apiSearch.totalResults > 0, 'Search for status should return results');
    console.log('[PASS] Universal search index verified.');

    // Test 5: HTTP Server & REST API Endpoints on http://localhost:8090
    console.log('[TEST] 5. Verifying Native HTTP Server & REST API Endpoints...');
    const serverControl = await engine.startServer(8090);
    assert.strictEqual(serverControl.status, 'RUNNING');
    assert.strictEqual(serverControl.port, 8090);

    const baseUrl = 'http://localhost:8090';

    try {
        // Endpoint 1: /api/eeos/status
        console.log(' - Testing GET /api/eeos/status...');
        const statusRes = await httpRequest(`${baseUrl}/api/eeos/status`);
        assert.strictEqual(statusRes.statusCode, 200);
        assert.strictEqual(statusRes.body.status, 'SUCCESS');
        assert.ok(statusRes.body.state.workspaces.missionControl);

        // Endpoint 2: /api/eeos/intelligence
        console.log(' - Testing GET /api/eeos/intelligence...');
        const intelRes = await httpRequest(`${baseUrl}/api/eeos/intelligence`);
        assert.strictEqual(intelRes.statusCode, 200);
        assert.strictEqual(intelRes.body.status, 'SUCCESS');
        assert.ok(intelRes.body.analysis.metrics);

        // Endpoint 3: /api/eeos/federation
        console.log(' - Testing GET /api/eeos/federation...');
        const fedRes = await httpRequest(`${baseUrl}/api/eeos/federation`);
        assert.strictEqual(fedRes.statusCode, 200);
        assert.strictEqual(fedRes.body.status, 'SUCCESS');
        assert.strictEqual(fedRes.body.federation.title, '2. Federation Explorer');

        // Endpoint 4: /api/eeos/repository
        console.log(' - Testing GET /api/eeos/repository...');
        const repoRes = await httpRequest(`${baseUrl}/api/eeos/repository`);
        assert.strictEqual(repoRes.statusCode, 200);
        assert.strictEqual(repoRes.body.status, 'SUCCESS');
        assert.strictEqual(repoRes.body.repository.title, '3. Repository Explorer');

        // Endpoint 5: /api/eeos/digital-twin
        console.log(' - Testing GET /api/eeos/digital-twin...');
        const dtRes = await httpRequest(`${baseUrl}/api/eeos/digital-twin`);
        assert.strictEqual(dtRes.statusCode, 200);
        assert.strictEqual(dtRes.body.status, 'SUCCESS');
        assert.strictEqual(dtRes.body.digitalTwin.title, '5. Digital Twin Studio');

        // Endpoint 6: /api/eeos/ai-assistant
        console.log(' - Testing POST /api/eeos/ai-assistant...');
        const aiRes = await httpRequest(`${baseUrl}/api/eeos/ai-assistant`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, { prompt: 'Diagnose platform bottlenecks' });
        assert.strictEqual(aiRes.statusCode, 200);
        assert.strictEqual(aiRes.body.status, 'SUCCESS');
        assert.strictEqual(aiRes.body.assistant.intent, 'BOTTLENECK_DIAGNOSIS');

        // Endpoint 7: /api/eeos/search
        console.log(' - Testing GET /api/eeos/search...');
        const searchApiRes = await httpRequest(`${baseUrl}/api/eeos/search?q=repository`);
        assert.strictEqual(searchApiRes.statusCode, 200);
        assert.strictEqual(searchApiRes.body.status, 'SUCCESS');
        assert.ok(searchApiRes.body.search.totalResults > 0);

        // Endpoint 8: /api/eeos/execute
        console.log(' - Testing POST /api/eeos/execute...');
        const execRes = await httpRequest(`${baseUrl}/api/eeos/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, { command: 'run-simulation' });
        assert.strictEqual(execRes.statusCode, 200);
        assert.strictEqual(execRes.body.status, 'SUCCESS');
        assert.strictEqual(execRes.body.execution.output.status, 'SIMULATION_PASSED');

        console.log('[PASS] All 8 REST API Endpoints verified successfully!');

    } finally {
        await engine.stopServer();
        console.log('[PASS] Server stopped cleanly.');
    }

    console.log('\n===============================================================');
    console.log(' ALL EEOS ENGINE TESTS PASSED SUCCESSFULLY');
    console.log('===============================================================\n');
}

testEEOSEngine().catch((err) => {
    console.error('[TEST FAIL] EEOSEngine error:', err);
    process.exit(1);
});
