/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : PEP Stream C — API & Contract Governance Test Suite
 * File           : tests/pep/stream_c_api_governance.test.js
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
 * - OpenAPI 3.0.3
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const ApiGovernanceEngine = require('../../engine/governance/ApiGovernanceEngine');

function runStreamCApiGovernanceTests() {
    console.log('================================================================================');
    console.log('  EAORCS PEP STREAM C — API & CONTRACT GOVERNANCE SUITE');
    console.log('================================================================================\n');

    let totalAssertions = 0;

    // --------------------------------------------------------------------------
    // Test 1: OpenAPI 3.0.3 Spec Exports (exportOpenApiSpec)
    // --------------------------------------------------------------------------
    console.log('[1] Testing OpenAPI 3.0.3 Spec Exports (exportOpenApiSpec)...');
    
    const defaultSpec = ApiGovernanceEngine.exportOpenApiSpec();
    assert.strictEqual(defaultSpec.openapi, '3.0.3', 'Exported spec must be OpenAPI 3.0.3');
    assert.strictEqual(defaultSpec.info.title, 'EAORCS Enterprise Platform API', 'Title must match default spec title');
    assert.ok(defaultSpec.paths['/api/v1/health'], 'Default spec must define /api/v1/health path');
    assert.ok(defaultSpec.paths['/api/v1/passports/verify'], 'Default spec must define /api/v1/passports/verify path');
    assert.ok(defaultSpec.components.securitySchemes.BearerAuth, 'Default spec must define BearerAuth security scheme');
    totalAssertions += 5;

    // Custom Spec Export in JSON Format
    const jsonSpec = ApiGovernanceEngine.exportOpenApiSpec({
        format: 'json',
        info: { title: 'Custom Partner API', version: '2026.2.0' }
    });
    assert.strictEqual(typeof jsonSpec, 'string', 'JSON export must return a string');
    const parsedJsonSpec = JSON.parse(jsonSpec);
    assert.strictEqual(parsedJsonSpec.openapi, '3.0.3');
    assert.strictEqual(parsedJsonSpec.info.title, 'Custom Partner API');
    assert.strictEqual(parsedJsonSpec.info.version, '2026.2.0');
    totalAssertions += 4;

    // Custom Spec Export in YAML Format
    const yamlSpec = ApiGovernanceEngine.exportOpenApiSpec({
        format: 'yaml',
        info: { title: 'YAML Export Test' }
    });
    assert.strictEqual(typeof yamlSpec, 'string', 'YAML export must return a string');
    assert.ok(yamlSpec.includes('openapi: 3.0.3'), 'YAML export must include openapi version line');
    totalAssertions += 2;

    console.log('  ✅ OpenAPI 3.0.3 exports verified successfully.\n');

    // --------------------------------------------------------------------------
    // Test 2: SDK Generation Manifest Builder (buildSdkManifests)
    // --------------------------------------------------------------------------
    console.log('[2] Testing SDK Generation Manifest Builder (buildSdkManifests)...');

    const sdkResult = ApiGovernanceEngine.buildSdkManifests();
    assert.strictEqual(sdkResult.totalManifests, 6, 'Default target languages count must be 6');
    assert.ok(sdkResult.manifests.typescript, 'TypeScript SDK manifest must be present');
    assert.ok(sdkResult.manifests.python, 'Python SDK manifest must be present');
    assert.ok(sdkResult.manifests.go, 'Go SDK manifest must be present');
    assert.ok(sdkResult.manifests.java, 'Java SDK manifest must be present');
    assert.ok(sdkResult.manifests.csharp, 'C# SDK manifest must be present');
    assert.ok(sdkResult.manifests.rust, 'Rust SDK manifest must be present');
    
    // Check manifest properties
    const tsManifest = sdkResult.manifests.typescript;
    assert.strictEqual(tsManifest.language, 'typescript');
    assert.strictEqual(tsManifest.packageName, '@eaorcs/sdk-typescript');
    assert.strictEqual(tsManifest.generatorName, 'typescript-axios');
    assert.ok(tsManifest.checksum && tsManifest.checksum.length === 64, 'SDK manifest checksum must be a valid 64-char SHA-256 string');
    totalAssertions += 11;

    // Custom Target Languages
    const customSdkResult = ApiGovernanceEngine.buildSdkManifests({
        targetLanguages: ['typescript', 'php', 'ruby'],
        version: '2026.3.0-RC1',
        packageName: '@custom/client-sdk'
    });
    assert.strictEqual(customSdkResult.totalManifests, 3, 'Custom target languages count must match');
    assert.ok(customSdkResult.manifests.php, 'PHP manifest must be present');
    assert.ok(customSdkResult.manifests.ruby, 'Ruby manifest must be present');
    assert.strictEqual(customSdkResult.manifests.typescript.targetVersion, '2026.3.0-RC1');
    totalAssertions += 4;

    console.log('  ✅ SDK generation manifest builder verified successfully.\n');

    // --------------------------------------------------------------------------
    // Test 3: Breaking Change Detector (detectBreakingChanges)
    // --------------------------------------------------------------------------
    console.log('[3] Testing Breaking Change Detector (detectBreakingChanges)...');

    const baseSpec = ApiGovernanceEngine.exportOpenApiSpec();
    
    // 3a. Non-breaking change test (adding a new endpoint path)
    const newSpecNonBreaking = JSON.parse(JSON.stringify(baseSpec));
    newSpecNonBreaking.paths['/api/v1/new-feature'] = {
        get: {
            summary: 'New Feature',
            responses: { '200': { description: 'OK' } }
        }
    };

    const nonBreakingReport = ApiGovernanceEngine.detectBreakingChanges(baseSpec, newSpecNonBreaking);
    assert.strictEqual(nonBreakingReport.isBreaking, false, 'Adding new endpoint path should NOT be breaking');
    assert.strictEqual(nonBreakingReport.breakingCount, 0, 'Breaking count should be 0');
    assert.ok(nonBreakingReport.nonBreakingCount > 0, 'Non-breaking additions should be detected');
    assert.strictEqual(nonBreakingReport.score, 100, 'Score should be 100');
    totalAssertions += 4;

    // 3b. Breaking change test (removing an endpoint and changing parameter types)
    const newSpecBreaking = JSON.parse(JSON.stringify(baseSpec));
    delete newSpecBreaking.paths['/api/v1/passports/verify'];
    newSpecBreaking.paths['/api/v1/certificates/{id}'].get.parameters.push({
        name: 'mandatory_filter',
        in: 'header',
        required: true,
        schema: { type: 'string' }
    });

    const breakingReport = ApiGovernanceEngine.detectBreakingChanges(baseSpec, newSpecBreaking);
    assert.strictEqual(breakingReport.isBreaking, true, 'Removing endpoint & adding required param must be breaking');
    assert.ok(breakingReport.breakingCount >= 2, 'Must detect at least 2 breaking changes');
    assert.ok(breakingReport.breakingChanges.some(c => c.type === 'REMOVED_ENDPOINT_PATH'), 'Must detect REMOVED_ENDPOINT_PATH');
    assert.ok(breakingReport.breakingChanges.some(c => c.type === 'ADDED_REQUIRED_PARAMETER'), 'Must detect ADDED_REQUIRED_PARAMETER');
    assert.ok(breakingReport.score < 100, 'Breaking changes must reduce quality score below 100');
    totalAssertions += 5;

    console.log('  ✅ Breaking change detector verified successfully.\n');

    // --------------------------------------------------------------------------
    // Test 4: Webhook Signature Generator & Verification (signWebhookPayload / verifyWebhookSignature)
    // --------------------------------------------------------------------------
    console.log('[4] Testing Webhook Signature Generator & Verification...');

    const payload = { event: 'CONTRACT_REGISTERED', contractId: 'CT-2026-99', timestamp: Date.now() };
    const secret = 'super-secret-enterprise-webhook-key-2026';

    const signedWebhook = ApiGovernanceEngine.signWebhookPayload(payload, secret);
    assert.ok(signedWebhook.signature, 'Signature must be generated');
    assert.ok(signedWebhook.formattedHeader.startsWith('t='), 'Formatted header must start with t=');
    assert.ok(signedWebhook.formattedHeader.includes(',v1='), 'Formatted header must include ,v1=');
    totalAssertions += 3;

    // Verification of valid signature
    const verificationSuccess = ApiGovernanceEngine.verifyWebhookSignature(payload, signedWebhook.formattedHeader, secret);
    assert.strictEqual(verificationSuccess.valid, true, 'Valid webhook signature must pass verification');
    assert.strictEqual(verificationSuccess.reason, 'SUCCESS');
    totalAssertions += 2;

    // Instance wrapper verification method
    const instanceVerification = signedWebhook.verify(signedWebhook.formattedHeader);
    assert.strictEqual(instanceVerification.valid, true, 'Instance verify method must succeed');
    totalAssertions += 1;

    // Verification with tampered payload (must fail)
    const tamperedPayload = { ...payload, event: 'TAMPERED_EVENT' };
    const verificationTampered = ApiGovernanceEngine.verifyWebhookSignature(tamperedPayload, signedWebhook.formattedHeader, secret);
    assert.strictEqual(verificationTampered.valid, false, 'Tampered payload signature must fail verification');
    assert.strictEqual(verificationTampered.reason, 'SIGNATURE_MISMATCH');
    totalAssertions += 2;

    // Verification with wrong secret (must fail)
    const verificationWrongSecret = ApiGovernanceEngine.verifyWebhookSignature(payload, signedWebhook.formattedHeader, 'wrong-secret');
    assert.strictEqual(verificationWrongSecret.valid, false, 'Signature with wrong secret must fail verification');
    totalAssertions += 1;

    console.log('  ✅ Webhook signature generator and verification verified successfully.\n');

    // --------------------------------------------------------------------------
    // Test 5: API Contract Validator (validateContract)
    // --------------------------------------------------------------------------
    console.log('[5] Testing API Contract Validator (validateContract)...');

    const validReport = ApiGovernanceEngine.validateContract(defaultSpec);
    assert.strictEqual(validReport.valid, true, 'Default spec must pass contract validation');
    assert.strictEqual(validReport.errors.length, 0, 'Valid contract must have 0 errors');
    assert.strictEqual(validReport.summary.status, 'VALID');
    totalAssertions += 3;

    const invalidSpec = {
        openapi: '2.0.0', // Unsupported version
        paths: {}
    };
    const invalidReport = ApiGovernanceEngine.validateContract(invalidSpec);
    assert.strictEqual(invalidReport.valid, false, 'Invalid spec must fail validation');
    assert.ok(invalidReport.errors.length > 0, 'Invalid spec must report error messages');
    totalAssertions += 2;

    console.log('  ✅ API contract validator verified successfully.\n');

    console.log('================================================================================');
    console.log(`  🎉 PEP STREAM C SUITE: PASSED 100% CLEANLY (${totalAssertions} assertions)`);
    console.log('================================================================================\n');
}

runStreamCApiGovernanceTests();
