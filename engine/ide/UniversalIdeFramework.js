/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Developer Experience & Universal IDE Engine
 * File           : UniversalIdeFramework.js
 * Version        : 2026.1-LTS
 * Author         : Enterprise Architecture Authority & IDE Tooling Team
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | RESTRICTED
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
 * - Debug Adapter Protocol (DAP 1.51)
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const LspServer = require('./LspServer');
const IdeAdapterLayer = require('./IdeAdapterLayer.cjs');
const UniversalIdeMatrix = require('./UniversalIdeMatrix.cjs');

/**
 * Supported IDE Protocol Standards
 */
const SUPPORTED_PROTOCOLS = Object.freeze({
    LSP: 'LSP-3.17',
    DAP: 'DAP-1.51',
    WEBSOCKET_RPC: 'WS-RPC-2.0',
    STDIO_JSONRPC: 'STDIO-2.0'
});

/**
 * Supported IDE Clients
 */
const SUPPORTED_IDES = Object.freeze([
    'VS Code',
    'JetBrains',
    'Visual Studio',
    'Eclipse',
    'Cursor',
    'Windsurf',
    'Neovim',
    'Zed'
]);

/**
 * UniversalIdeFramework
 * Central multi-editor integration engine managing LSP/DAP protocols, diagnostic streams,
 * code actions, and real-time governance policy enforcement across top-tier IDEs.
 */
class UniversalIdeFramework {
    constructor(options = {}) {
        this.options = options;
        this.activeSessions = new Map();
        this.adapters = new Map();
        this.lspInstances = new Map();
        this.diagnosticsCache = new Map();
        this.telemetryEvents = [];

        this._initializeDefaultAdapters();
    }

    /**
     * Initializes default adapters for all 8 target IDE families.
     * @private
     */
    _initializeDefaultAdapters() {
        SUPPORTED_IDES.forEach(ideName => {
            const adapter = new IdeAdapterLayer(ideName, '2026.1-LTS');
            this.adapters.set(ideName, adapter);
        });
    }

    /**
     * Registers or overrides a custom IDE adapter instance.
     * @param {string} ideName - IDE Name
     * @param {Object} adapterInstance - IdeAdapterLayer instance
     */
    registerAdapter(ideName, adapterInstance) {
        if (!ideName || typeof ideName !== 'string') {
            throw new Error('IDE registration requires a valid ideName string');
        }
        this.adapters.set(ideName, adapterInstance);
        return { registered: true, ideName, timestamp: new Date().toISOString() };
    }

    /**
     * Initializes a new IDE session for a specific editor & workspace.
     * @param {Object} config - { sessionId, ideName, workspacePath, clientCapabilities }
     */
    initializeSession(config) {
        if (!config || !config.sessionId || !config.ideName) {
            throw new Error('Session initialization requires sessionId and ideName');
        }

        if (!SUPPORTED_IDES.includes(config.ideName) && !this.adapters.has(config.ideName)) {
            throw new Error(`Unsupported IDE [${config.ideName}]. Supported IDEs: ${SUPPORTED_IDES.join(', ')}`);
        }

        const adapter = this.adapters.get(config.ideName) || new IdeAdapterLayer(config.ideName);
        const lspServer = new LspServer({ input: null, output: null });

        const session = {
            sessionId: config.sessionId,
            ideName: config.ideName,
            workspacePath: config.workspacePath || '.',
            protocols: [SUPPORTED_PROTOCOLS.LSP, SUPPORTED_PROTOCOLS.DAP],
            adapterCapabilities: adapter.executeAdapterCapabilities(config.workspacePath),
            status: 'INITIALIZED',
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString()
        };

        this.activeSessions.set(config.sessionId, session);
        this.lspInstances.set(config.sessionId, lspServer);

        this._recordTelemetry('SESSION_INITIALIZED', { sessionId: config.sessionId, ideName: config.ideName });

        return session;
    }

    /**
     * Handles LSP message payload from an IDE client.
     * @param {string} sessionId 
     * @param {Object} lspMessage - JSON-RPC payload
     */
    handleLspMessage(sessionId, lspMessage) {
        const session = this.activeSessions.get(sessionId);
        if (!session) {
            throw new Error(`Session [${sessionId}] not found`);
        }

        const lspServer = this.lspInstances.get(sessionId);
        session.lastActive = new Date().toISOString();

        if (lspMessage.method === 'initialize') {
            return {
                jsonrpc: '2.0',
                id: lspMessage.id,
                result: {
                    capabilities: {
                        textDocumentSync: 1,
                        diagnosticProvider: { interFileDependencies: true, workspaceDiagnostics: true },
                        completionProvider: { triggerCharacters: ['.', ':', '/', '@'] },
                        codeActionProvider: true,
                        hoverProvider: true,
                        executeCommandProvider: { commands: ['eaorcs.applyFix', 'eaorcs.triggerScan'] }
                    },
                    serverInfo: { name: 'EAORCS Universal IDE Engine', version: '2026.1.0' }
                }
            };
        }

        if (lspMessage.method === 'textDocument/didOpen' || lspMessage.method === 'textDocument/didChange') {
            const uri = lspMessage.params?.textDocument?.uri;
            const text = lspMessage.params?.textDocument?.text || lspMessage.params?.contentChanges?.[0]?.text || '';
            
            if (uri) {
                const diagnostics = this.syncWorkspaceDiagnostics(sessionId, uri, text);
                return {
                    jsonrpc: '2.0',
                    method: 'textDocument/publishDiagnostics',
                    params: { uri, diagnostics }
                };
            }
        }

        if (lspMessage.method === 'textDocument/codeAction') {
            const actions = this.provideCodeActions(sessionId, lspMessage.params);
            return { jsonrpc: '2.0', id: lspMessage.id, result: actions };
        }

        return { jsonrpc: '2.0', id: lspMessage.id, result: null };
    }

    /**
     * Handles DAP (Debug Adapter Protocol 1.51) message payload.
     * @param {string} sessionId 
     * @param {Object} dapMessage 
     */
    handleDapMessage(sessionId, dapMessage) {
        const session = this.activeSessions.get(sessionId);
        if (!session) {
            throw new Error(`Session [${sessionId}] not found`);
        }

        const { command, seq, type } = dapMessage;
        session.lastActive = new Date().toISOString();

        if (command === 'initialize') {
            return {
                seq: seq + 1,
                type: 'response',
                request_seq: seq,
                command: 'initialize',
                success: true,
                body: {
                    supportsConfigurationDoneRequest: true,
                    supportsFunctionBreakpoints: true,
                    supportsConditionalBreakpoints: true,
                    supportsHitConditionalBreakpoints: true,
                    supportsEvaluateForHovers: true,
                    supportsStepBack: false,
                    supportsSetVariable: true,
                    supportsRestartFrame: false,
                    supportsGotoTargetsRequest: false,
                    supportsStepInTargetsRequest: false,
                    supportsCompletionsRequest: true,
                    supportsModulesRequest: true
                }
            };
        }

        if (command === 'setBreakpoints') {
            const breakpoints = (dapMessage.arguments?.breakpoints || []).map((bp, idx) => ({
                id: idx + 1,
                verified: true,
                line: bp.line,
                column: bp.column || 1,
                source: dapMessage.arguments.source
            }));

            return {
                seq: seq + 1,
                type: 'response',
                request_seq: seq,
                command: 'setBreakpoints',
                success: true,
                body: { breakpoints }
            };
        }

        return {
            seq: seq + 1,
            type: 'response',
            request_seq: seq,
            command,
            success: true,
            body: {}
        };
    }

    /**
     * Synchronizes and evaluates workspace diagnostics for a document.
     * @param {string} sessionId 
     * @param {string} uri 
     * @param {string} text 
     */
    syncWorkspaceDiagnostics(sessionId, uri, text) {
        const diagnostics = [];
        const lines = (text || '').split(/\r?\n/);

        lines.forEach((line, index) => {
            if (/api[_-]?key|secret|password|private[_-]?key\s*=\s*['"][A-Za-z0-9+/=]{8,}['"]/i.test(line)) {
                diagnostics.push({
                    range: { start: { line: index, character: 0 }, end: { line: index, character: line.length } },
                    severity: 1,
                    code: 'EAORCS-SEC-001',
                    source: 'EAORCS Security Engine',
                    message: 'EAORCS Governance Violation: Potential hardcoded secret. Use Secure Vault.'
                });
            }

            if (/eval\s*\(|new\s+Function\s*\(/i.test(line)) {
                diagnostics.push({
                    range: { start: { line: index, character: 0 }, end: { line: index, character: line.length } },
                    severity: 1,
                    code: 'EAORCS-SEC-002',
                    source: 'EAORCS Security Engine',
                    message: 'EAORCS Governance Error: Dynamic code evaluation (eval) prohibited under Zero-Trust policies.'
                });
            }
        });

        this.diagnosticsCache.set(`${sessionId}:${uri}`, diagnostics);
        return diagnostics;
    }

    /**
     * Provides quick-fix CodeActions for IDE diagnostics.
     * @param {string} sessionId 
     * @param {Object} params - CodeActionParams
     */
    provideCodeActions(sessionId, params) {
        const { textDocument, diagnostics } = params || {};
        if (!diagnostics || !Array.isArray(diagnostics)) return [];

        const actions = [];
        diagnostics.forEach(diag => {
            if (diag.code === 'EAORCS-SEC-001') {
                actions.push({
                    title: 'EAORCS: Replace hardcoded secret with process.env variable',
                    kind: 'quickfix',
                    diagnostics: [diag],
                    edit: {
                        changes: {
                            [textDocument.uri]: [
                                {
                                    range: diag.range,
                                    newText: 'const secret = process.env.SECURE_SECRET_KEY;'
                                }
                            ]
                        }
                    }
                });
            }
        });

        return actions;
    }

    /**
     * Returns full coverage stats across IDE Ecosystem Matrix.
     */
    getMatrixCapabilities() {
        return UniversalIdeMatrix.verifyEcosystemCoverage();
    }

    /**
     * Lists active IDE sessions.
     */
    getActiveSessions() {
        return Array.from(this.activeSessions.values());
    }

    /**
     * Ends an active IDE session.
     * @param {string} sessionId 
     */
    terminateSession(sessionId) {
        const session = this.activeSessions.get(sessionId);
        if (session) {
            session.status = 'TERMINATED';
            this.activeSessions.delete(sessionId);
            this.lspInstances.delete(sessionId);
            this._recordTelemetry('SESSION_TERMINATED', { sessionId });
            return true;
        }
        return false;
    }

    /**
     * Private helper to record telemetry events.
     * @private
     */
    _recordTelemetry(eventType, metadata = {}) {
        this.telemetryEvents.push({
            eventType,
            metadata,
            timestamp: new Date().toISOString()
        });
    }
}

module.exports = UniversalIdeFramework;
