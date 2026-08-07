/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Registries and Profiles Certification Suite
 * File           : eaorcs_corp_registries_and_profiles.test.js
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
 * CORP: Stream 4 — Test Suite & Master Certification
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

const ReleaseManifestEngine = require('../../engine/packaging/ReleaseManifestEngine');
const PlatformRegistryEngine = require('../../engine/registry/PlatformRegistryEngine');
const CapabilityRegistryEngine = require('../../engine/registry/CapabilityRegistryEngine');
const GovernanceRegistryEngine = require('../../engine/registry/GovernanceRegistryEngine');
const ReleaseProfileEngine = require('../../engine/governance/ReleaseProfileEngine');

async function runCORPRegistriesAndProfilesTests() {
    console.log('================================================================');
    console.log('  EAORCS CORP REGISTRIES & PROFILES CERTIFICATION SUITE');
    console.log('  Testing: ReleaseManifestEngine, PlatformRegistryEngine,');
    console.log('           CapabilityRegistryEngine, GovernanceRegistryEngine,');
    console.log('           ReleaseProfileEngine');
    console.log('================================================================\n');

    const projectRoot = path.resolve(__dirname, '../../');
    const tmpDir = path.join(projectRoot, 'tmp', 'test_registries_profiles');

    if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
    }

    // ─────────────────────────────────────────────────────────
    // 1. ReleaseManifestEngine Tests
    // ─────────────────────────────────────────────────────────
    console.log('[1] ReleaseManifestEngine tests...');
    const manifestEngine = new ReleaseManifestEngine();

    // 1.1 generateMasterReleaseManifest
    const sampleConfig = {
        releaseId: 'REL-2026.3.1-TEST',
        buildId: 'BUILD-9999',
        gitCommit: 'abc123def456',
        artifacts: [
            { packageId: 'pkg-01', packageName: 'core', filename: 'core.zip', sha256: 'a'.repeat(64), sizeMB: 10, audience: 'all' }
        ]
    };
    const masterManifest = manifestEngine.generateMasterReleaseManifest(sampleConfig);
    assert.strictEqual(masterManifest.releaseId, 'REL-2026.3.1-TEST');
    assert.strictEqual(masterManifest.buildId, 'BUILD-9999');
    assert.strictEqual(masterManifest.gitCommit, 'abc123def456');
    assert.ok(masterManifest.provenance && masterManifest.provenance.provenanceHash, 'Provenance must be generated');
    assert.strictEqual(masterManifest.artifacts.length, 1);
    assert.ok(masterManifest.registryReferences.platformRegistry, 'Registry references must exist');
    assert.strictEqual(masterManifest.governanceSeals.lawsCertifiedCount, 14);

    // Test default master release manifest generation
    const defaultManifest = ReleaseManifestEngine.generateMasterReleaseManifest({});
    assert.strictEqual(defaultManifest.releaseId, 'REL-2026.3.1-LTS');
    assert.ok(defaultManifest.buildId.startsWith('BUILD-'));

    // 1.2 deriveRBOM
    const rbom = manifestEngine.deriveRBOM(masterManifest);
    assert.strictEqual(rbom.release, 'REL-2026.3.1-TEST');
    assert.strictEqual(rbom.artifactsCount, 1);
    assert.ok(rbom.rbomHash && rbom.rbomHash.length === 64, 'RBOM must have SHA-256 hash');
    assert.throws(() => manifestEngine.deriveRBOM(null), /Master release manifest is required/);

    // Static deriveRBOM
    const staticRbom = ReleaseManifestEngine.deriveRBOM(masterManifest);
    assert.strictEqual(staticRbom.rbomHash, rbom.rbomHash);

    // 1.3 deriveManifest
    const derivedManifest = manifestEngine.deriveManifest(masterManifest);
    assert.strictEqual(derivedManifest.releaseId, 'REL-2026.3.1-TEST');
    assert.strictEqual(derivedManifest.projectName, 'EAORCS Governance Platform');
    assert.strictEqual(derivedManifest.version, '2026.3.1-TEST');
    assert.strictEqual(derivedManifest.lawsCertified, 14);
    assert.throws(() => manifestEngine.deriveManifest(null), /Master release manifest is required/);

    // Static deriveManifest
    const staticDerived = ReleaseManifestEngine.deriveManifest(masterManifest);
    assert.strictEqual(staticDerived.releaseId, derivedManifest.releaseId);

    // 1.4 deriveProvenance
    const provenance = manifestEngine.deriveProvenance(masterManifest);
    assert.strictEqual(provenance.releaseId, 'REL-2026.3.1-TEST');
    assert.throws(() => manifestEngine.deriveProvenance(null), /Master release manifest with valid provenance is required/);

    // Static deriveProvenance
    const staticProv = ReleaseManifestEngine.deriveProvenance(masterManifest);
    assert.strictEqual(staticProv.provenanceHash, provenance.provenanceHash);

    // 1.5 exportReleaseManifestYaml
    const relManifestYamlFile = path.join(tmpDir, 'release_manifest.yaml');
    const yamlContent = manifestEngine.exportReleaseManifestYaml(masterManifest, relManifestYamlFile);
    assert.ok(yamlContent.includes('releaseId: "REL-2026.3.1-TEST"') || yamlContent.includes('releaseId: REL-2026.3.1-TEST'));
    assert.ok(fs.existsSync(relManifestYamlFile), 'Release manifest YAML file must be exported');
    assert.throws(() => manifestEngine.exportReleaseManifestYaml(null), /Master release manifest is required/);

    // Static exportReleaseManifestYaml
    const staticYamlFile = path.join(tmpDir, 'static_release_manifest.yaml');
    ReleaseManifestEngine.exportReleaseManifestYaml(masterManifest, staticYamlFile);
    assert.ok(fs.existsSync(staticYamlFile));

    // 1.6 exportPlatformRegistryYaml
    const platformYamlFile = path.join(tmpDir, 'platform_registry.yaml');
    const platformYaml = manifestEngine.exportPlatformRegistryYaml(platformYamlFile);
    assert.ok(platformYaml.includes('EAORCS Platform') && platformYaml.includes('platformName:'));
    assert.ok(fs.existsSync(platformYamlFile));

    // Static exportPlatformRegistryYaml
    const staticPlatformFile = path.join(tmpDir, 'static_platform_registry.yaml');
    ReleaseManifestEngine.exportPlatformRegistryYaml(staticPlatformFile);
    assert.ok(fs.existsSync(staticPlatformFile));

    // 1.7 exportCapabilityRegistryYaml
    const capYamlFile = path.join(tmpDir, 'capability_registry.yaml');
    const capYaml = manifestEngine.exportCapabilityRegistryYaml(capYamlFile);
    assert.ok(capYaml.includes('capabilities:'));
    assert.ok(fs.existsSync(capYamlFile));

    // Static exportCapabilityRegistryYaml
    const staticCapFile = path.join(tmpDir, 'static_capability_registry.yaml');
    ReleaseManifestEngine.exportCapabilityRegistryYaml(staticCapFile);
    assert.ok(fs.existsSync(staticCapFile));

    // 1.8 exportGovernanceRegistryYaml
    const govYamlFile = path.join(tmpDir, 'governance_registry.yaml');
    const govYaml = manifestEngine.exportGovernanceRegistryYaml(govYamlFile);
    assert.ok(govYaml.includes('lawsCertifiedCount: 14'));
    assert.ok(fs.existsSync(govYamlFile));

    // Static exportGovernanceRegistryYaml
    const staticGovFile = path.join(tmpDir, 'static_governance_registry.yaml');
    ReleaseManifestEngine.exportGovernanceRegistryYaml(staticGovFile);
    assert.ok(fs.existsSync(staticGovFile));

    console.log('    ✓ ReleaseManifestEngine: all 8 instance and static methods verified');

    // ─────────────────────────────────────────────────────────
    // 2. PlatformRegistryEngine Tests
    // ─────────────────────────────────────────────────────────
    console.log('\n[2] PlatformRegistryEngine tests...');
    const platformEngine = new PlatformRegistryEngine();

    // 2.1 buildPlatformRegistry
    const platReg = platformEngine.buildPlatformRegistry(projectRoot);
    assert.strictEqual(platReg.registry_version, '2026.3.1-LTS');
    assert.ok(platReg.total_products > 0, 'Must discover at least 1 product');
    assert.ok(Array.isArray(platReg.products), 'products must be array');
    assert.ok(Array.isArray(platReg.domains), 'domains must be array');
    assert.ok(Array.isArray(platReg.owners), 'owners must be array');

    // Static buildPlatformRegistry
    const staticPlatReg = PlatformRegistryEngine.buildPlatformRegistry(projectRoot);
    assert.strictEqual(staticPlatReg.total_products, platReg.total_products);

    // 2.2 exportRegistry (YAML and JSON)
    const platExportYaml = path.join(tmpDir, 'export_platform_registry.yaml');
    const platExportJson = path.join(tmpDir, 'export_platform_registry.json');

    const exportedYaml = platformEngine.exportRegistry(platReg, platExportYaml);
    assert.ok(exportedYaml.includes('EAORCS Platform Registry Definition'));
    assert.ok(fs.existsSync(platExportYaml));

    const exportedJson = platformEngine.exportRegistry(platReg, platExportJson);
    const parsedJson = JSON.parse(exportedJson);
    assert.strictEqual(parsedJson.registry_version, '2026.3.1-LTS');
    assert.ok(fs.existsSync(platExportJson));

    assert.throws(() => platformEngine.exportRegistry(null), /Registry object must be provided/);

    // Static exportRegistry
    const staticExportYamlFile = path.join(tmpDir, 'static_export_platform.yaml');
    PlatformRegistryEngine.exportRegistry(platReg, staticExportYamlFile);
    assert.ok(fs.existsSync(staticExportYamlFile));

    console.log('    ✓ PlatformRegistryEngine: buildPlatformRegistry & exportRegistry verified');

    // ─────────────────────────────────────────────────────────
    // 3. CapabilityRegistryEngine Tests
    // ─────────────────────────────────────────────────────────
    console.log('\n[3] CapabilityRegistryEngine tests...');
    const capRegistryEngine = new CapabilityRegistryEngine();

    // 3.1 Default / built-in capabilities initialization
    const initialCaps = capRegistryEngine.listCapabilities();
    assert.ok(initialCaps.length >= 9, `Expected ≥9 built-in capabilities, got ${initialCaps.length}`);

    // 3.2 getCapability
    const blueprintCap = capRegistryEngine.getCapability('cap.blueprint');
    assert.ok(blueprintCap, 'Built-in cap.blueprint must exist');
    assert.strictEqual(blueprintCap.name, 'Blueprint Capability');
    assert.strictEqual(blueprintCap.bounded_context, 'INTELLIGENCE');

    const unknownCap = capRegistryEngine.getCapability('cap.nonexistent');
    assert.strictEqual(unknownCap, undefined);

    // 3.3 registerCapability
    const customCapDescriptor = {
        id: 'cap.customTest',
        name: 'Custom Certification Capability',
        bounded_context: 'CERTIFICATION',
        category: 'CERTIFICATION',
        version: '2026.3.1-TEST'
    };
    const registered = capRegistryEngine.registerCapability(customCapDescriptor);
    assert.strictEqual(registered.id, 'cap.customTest');
    assert.ok(registered.registeredAt, 'registeredAt must be added upon registration');

    const fetchedCustom = capRegistryEngine.getCapability('cap.customTest');
    assert.strictEqual(fetchedCustom.name, 'Custom Certification Capability');
    assert.strictEqual(fetchedCustom.bounded_context, 'CERTIFICATION');

    // Test error cases for invalid capability descriptor
    assert.throws(() => capRegistryEngine.registerCapability(null), /Invalid capability descriptor provided/);
    assert.throws(() => capRegistryEngine.registerCapability({ name: 'No ID' }), /Invalid capability descriptor provided/);
    assert.throws(() => capRegistryEngine.registerCapability({ id: 'cap.noName' }), /Invalid capability descriptor provided/);

    // 3.4 listCapabilities
    const updatedCaps = capRegistryEngine.listCapabilities();
    assert.strictEqual(updatedCaps.length, initialCaps.length + 1);

    // 3.5 buildCapabilityRegistry & getCapabilityBindings & exportRegistry
    const capRegObj = capRegistryEngine.buildCapabilityRegistry(projectRoot);
    assert.strictEqual(capRegObj.registry_version, '2026.3.1-LTS');
    assert.ok(capRegObj.total_capabilities > 0);

    const bindings = capRegistryEngine.getCapabilityBindings('cap.blueprint');
    assert.strictEqual(bindings.bound, true);
    assert.strictEqual(bindings.capabilityId, 'cap.blueprint');

    const capExportYaml = path.join(tmpDir, 'export_cap_registry.yaml');
    const exportedCapYaml = capRegistryEngine.exportRegistry(capRegObj, capExportYaml);
    assert.ok(exportedCapYaml.includes('EAORCS Capability Registry Definition'));
    assert.ok(fs.existsSync(capExportYaml));

    // Static shortcuts
    const staticCapReg = CapabilityRegistryEngine.buildCapabilityRegistry(projectRoot);
    assert.ok(staticCapReg.total_capabilities > 0);

    const staticBindings = CapabilityRegistryEngine.getCapabilityBindings('cap.blueprint', projectRoot);
    assert.strictEqual(staticBindings.bound, true);

    const staticCapExportYaml = path.join(tmpDir, 'static_export_cap.yaml');
    CapabilityRegistryEngine.exportRegistry(capRegObj, staticCapExportYaml);
    assert.ok(fs.existsSync(staticCapExportYaml));

    console.log('    ✓ CapabilityRegistryEngine: registerCapability, getCapability, listCapabilities, buildCapabilityRegistry & getCapabilityBindings verified');

    // ─────────────────────────────────────────────────────────
    // 4. GovernanceRegistryEngine Tests
    // ─────────────────────────────────────────────────────────
    console.log('\n[4] GovernanceRegistryEngine tests...');
    const govEngine = new GovernanceRegistryEngine();

    // 4.1 buildGovernanceRegistry
    const govRegistry = govEngine.buildGovernanceRegistry(projectRoot);
    assert.strictEqual(govRegistry.registry_version, '2026.3.1-LTS');
    assert.ok(govRegistry.total_standards >= 10, 'Expected at least 10 standards');
    assert.strictEqual(govRegistry.constitutional_laws.length, 14, 'Must contain all 14 constitutional laws');
    assert.ok(govRegistry.active_standards_count > 0);
    assert.ok(govRegistry.superseded_standards_count > 0);

    // Static buildGovernanceRegistry
    const staticGovReg = GovernanceRegistryEngine.buildGovernanceRegistry(projectRoot);
    assert.strictEqual(staticGovReg.total_standards, govRegistry.total_standards);

    // 4.2 detectSupersededStandards
    const superseded = govEngine.detectSupersededStandards(govRegistry);
    assert.ok(Array.isArray(superseded), 'Must return an array');
    assert.ok(superseded.length > 0, 'Must detect superseded standards');

    const supersededIds = superseded.map(s => s.id);
    assert.ok(supersededIds.includes('DPA_PDA_V1') || supersededIds.includes('ISO_27001_2013') || supersededIds.includes('NIST_SP_800_53_REV4'),
        'Must detect known superseded standards like DPA_PDA_V1 or ISO_27001_2013');

    // Test passing directory path directly to detectSupersededStandards
    const supersededFromDir = govEngine.detectSupersededStandards(projectRoot);
    assert.strictEqual(supersededFromDir.length, superseded.length);

    // Static detectSupersededStandards
    const staticSuperseded = GovernanceRegistryEngine.detectSupersededStandards(govRegistry);
    assert.strictEqual(staticSuperseded.length, superseded.length);

    // 4.3 exportRegistry (YAML and JSON)
    const govExportYaml = path.join(tmpDir, 'export_gov_registry.yaml');
    const govExportJson = path.join(tmpDir, 'export_gov_registry.json');

    const exportedGovYaml = govEngine.exportRegistry(govRegistry, govExportYaml);
    assert.ok(exportedGovYaml.includes('EAORCS Governance Registry Definition'));
    assert.ok(fs.existsSync(govExportYaml));

    const exportedGovJson = govEngine.exportRegistry(govRegistry, govExportJson);
    const parsedGovJson = JSON.parse(exportedGovJson);
    assert.strictEqual(parsedGovJson.registry_version, '2026.3.1-LTS');
    assert.ok(fs.existsSync(govExportJson));

    assert.throws(() => govEngine.exportRegistry(null), /Registry object must be provided/);

    // Static exportRegistry
    const staticExportGovYamlFile = path.join(tmpDir, 'static_export_gov.yaml');
    GovernanceRegistryEngine.exportRegistry(govRegistry, staticExportGovYamlFile);
    assert.ok(fs.existsSync(staticExportGovYamlFile));

    console.log('    ✓ GovernanceRegistryEngine: buildGovernanceRegistry, detectSupersededStandards & exportRegistry verified');

    // ─────────────────────────────────────────────────────────
    // 5. ReleaseProfileEngine Tests
    // ─────────────────────────────────────────────────────────
    console.log('\n[5] ReleaseProfileEngine tests...');
    const profileEngine = new ReleaseProfileEngine();

    // 5.1 Static PROFILES property
    assert.ok(ReleaseProfileEngine.PROFILES, 'ReleaseProfileEngine.PROFILES must exist');
    const profileKeys = Object.keys(ReleaseProfileEngine.PROFILES);
    assert.strictEqual(profileKeys.length, 8, 'Expected 8 profiles: DEVELOPER, ENTERPRISE, GOVERNMENT, SOVEREIGN, OEM, MARKETPLACE, SAAS, INTERNAL');
    assert.ok(profileKeys.includes('DEVELOPER'));
    assert.ok(profileKeys.includes('ENTERPRISE'));
    assert.ok(profileKeys.includes('GOVERNMENT'));
    assert.ok(profileKeys.includes('SOVEREIGN'));
    assert.ok(profileKeys.includes('OEM'));
    assert.ok(profileKeys.includes('MARKETPLACE'));
    assert.ok(profileKeys.includes('SAAS'));
    assert.ok(profileKeys.includes('INTERNAL'));

    // 5.2 getProfileConfig
    const devConfig = profileEngine.getProfileConfig('DEVELOPER');
    assert.strictEqual(devConfig.profileId, 'DEVELOPER');
    assert.strictEqual(devConfig.tier, 1);
    assert.strictEqual(devConfig.minCoverageThreshold, 50);

    const sovConfig = profileEngine.getProfileConfig('PROFILE-SOVEREIGN');
    assert.strictEqual(sovConfig.profileId, 'SOVEREIGN');
    assert.strictEqual(sovConfig.tier, 4);
    assert.strictEqual(sovConfig.minCoverageThreshold, 95);

    assert.throws(() => profileEngine.getProfileConfig('INVALID_PROFILE'), /Unknown Release Profile ID/);
    assert.throws(() => profileEngine.getProfileConfig(null), /Profile ID must be a non-empty string/);

    // 5.3 filterArtifactsForProfile
    const mixedArtifacts = [
        'source-code.zip',
        'classified-spec.pdf',
        'enterprise-license-vault.key',
        { filename: 'sovereign-vault.pkg', type: 'sovereign-vault', minTier: 4 },
        { filename: 'enterprise-audit.json', type: 'enterprise-audit', minTier: 2 },
        { filename: 'dev-notes.md', targetProfiles: ['DEVELOPER'] }
    ];

    const filteredForDev = profileEngine.filterArtifactsForProfile(mixedArtifacts, 'DEVELOPER');
    // Developer should disallow 'classified-spec' and 'enterprise-license-vault'
    const devFilenames = filteredForDev.map(a => typeof a === 'string' ? a : a.filename);
    assert.ok(!devFilenames.includes('classified-spec.pdf'));
    assert.ok(!devFilenames.includes('enterprise-license-vault.key'));
    assert.ok(!devFilenames.includes('sovereign-vault.pkg'), 'Developer tier (1) cannot include minTier 4 artifacts');
    assert.ok(devFilenames.includes('dev-notes.md'));

    const filteredForSovereign = profileEngine.filterArtifactsForProfile(mixedArtifacts, 'SOVEREIGN');
    const sovFilenames = filteredForSovereign.map(a => typeof a === 'string' ? a : a.filename);
    assert.ok(sovFilenames.includes('sovereign-vault.pkg'), 'Sovereign tier (4) should include minTier 4 artifacts');

    // Test non-array input
    assert.deepStrictEqual(profileEngine.filterArtifactsForProfile(null, 'DEVELOPER'), []);

    // 5.4 validateProfileGates
    // Test passing results for DEVELOPER profile
    const devGatesPass = [
        { gate: 'unitTestsPass', passed: true },
        { gate: 'basicLintPass', passed: true }
    ];
    const devValidationResult = profileEngine.validateProfileGates('DEVELOPER', devGatesPass);
    assert.strictEqual(devValidationResult.passed, true);
    assert.strictEqual(devValidationResult.passedGatesCount, 2);
    assert.strictEqual(devValidationResult.failedGatesCount, 0);

    // Test failing results for ENTERPRISE profile (missing gate)
    const entGatesPartial = {
        unitTestsPass: true,
        integrationTestsPass: true,
        securityScanPass: false
        // missing: licenseCompliancePass
    };
    const entValidationResult = profileEngine.validateProfileGates('ENTERPRISE', entGatesPartial);
    assert.strictEqual(entValidationResult.passed, false);
    assert.strictEqual(entValidationResult.passedGatesCount, 2);
    assert.strictEqual(entValidationResult.failedGatesCount, 2); // 1 false + 1 missing
    assert.ok(entValidationResult.missingGates.includes('licenseCompliancePass'));
    assert.ok(entValidationResult.failedGates.includes('securityScanPass'));

    console.log('    ✓ ReleaseProfileEngine: PROFILES, getProfileConfig, filterArtifactsForProfile & validateProfileGates verified');

    // ─────────────────────────────────────────────────────────
    // Clean up temporary test files
    // ─────────────────────────────────────────────────────────
    try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (e) {
        // ignore cleanup error
    }

    console.log('\n================================================================');
    console.log('  CORP REGISTRIES & PROFILES CERTIFICATION PASSED');
    console.log('  All 5 Engine Classes Verified:');
    console.log('    ✓ ReleaseManifestEngine (8 methods + statics)');
    console.log('    ✓ PlatformRegistryEngine (2 methods + statics)');
    console.log('    ✓ CapabilityRegistryEngine (4 methods + built-ins)');
    console.log('    ✓ GovernanceRegistryEngine (3 methods + statics)');
    console.log('    ✓ ReleaseProfileEngine (3 methods + statics)');
    console.log('  STATUS: ALL REGISTRIES AND PROFILES CERTIFIED PASS');
    console.log('================================================================\n');
}

if (require.main === module) {
    runCORPRegistriesAndProfilesTests().catch(err => {
        console.error('\nCORP Registries and Profiles Test Error:', err.message || err);
        process.exit(1);
    });
}

module.exports = runCORPRegistriesAndProfilesTests;
