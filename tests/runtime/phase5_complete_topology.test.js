/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Complete Subdomain Topology Test Suite
 * File           : phase5_complete_topology.test.js
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

async function runCompleteTopologySuite() {
  console.log('\n=== PHASE 5: Complete Subdomain & Infrastructure Topology Test Suite ===\n');
  let passed = 0;
  let failed = 0;

  // 1. EcosystemDomainRegistry Complete Topology Verification
  try {
    const EcosystemDomainRegistry = require('../../engine/federation/EcosystemDomainRegistry');
    const registry = new EcosystemDomainRegistry();

    const portals = registry.getCorporateAndDeveloperPortals();
    assert.strictEqual(portals.length, 4);

    const hub = registry.resolveDomain('HUB');
    assert.strictEqual(hub.domain, 'hub.airroofers.eu');
    assert.strictEqual(hub.type, 'CUSTOMER_OS');

    const dev = registry.resolveDomain('DEVELOPER');
    assert.strictEqual(dev.domain, 'developer.airroofers.eu');
    assert.strictEqual(dev.type, 'DEVELOPER_PORTAL');

    const devs = registry.resolveDomain('DEVELOPERS');
    assert.strictEqual(devs.domain, 'developers.airroofers.eu');
    assert.strictEqual(devs.type, 'EXTENSIBILITY_PLATFORM');

    const verification = registry.verifyServiceClassifications();
    assert.strictEqual(verification.valid, true);

    console.log('✅ 1. EcosystemDomainRegistry Complete Topology PASSED (Corporate, COS, Developer & Extensibility Tiers Verified)');
    passed++;
  } catch (err) {
    console.error('❌ 1. EcosystemDomainRegistry Complete Topology FAILED:', err.message);
    failed++;
  }

  console.log(`\n${'═'.repeat(65)}`);
  if (failed === 0) {
    console.log(`🎉 ALL ${passed} COMPLETE TOPOLOGY TESTS PASSED!`);
  } else {
    console.log(`⚠️  ${passed} PASSED | ${failed} FAILED`);
  }
  console.log(`${'═'.repeat(65)}\n`);

  if (failed > 0) process.exit(1);
}

if (require.main === module) {
  runCompleteTopologySuite().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { runCompleteTopologySuite };
