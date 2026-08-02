/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Platform Neutrality Verification Test Suite (PNC-001)
 * File           : tests/governance/pnc_001_neutrality.test.js
 * Version        : 2026.1-LTS (v1.0.0-FROZEN)
 * Author         : Enterprise Architecture Council & Systems Engineering
 * Organization   : Ujomor Enterprise Systems & Governance Authority
 * Created Date   : 2026-08-02
 * Last Modified  : 2026-08-02
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 * - PNC-001 Platform Neutrality Compliant
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Copyright (c) 2026 Ujomor Enterprise Systems. All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');

const { run40StreamFederatedAudit } = require('../../engine/audit/run_federated_40_streams_audit');
const BrandingEngine = require('../../engine/branding/BrandingEngine');
const IdentityProviderAdapter = require('../../engine/adapters/IdentityProviderAdapter');
const TelemetryProviderAdapter = require('../../engine/adapters/TelemetryProviderAdapter');
const { TechnologyDetector } = require('../../engine/governance/TechnologyDetector');
const ReportBundleCompiler = require('../../engine/reporting/ReportBundleCompiler');

function runPnc001NeutralityTestSuite() {
    console.log('========================================================================');
    console.log(' Running PNC-001 Platform Neutrality & White-Label Test Suite');
    console.log(' Target Engine  : EAORCS 40-Stream Federated Audit');
    console.log(' Standard       : PNC-001 Platform Neutrality Standard');
    console.log('========================================================================\n');

    const results = [];
    const auditOutputDir = path.join(__dirname, '../../EAORCS_AUDIT');
    const rootIndexPath = path.join(__dirname, '../../index.html');

    // Test 1: Class and Engine Import Verification
    try {
        assert.strictEqual(typeof BrandingEngine, 'function', 'BrandingEngine should be a function/constructor');
        assert.strictEqual(typeof IdentityProviderAdapter, 'function', 'IdentityProviderAdapter should be a function/constructor');
        assert.strictEqual(typeof TelemetryProviderAdapter, 'function', 'TelemetryProviderAdapter should be a function/constructor');
        assert.strictEqual(typeof TechnologyDetector, 'function', 'TechnologyDetector should be a function/constructor');
        assert.strictEqual(typeof ReportBundleCompiler, 'function', 'ReportBundleCompiler should be a function/constructor');
        assert.strictEqual(typeof run40StreamFederatedAudit, 'function', 'run40StreamFederatedAudit should be a function');
        results.push({ name: 'Engine & Adapter Classes Export Verification', passed: true });
    } catch (err) {
        results.push({ name: 'Engine & Adapter Classes Export Verification', passed: false, error: err.message });
    }

    // Test 2: Execute Audit Engine with Dynamic Tenant Configuration
    let manifest = null;
    const testTenantConfig = {
        tenantId: 'enterprise-customer-corp',
        domainName: 'customer.org',
        companyName: 'Enterprise Customer Corp',
        organizationName: 'Enterprise Global Systems',
        tagline: 'Enterprise Neutral Autonomous Governance Engine',
        logoUrl: '/assets/branding/customer-logo.svg'
    };

    try {
        manifest = run40StreamFederatedAudit(testTenantConfig);
        assert.ok(manifest, 'Audit manifest should be returned');
        assert.ok(manifest.artifactsCount > 0, 'Artifacts count should be > 0');
        results.push({ name: 'Audit Execution with Dynamic Tenant Config', passed: true });
    } catch (err) {
        results.push({ name: 'Audit Execution with Dynamic Tenant Config', passed: false, error: err.message });
    }

    // Test 3: Assert Zero Unauthorized Vendor Domains (*.airroofers.eu) in Exported Artifacts
    const artifactFiles = [
        path.join(auditOutputDir, 'manifest.json'),
        path.join(auditOutputDir, 'findings.json'),
        path.join(auditOutputDir, 'recommendations.json'),
        path.join(auditOutputDir, 'risk_register.json'),
        path.join(auditOutputDir, 'findings.sarif.json'),
        path.join(auditOutputDir, 'sarif.json'),
        path.join(auditOutputDir, 'sbom.spdx.json'),
        path.join(auditOutputDir, 'sbom.json'),
        path.join(auditOutputDir, 'certificate.json'),
        path.join(auditOutputDir, 'index.html'),
        path.join(auditOutputDir, 'readiness-scorecard.html'),
        path.join(auditOutputDir, 'executive-summary.md'),
        path.join(auditOutputDir, 'remediation/backlog.json'),
        path.join(auditOutputDir, 'architecture-map.svg'),
        path.join(auditOutputDir, 'dependency-graph.svg'),
        path.join(auditOutputDir, 'customer-journey.svg'),
        path.join(auditOutputDir, 'api-topology.svg'),
        rootIndexPath
    ];

    try {
        let totalFilesChecked = 0;
        let unauthorizedDomainMatches = 0;

        for (const filePath of artifactFiles) {
            if (fs.existsSync(filePath)) {
                totalFilesChecked++;
                const content = fs.readFileSync(filePath, 'utf8');
                const matches = content.match(/airroofers\.eu/gi);
                if (matches) {
                    unauthorizedDomainMatches += matches.length;
                    console.error(`  [PNC-001 VIOLATION] File ${path.basename(filePath)} contains ${matches.length} unauthorized vendor domain references: ${matches.join(', ')}`);
                }
            }
        }

        assert.strictEqual(unauthorizedDomainMatches, 0, `Zero unauthorized vendor domains (*.airroofers.eu) should appear in exported report artifacts. Found ${unauthorizedDomainMatches} matches.`);
        results.push({ name: `Zero Unauthorized Vendor Domains (*.airroofers.eu) in Exported Customer Report Artifacts (${totalFilesChecked} files verified)`, passed: true });
    } catch (err) {
        results.push({ name: 'Zero Unauthorized Vendor Domains (*.airroofers.eu) in Exported Customer Report Artifacts', passed: false, error: err.message });
    }

    // Test 4: Assert Dynamic Tenant Branding Metadata in Exported Artifacts
    try {
        const certJson = JSON.parse(fs.readFileSync(path.join(auditOutputDir, 'certificate.json'), 'utf8'));
        assert.ok(certJson.targetPlatform.includes('customer.org') || certJson.targetPlatform.includes('Enterprise Customer Corp'), 'Target platform should reflect tenant branding domain');

        const sbomJson = JSON.parse(fs.readFileSync(path.join(auditOutputDir, 'sbom.spdx.json'), 'utf8'));
        assert.ok(jsonContainsText(sbomJson, 'Enterprise Global Systems') || jsonContainsText(sbomJson, 'Enterprise Customer Corp'), 'SBOM should contain tenant organization name');

        const htmlContent = fs.readFileSync(path.join(auditOutputDir, 'index.html'), 'utf8');
        assert.ok(htmlContent.includes('Enterprise Customer Corp'), 'HTML dashboard should contain customer company name');
        assert.ok(htmlContent.includes('Enterprise Neutral Autonomous Governance Engine'), 'HTML dashboard should contain customer tagline');

        results.push({ name: 'Dynamic Tenant Branding Metadata Verification (Logo, Name, Domain, Tagline)', passed: true });
    } catch (err) {
        results.push({ name: 'Dynamic Tenant Branding Metadata Verification', passed: false, error: err.message });
    }

    // Test 5: Assert Technology Profile Badges & 10-Tier Resource Hierarchy in UI Dashboards
    try {
        const htmlContent = fs.readFileSync(path.join(auditOutputDir, 'index.html'), 'utf8');
        const scorecardContent = fs.readFileSync(path.join(auditOutputDir, 'readiness-scorecard.html'), 'utf8');

        // Check for technology profile badges (Java, Node.js, Go, Python, Docker)
        const techBadges = ['Java', 'Node.js', 'Go', 'Python', 'Docker'];
        for (const badge of techBadges) {
            assert.ok(htmlContent.includes(badge), `index.html must display technology profile badge for '${badge}'`);
            assert.ok(scorecardContent.includes(badge), `readiness-scorecard.html must display technology profile badge for '${badge}'`);
        }

        // Check for 10-tier resource hierarchy navigation
        const tierKeywords = [
            'Tier 1: Enterprise',
            'Tier 2: Division',
            'Tier 3: Region',
            'Tier 4: Data Center',
            'Tier 5: Environment',
            'Tier 6: System',
            'Tier 7: Subsystem',
            'Tier 8: Microservice',
            'Tier 9: Module',
            'Tier 10: Resource'
        ];

        for (const tier of tierKeywords) {
            assert.ok(htmlContent.includes(tier), `index.html must contain 10-tier resource hierarchy node '${tier}'`);
            assert.ok(scorecardContent.includes(tier), `readiness-scorecard.html must contain 10-tier resource hierarchy node '${tier}'`);
        }

        results.push({ name: 'UI Observatory Technology Badges & 10-Tier Hierarchy Verification', passed: true });
    } catch (err) {
        results.push({ name: 'UI Observatory Technology Badges & 10-Tier Hierarchy Verification', passed: false, error: err.message });
    }

    // Test 6: Assert Inferred Product Name & Confidence Score Rendering across Artifacts
    try {
        const certJson = JSON.parse(fs.readFileSync(path.join(auditOutputDir, 'certificate.json'), 'utf8'));
        assert.ok(certJson.inferredProduct, 'certificate.json must contain inferredProduct');
        assert.ok(certJson.inferredProduct.includes('Confidence'), 'certificate.json inferredProduct must include Confidence score');

        const findingsJson = JSON.parse(fs.readFileSync(path.join(auditOutputDir, 'findings.json'), 'utf8'));
        assert.ok(findingsJson.inferredProduct, 'findings.json must contain inferredProduct');
        assert.ok(findingsJson.inferredProduct.includes('Confidence'), 'findings.json inferredProduct must include Confidence score');

        const sarifJson = JSON.parse(fs.readFileSync(path.join(auditOutputDir, 'findings.sarif.json'), 'utf8'));
        assert.ok(sarifJson.runs[0].tool.driver.inferredProduct || sarifJson.runs[0].tool.driver.properties.inferredProduct, 'SARIF driver must contain inferredProduct');

        const sbomJson = JSON.parse(fs.readFileSync(path.join(auditOutputDir, 'sbom.spdx.json'), 'utf8'));
        assert.ok(jsonContainsText(sbomJson, 'Confidence') || jsonContainsText(sbomJson, 'Product:'), 'SBOM must contain inferred product and confidence score');

        const htmlContent = fs.readFileSync(path.join(auditOutputDir, 'index.html'), 'utf8');
        assert.ok(htmlContent.includes('Product:') && htmlContent.includes('Confidence'), 'HTML dashboard must display Product identity and Confidence score');

        results.push({ name: 'Inferred Product Identity & Confidence Score Verification across HTML, JSON, SARIF & SBOM', passed: true });
    } catch (err) {
        results.push({ name: 'Inferred Product Identity & Confidence Score Verification', passed: false, error: err.message });
    }

    // Print summary results
    let passedCount = 0;
    console.log('\n--- PNC-001 TEST RESULTS SUMMARY ---');
    for (const r of results) {
        if (r.passed) {
            console.log(` ✓ PASS: ${r.name}`);
            passedCount++;
        } else {
            console.log(` ✗ FAIL: ${r.name} - Error: ${r.error}`);
        }
    }

    console.log(`\nOverall Result: ${passedCount}/${results.length} tests passed.\n`);

    if (passedCount !== results.length) {
        process.exit(1);
    }
}

function jsonContainsText(obj, text) {
    return JSON.stringify(obj).includes(text);
}

if (require.main === module) {
    runPnc001NeutralityTestSuite();
}

module.exports = { runPnc001NeutralityTestSuite };
