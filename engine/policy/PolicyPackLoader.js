/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Industry Policy Pack Loader (Stream H)
 * File           : PolicyPackLoader.js
 * Version        : 2026.1-LTS (v1.0.0-FROZEN)
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Chicitadel / Air Roofers SASU
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Architecture Frozen (ADR-001)
 * - Regulatory Compliance Controls Enforced (ISO 27001, SOC 2, DORA, NIS2, EU AI Act)
 ******************************************************************************/

'use strict';

/**
 * Built-in Policy Pack Identifiers
 */
const BUILTIN_PACKS = Object.freeze({
    ISO_27001: 'ISO_27001',
    SOC_2: 'SOC_2',
    DORA: 'DORA',
    NIS2: 'NIS2',
    EU_AI_ACT: 'EU_AI_ACT'
});

/**
 * PolicyPackLoader
 * Loads, parses, validates, and evaluates enterprise industry regulatory policy packs.
 */
class PolicyPackLoader {
    constructor() {
        this.loadedPacks = new Map();
        this.initializeBuiltinPacks();
    }

    /**
     * Initializes pre-configured industry standard policy packs.
     */
    initializeBuiltinPacks() {
        // 1. ISO 27001:2022 Policy Pack
        this.registerPack({
            id: BUILTIN_PACKS.ISO_27001,
            name: 'ISO/IEC 27001:2022 Information Security Management',
            version: '2022.1.0',
            framework: 'ISO27001',
            controls: [
                {
                    controlId: 'A.5.1',
                    name: 'Policies for Information Security',
                    severity: 'HIGH',
                    evaluator: (ctx) => ctx.securityPolicyDefined === true,
                    remediation: 'Define and enforce documented organizational security policies.'
                },
                {
                    controlId: 'A.8.2',
                    name: 'Privileged Access Rights',
                    severity: 'CRITICAL',
                    evaluator: (ctx) => ctx.mfaEnabled === true && ctx.rbacEnforced === true,
                    remediation: 'Enforce MFA and RBAC for all privileged administrative access.'
                },
                {
                    controlId: 'A.8.28',
                    name: 'Secure Coding',
                    severity: 'HIGH',
                    evaluator: (ctx) => ctx.sastScanPassed === true && ctx.criticalVulnerabilities === 0,
                    remediation: 'Run automated SAST scanning and eliminate zero critical vulnerabilities before release.'
                },
                {
                    controlId: 'A.8.31',
                    name: 'Separation of Development, Test and Production',
                    severity: 'HIGH',
                    evaluator: (ctx) => ctx.environmentIsolated === true,
                    remediation: 'Isolate production environments from development and testing networks.'
                }
            ]
        });

        // 2. SOC 2 Type II Policy Pack
        this.registerPack({
            id: BUILTIN_PACKS.SOC_2,
            name: 'SOC 2 Type II Trust Services Criteria',
            version: '2026.1.0',
            framework: 'SOC2',
            controls: [
                {
                    controlId: 'CC6.1',
                    name: 'Logical Access Controls',
                    severity: 'CRITICAL',
                    evaluator: (ctx) => ctx.accessControlEnforced === true,
                    remediation: 'Implement logical access security preventing unauthorized access to infrastructure.'
                },
                {
                    controlId: 'CC6.8',
                    name: 'Vulnerability & Patch Management',
                    severity: 'HIGH',
                    evaluator: (ctx) => ctx.vulnerabilityScanDays <= 30 && ctx.unpatchedCriticalCount === 0,
                    remediation: 'Perform vulnerability scans at least monthly and patch critical CVEs within 14 days.'
                },
                {
                    controlId: 'CC7.2',
                    name: 'Change Management & Peer Review',
                    severity: 'HIGH',
                    evaluator: (ctx) => ctx.codeReviewRequired === true && ctx.signedCommits === true,
                    remediation: 'Require mandatory peer review and cryptographic commit signatures on all PRs.'
                },
                {
                    controlId: 'CC8.1',
                    name: 'Data Encryption at Rest & Transit',
                    severity: 'CRITICAL',
                    evaluator: (ctx) => ctx.tlsVersion >= 1.3 && ctx.dataEncryptedAtRest === true,
                    remediation: 'Enforce TLS 1.3+ in transit and AES-256-GCM encryption at rest.'
                }
            ]
        });

        // 3. DORA (Digital Operational Resilience Act) Policy Pack
        this.registerPack({
            id: BUILTIN_PACKS.DORA,
            name: 'DORA - Digital Operational Resilience Act (EU 2022/2554)',
            version: '2025.1.0',
            framework: 'DORA',
            controls: [
                {
                    controlId: 'DORA-ART-6',
                    name: 'ICT Risk Management Framework',
                    severity: 'CRITICAL',
                    evaluator: (ctx) => ctx.ictRiskFrameworkActive === true,
                    remediation: 'Establish and maintain a continuous ICT risk management framework.'
                },
                {
                    controlId: 'DORA-ART-17',
                    name: 'Major ICT-related Incident Classification & Reporting',
                    severity: 'HIGH',
                    evaluator: (ctx) => ctx.incidentReportingAutomated === true,
                    remediation: 'Automate major ICT incident detection and regulatory alert reporting.'
                },
                {
                    controlId: 'DORA-ART-24',
                    name: 'Digital Operational Resilience Testing',
                    severity: 'HIGH',
                    evaluator: (ctx) => ctx.resilienceTestingExecuted === true && ctx.chaosTestingDays <= 90,
                    remediation: 'Conduct operational resilience and vulnerability testing at least quarterly.'
                },
                {
                    controlId: 'DORA-ART-28',
                    name: 'ICT Third-Party Risk Management',
                    severity: 'CRITICAL',
                    evaluator: (ctx) => ctx.sbomVerified === true && ctx.vendorAuditCompleted === true,
                    remediation: 'Generate signed SBOMs and complete third-party dependency vendor risk audits.'
                }
            ]
        });

        // 4. NIS2 Directive Policy Pack
        this.registerPack({
            id: BUILTIN_PACKS.NIS2,
            name: 'NIS2 Directive - Network and Information Systems (EU 2022/2555)',
            version: '2024.2.0',
            framework: 'NIS2',
            controls: [
                {
                    controlId: 'NIS2-ART-21.2A',
                    name: 'Cyber Risk Analysis & Information System Security',
                    severity: 'CRITICAL',
                    evaluator: (ctx) => ctx.cyberRiskAnalysisCompleted === true,
                    remediation: 'Conduct documented cyber risk assessments across critical operational systems.'
                },
                {
                    controlId: 'NIS2-ART-21.2D',
                    name: 'Supply Chain Security & Supplier Assurance',
                    severity: 'HIGH',
                    evaluator: (ctx) => ctx.supplyChainAuditPassed === true,
                    remediation: 'Enforce software supply chain integrity checking for external packages.'
                },
                {
                    controlId: 'NIS2-ART-21.2G',
                    name: 'Basic Cyber Hygiene & Training',
                    severity: 'MEDIUM',
                    evaluator: (ctx) => ctx.cyberHygienePolicyActive === true,
                    remediation: 'Enforce basic cyber hygiene controls and credential rotation policies.'
                },
                {
                    controlId: 'NIS2-ART-21.2J',
                    name: 'Multi-Factor Authentication & Secured Voice/Data/Video',
                    severity: 'CRITICAL',
                    evaluator: (ctx) => ctx.mfaEnforced === true && ctx.zeroTrustEnabled === true,
                    remediation: 'Enforce zero-trust multi-factor authentication across all operational access points.'
                }
            ]
        });

        // 5. EU AI Act Policy Pack
        this.registerPack({
            id: BUILTIN_PACKS.EU_AI_ACT,
            name: 'EU Artificial Intelligence Act (EU 2024/1689)',
            version: '2024.1.0',
            framework: 'EU_AI_ACT',
            controls: [
                {
                    controlId: 'AIA-ART-9',
                    name: 'Risk Management System for High-Risk AI Systems',
                    severity: 'CRITICAL',
                    evaluator: (ctx) => ctx.aiRiskManagementActive === true,
                    remediation: 'Establish a continuous risk management system throughout the AI lifecycle.'
                },
                {
                    controlId: 'AIA-ART-11',
                    name: 'Technical Documentation & Architecture Attestation',
                    severity: 'HIGH',
                    evaluator: (ctx) => ctx.technicalDocumentationAvailable === true,
                    remediation: 'Maintain updated technical documentation demonstrating AI compliance.'
                },
                {
                    controlId: 'AIA-ART-12',
                    name: 'Record-Keeping & Automated Execution Logging',
                    severity: 'CRITICAL',
                    evaluator: (ctx) => ctx.aiAuditLoggingActive === true && ctx.immutableLogs === true,
                    remediation: 'Enable immutable audit logging for all AI model inputs, outputs, and decisions.'
                },
                {
                    controlId: 'AIA-ART-14',
                    name: 'Human Oversight Capability',
                    severity: 'CRITICAL',
                    evaluator: (ctx) => ctx.humanReviewEngineActive === true || ctx.humanInTheLoop === true,
                    remediation: 'Provide human-in-the-loop review mechanisms for automated AI decisions.'
                },
                {
                    controlId: 'AIA-ART-15',
                    name: 'Accuracy, Robustness & Cybersecurity',
                    severity: 'HIGH',
                    evaluator: (ctx) => ctx.aiAccuracyScore >= 0.90 && ctx.hallucinationGuardrailsActive === true,
                    remediation: 'Validate AI model accuracy metrics and active hallucination prevention guardrails.'
                }
            ]
        });
    }

    /**
     * Validates policy pack structure.
     * @param {Object} pack 
     */
    validatePack(pack) {
        if (!pack || typeof pack !== 'object') throw new Error('Policy pack must be an object');
        if (!pack.id) throw new Error('Policy pack missing required id');
        if (!pack.name) throw new Error('Policy pack missing required name');
        if (!Array.isArray(pack.controls)) throw new Error('Policy pack controls must be an array');
    }

    /**
     * Registers or overrides a policy pack.
     * @param {Object} pack 
     */
    registerPack(pack) {
        this.validatePack(pack);
        this.loadedPacks.set(pack.id, pack);
        return pack;
    }

    /**
     * Gets a loaded policy pack by ID.
     * @param {string} packId 
     * @returns {Object} Policy Pack
     */
    getPack(packId) {
        const pack = this.loadedPacks.get(packId);
        if (!pack) throw new Error(`Policy pack [${packId}] is not loaded`);
        return pack;
    }

    /**
     * Returns all loaded policy packs.
     * @returns {Array<Object>}
     */
    listPacks() {
        return Array.from(this.loadedPacks.values()).map(p => ({
            id: p.id,
            name: p.name,
            version: p.version,
            framework: p.framework,
            totalControls: p.controls.length
        }));
    }

    /**
     * Evaluates a target system context against specified policy packs.
     * @param {Object} targetContext System metrics/configuration context object
     * @param {Array<string>} activePackIds Array of policy pack IDs to evaluate
     * @returns {Object} Evaluation report
     */
    evaluateTarget(targetContext = {}, activePackIds = Object.values(BUILTIN_PACKS)) {
        if (typeof targetContext === 'string') {
            const packId = targetContext;
            targetContext = activePackIds || {};
            activePackIds = [packId];
        } else if (typeof activePackIds === 'string') {
            activePackIds = [activePackIds];
        }
        const results = [];
        let totalControlsEvaluated = 0;
        let passedControlsCount = 0;
        let failedControlsCount = 0;

        for (const packId of activePackIds) {
            const pack = this.getPack(packId);
            const packResults = [];

            for (const control of pack.controls) {
                totalControlsEvaluated++;
                let passed = false;
                let error = null;

                try {
                    passed = Boolean(control.evaluator(targetContext));
                } catch (err) {
                    error = err.message;
                }

                if (passed) passedControlsCount++;
                else failedControlsCount++;

                packResults.push({
                    controlId: control.controlId,
                    name: control.name,
                    severity: control.severity,
                    passed,
                    error,
                    remediation: passed ? null : control.remediation
                });
            }

            results.push({
                packId: pack.id,
                packName: pack.name,
                framework: pack.framework,
                controls: packResults,
                packPassed: packResults.every(c => c.passed)
            });
        }

        const complianceScorePct = totalControlsEvaluated > 0
            ? Number(((passedControlsCount / totalControlsEvaluated) * 100).toFixed(2))
            : 100.0;

        return {
            overallPassed: failedControlsCount === 0,
            complianceScorePct,
            totalControlsEvaluated,
            passedControlsCount,
            failedControlsCount,
            packReports: results,
            evaluatedAt: new Date().toISOString()
        };
    }
}

module.exports = {
    PolicyPackLoader,
    BUILTIN_PACKS
};
