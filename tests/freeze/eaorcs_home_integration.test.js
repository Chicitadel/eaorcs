/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Commercial Home Launcher & Facade Integration Test
 * File           : eaorcs_home_integration.test.js
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
 * CORP: Subsystem 2 — Home CLI Launchers & Facade Integration
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
const EAORCS = require('../../engine/EAORCS');
const homeLauncher = require('../../bin/commercial/eaorcs_home.js');

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

async function runTests() {
    console.log('[TEST] Starting Subsystem 2: EAORCS Home Integration Verification...');
    const workspaceRoot = path.resolve(__dirname, '../../');
    const testPort = 8097;

    // Test 1: EAORCS.getReportHistory(options)
    console.log('[TEST] 1. Verifying EAORCS.getReportHistory...');
    const history = EAORCS.getReportHistory({ workspace: workspaceRoot });
    assert.ok(Array.isArray(history), 'Report history should be an array');
    console.log('[PASS] EAORCS.getReportHistory returned valid array.');

    // Test 2: EAORCS.resetWorkspace(options)
    console.log('[TEST] 2. Verifying EAORCS.resetWorkspace...');
    const resetResult = EAORCS.resetWorkspace({ workspace: workspaceRoot });
    assert.strictEqual(resetResult.success, true, 'resetWorkspace should return success: true');
    assert.strictEqual(resetResult.action, 'resetWorkspaceState');
    console.log('[PASS] EAORCS.resetWorkspace completed successfully.');

    // Test 3: EAORCS.launchHome(options) and REST endpoints
    console.log('[TEST] 3. Verifying EAORCS.launchHome HTTP Server...');
    const serverControl = EAORCS.launchHome({
        port: testPort,
        workspace: workspaceRoot,
        openBrowser: false
    });

    assert.ok(serverControl, 'Server control object should be returned');
    assert.strictEqual(serverControl.port, testPort);
    assert.strictEqual(serverControl.url, `http://localhost:${testPort}/home`);

    try {
        const baseUrl = `http://localhost:${testPort}`;

        // Endpoint /home
        console.log(' - Testing GET /home...');
        const homeRes = await httpRequest(`${baseUrl}/home`);
        assert.strictEqual(homeRes.statusCode, 200);
        assert.ok(typeof homeRes.body === 'string', 'Home page should return HTML string');
        assert.ok(homeRes.body.includes('EAORCS Home Application'), 'HTML must contain title');

        // Endpoint /api/status
        console.log(' - Testing GET /api/status...');
        const statusRes = await httpRequest(`${baseUrl}/api/status`);
        assert.strictEqual(statusRes.statusCode, 200);
        assert.strictEqual(statusRes.body.status, 'ACTIVE');
        assert.strictEqual(statusRes.body.title, 'EAORCS Commercial Home Application');

        // Endpoint /api/reports
        console.log(' - Testing GET /api/reports...');
        const reportsRes = await httpRequest(`${baseUrl}/api/reports`);
        assert.strictEqual(reportsRes.statusCode, 200);
        assert.strictEqual(reportsRes.body.status, 'SUCCESS');
        assert.ok(Array.isArray(reportsRes.body.reports));

        // Endpoint /api/reset
        console.log(' - Testing POST /api/reset...');
        const resetApiRes = await httpRequest(`${baseUrl}/api/reset`, { method: 'POST' });
        assert.strictEqual(resetApiRes.statusCode, 200);
        assert.strictEqual(resetApiRes.body.success, true);

        // Endpoint /api/health
        console.log(' - Testing GET /api/health...');
        const healthRes = await httpRequest(`${baseUrl}/api/health`);
        assert.strictEqual(healthRes.statusCode, 200);
        assert.strictEqual(healthRes.body.status, 'UP');

        console.log('[PASS] All Home HTTP server endpoints verified.');
    } finally {
        await serverControl.close();
        console.log('[PASS] Server shut down cleanly.');
    }

    // Test 4: CLI launcher parsing and help
    console.log('[TEST] 4. Verifying CLI launcher eaorcs_home.js...');
    const parsedArgs = homeLauncher.parseArgs(['-p', '8099', '-w', workspaceRoot, '--no-open']);
    assert.strictEqual(parsedArgs.port, 8099);
    assert.strictEqual(parsedArgs.workspace, workspaceRoot);
    assert.strictEqual(parsedArgs.openBrowser, false);

    console.log('[PASS] CLI launcher argument parsing verified.');

    console.log('\n===============================================================');
    console.log(' ALL SUB SYSTEM 2 HOME INTEGRATION TESTS PASSED SUCCESSFULLY');
    console.log('===============================================================\n');
}

runTests().catch((err) => {
    console.error('[TEST FAIL] Error in Home Integration test:', err);
    process.exit(1);
});
