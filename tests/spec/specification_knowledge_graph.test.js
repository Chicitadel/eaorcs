/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Specification & Knowledge Graph Verification Test Suite
 * File           : specification_knowledge_graph.test.js
 * Version        : 2026.1-LTS
 * Author         : Ujomor Systems & Enterprise Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 * - Corporate Policy Governed
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

// Import Streams A & B Engines
const BlueprintDiscoveryEngine = require('../../engine/spec/BlueprintDiscoveryEngine');
const BlueprintParser = require('../../engine/spec/BlueprintParser');
const RequirementParser = require('../../engine/spec/RequirementParser');
const RequirementDsl = require('../../engine/spec/RequirementDsl');

const RequirementGraph = require('../../engine/knowledge/RequirementGraph');
const CodeGraph = require('../../engine/knowledge/CodeGraph');
const TestGraph = require('../../engine/knowledge/TestGraph');
const EvidenceGraph = require('../../engine/knowledge/EvidenceGraph');

async function runTestSuite() {
    console.log('================================================================');
    console.log('  EAORCS STREAMS A & B: SPECIFICATION INTELLIGENCE & KNOWLEDGE  ');
    console.log('  GRAPH ENGINE END-TO-END VERIFICATION SUITE                    ');
    console.log('================================================================\n');

    let totalTestsPassed = 0;

    // -------------------------------------------------------------------------
    // 1. BlueprintDiscoveryEngine Verification
    // -------------------------------------------------------------------------
    console.log('[1/9] Testing BlueprintDiscoveryEngine...');
    const discoveryEngine = new BlueprintDiscoveryEngine();
    
    // Discover specifications within current project directory
    const projectDir = path.resolve(__dirname, '../../');
    const discoveryResult = discoveryEngine.discoverSpecifications(projectDir);

    assert.ok(discoveryResult, 'Discovery result should be defined');
    assert.strictEqual(typeof discoveryResult.total, 'number', 'Total specs count should be a number');
    assert.ok(Array.isArray(discoveryResult.specs), 'Specs property should be an array');
    assert.ok(discoveryResult.total > 0, 'Should discover at least 1 specification file in project');

    const firstSpec = discoveryResult.specs[0];
    assert.ok(firstSpec.path, 'Discovered spec must contain path');
    assert.ok(firstSpec.type, 'Discovered spec must contain categorized type');
    assert.ok(firstSpec.title, 'Discovered spec must contain title');
    assert.strictEqual(typeof firstSpec.size, 'number', 'Discovered spec size must be a number');
    assert.ok(firstSpec.hash && firstSpec.hash.length === 64, 'Discovered spec must contain 64-char SHA-256 hash');

    // Test categorization logic explicitly
    const catSrs = discoveryEngine.categorize('docs/srs_system.md', '# SRS System Document');
    const catOpenApi = discoveryEngine.categorize('api/v1/swagger.json', '{"openapi": "3.0.0"}');
    const catAdr = discoveryEngine.categorize('docs/adr-001.md', '# ADR-001 Architecture');

    assert.strictEqual(catSrs, 'SRS');
    assert.strictEqual(catOpenApi, 'OPENAPI');
    assert.strictEqual(catAdr, 'ADR');

    console.log(`      ✓ BlueprintDiscoveryEngine Passed (Discovered ${discoveryResult.total} specs, categorized successfully)`);
    totalTestsPassed++;

    // -------------------------------------------------------------------------
    // 2. BlueprintParser Verification
    // -------------------------------------------------------------------------
    console.log('[2/9] Testing BlueprintParser...');
    const parser = new BlueprintParser();

    const sampleMarkdown = `
# System Requirements Specification (SRS)

## Section 1: User Authentication
The system MUST authenticate users securely using Ed25519 or JWT tokens.
- Given a valid user token, the system returns status 200.
- When an expired token is provided, the system returns status 401.

\`\`\`javascript
const token = authenticate(user);
\`\`\`

## Section 2: Data Encryption
The system SHALL encrypt all sensitive data at rest using AES-256-GCM.
`;

    const blueprintAst = parser.parseBlueprint({
        type: 'SRS',
        title: 'System Requirements Specification',
        content: sampleMarkdown
    });

    assert.ok(blueprintAst, 'Blueprint AST should be defined');
    assert.ok(blueprintAst.id.startsWith('AST-'), 'AST ID should start with AST-');
    assert.strictEqual(blueprintAst.title, 'System Requirements Specification');
    assert.strictEqual(blueprintAst.type, 'SRS');
    assert.ok(Array.isArray(blueprintAst.sections), 'Sections should be an array');
    assert.strictEqual(blueprintAst.sections.length, 2, 'Should parse 2 sections from markdown headers');
    assert.strictEqual(blueprintAst.sections[0].title, 'Section 1: User Authentication');
    assert.ok(blueprintAst.sections[0].bullets.length >= 2, 'Should capture bullets under Section 1');
    assert.ok(blueprintAst.sections[0].codeBlocks.length >= 1, 'Should capture code blocks under Section 1');

    console.log(`      ✓ BlueprintParser Passed (Generated AST ID: ${blueprintAst.id}, ${blueprintAst.sections.length} sections parsed)`);
    totalTestsPassed++;

    // -------------------------------------------------------------------------
    // 3. RequirementParser Verification
    // -------------------------------------------------------------------------
    console.log('[3/9] Testing RequirementParser...');
    const reqParser = new RequirementParser();

    const extractedReqs = reqParser.extractRequirements(blueprintAst);

    assert.ok(Array.isArray(extractedReqs), 'Extracted requirements should be an array');
    assert.ok(extractedReqs.length >= 2, 'Should extract at least 2 requirements from AST');

    const secReq = extractedReqs.find(r => r.type === 'SECURITY' || r.title.includes('Authentication'));
    assert.ok(secReq, 'Should extract authentication requirement');
    assert.ok(secReq.id, 'Extracted requirement must have id');
    assert.ok(secReq.title, 'Extracted requirement must have title');
    assert.ok(['FUNCTIONAL', 'NON_FUNCTIONAL', 'SECURITY', 'COMPLIANCE'].includes(secReq.type), 'Requirement type must be valid enum');
    assert.ok(secReq.acceptanceCriteria.length > 0, 'Requirement should have acceptance criteria');

    console.log(`      ✓ RequirementParser Passed (${extractedReqs.length} granular requirements extracted)`);
    totalTestsPassed++;

    // -------------------------------------------------------------------------
    // 4. RequirementDsl Verification
    // -------------------------------------------------------------------------
    console.log('[4/9] Testing RequirementDsl...');
    const dslCompiler = new RequirementDsl();

    const sampleDsl = `
REQUIREMENT REQ-SEC-01 TYPE SECURITY PRIORITY HIGH MUST "System shall authenticate all API requests via HMAC-SHA256" ACCEPTANCE "Given a signed request, system validates signature" VERIFIED BY "auth.test.js"
REQUIREMENT REQ-COMP-02 TYPE COMPLIANCE PRIORITY CRITICAL SHALL "Audit trail must log all governance state changes to immutable ledger" ACCEPTANCE "Log entries contain SHA256 hash" VERIFIED BY "audit.test.js"
`;

    const dslResult = dslCompiler.compileDsl(sampleDsl);

    assert.ok(dslResult.ast, 'DSL result should contain AST');
    assert.strictEqual(dslResult.ast.type, 'RequirementDslAST');
    assert.strictEqual(dslResult.ast.statements.length, 2, 'Should compile 2 DSL statements');
    assert.strictEqual(dslResult.canonicalJson.length, 2, 'Should generate 2 canonical JSON requirements');

    const req1 = dslResult.canonicalJson[0];
    assert.strictEqual(req1.id, 'REQ-SEC-01');
    assert.strictEqual(req1.type, 'SECURITY');
    assert.strictEqual(req1.priority, 'HIGH');
    assert.strictEqual(req1.verification, 'auth.test.js');

    console.log(`      ✓ RequirementDsl Passed (Compiled ${dslResult.canonicalJson.length} DSL statements into canonical JSON)`);
    totalTestsPassed++;

    // -------------------------------------------------------------------------
    // 5. RequirementGraph Verification
    // -------------------------------------------------------------------------
    console.log('[5/9] Testing RequirementGraph...');
    const reqGraph = new RequirementGraph();

    const r1 = reqGraph.addRequirement({ id: 'REQ-SEC-01', title: 'API Authentication', type: 'SECURITY', priority: 'HIGH' });
    const r2 = reqGraph.addRequirement({ id: 'REQ-SEC-02', title: 'Token Verification', type: 'SECURITY', priority: 'HIGH' });
    const r3 = reqGraph.addRequirement({ id: 'REQ-AUD-01', title: 'Audit Trail', type: 'COMPLIANCE', priority: 'CRITICAL' });

    assert.strictEqual(reqGraph.getRequirement('REQ-SEC-01').title, 'API Authentication');

    reqGraph.connectRequirements('REQ-SEC-02', 'REQ-SEC-01', 'DEPENDS_ON');
    reqGraph.connectRequirements('REQ-AUD-01', 'REQ-SEC-01', 'DEPENDS_ON');

    const deps = reqGraph.findDependencies('REQ-SEC-02');
    assert.strictEqual(deps.length, 1);
    assert.strictEqual(deps[0].id, 'REQ-SEC-01');
    assert.strictEqual(deps[0].relation, 'DEPENDS_ON');

    const dependents = reqGraph.findDependents('REQ-SEC-01');
    assert.strictEqual(dependents.length, 2);

    const exportedReqGraph = reqGraph.exportGraph();
    assert.strictEqual(exportedReqGraph.nodes.length, 3);
    assert.strictEqual(exportedReqGraph.edges.length, 2);

    console.log(`      ✓ RequirementGraph Passed (Nodes: ${exportedReqGraph.nodes.length}, Edges: ${exportedReqGraph.edges.length})`);
    totalTestsPassed++;

    // -------------------------------------------------------------------------
    // 6. CodeGraph Verification
    // -------------------------------------------------------------------------
    console.log('[6/9] Testing CodeGraph...');
    const codeGraph = new CodeGraph();

    const m1 = codeGraph.addModule('engine/security/Authenticator.js', ['authenticate', 'verifyToken'], ['hashSecret']);
    const m2 = codeGraph.addModule('engine/audit/AuditLogger.js', ['logEvent'], ['writeEntry']);

    assert.strictEqual(codeGraph.getModule('engine/security/Authenticator.js').exports.length, 2);

    codeGraph.connectCodeToReq('engine/security/Authenticator.js', 'REQ-SEC-01');
    codeGraph.connectCodeToReq('engine/security/Authenticator.js', 'REQ-SEC-02');
    codeGraph.connectCodeToReq('engine/audit/AuditLogger.js', 'REQ-AUD-01');

    const modulesForSec01 = codeGraph.getModulesForReq('REQ-SEC-01');
    assert.strictEqual(modulesForSec01.length, 1);
    assert.strictEqual(modulesForSec01[0].path, 'engine/security/Authenticator.js');

    const exportedCodeGraph = codeGraph.exportGraph();
    assert.strictEqual(exportedCodeGraph.modules.length, 2);
    assert.strictEqual(exportedCodeGraph.links.length, 3);

    console.log(`      ✓ CodeGraph Passed (Modules: ${exportedCodeGraph.modules.length}, Code-to-Req Links: ${exportedCodeGraph.links.length})`);
    totalTestsPassed++;

    // -------------------------------------------------------------------------
    // 7. TestGraph Verification
    // -------------------------------------------------------------------------
    console.log('[7/9] Testing TestGraph...');
    const testGraph = new TestGraph();

    const t1 = testGraph.addTest('tests/security/auth.test.js', ['assertValidToken', 'assertInvalidTokenFails']);
    const t2 = testGraph.addTest('tests/audit/audit.test.js', ['assertLogCreated']);

    assert.strictEqual(testGraph.getTest('tests/security/auth.test.js').assertions.length, 2);

    testGraph.connectTestToReq('tests/security/auth.test.js', 'REQ-SEC-01');
    testGraph.connectTestToReq('tests/security/auth.test.js', 'REQ-SEC-02');
    testGraph.connectTestToReq('tests/audit/audit.test.js', 'REQ-AUD-01');

    const testsForSec01 = testGraph.getTestsForReq('REQ-SEC-01');
    assert.strictEqual(testsForSec01.length, 1);
    assert.strictEqual(testsForSec01[0].testPath, 'tests/security/auth.test.js');

    const exportedTestGraph = testGraph.exportGraph();
    assert.strictEqual(exportedTestGraph.tests.length, 2);
    assert.strictEqual(exportedTestGraph.links.length, 3);

    console.log(`      ✓ TestGraph Passed (Tests: ${exportedTestGraph.tests.length}, Test-to-Req Links: ${exportedTestGraph.links.length})`);
    totalTestsPassed++;

    // -------------------------------------------------------------------------
    // 8. EvidenceGraph Verification
    // -------------------------------------------------------------------------
    console.log('[8/9] Testing EvidenceGraph...');
    const evidenceGraph = new EvidenceGraph();

    const e1 = evidenceGraph.addEvidence('EV-001', 'PASSPORT-SEC-2026', 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0');
    const e2 = evidenceGraph.addEvidence('EV-002', 'PASSPORT-AUD-2026', 'f0e9d8c7b6a543210987654321fedcba0987654321fedcba0987654321fedcba');

    assert.strictEqual(evidenceGraph.getEvidence('EV-001').passportId, 'PASSPORT-SEC-2026');

    evidenceGraph.connectEvidenceToReq('EV-001', 'REQ-SEC-01');
    evidenceGraph.connectEvidenceToReq('EV-002', 'REQ-AUD-01');

    const evForSec01 = evidenceGraph.getEvidenceForReq('REQ-SEC-01');
    assert.strictEqual(evForSec01.length, 1);
    assert.strictEqual(evForSec01[0].evidenceId, 'EV-001');

    const exportedEvidenceGraph = evidenceGraph.exportGraph();
    assert.strictEqual(exportedEvidenceGraph.evidence.length, 2);
    assert.strictEqual(exportedEvidenceGraph.links.length, 2);

    console.log(`      ✓ EvidenceGraph Passed (Evidence Nodes: ${exportedEvidenceGraph.evidence.length}, Links: ${exportedEvidenceGraph.links.length})`);
    totalTestsPassed++;

    // -------------------------------------------------------------------------
    // 9. End-to-End Multi-Graph Knowledge Traversal Verification
    // -------------------------------------------------------------------------
    console.log('[9/9] Testing Multi-Graph Cross-Query Traversal...');
    
    // Target Requirement: REQ-SEC-01
    const targetReqId = 'REQ-SEC-01';
    
    // 1. Get Requirement Metadata
    const reqNode = reqGraph.getRequirement(targetReqId);
    assert.ok(reqNode, 'Target requirement must exist in RequirementGraph');

    // 2. Query Code Modules Implementing Requirement
    const codeModules = codeGraph.getModulesForReq(targetReqId);
    assert.ok(codeModules.length > 0, 'Code modules must be linked to target requirement');

    // 3. Query Verification Tests Asserting Requirement
    const verificationTests = testGraph.getTestsForReq(targetReqId);
    assert.ok(verificationTests.length > 0, 'Verification tests must be linked to target requirement');

    // 4. Query Evidence Passports Proving Requirement Compliance
    const evidenceItems = evidenceGraph.getEvidenceForReq(targetReqId);
    assert.ok(evidenceItems.length > 0, 'Evidence items must be linked to target requirement');

    // Synthesize Traceability Matrix Record
    const traceabilityRecord = {
        requirement: reqNode,
        implementations: codeModules.map(m => m.path),
        verifications: verificationTests.map(t => t.testPath),
        proofs: evidenceItems.map(e => ({ evidenceId: e.evidenceId, passportId: e.passportId, hash: e.hash }))
    };

    assert.strictEqual(traceabilityRecord.requirement.id, 'REQ-SEC-01');
    assert.strictEqual(traceabilityRecord.implementations[0], 'engine/security/Authenticator.js');
    assert.strictEqual(traceabilityRecord.verifications[0], 'tests/security/auth.test.js');
    assert.strictEqual(traceabilityRecord.proofs[0].passportId, 'PASSPORT-SEC-2026');

    console.log(`      ✓ Multi-Graph Traversal Passed (Requirement -> Code -> Test -> Evidence 100% Traceable)`);
    totalTestsPassed++;

    console.log('\n================================================================');
    console.log(`  ALL ${totalTestsPassed}/9 STREAMS A & B ENGINES VERIFICATION TESTS PASSED WITH 100% SUCCESS`);
    console.log('================================================================\n');
}

runTestSuite().catch(err => {
    console.error('Test Suite Failed with Error:', err);
    process.exit(1);
});
