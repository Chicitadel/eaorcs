/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Traceability & Drift Test Suite
 * File           : traceability_drift.test.js
 * Version        : 2026.1.0-LTS
 * Author         : Enterprise Architecture Governance Committee & Ujomor Systems
 * Organization   : Ujomor Systems Engineering
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : GOVERNMENT | ENTERPRISE | INTERNAL
 *
 * Governance:
 * - Corporate Governed
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Ujomor Systems Engineering
 * All Rights Reserved.
 ******************************************************************************/

const assert = require('assert');
const path = require('path');
const fs = require('fs');

// Import all 8 Engines
const RequirementMatrix = require('../../engine/traceability/RequirementMatrix');
const FeatureMatrix = require('../../engine/traceability/FeatureMatrix');
const ApiMatrix = require('../../engine/traceability/ApiMatrix');
const TestMatrix = require('../../engine/traceability/TestMatrix');
const IntentAnalyzer = require('../../engine/drift/IntentAnalyzer');
const BusinessDriftDetector = require('../../engine/drift/BusinessDriftDetector');
const MissingFeatureEngine = require('../../engine/drift/MissingFeatureEngine');
const ExtraFeatureEngine = require('../../engine/drift/ExtraFeatureEngine');

async function runTestSuite() {
    console.log('======================================================================');
    console.log(' EAORCS Streams C & D: Traceability & Business Drift Test Suite');
    console.log('======================================================================\n');

    let passedTests = 0;
    let totalTests = 0;

    function test(name, fn) {
        totalTests++;
        try {
            fn();
            passedTests++;
            console.log(`  [PASS] ${name}`);
        } catch (err) {
            console.error(`  [FAIL] ${name}`);
            console.error(`         ${err.message}`);
            throw err;
        }
    }

    // -------------------------------------------------------------------------
    // TEST 1: RequirementMatrix - N-Way Traceability
    // -------------------------------------------------------------------------
    console.log('\n--- 1. RequirementMatrix Engine ---');
    
    test('RequirementMatrix: Map requirement and verify 7-stage chain', () => {
        const reqMatrix = new RequirementMatrix();
        
        // Map complete chain for REQ-AUDIT-001
        const chain = reqMatrix.mapRequirement('REQ-AUDIT-001', {
            title: 'Automated Audit Engine',
            description: 'Performs deterministic architectural audit of codebase',
            domain: 'AUDIT',
            feature: ['FEAT-AUDIT-01', 'FEAT-AUDIT-02'],
            code: ['engine/ExecutionGraph.js', 'engine/traceability/RequirementMatrix.js'],
            test: ['tests/spec/traceability_drift.test.js'],
            evidence: ['evidence/EVID-AUDIT-001.json'],
            deploy: ['deploy/production.yaml'],
            cert: ['certifications/ISO27001.json']
        });

        assert.strictEqual(chain.reqId, 'REQ-AUDIT-001');
        assert.strictEqual(chain.isComplete, true, 'REQ-AUDIT-001 should have a 100% complete chain');
        assert.strictEqual(chain.coveragePercent, 100);
        assert.strictEqual(chain.chain.feature.length, 2);
        assert.strictEqual(chain.chain.code.length, 2);
    });

    test('RequirementMatrix: Evaluate coverage with complete and incomplete chains', () => {
        const reqMatrix = new RequirementMatrix();
        
        reqMatrix.mapRequirement('REQ-001', {
            feature: 'FEAT-01',
            code: 'engine/RequirementMatrix.js',
            test: 'tests/spec.js',
            evidence: 'evid.json',
            deploy: 'deploy.yaml',
            cert: 'cert.json'
        });

        // Incomplete chain: missing deploy and cert
        reqMatrix.mapRequirement('REQ-002', {
            feature: 'FEAT-02',
            code: 'engine/FeatureMatrix.js',
            test: 'tests/spec.js'
        });

        const coverage = reqMatrix.evaluateCoverage();
        assert.strictEqual(coverage.totalRequirements, 2);
        assert.strictEqual(coverage.fullyTracedRequirements, 1);
        assert.strictEqual(coverage.partiallyTracedRequirements, 1);
        assert.strictEqual(coverage.overallCoveragePercent, 50);
        assert.strictEqual(coverage.brokenChains.length, 1);
        assert.strictEqual(coverage.brokenChains[0].reqId, 'REQ-002');

        const report = reqMatrix.generateMatrixReport();
        assert.ok(report.markdown.includes('Stage Coverage Breakdown'));
        assert.ok(report.markdown.includes('REQ-001'));
    });

    // -------------------------------------------------------------------------
    // TEST 2: FeatureMatrix - Feature to Code Mapping
    // -------------------------------------------------------------------------
    console.log('\n--- 2. FeatureMatrix Engine ---');

    test('FeatureMatrix: Register features and link code files', () => {
        const featMatrix = new FeatureMatrix();

        featMatrix.registerFeature('FEAT-TRACE-01', 'Traceability Matrix Engine', ['REQ-AUDIT-001']);
        featMatrix.linkCodeToFeature('FEAT-TRACE-01', [
            'engine/traceability/RequirementMatrix.js',
            'engine/traceability/FeatureMatrix.js'
        ]);

        const coverage = featMatrix.getFeatureCoverage();
        assert.strictEqual(coverage.totalFeatures, 1);
        assert.strictEqual(coverage.mappedFeatures, 1);
        assert.strictEqual(coverage.featureCoveragePercent, 100);

        const mappedFeatures = featMatrix.getFeaturesForCode('engine/traceability/RequirementMatrix.js');
        assert.deepStrictEqual(mappedFeatures, ['FEAT-TRACE-01']);
    });

    // -------------------------------------------------------------------------
    // TEST 3: ApiMatrix - 7-Layer API Verification
    // -------------------------------------------------------------------------
    console.log('\n--- 3. ApiMatrix Engine ---');

    test('ApiMatrix: Register API and verify 7-layer verification chain', () => {
        const apiMatrix = new ApiMatrix({ verifyPhysicalFiles: false });

        apiMatrix.registerApi('/api/v1/traceability/evaluate', 'POST', {
            openApi: 'schemas/openapi.json#POST_/api/v1/traceability/evaluate',
            controller: 'api/controllers/TraceabilityController.js',
            service: 'engine/traceability/RequirementMatrix.js',
            repository: 'storage/repositories/TraceabilityRepository.js',
            db: 'tables:traceability_matrices',
            test: 'tests/spec/traceability_drift.test.js',
            evidence: 'evidence/api_trace_001.json'
        });

        const verification = apiMatrix.verifyChain('/api/v1/traceability/evaluate', 'POST');
        assert.strictEqual(verification.isValid, true);
        assert.strictEqual(verification.status, 'CONNECTED');
        assert.strictEqual(verification.missingLayers.length, 0);

        const exported = apiMatrix.exportApiMatrix();
        assert.strictEqual(exported.totalApis, 1);
        assert.strictEqual(exported.fullyConnectedApis, 1);
        assert.strictEqual(exported.connectionRatePercent, 100);
    });

    test('ApiMatrix: Detect disconnections in incomplete API chain', () => {
        const apiMatrix = new ApiMatrix({ verifyPhysicalFiles: false });

        apiMatrix.registerApi('/api/v1/broken', 'GET', {
            openApi: 'schemas/openapi.json',
            controller: 'api/Controller.js'
            // missing service, repository, db, test, evidence
        });

        const disconnections = apiMatrix.detectDisconnections();
        assert.strictEqual(disconnections.length, 1);
        assert.strictEqual(disconnections[0].apiPath, '/api/v1/broken');
        assert.ok(disconnections[0].missingLayers.includes('service'));
    });

    // -------------------------------------------------------------------------
    // TEST 4: TestMatrix - Acceptance Criteria Coverage
    // -------------------------------------------------------------------------
    console.log('\n--- 4. TestMatrix Engine ---');

    test('TestMatrix: Map acceptance criteria to test file and detect untested criteria', () => {
        const testMatrix = new TestMatrix();

        testMatrix.registerCriterion('REQ-001', 'AC-01', 'Verify 7-stage chain completion');
        testMatrix.registerCriterion('REQ-001', 'AC-02', 'Verify missing stage reporting');

        testMatrix.mapCriteriaToTest('REQ-001', 'AC-01', 'tests/spec/traceability_drift.test.js', 'RequirementMatrix test', 'PASSED');

        const untested = testMatrix.getUntestedCriteria();
        assert.strictEqual(untested.length, 1);
        assert.strictEqual(untested[0].criterionId, 'AC-02');

        const stats = testMatrix.evaluateTestCoverage();
        assert.strictEqual(stats.totalCriteria, 2);
        assert.strictEqual(stats.testedCriteria, 1);
        assert.strictEqual(stats.untestedCriteria, 1);
        assert.strictEqual(stats.coveragePercent, 50);
        assert.strictEqual(stats.passRatePercent, 100);
    });

    // -------------------------------------------------------------------------
    // TEST 5: IntentAnalyzer - Specification Token Extraction
    // -------------------------------------------------------------------------
    console.log('\n--- 5. IntentAnalyzer Engine ---');

    test('IntentAnalyzer: Extract intent tokens from spec markdown and AST', () => {
        const analyzer = new IntentAnalyzer();

        const specMarkdown = `
# Blueprint EAORCS v1.1

[TOKEN:REQUIREMENT_NWAY]
[REQ:REQ-TRACE-001]
[FEATURE:RequirementMatrix]
[FEATURE:BusinessDriftDetector]
[ARCH:ZeroDependencies]
[SECURITY:AuthorHeader]

# Requirement REQ-DRIFT-001: Business Drift Detection Engine
`;

        const result = analyzer.analyzeIntent(specMarkdown);
        assert.ok(result.totalTokens >= 6, 'Should extract at least 6 tokens');
        
        const tokens = analyzer.getDesignIntentTokens();
        const reqTokens = analyzer.findTokensByCategory('REQUIREMENT');
        assert.ok(reqTokens.some(t => t.value === 'REQ-TRACE-001'));
        
        const featureTokens = analyzer.findTokensByCategory('FEATURE');
        assert.ok(featureTokens.some(t => t.value === 'RequirementMatrix'));
    });

    // -------------------------------------------------------------------------
    // TEST 6: BusinessDriftDetector - Comparative Drift Evaluation
    // -------------------------------------------------------------------------
    console.log('\n--- 6. BusinessDriftDetector Engine ---');

    test('BusinessDriftDetector: Detect drift and compute drift score', () => {
        const detector = new BusinessDriftDetector();

        const intentTokens = [
            { tokenId: 'REQ:REQ-TRACE-001', category: 'REQUIREMENT', value: 'REQ-TRACE-001' },
            { tokenId: 'REQ:REQ-MISSING-99', category: 'REQUIREMENT', value: 'REQ-MISSING-99' },
            { tokenId: 'FEATURE:RequirementMatrix', category: 'FEATURE', value: 'RequirementMatrix' }
        ];

        const physicalCodeGraph = {
            files: ['engine/traceability/RequirementMatrix.js'],
            symbols: ['RequirementMatrix'],
            mappedRequirements: ['REQ-TRACE-001'],
            unmappedFiles: ['scratch/unmapped_script.js']
        };

        const result = detector.detectDrift(intentTokens, physicalCodeGraph);
        assert.strictEqual(result.totalIntentCount, 3);
        assert.strictEqual(result.verifiedCount, 2);
        assert.strictEqual(result.missingCount, 1);
        assert.strictEqual(result.extraCount, 1);

        const score = detector.computeDriftScore();
        assert.ok(score.driftScore > 0, 'Drift score should reflect missing requirement and extra file');
        assert.ok(score.alignmentScore < 100);

        const report = detector.generateDriftReport();
        assert.ok(report.markdown.includes('Business Drift Audit Report'));
    });

    // -------------------------------------------------------------------------
    // TEST 7: MissingFeatureEngine - Specified vs Implemented
    // -------------------------------------------------------------------------
    console.log('\n--- 7. MissingFeatureEngine Engine ---');

    test('MissingFeatureEngine: Identify missing files and methods', () => {
        const missingEngine = new MissingFeatureEngine();

        const specReqs = [
            {
                reqId: 'REQ-TRACE-001',
                name: 'Requirement Matrix',
                expectedFile: 'engine/traceability/RequirementMatrix.js',
                requiredMethods: ['mapRequirement', 'evaluateCoverage']
            },
            {
                reqId: 'REQ-MISSING-002',
                name: 'Non Existent Engine',
                expectedFile: 'engine/traceability/NonExistent.js',
                requiredMethods: ['doMagic']
            }
        ];

        const codebaseGraph = {
            files: ['engine/traceability/RequirementMatrix.js'],
            methods: ['mapRequirement', 'evaluateCoverage'],
            exports: ['RequirementMatrix']
        };

        const missingList = missingEngine.findMissingFeatures(specReqs, codebaseGraph);
        assert.strictEqual(missingList.length, 1);
        assert.strictEqual(missingList[0].reqId, 'REQ-MISSING-002');
        assert.strictEqual(missingList[0].missingType, 'MISSING_FILE');

        const stats = missingEngine.getMissingFeatureList();
        assert.strictEqual(stats.missingCount, 1);
    });

    // -------------------------------------------------------------------------
    // TEST 8: ExtraFeatureEngine - Ghost Feature Detection
    // -------------------------------------------------------------------------
    console.log('\n--- 8. ExtraFeatureEngine Engine ---');

    test('ExtraFeatureEngine: Identify unauthorized/ghost files and endpoints', () => {
        const extraEngine = new ExtraFeatureEngine();

        const codebaseGraph = {
            files: [
                'engine/traceability/RequirementMatrix.js',
                'engine/secret_backdoor_debug.js'
            ],
            endpoints: [
                '/api/v1/traceability',
                '/api/v1/unauthorized_debug_access'
            ]
        };

        const specReqs = [
            { reqId: 'REQ-TRACE-001', name: 'traceability', expectedFile: 'engine/traceability/RequirementMatrix.js' }
        ];

        const ghostFeatures = extraEngine.findExtraFeatures(codebaseGraph, specReqs);
        assert.strictEqual(ghostFeatures.length, 2);
        assert.ok(ghostFeatures.some(g => g.type === 'GHOST_FILE'));
        assert.ok(ghostFeatures.some(g => g.type === 'UNAUTHORIZED_ENDPOINT'));

        const stats = extraEngine.getGhostFeatureList();
        assert.strictEqual(stats.ghostCount, 2);
        assert.ok(stats.highRiskCount >= 1);
    });

    // -------------------------------------------------------------------------
    // TEST 9: End-to-End Orchestrated Pipeline
    // -------------------------------------------------------------------------
    console.log('\n--- 9. End-to-End Integrated Pipeline Verification ---');

    test('E2E Pipeline: Orchestrate all 8 engines together', () => {
        const reqMatrix = new RequirementMatrix();
        const featMatrix = new FeatureMatrix();
        const apiMatrix = new ApiMatrix({ verifyPhysicalFiles: false });
        const testMatrix = new TestMatrix();
        const analyzer = new IntentAnalyzer();
        const driftDetector = new BusinessDriftDetector();
        const missingEngine = new MissingFeatureEngine();
        const extraEngine = new ExtraFeatureEngine();

        // 1. Analyze Spec Intent
        const specMarkdown = `
[REQ:REQ-AUDIT-001]
[FEATURE:RequirementMatrix]
[FEATURE:FeatureMatrix]
[FEATURE:ApiMatrix]
[FEATURE:TestMatrix]
[FEATURE:IntentAnalyzer]
[FEATURE:BusinessDriftDetector]
[FEATURE:MissingFeatureEngine]
[FEATURE:ExtraFeatureEngine]
[ARCH:ZeroDependencies]
`;
        const intentResult = analyzer.analyzeIntent(specMarkdown);
        assert.strictEqual(intentResult.totalTokens, 10);

        // 2. Build Traceability Chain
        reqMatrix.mapRequirement('REQ-AUDIT-001', {
            title: 'Bidirectional Traceability & Drift System',
            feature: ['FEAT-TRACE', 'FEAT-DRIFT'],
            code: [
                'engine/traceability/RequirementMatrix.js',
                'engine/traceability/FeatureMatrix.js',
                'engine/traceability/ApiMatrix.js',
                'engine/traceability/TestMatrix.js',
                'engine/drift/IntentAnalyzer.js',
                'engine/drift/BusinessDriftDetector.js',
                'engine/drift/MissingFeatureEngine.js',
                'engine/drift/ExtraFeatureEngine.js'
            ],
            test: ['tests/spec/traceability_drift.test.js'],
            evidence: ['evidence/EVID-TRACE-001.json'],
            deploy: ['deploy/eaorcs.yaml'],
            cert: ['certifications/OSAP-PASS.json']
        });

        // 3. Register Features
        featMatrix.registerFeature('FEAT-TRACE', 'Traceability Engine', ['REQ-AUDIT-001']);
        featMatrix.linkCodeToFeature('FEAT-TRACE', [
            'engine/traceability/RequirementMatrix.js',
            'engine/traceability/FeatureMatrix.js',
            'engine/traceability/ApiMatrix.js',
            'engine/traceability/TestMatrix.js'
        ]);

        // 4. Register API Verification Chain
        apiMatrix.registerApi('/api/v1/traceability/chain', 'GET', {
            openApi: 'schemas/openapi.json',
            controller: 'api/TraceabilityController.js',
            service: 'engine/traceability/RequirementMatrix.js',
            repository: 'storage/TraceabilityRepo.js',
            db: 'tables:traceability',
            test: 'tests/spec/traceability_drift.test.js',
            evidence: 'evidence/api_trace.json'
        });

        // 5. Register Acceptance Criteria Test Coverage
        testMatrix.registerCriterion('REQ-AUDIT-001', 'AC-E2E-01', 'All 8 engines execute cleanly end-to-end');
        testMatrix.mapCriteriaToTest('REQ-AUDIT-001', 'AC-E2E-01', 'tests/spec/traceability_drift.test.js', 'E2E Pipeline Test', 'PASSED');

        // 6. Evaluate Physical Codebase Graph for Drift & Missing/Extra Features
        const physicalGraph = {
            files: [
                'engine/traceability/RequirementMatrix.js',
                'engine/traceability/FeatureMatrix.js',
                'engine/traceability/ApiMatrix.js',
                'engine/traceability/TestMatrix.js',
                'engine/drift/IntentAnalyzer.js',
                'engine/drift/BusinessDriftDetector.js',
                'engine/drift/MissingFeatureEngine.js',
                'engine/drift/ExtraFeatureEngine.js'
            ],
            symbols: [
                'RequirementMatrix', 'FeatureMatrix', 'ApiMatrix', 'TestMatrix',
                'IntentAnalyzer', 'BusinessDriftDetector', 'MissingFeatureEngine', 'ExtraFeatureEngine'
            ],
            mappedRequirements: ['REQ-AUDIT-001'],
            hasExternalDependencies: false
        };

        const driftRes = driftDetector.detectDrift(analyzer.getDesignIntentTokens(), physicalGraph);
        const missingRes = missingEngine.findMissingFeatures([{ reqId: 'REQ-AUDIT-001', expectedFile: 'engine/traceability/RequirementMatrix.js' }], physicalGraph);
        const ghostRes = extraEngine.findExtraFeatures(physicalGraph, [{ reqId: 'REQ-AUDIT-001', expectedFile: 'engine/traceability/RequirementMatrix.js' }]);

        assert.strictEqual(driftRes.violationCount, 0);
        assert.strictEqual(missingRes.length, 0);

        console.log(`\n  [SUCCESS] End-to-End Orchestrated Pipeline Passed! Alignment Score: ${driftRes.alignmentScore}%`);
    });

    console.log('\n======================================================================');
    console.log(` SUMMARY: ${passedTests}/${totalTests} Tests Passed (100% Pass Rate)`);
    console.log('======================================================================\n');
}

runTestSuite().catch(err => {
    console.error('\nFatal test runner failure:', err);
    process.exit(1);
});
