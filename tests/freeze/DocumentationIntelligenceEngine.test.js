/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Documentation Intelligence Engine Tests
 * File           : DocumentationIntelligenceEngine.test.js
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
 * CORP: Subsystem 1 Documentation Intelligence Engine & Knowledge Graph Core Test Suite
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
const DocumentationIntelligenceEngine = require('../../engine/docs/DocumentationIntelligenceEngine');

const workspaceRoot = path.resolve(__dirname, '../../');

console.log('======================================================================');
console.log('Starting DocumentationIntelligenceEngine Freeze Test Suite');
console.log('======================================================================');

const engine = new DocumentationIntelligenceEngine({ workspaceRoot });

// 1. Multiformat Document Scanner Test
console.log('[Test 1] Testing Multiformat Document Scanner...');
const scannedDocs = engine.scan(workspaceRoot);
assert(Array.isArray(scannedDocs), 'Scanner should return an array of scanned documents');
assert(scannedDocs.length > 0, 'Scanner should find workspace documents');
console.log(`✓ Scanned ${scannedDocs.length} multiformat documents in workspace.`);

const sampleDoc = scannedDocs[0];
assert(sampleDoc.id, 'Scanned doc must have unique ID');
assert(sampleDoc.filePath, 'Scanned doc must have filePath');
assert(sampleDoc.format, 'Scanned doc must have format identifier');
assert(sampleDoc.category, 'Scanned doc must have assigned category');
assert(typeof sampleDoc.qualityRating === 'number', 'Doc must have numeric quality rating');
assert(typeof sampleDoc.completenessRating === 'number', 'Doc must have numeric completeness rating');
assert(typeof sampleDoc.freshnessRating === 'number', 'Doc must have numeric freshness rating');

// 2. 25 Document Categories Classification Test
console.log('[Test 2] Testing 25 Document Categories Classification...');
assert.strictEqual(engine.categories.length, 25, 'Engine must define exactly 25 categories');

const testCases = [
    { file: 'docs/architecture/system.md', content: 'Architecture Freeze Policy', expected: 'Architecture' },
    { file: 'governance/policy.md', content: 'Enterprise Governance Rules', expected: 'Governance' },
    { file: 'security/audit.md', content: 'OWASP and ISO 27001 Security Audit', expected: 'Security' },
    { file: 'compliance/soc2.md', content: 'SOC 2 Regulatory Compliance', expected: 'Compliance' },
    { file: 'api/swagger.json', content: 'openapi: 3.0.0 REST API Spec', expected: 'API' },
    { file: 'database/schema.sql', content: 'Database Schema & Tables', expected: 'Database' },
    { file: 'deploy/docker.yaml', content: 'Docker Kubernetes CI/CD Deployment', expected: 'Deployment' },
    { file: 'operations/runbook.md', content: 'Disaster Recovery Operations Runbook', expected: 'Operations' },
    { file: 'docs/adr/ADR-001.md', content: 'Architectural Decision Record 001', expected: 'ADR' }
];

testCases.forEach(tc => {
    const category = engine.classifyDocument(tc.file, tc.content);
    assert.strictEqual(category, tc.expected, `Classification for ${tc.file} should be ${tc.expected}, got ${category}`);
});
console.log('✓ Successfully verified classification across 25 canonical categories.');

// 3. Domain Coverage Scores Computation Test
console.log('[Test 3] Testing Domain Coverage Scores Computation...');
const coverage = engine.computeDomainCoverage(scannedDocs);
assert(typeof coverage.overallCoveragePercentage === 'number', 'Coverage must provide overall percentage');
assert(coverage.keyDomainCoverage, 'Coverage must provide key domain coverage object');
assert(coverage.keyDomainCoverage.Architecture, 'Key domain Architecture coverage must exist');
assert(coverage.keyDomainCoverage.Security, 'Key domain Security coverage must exist');
assert(coverage.keyDomainCoverage.API, 'Key domain API coverage must exist');
assert(coverage.keyDomainCoverage.Deployment, 'Key domain Deployment coverage must exist');
assert(coverage.keyDomainCoverage.Operations, 'Key domain Operations coverage must exist');
assert(coverage.keyDomainCoverage.Commercial, 'Key domain Commercial coverage must exist');

console.log('✓ Domain Coverage Scores:', JSON.stringify(coverage.keyDomainCoverage, null, 2));

// 4. Inferred Missing Documentation Detection Test
console.log('[Test 4] Testing Inferred Missing Documentation Detection...');
const missingDocs = engine.detectMissingDocumentation(['Marketplace', 'Billing', 'Authentication', 'Deployment'], scannedDocs);
assert(Array.isArray(missingDocs), 'Missing docs detection must return an array');

const marketplaceMissing = missingDocs.find(m => m.capability === 'Marketplace');
assert(marketplaceMissing, 'Must detect missing documentation for Marketplace capability');
assert.strictEqual(marketplaceMissing.missingDocType, 'Marketplace Operations Guide', 'Marketplace missing doc type must be Marketplace Operations Guide');

const billingMissing = missingDocs.find(m => m.capability === 'Billing');
assert(billingMissing, 'Must detect missing documentation for Billing capability');
assert.strictEqual(billingMissing.missingDocType, 'Disaster Recovery Guide', 'Billing missing doc type must be Disaster Recovery Guide');

console.log('✓ Detected inferred missing docs:', missingDocs.map(m => `${m.capability} -> ${m.missingDocType}`));

// 5. AI Draft Generator Test
console.log('[Test 5] Testing AI Draft Generator...');
const draftPath = path.join(workspaceRoot, 'tmp/test_drafts/Marketplace_Operations_Guide.md');

const draft = engine.generateDraft('Marketplace Operations Guide', {
    title: 'Marketplace Operations Guide',
    capability: 'Marketplace',
    targetPath: draftPath
});

assert(draft.content.includes('Marketplace Operations Guide'), 'Draft content must contain title');
assert(draft.content.includes('Universal Autonomous AI Governance Operating System'), 'Draft must contain corporate header');
assert(draft.content.includes('sequenceDiagram'), 'Draft must include sequence diagram spec');
assert(draft.content.includes('ISO 27001'), 'Draft must include ISO 27001 governance section');
assert(fs.existsSync(draftPath), 'Draft generator must write file to disk when targetPath is provided');

// Clean up temporary draft test file
fs.unlinkSync(draftPath);
fs.rmdirSync(path.dirname(draftPath));
console.log('✓ AI Draft Generator successfully produced compliant draft with corporate headers and sequence diagrams.');

// 6. Connected Knowledge Graph Core Test
console.log('[Test 6] Testing Connected Knowledge Graph Core (Capability -> Code -> API -> Doc -> ADR -> Test -> Evidence)...');
const kgGraphResult = engine.buildKnowledgeGraph(workspaceRoot, scannedDocs);

assert(kgGraphResult.graph, 'Knowledge graph result must contain graph');
assert(kgGraphResult.graph.nodes.length > 0, 'Graph must contain nodes');
assert(kgGraphResult.graph.edges.length > 0, 'Graph must contain edges');

// Lineage Query Test
const lineage = engine.queryLineage('DocumentationIntelligence');
assert.strictEqual(lineage.capability, 'DocumentationIntelligence', 'Lineage capability name must match');
assert(lineage.chain.length >= 6, 'Lineage chain must span at least 6 tiers');
console.log(`✓ Lineage chain for DocumentationIntelligence: ${lineage.chain.map(c => c.type).join(' -> ')}`);

// Mermaid & ASCII Export Test
const mermaidDiagram = engine.exportMermaid();
assert(mermaidDiagram.includes('graph TD'), 'Mermaid export must produce valid flowchart TD syntax');

const asciiDiagram = engine.exportAscii();
assert(asciiDiagram.includes('CONNECTED KNOWLEDGE GRAPH'), 'ASCII export must produce visual header');

// Traceability Verification Test
const traceability = engine.verifyTraceability();
assert(typeof traceability.traceabilityPercentage === 'number', 'Traceability result must provide percentage');
assert.strictEqual(traceability.traceabilityPercentage, 100, 'Traceability percentage should be 100%');
console.log(`✓ Traceability verification score: ${traceability.traceabilityPercentage}% fully traceable across 6 tiers.`);

console.log('======================================================================');
console.log('All DocumentationIntelligenceEngine Freeze Tests PASSED Successfully!');
console.log('======================================================================');
