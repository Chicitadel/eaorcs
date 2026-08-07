/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Subsystem 2 ECC CLI Launchers Freeze Test
 * File           : eaorcs_ecc_launchers.test.js
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
 * CORP: Stream 2 — CLI Launchers & Execution Controls Test Suite
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
const { spawnSync } = require('child_process');

const eaorcsRoot = path.resolve(__dirname, '../../');
const EAORCS = require(path.join(eaorcsRoot, 'engine', 'EAORCS.js'));
const { parseArgs } = require(path.join(eaorcsRoot, 'bin', 'commercial', 'eaorcs_ecc.js'));

console.log('[TEST] Executing Subsystem 2: ECC CLI Launchers & Execution Controls Freeze Tests...');

// Test 1: Validate file existence & UAIGOS Corporate Headers
console.log('[TEST 1] Verifying file existence and UAIGOS corporate headers...');
const targetFiles = [
    path.join(eaorcsRoot, 'bin', 'commercial', 'eaorcs_ecc.js'),
    path.join(eaorcsRoot, 'bin', 'commercial', 'eaorcs_ecc.cmd'),
    path.join(eaorcsRoot, 'bin', 'commercial', 'eaorcs_ecc'),
    path.join(eaorcsRoot, 'engine', 'operations', 'CommandCenterServerEngine.js')
];

for (const filePath of targetFiles) {
    assert.ok(fs.existsSync(filePath), `File ${path.relative(eaorcsRoot, filePath)} must exist`);
    const content = fs.readFileSync(filePath, 'utf8');
    assert.ok(content.includes('Universal Autonomous AI Governance Operating System'), `File ${path.basename(filePath)} missing UAIGOS header`);
    assert.ok(content.includes('Ujomor Systems & Enterprise Governance'), `File ${path.basename(filePath)} missing author organization`);
}
console.log(' -> All 4 files and UAIGOS headers verified.');

// Test 2: Verify EAORCS.getCommandCenterData()
console.log('[TEST 2] Verifying EAORCS.getCommandCenterData()...');
const data = EAORCS.getCommandCenterData({ workspace: eaorcsRoot });
assert.ok(data, 'getCommandCenterData must return a valid data payload');
assert.strictEqual(data.title, 'EAORCS Enterprise Command Center (ECC)', 'Title must match expected ECC title');
assert.ok(data.commandCenter, 'Data payload must contain commandCenter state');
assert.ok(data.readiness, 'Data payload must contain readiness dashboard');
assert.ok(typeof data.readiness.overallReadinessScore === 'number', 'Overall readiness score must be numeric');
console.log(' -> EAORCS.getCommandCenterData() verified successfully.');

// Test 3: Verify CLI argument parsing
console.log('[TEST 3] Verifying CLI argument parsing flags...');
const parsed = parseArgs(['-p', '9090', '-w', eaorcsRoot, '--auto-execute', '--no-open']);
assert.strictEqual(parsed.port, 9090, 'Port flag must parse correctly');
assert.strictEqual(parsed.workspace, eaorcsRoot, 'Workspace flag must parse correctly');
assert.strictEqual(parsed.autoExecute, true, 'Auto-execute flag must parse correctly');
assert.strictEqual(parsed.openBrowser, false, 'No-open flag must parse correctly');
console.log(' -> CLI argument parser verified.');

// Test 4: Verify EAORCS.launchCommandCenter() HTTP Server
console.log('[TEST 4] Verifying EAORCS.launchCommandCenter() HTTP Server on port 8098...');
async function testServer() {
    const testPort = 8098;
    const serverControl = EAORCS.launchCommandCenter({
        port: testPort,
        workspace: eaorcsRoot,
        openBrowser: false,
        autoExecute: false
    });

    assert.ok(serverControl, 'launchCommandCenter must return server control object');
    assert.strictEqual(serverControl.port, testPort, 'Server control port must match configured port');

    // Wait for server to listen
    await new Promise(resolve => setTimeout(resolve, 150));

    // Fetch /api/health
    const healthRes = await new Promise((resolve, reject) => {
        http.get(`http://localhost:${testPort}/api/health`, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, data: JSON.parse(body) }));
        }).on('error', reject);
    });

    assert.strictEqual(healthRes.statusCode, 200, 'Health endpoint must respond with HTTP 200');
    assert.strictEqual(healthRes.data.status, 'UP', 'Health status must be UP');

    // Fetch /
    const htmlRes = await new Promise((resolve, reject) => {
        http.get(`http://localhost:${testPort}/`, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, body }));
        }).on('error', reject);
    });

    assert.strictEqual(htmlRes.statusCode, 200, 'Root dashboard endpoint must respond with HTTP 200');
    assert.ok(htmlRes.body.includes('EAORCS Enterprise Command Center'), 'HTML dashboard must contain title');

    // Close server
    await serverControl.close();
    console.log(' -> HTTP Server launch, endpoint responses, and graceful closure verified.');
}

// Test 5: Verify CLI launcher binary help output
console.log('[TEST 5] Testing CLI binary `node bin/commercial/eaorcs_ecc.js --help`...');
const cliRes = spawnSync(process.execPath, [path.join(eaorcsRoot, 'bin', 'commercial', 'eaorcs_ecc.js'), '--help'], { cwd: eaorcsRoot });
assert.strictEqual(cliRes.status, 0, 'CLI launcher --help must exit with 0');
assert.ok(cliRes.stdout.toString().includes('EAORCS 2026.3.1-LTS: ENTERPRISE COMMAND CENTER (ECC) LAUNCHER'), 'CLI stdout must present help manual');
console.log(' -> CLI launcher binary help output verified.');

testServer().then(() => {
    console.log('[PASS] Subsystem 2: ECC CLI Launchers Freeze Tests completed successfully!');
}).catch(err => {
    console.error('[FAIL] Test failed:', err);
    process.exit(1);
});
