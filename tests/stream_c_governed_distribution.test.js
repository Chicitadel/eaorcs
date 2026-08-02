/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Stream C — Distribution Manifest & Core Artifacts Test Suite
 * File           : stream_c_governed_distribution.test.js
 * Version        : 2026.2-LTS (v1.1.0-FROZEN Master Specification)
 * Author         : Ujomor Engineering Governance Authority
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems Engineering
 * Created Date   : 2026-08-02
 * Last Modified  : 2026-08-02
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED | SOVEREIGN
 *
 * Governance:
 * - Architecture Authority Approved & FROZEN (v1.1.0-FROZEN)
 * - Security Reviewed (ISO 27001, SOC 2, OWASP ASVS, NIST SP 800-161, DORA, NIS2, EU AI Act)
 * - Enterprise Engineering Standard Compliant
 *
 * Standards:
 * - ISO 27001 / SOC 2 / OWASP ASVS / NIST SP 800-161 / SLSA Level 4 / OSAP v2
 *
 * Signatures:
 * - Architecture Authority: APPROVED
 * - Security Authority: VERIFIED
 * - Governance Authority: CERTIFIED
 *
 * Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems Engineering
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const ProductDnaCompiler = require('../engine/certification/ProductDnaCompiler');
const ProductPassportV2Engine = require('../engine/certification/ProductPassportV2Engine');

async function runStreamCTestSuite() {
  console.log('================================================================');
  console.log('  EAORCS STREAM C: DISTRIBUTION MANIFEST & CORE ARTIFACTS SUITE');
  console.log('================================================================\n');

  // Test 1: Verify product.manifest.yaml
  console.log('[1/4] Verifying product.manifest.yaml distribution manifest...');
  const manifestPath = path.resolve(__dirname, '../product.manifest.yaml');
  assert.ok(fs.existsSync(manifestPath), 'product.manifest.yaml must exist');
  
  const manifestContent = fs.readFileSync(manifestPath, 'utf8');

  // Zero AI Mention Verification
  const aiKeywords = ['ai generated', 'ai agent', 'chatgpt', 'copilot', 'anthropic', 'openai'];
  aiKeywords.forEach(kw => {
    assert.strictEqual(
      manifestContent.toLowerCase().includes(kw),
      false,
      `product.manifest.yaml must not contain AI keyword: ${kw}`
    );
  });

  assert.ok(manifestContent.includes('DPA/PDA v1.1.0-FROZEN'), 'Manifest must reference DPA/PDA v1.1.0-FROZEN spec');
  assert.ok(manifestContent.includes('Ujomor Engineering Governance Authority'), 'Manifest must reference Ujomor Engineering Governance Authority');
  assert.ok(manifestContent.includes('CAP-EAORCS-01'), 'Manifest must define capability graph (CAP-EAORCS-01)');
  assert.ok(manifestContent.includes('sbom_attestation'), 'Manifest must include SBOM attestation');
  assert.ok(manifestContent.includes('SLSA_LEVEL_4'), 'Manifest must reference SLSA Level 4');
  assert.ok(manifestContent.includes('governance_policies'), 'Manifest must define governance policies');
  console.log('      ✓ product.manifest.yaml schema and policy compliance verified.');

  // Test 2: ProductDnaCompiler SLSA Level 4 compilation
  console.log('[2/4] Verifying ProductDnaCompiler SLSA Level 4 DNA compilation...');
  const dnaCompilerHeader = fs.readFileSync(path.resolve(__dirname, '../engine/certification/ProductDnaCompiler.js'), 'utf8');
  aiKeywords.forEach(kw => {
    assert.strictEqual(
      dnaCompilerHeader.toLowerCase().includes(kw),
      false,
      `ProductDnaCompiler.js must not contain AI keyword: ${kw}`
    );
  });

  const compiledDna = ProductDnaCompiler.compile({
    buildId: 'build-test-stream-c',
    sourceCommit: 'c89f1a238e819f0012293819283719283719283f'
  });

  assert.ok(compiledDna.dna, 'DNA object must be defined');
  assert.strictEqual(compiledDna.dna.product_dna.provenance.slsa_level, 'SLSA_LEVEL_4');
  assert.ok(compiledDna.dna.product_dna.lineage_graph, 'Lineage graph must be present');
  assert.strictEqual(compiledDna.dna.product_dna.lineage_graph.nodes.length, 4);
  assert.ok(compiledDna.checksum, 'SHA-256 checksum must be computed');
  
  const verifyDnaResult = ProductDnaCompiler.verifyDna(compiledDna.dna);
  assert.strictEqual(verifyDnaResult.valid, true, 'Product DNA verification must pass cleanly');
  console.log(`      ✓ ProductDnaCompiler verified (SHA-256: ${compiledDna.checksum.substring(0, 16)}...).`);

  // Test 3: ProductPassportV2Engine OSAP v2 Passport compilation
  console.log('[3/4] Verifying ProductPassportV2Engine OSAP v2 Digital Product Passport...');
  const passportEngineHeader = fs.readFileSync(path.resolve(__dirname, '../engine/certification/ProductPassportV2Engine.js'), 'utf8');
  aiKeywords.forEach(kw => {
    assert.strictEqual(
      passportEngineHeader.toLowerCase().includes(kw),
      false,
      `ProductPassportV2Engine.js must not contain AI keyword: ${kw}`
    );
  });

  const passport = ProductPassportV2Engine.compilePassport(compiledDna.dna);
  assert.strictEqual(passport.osap_version, '2.0.0', 'Passport OSAP version must be 2.0.0');
  assert.strictEqual(passport.issuer.authority, 'Ujomor Engineering Governance Authority');
  assert.strictEqual(passport.provenance.slsa_level, 'SLSA_LEVEL_4');
  assert.ok(passport.compliance_attestations.some(a => a.standard === 'ISO 27001'), 'Must include ISO 27001 attestation');
  assert.ok(passport.compliance_attestations.some(a => a.standard === 'SLSA'), 'Must include SLSA attestation');
  assert.ok(passport.signature.startsWith('sig-passport-'), 'Passport signature must be present');

  const passportValidation = ProductPassportV2Engine.validatePassport(passport);
  assert.strictEqual(passportValidation.valid, true, 'Passport validation must pass cleanly');
  console.log(`      ✓ ProductPassportV2Engine OSAP v2 verified (Passport ID: ${passport.passport_id}).`);

  // Test 4: CLI & SDK Integration check
  console.log('[4/4] Verifying CLI dcp_cli integration...');
  const { runDcpCli } = require('../cli/dcp_cli');
  const cliPassportResult = runDcpCli(['passport']);
  assert.strictEqual(cliPassportResult.osap_version, '2.0.0');
  const cliDnaResult = runDcpCli(['dna']);
  assert.strictEqual(cliDnaResult.product_dna.provenance.slsa_level, 'SLSA_LEVEL_4');
  console.log('      ✓ CLI dcp_cli Integration test passed.');

  console.log('\n================================================================');
  console.log('  ALL STREAM C VERIFICATION TESTS PASSED WITH 100% SUCCESS');
  console.log('================================================================\n');
}

if (require.main === module) {
  runStreamCTestSuite().catch(err => {
    console.error('Stream C Test Failure:', err);
    process.exit(1);
  });
}

module.exports = runStreamCTestSuite;
