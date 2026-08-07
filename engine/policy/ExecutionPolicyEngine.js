/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Hierarchical Execution Policy Architecture
 * File           : ExecutionPolicyEngine.js
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

const ExecutionProfileRegistryEngine = require('./ExecutionProfileRegistryEngine');
const ConsentManagerEngine = require('./ConsentManagerEngine');

class ExecutionPolicyEngine {
    constructor(options = {}) {
        this.options = options;
        this.profileRegistry = options.profileRegistry || new ExecutionProfileRegistryEngine(options);
        this.consentManager = options.consentManager || new ConsentManagerEngine(options);

        // Store policies per scope
        this.policies = {
            workspace: options.workspacePolicy || this.profileRegistry.getPreset('Balanced'),
            product: options.productPolicy || null,
            customerProject: options.customerProjectPolicy || null,
            session: options.sessionPolicy || null,
            workflow: options.workflowPolicy || null,
            userProfile: options.userProfilePolicy || null,
            team: options.teamPolicy || null
        };
    }

    setScopePolicy(scopeName, policyObj) {
        if (!this.policies.hasOwnProperty(scopeName)) {
            throw new Error(`Invalid scope name: ${scopeName}`);
        }
        this.policies[scopeName] = policyObj;
    }

    /**
     * Resolves an explainable policy decision for a given stage and context.
     * Evaluates Scope Hierarchy + Contextual Conditions + Consent Memory.
     * 
     * @param {string} stage Execution stage (e.g. "OBSERVE", "MODIFY", "RELEASE").
     * @param {Object} context Contextual metadata (e.g. { riskLevel: "HIGH", confidencePct: 96, isCi: false }).
     * @returns {Object} Structured Explainable Policy Decision.
     */
    resolveDecision(stage, context = {}) {
        const uppercaseStage = String(stage).toUpperCase();

        // 1. Check Consent Memory first
        const consentKey = `${uppercaseStage}:${context.targetFile || 'STAGE'}`;
        const rememberedConsent = this.consentManager.hasRecordedConsent(consentKey);
        if (rememberedConsent) {
            return {
                stage: uppercaseStage,
                decision: rememberedConsent.approved ? 'AUTO' : 'PROHIBITED',
                reason: `User explicitly approved this stage in scope '${rememberedConsent.scope}' (Role: ${rememberedConsent.userRole || 'Developer'})`,
                confidencePct: 100,
                resolvedScope: `CONSENT_MEMORY (${rememberedConsent.scope})`,
                inheritedFrom: `ConsentManagerStore:${rememberedConsent.scope}`,
                appliedRule: 'RememberedUserConsentChoice',
                remembered: true,
                requireApproval: false
            };
        }

        // 2. Resolve Effective Stage Rule from Scope Hierarchy
        const hierarchyOrder = ['workflow', 'session', 'customerProject', 'product', 'userProfile', 'team', 'workspace'];

        let rawDecision = 'ASK';
        let resolvedScope = 'workspace';
        let inheritedFrom = 'workspace.yaml';

        for (const scope of hierarchyOrder) {
            const policy = this.policies[scope];
            if (policy && policy.stages && policy.stages[uppercaseStage]) {
                rawDecision = policy.stages[uppercaseStage];
                resolvedScope = scope;
                inheritedFrom = `${scope}.policy.yaml`;
                break;
            }
        }

        // 3. Evaluate Contextual Conditions
        let finalDecision = rawDecision;
        let appliedRule = 'HierarchicalPolicyResolution';
        let reason = `Stage '${uppercaseStage}' decision resolved from scope '${resolvedScope}' (${inheritedFrom})`;

        if (context.isCi) {
            finalDecision = 'AUTO';
            appliedRule = 'CiEnvironmentAutoAuthorization';
            reason = 'CI/CD pipeline execution mode automatically authorizes execution stages.';
        } else if (context.confidencePct && context.confidencePct > 95 && rawDecision === 'ASK') {
            finalDecision = 'AUTO';
            appliedRule = 'HighConfidenceAutoAuthorization';
            reason = `High Confidence score (${context.confidencePct}%) automatically authorizes execution.`;
        } else if (context.riskLevel === 'HIGH' && rawDecision === 'AUTO') {
            finalDecision = 'ASK';
            appliedRule = 'HighRiskLevelApprovalRequired';
            reason = 'High Risk level overrides automatic decision and requires explicit developer approval.';
        } else if (context.hasBreakingChanges && rawDecision === 'AUTO') {
            finalDecision = 'ASK';
            appliedRule = 'BreakingApiChangeApprovalRequired';
            reason = 'Breaking API changes detected; requires explicit developer approval.';
        }

        const requireApproval = finalDecision === 'ASK';

        return {
            stage: uppercaseStage,
            decision: finalDecision,
            reason,
            confidencePct: context.confidencePct || 95,
            resolvedScope,
            inheritedFrom,
            appliedRule,
            remembered: false,
            requireApproval
        };
    }
}

module.exports = ExecutionPolicyEngine;
