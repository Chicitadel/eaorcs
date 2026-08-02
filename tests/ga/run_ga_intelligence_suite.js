/******************************************************************************
 * Project        : EAORCS — Enterprise Autonomous Observability & Compliance System
 * Module         : GA Intelligence — Master Test Suite
 * File           : run_ga_intelligence_suite.js
 * Version        : 1.0.0
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-02
 * Last Modified  : 2026-08-02
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 *
 * Standards: ISO 27001 | SOC 2 | OWASP ASVS | NIST
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const { testStreamA } = require('./stream_a_blueprint_conformance.test');
const { testStreamB } = require('./stream_b_product_integration.test');
const { testStreamC } = require('./stream_c_api_contract_intelligence.test');
const { testStreamD } = require('./stream_d_runtime_validation.test');
const { testStreamE } = require('./stream_e_legal_governance_extension.test');
const { testStreamF } = require('./stream_f_commercial_operations.test');
const { testStreamG } = require('./stream_g_independent_assurance.test');
const { testStreamH } = require('./stream_h_customer_success.test');
const { testStreamI } = require('./stream_i_continuous_engineering_intelligence.test');
const { testStreamX5 } = require('./stream_x5_final_maturity_assessment.test');
const GAIntelligenceOrchestrator = require('../../engine/governance/GAIntelligenceOrchestrator');

async function runGAIntelligenceSuite() {
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('  EAORCS — NINE-STREAM GA INTELLIGENCE SUITE');
  console.log('  Ujomor Systems Engineering & Governance Authority');
  console.log('  Release Target: 2026.1.0-GA');
  console.log('════════════════════════════════════════════════════════════════\n');

  await testStreamA();
  await testStreamB();
  await testStreamC();
  await testStreamD();
  await testStreamE();
  await testStreamF();
  await testStreamG();
  await testStreamH();
  await testStreamI();
  await testStreamX5();

  console.log('\n  Running GA Intelligence Orchestrator (10 engines in parallel)...');
  const orchestratorResult = await new GAIntelligenceOrchestrator().run();

  assert.strictEqual(orchestratorResult.phase, 'GA_INTELLIGENCE', 'Expected GA_INTELLIGENCE phase');
  assert.strictEqual(orchestratorResult.passedEngines, 10, 'Expected 10/10 engines PASS');
  assert.strictEqual(orchestratorResult.gaIntelligenceScorePercent, 100.0, 'Expected 100% GA Intelligence Score');

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log(`  GA Intelligence Suite: 10/10 streams PASS, 10/10 engines PASS`);
  console.log(`  GA Intelligence Score: ${orchestratorResult.gaIntelligenceScorePercent}%`);
  console.log(`  Verdict: ${orchestratorResult.gaVerdict}`);
  console.log(`  Baseline: EAORCS_2026_1_0_GA_IMPLEMENTATION_BASELINE_CLOSED`);
  console.log('\n  ✅ EAORCS GA INTELLIGENCE & BASELINE CLOSURE CERTIFICATION COMPLETE');
  console.log('════════════════════════════════════════════════════════════════\n');
}

module.exports = { runGAIntelligenceSuite };
if (require.main === module) runGAIntelligenceSuite().catch(console.error);
