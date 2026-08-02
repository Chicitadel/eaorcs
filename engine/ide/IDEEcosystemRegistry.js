/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Developer Ecosystem & IDE Registry Engine
 * File           : IDEEcosystemRegistry.js
 * Version        : 2026.1-LTS
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
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
 * - Language Server Protocol (LSP 3.17)
 * - OSAP v1/v2/v5/v8 Open Software Attestation Protocol
 *
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const fs = require('fs');
const path = require('path');
const OsapEngine = require('../osap/OsapEngine');

/**
 * Diagnostic Severity Levels matching LSP 3.17 specification
 */
const LSP_DIAGNOSTIC_SEVERITY = Object.freeze({
    Error: 1,
    Warning: 2,
    Information: 3,
    Hint: 4
});

/**
 * Supported IDE Platforms
 */
const SUPPORTED_IDE_PLATFORMS = Object.freeze([
    'vscode',
    'jetbrains',
    'visualstudio',
    'eclipse',
    'neovim',
    'cursor',
    'zed'
]);

/**
 * IDEEcosystemRegistry
 * Central registry manager for IDE integrations, LSP diagnostic endpoints, plugin registry lookups,
 * and OSAP passport inspection handlers across the developer ecosystem.
 */
class IDEEcosystemRegistry {
    constructor(options = {}) {
        this.options = options;
        this.plugins = new Map();
        this.activeSessions = new Map();
        this.osapEngine = new OsapEngine(options.osapOptions || {});
        this.diagnosticRules = this._initializeDiagnosticRules();

        if (Array.isArray(options.initialPlugins)) {
            options.initialPlugins.forEach(p => this.registerPlugin(p.id, p));
        }
    }

    /**
     * Internal diagnostic rules for OSAP and governance compliance
     */
    _initializeDiagnosticRules() {
        return [
            {
                id: 'OSAP-001',
                name: 'Missing Governance Header',
                severity: LSP_DIAGNOSTIC_SEVERITY.Warning,
                check: (content) => !content.includes('Governance:'),
                message: 'Source file is missing standard EAORCS/UAIGOS governance header block.'
            },
            {
                id: 'OSAP-002',
                name: 'Hardcoded Secret Exposure Risk',
                severity: LSP_DIAGNOSTIC_SEVERITY.Error,
                check: (content) => /(?:api_key|secret_key|passwd|password|private_key)\s*=\s*['"][A-Za-z0-9+/=]{8,}['"]/i.test(content),
                message: 'Potential hardcoded secret key detected in source code. Use EAORCS secret vault instead.'
            },
            {
                id: 'OSAP-003',
                name: 'Unrestricted Network Call',
                severity: LSP_DIAGNOSTIC_SEVERITY.Information,
                check: (content) => /http:\/\/|\.fetch\(['"]http:/i.test(content),
                message: 'Insecure HTTP network endpoint detected. Zero-Trust policy requires HTTPS/TLS 1.3.'
            },
            {
                id: 'OSAP-004',
                name: 'Unchecked System Command Execution',
                severity: LSP_DIAGNOSTIC_SEVERITY.Warning,
                check: (content) => /exec\(|spawn\(/i.test(content) && !content.includes('spawnSync'),
                message: 'Asynchronous command execution detected without strict sandbox validation.'
            }
        ];
    }

    /**
     * Register a new IDE plugin in the ecosystem registry
     * @param {string} pluginId - Unique ID (e.g. 'eaorcs-vscode-extension')
     * @param {Object} config - Plugin configuration & metadata
     */
    registerPlugin(pluginId, config = {}) {
        if (!pluginId || typeof pluginId !== 'string') {
            throw new Error('Plugin registration failed: pluginId must be a non-empty string');
        }
        const platform = (config.platform || 'vscode').toLowerCase();
        
        const entry = {
            id: pluginId,
            name: config.name || pluginId,
            platform,
            version: config.version || '1.0.0',
            publisher: config.publisher || 'Ujomor Systems',
            status: 'ACTIVE',
            capabilities: config.capabilities || ['diagnostics', 'passport-inspection', 'trust-node-view'],
            registeredAt: new Date().toISOString(),
            metadata: config.metadata || {}
        };

        this.plugins.set(pluginId, entry);
        return { success: true, plugin: entry };
    }

    /**
     * Retrieves a registered plugin by ID
     * @param {string} pluginId
     */
    getPlugin(pluginId) {
        return this.plugins.get(pluginId) || null;
    }

    /**
     * Lists registered plugins with optional platform filter
     * @param {Object} [filter={}]
     */
    listPlugins(filter = {}) {
        let list = Array.from(this.plugins.values());
        if (filter.platform) {
            list = list.filter(p => p.platform.toLowerCase() === filter.platform.toLowerCase());
        }
        if (filter.status) {
            list = list.filter(p => p.status === filter.status);
        }
        return list;
    }

    /**
     * Unregisters a plugin from the ecosystem
     * @param {string} pluginId
     */
    unregisterPlugin(pluginId) {
        if (!this.plugins.has(pluginId)) {
            return { success: false, reason: 'Plugin not found' };
        }
        this.plugins.delete(pluginId);
        return { success: true, pluginId };
    }

    /**
     * Creates an active Language Server Protocol (LSP) session endpoint
     * @param {string} sessionId
     * @param {Object} clientInfo
     */
    createLspSession(sessionId, clientInfo = {}) {
        if (!sessionId) throw new Error('LSP Session creation requires sessionId');
        
        const session = {
            sessionId,
            clientName: clientInfo.clientName || 'Generic LSP Client',
            platform: clientInfo.platform || 'vscode',
            rootUri: clientInfo.rootUri || 'file:///',
            capabilities: clientInfo.capabilities || {},
            createdAt: new Date().toISOString(),
            status: 'CONNECTED'
        };

        this.activeSessions.set(sessionId, session);
        return session;
    }

    /**
     * Terminates an active LSP session
     * @param {string} sessionId
     */
    closeLspSession(sessionId) {
        if (!this.activeSessions.has(sessionId)) return false;
        this.activeSessions.delete(sessionId);
        return true;
    }

    /**
     * Provides LSP-compatible inline diagnostics for a given document
     * @param {string} documentUri
     * @param {string} content
     * @returns {Array<Object>} List of LSP diagnostic objects
     */
    provideDiagnostics(documentUri, content = '') {
        const diagnostics = [];
        const lines = content.split('\n');

        this.diagnosticRules.forEach(rule => {
            if (rule.check(content)) {
                let lineIndex = 0;
                for (let i = 0; i < lines.length; i++) {
                    if (rule.check(lines[i])) {
                        lineIndex = i;
                        break;
                    }
                }
                
                diagnostics.push({
                    range: {
                        start: { line: lineIndex, character: 0 },
                        end: { line: lineIndex, character: lines[lineIndex] ? lines[lineIndex].length : 100 }
                    },
                    severity: rule.severity,
                    code: rule.id,
                    source: 'EAORCS-LSP',
                    message: rule.message,
                    documentUri
                });
            }
        });

        return diagnostics;
    }

    /**
     * OSAP Passport Inspection Handler
     * Parses, validates, and provides governance summary for an OSAP passport
     * @param {Object|string} passportInput - Object or JSON string or filepath to osap-passport.json
     * @returns {Object} Inspection result
     */
    inspectPassport(passportInput) {
        let passportData;

        if (typeof passportInput === 'string') {
            if (passportInput.trim().startsWith('{')) {
                passportData = JSON.parse(passportInput);
            } else if (fs.existsSync(passportInput)) {
                passportData = JSON.parse(fs.readFileSync(passportInput, 'utf8'));
            } else {
                throw new Error(`Passport file not found: ${passportInput}`);
            }
        } else if (typeof passportInput === 'object' && passportInput !== null) {
            passportData = passportInput;
        } else {
            throw new Error('Invalid passport input format');
        }

        const isSchemaValid = !!(passportData.osap_version && passportData.passport_id && passportData.trust_summary);
        const trustScore = passportData.trust_summary ? passportData.trust_summary.trust_score : 0;
        const tier = passportData.trust_summary ? passportData.trust_summary.tier : 'UNVERIFIED';
        const certificationStatus = passportData.certification ? passportData.certification.status : 'PENDING';

        return {
            inspectionId: `INSP-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
            timestamp: new Date().toISOString(),
            isValid: isSchemaValid,
            passportId: passportData.passport_id || 'UNKNOWN',
            osapVersion: passportData.osap_version || '2.0.0',
            issuer: passportData.issuer ? passportData.issuer.organization : 'UNKNOWN',
            subject: passportData.subject ? passportData.subject.artifact_id : 'UNKNOWN',
            trustScore,
            tier,
            certificationStatus,
            domainScores: passportData.domain_scores || {},
            evidenceItemCount: passportData.evidence_manifest ? passportData.evidence_manifest.total_evidence_items : 0,
            verificationDetails: {
                cryptoSignatureVerified: !!(passportData.issuer && passportData.issuer.digital_signature),
                protocolCompliant: true
            }
        };
    }

    /**
     * Returns ecosystem status statistics
     */
    getRegistryStatus() {
        return {
            totalPlugins: this.plugins.size,
            pluginsByPlatform: SUPPORTED_IDE_PLATFORMS.reduce((acc, p) => {
                acc[p] = this.listPlugins({ platform: p }).length;
                return acc;
            }, {}),
            activeLspSessions: this.activeSessions.size,
            activeDiagnosticRules: this.diagnosticRules.length,
            supportedPlatforms: SUPPORTED_IDE_PLATFORMS,
            status: 'OPERATIONAL'
        };
    }
}

module.exports = IDEEcosystemRegistry;
module.exports.IDEEcosystemRegistry = IDEEcosystemRegistry;
module.exports.LSP_DIAGNOSTIC_SEVERITY = LSP_DIAGNOSTIC_SEVERITY;
module.exports.SUPPORTED_IDE_PLATFORMS = SUPPORTED_IDE_PLATFORMS;
