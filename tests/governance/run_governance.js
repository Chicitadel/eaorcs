/******************************************************************************
 * Project        : EAORCS Governance Platform
 * Module         : API & SDK Governance Engine
 * File           : run_governance.js
 * Version        : 2026.1.0
 * Author         : Air Roofers Architecture Authority / Ujomor Systems
 * Organization   : Ujomor Systems & Air Roofers
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | PUBLIC | INTERNAL
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
 * Copyright (c) 2026 Ujomor Systems & Air Roofers
 * All Rights Reserved.
 ******************************************************************************/

const fs = require('fs');
const path = require('path');

const { runApiContractTests } = require('./api_contract.test');
const { runEventContractTests } = require('./event_contract.test');
const { runSdkCompatibilityTests } = require('./sdk_compatibility.test');
const { runIdentityDiscoveryTests } = require('./identity_discovery.test');
const { runRegistryLifecycleTests } = require('./registry_lifecycle.test');

function runAllGovernanceChecks() {
    console.log('==============================================================================');
    console.log(' AIR ROOFERS / EAORCS — API & SDK GOVERNANCE MASTER TEST RUNNER');
    console.log(' Standards: SemVer 2.0.0 | OpenAPI 3.0 | Protocol Freeze | UAIGOS v3.0');
    console.log('==============================================================================\n');

    const apiResults = runApiContractTests();
    const eventResults = runEventContractTests();
    const sdkResults = runSdkCompatibilityTests();
    const identityResults = runIdentityDiscoveryTests();
    const lifecycleResults = runRegistryLifecycleTests();

    const suiteResults = [
        { suite: 'API Contract Governance Engine', tests: apiResults },
        { suite: 'Event & Webhook Contract Engine', tests: eventResults },
        { suite: 'SDK Backward Compatibility Engine', tests: sdkResults },
        { suite: 'Identity Discovery Engine & Runtime Context', tests: identityResults },
        { suite: 'Registry Lifecycle Manager & Edition Engine', tests: lifecycleResults }
    ];

    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;

    console.log('+----------------------------------------------------------------------------------+----------+');
    console.log('| GOVERNANCE CHECK DESCRIPTION                                                    | RESULT   |');
    console.log('+----------------------------------------------------------------------------------+----------+');

    for (const group of suiteResults) {
        console.log(`| [SUITE] ${group.suite.padEnd(72)} |          |`);
        for (const testRes of group.tests) {
            totalTests++;
            if (testRes.passed) {
                totalPassed++;
                const desc = `  ✓ ${testRes.test}`.padEnd(80);
                console.log(`| ${desc} | PASS     |`);
            } else {
                totalFailed++;
                const desc = `  ✗ ${testRes.test}`.padEnd(80);
                console.log(`| ${desc} | FAIL     |`);
            }
        }
        console.log('+----------------------------------------------------------------------------------+----------+');
    }

    console.log(`\nTOTAL CHECKS EXECUTED : ${totalTests}`);
    console.log(`TOTAL CHECKS PASSED   : ${totalPassed}`);
    console.log(`TOTAL CHECKS FAILED   : ${totalFailed}\n`);

    // Generate markdown report
    const docsDir = path.resolve(__dirname, '../../docs');
    if (!fs.existsSync(docsDir)) {
        fs.mkdirSync(docsDir, { recursive: true });
    }

    const reportPath = path.join(docsDir, 'api_governance_report.md');
    const timestamp = new Date().toISOString();
    const overallStatus = totalFailed === 0 ? '✅ PASSED (100% COMPLIANT)' : '❌ FAILED';

    let markdownReport = `# EAORCS API & SDK Governance Attestation Report\n\n`;
    markdownReport += `**Generated Date**: ${timestamp}\n`;
    markdownReport += `**Author**: Air Roofers Architecture Authority / Ujomor Systems\n`;
    markdownReport += `**Overall Status**: ${overallStatus}\n\n`;
    markdownReport += `## Summary Metrics\n\n`;
    markdownReport += `- **Total Governance Checks**: ${totalTests}\n`;
    markdownReport += `- **Passed Checks**: ${totalPassed}\n`;
    markdownReport += `- **Failed Checks**: ${totalFailed}\n`;
    markdownReport += `- **SemVer Standard**: SemVer 2.0.0 (Enforced)\n`;
    markdownReport += `- **OpenAPI Version**: 3.0.3 (Built-in EAORCS Core 8 Endpoints)\n`;
    markdownReport += `- **Sunset Deprecation Notice Policy**: 6 Months (Enforced)\n`;
    markdownReport += `- **SDK Surface Verified**: \`sdk/verifier.cjs\` (\`verify\`, \`verifyOffline\`, \`getVersion\`)\n\n`;

    markdownReport += `## Detailed Governance Results Table\n\n`;
    markdownReport += `| Suite | Governance Check | Result | Detail |\n`;
    markdownReport += `| ----- | ---------------- | ------ | ------ |\n`;

    for (const group of suiteResults) {
        for (const testRes of group.tests) {
            const status = testRes.passed ? '✅ PASS' : '❌ FAIL';
            const detail = testRes.passed ? 'Compliant with protocol' : (testRes.error || 'Check failed');
            markdownReport += `| ${group.suite} | ${testRes.test} | ${status} | ${detail} |\n`;
        }
    }

    markdownReport += `\n## Core API Spec Coverage\n\n`;
    markdownReport += `The EAORCS Core Platform OpenAPI specification encompasses 8 platform endpoints:\n`;
    markdownReport += `1. \`GET /api/v1/health\`\n`;
    markdownReport += `2. \`POST /api/v1/passports/verify\`\n`;
    markdownReport += `3. \`GET /api/v1/certificates/{id}\`\n`;
    markdownReport += `4. \`POST /api/v1/tickets\`\n`;
    markdownReport += `5. \`GET /api/v1/audits\`\n`;
    markdownReport += `6. \`POST /api/v1/licenses/renew\`\n`;
    markdownReport += `7. \`GET /api/v1/billing/invoices\`\n`;
    markdownReport += `8. \`POST /api/v1/deployments\`\n\n`;

    markdownReport += `## Event Schemas Enforced\n\n`;
    markdownReport += `1. \`support.ticket.created\`\n`;
    markdownReport += `2. \`cert.issued\`\n`;
    markdownReport += `3. \`audit.completed\`\n`;
    markdownReport += `4. \`license.renewed\`\n`;
    markdownReport += `5. \`billing.invoice.created\`\n`;
    markdownReport += `6. \`deployment.completed\`\n\n`;

    markdownReport += `---\n*Report generated automatically by UAIGOS Governance Engine.*`;

    fs.writeFileSync(reportPath, markdownReport, 'utf8');
    console.log(`[REPORT GENERATED] Saved full governance attestation report to ${reportPath}\n`);

    if (totalFailed > 0) {
        console.error('❌ Governance checks failed.');
        process.exit(1);
    } else {
        console.log('✅ ALL API & SDK GOVERNANCE CHECKS PASSED SUCCESFULLY.');
        process.exit(0);
    }
}

if (require.main === module) {
    runAllGovernanceChecks();
}

module.exports = { runAllGovernanceChecks };
