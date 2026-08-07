#!/usr/bin/env node

/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS EEOS CLI Launcher
 * File           : eaorcs_eeos.js
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
 * CORP: Subsystem 2 — EEOS CLI Launchers & Public Facade
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
const EAORCS = require('../../engine/EAORCS');

function printHelp() {
    console.log(`
==========================================================================
 EAORCS 2026.3.1-LTS: ENTERPRISE ENGINEERING OPERATING SYSTEM (EEOS)
 UAIGOS EEOS Command Console & Autonomous Live Status Engine
==========================================================================
Usage:
  eaorcs_eeos [options]

Options:
  -p, --port <number>      Set HTTP server port (default: 8090)
  -w, --workspace <path>   Set target workspace directory (default: current working directory)
  -r, --role <role>        Set execution governance role (default: ENTERPRISE_ARCHITECT)
  --auto-execute           Auto-execute lifecycle and telemetry verification on startup
  --no-open                Do not automatically open browser on startup
  -h, --help               Display this help manual

Examples:
  eaorcs_eeos --port 8090
  eaorcs_eeos --workspace /path/to/project --role LEAD_ENGINEER --auto-execute
==========================================================================
`);
}

function parseArgs(args = process.argv.slice(2)) {
    const options = {
        port: 8090,
        workspace: process.cwd(),
        role: 'ENTERPRISE_ARCHITECT',
        autoExecute: false,
        openBrowser: true,
        help: false
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '-p' || arg === '--port') {
            const nextVal = args[i + 1];
            if (nextVal && !nextVal.startsWith('-')) {
                options.port = parseInt(nextVal, 10) || 8090;
                i++;
            }
        } else if (arg === '-w' || arg === '--workspace') {
            const nextVal = args[i + 1];
            if (nextVal && !nextVal.startsWith('-')) {
                options.workspace = path.resolve(nextVal);
                i++;
            }
        } else if (arg === '-r' || arg === '--role') {
            const nextVal = args[i + 1];
            if (nextVal && !nextVal.startsWith('-')) {
                options.role = nextVal;
                i++;
            }
        } else if (arg === '--auto-execute') {
            options.autoExecute = true;
        } else if (arg === '--no-open') {
            options.openBrowser = false;
        } else if (arg === '-h' || arg === '--help') {
            options.help = true;
        }
    }

    return options;
}

function run(args = process.argv.slice(2)) {
    const options = parseArgs(args);

    if (options.help) {
        printHelp();
        return Promise.resolve({ exitCode: 0 });
    }

    console.log(`
==========================================================================
 EAORCS 2026.3.1-LTS: ENTERPRISE ENGINEERING OPERATING SYSTEM (EEOS)
 UAIGOS EEOS Command Console & Autonomous Live Status Engine
==========================================================================
Status:
  - Port            : ${options.port}
  - Workspace       : ${options.workspace}
  - Active Role     : ${options.role}
  - Auto-Execute    : ${options.autoExecute ? 'ENABLED' : 'DISABLED'}
  - Auto-Open       : ${options.openBrowser ? 'ENABLED' : 'DISABLED'}
  - System URL      : http://localhost:${options.port}
==========================================================================
Starting Enterprise Engineering Operating System HTTP server...
`);

    try {
        const serverControl = EAORCS.launchEEOS(options);
        
        process.on('SIGINT', () => {
            console.log('\n[EEOS Launcher] Shutting down EEOS HTTP server...');
            if (serverControl && serverControl.close) {
                serverControl.close().then(() => {
                    console.log('[EEOS Launcher] Server closed gracefully.');
                    process.exit(0);
                });
            } else {
                process.exit(0);
            }
        });

        return serverControl;
    } catch (err) {
        console.error('[EEOS Launcher] Failed to start EEOS HTTP server:', err.message);
        return { exitCode: 1, error: err };
    }
}

if (require.main === module) {
    run(process.argv.slice(2));
}

module.exports = { run, parseArgs, printHelp };
