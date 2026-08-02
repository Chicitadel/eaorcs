/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Air Roofers Product Lifecycle Orchestration
 * File           : full_lifecycle.test.js
 * Version        : 2026.1-LTS (v1.0.0-FROZEN)
 * Author         : Air Roofers Architecture Authority / Ujomor Systems
 * Organization   : Air Roofers SASU / Chicitadel Platform Engineering
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Air Roofers Integration Guide Compliant
 * - ISO 27001 Audit Trail Standards
 * - Architecture Frozen (ADR-001)
 * - OSAP Passport Evidence Enabled
 ******************************************************************************/

const assert = require('assert');
const LifecycleStageRegistry = require('../../engine/lifecycle/LifecycleStageRegistry');
const LifecycleAuditTrail = require('../../engine/lifecycle/LifecycleAuditTrail');
const LifecycleOrchestrator = require('../../engine/lifecycle/LifecycleOrchestrator');

function runFullLifecycleTests() {
    console.log('====================================================');
    console.log('   AIR ROOFERS LIFECYCLE BEHAVIORAL TEST SUITE     ');
    console.log('====================================================\n');

    let passedTests = 0;
    let totalTests = 0;

    function runTest(testName, fn) {
        totalTests++;
        try {
            fn();
            console.log(`  [PASS] ${testName}`);
            passedTests++;
        } catch (err) {
            console.error(`  [FAIL] ${testName}: ${err.message}`);
            throw err;
        }
    }

    // 1. Test complete 14-stage lifecycle for a sample enterprise tenant
    runTest('Complete 14-stage lifecycle execution for enterprise tenant', () => {
        const registry = new LifecycleStageRegistry();
        const auditTrail = new LifecycleAuditTrail();
        const orchestrator = new LifecycleOrchestrator(registry, auditTrail);

        const tenantId = 'tenant-enterprise-001';
        const result = orchestrator.executeFullLifecycle(tenantId);

        assert.strictEqual(result.success, true, 'Full lifecycle execution should succeed');
        assert.strictEqual(result.completedStagesCount, 14, 'Should execute all 14 stages');

        const status = orchestrator.getStatus(tenantId);
        assert.strictEqual(status.completedCount, 14, 'Tenant state should have 14 completed stages');
        assert.strictEqual(status.status, 'DECOMMISSIONED_EVIDENCE_PACKAGED', 'Status should reflect stage 14 completion');

        const integrity = auditTrail.verifyIntegrity();
        assert.strictEqual(integrity.valid, true, 'Audit trail integrity must be valid');
    });

    // 2. Test pre-condition blocking (can't reach Billing without Subscription)
    runTest('Pre-condition blocking enforces sequential lifecycle integrity', () => {
        const registry = new LifecycleStageRegistry();
        const auditTrail = new LifecycleAuditTrail();
        const orchestrator = new LifecycleOrchestrator(registry, auditTrail);

        const tenantId = 'tenant-unprepared-002';

        // Attempting STAGE-05 (Billing) without STAGE-01..STAGE-04 completed
        const result = orchestrator.executeStage('STAGE-05', tenantId, { throwOnError: false });

        assert.strictEqual(result.success, false, 'Execution must fail due to missing preconditions');
        assert.strictEqual(result.blocked, true, 'Result should indicate blocked status');
        assert.ok(result.reason.includes('Missing required preconditions'), 'Reason must mention missing preconditions');

        const trail = auditTrail.getTrail(tenantId);
        assert.strictEqual(trail.length, 1, 'Audit trail must record blocked attempt');
        assert.strictEqual(trail[0].status, 'BLOCKED', 'Audit log entry status must be BLOCKED');
    });

    // 3. Test suspension mid-lifecycle & rollback handling
    runTest('Mid-lifecycle execution failure triggers automated rollback', () => {
        const registry = new LifecycleStageRegistry();
        const auditTrail = new LifecycleAuditTrail();
        const orchestrator = new LifecycleOrchestrator(registry, auditTrail);

        const tenantId = 'tenant-failure-003';

        // Progress tenant through STAGE-01 to STAGE-06
        for (let i = 1; i <= 6; i++) {
            const stageId = `STAGE-0${i}`;
            const res = orchestrator.executeStage(stageId, tenantId);
            assert.strictEqual(res.success, true);
        }

        // Trigger failure at STAGE-07 (Deployment)
        const failRes = orchestrator.executeStage('STAGE-07', tenantId, {
            failStage: 'STAGE-07',
            throwOnError: false
        });

        assert.strictEqual(failRes.success, false, 'STAGE-07 should fail');
        assert.strictEqual(failRes.rollback.rolledBack, true, 'Rollback should be executed');
        assert.strictEqual(failRes.rollback.rollbackHandler, 'rollbackOtaDeployment', 'Correct rollback handler must run');

        const trail = auditTrail.getTrail(tenantId);
        const rollbackEntry = trail.find(t => t.status === 'ROLLED_BACK');
        assert.ok(rollbackEntry, 'Audit trail must contain ROLLED_BACK entry');
        assert.strictEqual(rollbackEntry.stageId, 'STAGE-07');
    });

    // 4. Test retirement generates OSAP evidence
    runTest('Retirement workflow generates OSAP passport and evidence export', () => {
        const registry = new LifecycleStageRegistry();
        const auditTrail = new LifecycleAuditTrail();
        const orchestrator = new LifecycleOrchestrator(registry, auditTrail);

        const tenantId = 'tenant-retire-004';
        orchestrator.executeFullLifecycle(tenantId);

        const retireResult = orchestrator.retire(tenantId);

        assert.strictEqual(retireResult.success, true, 'Retirement process should succeed');
        assert.ok(retireResult.osapPassport, 'OSAP Passport must be generated');
        assert.ok(retireResult.osapPassport.passportId.startsWith('OSAP-PASS-'), 'Passport ID format check');
        assert.strictEqual(retireResult.osapPassport.status, 'VERIFIED', 'Passport status must be VERIFIED');
        assert.ok(retireResult.evidenceExport.includes('ISO 27001'), 'Evidence export must contain compliance info');
    });

    // 5. Test audit trail cryptographic integrity
    runTest('Audit trail hash-chain detects tampering', () => {
        const registry = new LifecycleStageRegistry();
        const auditTrail = new LifecycleAuditTrail();
        const orchestrator = new LifecycleOrchestrator(registry, auditTrail);

        const tenantId = 'tenant-audit-005';
        orchestrator.executeStage('STAGE-01', tenantId);
        orchestrator.executeStage('STAGE-02', tenantId);

        const initialIntegrity = auditTrail.verifyIntegrity();
        assert.strictEqual(initialIntegrity.valid, true, 'Initial audit trail must be valid');

        // Intentionally tamper with record 0 detail
        const rawRecords = auditTrail.records;
        // Since records are frozen, bypass freeze for test assertion
        const tamperedRecord = Object.assign({}, rawRecords[0], { detail: { tampered: true } });
        rawRecords[0] = tamperedRecord;

        const tamperedIntegrity = auditTrail.verifyIntegrity();
        assert.strictEqual(tamperedIntegrity.valid, false, 'Tampered audit trail must fail integrity check');
    });

    console.log(`\nAll ${passedTests}/${totalTests} lifecycle behavioral tests passed successfully!\n`);
    return { passedTests, totalTests };
}

if (require.main === module) {
    runFullLifecycleTests();
}

module.exports = { runFullLifecycleTests };
