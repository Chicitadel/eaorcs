/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Operational Readiness Subsystem Integration Suite
 * File           : op_readiness.test.js
 * Version        : 2026.2-LTS (v1.1.0-FROZEN Master Specification)
 * Author         : Architectural Governance Council & Platform Engineering
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Architecture Authority Approved & RATIFIED
 * - UAIGOS 3.0.0 & DPA/PDA v1.1.0-FROZEN Compliant
 * - ISO 27001 / SOC 2 / OWASP ASVS / NIST SP 800-161 / SLSA Level 4 Enforced
 *
 * Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const AirRoofersBillingClient = require('../../engine/integration/AirRoofersBillingClient');
const AirRoofersLicensingClient = require('../../engine/integration/AirRoofersLicensingClient');
const AirRoofersSupportClient = require('../../engine/integration/AirRoofersSupportClient');
const AirRoofersStorageClient = require('../../engine/integration/AirRoofersStorageClient');
const LspServerDaemon = require('../../engine/ide/LspServerDaemon');
const MultiTenantStorageGovernor = require('../../engine/storage/MultiTenantStorageGovernor');

async function runOpReadinessSuite() {
  console.log('\n=== TEST SUITE: Operational Readiness & Platform Adapters ===');

  // 1. Billing Client
  const billing = new AirRoofersBillingClient({ offlineMode: true });
  const billRes = await billing.reportUsage('audits', 10);
  assert.strictEqual(billRes.status, 'QUEUED_OFFLINE');
  console.log('✅ AirRoofersBillingClient PASSED');

  // 2. Licensing Client
  const licensing = new AirRoofersLicensingClient({ offlineMode: true });
  const licRes = await licensing.verifyLicense('eaorcs.core');
  assert.strictEqual(licRes.status, 'VALID_OFFLINE');
  console.log('✅ AirRoofersLicensingClient PASSED');

  // 3. Support Client
  const support = new AirRoofersSupportClient({ offlineMode: true });
  const supRes = await support.createTicket('Audit Error', 'Sample error description');
  assert.strictEqual(supRes.status, 'CREATED_OFFLINE');
  console.log('✅ AirRoofersSupportClient PASSED');

  // 4. Storage Client
  const storage = new AirRoofersStorageClient({ offlineMode: true });
  const storeRes = await storage.storeArtifact('test_artifact_001', { passport: 'AAA' });
  assert.strictEqual(storeRes.status, 'STORED');
  console.log('✅ AirRoofersStorageClient PASSED');

  // 5. MultiTenant Storage Governor
  const governor = new MultiTenantStorageGovernor();
  const govRes = governor.storeTenantArtifact('tenant_alpha', 'policy_01', { rule: 'ALLOW' });
  assert.strictEqual(govRes.status, 'STORED');
  const readRes = governor.readTenantArtifact('tenant_alpha', 'policy_01');
  assert.strictEqual(readRes.checksum_verified, true);
  console.log('✅ MultiTenantStorageGovernor PASSED');

  // 6. LSP Server Daemon
  const lspDaemon = new LspServerDaemon({ port: 8089 });
  const daemonStart = await lspDaemon.start();
  assert.strictEqual(daemonStart.status, 'LISTENING');
  const daemonStop = await lspDaemon.stop();
  assert.strictEqual(daemonStop.status, 'STOPPED');
  console.log('✅ LspServerDaemon PASSED');

  console.log('🎉 ALL OPERATIONAL READINESS TESTS PASSED SUCCESSFULLY!\n');
}

if (require.main === module) {
  runOpReadinessSuite().catch(err => {
    console.error('❌ OPERATIONAL READINESS TEST SUITE FAILED:', err);
    process.exit(1);
  });
}

module.exports = { runOpReadinessSuite };
