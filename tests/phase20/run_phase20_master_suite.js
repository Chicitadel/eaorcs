/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Tests
 * File           : tests/phase20/run_phase20_master_suite.js
 * Version        : 2026.17.0
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
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const ContinuousRuntimeGovernanceEngine = require('../../engine/validation/ContinuousRuntimeGovernanceEngine');
const BlueprintImplementationDriftMonitor = require('../../engine/validation/BlueprintImplementationDriftMonitor');
const Phase20ProductionValidationOrchestrator = require('../../engine/audit/Phase20ProductionValidationOrchestrator');

async function runTests() {
  let passed = 0; let failed = 0;

  async function test(name, fn) {
    try { 
      await fn(); 
      console.log(`  ✅ PASS: ${name}`); 
      passed++; 
    } catch(e) { 
      console.error(`  ❌ FAIL: ${name} — ${e.message}`); 
      failed++; 
    }
  }

  console.log('--- Phase 20 Master Test Suite ---');
  
  await test('ContinuousRuntimeGovernanceEngine Execution', async () => {
    const engine = new ContinuousRuntimeGovernanceEngine();
    const result = await engine.run();
    if (result.engineType !== 'CONTINUOUS_RUNTIME_GOVERNANCE') throw new Error('Invalid engineType');
    if (result.runtimeScore !== 100) throw new Error('runtimeScore != 100');
    if (result.governanceEnforcementRate !== 100) throw new Error('governanceEnforcementRate != 100');
    if (result.status !== 'ENFORCING') throw new Error('status is not ENFORCING');
  });

  await test('BlueprintImplementationDriftMonitor Execution', async () => {
    const monitor = new BlueprintImplementationDriftMonitor();
    const result = await monitor.run();
    if (result.monitorType !== 'BLUEPRINT_IMPLEMENTATION_DRIFT_MONITOR') throw new Error('Invalid monitorType');
    if (result.blueprintConformanceScore !== 100) throw new Error('blueprintConformanceScore != 100');
    if (result.architecturalDriftDetected !== false) throw new Error('architecturalDriftDetected must be false');
    if (result.status !== 'ALIGNED') throw new Error('status is not ALIGNED');
  });

  await test('Phase20ProductionValidationOrchestrator Execution', async () => {
    const orchestrator = new Phase20ProductionValidationOrchestrator();
    const result = await orchestrator.run();
    if (result.phase !== 'PHASE_20') throw new Error('Invalid phase');
    if (result.totalStreams !== 8) throw new Error('totalStreams != 8');
    if (result.passedStreams !== 8) throw new Error('passedStreams != 8');
    if (result.productionValidationScore !== 100) throw new Error('productionValidationScore != 100');
    if (result.overallStatus !== 'PRODUCTION_VALIDATED') throw new Error('overallStatus is not PRODUCTION_VALIDATED');
    if (result.phase20Verdict !== 'PHASE_20_PRODUCTION_VALIDATION_COMPLETE') throw new Error('Incorrect phase20Verdict');
    
    console.log('\n--- Summary Table ---');
    console.table(result.streams);
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
