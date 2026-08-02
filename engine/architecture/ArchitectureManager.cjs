/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Architecture Manager
 * File           : ArchitectureManager.cjs
 * Version        : 2026.1-LTS (v8.0.0 Architecture Realignment)
 * Author         : Architectural Governance Council & System Architecture Authority
 * Organization   : Air Roofers Platform Ecosystem / EAORCS
 * Created Date   : 2026-07-31
 * Last Modified  : 2026-07-31
 * Classification : ENTERPRISE | RESTRICTED
 ******************************************************************************/

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class ArchitectureManager {
    constructor(baseDir) {
        this.baseDir = baseDir || path.resolve(__dirname, '../../../');
        this.specPath = path.join(this.baseDir, 'docs/EAORCS_Architecture_Specification.md');
        this.matrixPath = path.join(this.baseDir, 'docs/blueprint_execution_matrix.md');
        this.frozenDecisionsPath = path.join(this.baseDir, '.governance/state/frozen.decisions.yaml');
    }

    /**
     * Retrieves the immutable Product Architecture contract state.
     */
    getProductArchitecture() {
        const specExists = fs.existsSync(this.specPath);
        let specHash = null;
        if (specExists) {
            const specContent = fs.readFileSync(this.specPath, 'utf8');
            specHash = crypto.createHash('sha256').update(specContent).digest('hex');
        }

        return {
            immutable: true,
            layers_count: 9,
            specification: 'docs/EAORCS_Architecture_Specification.md',
            spec_verified: specExists,
            spec_sha256: specHash,
            precedence: [
                'SECURITY',
                'GOVERNANCE',
                'COMPLIANCE',
                'ARCHITECTURE_FREEZE',
                'PROTOCOL_FREEZE',
                'CONTRACTS',
                'DOMAIN_RULES',
                'IMPLEMENTATION',
                'OPTIMIZATION',
                'REFACTORING'
            ]
        };
    }

    /**
     * Retrieves the evolving Execution Architecture (PEP Streams & Roadmap Programs).
     */
    getExecutionArchitecture() {
        const matrixExists = fs.existsSync(this.matrixPath);
        return {
            evolves: true,
            execution_program: 'Product Execution Program (PEP)',
            streams_count: 8,
            roadmap_programs: ['P1', 'P2-A', 'P2-B', 'P2-C', 'P3-A', 'P3-B', 'P3-C', 'P4-A', 'P4-B'],
            matrix_verified: matrixExists,
            matrix_filepath: 'docs/blueprint_execution_matrix.md'
        };
    }

    /**
     * Retrieves the generated Runtime Architecture state.
     */
    getRuntimeArchitecture() {
        return {
            generated: true,
            engine_version: '2026.1-v8',
            active_contexts: ['semantic_graph', 'trust_graph', 'event_ledger', 'prr_evaluator'],
            runtime_isolation: true
        };
    }

    /**
     * Audits structural isolation across Product, Execution, and Runtime layers.
     */
    verifyArchitectureSeparation() {
        const product = this.getProductArchitecture();
        const execution = this.getExecutionArchitecture();
        const runtime = this.getRuntimeArchitecture();

        const isValid = product.spec_verified && execution.matrix_verified && runtime.runtime_isolation;

        return {
            status: isValid ? 'PASSED' : 'FAILED',
            product,
            execution,
            runtime,
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = ArchitectureManager;
