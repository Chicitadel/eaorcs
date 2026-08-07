/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS SBOM Package Builder
 * File           : build_sbom_package.js
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

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const SupplyChainSecurityEngine = require('../../engine/security/SupplyChainSecurityEngine');

const PACKAGE_ID = '06_sbom';
const PACKAGE_NAME = 'EAORCS Software Bill of Materials (SBOM)';
const AUDIENCE = 'security_procurement';

function buildManifest(projectRoot) {
    const secEngine = new SupplyChainSecurityEngine();
    const tmpSbomDir = path.join(projectRoot, 'tmp', 'sbom_export');
    fs.mkdirSync(tmpSbomDir, { recursive: true });

    const packages = [
        { name: 'eaorcs-core', version: '2026.3.1-LTS', license: 'Apache-2.0', supplier: 'Ujomor Systems' },
        { name: 'workspace-resolver', version: '2026.3.1-LTS', license: 'Apache-2.0', supplier: 'Ujomor Systems' },
        { name: 'governance-kernel', version: '2026.3.1-LTS', license: 'Apache-2.0', supplier: 'Ujomor Systems' }
    ];

    const spdxDoc = secEngine.generateSPDXDocument('EAORCS Platform', '2026.3.1-LTS', packages);
    const cycloneDoc = secEngine.generateCycloneDXDocument('EAORCS Platform', '2026.3.1-LTS', packages);

    const spdxPath = path.join(tmpSbomDir, 'spdx.json');
    const cyclonePath = path.join(tmpSbomDir, 'cyclonedx.json');

    secEngine.exportSBOM(spdxDoc, spdxPath);
    secEngine.exportSBOM(cycloneDoc, cyclonePath);

    const spdxBuf = fs.readFileSync(spdxPath);
    const cycloneBuf = fs.readFileSync(cyclonePath);

    const spdxSha256 = crypto.createHash('sha256').update(spdxBuf).digest('hex');
    const cycloneDxSha256 = crypto.createHash('sha256').update(cycloneBuf).digest('hex');

    const sbomMetadata = {
        generationTimestamp: new Date().toISOString(),
        generatorVersion: 'SupplyChainSecurityEngine v2026.3.1-LTS',
        spdxVersion: '2.3',
        cycloneDxVersion: '1.5',
        spdxSha256,
        cycloneDxSha256,
        detachedSignatureReference: '07_signatures.zip:artifact_signatures.json'
    };

    const metadataPath = path.join(tmpSbomDir, 'sbom_metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(sbomMetadata, null, 2), 'utf8');

    return {
        packageId: PACKAGE_ID,
        packageName: PACKAGE_NAME,
        audience: AUDIENCE,
        includedPaths: [spdxPath, cyclonePath, metadataPath],
        excludedPaths: [],
        outputFile: 'release/06_sbom.zip',
        generatedAt: new Date().toISOString(),
        projectRoot
    };
}

module.exports = { buildManifest, PACKAGE_ID, PACKAGE_NAME, AUDIENCE };

