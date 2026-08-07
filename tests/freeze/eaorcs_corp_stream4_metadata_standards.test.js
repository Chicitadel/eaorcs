/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Stream 4 Product Metadata & Standards Integration Test
 * File           : eaorcs_corp_stream4_metadata_standards.test.js
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
 * CORP: STREAM-04 Product Metadata Descriptors & Standards Integrator
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('[EAORCS Stream 4 Test] Starting verification of Product Metadata Descriptors & Standards Integrator...');

// Root path determination (relative from tests/freeze)
const rootDir = path.resolve(__dirname, '../../../../');

// Required 17 fields for product.yaml
const required17Fields = [
  'id',
  'name',
  'owner',
  'bounded_context',
  'platform_dependencies',
  'api_version',
  'sdk_version',
  'release_profile',
  'maturity',
  'licensing',
  'marketplace',
  'distribution',
  'support',
  'documentation',
  'compliance',
  'telemetry',
  'inherits_governance'
];

// Product yaml target files
const productYamlPaths = [
  path.join(rootDir, 'products', 'eaorcs', 'product.yaml'),
  path.join(rootDir, 'airroofers.eu', 'product.yaml'),
  path.join(rootDir, 'convergence.airroofers.eu', 'product.yaml')
];

productYamlPaths.forEach((filePath) => {
  assert.ok(fs.existsSync(filePath), `product.yaml MUST exist at path: ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf8');

  // Verify header block
  assert.ok(content.includes('Universal Autonomous AI Governance Operating System (UAIGOS)'), `File ${filePath} must contain corporate header block`);
  assert.ok(content.includes('Ujomor Systems & Enterprise Governance Authority'), `File ${filePath} must reference corporate author`);

  // Verify all 17 required fields
  required17Fields.forEach((field) => {
    // Regex matching YAML key at start of line (e.g., "id:", "name:")
    const regex = new RegExp(`^${field}:`, 'm');
    assert.ok(regex.test(content), `File ${filePath} MUST contain required field: "${field}"`);
  });
});

console.log('✓ All 3 product.yaml descriptors validated with 17 mandatory fields and UAIGOS headers.');

// Verify Platform_API_Standard.md
const apiStandardPath = path.join(rootDir, '00_engineering_guide', 'standards', 'Platform_API_Standard.md');
assert.ok(fs.existsSync(apiStandardPath), `Platform_API_Standard.md MUST exist at ${apiStandardPath}`);
const apiContent = fs.readFileSync(apiStandardPath, 'utf8');

// Verify API standard topics
assert.ok(apiContent.includes('Universal Autonomous AI Governance Operating System (UAIGOS)'), 'API Standard must contain corporate header block');
assert.ok(apiContent.includes('API Gateway Topology') || apiContent.includes('API Gateway Architecture'), 'API Standard must cover API Gateway');
assert.ok(apiContent.includes('api.airroofers.eu'), 'API Standard must reference api.airroofers.eu');
assert.ok(apiContent.includes('governance.airroofers.eu'), 'API Standard must reference governance.airroofers.eu');
assert.ok(apiContent.includes('eaorcs.airroofers.eu'), 'API Standard must reference eaorcs.airroofers.eu');
assert.ok(apiContent.includes('convergence.airroofers.eu'), 'API Standard must reference convergence.airroofers.eu');
assert.ok(apiContent.includes('packages.airroofers.eu'), 'API Standard must reference packages.airroofers.eu');
assert.ok(apiContent.includes('telemetry.airroofers.eu'), 'API Standard must reference telemetry.airroofers.eu');
assert.ok(apiContent.includes('docs.airroofers.eu'), 'API Standard must reference docs.airroofers.eu');
assert.ok(apiContent.includes('Ed25519'), 'API Standard must specify Ed25519 authentication');
assert.ok(apiContent.includes('mTLS'), 'API Standard must specify mTLS');
assert.ok(apiContent.includes('Versioning Policy') || apiContent.includes('API Versioning'), 'API Standard must specify versioning policy');

console.log('✓ Platform_API_Standard.md validated with Gateway, Subdomains, Auth & Versioning specifications.');

// Verify Platform_Security_Standard.md
const securityStandardPath = path.join(rootDir, '00_engineering_guide', 'standards', 'Platform_Security_Standard.md');
assert.ok(fs.existsSync(securityStandardPath), `Platform_Security_Standard.md MUST exist at ${securityStandardPath}`);
const secContent = fs.readFileSync(securityStandardPath, 'utf8');

// Verify Security standard topics
assert.ok(secContent.includes('Universal Autonomous AI Governance Operating System (UAIGOS)'), 'Security Standard must contain corporate header block');
assert.ok(secContent.includes('Zero Trust Architecture') || secContent.includes('Zero Trust'), 'Security Standard must cover Zero Trust');
assert.ok(secContent.includes('Ed25519'), 'Security Standard must cover Ed25519');
assert.ok(secContent.includes('AES-256'), 'Security Standard must cover AES-256');
assert.ok(secContent.includes('ISO/IEC 27001') || secContent.includes('ISO 27001'), 'Security Standard must map ISO 27001');
assert.ok(secContent.includes('SOC 2'), 'Security Standard must map SOC 2');
assert.ok(secContent.includes('OWASP ASVS'), 'Security Standard must map OWASP ASVS');
assert.ok(secContent.includes('NIST'), 'Security Standard must map NIST');
assert.ok(secContent.includes('EU AI Act'), 'Security Standard must map EU AI Act');

console.log('✓ Platform_Security_Standard.md validated with Zero Trust, Cryptography & Compliance mapping.');

console.log('\n[EAORCS Stream 4 Test] ALL STREAM 4 VERIFICATION TESTS PASSED SUCCESSFULLY! 🚀');
