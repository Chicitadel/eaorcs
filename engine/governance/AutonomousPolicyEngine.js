/******************************************************************************
 * Project        : EAORCS Governance Platform
 * Module         : Autonomous Policy & Remediation Engine
 * File           : AutonomousPolicyEngine.js
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

const crypto = require('crypto');

/**
 * Standard default policy rules pre-configured in the platform
 */
const DEFAULT_POLICIES = [
    {
        id: 'POL-CRIT-VULN-PROD',
        name: 'Critical Vulnerability Production Guardrail',
        description: 'Blocks production deployment when critical vulnerability is detected, triggers evidence generation, architect notification, remediation branch creation, and score recalculation.',
        enabled: true,
        priority: 100,
        condition: {
            operator: 'AND',
            clauses: [
                { field: 'vulnerabilitySeverity', operator: 'EQUALS', value: 'CRITICAL' },
                { field: 'deploymentEnvironment', operator: 'EQUALS', value: 'PRODUCTION' }
            ]
        },
        actions: [
            {
                type: 'BLOCK_DEPLOYMENT',
                params: {
                    reason: 'Critical vulnerability detected in production deployment context',
                    code: 'ERR_CRITICAL_VULN_PROD_BLOCKED'
                }
            },
            {
                type: 'GENERATE_EVIDENCE',
                params: {
                    evidenceType: 'POLICY_VIOLATION_EVIDENCE',
                    assuranceLevel: 'HIGH'
                }
            },
            {
                type: 'NOTIFY_ARCHITECT',
                params: {
                    recipient: 'Lead Security Architect',
                    channel: 'URGENT_GOVERNANCE_ALERT',
                    priority: 'CRITICAL'
                }
            },
            {
                type: 'CREATE_REMEDIATION_BRANCH',
                params: {
                    branchPrefix: 'remediation/fix-critical-vuln',
                    autoCheckout: true
                }
            },
            {
                type: 'RECALCULATE_SCORE',
                params: {
                    penaltyPoints: 15,
                    targetPillar: 'Security',
                    reason: 'Critical vulnerability policy block'
                }
            }
        ]
    },
    {
        id: 'POL-UNAPPROVED-LICENSE-PROD',
        name: 'Unapproved License Production Gatekeeper',
        description: 'Blocks production deployment if non-compliant or copyleft licenses are detected.',
        enabled: true,
        priority: 90,
        condition: {
            operator: 'AND',
            clauses: [
                { field: 'hasUnapprovedLicense', operator: 'EQUALS', value: true },
                { field: 'deploymentEnvironment', operator: 'EQUALS', value: 'PRODUCTION' }
            ]
        },
        actions: [
            {
                type: 'BLOCK_DEPLOYMENT',
                params: {
                    reason: 'Unapproved or incompatible software license in production deployment',
                    code: 'ERR_LICENSE_NON_COMPLIANT'
                }
            },
            {
                type: 'GENERATE_EVIDENCE',
                params: {
                    evidenceType: 'LICENSE_COMPLIANCE_EVIDENCE'
                }
            },
            {
                type: 'NOTIFY_ARCHITECT',
                params: {
                    recipient: 'Legal & Compliance Officer',
                    channel: 'COMPLIANCE_ALERT'
                }
            }
        ]
    },
    {
        id: 'POL-DRIFT-THRESHOLD-EXCEEDED',
        name: 'Architectural Drift Guardrail',
        description: 'Triggers evidence generation and score recalculation when architectural drift exceeds safety threshold.',
        enabled: true,
        priority: 80,
        condition: {
            field: 'architecturalDriftScore',
            operator: 'GREATER_THAN',
            value: 20
        },
        actions: [
            {
                type: 'GENERATE_EVIDENCE',
                params: {
                    evidenceType: 'ARCHITECTURAL_DRIFT_EVIDENCE'
                }
            },
            {
                type: 'NOTIFY_ARCHITECT',
                params: {
                    recipient: 'Lead Software Architect',
                    channel: 'ARCHITECTURE_ALERT'
                }
            },
            {
                type: 'RECALCULATE_SCORE',
                params: {
                    penaltyPoints: 10,
                    targetPillar: 'Architecture',
                    reason: 'Architectural drift threshold exceeded'
                }
            }
        ]
    }
];

/**
 * AutonomousPolicyEngine
 * Provides policy-driven autonomous remediation & execution triggers with zero manual intervention
 * required and complete audit trail generation.
 */
class AutonomousPolicyEngine {
    /**
     * @param {Object} [options]
     * @param {Array<Object>} [options.rules] Initial declarative rules
     * @param {Object} [options.actionHandlers] Custom action handlers map
     * @param {Function} [options.scoringEngineCallback] Optional callback for score recalculations
     */
    constructor(options = {}) {
        this.rules = new Map();
        this.actionHandlers = new Map();
        this.auditTrail = [];
        this.scoringEngineCallback = options.scoringEngineCallback || null;

        // Register built-in default action handlers
        this._registerDefaultActionHandlers();

        // Register custom action handlers if provided
        if (options.actionHandlers && typeof options.actionHandlers === 'object') {
            for (const [type, handler] of Object.entries(options.actionHandlers)) {
                this.registerActionHandler(type, handler);
            }
        }

        // Register initial rules or defaults
        const initialRules = options.rules || DEFAULT_POLICIES;
        for (const rule of initialRules) {
            this.registerRule(rule);
        }
    }

    /**
     * Registers default action handlers for policy execution
     * @private
     */
    _registerDefaultActionHandlers() {
        // 1. BLOCK_DEPLOYMENT
        this.registerActionHandler('BLOCK_DEPLOYMENT', (params, context, state) => {
            state.blocked = true;
            state.blockReasons.push(params.reason || 'Deployment blocked by policy engine rule');
            state.blockCodes.push(params.code || 'ERR_POLICY_BLOCKED');
            return {
                executed: true,
                type: 'BLOCK_DEPLOYMENT',
                status: 'DEPLOYMENT_BLOCKED',
                reason: params.reason,
                code: params.code
            };
        });

        // 2. GENERATE_EVIDENCE
        this.registerActionHandler('GENERATE_EVIDENCE', (params, context, state) => {
            const timestamp = new Date().toISOString();
            const rawContent = JSON.stringify({ context, params, timestamp });
            const proofHash = crypto.createHash('sha256').update(rawContent).digest('hex');
            
            const evidence = {
                evidenceId: `EVID-AUTO-${proofHash.substring(0, 12).toUpperCase()}`,
                evidenceType: params.evidenceType || 'AUTONOMOUS_POLICY_EVIDENCE',
                assuranceLevel: params.assuranceLevel || 'HIGH',
                timestamp,
                proofHash,
                signature: `SIG-SHA256-${proofHash.substring(0, 16)}`,
                contextSnapshot: {
                    vulnerabilitySeverity: context.vulnerabilitySeverity,
                    deploymentEnvironment: context.deploymentEnvironment,
                    repository: context.repository || 'eaorcs-core'
                }
            };

            state.generatedEvidence.push(evidence);
            return {
                executed: true,
                type: 'GENERATE_EVIDENCE',
                evidenceId: evidence.evidenceId,
                proofHash: evidence.proofHash
            };
        });

        // 3. NOTIFY_ARCHITECT
        this.registerActionHandler('NOTIFY_ARCHITECT', (params, context, state) => {
            const notification = {
                notificationId: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                recipient: params.recipient || 'Lead Security Architect',
                channel: params.channel || 'GOVERNANCE_ALERT',
                priority: params.priority || 'HIGH',
                timestamp: new Date().toISOString(),
                subject: `[AUTONOMOUS REMEDIATION TRIGGER] Policy alert for ${context.deploymentEnvironment || 'system'}`,
                message: `Policy rule violation detected in environment '${context.deploymentEnvironment}'. Immediate governance review logged.`
            };

            state.notifications.push(notification);
            return {
                executed: true,
                type: 'NOTIFY_ARCHITECT',
                notificationId: notification.notificationId,
                recipient: notification.recipient
            };
        });

        // 4. CREATE_REMEDIATION_BRANCH
        this.registerActionHandler('CREATE_REMEDIATION_BRANCH', (params, context, state) => {
            const vulnId = context.vulnerabilityId || context.cveId || 'CRIT-' + Date.now().toString(36);
            const prefix = params.branchPrefix || 'remediation/auto-fix';
            const branchName = `${prefix}-${vulnId.toLowerCase().replace(/[^a-z0-9_-]/g, '-')}`;

            const remediationBranch = {
                branchName,
                sourceBranch: context.branch || 'main',
                targetVulnerability: vulnId,
                createdAt: new Date().toISOString(),
                status: 'CREATED_AUTOMATICALLY',
                patchFile: `patches/${branchName.replace(/\//g, '_')}.patch`
            };

            state.remediationBranches.push(remediationBranch);
            return {
                executed: true,
                type: 'CREATE_REMEDIATION_BRANCH',
                branchName: remediationBranch.branchName,
                targetVulnerability: remediationBranch.targetVulnerability
            };
        });

        // 5. RECALCULATE_SCORE
        this.registerActionHandler('RECALCULATE_SCORE', (params, context, state) => {
            const penalty = params.penaltyPoints || 10;
            const pillar = params.targetPillar || 'Security';
            
            let newScore = null;
            if (this.scoringEngineCallback && typeof this.scoringEngineCallback === 'function') {
                newScore = this.scoringEngineCallback({ penalty, pillar, context });
            }

            const recalcEvent = {
                timestamp: new Date().toISOString(),
                targetPillar: pillar,
                penaltyPoints: penalty,
                reason: params.reason || 'Policy rule trigger score adjustment',
                recalculatedScore: newScore
            };

            state.scoreRecalculations.push(recalcEvent);
            return {
                executed: true,
                type: 'RECALCULATE_SCORE',
                targetPillar: pillar,
                penaltyPoints: penalty,
                recalculatedScore: newScore
            };
        });
    }

    /**
     * Registers a custom action handler
     * @param {string} actionType 
     * @param {Function} handlerFn (params, context, executionState) => ActionResult
     */
    registerActionHandler(actionType, handlerFn) {
        if (typeof actionType !== 'string' || typeof handlerFn !== 'function') {
            throw new Error('Invalid action handler arguments: actionType must be string and handlerFn must be function');
        }
        this.actionHandlers.set(actionType.toUpperCase(), handlerFn);
    }

    /**
     * Registers or replaces a policy rule
     * @param {Object} rule 
     */
    registerRule(rule) {
        if (!rule || !rule.id || !rule.name || !rule.condition || !Array.isArray(rule.actions)) {
            throw new Error(`Invalid policy rule structure for rule ID '${rule ? rule.id : 'unknown'}'`);
        }

        const normalizedRule = {
            id: rule.id,
            name: rule.name,
            description: rule.description || '',
            enabled: rule.enabled !== false,
            priority: Number.isInteger(rule.priority) ? rule.priority : 50,
            condition: rule.condition,
            actions: rule.actions
        };

        this.rules.set(normalizedRule.id, normalizedRule);
    }

    /**
     * Gets all registered rules as an array sorted by priority descending
     * @returns {Array<Object>}
     */
    getRules() {
        return Array.from(this.rules.values()).sort((a, b) => b.priority - a.priority);
    }

    /**
     * Evaluates a single declarative condition object against execution context
     * @param {Object} condition 
     * @param {Object} context 
     * @returns {boolean}
     */
    evaluateCondition(condition, context) {
        if (!condition || typeof condition !== 'object') {
            return false;
        }

        // Support composite logic (AND, OR, NOT)
        if (condition.operator) {
            const op = condition.operator.toUpperCase();
            if (op === 'AND') {
                if (!Array.isArray(condition.clauses) || condition.clauses.length === 0) return false;
                return condition.clauses.every(clause => this.evaluateCondition(clause, context));
            }
            if (op === 'OR') {
                if (!Array.isArray(condition.clauses) || condition.clauses.length === 0) return false;
                return condition.clauses.some(clause => this.evaluateCondition(clause, context));
            }
            if (op === 'NOT') {
                if (!condition.clause) return false;
                return !this.evaluateCondition(condition.clause, context);
            }
        }

        // Field comparison condition
        const { field, operator, value } = condition;
        if (!field) return false;

        const fieldValue = this._getNestedValue(context, field);
        const op = (operator || 'EQUALS').toUpperCase();

        switch (op) {
            case 'EQUALS':
                return fieldValue === value;
            case 'NOT_EQUALS':
                return fieldValue !== value;
            case 'GREATER_THAN':
                return Number(fieldValue) > Number(value);
            case 'GREATER_THAN_OR_EQUAL':
                return Number(fieldValue) >= Number(value);
            case 'LESS_THAN':
                return Number(fieldValue) < Number(value);
            case 'LESS_THAN_OR_EQUAL':
                return Number(fieldValue) <= Number(value);
            case 'IN':
                return Array.isArray(value) && value.includes(fieldValue);
            case 'CONTAINS':
                if (Array.isArray(fieldValue)) return fieldValue.includes(value);
                if (typeof fieldValue === 'string') return fieldValue.includes(String(value));
                return false;
            case 'MATCHES':
                if (typeof fieldValue !== 'string') return false;
                return new RegExp(value).test(fieldValue);
            default:
                return fieldValue === value;
        }
    }

    /**
     * Helper to safely extract nested property values from context object
     * @private
     */
    _getNestedValue(obj, path) {
        if (!obj || typeof obj !== 'object') return undefined;
        if (!path.includes('.')) return obj[path];
        return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
    }

    /**
     * Evaluates all active policy rules against execution context and returns matched rules
     * @param {Object} context 
     * @returns {Array<Object>} Matched rules array
     */
    evaluate(context = {}) {
        const sortedRules = this.getRules().filter(r => r.enabled);
        const matched = [];

        for (const rule of sortedRules) {
            if (this.evaluateCondition(rule.condition, context)) {
                matched.push(rule);
            }
        }

        return matched;
    }

    /**
     * Autonomous action execution engine. Executes matched rule actions with zero manual intervention required.
     * Generates full audit trail entries.
     * @param {Object} context Execution context (e.g. { vulnerabilitySeverity: 'CRITICAL', deploymentEnvironment: 'PRODUCTION' })
     * @returns {Object} Autonomous Execution Result
     */
    evaluateAndExecute(context = {}) {
        const timestamp = new Date().toISOString();
        const matchedRules = this.evaluate(context);

        const executionState = {
            blocked: false,
            blockReasons: [],
            blockCodes: [],
            generatedEvidence: [],
            notifications: [],
            remediationBranches: [],
            scoreRecalculations: []
        };

        const actionResults = [];

        for (const rule of matchedRules) {
            for (const action of rule.actions) {
                const handlerType = action.type.toUpperCase();
                const handler = this.actionHandlers.get(handlerType);

                if (handler) {
                    try {
                        const result = handler(action.params || {}, context, executionState);
                        actionResults.push({
                            ruleId: rule.id,
                            actionType: action.type,
                            success: true,
                            result
                        });
                    } catch (err) {
                        actionResults.push({
                            ruleId: rule.id,
                            actionType: action.type,
                            success: false,
                            error: err.message
                        });
                    }
                } else {
                    actionResults.push({
                        ruleId: rule.id,
                        actionType: action.type,
                        success: false,
                        error: `No action handler registered for type '${action.type}'`
                    });
                }
            }
        }

        const auditEntry = {
            auditId: `AUDIT-POLICY-${crypto.randomBytes(6).toString('hex').toUpperCase()}`,
            timestamp,
            contextSnapshot: {
                vulnerabilitySeverity: context.vulnerabilitySeverity,
                deploymentEnvironment: context.deploymentEnvironment,
                repository: context.repository || 'eaorcs-core'
            },
            matchedRulesCount: matchedRules.length,
            matchedRuleIds: matchedRules.map(r => r.id),
            blocked: executionState.blocked,
            blockReasons: executionState.blockReasons,
            generatedEvidenceCount: executionState.generatedEvidence.length,
            notificationsCount: executionState.notifications.length,
            remediationBranchesCount: executionState.remediationBranches.length,
            actionResults
        };

        this.auditTrail.push(auditEntry);

        return {
            passed: !executionState.blocked && matchedRules.length === 0,
            blocked: executionState.blocked,
            matchedRules,
            actionResults,
            executionState,
            auditEntry
        };
    }

    /**
     * Gets complete audit trail history
     * @param {Object} [filter] Optional filter criteria
     * @returns {Array<Object>}
     */
    getAuditTrail(filter = {}) {
        if (!filter || Object.keys(filter).length === 0) {
            return [...this.auditTrail];
        }

        return this.auditTrail.filter(entry => {
            if (filter.blocked !== undefined && entry.blocked !== filter.blocked) return false;
            if (filter.ruleId && !entry.matchedRuleIds.includes(filter.ruleId)) return false;
            return true;
        });
    }

    /**
     * Clears internal audit trail
     */
    clearAuditTrail() {
        this.auditTrail = [];
    }
}

module.exports = {
    AutonomousPolicyEngine,
    DEFAULT_POLICIES
};
