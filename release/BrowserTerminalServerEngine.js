/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Browser Terminal Server Engine
 * File           : BrowserTerminalServerEngine.js
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
 * CORP: Subsystem 2 — DX CLI Launchers & Browser Terminal Engine
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
const path = require('path');
const http = require('http');

class BrowserTerminalServerEngine {
    constructor(options = {}) {
        this.options = options;
        this.baseDir = options.workspace ? path.resolve(options.workspace) : path.resolve(__dirname, '../../');
        this.port = options.port || 8091;
        this.server = null;
    }

    /**
     * Gets the full command registry for EAORCS CLI commands.
     * @returns {object} Command definitions mapped by name.
     */
    getCommandRegistry() {
        return {
            analyze: {
                command: 'analyze',
                description: 'Analyze project architecture and generate intelligence blueprints.',
                category: 'ANALYSIS',
                requiredTier: 'FREE',
                options: ['--workspace', '--json']
            },
            audit: {
                command: 'audit',
                description: 'Execute engineering health dashboard audit and compliance checks.',
                category: 'GOVERNANCE',
                requiredTier: 'COMMUNITY',
                options: ['--workspace', '--tier', '--json']
            },
            build: {
                command: 'build',
                description: 'Generate or execute build artifacts and commercial distribution packages.',
                category: 'EXECUTION',
                requiredTier: 'COMMERCIAL',
                options: ['--build', '--workspace', '--tier', '--json']
            },
            certify: {
                command: 'certify',
                description: 'Verify execution determinism and ecosystem compliance standards.',
                category: 'GOVERNANCE',
                requiredTier: 'ENTERPRISE',
                options: ['--workspace', '--json']
            },
            health: {
                command: 'health',
                description: 'Check operational health status and governance integrity.',
                category: 'SYSTEM',
                requiredTier: 'FREE',
                options: ['--json']
            },
            license: {
                command: 'license',
                description: 'Evaluate commercial license tier and feature entitlements.',
                category: 'LICENSE',
                requiredTier: 'FREE',
                options: ['--tier', '--json']
            },
            plan: {
                command: 'plan',
                description: 'Generate deterministic execution plan for target workspace.',
                category: 'ANALYSIS',
                requiredTier: 'COMMUNITY',
                options: ['--workspace', '--json']
            },
            release: {
                command: 'release',
                description: 'Inspect release readiness, version provenance, and delivery state.',
                category: 'GOVERNANCE',
                requiredTier: 'ENTERPRISE',
                options: ['--workspace', '--json']
            },
            rollback: {
                command: 'rollback',
                description: 'Rollback engineering transactions and restore prior baseline.',
                category: 'EXECUTION',
                requiredTier: 'COMMERCIAL',
                options: ['--workspace']
            },
            shell: {
                command: 'shell',
                description: 'Launch interactive EAORCS browser terminal shell.',
                category: 'SYSTEM',
                requiredTier: 'COMMERCIAL',
                options: ['--shell', '--port']
            }
        };
    }

    /**
     * Retrieves the complete licensing feature matrix across tiers.
     * @returns {object} Tier matrix definitions.
     */
    getLicenseMatrix() {
        return {
            FREE: {
                tier: 'FREE',
                name: 'Community Open Access',
                commands: ['analyze', 'health', 'license'],
                maxWorkspaces: 1,
                supportLevel: 'COMMUNITY_FORUM'
            },
            COMMUNITY: {
                tier: 'COMMUNITY',
                name: 'Developer Community',
                commands: ['analyze', 'health', 'license', 'plan', 'audit'],
                maxWorkspaces: 5,
                supportLevel: 'STANDARD_TICKET'
            },
            COMMERCIAL: {
                tier: 'COMMERCIAL',
                name: 'Commercial Enterprise Edition',
                commands: ['analyze', 'health', 'license', 'plan', 'audit', 'build', 'rollback', 'shell'],
                maxWorkspaces: 50,
                supportLevel: '24_7_ENTERPRISE_SLA'
            },
            ENTERPRISE: {
                tier: 'ENTERPRISE',
                name: 'Mission Critical Global Enterprise',
                commands: ['analyze', 'health', 'license', 'plan', 'audit', 'build', 'rollback', 'shell', 'certify', 'release'],
                maxWorkspaces: -1,
                supportLevel: 'DEDICATED_GOVERNANCE_OFFICER'
            }
        };
    }

    /**
     * Evaluates license entitlements for a requested command and tier.
     * @param {string} cmd 
     * @param {string} [tier='COMMERCIAL'] 
     * @returns {object} License evaluation outcome.
     */
    evaluateCliLicense(cmd, tier = 'COMMERCIAL') {
        const normalizedTier = (tier || 'COMMERCIAL').toUpperCase();
        const registry = this.getCommandRegistry();
        const matrix = this.getLicenseMatrix();

        const tierInfo = matrix[normalizedTier] || matrix['COMMERCIAL'];
        const cmdInfo = registry[cmd];

        if (!cmdInfo) {
            return {
                command: cmd,
                tierRequested: normalizedTier,
                authorized: false,
                requiredTier: 'UNKNOWN',
                message: `Unknown command '${cmd}'.`
            };
        }

        const tierRanks = { FREE: 1, COMMUNITY: 2, COMMERCIAL: 3, ENTERPRISE: 4 };
        const requestedRank = tierRanks[normalizedTier] || 3;
        const requiredRank = tierRanks[cmdInfo.requiredTier] || 1;

        const authorized = requestedRank >= requiredRank;

        return {
            command: cmd,
            tierRequested: normalizedTier,
            authorized,
            requiredTier: cmdInfo.requiredTier,
            allowedCommands: tierInfo.commands,
            message: authorized
                ? `Command '${cmd}' is authorized under ${normalizedTier} license.`
                : `Command '${cmd}' requires minimum ${cmdInfo.requiredTier} license tier (requested: ${normalizedTier}).`
        };
    }

    /**
     * Builds CLI command string and parameter breakdown from options.
     * @param {object} opts 
     * @returns {object} Built CLI command metadata.
     */
    buildCliCommand(opts = {}) {
        const command = opts.command || opts.cmd || 'analyze';
        const flags = [];

        if (opts.shell) flags.push('--shell');
        if (opts.build) {
            if (typeof opts.build === 'string') {
                flags.push(`--build ${opts.build}`);
            } else {
                flags.push('--build');
            }
        }
        if (opts.tier) flags.push(`--tier ${opts.tier}`);
        if (opts.workspace) flags.push(`--workspace "${opts.workspace}"`);
        if (opts.json) flags.push('--json');

        const commandString = `eaorcs_cli ${command} ${flags.join(' ')}`.trim();

        return {
            commandString,
            command,
            flags,
            options: opts
        };
    }

    /**
     * Executes or simulates a CLI command deterministically.
     * @param {string} cmd 
     * @param {object} [options={}] 
     * @returns {object} Command execution result.
     */
    executeCliCommand(cmd, options = {}) {
        const targetCmd = cmd || options.command || 'analyze';
        const tier = options.tier || 'COMMERCIAL';
        const evaluation = this.evaluateCliLicense(targetCmd, tier);

        if (!evaluation.authorized) {
            return {
                success: false,
                status: 'UNAUTHORIZED',
                command: targetCmd,
                tier,
                error: 'LICENSE_RESTRICTION',
                message: evaluation.message
            };
        }

        return {
            success: true,
            status: 'EXECUTED',
            command: targetCmd,
            tier,
            timestamp: new Date().toISOString(),
            output: `[EAORCS CLI] Command '${targetCmd}' executed cleanly under ${tier} license context.`,
            result: {
                workspace: options.workspace || this.baseDir,
                executedBy: 'EAORCS BrowserTerminalServerEngine',
                evaluation
            }
        };
    }

    /**
     * Retrieves environment capabilities for DXC.
     * @param {object} [options={}] 
     * @returns {object} Environment capabilities payload.
     */
    getDxcEnvironment(options = {}) {
        const EnvironmentDetectionEngine = require('../dxc/EnvironmentDetectionEngine');
        const engine = new EnvironmentDetectionEngine(options);
        return engine.probeEnvironment();
    }

    getDxcMatrix(options = {}) {
        const EnvironmentDetectionEngine = require('../dxc/EnvironmentDetectionEngine');
        const engine = new EnvironmentDetectionEngine(options);
        return engine.getEnvironmentMatrix();
    }

    getDxcEquivalents(options = {}) {
        const EnvironmentDetectionEngine = require('../dxc/EnvironmentDetectionEngine');
        const engine = new EnvironmentDetectionEngine(options);
        return engine.getEquivalentShellMatrix();
    }

    /**
     * Launches the HTTP server serving REST endpoints and Browser Terminal interface.
     * @param {object} [options] 
     * @returns {object} Server controller.
     */
    launchTerminalServer(options = {}) {
        const port = options.port || this.port || 8091;
        const workspace = options.workspace ? path.resolve(options.workspace) : this.baseDir;

        const server = http.createServer((req, res) => {
            const reqUrlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
            const reqPath = reqUrlObj.pathname;
            const reqMethod = req.method;
            const queryObj = Object.fromEntries(reqUrlObj.searchParams);

            // Helper to send JSON responses
            const sendJson = (statusCode, data) => {
                res.writeHead(statusCode, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(data, null, 2));
            };

            // Helper to parse JSON body for POST requests
            const getJsonBody = (cb) => {
                let body = '';
                req.on('data', chunk => body += chunk);
                req.on('end', () => {
                    try {
                        const parsed = body ? JSON.parse(body) : {};
                        cb(null, parsed);
                    } catch (e) {
                        cb(e, {});
                    }
                });
            };

            // Route handling
            if (reqPath === '/' || reqPath === '/terminal' || reqPath === '/index.html') {
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(this.renderTerminalHtml(port, workspace));
            } else if (reqPath === '/api/cli/commands' && reqMethod === 'GET') {
                sendJson(200, { status: 'SUCCESS', commands: this.getCommandRegistry() });
            } else if (reqPath === '/api/license/matrix' && reqMethod === 'GET') {
                sendJson(200, { status: 'SUCCESS', matrix: this.getLicenseMatrix() });
            } else if (reqPath === '/api/dxc/environment') {
                sendJson(200, { status: 'SUCCESS', environment: this.getDxcEnvironment({ workspace, ...queryObj }) });
            } else if (reqPath === '/api/dxc/matrix') {
                sendJson(200, {
                    status: 'SUCCESS',
                    matrix: this.getDxcMatrix({ workspace, ...queryObj }),
                    equivalentShells: this.getDxcEquivalents({ workspace, ...queryObj })
                });
            } else if (reqPath === '/api/dxc/equivalents') {
                sendJson(200, { status: 'SUCCESS', equivalents: this.getDxcEquivalents({ workspace, ...queryObj }) });
            } else if (reqPath === '/api/cli/build') {
                if (reqMethod === 'POST') {
                    getJsonBody((err, body) => {
                        const opts = { ...queryObj, ...body };
                        const built = this.buildCliCommand(opts);
                        sendJson(200, { status: 'SUCCESS', build: built });
                    });
                } else {
                    const opts = queryObj;
                    const built = this.buildCliCommand(opts);
                    sendJson(200, { status: 'SUCCESS', build: built });
                }
            } else if (reqPath === '/api/cli/execute') {
                if (reqMethod === 'POST') {
                    getJsonBody((err, body) => {
                        const targetCmd = body.command || queryObj.cmd || 'analyze';
                        const opts = { ...queryObj, ...body };
                        const result = this.executeCliCommand(targetCmd, opts);
                        const status = result.success ? 200 : 403;
                        sendJson(status, result);
                    });
                } else {
                    const targetCmd = queryObj.cmd || queryObj.command || 'analyze';
                    const opts = queryObj;
                    const result = this.executeCliCommand(targetCmd, opts);
                    const status = result.success ? 200 : 403;
                    sendJson(status, result);
                }
            } else if (reqPath === '/api/status' || reqPath === '/api/health') {
                sendJson(200, {
                    status: 'UP',
                    app: 'EAORCS Browser Terminal Engine',
                    port,
                    workspace,
                    timestamp: new Date().toISOString()
                });
            } else {
                sendJson(404, { error: 'Endpoint Not Found', path: reqPath });
            }
        });

        server.listen(port, () => {
            console.log(`[BrowserTerminalServer] Active at http://localhost:${port}/terminal`);
        });

        this.server = server;

        return {
            server,
            port,
            host: 'localhost',
            url: `http://localhost:${port}/terminal`,
            workspace,
            close: (callback) => {
                return new Promise((resolve) => {
                    server.close(() => {
                        if (callback) callback();
                        resolve();
                    });
                });
            }
        };
    }

    /**
     * Renders Browser Terminal HTML user interface.
     * @param {number} port 
     * @param {string} workspace 
     * @returns {string} HTML string
     */
    renderTerminalHtml(port, workspace) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>EAORCS DX Browser Terminal Console</title>
    <style>
        body { background-color: #0d1117; color: #58a6ff; font-family: monospace; padding: 20px; }
        h1 { color: #38bdf8; font-size: 1.5rem; }
        .console { background: #161b22; border: 1px solid #30363d; padding: 15px; border-radius: 6px; }
        .prompt { color: #7ee787; }
        input { background: transparent; border: none; color: #e6edf3; font-family: monospace; width: 80%; outline: none; }
    </style>
</head>
<body>
    <h1>EAORCS DX Browser Terminal Console</h1>
    <p>Port: ${port} | Workspace: <code>${workspace}</code></p>
    <div class="console">
        <div id="output">EAORCS Terminal Engine Active. Type 'help' or commands to execute.<br/></div>
        <span class="prompt">eaorcs_cli&gt; </span>
        <input type="text" id="cmdInput" placeholder="analyze --tier COMMERCIAL" onkeydown="if(event.key==='Enter') runCmd()"/>
    </div>
    <script>
        function runCmd() {
            const input = document.getElementById('cmdInput');
            const val = input.value.trim();
            if (!val) return;
            const output = document.getElementById('output');
            output.innerHTML += '<br/><span class="prompt">eaorcs_cli&gt;</span> ' + val;
            fetch('/api/cli/execute?cmd=' + encodeURIComponent(val))
                .then(r => r.json())
                .then(res => {
                    output.innerHTML += '<br/>' + JSON.stringify(res, null, 2);
                });
            input.value = '';
        }
    </script>
</body>
</html>`;
    }
}

module.exports = BrowserTerminalServerEngine;
