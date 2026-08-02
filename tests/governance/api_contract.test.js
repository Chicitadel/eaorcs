/******************************************************************************
 * Project        : EAORCS Governance Platform
 * Module         : API & SDK Governance Engine
 * File           : api_contract.test.js
 * Version        : 2026.1.0
 * Author         : Air Roofers Architecture Authority / Ujomor Systems
 * Organization   : Ujomor Systems & Air Roofers
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | PUBLIC | INTERNAL
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
 * Copyright (c) 2026 Ujomor Systems & Air Roofers
 * All Rights Reserved.
 ******************************************************************************/

const assert = require('assert');
const { ApiContractEngine, EAORCS_OPENAPI_SPEC } = require('../../engine/governance/ApiContractEngine');

function runApiContractTests() {
    const results = [];

    // Test 1: Valid OpenAPI spec passes validation
    try {
        const val = ApiContractEngine.validateOpenApiSpec(EAORCS_OPENAPI_SPEC);
        assert.strictEqual(val.valid, true, `Built-in OpenAPI spec should be valid. Errors: ${val.errors.join(', ')}`);
        results.push({ test: 'Valid OpenAPI spec passes validation', passed: true });
    } catch (err) {
        results.push({ test: 'Valid OpenAPI spec passes validation', passed: false, error: err.message });
    }

    // Test 2: Missing info.version fails validation
    try {
        const invalidSpec = JSON.parse(JSON.stringify(EAORCS_OPENAPI_SPEC));
        delete invalidSpec.info.version;
        const val = ApiContractEngine.validateOpenApiSpec(invalidSpec);
        assert.strictEqual(val.valid, false, 'Spec with missing info.version must fail validation');
        assert.ok(val.errors.some(e => e.includes('info.version')), 'Error message must cite missing info.version');
        results.push({ test: 'Missing info.version fails validation', passed: true });
    } catch (err) {
        results.push({ test: 'Missing info.version fails validation', passed: false, error: err.message });
    }

    // Test 3: SemVer 2026.1.0 validates correctly, 1.0.invalid fails
    try {
        const validSemVer = ApiContractEngine.checkSemanticVersion('2026.1.0');
        const invalidSemVer = ApiContractEngine.checkSemanticVersion('1.0.invalid');
        assert.strictEqual(validSemVer, true, "'2026.1.0' should be valid SemVer 2.0.0");
        assert.strictEqual(invalidSemVer, false, "'1.0.invalid' should fail SemVer check");
        results.push({ test: 'SemVer validation (2026.1.0 vs 1.0.invalid)', passed: true });
    } catch (err) {
        results.push({ test: 'SemVer validation (2026.1.0 vs 1.0.invalid)', passed: false, error: err.message });
    }

    // Test 4: Backward incompatibility detection (removed endpoint detected as BREAKING)
    try {
        const oldSpec = JSON.parse(JSON.stringify(EAORCS_OPENAPI_SPEC));
        const newSpec = JSON.parse(JSON.stringify(EAORCS_OPENAPI_SPEC));
        delete newSpec.paths['/api/v1/health'];

        const result = ApiContractEngine.detectBackwardIncompatibility(oldSpec, newSpec);
        assert.strictEqual(result.compatible, false, 'Removed endpoint must be detected as breaking');
        assert.ok(result.breakingChanges.some(c => c.includes('/api/v1/health')), 'Breaking changes list must contain removed endpoint');
        results.push({ test: 'Backward incompatibility detection (removed endpoint)', passed: true });
    } catch (err) {
        results.push({ test: 'Backward incompatibility detection (removed endpoint)', passed: false, error: err.message });
    }

    // Test 5: New optional endpoint detected as NON-BREAKING
    try {
        const oldSpec = JSON.parse(JSON.stringify(EAORCS_OPENAPI_SPEC));
        const newSpec = JSON.parse(JSON.stringify(EAORCS_OPENAPI_SPEC));
        newSpec.paths['/api/v1/optional-feature'] = {
            get: {
                summary: 'Optional new endpoint',
                responses: { '200': { description: 'OK' } }
            }
        };

        const result = ApiContractEngine.detectBackwardIncompatibility(oldSpec, newSpec);
        assert.strictEqual(result.compatible, true, 'Adding new optional endpoint must be compatible (non-breaking)');
        assert.ok(result.nonBreakingChanges.some(c => c.includes('/api/v1/optional-feature')), 'Non-breaking changes must cite new endpoint');
        results.push({ test: 'New optional endpoint detected as NON-BREAKING', passed: true });
    } catch (err) {
        results.push({ test: 'New optional endpoint detected as NON-BREAKING', passed: false, error: err.message });
    }

    // Test 6: Sunset policy check
    try {
        const specWithSunset = JSON.parse(JSON.stringify(EAORCS_OPENAPI_SPEC));
        specWithSunset.paths['/api/v1/health'].get.deprecated = true;
        specWithSunset.paths['/api/v1/health'].get['x-sunset-date'] = '2026-12-31';

        const sunsetVal = ApiContractEngine.validateSunsetPolicy(specWithSunset);
        assert.strictEqual(sunsetVal.compliant, true, 'Deprecated endpoint with x-sunset-date must be compliant');

        const specWithoutSunset = JSON.parse(JSON.stringify(EAORCS_OPENAPI_SPEC));
        specWithoutSunset.paths['/api/v1/health'].get.deprecated = true;
        delete specWithoutSunset.paths['/api/v1/health'].get['x-sunset-date'];

        const missingSunsetVal = ApiContractEngine.validateSunsetPolicy(specWithoutSunset);
        assert.strictEqual(missingSunsetVal.compliant, false, 'Deprecated endpoint missing x-sunset-date must fail policy check');
        results.push({ test: 'Sunset policy check (deprecated endpoint validation)', passed: true });
    } catch (err) {
        results.push({ test: 'Sunset policy check (deprecated endpoint validation)', passed: false, error: err.message });
    }

    return results;
}

if (require.main === module) {
    const res = runApiContractTests();
    console.log(res);
}

module.exports = { runApiContractTests };
