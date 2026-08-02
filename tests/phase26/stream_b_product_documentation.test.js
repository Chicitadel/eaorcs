/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Documentation
 * File           : tests/phase26/stream_b_product_documentation.test.js
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
'use strict';

const ProductDocumentationSuiteEngine = require('../../engine/operations/ProductDocumentationSuiteEngine');
const UserAndAdminGuidePublisher = require('../../engine/operations/UserAndAdminGuidePublisher');
const ApiAndSdkReferenceCompiler = require('../../engine/operations/ApiAndSdkReferenceCompiler');

async function runTests() {
  let passed = 0; let failed = 0;
  async function test(name, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
    catch(e) { console.error(`  ❌ FAIL: ${name} — ${e.message}`); failed++; }
  }

  await test('ProductDocumentationSuiteEngine should return correct payload', async () => {
    const engine = new ProductDocumentationSuiteEngine();
    const result = await engine.run();
    if (result.engineType !== 'PRODUCT_DOCUMENTATION_SUITE_ENGINE') throw new Error('Incorrect engineType');
    if (result.publishedGuidesCount !== 9) throw new Error('Incorrect publishedGuidesCount');
    if (result.apiEndpointsDocumentedCount !== 48) throw new Error('Incorrect apiEndpointsDocumentedCount');
    if (result.documentationCoveragePercent !== 100) throw new Error('Incorrect documentationCoveragePercent');
    if (result.status !== 'PUBLISHED') throw new Error('Incorrect status');
  });

  await test('UserAndAdminGuidePublisher should return correct payload', async () => {
    const publisher = new UserAndAdminGuidePublisher();
    const result = await publisher.run();
    if (result.publisherType !== 'USER_AND_ADMIN_GUIDE_PUBLISHER') throw new Error('Incorrect publisherType');
    if (result.userGuideStatus !== 'COMPLETE') throw new Error('Incorrect userGuideStatus');
    if (result.adminGuideStatus !== 'COMPLETE') throw new Error('Incorrect adminGuideStatus');
    if (result.disasterRecoveryGuideStatus !== 'COMPLETE') throw new Error('Incorrect disasterRecoveryGuideStatus');
    if (result.status !== 'READY') throw new Error('Incorrect status');
  });

  await test('ApiAndSdkReferenceCompiler should return correct payload', async () => {
    const compiler = new ApiAndSdkReferenceCompiler();
    const result = await compiler.run();
    if (result.compilerType !== 'API_AND_SDK_REFERENCE_COMPILER') throw new Error('Incorrect compilerType');
    if (result.openapiSpecVersion !== '3.1.0') throw new Error('Incorrect openapiSpecVersion');
    if (result.asyncapiSpecVersion !== '2.6.0') throw new Error('Incorrect asyncapiSpecVersion');
    if (result.status !== 'COMPILED') throw new Error('Incorrect status');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
