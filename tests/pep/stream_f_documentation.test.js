/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : PEP Stream F — Enterprise Documentation & Knowledge Base Test Suite
 * File           : tests/pep/stream_f_documentation.test.js
 * Version        : 2026.1.0-LTS
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
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const EnterpriseDocPortalEngine = require('../../engine/portal/EnterpriseDocPortalEngine');

function runStreamFDocumentationTests() {
  console.log('================================================================================');
  console.log('  EAORCS PEP STREAM F — ENTERPRISE DOCUMENTATION & KNOWLEDGE BASE SUITE');
  console.log('================================================================================\n');

  const engine = new EnterpriseDocPortalEngine({
    portalName: 'EAORCS Product Execution Program Test Portal',
    version: '2026.1.0-LTS'
  });

  // --------------------------------------------------------------------------
  // 1. Verify Role-Based Documentation Bundle Exports
  // --------------------------------------------------------------------------
  console.log('[1/4] Verifying Role-Based Documentation Bundle Exports...');

  const EXPECTED_ROLES = [
    'Developers',
    'Architects',
    'Security',
    'Compliance',
    'Operations',
    'Support',
    'Procurement'
  ];

  // Test Exporting All Bundles
  const allDocs = engine.generateRoleDocs('all');
  assert.ok(allDocs, 'Expected allDocs bundle object');
  assert.strictEqual(allDocs.version, '2026.1.0-LTS');
  assert.deepStrictEqual(allDocs.supportedRoles, EXPECTED_ROLES, 'Supported roles list must match standard 7 enterprise roles');

  for (const roleName of EXPECTED_ROLES) {
    const bundle = allDocs.bundles[roleName];
    assert.ok(bundle, `Expected bundle for role: ${roleName}`);
    assert.strictEqual(bundle.role, roleName, `Bundle role should be ${roleName}`);
    assert.ok(bundle.title.includes(roleName) || bundle.title.length > 10, `Bundle title should be set for ${roleName}`);
    assert.ok(Array.isArray(bundle.sections) && bundle.sections.length > 0, `Bundle should contain sections for ${roleName}`);
    assert.ok(Array.isArray(bundle.tableOfContents) && bundle.tableOfContents.length > 0, `Bundle should contain TOC for ${roleName}`);
    assert.ok(typeof bundle.markdownContent === 'string' && bundle.markdownContent.length > 100, `Bundle markdownContent should be populated for ${roleName}`);
    assert.strictEqual(bundle.classification, 'RESTRICTED / ENTERPRISE');
  }

  console.log('      ✅ Successfully generated documentation bundles for all 7 enterprise roles.');

  // Test Individual Role Exports
  for (const roleName of EXPECTED_ROLES) {
    const singleBundle = engine.generateRoleDocs(roleName);
    assert.strictEqual(singleBundle.role, roleName);
    assert.ok(singleBundle.markdownContent.length > 0);
  }

  // Test Case-Insensitive / Synonym Role Normalization
  const devBundle = engine.generateRoleDocs('developer');
  assert.strictEqual(devBundle.role, 'Developers');

  const archBundle = engine.generateRoleDocs('arch');
  assert.strictEqual(archBundle.role, 'Architects');

  const secBundle = engine.generateRoleDocs('security');
  assert.strictEqual(secBundle.role, 'Security');

  console.log('      ✅ Role normalization and individual bundle exports verified.');

  // --------------------------------------------------------------------------
  // 2. Verify Markdown Link Validity & Integrity Engine
  // --------------------------------------------------------------------------
  console.log('\n[2/4] Verifying Markdown Link Validity & Integrity Engine...');

  // Validate Link Integrity across generated bundles
  for (const roleName of EXPECTED_ROLES) {
    const bundle = engine.generateRoleDocs(roleName);
    const linkReport = engine.validateMarkdownLinks(bundle);

    assert.ok(linkReport, 'Expected link validation report');
    assert.strictEqual(linkReport.valid, true, `Markdown link validation failed for role: ${roleName}`);
    assert.strictEqual(linkReport.brokenLinksCount, 0, `Expected 0 broken links for role: ${roleName}`);
    assert.ok(linkReport.totalLinks > 0, `Expected totalLinks > 0 for role: ${roleName}`);
    console.log(`      • [${roleName}] Verified ${linkReport.totalLinks} links (0 broken).`);
  }

  // Validate Detecting Broken Links Correctly
  const brokenSampleMarkdown = `
# Sample Broken Document
- [Valid Link](#sample-broken-document)
- [Broken Anchor](#nonexistent-anchor-target)
- [Invalid URL](htptp://broken-url-format)
  `;

  const brokenReport = engine.validateMarkdownLinks(brokenSampleMarkdown);
  assert.strictEqual(brokenReport.valid, false, 'Expected broken report to be invalid');
  assert.strictEqual(brokenReport.brokenLinksCount, 2, 'Expected 2 broken links detected');
  assert.strictEqual(brokenReport.validLinksCount, 1, 'Expected 1 valid link detected');

  console.log('      ✅ Markdown link integrity engine accurately detects valid links and flags broken links.');

  // --------------------------------------------------------------------------
  // 3. Verify OpenAPI Playground Specs Export
  // --------------------------------------------------------------------------
  console.log('\n[3/4] Verifying OpenAPI Playground Specs Export...');

  const openApiSpec = engine.exportOpenApiPlaygroundSpecs({
    title: 'EAORCS Production API Playground Spec',
    version: '2026.1.0-LTS'
  });

  assert.ok(openApiSpec, 'Expected OpenAPI spec object');
  assert.strictEqual(openApiSpec.openapi, '3.0.3', 'OpenAPI version must be 3.0.3');
  assert.strictEqual(openApiSpec.info.title, 'EAORCS Production API Playground Spec');
  assert.strictEqual(openApiSpec.info.version, '2026.1.0-LTS');
  assert.ok(Array.isArray(openApiSpec.servers) && openApiSpec.servers.length >= 2, 'Must include production and sandbox servers');

  // Verify paths
  const requiredPaths = ['/health', '/audit/run', '/governance/policies', '/evidence/collect', '/identity/verify'];
  for (const pathKey of requiredPaths) {
    assert.ok(openApiSpec.paths[pathKey], `OpenAPI spec must define path: ${pathKey}`);
  }

  // Verify Security Schemes
  assert.ok(openApiSpec.components.securitySchemes.BearerAuth, 'Must include BearerAuth security scheme');
  assert.ok(openApiSpec.components.securitySchemes.ApiKeyAuth, 'Must include ApiKeyAuth security scheme');
  assert.ok(openApiSpec.components.securitySchemes.OAuth2, 'Must include OAuth2 security scheme');

  // Verify Interactive Playground Config
  assert.ok(openApiSpec['x-playground-config'], 'Must contain x-playground-config extension');
  assert.strictEqual(openApiSpec['x-playground-config'].interactive, true);
  assert.strictEqual(openApiSpec['x-playground-config'].enableTryItOut, true);

  console.log('      ✅ OpenAPI 3.0.3 playground specification exported and validated.');

  // --------------------------------------------------------------------------
  // 4. Verify Knowledge Base Search & HTML Rendering
  // --------------------------------------------------------------------------
  console.log('\n[4/4] Verifying Knowledge Base Search & HTML Rendering...');

  const searchResults = engine.searchKnowledgeBase('Zero-Trust');
  assert.ok(Array.isArray(searchResults) && searchResults.length > 0, 'Search for "Zero-Trust" should return results');
  
  const htmlDoc = engine.exportBundleAsHtml('Developers');
  assert.ok(typeof htmlDoc === 'string' && htmlDoc.includes('<!DOCTYPE html>'), 'HTML export must generate valid HTML document');
  assert.ok(htmlDoc.includes('Developer'), 'HTML export must contain Developer persona content');

  console.log('      ✅ Knowledge base search and HTML documentation rendering verified.');

  console.log('\n================================================================================');
  console.log('  🎉 PEP STREAM F — ENTERPRISE DOCUMENTATION SUITE: PASSED 100% CLEANLY');
  console.log('================================================================================\n');
}

runStreamFDocumentationTests();
