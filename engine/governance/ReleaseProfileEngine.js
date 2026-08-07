/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Release Profile Governance Engine
 * File           : ReleaseProfileEngine.js
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
 * CORP: Stream 3 — Release Profiles & Generated Architecture
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

/**
 * 8 Supported Release Profiles definitions.
 */
const PROFILES = Object.freeze({
    DEVELOPER: {
        profileId: 'DEVELOPER',
        name: 'Developer Release Profile',
        description: 'Optimized for local engineering, fast feedback loops, and rapid iteration.',
        tier: 1,
        allowedArtifactTypes: ['source', 'docs', 'tests', 'dev-config'],
        disallowedArtifactTypes: ['classified-spec', 'airgap-package', 'enterprise-license-vault'],
        mandatoryGates: ['unitTestsPass', 'basicLintPass'],
        minCoverageThreshold: 50
    },
    ENTERPRISE: {
        profileId: 'ENTERPRISE',
        name: 'Enterprise Release Profile',
        description: 'Commercial enterprise deployment with SOC2/ISO compliance and security controls.',
        tier: 2,
        allowedArtifactTypes: ['source', 'docs', 'tests', 'config', 'enterprise-audit', 'compliance-pack'],
        disallowedArtifactTypes: ['classified-spec', 'airgap-package'],
        mandatoryGates: ['unitTestsPass', 'integrationTestsPass', 'securityScanPass', 'licenseCompliancePass'],
        minCoverageThreshold: 80
    },
    GOVERNMENT: {
        profileId: 'GOVERNMENT',
        name: 'Government Release Profile',
        description: 'High-assurance government profile complying with FedRAMP, NIST, and strict audit trails.',
        tier: 3,
        allowedArtifactTypes: ['source', 'docs', 'tests', 'config', 'enterprise-audit', 'compliance-pack', 'nist-matrix', 'crypto-proof'],
        disallowedArtifactTypes: [],
        mandatoryGates: ['unitTestsPass', 'integrationTestsPass', 'securityScanPass', 'nistCompliancePass', 'airgapVerificationPass', 'cryptoAuditPass'],
        minCoverageThreshold: 90
    },
    SOVEREIGN: {
        profileId: 'SOVEREIGN',
        name: 'Sovereign Release Profile',
        description: 'Maximum isolation and digital sovereignty profile with zero external runtime dependencies.',
        tier: 4,
        allowedArtifactTypes: ['source', 'docs', 'tests', 'config', 'compliance-pack', 'airgap-package', 'sovereign-vault'],
        disallowedArtifactTypes: ['telemetry-exporter', 'external-cloud-adapter'],
        mandatoryGates: ['unitTestsPass', 'integrationTestsPass', 'securityScanPass', 'sovereigntyCompliancePass', 'dataResidencyPass', 'airgapVerificationPass', 'hardwareTokenVerified'],
        minCoverageThreshold: 95
    },
    OEM: {
        profileId: 'OEM',
        name: 'OEM Embedded Release Profile',
        description: 'Embeddable SDK and white-label integration profile for third-party original equipment manufacturers.',
        tier: 2,
        allowedArtifactTypes: ['source', 'sdk-header', 'embedded-binary', 'oem-docs'],
        disallowedArtifactTypes: ['internal-telemetry', 'sovereign-vault', 'classified-spec'],
        mandatoryGates: ['unitTestsPass', 'oemLicensePass', 'apiCompatibilityPass', 'dependencyBoundaryPass'],
        minCoverageThreshold: 80
    },
    MARKETPLACE: {
        profileId: 'MARKETPLACE',
        name: 'Marketplace Extension Profile',
        description: 'Distribution profile for third-party marketplace modules and extension ecosystem.',
        tier: 2,
        allowedArtifactTypes: ['plugin-manifest', 'source', 'marketplace-docs'],
        disallowedArtifactTypes: ['core-private-keys', 'internal-telemetry', 'classified-spec'],
        mandatoryGates: ['unitTestsPass', 'securityScanPass', 'marketplacePolicyPass', 'sandboxingVerified'],
        minCoverageThreshold: 75
    },
    SAAS: {
        profileId: 'SAAS',
        name: 'SaaS Cloud Multi-Tenant Profile',
        description: 'Hosted cloud service profile with multi-tenancy controls and active telemetry.',
        tier: 2,
        allowedArtifactTypes: ['source', 'cloud-config', 'telemetry-pack', 'tenant-policy'],
        disallowedArtifactTypes: ['airgap-package', 'classified-spec'],
        mandatoryGates: ['unitTestsPass', 'integrationTestsPass', 'tenantIsolationPass', 'telemetryVerified', 'slacompilePass'],
        minCoverageThreshold: 85
    },
    INTERNAL: {
        profileId: 'INTERNAL',
        name: 'Internal Engineering Profile',
        description: 'Internal engineering test builds and experimental features.',
        tier: 1,
        allowedArtifactTypes: ['source', 'docs', 'tests', 'experimental-feature', 'internal-tooling'],
        disallowedArtifactTypes: ['production-release-notes'],
        mandatoryGates: ['unitTestsPass', 'internalSecurityPass'],
        minCoverageThreshold: 60
    }
});

class ReleaseProfileEngine {
    constructor(options = {}) {
        this.options = options;
        this.profiles = new Map();
        this._initializeDefaultProfiles();
    }

    _initializeDefaultProfiles() {
        for (const [key, profile] of Object.entries(PROFILES)) {
            this.profiles.set(key, profile);
        }
    }

    /**
     * Resolve and return configuration for a given profile ID.
     * Supports 8 Release Profiles: Developer, Enterprise, Government, Sovereign, OEM, Marketplace, SaaS, Internal.
     * @param {string} profileId
     * @returns {Object}
     */
    getProfileConfig(profileId) {
        if (!profileId || typeof profileId !== 'string') {
            throw new Error('Profile ID must be a non-empty string');
        }
        const normalized = profileId.toUpperCase().replace(/^PROFILE-/, '').trim();
        const config = this.profiles.get(normalized);
        if (!config) {
            throw new Error(`Unknown Release Profile ID: '${profileId}'. Supported profiles: ${Object.keys(PROFILES).join(', ')}`);
        }
        return JSON.parse(JSON.stringify(config));
    }

    /**
     * Filter artifact inclusions and validation rules per profile.
     * @param {Array<Object|string>} artifacts 
     * @param {string} profileId 
     * @returns {Array<Object|string>} Filtered artifacts matching profile rules.
     */
    filterArtifactsForProfile(artifacts, profileId) {
        const config = this.getProfileConfig(profileId);
        if (!Array.isArray(artifacts)) {
            return [];
        }

        return artifacts.filter(art => {
            if (!art) return false;

            if (typeof art === 'string') {
                const lower = art.toLowerCase();
                for (const dis of config.disallowedArtifactTypes) {
                    if (lower.includes(dis.toLowerCase())) {
                        return false;
                    }
                }
                return true;
            }

            if (typeof art === 'object') {
                if (Array.isArray(art.targetProfiles) && art.targetProfiles.length > 0) {
                    const normTargets = art.targetProfiles.map(p => String(p).toUpperCase().replace(/^PROFILE-/, ''));
                    if (!normTargets.includes(config.profileId)) {
                        return false;
                    }
                }

                if (Array.isArray(art.profiles) && art.profiles.length > 0) {
                    const normProfiles = art.profiles.map(p => String(p).toUpperCase().replace(/^PROFILE-/, ''));
                    if (!normProfiles.includes(config.profileId)) {
                        return false;
                    }
                }

                if (art.type && typeof art.type === 'string') {
                    const typeNorm = art.type.toLowerCase();
                    if (config.disallowedArtifactTypes.some(dis => dis.toLowerCase() === typeNorm)) {
                        return false;
                    }
                    if (art.strictMatching && config.allowedArtifactTypes.length > 0) {
                        const isAllowed = config.allowedArtifactTypes.some(al => al.toLowerCase() === typeNorm);
                        if (!isAllowed) return false;
                    }
                }

                if (typeof art.minTier === 'number' && config.tier < art.minTier) {
                    return false;
                }

                return true;
            }

            return true;
        });
    }

    /**
     * Checks mandatory release gates for profile against provided validation results.
     * @param {string} profileId 
     * @param {Object|Array} validationResults 
     * @returns {Object} Validation gate report with passed, total, passedGates, failedGates, missingGates.
     */
    validateProfileGates(profileId, validationResults) {
        const config = this.getProfileConfig(profileId);
        const resultsMap = new Map();

        if (Array.isArray(validationResults)) {
            for (const item of validationResults) {
                if (item && typeof item === 'object' && item.gate) {
                    resultsMap.set(item.gate, item.passed !== undefined ? Boolean(item.passed) : item.status === 'PASS');
                }
            }
        } else if (validationResults && typeof validationResults === 'object') {
            for (const [key, val] of Object.entries(validationResults)) {
                resultsMap.set(key, Boolean(val));
            }
        }

        const details = [];
        const passedGates = [];
        const failedGates = [];
        const missingGates = [];

        for (const gate of config.mandatoryGates) {
            const hasResult = resultsMap.has(gate);
            const passed = hasResult ? resultsMap.get(gate) : false;

            if (!hasResult) {
                missingGates.push(gate);
                failedGates.push(gate);
            } else if (passed) {
                passedGates.push(gate);
            } else {
                failedGates.push(gate);
            }

            details.push({
                gate,
                mandatory: true,
                status: passed ? 'PASS' : (hasResult ? 'FAIL' : 'MISSING'),
                passed
            });
        }

        const overallPassed = failedGates.length === 0 && missingGates.length === 0;

        return {
            profileId: config.profileId,
            profileName: config.name,
            passed: overallPassed,
            totalGatesChecked: config.mandatoryGates.length,
            passedGatesCount: passedGates.length,
            failedGatesCount: failedGates.length,
            missingGatesCount: missingGates.length,
            passedGates,
            failedGates,
            missingGates,
            details
        };
    }

    static get PROFILES() { return PROFILES; }
}

module.exports = ReleaseProfileEngine;
module.exports.ReleaseProfileEngine = ReleaseProfileEngine;

