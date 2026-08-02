/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : Phase 11 Stream 4 — Standards & Interoperability Test Suite
 * File           : tests/phase11/stream_4_standards.test.js
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
 * - Corporate Policy Governed
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 * - W3C DID v1.0
 * - OSAP v1.1 Protocol
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
const crypto = require('crypto');
const OSAPConformanceSuite = require('../../engine/spec/OSAPConformanceSuite');

async function runStream4TestSuite() {
  console.log('================================================================================');
  console.log('  EAORCS PHASE 11 STREAM 4: STANDARDS & INTEROPERABILITY TEST SUITE');
  console.log('  Scope: OSAP v1.1 Passport Conformance, W3C DID Resolution, Schema Registry Matching');
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

  let suite;

  // -------------------------------------------------------------------------
  // Group 1: OSAP v1.1 Passport Conformance
  // -------------------------------------------------------------------------
  console.log('[Phase 11 Stream 4 - Task 1] OSAP v1.1 Passport Conformance & Validation');

  test('Suite Instantiation', () => {
    suite = new OSAPConformanceSuite();
    assert.ok(suite, 'OSAPConformanceSuite should instantiate cleanly');
    assert.strictEqual(suite.specVersion, '1.1', 'Spec version should default to 1.1');
  });

  let generatedPassport;

  test('Generate Valid OSAP v1.1 Passport', () => {
    const subject = {
      softwareId: 'eaorcs-compliance-kernel',
      name: 'EAORCS Regulatory & Governance Kernel',
      version: '2026.1.0-LTS',
      buildHash: crypto.createHash('sha256').update('BUILD_VERIFIED_2026').digest('hex')
    };
    generatedPassport = suite.generatePassport(subject, 'did:eaorcs:node-primary-01', {
      assuranceLevel: 'CRITICAL',
      secretKey: 'custom-governance-test-key'
    });

    assert.ok(generatedPassport, 'Generated passport should be non-null');
    assert.strictEqual(generatedPassport.version, '1.1', 'Version must be 1.1');
    assert.strictEqual(generatedPassport.issuer, 'did:eaorcs:node-primary-01', 'Issuer DID should match');
    assert.strictEqual(generatedPassport.assuranceLevel, 'CRITICAL', 'Assurance level must match');
    assert.ok(generatedPassport.proof, 'Proof object must be attached');
  });

  test('Validate Generated OSAP v1.1 Passport', () => {
    const result = suite.validatePassport(generatedPassport, { secretKey: 'custom-governance-test-key' });
    assert.strictEqual(result.valid, true, `Passport validation failed: ${result.errors.join('; ')}`);
    assert.strictEqual(result.errors.length, 0, 'No validation errors expected');
    assert.strictEqual(result.proofVerified, true, 'Proof signature must be verified successfully');
    assert.ok(result.digest, 'Payload digest must be computed');
  });

  test('Reject Passport with Invalid Version', () => {
    const invalidPassport = JSON.parse(JSON.stringify(generatedPassport));
    invalidPassport.version = '1.0';
    const result = suite.validatePassport(invalidPassport);
    assert.strictEqual(result.valid, false, 'Passport with version 1.0 must fail OSAP v1.1 conformance');
    assert.ok(result.errors.some(e => e.includes('Invalid OSAP version')), 'Expected invalid version error message');
  });

  test('Reject Passport with Tampered Payload Signature', () => {
    const tamperedPassport = JSON.parse(JSON.stringify(generatedPassport));
    tamperedPassport.subject.version = '2026.9.9-MODIFIED';
    const result = suite.validatePassport(tamperedPassport, { secretKey: 'custom-governance-test-key' });
    assert.strictEqual(result.proofVerified, false, 'Tampered passport proof must fail verification');
  });

  test('Reject Expired Passport', () => {
    const expiredPassport = JSON.parse(JSON.stringify(generatedPassport));
    expiredPassport.issuedAt = '2020-01-01T00:00:00.000Z';
    expiredPassport.expiresAt = '2020-02-01T00:00:00.000Z';
    const result = suite.validatePassport(expiredPassport, { checkExpiration: true });
    assert.strictEqual(result.valid, false, 'Expired passport must be flagged invalid when checkExpiration is true');
    assert.ok(result.errors.some(e => e.includes('expired')), 'Expected expiration error message');
  });

  // -------------------------------------------------------------------------
  // Group 2: W3C Decentralized Identifier (DID) Document Creation & Resolving
  // -------------------------------------------------------------------------
  console.log('\n[Phase 11 Stream 4 - Task 2] W3C DID Document Resolution & Management');

  test('Resolve Default Seed DIDs', () => {
    const resolution = suite.resolveDidDocument('node-primary-01');
    assert.ok(resolution, 'Resolution payload must be returned');
    assert.ok(resolution.didDocument, 'DID document should be resolved');
    assert.strictEqual(resolution.didDocument.id, 'did:eaorcs:node-primary-01');
    assert.strictEqual(resolution.didResolutionMetadata.error, null);
    assert.ok(Array.isArray(resolution.didDocument.verificationMethod), 'verificationMethod array required');
  });

  let createdDidDoc;

  test('Create W3C Compliant DID Document', () => {
    createdDidDoc = suite.createDidDocument('enterprise-sovereign-node-05', [
      {
        keyId: 'key-ed25519-1',
        type: 'Ed25519VerificationKey2020',
        publicKeyPem: '-----BEGIN PUBLIC KEY-----\nTEST_KEY_PEM_CONTENT\n-----END PUBLIC KEY-----'
      }
    ], [
      {
        serviceId: 'audit-endpoint',
        type: 'EAORCSAuditVerifierEndpoint',
        serviceEndpoint: 'https://sovereign05.enterprise.eaorcs.com/audit'
      }
    ]);

    assert.ok(createdDidDoc, 'DID document must be created');
    assert.strictEqual(createdDidDoc.id, 'did:eaorcs:enterprise-sovereign-node-05');
    assert.strictEqual(createdDidDoc['@context'][0], 'https://www.w3.org/ns/did/v1');
    assert.strictEqual(createdDidDoc.verificationMethod[0].id, 'did:eaorcs:enterprise-sovereign-node-05#key-ed25519-1');
  });

  test('Validate W3C DID Document Structure', () => {
    const validation = suite.validateDidDocument(createdDidDoc);
    assert.strictEqual(validation.valid, true, `DID Document validation failed: ${validation.errors.join('; ')}`);
  });

  test('Register and Resolve Custom DID Document', () => {
    suite.registerDidDocument(createdDidDoc);
    const resolution = suite.resolveDidDocument('did:eaorcs:enterprise-sovereign-node-05');
    assert.ok(resolution.didDocument, 'Registered DID must resolve');
    assert.strictEqual(resolution.didDocument.id, 'did:eaorcs:enterprise-sovereign-node-05');
    assert.strictEqual(resolution.didResolutionMetadata.error, null);
    assert.strictEqual(resolution.didResolutionMetadata.contentType, 'application/did+ld+json');
  });

  test('Handle Resolution of Non-Existent DID', () => {
    const resolution = suite.resolveDidDocument('non-existent-node-999');
    assert.strictEqual(resolution.didDocument, null, 'Unregistered DID should resolve to null document');
    assert.strictEqual(resolution.didResolutionMetadata.error, 'notFound', 'Error should be notFound');
  });

  // -------------------------------------------------------------------------
  // Group 3: Schema Registry Version Matching & Lookups
  // -------------------------------------------------------------------------
  console.log('\n[Phase 11 Stream 4 - Task 3] Schema Registry Version Matching & Lookups');

  test('List Cataloged Schemas', () => {
    const schemas = suite.listRegisteredSchemas();
    assert.ok(Array.isArray(schemas), 'Catalog list must be an array');
    assert.ok(schemas.length >= 4, 'Catalog must contain at least 4 registered schemas');
    const ids = schemas.map(s => s.id);
    assert.ok(ids.includes('osap-v1.1'), 'Catalog must include osap-v1.1');
    assert.ok(ids.includes('did-eaorcs-v1'), 'Catalog must include did-eaorcs-v1');
  });

  test('Schema Version Matching - Exact Match', () => {
    const matched = suite.matchSchemaVersion('osap-v1.1', '1.1.0');
    assert.strictEqual(matched, '1.1.0', 'Exact match for osap-v1.1 version 1.1.0');
  });

  test('Schema Version Matching - Caret Range (^1.0.0)', () => {
    const matched = suite.matchSchemaVersion('osap-v1.1', '^1.0.0');
    assert.strictEqual(matched, '1.1.0', 'Caret range ^1.0.0 should resolve to 1.1.0');
  });

  test('Schema Version Matching - Tilde Range (~1.0.0)', () => {
    const matched = suite.matchSchemaVersion('did-eaorcs-v1', '~1.0.0');
    assert.strictEqual(matched, '1.0.0', 'Tilde range ~1.0.0 should resolve to 1.0.0');
  });

  test('Schema Version Matching - Wildcard Range (1.x)', () => {
    const matched = suite.matchSchemaVersion('osap-v1.1', '1.x');
    assert.strictEqual(matched, '1.1.0', 'Wildcard 1.x should resolve to highest 1.x version (1.1.0)');
  });

  test('Schema Lookup by ID and Version Query', () => {
    const details = suite.lookupSchema('osap-v1.1', '^1.0.0');
    assert.ok(details, 'Schema details must be found');
    assert.strictEqual(details.schemaId, 'osap-v1.1');
    assert.strictEqual(details.version, '1.1.0');
    assert.strictEqual(details.status, 'FROZEN');
    assert.ok(details.schemaObj, 'Parsed JSON Schema object must be attached');
  });

  test('Validate Data Against Schema via Registry', () => {
    const validDidData = createdDidDoc;
    const validation = suite.validateAgainstSchema(validDidData, 'did-eaorcs-v1', '1.0.0');
    assert.strictEqual(validation.valid, true, `Schema validation failed: ${validation.errors.join('; ')}`);
    assert.strictEqual(validation.schemaId, 'did-eaorcs-v1');
    assert.strictEqual(validation.matchedVersion, '1.0.0');
  });

  // -------------------------------------------------------------------------
  // Group 4: End-to-End Conformance Suite Execution
  // -------------------------------------------------------------------------
  console.log('\n[Phase 11 Stream 4 - Task 4] Master Suite Conformance Execution');

  test('Run End-to-End Conformance Suite Report', () => {
    const report = suite.runConformanceSuite();
    assert.ok(report, 'Report object must be generated');
    assert.strictEqual(report.status, 'PASSED', 'Suite execution status must be PASSED');
    assert.strictEqual(report.metrics.osapConformancePct, 100, 'OSAP conformance percentage must be 100%');
    assert.strictEqual(report.metrics.didResolutionPct, 100, 'DID resolution percentage must be 100%');
    assert.strictEqual(report.metrics.schemaMatchingPct, 100, 'Schema matching percentage must be 100%');
    assert.ok(report.metrics.passedChecks > 0, 'Passed checks count must be greater than 0');
  });

  // Final Summary
  console.log('\n================================================================================');
  console.log(`  STREAM 4 TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('================================================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runStream4TestSuite().catch(err => {
  console.error('Unhandled Stream 4 Test Error:', err);
  process.exit(1);
});
