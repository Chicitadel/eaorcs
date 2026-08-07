/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Project Intelligence & Completion Kernel
 * File           : ProjectIntelligenceKernelEngine.js
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

const CapabilityRegistryEngine = require('../registry/CapabilityRegistryEngine');
const DependencyExecutionPlannerEngine = require('../execution/DependencyExecutionPlannerEngine');
const WorkspaceDigitalTwinEngine = require('../twin/WorkspaceDigitalTwinEngine');
const CanonicalProjectBlueprintEngine = require('../blueprint/CanonicalProjectBlueprintEngine');
const ProductCompletionIntelligenceEngine = require('../knowledge/ProductCompletionIntelligenceEngine');
const AutonomousEngineeringPlannerEngine = require('../remediation/AutonomousEngineeringPlannerEngine');
const EngineeringKnowledgeGraphEngine = require('../traceability/EngineeringKnowledgeGraphEngine');
const EngineeringCoachEngine = require('../knowledge/EngineeringCoachEngine');

const EXECUTION_STAGES = {
    OBSERVE: 'OBSERVE',
    RECOMMEND: 'RECOMMEND',
    PLAN: 'PLAN',
    GENERATE: 'GENERATE',
    MODIFY: 'MODIFY',
    PACKAGE: 'PACKAGE',
    RELEASE: 'RELEASE'
};

/**
 * ProjectIntelligenceKernelEngine
 * 
 * Thin Capability Orchestrator & Master Entry Point for EAORCS.
 * Discovers capabilities from CapabilityRegistryEngine, synchronizes WorkspaceDigitalTwinEngine,
 * and delegates execution via DependencyExecutionPlannerEngine.
 */
class ProjectIntelligenceKernelEngine {
    constructor(options = {}) {
        this.options = options;
        this.capabilityRegistry = options.capabilityRegistry || new CapabilityRegistryEngine(options);
        this.dagPlanner = options.dagPlanner || new DependencyExecutionPlannerEngine(options);
        this.digitalTwin = options.digitalTwin || new WorkspaceDigitalTwinEngine(options);

        this.blueprintEngine = options.blueprintEngine || new CanonicalProjectBlueprintEngine(options);
        this.completionEngine = options.completionEngine || new ProductCompletionIntelligenceEngine(options);
        this.plannerEngine = options.plannerEngine || new AutonomousEngineeringPlannerEngine(options);
        this.graphEngine = options.graphEngine || new EngineeringKnowledgeGraphEngine(options);
        this.coachEngine = options.coachEngine || new EngineeringCoachEngine(options);

        this.stagePolicies = options.stagePolicies || {
            OBSERVE: { authorized: true, requireHumanSignOff: false },
            RECOMMEND: { authorized: true, requireHumanSignOff: false },
            PLAN: { authorized: true, requireHumanSignOff: false },
            GENERATE: { authorized: true, requireHumanSignOff: false },
            MODIFY: { authorized: true, requireHumanSignOff: false },
            PACKAGE: { authorized: true, requireHumanSignOff: false },
            RELEASE: { authorized: true, requireHumanSignOff: true }
        };
    }

    setStageAuthorization(stage, authorized = true, requireHumanSignOff = false) {
        if (!EXECUTION_STAGES[stage]) {
            throw new Error(`Invalid stage: ${stage}`);
        }
        this.stagePolicies[stage] = { authorized, requireHumanSignOff };
    }

    verifyStageAuthorization(stage) {
        const policy = this.stagePolicies[stage] || { authorized: false, requireHumanSignOff: true };
        if (!policy.authorized) {
            throw new Error(`Stage execution blocked: Stage '${stage}' is not authorized by governance policy.`);
        }
        return policy;
    }

    /**
     * Executes thin Capability-Driven Orchestration Lifecycle.
     * 
     * @param {string} projectRoot Target project directory path.
     * @returns {Object} Comprehensive Project Intelligence Lifecycle Execution State.
     */
    executeLifecycle(projectRoot) {
        if (!projectRoot || typeof projectRoot !== 'string') {
            throw new Error('Invalid projectRoot provided to executeLifecycle');
        }

        const absolutePath = path.resolve(projectRoot);

        // 1. Discover Registered Capabilities and Build Execution DAG
        const capabilities = this.capabilityRegistry.listCapabilities();
        const dagPlan = this.dagPlanner.buildExecutionDag(capabilities, { projectRoot: absolutePath });

        // 2. Stage OBSERVE & RECOMMEND: Resolve Blueprint & Synchronize Digital Twin
        this.verifyStageAuthorization(EXECUTION_STAGES.OBSERVE);
        const domain1_ProjectIntel = this._runProjectIntelligenceDomain(absolutePath);
        const domain2_BlueprintIntel = this.blueprintEngine.resolveCanonicalBlueprint(absolutePath);

        const twinSync = this.digitalTwin.syncTwin(domain2_BlueprintIntel, absolutePath);

        this.verifyStageAuthorization(EXECUTION_STAGES.RECOMMEND);
        const knowledgeGraph = this.graphEngine.buildGraph(domain2_BlueprintIntel, absolutePath);
        const coachReview = this.coachEngine.reviewProject(absolutePath, domain2_BlueprintIntel, knowledgeGraph);
        const completionAssessment = this.completionEngine.evaluateCompletion(absolutePath, domain2_BlueprintIntel);

        // 3. Stage PLAN: Autonomous Execution Planning
        this.verifyStageAuthorization(EXECUTION_STAGES.PLAN);
        const executionPlan = this.plannerEngine.generateEngineeringPlan(completionAssessment, domain2_BlueprintIntel);

        // 4. Downstream Governance & Delivery Decisions
        const domain5_GovernanceIntel = this._runGovernanceIntelligenceDomain(absolutePath, completionAssessment);
        const releaseDecision = this._runDeliveryIntelligenceDomain(completionAssessment, executionPlan);

        const executionId = `EX-KERNEL-${crypto.createHash('md5').update(absolutePath + new Date().toISOString()).digest('hex').slice(0, 8).toUpperCase()}`;

        const lifecycleState = {
            kernelVersion: '2026.3.0-LTS',
            executionId,
            orchestratedAt: new Date().toISOString(),
            projectRoot: absolutePath,
            capabilityRegistrySummary: {
                totalCapabilities: capabilities.length,
                dagSequenceCount: dagPlan.plannedStepsCount
            },
            digitalTwinSummary: twinSync,
            stagePolicies: this.stagePolicies,
            domains: {
                projectIntelligence: domain1_ProjectIntel,
                blueprintIntelligence: {
                    id: domain2_BlueprintIntel.id,
                    name: domain2_BlueprintIntel.name,
                    version: domain2_BlueprintIntel.version,
                    status: domain2_BlueprintIntel.status,
                    requirementsCount: domain2_BlueprintIntel.functionalRequirements.length
                },
                engineeringIntelligence: {
                    knowledgeGraphId: knowledgeGraph.graphId,
                    nodesCount: knowledgeGraph.totalNodes,
                    edgesCount: knowledgeGraph.totalEdges,
                    coachRecommendationsCount: coachReview.totalRecommendations,
                    coachReportSummary: coachReview.formattedCoachReport
                },
                completionIntelligence: {
                    overallScorePct: completionAssessment.overallScorePct,
                    confidenceMetrics: completionAssessment.confidenceMetrics,
                    auditTrailHash: completionAssessment.auditTrailHash,
                    isComplete: completionAssessment.isComplete,
                    remainingItemsCount: completionAssessment.remainingItems.length
                },
                governanceIntelligence: domain5_GovernanceIntel,
                deliveryIntelligence: releaseDecision
            },
            canonicalBlueprint: domain2_BlueprintIntel,
            completionAssessment,
            executionPlan,
            formattedSummaryReport: completionAssessment.formattedSummaryReport
        };

        return lifecycleState;
    }

    executeDomain(domainName, projectRoot) {
        const absolutePath = path.resolve(projectRoot);
        switch (String(domainName).toLowerCase()) {
            case 'project':
                this.verifyStageAuthorization(EXECUTION_STAGES.OBSERVE);
                return this._runProjectIntelligenceDomain(absolutePath);
            case 'blueprint':
                this.verifyStageAuthorization(EXECUTION_STAGES.OBSERVE);
                return this.blueprintEngine.resolveCanonicalBlueprint(absolutePath);
            case 'engineering':
                this.verifyStageAuthorization(EXECUTION_STAGES.RECOMMEND);
                const bp = this.blueprintEngine.resolveCanonicalBlueprint(absolutePath);
                const g = this.graphEngine.buildGraph(bp, absolutePath);
                return this.coachEngine.reviewProject(absolutePath, bp, g);
            case 'completion':
                this.verifyStageAuthorization(EXECUTION_STAGES.OBSERVE);
                const bp2 = this.blueprintEngine.resolveCanonicalBlueprint(absolutePath);
                return this.completionEngine.evaluateCompletion(absolutePath, bp2);
            case 'governance':
                this.verifyStageAuthorization(EXECUTION_STAGES.OBSERVE);
                const bp3 = this.blueprintEngine.resolveCanonicalBlueprint(absolutePath);
                const ca = this.completionEngine.evaluateCompletion(absolutePath, bp3);
                return this._runGovernanceIntelligenceDomain(absolutePath, ca);
            case 'delivery':
                this.verifyStageAuthorization(EXECUTION_STAGES.PLAN);
                const bp4 = this.blueprintEngine.resolveCanonicalBlueprint(absolutePath);
                const ca2 = this.completionEngine.evaluateCompletion(absolutePath, bp4);
                const plan = this.plannerEngine.generateEngineeringPlan(ca2, bp4);
                return this._runDeliveryIntelligenceDomain(ca2, plan);
            default:
                throw new Error(`Unknown domain: ${domainName}. Valid domains: project, blueprint, engineering, completion, governance, delivery.`);
        }
    }

    _runProjectIntelligenceDomain(projectRoot) {
        const isGitRepo = fs.existsSync(path.join(projectRoot, '.git'));
        const hasGovernance = fs.existsSync(path.join(projectRoot, '.governance'));
        const pkgExists = fs.existsSync(path.join(projectRoot, 'package.json'));

        return {
            domain: 'Project Intelligence',
            isGitRepo,
            hasGovernance,
            packageManifestExists: pkgExists,
            initialized: true
        };
    }

    _runGovernanceIntelligenceDomain(projectRoot, completionAssessment) {
        const zeroTrustEnforced = fs.existsSync(path.join(projectRoot, '.governance', 'state'));
        const passesPolicy = completionAssessment.dimensions.architecturePct >= 80;

        return {
            domain: 'Governance Intelligence',
            zeroTrustEnforced,
            policyEvaluationStatus: passesPolicy ? 'PASSED' : 'REMEDIATION_REQUIRED',
            auditHash: completionAssessment.auditTrailHash
        };
    }

    _runDeliveryIntelligenceDomain(completionAssessment, executionPlan) {
        const isCertifiable = completionAssessment.isComplete;

        return {
            domain: 'Delivery Intelligence',
            releaseCertifiable: isCertifiable,
            packagingReady: completionAssessment.dimensions.packagingPct >= 80,
            activeRemediationTasks: executionPlan.totalTasksCount,
            recommendation: isCertifiable
                ? 'RELEASE_CERTIFIED: Proceed to immutable bundle signing and federation registration.'
                : 'REMEDIATION_REQUIRED: Execute Autonomous Engineering Execution Plan prior to release sign-off.'
        };
    }

    static executeLifecycle(projectRoot, options) {
        return new ProjectIntelligenceKernelEngine(options).executeLifecycle(projectRoot);
    }
}

module.exports = ProjectIntelligenceKernelEngine;
