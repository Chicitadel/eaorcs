/******************************************************************************
 * Project        : Universal Autonomous Governance Operating System (UAIGOS)
 * Module         : EAORCS Stream 2 Verification Suite
 * File           : stream2_test.js
 * Version        : 2026.1-LTS
 * Author         : Enterprise Architecture Test Suite
 * Organization   : Ujomor Enterprise Systems
 * Created Date   : 2026-08-02
 * Last Modified  : 2026-08-02
 * Classification : ENTERPRISE | RESTRICTED
 ******************************************************************************/

'use strict';

const path = require('path');
const assert = require('assert');

// Require Stream 2 Modules
const IdentityProviderAdapter = require('../adapters/IdentityProviderAdapter.js');
const TelemetryProviderAdapter = require('../adapters/TelemetryProviderAdapter.js');
const LicenseAuthorityAdapter = require('../adapters/LicenseAuthorityAdapter.js');
const StorageProviderAdapter = require('../adapters/StorageProviderAdapter.js');
const SupportProviderAdapter = require('../adapters/SupportProviderAdapter.js');
const SCMAdapter = require('../adapters/SCMAdapter.js');
const BrandingEngine = require('../branding/BrandingEngine.js');

async function runStream2Tests() {
    console.log('====================================================');
    console.log('   EAORCS Stream 2 Provider Adapters & Branding Test');
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

    async function asyncTest(name, fn) {
        total++;
        try {
            await fn();
            console.log(`[PASS] ${name}`);
            passed++;
        } catch (err) {
            console.error(`[FAIL] ${name}: ${err.message}`);
            console.error(err.stack);
        }
    }

    // 1. IdentityProviderAdapter Test
    await asyncTest('1. IdentityProviderAdapter (Keycloak, Azure AD, Okta)', async () => {
        const idpKeycloak = new IdentityProviderAdapter({ provider: 'keycloak', tenantId: 'tenant-alpha' });
        assert.strictEqual(idpKeycloak.getProviderName(), 'keycloak');

        const authRes = await idpKeycloak.authenticate({ username: 'john_doe', password: 'secure_password' });
        assert.strictEqual(authRes.authenticated, true);
        assert.strictEqual(authRes.user.username, 'john_doe');
        assert(authRes.accessToken);

        const tokenValidation = idpKeycloak.validateToken(authRes.accessToken);
        assert.strictEqual(tokenValidation.valid, true);

        const idpAzure = new IdentityProviderAdapter({ provider: 'azure-ad', tenantId: 'tenant-azure' });
        const azureAuth = await idpAzure.authenticate({ username: 'alice_admin', password: 'secure_password' });
        assert.strictEqual(azureAuth.provider, 'azure-ad');

        const idpOkta = new IdentityProviderAdapter({ provider: 'okta' });
        assert.strictEqual(idpOkta.getProviderName(), 'okta');
        const oktaAuth = await idpOkta.authenticate({ username: 'bob_operator', password: 'password' });
        assert.strictEqual(oktaAuth.provider, 'okta');
    });

    // 2. TelemetryProviderAdapter Test
    test('2. TelemetryProviderAdapter (OpenTelemetry, Prometheus, Jaeger)', () => {
        const otel = new TelemetryProviderAdapter({ provider: 'opentelemetry', serviceName: 'eaorcs-auditor' });
        assert.strictEqual(otel.getProviderName(), 'opentelemetry');

        otel.emitMetric('audit_runs_total', 1, 'counter', { status: 'success' });
        const span = otel.startSpan('eval_rule_graph', { ruleId: 'R-101' });
        assert(span.spanId);
        const endedSpan = otel.endSpan(span.spanId);
        assert.strictEqual(endedSpan.status, 'ended');

        const prometheus = new TelemetryProviderAdapter({ provider: 'prometheus' });
        prometheus.emitMetric('cpu_usage_percentage', 42.5, 'gauge', { core: '0' });
        const promExport = prometheus.exportMetrics();
        assert(typeof promExport === 'string' && promExport.includes('cpu_usage_percentage'));
    });

    // 3. LicenseAuthorityAdapter Test
    await asyncTest('3. LicenseAuthorityAdapter (JWT, Key Server)', async () => {
        const licenseAdapter = new LicenseAuthorityAdapter({ provider: 'jwt', organizationId: 'Ujomor SAS' });
        assert.strictEqual(licenseAdapter.getProviderName(), 'jwt');

        const issued = licenseAdapter.issueLicense({ tenantId: 'acme_corp', tier: 'ENTERPRISE' }, 30, ['audit_kernel', 'custom_branding']);
        assert(issued.licenseKey);

        const validated = licenseAdapter.validateLicense(issued.licenseKey);
        assert.strictEqual(validated.valid, true);
        assert.strictEqual(validated.tenantId, 'acme_corp');

        const hasBranding = licenseAdapter.checkFeatureEntitlement(issued.licenseKey, 'custom_branding');
        assert.strictEqual(hasBranding, true);

        const hb = await licenseAdapter.verifyOnlineHeartbeat(issued.licenseKey);
        assert.strictEqual(hb.heartbeatStatus, 'ACTIVE');
    });

    // 4. StorageProviderAdapter Test
    await asyncTest('4. StorageProviderAdapter (S3, Azure Blob, GCS, POSIX)', async () => {
        const posixStorage = new StorageProviderAdapter({ provider: 'posix', basePath: path.join(__dirname, 'test_tmp') });
        assert.strictEqual(posixStorage.getProviderName(), 'posix');

        const putRes = await posixStorage.putObject('reports/test.txt', 'Hello EAORCS POSIX Storage');
        assert.strictEqual(putRes.success, true);

        const getRes = await posixStorage.getObject('reports/test.txt');
        assert.strictEqual(getRes.content, 'Hello EAORCS POSIX Storage');

        const listRes = await posixStorage.listObjects('reports');
        assert(listRes.length > 0);

        await posixStorage.deleteObject('reports/test.txt');

        // Cloud Storage S3 Driver mock
        const s3Storage = new StorageProviderAdapter({ provider: 's3', bucket: 'prod-audit-bucket' });
        await s3Storage.putObject('manifest.json', { version: '2026.1' });
        const s3Obj = await s3Storage.getObject('manifest.json');
        assert.strictEqual(JSON.parse(s3Obj.content).version, '2026.1');
        const s3Url = s3Storage.getPresignedUrl('manifest.json');
        assert(s3Url.includes('prod-audit-bucket.s3'));
    });

    // 5. SupportProviderAdapter Test
    await asyncTest('5. SupportProviderAdapter (Jira, ServiceNow, Zendesk)', async () => {
        const jira = new SupportProviderAdapter({ provider: 'jira', projectKey: 'GOV' });
        assert.strictEqual(jira.getProviderName(), 'jira');

        const ticket = await jira.createTicket({
            summary: 'Governance Violation Detected',
            description: 'Rule R-302 failed in repository build pipeline',
            priority: 'Critical'
        });
        assert(ticket.ticketId.startsWith('GOV-'));

        const updated = await jira.updateTicket(ticket.ticketId, { status: 'In Progress', comment: 'Assigned to security team' });
        assert.strictEqual(updated.status, 'In Progress');

        const servicenow = new SupportProviderAdapter({ provider: 'servicenow' });
        const snTicket = await servicenow.createTicket({ summary: 'SNOW Incident', description: 'Test SNOW ticket' });
        assert(snTicket.ticketId.startsWith('INC'));
    });

    // 6. SCMAdapter Test
    await asyncTest('6. SCMAdapter (Git, GitHub, GitLab, Bitbucket)', async () => {
        const github = new SCMAdapter({ provider: 'github', repositoryUrl: 'ujomor/eaorcs' });
        assert.strictEqual(github.getProviderName(), 'github');

        const pr = await github.createPullRequest({
            title: 'policy: Enforce Security Standard v3',
            sourceBranch: 'feature/security-pack'
        });
        assert.strictEqual(pr.status, 'OPEN');
        assert(pr.url.includes('github.com'));

        const commits = await github.fetchCommitHistory(3);
        assert.strictEqual(commits.length, 3);

        const gitlab = new SCMAdapter({ provider: 'gitlab', repositoryUrl: 'ujomor/eaorcs' });
        const glPr = await gitlab.createPullRequest({ title: 'Merge MR', sourceBranch: 'dev' });
        assert(glPr.url.includes('gitlab.com'));
    });

    // 7. BrandingEngine Test
    test('7. BrandingEngine (Multi-tenant logo, themes, taglines, policy packs)', () => {
        const branding = new BrandingEngine({ companyName: 'Base Enterprise Governance' });

        const tenantA = branding.registerTenantBranding('acme-corp', {
            companyName: 'Acme Global Corp',
            logoUrl: 'https://cdn.acme.com/logo.svg',
            colors: {
                primary: '#112233',
                secondary: '#FF5500',
                bg: '#FAFAFA'
            },
            tagline: 'Innovating Governance Solutions',
            policyPack: {
                policyPackId: 'ACME_CUSTOM_PACK_V2',
                rules: ['STRICT_MFA', 'ACME_SECURITY_POLICY']
            }
        });

        assert.strictEqual(tenantA.companyName, 'Acme Global Corp');

        const resolved = branding.getTenantBranding('acme-corp');
        assert.strictEqual(resolved.colors.primary, '#112233');

        const cssVars = branding.generateCssVariables('acme-corp');
        assert(cssVars.includes('--brand-primary: #112233'));

        const template = '<h1>{{BRAND_COMPANY}}</h1><p>{{BRAND_TAGLINE}}</p><p>Policy: {{POLICY_PACK_ID}}</p>';
        const interpolated = branding.injectBrandingToTemplate(template, 'acme-corp');
        assert(interpolated.includes('Acme Global Corp'));
        assert(interpolated.includes('ACME_CUSTOM_PACK_V2'));

        const headerHtml = branding.renderHeaderHtml('acme-corp');
        assert(headerHtml.includes('https://cdn.acme.com/logo.svg'));

        const footerHtml = branding.renderFooterHtml('acme-corp');
        assert(footerHtml.includes('acme-corp'));

        assert.strictEqual(branding.hasPolicyRule('acme-corp', 'STRICT_MFA'), true);
        assert.strictEqual(branding.hasPolicyRule('acme-corp', 'NON_EXISTENT_RULE'), false);
    });

    console.log(`\n====================================================`);
    console.log(`   Test Results: ${passed}/${total} Passed.`);
    console.log(`====================================================`);

    if (passed !== total) {
        process.exit(1);
    }
}

runStream2Tests().catch(err => {
    console.error('Test execution failed:', err);
    process.exit(1);
});
