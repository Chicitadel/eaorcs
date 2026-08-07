/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS DIC Subsystem Freeze Test Suite
 * File           : eaorcs_dic_subsystem.test.js
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
 * CORP: Subsystem 2 — DIC CLI Launchers & REST API Endpoints
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
const http = require('http');
const EAORCS = require('../../engine/EAORCS');
const DocumentationIntelligenceEngine = require('../../engine/portal/DocumentationIntelligenceEngine');
const BrowserTerminalServerEngine = require('../../engine/portal/BrowserTerminalServerEngine');
const dicLauncher = require('../../bin/commercial/eaorcs_dic');

async function httpGet(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    resolve({ statusCode: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ statusCode: res.statusCode, body });
                }
            });
        }).on('error', reject);
    });
}

async function runTests() {
    console.log('===========================================================');
    console.log(' RUNNING EAORCS DIC SUBSYSTEM VERIFICATION SUITE');
    console.log('===========================================================');

    // 1. Test DocumentationIntelligenceEngine direct API
    console.log('[TEST 1] DocumentationIntelligenceEngine Direct API...');
    const engine = new DocumentationIntelligenceEngine({ workspace: process.cwd() });
    
    const overview = engine.getOverview();
    assert.strictEqual(overview.status, 'SUCCESS');
    assert.ok(overview.overview.totalCapabilitiesDocumented >= 8);
    assert.strictEqual(typeof overview.overview.coveragePercentage, 'number');
    console.log(' -> Overview API passed.');

    const coverage = engine.getCoverage({ category: 'API' });
    assert.strictEqual(coverage.status, 'SUCCESS');
    assert.strictEqual(coverage.categoryFilter, 'API');
    assert.ok(coverage.items.length > 0);
    console.log(' -> Coverage API with category filter passed.');

    const missing = engine.getMissingDocumentation();
    assert.strictEqual(missing.status, 'SUCCESS');
    assert.strictEqual(typeof missing.totalMissing, 'number');
    console.log(' -> Missing Documentation API passed.');

    const graph = engine.getKnowledgeGraph();
    assert.strictEqual(graph.status, 'SUCCESS');
    assert.ok(graph.nodes.length > 0);
    assert.ok(graph.edges.length > 0);
    console.log(' -> Knowledge Graph API passed.');

    const doc = engine.getDocument('API');
    assert.strictEqual(doc.status, 'SUCCESS');
    assert.strictEqual(doc.documentId, 'API');
    assert.ok(doc.document.content.length > 0);
    console.log(' -> Document Fetch API passed.');

    const gen = engine.generateDocumentation();
    assert.strictEqual(gen.status, 'SUCCESS');
    assert.strictEqual(gen.action, 'GENERATE_DOCUMENTATION');
    assert.ok(gen.generatedArtifacts.length >= 3);
    console.log(' -> Document Generation API passed.');

    // 2. Test EAORCS Facade static method
    console.log('\n[TEST 2] EAORCS Public Facade API...');
    const facadeOverview = EAORCS.getDocumentationIntelligence();
    assert.strictEqual(facadeOverview.status, 'SUCCESS');

    const facadeCoverage = EAORCS.getDocumentationIntelligence({ coverage: true, category: 'SECURITY' });
    assert.strictEqual(facadeCoverage.status, 'SUCCESS');
    assert.strictEqual(facadeCoverage.categoryFilter, 'SECURITY');

    const facadeGraph = EAORCS.getDocumentationIntelligence({ graph: true });
    assert.strictEqual(facadeGraph.status, 'SUCCESS');
    assert.ok(facadeGraph.metrics.nodeCount > 0);
    console.log(' -> EAORCS facade method getDocumentationIntelligence passed.');

    // 3. Test eaorcs_dic CLI Launcher parseArgs & run
    console.log('\n[TEST 3] eaorcs_dic CLI Launcher...');
    const parsedArgs = dicLauncher.parseArgs(['--category', 'API', '--coverage', '--json']);
    assert.strictEqual(parsedArgs.category, 'API');
    assert.strictEqual(parsedArgs.coverage, true);
    assert.strictEqual(parsedArgs.json, true);

    const cliOverviewRes = await dicLauncher.run(['--json']);
    assert.strictEqual(cliOverviewRes.exitCode, 0);
    assert.strictEqual(cliOverviewRes.status, 'SUCCESS');

    const cliCoverageRes = await dicLauncher.run(['--coverage', '--category', 'ARCHITECTURE', '--json']);
    assert.strictEqual(cliCoverageRes.exitCode, 0);
    assert.strictEqual(cliCoverageRes.categoryFilter, 'ARCHITECTURE');

    const cliMissingRes = await dicLauncher.run(['--missing', '--json']);
    assert.strictEqual(cliMissingRes.exitCode, 0);

    const cliGraphRes = await dicLauncher.run(['--graph', '--json']);
    assert.strictEqual(cliGraphRes.exitCode, 0);
    assert.ok(cliGraphRes.metrics.nodeCount > 0);
    console.log(' -> eaorcs_dic CLI Launcher execution passed.');

    // 4. Test BrowserTerminalServerEngine REST Endpoints
    console.log('\n[TEST 4] BrowserTerminalServerEngine REST API Endpoints...');
    const serverEngine = new BrowserTerminalServerEngine({ port: 8992 });
    const serverHandle = serverEngine.launchTerminalServer({ port: 8992 });

    try {
        const epOverview = await httpGet('http://localhost:8992/api/dic/overview');
        assert.strictEqual(epOverview.statusCode, 200);
        assert.strictEqual(epOverview.data.status, 'SUCCESS');
        console.log(' -> GET /api/dic/overview passed.');

        const epCoverage = await httpGet('http://localhost:8992/api/dic/coverage?category=API');
        assert.strictEqual(epCoverage.statusCode, 200);
        assert.strictEqual(epCoverage.data.categoryFilter, 'API');
        console.log(' -> GET /api/dic/coverage passed.');

        const epMissing = await httpGet('http://localhost:8992/api/dic/missing');
        assert.strictEqual(epMissing.statusCode, 200);
        assert.strictEqual(epMissing.data.status, 'SUCCESS');
        console.log(' -> GET /api/dic/missing passed.');

        const epGraph = await httpGet('http://localhost:8992/api/dic/graph');
        assert.strictEqual(epGraph.statusCode, 200);
        assert.ok(epGraph.data.metrics.nodeCount > 0);
        console.log(' -> GET /api/dic/graph passed.');

        const epDoc = await httpGet('http://localhost:8992/api/dic/document?docId=API');
        assert.strictEqual(epDoc.statusCode, 200);
        assert.strictEqual(epDoc.data.documentId, 'API');
        console.log(' -> GET /api/dic/document passed.');

        const epGen = await httpGet('http://localhost:8992/api/dic/generate');
        assert.strictEqual(epGen.statusCode, 200);
        assert.strictEqual(epGen.data.action, 'GENERATE_DOCUMENTATION');
        console.log(' -> GET /api/dic/generate passed.');
    } finally {
        await serverHandle.close();
    }

    console.log('===========================================================');
    console.log(' ALL EAORCS DIC SUBSYSTEM VERIFICATION TESTS PASSED (100%)');
    console.log('===========================================================');
}

runTests().catch(err => {
    console.error('TEST FAILURE:', err);
    process.exit(1);
});
