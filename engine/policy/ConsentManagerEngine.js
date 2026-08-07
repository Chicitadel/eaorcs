/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Consent & User Approval Architecture
 * File           : ConsentManagerEngine.js
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

/**
 * Enterprise Roles and Stage Approvals Matrix:
 * 
 * 1. Developer: May approve GENERATE & source code implementation tasks.
 * 2. Architect: May approve MODIFY & architecture decision records (ADRs).
 * 3. Security Lead: May approve PACKAGE & zero-trust boundaries.
 * 4. Release Manager: May approve RELEASE & production sign-offs.
 */
const ROLE_PERMISSIONS = {
    Developer: ['GENERATE', 'MODIFY_CODE'],
    Architect: ['GENERATE', 'MODIFY', 'ADR_CHANGE'],
    SecurityLead: ['PACKAGE', 'SECURITY_OVERRIDE'],
    ReleaseManager: ['PACKAGE', 'RELEASE']
};

class ConsentManagerEngine {
    constructor(options = {}) {
        this.options = options;
        this.sessionConsentStore = new Map();
        this.projectConsentStore = new Map();
        this.workspaceConsentStore = new Map();
    }

    /**
     * Records a consent approval or refusal with scope and role validation.
     * 
     * @param {string} key Consent key (e.g. "MODIFY:UserService.js" or "MODIFY:STAGE").
     * @param {boolean} approved True if approved, false if rejected.
     * @param {string} scope Consent scope ("session", "project", "workspace").
     * @param {string} userRole User role ("Developer", "Architect", "SecurityLead", "ReleaseManager").
     */
    recordConsent(key, approved, scope = 'session', userRole = 'Developer') {
        const stage = String(key).split(':')[0].toUpperCase();
        
        // Validate Role Permissions for High-Privilege Stages
        if (approved && !this.isRoleAuthorizedForStage(userRole, stage)) {
            throw new Error(`Role Authorization Denied: Role '${userRole}' is not authorized to approve stage '${stage}'. Required roles: ${this.getAuthorizedRolesForStage(stage).join(', ')}.`);
        }

        const record = {
            key,
            approved: Boolean(approved),
            scope,
            userRole,
            grantedAt: new Date().toISOString()
        };

        if (scope === 'workspace') {
            this.workspaceConsentStore.set(key, record);
        } else if (scope === 'project') {
            this.projectConsentStore.set(key, record);
        } else {
            this.sessionConsentStore.set(key, record);
        }

        return record;
    }

    /**
     * Checks if a user role is authorized to approve a stage.
     */
    isRoleAuthorizedForStage(userRole, stage) {
        if (userRole === 'Admin' || userRole === 'GovernanceLead') return true;
        const permissions = ROLE_PERMISSIONS[userRole] || ['GENERATE'];
        return permissions.includes(stage) || permissions.includes('MODIFY');
    }

    getAuthorizedRolesForStage(stage) {
        const authorized = [];
        for (const [role, perms] of Object.entries(ROLE_PERMISSIONS)) {
            if (perms.includes(stage)) authorized.push(role);
        }
        return authorized.length > 0 ? authorized : ['Architect', 'ReleaseManager', 'Admin'];
    }

    /**
     * Checks if consent is already recorded for a key across scopes (Workspace > Project > Session).
     */
    hasRecordedConsent(key) {
        if (this.workspaceConsentStore.has(key)) {
            return this.workspaceConsentStore.get(key);
        }
        if (this.projectConsentStore.has(key)) {
            return this.projectConsentStore.get(key);
        }
        if (this.sessionConsentStore.has(key)) {
            return this.sessionConsentStore.get(key);
        }
        return null;
    }

    clearSessionConsent() {
        this.sessionConsentStore.clear();
    }
}

module.exports = ConsentManagerEngine;
