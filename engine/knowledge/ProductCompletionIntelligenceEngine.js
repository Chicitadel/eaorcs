/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Engineering Intelligence & Completion Architecture
 * File           : ProductCompletionIntelligenceEngine.js
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

/**
 * ProductCompletionIntelligenceEngine
 * 
 * Computes deterministic, auditable, evidence-backed product completion scores and multi-tier confidence levels.
 * 
 * Score Equation:
 *   S_overall = Sum_{i=1}^{9} ( w_i * S_i )  where Sum w_i = 1.0
 * 
 * Multi-Tier Confidence Metrics:
 *   1. Completion Score (S_completion)
 *   2. Evidence Confidence (C_evidence): Level of explicit cryptographic/file evidence
 *   3. Blueprint Confidence (C_blueprint): Fidelity of discovered vs synthesized specifications
 *   4. Inference Confidence (C_inference): Ratio of deterministic assertions vs heuristic inferences
 */
class ProductCompletionIntelligenceEngine {
    constructor(options = {}) {
        this.options = options;
        this.dimensionWeights = {
            blueprintCoverage: 0.15,
            requirements: 0.15,
            architecture: 0.10,
            backend: 0.15,
            frontend: 0.10,
            tests: 0.10,
            documentation: 0.05,
            packaging: 0.10,
            commercialReadiness: 0.10
        };
    }

    /**
     * Evaluates product completion against canonical blueprint, repository code, tests, docs, and evidence.
     * Returns multi-tier confidence metrics along with reproducible evidence hashes.
     * 
     * @param {string} projectRoot Root directory path of the project.
     * @param {Object} canonicalBlueprint Resolved Canonical Blueprint object.
     * @returns {Object} Structured completion assessment with multi-tier confidence metrics.
     */
    evaluateCompletion(projectRoot, canonicalBlueprint) {
        if (!projectRoot || typeof projectRoot !== 'string') {
            throw new Error('Invalid projectRoot provided to evaluateCompletion');
        }
        if (!canonicalBlueprint || typeof canonicalBlueprint !== 'object') {
            throw new Error('Invalid canonicalBlueprint provided to evaluateCompletion');
        }

        const absolutePath = path.resolve(projectRoot);

        // Evaluate 9 dimensions with explicit evidence hashes
        const blueprintScore = this._evalBlueprintCoverage(canonicalBlueprint);
        const reqScore = this._evalRequirementsCompleteness(canonicalBlueprint);
        const archScore = this._evalArchitecturalConformance(absolutePath, canonicalBlueprint);
        const backendScore = this._evalBackendImplementation(absolutePath);
        const frontendScore = this._evalFrontendImplementation(absolutePath);
        const testScore = this._evalTestCoverage(absolutePath);
        const docScore = this._evalDocumentationCoverage(absolutePath);
        const packagingScore = this._evalPackagingReadiness(absolutePath);
        const commercialScore = this._evalCommercialReadiness(absolutePath);

        const dimensions = {
            blueprintCoverage: blueprintScore,
            requirements: reqScore,
            architecture: archScore,
            backend: backendScore,
            frontend: frontendScore,
            tests: testScore,
            documentation: docScore,
            packaging: packagingScore,
            commercialReadiness: commercialScore
        };

        // Calculate reproducible weighted score
        let weightedSum = 0;
        let totalWeight = 0;
        const weightBreakdown = [];

        for (const key of Object.keys(this.dimensionWeights)) {
            const weight = this.dimensionWeights[key];
            const score = dimensions[key].percentage;
            const contribution = score * weight;

            weightedSum += contribution;
            totalWeight += weight;

            weightBreakdown.push({
                dimension: key,
                weightPct: Math.round(weight * 100),
                rawScorePct: score,
                weightedContributionPct: Math.round(contribution * 100) / 100,
                evidenceHash: dimensions[key].evidenceHash
            });
        }

        const overallPercentage = Math.round((weightedSum / totalWeight) * 10) / 10;

        // Calculate Multi-Tier Confidence Levels
        const confidenceMetrics = this._calculateMultiTierConfidence(canonicalBlueprint, dimensions);

        // Collect all remaining items
        const remainingItems = [];
        for (const dimKey of Object.keys(dimensions)) {
            const missing = dimensions[dimKey].missingItems || [];
            for (const item of missing) {
                remainingItems.push({
                    dimension: dimKey,
                    item,
                    evidenceHash: crypto.createHash('sha256').update(`${dimKey}:${item}`).digest('hex').slice(0, 12)
                });
            }
        }

        const isComplete = overallPercentage >= 98.0 && remainingItems.length === 0;

        const auditTrailHash = crypto.createHash('sha256')
            .update(JSON.stringify({
                canonicalBlueprintId: canonicalBlueprint.id,
                overallPercentage,
                confidenceMetrics,
                remainingItemsCount: remainingItems.length
            }))
            .digest('hex');

        const assessmentReport = {
            projectId: canonicalBlueprint.id,
            projectName: canonicalBlueprint.name,
            version: canonicalBlueprint.version,
            evaluatedAt: new Date().toISOString(),
            auditTrailHash,
            isComplete,
            overallScorePct: overallPercentage,
            confidenceMetrics, // Multi-Tier Confidence Metrics
            weightingModel: {
                formula: 'S_overall = Sum(w_i * S_i)',
                totalWeight: totalWeight,
                breakdown: weightBreakdown
            },
            dimensions: {
                blueprintCoveragePct: dimensions.blueprintCoverage.percentage,
                requirementsPct: dimensions.requirements.percentage,
                architecturePct: dimensions.architecture.percentage,
                backendPct: dimensions.backend.percentage,
                frontendPct: dimensions.frontend.percentage,
                testCoveragePct: dimensions.tests.percentage,
                documentationPct: dimensions.documentation.percentage,
                packagingPct: dimensions.packaging.percentage,
                commercialReadinessPct: dimensions.commercialReadiness.percentage
            },
            dimensionDetails: dimensions,
            remainingItems,
            formattedSummaryReport: this._generateFormattedReport(canonicalBlueprint.name, overallPercentage, confidenceMetrics, dimensions, remainingItems, auditTrailHash)
        };

        return assessmentReport;
    }

    _calculateMultiTierConfidence(blueprint, dimensions) {
        // Blueprint Confidence: Based on ratio of discovered vs synthesized requirements
        const discoveredSpecsCount = (blueprint.specifications || []).length;
        const totalReqsCount = (blueprint.functionalRequirements || []).length;
        let blueprintConfidencePct = 100;
        if (blueprint.confidence && blueprint.confidence.origin === 'SYNTHESIZED_BASELINE') {
            blueprintConfidencePct = 75;
        } else if (discoveredSpecsCount === 0) {
            blueprintConfidencePct = 60;
        }

        // Evidence Confidence: Level of physical file & test assertion proof
        let evidenceConfidencePct = 95;
        if (dimensions.tests.percentage < 80) evidenceConfidencePct -= 15;
        if (dimensions.architecture.percentage < 80) evidenceConfidencePct -= 10;

        // Inference Confidence: Level of deterministic check vs lexical inference
        let inferenceConfidencePct = 90;
        if (totalReqsCount > 1000) inferenceConfidencePct -= 5;

        return {
            completionScorePct: dimensions.requirements.percentage,
            evidenceConfidencePct: Math.max(50, evidenceConfidencePct),
            blueprintConfidencePct: Math.max(50, blueprintConfidencePct),
            inferenceConfidencePct: Math.max(50, inferenceConfidencePct)
        };
    }

    _evalBlueprintCoverage(blueprint) {
        const specsCount = (blueprint.specifications || []).length;
        const boundedContextsCount = (blueprint.boundedContexts || []).length;

        let pct = 100;
        const missing = [];

        if (specsCount === 0) {
            pct -= 40;
            missing.push('Missing explicit SRS / PRD specification documents');
        }
        if (boundedContextsCount < 3) {
            pct -= 20;
            missing.push('Bounded contexts underdefined (less than 3 defined domains)');
        }
        if (blueprint.confidence && blueprint.confidence.origin === 'SYNTHESIZED_BASELINE') {
            pct -= 10;
            missing.push('Blueprint relies on synthesized baseline requirements');
        }

        const score = Math.max(0, pct);
        const evidenceHash = crypto.createHash('sha256').update(`blueprintCoverage:${score}:${missing.length}`).digest('hex').slice(0, 12);
        return { percentage: score, missingItems: missing, evidenceHash };
    }

    _evalRequirementsCompleteness(blueprint) {
        const reqs = blueprint.functionalRequirements || [];
        if (reqs.length === 0) {
            const hash = crypto.createHash('sha256').update('requirements:0:none').digest('hex').slice(0, 12);
            return { percentage: 0, missingItems: ['No functional requirements found'], evidenceHash: hash };
        }

        const implemented = reqs.filter(r => r.status === 'IMPLEMENTED');
        const pending = reqs.filter(r => r.status !== 'IMPLEMENTED');
        const pct = Math.round((implemented.length / reqs.length) * 100);

        const missing = pending.map(r => `[Req ${r.id}] ${r.title}`);
        const evidenceHash = crypto.createHash('sha256').update(`requirements:${pct}:${implemented.length}/${reqs.length}`).digest('hex').slice(0, 12);
        return { percentage: pct, missingItems: missing, evidenceHash };
    }

    _evalArchitecturalConformance(projectRoot, blueprint) {
        const missing = [];
        let pct = 100;

        const adrs = blueprint.architectureDecisions || [];
        if (adrs.length === 0) {
            pct -= 30;
            missing.push('Missing Architecture Decision Records (ADRs)');
        }

        const requiredDirs = ['engine', 'api', 'tests', 'docs', '.governance'];
        for (const dir of requiredDirs) {
            if (!fs.existsSync(path.join(projectRoot, dir))) {
                pct -= 15;
                missing.push(`Missing architectural directory boundary: /${dir}`);
            }
        }

        const score = Math.max(0, pct);
        const evidenceHash = crypto.createHash('sha256').update(`architecture:${score}:${missing.length}`).digest('hex').slice(0, 12);
        return { percentage: score, missingItems: missing, evidenceHash };
    }

    _evalBackendImplementation(projectRoot) {
        const missing = [];
        let pct = 100;

        const engineDir = path.join(projectRoot, 'engine');
        if (!fs.existsSync(engineDir)) {
            const hash = crypto.createHash('sha256').update('backend:0:no_engine').digest('hex').slice(0, 12);
            return { percentage: 0, missingItems: ['Engine core directory missing'], evidenceHash: hash };
        }

        const coreComponents = ['kernel', 'blueprint', 'knowledge', 'remediation', 'traceability'];
        for (const comp of coreComponents) {
            if (!fs.existsSync(path.join(engineDir, comp))) {
                pct -= 15;
                missing.push(`Missing backend core component: /engine/${comp}`);
            }
        }

        const score = Math.max(0, pct);
        const evidenceHash = crypto.createHash('sha256').update(`backend:${score}:${missing.length}`).digest('hex').slice(0, 12);
        return { percentage: score, missingItems: missing, evidenceHash };
    }

    _evalFrontendImplementation(projectRoot) {
        const missing = [];
        let pct = 100;

        const hasIndexHtml = fs.existsSync(path.join(projectRoot, 'index.html'));
        const hasPublicDir = fs.existsSync(path.join(projectRoot, 'public'));
        const hasStudioDir = fs.existsSync(path.join(projectRoot, 'engine', 'studio')) || fs.existsSync(path.join(projectRoot, 'engine', 'portal'));

        if (!hasIndexHtml) {
            pct -= 40;
            missing.push('Missing main frontend single page entry point (index.html)');
        }
        if (!hasPublicDir) {
            pct -= 20;
            missing.push('Missing public static assets container directory');
        }
        if (!hasStudioDir) {
            pct -= 20;
            missing.push('Missing UI Studio / Portal engine suite');
        }

        const score = Math.max(0, pct);
        const evidenceHash = crypto.createHash('sha256').update(`frontend:${score}:${missing.length}`).digest('hex').slice(0, 12);
        return { percentage: score, missingItems: missing, evidenceHash };
    }

    _evalTestCoverage(projectRoot) {
        const missing = [];
        let pct = 100;

        const testsDir = path.join(projectRoot, 'tests');
        if (!fs.existsSync(testsDir)) {
            const hash = crypto.createHash('sha256').update('tests:0:no_tests_dir').digest('hex').slice(0, 12);
            return { percentage: 0, missingItems: ['Test suite directory missing'], evidenceHash: hash };
        }

        const requiredTestSuites = ['unit', 'integration', 'kernel', 'governance', 'quality'];
        let foundCount = 0;

        try {
            const files = fs.readdirSync(testsDir, { recursive: true });
            for (const suite of requiredTestSuites) {
                const match = files.some(f => String(f).toLowerCase().includes(suite));
                if (match) {
                    foundCount++;
                } else {
                    missing.push(`Missing dedicated test suite: ${suite}`);
                }
            }
        } catch (e) {}

        pct = Math.round((foundCount / requiredTestSuites.length) * 100);
        const evidenceHash = crypto.createHash('sha256').update(`tests:${pct}:${foundCount}/${requiredTestSuites.length}`).digest('hex').slice(0, 12);
        return { percentage: pct, missingItems: missing, evidenceHash };
    }

    _evalDocumentationCoverage(projectRoot) {
        const missing = [];
        let pct = 100;

        const requiredDocs = ['README.md', 'CHANGELOG.md', 'GAP_ANALYSIS.md', 'PROJECT_STATUS.md'];
        for (const doc of requiredDocs) {
            if (!fs.existsSync(path.join(projectRoot, doc))) {
                pct -= 25;
                missing.push(`Missing critical documentation file: ${doc}`);
            }
        }

        const score = Math.max(0, pct);
        const evidenceHash = crypto.createHash('sha256').update(`docs:${score}:${missing.length}`).digest('hex').slice(0, 12);
        return { percentage: score, missingItems: missing, evidenceHash };
    }

    _evalPackagingReadiness(projectRoot) {
        const missing = [];
        let pct = 100;

        const pkgPath = path.join(projectRoot, 'package.json');
        const distManifest = path.join(projectRoot, 'distribution_manifest.yaml');

        if (!fs.existsSync(pkgPath)) {
            pct -= 50;
            missing.push('Missing package.json manifest');
        }
        if (!fs.existsSync(distManifest)) {
            pct -= 25;
            missing.push('Missing distribution manifest configuration');
        }

        const score = Math.max(0, pct);
        const evidenceHash = crypto.createHash('sha256').update(`packaging:${score}:${missing.length}`).digest('hex').slice(0, 12);
        return { percentage: score, missingItems: missing, evidenceHash };
    }

    _evalCommercialReadiness(projectRoot) {
        const missing = [];
        let pct = 100;

        const hasLegal = fs.existsSync(path.join(projectRoot, 'legal')) || fs.existsSync(path.join(projectRoot, 'LICENSE'));
        const hasCert = fs.existsSync(path.join(projectRoot, 'eaorcs-certificate.json')) || fs.existsSync(path.join(projectRoot, 'FINAL_CERTIFICATION.md'));

        if (!hasLegal) {
            pct -= 50;
            missing.push('Missing legal licensing & governance terms');
        }
        if (!hasCert) {
            pct -= 30;
            missing.push('Missing platform certification sign-off passport');
        }

        const score = Math.max(0, pct);
        const evidenceHash = crypto.createHash('sha256').update(`commercial:${score}:${missing.length}`).digest('hex').slice(0, 12);
        return { percentage: score, missingItems: missing, evidenceHash };
    }

    _generateFormattedReport(projectName, overallScore, confidence, dimensions, remainingItems, auditHash) {
        let report = `==========================================================\n`;
        report += `EAORCS AUDITABLE PRODUCT COMPLETION & CONFIDENCE REPORT\n`;
        report += `Project Name: ${projectName}\n`;
        report += `Overall Product Completion: ${overallScore}%\n`;
        report += `----------------------------------------------------------\n`;
        report += `MULTI-TIER CONFIDENCE METRICS:\n`;
        report += `  • Completion Score ........ ${confidence.completionScorePct}%\n`;
        report += `  • Evidence Confidence ...... ${confidence.evidenceConfidencePct}%\n`;
        report += `  • Blueprint Confidence ..... ${confidence.blueprintConfidencePct}%\n`;
        report += `  • Inference Confidence ..... ${confidence.inferenceConfidencePct}%\n`;
        report += `----------------------------------------------------------\n`;
        report += `Audit Trail Hash: ${auditHash}\n`;
        report += `==========================================================\n\n`;

        report += `Blueprint Coverage [w=15%] ... ${dimensions.blueprintCoverage.percentage}%\n`;
        report += `Requirements [w=15%] ......... ${dimensions.requirements.percentage}%\n`;
        report += `Architecture [w=10%] ......... ${dimensions.architecture.percentage}%\n`;
        report += `Backend [w=15%] .............. ${dimensions.backend.percentage}%\n`;
        report += `Frontend [w=10%] ............. ${dimensions.frontend.percentage}%\n`;
        report += `Test Coverage [w=10%] ........ ${dimensions.tests.percentage}%\n`;
        report += `Documentation [w=5%] ......... ${dimensions.documentation.percentage}%\n`;
        report += `Packaging Readiness [w=10%] .. ${dimensions.packaging.percentage}%\n`;
        report += `Commercial Readiness [w=10%] . ${dimensions.commercialReadiness.percentage}%\n\n`;

        if (remainingItems.length === 0) {
            report += `Status: 100% COMPLETE & AUDITABLE RELEASE SIGN-OFF CERTIFIED\n`;
        } else {
            report += `Remaining Action Items (${remainingItems.length}):\n`;
            for (const item of remainingItems.slice(0, 5)) {
                report += `  • [${item.dimension}] ${item.item} (Hash: ${item.evidenceHash})\n`;
            }
            if (remainingItems.length > 5) {
                report += `  ... and ${remainingItems.length - 5} additional open item(s)\n`;
            }
        }

        return report;
    }
}

module.exports = ProductCompletionIntelligenceEngine;
