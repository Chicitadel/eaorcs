/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS EEOS Master Certification Test Suite
 * File           : eaorcs_corp_eeos_master.test.js
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
 * CORP: Subsystem 4 — EEOS Master Certification & Packaging
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
const fs = require('fs');
const path = require('path');
const http = require('http');

const RepositoryIntelligenceEngine = require('../../engine/intelligence/RepositoryIntelligenceEngine');
const EEOSEngine = require('../../engine/enterprise/EEOSEngine');

function httpRequest(urlStr, options = {}, body = null) {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(urlStr);
        const reqOpts = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port,
            path: parsedUrl.pathname + parsedUrl.search,
            method: options.method || 'GET',
            headers: options.headers || {}
        };

        const req = http.request(reqOpts, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk.toString(); });
            res.on('end', () => {
                let parsed = null;
                try { parsed = JSON.parse(data); } catch (e) { parsed = data; }
                resolve({ statusCode: res.statusCode, headers: res.headers, body: parsed });
            });
        });

        req.on('error', reject);
        if (body) {
            req.write(typeof body === 'string' ? body : JSON.stringify(body));
        }
        req.end();
    });
}

async function runEEOSMasterSuite() {
    console.log('================================================================');
    console.log('  EAORCS CORP EEOS MASTER CERTIFICATION SUITE');
    console.log('  Subsystem 4 — Enterprise Engineering Operating System (EEOS)');
    console.log('================================================================\n');

    const rootDir = path.resolve(__dirname, '../../');

    // 1. RepositoryIntelligenceEngine Test
    console.log('[1/7] Testing RepositoryIntelligenceEngine...');
    const repoIntel = new RepositoryIntelligenceEngine(rootDir);
    const analysis = repoIntel.analyzeRepository();

    assert.ok(analysis, 'Repository analysis object must exist');
    assert.ok(analysis.metrics.totalFiles > 0, 'Total files should be > 0');
    assert.ok(analysis.metrics.totalLines > 0, 'Total lines should be > 0');
    assert.ok(analysis.summary.healthIndex >= 0, 'Health index should be computed');
    assert.ok(analysis.contracts.manifests, 'Contract manifests list must exist');
    assert.ok(analysis.technicalDebt.summary, 'Technical debt summary must exist');
    assert.ok(analysis.graph.nodes, 'Graph nodes must exist');
    assert.ok(analysis.graph.edges, 'Graph edges must exist');

    console.log(`    ✓ Codebase Analysis: ${analysis.metrics.totalFiles} files (${analysis.metrics.totalLines} LOC) across ${Object.keys(analysis.metrics.subsystemStats).length} subsystems`);
    console.log(`    ✓ Health Index: ${analysis.summary.healthIndex} / 100 (Status: ${analysis.summary.status})`);

    // AI Assistant Query via RepositoryIntelligenceEngine
    const aiDiag = repoIntel.queryIntelligence('Diagnose platform bottlenecks and missing documentation');
    assert.strictEqual(aiDiag.intent, 'BOTTLENECK_DIAGNOSIS');
    assert.ok(Array.isArray(aiDiag.remediation), 'Remediation list must be array');
    console.log('    ✓ AI Assistant Query Diagnosis verified');

    // 2. EEOSEngine Workspaces Aggregation (All 5 Workspaces)
    console.log('\n[2/7] Testing EEOSEngine 5-Workspace Aggregation...');
    const eeos = new EEOSEngine({ workspace: rootDir, port: 8094, role: 'Architect' });
    const fullState = eeos.aggregateWorkspaceState();

    assert.ok(fullState.workspaces, 'Workspaces object must exist');
    const ws = fullState.workspaces;
    assert.ok(ws.missionControl, 'Workspace 1: Mission Control missing');
    assert.ok(ws.federationExplorer, 'Workspace 2: Federation Explorer missing');
    assert.ok(ws.repositoryExplorer, 'Workspace 3: Repository Explorer missing');
    assert.ok(ws.executionStudio, 'Workspace 4: Execution Studio missing');
    assert.ok(ws.digitalTwinStudio, 'Workspace 5: Digital Twin Studio missing');

    assert.strictEqual(ws.missionControl.title, '1. Mission Control');
    assert.strictEqual(ws.federationExplorer.title, '2. Federation Explorer');
    assert.strictEqual(ws.repositoryExplorer.title, '3. Repository Explorer');
    assert.strictEqual(ws.executionStudio.title, '4. Execution Studio');
    assert.strictEqual(ws.digitalTwinStudio.title, '5. Digital Twin Studio');
    console.log('    ✓ All 5 EEOS Workspaces aggregated successfully');

    // 3. AI Assistant Queries & Diagnostics
    console.log('\n[3/7] Testing AI Assistant queries & intent matching...');
    const intentsToTest = [
        { query: 'Why is performance sluggish and slow?', expected: 'BOTTLENECK_DIAGNOSIS' },
        { query: 'Which execution stream is currently blocked or pending?', expected: 'STREAM_STATUS' },
        { query: 'Are there missing docs or missing corporate headers?', expected: 'DOCUMENTATION_GAP' },
        { query: 'Show me technical debt items and TODO annotations', expected: 'TECH_DEBT' },
        { query: 'Verify platform contracts and compliance manifests', expected: 'CONTRACT_VERIFICATION' }
    ];

    for (const item of intentsToTest) {
        const res = repoIntel.queryIntelligence(item.query, { analysis });
        assert.strictEqual(res.intent, item.expected, `Query "${item.query}" should resolve to intent ${item.expected}`);
    }
    console.log('    ✓ AI Assistant natural language intent classification verified (5/5 intents)');

    // 4. Ctrl+K Universal Search Index
    console.log('\n[4/7] Testing Ctrl+K Universal Search Index...');
    const searchIdx = eeos.buildSearchIndex();
    assert.ok(Array.isArray(searchIdx), 'Search index must be an array');
    assert.ok(searchIdx.length > 0, 'Search index must contain elements');

    const searchRes = eeos.search('Mission Control');
    assert.ok(searchRes.totalResults > 0, 'Search for "Mission Control" must return results');
    assert.ok(searchRes.results.some(r => r.category === 'WORKSPACE'), 'Search results must include workspace category');
    console.log(`    ✓ Universal Search Index built (${searchIdx.length} items, query returns ${searchRes.totalResults} results)`);

    // 5. Role Views (6 Governance Roles)
    console.log('\n[5/7] Testing 6 Role-Based Views...');
    const roles = ['Architect', 'Developer', 'QA', 'Operations', 'Executive', 'Customer'];
    for (const role of roles) {
        const roleView = eeos.getRoleView(role);
        assert.strictEqual(roleView.requestedRole, role);
        assert.strictEqual(roleView.viewProfile.role, role);
        assert.ok(roleView.viewProfile.primaryWorkspace, `Role ${role} must have a primary workspace`);
        assert.ok(Array.isArray(roleView.viewProfile.focusedPanels), `Role ${role} must have focused panels`);
        assert.ok(Array.isArray(roleView.viewProfile.actionPermissions), `Role ${role} must have action permissions`);
    }
    console.log('    ✓ All 6 governance role views verified (Architect, Developer, QA, Operations, Executive, Customer)');

    // 6. REST API Endpoints Verification
    console.log('\n[6/7] Testing Native HTTP Server & REST API Endpoints...');
    const testPort = 8094;
    const serverControl = await eeos.startServer(testPort);
    assert.strictEqual(serverControl.status, 'RUNNING');
    const baseUrl = `http://localhost:${testPort}`;

    try {
        // GET /api/eeos/status
        const statusRes = await httpRequest(`${baseUrl}/api/eeos/status`);
        assert.strictEqual(statusRes.statusCode, 200);
        assert.strictEqual(statusRes.body.status, 'SUCCESS');
        assert.ok(statusRes.body.state.workspaces.missionControl);

        // GET /api/eeos/intelligence
        const intelRes = await httpRequest(`${baseUrl}/api/eeos/intelligence`);
        assert.strictEqual(intelRes.statusCode, 200);
        assert.strictEqual(intelRes.body.status, 'SUCCESS');
        assert.ok(intelRes.body.analysis.metrics);

        // GET /api/eeos/federation
        const fedRes = await httpRequest(`${baseUrl}/api/eeos/federation`);
        assert.strictEqual(fedRes.statusCode, 200);
        assert.strictEqual(fedRes.body.status, 'SUCCESS');
        assert.strictEqual(fedRes.body.federation.title, '2. Federation Explorer');

        // GET /api/eeos/repository
        const repoRes = await httpRequest(`${baseUrl}/api/eeos/repository`);
        assert.strictEqual(repoRes.statusCode, 200);
        assert.strictEqual(repoRes.body.status, 'SUCCESS');

        // GET /api/eeos/digital-twin
        const dtRes = await httpRequest(`${baseUrl}/api/eeos/digital-twin`);
        assert.strictEqual(dtRes.statusCode, 200);
        assert.strictEqual(dtRes.body.status, 'SUCCESS');

        // POST /api/eeos/ai-assistant
        const aiRes = await httpRequest(`${baseUrl}/api/eeos/ai-assistant`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, { prompt: 'Diagnose stream status' });
        assert.strictEqual(aiRes.statusCode, 200);
        assert.strictEqual(aiRes.body.status, 'SUCCESS');

        // GET /api/eeos/search?q=status
        const searchApiRes = await httpRequest(`${baseUrl}/api/eeos/search?q=status`);
        assert.strictEqual(searchApiRes.statusCode, 200);
        assert.strictEqual(searchApiRes.body.status, 'SUCCESS');

        // POST /api/eeos/execute (run-simulation)
        const execRes = await httpRequest(`${baseUrl}/api/eeos/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, { command: 'run-simulation' });
        assert.strictEqual(execRes.statusCode, 200);
        assert.strictEqual(execRes.body.status, 'SUCCESS');
        assert.strictEqual(execRes.body.execution.output.status, 'SIMULATION_PASSED');

        console.log('    ✓ All 8 REST API endpoints verified successfully');

    } finally {
        await eeos.stopServer();
        console.log('    ✓ HTTP Server stopped cleanly');
    }

    // 7. 7-Stage Governed Pipeline Execution
    console.log('\n[7/7] Testing 7-Stage Governed Pipeline Execution...');
    const pipelineResult = eeos.executeGovernedPipeline();
    assert.strictEqual(pipelineResult.status, 'COMPLETED');
    assert.strictEqual(pipelineResult.totalStages, 7);
    assert.strictEqual(pipelineResult.passedStages, 7);
    assert.strictEqual(pipelineResult.stages.length, 7);
    assert.strictEqual(pipelineResult.governanceVerdict, 'CERTIFIED_FOR_PRODUCTION_RELEASE');

    for (let i = 0; i < 7; i++) {
        assert.strictEqual(pipelineResult.stages[i].stage, i + 1);
        assert.strictEqual(pipelineResult.stages[i].status, 'PASSED');
    }
    console.log('    ✓ 7-Stage Governed Pipeline Execution verified (7/7 stages passed)\n');

    console.log('================================================================');
    console.log('  SUCCESS: EEOS MASTER SUITE CERTIFICATION PASSED');
    console.log('================================================================\n');
}

if (require.main === module) {
    runEEOSMasterSuite().catch(err => {
        console.error('EEOS Master certification test failed:', err);
        process.exit(1);
    });
}

module.exports = runEEOSMasterSuite;
