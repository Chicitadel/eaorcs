/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Software Trust Kernel (STK) Platform Master Verification Suite
 * File           : software_trust_kernel_platform.test.js
 * Version        : 2026.2-LTS (v1.1.0-FROZEN Master Specification)
 * Author         : Architectural Governance Council & Platform Engineering
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Architecture Authority Approved & RATIFIED
 * - UAIGOS 3.0.0 & DPA/PDA v1.1.0-FROZEN Compliant
 * - ISO 27001 / SOC 2 / OWASP ASVS / NIST SP 800-161 / SLSA Level 4 Enforced
 *
 * Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const path = require('path');

async function runStkPlatformMasterSuite() {
  console.log('\n=== MASTER TEST SUITE: Software Trust Kernel (STK) Enterprise Substrate ===');

  // 1. Software Trust Kernel (STK) Core Control Plane
  try {
    const SoftwareTrustKernel = require('../../engine/kernel/SoftwareTrustKernel');
    const stk = new SoftwareTrustKernel();
    const bootRes = await stk.boot();
    assert.ok(bootRes);
    assert.strictEqual(stk.status, 'BOOTED');

    const execRes = await stk.executePipeline({
      action: 'EVALUATE_GOVERNANCE',
      projectId: 'PRJ-ENTERPRISE-CORE',
      vulnerabilitySeverity: 'CRITICAL',
      deploymentEnvironment: 'PRODUCTION'
    });
    assert.ok(execRes);
    assert.ok(execRes.stkPipelineCompleted);
    console.log('✅ 1. SoftwareTrustKernel Control Plane PASSED');
  } catch (err) {
    console.error('❌ 1. SoftwareTrustKernel FAILED:', err);
    throw err;
  }

  // 2. Plugin Engine Registry & Microkernel Architecture
  try {
    const PluginEngineRegistry = require('../../engine/kernel/PluginEngineRegistry');
    const registry = new PluginEngineRegistry();
    const manifest = registry.registerEngine({
      name: 'SampleGovernanceEngine',
      version: '1.0.0',
      capabilities: ['Supports Governance', 'Supports Compliance'],
      permissions: ['READ_METADATA', 'WRITE_EVIDENCE']
    });
    assert.ok(manifest);
    assert.strictEqual(manifest.name, 'SampleGovernanceEngine');
    console.log('✅ 2. PluginEngineRegistry PASSED');
  } catch (err) {
    console.error('❌ 2. PluginEngineRegistry FAILED:', err);
    throw err;
  }

  // 3. Enterprise Streaming Event Bus
  try {
    const EnterpriseEventBus = require('../../engine/kernel/EnterpriseEventBus');
    const bus = new EnterpriseEventBus();
    let eventReceived = false;
    bus.subscribe('RepositoryUpdated', (evt) => {
      eventReceived = true;
    });
    bus.publish('RepositoryUpdated', { repo: 'eaorcs', commit: '8492abc' });
    assert.strictEqual(eventReceived, true);
    console.log('✅ 3. EnterpriseEventBus PASSED');
  } catch (err) {
    console.error('❌ 3. EnterpriseEventBus FAILED:', err);
    throw err;
  }

  // 4. Unified Domain Model (19 First-Class Canonical Entities)
  try {
    const UnifiedDomainModel = require('../../engine/kernel/UnifiedDomainModel');
    const model = new UnifiedDomainModel();
    const entityTypes = model.getCanonicalEntityTypes();
    assert.ok(entityTypes.length >= 19);
    const proj = model.createEntity('Project', { id: 'PRJ-001', name: 'Core Platform' });
    assert.strictEqual(proj.entityType, 'Project');
    console.log('✅ 4. UnifiedDomainModel PASSED');
  } catch (err) {
    console.error('❌ 4. UnifiedDomainModel FAILED:', err);
    throw err;
  }

  // 5. Capability Registry & OEM Subsystem
  try {
    const CapabilityRegistry = require('../../engine/kernel/CapabilityRegistry');
    const capReg = new CapabilityRegistry();
    const capabilities = capReg.listCapabilities();
    assert.ok(capabilities.length >= 7);
    const isSupported = capReg.hasCapability('Supports AI');
    assert.strictEqual(isSupported, true);
    console.log('✅ 5. CapabilityRegistry PASSED');
  } catch (err) {
    console.error('❌ 5. CapabilityRegistry FAILED:', err);
    throw err;
  }

  // 6. First-Class Enterprise API Suite (11 APIs)
  try {
    const EnterpriseApiSuite = require('../../engine/api/EnterpriseApiSuite');
    const apiSuite = new EnterpriseApiSuite();
    const apiList = apiSuite.getRegisteredApis();
    assert.ok(apiList.length >= 11);
    const openApiSpec = apiSuite.exportOpenApiSpec();
    assert.ok(openApiSpec);
    assert.strictEqual(openApiSpec.openapi, '3.1.0');
    console.log('✅ 6. EnterpriseApiSuite PASSED');
  } catch (err) {
    console.error('❌ 6. EnterpriseApiSuite FAILED:', err);
    throw err;
  }

  // 7. Platform Extension SDK (@eaorcs/sdk)
  try {
    const { PlatformExtensionSdk } = require('../../sdk/PlatformExtensionSdk');
    const sdk = new PlatformExtensionSdk();
    const packContract = sdk.createGovernancePack('CUSTOM_PACK').setName('Custom FinTech Pack').build();
    assert.ok(packContract);
    assert.strictEqual(packContract.id, 'CUSTOM_PACK');
    console.log('✅ 7. PlatformExtensionSdk PASSED');
  } catch (err) {
    console.error('❌ 7. PlatformExtensionSdk FAILED:', err);
    throw err;
  }

  // 8. Visual Governance Workflow Designer Engine
  try {
    const { VisualWorkflowDesignerEngine } = require('../../engine/workflow/VisualWorkflowDesignerEngine');
    const workflowEngine = VisualWorkflowDesignerEngine.createStandardPipeline();
    assert.ok(workflowEngine);
    assert.ok(workflowEngine.composer.getNodes().length >= 5);
    console.log('✅ 8. VisualWorkflowDesignerEngine PASSED');
  } catch (err) {
    console.error('❌ 8. VisualWorkflowDesignerEngine FAILED:', err);
    throw err;
  }

  // 9. Tenant Continuous Learning Engine
  try {
    const TenantContinuousLearningEngine = require('../../engine/learning/TenantContinuousLearningEngine');
    const learningEngine = new TenantContinuousLearningEngine({ salt: 'test-salt-123', minKAnonymity: 1 });
    learningEngine.recordPolicyFailure('tenant-enterprise-01', {
      policyId: 'POL-001',
      ruleName: 'SEC_AUDIT',
      category: 'SECURITY'
    });
    const insights = learningEngine.analyzeTenantPatterns('tenant-enterprise-01');
    assert.ok(insights);
    assert.strictEqual(insights.tenantId, 'tenant-enterprise-01');
    assert.strictEqual(insights.summary.totalPolicyFailuresRecorded, 1);
    console.log('✅ 9. TenantContinuousLearningEngine PASSED');
  } catch (err) {
    console.error('❌ 9. TenantContinuousLearningEngine FAILED:', err);
    throw err;
  }

  // 10. Unified Explainability & Reasoning Ledger
  try {
    const ExplainabilityLedgerEngine = require('../../engine/explainability/ExplainabilityLedgerEngine');
    const explainLedger = new ExplainabilityLedgerEngine();
    const record = explainLedger.recordExplanation({
      targetId: 'REC-001',
      why: 'Architecture refactoring',
      evidence: ['High coupling index'],
      policies: ['POL-ARCH'],
      regulations: ['ISO 27001'],
      adrs: ['ADR-001'],
      alternatives: [{ name: 'Do Nothing', rejectionReason: 'High risk' }],
      confidence: { score: 0.95 },
      consequencesIfIgnored: { description: 'Outage', severity: 'HIGH' }
    });
    assert.ok(record);
    assert.ok(record.recordId);
    assert.strictEqual(record.targetId, 'REC-001');
    console.log('✅ 10. ExplainabilityLedgerEngine PASSED');
  } catch (err) {
    console.error('❌ 10. ExplainabilityLedgerEngine FAILED:', err);
    throw err;
  }

  // 11. Fluid UX Experience Quality Engine
  try {
    const FluidExperienceQualityEngine = require('../../engine/ux/FluidExperienceQualityEngine');
    const uxEngine = new FluidExperienceQualityEngine();
    const state = uxEngine.transitionToPage('/dashboard');
    assert.ok(state);
    assert.strictEqual(state.currentRoute, '/dashboard');
    const keyMatch = uxEngine.handleKeyPress('Ctrl+K');
    assert.strictEqual(keyMatch.matched, true);
    console.log('✅ 11. FluidExperienceQualityEngine PASSED');
  } catch (err) {
    console.error('❌ 11. FluidExperienceQualityEngine FAILED:', err);
    throw err;
  }

  console.log('\n🎉 ALL 11 STK PLATFORM SUBSTRATE TEST SUITES PASSED 100% CLEANLY!\n');
}

if (require.main === module) {
  runStkPlatformMasterSuite().catch(err => {
    console.error('❌ STK MASTER TEST SUITE FAILED:', err);
    process.exit(1);
  });
}

module.exports = { runStkPlatformMasterSuite };
