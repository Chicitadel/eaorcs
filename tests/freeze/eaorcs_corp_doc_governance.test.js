/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Documentation Governance & Engine Test Suite
 * File           : eaorcs_corp_doc_governance.test.js
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
 * CORP: Stream 2 — Documentation Governance & Engines Test
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
const path = require('path');
const fs = require('fs');

const DocumentationGovernanceEngine = require('../../engine/docs/DocumentationGovernanceEngine');
const ProductMetadataEngine = require('../../engine/metadata/ProductMetadataEngine');
const ReleaseEngineeringStandardEngine = require('../../engine/packaging/ReleaseEngineeringStandardEngine');

async function runDocGovernanceTests() {
    console.log('[TEST] Running Documentation Governance & Engine Suite...');

    const rootDir = path.resolve(__dirname, '../../');
    const tmpDir = path.join(rootDir, 'tmp', 'doc_gov_test_' + Date.now());

    if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
    }

    try {
        // ====================================================================
        // 1. DocumentationGovernanceEngine Tests
        // ====================================================================
        const docEngine = new DocumentationGovernanceEngine();

        // Create mock docs structure
        const docsDir = path.join(tmpDir, 'docs');
        fs.mkdirSync(docsDir, { recursive: true });

        const indexFile = path.join(docsDir, 'README.md');
        const docA = path.join(docsDir, 'docA.md');
        const docB = path.join(docsDir, 'docB.md');
        const orphanDoc = path.join(docsDir, 'orphan.md');

        fs.writeFileSync(indexFile, `# Master Index\n\n- [Doc A](./docA.md)\n- [Doc B](./docB.md)\n\nLaw 1: Single Public Facade`);
        fs.writeFileSync(docA, `# Doc A\n\nLink to B: [Doc B](./docB.md)\nBroken Link: [Missing](./missing.md)\nLaw 1: Single Public Facade\nLaw 2: Deterministic Execution\n\nCLI: \`eaorcs certify\``);
        fs.writeFileSync(docB, `# Doc B\n\nLink to A: [Doc A](./docA.md)\nLaw 2: Deterministic Execution\n\nAPI: \`/api/v1/certify\``);
        fs.writeFileSync(orphanDoc, `# Orphan Doc\n\nNot referenced in index.`);

        // Test detectBrokenReferences
        const brokenRes = docEngine.detectBrokenReferences(docsDir);
        assert.strictEqual(brokenRes.passed, false, 'Should detect broken link to missing.md');
        assert.strictEqual(brokenRes.brokenLinksCount, 1);
        assert.strictEqual(brokenRes.brokenLinks[0].linkTarget, './missing.md');

        // Test detectNormativeRuleDuplication
        const dupRes = docEngine.detectNormativeRuleDuplication(docsDir);
        assert.strictEqual(dupRes.passed, false, 'Should detect rule duplication across documents');
        assert.strictEqual(dupRes.duplicatedRulesCount >= 2, true, 'Law 1 and Law 2 should be detected as duplicated');

        // Test detectOrphanDocuments
        const orphanRes = docEngine.detectOrphanDocuments(docsDir, indexFile);
        assert.strictEqual(orphanRes.passed, false, 'Should detect orphan doc');
        assert.strictEqual(orphanRes.orphanFilesCount, 1);
        assert.strictEqual(orphanRes.orphanFiles[0].includes('orphan.md'), true);

        // Test detectDocumentationDrift
        const codeRegistry = {
            commands: ['eaorcs certify', 'eaorcs missing-cmd'],
            endpoints: ['/api/v1/certify', '/api/v1/missing-endpoint']
        };
        const driftRes = docEngine.detectDocumentationDrift(docsDir, codeRegistry);
        assert.strictEqual(driftRes.passed, false, 'Should detect drift for missing command and endpoint');
        assert.strictEqual(driftRes.missingCommands.includes('eaorcs missing-cmd'), true);
        assert.strictEqual(driftRes.missingEndpoints.includes('/api/v1/missing-endpoint'), true);

        // Test runDocumentationQualificationSuite
        const qualRes = docEngine.runDocumentationQualificationSuite(docsDir, {
            codeRegistry: { commands: ['eaorcs certify'], endpoints: ['/api/v1/certify'] },
            masterIndex: indexFile
        });
        assert.strictEqual(typeof qualRes.evidenceHash, 'string');
        assert.strictEqual(qualRes.evidenceHash.length, 64);
        assert.strictEqual(typeof qualRes.summary, 'object');

        console.log('  ✓ DocumentationGovernanceEngine tests passed');

        // ====================================================================
        // 2. ProductMetadataEngine Tests
        // ====================================================================
        const metaEngine = new ProductMetadataEngine();

        const productYamlPath = path.join(tmpDir, 'product.manifest.yaml');
        const productManifestContent = `
schema_version: "1.1.0"
distribution_spec: "DPA/PDA v1.1.0-FROZEN"

product:
  id: "eaorcs"
  name: "Enterprise Autonomous Operation System"
  version: "2026.3.1-LTS"
  framework_version: "3.0.0"
  lifecycle_state: "GA"
  federated_domain: "eaorcs.airroofers.eu"
  registry_endpoint: "https://products.airroofers.eu/v1/capabilities/eaorcs"
  governanceAuthority: "Ujomor Engineering Governance Authority"
  organization: "Ujomor Systems & Enterprise Governance"
  owner: "Air Roofers Platform Engineering"
  bounded_context: "Software Trust & Assurance"

capabilities:
  - id: "CAP-01"
    name: "Trust Scan"

contract_bindings:
  osap_attestation_contract: "STRICT"

sbom_attestation:
  slsa_level: "SLSA_LEVEL_4"

governance_policies:
  protocol_freeze: true

cli:
  command: "eaorcs"
`;
        fs.writeFileSync(productYamlPath, productManifestContent);

        // Test parseProductDescriptor & validateProductSchema
        const parseRes = metaEngine.parseProductDescriptor(productYamlPath);
        assert.strictEqual(parseRes.passed, true, 'Product manifest should satisfy 17-field schema');
        assert.strictEqual(parseRes.validation.evaluatedFieldsCount, 17);
        assert.strictEqual(parseRes.validation.missingFields.length, 0);

        // Test parseArchitectureDescriptor
        const archYamlPath = path.join(tmpDir, 'architecture.yaml');
        fs.writeFileSync(archYamlPath, `
name: "EAORCS Core Architecture"
version: "2026.3.1-LTS"
modules:
  - "engine/docs"
  - "engine/metadata"
facade: "engine/EAORCS.js"
hierarchy: "Workspace -> Session -> Graph -> Transaction -> Evidence"
`);
        const archRes = metaEngine.parseArchitectureDescriptor(archYamlPath);
        assert.strictEqual(archRes.valid, true);
        assert.strictEqual(archRes.architecture.name, 'EAORCS Core Architecture');

        // Test exportProductCatalog
        const catalogRes = metaEngine.exportProductCatalog([parseRes.parsed]);
        assert.strictEqual(catalogRes.totalProducts, 1);
        assert.strictEqual(catalogRes.validProductsCount, 1);
        assert.strictEqual(catalogRes.products[0].productId, 'eaorcs');

        console.log('  ✓ ProductMetadataEngine tests passed');

        // ====================================================================
        // 3. ReleaseEngineeringStandardEngine Tests
        // ====================================================================
        const relEngine = new ReleaseEngineeringStandardEngine();

        // Test validateReleaseGateStandards
        const gateVal = relEngine.validateReleaseGateStandards({
            gates: {
                SOURCE_HEADER_COMPLIANCE: true,
                ZERO_CRITICAL_VULNERABILITIES: true,
                DETERMINISTIC_BUILD_VERIFIED: true,
                REPRODUCIBLE_ARTIFACT_HASH: true,
                DOCUMENTATION_QUALIFICATION_PASSED: true,
                SLSA_LEVEL_4_PROVENANCE: true,
                RBOM_ATTESTATION_PRESENT: true
            }
        });
        assert.strictEqual(gateVal.passed, true);
        assert.strictEqual(gateVal.gatesPassed, 7);

        // Test generateReleaseEngineeringSpec
        const specRes = relEngine.generateReleaseEngineeringSpec({ id: 'eaorcs', version: '2026.3.1-LTS' }, 'PRODUCTION');
        assert.strictEqual(specRes.spec.slsaLevel, 'SLSA_LEVEL_4');
        assert.strictEqual(typeof specRes.specHash, 'string');
        assert.strictEqual(specRes.specHash.length, 64);

        // Test auditReleaseArtifactIntegrity
        const integrityRes = relEngine.auditReleaseArtifactIntegrity({
            checksums: { sha256: 'abc123hash' },
            signature: { signatureValue: 'sig123', authority: 'Governance Authority' },
            rbom: { attestation: 'SLSA_LEVEL_4', components: [{ name: '@eaorcs/core' }] }
        });
        assert.strictEqual(integrityRes.verified, true);
        assert.strictEqual(integrityRes.hashesMatch, true);
        assert.strictEqual(integrityRes.signatureValid, true);

        // Test enforceReleasePolicy
        const policyRes = relEngine.enforceReleasePolicy({ id: 'eaorcs', protocol_freeze: true }, { criticalVulnerabilitiesCount: 0 });
        assert.strictEqual(policyRes.compliant, true);

        // Test computeReleaseEvidenceHash
        const evHash = relEngine.computeReleaseEvidenceHash(specRes.spec, integrityRes);
        assert.strictEqual(typeof evHash, 'string');
        assert.strictEqual(evHash.length, 64);

        console.log('  ✓ ReleaseEngineeringStandardEngine tests passed');

    } finally {
        // Clean up tmp directory
        if (fs.existsSync(tmpDir)) {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        }
    }

    console.log('[PASSED] Documentation Governance & Engine Test Suite Completed Successfully.');
}

module.exports = runDocGovernanceTests;

if (require.main === module) {
    runDocGovernanceTests().catch(err => {
        console.error('Doc governance test failed:', err);
        process.exit(1);
    });
}
