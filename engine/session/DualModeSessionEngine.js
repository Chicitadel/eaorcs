/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Dual-Mode Session Engine
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
 * CORP: Subsystem 4 — Dual-Mode Master Certification & Packaging
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
    constructor(options = {}) {
        this.options = options;
        this.workspace = options.workspace ? path.resolve(options.workspace) : path.resolve(__dirname, '../../');
        this.secretKey = options.secretKey || 'eaorcs-dual-mode-session-secret-2026';
        this.cacheFilePath = options.cacheFilePath || path.join(this.workspace, '.eaorcs_session_cache.json');
        this.mode = options.mode || 'OFFLINE_FIRST';
        this.defaultTier = options.tier || 'COMMERCIAL';
    }

    /**
     * Generates an HMAC-SHA256 session token.
     * @param {object} sessionData 
     * @returns {object} Token payload and signature.
     */
    generateSessionToken(sessionData = {}) {
        const payload = {
            sessionId: sessionData.sessionId || `SESS-${crypto.randomBytes(8).toString('hex')}`,
            user: sessionData.user || 'governance-operator',
            tier: (sessionData.tier || this.defaultTier).toUpperCase(),
            workspace: this.workspace,
            issuedAt: sessionData.issuedAt || new Date().toISOString(),
            expiresAt: sessionData.expiresAt || new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
            mode: sessionData.mode || this.mode
        };

        const serializedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
        const signature = crypto.createHmac('sha256', this.secretKey)
            .update(serializedPayload)
            .digest('hex');

        const token = `EAORCS-SESS.${serializedPayload}.${signature}`;

        return {
            token,
            sessionId: payload.sessionId,
            payload,
            signature,
            tier: payload.tier,
            issuedAt: payload.issuedAt,
            expiresAt: payload.expiresAt
        };
    }

    /**
     * Verifies an HMAC-SHA256 session token.
     * @param {string} tokenStr 
     * @returns {object} Validation result.
     */
    verifySessionToken(tokenStr) {
        if (!tokenStr || typeof tokenStr !== 'string' || !tokenStr.startsWith('EAORCS-SESS.')) {
            return { valid: false, reason: 'INVALID_TOKEN_FORMAT' };
        }

        const parts = tokenStr.split('.');
        if (parts.length !== 3) {
            return { valid: false, reason: 'MALFORMED_TOKEN_STRUCTURE' };
        }

        const [, serializedPayload, signature] = parts;
        const expectedSignature = crypto.createHmac('sha256', this.secretKey)
            .update(serializedPayload)
            .digest('hex');

        if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
            return { valid: false, reason: 'SIGNATURE_MISMATCH' };
        }

        try {
            const payload = JSON.parse(Buffer.from(serializedPayload, 'base64url').toString('utf8'));
            const now = new Date();
            const expiresAt = new Date(payload.expiresAt);

            if (now > expiresAt) {
                return { valid: false, reason: 'TOKEN_EXPIRED', payload };
            }

            return { valid: true, payload, reason: null };
        } catch (e) {
            return { valid: false, reason: 'PAYLOAD_PARSE_ERROR' };
        }
    }

    /**
     * Serializes session data to local cache.
     * @param {object} sessionData 
     * @returns {object} Cache serialization status.
     */
    serializeSessionCache(sessionData) {
        try {
            const tokenObj = sessionData.token ? sessionData : this.generateSessionToken(sessionData);
            const cachePayload = {
                version: '2026.3.1-LTS',
                updatedAt: new Date().toISOString(),
                mode: this.mode,
                workspace: this.workspace,
                session: tokenObj
            };

            fs.writeFileSync(this.cacheFilePath, JSON.stringify(cachePayload, null, 2), 'utf8');
            return { success: true, cacheFilePath: this.cacheFilePath, cache: cachePayload };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

    /**
     * Deserializes session data from local cache.
     * @returns {object|null} Cached session data or null if missing/invalid.
     */
    deserializeSessionCache() {
        if (!fs.existsSync(this.cacheFilePath)) {
            return null;
        }

        try {
            const raw = fs.readFileSync(this.cacheFilePath, 'utf8');
            const data = JSON.parse(raw);
            if (data && data.session) {
                const verification = this.verifySessionToken(data.session.token);
                data.session.isValid = verification.valid;
                data.session.verificationReason = verification.reason;
                return data;
            }
            return null;
        } catch (e) {
            return null;
        }
    }

    /**
     * Evaluates tier revalidation policies based on mode and connectivity.
     * @param {object} [session] 
     * @param {object} [options] 
     * @returns {object} Policy evaluation.
     */
    evaluateTierRevalidation(session = null, options = {}) {
        const cached = session || this.deserializeSessionCache();
        const mode = options.mode || this.mode;
        const offlineAllowedTiers = ['FREE', 'COMMUNITY', 'COMMERCIAL', 'ENTERPRISE'];

        if (!cached || !cached.session) {
            const defaultToken = this.generateSessionToken({ tier: this.defaultTier, mode });
            return {
                revalidated: true,
                mode,
                tier: this.defaultTier,
                policy: 'FALLBACK_OFFLINE_DEFAULT',
                status: 'REVALIDATED_DEFAULT',
                token: defaultToken.token
            };
        }

        const activeSession = cached.session;
        const verification = this.verifySessionToken(activeSession.token);

        if (!verification.valid && verification.reason === 'SIGNATURE_MISMATCH') {
            return {
                revalidated: false,
                mode,
                tier: 'FREE',
                policy: 'REJECT_INVALID_SIGNATURE',
                status: 'FAILED',
                error: 'INVALID_SIGNATURE'
            };
        }

        const tier = activeSession.tier || this.defaultTier;
        const isOffline = mode === 'OFFLINE' || mode === 'OFFLINE_FIRST';

        if (isOffline) {
            const tierValid = offlineAllowedTiers.includes(tier);
            return {
                revalidated: tierValid,
                mode: 'OFFLINE_FIRST',
                tier: tierValid ? tier : 'FREE',
                policy: 'LOCAL_CACHE_OFFLINE_POLICY',
                status: tierValid ? 'OFFLINE_REVALIDATED' : 'DEGRADED_FREE',
                cachedAt: cached.updatedAt || activeSession.issuedAt
            };
        }

        return {
            revalidated: verification.valid,
            mode: 'ONLINE',
            tier: verification.valid ? tier : 'FREE',
            policy: 'ONLINE_AUTHORITY_POLICY',
            status: verification.valid ? 'ONLINE_REVALIDATED' : 'REVALIDATION_EXPIRED'
        };
    }

    /**
     * Evaluates trust provenance for session authenticity.
     * @param {object} session 
     * @param {object} [hostContext] 
     * @returns {object} Trust provenance score and metrics.
     */
    evaluateTrustProvenance(session = null, hostContext = {}) {
        const cached = session || this.deserializeSessionCache();
        const activeSession = cached && cached.session ? cached.session : this.generateSessionToken();
        const verification = this.verifySessionToken(activeSession.token);

        const checks = [
            { check: 'HMAC_SIGNATURE', passed: verification.valid, weight: 40 },
            { check: 'WORKSPACE_ALIGNMENT', passed: activeSession.payload ? activeSession.payload.workspace === this.workspace : true, weight: 20 },
            { check: 'OFFLINE_CACHE_INTEGRITY', passed: !!cached, weight: 20 },
            { check: 'TIER_AUTHORIZATION', passed: ['FREE', 'COMMUNITY', 'COMMERCIAL', 'ENTERPRISE'].includes(activeSession.tier), weight: 20 }
        ];

        const trustScore = checks.reduce((acc, c) => acc + (c.passed ? c.weight : 0), 0);
        const trusted = trustScore >= 70;

        return {
            trusted,
            trustScore,
            provenanceHash: crypto.createHash('sha256').update(activeSession.token + this.workspace).digest('hex'),
            checks,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Computes the badge state for UI display.
     * @param {object} [session] 
     * @returns {object} Badge metadata.
     */
    getBadgeState(session = null) {
        const reval = this.evaluateTierRevalidation(session);
        const trust = this.evaluateTrustProvenance(session);

        const tierColors = {
            FREE: '#6e7681',
            COMMUNITY: '#2da44e',
            COMMERCIAL: '#0969da',
            ENTERPRISE: '#8250df'
        };

        return {
            label: `${reval.tier} (${reval.mode})`,
            tier: reval.tier,
            mode: reval.mode,
            color: tierColors[reval.tier] || '#0969da',
            icon: trust.trusted ? 'shield-check' : 'shield-alert',
            trustScore: trust.trustScore,
            revalidated: reval.revalidated,
            tooltip: `EAORCS ${reval.tier} License — Mode: ${reval.mode} — Trust: ${trust.trustScore}%`
        };
    }

    /**
     * Gets overall session status.
     * @param {object} [options] 
     * @returns {object} Full session status.
     */
    getSessionStatus(options = {}) {
        const cached = this.deserializeSessionCache();
        const activeSession = cached ? cached.session : this.generateSessionToken(options);
        const reval = this.evaluateTierRevalidation(cached, options);
        const trust = this.evaluateTrustProvenance(cached, options);
        const badgeState = this.getBadgeState(cached);

        return {
            status: 'ACTIVE',
            mode: this.mode,
            tier: reval.tier,
            revalidation: reval,
            trustProvenance: trust,
            badgeState,
            session: activeSession
        };
    }

    /**
     * Authenticates a session and stores local cache.
     * @param {object} credentials 
     * @returns {object} Authentication result.
     */
    authenticateSession(credentials = {}) {
        const user = credentials.user || credentials.username || 'governance-operator';
        const tier = (credentials.tier || this.defaultTier).toUpperCase();
        const tokenObj = this.generateSessionToken({ user, tier, mode: this.mode });
        
        const cacheResult = this.serializeSessionCache(tokenObj);
        const badgeState = this.getBadgeState({ session: tokenObj });

        return {
            authenticated: true,
            status: 'AUTHENTICATED',
            user,
            tier,
            mode: this.mode,
            token: tokenObj.token,
            sessionId: tokenObj.sessionId,
            expiresAt: tokenObj.expiresAt,
            cacheResult,
            badgeState
        };
    }
}

module.exports = DualModeSessionEngine;
