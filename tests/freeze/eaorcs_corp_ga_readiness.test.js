/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Master GA Readiness & Launch Command Center Test Suite
 * File           : eaorcs_corp_ga_readiness.test.js
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
 * CORP: Layer J — Launch Command Center & Master Certification Integration
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
const path = require('path');
const fs = require('fs');

const { CommercialEvidenceIndexEngine } = require('../../engine/evidence/CommercialEvidenceIndexEngine.js');
const PlatformRegistryEngine = require('../../engine/registry/PlatformRegistryEngine.js');
const CapabilityRegistryEngine = require('../../engine/registry/CapabilityRegistryEngine.js');
const GovernanceRegistryEngine = require('../../engine/registry/GovernanceRegistryEngine.js');
const ReleaseManifestEngine = require('../../engine/packaging/ReleaseManifestEngine.js');
const CommercialReadinessEngine = require('../../engine/commercial/CommercialReadinessEngine.js');
const ProductLifecycleEngine = require('../../engine/commercial/ProductLifecycleEngine.js');
const OperationalReadinessEngine = require('../../engine/operations/OperationalReadinessEngine.js');
const DisasterRecoveryEngine = require('../../engine/operations/DisasterRecoveryEngine.js');
const PerformanceEngineeringEngine = require('../../engine/operations/PerformanceEngineeringEngine.js');
const StreamKPIEngine = require('../../engine/operations/StreamKPIEngine.js');
const LegalComplianceEngine = require('../../engine/operations/LegalComplianceEngine.js');
const IndependentExternalValidationEngine = require('../../engine/validation/IndependentExternalValidationEngine.js');
const ExternalAPICompatibilityEngine = require('../../engine/validation/ExternalAPICompatibilityEngine.js');
const CommercialDocumentationEngine = require('../../engine/docs/CommercialDocumentationEngine.js');
const DocumentationGovernanceEngine = require('../../engine/docs/DocumentationGovernanceEngine.js');
const ReleaseBundleVerificationEngine = require('../../engine/packaging/ReleaseBundleVerificationEngine.js');
const AuditSanitizationEngine = require('../../engine/runtime/AuditSanitizationEngine.js');
const { LaunchCommandCenterEngine, calculateReadinessDashboard } = require('../../engine/operations/LaunchCommandCenterEngine.js');

const workspaceRoot = path.resolve(__dirname, '../../');

async function runGAReadinessTests() {
    console.log('================================================================');
    console.log('  EAORCS MASTER GA READINESS & LAUNCH COMMAND CENTER SUITE');
    console.log('  Commercial Operational Readiness Program — Layers A through J');
    console.log('================================================================\n');

    // Layer A: Commercial Evidence Indexing Stream
    console.log('[Layer A] Testing CommercialEvidenceIndexEngine...');
    const evidenceEngine = new CommercialEvidenceIndexEngine();
    const evidenceResult = evidenceEngine.generateEvidenceIndex(workspaceRoot);
    assert.strictEqual(evidenceResult.success, true, 'Evidence index generation must succeed');
    assert.strictEqual(evidenceResult.manifest.summary.totalCategories, 9, 'Must cover 9 compliance categories');
    assert.ok(evidenceResult.totalRecordCount >= 9, 'Must generate records across all categories');
    assert.ok(fs.existsSync(evidenceResult.evidenceIndexYamlPath), 'evidence_index.yaml must exist');
    assert.ok(fs.existsSync(evidenceResult.manifestJsonPath), 'EVIDENCE_MANIFEST.json must exist');
    console.log('    ✓ Layer A (Commercial Evidence Indexing) verified.');

    // Layer B: Registries & Governance Profiles
    console.log('[Layer B] Testing Platform, Capability, and Governance Registries...');
    const platformRegistry = new PlatformRegistryEngine();
    const capRegistry = new CapabilityRegistryEngine();
    const govRegistry = new GovernanceRegistryEngine();
    assert.ok(platformRegistry.buildPlatformRegistry(workspaceRoot), 'Platform registry must build');
    assert.ok(capRegistry.listCapabilities().length > 0, 'Capabilities must be registered');
    assert.ok(govRegistry.buildGovernanceRegistry(workspaceRoot), 'Governance registry must build');
    console.log('    ✓ Layer B (Registries & Governance Profiles) verified.');

    // Layer C: Master Release Manifest & RBOM
    console.log('[Layer C] Testing ReleaseManifestEngine...');
    const manifestEngine = new ReleaseManifestEngine();
    const masterManifest = manifestEngine.generateMasterReleaseManifest({ releaseId: 'REL-2026.3.1-LTS' });
    assert.strictEqual(masterManifest.releaseId, 'REL-2026.3.1-LTS', 'Release ID must match');
    const rbom = manifestEngine.deriveRBOM(masterManifest);
    assert.ok(rbom.rbomHash, 'RBOM must contain rbomHash');
    const provenance = manifestEngine.deriveProvenance(masterManifest);
    assert.ok(provenance.provenanceHash, 'Provenance must contain provenanceHash');
    console.log('    ✓ Layer C (Release Manifest & RBOM) verified.');

    // Layer D: Commercial Readiness & Product Lifecycle
    console.log('[Layer D] Testing CommercialReadinessEngine & ProductLifecycleEngine...');
    const commEngine = new CommercialReadinessEngine();
    const productEngine = new ProductLifecycleEngine();
    const commGates = commEngine.checkCommercialReadinessGates();
    assert.strictEqual(commGates.allPassed, true, 'Commercial readiness gates must all pass');
    const lifecycleState = productEngine.initializeLifecycle('REL-2026.3.1-LTS', 'PROFILE-ENTERPRISE');
    assert.strictEqual(lifecycleState.currentPhase, 'Evidence Freeze', 'Initial product lifecycle phase must be Evidence Freeze');
    console.log('    ✓ Layer D (Commercial Readiness & Product Lifecycle) verified.');

    // Layer E: Operational Readiness, Performance & Disaster Recovery
    console.log('[Layer E] Testing Operational Readiness, Performance, DR & KPIs...');
    const opsEngine = new OperationalReadinessEngine();
    const perfEngine = new PerformanceEngineeringEngine();
    const drEngine = new DisasterRecoveryEngine();
    const kpiEngine = new StreamKPIEngine();

    assert.strictEqual(opsEngine.getHealthStatus().status, 'HEALTHY', 'Health status must be HEALTHY');
    const perfBench = perfEngine.runPerformanceSuite();
    assert.strictEqual(perfBench.overallSloPassed, true, 'Performance suite overall SLO must pass');
    const drPlan = drEngine.runFullDRSuite();
    assert.strictEqual(drPlan.allPassed, true, 'DR suite must pass');
    const kpiList = kpiEngine.listKPIs();
    assert.ok(kpiList.length >= 7, 'Stream KPIs must be registered');
    console.log('    ✓ Layer E (Operations, Performance, DR & KPIs) verified.');

    // Layer F: Legal & Regulatory Compliance
    console.log('[Layer F] Testing LegalComplianceEngine...');
    const legalEngine = new LegalComplianceEngine();
    const attestation = legalEngine.generateComplianceAttestation();
    assert.strictEqual(attestation.status, 'APPROVED', 'Legal attestation must be APPROVED');
    assert.strictEqual(attestation.gdpr.compliant, true, 'GDPR compliant must be true');
    assert.strictEqual(attestation.euDora.compliant, true, 'EU DORA compliant must be true');
    assert.strictEqual(attestation.nis2.compliant, true, 'NIS2 compliant must be true');
    assert.strictEqual(attestation.commercialSLA.availabilityGuarantee, '99.99%', 'SLA availability guarantee must be 99.99%');
    console.log('    ✓ Layer F (Legal Compliance) verified.');

    // Layer G: Independent External Validation & API Compatibility
    console.log('[Layer G] Testing Independent Validation & API Compatibility...');
    const extValEngine = new IndependentExternalValidationEngine();
    const apiCompatEngine = new ExternalAPICompatibilityEngine();

    const cleanRoomAudit = extValEngine.runCleanRoomInstallationAudit();
    assert.strictEqual(cleanRoomAudit.status, 'PASSED', 'Clean room audit must pass');
    const apiMatrix = apiCompatEngine.generateCompatibilityMatrix();
    assert.ok(apiMatrix.totalIntegrations >= 6, 'Must support at least 6 external integrations');
    console.log('    ✓ Layer G (Independent Validation & API Compatibility) verified.');

    // Layer H: Commercial Documentation & Knowledge Graph
    console.log('[Layer H] Testing Commercial Documentation & Governance...');
    const docEngine = new CommercialDocumentationEngine();
    const govDocEngine = new DocumentationGovernanceEngine();

    const opsGuide = docEngine.generateOperationsGuide();
    assert.ok(opsGuide.title, 'Operations guide must have title');
    const docDag = govDocEngine.buildDocumentationDAG(workspaceRoot);
    assert.ok(docDag.nodes.length > 0, 'Documentation DAG must contain nodes');
    console.log('    ✓ Layer H (Documentation & Knowledge Graph) verified.');

    // Layer I: Release Packaging & Verification
    console.log('[Layer I] Testing Release Bundle Verification & Audit Sanitization...');
    const bundleVerifier = new ReleaseBundleVerificationEngine();
    const sanitizer = new AuditSanitizationEngine();

    const testObj = { path: 'C:\\Users\\Professional\\test.txt', projectName: 'EAORCS' };
    const sanitizedObj = sanitizer.sanitizeObject(testObj);
    assert.strictEqual(sanitizedObj.projectName, 'EAORCS', 'Sanitizer must preserve clean properties');
    assert.ok(!sanitizedObj.path.includes('C:\\Users'), 'Sanitizer must redact absolute paths');
    console.log('    ✓ Layer I (Release Packaging & Sanitization) verified.');

    // Layer J: Launch Command Center Engine & Executive Dashboard
    console.log('[Layer J] Testing LaunchCommandCenterEngine & Executive Dashboard...');
    const commandCenter = new LaunchCommandCenterEngine();
    const dashboard = commandCenter.calculateReadinessDashboard(workspaceRoot);

    assert.strictEqual(dashboard.releaseId, 'REL-2026.3.1-LTS', 'Dashboard must match release ID');
    assert.strictEqual(dashboard.canLaunch, true, 'canLaunch flag must be true');
    assert.strictEqual(dashboard.decision, 'APPROVED_FOR_COMMERCIAL_LAUNCH', 'Launch decision must be APPROVED_FOR_COMMERCIAL_LAUNCH');
    assert.strictEqual(dashboard.overallReadinessScore, 100.0, 'Overall readiness score must be 100%');
    assert.strictEqual(Object.keys(dashboard.dimensions).length, 9, 'Dashboard must evaluate all 9 dimensions');

    const expectedDimensions = [
        'Engineering',
        'Security',
        'Documentation',
        'Commercial',
        'Operations',
        'Legal',
        'Support',
        'Marketplace',
        'Independent Validation'
    ];

    expectedDimensions.forEach(dim => {
        assert.ok(dashboard.dimensions[dim], `Dimension ${dim} must exist in dashboard`);
        assert.strictEqual(dashboard.dimensions[dim].score, 100, `Dimension ${dim} score must be 100%`);
        assert.strictEqual(dashboard.dimensions[dim].status, 'PASSED', `Dimension ${dim} status must be PASSED`);
    });

    const reportResult = commandCenter.generateLaunchReadinessReport(workspaceRoot);
    assert.strictEqual(reportResult.success, true, 'generateLaunchReadinessReport must succeed');
    assert.ok(fs.existsSync(reportResult.evidenceReportPath), 'launch_readiness_report.json must be written to evidence/');

    // Test standalone helper function
    const standaloneDashboard = calculateReadinessDashboard(workspaceRoot);
    assert.strictEqual(standaloneDashboard.decision, 'APPROVED_FOR_COMMERCIAL_LAUNCH', 'Standalone helper function must return APPROVED_FOR_COMMERCIAL_LAUNCH');
    console.log('    ✓ Layer J (Launch Command Center Engine & Executive Dashboard) verified.');

    console.log('\n================================================================');
    console.log('  MASTER GA READINESS CERTIFICATION PASSED (LAYERS A THROUGH J)');
    console.log('================================================================\n');
}

if (require.main === module) {
    runGAReadinessTests().catch(err => {
        console.error('Master GA readiness test failed:', err);
        process.exit(1);
    });
}

module.exports = runGAReadinessTests;
