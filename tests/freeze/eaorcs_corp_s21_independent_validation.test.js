/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Independent Validation Tests
 * File           : eaorcs_corp_s21_independent_validation.test.js
 * Version        : 2026.3.1-LTS
 * Author         : Ujomor Systems & Enterprise Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-07
 * Last Modified  : 2026-08-07
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance: Security Reviewed | Architecture Controlled | Protocol Frozen
 * CORP: S21 — Independent Validation (DEC-11)
 * Standards: ISO 27001 | SOC 2 | OWASP ASVS | NIST
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

const assert = require('assert');
const IndependentValidationEngine = require('../../engine/validation/IndependentValidationEngine');

const engine = new IndependentValidationEngine();

function testCleanRoomInstall() {
    const res = engine.runCleanRoomInstallation();
    assert.strictEqual(typeof res.passed, 'boolean');
    assert.ok(Array.isArray(res.steps));
    console.log('✓ testCleanRoomInstall');
}

function testReproducibleBuildVerification() {
    const deterministicFn = () => ({ a: 1, b: 2 });
    const res1 = engine.runReproducibleBuildVerification(deterministicFn, 3);
    assert.strictEqual(res1.agreementPct, 100);
    assert.strictEqual(res1.passed, true);

    const nonDeterministicFn = () => ({ val: Math.random() });
    const res2 = engine.runReproducibleBuildVerification(nonDeterministicFn, 3);
    assert.strictEqual(res2.passed, false);
    
    console.log('✓ testReproducibleBuildVerification');
}

function testExternalAuditPackageValidation() {
    const res = engine.runExternalAuditPackageValidation('D:\\ujomor-platform\\products\\eaorcs\\release\\eaorcs_external_audit.zip');
    assert.ok(Array.isArray(res.checks));
    assert.strictEqual(res.passed, true); // has release/ and no dev path root
    console.log('✓ testExternalAuditPackageValidation');
}

function testDocumentationReview() {
    const res = engine.runDocumentationReview(16, 12);
    assert.ok(res.coveragePct > 0);
    console.log('✓ testDocumentationReview');
}

function testFirstRunExperience() {
    const res = engine.runFirstRunExperience();
    assert.strictEqual(typeof res.readyForCustomer, 'boolean');
    assert.ok(Array.isArray(res.steps));
    console.log('✓ testFirstRunExperience');
}

function testInstallerVerification() {
    const res = engine.runInstallerVerification(['Windows', 'Linux', 'macOS']);
    assert.ok(Array.isArray(res.platforms));
    assert.strictEqual(res.platforms.length, 3);
    console.log('✓ testInstallerVerification');
}

function testRollbackVerification() {
    const res = engine.runRollbackVerification('REL-001');
    assert.strictEqual(typeof res.slaPassed, 'boolean');
    console.log('✓ testRollbackVerification');
}

function testGenerateReport() {
    const results = [
        engine.runCleanRoomInstallation(),
        engine.runRollbackVerification('REL-001')
    ];
    const report = engine.generateIndependentValidationReport(results);
    assert.strictEqual(report.evidenceHash.length, 64);
    assert.strictEqual(typeof report.overallPassed, 'boolean');
    console.log('✓ testGenerateReport');
}

testCleanRoomInstall();
testReproducibleBuildVerification();
testExternalAuditPackageValidation();
testDocumentationReview();
testFirstRunExperience();
testInstallerVerification();
testRollbackVerification();
testGenerateReport();

console.log('All IndependentValidationEngine tests passed.');
