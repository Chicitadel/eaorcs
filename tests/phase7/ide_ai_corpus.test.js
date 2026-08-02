/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Phase 7 IDE Marketplace & AI Corpus Verifier Test Suite
 * File           : ide_ai_corpus.test.js
 * Version        : 2026.1-LTS (v1.1.0)
 * Author         : Ujomor Systems & Enterprise Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance Authority
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | RESTRICTED
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
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance Authority
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');

const IdeMarketplacePackageBuilder = require('../../packaging/ide/IdeMarketplacePackageBuilder');
const AiCorpusBenchmarkVerifier = require('../../engine/ai/AiCorpusBenchmarkVerifier');

async function runTestSuite() {
    console.log('================================================================');
    console.log('  EAORCS PHASE 7: IDE MARKETPLACE BUILDER & AI CORPUS VERIFIER');
    console.log('================================================================\n');

    let totalTests = 0;
    let passedTests = 0;

    function test(description, fn) {
        totalTests++;
        try {
            fn();
            passedTests++;
            console.log(`  ✓ [PASS] ${description}`);
        } catch (err) {
            console.error(`  ✕ [FAIL] ${description}`);
            console.error(`    Error: ${err.message}`);
            throw err;
        }
    }

    const testOutDir = path.join(__dirname, '../../scratch/phase7_build_output');

    // -------------------------------------------------------------------------
    // STREAM 5: IDE MARKETPLACE PACKAGE BUILDER TESTS
    // -------------------------------------------------------------------------
    console.log('[STREAM 5] Testing IDE Marketplace Package Builder...');

    const builder = new IdeMarketplacePackageBuilder();

    test('1. VS Code VSIX Package Generation (extension.vsixmanifest)', () => {
        const vsDir = path.join(testOutDir, 'vscode');
        const res = builder.buildVsCodePackage(vsDir);
        
        assert.strictEqual(res.success, true);
        assert.strictEqual(res.target, 'vscode');
        assert.ok(fs.existsSync(res.manifestPath), 'extension.vsixmanifest should exist');
        
        const manifestContent = fs.readFileSync(res.manifestPath, 'utf8');
        assert.ok(manifestContent.includes('<PackageManifest'), 'VSIX manifest should contain PackageManifest tag');
        assert.ok(manifestContent.includes('eaorcs-vscode'), 'VSIX manifest should contain extension identity');
        assert.ok(manifestContent.includes('Microsoft.VisualStudio.Code'), 'VSIX manifest should target VS Code');
    });

    test('2. JetBrains Plugin Package Generation (plugin.xml)', () => {
        const jbDir = path.join(testOutDir, 'jetbrains');
        const res = builder.buildJetBrainsPackage(jbDir);
        
        assert.strictEqual(res.success, true);
        assert.strictEqual(res.target, 'jetbrains');
        assert.ok(fs.existsSync(res.manifestPath), 'plugin.xml should exist in META-INF');
        
        const pluginContent = fs.readFileSync(res.manifestPath, 'utf8');
        assert.ok(pluginContent.includes('<idea-plugin>'), 'Plugin manifest should contain idea-plugin tag');
        assert.ok(pluginContent.includes('com.ujomor.eaorcs'), 'Plugin manifest should contain plugin id');
        assert.ok(pluginContent.includes('com.intellij.modules.platform'), 'Plugin manifest should depend on platform');
    });

    test('3. Visual Studio VSIX Package Generation (extension.manifest)', () => {
        const vsIdeDir = path.join(testOutDir, 'visualstudio');
        const res = builder.buildVisualStudioPackage(vsIdeDir);
        
        assert.strictEqual(res.success, true);
        assert.strictEqual(res.target, 'visualstudio');
        assert.ok(fs.existsSync(res.manifestPath), 'extension.manifest should exist');
        
        const vsManifestContent = fs.readFileSync(res.manifestPath, 'utf8');
        assert.ok(vsManifestContent.includes('EAORCS.VisualStudio.Extension'), 'Manifest should contain VS extension ID');
        assert.ok(vsManifestContent.includes('Microsoft.VisualStudio.Pro'), 'Manifest should target Visual Studio');
    });

    test('4. Neovim Lua Plugin Package Generation (init.lua)', () => {
        const nvimDir = path.join(testOutDir, 'neovim');
        const res = builder.buildNeovimPackage(nvimDir);
        
        assert.strictEqual(res.success, true);
        assert.strictEqual(res.target, 'neovim');
        assert.ok(fs.existsSync(res.manifestPath), 'init.lua should exist');
        
        const luaContent = fs.readFileSync(res.manifestPath, 'utf8');
        assert.ok(luaContent.includes('local M = {}'), 'init.lua should define Lua module');
        assert.ok(luaContent.includes('vim.api.nvim_create_user_command'), 'init.lua should register Neovim commands');
        assert.ok(luaContent.includes('return M'), 'init.lua should return module table');
    });

    test('5. Orchestrated Build of All 4 IDE Marketplace Packages (buildAllPackages)', () => {
        const allOutDir = path.join(testOutDir, 'all_packages');
        const res = builder.buildAllPackages(allOutDir);
        
        assert.strictEqual(res.success, true);
        assert.strictEqual(res.totalPackages, 4);
        assert.ok(res.packages.vscode.success);
        assert.ok(res.packages.jetbrains.success);
        assert.ok(res.packages.visualstudio.success);
        assert.ok(res.packages.neovim.success);
        assert.ok(res.totalFilesCreated >= 10, 'All package files should be created');
    });

    // -------------------------------------------------------------------------
    // STREAM 6: AI CORPUS BENCHMARK VERIFIER TESTS
    // -------------------------------------------------------------------------
    console.log('\n[STREAM 6] Testing Standardized AI Corpus Benchmark Verifier...');

    const verifier = new AiCorpusBenchmarkVerifier();

    test('6. Loading 500 Gold-Standard Ground-Truth Corpus Items', () => {
        const corpus = verifier.loadCorpus(500);
        assert.ok(Array.isArray(corpus), 'Corpus should return an array');
        assert.strictEqual(corpus.length, 500, 'Corpus size must be exactly 500 items');

        const reqItems = corpus.filter(i => i.type === 'REQUIREMENT_EXTRACTION');
        const driftItems = corpus.filter(i => i.type === 'DRIFT_DETECTION');

        assert.strictEqual(reqItems.length, 250, 'Requirement extraction items count should be 250');
        assert.strictEqual(driftItems.length, 250, 'Drift detection items count should be 250');
    });

    test('7. Loading Single Corpus Item by ID', () => {
        const item = verifier.loadCorpus('CORPUS-REQ-001');
        assert.ok(item, 'Corpus item should exist');
        assert.strictEqual(item.id, 'CORPUS-REQ-001');
        assert.strictEqual(item.type, 'REQUIREMENT_EXTRACTION');
        assert.strictEqual(item.domain, 'security');
    });

    test('8. Model Verification on 500 Samples & Metrics Evaluation', () => {
        const evalRes = verifier.verifyModelOnCorpus('gold_500');
        assert.strictEqual(evalRes.totalEvaluated, 500);
        assert.ok(evalRes.tp > 0, 'True positives count should be positive');
        assert.ok(evalRes.tn > 0, 'True negatives count should be positive');

        const metrics = verifier.computePrecisionRecallF1(evalRes);
        assert.ok(metrics.precision >= 0.90, `Precision (${metrics.precision}) should be >= 0.90`);
        assert.ok(metrics.recall >= 0.90, `Recall (${metrics.recall}) should be >= 0.90`);
        assert.ok(metrics.f1Score >= 0.90, `F1-Score (${metrics.f1Score}) should be >= 0.90`);
        assert.ok(metrics.accuracy >= 0.90, `Accuracy (${metrics.accuracy}) should be >= 0.90`);
    });

    test('9. Benchmark Report Generation & Reproducibility Fingerprint', () => {
        const report = verifier.generateBenchmarkReport({ threshold: 0.90 });
        assert.ok(report.reportId.startsWith('REP-AICORPUS-'));
        assert.strictEqual(report.corpusSize, 500);
        assert.strictEqual(report.verdict, 'PASS');
        assert.ok(report.reproducibilityHash && report.reproducibilityHash.length === 64, 'Reproducibility hash must be 64-char SHA256');
        assert.ok(report.formattedReport.includes('EAORCS STANDARDIZED AI CORPUS BENCHMARK EVALUATION REPORT'));
    });

    test('10. Custom Model Evaluation Callback Verification', () => {
        const customPredictor = (item) => {
            if (item.type === 'REQUIREMENT_EXTRACTION') {
                return { isRequirement: item.goldTruth.isRequirement };
            } else {
                return { isDrift: item.goldTruth.isDrift };
            }
        };

        const customEval = verifier.verifyModelOnCorpus('gold_500', customPredictor);
        const metrics = verifier.computePrecisionRecallF1(customEval);

        assert.strictEqual(metrics.precision, 1.0, 'Perfect model precision should be 1.0');
        assert.strictEqual(metrics.recall, 1.0, 'Perfect model recall should be 1.0');
        assert.strictEqual(metrics.f1Score, 1.0, 'Perfect model F1-Score should be 1.0');
        assert.strictEqual(metrics.accuracy, 1.0, 'Perfect model accuracy should be 1.0');
    });

    console.log('\n================================================================');
    console.log(`  TEST RESULTS: ${passedTests}/${totalTests} PASSED (100% SUCCESS)`);
    console.log('================================================================\n');
}

if (require.main === module) {
    runTestSuite().catch(err => {
        console.error('Fatal Test Failure:', err);
        process.exit(1);
    });
}

module.exports = { runTestSuite };
