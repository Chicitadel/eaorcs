/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Subsystem 1 Test Suite
 * File           : eaorcs_subsystem1_report_history_maintenance.test.js
 * Version        : 2026.3.1-LTS
 * Author         : Ujomor Systems & Enterprise Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-07
 * Last Modified  : 2026-08-07
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 * - Corporate Policy Governed
 *
 * CORP: Subsystem 1 Test Verification
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

const assert = require('assert');
const path = require('path');
const fs = require('fs');

const ReportHistoryEngine = require('../../engine/governance/ReportHistoryEngine');
const WorkspaceMaintenanceEngine = require('../../engine/operations/WorkspaceMaintenanceEngine');

function runSubsystem1Tests() {
    console.log('================================================================');
    console.log('  TEST SUITE: Subsystem 1 — Report History & Maintenance Engine');
    console.log('================================================================\n');

    const testTmpDir = path.join(__dirname, '../../tmp', `test_subsystem1_${Date.now()}`);
    if (!fs.existsSync(testTmpDir)) {
        fs.mkdirSync(testTmpDir, { recursive: true });
    }

    try {
        // Instantiate ReportHistoryEngine
        console.log('[1/7] Testing ReportHistoryEngine initialization & archiveReport()...');
        const reportsEngine = new ReportHistoryEngine({
            workspaceRoot: testTmpDir
        });

        const testReport1 = {
            id: 'REP-COMMUNITY-001',
            title: 'Community Compliance Audit Report',
            summary: 'Initial community audit report',
            tier: 'Community'
        };

        const archiveRecord1 = reportsEngine.archiveReport(testReport1, 'Community');
        assert.ok(archiveRecord1, 'Archive record should be returned');
        assert.strictEqual(archiveRecord1.reportId, 'REP-COMMUNITY-001');
        assert.strictEqual(archiveRecord1.tier, 'Community');
        assert.ok(fs.existsSync(archiveRecord1.fullPath), 'Archived file must exist on disk');

        // Check path format: reports/history/YYYY/MM/DD/report_HHMMSS.json
        assert.ok(archiveRecord1.filePath.includes('reports/history/'), 'FilePath must follow reports/history/ pattern');
        console.log('  ✓ archiveReport() created standardized archive file: %s', archiveRecord1.filePath);

        // Test 2: loadHistoricalReport()
        console.log('[2/7] Testing loadHistoricalReport()...');
        const loadedReport = reportsEngine.loadHistoricalReport('REP-COMMUNITY-001');
        assert.ok(loadedReport, 'Should load archived report');
        assert.strictEqual(loadedReport.reportId, 'REP-COMMUNITY-001');
        assert.strictEqual(loadedReport.data.summary, 'Initial community audit report');
        console.log('  ✓ loadHistoricalReport() retrieved correct report payload');

        // Test 3: getReportHistory() & options filter
        console.log('[3/7] Testing getReportHistory()...');
        const testReport2 = {
            id: 'REP-PRO-002',
            title: 'Professional Security Audit Report',
            tier: 'Professional'
        };
        reportsEngine.archiveReport(testReport2, 'Professional');

        const historyAll = reportsEngine.getReportHistory();
        assert.strictEqual(historyAll.length, 2, 'Should contain 2 history records');

        const historyPro = reportsEngine.getReportHistory({ tier: 'Professional' });
        assert.strictEqual(historyPro.length, 1, 'Should filter 1 Professional record');
        assert.strictEqual(historyPro[0].reportId, 'REP-PRO-002');
        console.log('  ✓ getReportHistory() returned filtered records correctly');

        // Test 4: Retention Enforcement
        console.log('[4/7] Testing retention policy limits (Community: 30d, Pro: 365d, Enterprise: Unlimited)...');
        // Inject an expired report into index
        const expiredDate = new Date(Date.now() - (35 * 24 * 60 * 60 * 1000)); // 35 days ago
        const expiredReport = {
            id: 'REP-EXPIRED-003',
            title: 'Expired Community Report',
            timestamp: expiredDate.toISOString()
        };
        const expiredRecord = reportsEngine.archiveReport(expiredReport, {
            tier: 'Community',
            timestamp: expiredDate.toISOString(),
            skipRetention: true
        });

        // Manually enforce retention
        const retentionResult = reportsEngine.enforceRetentionPolicy('Community');
        assert.ok(retentionResult.purgedCount >= 1, 'Should purge expired Community report (>30d)');
        assert.strictEqual(fs.existsSync(expiredRecord.fullPath), false, 'Expired file must be removed from disk');
        console.log('  ✓ retention policy successfully purged report older than 30d for Community tier');

        // Test 5: WorkspaceMaintenanceEngine resetLayout()
        console.log('[5/7] Testing WorkspaceMaintenanceEngine resetLayout()...');
        const maintenanceEngine = new WorkspaceMaintenanceEngine({
            workspaceRoot: testTmpDir,
            reportHistoryEngine: reportsEngine
        });

        const layoutResult = maintenanceEngine.resetLayout();
        assert.strictEqual(layoutResult.success, true);
        assert.ok(fs.existsSync(path.join(testTmpDir, 'config', 'layout.json')), 'layout.json should be created');
        console.log('  ✓ resetLayout() generated baseline configuration');

        // Test 6: clearLocalCache() & archiveCompletedReports()
        console.log('[6/7] Testing clearLocalCache() and archiveCompletedReports()...');
        // Create mock cache dir and pending report
        const mockCacheDir = path.join(testTmpDir, '.cache');
        fs.mkdirSync(mockCacheDir, { recursive: true });
        fs.writeFileSync(path.join(mockCacheDir, 'temp.cache'), 'cache data', 'utf8');

        const pendingDir = path.join(testTmpDir, 'reports', 'pending');
        fs.mkdirSync(pendingDir, { recursive: true });
        const pendingFile = path.join(pendingDir, 'pending_report_01.json');
        fs.writeFileSync(pendingFile, JSON.stringify({ id: 'REP-PENDING-01', title: 'Pending Report' }), 'utf8');

        const cacheResult = maintenanceEngine.clearLocalCache();
        assert.strictEqual(cacheResult.success, true);
        assert.strictEqual(fs.existsSync(mockCacheDir), false, '.cache directory should be removed');

        const archiveResult = maintenanceEngine.archiveCompletedReports();
        assert.strictEqual(archiveResult.success, true);
        assert.strictEqual(archiveResult.archivedCount, 1, 'Should archive 1 pending report');
        assert.strictEqual(fs.existsSync(pendingFile), false, 'Pending report file should be moved/cleaned');
        console.log('  ✓ clearLocalCache() and archiveCompletedReports() executed successfully');

        // Test 7: resetWorkspaceState()
        console.log('[7/7] Testing resetWorkspaceState()...');
        const fullResetResult = maintenanceEngine.resetWorkspaceState();
        assert.strictEqual(fullResetResult.success, true);
        assert.ok(fullResetResult.results.layout, 'Layout result included');
        assert.ok(fullResetResult.results.cache, 'Cache result included');
        assert.ok(fullResetResult.results.reports, 'Reports result included');
        console.log('  ✓ resetWorkspaceState() completed aggregated workspace maintenance');

        console.log('\n================================================================');
        console.log('  ALL SUBSYSTEM 1 TESTS PASSED SUCCESSFULLY');
        console.log('================================================================\n');
    } finally {
        // Cleanup testTmpDir
        try {
            if (fs.existsSync(testTmpDir)) {
                fs.rmSync(testTmpDir, { recursive: true, force: true });
            }
        } catch (e) {
            // Ignore cleanup errors
        }
    }
}

runSubsystem1Tests();
