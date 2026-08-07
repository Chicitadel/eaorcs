/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Commercial Packaging, Licensing & Marketplace Test Suite
 * File           : eaorcs_commercial_productization_licensing_publishing.test.js
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
 * CORP: S5, S6, S7, S12, S13 Commercial Streams Validation
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

const assert = require('assert');
const CommercialProductizationEngine = require('../../engine/commercial/CommercialProductizationEngine');
const CommercialLicensingEngine = require('../../engine/commercial/CommercialLicensingEngine');
const MarketplacePublishingEngine = require('../../engine/marketplace/MarketplacePublishingEngine');

async function runTests() {
    console.log('================================================================');
    console.log('Running Verification Tests for EAORCS Commercial Productization,');
    console.log('Packaging, Ed25519 Licensing & Marketplace Publishing Engines');
    console.log('================================================================\n');

    // -------------------------------------------------------------------------
    // 1. CommercialProductizationEngine Tests
    // -------------------------------------------------------------------------
    console.log('[1/3] Testing CommercialProductizationEngine...');
    const productEngine = new CommercialProductizationEngine();

    const productMetadata = {
        name: 'eaorcs-enterprise',
        displayName: 'EAORCS Enterprise Operational Readiness Engine',
        version: '2026.3.1-LTS',
        publisher: 'Ujomor Systems & Enterprise Governance',
        description: 'Enterprise Autonomous Operational Readiness & Governance System',
        license: 'Commercial-Enterprise'
    };

    const manifests = productEngine.generateInstallerManifests(productMetadata);

    // Verify all 7 installer descriptors are generated
    assert(manifests.winget, 'winget manifest should be generated');
    assert(manifests.chocolatey, 'chocolatey manifest should be generated');
    assert(manifests.npm, 'npm manifest should be generated');
    assert(manifests.Docker, 'Docker manifest should be generated');
    assert(manifests.deb, 'deb manifest should be generated');
    assert(manifests.rpm, 'rpm manifest should be generated');
    assert(manifests.dmg, 'dmg manifest should be generated');

    // Inspect content of each installer target
    assert(manifests.winget.PackageIdentifier.includes('UjomorSystems'), 'winget PackageIdentifier valid');
    assert(manifests.winget.yamlContent.includes('PackageIdentifier:'), 'winget YAML content generated');
    assert(manifests.chocolatey.nuspecXml.includes('<package'), 'chocolatey nuspec XML generated');
    assert(manifests.npm.packageJsonString.includes('@ujomor/'), 'npm package.json generated');
    assert(manifests.Docker.dockerfileContent.includes('FROM node:20-alpine'), 'Dockerfile content generated');
    assert(manifests.deb.controlFile.includes('Package: eaorcs-enterprise'), 'Debian control file generated');
    assert(manifests.rpm.specFile.includes('Summary:        EAORCS Enterprise Operational Readiness Engine'), 'RPM spec file generated');
    assert(manifests.dmg.format === 'UDZO', 'macOS DMG format specified');

    console.log('  -> All 7 installer targets (winget, chocolatey, npm, Docker, deb, rpm, dmg) verified OK.');

    // Diagnostics test
    const diagReport = productEngine.runFirstRunDiagnostics({ telemetryConsent: true, telemetryLevel: 'full' });
    assert(diagReport.diagnosticsId, 'Diagnostic ID generated');
    assert(diagReport.overallStatus === 'READY', 'First run diagnostics status READY');
    assert(diagReport.checks.length >= 3, 'Multiple diagnostic checks performed');
    assert(diagReport.telemetryPreferences.enabled === true, 'Telemetry preference captured');
    assert(diagReport.telemetryPreferences.telemetryLevel === 'full', 'Telemetry level set to full');
    console.log('  -> First-run customer diagnostics and telemetry preferences verified OK.\n');

    // -------------------------------------------------------------------------
    // 2. CommercialLicensingEngine Tests (Ed25519)
    // -------------------------------------------------------------------------
    console.log('[2/3] Testing CommercialLicensingEngine (Ed25519 Signatures & Tiers)...');
    const licenseEngine = new CommercialLicensingEngine();

    const tiers = ['Enterprise', 'Government', 'OEM', 'Marketplace', 'SaaS', 'Academic', 'Evaluation'];

    for (const tier of tiers) {
        const customerInfo = {
            organization: `${tier} Global Corp`,
            contactEmail: `admin@${tier.toLowerCase()}.org`
        };

        const licenseBundle = licenseEngine.generateLicenseKey(tier, customerInfo);
        assert(licenseBundle.licenseToken, `Token string generated for tier ${tier}`);
        assert(licenseBundle.publicKey, `Public key generated for tier ${tier}`);

        const verification = licenseEngine.verifyLicenseKey(licenseBundle.licenseToken, licenseBundle.publicKey);
        assert.strictEqual(verification.valid, true, `License verification passed for ${tier}`);
        assert.strictEqual(verification.integrityVerified, true, `Ed25519 signature verified for ${tier}`);
        assert.strictEqual(verification.expired, false, `License active for ${tier}`);
        assert.strictEqual(verification.tier, tier, `Tier matches for ${tier}`);
    }
    console.log('  -> Cryptographically signed Ed25519 license keys verified across all 7 tiers OK.');

    // Seat limit verification test
    const entToken = licenseEngine.generateLicenseKey('Enterprise', { maxSeats: 100 });
    const seatCheckFail = licenseEngine.verifyLicenseKey(entToken.licenseToken, entToken.publicKey, { checkSeats: 250 });
    assert.strictEqual(seatCheckFail.valid, false, 'Seat count over limit should fail verification');
    assert.strictEqual(seatCheckFail.seatsExceeded, true, 'seatsExceeded flag set to true');

    const seatCheckPass = licenseEngine.verifyLicenseKey(entToken.licenseToken, entToken.publicKey, { checkSeats: 50 });
    assert.strictEqual(seatCheckPass.valid, true, 'Seat count within limit should pass verification');

    // Feature flag verification test
    const featCheckPass = licenseEngine.verifyLicenseKey(entToken.licenseToken, entToken.publicKey, { requiredFeature: 'ha' });
    assert.strictEqual(featCheckPass.valid, true, 'Granted feature flag passes');

    const evalToken = licenseEngine.generateLicenseKey('Evaluation');
    const featCheckFail = licenseEngine.verifyLicenseKey(evalToken.licenseToken, evalToken.publicKey, { requiredFeature: 'non_existent_feature_123' });
    assert.strictEqual(featCheckFail.valid, false, 'Ungranted feature flag fails');

    // Expiration verification test
    const expiredToken = licenseEngine.generateLicenseKey('Evaluation', { expiresAt: '2020-01-01T00:00:00.000Z' });
    const expireCheck = licenseEngine.verifyLicenseKey(expiredToken.licenseToken, expiredToken.publicKey);
    assert.strictEqual(expireCheck.valid, false, 'Expired license fails verification');
    assert.strictEqual(expireCheck.expired, true, 'expired flag set to true');

    // Signature tampering test
    const tamperedToken = entToken.licenseToken.slice(0, -10) + 'XXXXXXXXXX';
    const tamperCheck = licenseEngine.verifyLicenseKey(tamperedToken, entToken.publicKey);
    assert.strictEqual(tamperCheck.valid, false, 'Tampered token signature verification fails');
    assert.strictEqual(tamperCheck.integrityVerified, false, 'integrityVerified false for tampered token');

    console.log('  -> License integrity, seat limits, expiration, and feature flags verified OK.\n');

    // -------------------------------------------------------------------------
    // 3. MarketplacePublishingEngine Tests
    // -------------------------------------------------------------------------
    console.log('[3/3] Testing MarketplacePublishingEngine...');
    const marketplaceEngine = new MarketplacePublishingEngine();

    const pluginManifest = {
        name: 'EAORCS Automated Compliance Pack',
        version: '2.1.0',
        publisher: 'Ujomor Governance Partners',
        category: 'Compliance Standards',
        description: 'Automated ISO 27001 & SOC 2 evidence bundle collector',
        capabilitiesRequired: ['read:telemetry', 'write:audit_log', 'execute:policy_rules'],
        partnerInfo: {
            tier: 'Certified',
            verified: true,
            complianceCertifications: ['SOC2 Type II', 'ISO 27001']
        }
    };

    const bundle = marketplaceEngine.generateMarketplaceBundle(pluginManifest, { isolationLevel: 'Strict' });

    assert(bundle.bundleId, 'Marketplace bundle ID created');
    assert(bundle.checksum, 'SHA-256 checksum generated');
    assert(bundle.bundleSignature, 'Ed25519 bundle signature created');
    assert.strictEqual(bundle.status, 'READY_FOR_PUBLISHING', 'Bundle status is READY_FOR_PUBLISHING');
    assert.strictEqual(bundle.partnerVerification.verified, true, 'Partner verification certified');
    assert.strictEqual(bundle.capabilityGrants.isolationLevel, 'Strict', 'Strict isolation level granted');
    assert(bundle.capabilityGrants.grantedCapabilities.length === 3, 'Capabilities granted correctly');

    // Verify bundle
    const bundleVerification = marketplaceEngine.verifyBundle(bundle);
    assert.strictEqual(bundleVerification.valid, true, 'Marketplace bundle verification passed');
    assert.strictEqual(bundleVerification.checksumVerified, true, 'Bundle SHA256 checksum verified');
    assert.strictEqual(bundleVerification.signatureVerified, true, 'Bundle Ed25519 signature verified');
    assert.strictEqual(bundleVerification.partnerVerified, true, 'Developer partner verification verified');

    // Tampering test on bundle
    const tamperedBundle = JSON.parse(JSON.stringify(bundle));
    tamperedBundle.manifest.version = '9.9.9'; // Alter manifest after signing
    const tamperedVerification = marketplaceEngine.verifyBundle(tamperedBundle);
    assert.strictEqual(tamperedVerification.valid, false, 'Tampered marketplace bundle fails verification');
    assert.strictEqual(tamperedVerification.checksumVerified, false, 'Checksum mismatch detected for tampered bundle');

    console.log('  -> Marketplace publishing bundle, partner verification, and capability grants verified OK.\n');

    console.log('================================================================');
    console.log('ALL TESTS PASSED SUCCESSFULLY! Streams S5, S6, S7, S12, S13 OK.');
    console.log('================================================================');
}

runTests().catch(err => {
    console.error('Test execution failed:', err);
    process.exit(1);
});
