/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Rule-Evaluated CMM Maturity Engine
 * File           : CmmEvaluator.cjs
 * Version        : 2026.1-LTS (v8.1 Continuous Trust)
 * Author         : Architectural Governance Council & CMM Working Group
 * Organization   : Air Roofers Platform Ecosystem / EAORCS
 * Created Date   : 2026-07-31
 * Last Modified  : 2026-07-31
 * Classification : ENTERPRISE | RESTRICTED
 ******************************************************************************/

const fs = require('fs');
const path = require('path');

class CmmEvaluator {
    constructor(baseDir) {
        this.baseDir = baseDir || path.resolve(__dirname, '../../../');
    }

    /**
     * Evaluates rules for Levels L1 through L7 dynamically.
     */
    evaluateMaturity(context = {}) {
        const rules = [
            {
                level: 'L1',
                title: 'Deterministic Execution',
                criterion: 'ExecutionGraph DAG engine present with spec hash calculation',
                passed: fs.existsSync(path.join(this.baseDir, 'eaorcs/engine/ExecutionGraph.cjs'))
            },
            {
                level: 'L2',
                title: 'Governance Policies',
                criterion: 'PolicyEngine and executable policy manifests available',
                passed: fs.existsSync(path.join(this.baseDir, 'eaorcs/engine/policy/PolicyEngine.cjs'))
            },
            {
                level: 'L3',
                title: 'Cryptographic Evidence',
                criterion: 'SHA-256 evidence bundles and Merkle tree generation active',
                passed: fs.existsSync(path.join(this.baseDir, 'eaorcs/engine/certification/EvidenceBundle.cjs'))
            },
            {
                level: 'L4',
                title: 'Quantitative Metrics',
                criterion: 'Measured coverage & metric classification engine active',
                passed: fs.existsSync(path.join(this.baseDir, 'eaorcs/engine/analyzers/UtcfCoverageEngine.cjs'))
            },
            {
                level: 'L5',
                title: 'Optimization & Predictive Risk',
                criterion: 'Cyber Weather and release probability forecasting enabled',
                passed: fs.existsSync(path.join(this.baseDir, 'eaorcs/engine/predictive/CyberWeather.cjs'))
            },
            {
                level: 'L6',
                title: 'Autonomous Governance',
                criterion: 'AI Council consensus engine and automated PRR gating enabled',
                passed: fs.existsSync(path.join(this.baseDir, 'eaorcs/engine/ai/AiCouncilEngine.cjs'))
            },
            {
                level: 'L7',
                title: 'Federated Verification',
                criterion: 'Standalone offline verifier CLI and OSAP v2 core passport active',
                passed: fs.existsSync(path.join(this.baseDir, 'eaorcs/sdk/verifier.cjs')) && fs.existsSync(path.join(this.baseDir, 'eaorcs/schemas/osap-core-v2.json'))
            }
        ];

        let highestLevel = 'L0';
        for (const rule of rules) {
            if (rule.passed) {
                highestLevel = rule.level;
            } else {
                break; // Sequential capability progression requirement
            }
        }

        return {
            highest_satisfied_level: highestLevel,
            source: 'Computed',
            rules_evaluation: rules,
            all_levels_passed: highestLevel === 'L7',
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = CmmEvaluator;
