/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Test Suite (Streams 7 & 9 - Phase 6)
 * File           : procurement_connectors.test.js
 * Version        : 2026.1-LTS (v1.0.0-FROZEN)
 * Author         : Ujomor Systems & Enterprise Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance Authority
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 * - Corporate Policy Governed
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - DORA
 * - NIS2
 * - EU AI Act
 * - FedRAMP
 * - PCI-DSS
 * - HIPAA
 *
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance Authority. All Rights Reserved.
 ******************************************************************************/

const fs = require('fs');
const path = require('path');
const AutomatedProcurementBundler = require('../../engine/compliance/AutomatedProcurementBundler');
const EcosystemConnectorRegistry = require('../../engine/connectors/EcosystemConnectorRegistry');

const TEST_OUTPUT_DIR = path.resolve(__dirname, '../../storage/test_procurement_connectors');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  [PASS] ${message}`);
        passCount++;
    } else {
        console.error(`  [FAIL] ${message}`);
        failCount++;
    }
}

async function runTestSuite() {
    console.log('==============================================================================');
    console.log('  EAORCS PHASE 6 TEST SUITE: AUTOMATED PROCUREMENT BUNDLER & CONNECTORS');
    console.log('==============================================================================\n');

    if (fs.existsSync(TEST_OUTPUT_DIR)) {
        fs.rmSync(TEST_OUTPUT_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(TEST_OUTPUT_DIR, { recursive: true });

    try {
        // --------------------------------------------------------------------------
        // TEST 1: Framework Evidence Generation across 8 Compliance Standards
        // --------------------------------------------------------------------------
        console.log('[TEST 1] Testing Framework Bundle Generation across 8 Compliance Standards...');
        const bundler = new AutomatedProcurementBundler({
            organization: 'Ujomor Systems & Enterprise Governance Authority',
            version: '2026.1-LTS'
        });

        const frameworks = [
            'ISO_27001',
            'SOC_2',
            'DORA',
            'NIS2',
            'EU_AI_ACT',
            'FEDRAMP',
            'PCI_DSS',
            'HIPAA'
        ];

        for (const fwId of frameworks) {
            const bundle = bundler.generateFrameworkBundle(fwId);
            assert(bundle.frameworkId === fwId, `Framework bundle generated for ${fwId}`);
            assert(bundle.status === 'VERIFIED_COMPLIANT', `${fwId} status is VERIFIED_COMPLIANT`);
            assert(bundle.complianceScore === 100, `${fwId} compliance score is 100%`);
            assert(bundle.controlsCount > 0, `${fwId} contains ${bundle.controlsCount} controls`);
            assert(typeof bundle.evidenceSummary.merkleTreeHash === 'string' && bundle.evidenceSummary.merkleTreeHash.length === 64, `${fwId} Merkle hash calculated successfully`);
        }

        // --------------------------------------------------------------------------
        // TEST 2: Master Procurement Dossier Generation
        // --------------------------------------------------------------------------
        console.log('\n[TEST 2] Generating Master Procurement Dossier...');
        const masterDossier = bundler.generateMasterProcurementDossier({
            organization: 'Global Enterprise Auditing Trust',
            version: '2026.1-LTS'
        });

        assert(masterDossier.totalFrameworksCovered === 8, 'Master dossier covers all 8 compliance frameworks');
        assert(masterDossier.overallStatus === 'APPROVED_FOR_ENTERPRISE_PROCUREMENT', 'Master dossier overall status is APPROVED_FOR_ENTERPRISE_PROCUREMENT');
        assert(masterDossier.overallComplianceScore === 100, 'Master dossier overall compliance score is 100%');
        assert(masterDossier.totalControlsEvaluated >= 45, `Master dossier evaluated ${masterDossier.totalControlsEvaluated} controls (>= 45)`);
        assert(typeof masterDossier.merkleRootHash === 'string' && masterDossier.merkleRootHash.length === 64, 'Master dossier Merkle root hash calculated successfully');
        assert(masterDossier.softwareAssuranceAttestation.slsaLevel === 'SLSA v1.0 Level 3', 'SLSA Level 3 attestation present in master dossier');

        // --------------------------------------------------------------------------
        // TEST 3: Cryptographic Signing of Procurement Dossier
        // --------------------------------------------------------------------------
        console.log('\n[TEST 3] Cryptographically Signing Master Procurement Dossier...');
        
        // Auto key generation sign
        const signedDossierAuto = bundler.signDossier(masterDossier);
        assert(signedDossierAuto.signature !== null, 'Dossier signed successfully with auto RSA keypair');
        assert(signedDossierAuto.signature.algorithm === 'SHA256-RSA', 'Signature algorithm is SHA256-RSA');
        assert(typeof signedDossierAuto.signature.signature === 'string' && signedDossierAuto.signature.signature.length > 32, 'Cryptographic RSA signature bytes generated');
        assert(typeof signedDossierAuto.signature.keyFingerprint === 'string', 'Key fingerprint attached');

        // Secret key HMAC sign
        const signedDossierHmac = bundler.signDossier(masterDossier, 'EnterpriseSecretKey2026');
        assert(signedDossierHmac.signature.algorithm === 'HMAC-SHA256', 'Signature algorithm is HMAC-SHA256 with key parameter');
        assert(typeof signedDossierHmac.signature.signature === 'string' && signedDossierHmac.signature.signature.length === 64, 'HMAC-SHA256 signature generated');

        // --------------------------------------------------------------------------
        // TEST 4: Exporting Dossier to ZIP Package
        // --------------------------------------------------------------------------
        console.log('\n[TEST 4] Packaging and Exporting Dossier ZIP file...');
        const zipPath = path.join(TEST_OUTPUT_DIR, 'procurement_dossier_2026.zip');
        const exportResult = bundler.exportDossierZip(masterDossier, zipPath);

        assert(fs.existsSync(zipPath), 'Dossier ZIP archive created on disk');
        assert(exportResult.byteCount > 0, `Exported ZIP archive byte count: ${exportResult.byteCount} bytes`);
        assert(exportResult.fileCount >= 10, `ZIP archive contains ${exportResult.fileCount} packaged files`);
        assert(typeof exportResult.checksum === 'string' && exportResult.checksum.length === 64, 'ZIP archive SHA-256 checksum calculated');

        // Validate ZIP file header (PK\x03\x04)
        const zipBuffer = fs.readFileSync(zipPath);
        const magicHeader = zipBuffer.toString('hex', 0, 4);
        assert(magicHeader === '504b0304', 'ZIP file magic header matches 0x04034b50 (PK\\x03\\x04)');

        // --------------------------------------------------------------------------
        // TEST 5: Ecosystem Connector Registry Registration & Listing across 9 Platforms
        // --------------------------------------------------------------------------
        console.log('\n[TEST 5] Registering Connectors for 9 Ecosystem Platforms...');
        const registry = new EcosystemConnectorRegistry();

        const platforms = [
            { id: 'GitHub', config: { token: 'ghp_secretToken12345', endpoint: 'https://api.github.com' } },
            { id: 'GitLab', config: { api_key: 'glpat-secretKey98765', endpoint: 'https://gitlab.com' } },
            { id: 'azure_devops', config: { pat: 'az_pat_secret', organization: 'UjomorEnterprise' } },
            { id: 'Jira', config: { apiKey: 'jira_api_token', domain: 'ujomor.atlassian.net' } },
            { id: 'Confluence', config: { apiKey: 'confluence_token', domain: 'ujomor.atlassian.net' } },
            { id: 'Notion', config: { secret: 'secret_notion_key', workspace: 'EnterpriseGov' } },
            { id: 'ServiceNow', config: { password: 'sn_admin_password', instance: 'ujomor.service-now.com' } },
            { id: 'Kubernetes', config: { kubeconfig: '/etc/kubernetes/admin.conf', cluster: 'k8s-prod-eu' } },
            { id: 'Terraform', config: { token: 'tfe_token_secret', organization: 'Ujomor-IaC' } }
        ];

        for (const p of platforms) {
            const registered = registry.registerConnector(p.id, p.config);
            assert(registered.platformId !== null, `Registered connector for platform: ${p.id} -> ${registered.platformId}`);
            assert(registered.status === 'REGISTERED', `${registered.platformId} status is REGISTERED`);
            assert(registered.config.token === '***MASKED***' || registered.config.api_key === '***MASKED***' || registered.config.pat === '***MASKED***' || registered.config.apiKey === '***MASKED***' || registered.config.secret === '***MASKED***' || registered.config.password === '***MASKED***' || registered.config.kubeconfig !== undefined, `${registered.platformId} sensitive credentials sanitized`);
        }

        const connectorList = registry.listConnectors();
        assert(connectorList.length === 9, `listConnectors() returned 9 registered connectors (found ${connectorList.length})`);

        // --------------------------------------------------------------------------
        // TEST 6: Connector Sync Execution across all 9 Platforms
        // --------------------------------------------------------------------------
        console.log('\n[TEST 6] Executing Sync Operations across all 9 Ecosystem Connectors...');

        for (const p of platforms) {
            const syncResult = registry.syncConnector(p.id, { syncType: 'FULL' });
            assert(syncResult.status === 'SUCCESS', `Sync executed successfully for platform ${syncResult.platformId}`);
            assert(syncResult.recordsSynced > 0, `${syncResult.platformId} synced ${syncResult.recordsSynced} records`);
            assert(Array.isArray(syncResult.syncedEntities) && syncResult.syncedEntities.length > 0, `${syncResult.platformId} synced entities list captured`);
            assert(typeof syncResult.merkleHash === 'string' && syncResult.merkleHash.length === 64, `${syncResult.platformId} state Merkle hash computed`);
        }

        // --------------------------------------------------------------------------
        // TEST 7: Connector Status Retrieval & Verification
        // --------------------------------------------------------------------------
        console.log('\n[TEST 7] Verifying Connector Status after Sync...');

        for (const p of platforms) {
            const status = registry.getConnectorStatus(p.id);
            assert(status.status === 'SYNCED', `${status.platformId} status updated to SYNCED`);
            assert(status.health === 'HEALTHY', `${status.platformId} health status is HEALTHY`);
            assert(status.syncCount === 1, `${status.platformId} sync count incremented to 1`);
            assert(status.lastSync !== null, `${status.platformId} lastSync timestamp set (${status.lastSync})`);
            assert(status.lastSyncResult.status === 'SUCCESS', `${status.platformId} lastSyncResult matches successful sync record`);
        }

        // --------------------------------------------------------------------------
        // TEST 8: Defensive Error Handling & Edge Cases
        // --------------------------------------------------------------------------
        console.log('\n[TEST 8] Testing Defensive Error Handling & Input Validation...');

        // 8.1 Invalid framework ID
        let threwFrameworkErr = false;
        try {
            bundler.generateFrameworkBundle('INVALID_FRAMEWORK_999');
        } catch (err) {
            threwFrameworkErr = true;
            assert(err.message.includes('Unsupported or invalid compliance framework ID'), 'Invalid framework ID throws clear descriptive error');
        }
        assert(threwFrameworkErr === true, 'Handled invalid framework ID gracefully');

        // 8.2 Unsupported platform registration
        let threwPlatformErr = false;
        try {
            registry.registerConnector('UNKNOWN_PLATFORM_XYZ');
        } catch (err) {
            threwPlatformErr = true;
            assert(err.message.includes('Unsupported ecosystem platform ID'), 'Unsupported platform ID throws clear descriptive error');
        }
        assert(threwPlatformErr === true, 'Handled unsupported platform ID gracefully');

        // 8.3 Syncing unregistered platform
        let threwUnregisteredSyncErr = false;
        const freshRegistry = new EcosystemConnectorRegistry();
        try {
            freshRegistry.syncConnector('github');
        } catch (err) {
            threwUnregisteredSyncErr = true;
            assert(err.message.includes('not registered'), 'Syncing unregistered connector throws clear error');
        }
        assert(threwUnregisteredSyncErr === true, 'Handled syncing unregistered connector gracefully');

        // 8.4 Signing without dossier
        let threwSignErr = false;
        const emptyBundler = new AutomatedProcurementBundler();
        try {
            emptyBundler.signDossier();
        } catch (err) {
            threwSignErr = true;
            assert(err.message.includes('No compliance dossier available to sign'), 'Signing without dossier throws clear error');
        }
        assert(threwSignErr === true, 'Handled signing without dossier gracefully');

        // --------------------------------------------------------------------------
        // SUMMARY
        // --------------------------------------------------------------------------
        console.log('\n==============================================================================');
        console.log(`  PHASE 6 TEST SUITE SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
        console.log('==============================================================================\n');

        if (failCount > 0) {
            process.exit(1);
        } else {
            process.exit(0);
        }

    } catch (err) {
        console.error('\n[UNHANDLED ERROR IN TEST SUITE]', err);
        process.exit(1);
    } finally {
        if (fs.existsSync(TEST_OUTPUT_DIR)) {
            fs.rmSync(TEST_OUTPUT_DIR, { recursive: true, force: true });
        }
    }
}

runTestSuite();
