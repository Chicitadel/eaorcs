/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Master Integration Suite Runner
 * File           : cross_module_workflow_suite.js
 * Version        : 2026.1-LTS
 * Author         : Enterprise Architecture Authority & Verification Team
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
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
const { runPipeline } = require('./audit_to_certification_pipeline.test');
const { runWorkflow } = require('./tenant_audit_workflow.test');
const { runLifecycle } = require('./marketplace_plugin_lifecycle.test');
const { runVerificationChain } = require('./osap_verification_chain.test');

async function main() {
  console.log('================================================================');
  console.log('  EAORCS CROSS-MODULE WORKFLOW INTEGRATION SUITE');
  console.log('================================================================\n');

  const suites = [
    { name: 'Audit → Certification Pipeline', fn: runPipeline },
    { name: 'Tenant Audit Workflow',           fn: runWorkflow },
    { name: 'Marketplace Plugin Lifecycle',    fn: runLifecycle },
    { name: 'OSAP Verification Chain',         fn: runVerificationChain },
  ];

  let totalPassed = 0, totalFailed = 0;
  for (const suite of suites) {
    console.log(`\n=== ${suite.name} ===`);
    const start = Date.now();
    const r = await suite.fn();
    const elapsed = ((Date.now() - start)/1000).toFixed(2);
    totalPassed += r.passed; totalFailed += r.failed;
    const status = r.failed === 0 ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} — ${r.passed}/${r.passed+r.failed} steps in ${elapsed}s`);
  }

  console.log('\n================================================================');
  console.log(`  INTEGRATION SUITE COMPLETE: ${totalPassed} PASS / ${totalFailed} FAIL`);
  if (totalFailed > 0) { console.log('  STATUS: FAILURES DETECTED'); process.exit(1); }
  else { console.log('  STATUS: ALL INTEGRATION PIPELINES VERIFIED'); }
  console.log('================================================================\n');
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
