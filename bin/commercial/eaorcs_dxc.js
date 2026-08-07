#!/usr/bin/env node

/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS DXC Commercial Launcher
 * File           : eaorcs_dxc.js
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
 * CORP: Subsystem 4 — DXC Master Certification & Packaging
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
const EnvironmentDetectionEngine = require('../../engine/dxc/EnvironmentDetectionEngine');
const DxcCapabilityEngine = require('../../engine/dxc/DxcCapabilityEngine');
const BrowserTerminalServerEngine = require('../../engine/portal/BrowserTerminalServerEngine');

function printHelp() {
    console.log(`
==========================================================================
 EAORCS 2026.3.1-LTS: DXC ENVIRONMENT & LAUNCHER
 UAIGOS Developer Experience & Environment Matrix Launcher
==========================================================================
Usage:
  eaorcs_dxc [command] [options]

Commands:
  probe                    Probe host operating system and shell environment.
  matrix                   Display environment and equivalent shell matrix.
  server                   Launch browser terminal server with DXC endpoints.

Options:
  -m, --matrix             Display environment readiness matrix
  -p, --port <port>        Set server port (default: 8091)
  -j, --json               Output response payload in JSON format
  -w, --workspace <path>   Set target workspace directory
  -h, --help               Display this help manual
==========================================================================
`);
}

function parseArgs(args = process.argv.slice(2)) {
    const options = {
        command: null,
        matrix: false,
        port: 8091,
        json: false,
        help: false,
        workspace: process.cwd()
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '-m' || arg === '--matrix') {
            options.matrix = true;
            if (!options.command) options.command = 'matrix';
        } else if (arg === '-p' || arg === '--port') {
            const nextVal = args[i + 1];
            if (nextVal && !nextVal.startsWith('-')) {
                options.port = parseInt(nextVal, 10);
                i++;
            }
        } else if (arg === '-j' || arg === '--json') {
            options.json = true;
        } else if (arg === '-w' || arg === '--workspace') {
            const nextVal = args[i + 1];
            if (nextVal && !nextVal.startsWith('-')) {
                options.workspace = path.resolve(nextVal);
                i++;
            }
        } else if (arg === '-h' || arg === '--help') {
            options.help = true;
        } else if (!arg.startsWith('-') && !options.command) {
            options.command = arg;
        }
    }

    if (!options.command) options.command = 'probe';

    return options;
}

function run(args = process.argv.slice(2)) {
    const options = parseArgs(args);

    if (options.help) {
        printHelp();
        return Promise.resolve({ exitCode: 0, help: true });
    }

    const cmd = options.command || 'probe';
    const envEngine = new EnvironmentDetectionEngine({ workspace: options.workspace });
    const dxcEngine = new DxcCapabilityEngine({ workspace: options.workspace });

    if (cmd === 'probe') {
        const result = envEngine.probeEnvironment();
        const capEnv = dxcEngine.detectEnvironment(options);
        if (options.json) {
            console.log(JSON.stringify({ status: 'SUCCESS', environment: result, capability: capEnv }, null, 2));
        } else {
            console.log(`==========================================================================`);
            console.log(` EAORCS 2026.3.1-LTS: DXC ENVIRONMENT PROBE`);
            console.log(`==========================================================================`);
            console.log(` OS Platform        : ${result.platform} (${result.osName})`);
            console.log(` OS Release         : ${result.release}`);
            console.log(` CPU Architecture   : ${result.arch}`);
            console.log(` Node.js Version    : ${result.nodeVersion}`);
            console.log(` Available Shells   : ${result.availableShells.join(', ')}`);
            console.log(` Recommended Tab    : ${result.recommendedTab}`);
            console.log(`==========================================================================`);
        }
        return Promise.resolve({ exitCode: 0, status: 'SUCCESS', result, environment: result });
    } else if (cmd === 'matrix') {
        const matrix = envEngine.getEnvironmentMatrix();
        const equivalentShells = envEngine.getEquivalentShellMatrix();
        const readinessMatrix = dxcEngine.getReadinessMatrix(options);
        if (options.json) {
            console.log(JSON.stringify({ status: 'SUCCESS', matrix, equivalentShells, readinessMatrix }, null, 2));
        } else {
            console.log(`==========================================================================`);
            console.log(` EAORCS 2026.3.1-LTS: DXC ENVIRONMENT MATRIX`);
            console.log(`==========================================================================`);
            console.log(` Target OS Platforms: ${Object.keys(matrix).join(', ')}`);
            console.log(` Equivalent Actions : ${Object.keys(equivalentShells).join(', ')}`);
            console.log(`==========================================================================`);
        }
        return Promise.resolve({ exitCode: 0, status: 'SUCCESS', matrix, equivalentShells, readinessMatrix });
    } else if (cmd === 'server') {
        const serverEngine = new BrowserTerminalServerEngine({ workspace: options.workspace, port: options.port });
        const serverHandle = serverEngine.launchTerminalServer({ port: options.port });
        if (!options.json) {
            console.log(`DXC Server launched at ${serverHandle.url}`);
        }
        return Promise.resolve({ exitCode: 0, status: 'SUCCESS', server: serverHandle });
    } else {
        const errPayload = { exitCode: 1, status: 'ERROR', message: `Unknown command '${cmd}'` };
        console.error(errPayload.message);
        return Promise.resolve(errPayload);
    }
}

function main() {
    return run(process.argv.slice(2)).then(res => {
        if (res.exitCode !== 0) process.exit(res.exitCode);
    });
}

if (require.main === module) {
    main().catch(err => {
        console.error('[EAORCS DXC FATAL ERROR]', err.message);
        process.exit(1);
    });
}

module.exports = { run, parseArgs, printHelp, main };
