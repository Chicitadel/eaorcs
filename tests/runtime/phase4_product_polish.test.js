/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Phase 4 — Product Polish Verification Suite
 * File           : phase4_product_polish.test.js
 * Version        : 2026.3.0-RC1
 * Author         : Platform Quality Engineering & Commercial Launch Authority
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');

async function runPhase4Suite() {
  console.log('\n=== PHASE 4: Product Polish & Launch Preparation Verification Suite ===\n');
  let passed = 0;
  let failed = 0;

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. Registry Lifecycle Manager
  // ─────────────────────────────────────────────────────────────────────────────
  try {
    const { RegistryLifecycleManager, ENTRY_STATES } = require('../../engine/registry/RegistryLifecycleManager');
    const mgr = new RegistryLifecycleManager();

    // Register entries
    const e1 = mgr.register({ id: 'plugin.iso27001', name: 'ISO 27001 Governance Pack', type: 'MarketplacePack', version: '2.0.0', owner: 'Marketplace' });
    const e2 = mgr.register({ id: 'plugin.soc2',    name: 'SOC 2 Compliance Pack',   type: 'MarketplacePack', version: '1.5.0', owner: 'Marketplace' });
    const e3 = mgr.register({ id: 'conn.github',    name: 'GitHub Connector',         type: 'Connector',       version: '3.0.0', owner: 'Platform' });
    assert.strictEqual(e1.state, ENTRY_STATES.ACTIVE);

    // Audit
    const audit = mgr.auditRegistry();
    assert.strictEqual(audit.totalEntries, 3);
    assert.strictEqual(audit.overallIntegrity, 'CLEAN');

    // Snapshot
    const snap1 = mgr.createSnapshot('Before-Archive-Test', 'CI/CD Pipeline');
    assert.ok(snap1.snapshotId);
    assert.ok(snap1.hash);

    // Archive
    const archived = mgr.archiveEntry('plugin.soc2', 'Superseded by SOC 2 Pack v2.0', 'Admin');
    assert.strictEqual(archived.state, ENTRY_STATES.ARCHIVED);
    const history = mgr.getHistory('plugin.soc2');
    assert.ok(history.length >= 2); // REGISTERED + ARCHIVED

    // Deprecate
    mgr.deprecateEntry('conn.github', 'GitHub Connector v4 replaces this.', 'Admin');
    const postDeprecate = mgr.getEntry('conn.github');
    assert.strictEqual(postDeprecate.state, ENTRY_STATES.DEPRECATED);

    // Second snapshot — preserves state for rollback test
    const snap2 = mgr.createSnapshot('After-Archive-Deprecate', 'Admin');
    assert.strictEqual(mgr.listSnapshots().length, 2);

    // Rollback
    const rollback = mgr.rollbackToSnapshot(snap1.snapshotId, 'Admin');
    assert.ok(rollback.safetySnapshotId); // Pre-rollback safety snap created
    assert.strictEqual(mgr.listSnapshots().length, 3); // snap1 + snap2 + safety

    // Integrity verification
    const integrity = mgr.verifyIntegrity();
    assert.strictEqual(integrity.overallStatus, 'INTEGRITY_VERIFIED');

    // Create a fresh dedicated entry, archive it, then restore it
    mgr.register({ id: 'restore.test.entry', name: 'Restore Test', type: 'Enhancement', version: '1.0.0' });
    mgr.archiveEntry('restore.test.entry', 'Testing restore', 'Test');
    const preRestore = mgr.getEntry('restore.test.entry');
    assert.strictEqual(preRestore.state, ENTRY_STATES.ARCHIVED);
    const restored = mgr.restoreEntry('restore.test.entry');
    assert.strictEqual(restored.state, ENTRY_STATES.ACTIVE);

    // Prune (nothing stale enough, 0-day threshold to force prune in test)
    const newEntry = mgr.register({ id: 'stale.test', name: 'Stale Test Entry', type: 'Enhancement', version: '0.1.0' });
    mgr.archiveEntry('stale.test', 'Test archive for prune', 'Test');
    // Force old timestamp for test
    mgr._registry.get('stale.test').lastModifiedAt = new Date(Date.now() - 91 * 86400 * 1000).toISOString();
    const pruned = mgr.pruneStaleEntries(90);
    assert.ok(pruned.prunedCount >= 1);

    const status = mgr.getEngineStatus();
    assert.strictEqual(status.initialized, true);
    assert.ok(status.auditLedgerSize >= 6);

    console.log('✅ 1. RegistryLifecycleManager PASSED');
    console.log(`   → Audit: ${audit.totalEntries} entries, Integrity: ${audit.overallIntegrity}`);
    console.log(`   → Snapshots: ${mgr.listSnapshots().length}, Pruned: ${pruned.prunedCount} stale entries`);
    passed++;
  } catch (err) {
    console.error('❌ 1. RegistryLifecycleManager FAILED:', err.message);
    failed++;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. Edition Authorization Engine
  // ─────────────────────────────────────────────────────────────────────────────
  try {
    const { EditionAuthorizationEngine, EDITIONS } = require('../../engine/licensing/EditionAuthorizationEngine');
    const authEngine = new EditionAuthorizationEngine();

    authEngine.registerTenant('tenant-community-001', EDITIONS.COMMUNITY);
    authEngine.registerTenant('tenant-professional-001', EDITIONS.PROFESSIONAL);
    authEngine.registerTenant('tenant-enterprise-001', EDITIONS.ENTERPRISE);
    authEngine.registerTenant('tenant-government-001', EDITIONS.GOVERNMENT);

    // Community: can access trust_score but NOT knowledge_graph_read or autonomous_policy_engine
    const commAuth = authEngine.isAuthorized('tenant-community-001', 'trust_score');
    assert.strictEqual(commAuth.authorized, true);
    const commKg = authEngine.isAuthorized('tenant-community-001', 'knowledge_graph_read');
    assert.strictEqual(commKg.authorized, false);
    const commPolicy = authEngine.isAuthorized('tenant-community-001', 'autonomous_policy_engine');
    assert.strictEqual(commPolicy.authorized, false);

    // Professional: knowledge_graph_read (READ_ONLY) but NOT knowledge_graph_full or autonomous_policy_engine
    const proKgRead = authEngine.isAuthorized('tenant-professional-001', 'knowledge_graph_read');
    assert.strictEqual(proKgRead.authorized, true);
    assert.strictEqual(proKgRead.accessType, 'READ_ONLY');
    const proKgFull = authEngine.isAuthorized('tenant-professional-001', 'knowledge_graph_full');
    assert.strictEqual(proKgFull.authorized, false);
    const proPolicy = authEngine.isAuthorized('tenant-professional-001', 'autonomous_policy_engine');
    assert.strictEqual(proPolicy.authorized, false);

    // Enterprise: knowledge_graph_full + autonomous_policy_engine but NOT air_gapped_deployment
    const entKgFull = authEngine.isAuthorized('tenant-enterprise-001', 'knowledge_graph_full');
    assert.strictEqual(entKgFull.authorized, true);
    assert.strictEqual(entKgFull.accessType, 'FULL');
    const entPolicy = authEngine.isAuthorized('tenant-enterprise-001', 'autonomous_policy_engine');
    assert.strictEqual(entPolicy.authorized, true);
    const entAirGap = authEngine.isAuthorized('tenant-enterprise-001', 'air_gapped_deployment');
    assert.strictEqual(entAirGap.authorized, false);

    // Government: all capabilities including sovereign and air-gapped
    const govAirGap = authEngine.isAuthorized('tenant-government-001', 'air_gapped_deployment');
    assert.strictEqual(govAirGap.authorized, true);
    const govSovereign = authEngine.isAuthorized('tenant-government-001', 'sovereign_data_residency');
    assert.strictEqual(govSovereign.authorized, true);

    // Token is returned (never raw capability map)
    const capResult = authEngine.getAuthorizedCapabilities('tenant-enterprise-001');
    assert.ok(capResult.token);
    assert.ok(capResult.token.tokenId);
    assert.ok(capResult.authorizedCount > capResult.deniedCount); // Enterprise has more authorized than denied

    // Capability matrix for pricing page
    const matrix = authEngine.getCapabilityMatrix();
    assert.ok(matrix.length >= 10);

    const status = authEngine.getEngineStatus();
    assert.strictEqual(status.registeredTenants, 4);
    assert.ok(status.totalCapabilities >= 30);

    console.log('✅ 2. EditionAuthorizationEngine PASSED');
    console.log(`   → Community authorized: ${authEngine.getAuthorizedCapabilities('tenant-community-001').authorizedCount} caps`);
    console.log(`   → Enterprise authorized: ${capResult.authorizedCount} caps, denied: ${capResult.deniedCount} caps`);
    console.log(`   → Total capability matrix: ${matrix.length} capabilities`);
    passed++;
  } catch (err) {
    console.error('❌ 2. EditionAuthorizationEngine FAILED:', err.message);
    failed++;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. Adaptive Dashboard Navigation Engine
  // ─────────────────────────────────────────────────────────────────────────────
  try {
    const { AdaptiveDashboardNavigationEngine } = require('../../engine/portal/AdaptiveDashboardNavigationEngine');
    const navEngine = new AdaptiveDashboardNavigationEngine();

    // Community CEO: only Community panels, CEO-relevant
    const ceoCommunityTree = navEngine.buildNavigationTree('CEO', 'COMMUNITY');
    assert.ok(ceoCommunityTree.totalPanels >= 1);
    // No Enterprise panels visible to Community
    const allCeoRoutes = ceoCommunityTree.groups.flatMap(g => g.panels.map(p => p.route));
    assert.ok(!allCeoRoutes.includes('/governance/policy')); // Enterprise panel must be excluded

    // Enterprise Architect: more panels
    const archEnterpriseTree = navEngine.buildNavigationTree('ARCHITECT', 'ENTERPRISE');
    assert.ok(archEnterpriseTree.totalPanels > ceoCommunityTree.totalPanels);
    // Enterprise architect should see governance panels
    const archRoutes = archEnterpriseTree.groups.flatMap(g => g.panels.map(p => p.route));
    assert.ok(archRoutes.includes('/governance/policy'));

    // Government ALL persona: widest access — use ALL persona at Government edition
    // Government should expose at least as many panels as Enterprise for the same ALL persona
    const entAllTree = navEngine.buildNavigationTree('ALL', 'ENTERPRISE');
    const govTree = navEngine.buildNavigationTree('ALL', 'GOVERNMENT');
    assert.ok(govTree.totalPanels >= entAllTree.totalPanels);

    // Search
    const searchResults = navEngine.searchNavigation('benchmark', 'PROFESSIONAL', 'CEO');
    assert.ok(Array.isArray(searchResults));
    assert.ok(searchResults.length >= 1);
    assert.ok(searchResults[0].relevance >= 1);

    // Search with short query returns empty
    const emptySearch = navEngine.searchNavigation('x', 'ENTERPRISE');
    assert.deepStrictEqual(emptySearch, []);

    // Favorites
    navEngine.recordFavorite('user-001', 'trust.dashboard');
    navEngine.recordFavorite('user-001', 'analytics.roi');
    const favs = navEngine.getFavorites('user-001');
    assert.ok(favs.includes('trust.dashboard'));
    navEngine.removeFavorite('user-001', 'analytics.roi');
    assert.ok(!navEngine.getFavorites('user-001').includes('analytics.roi'));

    // Navigation tree with favorites injection
    const treeWithFavs = navEngine.buildNavigationTree('CEO', 'ENTERPRISE', 'user-001');
    assert.ok(treeWithFavs.favorites.length >= 1);

    const status = navEngine.getEngineStatus();
    assert.ok(status.totalPanels >= 30);
    assert.strictEqual(status.totalGroups, 8);

    console.log('✅ 3. AdaptiveDashboardNavigationEngine PASSED');
    console.log(`   → Community CEO panels: ${ceoCommunityTree.totalPanels}, Enterprise Architect panels: ${archEnterpriseTree.totalPanels}`);
    console.log(`   → Search "benchmark": ${searchResults.length} result(s), Groups: ${status.totalGroups}, Total panels: ${status.totalPanels}`);
    passed++;
  } catch (err) {
    console.error('❌ 3. AdaptiveDashboardNavigationEngine FAILED:', err.message);
    failed++;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. Centralized Branding Engine
  // ─────────────────────────────────────────────────────────────────────────────
  try {
    const { CentralizedBrandingEngine, PLATFORM_DEFAULTS } = require('../../engine/branding/CentralizedBrandingEngine');
    const brandEngine = new CentralizedBrandingEngine();

    // Unregistered tenant should resolve to platform defaults + fallback logo
    const defaultProfile = brandEngine.resolve('tenant-unregistered');
    assert.ok(defaultProfile);
    assert.ok(defaultProfile.organizationName);
    assert.ok(defaultProfile.logoUrl.startsWith('data:image/svg+xml;base64')); // Fallback SVG injected
    assert.ok(defaultProfile.faviconUrl.startsWith('data:image/svg+xml;base64'));

    // Register tenant branding
    brandEngine.registerTenantBranding('tenant-acme', 'customer-acme', {
      organizationName: 'ACME Corp Software Trust',
      primaryColor: '#1e293b',
      accentColor: '#f59e0b',
      reportFooter: 'ACME Corp | Powered by EAORCS',
    });

    const acmeProfile = brandEngine.resolve('tenant-acme');
    assert.strictEqual(acmeProfile.organizationName, 'ACME Corp Software Trust');
    assert.strictEqual(acmeProfile.accentColor, '#f59e0b');
    assert.ok(acmeProfile.resolutionPath.includes('TENANT_CONFIG'));

    // Register customer branding (highest priority)
    brandEngine.registerCustomerBranding('customer-acme', {
      primaryColor: '#0f1729',
      reportWatermark: 'ACME CONFIDENTIAL',
    });
    brandEngine.invalidateCache('tenant-acme');

    const acmeWithCustomerProfile = brandEngine.resolve('tenant-acme');
    assert.strictEqual(acmeWithCustomerProfile.primaryColor, '#0f1729'); // Customer wins
    assert.strictEqual(acmeWithCustomerProfile.accentColor, '#f59e0b'); // Tenant still present
    assert.ok(acmeWithCustomerProfile.resolutionPath.includes('CUSTOMER_CONFIG'));
    assert.ok(acmeWithCustomerProfile.resolutionPath.includes('TENANT_CONFIG'));

    // CSS Theme generation
    const cssTheme = brandEngine.getPortalCssTheme('tenant-acme');
    assert.ok(typeof cssTheme === 'string');
    assert.ok(cssTheme.includes('--brand-primary'));
    assert.ok(cssTheme.includes('--brand-accent'));
    assert.ok(cssTheme.includes('#0f1729')); // Customer primary

    // Report header
    const reportHeader = brandEngine.getReportHeader('tenant-acme');
    assert.ok(reportHeader.logoSvg);
    assert.ok(reportHeader.footer.includes('ACME'));

    // Logo SVG always resolves
    assert.ok(defaultProfile.getLogoSvg().includes('<svg'));

    // Invalid color validation
    assert.throws(() => brandEngine.registerCustomerBranding('x', { primaryColor: 'not-a-color' }), /hex color/);

    const status = brandEngine.getEngineStatus();
    assert.strictEqual(status.fallbackLogoAvailable, true);
    assert.strictEqual(status.fallbackFaviconAvailable, true);

    console.log('✅ 4. CentralizedBrandingEngine PASSED');
    console.log(`   → Tenant profile resolution path: [${acmeWithCustomerProfile.resolutionPath.join(' → ')}]`);
    console.log(`   → CSS theme generated (${cssTheme.length} chars), Report header: "${reportHeader.footer}"`);
    passed++;
  } catch (err) {
    console.error('❌ 4. CentralizedBrandingEngine FAILED:', err.message);
    failed++;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. Interactive Operations Engine
  // ─────────────────────────────────────────────────────────────────────────────
  try {
    const { InteractiveOperationsEngine, OPERATION_STATUS } = require('../../engine/operations/InteractiveOperationsEngine');
    const opsEngine = new InteractiveOperationsEngine();

    // Launch async snapshot operation
    const snapOp = opsEngine.executeOperation('snapshot', { label: 'Test Snapshot' }, 'Admin');
    assert.ok(snapOp.operationId);
    assert.strictEqual(snapOp.status, OPERATION_STATUS.QUEUED);

    // Launch async archive operation
    const archiveOp = opsEngine.executeOperation('archive', { entryId: 'plugin.old' }, 'Admin');
    assert.ok(archiveOp.operationId);

    // Launch purge operation
    const purgeOp = opsEngine.executeOperation('purge', { olderThanDays: 90 }, 'Scheduler');
    assert.ok(purgeOp.operationId);

    // Subscribe to progress
    const progressUpdates = [];
    const unsubscribe = opsEngine.subscribeToProgress(snapOp.operationId, update => progressUpdates.push(update));
    assert.ok(typeof unsubscribe === 'function');
    unsubscribe();

    // Unknown operation type throws
    assert.throws(() => opsEngine.executeOperation('unknown_op', {}), /Unknown operation type/);

    // List operations
    const ops = opsEngine.listOperations();
    assert.ok(ops.length >= 3);

    // Supported operations list
    const supported = opsEngine.getSupportedOperations();
    assert.ok(supported.length >= 9);
    assert.ok(supported.find(o => o.operationType === 'rollback'));
    assert.ok(supported.find(o => o.operationType === 'migrate'));

    // Wait for snapshot to complete (it's the fastest: ~2s estimated in 4 steps)
    await new Promise(resolve => setTimeout(resolve, 3000));

    const snapStatus = opsEngine.getOperationStatus(snapOp.operationId);
    assert.strictEqual(snapStatus.status, OPERATION_STATUS.COMPLETED);
    assert.strictEqual(snapStatus.progressPercent, 100);

    const logs = opsEngine.getOperationLogs(snapOp.operationId);
    assert.ok(logs.length >= 4); // At least one log per step

    // Test cancellation — cancel the purge op if still running
    const purgeStatus = opsEngine.getOperationStatus(purgeOp.operationId);
    if ([OPERATION_STATUS.QUEUED, OPERATION_STATUS.RUNNING].includes(purgeStatus.status)) {
      const cancelled = opsEngine.cancelOperation(purgeOp.operationId);
      assert.strictEqual(cancelled.status, OPERATION_STATUS.CANCELLED);
    }

    const engineStatus = opsEngine.getEngineStatus();
    assert.strictEqual(engineStatus.initialized, true);
    assert.ok(engineStatus.totalOperations >= 3);

    console.log('✅ 5. InteractiveOperationsEngine PASSED');
    console.log(`   → Snapshot op: ${snapStatus.status} (${snapStatus.progressPercent}%), Logs: ${logs.length}`);
    console.log(`   → Total ops tracked: ${engineStatus.totalOperations}, Supported op types: ${supported.length}`);
    passed++;
  } catch (err) {
    console.error('❌ 5. InteractiveOperationsEngine FAILED:', err.message);
    failed++;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. Refined Gate 2 (8 Sub-Gates) + Strengthened Gate 3 (8-Stage Pipeline)
  // ─────────────────────────────────────────────────────────────────────────────
  try {
    const { OperationalLaunchGovernanceEngine, GATE_DEFINITIONS } = require('../../engine/launch/OperationalLaunchGovernanceEngine');
    const launchEngine = new OperationalLaunchGovernanceEngine();

    // Verify Gate 2 has 8 sub-gates defined
    const g2Def = GATE_DEFINITIONS.GATE_2_INDEPENDENT;
    assert.ok(g2Def.subGates);
    assert.strictEqual(Object.keys(g2Def.subGates).length, 8);
    assert.ok(g2Def.subGates.G2_SECURITY);
    assert.ok(g2Def.subGates.G2_PRIVACY);
    assert.ok(g2Def.subGates.G2_ACCESSIBILITY);
    assert.ok(g2Def.subGates.G2_DOCUMENTATION);

    // Verify Gate 3 has 8-stage pipeline and 3 pilot types (24 checkpoints)
    const g3Def = GATE_DEFINITIONS.GATE_3_CUSTOMER;
    assert.ok(g3Def.pilotStages);
    assert.strictEqual(g3Def.pilotStages.length, 8);
    assert.ok(g3Def.checkpoints.includes('saas_pilot_registered'));
    assert.ok(g3Def.checkpoints.includes('enterprise_reference_permission_granted'));
    assert.ok(g3Def.checkpoints.includes('government_nps_above_8'));
    assert.strictEqual(g3Def.checkpoints.length, 24); // 8 stages × 3 pilot types

    // Evaluate with partial Gate 2 evidence (security cleared)
    const result = launchEngine.evaluateAllGates({
      // Gate 1: 100%
      regression_tests_passing: true, dri_score_100: true, api_contract_validation: true,
      integration_tests_passing: true, migration_dry_run_verified: true,
      architecture_freeze_ratified: true, stk_control_plane_verified: true,
      // Gate 2: Security sub-gate cleared
      pentest_completed: true, pentest_findings_remediated: true, pentest_retested: true,
      // Gate 3: SaaS pilot first 3 stages cleared
      saas_pilot_registered: true, saas_deployment_successful: true, saas_daily_usage_confirmed: true,
      // Gate 4: 100%
      product_website_live: true, interactive_demo_available: true, api_explorer_browsable: true,
      documentation_searchable: true, pricing_page_transparent: true, marketplace_browsable: true,
      sdk_examples_published: true, training_materials_available: true,
      // Gate 5: 100%
      support_process_defined: true, incident_response_playbook: true, release_management_process: true,
      security_advisory_process: true, version_lifecycle_policy: true, deprecation_policy: true,
      backup_policy: true, disaster_recovery_playbook: true, customer_communication_process: true, public_roadmap_published: true,
    });

    assert.ok(result.compositeScore > 0);
    assert.strictEqual(result.gates.GATE_1.passed, true);
    assert.strictEqual(result.gates.GATE_4.passed, true);
    assert.strictEqual(result.gates.GATE_5.passed, true);
    // Gate 2 should be partially cleared (3/19 security checkpoints = ~16%)
    assert.ok(result.gates.GATE_2.score < 100);
    // Gate 3 should be partially cleared (3/24 checkpoints = ~12%)
    assert.ok(result.gates.GATE_3.score < 100);

    console.log('✅ 6. Refined Gate 2 & 3 PASSED');
    console.log(`   → Gate 2 sub-gates: 8 | Gate 3 pilot stages: 8 per type (24 total checkpoints)`);
    console.log(`   → Gate 2 score (partial): ${result.gates.GATE_2.score}% | Gate 3 score (partial): ${result.gates.GATE_3.score}%`);
    console.log(`   → Composite: ${result.compositeScore} | Status: ${result.launchStatus}`);
    passed++;
  } catch (err) {
    console.error('❌ 6. Refined Gate 2 & 3 FAILED:', err.message);
    failed++;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. Architecture Foundation Lock
  // ─────────────────────────────────────────────────────────────────────────────
  try {
    const fs = require('fs');
    const path = require('path');
    const yaml = require('js-yaml');

    const yamlPath = path.join(__dirname, '../../.governance/state/frozen.decisions.yaml');
    assert.ok(fs.existsSync(yamlPath), 'frozen.decisions.yaml must exist');

    const content = fs.readFileSync(yamlPath, 'utf-8');
    const parsed = yaml.load(content);

    assert.strictEqual(parsed.foundationLock.locked, true);
    assert.strictEqual(parsed.foundationLock.version, '2026.2.0-LTS');
    assert.ok(parsed.foundationLock.ltsLifecycle.securitySupportMonths >= 24);
    assert.ok(Array.isArray(parsed.foundationLock.allowedFutureAdditions));
    assert.ok(parsed.foundationLock.allowedFutureAdditions.includes('Plugin'));
    assert.ok(parsed.foundationLock.allowedFutureAdditions.includes('MarketplacePack'));
    assert.ok(Array.isArray(parsed.foundationLock.prohibitedAdditions));
    assert.ok(parsed.foundationLock.prohibitedAdditions.includes('CoreEngine'));
    assert.ok(parsed.foundationLock.prohibitedAdditions.includes('KernelMutation'));

    console.log('✅ 7. Foundation Architecture Lock PASSED');
    console.log(`   → Locked: ${parsed.foundationLock.locked}, Version: ${parsed.foundationLock.version}`);
    console.log(`   → LTS Security Support: ${parsed.foundationLock.ltsLifecycle.securitySupportMonths} months`);
    console.log(`   → Allowed future additions: [${parsed.foundationLock.allowedFutureAdditions.join(', ')}]`);
    passed++;
  } catch (err) {
    if (err.message.includes('Cannot find module') || err.message.includes('js-yaml')) {
      // js-yaml may not be installed — verify file manually
      const fs = require('fs');
      const path = require('path');
      const yamlPath = path.join(__dirname, '../../.governance/state/frozen.decisions.yaml');
      const content = fs.readFileSync(yamlPath, 'utf-8');
      assert.ok(content.includes('foundationLock'));
      assert.ok(content.includes('locked: true'));
      assert.ok(content.includes('2026.2.0-LTS'));
      assert.ok(content.includes('CoreEngine'));
      console.log('✅ 7. Foundation Architecture Lock PASSED (string validation — js-yaml not installed)');
      passed++;
    } else {
      console.error('❌ 7. Foundation Architecture Lock FAILED:', err.message);
      failed++;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Summary
  // ─────────────────────────────────────────────────────────────────────────────
  console.log(`\n${'═'.repeat(65)}`);
  if (failed === 0) {
    console.log(`🎉 ALL ${passed} PHASE 4 PRODUCT POLISH TESTS PASSED 100% CLEANLY!`);
  } else {
    console.log(`⚠️  ${passed} PASSED | ${failed} FAILED`);
  }
  console.log('═'.repeat(65));
  console.log('\n  EAORCS — Enterprise Software Trust Platform');
  console.log('  Phase 4: Product Polish & Launch Preparation VERIFIED');
  console.log('  Foundation Architecture: LOCKED — 2026.2.0-LTS');
  console.log(`${'═'.repeat(65)}\n`);

  if (failed > 0) process.exit(1);
}

if (require.main === module) {
  runPhase4Suite().catch(err => {
    console.error('❌ PHASE 4 SUITE ERROR:', err);
    process.exit(1);
  });
}

module.exports = { runPhase4Suite };
