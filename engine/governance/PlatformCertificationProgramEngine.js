/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Platform Certification Program Engine
 * File           : PlatformCertificationProgramEngine.js
 * Version        : 2026.3.1-LTS
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
 * CORP: Layer E Tiered Certification
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

const crypto = require('crypto');

class PlatformCertificationProgramEngine {
    constructor(options = {}) {
        this.options = options;

        this.tierDefinitions = [
            {
                tier: 'Bronze',
                level: 1,
                color: '#cd7f32',
                icon: 'shield-bronze',
                description: 'Foundation Facade & Determinism Certified',
                gates: [
                    { id: 'facadeExport', label: 'Single Public Facade Export (Law 1)', check: (p) => Boolean(p.facadeExport) },
                    { id: 'mandatoryHeaders', label: 'UAIGOS Corporate Author Headers', check: (p) => Boolean(p.mandatoryHeaders) },
                    { id: 'deterministicExecution', label: 'Deterministic Execution Baseline (Law 2)', check: (p) => Boolean(p.deterministicExecution) }
                ]
            },
            {
                tier: 'Silver',
                level: 2,
                color: '#c0c0c0',
                icon: 'shield-silver',
                description: 'Automated Evidence & Side-Effect Isolated Certified',
                prerequisiteTier: 'Bronze',
                gates: [
                    {
                        id: 'automatedTestCoverage',
                        label: 'Automated Test Coverage (>=80%)',
                        check: (p) => p.automatedTestCoverage === true || (typeof p.automatedTestCoverage === 'number' && p.automatedTestCoverage >= 80)
                    },
                    { id: 'evidenceGraphValidation', label: 'Auditable Evidence Graph Validation (Law 4)', check: (p) => Boolean(p.evidenceGraphValidation) },
                    { id: 'zeroHiddenSideEffects', label: 'Zero Hidden Side-Effects Isolation (Law 8)', check: (p) => Boolean(p.zeroHiddenSideEffects) }
                ]
            },
            {
                tier: 'Gold',
                level: 3,
                color: '#ffd700',
                icon: 'shield-gold',
                description: 'ADR & Capability Contract Compliant Certified',
                prerequisiteTier: 'Silver',
                gates: [
                    { id: 'adrRegistryCompliance', label: 'ADR Registry Compliance', check: (p) => Boolean(p.adrRegistryCompliance) },
                    { id: 'capabilityContracts', label: 'Explicit Capability Contracts (Law 7)', check: (p) => Boolean(p.capabilityContracts) },
                    { id: 'explainableDecisions', label: 'Explainable Decision Framework (Law 3)', check: (p) => Boolean(p.explainableDecisions) },
                    {
                        id: 'complianceMapping',
                        label: 'Standards Compliance Mapping (ISO/SOC2/NIST)',
                        check: (p) => Boolean(p.complianceMapping) && (Array.isArray(p.complianceMapping) ? p.complianceMapping.length > 0 : true)
                    }
                ]
            },
            {
                tier: 'Enterprise',
                level: 4,
                color: '#4169e1',
                icon: 'shield-enterprise',
                description: 'Multi-Tenant Telemetry & SLA Certified',
                prerequisiteTier: 'Gold',
                gates: [
                    { id: 'multiTenantIsolation', label: 'Multi-Tenant Security Boundary Isolation', check: (p) => Boolean(p.multiTenantIsolation) },
                    { id: 'telemetryAdapters', label: 'Telemetry Provider Adapters Integration', check: (p) => Boolean(p.telemetryAdapters) },
                    { id: 'slaVerification', label: 'SLA & Performance Parity Verification', check: (p) => Boolean(p.slaVerification) },
                    { id: 'zeroAiOnlyDependency', label: 'Zero AI-Only Dependency Fallback (Law 9)', check: (p) => Boolean(p.zeroAiOnlyDependency) }
                ]
            },
            {
                tier: 'Government',
                level: 5,
                color: '#2e8b57',
                icon: 'shield-government',
                description: 'FIPS Cryptography & Air-Gapped Certified',
                prerequisiteTier: 'Enterprise',
                gates: [
                    { id: 'fipsCrypto', label: 'FIPS 140-3 Cryptography Validation', check: (p) => Boolean(p.fipsCrypto) },
                    { id: 'auditEvidenceImmutability', label: 'Immutable Audit Evidence Chain (Law 4)', check: (p) => Boolean(p.auditEvidenceImmutability) },
                    { id: 'offlineSurfaceExperience', label: 'Air-Gapped / Offline Surface Experience (Law 12)', check: (p) => Boolean(p.offlineSurfaceExperience) }
                ]
            },
            {
                tier: 'Sovereign',
                level: 6,
                color: '#800080',
                icon: 'shield-sovereign',
                description: 'Sovereign HSM Signing & Platform Parity Certified',
                prerequisiteTier: 'Government',
                gates: [
                    { id: 'sovereignDataResidency', label: 'Sovereign Data Residency Isolation', check: (p) => Boolean(p.sovereignDataResidency) },
                    { id: 'airGappedCompliance', label: 'Strict Air-Gapped Network Isolation Guarantee', check: (p) => Boolean(p.airGappedCompliance) },
                    { id: 'hsmSigning', label: 'Hardware Security Module (HSM) Evidence Signing', check: (p) => Boolean(p.hsmSigning) },
                    { id: 'platformParity', label: 'Full Platform Parity Across Surfaces (Law 11)', check: (p) => Boolean(p.platformParity) },
                    { id: 'sovereignGovernance', label: 'Sovereign Constitutional Governance', check: (p) => Boolean(p.sovereignGovernance) }
                ]
            }
        ];
    }

    /**
     * Evaluates product compliance against 6 certification tiers.
     * @param {Object} productDescriptor - Product capabilities & governance flags.
     * @returns {Object} Comprehensive evaluation result, tier gates, and badge attributes.
     */
    evaluateCertificationTier(productDescriptor = {}) {
        const evaluatedAt = new Date().toISOString();
        const productId = productDescriptor.productId || 'unnamed-product';
        const version = productDescriptor.version || '1.0.0';

        const tierEvaluations = {};
        let highestTier = null;
        let cumulativePassed = true;

        for (const tierDef of this.tierDefinitions) {
            const gateResults = [];
            const missingGates = [];

            for (const gate of tierDef.gates) {
                const passed = gate.check(productDescriptor);
                gateResults.push({
                    gateId: gate.id,
                    label: gate.label,
                    passed
                });
                if (!passed) {
                    missingGates.push(gate.id);
                }
            }

            const tierPassed = cumulativePassed && missingGates.length === 0;

            tierEvaluations[tierDef.tier] = {
                tier: tierDef.tier,
                level: tierDef.level,
                passed: tierPassed,
                gates: gateResults,
                missingGates
            };

            if (tierPassed) {
                highestTier = tierDef;
            } else {
                cumulativePassed = false; // Tier hierarchy fails if prerequisite fails
            }
        }

        const highestTierAchieved = highestTier ? highestTier.tier : 'NONE';
        const isCertified = highestTier !== null;

        const badge = isCertified
            ? {
                tier: highestTier.tier,
                level: highestTier.level,
                color: highestTier.color,
                icon: highestTier.icon,
                status: 'CERTIFIED',
                description: highestTier.description,
                issuedAt: evaluatedAt
            }
            : {
                tier: 'NONE',
                level: 0,
                color: '#808080',
                icon: 'shield-none',
                status: 'REJECTED',
                description: 'Product does not satisfy baseline Bronze tier certification requirements',
                issuedAt: evaluatedAt
            };

        // Recommendations for progression
        const recommendations = [];
        for (const tierDef of this.tierDefinitions) {
            const evalObj = tierEvaluations[tierDef.tier];
            if (!evalObj.passed && evalObj.missingGates.length > 0) {
                recommendations.push({
                    targetTier: tierDef.tier,
                    missingGates: evalObj.missingGates,
                    action: `Satisfy missing gates to achieve ${tierDef.tier} certification: ${evalObj.missingGates.join(', ')}`
                });
            }
        }

        const payloadToHash = JSON.stringify({ productId, version, highestTierAchieved, evaluatedAt });
        const verificationHash = crypto.createHash('sha256').update(payloadToHash).digest('hex');

        badge.verificationHash = verificationHash;

        return {
            productId,
            version,
            evaluatedAt,
            isCertified,
            highestTierAchieved,
            badge,
            tierEvaluations,
            recommendations,
            verificationHash
        };
    }
}

// Module facade helper function export
function evaluateCertificationTier(productDescriptor) {
    const engine = new PlatformCertificationProgramEngine();
    return engine.evaluateCertificationTier(productDescriptor);
}

module.exports = {
    PlatformCertificationProgramEngine,
    evaluateCertificationTier
};
