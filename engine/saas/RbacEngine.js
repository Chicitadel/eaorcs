/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Enterprise RBAC Engine (Stream G)
 * File           : RbacEngine.js
 * Version        : 2026.1-LTS (v1.0.0-FROZEN)
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Chicitadel / Air Roofers SASU
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Architecture Frozen (ADR-001)
 * - Security Reviewed & Zero Trust Access Control Enforced
 ******************************************************************************/

'use strict';

/**
 * Built-in Standard Enterprise Roles
 */
const STANDARD_ROLES = Object.freeze({
    OWNER: 'Owner',
    ADMIN: 'Admin',
    AUDITOR: 'Auditor',
    COMPLIANCE_OFFICER: 'ComplianceOfficer',
    SECURITY_ENGINEER: 'SecurityEngineer',
    DEVELOPER: 'Developer',
    VIEWER: 'Viewer'
});

/**
 * RbacEngine
 * Enterprise Role-Based Access Control and Attribute-Based Access Control evaluator.
 */
class RbacEngine {
    constructor() {
        this.roles = new Map();
        this.initializeBuiltinRoles();
    }

    /**
     * Initializes default enterprise role definitions & hierarchy.
     */
    initializeBuiltinRoles() {
        // Viewer (Base role)
        this.registerRole(STANDARD_ROLES.VIEWER, [
            'dashboard:view',
            'audit:read',
            'policy:read',
            'telemetry:read',
            'report:view'
        ]);

        // Developer (inherits Viewer)
        this.registerRole(STANDARD_ROLES.DEVELOPER, [
            'repository:read',
            'repository:write',
            'audit:execute',
            'dsl:compile',
            'dsl:execute'
        ], [STANDARD_ROLES.VIEWER]);

        // Security Engineer (inherits Developer)
        this.registerRole(STANDARD_ROLES.SECURITY_ENGINEER, [
            'security:read',
            'security:scan',
            'policy:evaluate',
            'finding:triage',
            'finding:suppress'
        ], [STANDARD_ROLES.DEVELOPER]);

        // Compliance Officer (inherits Viewer + Compliance specific)
        this.registerRole(STANDARD_ROLES.COMPLIANCE_OFFICER, [
            'compliance:read',
            'compliance:attest',
            'policy:write',
            'policy:publish',
            'report:export',
            'pack:load'
        ], [STANDARD_ROLES.VIEWER]);

        // Auditor (Specialized audit read + export)
        this.registerRole(STANDARD_ROLES.AUDITOR, [
            'audit:*',
            'report:*',
            'compliance:read',
            'policy:read',
            'evidence:export'
        ]);

        // Admin (inherits SecurityEngineer, ComplianceOfficer)
        this.registerRole(STANDARD_ROLES.ADMIN, [
            'tenant:read',
            'tenant:settings:write',
            'user:manage',
            'role:manage',
            'plugin:register',
            'plugin:execute'
        ], [STANDARD_ROLES.SECURITY_ENGINEER, STANDARD_ROLES.COMPLIANCE_OFFICER]);

        // Owner (Full superuser)
        this.registerRole(STANDARD_ROLES.OWNER, [
            '*'
        ]);
    }

    /**
     * Registers a role definition with permissions and inheritance.
     * @param {string} roleName 
     * @param {Array<string>} permissions 
     * @param {Array<string>} inherits 
     */
    registerRole(roleName, permissions = [], inherits = []) {
        if (!roleName || typeof roleName !== 'string') {
            throw new Error('Role name must be a non-empty string');
        }
        this.roles.set(roleName, {
            name: roleName,
            permissions: Array.from(new Set(permissions)),
            inherits: Array.from(new Set(inherits))
        });
    }

    /**
     * Retrieves effective permissions for a role, resolving inheritance recursively.
     * @param {string} roleName 
     * @param {Set<string>} visited 
     * @returns {Array<string>} Effective permissions
     */
    getEffectivePermissions(roleName, visited = new Set()) {
        if (visited.has(roleName)) return [];
        visited.add(roleName);

        const role = this.roles.get(roleName);
        if (!role) return [];

        let perms = [...role.permissions];

        for (const inheritedRole of role.inherits) {
            perms = perms.concat(this.getEffectivePermissions(inheritedRole, visited));
        }

        return Array.from(new Set(perms));
    }

    /**
     * Matches a permission pattern against a requested action.
     * Supports wildcards like 'audit:*', 'policy:*', '*'
     * @param {string} pattern 
     * @param {string} action 
     * @returns {boolean}
     */
    wildcardMatch(pattern, action) {
        if (pattern === '*' || pattern === action) return true;
        if (pattern.endsWith(':*')) {
            const prefix = pattern.slice(0, -2);
            return action.startsWith(prefix + ':') || action === prefix;
        }
        return false;
    }

    /**
     * Evaluates permission for a user context against a requested action and resource.
     * @param {Object} userContext { userId, tenantId, roles: [], permissions: [] }
     * @param {string} action Requested action (e.g., 'policy:write', 'audit:execute')
     * @param {Object} resourceContext Optional resource context for ABAC evaluation
     * @returns {Object} { allowed: boolean, reason: string, matchedPermission: string|null }
     */
    evaluatePermission(userContext, action, resourceContext = null) {
        if (!userContext || typeof userContext !== 'object') {
            return { allowed: false, reason: 'Invalid or missing user context', matchedPermission: null };
        }

        if (!action || typeof action !== 'string') {
            return { allowed: false, reason: 'Invalid or missing action', matchedPermission: null };
        }

        // 1. Gather all permissions from assigned roles & explicit custom permissions
        const userRoles = userContext.roles || [STANDARD_ROLES.VIEWER];
        let allPermissions = [...(userContext.permissions || [])];

        for (const roleName of userRoles) {
            allPermissions = allPermissions.concat(this.getEffectivePermissions(roleName));
        }

        // 2. Check for explicit DENY permissions (prefixed with '!'), e.g. '!user:manage'
        const isExplicitlyDenied = allPermissions.some(perm => perm.startsWith('!') && this.wildcardMatch(perm.slice(1), action));
        if (isExplicitlyDenied) {
            return { allowed: false, reason: `Action [${action}] explicitly denied by policy`, matchedPermission: null };
        }

        // 3. Check for matching permission rule
        const matchedPermission = allPermissions.find(perm => !perm.startsWith('!') && this.wildcardMatch(perm, action));
        if (!matchedPermission) {
            return { allowed: false, reason: `No matching permission found for action [${action}] across roles: ${userRoles.join(', ')}`, matchedPermission: null };
        }

        // 4. Attribute-Based Access Control (ABAC) Validation if resourceContext provided
        if (resourceContext) {
            // Tenant isolation check
            if (resourceContext.tenantId && userContext.tenantId && resourceContext.tenantId !== userContext.tenantId && userContext.tenantId !== 'global') {
                return { allowed: false, reason: `Tenant boundary mismatch: user tenant [${userContext.tenantId}] cannot access resource tenant [${resourceContext.tenantId}]`, matchedPermission: null };
            }

            // Classification check
            if (resourceContext.classification === 'TOP_SECRET' && !userRoles.includes(STANDARD_ROLES.OWNER)) {
                return { allowed: false, reason: 'TOP_SECRET resource requires Owner authorization', matchedPermission: null };
            }
        }

        return {
            allowed: true,
            reason: `Action [${action}] authorized via permission [${matchedPermission}]`,
            matchedPermission
        };
    }

    /**
     * Lists all effective permissions for a user context.
     * @param {Object} userContext 
     * @returns {Array<string>} List of permissions
     */
    listUserPermissions(userContext) {
        if (!userContext) return [];
        const userRoles = userContext.roles || [STANDARD_ROLES.VIEWER];
        let perms = [...(userContext.permissions || [])];

        for (const roleName of userRoles) {
            perms = perms.concat(this.getEffectivePermissions(roleName));
        }

        return Array.from(new Set(perms));
    }
}

module.exports = {
    RbacEngine,
    STANDARD_ROLES
};
