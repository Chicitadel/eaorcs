/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS CORP Hardening Modification Tests
 * File           : eaorcs_corp_hardening_modifications.test.js
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
 * CORP: CORP Operational Hardening — Recs A, D, E, F, G, H, I
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

const assert = require('assert');

const ReleaseAuthorizationEngine    = require('../../engine/governance/ReleaseAuthorizationEngine');
const SDKCapabilityRegistryEngine   = require('../../engine/sdk/SDKCapabilityRegistryEngine');
const GovernanceProfileEngine       = require('../../engine/governance/GovernanceProfileEngine');
const EvidencePlatformEngine        = require('../../engine/telemetry/EvidencePlatformEngine');
const CommercialReadinessEngine     = require('../../engine/commercial/CommercialReadinessEngine');
const DocumentationPlatformEngine   = require('../../engine/docs/DocumentationPlatformEngine');
const PluginExtensionPlatformEngine = require('../../engine/plugin/PluginExtensionPlatformEngine');

async function runHardeningModificationTests() {
    console.log('================================================================');
    console.log('  CORP HARDENING — ENGINE MODIFICATION TESTS (Recs A,D,E,F,G,H,I)');
    console.log('================================================================\n');

    // -----------------------------------------------------------------------
    // Rec A: ReleaseAuthorizationEngine
    // -----------------------------------------------------------------------
    console.log('--- Rec A: ReleaseAuthorizationEngine ---');

    const rae = new ReleaseAuthorizationEngine();
    rae.initializeRelease('REL-001', 'PROFILE-ENTERPRISE');

    // Assertion 1
    const ivResult = rae.recordIndependentVerificationResult('REL-001', { overallPassed: true, reportId: 'RPT-01' });
    assert.ok(ivResult.evidenceHash, 'ivResult.evidenceHash must be present');
    assert.strictEqual(ivResult.evidenceHash.length, 64, 'evidenceHash must be 64 hex characters');
    assert.strictEqual(ivResult.passed, true, 'passed must be true');
    assert.strictEqual(ivResult.reportId, 'RPT-01', 'reportId must be RPT-01');
    console.log('  [PASS] Assertion 1: recordIndependentVerificationResult returns evidenceHash (64 chars)');

    // Assertion 2
    assert.strictEqual(rae.requiresIndependentVerification('Enterprise'), true,
        'Enterprise profile must require independent verification');
    console.log('  [PASS] Assertion 2: requiresIndependentVerification("Enterprise") === true');

    // Assertion 3
    assert.strictEqual(rae.requiresIndependentVerification('Community'), false,
        'Community profile must not require independent verification');
    console.log('  [PASS] Assertion 3: requiresIndependentVerification("Community") === false');

    // -----------------------------------------------------------------------
    // Rec D: SDKCapabilityRegistryEngine
    // -----------------------------------------------------------------------
    console.log('\n--- Rec D: SDKCapabilityRegistryEngine ---');

    const sdk = new SDKCapabilityRegistryEngine();

    // Assertion 4
    const maturityReport = sdk.getCapabilityMaturityReport();
    assert.ok(maturityReport.byMaturity, 'byMaturity must be present');
    assert.ok(typeof maturityReport.byMaturity === 'object', 'byMaturity must be an object');
    assert.ok('Stable' in maturityReport.byMaturity, 'byMaturity must contain Stable key');
    assert.ok(typeof maturityReport.total === 'number', 'total must be a number');
    console.log('  [PASS] Assertion 4: getCapabilityMaturityReport() returns byMaturity object');

    // Assertion 5
    const breakResult = sdk.checkBreakingChange('any', '1.0.0', '2.0.0');
    assert.strictEqual(breakResult.isBreaking, true, 'Major version bump must be a breaking change');
    assert.ok(breakResult.changes.length > 0, 'changes array must be non-empty for breaking change');
    console.log('  [PASS] Assertion 5: checkBreakingChange("any","1.0.0","2.0.0").isBreaking === true');

    // Assertion 6
    const nonBreakResult = sdk.checkBreakingChange('any', '1.0.0', '1.5.0');
    assert.strictEqual(nonBreakResult.isBreaking, false, 'Minor version bump must not be a breaking change');
    assert.strictEqual(nonBreakResult.changes.length, 0, 'changes array must be empty for non-breaking change');
    console.log('  [PASS] Assertion 6: checkBreakingChange("any","1.0.0","1.5.0").isBreaking === false');

    // -----------------------------------------------------------------------
    // Rec E: GovernanceProfileEngine
    // -----------------------------------------------------------------------
    console.log('\n--- Rec E: GovernanceProfileEngine ---');

    const gpe = new GovernanceProfileEngine();

    // Assertion 7
    const inherited = gpe.resolveInheritedConstraints('PROFILE-SOVEREIGN');
    assert.ok(inherited, 'inherited constraints must be returned');
    assert.strictEqual(inherited.constraints.length, 5,
        'PROFILE-SOVEREIGN must inherit constraints from all 5 profiles');
    console.log('  [PASS] Assertion 7: resolveInheritedConstraints("PROFILE-SOVEREIGN").constraints.length === 5');

    // Assertion 8
    const diff = gpe.computeProfileDiff('PROFILE-COMMUNITY', 'PROFILE-SOVEREIGN');
    assert.ok(diff.diffCount > 0, 'Diff between COMMUNITY and SOVEREIGN must have at least one difference');
    console.log('  [PASS] Assertion 8: computeProfileDiff("PROFILE-COMMUNITY","PROFILE-SOVEREIGN").diffCount > 0');

    // Assertion 9
    const compliant = gpe.validateProfileCompliance(
        { signaturesEnabled: true, hardwareTokenEnabled: true },
        'PROFILE-SOVEREIGN'
    );
    assert.strictEqual(compliant.compliant, true,
        'Workspace with both flags enabled must be compliant with SOVEREIGN profile');
    console.log('  [PASS] Assertion 9: validateProfileCompliance({sig:true,hw:true},"PROFILE-SOVEREIGN").compliant === true');

    // Assertion 10
    const nonCompliant = gpe.validateProfileCompliance(
        { signaturesEnabled: false, hardwareTokenEnabled: false },
        'PROFILE-SOVEREIGN'
    );
    assert.strictEqual(nonCompliant.compliant, false,
        'Workspace without required flags must be non-compliant with SOVEREIGN profile');
    assert.ok(nonCompliant.violations.length > 0, 'violations must be non-empty for non-compliant workspace');
    console.log('  [PASS] Assertion 10: validateProfileCompliance({sig:false,hw:false},"PROFILE-SOVEREIGN").compliant === false');

    // -----------------------------------------------------------------------
    // Rec F: EvidencePlatformEngine
    // -----------------------------------------------------------------------
    console.log('\n--- Rec F: EvidencePlatformEngine ---');

    const epe = new EvidencePlatformEngine();

    const stages = [
        { stageId: 'STAGE-1', content: { action: 'install',  version: '2026.3.1' } },
        { stageId: 'STAGE-2', content: { action: 'qualify',  result: 'passed'    } },
        { stageId: 'STAGE-3', content: { action: 'evidence', artifacts: 12       } }
    ];

    // Assertion 11
    const chainResult = epe.buildEvidenceChain(stages);
    assert.strictEqual(chainResult.chain.length, 3, 'Evidence chain must contain exactly 3 links');
    assert.strictEqual(chainResult.chainLength, 3, 'chainLength must be 3');
    console.log('  [PASS] Assertion 11: buildEvidenceChain(3 stages).chain.length === 3');

    // Assertion 12
    const integrityResult = epe.verifyChainIntegrity(chainResult);
    assert.strictEqual(integrityResult.valid, true, 'Unmodified chain must be valid');
    assert.strictEqual(integrityResult.brokenAt, null, 'brokenAt must be null for valid chain');
    console.log('  [PASS] Assertion 12: verifyChainIntegrity(unmodified chain) returns valid: true');

    // Assertion 13
    const tamperedChain = JSON.parse(JSON.stringify(chainResult));
    tamperedChain.chain[1].previousHash = 'deadbeef'.repeat(8);
    const tamperedResult = epe.verifyChainIntegrity(tamperedChain);
    assert.strictEqual(tamperedResult.valid, false, 'Tampered chain must be invalid');
    assert.ok(tamperedResult.brokenAt, 'brokenAt must identify the corrupted stage');
    console.log('  [PASS] Assertion 13: verifyChainIntegrity(tampered chain) returns valid: false');

    // -----------------------------------------------------------------------
    // Rec G: CommercialReadinessEngine
    // -----------------------------------------------------------------------
    console.log('\n--- Rec G: CommercialReadinessEngine ---');

    const cre = new CommercialReadinessEngine();

    // Assertion 14
    const fre = cre.runFirstRunExperience();
    assert.strictEqual(fre.readyForCustomer, true, 'readyForCustomer must be true');
    assert.strictEqual(fre.steps.length, 5, 'Must have exactly 5 steps');
    assert.strictEqual(fre.passed, true, 'passed must be true');
    assert.strictEqual(fre.slaPassed, true, 'slaPassed must be true for default config');
    console.log('  [PASS] Assertion 14: runFirstRunExperience() returns readyForCustomer: true, steps.length === 5');

    // -----------------------------------------------------------------------
    // Rec H: DocumentationPlatformEngine
    // -----------------------------------------------------------------------
    console.log('\n--- Rec H: DocumentationPlatformEngine ---');

    const dpe = new DocumentationPlatformEngine();

    // Assertion 15
    const govRef = dpe.generateGovernanceReference();
    assert.ok(Array.isArray(govRef.sections), 'sections must be an array');
    assert.ok(govRef.sections.length >= 1, 'sections must contain at least 1 entry');
    assert.ok(govRef.totalEntries >= 1, 'totalEntries must be >= 1');
    console.log('  [PASS] Assertion 15: generateGovernanceReference() returns sections array with length >= 1');

    // Assertion 16
    const rn = dpe.generateReleaseNotesFromADRs(
        [{ adrId: 'A1', status: 'Accepted', decision: 'Test', owner: 'Eng', consequences: 'None' }],
        {}
    );
    assert.strictEqual(rn.releaseNotes.length, 1, 'Must produce exactly 1 release note for 1 accepted ADR');
    assert.strictEqual(rn.releaseNotes[0].id, 'A1', 'Release note ID must match ADR ID');
    console.log('  [PASS] Assertion 16: generateReleaseNotesFromADRs([1 accepted ADR]).releaseNotes.length === 1');

    // Assertion 17
    const drift = dpe.detectDocumentationDrift(16, 12, 14, 10);
    assert.strictEqual(drift.hasDrift, true, 'hasDrift must be true');
    assert.strictEqual(drift.undocumentedCommands, 2, 'undocumentedCommands must be 2');
    assert.strictEqual(drift.undocumentedAPIs, 2, 'undocumentedAPIs must be 2');
    assert.strictEqual(drift.driftItems.length, 4, 'driftItems must total 4');
    console.log('  [PASS] Assertion 17: detectDocumentationDrift(16,12,14,10) hasDrift:true, undocCmd:2, undocApi:2');

    // -----------------------------------------------------------------------
    // Rec I: PluginExtensionPlatformEngine
    // -----------------------------------------------------------------------
    console.log('\n--- Rec I: PluginExtensionPlatformEngine ---');

    const ppe = new PluginExtensionPlatformEngine();

    const testManifest = {
        id: 'plugin-hardening-test',
        name: 'Hardening Test Plugin',
        version: '1.0.0',
        author: 'Ujomor Systems',
        license: 'ENTERPRISE',
        capabilities: ['read:workspace'],
        permissions: ['read:workspace'],
        hooks: ['onQualification'],
        compatibility: { minEAORCSVersion: '2026.3.1-LTS' }
    };
    ppe.registerPlugin(testManifest, {});

    // Assertion 18
    const certResult = ppe.certifyPlugin('plugin-hardening-test', { passed: true, auditor: 'QA-Team' });
    assert.strictEqual(certResult.certified, true, 'certifyPlugin must return certified: true');
    assert.strictEqual(certResult.trustLevel, 'Certified', 'trustLevel must be Certified');
    console.log('  [PASS] Assertion 18: certifyPlugin({passed:true}) returns certified: true');

    // Assertion 19a: trusted after certify
    const trustResult = ppe.trustPlugin('plugin-hardening-test');
    assert.strictEqual(trustResult.trusted, true, 'trustPlugin must return trusted: true after certification');
    assert.strictEqual(trustResult.trustLevel, 'Trusted', 'trustLevel must be Trusted');
    console.log('  [PASS] Assertion 19a: trustPlugin after certifying returns trusted: true');

    // Assertion 19b: not trusted without certify
    const testManifest2 = {
        id: 'plugin-unverified-test',
        name: 'Unverified Test Plugin',
        version: '1.0.0',
        author: 'Ujomor Systems',
        license: 'ENTERPRISE',
        capabilities: [],
        permissions: [],
        hooks: [],
        compatibility: { minEAORCSVersion: '2026.3.1-LTS' }
    };
    ppe.registerPlugin(testManifest2, {});
    const noTrustResult = ppe.trustPlugin('plugin-unverified-test');
    assert.strictEqual(noTrustResult.trusted, false, 'trustPlugin must return trusted: false without prior certification');
    assert.ok(noTrustResult.reason, 'reason must be provided when trust is denied');
    console.log('  [PASS] Assertion 19b: trustPlugin without certifying first returns trusted: false');

    console.log('\n================================================================');
    console.log('  ALL HARDENING MODIFICATION TESTS PASSED');
    console.log('  Total assertions: 19 (across 7 engine modifications)');
    console.log('================================================================\n');
}

if (require.main === module) {
    runHardeningModificationTests().catch(err => {
        console.error('\n[FAIL]', err.message);
        process.exit(1);
    });
}

module.exports = runHardeningModificationTests;
