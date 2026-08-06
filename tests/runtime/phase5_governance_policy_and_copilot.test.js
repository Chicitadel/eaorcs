/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Governance Policy, Visual Graph & Copilot Test Suite
 * File           : phase5_governance_policy_and_copilot.test.js
 * Version        : 2026.3.0-LTS
 * Author         : Air Roofers Governance Authority
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');

async function runGovernancePolicyAndCopilotSuite() {
  console.log('\n=== PHASE 5: Governance Policy, Visual Graph & Copilot Test Suite ===\n');
  let passed = 0;
  let failed = 0;

  // 1. GovernancePolicyEngine Verification (Declarative OPA-style evaluation)
  try {
    const GovernancePolicyEngine = require('../../engine/governance/GovernancePolicyEngine');
    const policyEngine = new GovernancePolicyEngine();

    const validContext = {
      specVersion: '2026.3.0-LTS',
      passportSignature: 'a'.repeat(64),
      federationScore: 100,
    };
    const validResult = policyEngine.evaluatePolicies(validContext);
    assert.strictEqual(validResult.status, 'PERMITTED');
    assert.strictEqual(validResult.decision, 'ALLOW_DEPLOYMENT');

    const invalidContext = { specVersion: '2.0.0-OLD', federationScore: 80 };
    const invalidResult = policyEngine.evaluatePolicies(invalidContext);
    assert.strictEqual(invalidResult.status, 'BLOCKED');
    assert.strictEqual(invalidResult.decision, 'DENY_DEPLOYMENT');

    console.log('✅ 1. GovernancePolicyEngine PASSED (Declarative OPA-Style Policy Interpretation Verified)');
    passed++;
  } catch (err) {
    console.error('❌ 1. GovernancePolicyEngine FAILED:', err.message);
    failed++;
  }

  // 2. InteractiveTrustGraphVisualizer Verification
  try {
    const InteractiveTrustGraphVisualizer = require('../../engine/twin/InteractiveTrustGraphVisualizer');
    const visualizer = new InteractiveTrustGraphVisualizer();

    const payload = visualizer.generateVisualGraphPayload();
    assert.ok(payload.totalNodes >= 8);
    assert.strictEqual(payload.nodes[0].clickable, true);

    console.log('✅ 2. InteractiveTrustGraphVisualizer PASSED (Visual Graph Rendering Payload Verified)');
    passed++;
  } catch (err) {
    console.error('❌ 2. InteractiveTrustGraphVisualizer FAILED:', err.message);
    failed++;
  }

  // 3. GovernanceCopilotEngine Verification
  try {
    const GovernanceCopilotEngine = require('../../engine/ai/GovernanceCopilotEngine');
    const copilot = new GovernanceCopilotEngine();

    const response = copilot.processPrompt('Why did Gate 2 fail?');
    assert.strictEqual(response.intent, 'EXPLAIN_LAUNCH_GATE_2_STATUS');
    assert.ok(response.explanation.includes('CyberSecure Int.'));

    console.log('✅ 3. GovernanceCopilotEngine PASSED (Conversational Reasoning Copilot Prompt Evaluated)');
    passed++;
  } catch (err) {
    console.error('❌ 3. GovernanceCopilotEngine FAILED:', err.message);
    failed++;
  }

  // 4. CustomerPassportPortalEngine Verification
  try {
    const CustomerPassportPortalEngine = require('../../engine/portal/CustomerPassportPortalEngine');
    const portal = new CustomerPassportPortalEngine();

    const view = portal.renderCustomerPassportPortalView();
    assert.strictEqual(view.portalDomain, 'trust.airroofers.eu/passport');
    assert.strictEqual(view.customerDownloadableArtifacts.length, 3);

    console.log('✅ 4. CustomerPassportPortalEngine PASSED (Customer Release Passport View Rendered)');
    passed++;
  } catch (err) {
    console.error('❌ 4. CustomerPassportPortalEngine FAILED:', err.message);
    failed++;
  }

  console.log(`\n${'═'.repeat(65)}`);
  if (failed === 0) {
    console.log(`🎉 ALL ${passed} POLICY, VISUAL GRAPH & COPILOT TESTS PASSED!`);
  } else {
    console.log(`⚠️  ${passed} PASSED | ${failed} FAILED`);
  }
  console.log(`${'═'.repeat(65)}\n`);

  if (failed > 0) process.exit(1);
}

if (require.main === module) {
  runGovernancePolicyAndCopilotSuite().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { runGovernancePolicyAndCopilotSuite };
