/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Cross-Surface Session Continuity Engine
 * File           : CrossSurfaceSessionEngine.js
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

const crypto = require('crypto');

// Shared global session store across instances for cross-surface continuity
const globalSessionStore = new Map();

class CrossSurfaceSessionEngine {
    constructor(options = {}) {
        this.options = options;
        this.sessions = globalSessionStore;
    }

    /**
     * Starts or registers a cross-surface engineering session.
     */
    startOrGetSession(sessionId, context = {}) {
        const id = sessionId || `SESS-CROSS-${crypto.createHash('md5').update(new Date().toISOString()).digest('hex').slice(0, 8).toUpperCase()}`;

        if (this.sessions.has(id)) {
            const existing = this.sessions.get(id);
            existing.surfacesUsed.add(context.surface || 'UNKNOWN');
            existing.lastResumedAt = new Date().toISOString();
            return existing;
        }

        const session = {
            sessionId: id,
            startedAt: new Date().toISOString(),
            lastResumedAt: new Date().toISOString(),
            projectRoot: context.projectRoot || process.cwd(),
            surfacesUsed: new Set([context.surface || 'UNKNOWN']),
            activePlanId: context.activePlanId || null,
            journalId: context.journalId || null
        };

        this.sessions.set(id, session);
        return session;
    }

    /**
     * Resumes an existing cross-surface engineering session on a new surface.
     */
    resumeSession(sessionId, newSurface) {
        if (!this.sessions.has(sessionId)) {
            throw new Error(`Session not found: ${sessionId}`);
        }
        const session = this.sessions.get(sessionId);
        session.surfacesUsed.add(newSurface);
        session.lastResumedAt = new Date().toISOString();
        return {
            status: 'SESSION_RESUMED',
            session: {
                sessionId: session.sessionId,
                surfacesCount: session.surfacesUsed.size,
                surfaces: Array.from(session.surfacesUsed),
                lastResumedAt: session.lastResumedAt
            }
        };
    }
}

module.exports = CrossSurfaceSessionEngine;
