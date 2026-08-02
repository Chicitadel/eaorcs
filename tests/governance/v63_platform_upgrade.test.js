/******************************************************************************
 * Project        : EAORCS Enterprise Engineering Governance Platform
 * Module         : v6.3 Platform Governance Upgrade Test Suite
 * File           : v63_platform_upgrade.test.js
 * Version        : v6.3.0-GA
 * Author         : Governance & Security Engineering Authority
 * Organization   : Enterprise Architecture Authority
 * Created Date   : 2026-08-02
 * Last Modified  : 2026-08-02
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - AI Governed
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
 * - Architecture Authority: APPROVED
 * - Security Authority: APPROVED
 * - Governance Authority: APPROVED
 * - Deployment Authority: APPROVED
 *
 * Copyright (c) 2026 Enterprise Architecture Authority
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');

const { EditionEngine, EDITIONS } = require('../../engine/governance/EditionEngine');
const RegistryOrchestrator = require('../../engine/governance/RegistryOrchestrator');
const BrandingEngine = require('../../engine/branding/BrandingEngine');
const ReportBundleCompiler = require('../../engine/reporting/ReportBundleCompiler');

async function runV63UpgradeTests() {
    console.log('========================================================================');
    console.log(' EAORCS v6.3 Platform Governance Upgrade Test Suite');
    console.log(' Target Architecture : Adaptive Navigation, Orchestration, Edition Gating, Branding');
    console.log(' Standard           : Enterprise Commercial SaaS Governance Standard');
    console.log('========================================================================\n');

    let passedCount = 0;
    let totalCount = 0;

    function test(name, fn) {
        totalCount++;
        try {
            fn();
            console.log(` ✓ PASS: ${name}`);
            passedCount++;
        } catch (err) {
            console.error(` ❌ FAIL: ${name}`);
            console.error(err);
        }
    }

    async function asyncTest(name, fn) {
        totalCount++;
        try {
            await fn();
            console.log(` ✓ PASS: ${name}`);
            passedCount++;
        } catch (err) {
            console.error(` ❌ FAIL: ${name}`);
            console.error(err);
        }
    }

    // 1. Server-Side Edition Authorization Gating Test
    test('Server-Side Edition Gating: COMMUNITY Edition renders ONLY 1 authorized button', () => {
        const compiler = new ReportBundleCompiler({ edition: EDITIONS.COMMUNITY });
        const html = compiler.generate17PanelsHtml({});

        assert(html.includes('id="btn-restart-audit"'), 'COMMUNITY edition must include Restart Clean Audit');
        assert(!html.includes('id="btn-soft-reset"'), 'COMMUNITY edition must NOT render Soft Reset button');
        assert(!html.includes('id="btn-archive-registry"'), 'COMMUNITY edition must NOT render Archive button');
        assert(!html.includes('id="btn-rollback-registry"'), 'COMMUNITY edition must NOT render Rollback button');
        assert(!html.includes('id="btn-legal-hold"'), 'COMMUNITY edition must NOT render Legal Hold button');
    });

    test('Server-Side Edition Gating: PROFESSIONAL Edition renders 3 authorized buttons', () => {
        const compiler = new ReportBundleCompiler({ edition: EDITIONS.PROFESSIONAL });
        const html = compiler.generate17PanelsHtml({});

        assert(html.includes('id="btn-restart-audit"'), 'PROFESSIONAL includes Restart Clean Audit');
        assert(html.includes('id="btn-soft-reset"'), 'PROFESSIONAL includes Soft Reset');
        assert(html.includes('id="btn-verify-integrity"'), 'PROFESSIONAL includes Verify Integrity');
        assert(!html.includes('id="btn-archive-registry"'), 'PROFESSIONAL must NOT render Archive');
        assert(!html.includes('id="btn-rollback-registry"'), 'PROFESSIONAL must NOT render Rollback');
    });

    test('Server-Side Edition Gating: ENTERPRISE Edition renders 5 authorized buttons', () => {
        const compiler = new ReportBundleCompiler({ edition: EDITIONS.ENTERPRISE });
        const html = compiler.generate17PanelsHtml({});

        assert(html.includes('id="btn-restart-audit"'));
        assert(html.includes('id="btn-soft-reset"'));
        assert(html.includes('id="btn-verify-integrity"'));
        assert(html.includes('id="btn-archive-registry"'));
        assert(html.includes('id="btn-export-history"'));
        assert(!html.includes('id="btn-rollback-registry"'), 'ENTERPRISE must NOT render Sovereign Rollback button');
    });

    test('Server-Side Edition Gating: SOVEREIGN Edition renders all 7 authorized buttons', () => {
        const compiler = new ReportBundleCompiler({ edition: EDITIONS.SOVEREIGN });
        const html = compiler.generate17PanelsHtml({});

        assert(html.includes('id="btn-restart-audit"'));
        assert(html.includes('id="btn-soft-reset"'));
        assert(html.includes('id="btn-verify-integrity"'));
        assert(html.includes('id="btn-archive-registry"'));
        assert(html.includes('id="btn-export-history"'));
        assert(html.includes('id="btn-rollback-registry"'));
        assert(html.includes('id="btn-legal-hold"'));
    });

    // 2. Real Registry Orchestrator Test
    await asyncTest('Registry Orchestrator: Execute Soft Reset & Snapshot Archive', async () => {
        const orchestrator = new RegistryOrchestrator();
        const softResult = await orchestrator.executeSoftReset({});
        assert.strictEqual(softResult.success, true, 'Soft Reset must return success: true');

        const archiveResult = await orchestrator.executeArchiveSnapshot({ reason: 'Test Archive' });
        assert.strictEqual(archiveResult.success, true, 'Archive Snapshot must return success: true');
        assert(archiveResult.snapshotId.startsWith('snapshot-'), 'Snapshot ID must start with snapshot-');
        assert(archiveResult.checksum, 'SHA256 checksum digest must be returned');
    });

    // 3. Centralized Branding Engine & Assets Test
    test('Centralized Branding Engine: Favicon link & base64 logo resolution', () => {
        const branding = new BrandingEngine();
        const tenantBranding = branding.getTenantBranding('default');
        
        assert(tenantBranding.logoUrl, 'logoUrl must be defined');
        assert(tenantBranding.faviconUrl || tenantBranding.faviconHtml, 'Favicon must be defined');

        const faviconLink = branding.getFaviconLinkHtml('default');
        assert(faviconLink.includes('rel="icon"'), 'Favicon link element must be generated');
    });

    // 4. Report Bundle Compiler & Output Verification
    await asyncTest('Report Bundle Compiler: Full Compilation with Edition Gating & Branding', async () => {
        const outputDir = path.join(__dirname, '../../tmp/test_eaorcs_v63');
        const compiler = new ReportBundleCompiler({
            outputDir: outputDir,
            edition: EDITIONS.ENTERPRISE
        });

        const compileResult = compiler.compile({
            overallReadinessScore: 100.0,
            certificationDecision: 'PRODUCTION_READY'
        });

        assert(compileResult.bundleId, 'bundleId must be generated');
        assert(compileResult.artifactsCount > 0, 'artifactsCount must be greater than 0');
        assert(fs.existsSync(path.join(outputDir, 'index.html')));
        assert(fs.existsSync(path.join(outputDir, 'manifest.json')));

        const html = fs.readFileSync(path.join(outputDir, 'index.html'), 'utf8');
        assert(html.includes('ENTERPRISE EDITION (ACTIVE)'), 'Rendered active edition badge must reflect ENTERPRISE');
        assert(html.includes('<link rel="icon"'), 'Favicon link element must exist in generated HTML head');
    });

    console.log(`\n========================================================================`);
    console.log(` EAORCS v6.3 Platform Governance Upgrade Test Results: ${passedCount}/${totalCount} Passed.`);
    console.log(`========================================================================`);

    if (passedCount !== totalCount) {
        process.exit(1);
    }
}

runV63UpgradeTests().catch(err => {
    console.error('Test execution failed:', err);
    process.exit(1);
});
