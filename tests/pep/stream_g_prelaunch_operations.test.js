/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : PEP Stream G — Pre-Launch Operations & Portal Automation Test Suite
 * File           : tests/pep/stream_g_prelaunch_operations.test.js
 * Version        : 2026.1.0-LTS
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
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
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const path = require('path');
const PreLaunchOperationsEngine = require('../../engine/operations/PreLaunchOperationsEngine');

function runStreamGTestSuite() {
  console.log('================================================================================');
  console.log('  EAORCS PEP STREAM G: PRE-LAUNCH OPERATIONS & PORTAL AUTOMATION TEST SUITE');
  console.log('  Target Module: engine/operations/PreLaunchOperationsEngine.js');
  console.log('================================================================================\n');

  const engine = new PreLaunchOperationsEngine();

  // -------------------------------------------------------------------------
  // TEST 1: Product Descriptor Integration & Validation
  // -------------------------------------------------------------------------
  console.log('[1/5] Testing Product Descriptor Integration (airroofers-product-descriptor.json)...');
  assert.ok(engine.descriptor, 'Product descriptor should be loaded');
  assert.strictEqual(engine.descriptor.productId, 'eaorcs', 'Product ID should be eaorcs');
  assert.strictEqual(engine.descriptor.platformDomain, 'airroofers.eu', 'Platform domain should be airroofers.eu');
  assert.strictEqual(engine.descriptor.version, '2026.1.0-LTS', 'Version should match 2026.1.0-LTS');
  assert.strictEqual(engine.descriptor.editions.length, 4, 'Should support 4 editions');
  assert.ok(engine.descriptor.editions.includes('GOV_CLOUD'), 'Editions must include GOV_CLOUD');
  console.log('  ✅ Product descriptor loaded and validated successfully.\n');

  // -------------------------------------------------------------------------
  // TEST 2: 8-Stage Automated Launch Sequence Pipeline
  // -------------------------------------------------------------------------
  console.log('[2/5] Testing 8-Stage Automated Launch Sequence Pipeline Execution...');
  const pipelineReport = engine.executeLaunchPipeline({ runId: 'TEST-RUN-STREAM-G-001' });

  assert.strictEqual(pipelineReport.runId, 'TEST-RUN-STREAM-G-001', 'Run ID should match');
  assert.strictEqual(pipelineReport.totalStages, 8, 'Pipeline must consist of 8 stages');
  assert.strictEqual(pipelineReport.passedStages, 8, 'All 8 stages must pass cleanly');
  assert.strictEqual(pipelineReport.overallStatus, 'PASSED', 'Overall pipeline status must be PASSED');
  assert.ok(pipelineReport.proofHash, 'Pipeline must generate cryptographic proof SHA-256 hash');

  const stageNames = pipelineReport.stages.map(s => s.stageName);
  const expectedStages = [
    'Release',
    'Package',
    'Docs',
    'SDK',
    'Portal',
    'License',
    'Deployment',
    'Evidence & Certification'
  ];

  assert.deepStrictEqual(stageNames, expectedStages, 'Stage execution order must match 8-stage sequence');
  console.log('  ✅ 8-Stage Launch Pipeline executed cleanly (8/8 stages PASSED).\n');

  // -------------------------------------------------------------------------
  // TEST 3: Public Demo Sandbox Platform Provisioning
  // -------------------------------------------------------------------------
  console.log('[3/5] Testing Public Demo Sandbox Platform Provisioning & Lifecycle...');
  const tenantId = 'tenant-apex-finance';
  const sandbox = engine.provisionDemoSandbox(tenantId, { ttlHours: 48, maxCalls: 10000 });

  assert.ok(sandbox.sandboxId.startsWith('SANDBOX-'), 'Sandbox ID should be generated with prefix');
  assert.strictEqual(sandbox.tenantId, tenantId, 'Tenant ID should match');
  assert.strictEqual(sandbox.status, 'PROVISIONED', 'Sandbox status should be PROVISIONED');
  assert.ok(sandbox.url.includes('sandbox.airroofers.eu'), 'Sandbox URL should route to sandbox.airroofers.eu');
  assert.ok(sandbox.token.startsWith('sbx_tok_'), 'Sandbox API token should be formatted correctly');
  assert.strictEqual(sandbox.quotas.maxApiCalls, 10000, 'Custom max API call quota should be applied');

  const fetchedSandbox = engine.getDemoSandbox(sandbox.sandboxId);
  assert.strictEqual(fetchedSandbox.sandboxId, sandbox.sandboxId, 'Retrieved sandbox should match created instance');

  const terminated = engine.terminateDemoSandbox(sandbox.sandboxId);
  assert.strictEqual(terminated, true, 'Sandbox termination should return true');
  assert.strictEqual(engine.getDemoSandbox(sandbox.sandboxId), null, 'Terminated sandbox should be removed from active sandboxes');
  console.log('  ✅ Public Demo Sandbox provisioning, retrieval, and termination passed cleanly.\n');

  // -------------------------------------------------------------------------
  // TEST 4: Product Page Specification Generation (airroofers.eu)
  // -------------------------------------------------------------------------
  console.log('[4/5] Testing Product Page Specification Generation (airroofers.eu)...');
  const spec = engine.generateProductPageSpec();

  assert.strictEqual(spec.domain, 'airroofers.eu', 'Domain must be airroofers.eu');
  assert.strictEqual(spec.canonicalUrl, 'https://airroofers.eu/products/eaorcs', 'Canonical URL should match product path');
  assert.ok(spec.heroSection.primaryCta.url.includes('sandbox.airroofers.eu'), 'Hero primary CTA should point to demo sandbox');
  assert.strictEqual(spec.editions.length, 4, 'Product spec must detail all 4 platform editions');
  assert.ok(spec.complianceSeals.includes('ISO/IEC 25010'), 'Compliance seals must highlight ISO/IEC 25010');
  console.log('  ✅ Product page specification generated with complete metadata.\n');

  // -------------------------------------------------------------------------
  // TEST 5: Support Routing Configuration (support.airroofers.eu)
  // -------------------------------------------------------------------------
  console.log('[5/5] Testing Support Routing Configuration (support.airroofers.eu)...');
  const supportRouting = engine.configureSupportRouting();

  assert.strictEqual(supportRouting.portalUrl, 'https://support.airroofers.eu/products/eaorcs', 'Portal URL must route to product support page');
  assert.strictEqual(supportRouting.kbUrl, 'https://docs.airroofers.eu/eaorcs', 'KB URL must match docs portal');
  assert.strictEqual(supportRouting.routingRules.length, 4, 'Must define support routing rules for all 4 tiers');

  const govRule = supportRouting.routingRules.find(r => r.tier === 'GOV_CLOUD');
  assert.ok(govRule, 'GovCloud routing rule must exist');
  assert.strictEqual(govRule.sla, '99.999%', 'GovCloud SLA guarantee must be 99.999%');
  assert.strictEqual(govRule.responseTargetMinutes, 5, 'GovCloud target response time must be 5 minutes');
  console.log('  ✅ Support routing table configured successfully.\n');

  console.log('================================================================================');
  console.log('  🎉 PEP STREAM G PRE-LAUNCH OPERATIONS SUITE: PASSED 100% CLEANLY');
  console.log('================================================================================\n');
}

runStreamGTestSuite();
