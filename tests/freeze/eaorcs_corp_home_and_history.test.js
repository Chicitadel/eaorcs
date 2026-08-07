/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Home & History Test Suite
 * File           : eaorcs_corp_home_and_history.test.js
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
 * CORP: Subsystem 1 & 3 — Report History, Workspace Maintenance, & Home Server
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const http = require('http');

const ReportHistoryEngine = require('../../engine/governance/ReportHistoryEngine.js');
const WorkspaceMaintenanceEngine = require('../../engine/operations/WorkspaceMaintenanceEngine.js');
const HomeServerEngine = require('../../engine/portal/HomeServerEngine.js');

const workspaceRoot = path.resolve(__dirname, '../../');
const testTmpDir = path.join(workspaceRoot, 'tmp', 'test_home_history_' + Date.now());

if (!fs.existsSync(testTmpDir)) {
    fs.mkdirSync(testTmpDir, { recursive: true });
}

function httpGet(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body }));
        }).on('error', reject);
    });
}

function httpPost(url, data = {}) {
    return new Promise((resolve, reject) => {
        const u = new URL(url);
        const postData = JSON.stringify(data);
        const req = http.request({
            hostname: u.hostname,
            port: u.port,
            path: u.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body }));
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

async function runHomeAndHistoryTests() {
    console.log('================================================================');
    console.log('  EAORCS HOME & HISTORY TEST SUITE');
    console.log('  Subsystem 1 & 3 — Report History, Maintenance & Home Server');
    console.log('================================================================\n');

    // Setup isolated test environment
    const testReportsDir = path.join(testTmpDir, 'reports');
    fs.mkdirSync(testReportsDir, { recursive: true });

    // 1. ReportHistoryEngine — Index Creation & Archiving
    console.log('[1/4] Testing ReportHistoryEngine (Index creation & Archiving)...');
    const historyEngine = new ReportHistoryEngine({
        workspaceRoot: testTmpDir,
        reportsDir: testReportsDir
    });

    const mockReport1 = {
        reportId: 'REP-COMM-001',
        title: 'Community Governance Scan',
        score: 88,
        tier: 'Community',
        summary: 'Baseline check passed'
    };

    const archived1 = historyEngine.archiveReport(mockReport1, 'Community');
    assert.ok(archived1, 'Archived record must be returned');
    assert.strictEqual(archived1.reportId, 'REP-COMM-001');
    assert.strictEqual(archived1.tier, 'Community');
    assert.ok(fs.existsSync(archived1.fullPath), 'Archived JSON file must exist on disk');
    assert.ok(archived1.filePath.includes('reports/history'), 'File path must follow timestamped history format');

    const indexDataPath = path.join(testReportsDir, 'index.json');
    assert.ok(fs.existsSync(indexDataPath), 'reports/index.json must be created');
    const indexContent = JSON.parse(fs.readFileSync(indexDataPath, 'utf8'));
    assert.ok(Array.isArray(indexContent.reports), 'Index must contain reports array');
    assert.strictEqual(indexContent.reports.length, 1, 'Index must contain 1 report');
    console.log('    ✓ Report archiving & timestamped index creation verified');

    // 2. ReportHistoryEngine — Retention Enforcement & Loading
    console.log('[2/4] Testing Retention Enforcement & Historical Report Loading...');
    // Create an old report timestamped 60 days ago
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
    
    const mockOldCommunity = {
        reportId: 'REP-COMM-OLD',
        title: 'Old Community Audit Report',
        score: 75
    };
    const mockOldEnterprise = {
        reportId: 'REP-ENT-OLD',
        title: 'Old Enterprise Audit Report',
        score: 99
    };

    historyEngine.archiveReport(mockOldCommunity, { tier: 'Community', timestamp: sixtyDaysAgo, skipRetention: true });
    historyEngine.archiveReport(mockOldEnterprise, { tier: 'Enterprise', timestamp: sixtyDaysAgo });

    const beforeRetention = historyEngine.getReportHistory({ skipRetention: true });
    assert.strictEqual(beforeRetention.length, 3, 'Before retention enforcement, 3 reports should exist');

    // Enforce retention policy for Community
    const retentionResult = historyEngine.enforceRetentionPolicy('Community');
    assert.strictEqual(retentionResult.purgedCount, 1, '1 old Community report should be purged');

    const afterRetention = historyEngine.getReportHistory();
    assert.strictEqual(afterRetention.length, 2, '2 reports should remain after Community retention purge');
    assert.ok(!afterRetention.some(r => r.reportId === 'REP-COMM-OLD'), 'Old Community report must be removed');
    assert.ok(afterRetention.some(r => r.reportId === 'REP-ENT-OLD'), 'Old Enterprise report must be retained');

    // Test Historical Report Loading
    const loadedReport = historyEngine.loadHistoricalReport('REP-ENT-OLD');
    assert.ok(loadedReport, 'Enterprise report must be loadable from disk');
    assert.strictEqual(loadedReport.reportId, 'REP-ENT-OLD');
    assert.strictEqual(loadedReport.data.score, 99);
    console.log('    ✓ Retention policy enforcement (Community vs Enterprise) & Report loading verified');

    // 3. WorkspaceMaintenanceEngine
    console.log('[3/4] Testing WorkspaceMaintenanceEngine (Layout, Cache & State Reset)...');
    const maintenanceEngine = new WorkspaceMaintenanceEngine({
        workspaceRoot: testTmpDir,
        reportHistoryEngine: historyEngine
    });

    // Test Layout Reset
    const layoutRes = maintenanceEngine.resetLayout();
    assert.strictEqual(layoutRes.success, true, 'resetLayout must succeed');
    assert.ok(fs.existsSync(path.join(testTmpDir, 'config', 'layout.json')), 'config/layout.json must be written');

    // Test Cache Clearing
    const cacheRes = maintenanceEngine.clearLocalCache();
    assert.strictEqual(cacheRes.success, true, 'clearLocalCache must succeed');

    // Test Report Archiving from Pending
    const pendingDir = path.join(testReportsDir, 'pending');
    fs.mkdirSync(pendingDir, { recursive: true });
    const pendingFile = path.join(pendingDir, 'pending_report_01.json');
    fs.writeFileSync(pendingFile, JSON.stringify({ reportId: 'REP-PEND-01', title: 'Pending Report' }), 'utf8');

    const archiveRes = maintenanceEngine.archiveCompletedReports();
    assert.strictEqual(archiveRes.success, true, 'archiveCompletedReports must succeed');
    assert.strictEqual(archiveRes.archivedCount, 1, '1 pending report should be archived');
    assert.ok(!fs.existsSync(pendingFile), 'Pending report file must be removed after archiving');

    // Test Full Workspace Reset
    const resetRes = maintenanceEngine.resetWorkspaceState();
    assert.strictEqual(resetRes.success, true, 'resetWorkspaceState must succeed');
    assert.ok(resetRes.results.layout.success, 'Layout reset step in full reset must succeed');
    assert.ok(resetRes.results.cache.success, 'Cache clear step in full reset must succeed');
    console.log('    ✓ Layout reset, local cache clear, pending report archiving & full workspace reset verified');

    // 4. HomeServerEngine — HTTP Launcher Server & Endpoints
    console.log('[4/4] Testing HomeServerEngine HTTP Server & API Endpoints...');
    const homeServer = new HomeServerEngine({
        workspace: workspaceRoot,
        port: 8098
    });

    const serverCtrl = homeServer.launchHome({
        port: 8098,
        openBrowser: false,
        workspace: workspaceRoot
    });

    assert.ok(serverCtrl, 'Server controller must be returned');
    assert.strictEqual(serverCtrl.port, 8098);

    // Give server a brief moment to bind
    await new Promise(res => setTimeout(res, 200));

    // Test GET /home
    const homeRes = await httpGet('http://localhost:8098/home');
    assert.strictEqual(homeRes.statusCode, 200, 'GET /home must return 200');
    assert.ok(homeRes.body.includes('EAORCS'), 'GET /home HTML must contain EAORCS');

    // Test GET /api/data
    const dataRes = await httpGet('http://localhost:8098/api/data');
    assert.strictEqual(dataRes.statusCode, 200, 'GET /api/data must return 200');
    const dataJson = JSON.parse(dataRes.body);
    assert.strictEqual(dataJson.status, 'ACTIVE');
    assert.strictEqual(dataJson.version, '2026.3.1-LTS');

    // Test GET /api/reports
    const reportsRes = await httpGet('http://localhost:8098/api/reports');
    assert.strictEqual(reportsRes.statusCode, 200, 'GET /api/reports must return 200');
    const reportsJson = JSON.parse(reportsRes.body);
    assert.strictEqual(reportsJson.status, 'SUCCESS');
    assert.ok(Array.isArray(reportsJson.reports), 'Reports response must contain array');

    // Test GET /api/health
    const healthRes = await httpGet('http://localhost:8098/api/health');
    assert.strictEqual(healthRes.statusCode, 200, 'GET /api/health must return 200');
    const healthJson = JSON.parse(healthRes.body);
    assert.strictEqual(healthJson.status, 'UP');

    // Test POST /api/reset
    const resetApiRes = await httpPost('http://localhost:8098/api/reset', {});
    assert.strictEqual(resetApiRes.statusCode, 200, 'POST /api/reset must return 200');
    const resetApiJson = JSON.parse(resetApiRes.body);
    assert.strictEqual(resetApiJson.success, true, 'POST /api/reset must report success');

    // Close server
    await serverCtrl.close();
    console.log('    ✓ HomeServerEngine launcher HTTP server & API endpoints verified');

    // Cleanup temp directory
    try {
        fs.rmSync(testTmpDir, { recursive: true, force: true });
    } catch (e) {}

    console.log('\n================================================================');
    console.log('  EAORCS HOME & HISTORY SUITE PASSED');
    console.log('================================================================\n');
}

if (require.main === module) {
    runHomeAndHistoryTests().catch(err => {
        console.error('EAORCS Home & History test failed:', err);
        process.exit(1);
    });
}

module.exports = runHomeAndHistoryTests;
