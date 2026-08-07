/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Stream 3 Release Profiles & Generated Architecture Test
 * File           : eaorcs_release_profiles_generated_architecture.test.js
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
 * CORP: Stream 3 — Release Profiles & Generated Architecture
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ReleaseProfileEngine = require('../../engine/governance/ReleaseProfileEngine');
const DocumentationGovernanceEngine = require('../../engine/docs/DocumentationGovernanceEngine');

console.log('[EAORCS Stream 3 Test] Starting verification of Release Profiles & Generated Architecture...');

// 1. Test ReleaseProfileEngine - 8 Profiles Configuration
const releaseEngine = new ReleaseProfileEngine();
const expectedProfiles = ['Developer', 'Enterprise', 'Government', 'Sovereign', 'OEM', 'Marketplace', 'SaaS', 'Internal'];

expectedProfiles.forEach(pId => {
    const config = releaseEngine.getProfileConfig(pId);
    assert.ok(config, `Profile config for '${pId}' must exist`);
    assert.strictEqual(config.profileId, pId.toUpperCase());
    assert.ok(Array.isArray(config.mandatoryGates), `Mandatory gates for '${pId}' must be an array`);
    assert.ok(config.mandatoryGates.length > 0, `Mandatory gates for '${pId}' must not be empty`);
    assert.ok(typeof config.tier === 'number', `Tier for '${pId}' must be a number`);
});

console.log('✓ ReleaseProfileEngine: All 8 Release Profiles verified.');

// 2. Test ReleaseProfileEngine - Artifact Filtering
const testArtifacts = [
    { id: 'art-1', type: 'source', path: 'src/index.js' },
    { id: 'art-2', type: 'classified-spec', path: 'docs/classified_spec.md' },
    { id: 'art-3', type: 'sovereign-vault', minTier: 4, path: 'vault/keys.enc' },
    { id: 'art-4', type: 'compliance-pack', targetProfiles: ['ENTERPRISE', 'GOVERNMENT'], path: 'audit/report.pdf' },
    'src/core.js',
    'secrets/airgap-package.tar.gz'
];

const devFiltered = releaseEngine.filterArtifactsForProfile(testArtifacts, 'Developer');
assert.ok(devFiltered.some(a => a.id === 'art-1'), 'Developer profile should include source');
assert.ok(!devFiltered.some(a => a.id === 'art-2'), 'Developer profile should filter out classified-spec');
assert.ok(!devFiltered.some(a => a.id === 'art-3'), 'Developer profile should filter out sovereign vault (tier 4)');

const sovereignFiltered = releaseEngine.filterArtifactsForProfile(testArtifacts, 'Sovereign');
assert.ok(sovereignFiltered.some(a => a.id === 'art-3'), 'Sovereign profile should include sovereign vault (tier 4)');

console.log('✓ ReleaseProfileEngine: Artifact filtering verified.');

// 3. Test ReleaseProfileEngine - Release Gate Validation
const enterpriseResultsPassing = {
    unitTestsPass: true,
    integrationTestsPass: true,
    securityScanPass: true,
    licenseCompliancePass: true
};
const gateCheckPassing = releaseEngine.validateProfileGates('Enterprise', enterpriseResultsPassing);
assert.strictEqual(gateCheckPassing.passed, true, 'Enterprise gates must pass when all conditions met');
assert.strictEqual(gateCheckPassing.passedGatesCount, 4);
assert.strictEqual(gateCheckPassing.failedGatesCount, 0);

const enterpriseResultsFailing = {
    unitTestsPass: true,
    integrationTestsPass: false,
    securityScanPass: true
};
const gateCheckFailing = releaseEngine.validateProfileGates('Enterprise', enterpriseResultsFailing);
assert.strictEqual(gateCheckFailing.passed, false, 'Enterprise gates must fail when mandatory gates miss or fail');
assert.ok(gateCheckFailing.failedGates.includes('integrationTestsPass'));
assert.ok(gateCheckFailing.missingGates.includes('licenseCompliancePass'));

console.log('✓ ReleaseProfileEngine: Gate validation verified.');

// 4. Test DocumentationGovernanceEngine - buildDocumentationDAG
const docEngine = new DocumentationGovernanceEngine();
const docDir = path.resolve(__dirname, '../../docs');

const dagResult = docEngine.buildDocumentationDAG(docDir);
assert.ok(dagResult, 'DAG result must be returned');
assert.strictEqual(Array.isArray(dagResult.levels), true, 'DAG levels must be an array');
assert.strictEqual(dagResult.levels.length, 8, 'DAG levels must cover Level 0 through Level 7');
assert.ok(Array.isArray(dagResult.nodes), 'DAG nodes must be an array');
assert.ok(Array.isArray(dagResult.edges), 'DAG edges must be an array');
assert.strictEqual(dagResult.isAcyclic, true, 'Documentation DAG must be acyclic');

console.log('✓ DocumentationGovernanceEngine: buildDocumentationDAG verified (Level 0 -> Level 7).');

// 5. Test DocumentationGovernanceEngine - generateArchitectureDiagrams
const diagramResult = docEngine.generateArchitectureDiagrams();
assert.ok(diagramResult, 'Diagram result must be returned');
assert.ok(diagramResult.mermaid, 'Mermaid object must exist');
assert.ok(diagramResult.ascii, 'ASCII object must exist');

assert.ok(diagramResult.mermaid.capabilityMap.includes('graph TD'), 'Mermaid capabilityMap must be graph TD');
assert.ok(diagramResult.mermaid.boundedContextMap.includes('graph LR'), 'Mermaid boundedContextMap must be graph LR');
assert.ok(diagramResult.mermaid.dependencyDiagram.includes('graph TD'), 'Mermaid dependencyDiagram must be graph TD');

assert.ok(diagramResult.ascii.capabilityMap.includes('EAORCS CAPABILITY MAP'), 'ASCII capability map header must exist');
assert.ok(diagramResult.ascii.boundedContextMap.includes('BOUNDED CONTEXT MAP'), 'ASCII bounded context map header must exist');
assert.ok(diagramResult.ascii.dependencyDiagram.includes('DEPENDENCY DIAGRAM'), 'ASCII dependency diagram header must exist');

console.log('✓ DocumentationGovernanceEngine: generateArchitectureDiagrams verified (Mermaid & ASCII).');

console.log('\n[EAORCS Stream 3 Test] ALL CHECKS PASSED SUCCESSFULLY.');
