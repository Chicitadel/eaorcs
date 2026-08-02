/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Audit Engine Kernel (Stream S1)
 * File           : ExecutionGraphSpec.js
 * Version        : 2026.1-LTS (v1.0.0-FROZEN)
 * Author         : Architectural Governance Council & Ujomor Systems Engineering
 * Organization   : Chicitadel / Air Roofers SASU
 * Created Date   : 2026-07-31
 * Last Modified  : 2026-07-31
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Architecture Frozen (ADR-001, ADR-003)
 * - Deterministic Execution Enforced
 ******************************************************************************/

const crypto = require('crypto');

class ExecutionGraphSpec {
    constructor(specOverrides = {}) {
        this.graphId = specOverrides.graphId || 'graph_eaorcs_core_v1';
        this.graphVersion = specOverrides.graphVersion || '2026.1-v1.0.0';
        this.schemaVersion = specOverrides.schemaVersion || '1.0.0';
        this.minimumRuntime = specOverrides.minimumRuntime || '2026.1-LTS';
        this.compatibleAnalyzers = specOverrides.compatibleAnalyzers || [
            'security.v1',
            'architecture.v1',
            'iac.v1',
            'performance.v1',
            'accessibility.v1'
        ];
        this.nodes = [
            { id: 'discovery', dependsOn: [] },
            { id: 'classification', dependsOn: ['discovery'] },
            { id: 'language_detection', dependsOn: ['classification'] },
            { id: 'ast_analysis', dependsOn: ['language_detection'] },
            { id: 'sbom', dependsOn: ['ast_analysis'] },
            { id: 'cve_correlation', dependsOn: ['sbom'] },
            { id: 'secrets', dependsOn: ['cve_correlation'] },
            { id: 'architecture', dependsOn: ['secrets'] },
            { id: 'iac', dependsOn: ['architecture'] },
            { id: 'performance', dependsOn: ['iac'] },
            { id: 'evidence', dependsOn: ['performance'] },
            { id: 'trust_scoring', dependsOn: ['evidence'] }
        ];
    }

    getSpecManifest() {
        return {
            graph_id: this.graphId,
            graph_version: this.graphVersion,
            schema_version: this.schemaVersion,
            minimum_runtime: this.minimumRuntime,
            compatible_analyzers: this.compatibleAnalyzers,
            node_topology: this.nodes
        };
    }

    calculateSpecHash() {
        const canonicalString = JSON.stringify(this.getSpecManifest(), Object.keys(this.getSpecManifest()).sort());
        return crypto.createHash('sha256').update(canonicalString).digest('hex');
    }
}

module.exports = ExecutionGraphSpec;
