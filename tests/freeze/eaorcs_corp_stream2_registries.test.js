/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Stream 2 Registries Verification Suite
 * File           : eaorcs_corp_stream2_registries.test.js
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
 * CORP: Stream 2 — Platform, Capability & Governance Registries
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

const rootDir = path.resolve(__dirname, '../../');

console.log('[EAORCS Stream 2 Test] Starting verification of Stream 2 Platform, Capability & Governance Registries...');

// 1. Verify Headers on Engine Files
const filesToCheck = [
    path.join(rootDir, 'engine', 'registry', 'PlatformRegistryEngine.js'),
    path.join(rootDir, 'engine', 'registry', 'CapabilityRegistryEngine.js'),
    path.join(rootDir, 'engine', 'registry', 'GovernanceRegistryEngine.js')
];

filesToCheck.forEach(filePath => {
    assert.ok(fs.existsSync(filePath), `Engine file must exist: ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf8');
    assert.ok(content.includes('Universal Autonomous AI Governance Operating System (UAIGOS)'), `File must contain UAIGOS header: ${filePath}`);
    assert.ok(content.includes('Ujomor Systems & Enterprise Governance Authority'), `File must contain Author header: ${filePath}`);
    assert.ok(content.includes('CORP: Stream 2'), `File must contain CORP reference: ${filePath}`);
});
console.log('✓ Header compliance verified across all Stream 2 engine files.');

// 2. PlatformRegistryEngine Verification
const PlatformRegistryEngine = require(path.join(rootDir, 'engine', 'registry', 'PlatformRegistryEngine.js'));
const platformRegistry = PlatformRegistryEngine.buildPlatformRegistry(rootDir);

assert.ok(platformRegistry, 'buildPlatformRegistry must return registry object');
assert.strictEqual(platformRegistry.registry_version, '2026.3.1-LTS', 'Registry version must be 2026.3.1-LTS');
assert.ok(Array.isArray(platformRegistry.products), 'products must be an array');
assert.ok(platformRegistry.products.length > 0, 'products array must not be empty');
assert.ok(Array.isArray(platformRegistry.domains), 'domains must be an array');
assert.ok(Array.isArray(platformRegistry.owners), 'owners must be an array');
assert.ok(Array.isArray(platformRegistry.lifecycles), 'lifecycles must be an array');
assert.ok(Array.isArray(platformRegistry.release_channels), 'release_channels must be an array');

const eaorcsProd = platformRegistry.products.find(p => p.id === 'eaorcs');
assert.ok(eaorcsProd, 'eaorcs product must be registered in platform registry');
assert.ok(eaorcsProd.name, 'eaorcs product must have a name');
assert.ok(eaorcsProd.owner, 'eaorcs product must have an owner');

// Export Platform Registry test
const tmpPlatformExportYaml = path.join(rootDir, 'tmp', 'test_platform_registry.yaml');
const tmpPlatformExportJson = path.join(rootDir, 'tmp', 'test_platform_registry.json');
const yamlOut = PlatformRegistryEngine.exportRegistry(platformRegistry, tmpPlatformExportYaml);
const jsonOut = PlatformRegistryEngine.exportRegistry(platformRegistry, tmpPlatformExportJson);

assert.ok(fs.existsSync(tmpPlatformExportYaml), 'Platform YAML export file must exist on disk');
assert.ok(fs.existsSync(tmpPlatformExportJson), 'Platform JSON export file must exist on disk');
assert.ok(yamlOut.includes('products:'), 'YAML output must contain products block');
assert.ok(jsonOut.includes('"products":'), 'JSON output must contain products JSON field');
console.log('✓ PlatformRegistryEngine verified (buildPlatformRegistry & exportRegistry).');

// 3. CapabilityRegistryEngine Verification
const CapabilityRegistryEngine = require(path.join(rootDir, 'engine', 'registry', 'CapabilityRegistryEngine.js'));
const capEngine = new CapabilityRegistryEngine();
const capRegistry = capEngine.buildCapabilityRegistry(rootDir);

assert.ok(capRegistry, 'buildCapabilityRegistry must return capability registry object');
assert.strictEqual(capRegistry.registry_version, '2026.3.1-LTS');
assert.ok(Array.isArray(capRegistry.capabilities), 'capabilities must be an array');
assert.ok(capRegistry.capabilities.length >= 9, 'must contain built-in and manifest capabilities');
assert.ok(Array.isArray(capRegistry.bounded_contexts), 'bounded_contexts must be an array');

// Binding verification
const scanBinding = capEngine.getCapabilityBindings('CAP-EAORCS-01');
assert.ok(scanBinding, 'getCapabilityBindings for CAP-EAORCS-01 must return binding object');
assert.strictEqual(scanBinding.bound, true, 'CAP-EAORCS-01 must be bound');
assert.strictEqual(scanBinding.product.id, 'eaorcs');
assert.ok(scanBinding.release.lifecycle, 'release must have lifecycle property');

const blueprintBinding = capEngine.getCapabilityBindings('cap.blueprint');
assert.strictEqual(blueprintBinding.bound, true, 'cap.blueprint must be bound');

const unknownBinding = capEngine.getCapabilityBindings('CAP-UNKNOWN-999');
assert.strictEqual(unknownBinding.bound, false, 'unknown capability must return bound: false');

// Export Capability Registry test
const tmpCapExportYaml = path.join(rootDir, 'tmp', 'test_capability_registry.yaml');
const capYamlOut = capEngine.exportRegistry(capRegistry, tmpCapExportYaml);
assert.ok(fs.existsSync(tmpCapExportYaml), 'Capability export file must exist');
assert.ok(capYamlOut.includes('capabilities:'), 'Exported YAML must include capabilities:');
console.log('✓ CapabilityRegistryEngine verified (buildCapabilityRegistry & getCapabilityBindings).');

// 4. GovernanceRegistryEngine Verification
const GovernanceRegistryEngine = require(path.join(rootDir, 'engine', 'registry', 'GovernanceRegistryEngine.js'));
const govRegistry = GovernanceRegistryEngine.buildGovernanceRegistry(rootDir);

assert.ok(govRegistry, 'buildGovernanceRegistry must return governance registry object');
assert.strictEqual(govRegistry.registry_version, '2026.3.1-LTS');
assert.ok(Array.isArray(govRegistry.standards), 'standards must be an array');
assert.ok(govRegistry.standards.length > 0, 'standards list must not be empty');
assert.strictEqual(govRegistry.constitutional_laws.length, 14, 'must list all 14 constitutional laws');

const supersededList = GovernanceRegistryEngine.detectSupersededStandards(govRegistry);
assert.ok(Array.isArray(supersededList), 'detectSupersededStandards must return an array');
assert.ok(supersededList.length > 0, 'must detect superseded/deprecated standards (e.g. DPA_PDA_V1, ISO_27001_2013, NIST_SP_800_53_REV4)');

const foundDpaV1 = supersededList.find(s => s.id === 'DPA_PDA_V1');
assert.ok(foundDpaV1, 'DPA_PDA_V1 must be in superseded list');
assert.strictEqual(foundDpaV1.status, 'SUPERSEDED');
assert.strictEqual(foundDpaV1.superseded_by, 'DPA_PDA_V1_1_FROZEN');

// Export Governance Registry test
const tmpGovExportYaml = path.join(rootDir, 'tmp', 'test_governance_registry.yaml');
const govYamlOut = GovernanceRegistryEngine.exportRegistry(govRegistry, tmpGovExportYaml);
assert.ok(fs.existsSync(tmpGovExportYaml), 'Governance export file must exist');
assert.ok(govYamlOut.includes('constitutional_laws:'), 'Governance YAML output must include constitutional_laws');

console.log('✓ GovernanceRegistryEngine verified (buildGovernanceRegistry & detectSupersededStandards).');

// Clean up temporary test files
try {
    if (fs.existsSync(tmpPlatformExportYaml)) fs.unlinkSync(tmpPlatformExportYaml);
    if (fs.existsSync(tmpPlatformExportJson)) fs.unlinkSync(tmpPlatformExportJson);
    if (fs.existsSync(tmpCapExportYaml)) fs.unlinkSync(tmpCapExportYaml);
    if (fs.existsSync(tmpGovExportYaml)) fs.unlinkSync(tmpGovExportYaml);
} catch (e) {}

console.log('\n[EAORCS Stream 2 Test] ALL CHECKS PASSED SUCCESSFULLY.');
