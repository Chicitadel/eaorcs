/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Workspace Registry & Universal Resource Hierarchy Engine
 * File           : ProjectRegistry.js
 * Version        : 2026.1-LTS (v2.0.0-PNC-001)
 * Author         : Architectural Governance Council & Ujomor Systems Engineering
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
 * Created Date   : 2026-08-02
 * Last Modified  : 2026-08-02
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 * - PNC-001 Platform Neutrality Compliant
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Valid operational environments for enterprise workspaces.
 */
const ENVIRONMENTS = Object.freeze(['Dev', 'QA', 'Staging', 'Prod', 'DR']);

/**
 * Environment normalization map for flexible case matching.
 */
const ENVIRONMENT_ALIASES = Object.freeze({
    'dev': 'Dev',
    'development': 'Dev',
    'qa': 'QA',
    'quality-assurance': 'QA',
    'test': 'QA',
    'testing': 'QA',
    'staging': 'Staging',
    'stage': 'Staging',
    'prod': 'Prod',
    'production': 'Prod',
    'dr': 'DR',
    'disaster-recovery': 'DR'
});

/**
 * Valid risk profiles for workspace compliance governance.
 */
const RISK_PROFILES = Object.freeze(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'ENTERPRISE']);

/**
 * PNC-001 Universal 10-Tier Resource Hierarchy definitions.
 * Ordered strictly from Tier 1 (Tenant) to Tier 10 (Evidence) + Derived Tier 11 (Certificate).
 */
const HIERARCHY_TIERS = Object.freeze([
    'Tenant',
    'Organization',
    'Portfolio',
    'Program',
    'Project',
    'Repository',
    'Specification',
    'Release',
    'AuditRun',
    'Evidence',
    'Certificate'
]);

/**
 * Tier level numerical mapping for fast hierarchy verification.
 */
const TIER_LEVELS = Object.freeze({
    'Tenant': 1,
    'Organization': 2,
    'Portfolio': 3,
    'Program': 4,
    'Project': 5,
    'Repository': 6,
    'Specification': 7,
    'Release': 8,
    'AuditRun': 9,
    'Evidence': 10,
    'Certificate': 11
});

/**
 * Tier aliases for flexible normalization.
 */
const TIER_ALIASES = Object.freeze({
    'tenant': 'Tenant',
    'org': 'Organization',
    'organization': 'Organization',
    'portfolio': 'Portfolio',
    'program': 'Program',
    'proj': 'Project',
    'project': 'Project',
    'repo': 'Repository',
    'repository': 'Repository',
    'spec': 'Specification',
    'specification': 'Specification',
    'release': 'Release',
    'auditrun': 'AuditRun',
    'audit-run': 'AuditRun',
    'audit_run': 'AuditRun',
    'audit run': 'AuditRun',
    'evidence': 'Evidence',
    'cert': 'Certificate',
    'certificate': 'Certificate'
});

/**
 * Default multi-tenant projects built into EAORCS workspace ecosystem.
 * Maintained for backward compatibility.
 */
const DEFAULT_PROJECTS = Object.freeze([
    {
        projectId: 'proj_air_roofers_01',
        name: 'Air Roofers Platform',
        tenantId: 'air-roofers',
        organization: 'Air Roofers Inc.',
        environment: 'Prod',
        riskProfile: 'ENTERPRISE',
        createdDate: '2026-01-15T00:00:00.000Z',
        tags: ['roofing', 'aerospace', 'drones', 'saas'],
        active: true
    },
    {
        projectId: 'proj_akpati_01',
        name: 'Akpati Health & Agri Network',
        tenantId: 'akpati',
        organization: 'Akpati Global',
        environment: 'Prod',
        riskProfile: 'CRITICAL',
        createdDate: '2026-02-10T00:00:00.000Z',
        tags: ['health', 'agri', 'fintech'],
        active: true
    },
    {
        projectId: 'proj_civiscore_01',
        name: 'CiviScore Governance System',
        tenantId: 'civiscore',
        organization: 'CiviScore Public Systems',
        environment: 'Staging',
        riskProfile: 'HIGH',
        createdDate: '2026-03-01T00:00:00.000Z',
        tags: ['govtech', 'scoring', 'compliance'],
        active: true
    },
    {
        projectId: 'proj_eaorcs_core',
        name: 'EAORCS Core Engine',
        tenantId: 'ujomor',
        organization: 'Ujomor Systems',
        environment: 'Prod',
        riskProfile: 'ENTERPRISE',
        createdDate: '2026-01-01T00:00:00.000Z',
        tags: ['core', 'governance', 'engine'],
        active: true
    }
]);

/**
 * ProjectRegistry
 * Manages multi-tenant enterprise workspaces, environment awareness, compliance metadata,
 * and the PNC-001 10-Tier Universal Resource Hierarchy (Tenant -> Org -> Portfolio ->
 * Program -> Project -> Repository -> Specification -> Release -> Audit Run -> Evidence -> Certificate).
 */
class ProjectRegistry {
    /**
     * Constructs a ProjectRegistry instance.
     * @param {Object} [options={}] Configuration options.
     * @param {string} [options.storagePath] Optional file path to persist registry storage.
     * @param {boolean} [options.loadDefaults=true] Whether to seed default projects and hierarchy.
     */
    constructor(options = {}) {
        this.storagePath = options.storagePath ? path.resolve(options.storagePath) : null;
        this.projects = new Map();
        this.hierarchyNodes = new Map();

        if (options.loadDefaults !== false) {
            for (const proj of DEFAULT_PROJECTS) {
                this.registerProject(proj, false);
            }
        }

        if (this.storagePath && fs.existsSync(this.storagePath)) {
            this.loadFromStorage();
        }
    }

    /**
     * Normalizes an environment string to canonical representation.
     * @param {string} env Environment name.
     * @returns {string} Canonical environment name.
     */
    normalizeEnvironment(env) {
        if (!env || typeof env !== 'string') {
            throw new Error(`Invalid environment value: '${env}'. Expected one of: ${ENVIRONMENTS.join(', ')}`);
        }
        const lower = env.trim().toLowerCase();
        if (ENVIRONMENT_ALIASES[lower]) {
            return ENVIRONMENT_ALIASES[lower];
        }
        const match = ENVIRONMENTS.find(e => e.toLowerCase() === lower);
        if (match) {
            return match;
        }
        throw new Error(`Unsupported environment '${env}'. Valid options are: ${ENVIRONMENTS.join(', ')}`);
    }

    /**
     * Validates if a given environment string is valid.
     * @param {string} env Environment name.
     * @returns {boolean} True if valid.
     */
    validateEnvironment(env) {
        try {
            this.normalizeEnvironment(env);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Validates if a given risk profile string is valid.
     * @param {string} profile Risk profile name.
     * @returns {boolean} True if valid.
     */
    validateRiskProfile(profile) {
        if (!profile || typeof profile !== 'string') return false;
        return RISK_PROFILES.includes(profile.toUpperCase());
    }

    /**
     * Normalizes a tier name to canonical HIERARCHY_TIERS representation.
     * @param {string} tier Tier name or alias.
     * @returns {string} Canonical tier name.
     */
    normalizeTier(tier) {
        if (!tier || typeof tier !== 'string') {
            throw new Error(`Invalid hierarchy tier '${tier}'. Expected one of: ${HIERARCHY_TIERS.join(', ')}`);
        }
        const lower = tier.trim().toLowerCase();
        if (TIER_ALIASES[lower]) {
            return TIER_ALIASES[lower];
        }
        const match = HIERARCHY_TIERS.find(t => t.toLowerCase() === lower);
        if (match) {
            return match;
        }
        throw new Error(`Unsupported hierarchy tier '${tier}'. Valid options are: ${HIERARCHY_TIERS.join(', ')}`);
    }

    /**
     * Validates if a given tier is valid.
     * @param {string} tier Tier name.
     * @returns {boolean} True if valid.
     */
    validateTier(tier) {
        try {
            this.normalizeTier(tier);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Ensures parent lineage nodes exist for a target tenant up to target level.
     * @param {string} tenantId Canonical tenant ID.
     * @param {number} targetLevel Target tier level (1..11).
     * @returns {string|null} ID of immediate parent node.
     * @private
     */
    _ensureParentLineage(tenantId, targetLevel) {
        if (targetLevel <= 1) return null;

        let currentParentId = null;
        for (let level = 1; level < targetLevel; level++) {
            const tierName = HIERARCHY_TIERS[level - 1];
            const autoId = `${tierName.toLowerCase()}_${tenantId}`;

            let existingNode = this.hierarchyNodes.get(autoId);
            if (!existingNode) {
                existingNode = Object.freeze({
                    id: autoId,
                    name: `${tenantId.toUpperCase()} Default ${tierName}`,
                    tier: tierName,
                    tierLevel: level,
                    parentId: currentParentId,
                    tenantId: tenantId,
                    organization: `${tenantId.toUpperCase()} Org`,
                    environment: 'Prod',
                    riskProfile: 'MEDIUM',
                    createdDate: new Date().toISOString(),
                    lastUpdated: new Date().toISOString(),
                    tags: ['auto-provisioned', tierName.toLowerCase()],
                    active: true,
                    metadata: { autoProvisioned: true }
                });
                this.hierarchyNodes.set(autoId, existingNode);
            }
            currentParentId = existingNode.id;
        }
        return currentParentId;
    }

    /**
     * Registers or updates a node in the PNC-001 10-Tier Universal Resource Hierarchy.
     * @param {Object} nodeMetadata Hierarchy node configuration.
     * @param {boolean} [autoSave=true] Save to disk if storagePath is configured.
     * @returns {Object} Frozen resource node object.
     */
    registerResourceNode(nodeMetadata, autoSave = true) {
        if (!nodeMetadata || typeof nodeMetadata !== 'object') {
            throw new Error('Resource node metadata must be a non-null object');
        }

        const tier = this.normalizeTier(nodeMetadata.tier || 'Project');
        const tierLevel = TIER_LEVELS[tier];
        const tenantId = (nodeMetadata.tenantId || nodeMetadata.tenant || 'default').trim().toLowerCase();

        const rawId = nodeMetadata.id || nodeMetadata.nodeId || nodeMetadata.projectId || `${tier.toLowerCase()}_${tenantId}_${crypto.randomBytes(3).toString('hex')}`;
        const id = rawId.trim();
        const name = (nodeMetadata.name || id).trim();

        let parentId = nodeMetadata.parentId ? nodeMetadata.parentId.trim() : null;

        if (tierLevel > 1 && !parentId) {
            parentId = this._ensureParentLineage(tenantId, tierLevel);
        }

        const organization = (nodeMetadata.organization || nodeMetadata.org || `${tenantId.toUpperCase()} Organization`).trim();
        const env = this.normalizeEnvironment(nodeMetadata.environment || 'Dev');

        const rawRisk = (nodeMetadata.riskProfile || 'MEDIUM').toUpperCase();
        if (!this.validateRiskProfile(rawRisk)) {
            throw new Error(`Invalid risk profile '${nodeMetadata.riskProfile}'. Allowed: ${RISK_PROFILES.join(', ')}`);
        }

        const createdDate = nodeMetadata.createdDate || new Date().toISOString();
        const tags = Array.isArray(nodeMetadata.tags) ? [...new Set(nodeMetadata.tags)] : [];
        const active = nodeMetadata.active !== false;

        const resourceNode = Object.freeze({
            id,
            name,
            tier,
            tierLevel,
            parentId,
            tenantId,
            organization,
            environment: env,
            riskProfile: rawRisk,
            createdDate,
            lastUpdated: new Date().toISOString(),
            tags,
            active,
            metadata: nodeMetadata.metadata && typeof nodeMetadata.metadata === 'object' ? { ...nodeMetadata.metadata } : {}
        });

        this.hierarchyNodes.set(id, resourceNode);

        // If tier is 'Project', synchronize with projects Map for backward compatibility
        if (tier === 'Project') {
            const projectRecord = Object.freeze({
                projectId: id,
                name: resourceNode.name,
                tenantId: resourceNode.tenantId,
                organization: resourceNode.organization,
                environment: resourceNode.environment,
                riskProfile: resourceNode.riskProfile,
                createdDate: resourceNode.createdDate,
                lastUpdated: resourceNode.lastUpdated,
                tags: resourceNode.tags,
                active: resourceNode.active,
                metadata: resourceNode.metadata
            });
            this.projects.set(id, projectRecord);
        }

        if (autoSave && this.storagePath) {
            this.saveToStorage();
        }

        return resourceNode;
    }

    /**
     * Registers a new project workspace or updates an existing project workspace.
     * (Maintained for full backward compatibility; auto-provisions hierarchy node).
     * @param {Object} projectMetadata Project configuration object.
     * @param {boolean} [autoSave=true] Save to storage if storagePath is configured.
     * @returns {Object} Clean registered project record.
     */
    registerProject(projectMetadata, autoSave = true) {
        if (!projectMetadata || typeof projectMetadata !== 'object') {
            throw new Error('Project metadata must be a non-null object');
        }

        const node = this.registerResourceNode({
            ...projectMetadata,
            tier: 'Project',
            id: projectMetadata.projectId || projectMetadata.id
        }, autoSave);

        return this.projects.get(node.id);
    }

    /**
     * Retrieves a resource node by ID or Tenant/Name lookup.
     * @param {string} identifier Node ID, Project ID, Tenant ID, or Name.
     * @returns {Object|null} Node metadata or null if not found.
     */
    getResourceNode(identifier) {
        if (!identifier || typeof identifier !== 'string') return null;
        const key = identifier.trim();

        if (this.hierarchyNodes.has(key)) {
            return this.hierarchyNodes.get(key);
        }

        const lowerKey = key.toLowerCase();
        for (const node of this.hierarchyNodes.values()) {
            if (node.id.toLowerCase() === lowerKey ||
                node.tenantId.toLowerCase() === lowerKey ||
                node.name.toLowerCase() === lowerKey) {
                return node;
            }
        }

        return null;
    }

    /**
     * Retrieves a project by Project ID, Tenant ID, or exact Name match.
     * (Backward compatible interface).
     * @param {string} identifier Project ID, Tenant ID, or Name.
     * @returns {Object|null} Project metadata object or null if not found.
     */
    getProject(identifier) {
        if (!identifier || typeof identifier !== 'string') return null;
        const key = identifier.trim();

        if (this.projects.has(key)) {
            return this.projects.get(key);
        }

        const lowerKey = key.toLowerCase();
        for (const proj of this.projects.values()) {
            if (proj.projectId.toLowerCase() === lowerKey ||
                proj.tenantId.toLowerCase() === lowerKey ||
                proj.name.toLowerCase() === lowerKey) {
                return proj;
            }
        }

        return null;
    }

    /**
     * Builds and retrieves the complete ancestors and descendants lineage for a node.
     * @param {string} identifier Target node ID.
     * @returns {Object|null} Hierarchy lineage object or null.
     */
    getResourceHierarchy(identifier) {
        const targetNode = this.getResourceNode(identifier);
        if (!targetNode) return null;

        // Ancestors up to Tier 1 Tenant
        const ancestors = [];
        let currentParentId = targetNode.parentId;
        while (currentParentId) {
            const parent = this.hierarchyNodes.get(currentParentId);
            if (!parent) break;
            ancestors.unshift(parent);
            currentParentId = parent.parentId;
        }

        // Descendants below target node
        const descendants = [];
        const queue = [targetNode.id];
        while (queue.length > 0) {
            const currentId = queue.shift();
            for (const n of this.hierarchyNodes.values()) {
                if (n.parentId === currentId && n.id !== targetNode.id) {
                    descendants.push(n);
                    queue.push(n.id);
                }
            }
        }

        const canonicalPath = this.buildUniversalHierarchyPath(targetNode.id);

        return {
            targetNode,
            ancestors,
            descendants,
            lineagePath: canonicalPath
        };
    }

    /**
     * Constructs canonical slash-separated 10-tier path for a given node.
     * e.g. "Tenant:air-roofers/Organization:air-roofers-inc/.../Project:proj_air_roofers_01"
     * @param {string} identifier Node ID.
     * @returns {string} Canonical hierarchy path string.
     */
    buildUniversalHierarchyPath(identifier) {
        const targetNode = this.getResourceNode(identifier);
        if (!targetNode) return '';

        const pathSegments = [];
        let currentNode = targetNode;

        while (currentNode) {
            pathSegments.unshift(`${currentNode.tier}:${currentNode.id}`);
            currentNode = currentNode.parentId ? this.hierarchyNodes.get(currentNode.parentId) : null;
        }

        return '/' + pathSegments.join('/');
    }

    /**
     * Validates if a node's lineage strictly obeys 10-tier hierarchy ordering without tier skipping.
     * @param {string} identifier Node ID.
     * @returns {Object} Validation result { valid: boolean, errors: Array<string> }.
     */
    validateHierarchyLineage(identifier) {
        const hierarchy = this.getResourceHierarchy(identifier);
        if (!hierarchy) {
            return { valid: false, errors: [`Node '${identifier}' not found in registry`] };
        }

        const errors = [];
        const fullChain = [...hierarchy.ancestors, hierarchy.targetNode];

        for (let i = 1; i < fullChain.length; i++) {
            const parentNode = fullChain[i - 1];
            const childNode = fullChain[i];

            if (childNode.tierLevel <= parentNode.tierLevel) {
                errors.push(`Tier order violation: Node '${childNode.id}' (${childNode.tier}: Level ${childNode.tierLevel}) cannot be child of '${parentNode.id}' (${parentNode.tier}: Level ${parentNode.tierLevel})`);
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            chain: fullChain.map(n => ({ id: n.id, tier: n.tier, level: n.tierLevel }))
        };
    }

    /**
     * Lists resource nodes with optional multi-attribute filtering.
     * @param {Object} [filter={}] Filter parameters.
     * @returns {Array<Object>} Filtered resource nodes.
     */
    listResourceNodes(filter = {}) {
        let list = Array.from(this.hierarchyNodes.values());

        if (filter.tier) {
            const t = this.normalizeTier(filter.tier);
            list = list.filter(n => n.tier === t);
        }

        if (filter.parentId !== undefined) {
            list = list.filter(n => n.parentId === filter.parentId);
        }

        if (filter.tenantId) {
            const tenant = filter.tenantId.trim().toLowerCase();
            list = list.filter(n => n.tenantId.toLowerCase() === tenant);
        }

        if (filter.organization) {
            const org = filter.organization.trim().toLowerCase();
            list = list.filter(n => n.organization.toLowerCase() === org);
        }

        if (filter.environment) {
            const env = this.normalizeEnvironment(filter.environment);
            list = list.filter(n => n.environment === env);
        }

        if (filter.riskProfile) {
            const risk = filter.riskProfile.toUpperCase();
            list = list.filter(n => n.riskProfile === risk);
        }

        if (typeof filter.active === 'boolean') {
            list = list.filter(n => n.active === filter.active);
        }

        if (filter.tag) {
            const tag = filter.tag.trim().toLowerCase();
            list = list.filter(n => n.tags.some(t => t.toLowerCase() === tag));
        }

        return list;
    }

    /**
     * Lists all registered projects with optional filtering.
     * (Backward compatible interface).
     * @param {Object} [filter={}] Filter parameters.
     * @returns {Array<Object>} List of matching project metadata records.
     */
    listProjects(filter = {}) {
        let list = Array.from(this.projects.values());

        if (filter.tenantId) {
            const t = filter.tenantId.trim().toLowerCase();
            list = list.filter(p => p.tenantId.toLowerCase() === t);
        }

        if (filter.organization) {
            const org = filter.organization.trim().toLowerCase();
            list = list.filter(p => p.organization.toLowerCase() === org);
        }

        if (filter.environment) {
            const env = this.normalizeEnvironment(filter.environment);
            list = list.filter(p => p.environment === env);
        }

        if (filter.riskProfile) {
            const risk = filter.riskProfile.toUpperCase();
            list = list.filter(p => p.riskProfile === risk);
        }

        if (typeof filter.active === 'boolean') {
            list = list.filter(p => p.active === filter.active);
        }

        if (filter.tag) {
            const tag = filter.tag.trim().toLowerCase();
            list = list.filter(p => p.tags.some(t => t.toLowerCase() === tag));
        }

        return list;
    }

    /**
     * Updates fields on an existing project or resource node.
     * @param {string} projectId Target Project or Node ID.
     * @param {Object} updates Partial metadata updates.
     * @returns {Object} Updated record.
     */
    updateProject(projectId, updates) {
        const existingNode = this.getResourceNode(projectId);
        if (!existingNode) {
            throw new Error(`Project or resource node with ID '${projectId}' not found in registry`);
        }

        const merged = {
            ...existingNode,
            ...updates,
            id: existingNode.id,
            createdDate: existingNode.createdDate
        };

        const updatedNode = this.registerResourceNode(merged, true);
        return this.getProject(updatedNode.id) || updatedNode;
    }

    /**
     * Deactivates or unregisters a project/resource node.
     * @param {string} projectId Target ID.
     * @param {boolean} [hardDelete=false] True to remove completely, false to deactivate.
     * @returns {boolean} True if operation succeeded.
     */
    unregisterProject(projectId, hardDelete = false) {
        const existingNode = this.getResourceNode(projectId);
        if (!existingNode) return false;

        if (hardDelete) {
            this.hierarchyNodes.delete(existingNode.id);
            this.projects.delete(existingNode.id);
        } else {
            this.registerResourceNode({ ...existingNode, active: false }, false);
        }

        if (this.storagePath) {
            this.saveToStorage();
        }
        return true;
    }

    /**
     * Saves active project and hierarchy registry to JSON storage file.
     * @param {string} [filePath] Override storage file path.
     */
    saveToStorage(filePath = null) {
        const targetPath = filePath ? path.resolve(filePath) : this.storagePath;
        if (!targetPath) {
            throw new Error('No storage path specified for ProjectRegistry');
        }

        const dir = path.dirname(targetPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const data = {
            version: '2.0.0',
            spec: 'PNC-001',
            savedAt: new Date().toISOString(),
            projects: Array.from(this.projects.values()),
            hierarchyNodes: Array.from(this.hierarchyNodes.values())
        };

        fs.writeFileSync(targetPath, JSON.stringify(data, null, 2), 'utf8');
    }

    /**
     * Loads project and hierarchy registry from JSON storage file.
     * @param {string} [filePath] Override storage file path.
     * @returns {number} Count of loaded hierarchy nodes.
     */
    loadFromStorage(filePath = null) {
        const targetPath = filePath ? path.resolve(filePath) : this.storagePath;
        if (!targetPath || !fs.existsSync(targetPath)) {
            throw new Error(`Storage file not found: '${targetPath}'`);
        }

        const content = fs.readFileSync(targetPath, 'utf8');
        const data = JSON.parse(content);

        if (Array.isArray(data.hierarchyNodes)) {
            for (const node of data.hierarchyNodes) {
                this.registerResourceNode(node, false);
            }
        } else if (Array.isArray(data.projects)) {
            for (const proj of data.projects) {
                this.registerProject(proj, false);
            }
        }

        return this.hierarchyNodes.size;
    }

    /**
     * Returns static singleton instance.
     * @param {Object} [options={}] Configuration options.
     * @returns {ProjectRegistry} Default shared registry instance.
     */
    static getInstance(options = {}) {
        if (!ProjectRegistry._instance) {
            ProjectRegistry._instance = new ProjectRegistry(options);
        }
        return ProjectRegistry._instance;
    }
}

ProjectRegistry.HIERARCHY_TIERS = HIERARCHY_TIERS;
ProjectRegistry.TIER_LEVELS = TIER_LEVELS;
ProjectRegistry.TIER_ALIASES = TIER_ALIASES;
ProjectRegistry.ENVIRONMENTS = ENVIRONMENTS;
ProjectRegistry.RISK_PROFILES = RISK_PROFILES;
ProjectRegistry.DEFAULT_PROJECTS = DEFAULT_PROJECTS;
ProjectRegistry._instance = null;

module.exports = {
    ProjectRegistry,
    HIERARCHY_TIERS,
    TIER_LEVELS,
    TIER_ALIASES,
    ENVIRONMENTS,
    RISK_PROFILES,
    DEFAULT_PROJECTS
};
