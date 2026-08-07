/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Subsystem 2 DX CLI Launchers & Browser Terminal Freeze Test
 * File           : eaorcs_subsystem2_dx_cli_terminal.test.js
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
 * CORP: Subsystem 2 — DX CLI Launchers & Browser Terminal Engine
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
const cliLauncher = require('../../bin/commercial/eaorcs_cli.js');
const BrowserTerminalServerEngine = require('../../engine/portal/BrowserTerminalServerEngine');

async function testEAORCSFacadeMethods() {
    console.log('[Test] Verifying EAORCS static facade methods for Subsystem 2...');

    assert.strictEqual(typeof EAORCS.getCommandRegistry, 'function', 'EAORCS.getCommandRegistry must be a function');
    assert.strictEqual(typeof EAORCS.buildCliCommand, 'function', 'EAORCS.buildCliCommand must be a function');
    assert.strictEqual(typeof EAORCS.evaluateCliLicense, 'function', 'EAORCS.evaluateCliLicense must be a function');

    const registry = EAORCS.getCommandRegistry();
    assert.ok(registry.analyze, 'Command registry must contain analyze');
    assert.ok(registry.audit, 'Command registry must contain audit');
    assert.ok(registry.certify, 'Command registry must contain certify');

    const builtCmd = EAORCS.buildCliCommand({ command: 'analyze', tier: 'ENTERPRISE', json: true });
    assert.strictEqual(builtCmd.command, 'analyze');
    assert.ok(builtCmd.commandString.includes('eaorcs_cli analyze'), 'Command string must contain eaorcs_cli analyze');

    const authorizedEval = EAORCS.evaluateCliLicense('analyze', 'FREE');
    assert.strictEqual(authorizedEval.authorized, true, 'Analyze command should be authorized under FREE tier');

    const unauthorizedEval = EAORCS.evaluateCliLicense('certify', 'FREE');
    assert.strictEqual(unauthorizedEval.authorized, false, 'Certify command should NOT be authorized under FREE tier');
    assert.strictEqual(unauthorizedEval.requiredTier, 'ENTERPRISE', 'Certify command requires ENTERPRISE tier');

    console.log('✓ EAORCS static facade methods verified.');
}

function testCLIArgumentParserAndLauncher() {
    console.log('[Test] Verifying eaorcs_cli.js argument parsing and execution...');

    const defaultArgs = cliLauncher.parseArgs([]);
    assert.strictEqual(defaultArgs.tier, 'COMMERCIAL');
    assert.strictEqual(defaultArgs.shell, false);
    assert.strictEqual(defaultArgs.build, false);
    assert.strictEqual(defaultArgs.json, false);

    const customArgs = cliLauncher.parseArgs([
        'build',
        '--shell',
        '--build', 'package_target',
        '--tier', 'ENTERPRISE',
        '--json'
    ]);
    assert.strictEqual(customArgs.command, 'build');
    assert.strictEqual(customArgs.shell, true);
    assert.strictEqual(customArgs.build, true);
    assert.strictEqual(customArgs.buildTarget, 'package_target');
    assert.strictEqual(customArgs.tier, 'ENTERPRISE');
    assert.strictEqual(customArgs.json, true);

    console.log('✓ CLI argument parser verified.');
}

function testCLIWrapperFilesExist() {
    console.log('[Test] Verifying CLI wrapper files existence on disk...');

    const binDir = path.resolve(__dirname, '../../bin/commercial');
    const jsFile = path.join(binDir, 'eaorcs_cli.js');
    const cmdFile = path.join(binDir, 'eaorcs_cli.cmd');
    const bashFile = path.join(binDir, 'eaorcs_cli');

    assert.ok(fs.existsSync(jsFile), 'eaorcs_cli.js must exist on disk');
    assert.ok(fs.existsSync(cmdFile), 'eaorcs_cli.cmd must exist on disk');
    assert.ok(fs.existsSync(bashFile), 'eaorcs_cli bash script must exist on disk');

    console.log('✓ CLI wrapper files verified.');
}

async function testBrowserTerminalRESTEndpoints() {
    console.log('[Test] Verifying BrowserTerminalServerEngine REST endpoints...');

    const testPort = 8097;
    const engine = new BrowserTerminalServerEngine({ port: testPort });
    const serverControl = engine.launchTerminalServer({ port: testPort });

    assert.ok(serverControl, 'Server control object must be returned');

    // Helper function for HTTP GET
    const httpGet = (endpoint) => {
        return new Promise((resolve, reject) => {
            http.get(`http://localhost:${testPort}${endpoint}`, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => resolve({ statusCode: res.statusCode, data: JSON.parse(body) }));
            }).on('error', reject);
        });
    };

    // Helper function for HTTP POST
    const httpPost = (endpoint, payload) => {
        return new Promise((resolve, reject) => {
            const dataString = JSON.stringify(payload);
            const req = http.request(`http://localhost:${testPort}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(dataString)
                }
            }, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => resolve({ statusCode: res.statusCode, data: JSON.parse(body) }));
            });
            req.on('error', reject);
            req.write(dataString);
            req.end();
        });
    };

    // Test /api/cli/commands
    const commandsRes = await httpGet('/api/cli/commands');
    assert.strictEqual(commandsRes.statusCode, 200);
    assert.strictEqual(commandsRes.data.status, 'SUCCESS');
    assert.ok(commandsRes.data.commands.analyze);

    // Test /api/license/matrix
    const matrixRes = await httpGet('/api/license/matrix');
    assert.strictEqual(matrixRes.statusCode, 200);
    assert.strictEqual(matrixRes.data.status, 'SUCCESS');
    assert.ok(matrixRes.data.matrix.ENTERPRISE);

    // Test /api/cli/build
    const buildRes = await httpPost('/api/cli/build', { command: 'audit', tier: 'COMMERCIAL', shell: true });
    assert.strictEqual(buildRes.statusCode, 200);
    assert.strictEqual(buildRes.data.status, 'SUCCESS');
    assert.strictEqual(buildRes.data.build.command, 'audit');

    // Test /api/cli/execute (Authorized)
    const execAuthRes = await httpPost('/api/cli/execute', { command: 'analyze', tier: 'FREE' });
    assert.strictEqual(execAuthRes.statusCode, 200);
    assert.strictEqual(execAuthRes.data.success, true);
    assert.strictEqual(execAuthRes.data.command, 'analyze');

    // Test /api/cli/execute (Unauthorized)
    const execUnauthRes = await httpPost('/api/cli/execute', { command: 'certify', tier: 'FREE' });
    assert.strictEqual(execUnauthRes.statusCode, 403);
    assert.strictEqual(execUnauthRes.data.success, false);
    assert.strictEqual(execUnauthRes.data.error, 'LICENSE_RESTRICTION');

    await serverControl.close();
    console.log('✓ BrowserTerminalServerEngine REST endpoints verified.');
}

async function runAllTests() {
    console.log('==========================================================================');
    console.log(' EAORCS Subsystem 2: DX CLI Launchers & Browser Terminal Engine Test Suite');
    console.log('==========================================================================');

    await testEAORCSFacadeMethods();
    testCLIArgumentParserAndLauncher();
    testCLIWrapperFilesExist();
    await testBrowserTerminalRESTEndpoints();

    console.log('==========================================================================');
    console.log(' SUCCESS: All Subsystem 2 tests passed.');
    console.log('==========================================================================');
}

runAllTests().catch(err => {
    console.error('FAIL: Test assertion error:', err);
    process.exit(1);
});
