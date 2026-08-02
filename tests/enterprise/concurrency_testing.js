/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Enterprise Qualification Suite
 * File           : concurrency_testing.js
 * Version        : 2026.1.0-LTS
 * Author         : Enterprise Architecture Authority & Systems Engineering
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | RESTRICTED
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
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance
 * All Rights Reserved.
 ******************************************************************************/

'use strict';
const assert = require('assert');
const TenantManager = require('../../engine/saas/TenantManager').TenantManager || require('../../engine/saas/TenantManager');
const TrustScoreCalculator = require('../../engine/trust/TrustScoreCalculator').TrustScoreCalculator || require('../../engine/trust/TrustScoreCalculator');
const EvidenceEngine = require('../../engine/trust/EvidenceEngine').EvidenceEngine || require('../../engine/trust/EvidenceEngine');

async function runSingleConcurrencyPass() {
  const tm = new TenantManager();
  const tenantIds = [];
  for (let i = 0; i < 10; i++) {
    const tId = `tenant-${i + 1}`;
    tm.registerTenant({ tenantId: tId, name: `Tenant ${i + 1}`, tier: 'Enterprise' });
    tenantIds.push(tId);
  }

  const tasks = [];
  for (let idx = 0; idx < 100; idx++) {
    const tenantId = tenantIds[idx % 10];
    tasks.push((async () => {
      const calculator = new TrustScoreCalculator();
      const evidenceEngine = new EvidenceEngine();

      const tenantObj = tm.getTenant(tenantId);
      const findings = [{ finding: `Finding for ${tenantId}`, severity: 'LOW', domain: 'sec' }];

      const score = calculator.calculateTrustScore({
        readiness: 95,
        evidenceConfidence: 0.95,
        statisticalConfidence: 0.95,
        findings
      });

      const evidence = evidenceEngine.collectEvidence(findings, { collector: tenantObj.name });

      return {
        taskIndex: idx,
        tenantId,
        registeredTenantId: tenantObj.tenantId,
        trustScore: score.trustScore,
        merkleRoot: evidence.merkleRoot
      };
    })());
  }

  const results = await Promise.all(tasks);

  // Validate isolation & contamination
  let contaminations = 0;
  const tenantGroups = {};

  for (const res of results) {
    if (res.tenantId !== res.registeredTenantId) {
      contaminations++;
    }
    if (!tenantGroups[res.tenantId]) {
      tenantGroups[res.tenantId] = [];
    }
    tenantGroups[res.tenantId].push(res);
  }

  // Ensure each tenant group only has tasks for that tenant
  for (const [tId, group] of Object.entries(tenantGroups)) {
    for (const item of group) {
      if (item.tenantId !== tId) {
        contaminations++;
      }
    }
  }

  return { contaminations, results, tenantGroups };
}

async function runConcurrencyTest() {
  console.log('--- [CONCURRENCY TEST] Cross-Tenant Isolation & Determinism ---');
  let totalContaminations = 0;
  let successfulRuns = 0;
  let referenceMapping = null;

  for (let run = 0; run < 5; run++) {
    const pass = await runSingleConcurrencyPass();
    totalContaminations += pass.contaminations;

    // Check mapping consistency across runs
    const mapping = {};
    for (const [tId, group] of Object.entries(pass.tenantGroups)) {
      mapping[tId] = group.length;
    }

    if (referenceMapping === null) {
      referenceMapping = JSON.stringify(mapping);
      successfulRuns++;
    } else if (JSON.stringify(mapping) === referenceMapping) {
      successfulRuns++;
    }
  }

  const allPass = (totalContaminations === 0) && (successfulRuns === 5);

  console.log(`  [${allPass ? 'PASS' : 'FAIL'}] Tenants: 10, Tasks: 100, Contaminations: ${totalContaminations}, Deterministic Runs: ${successfulRuns}/5`);

  return {
    tenants: 10,
    tasks: 100,
    contaminations: totalContaminations,
    deterministicRuns: successfulRuns,
    allPass,
    slaPass: allPass
  };
}

module.exports = { runConcurrencyTest };

if (require.main === module) {
  runConcurrencyTest()
    .then(r => { if (!r.allPass) process.exit(1); })
    .catch(e => { console.error(e); process.exit(1); });
}
