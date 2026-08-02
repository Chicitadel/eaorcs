/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Audit Engine Kernel (Stream S1)
 * File           : CapabilityNegotiator.cjs
 * Version        : 2026.1-LTS (v1.0.0-FROZEN)
 * Author         : Architectural Governance Council & Ujomor Systems Engineering
 * Organization   : Chicitadel / Air Roofers SASU
 * Created Date   : 2026-07-31
 * Last Modified  : 2026-07-31
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Architecture Frozen (ADR-001)
 * - Capability Negotiation Enforced
 ******************************************************************************/

class CapabilityNegotiator {
    constructor(activeRuntimeVersion = '2026.1-LTS') {
        this.activeRuntimeVersion = activeRuntimeVersion;
    }

    negotiateCapabilities(graphSpec, registeredAnalyzers = []) {
        const incompatibilities = [];
        const recommendedActions = [];

        // Check Minimum Runtime Compatibility
        if (graphSpec.minimumRuntime !== this.activeRuntimeVersion) {
            incompatibilities.push(`Runtime mismatch: Expected ${graphSpec.minimumRuntime}, active is ${this.activeRuntimeVersion}`);
            recommendedActions.push('Upgrade or align runtime environment version to 2026.1-LTS');
        }

        // Check Analyzer Availability
        for (const reqAnalyzer of graphSpec.compatibleAnalyzers) {
            const isRegistered = registeredAnalyzers.some(a => a.id === reqAnalyzer || a.name === reqAnalyzer);
            if (!isRegistered) {
                recommendedActions.push(`Ensure analyzer plugin [${reqAnalyzer}] is registered in AnalyzerRegistry`);
            }
        }

        const isCompatible = incompatibilities.length === 0;

        return {
            compatible: isCompatible,
            runtime_version: this.activeRuntimeVersion,
            graph_version: graphSpec.graphVersion,
            graph_hash: graphSpec.calculateSpecHash(),
            analyzer_versions: registeredAnalyzers.reduce((acc, a) => {
                acc[a.id || a.name] = a.version || '1.0.0';
                return acc;
            }, {}),
            incompatibilities,
            recommended_actions: recommendedActions
        };
    }
}

module.exports = CapabilityNegotiator;
