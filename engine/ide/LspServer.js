/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Developer Experience & IDE Integration
 * File           : LspServer.js
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
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

const readline = require('readline');

/**
 * LspServer
 * Language Server Protocol (LSP 3.17) server for real-time IDE compliance,
 * policy diagnostics, and governance inline warnings across VS Code, Cursor, & JetBrains.
 */
class LspServer {
    constructor(options = {}) {
        this.input = options.input || process.stdin;
        this.output = options.output || process.stdout;
        this.documents = new Map();
        this.isInitialized = false;
    }

    /**
     * Start the LSP server loop reading JSON-RPC messages from stdio
     */
    start() {
        let buffer = '';

        this.input.on('data', chunk => {
            buffer += chunk.toString('utf8');

            while (true) {
                const headerMatch = buffer.match(/Content-Length:\s*(\d+)\r\n\r\n/i);
                if (!headerMatch) break;

                const contentLength = parseInt(headerMatch[1], 10);
                const headerLength = headerMatch[0].length;

                if (buffer.length < headerLength + contentLength) break;

                const payload = buffer.slice(headerLength, headerLength + contentLength);
                buffer = buffer.slice(headerLength + contentLength);

                try {
                    const message = JSON.parse(payload);
                    this.handleMessage(message);
                } catch (err) {
                    this.logError(`JSON-RPC Parsing Error: ${err.message}`);
                }
            }
        });
    }

    /**
     * Handles incoming LSP JSON-RPC message
     * @param {Object} message
     */
    handleMessage(message) {
        if (!message) return;

        const { id, method, params } = message;

        switch (method) {
            case 'initialize':
                this.isInitialized = true;
                this.sendResponse(id, {
                    capabilities: {
                        textDocumentSync: 1, // Full document sync
                        diagnosticProvider: {
                            interFileDependencies: false,
                            workspaceDiagnostics: false
                        },
                        completionProvider: {
                            resolveProvider: false,
                            triggerCharacters: ['.', ':']
                        }
                    },
                    serverInfo: {
                        name: 'EAORCS Language Server',
                        version: '2026.1.0'
                    }
                });
                break;

            case 'initialized':
                // Client confirmed initialization
                break;

            case 'textDocument/didOpen':
                if (params && params.textDocument) {
                    this.documents.set(params.textDocument.uri, params.textDocument.text);
                    this.validateDocument(params.textDocument.uri, params.textDocument.text);
                }
                break;

            case 'textDocument/didChange':
                if (params && params.textDocument && params.contentChanges) {
                    const newText = params.contentChanges[params.contentChanges.length - 1].text;
                    this.documents.set(params.textDocument.uri, newText);
                    this.validateDocument(params.textDocument.uri, newText);
                }
                break;

            case 'textDocument/didSave':
                if (params && params.textDocument) {
                    const docText = this.documents.get(params.textDocument.uri) || '';
                    this.validateDocument(params.textDocument.uri, docText);
                }
                break;

            case 'shutdown':
                this.sendResponse(id, null);
                break;

            case 'exit':
                process.exit(0);
                break;

            default:
                if (id !== undefined) {
                    this.sendResponse(id, null); // Method not found fallback
                }
                break;
        }
    }

    /**
     * Performs real-time compliance & policy diagnostic analysis on document text
     * @param {string} uri - Text document URI
     * @param {string} text - Full text content of document
     */
    validateDocument(uri, text) {
        const diagnostics = [];
        const lines = text.split(/\r?\n/);

        lines.forEach((line, index) => {
            // Check 1: Hardcoded Secret Detection
            if (/api[_-]?key|secret|password|private[_-]?key\s*=\s*['"][A-Za-z0-9+/=]{8,}['"]/i.test(line)) {
                diagnostics.push({
                    range: {
                        start: { line: index, character: 0 },
                        end: { line: index, character: line.length }
                    },
                    severity: 1, // Error
                    code: 'EAORCS-SEC-001',
                    source: 'EAORCS Security Engine',
                    message: 'EAORCS Governance Violation: Potential hardcoded credential or secret detected. Use secure Vault or environment variables.'
                });
            }

            // Check 2: Unhandled Promise / Async Error Suppression
            if (/\.catch\(\s*\(\)\s*=>\s*\{\}\s*\)/.test(line) || /catch\s*\([^\)]*\)\s*\{\s*\}/.test(line)) {
                diagnostics.push({
                    range: {
                        start: { line: index, character: 0 },
                        end: { line: index, character: line.length }
                    },
                    severity: 2, // Warning
                    code: 'EAORCS-QUAL-002',
                    source: 'EAORCS Quality Engine',
                    message: 'EAORCS Assurance Warning: Empty exception handler detected. Exceptions must be logged or propagated.'
                });
            }

            // Check 3: UAIGOS Compliance Header Check
            if (index === 0 && !line.includes('Universal Autonomous AI Governance') && !line.includes('Project')) {
                diagnostics.push({
                    range: {
                        start: { line: 0, character: 0 },
                        end: { line: 0, character: line.length }
                    },
                    severity: 3, // Information
                    code: 'EAORCS-GOV-003',
                    source: 'EAORCS Governance Standard',
                    message: 'EAORCS Governance Tip: File missing enterprise header standard.'
                });
            }
        });

        // Publish diagnostics to IDE client
        this.sendNotification('textDocument/publishDiagnostics', {
            uri,
            diagnostics
        });
    }

    /**
     * Send JSON-RPC response to stdout
     */
    sendResponse(id, result) {
        const payload = JSON.stringify({
            jsonrpc: '2.0',
            id,
            result
        });
        this.writePayload(payload);
    }

    /**
     * Send JSON-RPC notification to stdout
     */
    sendNotification(method, params) {
        const payload = JSON.stringify({
            jsonrpc: '2.0',
            method,
            params
        });
        this.writePayload(payload);
    }

    /**
     * Format and write Content-Length HTTP-style header payload to stream
     */
    writePayload(payload) {
        const length = Buffer.byteLength(payload, 'utf8');
        const header = `Content-Length: ${length}\r\n\r\n`;
        this.output.write(header + payload);
    }

    logError(msg) {
        this.sendNotification('window/logMessage', {
            type: 1, // Error
            message: msg
        });
    }
}

if (require.main === module) {
    const lsp = new LspServer();
    lsp.start();
}

module.exports = LspServer;
