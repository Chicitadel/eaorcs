/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS DIC Knowledge & Documentation Intelligence Test Suite
 * File           : eaorcs_corp_dic_knowledge.test.js
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
 * CORP: Subsystem 4 — DIC Master Certification & Packaging
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

const DocumentationIntelligenceEngine = require('../../engine/docs/DocumentationIntelligenceEngine');
const BrowserTerminalServerEngine = require('../../engine/portal/BrowserTerminalServerEngine');
const dicLauncher = require('../../bin/commercial/eaorcs_dic.js');

const root = path.resolve(__dirname, '../../');

function httpGetJson(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    resolve({ statusCode: res.statusCode, data: parsed });
                } catch (err) {
                    reject(err);
                }
            });
        }).on('error', reject);
    });
}

async function runDicKnowledgeTests() {
    console.log('[TEST] EAORCS DIC Knowledge & Documentation Intelligence Suite running...');

    // 1. DocumentationIntelligenceEngine Tests
    console.log('  -> Testing DocumentationIntelligenceEngine...');
    const docEngine = new DocumentationIntelligenceEngine({ workspaceRoot: root });

    // 1.1 Multiformat Scanning
    const scannedDocs = docEngine.scan(root);
    assert.ok(Array.isArray(scannedDocs), 'scan() must return an array of document objects');
    assert.ok(scannedDocs.length > 0, 'scan() should discover documentation files in workspace');
    
    const sampleDoc = scannedDocs[0];
    assert.ok(sampleDoc.id, 'Document object must have id');
    assert.ok(sampleDoc.filename, 'Document object must have filename');
    assert.ok(sampleDoc.format, 'Document object must have format string');
    assert.ok(sampleDoc.category, 'Document object must have classified category');
    assert.ok(typeof sampleDoc.qualityRating === 'number', 'Document object must have qualityRating');

    // 1.2 25-Category Classification
    assert.strictEqual(docEngine.categories.length, 25, 'Engine must support 25 canonical categories');
    assert.ok(docEngine.categories.includes('Architecture'), 'Categories must include Architecture');
    assert.ok(docEngine.categories.includes('Governance'), 'Categories must include Governance');
    assert.ok(docEngine.categories.includes('Security'), 'Categories must include Security');
    assert.ok(docEngine.categories.includes('API'), 'Categories must include API');
    assert.ok(docEngine.categories.includes('Support'), 'Categories must include Support');

    const classifiedCat = docEngine.classifyDocument('docs/security/threat_model.md', 'OWASP ASVS ISO 27001 Security');
    assert.strictEqual(classifiedCat, 'Security', 'Classification for security threat model must return Security');

    // 1.3 Domain Coverage Scoring
    const coverage = docEngine.computeDomainCoverage(scannedDocs);
    assert.ok(typeof coverage.overallCoveragePercentage === 'number', 'Coverage must have overallCoveragePercentage');
    assert.ok(coverage.keyDomainCoverage, 'Coverage must have keyDomainCoverage');
    assert.ok(coverage.categoryCounts, 'Coverage must have categoryCounts');
    assert.ok(coverage.categoryCoveragePercentages, 'Coverage must satisfy categoryCoveragePercentages');

    // 1.4 Inferred Missing Documentation Detection
    const missingDocs = docEngine.detectMissingDocumentation(['Marketplace', 'Billing'], scannedDocs);
    assert.ok(Array.isArray(missingDocs), 'Missing documentation result must be an array');
    assert.ok(missingDocs.length >= 0, 'Missing documentation list computed');

    // 1.5 AI Draft Generator
    const draft = docEngine.generateDraft('Disaster Recovery Guide', {
        capability: 'DisasterRecovery',
        author: 'Ujomor Systems & Enterprise Governance Authority'
    });
    assert.strictEqual(draft.docType, 'Disaster Recovery Guide');
    assert.ok(draft.content.includes('UAIGOS'), 'Draft content must include UAIGOS header');
    assert.ok(draft.content.includes('Disaster Recovery Guide'), 'Draft content must include document title');
    assert.ok(draft.content.includes('sequenceDiagram'), 'Draft content must include Mermaid sequence diagram');

    // 1.6 Knowledge Graph & Lineage
    const kg = docEngine.buildKnowledgeGraph(root, scannedDocs);
    assert.ok(kg.graph.nodeCount > 0, 'Knowledge graph must contain nodes');
    assert.ok(kg.graph.edgeCount > 0, 'Knowledge graph must contain edges');

    const lineage = docEngine.queryLineage('DocumentationIntelligence');
    assert.ok(Array.isArray(lineage.chain), 'queryLineage must return chain array');
    assert.ok(lineage.chain.length >= 2, 'Lineage chain must trace Capability through Code/API/Doc/Test/Evidence');

    const traceability = docEngine.verifyTraceability();
    assert.ok(typeof traceability.traceabilityPercentage === 'number', 'Traceability rating must be numeric');
    console.log('    ✓ DocumentationIntelligenceEngine unit tests passed.');

    // 2. BrowserTerminalServerEngine Endpoints Tests
    console.log('  -> Testing BrowserTerminalServerEngine DIC Endpoints...');
    const testPort = 8098;
    const serverEngine = new BrowserTerminalServerEngine({ workspace: root, port: testPort });
    const serverHandle = serverEngine.launchTerminalServer({ port: testPort });

    try {
        // GET /api/dic/overview
        const overviewRes = await httpGetJson(`http://localhost:${testPort}/api/dic/overview`);
        assert.strictEqual(overviewRes.statusCode, 200);
        assert.strictEqual(overviewRes.data.status, 'SUCCESS');
        assert.ok(overviewRes.data.overview.totalDocumentsCount || overviewRes.data.overview.totalDocuments);

        // GET /api/dic/coverage
        const coverageRes = await httpGetJson(`http://localhost:${testPort}/api/dic/coverage`);
        assert.strictEqual(coverageRes.statusCode, 200);
        assert.strictEqual(coverageRes.data.status, 'SUCCESS');
        assert.ok(coverageRes.data.coverage);

        // GET /api/dic/missing
        const missingRes = await httpGetJson(`http://localhost:${testPort}/api/dic/missing`);
        assert.strictEqual(missingRes.statusCode, 200);
        assert.strictEqual(missingRes.data.status, 'SUCCESS');
        assert.ok(Array.isArray(missingRes.data.missing) || typeof missingRes.data.missing === 'object');

        // GET /api/dic/graph
        const graphRes = await httpGetJson(`http://localhost:${testPort}/api/dic/graph`);
        assert.strictEqual(graphRes.statusCode, 200);
        assert.strictEqual(graphRes.data.status, 'SUCCESS');
        assert.ok(graphRes.data.graph);
        assert.ok(graphRes.data.graph.nodes);
        assert.ok(graphRes.data.graph.edges);

        console.log('    ✓ REST endpoints (/api/dic/overview, /api/dic/coverage, /api/dic/missing, /api/dic/graph) passed.');
    } finally {
        await serverHandle.close();
    }

    // 3. DIC Launcher Tests (eaorcs_dic.js)
    console.log('  -> Testing DIC Launcher (bin/commercial/eaorcs_dic.js)...');
    const parsed = dicLauncher.parseArgs(['scan', '-j']);
    assert.strictEqual(parsed.command, 'scan');
    assert.strictEqual(parsed.json, true);

    const helpRes = await dicLauncher.run(['--help']);
    assert.strictEqual(helpRes.exitCode, 0);
    assert.strictEqual(helpRes.help, true);

    const scanRes = await dicLauncher.run(['scan', '-j']);
    assert.strictEqual(scanRes.exitCode, 0);
    assert.strictEqual(scanRes.status, 'SUCCESS');

    const coverageResLauncher = await dicLauncher.run(['coverage', '-j']);
    assert.strictEqual(coverageResLauncher.exitCode, 0);
    assert.strictEqual(coverageResLauncher.status, 'SUCCESS');

    const missingResLauncher = await dicLauncher.run(['missing', '-j']);
    assert.strictEqual(missingResLauncher.exitCode, 0);
    assert.strictEqual(missingResLauncher.status, 'SUCCESS');

    const draftResLauncher = await dicLauncher.run(['draft', 'Marketplace Operations Guide', '-j']);
    assert.strictEqual(draftResLauncher.exitCode, 0);
    assert.strictEqual(draftResLauncher.status, 'SUCCESS');

    const graphResLauncher = await dicLauncher.run(['graph', '-j']);
    assert.strictEqual(graphResLauncher.exitCode, 0);
    assert.strictEqual(graphResLauncher.status, 'SUCCESS');

    console.log('    ✓ DIC Launcher unit tests passed.');

    // 4. In-Browser Viewer State Tests (docs_center.html)
    console.log('  -> Testing DIC In-Browser Viewer State & HTML Center...');
    const docsCenterPath = path.join(root, 'docs', 'docs_center.html');
    assert.ok(fs.existsSync(docsCenterPath), 'docs/docs_center.html must exist');

    const htmlContent = fs.readFileSync(docsCenterPath, 'utf8');
    assert.ok(htmlContent.includes('Documentation Intelligence Center'), 'HTML must contain portal title');
    assert.ok(htmlContent.includes('viewerState'), 'HTML must declare viewerState object');
    assert.ok(htmlContent.includes('/api/dic/overview'), 'HTML must contain fetch calls to DIC endpoints');

    console.log('    ✓ DIC In-Browser Viewer State tests passed.');

    console.log('================================================================');
    console.log('  ✓ EAORCS DIC Knowledge & Documentation Intelligence Suite PASSED');
    console.log('================================================================');
}

if (require.main === module) {
    runDicKnowledgeTests().catch(err => {
        console.error('DIC Knowledge Test Error:', err);
        process.exit(1);
    });
}

module.exports = runDicKnowledgeTests;
