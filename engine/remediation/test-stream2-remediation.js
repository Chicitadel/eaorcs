/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : Stream 2 Remediation Engine Test Suite
 * File           : test-stream2-remediation.js
 * Version        : 2026.1-LTS (v1.0.0-FROZEN)
 * Author         : Architectural Governance Council & Ujomor Systems Engineering
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-02
 * Last Modified  : 2026-08-02
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const path = require('path');

console.log('====================================================');
console.log('Testing Stream 2 Remediation Engine Modules Requiring');
console.log('====================================================');

// 1. Require AIRemediationEngine
console.log('\n[1/4] Testing AIRemediationEngine...');
const AIRemediationEngine = require('./AIRemediationEngine');
const remediationEngine = new AIRemediationEngine();

const findingAnalysis = remediationEngine.analyzeFinding({
    ruleId: 'CORS_WILDCARD',
    title: 'Permissive Wildcard Access Control Header',
    service: 'auth-service'
});

assert.strictEqual(findingAnalysis.ruleId, 'CORS_WILDCARD');
assert.strictEqual(findingAnalysis.severity, 'HIGH');
assert.strictEqual(findingAnalysis.category, 'SECURITY');
assert.strictEqual(findingAnalysis.priorityRating, 'P1');
assert.ok(findingAnalysis.rootCause.includes('wildcard'));
assert.ok(findingAnalysis.suggestedConfigs['Access-Control-Allow-Origin']);
console.log('   ✓ AIRemediationEngine single finding analysis passed.');

const plan = remediationEngine.generateRemediationPlan([
    { ruleId: 'CORS_WILDCARD' },
    { ruleId: 'SELECT_STAR_QUERY' },
    { ruleId: 'HARDCODED_SECRET' }
]);
assert.strictEqual(plan.totalFindings, 3);
assert.strictEqual(plan.breakdownByPriority.P0, 1);
assert.strictEqual(plan.breakdownByPriority.P1, 1);
assert.strictEqual(plan.breakdownByPriority.P2, 1);
console.log('   ✓ AIRemediationEngine plan generation passed.');


// 2. Require CodeDiffGenerator
console.log('\n[2/4] Testing CodeDiffGenerator...');
const CodeDiffGenerator = require('./CodeDiffGenerator');
const diffGen = new CodeDiffGenerator();

const corsFix = diffGen.generateCORSFix({
    allowedOrigin: 'https://app.ujomor.com',
    language: 'javascript'
});
assert.ok(corsFix.afterSnippet.includes('https://app.ujomor.com'));
assert.ok(corsFix.diffText.includes('--- a/'));
console.log('   ✓ CodeDiffGenerator CORS fix passed.');

const selectStarFix = diffGen.generateSelectStarFix('users', ['id', 'username', 'email']);
assert.ok(selectStarFix.beforeSnippet.includes('SELECT * FROM users'));
assert.ok(selectStarFix.afterSnippet.includes('SELECT id, username, email FROM users'));
console.log('   ✓ CodeDiffGenerator SELECT * fix passed.');

const cspFix = diffGen.generateCSPNonceFix({ nonceVariable: 'nonce-12345' });
assert.ok(cspFix.afterSnippet.includes('nonce="nonce-12345"'));
console.log('   ✓ CodeDiffGenerator CSP Nonce fix passed.');


// 3. Require PerformanceCostOptimizer
console.log('\n[3/4] Testing PerformanceCostOptimizer...');
const PerformanceCostOptimizer = require('./PerformanceCostOptimizer');
const perfOptimizer = new PerformanceCostOptimizer();

const latency = perfOptimizer.calculateP95LatencySavings({ baselineP95Ms: 450 });
assert.ok(latency.totalLatencySavingsMs > 0);
assert.ok(latency.optimizedP95Ms < 450);
console.log(`   ✓ PerformanceCostOptimizer P95 latency savings passed (${latency.totalLatencySavingsMs}ms saved).`);

const cost = perfOptimizer.calculateMonthlyCloudCostSavings({ currentMonthlySpend: 15000 });
assert.ok(cost.totalMonthlySavings > 0);
assert.ok(cost.optimizedMonthlySpend < 15000);
console.log(`   ✓ PerformanceCostOptimizer monthly cloud cost savings passed ($${cost.totalMonthlySavings}/mo saved).`);

const report = perfOptimizer.generateOptimizationReport();
assert.ok(report.p95LatencySavings);
assert.ok(report.monthlyCloudCostSavings);
console.log('   ✓ PerformanceCostOptimizer report generation passed.');


// 4. Require AIEngineeringAdvisor
console.log('\n[4/4] Testing AIEngineeringAdvisor...');
const AIEngineeringAdvisor = require('./AIEngineeringAdvisor');
const advisor = new AIEngineeringAdvisor();

const advisory = advisor.evaluateProjectHealth({
    findings: [{ ruleId: 'CORS_WILDCARD' }, { ruleId: 'SELECT_STAR_QUERY' }]
});

assert.ok(advisory.projectHealthSummary.overallHealthScore > 0);
assert.strictEqual(advisory.topRecommendedActions.length, 5);
assert.strictEqual(advisory.aiConfidenceScoreFormatted, '99.4%');
console.log(`   ✓ AIEngineeringAdvisor health evaluation passed (Score: ${advisory.projectHealthSummary.overallHealthScore}, Confidence: ${advisory.aiConfidenceScoreFormatted}).`);

const execBrief = advisor.generateExecutiveBrief({
    findings: [{ ruleId: 'CORS_WILDCARD' }]
});
assert.ok(execBrief.includes('EAORCS Executive Engineering Advisory Brief'));
assert.ok(execBrief.includes('Top 5 Recommended Next Actions'));
console.log('   ✓ AIEngineeringAdvisor executive brief generation passed.');

console.log('\n====================================================');
console.log('ALL STREAM 2 REMEDIATION MODULES PASSED VERIFICATION!');
console.log('====================================================');
