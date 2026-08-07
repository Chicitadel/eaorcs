/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Universal Execution Host & Runtime Architecture
 * File           : EAORCSRuntimeEngine.js
 * Version        : 2026.3.0-LTS
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
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ProjectIntelligenceKernelEngine = require('../kernel/ProjectIntelligenceKernelEngine');
const ExecutionPolicyEngine = require('../policy/ExecutionPolicyEngine');
const EnterpriseEventBus = require('../kernel/EnterpriseEventBus');
const EngineeringTransactionEngine = require('../execution/EngineeringTransactionEngine');
const ExecutionJournalEngine = require('../execution/ExecutionJournalEngine');

/**
 * Execution Modes:
 * 
 * 1. PASSIVE: Read-only observation & notifications (for manual developers in text editors).
 * 2. INTERACTIVE: Kernel prepares modifications/plans; prompts developer for approval.
 * 3. AUTONOMOUS: Full execution without prompts (for CI/CD pipelines & containers).
 * 4. SIMULATION: Full lifecycle execution without side-effects or file modifications.
 */
class EAORCSRuntimeEngine {
    constructor(options = {}) {
        this.options = options;
        this.projectRoot = options.projectRoot ? path.resolve(options.projectRoot) : process.cwd();
        this.mode = options.mode || 'Interactive'; // Passive | Interactive | Autonomous | Simulation
        this.kernel = options.kernel || new ProjectIntelligenceKernelEngine(options);
        this.policyEngine = options.policyEngine || new ExecutionPolicyEngine(options);
        this.eventBus = options.eventBus || new EnterpriseEventBus(options);
        this.txEngine = options.txEngine || new EngineeringTransactionEngine(options);
        this.journalEngine = options.journalEngine || new ExecutionJournalEngine(options);

        this.isRunning = false;
        this.sessionState = {
            sessionId: `SESS-${crypto.createHash('md5').update(new Date().toISOString()).digest('hex').slice(0, 8).toUpperCase()}`,
            startedAt: new Date().toISOString(),
            invocationsCount: 0,
            lastTriggerEvent: null
        };
    }

    startHost() {
        this.isRunning = true;
        this.sessionState.startedAt = new Date().toISOString();
        return {
            status: 'HOST_RUNNING',
            sessionId: this.sessionState.sessionId,
            mode: this.mode,
            projectRoot: this.projectRoot
        };
    }

    stopHost() {
        this.isRunning = false;
        return {
            status: 'HOST_STOPPED',
            sessionId: this.sessionState.sessionId
        };
    }

    /**
     * Detached Repository Onboarding: Attaches EAORCS runtime to an existing/legacy repository.
     */
    attachRepository(targetDir) {
        if (!targetDir || typeof targetDir !== 'string') {
            throw new Error('Invalid targetDir provided to attachRepository');
        }

        const absPath = path.resolve(targetDir);
        if (!fs.existsSync(absPath)) {
            throw new Error(`Target directory does not exist: ${absPath}`);
        }

        this.projectRoot = absPath;
        const kernelState = this.kernel.executeLifecycle(absPath);

        const attachResult = {
            status: 'REPOSITORY_ATTACHED',
            targetDir: absPath,
            canonicalBlueprintId: kernelState.canonicalBlueprint.id,
            overallCompletionPct: kernelState.completionAssessment.overallScorePct,
            governanceInitialized: true
        };

        this.eventBus.publish('REPOSITORY_ATTACHED', attachResult);
        return attachResult;
    }

    /**
     * Thin Event Handling: Emits events to EnterpriseEventBus, evaluates explainable policy,
     * manages transactions, records execution journals, and invokes Kernel.
     */
    handleEvent(event) {
        if (!event || typeof event !== 'object') {
            throw new Error('Invalid event provided to handleEvent');
        }

        this.sessionState.invocationsCount++;
        this.sessionState.lastTriggerEvent = event;

        // 1. Publish Event on EnterpriseEventBus
        this.eventBus.publish('EVENT_RECEIVED', event);

        // 2. Resolve Explainable Policy Decision
        const context = {
            targetFile: event.path,
            isCi: this.mode === 'Autonomous',
            riskLevel: event.type === 'FILE_DELETE' ? 'HIGH' : 'MEDIUM'
        };

        const policyDecision = this.policyEngine.resolveDecision('MODIFY', context);

        // 3. Simulation Mode Handling (Zero Side-Effects)
        if (this.mode === 'Simulation') {
            const kernelState = this.kernel.executeLifecycle(this.projectRoot);
            const simulationReport = {
                sessionId: this.sessionState.sessionId,
                mode: 'Simulation',
                eventHandled: event,
                policyDecision,
                kernelStateSummary: {
                    executionId: kernelState.executionId,
                    overallScorePct: kernelState.completionAssessment.overallScorePct,
                    tasksCount: kernelState.executionPlan.totalTasksCount
                },
                runtimeAction: 'SIMULATION_COMPLETED',
                sideEffectsApplied: false,
                explainableReason: 'Simulation mode executed full lifecycle; zero file modifications applied.'
            };

            this.journalEngine.recordJournal({
                ...simulationReport,
                projectRoot: this.projectRoot
            });

            return simulationReport;
        }

        // 4. Begin Atomic Engineering Transaction for Modifying Modes
        const tx = this.txEngine.beginTransaction(`Event execution for ${event.path || 'trigger'}`);

        let runtimeAction = 'COMPLETED';
        let userPrompt = null;

        const kernelState = this.kernel.executeLifecycle(this.projectRoot);

        if (this.mode === 'Passive') {
            runtimeAction = 'NOTIFIED_ONLY';
            userPrompt = `EAORCS Engineering Review: Detected changes in ${event.path}. Overall score: ${kernelState.completionAssessment.overallScorePct}%. No automatic files modified.`;
        } else if (this.mode === 'Interactive' && policyDecision.requireApproval) {
            runtimeAction = 'AWAITING_USER_APPROVAL';
            userPrompt = {
                title: 'EAORCS Engineering Approval Request',
                message: `Kernel generated ${kernelState.executionPlan.totalTasksCount} tasks for target ${event.path}. Approve modification?`,
                explainableReason: policyDecision.reason,
                options: ['Y', 'N'],
                rememberOptionAvailable: true
            };
        } else {
            runtimeAction = 'AUTONOMOUSLY_EXECUTED';
            this.txEngine.commitTransaction();
        }

        const executionReport = {
            sessionId: this.sessionState.sessionId,
            mode: this.mode,
            eventHandled: event,
            policyDecision,
            kernelStateSummary: {
                executionId: kernelState.executionId,
                overallScorePct: kernelState.completionAssessment.overallScorePct,
                tasksCount: kernelState.executionPlan.totalTasksCount
            },
            runtimeAction,
            userPrompt
        };

        // 5. Record Execution Journal for deterministic replay
        this.journalEngine.recordJournal({
            ...executionReport,
            projectRoot: this.projectRoot
        });

        return executionReport;
    }
}

module.exports = EAORCSRuntimeEngine;
