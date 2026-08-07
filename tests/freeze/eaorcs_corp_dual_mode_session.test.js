/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Dual-Mode Session Certification Test Suite
 * File           : eaorcs_corp_dual_mode_session.test.js
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
 * CORP: Subsystem 4 — Dual-Mode Master Certification & Packaging
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

const DualModeSessionEngine = require('../../engine/session/DualModeSessionEngine');
const BrowserTerminalServerEngine = require('../../engine/portal/BrowserTerminalServerEngine');
const sessionCli = require('../../bin/commercial/eaorcs_session.js');

const root = path.resolve(__dirname, '../../');
const tmpCacheFile = path.join(root, 'tmp', `test_session_cache_${Date.now()}.json`);

async function runDualModeSessionTests() {
    console.log('[TEST] EAORCS Dual-Mode Session Suite running...');

    // 1. DualModeSessionEngine Unit Tests
    console.log('  -> Testing DualModeSessionEngine...');
    const sessionEngine = new DualModeSessionEngine({
        workspace: root,
        cacheFilePath: tmpCacheFile,
        tier: 'COMMERCIAL',
        mode: 'OFFLINE_FIRST'
    });

    // 1.1 Offline-first execution & HMAC-SHA256 Token Generation
    console.log('    -> Testing HMAC-SHA256 Session Token Generation & Verification...');
    const tokenObj = sessionEngine.generateSessionToken({ user: 'auditor-01', tier: 'ENTERPRISE' });
    assert.ok(tokenObj.token, 'Token string must be returned');
    assert.ok(tokenObj.token.startsWith('EAORCS-SESS.'), 'Token must have correct prefix');
    assert.strictEqual(tokenObj.tier, 'ENTERPRISE', 'Token tier must be ENTERPRISE');

    const verifyValid = sessionEngine.verifySessionToken(tokenObj.token);
    assert.strictEqual(verifyValid.valid, true, 'Generated token must verify cleanly');
    assert.strictEqual(verifyValid.payload.user, 'auditor-01', 'Verified payload user must match');

    // Tampered token test
    const tamperedToken = tokenObj.token.slice(0, -4) + 'abcd';
    const verifyTampered = sessionEngine.verifySessionToken(tamperedToken);
    assert.strictEqual(verifyTampered.valid, false, 'Tampered token verification must fail');
    assert.strictEqual(verifyTampered.reason, 'SIGNATURE_MISMATCH', 'Failure reason must be SIGNATURE_MISMATCH');

    // 1.2 Session Cache Serialization & Deserialization
    console.log('    -> Testing Session Cache Serialization & Deserialization...');
    const serResult = sessionEngine.serializeSessionCache(tokenObj);
    assert.strictEqual(serResult.success, true, 'Session cache serialization must succeed');
    assert.ok(fs.existsSync(tmpCacheFile), 'Cache file must exist on disk');

    const desSession = sessionEngine.deserializeSessionCache();
    assert.ok(desSession, 'Deserialized session cache must return payload');
    assert.strictEqual(desSession.session.sessionId, tokenObj.sessionId, 'Deserialized session ID must match');
    assert.strictEqual(desSession.session.isValid, true, 'Deserialized session must be valid');

    // 1.3 Tier Revalidation Policies
    console.log('    -> Testing Tier Revalidation Policies...');
    const revalOffline = sessionEngine.evaluateTierRevalidation(desSession, { mode: 'OFFLINE_FIRST' });
    assert.strictEqual(revalOffline.revalidated, true, 'Offline revalidation must succeed for cached tier');
    assert.strictEqual(revalOffline.tier, 'ENTERPRISE', 'Revalidated tier must match cached tier');
    assert.strictEqual(revalOffline.status, 'OFFLINE_REVALIDATED');

    const revalOnline = sessionEngine.evaluateTierRevalidation(desSession, { mode: 'ONLINE' });
    assert.strictEqual(revalOnline.revalidated, true, 'Online revalidation must succeed for valid HMAC token');
    assert.strictEqual(revalOnline.tier, 'ENTERPRISE');

    // 1.4 Trust Provenance Evaluation
    console.log('    -> Testing Trust Provenance Evaluation...');
    const trust = sessionEngine.evaluateTrustProvenance(desSession);
    assert.strictEqual(trust.trusted, true, 'Trust evaluation must yield trusted status');
    assert.ok(trust.trustScore >= 70, `Trust score should be >= 70 (got ${trust.trustScore})`);
    assert.ok(trust.provenanceHash, 'Trust evaluation must return provenance hash');

    // 1.5 UI Session Badge State
    console.log('    -> Testing UI Session Badge State...');
    const badge = sessionEngine.getBadgeState(desSession);
    assert.ok(badge.label.includes('ENTERPRISE'), 'Badge label must contain tier');
    assert.strictEqual(badge.color, '#8250df', 'ENTERPRISE tier color must be #8250df');
    assert.strictEqual(badge.icon, 'shield-check');
    assert.ok(badge.tooltip.includes('Trust'), 'Badge tooltip must contain trust info');

    console.log('    ✓ DualModeSessionEngine unit tests passed.');

    // 2. BrowserTerminalServerEngine Session Endpoints Tests
    console.log('  -> Testing BrowserTerminalServerEngine /api/session/* endpoints...');
    const testPort = 8097;
    const serverEngine = new BrowserTerminalServerEngine({ workspace: root, port: testPort });
    const controller = serverEngine.launchTerminalServer({ port: testPort, workspace: root });

    // Helper for HTTP GET
    const httpGet = (urlPath) => new Promise((resolve, reject) => {
        http.get(`http://localhost:${testPort}${urlPath}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
                catch (e) { resolve({ status: res.statusCode, raw: data }); }
            });
        }).on('error', reject);
    });

    // Helper for HTTP POST
    const httpPost = (urlPath, bodyObj) => new Promise((resolve, reject) => {
        const payload = JSON.stringify(bodyObj);
        const req = http.request(`http://localhost:${testPort}${urlPath}`, {
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

    // 2.1 /api/session/status endpoint
    const statusRes = await httpGet('/api/session/status');
    assert.strictEqual(statusRes.status, 200, '/api/session/status status code must be 200');
    assert.strictEqual(statusRes.data.status, 'SUCCESS');
    assert.ok(statusRes.data.session.badgeState, 'Session status payload must include badgeState');

    // 2.2 /api/session/authenticate endpoint (GET)
    const authGetRes = await httpGet('/api/session/authenticate?user=cli-user&tier=COMMERCIAL');
    assert.strictEqual(authGetRes.status, 200, '/api/session/authenticate status code must be 200');
    assert.strictEqual(authGetRes.data.status, 'SUCCESS');
    assert.strictEqual(authGetRes.data.authentication.user, 'cli-user');
    assert.strictEqual(authGetRes.data.authentication.tier, 'COMMERCIAL');

    // 2.3 /api/session/authenticate endpoint (POST)
    const authPostRes = await httpPost('/api/session/authenticate', { user: 'post-user', tier: 'ENTERPRISE' });
    assert.strictEqual(authPostRes.status, 200, '/api/session/authenticate POST status code must be 200');
    assert.strictEqual(authPostRes.data.status, 'SUCCESS');
    assert.strictEqual(authPostRes.data.authentication.user, 'post-user');
    assert.strictEqual(authPostRes.data.authentication.tier, 'ENTERPRISE');

    await controller.close();
    console.log('    ✓ BrowserTerminalServerEngine session REST endpoints passed.');

    // 3. Session CLI Launcher Tests (eaorcs_session.js)
    console.log('  -> Testing Session CLI Launcher (bin/commercial/eaorcs_session.js)...');
    const parsedArgs = sessionCli.parseArgs(['authenticate', '--user', 'test-operator', '--tier', 'ENTERPRISE', '-j']);
    assert.strictEqual(parsedArgs.command, 'authenticate');
    assert.strictEqual(parsedArgs.user, 'test-operator');
    assert.strictEqual(parsedArgs.tier, 'ENTERPRISE');
    assert.strictEqual(parsedArgs.json, true);

    console.log('    ✓ Session CLI Launcher unit tests passed.');

    // Clean up temporary test cache file
    if (fs.existsSync(tmpCacheFile)) {
        try { fs.unlinkSync(tmpCacheFile); } catch (e) {}
    }

    console.log('================================================================');
    console.log('  ✓ EAORCS Dual-Mode Session Suite PASSED');
    console.log('================================================================');
}

if (require.main === module) {
    runDualModeSessionTests().catch(err => {
        console.error('Dual-Mode Session Test Error:', err);
        process.exit(1);
    });
}

module.exports = runDualModeSessionTests;
