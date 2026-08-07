/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Commercial Release Package Builder
 * File           : build_commercial_package.js
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
 * CORP: Stream 1 — Universal Package Embedding & Customer Doc Trimming
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

const PACKAGE_ID = '03_customer_release';
const PACKAGE_NAME = 'EAORCS Customer Release';
const AUDIENCE = 'customers';

const INCLUDED_PATHS = [
    'bin/eaorcs.js',
    'bin/eaorcs',
    'bin/eaorcs.cmd',
    'cli/',
    'config/',
    'docs/Installation_Guide.md',
    'docs/Administrator_Guide.md',
    'docs/User_Guide.md',
    'docs/CLI_Reference.md',
    'docs/Configuration_Guide.md',
    'engine/runtime/',
    'engine/cli/',
    'engine/sdk/',
    'engine/ux/',
    'engine/EAORCS.js',
    'templates/',
    'examples/',
    'package.json',
    'LICENSE',
    'README.md'
];

const EXCLUDED_PATHS = [
    'tests/',
    'tmp/',
    'scripts/packaging/',
    'scripts/',
    '.git/',
    'node_modules/',
    '.governance/',
    'engine/analyzers/',
    'engine/ai/',
    'docs/research/',
    'docs/audit/',
    'docs/audits/',
    'docs/baseline_report.md',
    'docs/ci_execution_log.md',
    'docs/clean_build_report.md'
];

function buildManifest(projectRoot) {
    return {
        packageId: PACKAGE_ID,
        packageName: PACKAGE_NAME,
        audience: AUDIENCE,
        includedPaths: INCLUDED_PATHS,
        excludedPaths: EXCLUDED_PATHS,
        outputFile: 'release/03_customer_release.zip',
        generatedAt: new Date().toISOString(),
        projectRoot
    };
}

module.exports = { buildManifest, PACKAGE_ID, PACKAGE_NAME, AUDIENCE };

