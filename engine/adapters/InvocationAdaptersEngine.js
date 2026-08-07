/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Universal Invocation Adapters Architecture
 * File           : InvocationAdaptersEngine.js
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

const UnifiedResponseModelEngine = require('./UnifiedResponseModelEngine');

class InvocationAdaptersEngine {
    constructor(options = {}) {
        this.options = options;
        this.responseModel = new UnifiedResponseModelEngine(options);
    }

    /**
     * Executes a capability through a specific surface adapter.
     * 
     * @param {Object} capabilityTarget Core capability handler or kernel.
     * @param {string} adapterType Surface adapter ("CliAdapter", "DesktopUiAdapter", "WebUiAdapter", "RestApiAdapter", "SdkAdapter", "McpAgentAdapter", "GitHookAdapter", "CiAdapter").
     * @param {Object} context Execution context.
     * @returns {Object} Surface-formatted Unified Response Model.
     */
    executeAdapter(capabilityTarget, adapterType, context = {}) {
        const canonicalResult = capabilityTarget.executeLifecycle ? capabilityTarget.executeLifecycle(context.projectRoot || process.cwd()) : capabilityTarget;
        const unifiedModel = this.responseModel.formatCanonicalResponse(canonicalResult, context);

        switch (adapterType) {
            case 'CliAdapter':
                return {
                    surface: 'CLI',
                    renderedOutput: `✓ Project: ${unifiedModel.summary.projectName}\n✓ Score: ${unifiedModel.summary.overallScorePct}%\n✓ Recommendations: ${unifiedModel.recommendations.length}`,
                    unifiedModel
                };

            case 'DesktopUiAdapter':
            case 'WebUiAdapter':
                return {
                    surface: adapterType === 'DesktopUiAdapter' ? 'DESKTOP_UI' : 'WEB_UI',
                    componentData: {
                        cards: [
                            { title: 'Project Score', value: `${unifiedModel.summary.overallScorePct}%` },
                            { title: 'Audit Trail Hash', value: unifiedModel.evidence.auditTrailHash }
                        ]
                    },
                    unifiedModel
                };

            case 'RestApiAdapter':
                return {
                    surface: 'REST_API',
                    statusCode: 200,
                    body: unifiedModel,
                    unifiedModel
                };

            case 'SdkAdapter':
                return {
                    surface: 'PUBLIC_SDK',
                    result: unifiedModel,
                    unifiedModel
                };

            case 'McpAgentAdapter':
                return {
                    surface: 'MCP_AGENT',
                    agentFormattedMessage: `EAORCS Capability Executed. Overall Score: ${unifiedModel.summary.overallScorePct}%. Evidence Hash: ${unifiedModel.evidence.auditTrailHash}`,
                    unifiedModel
                };

            case 'GitHookAdapter':
            case 'CiAdapter':
                return {
                    surface: adapterType === 'GitHookAdapter' ? 'GIT_HOOK' : 'CI_CD',
                    exitCode: unifiedModel.summary.overallScorePct >= 80 ? 0 : 1,
                    unifiedModel
                };

            default:
                throw new Error(`Unknown adapter type: ${adapterType}`);
        }
    }
}

module.exports = InvocationAdaptersEngine;
