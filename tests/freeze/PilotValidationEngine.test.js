/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Pilot Validation Engine Tests
 * File           : PilotValidationEngine.test.js
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
 * CORP: Workstream 1 - Pilot Validation & Cross-Platform Evidence
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
const PilotValidationEngine = require('../../engine/validation/PilotValidationEngine');

const engine = new PilotValidationEngine();

function testCleanRoomDeployments() {
    const res = engine.runCleanRoomDeployments();
    assert.strictEqual(res.passed, true);
    assert.strictEqual(res.totalEnvironments, 7);
    assert.strictEqual(res.passedCount, 7);
    assert.strictEqual(res.failedCount, 0);

    const requiredEnvs = ['Windows', 'Ubuntu', 'Debian', 'macOS', 'Docker', 'Kubernetes', 'Air-Gapped'];
    for (const envName of requiredEnvs) {
        assert.ok(res.environments[envName], `Environment ${envName} should exist in output`);
        assert.strictEqual(res.environments[envName].passed, true);
        assert.ok(res.environments[envName].evidenceHash, `Evidence hash for ${envName} should exist`);
        assert.ok(Array.isArray(res.environments[envName].steps));
        assert.strictEqual(res.environments[envName].steps.length, 6);
    }

    assert.strictEqual(res.environments['Air-Gapped'].airGapped, true);
    assert.ok(res.aggregateEvidenceHash);
    console.log('✓ testCleanRoomDeployments passed');
}

function testCleanRoomDeploymentsCustomSubset() {
    const res = engine.runCleanRoomDeployments({ environments: ['Windows', 'Docker', 'Air-Gapped'] });
    assert.strictEqual(res.passed, true);
    assert.strictEqual(res.totalEnvironments, 3);
    assert.strictEqual(res.passedCount, 3);
    assert.ok(res.environments['Windows']);
    assert.ok(res.environments['Docker']);
    assert.ok(res.environments['Air-Gapped']);
    assert.strictEqual(res.environments['Ubuntu'], undefined);
    console.log('✓ testCleanRoomDeploymentsCustomSubset passed');
}

function testPluginActivationRollbackTest() {
    const res = engine.runPluginActivationRollbackTest({
        pluginId: 'eaorcs-plugin-security-audit',
        initialVersion: '2.0.0',
        upgradedVersion: '2.1.0'
    });

    assert.strictEqual(res.passed, true);
    assert.strictEqual(res.pluginId, 'eaorcs-plugin-security-audit');
    assert.strictEqual(res.phases.length, 5);

    const expectedPhases = [
        'plugin_installation',
        'hot_swap_license_activation',
        'state_recovery',
        'zero_downtime_upgrade',
        'rollback_verification'
    ];

    expectedPhases.forEach((phaseName, idx) => {
        assert.strictEqual(res.phases[idx].phase, phaseName);
        assert.strictEqual(res.phases[idx].passed, true);
        assert.ok(res.phases[idx].stateHash);
    });

    assert.strictEqual(res.activeLicenseState.active, true);
    assert.strictEqual(res.activeLicenseState.licenseTier, 'ENTERPRISE_LTS');
    assert.strictEqual(res.zeroDowntimeVerified, true);
    assert.strictEqual(res.rollbackVerified, true);
    assert.strictEqual(res.rolledBackStateHash, res.phases[1].stateHash); // Matches post-activation baseline state
    assert.ok(res.aggregateEvidenceHash);

    console.log('✓ testPluginActivationRollbackTest passed');
}

function runAllTests() {
    console.log('Executing PilotValidationEngine Test Suite...');
    testCleanRoomDeployments();
    testCleanRoomDeploymentsCustomSubset();
    testPluginActivationRollbackTest();
    console.log('ALL PILOT VALIDATION ENGINE TESTS PASSED SUCCESSFULLY.');
}

runAllTests();
