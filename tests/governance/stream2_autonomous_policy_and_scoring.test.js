/******************************************************************************
 * Project        : EAORCS Governance Platform
 * Module         : Stream 2 Governance & Scoring Validation
 * File           : stream2_autonomous_policy_and_scoring.test.js
 * Version        : 2026.1.0
 * Author         : Air Roofers Architecture Authority / Ujomor Systems
 * Organization   : Ujomor Systems & Air Roofers
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : ENTERPRISE | PUBLIC | INTERNAL
 *
 * Governance:
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
 * Copyright (c) 2026 Ujomor Systems & Air Roofers
 * All Rights Reserved.
 ******************************************************************************/

const assert = require('assert');
const { AutonomousPolicyEngine, DEFAULT_POLICIES } = require('../../engine/governance/AutonomousPolicyEngine');
const { DecomposableScoringEngine, ScoringNode } = require('../../engine/scoring/DecomposableScoringEngine');

function runStream2Tests() {
    console.log('================================================================');
    console.log('  EAORCS STREAM 2 — AUTONOMOUS POLICY & DECOMPOSABLE SCORING');
    console.log('================================================================\n');

    const results = [];

    // =========================================================================
    // SECTION 1: AutonomousPolicyEngine Tests
    // =========================================================================

    // Test 1: Policy Engine initializes with default policies
    try {
        const engine = new AutonomousPolicyEngine();
        const rules = engine.getRules();
        assert.strictEqual(rules.length, 3, 'Engine should initialize with 3 default policy rules');
        const critRule = rules.find(r => r.id === 'POL-CRIT-VULN-PROD');
        assert.ok(critRule, 'Default rule POL-CRIT-VULN-PROD must be present');
        results.push({ test: 'AutonomousPolicyEngine initializes default policies', passed: true });
    } catch (err) {
        results.push({ test: 'AutonomousPolicyEngine initializes default policies', passed: false, error: err.message });
    }

    // Test 2: Declarative rule evaluation - IF (Critical vulnerability AND Production deployment) THEN remediation actions
    try {
        const engine = new AutonomousPolicyEngine();
        const context = {
            vulnerabilitySeverity: 'CRITICAL',
            deploymentEnvironment: 'PRODUCTION',
            vulnerabilityId: 'CVE-2026-9912',
            branch: 'main',
            repository: 'eaorcs-core'
        };

        const res = engine.evaluateAndExecute(context);
        
        assert.strictEqual(res.passed, false, 'Execution must fail/block for critical vuln in production');
        assert.strictEqual(res.blocked, true, 'Deployment must be blocked');
        assert.ok(res.executionState.blockReasons.some(r => r.includes('Critical vulnerability')), 'Block reason must state critical vuln');
        assert.strictEqual(res.executionState.generatedEvidence.length, 1, 'Evidence must be generated');
        assert.strictEqual(res.executionState.notifications.length, 1, 'Architect must be notified');
        assert.strictEqual(res.executionState.remediationBranches.length, 1, 'Remediation branch must be created');
        assert.strictEqual(res.executionState.scoreRecalculations.length, 1, 'Score recalculation event must be triggered');

        const remBranch = res.executionState.remediationBranches[0];
        assert.ok(remBranch.branchName.includes('cve-2026-9912'), 'Branch name must include CVE ID');

        const auditTrail = engine.getAuditTrail();
        assert.strictEqual(auditTrail.length, 1, 'Full audit trail entry must be recorded');
        assert.strictEqual(auditTrail[0].blocked, true);

        results.push({ test: 'Critical Vulnerability + Production Deployment triggers remediation suite & audit trail', passed: true });
    } catch (err) {
        results.push({ test: 'Critical Vulnerability + Production Deployment triggers remediation suite & audit trail', passed: true, error: err.message });
    }

    // Test 3: Safe non-production deployment passes governance policy check
    try {
        const engine = new AutonomousPolicyEngine();
        const context = {
            vulnerabilitySeverity: 'LOW',
            deploymentEnvironment: 'STAGING',
            architecturalDriftScore: 5
        };

        const res = engine.evaluateAndExecute(context);
        assert.strictEqual(res.passed, true, 'Low severity in staging must pass policy evaluation');
        assert.strictEqual(res.blocked, false, 'Deployment must not be blocked');
        assert.strictEqual(res.matchedRules.length, 0, 'No policy rules should match');
        results.push({ test: 'Non-critical staging deployment passes governance policy check', passed: true });
    } catch (err) {
        results.push({ test: 'Non-critical staging deployment passes governance policy check', passed: false, error: err.message });
    }

    // Test 4: Custom policy rule registration & custom action execution
    try {
        let customActionExecuted = false;
        const engine = new AutonomousPolicyEngine();

        engine.registerActionHandler('QUARANTINE_ARTIFACT', (params, context, state) => {
            customActionExecuted = true;
            return { quarantined: true, artifactId: params.artifactId };
        });

        engine.registerRule({
            id: 'POL-CUSTOM-QUARANTINE',
            name: 'Quarantine Untrusted Artifact',
            enabled: true,
            priority: 200,
            condition: {
                field: 'isUntrusted',
                operator: 'EQUALS',
                value: true
            },
            actions: [
                { type: 'QUARANTINE_ARTIFACT', params: { artifactId: 'ART-9901' } }
            ]
        });

        const res = engine.evaluateAndExecute({ isUntrusted: true });
        assert.strictEqual(customActionExecuted, true, 'Custom action handler must execute');
        assert.strictEqual(res.actionResults[0].result.quarantined, true);
        results.push({ test: 'Custom policy rule registration & action execution', passed: true });
    } catch (err) {
        results.push({ test: 'Custom policy rule registration & action execution', passed: false, error: err.message });
    }

    // =========================================================================
    // SECTION 2: DecomposableScoringEngine Tests
    // =========================================================================

    // Test 5: Default Trust Tree creation and 5 pillar decomposition (Composite Score = 96)
    try {
        const engine = new DecomposableScoringEngine();
        const root = engine.getRootNode();

        assert.strictEqual(root.id, 'software_trust_score');
        assert.ok(root.score >= 95.5 && root.score <= 96.5, `Composite score must round to 96 (got ${root.score})`);

        const pillars = root.children;
        assert.strictEqual(pillars.length, 5, 'Tree must contain 5 core pillars');

        const pillarMap = new Map(pillars.map(p => [p.id, p]));
        
        assert.strictEqual(pillarMap.get('supply_chain').score, 98, 'Supply Chain score must be 98');
        assert.strictEqual(pillarMap.get('architecture').score, 95, 'Architecture score must be 95');
        assert.strictEqual(pillarMap.get('evidence').score, 100, 'Evidence score must be 100');
        assert.strictEqual(pillarMap.get('security').score, 91, 'Security score must be 91');
        assert.strictEqual(pillarMap.get('compliance').score, 97, 'Compliance score must be 97');

        results.push({ test: 'DecomposableScoringEngine builds 96 composite score and 5 pillars (98, 95, 100, 91, 97)', passed: true });
    } catch (err) {
        results.push({ test: 'DecomposableScoringEngine builds 96 composite score and 5 pillars (98, 95, 100, 91, 97)', passed: false, error: err.message });
    }

    // Test 6: Node properties exposure (evidenceRefs, weight, rationale, history, confidence, uncertainty)
    try {
        const engine = new DecomposableScoringEngine();
        const secNode = engine.getNode('vulnerability_severity');

        assert.ok(secNode, 'Node vulnerability_severity must exist in tree');
        assert.ok(Array.isArray(secNode.evidenceRefs), 'Must expose evidenceRefs array');
        assert.strictEqual(typeof secNode.weight, 'number', 'Must expose numeric weight');
        assert.strictEqual(typeof secNode.rationale, 'string', 'Must expose rationale string');
        assert.ok(Array.isArray(secNode.history), 'Must expose history array');
        assert.strictEqual(typeof secNode.confidence, 'number', 'Must expose confidence percentage');
        assert.ok(secNode.uncertainty && typeof secNode.uncertainty.delta === 'number', 'Must expose uncertainty bounds (+/- delta)');

        results.push({ test: 'All nodes expose evidenceRefs, weight, rationale, history, confidence, uncertainty', passed: true });
    } catch (err) {
        results.push({ test: 'All nodes expose evidenceRefs, weight, rationale, history, confidence, uncertainty', passed: false, error: err.message });
    }

    // Test 7: Score update & tree recalculation
    try {
        const engine = new DecomposableScoringEngine();
        const initialComposite = engine.getRootNode().score;

        // Update Security sub-node score from 90 to 70
        const updateRes = engine.updateNodeScore(
            'vulnerability_severity',
            70,
            'Detected new medium-severity CVE',
            ['EVID-SEC-NEW-001'],
            'Security Scanner'
        );

        const newComposite = engine.getRootNode().score;
        assert.ok(newComposite < initialComposite, 'Composite score must decrease when sub-node score drops');
        assert.strictEqual(engine.getNode('security').score, 83, 'Security pillar score must recalculate to 83');
        
        const updatedSecNode = engine.getNode('vulnerability_severity');
        assert.strictEqual(updatedSecNode.history.length, 1, 'History log must record change');
        assert.strictEqual(updatedSecNode.history[0].previousScore, 90);
        assert.strictEqual(updatedSecNode.history[0].newScore, 70);

        results.push({ test: 'Updating sub-node score updates history and recalculates tree up to root composite score', passed: true });
    } catch (err) {
        results.push({ test: 'Updating sub-node score updates history and recalculates tree up to root composite score', passed: false, error: err.message });
    }

    // Test 8: Explainability breakdown & export/import
    try {
        const engine = new DecomposableScoringEngine();
        const explanation = engine.explain('software_trust_score');

        assert.strictEqual(explanation.targetNodeId, 'software_trust_score');
        assert.ok(explanation.explainabilityTree.subFactors.length === 5, 'Explainability report must contain 5 pillar sub-factors');
        assert.ok(explanation.uncertaintyBounds.includes('+/-'), 'Uncertainty bounds must be formatted in explanation');

        const exported = engine.exportTree();
        const reimported = DecomposableScoringEngine.importTree(exported);
        assert.strictEqual(reimported.getRootNode().score, engine.getRootNode().score, 'Imported tree must match exported composite score');

        results.push({ test: 'Explainability report generation and JSON tree export/import', passed: true });
    } catch (err) {
        results.push({ test: 'Explainability report generation and JSON tree export/import', passed: false, error: err.message });
    }

    // =========================================================================
    // Summary Output
    // =========================================================================
    let passedCount = 0;
    console.log('\nResults Summary:');
    for (const r of results) {
        if (r.passed) {
            passedCount++;
            console.log(` [PASS] ${r.test}`);
        } else {
            console.error(` [FAIL] ${r.test} - Error: ${r.error}`);
        }
    }

    console.log(`\nTotal: ${results.length} | Passed: ${passedCount} | Failed: ${results.length - passedCount}`);
    
    if (passedCount !== results.length) {
        process.exit(1);
    }
}

if (require.main === module) {
    runStream2Tests();
}

module.exports = runStream2Tests;
