/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Commercial Licensing Engine
 * File           : CommercialLicensingEngine.js
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
 * CORP: S7/S13 Commercial Licensing
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

class CommercialLicensingEngine {
    constructor(options = {}) {
        this.options = options;
        this.validTiers = ['Enterprise', 'Government', 'OEM', 'Marketplace', 'SaaS', 'Academic', 'Evaluation'];
        
        // Tier defaults configuration
        this.tierDefaults = {
            Enterprise: { maxSeats: 1000, validDays: 365, featureFlags: ['all', 'ha', 'multi-tenant', 'compliance_export', 'custom_policy'] },
            Government: { maxSeats: 5000, validDays: 365, featureFlags: ['all', 'air_gapped', 'fips_compliance', 'audit_vault', 'sovereign_cloud'] },
            OEM: { maxSeats: 10000, validDays: 730, featureFlags: ['all', 'white_label', 'embedded_engine', 'royalty_tracking'] },
            Marketplace: { maxSeats: 50, validDays: 365, featureFlags: ['marketplace_publish', 'partner_api', 'extension_sdk'] },
            SaaS: { maxSeats: 100000, validDays: 365, featureFlags: ['cloud_native', 'multi_tenant', 'usage_metering', 'auto_scale'] },
            Academic: { maxSeats: 100, validDays: 365, featureFlags: ['basic_governance', 'research_dataset', 'educational_use'] },
            Evaluation: { maxSeats: 5, validDays: 30, featureFlags: ['basic_governance', 'evaluation_sandbox', 'trial_preview'] }
        };

        // Initialize instance default keypair if needed
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
     * Helper to normalize tier name string
     */
    _normalizeTier(tier) {
        if (!tier || typeof tier !== 'string') return null;
        const normalized = this.validTiers.find(t => t.toLowerCase() === tier.toLowerCase());
        return normalized || null;
    }

    /**
     * Helper to encode base64url
     */
    _base64UrlEncode(buffer) {
        return buffer.toString('base64')
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');
    }

    /**
     * Helper to decode base64url
     */
    _base64UrlDecode(str) {
        let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
            base64 += '=';
        }
        return Buffer.from(base64, 'base64');
    }

    /**
     * Creates cryptographically signed Ed25519 license tokens.
     * @param {string} tier - One of Enterprise, Government, OEM, Marketplace, SaaS, Academic, Evaluation.
     * @param {Object} customerInfo - Details regarding customer, seats, expiration, custom feature flags.
     * @param {Object} options - Optional privateKey / publicKey override.
     * @returns {Object} License token bundle containing token string, payload, signature, and public key.
     */
    generateLicenseKey(tier, customerInfo = {}, options = {}) {
        const normalizedTier = this._normalizeTier(tier);
        if (!normalizedTier) {
            throw new Error(`Invalid license tier '${tier}'. Must be one of: ${this.validTiers.join(', ')}`);
        }

        const defaults = this.tierDefaults[normalizedTier];
        const privateKeyPem = options.privateKey || this.privateKey;
        const publicKeyPem = options.publicKey || this.publicKey;

        const now = new Date();
        const validDays = customerInfo.validDays || defaults.validDays;
        const expiresAtDate = customerInfo.expiresAt 
            ? new Date(customerInfo.expiresAt)
            : new Date(now.getTime() + validDays * 24 * 60 * 60 * 1000);

        const mergedFlags = Array.from(new Set([
            ...defaults.featureFlags,
            ...(customerInfo.featureFlags || [])
        ]));

        const licenseId = customerInfo.licenseId || `lic-${crypto.randomUUID()}`;

        const payload = {
            licenseId,
            tier: normalizedTier,
            issuer: 'Ujomor Systems & Enterprise Governance Authority',
            customer: {
                customerId: customerInfo.customerId || `cust-${crypto.randomUUID().slice(0, 8)}`,
                organization: customerInfo.organization || customerInfo.orgName || 'Enterprise Customer',
                contactEmail: customerInfo.contactEmail || 'admin@customer.com',
                environment: customerInfo.environment || 'Production'
            },
            maxSeats: customerInfo.maxSeats !== undefined ? Number(customerInfo.maxSeats) : defaults.maxSeats,
            featureFlags: mergedFlags,
            issuedAt: now.toISOString(),
            expiresAt: expiresAtDate.toISOString(),
            customMetadata: customerInfo.customMetadata || {}
        };

        const payloadBuffer = Buffer.from(JSON.stringify(payload), 'utf8');
        
        // Sign payload with Ed25519 private key
        const signatureBuffer = crypto.sign(null, payloadBuffer, privateKeyPem);

        const encodedPayload = this._base64UrlEncode(payloadBuffer);
        const encodedSignature = this._base64UrlEncode(signatureBuffer);
        const licenseToken = `${encodedPayload}.${encodedSignature}`;

        return {
            licenseToken,
            licenseId,
            tier: normalizedTier,
            publicKey: publicKeyPem,
            payload,
            signature: encodedSignature,
            issuedAt: payload.issuedAt,
            expiresAt: payload.expiresAt,
            maxSeats: payload.maxSeats,
            featureFlags: payload.featureFlags
        };
    }

    /**
     * Validates license integrity, expiration, feature flags, and max seat allocations.
     * @param {string|Object} licenseToken - License token string or object containing token and signature.
     * @param {string|Object} pubKey - Ed25519 Public Key (PEM or KeyObject).
     * @param {Object} options - Verification parameters (e.g. checkSeats, requiredFeature).
     * @returns {Object} Detailed verification result.
     */
    verifyLicenseKey(licenseToken, pubKey = null, options = {}) {
        const keyToUse = pubKey || this.publicKey;
        
        if (!licenseToken) {
            return { valid: false, reason: 'License token is required', integrityVerified: false };
        }

        let payloadStr = '';
        let signatureBuf = null;
        let payload = null;

        try {
            if (typeof licenseToken === 'string') {
                if (licenseToken.includes('.')) {
                    const parts = licenseToken.split('.');
                    payloadStr = this._base64UrlDecode(parts[0]).toString('utf8');
                    signatureBuf = this._base64UrlDecode(parts[1]);
                } else {
                    // Fallback try JSON parse
                    const parsed = JSON.parse(licenseToken);
                    if (parsed.licenseToken) {
                        return this.verifyLicenseKey(parsed.licenseToken, pubKey, options);
                    }
                    payloadStr = JSON.stringify(parsed.payload || parsed);
                    signatureBuf = Buffer.from(parsed.signature, 'hex');
                }
            } else if (typeof licenseToken === 'object') {
                if (licenseToken.licenseToken) {
                    return this.verifyLicenseKey(licenseToken.licenseToken, pubKey || licenseToken.publicKey, options);
                }
                payloadStr = JSON.stringify(licenseToken.payload);
                signatureBuf = this._base64UrlDecode(licenseToken.signature);
            }
            payload = JSON.parse(payloadStr);
        } catch (err) {
            return {
                valid: false,
                reason: `Failed to parse license token: ${err.message}`,
                integrityVerified: false
            };
        }

        // 1. Verify Signature Integrity using Ed25519
        let integrityVerified = false;
        try {
            const payloadBuf = Buffer.from(JSON.stringify(payload), 'utf8');
            integrityVerified = crypto.verify(null, payloadBuf, keyToUse, signatureBuf);
        } catch (e) {
            integrityVerified = false;
        }

        if (!integrityVerified) {
            return {
                valid: false,
                reason: 'Cryptographic signature verification failed',
                integrityVerified: false,
                payload
            };
        }

        // 2. Verify Expiration
        const now = new Date();
        const expiresAtDate = new Date(payload.expiresAt);
        const expired = now > expiresAtDate;
        const remainingMs = expiresAtDate.getTime() - now.getTime();
        const remainingDays = Math.max(0, Math.floor(remainingMs / (1000 * 60 * 60 * 24)));

        if (expired) {
            return {
                valid: false,
                reason: `License expired on ${payload.expiresAt}`,
                integrityVerified: true,
                expired: true,
                remainingDays: 0,
                tier: payload.tier,
                customer: payload.customer,
                maxSeats: payload.maxSeats,
                featureFlags: payload.featureFlags
            };
        }

        // 3. Verify Seat Allocation Limit
        let seatsExceeded = false;
        if (options.checkSeats && typeof options.checkSeats === 'number') {
            if (options.checkSeats > payload.maxSeats) {
                seatsExceeded = true;
            }
        }

        if (seatsExceeded) {
            return {
                valid: false,
                reason: `Requested seat count (${options.checkSeats}) exceeds maximum allowed seats (${payload.maxSeats})`,
                integrityVerified: true,
                expired: false,
                seatsExceeded: true,
                tier: payload.tier,
                maxSeats: payload.maxSeats
            };
        }

        // 4. Verify Feature Flag Requirements
        if (options.requiredFeature) {
            const hasFeature = payload.featureFlags.includes('all') || payload.featureFlags.includes(options.requiredFeature);
            if (!hasFeature) {
                return {
                    valid: false,
                    reason: `Required feature flag '${options.requiredFeature}' is not granted in license tier '${payload.tier}'`,
                    integrityVerified: true,
                    expired: false,
                    featureFlags: payload.featureFlags
                };
            }
        }

        return {
            valid: true,
            reason: null,
            integrityVerified: true,
            expired: false,
            seatsExceeded: false,
            remainingDays,
            licenseId: payload.licenseId,
            tier: payload.tier,
            customer: payload.customer,
            maxSeats: payload.maxSeats,
            featureFlags: payload.featureFlags,
            issuedAt: payload.issuedAt,
            expiresAt: payload.expiresAt
        };
    }
}

module.exports = CommercialLicensingEngine;
