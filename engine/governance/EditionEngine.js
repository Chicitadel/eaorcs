/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Core Governance & Edition Entitlements Engine
 * File           : EditionEngine.js
 * Version        : 2026.1.0-LTS
 * Author         : Air Roofers Platform Ecosystem & Ujomor Systems Architecture Authority
 * Organization   : Ujomor Systems & Air Roofers
 * Created Date   : 2026-08-02
 * Last Modified  : 2026-08-02
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
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
 * Copyright (c) 2026 Ujomor Systems & Air Roofers
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

/**
 * Custom error class for edition entitlement gating violations.
 */
class EditionGatingError extends Error {
    constructor(message, requiredEdition, currentEdition, feature) {
        super(message);
        this.name = 'EditionGatingError';
        this.requiredEdition = requiredEdition;
        this.currentEdition = currentEdition;
        this.feature = feature;
    }
}

/**
 * Supported EAORCS Editions in hierarchical order.
 */
const EDITIONS = Object.freeze({
    COMMUNITY: 'COMMUNITY',
    PROFESSIONAL: 'PROFESSIONAL',
    ENTERPRISE: 'ENTERPRISE',
    SOVEREIGN: 'SOVEREIGN'
});

/**
 * Numeric tier ranking for edition comparison.
 */
const EDITION_RANKS = Object.freeze({
    [EDITIONS.COMMUNITY]: 1,
    [EDITIONS.PROFESSIONAL]: 2,
    [EDITIONS.ENTERPRISE]: 3,
    [EDITIONS.SOVEREIGN]: 4
});

/**
 * Supported Registry Lifecycle Reset Modes.
 */
const RESET_MODES = Object.freeze({
    SOFT_RESET: 'SOFT_RESET',
    CLEAN_AUDIT: 'CLEAN_AUDIT',
    HARD_RESET: 'HARD_RESET',
    FACTORY_RESET: 'FACTORY_RESET'
});

/**
 * Entitlement Matrix mapping features to minimum required edition tier.
 */
const FEATURE_MIN_EDITIONS = Object.freeze({
    // Restart / Reset actions & Control buttons
    'clean_audit': EDITIONS.COMMUNITY,
    'restart': EDITIONS.COMMUNITY,
    'restart_clean_audit': EDITIONS.COMMUNITY,

    'soft_reset': EDITIONS.PROFESSIONAL,
    'soft_reset_registry': EDITIONS.PROFESSIONAL,

    'verify_integrity': EDITIONS.PROFESSIONAL,
    'verify_registry_integrity': EDITIONS.PROFESSIONAL,
    'verify': EDITIONS.PROFESSIONAL,

    // Core Lifecycle & History features
    'archive': EDITIONS.PROFESSIONAL,
    'history': EDITIONS.PROFESSIONAL,
    'history_view': EDITIONS.PROFESSIONAL,

    // UI Buttons & Enterprise Capabilities
    'archive_snapshot': EDITIONS.ENTERPRISE,
    'archive_registry_snapshot': EDITIONS.ENTERPRISE,

    'export_history': EDITIONS.ENTERPRISE,
    'export_registry_history': EDITIONS.ENTERPRISE,

    'rollback': EDITIONS.ENTERPRISE,
    'hard_reset': EDITIONS.ENTERPRISE,

    'multiple_registries': EDITIONS.ENTERPRISE,
    'multi_project_registry': EDITIONS.ENTERPRISE,
    'digital_signatures': EDITIONS.ENTERPRISE,
    'audit_chain': EDITIONS.ENTERPRISE,

    // Sovereign UI Buttons & High-Assurance Capabilities
    'rollback_registry': EDITIONS.SOVEREIGN,
    'rollback_registry_state': EDITIONS.SOVEREIGN,

    'legal_hold': EDITIONS.SOVEREIGN,
    'legal_hold_lock': EDITIONS.SOVEREIGN,

    'factory_reset': EDITIONS.SOVEREIGN,

    'immutable_registry_vault': EDITIONS.SOVEREIGN,
    'immutable_vault': EDITIONS.SOVEREIGN,
    'blockchain_signature': EDITIONS.SOVEREIGN,
    'evidence_vault': EDITIONS.SOVEREIGN,
    'forensic_restore': EDITIONS.SOVEREIGN
});

/**
 * Minimum required edition per reset mode.
 */
const RESET_MODE_MIN_EDITIONS = Object.freeze({
    [RESET_MODES.CLEAN_AUDIT]: EDITIONS.COMMUNITY,
    [RESET_MODES.SOFT_RESET]: EDITIONS.PROFESSIONAL,
    [RESET_MODES.HARD_RESET]: EDITIONS.ENTERPRISE,
    [RESET_MODES.FACTORY_RESET]: EDITIONS.SOVEREIGN
});

class EditionEngine {
    /**
     * @param {string} [edition='COMMUNITY'] 
     */
    constructor(edition = EDITIONS.COMMUNITY) {
        this.edition = EditionEngine.normalizeEdition(edition);
    }

    /**
     * Get active edition string.
     * @returns {string}
     */
    getEdition() {
        return this.edition;
    }

    /**
     * Update active edition.
     * @param {string} edition 
     * @returns {string}
     */
    setEdition(edition) {
        this.edition = EditionEngine.normalizeEdition(edition);
        return this.edition;
    }

    /**
     * Check if a feature is enabled for the active edition.
     * @param {string} feature 
     * @returns {boolean}
     */
    hasFeature(feature) {
        return EditionEngine.isFeatureAllowed(this.edition, feature);
    }

    /**
     * Alias for hasFeature.
     * @param {string} action 
     * @returns {boolean}
     */
    canPerform(action) {
        return this.hasFeature(action);
    }

    /**
     * Check if reset mode is allowed for the active edition.
     * @param {string} resetMode 
     * @returns {boolean}
     */
    canPerformReset(resetMode) {
        return EditionEngine.isResetModeAllowed(this.edition, resetMode);
    }

    /**
     * Assert entitlement for feature; throws EditionGatingError if disallowed.
     * @param {string} feature 
     * @returns {boolean}
     */
    assertFeature(feature) {
        return EditionEngine.assertEntitlement(this.edition, feature);
    }

    /**
     * Assert reset mode entitlement; throws EditionGatingError if disallowed.
     * @param {string} resetMode 
     * @returns {boolean}
     */
    assertResetMode(resetMode) {
        return EditionEngine.assertResetModeEntitlement(this.edition, resetMode);
    }

    /**
     * Get list of all feature entitlements for the active edition.
     * @returns {string[]}
     */
    getEntitlements() {
        return EditionEngine.getEntitlements(this.edition);
    }

    /**
     * Normalize edition string or throw if invalid.
     * @param {string} edition 
     * @returns {string}
     */
    static normalizeEdition(edition) {
        if (!edition || typeof edition !== 'string') {
            return EDITIONS.COMMUNITY;
        }
        const upper = edition.toUpperCase().trim();
        if (EDITIONS[upper]) {
            return EDITIONS[upper];
        }
        throw new Error(`Invalid EAORCS Edition specified: '${edition}'. Must be one of: ${Object.keys(EDITIONS).join(', ')}`);
    }

    /**
     * Standardize feature key string.
     * @param {string} feature 
     * @returns {string}
     */
    static normalizeFeatureKey(feature) {
        if (!feature || typeof feature !== 'string') return '';
        return feature.toLowerCase().trim().replace(/[\s-]+/g, '_');
    }

    /**
     * Standardize reset mode string.
     * @param {string} mode 
     * @returns {string}
     */
    static normalizeResetMode(mode) {
        if (!mode || typeof mode !== 'string') return '';
        const upper = mode.toUpperCase().trim().replace(/[\s-]+/g, '_');
        if (RESET_MODES[upper]) {
            return RESET_MODES[upper];
        }
        return upper;
    }

    /**
     * Check if target edition meets or exceeds required edition tier.
     * @param {string} currentEdition 
     * @param {string} requiredEdition 
     * @returns {boolean}
     */
    static satisfiesEdition(currentEdition, requiredEdition) {
        const currNorm = EditionEngine.normalizeEdition(currentEdition);
        const reqNorm = EditionEngine.normalizeEdition(requiredEdition);
        const currRank = EDITION_RANKS[currNorm] || 1;
        const reqRank = EDITION_RANKS[reqNorm] || 1;
        return currRank >= reqRank;
    }

    /**
     * Check if a feature is allowed in specified edition.
     * @param {string} edition 
     * @param {string} feature 
     * @returns {boolean}
     */
    static isFeatureAllowed(edition, feature) {
        const normEd = EditionEngine.normalizeEdition(edition);
        const normFeat = EditionEngine.normalizeFeatureKey(feature);
        const reqEd = FEATURE_MIN_EDITIONS[normFeat];

        if (!reqEd) {
            return false;
        }

        return EditionEngine.satisfiesEdition(normEd, reqEd);
    }

    /**
     * Check if reset mode is allowed in specified edition.
     * @param {string} edition 
     * @param {string} resetMode 
     * @returns {boolean}
     */
    static isResetModeAllowed(edition, resetMode) {
        const normEd = EditionEngine.normalizeEdition(edition);
        const normMode = EditionEngine.normalizeResetMode(resetMode);
        const reqEd = RESET_MODE_MIN_EDITIONS[normMode];

        if (!reqEd) {
            return false;
        }

        return EditionEngine.satisfiesEdition(normEd, reqEd);
    }

    /**
     * Assert feature entitlement for specified edition.
     * @param {string} edition 
     * @param {string} feature 
     * @returns {boolean}
     */
    static assertEntitlement(edition, feature) {
        const normEd = EditionEngine.normalizeEdition(edition);
        const normFeat = EditionEngine.normalizeFeatureKey(feature);
        const reqEd = FEATURE_MIN_EDITIONS[normFeat];

        if (!reqEd) {
            throw new EditionGatingError(
                `Unrecognized feature capability '${feature}'.`,
                EDITIONS.SOVEREIGN,
                normEd,
                feature
            );
        }

        if (!EditionEngine.satisfiesEdition(normEd, reqEd)) {
            throw new EditionGatingError(
                `Feature '${feature}' requires EAORCS ${reqEd} edition or higher (Current: ${normEd}).`,
                reqEd,
                normEd,
                feature
            );
        }

        return true;
    }

    /**
     * Assert reset mode entitlement for specified edition.
     * @param {string} edition 
     * @param {string} resetMode 
     * @returns {boolean}
     */
    static assertResetModeEntitlement(edition, resetMode) {
        const normEd = EditionEngine.normalizeEdition(edition);
        const normMode = EditionEngine.normalizeResetMode(resetMode);
        const reqEd = RESET_MODE_MIN_EDITIONS[normMode];

        if (!reqEd) {
            throw new EditionGatingError(
                `Unrecognized reset mode '${resetMode}'.`,
                EDITIONS.SOVEREIGN,
                normEd,
                resetMode
            );
        }

        if (!EditionEngine.satisfiesEdition(normEd, reqEd)) {
            throw new EditionGatingError(
                `Reset mode '${normMode}' requires EAORCS ${reqEd} edition or higher (Current: ${normEd}).`,
                reqEd,
                normEd,
                resetMode
            );
        }

        return true;
    }

    /**
     * Get array of all feature entitlements granted for an edition.
     * @param {string} edition 
     * @returns {string[]}
     */
    static getEntitlements(edition) {
        const normEd = EditionEngine.normalizeEdition(edition);
        const entitlements = [];

        for (const [feat, reqEd] of Object.entries(FEATURE_MIN_EDITIONS)) {
            if (EditionEngine.satisfiesEdition(normEd, reqEd)) {
                entitlements.push(feat);
            }
        }

        return entitlements;
    }

    static get EDITIONS() { return EDITIONS; }
    static get RESET_MODES() { return RESET_MODES; }
    static get FEATURE_MIN_EDITIONS() { return FEATURE_MIN_EDITIONS; }
}

module.exports = {
    EditionEngine,
    EditionGatingError,
    EDITIONS,
    RESET_MODES,
    FEATURE_MIN_EDITIONS
};

module.exports.EditionEngine = EditionEngine;
module.exports.EditionGatingError = EditionGatingError;
module.exports.EDITIONS = EDITIONS;
module.exports.RESET_MODES = RESET_MODES;
module.exports.FEATURE_MIN_EDITIONS = FEATURE_MIN_EDITIONS;
