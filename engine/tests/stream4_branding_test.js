/******************************************************************************
 * Project        : Universal Autonomous Governance Operating System (UAIGOS)
 * Module         : EAORCS Stream 4 Verification Suite
 * File           : stream4_branding_test.js
 * Version        : 2026.1-LTS
 * Author         : Enterprise Architecture Test Suite
 * Organization   : Ujomor Enterprise Systems
 * Created Date   : 2026-08-02
 * Last Modified  : 2026-08-02
 * Classification : ENTERPRISE | RESTRICTED
 ******************************************************************************/

'use strict';

const path = require('path');
const fs = require('fs');
const assert = require('assert');

// Require Stream 4 Modules
const BrandingEngine = require('../branding/BrandingEngine.js');
const ReportBundleCompiler = require('../reporting/ReportBundleCompiler.js');

async function runStream4Tests() {
    console.log('====================================================');
    console.log('   EAORCS Stream 4 Branding Engine & Asset Test');
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

    // 1. Verify CommonJS Module Export and Instantiation
    test('1. CommonJS Module Export and Instantiation', () => {
        assert(typeof BrandingEngine === 'function');
        assert(typeof ReportBundleCompiler === 'function');

        const engine = new BrandingEngine();
        assert(engine instanceof BrandingEngine);
        const compiler = new ReportBundleCompiler();
        assert(compiler instanceof ReportBundleCompiler);
    });

    // 2. Verify Base64 Logo & Favicon Inline Fallback
    test('2. Base64 Logo & Favicon Inline Fallback', () => {
        const engine = new BrandingEngine();
        const logoBase64 = engine.getEaorcsLogoBase64();
        assert(logoBase64.startsWith('data:image/png;base64,'));
        assert(logoBase64.length > 50);

        const faviconBase64 = engine.getEaorcsFaviconBase64();
        assert(faviconBase64.startsWith('data:image/'));
        assert(faviconBase64.length > 50);
    });

    // 3. Verify Fallback Cascade (Customer -> Tenant -> EAORCS)
    test('3. Fallback Cascade: Customer -> Tenant -> EAORCS', () => {
        const engine = new BrandingEngine();

        // Level 3: Default EAORCS Fallback
        const defaultBrand = engine.resolveBranding();
        assert.strictEqual(defaultBrand.cascadeSource, 'EAORCS Brand');
        assert.strictEqual(defaultBrand.companyName, 'EAORCS Governance Suite');

        // Level 2: Tenant Brand
        engine.registerTenantBranding('acme', {
            companyName: 'Acme Corp Tenant',
            logoUrl: 'https://cdn.acme.com/logo.png',
            faviconUrl: 'https://cdn.acme.com/favicon.ico'
        });
        const tenantBrand = engine.resolveBranding('acme');
        assert.strictEqual(tenantBrand.cascadeSource, 'Tenant Brand');
        assert.strictEqual(tenantBrand.companyName, 'Acme Corp Tenant');
        assert.strictEqual(tenantBrand.logoUrl, 'https://cdn.acme.com/logo.png');

        // Level 1: Customer Brand Override
        const customerBrand = engine.resolveBranding('acme', {
            customerName: 'Global Enterprises Inc',
            customerLogo: 'https://cdn.global.com/logo.png',
            customerFavicon: 'https://cdn.global.com/favicon.ico'
        });
        assert.strictEqual(customerBrand.cascadeSource, 'Customer Brand');
        assert.strictEqual(customerBrand.companyName, 'Global Enterprises Inc');
        assert.strictEqual(customerBrand.logoUrl, 'https://cdn.global.com/logo.png');
        assert.strictEqual(customerBrand.faviconUrl, 'https://cdn.global.com/favicon.ico');
    });

    // 4. Verify Favicon Link Tag Injection
    test('4. Favicon Link Tag Injection', () => {
        const engine = new BrandingEngine();
        const htmlBefore = '<html><head><title>Test</title></head><body></body></html>';
        const htmlAfter = engine.injectFaviconToHtml(htmlBefore);
        assert(htmlAfter.includes('rel="icon"'));
        assert(htmlAfter.includes('href='));
    });

    // 5. Verify ReportBundleCompiler Output
    test('5. ReportBundleCompiler HTML & Asset Integration', () => {
        const tempOutputDir = path.join(__dirname, 'temp_audit_output');
        const compiler = new ReportBundleCompiler({ outputDir: tempOutputDir });

        const manifest = compiler.compile({
            auditId: 'TEST-STREAM4-001',
            overallReadinessScore: 98.5,
            certificationDecision: 'PRODUCTION_READY',
            tenantBranding: {
                companyName: 'Acme Test Corp',
                customerLogo: 'https://example.com/logo.png'
            }
        });

        assert(manifest.bundleId);
        assert(fs.existsSync(path.join(tempOutputDir, 'index.html')));
        assert(fs.existsSync(path.join(tempOutputDir, 'readiness-scorecard.html')));
        assert(fs.existsSync(path.join(tempOutputDir, 'certificate.json')));

        const indexHtml = fs.readFileSync(path.join(tempOutputDir, 'index.html'), 'utf8');
        assert(indexHtml.includes('rel="icon"'));
        assert(indexHtml.includes('onerror='));

        const certJson = JSON.parse(fs.readFileSync(path.join(tempOutputDir, 'certificate.json'), 'utf8'));
        assert.strictEqual(certJson.auditId, 'TEST-STREAM4-001');

        // Cleanup
        fs.rmSync(tempOutputDir, { recursive: true, force: true });
    });

    console.log(`\n====================================================`);
    console.log(`   Stream 4 Test Results: ${passed}/${total} Passed.`);
    console.log(`====================================================`);

    if (passed !== total) {
        process.exit(1);
    }
}

runStream4Tests().catch(err => {
    console.error('Stream 4 Test execution failed:', err);
    process.exit(1);
});
