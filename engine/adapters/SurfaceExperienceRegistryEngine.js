/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Surface Experience Contract & Registry Engine
 * File           : SurfaceExperienceRegistryEngine.js
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

class SurfaceExperienceRegistryEngine {
    constructor(options = {}) {
        this.options = options;
        this.surfaces = new Map();
        this._registerBuiltInSurfaces();
    }

    _registerBuiltInSurfaces() {
        const defaultSurfaces = [
            { id: 'SURFACE-CLI', name: 'CLI Terminal', category: 'TERMINAL', supportsRealtime: false, supportsDialogs: true, supportsNotifications: false, supportsProgress: true, supportsGraphics: false, supportsInteractive: true },
            { id: 'SURFACE-DESKTOP', name: 'Desktop GUI Host', category: 'GUI', supportsRealtime: true, supportsDialogs: true, supportsNotifications: true, supportsProgress: true, supportsGraphics: true, supportsInteractive: true },
            { id: 'SURFACE-WEB', name: 'Web Dashboard Host', category: 'WEB', supportsRealtime: true, supportsDialogs: true, supportsNotifications: true, supportsProgress: true, supportsGraphics: true, supportsInteractive: true },
            { id: 'SURFACE-VSCODE', name: 'VS Code Extension', category: 'IDE', supportsRealtime: true, supportsDialogs: true, supportsNotifications: true, supportsProgress: true, supportsGraphics: true, supportsInteractive: true },
            { id: 'SURFACE-REST', name: 'REST API Gateway', category: 'API', supportsRealtime: false, supportsDialogs: false, supportsNotifications: true, supportsProgress: false, supportsGraphics: false, supportsInteractive: false },
            { id: 'SURFACE-SDK', name: 'Public Node.js SDK', category: 'SDK', supportsRealtime: false, supportsDialogs: false, supportsNotifications: false, supportsProgress: false, supportsGraphics: false, supportsInteractive: false },
            { id: 'SURFACE-MCP-AGENT', name: 'MCP AI Agent Protocol', category: 'AGENT', supportsRealtime: true, supportsDialogs: false, supportsNotifications: true, supportsProgress: true, supportsGraphics: false, supportsInteractive: true }
        ];

        for (const s of defaultSurfaces) {
            this.registerSurface(s);
        }
    }

    registerSurface(surfaceDescriptor) {
        if (!surfaceDescriptor || !surfaceDescriptor.id) {
            throw new Error('Invalid surface descriptor');
        }
        this.surfaces.set(surfaceDescriptor.id, surfaceDescriptor);
        return surfaceDescriptor;
    }

    getSurface(id) {
        return this.surfaces.get(id);
    }

    listSurfaces() {
        return Array.from(this.surfaces.values());
    }
}

module.exports = SurfaceExperienceRegistryEngine;
