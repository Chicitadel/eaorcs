/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Evidence Tier Classifier
 * File           : EvidenceTierClassifier.cjs
 * Version        : 2026.1-LTS (Tiered Evidence Framework)
 * Author         : Architectural Governance Council & System Audit Authority
 * Organization   : Air Roofers Platform Ecosystem / EAORCS
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | RESTRICTED
 ******************************************************************************/

class EvidenceTierClassifier {
    /**
     * Returns metadata for the 5 evidence tiers:
     * - Level A: Physically observed (Runtime execution, logs, heap metrics, exit codes)
     * - Level B: Automatically tested (Unit, integration, and automated system tests)
     * - Level C: Independently verified (External validation, reproducible execution, LSP/DAP handshakes)
     * - Level D: Specification compliance (Blueprint, OpenAPI schemas, contracts, ADR declarations)
     * - Level E: Production observed (Real OpenTelemetry traces, Prometheus metrics, SLA/SLO)
     */
    static getTierDefinitions() {
        return {
            'Level A': { tier: 'Level A', name: 'Physically observed', description: 'Runtime execution, logs, heap metrics, exit codes', weight: 1.0 },
            'Level B': { tier: 'Level B', name: 'Automatically tested', description: 'Unit, integration, and system test suites', weight: 0.95 },
            'Level C': { tier: 'Level C', name: 'Independently verified', description: 'External validation & reproducible execution', weight: 0.98 },
            'Level D': { tier: 'Level D', name: 'Specification compliance', description: 'Blueprint, schemas, contracts, & ADRs', weight: 0.90 },
            'Level E': { tier: 'Level E', name: 'Production observed', description: 'Real OpenTelemetry traces & Prometheus metrics', weight: 1.0 }
        };
    }

    static classify(tierCode) {
        const defs = EvidenceTierClassifier.getTierDefinitions();
        return defs[tierCode] || defs['Level B'];
    }
}

module.exports = EvidenceTierClassifier;
