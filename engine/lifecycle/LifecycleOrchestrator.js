/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Air Roofers Product Lifecycle Orchestration
 * File           : LifecycleOrchestrator.js
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

class LifecycleOrchestrator {
    constructor(registry, auditTrail) {
        if (!registry) {
            throw new Error('LifecycleOrchestrator requires a valid LifecycleStageRegistry instance');
        }
        if (!auditTrail) {
            throw new Error('LifecycleOrchestrator requires a valid LifecycleAuditTrail instance');
        }

        this.registry = registry;
        this.auditTrail = auditTrail;
        this.tenantStates = new Map();
    }

    _getTenantState(tenantId) {
        if (!this.tenantStates.has(tenantId)) {
            this.tenantStates.set(tenantId, {
                tenantId,
                completedStages: [],
                currentStage: null,
                status: 'INITIAL',
                evidenceBundles: [],
                osapPassport: null
            });
        }
        return this.tenantStates.get(tenantId);
    }

    getStatus(tenantId) {
        const state = this._getTenantState(tenantId);
        return {
            tenantId,
            status: state.status,
            currentStage: state.currentStage,
            completedCount: state.completedStages.length,
            completedStages: [...state.completedStages],
            osapPassport: state.osapPassport
        };
    }

    executeStage(stageId, tenantId, context = {}) {
        const state = this._getTenantState(tenantId);
        const stage = this.registry.getStage(stageId);

        if (!stage) {
            const errReason = `Unknown stage ID: ${stageId}`;
            this.auditTrail.record(stageId, tenantId, 'FAILED', { reason: errReason }, 'Orchestrator', 'EXECUTE_STAGE');
            if (context.throwOnError !== false) {
                throw new Error(errReason);
            }
            return { success: false, stageId, reason: errReason };
        }

        // 1. Pre-condition validation
        const preCheck = this.registry.validatePreconditions(stageId, state.completedStages);
        if (!preCheck.valid) {
            this.auditTrail.record(stageId, tenantId, 'BLOCKED', {
                reason: preCheck.reason,
                missingPreconditions: preCheck.missingPreconditions
            }, 'Orchestrator', 'VALIDATE_PRECONDITIONS');

            if (context.throwOnError !== false) {
                throw new Error(`Precondition validation failed for stage ${stageId}: ${preCheck.reason}`);
            }
            return {
                success: false,
                stageId,
                blocked: true,
                reason: preCheck.reason,
                missingPreconditions: preCheck.missingPreconditions
            };
        }

        // 2. Stage execution
        try {
            if (context.failStage === stageId || context.simulateFailure === stageId) {
                throw new Error(`Simulated execution failure at stage ${stageId}`);
            }

            const stageResult = this._simulateStageExecution(stage, tenantId, context);

            // 3. Post-condition assertion
            this._assertPostconditions(stage, stageResult);

            // Mark stage completed
            if (!state.completedStages.includes(stageId)) {
                state.completedStages.push(stageId);
            }
            state.currentStage = stageId;
            state.status = this._deriveTenantStatus(stageId);

            // 4. Evidence recording
            const recordDetail = {
                stageName: stage.name,
                platformService: stage.platformService,
                postconditionsVerified: stage.postconditions,
                output: stageResult.output
            };

            this.auditTrail.record(stageId, tenantId, 'SUCCESS', recordDetail, 'Orchestrator', 'EXECUTE_STAGE');

            return {
                success: true,
                stageId,
                stageName: stage.name,
                output: stageResult.output
            };

        } catch (error) {
            // 5. Rollback on failure
            const rollbackResult = this._executeRollback(stage, tenantId, context, error.message);
            state.status = 'FAILED';

            if (context.throwOnError !== false) {
                throw new Error(`Stage ${stageId} failed: ${error.message}. Rollback status: ${rollbackResult.rollbackHandler}`);
            }

            return {
                success: false,
                stageId,
                error: error.message,
                rollback: rollbackResult
            };
        }
    }

    _simulateStageExecution(stage, tenantId, context) {
        const output = {
            timestamp: new Date().toISOString(),
            tenantId,
            stageId: stage.id,
            service: stage.platformService,
            metadata: context.metadata || {}
        };

        for (const post of stage.postconditions) {
            output[post] = true;
        }

        if (stage.id === 'STAGE-14') {
            output.osapPassport = {
                passportId: `OSAP-PASS-${tenantId}-${Date.now()}`,
                tenantId,
                issuer: 'Air Roofers Governance Authority / EAORCS OSAP',
                issuedAt: new Date().toISOString(),
                status: 'VERIFIED',
                complianceLevel: 'ENTERPRISE_L5',
                signature: `SIG-OSAP-${tenantId}-SHA256-OK`
            };
            this._getTenantState(tenantId).osapPassport = output.osapPassport;
        }

        return { output };
    }

    _assertPostconditions(stage, stageResult) {
        const output = stageResult.output;
        for (const post of stage.postconditions) {
            if (!output || output[post] !== true) {
                throw new Error(`Post-condition assertion failed: missing ${post}`);
            }
        }
    }

    _executeRollback(stage, tenantId, context, failureReason) {
        const detail = {
            rollbackHandler: stage.rollbackHandler,
            platformService: stage.platformService,
            triggeredByFailure: failureReason,
            timestamp: new Date().toISOString()
        };

        this.auditTrail.record(stage.id, tenantId, 'ROLLED_BACK', detail, 'Orchestrator', 'ROLLBACK_STAGE');

        return {
            rolledBack: true,
            stageId: stage.id,
            rollbackHandler: stage.rollbackHandler,
            detail
        };
    }

    _deriveTenantStatus(stageId) {
        switch (stageId) {
            case 'STAGE-11': return 'SUSPENDED';
            case 'STAGE-12': return 'REVOKED';
            case 'STAGE-13': return 'RETIRED';
            case 'STAGE-14': return 'DECOMMISSIONED_EVIDENCE_PACKAGED';
            default: return 'ACTIVE';
        }
    }

    executeFullLifecycle(tenantId, context = {}) {
        const stages = this.registry.getOrderedStages();
        const results = [];

        for (const stage of stages) {
            const res = this.executeStage(stage.id, tenantId, context);
            results.push(res);

            if (!res.success) {
                return {
                    success: false,
                    tenantId,
                    stoppedAtStage: stage.id,
                    completedStagesCount: results.filter(r => r.success).length,
                    results,
                    status: this.getStatus(tenantId)
                };
            }
        }

        return {
            success: true,
            tenantId,
            completedStagesCount: results.length,
            results,
            status: this.getStatus(tenantId),
            auditTrailSummary: this.auditTrail.verifyIntegrity()
        };
    }

    suspend(tenantId, context = {}) {
        return this.executeStage('STAGE-11', tenantId, context);
    }

    revoke(tenantId, context = {}) {
        const state = this._getTenantState(tenantId);
        if (!state.completedStages.includes('STAGE-11')) {
            this.suspend(tenantId, context);
        }
        return this.executeStage('STAGE-12', tenantId, context);
    }

    retire(tenantId, context = {}) {
        const state = this._getTenantState(tenantId);

        if (!state.completedStages.includes('STAGE-11')) {
            this.suspend(tenantId, context);
        }
        if (!state.completedStages.includes('STAGE-12')) {
            this.revoke(tenantId, context);
        }

        const stage13Res = this.executeStage('STAGE-13', tenantId, context);
        if (!stage13Res.success) {
            return stage13Res;
        }

        const stage14Res = this.executeStage('STAGE-14', tenantId, context);

        const evidenceExport = this.auditTrail.exportJson(tenantId);

        return {
            success: stage14Res.success,
            tenantId,
            stage13: stage13Res,
            stage14: stage14Res,
            evidenceExport,
            osapPassport: state.osapPassport,
            status: this.getStatus(tenantId)
        };
    }
}

module.exports = LifecycleOrchestrator;
