/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Traceability Engine (Stream C)
 * File           : RequirementMatrix.js
 * Version        : 2026.1.0-LTS
 * Author         : Enterprise Architecture Governance Committee & Ujomor Systems
 * Organization   : Ujomor Systems Engineering
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : GOVERNMENT | ENTERPRISE | INTERNAL
 *
 * Governance:
 * - Corporate Governed
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
 * Copyright (c) 2026 Ujomor Systems Engineering
 * All Rights Reserved.
 ******************************************************************************/

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * RequirementMatrix - N-Way Traceability Engine mapping:
 * Requirement -> Feature -> Code -> Test -> Evidence -> Deploy -> Cert
 */
class RequirementMatrix {
    constructor(options = {}) {
        this.options = {
            autoValidateFiles: options.autoValidateFiles || false,
            baseDir: options.baseDir || process.cwd(),
            ...options
        };
        
        // Map of reqId -> requirement chain definition
        this.requirements = new Map();
        
        // Allowed 7 stages in canonical N-way traceability chain
        this.STAGE_NAMES = [
            'requirement',
            'feature',
            'code',
            'test',
            'evidence',
            'deploy',
            'cert'
        ];
    }

    /**
     * Safely normalizes input value to non-empty array of trimmed strings
     */
    _normalizeArray(input) {
        if (!input) return [];
        if (Array.isArray(input)) {
            return input.map(item => String(item).trim()).filter(Boolean);
        }
        if (typeof input === 'string') {
            return [input.trim()].filter(Boolean);
        }
        if (typeof input === 'object') {
            return Object.values(input).map(v => String(v).trim()).filter(Boolean);
        }
        return [String(input).trim()].filter(Boolean);
    }

    /**
     * Maps or updates a requirement with its associated 6 downstream traceability stages.
     * @param {string} reqId - Unique requirement ID (e.g. 'REQ-AUDIT-001')
     * @param {object} mapping - Stage mapping definition or metadata
     */
    mapRequirement(reqId, mapping = {}) {
        if (!reqId || typeof reqId !== 'string') {
            throw new TypeError('Requirement ID must be a non-empty string');
        }

        const normalizedReqId = reqId.trim();
        const existing = this.requirements.get(normalizedReqId) || {
            reqId: normalizedReqId,
            name: normalizedReqId,
            description: '',
            domain: 'CORE',
            priority: 'P1',
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            stages: {
                requirement: [normalizedReqId],
                feature: [],
                code: [],
                test: [],
                evidence: [],
                deploy: [],
                cert: []
            }
        };

        // Update metadata if provided
        if (mapping.name || mapping.title) existing.name = (mapping.name || mapping.title).trim();
        if (mapping.description) existing.description = mapping.description.trim();
        if (mapping.domain) existing.domain = mapping.domain.trim();
        if (mapping.priority) existing.priority = mapping.priority.trim();
        if (mapping.status) existing.status = mapping.status.trim();

        // Merge/update stage links dynamically
        const featureLinks = this._normalizeArray(mapping.feature || mapping.features || mapping.featureIds);
        const codeLinks = this._normalizeArray(mapping.code || mapping.codeFiles || mapping.codePaths || mapping.files);
        const testLinks = this._normalizeArray(mapping.test || mapping.testFiles || mapping.testPaths || mapping.tests);
        const evidenceLinks = this._normalizeArray(mapping.evidence || mapping.evidenceFiles || mapping.evidenceIds);
        const deployLinks = this._normalizeArray(mapping.deploy || mapping.deployConfigs || mapping.deployments);
        const certLinks = this._normalizeArray(mapping.cert || mapping.certificates || mapping.certIds || mapping.certs);

        // Deduplicate and append links
        existing.stages.requirement = Array.from(new Set([...existing.stages.requirement, normalizedReqId]));
        existing.stages.feature = Array.from(new Set([...existing.stages.feature, ...featureLinks]));
        existing.stages.code = Array.from(new Set([...existing.stages.code, ...codeLinks]));
        existing.stages.test = Array.from(new Set([...existing.stages.test, ...testLinks]));
        existing.stages.evidence = Array.from(new Set([...existing.stages.evidence, ...evidenceLinks]));
        existing.stages.deploy = Array.from(new Set([...existing.stages.deploy, ...deployLinks]));
        existing.stages.cert = Array.from(new Set([...existing.stages.cert, ...certLinks]));

        existing.updatedAt = new Date().toISOString();

        this.requirements.set(normalizedReqId, existing);
        return this.getTraceabilityChain(normalizedReqId);
    }

    /**
     * Retrieves full 7-stage traceability chain and coverage breakdown for a requirement.
     * @param {string} reqId - Unique requirement ID
     * @returns {object} Full chain details with completeness status
     */
    getTraceabilityChain(reqId) {
        if (!reqId || typeof reqId !== 'string') {
            throw new TypeError('Requirement ID must be a non-empty string');
        }

        const normalizedReqId = reqId.trim();
        const record = this.requirements.get(normalizedReqId);

        if (!record) {
            return {
                reqId: normalizedReqId,
                found: false,
                isComplete: false,
                missingStages: [...this.STAGE_NAMES],
                coveragePercent: 0,
                chain: {
                    requirement: [],
                    feature: [],
                    code: [],
                    test: [],
                    evidence: [],
                    deploy: [],
                    cert: []
                }
            };
        }

        const stageCounts = {};
        const missingStages = [];
        let filledStageCount = 0;

        for (const stage of this.STAGE_NAMES) {
            const list = record.stages[stage] || [];
            stageCounts[stage] = list.length;
            if (list.length > 0) {
                filledStageCount++;
            } else {
                missingStages.push(stage);
            }
        }

        const coveragePercent = Math.round((filledStageCount / this.STAGE_NAMES.length) * 10000) / 100;
        const isComplete = missingStages.length === 0;

        return {
            reqId: record.reqId,
            found: true,
            name: record.name,
            description: record.description,
            domain: record.domain,
            priority: record.priority,
            status: record.status,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
            chain: { ...record.stages },
            stageCounts,
            missingStages,
            filledStageCount,
            totalStages: this.STAGE_NAMES.length,
            coveragePercent,
            isComplete
        };
    }

    /**
     * Evaluates comprehensive N-way traceability coverage metrics across all requirements.
     * @returns {object} Overall coverage stats and broken chain breakdown
     */
    evaluateCoverage() {
        const totalRequirements = this.requirements.size;
        if (totalRequirements === 0) {
            return {
                totalRequirements: 0,
                fullyTracedRequirements: 0,
                partiallyTracedRequirements: 0,
                untracedRequirements: 0,
                overallCoveragePercent: 0,
                averageStageCompletionPercent: 0,
                stageCoverage: this.STAGE_NAMES.reduce((acc, s) => ({ ...acc, [s]: { count: 0, percent: 0 } }), {}),
                brokenChains: []
            };
        }

        let fullyTracedCount = 0;
        let partiallyTracedCount = 0;
        let untracedCount = 0;
        let totalStageHits = 0;

        const stageHitsMap = this.STAGE_NAMES.reduce((acc, s) => ({ ...acc, [s]: 0 }), {});
        const brokenChains = [];

        for (const [reqId] of this.requirements) {
            const chain = this.getTraceabilityChain(reqId);
            
            for (const stage of this.STAGE_NAMES) {
                if (chain.chain[stage] && chain.chain[stage].length > 0) {
                    stageHitsMap[stage]++;
                    totalStageHits++;
                }
            }

            if (chain.isComplete) {
                fullyTracedCount++;
            } else if (chain.filledStageCount > 1) {
                partiallyTracedCount++;
                brokenChains.push({
                    reqId: chain.reqId,
                    name: chain.name,
                    coveragePercent: chain.coveragePercent,
                    missingStages: chain.missingStages,
                    filledStagesCount: chain.filledStageCount
                });
            } else {
                untracedCount++;
                brokenChains.push({
                    reqId: chain.reqId,
                    name: chain.name,
                    coveragePercent: chain.coveragePercent,
                    missingStages: chain.missingStages,
                    filledStagesCount: chain.filledStageCount
                });
            }
        }

        const overallCoveragePercent = Math.round((fullyTracedCount / totalRequirements) * 10000) / 100;
        const maxPossibleStageHits = totalRequirements * this.STAGE_NAMES.length;
        const averageStageCompletionPercent = Math.round((totalStageHits / maxPossibleStageHits) * 10000) / 100;

        const stageCoverage = {};
        for (const stage of this.STAGE_NAMES) {
            const count = stageHitsMap[stage];
            stageCoverage[stage] = {
                count,
                total: totalRequirements,
                percent: Math.round((count / totalRequirements) * 10000) / 100
            };
        }

        return {
            totalRequirements,
            fullyTracedRequirements: fullyTracedCount,
            partiallyTracedRequirements: partiallyTracedCount,
            untracedRequirements: untracedCount,
            overallCoveragePercent,
            averageStageCompletionPercent,
            stageCoverage,
            brokenChains
        };
    }

    /**
     * Generates a structured N-Way Traceability Matrix report with markdown output.
     * @param {object} options - Options including outputPath
     * @returns {object} Report summary and markdown content
     */
    generateMatrixReport(options = {}) {
        const stats = this.evaluateCoverage();
        const timestamp = new Date().toISOString();

        let md = `# EAORCS N-Way Traceability Matrix Report\n\n`;
        md += `**Generated**: ${timestamp}\n`;
        md += `**Total Requirements**: ${stats.totalRequirements}\n`;
        md += `**100% Fully Traced**: ${stats.fullyTracedRequirements} (${stats.overallCoveragePercent}%)\n`;
        md += `**Average Chain Completion**: ${stats.averageStageCompletionPercent}%\n\n`;

        md += `## 1. Stage Coverage Breakdown\n\n`;
        md += `| Stage | Mapped Requirements | Total | Coverage % |\n`;
        md += `| :--- | :---: | :---: | :---: |\n`;
        for (const stage of this.STAGE_NAMES) {
            const sc = stats.stageCoverage[stage];
            md += `| **${stage.toUpperCase()}** | ${sc.count} | ${sc.total} | ${sc.percent}% |\n`;
        }
        md += `\n`;

        md += `## 2. N-Way Requirement Chains\n\n`;
        md += `| Req ID | Name | Feature | Code | Test | Evidence | Deploy | Cert | Complete? |\n`;
        md += `| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |\n`;

        for (const [reqId] of this.requirements) {
            const c = this.getTraceabilityChain(reqId);
            const statusSymbol = c.isComplete ? '✅ YES' : '❌ NO';
            md += `| **${c.reqId}** | ${c.name} | ${c.chain.feature.length} | ${c.chain.code.length} | ${c.chain.test.length} | ${c.chain.evidence.length} | ${c.chain.deploy.length} | ${c.chain.cert.length} | ${statusSymbol} |\n`;
        }

        if (stats.brokenChains.length > 0) {
            md += `\n## 3. Incomplete / Broken Chains (${stats.brokenChains.length})\n\n`;
            for (const bc of stats.brokenChains) {
                md += `- **${bc.reqId}** (${bc.name}): Missing stages -> \`${bc.missingStages.join(', ')}\` (${bc.coveragePercent}% complete)\n`;
            }
        }

        const reportObject = {
            timestamp,
            stats,
            markdown: md,
            requirementsCount: this.requirements.size
        };

        if (options.outputPath) {
            const resolvedPath = path.resolve(this.options.baseDir, options.outputPath);
            fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
            fs.writeFileSync(resolvedPath, md, 'utf8');
            reportObject.outputPath = resolvedPath;
        }

        return reportObject;
    }

    /**
     * Exports raw matrix state as JSON serializable object
     */
    exportMatrix() {
        const data = [];
        for (const [reqId, record] of this.requirements) {
            data.push({ ...record });
        }
        return {
            version: '2026.1.0',
            exportedAt: new Date().toISOString(),
            requirements: data
        };
    }

    /**
     * Imports matrix state from serializable JSON object
     */
    importMatrix(data) {
        if (!data || !Array.isArray(data.requirements)) {
            throw new Error('Invalid import format: expected object with requirements array');
        }

        for (const req of data.requirements) {
            if (req && req.reqId) {
                this.mapRequirement(req.reqId, {
                    name: req.name,
                    description: req.description,
                    domain: req.domain,
                    priority: req.priority,
                    status: req.status,
                    feature: req.stages?.feature || [],
                    code: req.stages?.code || [],
                    test: req.stages?.test || [],
                    evidence: req.stages?.evidence || [],
                    deploy: req.stages?.deploy || [],
                    cert: req.stages?.cert || []
                });
            }
        }
        return this.requirements.size;
    }
}

module.exports = RequirementMatrix;
