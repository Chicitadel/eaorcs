'use strict';
/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Tests
 * File           : tests/phase26/stream_d_developer_ecosystem.test.js
 * Version        : 2026.17.0
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

const DeveloperEcosystemPublisherEngine = require('../../engine/operations/DeveloperEcosystemPublisherEngine');
const MultiLanguageSdkRegistry = require('../../engine/operations/MultiLanguageSdkRegistry');
const IdeExtensionManifestCompiler = require('../../engine/operations/IdeExtensionManifestCompiler');
const fs = require('fs');
const path = require('path');

async function runTests() {
  let passed = 0; let failed = 0;
  async function test(name, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
    catch(e) { console.error(`  ❌ FAIL: ${name} — ${e.message}`); failed++; }
  }

  await test('DeveloperEcosystemPublisherEngine execution', async () => {
    const engine = new DeveloperEcosystemPublisherEngine();
    const result = await engine.run();
    if (result.engineType !== 'DEVELOPER_ECOSYSTEM_PUBLISHER_ENGINE') throw new Error('Invalid engineType');
    if (result.publishedSdksCount !== 3) throw new Error('Invalid publishedSdksCount');
    if (result.status !== 'PUBLISHED') throw new Error('Invalid status');
  });

  await test('MultiLanguageSdkRegistry execution', async () => {
    const registry = new MultiLanguageSdkRegistry();
    const result = await registry.run();
    if (result.registryType !== 'MULTI_LANGUAGE_SDK_REGISTRY') throw new Error('Invalid registryType');
    if (result.supportedLanguages.length !== 3) throw new Error('Invalid supportedLanguages');
    if (result.sdkBuildStatus !== 'PASS') throw new Error('Invalid sdkBuildStatus');
  });

  await test('IdeExtensionManifestCompiler execution', async () => {
    const compiler = new IdeExtensionManifestCompiler();
    const result = await compiler.run();
    if (result.compilerType !== 'IDE_EXTENSION_MANIFEST_COMPILER') throw new Error('Invalid compilerType');
    if (result.status !== 'COMPILED') throw new Error('Invalid status');
  });

  await test('Evidence file verification', async () => {
    const evidencePath = path.join(__dirname, '../../evidence/phase26_developer_ecosystem_evidence.json');
    const evidence = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));
    if (evidence.status !== 'VERIFIED') throw new Error('Invalid evidence status');
    if (evidence.phase !== '26') throw new Error('Invalid phase');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}
runTests().catch(e => { console.error(e); process.exit(1); });
