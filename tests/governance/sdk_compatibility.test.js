/******************************************************************************
 * Project        : EAORCS Governance Platform
 * Module         : API & SDK Governance Engine
 * File           : sdk_compatibility.test.js
 * Version        : 2026.1.0
 * Author         : Air Roofers Architecture Authority / Ujomor Systems
 * Organization   : Ujomor Systems & Air Roofers
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | PUBLIC | INTERNAL
 *
 * Governance:
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Ujomor Systems & Air Roofers
 * All Rights Reserved.
 ******************************************************************************/

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { SdkCompatibilityEngine, EXPECTED_VERIFIER_SURFACE } = require('../../engine/governance/SdkCompatibilityEngine');

function runSdkCompatibilityTests() {
    const results = [];
    const sdkPath = path.resolve(__dirname, '../../sdk/verifier.cjs');

    // Test 1: SDK surface check against sdk/verifier.cjs
    try {
        const surfaceResult = SdkCompatibilityEngine.checkSdkSurface(sdkPath);
        assert.strictEqual(surfaceResult.valid, true, `SDK surface check against sdk/verifier.cjs failed. Missing exports: ${surfaceResult.missingExports.join(', ')}`);
        results.push({ test: 'SDK surface check against sdk/verifier.cjs', passed: true });
    } catch (err) {
        results.push({ test: 'SDK surface check against sdk/verifier.cjs', passed: false, error: err.message });
    }

    // Test 2: Protocol freeze: same surface passes, removed function detected as violation
    try {
        const validSurface = {
            verify: { type: 'function', paramCount: 2, exists: true },
            verifyOffline: { type: 'function', paramCount: 2, exists: true },
            getVersion: { type: 'function', paramCount: 0, exists: true }
        };

        const freezePass = SdkCompatibilityEngine.checkProtocolFreeze(validSurface, EXPECTED_VERIFIER_SURFACE);
        assert.strictEqual(freezePass.frozen, true, 'Identical surface must pass protocol freeze check');
        assert.strictEqual(freezePass.violations.length, 0);

        const brokenSurface = {
            verify: { type: 'function', paramCount: 2, exists: true },
            // verifyOffline is missing!
            getVersion: { type: 'function', paramCount: 0, exists: true }
        };

        const freezeFail = SdkCompatibilityEngine.checkProtocolFreeze(brokenSurface, EXPECTED_VERIFIER_SURFACE);
        assert.strictEqual(freezeFail.frozen, false, 'Surface missing function must fail protocol freeze check');
        assert.ok(freezeFail.violations.some(v => v.includes('verifyOffline')), 'Violations must cite missing verifyOffline');
        results.push({ test: 'Protocol freeze check (valid surface passes, removed function detected)', passed: true });
    } catch (err) {
        results.push({ test: 'Protocol freeze check (valid surface passes, removed function detected)', passed: false, error: err.message });
    }

    // Test 3: Compatibility report generation
    try {
        const sampleCheck = SdkCompatibilityEngine.checkSdkSurface(sdkPath);
        const sampleFreeze = SdkCompatibilityEngine.checkProtocolFreeze(sampleCheck.surface);

        const reportData = {
            valid: sampleCheck.valid,
            frozen: sampleFreeze.frozen,
            details: sampleCheck.details,
            violations: sampleFreeze.violations
        };

        const reportMarkdown = SdkCompatibilityEngine.generateCompatibilityReport(reportData);
        assert.ok(typeof reportMarkdown === 'string' && reportMarkdown.length > 50, 'Report generator must return non-empty markdown string');
        assert.ok(reportMarkdown.includes('SDK Backward Compatibility & Protocol Freeze Report'), 'Report must contain header title');
        results.push({ test: 'Compatibility report generation', passed: true });
    } catch (err) {
        results.push({ test: 'Compatibility report generation', passed: false, error: err.message });
    }

    return results;
}

if (require.main === module) {
    const res = runSdkCompatibilityTests();
    console.log(res);
}

module.exports = { runSdkCompatibilityTests };
