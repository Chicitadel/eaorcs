/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Product Lifecycle Engine Test Suite
 * File           : ProductLifecycleEngine.test.js
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
 * CORP: Layer G — Product Lifecycle Test Verification
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
const path = require('path');
const ProductLifecycleEngine = require('../../engine/lifecycle/ProductLifecycleEngine');

function runProductLifecycleEngineTests() {
    console.log('================================================================');
    console.log('  TEST SUITE: ProductLifecycleEngine (Layer G)');
    console.log('================================================================\n');

    const engine = new ProductLifecycleEngine();

    // Test 1: Verify all 13 stages exist and are retrievable
    console.log('[1/4] Testing stage names and retrieval of all 13 stages...');
    const stageNames = engine.getStageNames();
    assert.strictEqual(stageNames.length, 13, `Expected 13 stage names, got ${stageNames.length}`);
    assert.deepStrictEqual(stageNames[0], 'Discovery');
    assert.deepStrictEqual(stageNames[12], 'Retirement');
    console.log('  ✓ 13 stages validated in canonical order (Discovery -> Retirement)');

    // Test 2: Test getLifecycleStageDetails for each stage
    console.log('\n[2/4] Testing getLifecycleStageDetails(stageName)...');
    const allStages = [
        'Discovery', 'Feasibility', 'Architecture', 'Development',
        'Testing', 'Security', 'Staging', 'Release',
        'Onboarding', 'Operations', 'Maintenance', 'Deprecation', 'Retirement'
    ];

    for (let i = 0; i < allStages.length; i++) {
        const stageName = allStages[i];
        const details = engine.getLifecycleStageDetails(stageName);
        
        assert.ok(details, `Details for stage ${stageName} should not be null`);
        assert.strictEqual(details.stage, stageName);
        assert.strictEqual(details.stageIndex, i + 1);
        assert.ok(Array.isArray(details.inputs) && details.inputs.length > 0, `${stageName} must have inputs`);
        assert.ok(Array.isArray(details.outputs) && details.outputs.length > 0, `${stageName} must have outputs`);
        assert.ok(Array.isArray(details.evidence) && details.evidence.length > 0, `${stageName} must have evidence`);
        assert.ok(typeof details.responsibleRole === 'string' && details.responsibleRole.length > 0, `${stageName} must have responsibleRole`);
        assert.ok(Array.isArray(details.exitCriteria) && details.exitCriteria.length > 0, `${stageName} must have exitCriteria`);
    }
    console.log('  ✓ getLifecycleStageDetails verified for all 13 stages with complete inputs/outputs/evidence/roles/exitCriteria');

    // Test 3: Case-insensitive lookup and invalid stage handling
    console.log('\n[3/4] Testing case-insensitive lookup and invalid stage handling...');
    const discoveryCase = engine.getLifecycleStageDetails('dIsCoVeRy');
    assert.ok(discoveryCase, 'Case insensitive lookup failed for dIsCoVeRy');
    assert.strictEqual(discoveryCase.stage, 'Discovery');

    const invalidStage = engine.getLifecycleStageDetails('NonExistentStage');
    assert.strictEqual(invalidStage, null, 'Invalid stage should return null');
    console.log('  ✓ Case-insensitive and edge cases verified');

    // Test 4: Stage transition and gate evaluation logic
    console.log('\n[4/4] Testing stage transition validation & gate evaluation...');
    const validTrans = engine.validateStageTransition('Discovery', 'Feasibility');
    assert.strictEqual(validTrans.valid, true, 'Discovery -> Feasibility should be valid');

    const invalidTrans = engine.validateStageTransition('Discovery', 'Testing');
    assert.strictEqual(invalidTrans.valid, false, 'Discovery -> Testing should be invalid (non-sequential jump)');

    const gateEval = engine.evaluateStageGate('Security', ['SAST/DAST Clearance Hashes', 'ISO 27001 Verification Artifact']);
    assert.strictEqual(gateEval.passed, true, 'Security stage gate should pass with all evidence provided');

    console.log('  ✓ Stage transitions and gate evaluations verified');

    console.log('\n================================================================');
    console.log('  SUCCESS: ProductLifecycleEngine tests passed (100%)');
    console.log('================================================================\n');
}

runProductLifecycleEngineTests();
