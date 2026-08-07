#!/usr/bin/env node

/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Enterprise Command Center CLI Launcher
 * File           : eaorcs_ecc.js
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
 * CORP: Stream 2 — CLI Launchers & Execution Controls
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
 EAORCS 2026.3.1-LTS: ENTERPRISE COMMAND CENTER (ECC) LAUNCHER
 UAIGOS Enterprise Operations Console & Execution Control
==========================================================================
Usage:
  eaorcs_ecc [options]

Options:
  -p, --port <number>      Set server port (default: 8090)
  -w, --workspace <path>   Set target workspace directory (default: current working directory)
  --auto-execute           Auto-execute lifecycle and telemetry triggers on startup
  --no-open                Do not automatically launch browser on server start
  -h, --help               Display this help manual

Examples:
  eaorcs_ecc --port 8090
  eaorcs_ecc --workspace /path/to/project --auto-execute
==========================================================================
`);
}

function parseArgs(args = process.argv.slice(2)) {
    const options = {
        port: 8090,
        workspace: process.cwd(),
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
 EAORCS 2026.3.1-LTS: ENTERPRISE COMMAND CENTER (ECC) LAUNCHER
 UAIGOS Enterprise Operations Console & Execution Control
==========================================================================
Status:
  - Port            : ${options.port}
  - Workspace       : ${options.workspace}
  - Auto-Execute    : ${options.autoExecute ? 'ENABLED' : 'DISABLED'}
  - Auto-Open       : ${options.openBrowser ? 'ENABLED' : 'DISABLED'}
  - Command Center  : http://localhost:${options.port}
==========================================================================
Starting Enterprise Command Center server...
`);

    try {
        const serverControl = EAORCS.launchCommandCenter(options);
        
        process.on('SIGINT', () => {
            console.log('\n[ECC Launcher] Shutting down Enterprise Command Center server...');
            if (serverControl && serverControl.close) {
                serverControl.close().then(() => {
                    console.log('[ECC Launcher] Server closed gracefully.');
                    process.exit(0);
                });
            } else {
                process.exit(0);
            }
        });

        return serverControl;
    } catch (err) {
        console.error('[ECC Launcher] Failed to start Enterprise Command Center server:', err.message);
        return { exitCode: 1, error: err };
    }
}

if (require.main === module) {
    run(process.argv.slice(2));
}

module.exports = { run, parseArgs, printHelp };
