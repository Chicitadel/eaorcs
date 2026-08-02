/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Blueprint Generator (Stream G)
 * File           : BlueprintGenerator.js
 * Version        : 1.1.0
 * Author         : Enterprise Architecture Team & Ujomor Engineering
 * Organization   : Enterprise Architecture & Governance
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
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
 * Copyright (c) 2026 Enterprise Architecture & Governance
 * All Rights Reserved.
 ******************************************************************************/

const crypto = require('crypto');

class BlueprintGenerator {
    constructor() {
        this.lastGeneratedBlueprint = null;
    }

    /**
     * Synthesize formal EAORCS blueprint specifications (JSON & Markdown) from an interview transcript.
     * @param {Object} transcript - Transcript object from EngineeringInterviewEngine or structured Q&A export.
     * @returns {Object} Blueprint object containing { json, markdown }.
     */
    generateBlueprint(transcript) {
        if (!transcript || typeof transcript !== 'object') {
            throw new Error("Invalid transcript. Must provide a valid interview transcript object.");
        }

        const qaPairs = Array.isArray(transcript.qaPairs) ? transcript.qaPairs : [];
        const topic = transcript.topic || 'System Blueprint';
        const startedAt = transcript.startedAt || new Date().toISOString();

        // Extract answers by category or question index
        const getAnswerByCategory = (catKeyword) => {
            const pair = qaPairs.find(p => (p.category || '').toLowerCase().includes(catKeyword.toLowerCase()));
            return pair && pair.answer ? pair.answer : 'To be determined during detailed design phase.';
        };

        const visionAnswer = getAnswerByCategory('VISION');
        const archAnswer = getAnswerByCategory('ARCHITECTURE');
        const secAnswer = getAnswerByCategory('SECURITY');
        const opsAnswer = getAnswerByCategory('OPERATIONS');
        const infraAnswer = getAnswerByCategory('INFRASTRUCTURE');
        const compAnswer = getAnswerByCategory('COMPLIANCE');

        // Synthesize Bounded Contexts
        const boundedContexts = this._extractBoundedContexts(archAnswer, topic);

        // Synthesize Compliance Standards
        const complianceStandards = this._extractComplianceStandards(compAnswer);

        // Synthesize Security Controls
        const securityControls = [
            "Zero-Trust Access Control (RBAC/ABAC)",
            "TLS 1.3 Encryption in Transit & AES-256-GCM Encryption at Rest",
            "Immutable Audit Logging & Telemetry Tracing",
            "Secrets Vault Isolation & Denial of Hardcoded Credentials",
            secAnswer
        ].filter(Boolean);

        const blueprintJson = {
            specVersion: "1.1.0",
            blueprintId: `EAORCS-BP-${crypto.createHash('sha256').update(topic + startedAt).digest('hex').substring(0, 8).toUpperCase()}`,
            metadata: {
                title: topic,
                generatedAt: new Date().toISOString(),
                author: "Enterprise Architecture Authority",
                status: "FROZEN_BLUEPRINT_V1.1",
                governance: "UAIGOS Tokenized Standard v3.0"
            },
            executiveSummary: visionAnswer,
            systemArchitecture: {
                pattern: "Modular Bounded Context Monolith / Distributed Platform",
                boundedContexts: boundedContexts,
                communicationTopology: "Async Event Bus & Strict REST/gRPC Contracts"
            },
            securityAndGovernance: {
                securityControls: securityControls,
                complianceMatrix: complianceStandards,
                dataClassification: secAnswer.toLowerCase().includes('phi') ? 'RESTRICTED_PHI' : 'CONFIDENTIAL_ENTERPRISE'
            },
            operationalTargets: {
                availabilitySLA: "99.99%",
                performanceLatencyP95: "< 100ms",
                disasterRecoveryRTO: "< 15 minutes",
                disasterRecoveryRPO: "< 1 minute",
                details: opsAnswer
            },
            deploymentStrategy: {
                targetEnvironment: infraAnswer,
                containerization: "OCI Standard / Docker / Kubernetes",
                ciCdPipeline: "Automated Governance & Security Verification Gates"
            }
        };

        const blueprintMarkdown = this.formatBlueprintMarkdown(blueprintJson);

        this.lastGeneratedBlueprint = {
            json: blueprintJson,
            markdown: blueprintMarkdown
        };

        return this.lastGeneratedBlueprint;
    }

    /**
     * Format a canonical blueprint JSON object into EAORCS Blueprint v1.1 Markdown.
     * @param {Object} blueprintObj - Canonical blueprint object.
     * @returns {string} Formatted Markdown text.
     */
    formatBlueprintMarkdown(blueprintObj) {
        if (!blueprintObj || typeof blueprintObj !== 'object') {
            throw new Error("Invalid blueprint object provided for Markdown formatting.");
        }

        const json = blueprintObj.json || blueprintObj;
        const meta = json.metadata || {};
        const arch = json.systemArchitecture || {};
        const sec = json.securityAndGovernance || {};
        const ops = json.operationalTargets || {};
        const infra = json.deploymentStrategy || {};

        let md = `# EAORCS Blueprint v1.1 Specifications: ${meta.title || 'System Architecture'}\n\n`;
        md += `**Blueprint ID**: \`${json.blueprintId || 'EAORCS-BP-001'}\`  \n`;
        md += `**Spec Version**: \`${json.specVersion || '1.1.0'}\`  \n`;
        md += `**Status**: \`${meta.status || 'DRAFT'}\`  \n`;
        md += `**Generated At**: \`${meta.generatedAt || new Date().toISOString()}\`  \n`;
        md += `**Author**: ${meta.author || 'Enterprise Architecture Team'}  \n`;
        md += `**Governance Framework**: ${meta.governance || 'UAIGOS v3.0'}\n\n`;

        md += `---\n\n`;
        md += `## 1. Executive Summary & Vision Statement\n\n`;
        md += `${json.executiveSummary || 'No executive summary provided.'}\n\n`;

        md += `## 2. System Architecture & Bounded Contexts\n\n`;
        md += `**Architecture Pattern**: ${arch.pattern || 'Modular Monolith'}\n\n`;
        md += `**Communication Topology**: ${arch.communicationTopology || 'REST/gRPC'}\n\n`;
        md += `### Bounded Context Modules\n`;
        if (Array.isArray(arch.boundedContexts) && arch.boundedContexts.length > 0) {
            arch.boundedContexts.forEach(bc => {
                md += `- **${bc.name}**: ${bc.description}\n`;
            });
        } else {
            md += `- Module definitions pending.\n`;
        }
        md += `\n`;

        md += `## 3. Security Controls & Compliance Matrix\n\n`;
        md += `**Data Classification**: \`${sec.dataClassification || 'CONFIDENTIAL'}\`  \n\n`;
        md += `### Mandatory Security Controls\n`;
        if (Array.isArray(sec.securityControls) && sec.securityControls.length > 0) {
            sec.securityControls.forEach(ctrl => {
                md += `- ${ctrl}\n`;
            });
        }
        md += `\n### Target Compliance Frameworks\n`;
        if (Array.isArray(sec.complianceMatrix) && sec.complianceMatrix.length > 0) {
            sec.complianceMatrix.forEach(comp => {
                md += `- **${comp.standard}**: ${comp.mandate}\n`;
            });
        }
        md += `\n`;

        md += `## 4. Non-Functional & Operational Targets\n\n`;
        md += `- **Availability (SLA)**: ${ops.availabilitySLA || '99.99%'}\n`;
        md += `- **Target P95 Latency**: ${ops.performanceLatencyP95 || '< 100ms'}\n`;
        md += `- **Disaster Recovery RTO**: ${ops.disasterRecoveryRTO || '< 15 mins'}\n`;
        md += `- **Disaster Recovery RPO**: ${ops.disasterRecoveryRPO || '< 1 min'}\n`;
        md += `- **Operational Overview**: ${ops.details || 'Standard HA metrics'}\n\n`;

        md += `## 5. Deployment Topology & Infrastructure Strategy\n\n`;
        md += `- **Target Environment**: ${infra.targetEnvironment || 'Cloud Native'}\n`;
        md += `- **Containerization & Runtime**: ${infra.containerization || 'Kubernetes / OCI'}\n`;
        md += `- **CI/CD Quality Gates**: ${infra.ciCdPipeline || 'Automated Security & Governance Validation'}\n\n`;

        md += `---\n\n`;
        md += `*Signatures: Enterprise Architecture Authority | Security Governance Authority*\n`;

        return md;
    }

    /**
     * Parse text into array of bounded context objects.
     * @private
     */
    _extractBoundedContexts(archAnswer, topic) {
        if (!archAnswer || archAnswer.length < 5) {
            return [
                { name: "Core Domain Engine", description: `Primary logic processing context for ${topic}` },
                { name: "Identity & Access Context", description: "Authentication, authorization, and tenant management" },
                { name: "Audit & Observability Context", description: "Telemetry, metric logging, and compliance trails" }
            ];
        }

        const parts = archAnswer.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
        if (parts.length > 1) {
            return parts.map((p, idx) => ({
                name: p.charAt(0).toUpperCase() + p.slice(1),
                description: `Bounded context module derived from requirements: ${p}`
            }));
        }

        return [
            { name: "Primary Domain Services", description: archAnswer },
            { name: "Security & Governance Context", description: "Access control, auditing, and secret protection" },
            { name: "Integration Context", description: "External API and storage communication layers" }
        ];
    }

    /**
     * Extract compliance framework references from text.
     * @private
     */
    _extractComplianceStandards(compAnswer) {
        const standards = [];
        const text = (compAnswer || '').toUpperCase();

        if (text.includes('ISO') || text.includes('27001')) {
            standards.push({ standard: 'ISO 27001', mandate: 'Information Security Management System (ISMS)' });
        }
        if (text.includes('HIPAA')) {
            standards.push({ standard: 'HIPAA', mandate: 'Protected Health Information (PHI) Privacy & Security Rule' });
        }
        if (text.includes('PCI') || text.includes('CARD')) {
            standards.push({ standard: 'PCI-DSS 4.0', mandate: 'Payment Card Industry Data Security Standard' });
        }
        if (text.includes('NIST') || text.includes('FEDRAMP')) {
            standards.push({ standard: 'NIST SP 800-53', mandate: 'Security and Privacy Controls for Federal Information Systems' });
        }
        if (text.includes('SOC')) {
            standards.push({ standard: 'SOC 2 Type II', mandate: 'Trust Services Criteria for Security, Availability, and Confidentiality' });
        }

        if (standards.length === 0) {
            standards.push(
                { standard: 'ISO 27001', mandate: 'Information Security Standard Baseline' },
                { standard: 'SOC 2 Type II', mandate: 'Operational Trust Criteria' }
            );
        }

        return standards;
    }
}

module.exports = BlueprintGenerator;
