/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Adaptive Dashboard Navigation Engine
 * File           : AdaptiveDashboardNavigationEngine.js
 * Version        : 2026.3.0-RC1
 * Author         : Platform UX & Portal Architecture Authority
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Architecture Authority Approved — ENHANCEMENT (Foundation-Locked)
 * - UAIGOS 3.0.0 Compliant — Persona-Aware Navigation
 *
 * Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const crypto = require('crypto');

/**
 * Navigation Groups — ordered for visual hierarchy
 */
const NAV_GROUPS = Object.freeze({
  TRUST_INTELLIGENCE:   { id: 'TRUST_INTELLIGENCE',   label: 'Trust Intelligence',   icon: 'shield-check', order: 1 },
  GOVERNANCE_STUDIO:    { id: 'GOVERNANCE_STUDIO',     label: 'Governance Studio',    icon: 'scale',        order: 2 },
  COMPLIANCE:           { id: 'COMPLIANCE',            label: 'Compliance',           icon: 'clipboard',    order: 3 },
  KNOWLEDGE_GRAPH:      { id: 'KNOWLEDGE_GRAPH',       label: 'Knowledge Graph',      icon: 'graph',        order: 4 },
  MARKETPLACE:          { id: 'MARKETPLACE',           label: 'Marketplace',          icon: 'store',        order: 5 },
  ANALYTICS:            { id: 'ANALYTICS',             label: 'Analytics',            icon: 'chart-bar',    order: 6 },
  OPERATIONS:           { id: 'OPERATIONS',            label: 'Operations',           icon: 'server',       order: 7 },
  SETTINGS:             { id: 'SETTINGS',              label: 'Settings',             icon: 'cog',          order: 8 },
});

/**
 * Master Panel Registry
 * Each panel has: group, label, route, minimumEdition, personas[], keywords[]
 */
const PANEL_REGISTRY = Object.freeze([
  // ── Trust Intelligence ───────────────────────────────────────────
  { id: 'trust.dashboard',          group: 'TRUST_INTELLIGENCE', label: 'Trust Dashboard',          route: '/trust/dashboard',           minimumEdition: 'COMMUNITY',    personas: ['CEO','CTO','CIO','CISO','BOARD','ALL'], keywords: ['score','trust','overview','dashboard'] },
  { id: 'trust.score.decomposed',   group: 'TRUST_INTELLIGENCE', label: 'Score Decomposition',      route: '/trust/score/decomposed',    minimumEdition: 'COMMUNITY',    personas: ['ARCHITECT','DEVELOPER','SECURITY','ALL'], keywords: ['decompose','breakdown','score','tree'] },
  { id: 'trust.predictive',         group: 'TRUST_INTELLIGENCE', label: 'Predictive Intelligence',  route: '/trust/predictive',          minimumEdition: 'PROFESSIONAL', personas: ['CTO','ARCHITECT','CISO'], keywords: ['predict','forecast','ai','risk','future'] },
  { id: 'trust.benchmark',          group: 'TRUST_INTELLIGENCE', label: 'Benchmark Network',        route: '/trust/benchmark',           minimumEdition: 'PROFESSIONAL', personas: ['CEO','CIO','BOARD'], keywords: ['benchmark','compare','industry','peers','ranking'] },
  { id: 'trust.cyber.weather',      group: 'TRUST_INTELLIGENCE', label: 'Cyber Weather',            route: '/trust/cyber-weather',       minimumEdition: 'ENTERPRISE',   personas: ['CISO','SECURITY'], keywords: ['threat','cyber','weather','risk','storm'] },

  // ── Governance Studio ────────────────────────────────────────────
  { id: 'governance.policy',        group: 'GOVERNANCE_STUDIO',  label: 'Policy Engine',            route: '/governance/policy',         minimumEdition: 'ENTERPRISE',   personas: ['COMPLIANCE','ARCHITECT','AUDITOR'], keywords: ['policy','rule','govern','enforcement'] },
  { id: 'governance.collaboration', group: 'GOVERNANCE_STUDIO',  label: 'Collaboration & Sign-Off', route: '/governance/collaboration',  minimumEdition: 'ENTERPRISE',   personas: ['ARCHITECT','COMPLIANCE','AUDITOR'], keywords: ['sign','approve','review','collaboration','workflow'] },
  { id: 'governance.digital.twin',  group: 'GOVERNANCE_STUDIO',  label: 'Digital Twin',             route: '/governance/digital-twin',  minimumEdition: 'PROFESSIONAL', personas: ['ARCHITECT','CTO'], keywords: ['twin','simulate','change','impact','architecture'] },
  { id: 'governance.provenance',    group: 'GOVERNANCE_STUDIO',  label: 'Provenance Chain',         route: '/governance/provenance',     minimumEdition: 'ENTERPRISE',   personas: ['AUDITOR','CISO','COMPLIANCE'], keywords: ['provenance','chain','custody','signature','evidence'] },
  { id: 'governance.workflow',      group: 'GOVERNANCE_STUDIO',  label: 'Workflow Engine',          route: '/governance/workflow',       minimumEdition: 'ENTERPRISE',   personas: ['COMPLIANCE','ARCHITECT'], keywords: ['workflow','automation','approval','task'] },

  // ── Compliance ───────────────────────────────────────────────────
  { id: 'compliance.dashboard',     group: 'COMPLIANCE',         label: 'Compliance Overview',      route: '/compliance/dashboard',      minimumEdition: 'COMMUNITY',    personas: ['COMPLIANCE','AUDITOR','CEO','BOARD'], keywords: ['compliance','regulation','iso','soc2','nist'] },
  { id: 'compliance.packs',         group: 'COMPLIANCE',         label: 'Installed Packs',          route: '/compliance/packs',          minimumEdition: 'PROFESSIONAL', personas: ['COMPLIANCE','ARCHITECT'], keywords: ['pack','installed','governance','framework'] },
  { id: 'compliance.audit.report',  group: 'COMPLIANCE',         label: 'Audit Reports',            route: '/compliance/audit-reports',  minimumEdition: 'COMMUNITY',    personas: ['AUDITOR','COMPLIANCE','CEO'], keywords: ['audit','report','evidence','certificate'] },
  { id: 'compliance.gdpr',          group: 'COMPLIANCE',         label: 'Privacy & GDPR',           route: '/compliance/gdpr',           minimumEdition: 'ENTERPRISE',   personas: ['COMPLIANCE','CISO'], keywords: ['gdpr','privacy','data','protection'] },

  // ── Knowledge Graph ──────────────────────────────────────────────
  { id: 'knowledge.graph',          group: 'KNOWLEDGE_GRAPH',    label: 'Knowledge Graph Explorer', route: '/knowledge/graph',           minimumEdition: 'PROFESSIONAL', personas: ['ARCHITECT','DEVELOPER','CTO'], keywords: ['graph','knowledge','explore','entity','relationship'] },
  { id: 'knowledge.sbom',           group: 'KNOWLEDGE_GRAPH',    label: 'SBOM Explorer',            route: '/knowledge/sbom',            minimumEdition: 'COMMUNITY',    personas: ['DEVELOPER','SECURITY','CISO'], keywords: ['sbom','dependency','supply chain','component'] },
  { id: 'knowledge.api',            group: 'KNOWLEDGE_GRAPH',    label: 'API Surface Explorer',     route: '/knowledge/api',             minimumEdition: 'PROFESSIONAL', personas: ['ARCHITECT','DEVELOPER'], keywords: ['api','surface','endpoint','openapi'] },

  // ── Marketplace ──────────────────────────────────────────────────
  { id: 'marketplace.browse',       group: 'MARKETPLACE',        label: 'Browse Marketplace',       route: '/marketplace/browse',        minimumEdition: 'PROFESSIONAL', personas: ['ARCHITECT','COMPLIANCE','ALL'], keywords: ['marketplace','install','pack','connector','plugin'] },
  { id: 'marketplace.installed',    group: 'MARKETPLACE',        label: 'Installed Extensions',     route: '/marketplace/installed',     minimumEdition: 'PROFESSIONAL', personas: ['ARCHITECT','DEVELOPER'], keywords: ['installed','extension','plugin','pack'] },
  { id: 'marketplace.sdk',          group: 'MARKETPLACE',        label: 'SDK & Developer Tools',    route: '/marketplace/sdk',           minimumEdition: 'PROFESSIONAL', personas: ['DEVELOPER'], keywords: ['sdk','developer','build','extend','plugin'] },

  // ── Analytics ────────────────────────────────────────────────────
  { id: 'analytics.telemetry',      group: 'ANALYTICS',          label: 'Platform Telemetry',       route: '/analytics/telemetry',       minimumEdition: 'COMMUNITY',    personas: ['CTO','ARCHITECT','DEVELOPER'], keywords: ['telemetry','metrics','analytics','usage'] },
  { id: 'analytics.roi',            group: 'ANALYTICS',          label: 'ROI & Business Value',     route: '/analytics/roi',             minimumEdition: 'ENTERPRISE',   personas: ['CEO','CFO','BOARD'], keywords: ['roi','value','savings','investment','board'] },
  { id: 'analytics.trend',          group: 'ANALYTICS',          label: 'Trust Trend Analysis',     route: '/analytics/trend',           minimumEdition: 'PROFESSIONAL', personas: ['CTO','ARCHITECT'], keywords: ['trend','history','over time','improvement'] },

  // ── Operations ───────────────────────────────────────────────────
  { id: 'operations.migration',     group: 'OPERATIONS',         label: 'Platform Migration',       route: '/operations/migration',      minimumEdition: 'PROFESSIONAL', personas: ['ARCHITECT','DEVELOPER'], keywords: ['migrate','upgrade','version','migration'] },
  { id: 'operations.registry',      group: 'OPERATIONS',         label: 'Registry Lifecycle',       route: '/operations/registry',       minimumEdition: 'ENTERPRISE',   personas: ['ARCHITECT','DEVELOPER'], keywords: ['registry','lifecycle','snapshot','archive','rollback'] },
  { id: 'operations.health',        group: 'OPERATIONS',         label: 'Platform Health',          route: '/operations/health',         minimumEdition: 'COMMUNITY',    personas: ['DEVELOPER','ARCHITECT'], keywords: ['health','status','uptime','monitoring'] },
  { id: 'operations.interactive',   group: 'OPERATIONS',         label: 'Interactive Operations',   route: '/operations/interactive',    minimumEdition: 'ENTERPRISE',   personas: ['ARCHITECT','DEVELOPER'], keywords: ['reset','archive','export','rollback','async','operation'] },

  // ── Settings ─────────────────────────────────────────────────────
  { id: 'settings.branding',        group: 'SETTINGS',           label: 'Branding & Theme',         route: '/settings/branding',         minimumEdition: 'ENTERPRISE',   personas: ['ADMIN'], keywords: ['branding','logo','theme','white-label','css'] },
  { id: 'settings.users',           group: 'SETTINGS',           label: 'User Management',          route: '/settings/users',            minimumEdition: 'COMMUNITY',    personas: ['ADMIN'], keywords: ['users','roles','access','rbac','team'] },
  { id: 'settings.tenant',          group: 'SETTINGS',           label: 'Tenant Configuration',     route: '/settings/tenant',           minimumEdition: 'ENTERPRISE',   personas: ['ADMIN'], keywords: ['tenant','organization','config','multi-tenant'] },
  { id: 'settings.licensing',       group: 'SETTINGS',           label: 'Licensing & Edition',      route: '/settings/licensing',        minimumEdition: 'COMMUNITY',    personas: ['ADMIN','CEO'], keywords: ['license','edition','subscription','upgrade'] },
  { id: 'settings.api.keys',        group: 'SETTINGS',           label: 'API Keys',                 route: '/settings/api-keys',         minimumEdition: 'PROFESSIONAL', personas: ['DEVELOPER','ADMIN'], keywords: ['api key','access key','token','developer'] },
  { id: 'settings.integrations',    group: 'SETTINGS',           label: 'Integrations',             route: '/settings/integrations',     minimumEdition: 'PROFESSIONAL', personas: ['DEVELOPER','ARCHITECT'], keywords: ['integration','github','gitlab','ci','connector'] },
]);

/**
 * FavoritesStore — per-user panel favorites (in-memory, replace with persistent store in production)
 */
class FavoritesStore {
  constructor() { this._store = new Map(); }
  record(userId, panelId) {
    if (!this._store.has(userId)) this._store.set(userId, new Set());
    this._store.get(userId).add(panelId);
  }
  remove(userId, panelId) { this._store.get(userId)?.delete(panelId); }
  get(userId) { return [...(this._store.get(userId) || [])]; }
}

/**
 * AdaptiveDashboardNavigationEngine
 *
 * Builds persona-aware, edition-gated navigation trees with search and favorites.
 * Never exposes Enterprise or Sovereign panels to lower-edition users.
 */
class AdaptiveDashboardNavigationEngine {
  constructor(options = {}) {
    this.options = options;
    this._favoritesStore = new FavoritesStore();
    this._searchIndex = this._buildSearchIndex();
  }

  /**
   * Builds the complete navigation tree for a given persona and edition.
   * Only panels authorized for the tenant's edition are included.
   *
   * @param {string} persona - User persona key (CEO, CTO, ARCHITECT, etc.)
   * @param {string} edition - Tenant edition (COMMUNITY, PROFESSIONAL, ENTERPRISE, GOVERNMENT)
   * @param {string} [userId] - Optional user ID for favorites injection
   * @returns {object} Hierarchical navigation tree
   */
  buildNavigationTree(persona, edition, userId = null) {
    const editionOrder = ['COMMUNITY', 'PROFESSIONAL', 'ENTERPRISE', 'GOVERNMENT'];
    const editionIndex = editionOrder.indexOf(edition.toUpperCase());
    if (editionIndex === -1) throw new Error(`AdaptiveDashboardNavigationEngine: Unknown edition '${edition}'.`);

    const personaUpper = (persona || 'ALL').toUpperCase();
    const favorites = userId ? this._favoritesStore.get(userId) : [];

    const groupedPanels = {};
    for (const panel of PANEL_REGISTRY) {
      const panelEditionIndex = editionOrder.indexOf(panel.minimumEdition);
      // Edition gate
      if (panelEditionIndex > editionIndex) continue;
      // Persona gate (ALL means visible to everyone)
      if (!panel.personas.includes('ALL') && !panel.personas.includes(personaUpper)) continue;

      if (!groupedPanels[panel.group]) {
        groupedPanels[panel.group] = { ...NAV_GROUPS[panel.group], panels: [] };
      }
      groupedPanels[panel.group].panels.push({
        id: panel.id,
        label: panel.label,
        route: panel.route,
        isFavorite: favorites.includes(panel.id),
      });
    }

    // Sort groups by order
    const groups = Object.values(groupedPanels).sort((a, b) => a.order - b.order);

    // Inject Favorites at the top if any
    const favoritePanels = PANEL_REGISTRY
      .filter(p => favorites.includes(p.id))
      .map(p => ({ id: p.id, label: p.label, route: p.route, isFavorite: true }));

    const navigationTree = {
      persona: personaUpper,
      edition,
      userId: userId || null,
      totalPanels: groups.reduce((sum, g) => sum + g.panels.length, 0),
      favorites: favoritePanels,
      groups,
      generatedAt: new Date().toISOString(),
    };

    return navigationTree;
  }

  /**
   * Full-text navigation search with fuzzy keyword matching.
   * @param {string} query - Search query
   * @param {string} edition - Tenant edition (for gating)
   * @param {string} persona - User persona (for gating)
   * @returns {object[]} Ranked search results
   */
  searchNavigation(query, edition = 'COMMUNITY', persona = 'ALL') {
    if (!query || query.trim().length < 2) return [];
    const q = query.toLowerCase().trim();
    const editionOrder = ['COMMUNITY', 'PROFESSIONAL', 'ENTERPRISE', 'GOVERNMENT'];
    const editionIndex = editionOrder.indexOf(edition.toUpperCase());
    const personaUpper = persona.toUpperCase();

    const results = [];
    for (const panel of PANEL_REGISTRY) {
      if (editionOrder.indexOf(panel.minimumEdition) > editionIndex) continue;
      if (!panel.personas.includes('ALL') && !panel.personas.includes(personaUpper)) continue;

      const labelMatch = panel.label.toLowerCase().includes(q);
      const keywordMatch = panel.keywords.some(k => k.includes(q));
      const idMatch = panel.id.toLowerCase().includes(q);

      if (labelMatch || keywordMatch || idMatch) {
        const relevance = (labelMatch ? 3 : 0) + (keywordMatch ? 2 : 0) + (idMatch ? 1 : 0);
        results.push({ id: panel.id, label: panel.label, route: panel.route, group: NAV_GROUPS[panel.group].label, relevance });
      }
    }

    return results.sort((a, b) => b.relevance - a.relevance).slice(0, 10);
  }

  recordFavorite(userId, panelId) {
    if (!PANEL_REGISTRY.find(p => p.id === panelId)) throw new Error(`Panel '${panelId}' not found.`);
    this._favoritesStore.record(userId, panelId);
    return { userId, panelId, added: true };
  }

  removeFavorite(userId, panelId) {
    this._favoritesStore.remove(userId, panelId);
    return { userId, panelId, removed: true };
  }

  getFavorites(userId) { return this._favoritesStore.get(userId); }

  getGroupedNavigation(persona) {
    return this.buildNavigationTree(persona, 'GOVERNMENT'); // Widest edition shows all groups
  }

  getEngineStatus() {
    return {
      initialized: true,
      totalPanels: PANEL_REGISTRY.length,
      totalGroups: Object.keys(NAV_GROUPS).length,
      searchIndexSize: this._searchIndex.size,
    };
  }

  _buildSearchIndex() {
    const index = new Map();
    for (const panel of PANEL_REGISTRY) {
      for (const keyword of panel.keywords) {
        const tokens = keyword.split(' ');
        for (const token of tokens) {
          if (!index.has(token)) index.set(token, []);
          index.get(token).push(panel.id);
        }
      }
    }
    return index;
  }
}

module.exports = AdaptiveDashboardNavigationEngine;
module.exports.AdaptiveDashboardNavigationEngine = AdaptiveDashboardNavigationEngine;
module.exports.NAV_GROUPS = NAV_GROUPS;
module.exports.PANEL_REGISTRY = PANEL_REGISTRY;
