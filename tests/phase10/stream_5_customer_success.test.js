/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Phase 10 Stream 5 — Customer Success & Procurement Test Suite
 * File           : tests/phase10/stream_5_customer_success.test.js
 * Version        : 2026.1.0-LTS
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | GOVERNMENT | RESTRICTED
 *
 * Governance:
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 *
 * Standards:
 * - ISO 27001
 * - SOC 2 Type II
 * - OWASP ASVS v4.0
 * - NIST SP 800-53
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const CustomerSuccessEngine = require('../../engine/commercial/CustomerSuccessEngine');

async function runStream5CustomerSuccessTests() {
  console.log('================================================================================');
  console.log('  EAORCS PHASE 10: STREAM 5 — CUSTOMER SUCCESS & PROCUREMENT SUITE');
  console.log('================================================================================\n');

  const engine = new CustomerSuccessEngine({
    organization: 'Ujomor Systems & Enterprise Governance',
    platformVersion: '2026.1.0-LTS'
  });

  // ---------------------------------------------------------------------------
  // 1. Engine Instantiation & Initialization
  // ---------------------------------------------------------------------------
  console.log('[1/8] Verifying CustomerSuccessEngine Instantiation...');
  assert.ok(engine instanceof CustomerSuccessEngine, 'Engine must be instance of CustomerSuccessEngine');
  assert.strictEqual(engine.organization, 'Ujomor Systems & Enterprise Governance', 'Organization mismatch');
  assert.strictEqual(engine.platformVersion, '2026.1.0-LTS', 'Platform version mismatch');
  console.log('      ✅ Engine initialized cleanly.\n');

  // ---------------------------------------------------------------------------
  // 2. Procurement Pack Compilation & Cryptographic Verification
  // ---------------------------------------------------------------------------
  console.log('[2/8] Testing Procurement Pack Compilation & Cryptographic Verification...');
  const pack = engine.compileProcurementPack({
    customerName: 'Global Defense Systems Inc.',
    industry: 'Aerospace & Defense',
    deploymentMode: 'Air-Gapped Sovereign'
  });

  assert.ok(pack.packageId.startsWith('pack-'), 'Package ID must start with pack-');
  assert.strictEqual(pack.customerName, 'Global Defense Systems Inc.', 'Customer name mismatch');
  assert.strictEqual(pack.deploymentMode, 'Air-Gapped Sovereign', 'Deployment mode mismatch');
  assert.strictEqual(pack.vendorProfile.legalEntity, 'Ujomor Systems & Enterprise Governance Ltd.', 'Legal entity mismatch');
  assert.strictEqual(pack.certifications.iso27001.status, 'CERTIFIED', 'ISO 27001 status must be CERTIFIED');
  assert.strictEqual(pack.certifications.soc2Type2.status, 'CERTIFIED', 'SOC 2 Type II status must be CERTIFIED');
  assert.strictEqual(pack.slaSpecification.availabilityTarget, '99.99%', 'SLA availability target mismatch');
  assert.ok(pack.verificationSignature, 'Verification signature must be present');

  // Verify HMAC/SHA-256 signature validity
  const signatureToVerify = pack.verificationSignature;
  delete pack.verificationSignature;
  delete pack.signedBy;
  const recalculatedChecksum = crypto.createHash('sha256').update(JSON.stringify(pack)).digest('hex');
  assert.strictEqual(signatureToVerify, recalculatedChecksum, 'Cryptographic checksum signature mismatch');
  console.log('      ✅ Procurement pack compiled and cryptographically verified.\n');

  // ---------------------------------------------------------------------------
  // 3. Pilot Metric Evaluation & Benchmark Analysis
  // ---------------------------------------------------------------------------
  console.log('[3/8] Testing Pilot Metric Evaluation & Benchmark Transformation...');
  const pilotData = {
    baselineManualHoursPerMonth: 450,
    automatedHoursPerMonth: 45,
    baselineVulnerabilityDetectionRate: 68.5,
    pilotVulnerabilityDetectionRate: 99.8,
    baselineAuditPrepDays: 45,
    pilotAuditPrepDays: 2,
    baselineFalsePositiveRate: 32.0,
    pilotFalsePositiveRate: 1.2,
    pilotDurationWeeks: 4,
    pilotExecutions: 120
  };

  const evalResult = engine.evaluatePilotMetrics(pilotData);
  assert.strictEqual(evalResult.improvements.hoursSavedPerMonth, 405, 'Hours saved per month calculation error');
  assert.strictEqual(evalResult.improvements.hoursSavedPerYear, 4860, 'Hours saved per year calculation error');
  assert.strictEqual(evalResult.improvements.complianceVelocityMultiplier, 10, 'Velocity multiplier should be 10x');
  assert.strictEqual(evalResult.improvements.auditPrepTimeReductionPercent, 95.56, 'Audit prep reduction error');
  assert.strictEqual(evalResult.improvements.vulnerabilityDetectionImprovementPercent, 31.3, 'Detection improvement error');
  assert.strictEqual(evalResult.improvements.falsePositiveReductionPercent, 30.8, 'False positive reduction error');
  assert.ok(evalResult.pilotSuccessScore >= 90, `Pilot success score (${evalResult.pilotSuccessScore}) should be >= 90`);
  assert.strictEqual(evalResult.decisionThresholdPassed, true, 'Decision threshold should pass');
  assert.strictEqual(evalResult.recommendationStatus, 'PASSED_BENCHMARK_PROCEED_TO_ENTERPRISE_CONTRACT', 'Status mismatch');
  console.log('      ✅ Pilot metrics evaluated with 100% accuracy.\n');

  // ---------------------------------------------------------------------------
  // 4. Enterprise ROI Verification & Mathematical Precision
  // ---------------------------------------------------------------------------
  console.log('[4/8] Testing Enterprise ROI Calculation Accuracy...');
  const roiParams = {
    fteCount: 15,
    fteAverageAnnualCost: 180000,
    hoursSpentOnCompliancePercent: 30,
    eaorcsAutomationEfficiency: 85,
    incidentResponseSavingsAnnual: 250000,
    toolingConsolidationSavingsAnnual: 120000,
    eaorcsAnnualLicenseCost: 150000
  };

  const roiResult = engine.calculateEnterpriseROI(roiParams);
  // Annual FTE Cost Total: 15 * 180,000 = 2,700,000
  assert.strictEqual(roiResult.annualBreakdown.annualFteCostTotal, 2700000, 'FTE total cost mismatch');
  // Compliance Cost Before: 2,700,000 * 0.30 = 810,000
  assert.strictEqual(roiResult.annualBreakdown.annualFteComplianceCostBefore, 810000, 'Compliance cost before mismatch');
  // FTE Compliance Savings: 810,000 * 0.85 = 688,500
  assert.strictEqual(roiResult.annualBreakdown.annualFteComplianceSavings, 688500, 'FTE compliance savings mismatch');
  // Gross Savings: 688,500 + 250,000 + 120,000 = 1,058,500
  assert.strictEqual(roiResult.annualBreakdown.totalAnnualGrossSavings, 1058500, 'Total annual gross savings mismatch');
  // Net Savings: 1,058,500 - 150,000 = 908,500
  assert.strictEqual(roiResult.annualBreakdown.totalAnnualNetSavings, 908500, 'Total annual net savings mismatch');
  // ROI Percentage: (908,500 / 150,000) * 100 = 605.67%
  assert.strictEqual(roiResult.metrics.roiPercentage, 605.67, 'ROI percentage mismatch');
  // Payback Period: (150,000 / 1,058,500) * 12 = 1.7 months
  assert.strictEqual(roiResult.metrics.paybackPeriodMonths, 1.7, 'Payback period mismatch');
  // 3-Year Net Savings: (1,058,500 * 3) - (150,000 * 3) = 2,725,500
  assert.strictEqual(roiResult.metrics.threeYearProjectedNetSavings, 2725500, '3-Year net savings mismatch');
  console.log('      ✅ ROI calculation verified with high mathematical precision.\n');

  // ---------------------------------------------------------------------------
  // 5. Case Study Evidence Generation
  // ---------------------------------------------------------------------------
  console.log('[5/8] Testing Case Study Evidence Package Generation...');
  const caseStudy = engine.generateCaseStudyEvidence({
    clientName: 'Air Roofers Inc.',
    industry: 'Roofing & Construction Enterprise Software'
  });

  assert.ok(caseStudy.caseStudyId.startsWith('cs-'), 'Case study ID should start with cs-');
  assert.strictEqual(caseStudy.clientProfile.clientName, 'Air Roofers Inc.', 'Client name mismatch');
  assert.strictEqual(caseStudy.verifiedTrustScore, 99.4, 'Trust score mismatch');
  assert.ok(caseStudy.executiveTestimonial.quote, 'Executive quote missing');
  assert.ok(caseStudy.verificationSignature, 'Case study signature missing');
  console.log('      ✅ Case study evidence package generated successfully.\n');

  // ---------------------------------------------------------------------------
  // 6. Vendor Risk Scorecard Evaluation
  // ---------------------------------------------------------------------------
  console.log('[6/8] Testing Vendor Risk Scorecard Evaluation...');
  const scorecard = engine.getVendorRiskScorecard();

  assert.strictEqual(scorecard.totalScore, 100, 'Vendor risk score must be 100');
  assert.strictEqual(scorecard.maxTotalScore, 100, 'Max total score must be 100');
  assert.strictEqual(scorecard.scorePercentage, 100, 'Score percentage must be 100%');
  assert.strictEqual(scorecard.riskRating, 'VERY_LOW_RISK', 'Risk rating mismatch');
  assert.strictEqual(scorecard.procurementApproval, 'APPROVED_FOR_ENTERPRISE_DEPLOYMENT', 'Procurement approval status mismatch');
  console.log('      ✅ Vendor risk scorecard verified (100/100 exemplary rating).\n');

  // ---------------------------------------------------------------------------
  // 7. Package Export Functionality (JSON & Markdown)
  // ---------------------------------------------------------------------------
  console.log('[7/8] Testing Package Export (JSON & Markdown)...');
  const jsonExport = engine.exportPackage(pack, 'json');
  assert.ok(jsonExport.includes('"customerName": "Global Defense Systems Inc."'), 'JSON export missing key content');

  const mdExport = engine.exportPackage({ packageId: pack.packageId, customerName: pack.customerName, industry: pack.industry, deploymentMode: pack.deploymentMode, verificationSignature: 'test-sig', vendorRiskScorecard: scorecard, roiAnalysis: roiResult }, 'markdown');
  assert.ok(mdExport.includes('# EAORCS Customer Success & Procurement Report'), 'Markdown header missing');
  assert.ok(mdExport.includes('Global Defense Systems Inc.'), 'Markdown customer missing');
  assert.ok(mdExport.includes('Vendor Risk Scorecard'), 'Markdown scorecard missing');
  assert.ok(mdExport.includes('605.67%'), 'Markdown ROI missing');
  console.log('      ✅ Export formats (JSON & Markdown) verified.\n');

  // ---------------------------------------------------------------------------
  // 8. Documentation Artifact Verification
  // ---------------------------------------------------------------------------
  console.log('[8/8] Verifying PROCUREMENT_DUE_DILIGENCE_PACK.md File Existence & Structure...');
  const docPath = path.resolve(__dirname, '../../docs/procurement/PROCUREMENT_DUE_DILIGENCE_PACK.md');
  assert.ok(fs.existsSync(docPath), 'PROCUREMENT_DUE_DILIGENCE_PACK.md must exist');
  const docContent = fs.readFileSync(docPath, 'utf8');
  assert.ok(docContent.includes('Enterprise Procurement Due Diligence Package'), 'Doc title missing');
  assert.ok(docContent.includes('Ujomor Systems Engineering & Governance Authority'), 'Doc author missing');
  assert.ok(docContent.includes('ISO/IEC 27001:2022'), 'Doc ISO standard missing');
  assert.ok(docContent.includes('Air Roofers Inc.'), 'Doc case study missing');
  assert.ok(docContent.includes('ENTERPRISE VENDOR RISK SCORECARD'), 'Doc risk scorecard missing');
  console.log('      ✅ PROCUREMENT_DUE_DILIGENCE_PACK.md verified on disk.\n');

  console.log('================================================================================');
  console.log('🎉 STREAM 5 CUSTOMER SUCCESS & PROCUREMENT TEST SUITE: 100% PASSED');
  console.log('================================================================================\n');
}

if (require.main === module) {
  runStream5CustomerSuccessTests().catch(err => {
    console.error('❌ Stream 5 Test Error:', err);
    process.exit(1);
  });
}

module.exports = runStream5CustomerSuccessTests;
