/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : Subagent 3 Verification Test Suite
 * File           : subagent3_mission.test.cjs
 * Version        : 2026.1-LTS
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Classification : ENTERPRISE
 ******************************************************************************/

'use strict';

const assert = require('assert');
const { ProductBoundaryContract, HEALTH_STATUS, LICENSE_TIER } = require('../engine/contract/ProductBoundaryContract.js');
const { TenantManager, ISOLATION_MODE } = require('../engine/saas/TenantManager.js');
const { RbacEngine, STANDARD_ROLES } = require('../engine/saas/RbacEngine.js');
const { SubscriptionGate } = require('../engine/saas/SubscriptionGate.js');
const { PluginRegistry } = require('../engine/plugin/PluginRegistry.js');
const { PolicyPackLoader, BUILTIN_PACKS } = require('../engine/policy/PolicyPackLoader.js');
const AssureRuntime = require('../dsl/AssureRuntime.cjs');

function testProductBoundaryContract() {
    console.log("--> Testing ProductBoundaryContract...");
    const contract = new ProductBoundaryContract();

    // 1. Manifest Validation
    const manifest = {
        name: 'EAORCS Audit Platform',
        version: '2026.1.0',
        productCode: 'EAORCS',
        domain: 'Audit & Compliance',
        classification: 'ENTERPRISE',
        capabilities: [{ id: 'audit.realtime', version: '2.0.0', status: 'ENABLED' }]
    };

    const valResult = contract.validateManifest(manifest);
    assert.strictEqual(valResult.valid, true, "Manifest should be valid");

    const normManifest = contract.normalizeManifest(manifest);
    assert.strictEqual(normManifest.productCode, 'EAORCS');
    assert.strictEqual(contract.hasCapability(normManifest, 'audit.realtime', '1.5.0'), true);

    // 2. Health Report
    const health = contract.createHealthReport(HEALTH_STATUS.HEALTHY, { service: 'EAORCS-Kernel' });
    assert.strictEqual(health.status, 'HEALTHY');
    assert.strictEqual(contract.validateHealthReport(health).valid, true);

    // 3. Event Envelope
    const event = contract.formatEvent('AUDIT_COMPLETED', { findingsCount: 0 });
    assert.strictEqual(event.eventType, 'AUDIT_COMPLETED');
    assert.strictEqual(contract.validateEvent(event).valid, true);

    // 4. Telemetry Format
    const telem = contract.formatTelemetry('scans_total', 1, { product: 'EAORCS' });
    assert.strictEqual(telem.metric, 'scans_total');
    assert.strictEqual(contract.validateTelemetry(telem).valid, true);

    console.log("    ProductBoundaryContract tests passed.");
}

function testTenantManager() {
    console.log("--> Testing TenantManager...");
    const tm = new TenantManager();

    const tenant = tm.registerTenant({
        tenantId: 'tenant_acme',
        name: 'Acme Corp',
        tier: 'Business',
        isolationMode: ISOLATION_MODE.HYBRID_ISOLATED
    });

    assert.strictEqual(tenant.tenantId, 'tenant_acme');
    assert.strictEqual(tenant.tier, 'Business');

    const org = tm.createOrganization({
        orgId: 'org_acme_sec',
        tenantId: 'tenant_acme',
        name: 'Acme Security'
    });
    assert.strictEqual(org.orgId, 'org_acme_sec');

    const repo = tm.createRepository({
        repoId: 'repo_core_platform',
        orgId: 'org_acme_sec',
        name: 'Core Platform'
    });
    assert.strictEqual(repo.tenantId, 'tenant_acme');

    const hierarchy = tm.getHierarchy('tenant_acme');
    assert.strictEqual(hierarchy.organizations.length, 1);
    assert.strictEqual(hierarchy.organizations[0].repositories.length, 1);

    // Quota test
    const quotaCheck = tm.checkQuota('tenant_acme', 'repositories', 1);
    assert.strictEqual(quotaCheck.allowed, true);

    console.log("    TenantManager tests passed.");
}

function testRbacEngine() {
    console.log("--> Testing RbacEngine...");
    const rbac = new RbacEngine();

    const devContext = {
        userId: 'usr_dev1',
        tenantId: 'tenant_acme',
        roles: [STANDARD_ROLES.DEVELOPER]
    };

    // Developer can write repo
    let evalRes = rbac.evaluatePermission(devContext, 'repository:write');
    assert.strictEqual(evalRes.allowed, true);

    // Developer cannot manage tenant settings
    evalRes = rbac.evaluatePermission(devContext, 'tenant:settings:write');
    assert.strictEqual(evalRes.allowed, false);

    // Admin context
    const adminContext = {
        userId: 'usr_admin1',
        tenantId: 'tenant_acme',
        roles: [STANDARD_ROLES.ADMIN]
    };
    evalRes = rbac.evaluatePermission(adminContext, 'tenant:settings:write');
    assert.strictEqual(evalRes.allowed, true);

    // Wildcard matching for Auditor
    const auditorContext = {
        userId: 'usr_audit1',
        tenantId: 'tenant_acme',
        roles: [STANDARD_ROLES.AUDITOR]
    };
    evalRes = rbac.evaluatePermission(auditorContext, 'audit:execute');
    assert.strictEqual(evalRes.allowed, true);

    console.log("    RbacEngine tests passed.");
}

function testSubscriptionGate() {
    console.log("--> Testing SubscriptionGate...");
    const gate = new SubscriptionGate();

    assert.strictEqual(gate.isFeatureAllowed('Community', 'audit.basic'), true);
    assert.strictEqual(gate.isFeatureAllowed('Community', 'realtime.assurance'), false);
    assert.strictEqual(gate.isFeatureAllowed('Business', 'realtime.assurance'), true);
    assert.strictEqual(gate.isFeatureAllowed('Enterprise', 'policy.eu_ai_act'), true);

    assert.throws(() => gate.assertFeature('Community', 'policy.eu_ai_act'));

    const limits = gate.getTierLimits('Business');
    assert.strictEqual(limits.maxRepositories, 100);

    console.log("    SubscriptionGate tests passed.");
}

function testPluginRegistry() {
    console.log("--> Testing PluginRegistry...");
    const registry = new PluginRegistry();

    let hookCalled = false;

    const pluginHandle = registry.registerPlugin({
        id: 'plugin_scanner_v1',
        name: 'Vulnerability Scanner',
        version: '1.0.0',
        author: 'Ujomor Security',
        capabilities: ['READ_AUDIT', 'EXECUTE'],
        signature: 'sig_valid_1234567890abcdef'
    }, {
        onLoad: () => { hookCalled = true; },
        onAudit: (event) => ({ scanned: true, id: event.id })
    });

    assert.strictEqual(pluginHandle.signatureVerified, true);
    assert.strictEqual(hookCalled, true);

    const hookResults = registry.triggerHook('onAudit', { id: 'evt_100' });
    assert.strictEqual(hookResults.length, 1);
    assert.strictEqual(hookResults[0].output.scanned, true);

    console.log("    PluginRegistry tests passed.");
}

function testPolicyPackLoader() {
    console.log("--> Testing PolicyPackLoader...");
    const loader = new PolicyPackLoader();

    const packs = loader.listPacks();
    assert.ok(packs.length >= 5, "Should have at least 5 built-in policy packs");

    const targetContext = {
        securityPolicyDefined: true,
        mfaEnabled: true,
        rbacEnforced: true,
        sastScanPassed: true,
        criticalVulnerabilities: 0,
        environmentIsolated: true
    };

    const evalReport = loader.evaluateTarget(targetContext, [BUILTIN_PACKS.ISO_27001]);
    assert.strictEqual(evalReport.overallPassed, true);
    assert.strictEqual(evalReport.complianceScorePct, 100.0);

    console.log("    PolicyPackLoader tests passed.");
}

function testAssureRuntimeTriggers() {
    console.log("--> Testing AssureRuntime ON_SUCCESS and ON_FAILURE Triggers...");
    const runtime = new AssureRuntime();

    const script = `
policy "SecurityCompliance" {
  require severity <= 2;
  deny "Vulnerability severity too high";
  ON_SUCCESS notify "Security requirement passed";
  ON_FAILURE alert "High severity vulnerability detected";
}
`;

    runtime.loadScript(script);

    // Test passing execution
    let result = runtime.execute("SecurityCompliance", { severity: 1 });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.executedTriggers.length, 1);
    assert.strictEqual(result.executedTriggers[0].type, 'ON_SUCCESS');
    assert.strictEqual(result.executedTriggers[0].action, 'notify');

    // Test failing execution
    result = runtime.execute("SecurityCompliance", { severity: 4 });
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.reason, "Vulnerability severity too high");
    assert.strictEqual(result.executedTriggers.length, 1);
    assert.strictEqual(result.executedTriggers[0].type, 'ON_FAILURE');
    assert.strictEqual(result.executedTriggers[0].action, 'alert');

    console.log("    AssureRuntime trigger tests passed.");
}

function runAllSubagent3Tests() {
    console.log("=================================================");
    console.log("  Running Subagent 3 Mission Verification Suite  ");
    console.log("=================================================");
    testProductBoundaryContract();
    testTenantManager();
    testRbacEngine();
    testSubscriptionGate();
    testPluginRegistry();
    testPolicyPackLoader();
    testAssureRuntimeTriggers();
    console.log("=================================================");
    console.log("  ALL SUBAGENT 3 VERIFICATION TESTS PASSED 100%! ");
    console.log("=================================================");
}

runAllSubagent3Tests();
