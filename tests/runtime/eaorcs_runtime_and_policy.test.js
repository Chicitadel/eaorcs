/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Runtime & Execution Policy Test Suite
 * File           : eaorcs_runtime_and_policy.test.js
 * Version        : 2026.3.0-LTS
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
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

const assert = require('assert');
const path = require('path');
const {
    EAORCSRuntimeEngine,
    ExecutionPolicyEngine,
    ConsentManagerEngine,
    ExecutionProfileRegistryEngine
} = require('../../engine');

async function testRuntimeAndPolicyEngine() {
    console.log('================================================================');
    console.log('  TEST: EAORCS EXECUTION RUNTIME & POLICY FRAMEWORK');
    console.log('================================================================\n');

    const projectRoot = path.resolve(__dirname, '../../');

    // 1. Test Execution Profile Registry Presets
    console.log('[1] Testing ExecutionProfileRegistryEngine Presets...');
    const registry = new ExecutionProfileRegistryEngine();
    const presets = registry.listPresets();

    assert.ok(presets.length >= 5, 'Should contain at least 5 default presets');
    const conservative = registry.getPreset('Conservative');
    const autonomous = registry.getPreset('Autonomous');

    assert.strictEqual(conservative.stages.MODIFY, 'ASK', 'Conservative preset must ask for MODIFY stage');
    assert.strictEqual(autonomous.stages.MODIFY, 'AUTO', 'Autonomous preset must auto for MODIFY stage');
    console.log(`    Presets Registered: ${presets.length} (Conservative, Balanced, Autonomous, CI_CD, Review_Only)`);

    // 2. Test Consent Manager
    console.log('\n[2] Testing ConsentManagerEngine...');
    const consentManager = new ConsentManagerEngine();
    consentManager.recordConsent('MODIFY:UserService.js', true, 'session');

    const recorded = consentManager.hasRecordedConsent('MODIFY:UserService.js');
    assert.ok(recorded, 'Consent record must be found');
    assert.strictEqual(recorded.approved, true, 'Consent decision must be true');
    console.log(`    Consent Recorded & Recalled: ${recorded.key} (Scope: ${recorded.scope})`);

    // 3. Test Hierarchical Execution Policy Engine & Contextual Conditions
    console.log('\n[3] Testing ExecutionPolicyEngine Hierarchical Resolution...');
    const policyEngine = new ExecutionPolicyEngine({
        consentManager,
        profileRegistry: registry
    });

    const decisionNormal = policyEngine.resolveDecision('MODIFY', { targetFile: 'Main.js' });
    assert.ok(decisionNormal, 'Decision must be resolved');
    assert.strictEqual(decisionNormal.decision, 'ASK', 'Default Balanced policy should ASK for MODIFY');

    const decisionRemembered = policyEngine.resolveDecision('MODIFY', { targetFile: 'UserService.js' });
    assert.strictEqual(decisionRemembered.remembered, true, 'Should use remembered consent');
    assert.strictEqual(decisionRemembered.decision, 'AUTO', 'Remembered decision should be AUTO');

    const decisionCi = policyEngine.resolveDecision('MODIFY', { targetFile: 'Build.js', isCi: true });
    assert.strictEqual(decisionCi.decision, 'AUTO', 'CI context should automatically authorize stage');

    console.log(`    Default Balanced Policy Decision: ${decisionNormal.decision}`);
    console.log(`    Remembered Consent Decision:       ${decisionRemembered.decision} (Scope: ${decisionRemembered.resolvedScope})`);
    console.log(`    CI Context Decision:               ${decisionCi.decision} (${decisionCi.conditionReason})`);

    // 4. Test EAORCS Runtime Host Execution Modes
    console.log('\n[4] Testing EAORCSRuntimeEngine Execution Modes & Automatic Wakeup...');

    // Passive Mode Simulation (e.g. Manual Developer in Notepad)
    const passiveHost = new EAORCSRuntimeEngine({ projectRoot, mode: 'Passive', policyEngine });
    passiveHost.startHost();
    const eventPassive = passiveHost.handleEvent({ type: 'FILE_SAVE', path: 'UserService.java', source: 'NotepadManualSave' });

    assert.strictEqual(eventPassive.mode, 'Passive');
    assert.strictEqual(eventPassive.runtimeAction, 'NOTIFIED_ONLY');
    assert.ok(eventPassive.userPrompt.includes('No automatic files modified'), 'Passive mode must not modify files');
    console.log('    Passive Mode (Manual Notepad Edit): Woke up Kernel -> Notified Only -> No Files Modified.');

    // Interactive Mode Simulation (e.g. Developer in IDE)
    const interactiveHost = new EAORCSRuntimeEngine({ projectRoot, mode: 'Interactive', policyEngine });
    interactiveHost.startHost();
    const eventInteractive = interactiveHost.handleEvent({ type: 'FILE_SAVE', path: 'OrderService.js', source: 'VsCodeSave' });

    assert.strictEqual(eventInteractive.mode, 'Interactive');
    assert.strictEqual(eventInteractive.runtimeAction, 'AWAITING_USER_APPROVAL');
    assert.ok(eventInteractive.userPrompt.title.includes('Approval Request'), 'Interactive mode must prompt for approval');
    console.log('    Interactive Mode (IDE Edit): Woke up Kernel -> Awaiting Approval Prompt Generated.');

    // Autonomous Mode Simulation (e.g. CI/CD Runner)
    const autonomousHost = new EAORCSRuntimeEngine({ projectRoot, mode: 'Autonomous', policyEngine });
    autonomousHost.startHost();
    const eventAutonomous = autonomousHost.handleEvent({ type: 'CI_TRIGGER', path: 'Pipeline.yaml', source: 'GitHubActions' });

    assert.strictEqual(eventAutonomous.mode, 'Autonomous');
    assert.strictEqual(eventAutonomous.runtimeAction, 'AUTONOMOUSLY_EXECUTED');
    console.log('    Autonomous Mode (CI/CD Runner): Woke up Kernel -> Autonomously Executed.');

    console.log('\n================================================================');
    console.log('  RUNTIME & EXECUTION POLICY TEST SUITE PASSED (100% SUCCESS)');
    console.log('================================================================\n');
}

if (require.main === module) {
    testRuntimeAndPolicyEngine().catch(err => {
        console.error('Runtime Test Error:', err);
        process.exit(1);
    });
}

module.exports = testRuntimeAndPolicyEngine;
