/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Observation Type Classifier
 * File           : ObservationTypeClassifier.cjs
 * Version        : 2026.1-LTS (v5.1 Evidence-Backed Framework)
 * Author         : Architectural Governance Council & Trust Authority
 * Organization   : Air Roofers Platform Ecosystem / EAORCS
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | RESTRICTED
 ******************************************************************************/

class ObservationTypeClassifier {
    /**
     * Classifies an observation type for evidence items.
     * Allowed: Observed, Replay, Simulation, Specification, Inference
     */
    static classify(type) {
        const allowedTypes = ['Observed', 'Replay', 'Simulation', 'Specification', 'Inference'];
        const normalized = allowedTypes.includes(type) ? type : 'Observed';

        return {
            observation_type: normalized,
            is_empirical: normalized === 'Observed' || normalized === 'Replay',
            is_simulated: normalized === 'Simulation',
            is_declarative: normalized === 'Specification' || normalized === 'Inference',
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = ObservationTypeClassifier;
