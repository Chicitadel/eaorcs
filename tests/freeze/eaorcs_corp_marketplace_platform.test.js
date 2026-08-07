/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Marketplace Platform Test Suite
 * File           : eaorcs_corp_marketplace_platform.test.js
 * Version        : 2026.3.1-LTS
 * Author         : Ujomor Systems & Enterprise Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-07
 * Last Modified  : 2026-08-07
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 * - Corporate Policy Governed
 *
 * CORP: Stream F — Marketplace Platform Verification
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

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const MarketplacePlatformEngine = require('../../engine/marketplace/MarketplacePlatformEngine');

async function testMarketplacePlatformSuite() {
  console.log('--- Running MarketplacePlatformEngine Tests ---');
  const engine = new MarketplacePlatformEngine();

  // 1. Get Plugin Categories
  const categories = engine.getPluginCategories();
  assert.ok(Array.isArray(categories));
  assert.ok(categories.length >= 4);
  assert.strictEqual(categories[0].category, 'Governance Packs');
  console.log('[PASS] 1. getPluginCategories returned plugin ecosystem categories');

  // 2. Get SDK Specification
  const sdk = engine.getSdkSpecification();
  assert.strictEqual(sdk.sdkVersion, '2026.3.1-LTS');
  assert.ok(Array.isArray(sdk.coreInterfaces));
  assert.strictEqual(sdk.coreInterfaces[0].interface, 'IEAORCSPlugin');
  console.log('[PASS] 2. getSdkSpecification returned core interfaces');

  // 3. Verify Plugin Package
  const verification = engine.verifyPluginPackage({
    name: 'EU-AI-Act-Compliance-Pack',
    version: '1.2.0',
    category: 'Governance Packs',
    signature: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  });
  assert.strictEqual(verification.valid, true);
  assert.strictEqual(verification.sandboxApproved, true);
  console.log('[PASS] 3. verifyPluginPackage verified valid plugin package');

  // 4. Get Governance Policy
  const gov = engine.getGovernancePolicy();
  assert.ok(Array.isArray(gov.partnerTiers));
  assert.ok(Array.isArray(gov.publishingWorkflow));
  console.log('[PASS] 4. getGovernancePolicy returned partner tiers and publishing workflow');

  // 5. Verify Signature
  const sigCheck = engine.verifySignature({ pluginId: 'P123' }, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  assert.strictEqual(sigCheck.verified, true);
  assert.strictEqual(sigCheck.algorithm, 'Ed25519 / SHA-256');
  console.log('[PASS] 5. verifySignature validated cryptographic signature');

  // 6. Export Marketplace Platform Doc
  const testDocPath = path.resolve(__dirname, '../../../../MARKETPLACE_PLATFORM.md');
  const docResult = engine.exportMarketplacePlatformDoc(testDocPath);
  assert.strictEqual(docResult.success, true);
  assert.ok(fs.existsSync(docResult.filePath));
  const fileContent = fs.readFileSync(docResult.filePath, 'utf8');
  assert.ok(fileContent.includes('Plugin Ecosystem & Extension Categories'));
  assert.ok(fileContent.includes('Extension Software Development Kit (SDK)'));
  assert.ok(fileContent.includes('Cryptographic Code Signing & Integrity Enforcement'));
  console.log('[PASS] 6. exportMarketplacePlatformDoc exported MARKETPLACE_PLATFORM.md');

  // 7. Engine Run Execution
  const runResult = await engine.run();
  assert.strictEqual(runResult.status, 'PASS');
  assert.strictEqual(runResult.streamId, 'Stream F');
  console.log('[PASS] 7. engine.run executed successfully');

  console.log('All MarketplacePlatformEngine tests passed.');
}

if (require.main === module) {
  testMarketplacePlatformSuite().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = testMarketplacePlatformSuite;
