/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Product Boundary Contract
 * File           : ProductBoundaryContract.js
 * Version        : 2026.1-LTS (v1.0.0-FROZEN)
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Chicitadel / Air Roofers SASU
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Architecture Frozen (ADR-001)
 * - Security Reviewed & Compliance Enforced
 * - Standardized Product Boundary Contract
 ******************************************************************************/

'use strict';

const crypto = require('crypto');

/**
 * Valid Health Statuses
 */
const HEALTH_STATUS = Object.freeze({
    HEALTHY: 'HEALTHY',
    DEGRADED: 'DEGRADED',
    UNHEALTHY: 'UNHEALTHY'
});

/**
 * Valid License Tiers
 */
const LICENSE_TIER = Object.freeze({
    COMMUNITY: 'Community',
    PRO: 'Pro',
    BUSINESS: 'Business',
    ENTERPRISE: 'Enterprise',
    SOVEREIGN: 'Sovereign'
});

/**
 * ProductBoundaryContract
 * Standardizes Manifest, Capabilities, Health, API, Events, Telemetry, Licensing, Identity
 * across EAORCS and all Ujomor Platform products.
 */
class ProductBoundaryContract {
    constructor(config = {}) {
        this.platformVersion = config.platformVersion || '2026.1-LTS';
        this.contractVersion = '1.0.0';
    }

    // =========================================================================
    // 1. MANIFEST CONTRACT
    // =========================================================================

    /**
     * Validates a product manifest against the UAIGOS standard schema.
     * @param {Object} manifest 
     * @returns {Object} { valid: boolean, errors: Array<string> }
     */
    validateManifest(manifest) {
        const errors = [];
        if (!manifest || typeof manifest !== 'object') {
            return { valid: false, errors: ['Manifest must be a non-null object'] };
        }

        const requiredFields = ['name', 'version', 'productCode', 'domain', 'classification'];
        for (const field of requiredFields) {
            if (!manifest[field] || typeof manifest[field] !== 'string') {
                errors.push(`Missing or invalid required field in manifest: [${field}]`);
            }
        }

        if (manifest.capabilities && !Array.isArray(manifest.capabilities)) {
            errors.push('Manifest capabilities must be an array');
        }

        if (manifest.endpoints && !Array.isArray(manifest.endpoints)) {
            errors.push('Manifest endpoints must be an array');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Normalizes a product manifest with platform defaults.
     * @param {Object} manifest 
     * @returns {Object} Normalized manifest
     */
    normalizeManifest(manifest) {
        const validation = this.validateManifest(manifest);
        if (!validation.valid) {
            throw new Error(`Invalid Product Manifest: ${validation.errors.join(', ')}`);
        }

        return {
            name: manifest.name,
            version: manifest.version,
            productCode: manifest.productCode.toUpperCase(),
            domain: manifest.domain,
            classification: manifest.classification,
            capabilities: manifest.capabilities || [],
            endpoints: manifest.endpoints || [],
            dependencies: manifest.dependencies || {},
            telemetryConfig: manifest.telemetryConfig || { enabled: true, sampleRate: 1.0 },
            licenseTier: manifest.licenseTier || LICENSE_TIER.COMMUNITY,
            schemaVersion: this.contractVersion,
            normalizedAt: new Date().toISOString()
        };
    }

    // =========================================================================
    // 2. CAPABILITIES CONTRACT
    // =========================================================================

    /**
     * Validates capability declarations.
     * @param {Array<Object>} capabilities 
     * @returns {Object} { valid: boolean, errors: Array<string> }
     */
    validateCapabilities(capabilities) {
        const errors = [];
        if (!Array.isArray(capabilities)) {
            return { valid: false, errors: ['Capabilities must be an array'] };
        }

        capabilities.forEach((cap, index) => {
            if (!cap.id || typeof cap.id !== 'string') {
                errors.push(`Capability at index ${index} missing valid 'id'`);
            }
            if (cap.status && !['ENABLED', 'DISABLED', 'EXPERIMENTAL'].includes(cap.status)) {
                errors.push(`Capability [${cap.id || index}] has invalid status: ${cap.status}`);
            }
        });

        return { valid: errors.length === 0, errors };
    }

    /**
     * Checks if a manifest supports a capability.
     * @param {Object} manifest 
     * @param {string} capabilityId 
     * @param {string} minVersion 
     * @returns {boolean}
     */
    hasCapability(manifest, capabilityId, minVersion = '1.0.0') {
        if (!manifest || !Array.isArray(manifest.capabilities)) return false;
        const cap = manifest.capabilities.find(c => (typeof c === 'string' ? c === capabilityId : c.id === capabilityId));
        if (!cap) return false;
        if (typeof cap === 'string') return true;
        if (cap.status === 'DISABLED') return false;

        if (cap.version && minVersion) {
            return cap.version.localeCompare(minVersion, undefined, { numeric: true }) >= 0;
        }
        return true;
    }

    // =========================================================================
    // 3. HEALTH CONTRACT
    // =========================================================================

    /**
     * Formats a standardized health report.
     * @param {string} status 
     * @param {Object} details 
     * @returns {Object} Standardized health report
     */
    createHealthReport(status = HEALTH_STATUS.HEALTHY, details = {}) {
        if (!Object.values(HEALTH_STATUS).includes(status)) {
            throw new Error(`Invalid health status: ${status}`);
        }

        return {
            status,
            service: details.service || 'EAORCS-Kernel',
            version: details.version || this.platformVersion,
            timestamp: new Date().toISOString(),
            uptimeSec: details.uptimeSec || process.uptime(),
            subsystems: details.subsystems || {},
            metrics: details.metrics || {},
            contractVersion: this.contractVersion
        };
    }

    /**
     * Validates a health report.
     * @param {Object} report 
     * @returns {Object} { valid: boolean, errors: Array<string> }
     */
    validateHealthReport(report) {
        const errors = [];
        if (!report || typeof report !== 'object') {
            return { valid: false, errors: ['Report must be an object'] };
        }
        if (!Object.values(HEALTH_STATUS).includes(report.status)) {
            errors.push(`Invalid or missing status: ${report.status}`);
        }
        if (!report.timestamp || isNaN(Date.parse(report.timestamp))) {
            errors.push('Missing or invalid timestamp');
        }
        return { valid: errors.length === 0, errors };
    }

    // =========================================================================
    // 4. API CONTRACT
    // =========================================================================

    /**
     * Validates API endpoint definitions.
     * @param {Array<Object>} apiSpecs 
     * @returns {Object} { valid: boolean, errors: Array<string> }
     */
    validateApiContract(apiSpecs) {
        const errors = [];
        if (!Array.isArray(apiSpecs)) {
            return { valid: false, errors: ['API spec must be an array of endpoint descriptors'] };
        }

        apiSpecs.forEach((spec, index) => {
            if (!spec.path || typeof spec.path !== 'string') {
                errors.push(`API spec at index ${index} missing valid 'path'`);
            }
            if (!spec.method || typeof spec.method !== 'string') {
                errors.push(`API spec at index ${index} missing valid 'method'`);
            }
        });

        return { valid: errors.length === 0, errors };
    }

    /**
     * Matches an HTTP route against registered API specs.
     * @param {Array<Object>} apiSpecs 
     * @param {string} method 
     * @param {string} path 
     * @returns {Object|null}
     */
    matchRoute(apiSpecs, method, path) {
        if (!Array.isArray(apiSpecs)) return null;
        const normMethod = method.toUpperCase();
        return apiSpecs.find(spec => {
            const specMethod = spec.method.toUpperCase();
            if (specMethod !== normMethod && specMethod !== '*') return false;
            
            // Match pattern or exact path
            if (spec.path === path) return true;
            if (spec.path.endsWith('*')) {
                const prefix = spec.path.slice(0, -1);
                return path.startsWith(prefix);
            }
            return false;
        }) || null;
    }

    // =========================================================================
    // 5. EVENTS CONTRACT
    // =========================================================================

    /**
     * Formats a platform standard event envelope.
     * @param {string} eventType 
     * @param {Object} payload 
     * @param {Object} meta 
     * @returns {Object} Standard Event Envelope
     */
    formatEvent(eventType, payload = {}, meta = {}) {
        if (!eventType || typeof eventType !== 'string') {
            throw new Error('Event type must be a non-empty string');
        }

        return {
            id: meta.id || `evt_${crypto.randomBytes(8).toString('hex')}`,
            eventType,
            source: meta.source || 'eaorcs.engine',
            timestamp: new Date().toISOString(),
            tenantId: meta.tenantId || 'global',
            correlationId: meta.correlationId || `corr_${crypto.randomBytes(6).toString('hex')}`,
            schemaVersion: this.contractVersion,
            payload
        };
    }

    /**
     * Validates event format.
     * @param {Object} event 
     * @returns {Object} { valid: boolean, errors: Array<string> }
     */
    validateEvent(event) {
        const errors = [];
        if (!event || typeof event !== 'object') {
            return { valid: false, errors: ['Event must be an object'] };
        }
        if (!event.id) errors.push('Missing event id');
        if (!event.eventType) errors.push('Missing eventType');
        if (!event.timestamp) errors.push('Missing timestamp');
        if (!event.payload || typeof event.payload !== 'object') errors.push('Missing or invalid event payload');
        return { valid: errors.length === 0, errors };
    }

    // =========================================================================
    // 6. TELEMETRY CONTRACT
    // =========================================================================

    /**
     * Formats telemetry metric payload.
     * @param {string} metricName 
     * @param {number} value 
     * @param {Object} tags 
     * @returns {Object} Telemetry record
     */
    formatTelemetry(metricName, value, tags = {}) {
        return {
            metric: metricName,
            value: Number(value) || 0,
            type: tags.type || 'COUNTER',
            tags: {
                platform: 'UAIGOS',
                product: tags.product || 'EAORCS',
                tenantId: tags.tenantId || 'global',
                ...tags
            },
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Validates telemetry record.
     * @param {Object} telemetry 
     * @returns {Object} { valid: boolean, errors: Array<string> }
     */
    validateTelemetry(telemetry) {
        const errors = [];
        if (!telemetry || typeof telemetry !== 'object') {
            return { valid: false, errors: ['Telemetry must be an object'] };
        }
        if (!telemetry.metric) errors.push('Missing metric name');
        if (typeof telemetry.value !== 'number') errors.push('Telemetry value must be a number');
        return { valid: errors.length === 0, errors };
    }

    // =========================================================================
    // 7. LICENSING CONTRACT
    // =========================================================================

    /**
     * Validates license structure.
     * @param {Object} license 
     * @returns {Object} { valid: boolean, errors: Array<string> }
     */
    validateLicense(license) {
        const errors = [];
        if (!license || typeof license !== 'object') {
            return { valid: false, errors: ['License must be an object'] };
        }
        if (!license.tier || !Object.values(LICENSE_TIER).includes(license.tier)) {
            errors.push(`Invalid or missing license tier: ${license.tier}`);
        }
        if (!license.tenantId) errors.push('Missing tenantId in license');
        if (license.validUntil && isNaN(Date.parse(license.validUntil))) {
            errors.push('Invalid license expiration date');
        }
        return { valid: errors.length === 0, errors };
    }

    /**
     * Checks if license is active and not expired.
     * @param {Object} license 
     * @returns {boolean}
     */
    isLicenseValid(license) {
        const validation = this.validateLicense(license);
        if (!validation.valid) return false;
        if (license.validUntil && new Date(license.validUntil) < new Date()) {
            return false;
        }
        return true;
    }

    // =========================================================================
    // 8. IDENTITY CONTRACT
    // =========================================================================

    /**
     * Formats normalized identity context.
     * @param {Object} user 
     * @param {Object} tenant 
     * @param {Object} session 
     * @returns {Object} Standardized Identity Context
     */
    formatIdentityContext(user = {}, tenant = {}, session = {}) {
        return {
            userId: user.id || 'usr_anonymous',
            username: user.username || 'anonymous',
            email: user.email || null,
            orgId: tenant.orgId || 'org_default',
            tenantId: tenant.tenantId || 'tenant_default',
            roles: user.roles || ['Viewer'],
            permissions: user.permissions || [],
            authLevel: session.authLevel || 'UNAUTHENTICATED',
            tokenClaims: session.claims || {},
            issuedAt: new Date().toISOString()
        };
    }

    /**
     * Validates identity context.
     * @param {Object} context 
     * @returns {Object} { valid: boolean, errors: Array<string> }
     */
    validateIdentityContext(context) {
        const errors = [];
        if (!context || typeof context !== 'object') {
            return { valid: false, errors: ['Identity context must be an object'] };
        }
        if (!context.userId) errors.push('Missing userId');
        if (!context.tenantId) errors.push('Missing tenantId');
        if (!Array.isArray(context.roles)) errors.push('Roles must be an array');
        return { valid: errors.length === 0, errors };
    }
}

module.exports = {
    ProductBoundaryContract,
    HEALTH_STATUS,
    LICENSE_TIER
};
