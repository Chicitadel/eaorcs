/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Full Source Snapshot Package Builder
 * File           : build_source_snapshot_package.js
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
 * CORP: Stream 1 — Release Packaging & Verification Refinements
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

const PACKAGE_ID = '01_source_snapshot';
const PACKAGE_NAME = 'EAORCS Full Source Snapshot';
const AUDIENCE = 'architects_code_reviewers';

const INCLUDED_PATHS = [
    'bin/',
    'cli/',
    'config/',
    'docs/',
    'engine/',
    'schemas/',
    'scripts/',
    'tests/',
    'templates/',
    'examples/',
    '.governance/',
    'package.json',
    'eaorcs.config.yaml',
    'LICENSE',
    'README.md',
    'ROADMAP.md'
];

const EXCLUDED_PATHS = [
    '.git/',
    'node_modules/',
    'tmp/',
    'release/'
];

function buildManifest(projectRoot) {
    return {
        packageId: PACKAGE_ID,
        packageName: PACKAGE_NAME,
        audience: AUDIENCE,
        isAuthoritativeSnapshot: true,
        includedPaths: INCLUDED_PATHS,
        excludedPaths: EXCLUDED_PATHS,
        outputFile: 'release/01_source_snapshot.zip',
        generatedAt: new Date().toISOString(),
        projectRoot
    };
}

module.exports = { buildManifest, PACKAGE_ID, PACKAGE_NAME, AUDIENCE };

