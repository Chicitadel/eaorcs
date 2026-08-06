/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Clean External Consumer Sample (@airroofers/governance-sdk)
 * File           : clean_external_consumer_sample.js
 * Version        : 2026.3.0-LTS
 * Author         : Air Roofers Platform Developer Experience
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : GOVERNMENT | ENTERPRISE | PUBLIC | DEMO
 *
 * Governance:
 * - Air Roofers External Consumer Integration Sample Standard
 *
 * Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const PublicGovernanceSdk = require('../PublicGovernanceSdk');

function runExternalConsumerDemo() {
  console.log('=== Air Roofers Public Governance SDK Integration Demo ===\n');

  // Initialize SDK
  const sdk = new PublicGovernanceSdk();

  // 1. Evaluate Runtime Policy
  const policyResult = sdk.evaluatePolicy({
    specVersion: '2026.3.0-LTS',
    passportSignature: 'f'.repeat(64),
    federationScore: 100,
  });
  console.log('Policy Decision:', policyResult.status, '->', policyResult.decision);

  // 2. Query Capability Provenance
  const provenance = sdk.queryProvenance('CAP-TRUST-SCORE');
  console.log('Capability Rationale:', provenance.explanation);

  // 3. Register Custom Industry Pack
  const packResult = sdk.registerSolutionPack({
    id: 'pack-banking-sovereign-v1',
    name: 'Sovereign Banking Governance Pack',
    version: '1.0.0',
  });
  console.log('Registered Pack:', packResult.packId, '->', packResult.status);

  return { success: true, policyResult, provenance, packResult };
}

if (require.main === module) {
  runExternalConsumerDemo();
}

module.exports = { runExternalConsumerDemo };
