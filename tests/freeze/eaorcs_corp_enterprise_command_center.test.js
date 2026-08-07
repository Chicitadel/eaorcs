/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Enterprise Command Center Test Suite
 * File           : eaorcs_corp_enterprise_command_center.test.js
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
 * CORP: Subsystem 4 — Enterprise Command Center & Package Integration
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

const EnterpriseCommandCenterEngine = require('../../engine/enterprise/EnterpriseCommandCenterEngine.js');

const workspaceRoot = path.resolve(__dirname, '../../');
const tmpDir = path.join(workspaceRoot, 'tmp');

if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
}

async function runEnterpriseCommandCenterTests() {
    console.log('================================================================');
    console.log('  EAORCS ENTERPRISE COMMAND CENTER ENGINE TEST SUITE');
    console.log('  Subsystem 4 — Operational Control Console & Pipeline Verification');
    console.log('================================================================\n');

    const engine = new EnterpriseCommandCenterEngine(workspaceRoot);

    // 1. Live Workspace Discovery
    console.log('[1/5] Testing Live Workspace Discovery...');
    const workspaceInfo = engine.discoverWorkspace();
    assert.ok(workspaceInfo, 'Workspace info must be returned');
    assert.ok(workspaceInfo.organization, 'Organization must be present');
    assert.ok(workspaceInfo.domain, 'Domain must be present');
    assert.ok(workspaceInfo.activeMission, 'Active mission must be present');
    assert.strictEqual(workspaceInfo.status, 'DISCOVERED', 'Workspace status must be DISCOVERED');
    console.log(`    ✓ Workspace discovered for ${workspaceInfo.organization} (${workspaceInfo.domain})`);

    // 2. Technical Debt & Digital Twin State
    console.log('[2/5] Testing Technical Debt & Digital Twin State Discovery...');
    const techDebt = engine.scanTechnicalDebt();
    assert.ok(techDebt.summary, 'Tech debt summary must exist');
    assert.ok(typeof techDebt.summary.todosCount === 'number', 'todosCount must be a number');

    const digitalTwin = engine.buildDigitalTwinState();
    assert.ok(Array.isArray(digitalTwin.nodes), 'Digital twin nodes must be an array');
    assert.ok(digitalTwin.nodes.length >= 5, 'Must contain at least 5 digital twin nodes');
    assert.strictEqual(digitalTwin.topology.overallHealth, 'HEALTHY', 'Topology health must be HEALTHY');
    console.log('    ✓ Technical Debt & Digital Twin State verified');

    // 3. JSON Emission (ecc_dashboard.json)
    console.log('[3/5] Testing JSON Emission (ecc_dashboard.json)...');
    const targetJsonPath = path.join(tmpDir, 'test_ecc_dashboard.json');
    const savedJsonPath = engine.compileAndSaveJSON(targetJsonPath);
    assert.ok(fs.existsSync(savedJsonPath), 'ecc_dashboard.json must be written');

    const jsonContent = JSON.parse(fs.readFileSync(savedJsonPath, 'utf8'));
    assert.ok(jsonContent.title.includes('Enterprise Command Center'), 'Title must contain Enterprise Command Center');
    assert.ok(jsonContent.compliance, 'Compliance metadata must exist');
    assert.ok(jsonContent.digitalTwin, 'Digital twin metadata must exist');
    assert.ok(jsonContent.techDebt, 'Tech debt metadata must exist');
    console.log(`    ✓ ecc_dashboard.json emitted and validated at ${savedJsonPath}`);

    // 4. HTML Generation (ecc_dashboard.html)
    console.log('[4/5] Testing HTML Generation (ecc_dashboard.html)...');
    const targetHtmlPath = path.join(tmpDir, 'test_ecc_dashboard.html');
    const savedHtmlPath = engine.compileAndSaveHTML(targetHtmlPath);
    assert.ok(fs.existsSync(savedHtmlPath), 'ecc_dashboard.html must be written');

    const htmlContent = fs.readFileSync(savedHtmlPath, 'utf8');
    assert.ok(htmlContent.includes('<!DOCTYPE html>'), 'HTML must start with DOCTYPE');
    assert.ok(htmlContent.includes('Enterprise Command Center'), 'HTML must contain dashboard title');
    assert.ok(htmlContent.includes('7-Stage Governed Pipeline'), 'HTML must mention 7-stage governed pipeline');
    console.log(`    ✓ ecc_dashboard.html generated and validated at ${savedHtmlPath}`);

    // 5. REST API Endpoints & 7-Stage Governed Pipeline Execution
    console.log('[5/5] Testing REST API Endpoints & 7-Stage Governed Pipeline Execution...');
    const endpoints = engine.getApiEndpoints();
    assert.ok(Array.isArray(endpoints), 'Endpoints must be an array');
    assert.ok(endpoints.length >= 7, 'Must register at least 7 API endpoints');

    const wsReq = engine.handleApiRequest('/api/v1/ecc/workspace');
    assert.strictEqual(wsReq.status, 200, 'GET /api/v1/ecc/workspace must return 200');
    assert.strictEqual(wsReq.data.status, 'DISCOVERED', 'Workspace response data must match discovery');

    const stateReq = engine.handleApiRequest('/api/v1/ecc/state');
    assert.strictEqual(stateReq.status, 200, 'GET /api/v1/ecc/state must return 200');

    const execReq = engine.handleApiRequest('/api/v1/ecc/pipeline/execute', 'POST');
    assert.strictEqual(execReq.status, 200, 'POST /api/v1/ecc/pipeline/execute must return 200');
    assert.strictEqual(execReq.data.totalStages, 7, 'Pipeline must execute 7 stages');
    assert.strictEqual(execReq.data.passedStages, 7, 'All 7 stages must pass');
    assert.strictEqual(execReq.data.status, 'COMPLETED', 'Pipeline status must be COMPLETED');

    const statusReq = engine.handleApiRequest('/api/v1/ecc/pipeline/status');
    assert.strictEqual(statusReq.status, 200, 'GET /api/v1/ecc/pipeline/status must return 200');
    assert.strictEqual(statusReq.data.status, 'COMPLETED', 'Status endpoint must return COMPLETED status');

    const notFoundReq = engine.handleApiRequest('/api/v1/ecc/unknown');
    assert.strictEqual(notFoundReq.status, 404, 'Unknown endpoint must return 404');

    const directPipelineResult = engine.executeGovernedPipeline();
    assert.strictEqual(directPipelineResult.totalStages, 7, 'Direct execution must run 7 stages');
    assert.strictEqual(directPipelineResult.passedStages, 7, 'All 7 stages must pass in direct execution');
    assert.strictEqual(directPipelineResult.governanceVerdict, 'CERTIFIED_FOR_PRODUCTION_RELEASE', 'Governance verdict must be certified');

    console.log('    ✓ REST API endpoints and 7-stage governed pipeline execution verified');

    console.log('\n================================================================');
    console.log('  ENTERPRISE COMMAND CENTER SUITE PASSED');
    console.log('================================================================\n');
}

if (require.main === module) {
    runEnterpriseCommandCenterTests().catch(err => {
        console.error('Enterprise Command Center test failed:', err);
        process.exit(1);
    });
}

module.exports = runEnterpriseCommandCenterTests;
