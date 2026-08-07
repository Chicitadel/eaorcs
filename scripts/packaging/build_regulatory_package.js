'use strict';
/******************************************************************************
 * Module: EAORCS Regulatory & Compliance Package Builder
 * CORP: DEC-12 — Enterprise Release Bundle Architecture
 * Audience: Procurement & Compliance
 ******************************************************************************/

const PACKAGE_ID = '05_regulatory_compliance';
const PACKAGE_NAME = 'EAORCS Regulatory & Compliance Package';
const AUDIENCE = 'procurement_compliance';

const INCLUDED_PATHS = [
    '.governance/',
    'config/',
    'engine/governance/',
    'engine/security/',
    'engine/telemetry/',
    'tests/freeze/'
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
        outputFile: 'release/05_regulatory_compliance.zip',
        generatedAt: new Date().toISOString(),
        projectRoot
    };
}

module.exports = { buildManifest, PACKAGE_ID, PACKAGE_NAME, AUDIENCE };
