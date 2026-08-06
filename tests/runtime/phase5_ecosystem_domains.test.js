/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Phase 5 Ecosystem Domains & Commercial Roadmap Test Suite
 * File           : phase5_ecosystem_domains.test.js
 * Version        : 2026.3.0-LTS
 * Author         : Air Roofers Platform Governance Authority
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
const fs = require('fs');
const path = require('path');

async function runPhase5DomainsSuite() {
  console.log('\n=== PHASE 5: Ecosystem Domains & Commercial Roadmap Test Suite ===\n');
  let passed = 0;
  let failed = 0;

  // 1. PHASE5_COMMERCIAL_ROADMAP.md Verification
  try {
    const roadmapPath = path.join(__dirname, '../../PHASE5_COMMERCIAL_ROADMAP.md');
    assert.ok(fs.existsSync(roadmapPath), 'PHASE5_COMMERCIAL_ROADMAP.md must exist');

    const content = fs.readFileSync(roadmapPath, 'utf-8');
    assert.ok(content.includes('*.airroofers.eu'));
    assert.ok(content.includes('Mandatag'));
    assert.ok(content.includes('license.airroofers.eu'));
    assert.ok(content.includes('AeroBill'));
    assert.ok(content.includes('billing.airroofers.eu'));
    assert.ok(content.includes('trust.airroofers.eu'));
    assert.ok(content.includes('Phase 5.1'));
    assert.ok(content.includes('Phase 5.7'));

    console.log('✅ 1. PHASE5_COMMERCIAL_ROADMAP.md Document Verified');
    passed++;
  } catch (err) {
    console.error('❌ 1. PHASE5_COMMERCIAL_ROADMAP.md Verification FAILED:', err.message);
    failed++;
  }

  // 2. EcosystemDomainRegistry Verification (Mandatag/AeroBill Service vs EAORCS Product)
  try {
    const EcosystemDomainRegistry = require('../../engine/federation/EcosystemDomainRegistry');
    const registry = new EcosystemDomainRegistry();

    const verification = registry.verifyServiceClassifications();
    assert.strictEqual(verification.valid, true);
    assert.strictEqual(verification.status, 'CLASSIFICATION_VERIFIED');

    const mandatag = registry.resolveDomain('MANDATAG');
    assert.strictEqual(mandatag.domain, 'license.airroofers.eu');
    assert.strictEqual(mandatag.isCommercialProduct, false);

    const aerobill = registry.resolveDomain('AEROBILL');
    assert.strictEqual(aerobill.domain, 'billing.airroofers.eu');
    assert.strictEqual(aerobill.isCommercialProduct, false);

    const eaorcs = registry.resolveDomain('EAORCS');
    assert.strictEqual(eaorcs.domain, 'trust.airroofers.eu');
    assert.strictEqual(eaorcs.isCommercialProduct, true);

    console.log('✅ 2. EcosystemDomainRegistry PASSED (Mandatag & AeroBill Classified as Shared Services, EAORCS as Capability)');
    passed++;
  } catch (err) {
    console.error('❌ 2. EcosystemDomainRegistry FAILED:', err.message);
    failed++;
  }

  console.log(`\n${'═'.repeat(65)}`);
  if (failed === 0) {
    console.log(`🎉 ALL ${passed} PHASE 5 DOMAIN & ROADMAP TESTS PASSED!`);
  } else {
    console.log(`⚠️  ${passed} PASSED | ${failed} FAILED`);
  }
  console.log(`${'═'.repeat(65)}\n`);

  if (failed > 0) process.exit(1);
}

if (require.main === module) {
  runPhase5DomainsSuite().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { runPhase5DomainsSuite };
