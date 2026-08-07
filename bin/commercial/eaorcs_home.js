#!/usr/bin/env node

/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Commercial Home CLI Launcher
 * File           : eaorcs_home.js
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
 * CORP: Subsystem 2 — Home CLI Launchers & Facade Integration
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
 EAORCS 2026.3.1-LTS: COMMERCIAL HOME APPLICATION LAUNCHER
 UAIGOS Commercial Operations & Portal Control Console
==========================================================================
Usage:
  eaorcs_home [options]

Options:
  -p, --port <number>      Set server port (default: 8090)
  -w, --workspace <path>   Set target workspace directory (default: current working directory)
  --no-open                Do not automatically launch browser on server start
  -h, --help               Display this help manual

Examples:
  eaorcs_home --port 8090
  eaorcs_home --workspace /path/to/project --no-open
==========================================================================
`);
}

function parseArgs(args = process.argv.slice(2)) {
    const options = {
        port: 8090,
        workspace: process.cwd(),
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
 EAORCS 2026.3.1-LTS: COMMERCIAL HOME APPLICATION LAUNCHER
 UAIGOS Commercial Operations & Portal Control Console
==========================================================================
Status:
  - Port            : ${options.port}
  - Workspace       : ${options.workspace}
  - Auto-Open       : ${options.openBrowser ? 'ENABLED' : 'DISABLED'}
  - Home URL        : http://localhost:${options.port}/home
==========================================================================
Starting Commercial Home Application HTTP server...
`);

    try {
        const serverControl = EAORCS.launchHome(options);
        
        process.on('SIGINT', () => {
            console.log('\n[Home Launcher] Shutting down Home Application HTTP server...');
            if (serverControl && serverControl.close) {
                serverControl.close().then(() => {
                    console.log('[Home Launcher] Server closed gracefully.');
                    process.exit(0);
                });
            } else {
                process.exit(0);
            }
        });

        return serverControl;
    } catch (err) {
        console.error('[Home Launcher] Failed to start Home Application HTTP server:', err.message);
        return { exitCode: 1, error: err };
    }
}

if (require.main === module) {
    run(process.argv.slice(2));
}

module.exports = { run, parseArgs, printHelp };
