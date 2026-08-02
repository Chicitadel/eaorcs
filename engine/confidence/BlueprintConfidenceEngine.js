/******************************************************************************
 * Project        : Universal Autonomous Engineering System (EAORCS)
 * Module         : Epistemic Confidence Engine
 * File           : BlueprintConfidenceEngine.js
 * Version        : 1.0.0
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Platform
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | GOVERNMENT
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
 * Copyright (c) 2026 Ujomor Platform. All Rights Reserved.
 ******************************************************************************/

'use strict';

/**
 * Vague or ambiguous terms that degrade specification clarity.
 */
const VAGUE_TERMS = [
    'tbd', 'todo', 'fixme', 'maybe', 'approximate', 'as needed',
    'etc', 'unclear', 'undefined', 'possibly', 'should probably', 'somehow'
];

/**
 * Mandatory structural elements for complete blueprint specifications.
 */
const REQUIRED_SECTIONS = [
    'title', 'description', 'version', 'requirements',
    'inputs', 'outputs', 'rules', 'constraints'
];

/**
 * BlueprintConfidenceEngine
 * Measures specification clarity, completeness, consistency, and unambiguousness
 * across architecture blueprints, DSL ASTs, and requirement contracts.
 */
class BlueprintConfidenceEngine {
    constructor(options = {}) {
        this.options = options;
        this.lastEvaluation = null;
    }

    /**
     * Evaluates the specification confidence metrics of a blueprint AST or schema.
     * @param {Object|string} blueprintAst - Blueprint AST object or JSON string
     * @returns {Object} Evaluation summary containing score, breakdown, and details
     */
    evaluateSpecConfidence(blueprintAst) {
        let ast = blueprintAst;
        if (typeof blueprintAst === 'string') {
            try {
                ast = JSON.parse(blueprintAst);
            } catch (e) {
                ast = { textContent: blueprintAst, requirements: [] };
            }
        }

        if (!ast || typeof ast !== 'object') {
            ast = { requirements: [] };
        }

        const clarity = this._calculateClarity(ast);
        const completeness = this._calculateCompleteness(ast);
        const consistency = this._calculateConsistency(ast);
        const unambiguity = this._calculateUnambiguity(ast);

        const overallScore = Math.round(
            (clarity * 0.25) +
            (completeness * 0.25) +
            (consistency * 0.25) +
            (unambiguity * 0.25)
        );

        this.lastEvaluation = {
            score: Math.min(100, Math.max(0, overallScore)),
            breakdown: {
                clarity,
                completeness,
                consistency,
                unambiguity
            },
            timestamp: new Date().toISOString(),
            requirementCount: Array.isArray(ast.requirements) ? ast.requirements.length : 0
        };

        return this.lastEvaluation;
    }

    /**
     * Computes or retrieves specification confidence score and breakdown.
     * @param {Object|string} [blueprintAst] - Optional blueprint AST to evaluate
     * @returns {Object} Object with score (0-100) and breakdown
     */
    computeSpecScore(blueprintAst) {
        if (blueprintAst) {
            return this.evaluateSpecConfidence(blueprintAst);
        }
        if (!this.lastEvaluation) {
            return {
                score: 0,
                breakdown: { clarity: 0, completeness: 0, consistency: 0, unambiguity: 0 }
            };
        }
        return this.lastEvaluation;
    }

    /**
     * Calculates Clarity score (0-100).
     * @private
     */
    _calculateClarity(ast) {
        let textToAnalyze = '';
        if (ast.description) textToAnalyze += ' ' + ast.description;
        if (ast.title) textToAnalyze += ' ' + ast.title;

        const reqs = Array.isArray(ast.requirements) ? ast.requirements : [];
        reqs.forEach(req => {
            if (req.title) textToAnalyze += ' ' + req.title;
            if (req.description) textToAnalyze += ' ' + req.description;
        });

        if (!textToAnalyze && ast.textContent) {
            textToAnalyze = ast.textContent;
        }

        if (!textToAnalyze.trim()) {
            return 50; // default baseline if no text
        }

        const lowerText = textToAnalyze.toLowerCase();
        let vagueCount = 0;
        VAGUE_TERMS.forEach(term => {
            const matches = lowerText.match(new RegExp('\\b' + term + '\\b', 'g'));
            if (matches) {
                vagueCount += matches.length;
            }
        });

        const wordCount = textToAnalyze.trim().split(/\s+/).length;
        const penalty = Math.min(60, (vagueCount / Math.max(10, wordCount)) * 300);
        
        let baseScore = 95;
        if (!ast.title) baseScore -= 10;
        if (!ast.description) baseScore -= 10;

        return Math.min(100, Math.max(0, Math.round(baseScore - penalty)));
    }

    /**
     * Calculates Completeness score (0-100).
     * @private
     */
    _calculateCompleteness(ast) {
        let presentSections = 0;
        REQUIRED_SECTIONS.forEach(sec => {
            if (ast[sec] !== undefined && ast[sec] !== null && ast[sec] !== '') {
                if (Array.isArray(ast[sec]) && ast[sec].length === 0) {
                    // Empty array counts partially
                    presentSections += 0.5;
                } else {
                    presentSections += 1;
                }
            }
        });

        const sectionScore = (presentSections / REQUIRED_SECTIONS.length) * 60;

        // Requirement field completeness
        let reqScore = 40;
        const reqs = Array.isArray(ast.requirements) ? ast.requirements : [];
        if (reqs.length > 0) {
            let reqFieldSum = 0;
            reqs.forEach(r => {
                let fields = 0;
                if (r.id) fields++;
                if (r.title || r.name) fields++;
                if (r.description) fields++;
                if (r.type || r.priority) fields++;
                reqFieldSum += (fields / 4);
            });
            reqScore = (reqFieldSum / reqs.length) * 40;
        }

        return Math.min(100, Math.max(0, Math.round(sectionScore + reqScore)));
    }

    /**
     * Calculates Consistency score (0-100).
     * @private
     */
    _calculateConsistency(ast) {
        const reqs = Array.isArray(ast.requirements) ? ast.requirements : [];
        if (reqs.length === 0) return 90;

        const ids = new Set();
        let duplicateCount = 0;
        let missingRefCount = 0;

        reqs.forEach(r => {
            if (r.id) {
                if (ids.has(r.id)) {
                    duplicateCount++;
                } else {
                    ids.add(r.id);
                }
            }
        });

        reqs.forEach(r => {
            if (Array.isArray(r.dependencies)) {
                r.dependencies.forEach(depId => {
                    if (!ids.has(depId)) {
                        missingRefCount++;
                    }
                });
            }
        });

        let score = 100;
        score -= duplicateCount * 25;
        score -= missingRefCount * 15;

        return Math.min(100, Math.max(0, Math.round(score)));
    }

    /**
     * Calculates Unambiguity score (0-100).
     * @private
     */
    _calculateUnambiguity(ast) {
        let score = 90;
        const reqs = Array.isArray(ast.requirements) ? ast.requirements : [];
        
        if (reqs.length > 0) {
            let typedCount = 0;
            let constrainedCount = 0;

            reqs.forEach(r => {
                if (r.type || r.dataType || (r.inputs && typeof r.inputs === 'object')) {
                    typedCount++;
                }
                if (r.constraints || r.rules || r.bounds || r.validation) {
                    constrainedCount++;
                }
            });

            const typeRatio = typedCount / reqs.length;
            const constraintRatio = constrainedCount / reqs.length;

            score = (typeRatio * 50) + (constraintRatio * 50);
        }

        if (ast.inputs && Array.isArray(ast.inputs)) {
            const validInputs = ast.inputs.filter(i => typeof i === 'object' && i.type).length;
            if (ast.inputs.length > 0) {
                score = (score * 0.7) + ((validInputs / ast.inputs.length) * 30);
            }
        }

        return Math.min(100, Math.max(0, Math.round(score)));
    }
}

module.exports = {
    BlueprintConfidenceEngine,
    VAGUE_TERMS,
    REQUIRED_SECTIONS
};
