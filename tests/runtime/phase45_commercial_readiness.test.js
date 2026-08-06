/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Phase 4.5 — Commercial Readiness Completions Test Suite
 * File           : phase45_commercial_readiness.test.js
 * Version        : 2026.3.0-RC1
 * Author         : Platform Quality Engineering & Commercial Launch Authority
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

async function runPhase45Suite() {
  console.log('\n=== PHASE 4.5: Commercial Readiness Completions Suite ===\n');
  let passed = 0;
  let failed = 0;

  // 1. Launch Exception Register
  try {
    const LaunchExceptionRegister = require('../../engine/launch/LaunchExceptionRegister');
    const register = new LaunchExceptionRegister();

    const ex1 = register.registerException({
      severity: 'HIGH',
      description: 'Accessibility audit incomplete',
      mitigation: 'External audit booked for Sept 2026',
      owner: 'Accessibility Lead',
      dueDate: '2026-09-15',
    });
    assert.strictEqual(ex1.id, 'LE-0001');
    assert.strictEqual(ex1.status, 'OPEN');

    register.updateStatus('LE-0001', 'ACCEPTED', 'Accepted risk for RC1');
    const summary = register.generateRegisterSummary();
    assert.strictEqual(summary.totalExceptions, 1);
    assert.strictEqual(summary.byStatus.ACCEPTED, 1);

    console.log('✅ 1. LaunchExceptionRegister PASSED');
    passed++;
  } catch (err) {
    console.error('❌ 1. LaunchExceptionRegister FAILED:', err.message);
    failed++;
  }

  // 2. Release Train Governance
  try {
    const ReleaseTrain = require('../../engine/release/ReleaseTrain');
    const train = new ReleaseTrain();

    const art = train.registerArtifact({
      name: 'ISO 27001 Pack',
      type: 'GOVERNANCE_PACK',
      version: '1.0.0',
      stage: 'NIGHTLY',
    });

    const res = train.promoteArtifact(art.id, 'ALPHA', ['unit_tests_passing', 'no_critical_security_issues']);
    assert.strictEqual(res.promoted, true);
    assert.strictEqual(res.toStage, 'ALPHA');

    const report = train.getLifecycleReport();
    assert.strictEqual(report.totalArtifacts, 1);
    assert.strictEqual(report.stageSummary.ALPHA, 1);

    console.log('✅ 2. ReleaseTrain PASSED');
    passed++;
  } catch (err) {
    console.error('❌ 2. ReleaseTrain FAILED:', err.message);
    failed++;
  }

  // 3. Supply Chain Trust Center
  try {
    const SupplyChainTrustCenter = require('../../engine/supplychain/SupplyChainTrustCenter');
    const sctc = new SupplyChainTrustCenter();

    const comp = sctc.registerComponent({
      name: 'express',
      version: '4.18.2',
      type: 'direct',
      license: 'MIT',
      isSigned: true,
      signatureValid: true,
      slsaLevel: 3,
      sha256: 'abc123hash',
      provenance: 'github-actions',
    });

    sctc.recordCVE(comp.id, {
      cveId: 'CVE-2026-9999',
      cvssScore: 7.5,
      description: 'Prototype pollution vulnerability',
    });

    const dashboard = sctc.getDashboard();
    assert.strictEqual(dashboard.totalComponents, 1);
    assert.strictEqual(dashboard.cveExposure.high, 1);
    assert.ok(dashboard.sbomQuality.score > 0);

    console.log('✅ 3. SupplyChainTrustCenter PASSED');
    passed++;
  } catch (err) {
    console.error('❌ 3. SupplyChainTrustCenter FAILED:', err.message);
    failed++;
  }

  // 4. Procurement Center
  try {
    const ProcurementCenter = require('../../engine/commercial/ProcurementCenter');
    const pc = new ProcurementCenter();

    const summary = pc.generateProcurementSummary('ENTERPRISE');
    assert.strictEqual(summary.edition, 'ENTERPRISE');
    assert.ok(summary.sections.securityCertifications.length >= 5);

    const mapping = pc.getComplianceMapping('ISO 27001');
    assert.strictEqual(mapping.controlsCovered, 114);

    console.log('✅ 4. ProcurementCenter PASSED');
    passed++;
  } catch (err) {
    console.error('❌ 4. ProcurementCenter FAILED:', err.message);
    failed++;
  }

  // 5. Evidence Package Generator
  try {
    const EvidencePackageGenerator = require('../../engine/evidence/EvidencePackageGenerator');
    const epg = new EvidencePackageGenerator();

    const pkg = epg.generateProcurementPackage('tenant-acme', 'ENTERPRISE');
    assert.ok(pkg.packageId.startsWith('pkg-'));
    assert.strictEqual(pkg.sections.length, 6);
    assert.ok(pkg.checksum.length === 64);

    console.log('✅ 5. EvidencePackageGenerator PASSED');
    passed++;
  } catch (err) {
    console.error('❌ 5. EvidencePackageGenerator FAILED:', err.message);
    failed++;
  }

  // 6. Customer Success Portal
  try {
    const CustomerSuccessPortal = require('../../engine/portal/CustomerSuccessPortal');
    const csp = new CustomerSuccessPortal();

    csp.registerTenantJourney('tenant-acme', 'ENTERPRISE');
    csp.recordMilestone('tenant-acme', 'repositoryConnected');
    csp.recordMilestone('tenant-acme', 'firstTrustScoreGenerated');

    const dash = csp.getSuccessDashboard('tenant-acme');
    assert.ok(dash.healthScore >= 20);
    assert.strictEqual(dash.milestones.repositoryConnected, true);

    console.log('✅ 6. CustomerSuccessPortal PASSED');
    passed++;
  } catch (err) {
    console.error('❌ 6. CustomerSuccessPortal FAILED:', err.message);
    failed++;
  }

  // 7. Independent Evidence Repository
  try {
    const IndependentEvidenceRepository = require('../../engine/evidence/IndependentEvidenceRepository');
    const repo = new IndependentEvidenceRepository();

    repo.storeEvidence({
      title: 'Unit Test Coverage Report',
      type: 'UNIT_TEST',
      evidenceClass: 'INTERNAL',
      source: 'Jest Test Runner',
      data: { coveragePct: 98.4 },
    });

    const extEv = repo.storeEvidence({
      title: 'Third-Party Penetration Test',
      type: 'PENETRATION_TEST',
      evidenceClass: 'EXTERNAL',
      source: 'CyberSecure Int.',
      verifier: 'Cert-Auditor-7',
      data: { status: 'PASSED' },
    });

    const internal = repo.getEvidenceByClass('INTERNAL');
    const external = repo.getEvidenceByClass('EXTERNAL');
    assert.strictEqual(internal.length, 1);
    assert.strictEqual(external.length, 1);

    const verified = repo.verifyEvidenceIntegrity(extEv.id);
    assert.strictEqual(verified.valid, true);

    console.log('✅ 7. IndependentEvidenceRepository PASSED');
    passed++;
  } catch (err) {
    console.error('❌ 7. IndependentEvidenceRepository FAILED:', err.message);
    failed++;
  }

  console.log(`\n${'═'.repeat(65)}`);
  if (failed === 0) {
    console.log(`🎉 ALL ${passed} PHASE 4.5 COMMERCIAL READINESS TESTS PASSED!`);
  } else {
    console.log(`⚠️  ${passed} PASSED | ${failed} FAILED`);
  }
  console.log(`${'═'.repeat(65)}\n`);

  if (failed > 0) process.exit(1);
}

if (require.main === module) {
  runPhase45Suite().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { runPhase45Suite };
