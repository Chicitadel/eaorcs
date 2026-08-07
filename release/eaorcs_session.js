#!/usr/bin/env node

/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Dual-Mode Session Launcher
 * File           : eaorcs_session.js
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
 * CORP: Subsystem 2 — Session CLI Launchers & REST API Endpoints
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
const DualModeSessionEngine = require('../../engine/session/DualModeSessionEngine');

function printHelp() {
    console.log(`
==========================================================================
 EAORCS 2026.3.1-LTS: DUAL-MODE SESSION COMMERCIAL CLI LAUNCHER
 UAIGOS Offline Session Probing, HMAC-SHA256 Token Validation & Trust Matrix
==========================================================================
Usage:
  eaorcs_session [command] [options]

Commands:
  status                   Probe offline session status and display active session details.
  login                    Authenticate session and issue cryptographic offline token.
  validate                 Validate cryptographic offline token or cached session.
  offline-token            Retrieve or generate active offline token.
  trust                    Evaluate trust provenance score and verification checks.

Options:
  --status                 Probe offline session status (default action)
  --login                  Authenticate session with tier & user credentials
  --validate               Validate offline token
  --offline-token, --token Retrieve or validate offline token
  --trust                  Evaluate trust provenance for workspace/provenance
  -t, --tier <tier>        Specify session tier (FREE|COMMUNITY|COMMERCIAL|ENTERPRISE|SOVEREIGN)
  -u, --user <user>        Specify user identity for authentication
  -o, --org <org>          Specify organization ID
  --provenance <prov>      Specify provenance string or directory path
  -j, --json               Output response payload in JSON format
  -w, --workspace <path>   Set target workspace directory (default: current working directory)
  -h, --help               Display this help manual

Examples:
  eaorcs_session --status --json
  eaorcs_session --login --tier ENTERPRISE --user operator1
  eaorcs_session --validate --token EAORCS-SESS.eyJ...
  eaorcs_session --trust --provenance "Project Local"
==========================================================================
`);
}

function parseArgs(args = process.argv.slice(2)) {
    const options = {
        action: null,
        command: null,
        tier: 'COMMERCIAL',
        user: 'governance-operator',
        org: 'org_default',
        provenance: 'Project Local',
        token: null,
        json: false,
        help: false,
        workspace: process.cwd()
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg === '--status' || arg === 'status') {
            options.action = 'status';
        } else if (arg === '--login' || arg === 'login' || arg === 'authenticate') {
            options.action = 'login';
        } else if (arg === '--validate' || arg === 'validate') {
            options.action = 'validate';
        } else if (arg === '--offline-token' || arg === 'offline-token') {
            options.action = 'offline-token';
            const nextVal = args[i + 1];
            if (nextVal && !nextVal.startsWith('-')) {
                options.token = nextVal;
                i++;
            }
        } else if (arg === '--trust' || arg === 'trust') {
            options.action = 'trust';
        } else if (arg === '--token') {
            const nextVal = args[i + 1];
            if (nextVal && !nextVal.startsWith('-')) {
                options.token = nextVal;
                i++;
            }
        } else if (arg === '-t' || arg === '--tier') {
            const nextVal = args[i + 1];
            if (nextVal && !nextVal.startsWith('-')) {
                options.tier = nextVal;
                i++;
            }
        } else if (arg === '-u' || arg === '--user') {
            const nextVal = args[i + 1];
            if (nextVal && !nextVal.startsWith('-')) {
                options.user = nextVal;
                i++;
            }
        } else if (arg === '-o' || arg === '--org') {
            const nextVal = args[i + 1];
            if (nextVal && !nextVal.startsWith('-')) {
                options.org = nextVal;
                i++;
            }
        } else if (arg === '--provenance') {
            const nextVal = args[i + 1];
            if (nextVal && !nextVal.startsWith('-')) {
                options.provenance = nextVal;
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
        } else if (!arg.startsWith('-') && !options.action) {
            options.action = arg;
        }
    }

    if (!options.action) {
        options.action = 'status';
    }
    options.command = options.action === 'login' ? (args.includes('authenticate') ? 'authenticate' : 'login') : options.action;

    return options;
}

function run(args = process.argv.slice(2)) {
    const options = parseArgs(args);

    if (options.help) {
        printHelp();
        return Promise.resolve({ exitCode: 0, help: true });
    }

    const sessionEngine = new DualModeSessionEngine({ workspace: options.workspace });
    let result = null;

    switch (options.action) {
        case 'login': {
            result = sessionEngine.authenticateSession({
                user: options.user,
                tier: options.tier,
                org: options.org,
                provenance: options.provenance
            });
            break;
        }
        case 'validate': {
            const tokenToValidate = options.token || (sessionEngine.deserializeSessionCache()?.session?.token);
            if (!tokenToValidate) {
                result = {
                    valid: false,
                    reason: 'NO_TOKEN_PROVIDED',
                    message: 'No token supplied via --token or found in offline session cache.'
                };
            } else {
                result = sessionEngine.verifySessionToken(tokenToValidate);
                result.token = tokenToValidate;
            }
            break;
        }
        case 'offline-token': {
            const cached = sessionEngine.deserializeSessionCache();
            if (options.token) {
                result = sessionEngine.verifySessionToken(options.token);
                result.token = options.token;
            } else if (cached && cached.session && cached.session.token) {
                result = {
                    status: 'SUCCESS',
                    token: cached.session.token,
                    session: cached.session
                };
            } else {
                const generated = sessionEngine.generateSessionToken({ user: options.user, tier: options.tier });
                result = {
                    status: 'SUCCESS',
                    token: generated.token,
                    session: generated
                };
            }
            break;
        }
        case 'trust': {
            result = sessionEngine.evaluateTrustProvenance(null, { input: options.provenance });
            break;
        }
        case 'status':
        default: {
            result = sessionEngine.getSessionStatus(options);
            break;
        }
    }

    if (options.json) {
        console.log(JSON.stringify({ status: 'SUCCESS', action: options.action, result }, null, 2));
    } else {
        console.log(`==========================================================================`);
        console.log(` EAORCS 2026.3.1-LTS: DUAL-MODE SESSION LAUNCHER [${options.action.toUpperCase()}]`);
        console.log(`==========================================================================`);
        if (options.action === 'status') {
            console.log(` Status         : ${result.status}`);
            console.log(` Mode           : ${result.mode}`);
            console.log(` Tier           : ${result.tier}`);
            console.log(` Trust Score    : ${result.trustProvenance?.trustScore || 100}%`);
            console.log(` Session ID     : ${result.session?.sessionId || 'N/A'}`);
            console.log(` Token          : ${result.session?.token ? result.session.token.substring(0, 32) + '...' : 'N/A'}`);
        } else if (options.action === 'login') {
            console.log(` Authenticated : ${result.authenticated}`);
            console.log(` User          : ${result.user}`);
            console.log(` Tier          : ${result.tier}`);
            console.log(` Session ID    : ${result.sessionId}`);
            console.log(` Token         : ${result.token}`);
            console.log(` Expires At    : ${result.expiresAt}`);
        } else if (options.action === 'validate') {
            console.log(` Valid         : ${result.valid}`);
            console.log(` Reason        : ${result.reason || 'TOKEN_VERIFIED'}`);
            if (result.payload) {
                console.log(` User          : ${result.payload.user}`);
                console.log(` Tier          : ${result.payload.tier}`);
                console.log(` Session ID    : ${result.payload.sessionId}`);
            }
        } else if (options.action === 'offline-token') {
            console.log(` Token         : ${result.token}`);
            if (result.session) {
                console.log(` Session ID    : ${result.session.sessionId || result.session.payload?.sessionId}`);
                console.log(` Tier          : ${result.session.tier || result.session.payload?.tier}`);
            }
        } else if (options.action === 'trust') {
            console.log(` Trusted       : ${result.trusted}`);
            console.log(` Trust Score   : ${result.trustScore}%`);
            console.log(` Provenance Hash: ${result.provenanceHash}`);
        }
        console.log(`==========================================================================`);
    }

    return Promise.resolve({ exitCode: 0, result });
}

if (require.main === module) {
    run();
}

module.exports = { run, parseArgs, printHelp };
