/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : Phase 10 Stream 6 — Standards Registry & Schema Catalog Test Suite
 * File           : tests/phase10/stream_6_standards_registry.test.js
 * Version        : 2026.1-LTS
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
 * - Corporate Policy Governed
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 * - W3C DID v1.0
 * - OSAP v1.1 / v2.0
 * - OpenAPI 3.0.3
 *
 * Signatures:
 * - Enterprise Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const path = require('path');
const StandardsRegistryEngine = require('../../engine/spec/StandardsRegistryEngine');

async function runStream6TestSuite() {
  console.log('================================================================================');
  console.log('  EAORCS PHASE 10 STREAM 6: STANDARDS REGISTRY & SCHEMA CATALOG TEST SUITE');
  console.log('  Scope: Versioned Schema Index, W3C DID Resolution, OSAP Validation, OpenAPI 3.0');
  console.log('================================================================================\n');

  let passedCount = 0;
  let failedCount = 0;

  function test(name, fn) {
    try {
      fn();
      passedCount++;
      console.log(`  ✓ [PASS] ${name}`);
    } catch (err) {
      failedCount++;
      console.error(`  ❌ [FAIL] ${name}`);
      console.error(`     Error: ${err.message}`);
      if (err.stack) console.error(`     Stack: ${err.stack.split('\n')[1]}`);
    }
  }

  // 1. Instantiation & Indexing
  console.log('[Phase 1] Schema Registry Indexing & Discovery');
  let engine;

  test('Engine Instantiation & Catalog Loading', () => {
    engine = new StandardsRegistryEngine({ autoLoad: true });
    assert.ok(engine, 'StandardsRegistryEngine should instantiate');
    assert.ok(engine.schemas.size > 0, 'Schema map should contain loaded schemas');
  });

  test('List Cataloged Schemas', () => {
    const catalog = engine.listSchemas();
    assert.ok(Array.isArray(catalog), 'listSchemas() should return an array');
    assert.ok(catalog.length >= 4, 'Catalog should contain at least 4 registered schemas');

    const schemaIds = catalog.map(s => s.id);
    assert.ok(schemaIds.includes('osap-v1.1'), 'Catalog must include osap-v1.1');
    assert.ok(schemaIds.includes('did-eaorcs-v1'), 'Catalog must include did-eaorcs-v1');
    assert.ok(schemaIds.includes('audit-attestation-v1'), 'Catalog must include audit-attestation-v1');
    assert.ok(schemaIds.includes('certification-v1'), 'Catalog must include certification-v1');
  });

  test('Programmatic Schema Registration', () => {
    const customSchema = {
      $id: 'https://eaorcs.ujomor.org/schemas/custom-governance-v1.json',
      title: 'Custom Governance Policy Schema',
      type: 'object',
      properties: { policyId: { type: 'string' } }
    };
    const registered = engine.registerSchema('custom-governance-v1', customSchema, {
      version: '1.2.0',
      category: 'GOVERNANCE',
      status: 'ACTIVE'
    });
    assert.strictEqual(registered.id, 'custom-governance-v1');
    assert.strictEqual(registered.version, '1.2.0');
    assert.ok(engine.hasSchema('custom-governance-v1', '1.2.0'));
  });

  // 2. Version Resolution & Lookup
  console.log('\n[Phase 2] Version Resolution & Lookup');

  test('Exact Version Schema Retrieval', () => {
    const schemaRec = engine.getSchema('osap-v1.1', '1.1.0');
    assert.ok(schemaRec, 'getSchema should return osap-v1.1 version 1.1.0');
    assert.strictEqual(schemaRec.id, 'osap-v1.1');
    assert.strictEqual(schemaRec.version, '1.1.0');
    assert.strictEqual(schemaRec.status, 'FROZEN');
  });

  test('Version Selector "latest" & Semantic Version Resolution', () => {
    const latestVersion = engine.resolveVersion('osap-v1.1', 'latest');
    assert.strictEqual(latestVersion, '1.1.0');

    const prefixVersion = engine.resolveVersion('osap-v1.1', '1.1');
    assert.strictEqual(prefixVersion, '1.1.0');

    const schemaRecLatest = engine.getSchema('osap-v1.1', 'latest');
    assert.ok(schemaRecLatest, 'Latest schema lookup should succeed');
  });

  test('Non-Existent Schema Handling', () => {
    const missing = engine.getSchema('non-existent-schema-id');
    assert.strictEqual(missing, null, 'Lookup for non-existent schema should return null');
  });

  // 3. W3C DID Resolution & Validation
  console.log('\n[Phase 3] W3C DID Document Resolution & Validation');

  test('W3C DID Document Resolution', () => {
    const didUri = 'did:eaorcs:sovereign-node-alpha';
    const didDoc = engine.resolveDidDocument(didUri);

    assert.ok(didDoc, 'resolveDidDocument should return a DID Document object');
    assert.strictEqual(didDoc.id, didUri);
    assert.ok(Array.isArray(didDoc['@context']), '@context must be an array');
    assert.ok(didDoc['@context'].includes('https://www.w3.org/ns/did/v1'));
    assert.ok(Array.isArray(didDoc.verificationMethod), 'verificationMethod must be an array');
    assert.strictEqual(didDoc.verificationMethod[0].controller, didUri);
  });

  test('Valid W3C DID Document Validation', () => {
    const validDoc = {
      '@context': ['https://www.w3.org/ns/did/v1'],
      id: 'did:eaorcs:primary-governance-hub',
      verificationMethod: [
        {
          id: 'did:eaorcs:primary-governance-hub#key-main',
          type: 'Ed25519VerificationKey2020',
          controller: 'did:eaorcs:primary-governance-hub',
          publicKeyMultibase: 'z6MkpTHR8VNsBxYAAWnBJ68JB5B55'
        }
      ]
    };

    const res = engine.validateDidDocument(validDoc);
    assert.strictEqual(res.valid, true, 'Valid DID document should pass validation');
    assert.strictEqual(res.errors.length, 0, 'No errors expected for valid DID document');
  });

  test('Invalid W3C DID Document Validation Catch', () => {
    const invalidDoc = {
      id: 'invalid-did-format-without-method',
      verificationMethod: []
    };

    const res = engine.validateDidDocument(invalidDoc);
    assert.strictEqual(res.valid, false, 'Invalid DID document should fail validation');
    assert.ok(res.errors.length >= 2, 'Should report multiple validation errors');
  });

  test('Register Custom DID Document', () => {
    const customDidDoc = {
      '@context': ['https://www.w3.org/ns/did/v1'],
      id: 'did:eaorcs:custom-attestation-node',
      verificationMethod: [
        {
          id: 'did:eaorcs:custom-attestation-node#key-1',
          type: 'Ed25519VerificationKey2020',
          controller: 'did:eaorcs:custom-attestation-node',
          publicKeyPem: '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQE...\n-----END PUBLIC KEY-----'
        }
      ]
    };

    const result = engine.registerDidDocument(customDidDoc);
    assert.strictEqual(result.registered, true);

    const resolved = engine.resolveDidDocument('did:eaorcs:custom-attestation-node');
    assert.strictEqual(resolved.id, 'did:eaorcs:custom-attestation-node');
  });

  // 4. OSAP Passport Validation
  console.log('\n[Phase 4] OSAP Passport Validation');

  test('Valid OSAP v1.1 Passport Validation', () => {
    const validPassport = {
      passportId: 'OSAP-PASS-2026-STREAM6-001',
      version: '1.1',
      issuer: 'did:eaorcs:governance-authority-node',
      subject: {
        softwareId: 'eaorcs-standards-engine',
        name: 'EAORCS Standards Registry Engine',
        version: '2026.1.0-LTS',
        buildHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        repository: 'git@github.com:ujomor/eaorcs.git'
      },
      issuedAt: new Date().toISOString(),
      proof: 'ed25519-signature-proof-token-2026',
      evidenceLineage: [
        { type: 'STATIC_ANALYSIS', status: 'PASSED' },
        { type: 'UNIT_TESTS', status: 'PASSED' }
      ]
    };

    const val = engine.validateOsapPassport(validPassport, '1.1');
    assert.strictEqual(val.valid, true, 'Valid OSAP v1.1 passport must pass validation');
    assert.strictEqual(val.errors.length, 0);
    assert.ok(val.trustScore >= 80.0, 'Trust score should reflect complete passport payload');
    assert.ok(['GOLD', 'SILVER', 'BRONZE'].includes(val.trustLevel));
  });

  test('Invalid OSAP Passport Rejection', () => {
    const invalidPassport = {
      passportId: 'OSAP-PASS-INVALID',
      version: '1.1',
      subject: {
        name: 'Incomplete Subject'
      }
    };

    const val = engine.validateOsapPassport(invalidPassport, '1.1');
    assert.strictEqual(val.valid, false, 'Incomplete OSAP passport must fail validation');
    assert.ok(val.errors.length >= 3, 'Should report missing issuer, softwareId, buildHash, issuedAt');
    assert.strictEqual(val.trustLevel, 'INVALID');
  });

  // 5. OpenAPI 3.0 Export
  console.log('\n[Phase 5] OpenAPI 3.0.3 Export');

  test('Generate OpenAPI 3.0.3 Specification', () => {
    const openapi = engine.exportOpenApiSpec();
    assert.ok(openapi, 'OpenAPI spec should be generated');
    assert.strictEqual(openapi.openapi, '3.0.3');
    assert.ok(openapi.info.title.includes('Standards'), 'Info title should describe standards registry');
    assert.ok(openapi.paths['/schemas'], 'Paths should include /schemas endpoint');
    assert.ok(openapi.paths['/did/resolve/{did}'], 'Paths should include /did/resolve/{did} endpoint');
    assert.ok(openapi.paths['/osap/validate'], 'Paths should include /osap/validate endpoint');
    assert.ok(openapi.paths['/export/openapi'], 'Paths should include /export/openapi endpoint');
    assert.ok(openapi.components.schemas.W3CDIDDocument, 'Components should define W3CDIDDocument schema');
  });

  console.log('\n================================================================================');
  console.log(`  STREAM 6 VERIFICATION SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('================================================================================\n');

  if (failedCount === 0) {
    console.log('✅ STREAM 6 STANDARDS REGISTRY: ALL VERIFICATION CHECKS PASSED CLEANLY.\n');
    process.exit(0);
  } else {
    console.error('❌ STREAM 6 STANDARDS REGISTRY: VERIFICATION FAILED.\n');
    process.exit(1);
  }
}

runStream6TestSuite().catch(err => {
  console.error('Unhandled Exception in Stream 6 Test Suite:', err);
  process.exit(1);
});
