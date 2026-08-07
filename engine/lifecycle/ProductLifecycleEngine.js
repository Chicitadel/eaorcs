/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Product Lifecycle Engine
 * File           : ProductLifecycleEngine.js
 * Version        : 2026.3.1-LTS
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
 * CORP: Layer G — Product Lifecycle
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

const crypto = require('crypto');

class ProductLifecycleEngine {
    constructor() {
        this.stages = new Map([
            ['Discovery', {
                stageIndex: 1,
                stage: 'Discovery',
                description: 'Problem space exploration, customer need discovery, and market positioning',
                inputs: ['Business Objectives', 'Customer Pain Points', 'Market Analysis', 'Regulatory Drivers'],
                outputs: ['Product Brief', 'Initial Value Proposition', 'Discovery Synthesis Report'],
                evidence: ['Customer Interview Transcripts Hash', 'Discovery Gate Approval'],
                responsibleRole: 'Product Owner',
                exitCriteria: [
                    'Target problem validated by >= 10 enterprise stakeholders',
                    'Initial product charter approved by Governance Board',
                    'Market feasibility score >= 80%'
                ]
            }],
            ['Feasibility', {
                stageIndex: 2,
                stage: 'Feasibility',
                description: 'Technical, financial, and regulatory feasibility analysis',
                inputs: ['Product Brief', 'Architectural Constraints', 'Budget Allocations', 'Compliance Matrix'],
                outputs: ['Feasibility Study', 'Initial Risk Register', 'Resource & Cost Model'],
                evidence: ['Cost-Benefit Model Hash', 'Technical Risk Clearance'],
                responsibleRole: 'Enterprise Business Analyst',
                exitCriteria: [
                    'Positive ROI projection confirmed',
                    'Technical proof-of-concept validated',
                    'Risk mitigation strategy approved'
                ]
            }],
            ['Architecture', {
                stageIndex: 3,
                stage: 'Architecture',
                description: 'System architecture design, contract freeze, and threat modeling',
                inputs: ['Product Brief', 'Non-Functional Requirements', 'Enterprise Standards'],
                outputs: ['Architecture Decision Records (ADRs)', 'System Topology Spec', 'Interface Contracts'],
                evidence: ['Architecture Review Board (ARB) Sign-off', 'Threat Model Hash'],
                responsibleRole: 'Lead Enterprise Architect',
                exitCriteria: [
                    'ARB sign-off achieved',
                    'Threat model completed with zero unmitigated critical risks',
                    'Public API facades frozen'
                ]
            }],
            ['Development', {
                stageIndex: 4,
                stage: 'Development',
                description: 'Software construction, unit test implementation, and modular engineering',
                inputs: ['ADRs', 'Interface Contracts', 'User Stories', 'Acceptance Test Suites'],
                outputs: ['Source Code Repository', 'Unit Test Suite', 'Build Artifacts'],
                evidence: ['Cryptographic Commit Signatures', 'CI Build Log Hashes', 'Peer Code Review Proofs'],
                responsibleRole: 'Lead Software Engineer',
                exitCriteria: [
                    '100% unit tests passing',
                    'Code coverage >= 90%',
                    'Peer review approval by 2 senior engineers'
                ]
            }],
            ['Testing', {
                stageIndex: 5,
                stage: 'Testing',
                description: 'System integration, end-to-end testing, and performance validation',
                inputs: ['Build Artifacts', 'Integration Test Suites', 'Performance SLA Definitions'],
                outputs: ['Test Execution Reports', 'Defect Log', 'Performance Benchmark Certificate'],
                evidence: ['Automated Test Suite Execution Log Hash', 'Performance Benchmark Hash'],
                responsibleRole: 'Quality Assurance Lead',
                exitCriteria: [
                    'Zero P0/P1 defects remaining',
                    'All acceptance criteria validated',
                    'Latency and throughput meet SLA targets'
                ]
            }],
            ['Security', {
                stageIndex: 6,
                stage: 'Security',
                description: 'Vulnerability assessment, SAST/DAST, dependency audit, and ISO 27001 check',
                inputs: ['Compiled Packages', 'Threat Model', 'Software Bill of Materials (SBOM)'],
                outputs: ['Security Audit Clearance', 'Penetration Test Report', 'Compliance Certificate'],
                evidence: ['SAST/DAST Clearance Hashes', 'ISO 27001 Verification Artifact'],
                responsibleRole: 'Chief Information Security Officer (CISO)',
                exitCriteria: [
                    'Zero critical/high vulnerabilities',
                    'SBOM verification 100% clean',
                    'Formal security clearance signed'
                ]
            }],
            ['Staging', {
                stageIndex: 7,
                stage: 'Staging',
                description: 'Pre-production staging verification, configuration validation, and UAT',
                inputs: ['Security Cleared Package', 'Staging Environment Configuration'],
                outputs: ['Staging Deployment Log', 'User Acceptance Test (UAT) Sign-off'],
                evidence: ['Staging Deployment Audit Log', 'UAT Sign-off Hash'],
                responsibleRole: 'Release Manager',
                exitCriteria: [
                    'UAT sign-off completed by business owner',
                    'Environment parity with production verified',
                    'Automated rollback mechanism tested'
                ]
            }],
            ['Release', {
                stageIndex: 8,
                stage: 'Release',
                description: 'Production deployment, artifact publishing, and Digital Product Passport freeze',
                inputs: ['Staging Approved Package', 'Release Notes', 'Rollback Procedure'],
                outputs: ['Live Production Deployment', 'Digital Product Passport (DPP)', 'Release Announcement'],
                evidence: ['Cryptographic Release Signature', 'Immutable Manifest Hash'],
                responsibleRole: 'Deployment Engineering Lead',
                exitCriteria: [
                    'Production deployment executed cleanly',
                    'Health checks 100% green',
                    'Digital Product Passport generated and signed'
                ]
            }],
            ['Onboarding', {
                stageIndex: 9,
                stage: 'Onboarding',
                description: 'Tenant provisioning, identity claim binding, and customer activation',
                inputs: ['Production Release', 'Tenant Provisioning Specification', 'Documentation'],
                outputs: ['Provisioned Tenant Accounts', 'SSO & IAM Bindings', 'Onboarding Package'],
                evidence: ['Tenant Provisioning Audit Hash', 'Identity Binding Verification Proof'],
                responsibleRole: 'Customer Success Manager',
                exitCriteria: [
                    'Tenant credentials & keys issued securely',
                    'First admin login confirmed',
                    'Initial telemetry pipeline active'
                ]
            }],
            ['Operations', {
                stageIndex: 10,
                stage: 'Operations',
                description: 'Live operational monitoring, SLA tracking, and real-time observability',
                inputs: ['Live Production Environment', 'SLA Definitions', 'Observability Stack'],
                outputs: ['Telemetry Stream Logs', 'SLA Compliance Reports', 'Incident Audit Logs'],
                evidence: ['Telemetry Hash Chain', 'Monthly SLA Compliance Certificate'],
                responsibleRole: 'Site Reliability Engineer (SRE) Lead',
                exitCriteria: [
                    'Availability SLA >= 99.99% achieved',
                    'Mean Time to Detect (MTTD) <= 5 mins',
                    'Continuous telemetry verification passing'
                ]
            }],
            ['Maintenance', {
                stageIndex: 11,
                stage: 'Maintenance',
                description: 'Continuous maintenance, bug fixes, non-breaking updates, and security patching',
                inputs: ['Field Bug Reports', 'Security Patch Notices', 'Refactoring Backlog'],
                outputs: ['Maintenance Patches', 'Updated Documentation', 'Changelogs'],
                evidence: ['Patch Verification Hash', 'Regression Test Sign-off'],
                responsibleRole: 'Product Maintenance Lead',
                exitCriteria: [
                    'Zero-downtime patch deployment validated',
                    'All regression suites green',
                    'Updated release notes published'
                ]
            }],
            ['Deprecation', {
                stageIndex: 12,
                stage: 'Deprecation',
                description: 'Formal product deprecation notice, migration assistance, and feature lock',
                inputs: ['End-of-Life (EOL) Directive', 'Migration Guide', 'Alternative Services Matrix'],
                outputs: ['Deprecation Notice', 'Migration Toolkit', 'Read-Only Mode Schedule'],
                evidence: ['Customer Notification Delivery Logs', 'EOL Governance Sign-off'],
                responsibleRole: 'Product Strategy Director',
                exitCriteria: [
                    '180-day advance deprecation notice delivered to all tenants',
                    'Migration paths to successor platform verified',
                    'New tenant registration disabled'
                ]
            }],
            ['Retirement', {
                stageIndex: 13,
                stage: 'Retirement',
                description: 'Complete decommissioning, tenant data export/purging, and final evidence freeze',
                inputs: ['Deprecated Product Instance', 'Data Retention & Deletion Policy'],
                outputs: ['Archived Compliance Vault', 'Decommissioning Report', 'Final OSAP Passport'],
                evidence: ['Data Sanitization Certificates (NIST SP 800-88)', 'Final Cryptographic Evidence Bundle'],
                responsibleRole: 'Enterprise Governance Authority',
                exitCriteria: [
                    'All tenant data exported or securely wiped per NIST SP 800-88',
                    'Infrastructure fully decommissioned',
                    'Final audit evidence frozen and archived'
                ]
            }]
        ]);
    }

    /**
     * Get details for a specific lifecycle stage.
     * Supports case-insensitive name matching.
     * @param {string} stageName - Name of the lifecycle stage (Discovery .. Retirement)
     * @returns {Object|null} Stage details object containing inputs, outputs, evidence, responsibleRole, exitCriteria
     */
    getLifecycleStageDetails(stageName) {
        if (!stageName || typeof stageName !== 'string') {
            return null;
        }

        const normalizedInput = stageName.trim().toLowerCase();
        
        for (const [name, details] of this.stages.entries()) {
            if (name.toLowerCase() === normalizedInput) {
                return {
                    ...details,
                    inputs: [...details.inputs],
                    outputs: [...details.outputs],
                    evidence: [...details.evidence],
                    exitCriteria: [...details.exitCriteria]
                };
            }
        }

        return null;
    }

    /**
     * Get list of all 13 supported stage names in canonical order.
     * @returns {Array<string>}
     */
    getStageNames() {
        return Array.from(this.stages.values())
            .sort((a, b) => a.stageIndex - b.stageIndex)
            .map(s => s.stage);
    }

    /**
     * Get all 13 lifecycle stage detail objects ordered by stageIndex.
     * @returns {Array<Object>}
     */
    getAllLifecycleStages() {
        return Array.from(this.stages.values())
            .sort((a, b) => a.stageIndex - b.stageIndex)
            .map(details => ({
                ...details,
                inputs: [...details.inputs],
                outputs: [...details.outputs],
                evidence: [...details.evidence],
                exitCriteria: [...details.exitCriteria]
            }));
    }

    /**
     * Validate if a transition from one stage to another is sequential or valid.
     * @param {string} currentStage 
     * @param {string} targetStage 
     * @returns {Object} { valid: boolean, reason: string }
     */
    validateStageTransition(currentStage, targetStage) {
        const currentDetails = this.getLifecycleStageDetails(currentStage);
        const targetDetails = this.getLifecycleStageDetails(targetStage);

        if (!currentDetails) {
            return { valid: false, reason: `Unknown current stage: ${currentStage}` };
        }
        if (!targetDetails) {
            return { valid: false, reason: `Unknown target stage: ${targetStage}` };
        }

        const diff = targetDetails.stageIndex - currentDetails.stageIndex;

        if (diff === 1) {
            return { valid: true, reason: `Valid sequential transition from ${currentDetails.stage} to ${targetDetails.stage}` };
        } else if (diff === 0) {
            return { valid: false, reason: `Cannot transition to current stage (${currentDetails.stage})` };
        } else if (targetDetails.stage === 'Retirement') {
            return { valid: true, reason: `Emergency or early retirement transition allowed to ${targetDetails.stage}` };
        } else if (diff < 0) {
            return { valid: false, reason: `Backward transitions are prohibited (${currentDetails.stage} -> ${targetDetails.stage})` };
        } else {
            return { valid: false, reason: `Non-sequential stage jump prohibited (${currentDetails.stage} -> ${targetDetails.stage})` };
        }
    }

    /**
     * Evaluate stage gate readiness based on submitted evidence.
     * @param {string} stageName 
     * @param {Array<string>} submittedEvidence 
     * @returns {Object}
     */
    evaluateStageGate(stageName, submittedEvidence = []) {
        const details = this.getLifecycleStageDetails(stageName);
        if (!details) {
            return { passed: false, missingEvidence: [], reason: `Stage ${stageName} not found` };
        }

        const submittedSet = new Set(submittedEvidence.map(e => e.trim().toLowerCase()));
        const missing = details.evidence.filter(req => !submittedSet.has(req.toLowerCase()));

        return {
            stage: details.stage,
            stageIndex: details.stageIndex,
            responsibleRole: details.responsibleRole,
            passed: missing.length === 0,
            requiredEvidenceCount: details.evidence.length,
            submittedEvidenceCount: submittedEvidence.length,
            missingEvidence: missing,
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = ProductLifecycleEngine;
