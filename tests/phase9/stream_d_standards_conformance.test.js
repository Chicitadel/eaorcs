/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Phase 9 Stream D - Standards & OSAP Conformance Test Suite
 * File           : stream_d_standards_conformance.test.js
 * Version        : 2026.1-LTS
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | RESTRICTED
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
 * - OSAP v1.1 Protocol Specification
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const OSAPSpecificationEngine = require('../../engine/spec/OSAPSpecificationEngine');

function runStreamDConformanceSuite() {
    console.log('================================================================================');
    console.log('  EAORCS STREAM D: STANDARDS & OSAP CONFORMANCE VALIDATION SUITE');
    console.log('  Target Protocol: OSAP v1.1 & W3C Decentralized Identifier (did:eaorcs:)');
    console.log('================================================================================\n');

    const engine = new OSAPSpecificationEngine();
    let totalTests = 0;
    let passedTests = 0;

    function test(description, fn) {
        totalTests++;
        try {
            fn();
            passedTests++;
            console.log(`  ✅ PASS: ${description}`);
        } catch (err) {
            console.error(`  ❌ FAIL: ${description}`);
            console.error(`     Error: ${err.message}`);
            if (err.stack) console.error(`     Stack: ${err.stack.split('\n')[1]}`);
        }
    }

    console.log('[1/5] OSAP v1.1 Passport Export & Validation Tests...');

    test('Export OSAP v1.1 Passport with valid default metadata', () => {
        const metadata = {
            nodeId: 'node-sec-alpha',
            softwareId: 'eaorcs-governance-kernel',
            name: 'EAORCS Governance Kernel',
            version: '2026.1.0-LTS',
            assuranceLevel: 'CRITICAL'
        };

        const passport = engine.exportOSAPPassport(metadata);
        assert.strictEqual(passport.version, '1.1');
        assert.strictEqual(passport.issuer, 'did:eaorcs:node-sec-alpha');
        assert.strictEqual(passport.subject.softwareId, 'eaorcs-governance-kernel');
        assert.strictEqual(passport.assuranceLevel, 'CRITICAL');
        assert.ok(passport.passportId.startsWith('osap:urn:eaorcs:passport:'));
        assert.ok(passport.proof);
        assert.ok(passport.governance.complianceStandard.includes('ISO 27001'));

        const validation = engine.validateOSAPPassport(passport);
        assert.strictEqual(validation.valid, true, `Validation failed: ${validation.errors.join('; ')}`);
        assert.strictEqual(validation.errors.length, 0);
    });

    test('Reject OSAP passport with invalid/unsupported version', () => {
        const metadata = { nodeId: 'node-01', softwareId: 'test-sw', name: 'Test', version: '1.0' };
        const passport = engine.exportOSAPPassport(metadata);
        passport.version = '99.9'; // corrupt version

        const validation = engine.validateOSAPPassport(passport);
        assert.strictEqual(validation.valid, false);
        assert.ok(validation.errors.some(e => e.includes("Unsupported OSAP version '99.9'")));
    });

    test('Reject OSAP passport with expired date', () => {
        const metadata = { nodeId: 'node-01', softwareId: 'test-sw', name: 'Test', version: '1.0' };
        const passport = engine.exportOSAPPassport(metadata, { expiresAt: new Date(Date.now() - 10000).toISOString() });

        const validation = engine.validateOSAPPassport(passport);
        assert.strictEqual(validation.valid, false);
        assert.ok(validation.errors.some(e => e.includes('OSAP Passport has expired')));
    });

    test('Certify OSAP v1.1 Passport with cryptographic proof & signature digest', () => {
        const metadata = {
            nodeId: 'node-certified-01',
            softwareId: 'eaorcs-trust-core',
            name: 'EAORCS Trust Core Engine',
            version: '2026.1.0-LTS',
            assuranceLevel: 'HIGH'
        };

        const passport = engine.exportOSAPPassport(metadata);
        const certified = engine.certifyOSAPPassport(passport, { secretKey: 'top-secret-governance-key' });

        assert.ok(certified.certification);
        assert.strictEqual(certified.certification.status, 'CERTIFIED');
        assert.ok(certified.certification.certificateId.startsWith('CERT-OSAP-'));
        assert.ok(certified.certification.digest);
        assert.ok(certified.certification.signature);
    });

    console.log('\n[2/5] W3C DID Document Creation & Resolution Tests...');

    test('Generate W3C DID Document conforming to did:eaorcs: specification', () => {
        const nodeId = 'sovereign-node-42';
        const didDoc = engine.generateDIDDocument(nodeId);

        assert.strictEqual(didDoc.id, 'did:eaorcs:sovereign-node-42');
        assert.ok(Array.isArray(didDoc['@context']));
        assert.ok(didDoc['@context'].includes('https://www.w3.org/ns/did/v1'));
        assert.strictEqual(didDoc.verificationMethod.length, 1);
        assert.strictEqual(didDoc.verificationMethod[0].id, 'did:eaorcs:sovereign-node-42#key-1');
        assert.strictEqual(didDoc.verificationMethod[0].controller, 'did:eaorcs:sovereign-node-42');
        assert.strictEqual(didDoc.authentication[0], 'did:eaorcs:sovereign-node-42#key-1');
        assert.strictEqual(didDoc.assertionMethod[0], 'did:eaorcs:sovereign-node-42#key-1');
        assert.ok(didDoc.service.some(s => s.type === 'OSAPTrustExchangeService'));
    });

    test('Resolve valid did:eaorcs: sovereign node DID', () => {
        const result = engine.resolveDIDDocument('did:eaorcs:sovereign-node-42');

        assert.ok(result.didDocument);
        assert.strictEqual(result.didDocument.id, 'did:eaorcs:sovereign-node-42');
        assert.strictEqual(result.didResolutionMetadata.contentType, 'application/did+ld+json');
        assert.strictEqual(result.didDocumentMetadata.deactivated, false);
    });

    test('Fail resolution on invalid DID format', () => {
        const result = engine.resolveDIDDocument('did:unknown:invalid-node-123');

        assert.strictEqual(result.didDocument, null);
        assert.strictEqual(result.didResolutionMetadata.error, 'invalidDid');
    });

    console.log('\n[3/5] Trust Exchange Message Compliance Tests...');

    test('Validate conforming Trust Exchange P2P message', () => {
        const message = {
            header: {
                messageId: 'msg-tx-1001',
                protocolVersion: '1.1',
                senderDid: 'did:eaorcs:node-alpha',
                recipientDid: 'did:eaorcs:node-beta',
                timestamp: new Date().toISOString(),
                messageType: 'OSAP_PASSPORT_SYNC'
            },
            payload: {
                passportId: 'osap:urn:eaorcs:passport:sync-01',
                status: 'VERIFIED'
            },
            signature: '56a26e4073ee2ac7b747f35297d3b5c736131fbe'
        };

        const val = engine.validateTrustExchangeMessage(message);
        assert.strictEqual(val.valid, true, `Validation failed: ${val.errors.join('; ')}`);
    });

    test('Reject Trust Exchange message with missing headers or invalid sender DID', () => {
        const message = {
            header: {
                messageId: 'msg-tx-1002',
                protocolVersion: '1.1',
                senderDid: 'invalid-sender-did', // bad DID
                recipientDid: 'did:eaorcs:node-beta',
                timestamp: new Date().toISOString(),
                messageType: 'OSAP_PASSPORT_SYNC'
            },
            payload: {},
            signature: '12345'
        };

        const val = engine.validateTrustExchangeMessage(message);
        assert.strictEqual(val.valid, false);
        assert.ok(val.errors.some(e => e.includes('senderDid')));
    });

    console.log('\n[4/5] JSON Schema File Validation Tests...');

    test('Validate schemas/osap-v1.1.schema.json exists and is valid JSON Schema', () => {
        const schemaPath = path.resolve(__dirname, '../../schemas/osap-v1.1.schema.json');
        assert.ok(fs.existsSync(schemaPath), 'osap-v1.1.schema.json file must exist');

        const schemaContent = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
        assert.strictEqual(schemaContent.$schema, 'http://json-schema.org/draft-07/schema#');
        assert.strictEqual(schemaContent.properties.version.const, '1.1');
        assert.ok(schemaContent.required.includes('passportId'));
        assert.ok(schemaContent.required.includes('assuranceLevel'));
        assert.ok(schemaContent.required.includes('proof'));
    });

    test('Validate schemas/did-eaorcs-v1.schema.json exists and is valid JSON Schema', () => {
        const schemaPath = path.resolve(__dirname, '../../schemas/did-eaorcs-v1.schema.json');
        assert.ok(fs.existsSync(schemaPath), 'did-eaorcs-v1.schema.json file must exist');

        const schemaContent = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
        assert.strictEqual(schemaContent.$schema, 'http://json-schema.org/draft-07/schema#');
        assert.ok(schemaContent.required.includes('id'));
        assert.ok(schemaContent.required.includes('verificationMethod'));
        assert.ok(schemaContent.required.includes('authentication'));
    });

    console.log('\n================================================================================');
    console.log(`  STREAM D TEST RESULTS: ${passedTests}/${totalTests} TESTS PASSED`);
    console.log('================================================================================\n');

    if (passedTests === totalTests) {
        console.log('🎉 STREAM D STANDARDS & OSAP CONFORMANCE: ALL TESTS PASSED CLEANLY.\n');
        process.exit(0);
    } else {
        console.error(`❌ STREAM D CONFORMANCE FAILED: ${totalTests - passedTests} tests failed.\n`);
        process.exit(1);
    }
}

runStreamDConformanceSuite();
