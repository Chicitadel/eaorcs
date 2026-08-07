/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Streams A, B, C Verification Test
 * File           : eaorcs_corp_streams_abc_governance_certification_integration.test.js
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
 * CORP: Streams A, B, C Governance, Certification & Product Integration
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

const PlatformConstitutionEngine = require('../../engine/governance/PlatformConstitutionEngine');
const CoreEngineCertificationEngine = require('../../engine/certification/CoreEngineCertificationEngine');
const UniversalProductIntegrationEngine = require('../../engine/integration/UniversalProductIntegrationEngine');

console.log('[Streams A, B, C Verification Test] Starting execution...');

// Root paths
const eaorcsDir = path.resolve(__dirname, '../../');
const platformRootDir = path.resolve(eaorcsDir, '../../');

// ----------------------------------------------------------------------------
// Stream A: Platform Governance & Constitution Export Verification
// ----------------------------------------------------------------------------
console.log('\n--- Verifying Stream A: Platform Governance ---');
const constitutionEngine = new PlatformConstitutionEngine();

// 1. Verify verifyConstitutionCompliance
const complianceReport = constitutionEngine.verifyConstitutionCompliance({});
assert.strictEqual(complianceReport.isFullyCompliant, true, 'Compliance report must be fully compliant');
assert.strictEqual(complianceReport.totalLawsCount, 14, 'Must verify all 14 Constitutional Laws');
console.log('✓ verifyConstitutionCompliance passed with 14 laws verified.');

// 2. Verify exportPlatformConstitution
const constitutionPath = path.join(platformRootDir, 'PLATFORM_CONSTITUTION_1.0.md');
const constitutionResult = constitutionEngine.exportPlatformConstitution(constitutionPath);
assert.strictEqual(constitutionResult.success, true, 'Platform Constitution export must succeed');
assert.strictEqual(fs.existsSync(constitutionPath), true, 'PLATFORM_CONSTITUTION_1.0.md file must exist on disk');

const constitutionContent = fs.readFileSync(constitutionPath, 'utf8');
assert.ok(constitutionContent.includes('CONSTITUTIONAL FREEZE DIRECTIVE'), 'Must include Constitutional Freeze Directive');
assert.ok(constitutionContent.includes('API FREEZE DIRECTIVE'), 'Must include API Freeze Directive');
assert.ok(constitutionContent.includes('SEMANTIC VERSIONING FREEZE POLICY'), 'Must include SemVer Freeze Policy');

for (let i = 1; i <= 14; i++) {
    assert.ok(constitutionContent.includes(`LAW ${i}`), `Must explicitly list LAW ${i}`);
}
console.log('✓ PLATFORM_CONSTITUTION_1.0.md successfully exported and verified at:', constitutionPath);

// ----------------------------------------------------------------------------
// Stream B: Core Engine Certification Verification
// ----------------------------------------------------------------------------
console.log('\n--- Verifying Stream B: Core Engine Certification ---');
const certificationEngine = new CoreEngineCertificationEngine();

// 1. Verify generateCertificationPack
const packPath = path.join(eaorcsDir, 'release', 'ENGINE_CERTIFICATION_PACK.json');
const certResult = certificationEngine.generateCertificationPack(packPath);

assert.strictEqual(certResult.success, true, 'Certification pack generation must succeed');
assert.strictEqual(fs.existsSync(packPath), true, 'ENGINE_CERTIFICATION_PACK.json file must exist on disk');

const certPackContent = JSON.parse(fs.readFileSync(packPath, 'utf8'));
assert.strictEqual(certPackContent.overallStatus, 'CERTIFIED', 'Overall certification status must be CERTIFIED');
assert.strictEqual(certPackContent.overallScore, 100, 'Overall score must be 100');

const domains = certPackContent.coreEngineDomains;
assert.ok(domains.deterministicExecution, 'Must cover Deterministic Execution');
assert.ok(domains.scheduler, 'Must cover Task & Execution Scheduler');
assert.ok(domains.governanceEngine, 'Must cover Governance Engine');
assert.ok(domains.stateRecovery, 'Must cover State Recovery & Transaction Safety');
assert.ok(domains.reproducibility, 'Must cover Reproducibility & Session Replay');

assert.strictEqual(domains.deterministicExecution.status, 'VERIFIED');
assert.strictEqual(domains.scheduler.status, 'VERIFIED');
assert.strictEqual(domains.governanceEngine.status, 'VERIFIED');
assert.strictEqual(domains.stateRecovery.status, 'VERIFIED');
assert.strictEqual(domains.reproducibility.status, 'VERIFIED');
console.log('✓ ENGINE_CERTIFICATION_PACK.json successfully emitted and verified at:', packPath);

// ----------------------------------------------------------------------------
// Stream C: Universal Product Integration Framework Verification
// ----------------------------------------------------------------------------
console.log('\n--- Verifying Stream C: Universal Product Integration Framework ---');
const integrationEngine = new UniversalProductIntegrationEngine();

// 1. Verify exportIntegrationFramework
const frameworkPath = path.join(platformRootDir, 'UNIVERSAL_PRODUCT_INTEGRATION_FRAMEWORK.md');
const integrationResult = integrationEngine.exportIntegrationFramework(frameworkPath);

assert.strictEqual(integrationResult.success, true, 'Integration framework export must succeed');
assert.strictEqual(fs.existsSync(frameworkPath), true, 'UNIVERSAL_PRODUCT_INTEGRATION_FRAMEWORK.md file must exist on disk');

const frameworkContent = fs.readFileSync(frameworkPath, 'utf8');
assert.ok(frameworkContent.includes('AIR ROOFERS PRODUCT SUITE'), 'Must contain Air Roofers product suite');
assert.ok(frameworkContent.includes('PRODUCT LIFECYCLE MODEL'), 'Must contain Product Lifecycle Model');
assert.ok(frameworkContent.includes('5-PHASE ONBOARDING WORKFLOW'), 'Must contain 5-Phase Onboarding Workflow');
assert.ok(frameworkContent.includes('air-roofers-core'), 'Must list air-roofers-core');
assert.ok(frameworkContent.includes('airroofers-billing-client'), 'Must list airroofers-billing-client');
assert.ok(frameworkContent.includes('airroofers-iam-client'), 'Must list airroofers-iam-client');

console.log('✓ UNIVERSAL_PRODUCT_INTEGRATION_FRAMEWORK.md successfully exported and verified at:', frameworkPath);

console.log('\n================================================================');
console.log('[Streams A, B, C Verification Test] ALL CHECKS PASSED SUCCESSFULLY.');
console.log('================================================================\n');
