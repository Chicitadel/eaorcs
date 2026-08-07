/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS EEOS CLI & Public Facade Freeze Test
 * File           : eeos_cli_facade.test.js
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
 * CORP: Subsystem 2 — EEOS CLI Launchers & Public Facade
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
const fs = require('fs');
const path = require('path');
const http = require('http');

const EAORCS = require('../../engine/EAORCS');
const eeosLauncher = require('../../bin/commercial/eaorcs_eeos.js');

async function testEEOSFacade() {
    console.log('[Test] Verifying EAORCS.launchEEOS and EAORCS.getEEOSData facade methods...');
    
    assert.strictEqual(typeof EAORCS.launchEEOS, 'function', 'EAORCS.launchEEOS must be a function');
    assert.strictEqual(typeof EAORCS.getEEOSData, 'function', 'EAORCS.getEEOSData must be a function');

    const data = EAORCS.getEEOSData({ workspace: process.cwd(), role: 'LEAD_ENGINEER' });
    assert.strictEqual(data.status, 'ACTIVE', 'Data status should be ACTIVE');
    assert.strictEqual(data.role, 'LEAD_ENGINEER', 'Role should match options');
    assert.ok(data.governance, 'Governance metadata must exist');
    assert.ok(data.readiness, 'Readiness metadata must exist');
    assert.ok(data.commandCenter, 'CommandCenter state must exist');

    console.log('✓ EAORCS EEOS Facade API verified.');
}

function testCLIArgumentParser() {
    console.log('[Test] Verifying CLI argument parsing in eaorcs_eeos.js...');

    const defaults = eeosLauncher.parseArgs([]);
    assert.strictEqual(defaults.port, 8090);
    assert.strictEqual(defaults.role, 'ENTERPRISE_ARCHITECT');
    assert.strictEqual(defaults.autoExecute, false);
    assert.strictEqual(defaults.openBrowser, true);

    const custom = eeosLauncher.parseArgs([
        '-p', '9090',
        '-w', path.resolve(__dirname, '../../'),
        '-r', 'EXECUTIVE',
        '--auto-execute',
        '--no-open'
    ]);
    assert.strictEqual(custom.port, 9090);
    assert.strictEqual(custom.workspace, path.resolve(__dirname, '../../'));
    assert.strictEqual(custom.role, 'EXECUTIVE');
    assert.strictEqual(custom.autoExecute, true);
    assert.strictEqual(custom.openBrowser, false);

    console.log('✓ CLI argument parsing verified.');
}

function testCLIWrapperFilesExist() {
    console.log('[Test] Verifying CLI wrapper file existence on disk...');

    const binDir = path.resolve(__dirname, '../../bin/commercial');
    const jsFile = path.join(binDir, 'eaorcs_eeos.js');
    const cmdFile = path.join(binDir, 'eaorcs_eeos.cmd');
    const bashFile = path.join(binDir, 'eaorcs_eeos');

    assert.ok(fs.existsSync(jsFile), 'eaorcs_eeos.js must exist');
    assert.ok(fs.existsSync(cmdFile), 'eaorcs_eeos.cmd must exist');
    assert.ok(fs.existsSync(bashFile), 'eaorcs_eeos shell script must exist');

    console.log('✓ CLI wrapper files verified.');
}

async function testHTTPServerLaunchAndResponse() {
    console.log('[Test] Verifying EEOS HTTP server startup and endpoint response...');

    const testPort = 8098;
    const serverControl = EAORCS.launchEEOS({
        port: testPort,
        openBrowser: false,
        autoExecute: false,
        role: 'GOVERNANCE_OFFICER'
    });

    assert.ok(serverControl, 'Server control object must be returned');
    assert.strictEqual(serverControl.port, testPort);

    // Make an HTTP GET request to test /api/status endpoint
    const responseData = await new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:${testPort}/api/status`, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve(JSON.parse(body)));
        });
        req.on('error', reject);
    });

    assert.strictEqual(responseData.status, 'ACTIVE');
    assert.ok(responseData.readiness, 'API status response should include readiness data');

    // Close server cleanly
    await serverControl.close();
    console.log('✓ EEOS HTTP server launch and shutdown verified.');
}

async function runAllTests() {
    console.log('==========================================================================');
    console.log(' EAORCS Subsystem 2: EEOS CLI Launchers & Public Facade Test Suite');
    console.log('==========================================================================');
    
    await testEEOSFacade();
    testCLIArgumentParser();
    testCLIWrapperFilesExist();
    await testHTTPServerLaunchAndResponse();

    console.log('==========================================================================');
    console.log(' SUCCESS: All Subsystem 2 tests passed.');
    console.log('==========================================================================');
}

runAllTests().catch(err => {
    console.error('FAIL: Test assertion error:', err);
    process.exit(1);
});
