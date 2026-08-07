#!/usr/bin/env node

/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS DIC Commercial Launcher
 * File           : eaorcs_dic.js
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
 * CORP: Subsystem 4 — DIC Master Certification & Packaging
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
const DocumentationIntelligenceEngine = require('../../engine/docs/DocumentationIntelligenceEngine');
const BrowserTerminalServerEngine = require('../../engine/portal/BrowserTerminalServerEngine');

function printHelp() {
    console.log(`
==========================================================================
 EAORCS 2026.3.1-LTS: DOCUMENTATION INTELLIGENCE CENTER (DIC) LAUNCHER
 UAIGOS Multiformat Documentation Scanning, Coverage & Knowledge Graph
==========================================================================
Usage:
  eaorcs_dic [command] [options]

Commands:
  scan                     Scan workspace for multiformat documentation across 25 categories.
  coverage                 Compute domain coverage matrix and key domain scores.
  missing                  Detect inferred missing documentation for capabilities.
  draft [docType]          Generate UAIGOS compliant AI documentation draft.
  graph                    Generate connected knowledge graph and lineage.
  server                   Launch browser terminal server with DIC REST endpoints.

Options:
  -p, --port <port>        Set server port (default: 8092)
  -j, --json               Output response payload in JSON format
  -w, --workspace <path>   Set target workspace directory (default: current working directory)
  -h, --help               Display this help manual
==========================================================================
`);
}

function parseArgs(args = process.argv.slice(2)) {
    const options = {
        command: null,
        docType: null,
        port: 8092,
        json: false,
        help: false,
        workspace: process.cwd()
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '-p' || arg === '--port') {
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
        } else if (!arg.startsWith('-') && options.command === 'draft' && !options.docType) {
            options.docType = arg;
        }
    }

    if (!options.command) options.command = 'scan';

    return options;
}

function run(args = process.argv.slice(2)) {
    const options = parseArgs(args);

    if (options.help) {
        printHelp();
        return Promise.resolve({ exitCode: 0, help: true });
    }

    const cmd = options.command || 'scan';
    const dicEngine = new DocumentationIntelligenceEngine({ workspaceRoot: options.workspace });

    if (cmd === 'scan') {
        const docs = dicEngine.scan(options.workspace);
        const overview = dicEngine.getOverview({ workspace: options.workspace });
        if (options.json) {
            console.log(JSON.stringify({ status: 'SUCCESS', count: docs.length, overview: overview.overview, docs }, null, 2));
        } else {
            console.log(`==========================================================================`);
            console.log(` EAORCS 2026.3.1-LTS: DIC MULTIFORMAT DOCUMENT SCAN`);
            console.log(`==========================================================================`);
            console.log(` Target Workspace   : ${options.workspace}`);
            console.log(` Scanned Documents  : ${docs.length}`);
            console.log(` Categories Covered : ${dicEngine.categories.length}`);
            console.log(`==========================================================================`);
        }
        return Promise.resolve({ exitCode: 0, status: 'SUCCESS', count: docs.length, docs, overview });
    } else if (cmd === 'coverage') {
        const coverage = dicEngine.computeDomainCoverage(dicEngine.scan(options.workspace));
        if (options.json) {
            console.log(JSON.stringify({ status: 'SUCCESS', coverage }, null, 2));
        } else {
            console.log(`==========================================================================`);
            console.log(` EAORCS 2026.3.1-LTS: DIC DOMAIN COVERAGE MATRIX`);
            console.log(`==========================================================================`);
            console.log(` Overall Coverage   : ${coverage.overallCoveragePercentage}%`);
            console.log(` Key Domains        : ${JSON.stringify(coverage.keyDomainCoverage)}`);
            console.log(` Total Scanned Docs : ${coverage.totalDocumentsScanned}`);
            console.log(`==========================================================================`);
        }
        return Promise.resolve({ exitCode: 0, status: 'SUCCESS', coverage });
    } else if (cmd === 'missing') {
        const missing = dicEngine.detectMissingDocumentation([], dicEngine.scan(options.workspace));
        if (options.json) {
            console.log(JSON.stringify({ status: 'SUCCESS', totalMissing: missing.length, missing }, null, 2));
        } else {
            console.log(`==========================================================================`);
            console.log(` EAORCS 2026.3.1-LTS: DIC INFERRED MISSING DOCUMENTATION`);
            console.log(`==========================================================================`);
            console.log(` Inferred Missing   : ${missing.length} documents`);
            missing.forEach(m => console.log(`  - [${m.priority}] ${m.missingDocType} (${m.capability})`));
            console.log(`==========================================================================`);
        }
        return Promise.resolve({ exitCode: 0, status: 'SUCCESS', totalMissing: missing.length, missing });
    } else if (cmd === 'draft') {
        const docType = options.docType || 'Marketplace Operations Guide';
        const draft = dicEngine.generateDraft(docType, { workspace: options.workspace });
        if (options.json) {
            console.log(JSON.stringify({ status: 'SUCCESS', draft }, null, 2));
        } else {
            console.log(`==========================================================================`);
            console.log(` EAORCS 2026.3.1-LTS: DIC AI DRAFT GENERATOR`);
            console.log(`==========================================================================`);
            console.log(` Generated Draft    : ${draft.title}`);
            console.log(` Capability         : ${draft.capability}`);
            console.log(` Word Count         : ${draft.wordCount}`);
            console.log(`==========================================================================`);
        }
        return Promise.resolve({ exitCode: 0, status: 'SUCCESS', draft });
    } else if (cmd === 'graph') {
        const kg = dicEngine.buildKnowledgeGraph(options.workspace);
        const traceability = dicEngine.verifyTraceability();
        if (options.json) {
            console.log(JSON.stringify({ status: 'SUCCESS', graph: kg.graph, traceability }, null, 2));
        } else {
            console.log(`==========================================================================`);
            console.log(` EAORCS 2026.3.1-LTS: DIC CONNECTED KNOWLEDGE GRAPH`);
            console.log(`==========================================================================`);
            console.log(` Nodes Count        : ${kg.graph.nodeCount}`);
            console.log(` Edges Count        : ${kg.graph.edgeCount}`);
            console.log(` Traceability       : ${traceability.traceabilityPercentage}%`);
            console.log(`==========================================================================`);
        }
        return Promise.resolve({ exitCode: 0, status: 'SUCCESS', graph: kg.graph, traceability });
    } else if (cmd === 'server') {
        const serverEngine = new BrowserTerminalServerEngine({ workspace: options.workspace, port: options.port });
        const serverHandle = serverEngine.launchTerminalServer({ port: options.port });
        if (!options.json) {
            console.log(`DIC Server launched at http://localhost:${options.port}/terminal`);
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
        console.error('[EAORCS DIC FATAL ERROR]', err.message);
        process.exit(1);
    });
}

module.exports = { run, parseArgs, printHelp, main };
