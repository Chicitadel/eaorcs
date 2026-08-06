/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Stream 1 Verification Suite
 * File           : engine/tests/stream1_reporting_test.js
 * Version        : 2026.1-LTS
 * Author         : Enterprise Systems Engineering & Governance Authority
 * Organization   : Ujomor Enterprise Systems
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Enterprise Governance Enforced
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
 * Copyright (c) 2026 Ujomor Enterprise Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const path = require('path');
const fs = require('fs');
const assert = require('assert');

const ReportMetadataRegistry = require('../reporting/ReportMetadataRegistry');
const DynamicBrandingService = require('../reporting/DynamicBrandingService');

function runStream1Tests() {
    console.log('====================================================');
    console.log('   EAORCS Stream 1 Reporting Engine Verification');
    console.log('====================================================\n');

    let passed = 0;
    let total = 0;

    function test(name, fn) {
        total++;
        try {
            fn();
            console.log(`[PASS] ${name}`);
            passed++;
        } catch (err) {
            console.error(`[FAIL] ${name}: ${err.message}`);
            console.error(err.stack);
        }
    }

    // 1. ReportMetadataRegistry Instantiation & Basic API
    test('1. ReportMetadataRegistry Instantiation & Basic API', () => {
        assert(typeof ReportMetadataRegistry === 'function');
        const registry = new ReportMetadataRegistry({
            projectName: 'Custom Test Service',
            version: '2.5.0',
            architectureType: 'MICROSERVICES'
        });

        const meta = registry.getMetadata();
        assert.strictEqual(meta.projectName, 'Custom Test Service');
        assert.strictEqual(meta.version, '2.5.0');
        assert.strictEqual(meta.architectureType, 'MICROSERVICES');

        const validation = registry.validateMetadata();
        assert.strictEqual(validation.valid, true);
    });

    // 2. Dynamic Metadata Extraction without hardcoded product names
    test('2. Dynamic Metadata Extraction from Root Workspace', () => {
        const registry = new ReportMetadataRegistry();
        const extracted = registry.extractFromPath(path.join(__dirname, '../..'));

        assert(extracted.projectName && extracted.projectName.length > 0);
        assert(extracted.version && extracted.version.length > 0);
        assert(Array.isArray(extracted.microservices));
        assert(extracted.microservices.length > 0);
        assert(extracted.repositoryArtifacts.length > 0);
        assert(extracted.tenantConfiguration.tenantId);

        const yamlExport = registry.exportAsYaml();
        assert(yamlExport.includes('projectName:'));
        assert(yamlExport.includes('version:'));
    });

    // 3. DynamicBrandingService Instantiation & Custom Settings
    test('3. DynamicBrandingService Instantiation & Custom Settings', () => {
        assert(typeof DynamicBrandingService === 'function');
        const branding = new DynamicBrandingService({
            companyName: 'Acme Global Corp',
            currency: { code: 'EUR', symbol: '€', position: 'suffix' }
        });

        const cfg = branding.getBranding();
        assert.strictEqual(cfg.companyName, 'Acme Global Corp');

        const formattedPrice = branding.formatCurrency(54000);
        assert.strictEqual(formattedPrice, '54,000.00 €');
    });

    // 4. White-label CSS Variables & Typography Generation
    test('4. White-label CSS Variables & Typography Generation', () => {
        const branding = new DynamicBrandingService();
        const cssVars = branding.getThemeCssVariables();
        assert(cssVars.includes('--brand-primary:'));
        assert(cssVars.includes('--brand-accent:'));

        const typography = branding.getTypographyStyles();
        assert(typography.includes('font-family:'));
    });

    // 5. Localization & Translation Engine
    test('5. Multi-language Translation & Fallbacks', () => {
        const branding = new DynamicBrandingService({
            language: { locale: 'de-DE' }
        });

        const deTitle = branding.translate('report_title');
        assert.strictEqual(deTitle, 'Enterprise Governance Audit- & Compliance-Bericht');

        const parameterized = branding.translate('custom_key', 'Hello {name}!', { name: 'Alice' });
        assert.strictEqual(parameterized, 'Hello Alice!');
    });

    // 6. Integration: Load Branding from Tenant Configuration
    test('6. DynamicBrandingService loading from ReportMetadataRegistry Tenant Config', () => {
        const registry = new ReportMetadataRegistry();
        registry.extractFromPath(path.join(__dirname, '../..'));
        registry.registerMetadata({
            tenantConfiguration: {
                tenantId: 'acme-corp',
                tenantName: 'Acme Systems Ltd',
                watermarkText: 'CONFIDENTIAL AUDIT',
                currencyCode: 'GBP'
            }
        });

        const branding = new DynamicBrandingService();
        branding.loadFromTenantConfig(registry.getTenantConfig());

        const brandState = branding.getBranding();
        assert.strictEqual(brandState.companyName, 'Acme Systems Ltd');
        assert.strictEqual(brandState.watermark.text, 'CONFIDENTIAL AUDIT');
        assert.strictEqual(brandState.currency.symbol, '£');
    });

    // 7. Full HTML Branding Transformation
    test('7. Apply White-label Branding to HTML Document', () => {
        const branding = new DynamicBrandingService();
        const rawHtml = '<html><head><title>Test Report</title></head><body><h1>Executive Summary</h1></body></html>';
        const brandedHtml = branding.applyBrandingToHtml(rawHtml, { reportType: 'executive' });

        assert(brandedHtml.includes('id="eaorcs-dynamic-branding-styles"'));
        assert(brandedHtml.includes('--brand-primary:'));
        assert(brandedHtml.includes('eaorcs-report-footer'));
        assert(brandedHtml.includes('CONFIDENTIAL & PROPRIETARY'));
    });

    console.log(`\nStream 1 Verification Summary: ${passed}/${total} tests passed.\n`);
    if (passed !== total) {
        process.exit(1);
    }
}

runStream1Tests();
