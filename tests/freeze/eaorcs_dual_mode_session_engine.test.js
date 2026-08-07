/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Test Suite
 * File           : eaorcs_dual_mode_session_engine.test.js
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
 * CORP: Subsystem 1 — Dual-Mode Session & Security Engine Test Suite
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
const os = require('os');
const DualModeSessionEngine = require('../../engine/security/DualModeSessionEngine');

async function runTests() {
    console.log('================================================================');
    console.log('  EAORCS FREEZE TEST: DUAL-MODE SESSION & SECURITY ENGINE');
    console.log('================================================================\n');

    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'eaorcs-session-test-'));
    const tempCachePath = path.join(tempDir, '.governance', 'session.cache.json');

    try {
        const engine = new DualModeSessionEngine({
            baseDir: tempDir,
            cachePath: tempCachePath,
            secretKey: 'test-hmac-secret-key-2026'
        });

        // 1. Test Revalidation Policies per Tier
        console.log('[Test 1] Testing Revalidation Policies per Tier...');
        const commPolicy = engine.getRevalidationPolicy('Community');
        assert.strictEqual(commPolicy.revalidationDays, 7);
        assert.strictEqual(commPolicy.isPerpetual, false);

        const profPolicy = engine.getRevalidationPolicy('Professional');
        assert.strictEqual(profPolicy.revalidationDays, 30);
        assert.strictEqual(profPolicy.isPerpetual, false);

        const entPolicy = engine.getRevalidationPolicy('Enterprise');
        assert.strictEqual(entPolicy.revalidationDays, 90);
        assert.strictEqual(entPolicy.isPerpetual, false);

        const sovPolicy = engine.getRevalidationPolicy('Sovereign');
        assert.strictEqual(sovPolicy.revalidationDays, Infinity);
        assert.strictEqual(sovPolicy.isPerpetual, true);
        console.log('  ✔ Tier policies verified (7d, 30d, 90d, Sovereign Perpetual)');

        // 2. Test Trust Provenance Evaluator
        console.log('\n[Test 2] Testing Trust Provenance Evaluator...');
        assert.strictEqual(engine.evaluateTrustProvenance('Project Local'), 'Project Local: Verified');
        assert.strictEqual(engine.evaluateTrustProvenance('Linked Repo'), 'Linked Repo: Verified');
        assert.strictEqual(engine.evaluateTrustProvenance('External'), 'External: Unverified');
        assert.strictEqual(engine.evaluateTrustProvenance(tempDir), 'Project Local: Verified');
        console.log('  ✔ Trust provenance statuses verified');

        // 3. Test Session Authentication & Token Generation
        console.log('\n[Test 3] Testing Offline Token Issuance & Cache Persistence...');
        const authResult = engine.authenticateSession({
            userId: 'user_dev_01',
            orgId: 'org_acme',
            tier: 'Enterprise',
            provenance: 'Project Local'
        });

        assert.strictEqual(authResult.status, 'AUTHENTICATED');
        assert.strictEqual(authResult.tier, 'Enterprise');
        assert.strictEqual(authResult.trustProvenance, 'Project Local: Verified');
        assert.ok(authResult.token);
        assert.strictEqual(authResult.token.split('.').length, 3);

        // Verify Cache file exists and contains session
        assert.strictEqual(fs.existsSync(tempCachePath), true);
        const cacheContent = engine.loadCache();
        assert.ok(cacheContent.sessions[authResult.sessionId]);
        assert.strictEqual(cacheContent.sessions[authResult.sessionId].userId, 'user_dev_01');
        console.log('  ✔ Token issuance & offline cache persistence verified');

        // 4. Test Offline Token Validation
        console.log('\n[Test 4] Testing Offline Token Validation...');
        const valResult = engine.validateOfflineToken(authResult.token);
        assert.strictEqual(valResult.valid, true);
        assert.strictEqual(valResult.reason, 'TOKEN_VERIFIED');
        assert.strictEqual(valResult.payload.userId, 'user_dev_01');
        assert.strictEqual(valResult.payload.tier, 'Enterprise');
        console.log('  ✔ Valid token verification succeeded');

        // 5. Test Sovereign Air-Gapped Perpetual Token
        console.log('\n[Test 5] Testing Sovereign Air-Gapped Perpetual Token...');
        const sovAuth = engine.authenticateSession({
            userId: 'sec_admin',
            tier: 'Sovereign',
            provenance: 'Linked Repo'
        });
        assert.strictEqual(sovAuth.revalidationPolicy.isPerpetual, true);
        const sovVal = engine.validateOfflineToken(sovAuth.token);
        assert.strictEqual(sovVal.valid, true);
        assert.strictEqual(sovVal.isPerpetual, true);
        console.log('  ✔ Sovereign perpetual token verification succeeded');

        // 6. Test Tampered Signature Detection
        console.log('\n[Test 6] Testing Tampered Token Detection...');
        const parts = authResult.token.split('.');
        const tamperedToken = `${parts[0]}.${parts[1]}.badsignature123`;
        const tamperedResult = engine.validateOfflineToken(tamperedToken);
        assert.strictEqual(tamperedResult.valid, false);
        assert.strictEqual(tamperedResult.reason, 'INVALID_CRYPTOGRAPHIC_SIGNATURE');
        console.log('  ✔ Tampered token correctly rejected');

        // 7. Test Expired Token Detection
        console.log('\n[Test 7] Testing Expired Token Handling...');
        const expAuth = engine.authenticateSession({
            userId: 'exp_user',
            tier: 'Community',
            customDurationMs: -1000 // force immediate expiration
        });
        const expResult = engine.validateOfflineToken(expAuth.token);
        assert.strictEqual(expResult.valid, false);
        assert.strictEqual(expResult.reason, 'TOKEN_EXPIRED');
        console.log('  ✔ Expired token correctly rejected');

        // 8. Test Cache Operations
        console.log('\n[Test 8] Testing Cache Clear...');
        engine.clearCache();
        assert.strictEqual(fs.existsSync(tempCachePath), false);
        console.log('  ✔ Cache clearing verified');

        console.log('\n================================================================');
        console.log('  ALL DUAL-MODE SESSION ENGINE TESTS PASSED SUCCESSFULLY!  ');
        console.log('================================================================');
    } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
}

runTests().catch(err => {
    console.error('Test execution failed:', err);
    process.exit(1);
});
