#!/usr/bin/env node

/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS DX CLI Launcher
 * File           : eaorcs_cli.js
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
const EAORCS = require('../../engine/EAORCS');
const BrowserTerminalServerEngine = require('../../engine/portal/BrowserTerminalServerEngine');

function printHelp() {
    console.log(`
==========================================================================
 EAORCS 2026.3.1-LTS: DX COMMERCIAL CLI LAUNCHER
 UAIGOS Developer Experience & Browser Terminal Engine
==========================================================================
Usage:
  eaorcs_cli [command] [options]

Commands:
  analyze                  Analyze project architecture and generate intelligence blueprints.
  audit                    Execute engineering health dashboard audit and compliance checks.
  build                    Generate or execute build artifacts and commercial packages.
  certify                  Verify execution determinism and ecosystem compliance standards.
  health                   Check operational health status and governance integrity.
  license                  Evaluate commercial license tier and feature entitlements.
  plan                     Generate deterministic execution plan for target workspace.
  release                  Inspect release readiness and delivery state.
  rollback                 Rollback engineering transactions.
  shell                    Launch interactive EAORCS browser terminal shell.

Options:
  -s, --shell              Launch interactive shell mode or browser terminal server
  -b, --build [target]     Specify build command execution or target package
  -t, --tier <tier>        Specify commercial license tier (FREE|COMMUNITY|COMMERCIAL|ENTERPRISE)
  -j, --json               Output response payload in JSON format
  -w, --workspace <path>   Set target workspace directory (default: current working directory)
  -h, --help               Display this help manual

Examples:
  eaorcs_cli analyze --tier ENTERPRISE --json
  eaorcs_cli build --build --tier COMMERCIAL
  eaorcs_cli shell --tier ENTERPRISE
==========================================================================
`);
}

function parseArgs(args = process.argv.slice(2)) {
    const options = {
        command: null,
        shell: false,
        build: false,
        buildTarget: null,
        tier: 'COMMERCIAL',
        json: false,
        help: false,
        workspace: process.cwd()
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg === '-s' || arg === '--shell') {
            options.shell = true;
        } else if (arg === '-b' || arg === '--build') {
            options.build = true;
            const nextVal = args[i + 1];
            if (nextVal && !nextVal.startsWith('-')) {
                options.buildTarget = nextVal;
                i++;
            }
        } else if (arg === '-t' || arg === '--tier') {
            const nextVal = args[i + 1];
            if (nextVal && !nextVal.startsWith('-')) {
                options.tier = nextVal.toUpperCase();
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

    return options;
}

function run(args = process.argv.slice(2)) {
    const options = parseArgs(args);

    if (options.help) {
        printHelp();
        return Promise.resolve({ exitCode: 0, help: true });
    }

    const command = options.command || (options.shell ? 'shell' : options.build ? 'build' : 'analyze');

    const licenseEval = EAORCS.evaluateCliLicense(command, options.tier, { workspace: options.workspace });
    const builtCmd = EAORCS.buildCliCommand({ ...options, command });

    if (!licenseEval.authorized) {
        const errPayload = {
            status: 'UNAUTHORIZED',
            exitCode: 1,
            command,
            tier: options.tier,
            error: licenseEval.message
        };
        if (options.json) {
            console.log(JSON.stringify(errPayload, null, 2));
        } else {
            console.error(`[EAORCS CLI ERROR] License Unauthorized: ${licenseEval.message}`);
        }
        return Promise.resolve(errPayload);
    }

    const engine = new BrowserTerminalServerEngine({ workspace: options.workspace });
    const execResult = engine.executeCliCommand(command, options);

    const outputPayload = {
        exitCode: 0,
        status: 'SUCCESS',
        command,
        tier: options.tier,
        buildTarget: options.buildTarget,
        licenseEvaluation: licenseEval,
        cliBuild: builtCmd,
        executionResult: execResult
    };

    if (options.json) {
        console.log(JSON.stringify(outputPayload, null, 2));
    } else {
        console.log(`==========================================================================`);
        console.log(` EAORCS 2026.3.1-LTS: DX CLI LAUNCHER`);
        console.log(`==========================================================================`);
        console.log(` Command            : ${command}`);
        console.log(` License Tier       : ${options.tier} (AUTHORIZED)`);
        console.log(` Workspace          : ${options.workspace}`);
        console.log(` Shell Mode         : ${options.shell ? 'ACTIVE' : 'INACTIVE'}`);
        console.log(` Build Execution    : ${options.build ? 'ENABLED' : 'DISABLED'}`);
        console.log(` CLI Command String : ${builtCmd.commandString}`);
        console.log(` Status             : SUCCESS`);
        console.log(`==========================================================================`);
    }

    return Promise.resolve(outputPayload);
}

if (require.main === module) {
    run(process.argv.slice(2)).catch(err => {
        console.error('[EAORCS CLI FATAL ERROR]', err.message);
        process.exit(1);
    });
}

module.exports = { run, parseArgs, printHelp };
