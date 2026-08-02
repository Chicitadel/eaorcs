/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Constitution & Remediation Specification Test Suite
 * File           : constitution_remediation.test.js
 * Version        : 2026.1-LTS (v1.0.0-FROZEN)
 * Author         : Architectural Governance Council & Ujomor Systems Engineering
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
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Engine Imports
const UniversalConstitutionEngine = require('../../engine/governance/UniversalConstitutionEngine');
const DomainRulePackLoader = require('../../engine/governance/DomainRulePackLoader');
const AutonomousPatchGenerator = require('../../engine/remediation/AutonomousPatchGenerator');
const TestUpdater = require('../../engine/remediation/TestUpdater');
const EvidenceRecertifier = require('../../engine/remediation/EvidenceRecertifier');

async function runConstitutionRemediationTestSuite() {
    console.log('================================================================');
    console.log('  EAORCS STREAMS I & J CONSTITUTION & REMEDIATION ENGINE SUITE');
    console.log('================================================================\n');

    const testRootDir = path.resolve(__dirname, '../../scratch/test_remediation_env');
    if (fs.existsSync(testRootDir)) {
        fs.rmSync(testRootDir, { recursive: true, force: true });
    }
    fs.mkdirSync(testRootDir, { recursive: true });

    let passedChecks = 0;
    let totalChecks = 0;

    function check(description, fn) {
        totalChecks++;
        try {
            fn();
            passedChecks++;
            console.log(`  ✓ Check ${totalChecks}: ${description}`);
        } catch (err) {
            console.error(`  ❌ Check ${totalChecks} FAILED: ${description}`);
            console.error(err);
            throw err;
        }
    }

    // ----------------------------------------------------
    // STEP 1: Universal Constitution Engine Verification
    // ----------------------------------------------------
    console.log('[1/5] Testing UniversalConstitutionEngine...');
    const constitutionEngine = new UniversalConstitutionEngine();

    check('compileConstitution compiles macro rules into immutable digest', () => {
        const compiled = constitutionEngine.compileConstitution();
        assert.ok(compiled, 'Compiled constitution object must be returned');
        assert.strictEqual(constitutionEngine.isCompiled(), true, 'isCompiled() should return true');
        assert.ok(compiled.constitutionHash.startsWith('0x'), 'Hash should be prefixed with 0x');
        assert.strictEqual(compiled.isFrozen, true, 'Compiled constitution should be frozen');
        assert.ok(compiled.rulesCount >= 4, 'Should contain at least 4 default constitutional rules');
    });

    check('enforceConstitution scans target directory and detects violations', () => {
        // Create a dummy file with a violation (missing header and hardcoded key)
        const violationFilePath = path.join(testRootDir, 'non_compliant.js');
        fs.writeFileSync(violationFilePath, "const secret = 'aws_secret_access_key = \"AKIAIOSFODNN7EXAMPLE123456\"';\n", 'utf8');

        const report = constitutionEngine.enforceConstitution(testRootDir);
        assert.ok(report, 'Enforcement report must be generated');
        assert.strictEqual(report.compliant, false, 'Report should be non-compliant for invalid file');
        assert.ok(report.totalViolations > 0, 'Violations count should be > 0');

        const violationsList = constitutionEngine.getViolations();
        assert.ok(Array.isArray(violationsList), 'getViolations() should return an array');
        assert.strictEqual(violationsList.length, report.totalViolations, 'Violations count should match report');
    });

    // ----------------------------------------------------
    // STEP 2: Domain RulePack Loader Verification
    // ----------------------------------------------------
    console.log('\n[2/5] Testing DomainRulePackLoader...');
    const rulePackLoader = new DomainRulePackLoader();

    const samplePack = {
        id: 'RULEPACK-FINANCIAL-SOC2',
        name: 'Financial Sector Compliance Pack',
        sector: 'FINANCIAL',
        domain: 'REGULATORY',
        version: '1.2.0',
        complianceFrameworks: ['SOC2', 'ISO27001', 'PCI-DSS'],
        rules: [
            {
                ruleId: 'FIN-001',
                name: 'REQUIRE_ENCRYPTION',
                severity: 'CRITICAL',
                description: 'Data encryption required for financial records',
                evaluator: (content) => {
                    if (typeof content === 'string' && !content.includes('crypto')) {
                        return [{ description: 'Missing crypto encryption handling' }];
                    }
                    return [];
                }
            }
        ]
    };

    check('validateRulePack assesses rulepack schema structure', () => {
        const valResult = rulePackLoader.validateRulePack(samplePack);
        assert.strictEqual(valResult.valid, true, 'Sample rulepack should be valid');

        const invalidVal = rulePackLoader.validateRulePack({ id: 'INVALID' });
        assert.strictEqual(invalidVal.valid, false, 'Rulepack without rules array should be invalid');
    });

    check('loadRulePack loads, validates and registers rulepack', () => {
        const loaded = rulePackLoader.loadRulePack(samplePack);
        assert.strictEqual(loaded.id, 'RULEPACK-FINANCIAL-SOC2');
        assert.strictEqual(loaded.validated, true);
        assert.ok(loaded.hash.startsWith('0x'));
        assert.strictEqual(rulePackLoader.getLoadedPacks().length, 1);
    });

    check('applyRules executes rulepack rules against target context', () => {
        const unencryptedFile = path.join(testRootDir, 'unencrypted.js');
        fs.writeFileSync(unencryptedFile, "console.log('Unencrypted payload');", 'utf8');

        const evalResult = rulePackLoader.applyRules('RULEPACK-FINANCIAL-SOC2', unencryptedFile);
        assert.strictEqual(evalResult.passed, false);
        assert.strictEqual(evalResult.failedCount, 1);
        assert.ok(evalResult.violations.length > 0);
    });

    // ----------------------------------------------------
    // STEP 3: Autonomous Patch Generator Verification
    // ----------------------------------------------------
    console.log('\n[3/5] Testing AutonomousPatchGenerator...');
    const patchGenerator = new AutonomousPatchGenerator();

    const missingRequirement = {
        id: 'REQ-AUDIT-009',
        title: 'Autonomous Audit Ledger',
        type: 'MISSING_MODULE',
        targetPath: path.join(testRootDir, 'engine', 'audit', 'AutonomousAuditLedger.js'),
        methods: ['recordAudit', 'verifyIntegrity'],
        summary: 'Autonomous audit logging engine stub for stream compliance.'
    };

    let generatedPatch = null;

    check('generatePatchForRequirement synthesizes standard code patch', () => {
        generatedPatch = patchGenerator.generatePatchForRequirement(missingRequirement);
        assert.ok(generatedPatch, 'Patch payload should be generated');
        assert.strictEqual(generatedPatch.requirementId, 'REQ-AUDIT-009');
        assert.ok(generatedPatch.code.includes('UAIGOS'), 'Code should include UAIGOS header');
        assert.ok(generatedPatch.code.includes('recordAudit'), 'Code should include recordAudit method');
        assert.ok(generatedPatch.hash.startsWith('0x'), 'Hash should be prefixed with 0x');
    });

    check('applyPatch writes patch code to target filesystem location', () => {
        const applyRes = patchGenerator.applyPatch(generatedPatch.targetPath, generatedPatch);
        assert.strictEqual(applyRes.applied, true, 'Patch should be applied successfully');
        assert.ok(fs.existsSync(generatedPatch.targetPath), 'Patched file should exist on disk');

        const diskContent = fs.readFileSync(generatedPatch.targetPath, 'utf8');
        assert.strictEqual(diskContent, generatedPatch.code, 'File content on disk should match patch code');
    });

    // ----------------------------------------------------
    // STEP 4: Test Updater Verification
    // ----------------------------------------------------
    console.log('\n[4/5] Testing TestUpdater...');
    const testUpdater = new TestUpdater();
    let generatedTest = null;

    check('generateTestForPatch synthesizes automated unit test code', () => {
        generatedTest = testUpdater.generateTestForPatch(generatedPatch, {
            testPath: path.join(testRootDir, 'tests', 'spec', 'AutonomousAuditLedger.test.js')
        });
        assert.ok(generatedTest, 'Test payload should be generated');
        assert.strictEqual(generatedTest.requirementId, 'REQ-AUDIT-009');
        assert.ok(generatedTest.testCode.includes('runAutoGeneratedTestSuite'), 'Test code should contain runner function');
        assert.ok(generatedTest.hash.startsWith('0x'));
    });

    check('writeTestFile writes test script to disk and executes cleanly', async () => {
        const writeRes = testUpdater.writeTestFile(generatedTest.testPath, generatedTest.testCode);
        assert.strictEqual(writeRes.written, true);
        assert.ok(fs.existsSync(generatedTest.testPath));

        // Execute the generated unit test file dynamically
        const generatedTestModule = require(generatedTest.testPath);
        assert.ok(typeof generatedTestModule.runAutoGeneratedTestSuite === 'function');
        const testPass = await generatedTestModule.runAutoGeneratedTestSuite();
        assert.strictEqual(testPass, true, 'Auto-generated unit test suite should execute cleanly');
    });

    // ----------------------------------------------------
    // STEP 5: Evidence Recertifier Verification
    // ----------------------------------------------------
    console.log('\n[5/5] Testing EvidenceRecertifier...');
    const recertifier = new EvidenceRecertifier({
        baseDir: testRootDir,
        passportPath: path.join(testRootDir, 'osap-passport.json'),
        certificatePath: path.join(testRootDir, 'eaorcs-certificate.json')
    });

    check('recertifyAfterRemediation updates passport and certificate with Merkle root', () => {
        const remediationContext = {
            patchedRequirements: [generatedPatch],
            testResults: [generatedTest],
            codebasePath: testRootDir
        };

        const result = recertifier.recertifyAfterRemediation(remediationContext);
        assert.strictEqual(result.success, true, 'Recertification should succeed');
        assert.ok(result.merkleRoot.startsWith('0x'), 'Merkle root should start with 0x');
        assert.strictEqual(result.tier, 'GOLD');
        assert.strictEqual(result.trustScore, 99.5);
        assert.ok(fs.existsSync(recertifier.passportPath), 'osap-passport.json should exist');
        assert.ok(fs.existsSync(recertifier.certificatePath), 'eaorcs-certificate.json should exist');

        const passportOnDisk = JSON.parse(fs.readFileSync(recertifier.passportPath, 'utf8'));
        assert.strictEqual(passportOnDisk.trust_summary.tier, 'GOLD');
        assert.strictEqual(passportOnDisk.evidence_manifest.merkle_root, result.merkleRoot);

        const updatedPassport = recertifier.getUpdatedPassport();
        assert.ok(updatedPassport, 'getUpdatedPassport() should return updated passport');
        assert.strictEqual(updatedPassport.passport_id, passportOnDisk.passport_id);
    });

    console.log('\n================================================================');
    console.log(`  ALL ${totalChecks} CHECKS PASSED SUCCESSFULLY (100% PASS RATE)`);
    console.log('================================================================\n');
}

if (require.main === module) {
    runConstitutionRemediationTestSuite().catch(err => {
        console.error('Test suite failed:', err);
        process.exit(1);
    });
}

module.exports = { runConstitutionRemediationTestSuite };
