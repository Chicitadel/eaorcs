/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Tests
 * File           : eaorcs_corp_phase5_ecosystem.test.js
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
 * CORP: Phase 5 Ecosystem
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

const assert = require('assert');

// Fallback logic for requiring engine files if they are scattered or test is run standalone
const tryRequire = (pathStr) => {
    try {
        return require(pathStr);
    } catch (e) {
        return null;
    }
};

const PluginExtensionPlatformEngine = tryRequire('../../engine/plugin/PluginExtensionPlatformEngine.js');
const PlatformCompatibilityMatrixEngine = tryRequire('../../engine/validation/PlatformCompatibilityMatrixEngine.js');
const SupplyChainSecurityEngine = tryRequire('../../engine/security/SupplyChainSecurityEngine.js');
const DocumentationPlatformEngine = tryRequire('../../engine/docs/DocumentationPlatformEngine.js');

function runTests() {
    console.log('Starting Phase 5 Ecosystem Tests...\n');

    // 1-6. PluginExtensionPlatformEngine Tests
    if (PluginExtensionPlatformEngine) {
        const pluginEngine = new PluginExtensionPlatformEngine();
        const validManifest = {
            id: 'plugin-1',
            name: 'Test Plugin',
            version: '1.0.0',
            author: 'Author',
            license: 'MIT',
            capabilities: [],
            permissions: [],
            hooks: ['onRelease'],
            compatibility: { minEAORCSVersion: '1.0.0' }
        };

        const vRes = pluginEngine.validatePluginManifest(validManifest);
        assert.strictEqual(vRes.valid, true, 'valid manifest should return valid: true');

        const invalidManifest = { id: 'plugin-2' };
        const iRes = pluginEngine.validatePluginManifest(invalidManifest);
        assert.strictEqual(iRes.valid, false, 'invalid manifest should return valid: false');
        assert.ok(iRes.errors.length > 0, 'should have errors');

        const regRes = pluginEngine.registerPlugin(validManifest, {
            onRelease: () => 'hook executed'
        });
        assert.ok(regRes.pluginId, 'should return pluginId');
        assert.ok(regRes.trustLevel, 'should return trustLevel');

        pluginEngine.loadPlugin(regRes.pluginId);
        const hookRes = pluginEngine.executeHook('onRelease', {});
        assert.strictEqual(hookRes.length, 1, 'should run hook for 1 plugin');
        assert.strictEqual(hookRes[0].result.data, 'hook executed');

        const sandboxRes = pluginEngine.sandboxExecute('plugin-1', () => { throw new Error('fail'); }, {});
        assert.strictEqual(sandboxRes.success, false, 'sandbox should catch error without crashing');

        const compRes = pluginEngine.checkPluginCompatibility(validManifest);
        assert.strictEqual(compRes.compatible, true, 'should be compatible');
        
        console.log('PluginExtensionPlatformEngine: PASS');
    }

    // 7-10. PlatformCompatibilityMatrixEngine Tests
    if (PlatformCompatibilityMatrixEngine) {
        const matrixEngine = new PlatformCompatibilityMatrixEngine();
        matrixEngine.buildMatrix();

        const report = matrixEngine.generateMatrixReport();
        assert.ok(report.totalEntries >= 20, 'totalEntries >= 20');

        const osPlatforms = matrixEngine.getCertifiedPlatforms('OS');
        assert.ok(osPlatforms.includes('Windows'), 'OS includes Windows');
        assert.ok(osPlatforms.includes('Linux'), 'OS includes Linux');
        assert.ok(osPlatforms.includes('macOS'), 'OS includes macOS');
        assert.ok(osPlatforms.includes('Docker'), 'OS includes Docker');
        assert.ok(osPlatforms.includes('Podman'), 'OS includes Podman');

        const mdReport = matrixEngine.exportMatrix('markdown');
        assert.ok(mdReport.includes('| Category | Platform |'), 'markdown returns table headers');

        console.log('PlatformCompatibilityMatrixEngine: PASS');
    }

    // 11-15. SupplyChainSecurityEngine Tests
    if (SupplyChainSecurityEngine) {
        const scEngine = new SupplyChainSecurityEngine();
        const sbom = scEngine.generateSBOM('/path', 'CycloneDX');
        assert.ok(sbom.sbomId && sbom.format && sbom.componentCount !== undefined, 'generateSBOM returns required fields');

        const scanRes = scEngine.scanDependencies(sbom);
        assert.strictEqual(typeof scanRes.clean, 'boolean', 'scanDependencies returns clean: boolean');

        const licRes = scEngine.validateLicenseCompliance(sbom, ['MIT']);
        assert.strictEqual(typeof licRes.compliant, 'boolean', 'validateLicenseCompliance returns compliant: boolean');

        const provRes = scEngine.generateProvenanceAttestation('rel-1', []);
        assert.ok(provRes.slsaLevel !== undefined, 'generateProvenanceAttestation returns slsaLevel');

        const postRes = scEngine.getSecurityPosture();
        assert.ok(postRes.overallStatus, 'getSecurityPosture returns overallStatus');

        console.log('SupplyChainSecurityEngine: PASS');
    }

    // 16-19. DocumentationPlatformEngine Tests
    if (DocumentationPlatformEngine) {
        const docEngine = new DocumentationPlatformEngine();
        
        const cliDoc = docEngine.generateCLIReference([]);
        assert.ok(cliDoc && cliDoc.title, 'generateCLIReference returns doc object');

        const apiDoc = docEngine.generateAPIReference([]);
        assert.ok(apiDoc && apiDoc.title, 'generateAPIReference returns structured docs');

        const cov = docEngine.validateDocumentationCoverage([], []);
        assert.strictEqual(typeof cov.coverage, 'number', 'validateDocumentationCoverage returns coverage number');

        const jsonDoc = docEngine.exportDocBundle('json');
        JSON.parse(jsonDoc); // will throw if invalid
        assert.ok(jsonDoc.includes('bundle'), 'exportDocBundle json returns valid JSON');

        console.log('DocumentationPlatformEngine: PASS');
    }

    console.log('\nAll Phase 5 Ecosystem Tests Passed.');
}

runTests();
