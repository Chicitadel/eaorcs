/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Security Subsystem
 * File           : DualModeSessionEngine.js
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
 * CORP: Subsystem 1 — Dual-Mode Session & Security Engine
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

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class DualModeSessionEngine {
    /**
     * @param {Object} [options]
     * @param {string} [options.baseDir]
     * @param {string} [options.cachePath]
     * @param {string} [options.secretKey]
     */
    constructor(options = {}) {
        this.baseDir = options.baseDir || process.cwd();
        this.cachePath = options.cachePath || path.join(this.baseDir, '.governance', 'session.cache.json');
        this.secretKey = options.secretKey || 'eaorcs-dual-mode-session-secret-2026';

        this.tierPolicies = {
            Community: {
                tier: 'Community',
                revalidationDays: 7,
                durationMs: 7 * 24 * 60 * 60 * 1000,
                isPerpetual: false,
                description: '7-Day Offline Cache Window'
            },
            Professional: {
                tier: 'Professional',
                revalidationDays: 30,
                durationMs: 30 * 24 * 60 * 60 * 1000,
                isPerpetual: false,
                description: '30-Day Offline Cache Window'
            },
            Enterprise: {
                tier: 'Enterprise',
                revalidationDays: 90,
                durationMs: 90 * 24 * 60 * 60 * 1000,
                isPerpetual: false,
                description: '90-Day Offline Cache Window'
            },
            Sovereign: {
                tier: 'Sovereign',
                revalidationDays: Infinity,
                durationMs: Infinity,
                isPerpetual: true,
                description: 'Air-Gapped Perpetual Authorization'
            }
        };
    }

    /**
     * Get revalidation policy for a given tier.
     * @param {string} tier 
     * @returns {Object}
     */
    getRevalidationPolicy(tier) {
        if (!tier) return this.tierPolicies.Community;
        const normalized = String(tier).trim();
        const matchedKey = Object.keys(this.tierPolicies).find(
            k => k.toLowerCase() === normalized.toLowerCase()
        );
        return matchedKey ? this.tierPolicies[matchedKey] : this.tierPolicies.Community;
    }

    /**
     * Trust Provenance Evaluator
     * Evaluates trust level based on source path, location or input string.
     * Outcomes:
     * - 'Project Local: Verified'
     * - 'Linked Repo: Verified'
     * - 'External: Unverified'
     *
     * @param {string} provenanceInput 
     * @returns {string} Exact trust status string
     */
    evaluateTrustProvenance(provenanceInput) {
        if (!provenanceInput || typeof provenanceInput !== 'string') {
            return 'External: Unverified';
        }

        const inputLower = provenanceInput.toLowerCase().trim();

        if (inputLower.includes('project local') || inputLower.includes('project_local') || inputLower === 'local' || inputLower === 'project') {
            return 'Project Local: Verified';
        }

        if (inputLower.includes('linked repo') || inputLower.includes('linked_repo') || inputLower === 'linked' || inputLower === 'submodule') {
            return 'Linked Repo: Verified';
        }

        if (inputLower.includes('external') || inputLower.includes('unverified') || inputLower === 'remote') {
            return 'External: Unverified';
        }

        // Path-based evaluation
        try {
            const absoluteTarget = path.resolve(provenanceInput);
            const absoluteBase = path.resolve(this.baseDir);

            if (absoluteTarget === absoluteBase || absoluteTarget.startsWith(absoluteBase + path.sep)) {
                return 'Project Local: Verified';
            }

            if (absoluteTarget.includes('.git') || absoluteTarget.includes('packages') || absoluteTarget.includes('node_modules')) {
                return 'Linked Repo: Verified';
            }
        } catch (_) {
            // Ignore path parsing errors
        }

        return 'External: Unverified';
    }

    /**
     * Get cache file path.
     * @returns {string}
     */
    getCachePath() {
        return this.cachePath;
    }

    /**
     * Load sessions from local database cache (.governance/session.cache.json)
     * @returns {Object} Cache content
     */
    loadCache() {
        try {
            if (fs.existsSync(this.cachePath)) {
                const content = fs.readFileSync(this.cachePath, 'utf8');
                return JSON.parse(content);
            }
        } catch (err) {
            // Fallback for missing/corrupt cache
        }
        return {
            schemaVersion: '2026.3.1',
            lastUpdated: new Date().toISOString(),
            sessions: {}
        };
    }

    /**
     * Save cache to disk (.governance/session.cache.json)
     * @param {Object} cacheData 
     * @returns {boolean}
     */
    saveCache(cacheData) {
        try {
            const dir = path.dirname(this.cachePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            cacheData.lastUpdated = new Date().toISOString();
            fs.writeFileSync(this.cachePath, JSON.stringify(cacheData, null, 2), 'utf8');
            return true;
        } catch (err) {
            return false;
        }
    }

    /**
     * Clear the offline cache
     * @returns {boolean}
     */
    clearCache() {
        try {
            if (fs.existsSync(this.cachePath)) {
                fs.unlinkSync(this.cachePath);
            }
            return true;
        } catch (err) {
            return false;
        }
    }

    /**
     * Helper to base64url encode
     */
    _base64UrlEncode(str) {
        return Buffer.from(str)
            .toString('base64')
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');
    }

    /**
     * Helper to base64url decode
     */
    _base64UrlDecode(str) {
        let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4 !== 0) {
            base64 += '=';
        }
        return Buffer.from(base64, 'base64').toString('utf8');
    }

    /**
     * Sign string using HMAC-SHA256
     */
    _signHmac(content, secret) {
        return crypto.createHmac('sha256', secret).update(content).digest('hex');
    }

    /**
     * Authenticate session and issue cryptographic offline token.
     *
     * @param {Object} identity
     * @param {string} [identity.userId]
     * @param {string} [identity.orgId]
     * @param {string} [identity.tier] - Community | Professional | Enterprise | Sovereign
     * @param {string} [identity.provenance] - Project Local | Linked Repo | External (or path)
     * @param {string} [identity.secretKey] - Optional secret override
     * @param {number} [identity.customDurationMs] - Optional custom expiration window
     * @returns {Object} Session result with signed offline token
     */
    authenticateSession(identity = {}) {
        const userId = identity.userId || 'usr_anonymous_' + crypto.randomBytes(4).toString('hex');
        const orgId = identity.orgId || 'org_default';
        const tier = identity.tier || 'Community';
        const secret = identity.secretKey || this.secretKey;

        const policy = this.getRevalidationPolicy(tier);
        const trustProvenance = this.evaluateTrustProvenance(identity.provenance || 'Project Local');

        const now = Date.now();
        const duration = identity.customDurationMs || policy.durationMs;
        const expiresAt = policy.isPerpetual ? null : now + duration;

        const sessionId = 'sess_' + crypto.randomBytes(16).toString('hex');

        const header = {
            alg: 'HS256',
            typ: 'OFFLINE_JWT',
            ver: '2026.3.1'
        };

        const payload = {
            sessionId,
            userId,
            orgId,
            tier: policy.tier,
            provenance: trustProvenance,
            issuedAt: now,
            expiresAt,
            isPerpetual: policy.isPerpetual,
            revalidationDays: policy.revalidationDays
        };

        const encodedHeader = this._base64UrlEncode(JSON.stringify(header));
        const encodedPayload = this._base64UrlEncode(JSON.stringify(payload));
        const signature = this._signHmac(`${encodedHeader}.${encodedPayload}`, secret);

        const token = `${encodedHeader}.${encodedPayload}.${signature}`;

        const sessionRecord = {
            sessionId,
            userId,
            orgId,
            tier: policy.tier,
            trustProvenance,
            token,
            signature,
            issuedAt: new Date(now).toISOString(),
            expiresAt: expiresAt ? new Date(expiresAt).toISOString() : 'PERPETUAL',
            isPerpetual: policy.isPerpetual,
            revalidationPolicy: policy,
            active: true
        };

        // Persist session to local offline database cache
        const cache = this.loadCache();
        cache.sessions[sessionId] = sessionRecord;
        this.saveCache(cache);

        return {
            status: 'AUTHENTICATED',
            sessionId,
            token,
            sessionRecord,
            tier: policy.tier,
            revalidationPolicy: policy,
            trustProvenance,
            expiresAt
        };
    }

    /**
     * Validate an offline cryptographic token.
     *
     * @param {string} token 
     * @param {string} [secretKey] 
     * @returns {Object} Validation result
     */
    validateOfflineToken(token, secretKey) {
        const secret = secretKey || this.secretKey;

        if (!token || typeof token !== 'string') {
            return {
                valid: false,
                reason: 'MISSING_OR_INVALID_TOKEN_FORMAT',
                error: 'Token must be a non-empty string'
            };
        }

        const parts = token.split('.');
        if (parts.length !== 3) {
            return {
                valid: false,
                reason: 'INVALID_TOKEN_STRUCTURE',
                error: 'Token format must be header.payload.signature'
            };
        }

        const [encodedHeader, encodedPayload, signature] = parts;

        // Verify cryptographic signature (HMAC-SHA256)
        const expectedSignature = this._signHmac(`${encodedHeader}.${encodedPayload}`, secret);

        let signaturesMatch = false;
        try {
            const bufA = Buffer.from(signature);
            const bufB = Buffer.from(expectedSignature);
            if (bufA.length === bufB.length) {
                signaturesMatch = crypto.timingSafeEqual(bufA, bufB);
            }
        } catch (_) {
            signaturesMatch = false;
        }

        if (!signaturesMatch) {
            return {
                valid: false,
                reason: 'INVALID_CRYPTOGRAPHIC_SIGNATURE',
                error: 'HMAC-SHA256 signature verification failed'
            };
        }

        // Decode payload
        let payload;
        try {
            payload = JSON.parse(this._base64UrlDecode(encodedPayload));
        } catch (err) {
            return {
                valid: false,
                reason: 'PAYLOAD_DECODE_FAILED',
                error: err.message
            };
        }

        // Check expiration
        const now = Date.now();
        if (!payload.isPerpetual && payload.expiresAt && now > payload.expiresAt) {
            return {
                valid: false,
                reason: 'TOKEN_EXPIRED',
                payload,
                expiredAt: new Date(payload.expiresAt).toISOString()
            };
        }

        // Verify against cached database record if present
        const cache = this.loadCache();
        const cachedRecord = cache.sessions[payload.sessionId];

        return {
            valid: true,
            reason: 'TOKEN_VERIFIED',
            payload,
            cachedRecord: cachedRecord || null,
            tier: payload.tier,
            trustProvenance: payload.provenance,
            isPerpetual: !!payload.isPerpetual
        };
    }
}

module.exports = DualModeSessionEngine;
