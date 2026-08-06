/******************************************************************************
 * Project        : EAORCS STK
 * Module         : Stream 5 Execution Test Suite
 * File           : tests/stream5_learning_explainability_ux.test.js
 * Version        : 1.0.0
 * Author         : Enterprise Architecture & Operational Resilience Governance
 * Organization   : Ujomor Platform
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : ENTERPRISE
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
 * Copyright (c) 2026 Ujomor Platform
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const TenantContinuousLearningEngine = require('../engine/learning/TenantContinuousLearningEngine');
const ExplainabilityLedgerEngine = require('../engine/explainability/ExplainabilityLedgerEngine');
const FluidExperienceQualityEngine = require('../engine/ux/FluidExperienceQualityEngine');

async function runStream5Tests() {
    console.log('================================================================');
    console.log('RUNNING STREAM 5 ENGINE TEST SUITE');
    console.log('================================================================');

    // -------------------------------------------------------------------------
    // 1. TenantContinuousLearningEngine Tests
    // -------------------------------------------------------------------------
    console.log('\n[1/3] Testing TenantContinuousLearningEngine...');
    const learningEngine = new TenantContinuousLearningEngine({ salt: 'test-salt-123', minKAnonymity: 2 });

    const tenantA = 'tenant-acme-corp';
    const tenantB = 'tenant-globex-inc';

    // Record events across categories
    learningEngine.recordArchitecturalBottleneck(tenantA, {
        component: 'PaymentService',
        type: 'CIRCULAR_DEPENDENCY',
        severity: 4,
        description: 'Circular import detected between payment and billing modules'
    });

    learningEngine.recordPolicyFailure(tenantA, {
        policyId: 'POL-SEC-001',
        ruleName: 'MISSING_TLS_1_3',
        category: 'SECURITY'
    });

    learningEngine.recordDeploymentTrend(tenantA, {
        environment: 'PROD',
        success: true,
        durationMs: 12000,
        rolledBack: false
    });

    learningEngine.recordRemediationVelocity(tenantA, {
        findingId: 'FINDING-101',
        timeToRemediateHours: 4.5,
        automated: true,
        metSLA: true
    });

    learningEngine.recordApprovalBottleneck(tenantA, {
        gateName: 'ARCHITECTURE_REVIEW_BOARD',
        waitDurationHours: 48,
        approverRole: 'CHIEF_ARCHITECT',
        status: 'APPROVED'
    });

    learningEngine.recordDocumentationGap(tenantA, {
        domain: 'AUTHENTICATION_API',
        gapType: 'MISSING_OPENAPI_SPEC',
        impactScore: 4
    });

    // Record for Tenant B to satisfy k-anonymity = 2
    learningEngine.recordArchitecturalBottleneck(tenantB, {
        component: 'OrderService',
        type: 'CIRCULAR_DEPENDENCY',
        severity: 3
    });

    const analysisA = learningEngine.analyzeTenantPatterns(tenantA);
    assert.strictEqual(analysisA.tenantId, tenantA);
    assert.strictEqual(analysisA.summary.totalBottlenecksRecorded, 1);
    assert.strictEqual(analysisA.summary.totalPolicyFailuresRecorded, 1);
    assert.strictEqual(analysisA.summary.meanTimeToRemediateHours, 4.5);
    assert.strictEqual(analysisA.summary.autoRemediationRatePercent, 100);

    const crossTenantInsights = learningEngine.getCrossTenantInsights();
    assert.strictEqual(crossTenantInsights.kAnonymitySatisfied, true);
    assert.strictEqual(crossTenantInsights.totalAnonymizedTenantsObserved, 2);
    assert.ok(crossTenantInsights.recommendedGlobalPolicies.length > 0);

    console.log('✓ TenantContinuousLearningEngine verified cleanly.');

    // -------------------------------------------------------------------------
    // 2. ExplainabilityLedgerEngine Tests
    // -------------------------------------------------------------------------
    console.log('\n[2/3] Testing ExplainabilityLedgerEngine...');
    const explainEngine = new ExplainabilityLedgerEngine();

    const record = explainEngine.recordExplanation({
        targetId: 'REC-DECOUPLING-001',
        why: 'Refactor PaymentService monolith into microservices to reduce blast radius.',
        evidence: ['Telemetry shows 450ms latency spikes under heavy load', 'Coupling index > 0.85'],
        policies: ['POL-ARCH-MODULARITY', 'POL-SEC-ZERO-TRUST'],
        regulations: ['ISO 27001', 'SOC 2 Security Criteria'],
        adrs: ['ADR-004-MICROSERVICES-STRATEGY'],
        alternatives: [
            { name: 'Vertical Scaling', rejectionReason: 'Does not solve tight coupling and single point of failure' }
        ],
        confidence: { score: 0.96, rationale: 'High automated rule score & architecture simulation passing' },
        consequencesIfIgnored: { description: 'Cascading failures during seasonal traffic surges', severity: 'CRITICAL' },
        actor: 'Lead Architect'
    });

    assert.ok(record.recordId.startsWith('exp_'));
    assert.strictEqual(record.confidence.classification, 'HIGH_CONFIDENCE');
    assert.strictEqual(record.confidence.percent, '96.0%');
    assert.ok(record.recordHash);

    const retrieved = explainEngine.getExplanation(record.recordId);
    assert.strictEqual(retrieved.targetId, 'REC-DECOUPLING-001');

    const integrity = explainEngine.verifyLedgerIntegrity();
    assert.strictEqual(integrity.valid, true);

    const report = explainEngine.generateExplanationReport(record.recordId);
    assert.ok(report.includes('WHY? (Rationale)'));
    assert.ok(report.includes('Refactor PaymentService monolith'));

    console.log('✓ ExplainabilityLedgerEngine verified cleanly.');

    // -------------------------------------------------------------------------
    // 3. FluidExperienceQualityEngine Tests
    // -------------------------------------------------------------------------
    console.log('\n[3/3] Testing FluidExperienceQualityEngine...');
    const uxEngine = new FluidExperienceQualityEngine();

    // 1. Transitions
    const pageState = uxEngine.transitionToPage('/dashboard');
    assert.strictEqual(pageState.currentRoute, '/dashboard');
    assert.strictEqual(pageState.status, 'ACTIVE');

    // 2. Micro-animations
    const anim = uxEngine.getMicroAnimation('fade-slide');
    assert.strictEqual(anim.id, 'fade-slide');

    // 3. Onboarding
    const hint = uxEngine.triggerContextualHint('hint-1', '#btn-deploy', 'Click here to deploy');
    assert.strictEqual(hint.hintId, 'hint-1');
    uxEngine.dismissContextualHint('hint-1');
    assert.strictEqual(uxEngine.triggerContextualHint('hint-1', '#btn-deploy', 'Click here to deploy'), null);

    // 4. Keyboard Shortcuts
    const keyMatch = uxEngine.handleKeyPress('Ctrl+K');
    assert.strictEqual(keyMatch.matched, true);
    assert.strictEqual(keyMatch.result.action, 'OPEN_COMMAND_PALETTE');

    // 5. Responsive Layout
    const layout = uxEngine.updateViewportWidth(480);
    assert.strictEqual(layout.currentBreakpoint, 'mobile');
    assert.strictEqual(layout.sidebarCollapsed, true);

    // 6. Optimistic UI
    const optResult = await uxEngine.executeOptimisticUpdate({
        id: 'opt-1',
        optimisticData: { status: 'SAVING' },
        asyncOperation: async () => 'SUCCESS'
    });
    assert.strictEqual(optResult.success, true);
    assert.strictEqual(optResult.status, 'COMMITTED');

    // 7. Guided Tours
    uxEngine.registerTour('tour-welcome', [
        { title: 'Step 1', content: 'Welcome to EAORCS' },
        { title: 'Step 2', content: 'Explore Dashboard' }
    ]);
    const activeTour = uxEngine.startTour('tour-welcome');
    assert.strictEqual(activeTour.tourId, 'tour-welcome');
    assert.strictEqual(activeTour.step.title, 'Step 1');

    // 8. Undo/Redo Stacks
    uxEngine.pushUndoState({ count: 1 });
    uxEngine.pushUndoState({ count: 2 });
    assert.strictEqual(uxEngine.canUndo(), true);

    const engineStatus = uxEngine.getEngineStatus();
    assert.strictEqual(engineStatus.keyboardShortcutsCount >= 5, true);

    console.log('✓ FluidExperienceQualityEngine verified cleanly.');

    console.log('\n================================================================');
    console.log('ALL STREAM 5 ENGINE TESTS PASSED SUCCESSFULLY! (100% VERIFIED)');
    console.log('================================================================');
}

runStream5Tests().catch(err => {
    console.error('Test execution failed:', err);
    process.exit(1);
});
