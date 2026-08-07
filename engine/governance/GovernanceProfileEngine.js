/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Declarative Governance Profiles Engine
 * File           : GovernanceProfileEngine.js
 * Version        : 2026.3.0-LTS
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
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

class GovernanceProfileEngine {
    constructor(options = {}) {
        this.options = options;
        this.profiles = new Map();
        this._initializeDefaultProfiles();
    }

    _initializeDefaultProfiles() {
        const profileDefs = [
            { profileId: 'PROFILE-COMMUNITY', name: 'Community Profile', level: 1, strictness: 'STANDARD', requiresSignatures: false, requiresHardwareToken: false },
            { profileId: 'PROFILE-PROFESSIONAL', name: 'Professional Profile', level: 2, strictness: 'ELEVATED', requiresSignatures: true, requiresHardwareToken: false },
            { profileId: 'PROFILE-ENTERPRISE', name: 'Enterprise Profile', level: 3, strictness: 'STRICT', requiresSignatures: true, requiresHardwareToken: true },
            { profileId: 'PROFILE-GOVERNMENT', name: 'Government Profile', level: 4, strictness: 'RIGOROUS', requiresSignatures: true, requiresHardwareToken: true },
            { profileId: 'PROFILE-SOVEREIGN', name: 'Sovereign Profile', level: 5, strictness: 'MAXIMUM_ISOLATION', requiresSignatures: true, requiresHardwareToken: true }
        ];

        for (const p of profileDefs) {
            this.profiles.set(p.profileId, p);
        }
    }

    resolveProfile(profileId = 'PROFILE-ENTERPRISE') {
        const uppercase = String(profileId).toUpperCase();
        const key = uppercase.startsWith('PROFILE-') ? uppercase : `PROFILE-${uppercase}`;
        return this.profiles.get(key) || this.profiles.get('PROFILE-ENTERPRISE');
    }

    resolveInheritedConstraints(profileId) {
        const profile = this.resolveProfile(profileId);
        if (!profile) return null;
        const allIds = ['PROFILE-COMMUNITY', 'PROFILE-PROFESSIONAL', 'PROFILE-ENTERPRISE', 'PROFILE-GOVERNMENT', 'PROFILE-SOVEREIGN'];
        const constraints = [];
        for (const pid of allIds) {
            const p = this.resolveProfile(pid);
            if (p && p.level <= profile.level) {
                constraints.push({ sourceProfile: pid, level: p.level, strictness: p.strictness, requiresSignatures: p.requiresSignatures, requiresHardwareToken: p.requiresHardwareToken });
            }
        }
        return { profileId, resolvedLevel: profile.level, inheritedFrom: constraints.length, constraints };
    }

    computeProfileDiff(profileIdA, profileIdB) {
        const a = this.resolveProfile(profileIdA);
        const b = this.resolveProfile(profileIdB);
        if (!a || !b) return { error: 'Profile not found' };
        const diffs = [];
        for (const key of ['level', 'strictness', 'requiresSignatures', 'requiresHardwareToken']) {
            if (a[key] !== b[key]) diffs.push({ field: key, profileA: a[key], profileB: b[key] });
        }
        return { profileIdA, profileIdB, diffCount: diffs.length, diffs };
    }

    validateProfileCompliance(workspaceConfig, profileId) {
        const inherited = this.resolveInheritedConstraints(profileId);
        if (!inherited) return { compliant: false, reason: 'Profile not found' };
        const violations = [];
        const top = inherited.constraints[inherited.constraints.length - 1];
        if (top && top.requiresSignatures && !workspaceConfig.signaturesEnabled) violations.push('signaturesEnabled required');
        if (top && top.requiresHardwareToken && !workspaceConfig.hardwareTokenEnabled) violations.push('hardwareTokenEnabled required');
        return { compliant: violations.length === 0, profileId, violations };
    }
}

module.exports = GovernanceProfileEngine;
