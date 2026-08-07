/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS [Phase 6 Production Tests]
 * File           : eaorcs_corp_phase6_production.test.js
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
 * CORP: Phase 6 Production Tests
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const PerformanceEngineeringEngine = require('../../engine/operations/PerformanceEngineeringEngine.js');
const OperationalReadinessEngine = require('../../engine/operations/OperationalReadinessEngine.js');
const TestVerificationEngine = require('../../engine/testing/TestVerificationEngine.js');
const CommercialReadinessEngine = require('../../engine/commercial/CommercialReadinessEngine.js');

function runTests() {
    console.log('--- RUNNING CORP PHASE 6 TESTS ---');
    
    // Performance Engineering Engine
    const perfEngine = new PerformanceEngineeringEngine();
    
    const scanTime = perfEngine.measureWorkspaceScanTime('workspace/dir');
    assert.ok(scanTime.durationMs !== undefined, 'measureWorkspaceScanTime should return durationMs');
    assert.ok(typeof scanTime.sloPassed === 'boolean', 'measureWorkspaceScanTime should return sloPassed boolean');
    
    const cacheEff = perfEngine.measureCacheEfficiency(() => {}, 10);
    assert.ok(cacheEff.speedupFactor > 1, 'measureCacheEfficiency should return speedupFactor > 1');
    
    const perfSuite = perfEngine.runPerformanceSuite({});
    assert.ok(Array.isArray(perfSuite.benchmarks), 'runPerformanceSuite should return benchmarks array');
    assert.ok(typeof perfSuite.overallSloPassed === 'boolean', 'runPerformanceSuite should return overallSloPassed');
    
    const regDetectFail = perfEngine.detectRegression(100, 150, 20); // 50% regression, > 20% threshold
    assert.strictEqual(regDetectFail.hasRegression, true, 'detectRegression should detect >20% regression');
    
    const regDetectPass = perfEngine.detectRegression(100, 110, 20); // 10% regression, <= 20% threshold
    assert.strictEqual(regDetectPass.hasRegression, false, 'detectRegression should pass when within threshold');

    console.log('[OK] PerformanceEngineeringEngine tests passed');

    // Operational Readiness Engine
    const opsEngine = new OperationalReadinessEngine();
    
    const health = opsEngine.getHealthStatus();
    assert.ok(['HEALTHY', 'DEGRADED', 'UNHEALTHY'].includes(health.status), 'getHealthStatus should return valid status');
    
    const log = opsEngine.generateStructuredLog('INFO', 'Test log');
    assert.ok(log.correlationId, 'generateStructuredLog should return correlationId');
    assert.ok(log.timestamp, 'generateStructuredLog should return timestamp');
    
    const op = opsEngine.startCorrelatedOperation('TestOp');
    assert.ok(op.correlationId, 'startCorrelatedOperation should return correlationId');
    
    const playbook = opsEngine.runIncidentPlaybook('GOVERNANCE_VIOLATION');
    assert.ok(Array.isArray(playbook.steps), 'runIncidentPlaybook should return steps array');
    
    const kpis = opsEngine.getOperationalKPIs();
    assert.ok(kpis.qualificationSuccessRate !== undefined, 'getOperationalKPIs should return qualificationSuccessRate');
    
    console.log('[OK] OperationalReadinessEngine tests passed');

    // Test Verification Engine
    const testEngine = new TestVerificationEngine();
    
    const suiteId = testEngine.registerTestSuite('TEST_SUITE_1', { name: 'Test Suite 1', category: 'unit', testFile: 'test.js', streamId: 'S17', phase: 6 });
    assert.strictEqual(suiteId, 'TEST_SUITE_1', 'registerTestSuite should register without error');
    
    // Create a dummy dir to test discover
    const testDir = path.join(__dirname, 'dummy_test_dir');
    if (!fs.existsSync(testDir)) fs.mkdirSync(testDir);
    fs.writeFileSync(path.join(testDir, 'dummy.test.js'), 'console.log("dummy");');
    
    const discovered = testEngine.discoverTestSuites(testDir);
    assert.ok(Array.isArray(discovered), 'discoverTestSuites should return array');
    assert.ok(discovered.length > 0, 'discoverTestSuites should return discovered suites');
    
    fs.unlinkSync(path.join(testDir, 'dummy.test.js'));
    fs.rmdirSync(testDir);
    
    const testReport = testEngine.generateTestReport([{ suiteId: '1', passed: true }, { suiteId: '2', passed: false }]);
    assert.strictEqual(testReport.totalSuites, 2, 'generateTestReport should count total suites');
    assert.strictEqual(testReport.passed, 1, 'generateTestReport should count passed');
    assert.strictEqual(testReport.failed, 1, 'generateTestReport should count failed');
    
    console.log('[OK] TestVerificationEngine tests passed');

    // Commercial Readiness Engine
    const commEngine = new CommercialReadinessEngine();
    
    const license = commEngine.generateLicenseDescriptor({ tier: 'Enterprise' });
    assert.ok(license.licenseId, 'generateLicenseDescriptor should return licenseId');
    
    const readinessFail = commEngine.validateOnboardingReadiness(['documentation', 'installer']);
    assert.strictEqual(readinessFail.ready, false, 'validateOnboardingReadiness should fail when assets are missing');
    assert.ok(readinessFail.missing.length > 0, 'validateOnboardingReadiness should list missing assets');
    
    const gates = commEngine.checkCommercialReadinessGates();
    assert.ok(typeof gates.allPassed === 'boolean', 'checkCommercialReadinessGates should return allPassed boolean');
    
    const support = commEngine.generateSupportModel('Enterprise');
    assert.ok(support.sla, 'generateSupportModel should return sla');
    assert.ok(Array.isArray(support.channels), 'generateSupportModel should return channels');
    
    const record = commEngine.generateReleaseGovernanceRecord('REL_1');
    assert.ok(record.releaseId, 'generateReleaseGovernanceRecord should return releaseId');
    assert.ok(Array.isArray(record.signatories), 'generateReleaseGovernanceRecord should return signatories');
    
    console.log('[OK] CommercialReadinessEngine tests passed');
    
    console.log('--- ALL TESTS PASSED ---');
}

runTests();
