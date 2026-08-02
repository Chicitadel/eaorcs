/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Phase 11 Stream 2 — Enterprise Deployments & Customer Outcomes Test Suite
 * File           : tests/phase11/stream_2_enterprise_deployments.test.js
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
const EnterprisePilotEngine = require('../../engine/operations/EnterprisePilotEngine');

async function runStream2EnterpriseDeploymentsTests() {
  console.log('================================================================================');
  console.log('  EAORCS PHASE 11: STREAM 2 — ENTERPRISE DEPLOYMENTS & CUSTOMER OUTCOMES SUITE');
  console.log('================================================================================\n');

  const engine = new EnterprisePilotEngine({
    organization: 'Ujomor Systems & Enterprise Governance',
    platformVersion: '2026.1.0-LTS',
    blendedHourlyRateUSD: 150,
    incidentCostPerHourUSD: 1200,
    secretKey: 'STREAM_2_VERIFICATION_SECRET_2026'
  });

  // ---------------------------------------------------------------------------
  // 1. Engine Instantiation & Configuration
  // ---------------------------------------------------------------------------
  console.log('[1/8] Verifying EnterprisePilotEngine Instantiation...');
  assert.ok(engine instanceof EnterprisePilotEngine, 'Engine must be instance of EnterprisePilotEngine');
  assert.strictEqual(engine.organization, 'Ujomor Systems & Enterprise Governance', 'Organization mismatch');
  assert.strictEqual(engine.platformVersion, '2026.1.0-LTS', 'Platform version mismatch');
  console.log('      ✅ EnterprisePilotEngine instantiated successfully.\n');

  // ---------------------------------------------------------------------------
  // 2. Compliance Velocity Multiplier Calculation
  // ---------------------------------------------------------------------------
  console.log('[2/8] Testing Compliance Velocity Multiplier & Efficiency Calculation...');
  const velocityResult = engine.calculateComplianceVelocity(160, 40);
  assert.strictEqual(velocityResult.baselineAuditHours, 160, 'Baseline hours mismatch');
  assert.strictEqual(velocityResult.pilotAuditHours, 40, 'Pilot hours mismatch');
  assert.strictEqual(velocityResult.multiplier, 4.0, 'Multiplier should be 4.0x');
  assert.strictEqual(velocityResult.hoursSaved, 120, 'Hours saved should be 120');
  assert.strictEqual(velocityResult.percentageImprovement, 75.0, 'Percentage improvement should be 75%');
  assert.strictEqual(velocityResult.rating, 'EXCEPTIONAL', 'Rating should be EXCEPTIONAL');
  console.log(`      ✅ Compliance Velocity: ${velocityResult.multiplier}x Multiplier (${velocityResult.percentageImprovement}% faster).\n`);

  // ---------------------------------------------------------------------------
  // 3. MTTR Reduction Tracking
  // ---------------------------------------------------------------------------
  console.log('[3/8] Testing MTTR Reduction Tracking...');
  const mttrResult = engine.trackMTTRReduction(180, 25, 20);
  assert.strictEqual(mttrResult.baselineMTTRMinutes, 180, 'Baseline MTTR mismatch');
  assert.strictEqual(mttrResult.pilotMTTRMinutes, 25, 'Pilot MTTR mismatch');
  assert.strictEqual(mttrResult.reductionPercentage, 86.11, 'Reduction percentage mismatch');
  assert.strictEqual(mttrResult.totalMinutesSaved, 3100, 'Total minutes saved mismatch');
  assert.strictEqual(mttrResult.hoursSavedTotal, 51.67, 'Hours saved total mismatch');
  assert.strictEqual(mttrResult.tier, 'ELITE_REDUCTION', 'Tier should be ELITE_REDUCTION');
  console.log(`      ✅ MTTR Reduction: ${mttrResult.reductionPercentage}% reduction (${mttrResult.hoursSavedTotal} hrs saved).\n`);

  // ---------------------------------------------------------------------------
  // 4. SLA Tracking Evaluation
  // ---------------------------------------------------------------------------
  console.log('[4/8] Testing SLA Tracking & Compliance Evaluation...');
  const targetSLAs = [
    { id: 'SLA-UPTIME', name: 'Platform Availability', metricKey: 'uptime', targetValue: 99.9, operator: '>=' },
    { id: 'SLA-VELOCITY', name: 'Compliance Velocity', metricKey: 'velocity', targetValue: 2.0, operator: '>=' },
    { id: 'SLA-MTTR', name: 'MTTR Maximum Threshold', metricKey: 'mttr', targetValue: 30, operator: '<=' }
  ];
  const actualMetrics = {
    uptime: 99.98,
    velocity: 3.5,
    mttr: 20
  };
  const slaResult = engine.evaluateSLATracking(targetSLAs, actualMetrics);
  assert.strictEqual(slaResult.totalSLAs, 3, 'Total SLAs count mismatch');
  assert.strictEqual(slaResult.metSLAs, 3, 'Met SLAs count mismatch');
  assert.strictEqual(slaResult.breachCount, 0, 'Breach count should be 0');
  assert.strictEqual(slaResult.overallSlaComplianceRate, 100, 'Compliance rate should be 100%');
  console.log('      ✅ SLA Tracking: 100% compliance rate across 3 SLAs.\n');

  // ---------------------------------------------------------------------------
  // 5. Comprehensive Pilot Metric Evaluation
  // ---------------------------------------------------------------------------
  console.log('[5/8] Evaluating Full Customer Pilot Benchmark Metrics...');
  const samplePilot = {
    pilotId: 'PILOT-DEFENSE-7701',
    customerName: 'AeroGov Cyber Defense Corp',
    industry: 'Aerospace & National Security',
    durationDays: 90,
    activeUsers: 120,
    platformPilotCostUSD: 30000,
    baselineMetrics: {
      auditHoursPerMonth: 200,
      mttrMinutes: 240
    },
    pilotMetrics: {
      auditHoursPerMonth: 50,
      mttrMinutes: 30,
      incidentCount: 15,
      uptimePercentage: 99.99,
      auditPassRatePercentage: 100.0
    }
  };

  const evaluation = engine.evaluatePilotMetrics(samplePilot);
  assert.strictEqual(evaluation.pilotId, 'PILOT-DEFENSE-7701', 'Pilot ID mismatch');
  assert.strictEqual(evaluation.customerName, 'AeroGov Cyber Defense Corp', 'Customer name mismatch');
  assert.strictEqual(evaluation.velocity.multiplier, 4.0, 'Velocity multiplier mismatch');
  assert.strictEqual(evaluation.mttr.reductionPercentage, 87.5, 'MTTR reduction mismatch');
  assert.strictEqual(evaluation.slaEvaluation.overallSlaComplianceRate, 100, 'SLA compliance mismatch');
  assert.strictEqual(evaluation.pilotStatus, 'EXCEEDED', 'Pilot status should be EXCEEDED');
  assert.ok(evaluation.healthScore > 90, 'Health score should be > 90');
  assert.ok(evaluation.verification.SHA256Digest, 'SHA256Digest should be defined');
  assert.ok(evaluation.verification.signature, 'Signature should be defined');
  console.log(`      ✅ Pilot Evaluation: Status=${evaluation.pilotStatus}, HealthScore=${evaluation.healthScore}, ROI=${evaluation.financials.roiPercentage}%.\n`);

  // ---------------------------------------------------------------------------
  // 6. Pilot ROI Verification
  // ---------------------------------------------------------------------------
  console.log('[6/8] Verifying Customer ROI & Financial Benefit Ledger...');
  const roiSummary = engine.calculatePilotROI(samplePilot, { annualPlatformCostUSD: 120000 });
  assert.strictEqual(roiSummary.pilotId, 'PILOT-DEFENSE-7701', 'Pilot ID mismatch');
  assert.strictEqual(roiSummary.annualPlatformCostUSD, 120000, 'Annual platform cost mismatch');
  assert.ok(roiSummary.netAnnualBenefitUSD > 0, 'Net benefit should be positive');
  assert.ok(roiSummary.annualRoiPercentage > 100, 'ROI percentage should be > 100%');
  assert.strictEqual(roiSummary.financialRating, 'ELITE_INVESTMENT', 'Rating should be ELITE_INVESTMENT');
  console.log(`      ✅ ROI Verification: Annual Net Benefit=$${roiSummary.netAnnualBenefitUSD.toLocaleString()}, Annual ROI=${roiSummary.annualRoiPercentage}%.\n`);

  // ---------------------------------------------------------------------------
  // 7. Case Study Evidence Package Generation
  // ---------------------------------------------------------------------------
  console.log('[7/8] Testing Case Study Package Generation...');
  const caseStudyPackage = engine.compileCaseStudyPackage('PILOT-DEFENSE-7701', {
    confidentiality: 'RESTRICTED_ENTERPRISE'
  });
  assert.ok(caseStudyPackage.caseStudyId.startsWith('CS-PILOT-DEFENSE-7701'), 'Case study ID format mismatch');
  assert.strictEqual(caseStudyPackage.executiveSummary.customerName, 'AeroGov Cyber Defense Corp', 'Executive summary customer name mismatch');
  assert.strictEqual(caseStudyPackage.evidenceArtifacts.length, 4, 'Should contain 4 evidence artifacts');
  assert.strictEqual(caseStudyPackage.governanceAttestation.complianceState, 'FULL_CONFORMANCE', 'Governance compliance state mismatch');
  assert.ok(caseStudyPackage.securityVerification.SHA256Digest, 'Verification digest must exist');
  console.log(`      ✅ Case Study Package: ID=${caseStudyPackage.caseStudyId} generated with ${caseStudyPackage.evidenceArtifacts.length} evidence artifacts.\n`);

  // ---------------------------------------------------------------------------
  // 8. Cryptographic Package Verification
  // ---------------------------------------------------------------------------
  console.log('[8/8] Verifying Case Study Cryptographic Integrity...');
  const verificationResult = engine.verifyCaseStudyPackage(caseStudyPackage);
  assert.strictEqual(verificationResult.isValid, true, 'Case study package verification must pass');
  assert.strictEqual(verificationResult.isDigestValid, true, 'Digest must be valid');
  assert.strictEqual(verificationResult.isSignatureValid, true, 'Signature must be valid');
  console.log('      ✅ Case Study Cryptographic Integrity verified cleanly.\n');

  console.log('================================================================================');
  console.log('  🎉 PHASE 11 STREAM 2: ALL 8 TEST SUITES PASSED 100% CLEANLY');
  console.log('================================================================================\n');
}

if (require.main === module) {
  runStream2EnterpriseDeploymentsTests().catch(err => {
    console.error('❌ Phase 11 Stream 2 Test Failure:', err);
    process.exit(1);
  });
}

module.exports = runStream2EnterpriseDeploymentsTests;
