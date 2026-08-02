/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Trust Decay & Evidence Freshness Engine
 * File           : TrustDecayEngine.cjs
 * Version        : 2026.1-LTS (v5.1 Evidence-Backed Framework)
 * Author         : Architectural Governance Council & Trust Fabric Authority
 * Organization   : Air Roofers Platform Ecosystem / EAORCS
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | RESTRICTED
 ******************************************************************************/

class TrustDecayEngine {
    /**
     * Computes the freshness classification and trust multiplier based on evidence age in days.
     */
    static calculateFreshness(timestamp, maxValidityDays = 30) {
        const evidenceDate = new Date(timestamp);
        const currentDate = new Date();
        const diffMs = currentDate.getTime() - evidenceDate.getTime();
        const ageDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

        const expirationDate = new Date(evidenceDate.getTime() + (maxValidityDays * 24 * 60 * 60 * 1000));

        let status = 'Fresh';
        let multiplier = 1.0;

        if (ageDays > maxValidityDays * 6) {
            status = 'Expired';
            multiplier = 0.0;
        } else if (ageDays > maxValidityDays * 3) {
            status = 'Stale';
            multiplier = 0.60;
        } else if (ageDays > maxValidityDays) {
            status = 'Warning';
            multiplier = 0.85;
        }

        return {
            generated_at: evidenceDate.toISOString(),
            expires_at: expirationDate.toISOString(),
            age_days: ageDays,
            max_validity_days: maxValidityDays,
            freshness_status: status,
            trust_decay_multiplier: multiplier,
            timestamp: evidenceDate.toISOString()
        };
    }

    /**
     * Applies decay factors to a list of evidence items.
     */
    static applyDecayToEvidence(evidenceItems = []) {
        let totalWeightedScore = 0;
        let totalBaseScore = 0;
        const processedItems = [];

        for (const item of evidenceItems) {
            const baseScore = item.base_score || 100.0;
            const freshness = TrustDecayEngine.calculateFreshness(item.timestamp || new Date().toISOString(), item.max_validity_days || 30);
            const decayedScore = parseFloat((baseScore * freshness.trust_decay_multiplier).toFixed(2));

            processedItems.push({
                evidence_id: item.evidence_id || `ev_${Math.random().toString(36).substring(7)}`,
                type: item.type || 'AUDIT_LOG',
                base_score: baseScore,
                decayed_score: decayedScore,
                freshness
            });

            totalBaseScore += baseScore;
            totalWeightedScore += decayedScore;
        }

        const effectiveDecayRatio = totalBaseScore > 0 ? parseFloat((totalWeightedScore / totalBaseScore).toFixed(4)) : 1.0;

        return {
            evidence_count: evidenceItems.length,
            effective_decay_ratio: effectiveDecayRatio,
            decayed_evidence_items: processedItems,
            evaluated_at: new Date().toISOString()
        };
    }
}

module.exports = TrustDecayEngine;
