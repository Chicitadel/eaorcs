/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Governance Platform — Stream 3 Neutrality Test Suite
 * File           : stream_3_neutrality.test.js
 * Version        : 2026.1-LTS (v1.0.0-FROZEN)
 * Author         : Enterprise Systems Engineering & Governance Authority
 * Organization   : Enterprise Governance & Systems Engineering
 * Created Date   : 2026-08-02
 * Last Modified  : 2026-08-02
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Copyright (c) 2026 Enterprise Governance & Systems Engineering. All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');

// Require Target Modules
const ReportBundleCompiler = require('../../engine/reporting/ReportBundleCompiler.js');
const AIRemediationEngine = require('../../engine/remediation/AIRemediationEngine.js');
const BusinessImpactEngine = require('../../engine/governance/BusinessImpactEngine.js');
const TechnicalDebtEngine = require('../../engine/governance/TechnicalDebtEngine.js');

function runStream3NeutralityTestSuite() {
    console.log('===========================================================');
    console.log(' Running Stream 3 Engine & Audit Bundle Neutrality Tests');
    console.log('===========================================================\n');

    const results = [];

    // Test 1: CommonJS Export & Require Verification
    try {
        assert.strictEqual(typeof ReportBundleCompiler, 'function', 'ReportBundleCompiler should be a constructor function');
        assert.strictEqual(typeof AIRemediationEngine, 'function', 'AIRemediationEngine should be a constructor function');
        assert.strictEqual(typeof BusinessImpactEngine, 'function', 'BusinessImpactEngine should be a constructor function');
        assert.strictEqual(typeof TechnicalDebtEngine, 'function', 'TechnicalDebtEngine should be a constructor function');
        results.push({ test: 'CommonJS Exports & Require verification', passed: true });
    } catch (err) {
        results.push({ test: 'CommonJS Exports & Require verification', passed: false, error: err.message });
    }

    // Test 2: Dynamic Tenant Branding & Domain Neutrality in ReportBundleCompiler
    const testOutputDir = path.join(__dirname, '../../EAORCS_AUDIT_TEST_NEUTRAL');
    try {
        const customBranding = {
            organizationName: "Acme Financial Services",
            domainName: "acme.finance",
            targetPlatform: "Acme Cloud Ecosystem (*.acme.finance)",
            auditAuthority: "Acme Information Security Office",
            identityProvider: "Acme Keycloak IdP",
            telemetryProvider: "Acme OpenTelemetry Lake",
            licenseAuthority: "Acme Global License Desk"
        };

        const mockContext = {
            timestamp: new Date().toISOString(),
            auditId: "AUDIT-TEST-001",
            tenantBranding: customBranding,
            overallReadinessScore: 98.5,
            certificationDecision: "PRODUCTION_READY",
            streams: [
                { id: "S-01", name: "Identity & Access Governance", status: "PASS", score: 100, details: "Verified OAuth2/OIDC" },
                { id: "S-02", name: "Telemetry & Audit Trail", status: "PASS", score: 97, details: "Verified OpenTelemetry ingest" }
            ],
            findings: [
                { id: "FIND-01", title: "CORS Config Check", category: "SECURITY", severity: "LOW", status: "PASSED" }
            ]
        };

        const compiler = new ReportBundleCompiler({ outputDir: testOutputDir });
        const manifest = compiler.compile(mockContext, testOutputDir);

        assert.ok(manifest, 'Manifest should be generated');
        assert.strictEqual(manifest.targetPlatform, "Acme Cloud Ecosystem (*.acme.finance)");

        // Read and verify compiled artifacts for domain neutrality and branding
        const certJson = JSON.parse(fs.readFileSync(path.join(testOutputDir, 'certificate.json'), 'utf8'));
        assert.strictEqual(certJson.targetPlatform, "Acme Cloud Ecosystem (*.acme.finance)");

        const sbomJson = JSON.parse(fs.readFileSync(path.join(testOutputDir, 'sbom.spdx.json'), 'utf8'));
        assert.strictEqual(sbomJson.name, "Acme Financial Services Software Bill of Materials (SBOM)");
        assert.ok(sbomJson.creationInfo.creators[0].includes("Acme Financial Services"));

        const riskJson = JSON.parse(fs.readFileSync(path.join(testOutputDir, 'risk_register.json'), 'utf8'));
        assert.ok(riskJson.riskEntries[0].mitigationStrategy.includes("Acme Keycloak IdP"), 'Risk register mitigation strategy should use tenant identity provider branding');

        const sarifJson = JSON.parse(fs.readFileSync(path.join(testOutputDir, 'findings.sarif.json'), 'utf8'));
        assert.ok(sarifJson.runs[0].tool.driver.informationUri.includes("acme.finance"), 'SARIF should reflect tenant information URI');

        results.push({ test: 'ReportBundleCompiler dynamic tenant branding & domain neutrality', passed: true });
    } catch (err) {
        results.push({ test: 'ReportBundleCompiler dynamic tenant branding & domain neutrality', passed: false, error: err.message });
    } finally {
        if (fs.existsSync(testOutputDir)) {
            fs.rmSync(testOutputDir, { recursive: true, force: true });
        }
    }

    // Test 3: AIRemediationEngine Domain-Agnostic Resource Terminology
    try {
        const remediationEngine = new AIRemediationEngine();
        const finding = remediationEngine.analyzeFinding({
            ruleId: 'CORS_WILDCARD',
            title: 'Wildcard CORS Origin'
        });

        assert.ok(Array.isArray(finding.affectedComponents), 'affectedComponents should be an array');
        assert.ok(finding.affectedComponents.includes('identity-provider'), 'affectedComponents should contain domain-agnostic resource term identity-provider');
        assert.ok(finding.affectedComponents.includes('api-gateway'), 'affectedComponents should contain api-gateway');

        const plan = remediationEngine.generateRemediationPlan([
            { ruleId: 'CORS_WILDCARD' },
            { ruleId: 'HARDCODED_SECRET' }
        ]);

        assert.strictEqual(plan.totalFindings, 2);
        assert.ok(plan.affectedComponentsMap['security-office-vault'] > 0, 'affectedComponentsMap should contain security-office-vault');

        results.push({ test: 'AIRemediationEngine domain-agnostic resource terminology', passed: true });
    } catch (err) {
        results.push({ test: 'AIRemediationEngine domain-agnostic resource terminology', passed: false, error: err.message });
    }

    // Test 4: BusinessImpactEngine Domain-Agnostic Resource Terminology
    try {
        const impactEngine = new BusinessImpactEngine();
        const impact = impactEngine.calculateFindingImpact({
            id: 'FIND-101',
            title: 'Unindexed Database Search Query',
            severity: 'HIGH',
            domain: 'INFRASTRUCTURE',
            resourceType: 'Database Cluster',
            blastRadius: 'REGIONAL'
        });

        assert.strictEqual(impact.domain, 'INFRASTRUCTURE');
        assert.strictEqual(impact.resourceType, 'Database Cluster');
        assert.ok(impact.financialRiskEUR > 0);
        assert.ok(impact.estimatedDowntimeHours > 0);

        results.push({ test: 'BusinessImpactEngine domain-agnostic resource terminology', passed: true });
    } catch (err) {
        results.push({ test: 'BusinessImpactEngine domain-agnostic resource terminology', passed: false, error: err.message });
    }

    // Test 5: TechnicalDebtEngine Domain-Agnostic Resource Terminology & 6-Domain Breakdown
    try {
        const debtEngine = new TechnicalDebtEngine();
        const report = debtEngine.analyzeTechnicalDebt([
            { id: 'TD-01', category: 'Security', severity: 'HIGH', resourceType: 'Security Vault' },
            { id: 'TD-02', category: 'Architecture', severity: 'MEDIUM', resourceType: 'API Router' }
        ]);

        assert.strictEqual(Object.keys(report.domains).length, 6);
        assert.ok(report.domains.Security.findings[0].resourceType === 'Security Vault');
        assert.ok(report.domains.Architecture.findings[0].resourceType === 'API Router');
        assert.ok(report.domains.Security.recommendations[0].includes('Security Office'));

        results.push({ test: 'TechnicalDebtEngine domain-agnostic resource terminology', passed: true });
    } catch (err) {
        results.push({ test: 'TechnicalDebtEngine domain-agnostic resource terminology', passed: false, error: err.message });
    }

    // Summary output
    let passedCount = 0;
    for (const r of results) {
        if (r.passed) {
            console.log(`  ✓ PASS: ${r.test}`);
            passedCount++;
        } else {
            console.log(`  ✗ FAIL: ${r.test} - Error: ${r.error}`);
        }
    }

    console.log(`\nStream 3 Neutrality Test Summary: ${passedCount}/${results.length} tests passed.\n`);

    if (passedCount !== results.length) {
        process.exit(1);
    }
}

runStream3NeutralityTestSuite();
