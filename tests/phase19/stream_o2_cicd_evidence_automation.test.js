/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : CiCdEvidenceAutomation
 * File           : tests/phase19/stream_o2_cicd_evidence_automation.test.js
 * Version        : 2026.19.0
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

const BuildEvidencePublisher = require('../../engine/cicd/BuildEvidencePublisher');
const DeploymentEvidenceRecorder = require('../../engine/cicd/DeploymentEvidenceRecorder');
const PipelineAuditTrailEngine = require('../../engine/cicd/PipelineAuditTrailEngine');

async function runTests() {
  let passed = 0;
  let failed = 0;

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

  console.log('Running Phase 19 Stream O2 CI/CD Evidence Automation Tests...\n');

  await test('BuildEvidencePublisher produces correctly signed records', async () => {
    const engine = new BuildEvidencePublisher();
    const result = await engine.run();
    if (result.failedPublications !== 0) throw new Error('failedPublications is not 0');
    if (result.automatedPublishing !== true) throw new Error('automatedPublishing is not true');
    if (!result.buildEvidenceRecords || result.buildEvidenceRecords.length < 8) {
      throw new Error('Not enough build records');
    }
    for (const record of result.buildEvidenceRecords) {
      if (!record.evidenceSigned) throw new Error('Evidence not signed');
    }
  });

  await test('DeploymentEvidenceRecorder records all deployments', async () => {
    const engine = new DeploymentEvidenceRecorder();
    const result = await engine.run();
    if (result.missedRecordings !== 0) throw new Error('missedRecordings is not 0');
    if (!result.deploymentRecords || result.deploymentRecords.length < 5) {
      throw new Error('Not enough deployment records');
    }
    for (const record of result.deploymentRecords) {
      if (!record.evidenceRecorded) throw new Error('Deployment not recorded');
    }
  });

  await test('PipelineAuditTrailEngine maintains verified chain', async () => {
    const engine = new PipelineAuditTrailEngine();
    const result = await engine.run();
    if (result.chainIntegrity !== 'VERIFIED') throw new Error('chainIntegrity is not VERIFIED');
    if (result.tamperedRuns !== 0) throw new Error('tamperedRuns is not 0');
    if (!result.pipelineRuns || result.pipelineRuns.length < 15) {
      throw new Error('Not enough pipeline runs');
    }
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
