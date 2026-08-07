/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Subsystem 2 Session CLI & REST Verification Test Suite
 * File           : eaorcs_subsystem2_session_cli_rest.test.js
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
 * CORP: Subsystem 2 — Session CLI Launchers & REST API Endpoints
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
const http = require('http');

const EAORCS = require('../../engine/EAORCS');
const BrowserTerminalServerEngine = require('../../engine/portal/BrowserTerminalServerEngine');
const sessionCli = require('../../bin/commercial/eaorcs_session.js');

const root = path.resolve(__dirname, '../../');

async function runSubsystem2Tests() {
    console.log('[TEST] EAORCS Subsystem 2 Session CLI Launchers & REST Endpoints Suite running...');

    // 1. EAORCS Facade methods
    console.log('  -> Testing EAORCS Facade Session methods...');
    const sessionStatus = EAORCS.getDualModeSession({ workspace: root });
    assert.ok(sessionStatus, 'EAORCS.getDualModeSession must return status object');
    assert.ok(sessionStatus.status, 'Status field must exist');
    assert.ok(sessionStatus.badgeState, 'badgeState field must exist');

    const authResult = EAORCS.authenticateSession({ user: 'facade-user', tier: 'ENTERPRISE', workspace: root });
    assert.strictEqual(authResult.authenticated, true, 'EAORCS.authenticateSession must return authenticated: true');
    assert.strictEqual(authResult.user, 'facade-user');
    assert.strictEqual(authResult.tier, 'ENTERPRISE');
    assert.ok(authResult.token, 'Session token must be returned');
    console.log('    ✓ EAORCS Facade Session methods passed.');

    // 2. BrowserTerminalServerEngine REST Endpoints
    console.log('  -> Testing BrowserTerminalServerEngine REST endpoints...');
    const port = 8098;
    const serverEngine = new BrowserTerminalServerEngine({ workspace: root, port });
    const controller = serverEngine.launchTerminalServer({ port, workspace: root });

    const httpGet = (urlPath) => new Promise((resolve, reject) => {
        http.get(`http://localhost:${port}${urlPath}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
                catch (e) { resolve({ status: res.statusCode, raw: data }); }
            });
        }).on('error', reject);
    });

    const httpPost = (urlPath, bodyObj) => new Promise((resolve, reject) => {
        const payload = JSON.stringify(bodyObj);
        const req = http.request(`http://localhost:${port}${urlPath}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
                catch (e) { resolve({ status: res.statusCode, raw: data }); }
            });
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
    });

    // /api/session/status
    const resStatus = await httpGet('/api/session/status');
    assert.strictEqual(resStatus.status, 200);
    assert.strictEqual(resStatus.data.status, 'SUCCESS');

    // /api/session/authenticate
    const resAuth = await httpPost('/api/session/authenticate', { user: 'rest-user', tier: 'COMMERCIAL' });
    assert.strictEqual(resAuth.status, 200);
    assert.strictEqual(resAuth.data.status, 'SUCCESS');
    assert.strictEqual(resAuth.data.authentication.user, 'rest-user');
    const token = resAuth.data.authentication.token;

    // /api/session/validate
    const resVal = await httpPost('/api/session/validate', { token });
    assert.strictEqual(resVal.status, 200);
    assert.strictEqual(resVal.data.status, 'SUCCESS');
    assert.strictEqual(resVal.data.validation.valid, true);

    // /api/session/offline-token
    const resOffline = await httpGet('/api/session/offline-token');
    assert.strictEqual(resOffline.status, 200);
    assert.strictEqual(resOffline.data.status, 'SUCCESS');
    assert.ok(resOffline.data.offlineToken.token);

    // /api/session/trust
    const resTrust = await httpGet('/api/session/trust?provenance=Project%20Local');
    assert.strictEqual(resTrust.status, 200);
    assert.strictEqual(resTrust.data.status, 'SUCCESS');
    assert.strictEqual(resTrust.data.trust.trusted, true);

    await controller.close();
    console.log('    ✓ All 5 session REST endpoints verified successfully.');

    // 3. Session CLI Launcher CLI parsing & execution
    console.log('  -> Testing Session CLI Launcher flags & actions...');
    
    const statusArgs = sessionCli.parseArgs(['--status', '--json']);
    assert.strictEqual(statusArgs.action, 'status');
    assert.strictEqual(statusArgs.json, true);

    const loginArgs = sessionCli.parseArgs(['--login', '--tier', 'SOVEREIGN', '--user', 'operator-x']);
    assert.strictEqual(loginArgs.action, 'login');
    assert.strictEqual(loginArgs.tier, 'SOVEREIGN');
    assert.strictEqual(loginArgs.user, 'operator-x');

    const validateArgs = sessionCli.parseArgs(['--validate', '--token', token]);
    assert.strictEqual(validateArgs.action, 'validate');
    assert.strictEqual(validateArgs.token, token);

    const offlineArgs = sessionCli.parseArgs(['--offline-token']);
    assert.strictEqual(offlineArgs.action, 'offline-token');

    const trustArgs = sessionCli.parseArgs(['--trust', '--provenance', 'Project Local']);
    assert.strictEqual(trustArgs.action, 'trust');

    const helpRes = await sessionCli.run(['--help']);
    assert.strictEqual(helpRes.help, true);

    const runLoginRes = await sessionCli.run(['login', '-u', 'cli-run-user', '-t', 'COMMERCIAL', '-j']);
    assert.strictEqual(runLoginRes.result.authenticated, true);
    assert.strictEqual(runLoginRes.result.user, 'cli-run-user');

    console.log('    ✓ Session CLI Launcher tests passed.');

    console.log('================================================================');
    console.log('  ✓ Subsystem 2 Session CLI & REST Test Suite PASSED');
    console.log('================================================================');
}

if (require.main === module) {
    runSubsystem2Tests().catch(err => {
        console.error('Subsystem 2 Test Error:', err);
        process.exit(1);
    });
}

module.exports = runSubsystem2Tests;
