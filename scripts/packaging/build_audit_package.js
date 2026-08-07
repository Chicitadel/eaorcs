'use strict';
/******************************************************************************
 * Module: EAORCS External Technical Audit Package Builder
 * CORP: DEC-12 — Enterprise Release Bundle Architecture
 * Audience: Technical Auditors
 ******************************************************************************/

const PACKAGE_ID = '02_external_audit';
const PACKAGE_NAME = 'EAORCS External Technical Audit';
const AUDIENCE = 'auditors';

const INCLUDED_PATHS = [
    '.governance/',
    'engine/governance/',
    'engine/validation/',
    'engine/telemetry/',
    'engine/security/',
    'tests/freeze/',
    'config/',
    'docs/',
    'engine/EAORCS.js',
    'package.json',
    'README.md'
];

const EXCLUDED_PATHS = [
    '.git/', 'node_modules/', 'tmp/', 'engine/analyzers/', 'engine/ai/'
];

function buildManifest(projectRoot) {
    return {
        packageId: PACKAGE_ID,
        packageName: PACKAGE_NAME,
        audience: AUDIENCE,
        includedPaths: INCLUDED_PATHS,
        excludedPaths: EXCLUDED_PATHS,
        outputFile: 'release/02_external_audit.zip',
        generatedAt: new Date().toISOString(),
        projectRoot
    };
}

module.exports = { buildManifest, PACKAGE_ID, PACKAGE_NAME, AUDIENCE };
