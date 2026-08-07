'use strict';
/******************************************************************************
 * Module: EAORCS Enterprise SDK Package Builder
 * CORP: DEC-12 — Enterprise Release Bundle Architecture
 * Audience: Developers
 ******************************************************************************/

const PACKAGE_ID = '04_enterprise_sdk';
const PACKAGE_NAME = 'EAORCS Enterprise SDK';
const AUDIENCE = 'developers';

const INCLUDED_PATHS = [
    'engine/sdk/',
    'engine/plugin/',
    'engine/cli/',
    'docs/',
    'engine/EAORCS.js',
    'package.json',
    'README.md'
];

const EXCLUDED_PATHS = [
    '.git/', 'node_modules/', 'tmp/'
];

function buildManifest(projectRoot) {
    return {
        packageId: PACKAGE_ID,
        packageName: PACKAGE_NAME,
        audience: AUDIENCE,
        includedPaths: INCLUDED_PATHS,
        excludedPaths: EXCLUDED_PATHS,
        outputFile: 'release/04_enterprise_sdk.zip',
        generatedAt: new Date().toISOString(),
        projectRoot
    };
}

module.exports = { buildManifest, PACKAGE_ID, PACKAGE_NAME, AUDIENCE };
