/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Marketplace Publishing Engine
 * File           : MarketplacePublishingEngine.js
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
 * CORP: S12 Marketplace Publishing & Distribution
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

class MarketplacePublishingEngine {
    constructor(options = {}) {
        this.options = options;

        // Initialize keypair for signing marketplace bundles
        if (options.privateKey && options.publicKey) {
            this.privateKey = options.privateKey;
            this.publicKey = options.publicKey;
        } else {
            const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');
            this.privateKey = privateKey.export({ type: 'pkcs8', format: 'pem' });
            this.publicKey = publicKey.export({ type: 'spki', format: 'pem' });
        }
    }

    /**
     * Validates raw plugin manifest structure against UAIGOS marketplace requirements.
     * @param {Object} pluginManifest 
     * @returns {Object} Validation result.
     */
    validatePluginManifest(pluginManifest = {}) {
        const errors = [];
        if (!pluginManifest.id && !pluginManifest.pluginId && !pluginManifest.name) {
            errors.push('Plugin manifest must specify an id or name');
        }
        if (!pluginManifest.version) {
            errors.push('Plugin manifest must specify a version string');
        }
        if (!pluginManifest.publisher) {
            errors.push('Plugin manifest must specify a publisher');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Bundles plugin metadata, developer partner verification, and capability grants.
     * @param {Object} pluginManifest - Raw plugin manifest provided by developer partner.
     * @param {Object} options - Publishing options (partnerInfo, capabilityOverrides, etc.).
     * @returns {Object} Complete marketplace bundle ready for distribution.
     */
    generateMarketplaceBundle(pluginManifest = {}, options = {}) {
        // Validate input manifest
        const validation = this.validatePluginManifest(pluginManifest);
        if (!validation.valid) {
            throw new Error(`Invalid plugin manifest: ${validation.errors.join('; ')}`);
        }

        const pluginId = pluginManifest.id || pluginManifest.pluginId || pluginManifest.name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
        const bundleId = `mp-bundle-${pluginId}-${crypto.randomUUID().slice(0, 8)}`;
        const publishedAt = new Date().toISOString();

        // 1. Normalized Plugin Metadata
        const metadata = {
            id: pluginId,
            name: pluginManifest.name || pluginId,
            version: pluginManifest.version || '1.0.0',
            publisher: pluginManifest.publisher || 'Independent Developer',
            publisherId: pluginManifest.publisherId || `partner-${crypto.randomUUID().slice(0, 8)}`,
            category: pluginManifest.category || 'Governance Extensions',
            description: pluginManifest.description || 'UAIGOS Marketplace Governance Extension',
            entryPoint: pluginManifest.entryPoint || './index.js',
            engineCompatibility: pluginManifest.engineCompatibility || '^2026.3.0',
            license: pluginManifest.license || 'Commercial-Marketplace',
            repository: pluginManifest.repository || '',
            tags: Array.isArray(pluginManifest.tags) ? pluginManifest.tags : ['eaorcs', 'marketplace', 'governance']
        };

        // 2. Developer Partner Verification
        const partnerInfo = options.partnerInfo || pluginManifest.partnerInfo || {};
        const partnerTier = partnerInfo.tier || 'Certified'; // Certified, Premier, Community
        const verifiedStatus = partnerInfo.verified !== false;
        
        const partnerVerificationPayload = {
            publisherId: metadata.publisherId,
            publisherName: metadata.publisher,
            tier: partnerTier,
            verified: verifiedStatus,
            verificationAuthority: 'Ujomor Marketplace Certification Authority',
            complianceCertifications: partnerInfo.complianceCertifications || ['ISO 27001', 'SOC 2 Type II', 'OWASP ASVS Level 2'],
            verifiedAt: partnerInfo.verifiedAt || publishedAt,
            partnerDigest: crypto.createHash('sha256').update(`${metadata.publisherId}:${metadata.publisher}:${partnerTier}`).digest('hex')
        };

        // Sign partner verification payload
        const partnerSig = crypto.sign(null, Buffer.from(JSON.stringify(partnerVerificationPayload)), this.privateKey);
        partnerVerificationPayload.signature = partnerSig.toString('base64');

        // 3. Capability Grants
        const requestedCapabilities = pluginManifest.capabilitiesRequired || options.capabilitiesRequired || [
            'read:telemetry',
            'write:audit_log',
            'execute:policy_rules'
        ];
        
        const isolationLevel = options.isolationLevel || pluginManifest.isolationLevel || 'Strict'; // Strict, Constrained, Full

        const capabilityGrantsPayload = {
            grantId: `grant-${crypto.randomUUID().slice(0, 8)}`,
            targetPluginId: metadata.id,
            targetVersion: metadata.version,
            grantedCapabilities: requestedCapabilities,
            isolationLevel,
            policyEnforced: true,
            sandboxProfile: {
                allowNetworkAccess: requestedCapabilities.includes('network:outbound'),
                allowFileSystemAccess: requestedCapabilities.includes('fs:read') || requestedCapabilities.includes('fs:write'),
                maxMemoryMb: options.maxMemoryMb || 512,
                maxCpuUsagePercent: 50
            },
            grantedAt: publishedAt,
            grantToken: crypto.createHash('sha256').update(`${metadata.id}:${requestedCapabilities.join(',')}:${publishedAt}`).digest('hex')
        };

        // Sign capability grants payload
        const capabilitySig = crypto.sign(null, Buffer.from(JSON.stringify(capabilityGrantsPayload)), this.privateKey);
        capabilityGrantsPayload.signature = capabilitySig.toString('base64');

        // 4. Bundle Payload & SHA256 Checksum
        const bundleContent = {
            bundleId,
            publishedAt,
            manifest: metadata,
            partnerVerification: partnerVerificationPayload,
            capabilityGrants: capabilityGrantsPayload
        };

        const contentBuffer = Buffer.from(JSON.stringify(bundleContent), 'utf8');
        const checksum = `sha256-${crypto.createHash('sha256').update(contentBuffer).digest('hex')}`;

        // 5. Cryptographic Bundle Signature
        const bundleSigBuffer = crypto.sign(null, contentBuffer, this.privateKey);
        const bundleSignature = bundleSigBuffer.toString('base64');

        return {
            bundleId,
            publishedAt,
            manifest: metadata,
            partnerVerification: partnerVerificationPayload,
            capabilityGrants: capabilityGrantsPayload,
            checksum,
            bundleSignature,
            publicKey: this.publicKey,
            status: 'READY_FOR_PUBLISHING'
        };
    }

    /**
     * Verifies the authenticity, checksum integrity, and partner status of a marketplace bundle.
     * @param {Object} bundle - Marketplace bundle generated by generateMarketplaceBundle.
     * @param {string} pubKey - Optional Ed25519 Public Key PEM.
     * @returns {Object} Bundle verification result.
     */
    verifyBundle(bundle, pubKey = null) {
        const keyToUse = pubKey || bundle.publicKey || this.publicKey;

        if (!bundle || !bundle.manifest || !bundle.bundleSignature || !bundle.checksum) {
            return { valid: false, reason: 'Invalid bundle structure', verified: false };
        }

        const bundleContent = {
            bundleId: bundle.bundleId,
            publishedAt: bundle.publishedAt,
            manifest: bundle.manifest,
            partnerVerification: bundle.partnerVerification,
            capabilityGrants: bundle.capabilityGrants
        };

        const contentBuffer = Buffer.from(JSON.stringify(bundleContent), 'utf8');
        
        // Check SHA256 checksum
        const computedChecksum = `sha256-${crypto.createHash('sha256').update(contentBuffer).digest('hex')}`;
        if (computedChecksum !== bundle.checksum) {
            return {
                valid: false,
                reason: 'Bundle checksum mismatch - content corrupted or tampered',
                checksumVerified: false
            };
        }

        // Check Ed25519 signature
        let signatureValid = false;
        try {
            const sigBuf = Buffer.from(bundle.bundleSignature, 'base64');
            signatureValid = crypto.verify(null, contentBuffer, keyToUse, sigBuf);
        } catch (e) {
            signatureValid = false;
        }

        if (!signatureValid) {
            return {
                valid: false,
                reason: 'Marketplace bundle cryptographic signature verification failed',
                signatureVerified: false
            };
        }

        // Check partner verification
        const partnerVerified = bundle.partnerVerification && bundle.partnerVerification.verified === true;

        return {
            valid: true,
            reason: null,
            checksumVerified: true,
            signatureVerified: true,
            partnerVerified,
            bundleId: bundle.bundleId,
            pluginId: bundle.manifest.id,
            version: bundle.manifest.version,
            publisher: bundle.manifest.publisher,
            partnerTier: bundle.partnerVerification ? bundle.partnerVerification.tier : 'Unknown',
            capabilitiesCount: bundle.capabilityGrants ? bundle.capabilityGrants.grantedCapabilities.length : 0
        };
    }
}

module.exports = MarketplacePublishingEngine;
