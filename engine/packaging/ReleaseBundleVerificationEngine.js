/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Release Bundle Verification Engine
 * File           : ReleaseBundleVerificationEngine.js
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

class ReleaseBundleVerificationEngine {
    generateReleaseProvenance(config = {}) {
        const now = new Date().toISOString();
        const releaseId = config.releaseId || 'REL-2026.3.1-LTS';
        const gitCommit = config.gitCommit || 'c9b4e870e9ec48ef';
        const buildId = config.buildId || `BUILD-${Date.now()}`;

        const provenanceData = {
            releaseId,
            buildId,
            gitCommit,
            architectureVersion: config.architectureVersion || '3.0.0',
            constitutionVersion: config.constitutionVersion || '1.4.0',
            contractRegistryVersion: config.contractRegistryVersion || '2026.3.1',
            generatedAt: now,
            canonicalSourceSnapshot: '01_source_snapshot.zip',
            governanceAuthority: 'Ujomor Systems & Enterprise Governance Board'
        };

        const provenanceHash = crypto.createHash('sha256')
            .update(JSON.stringify(provenanceData))
            .digest('hex');

        return {
            ...provenanceData,
            provenanceHash
        };
    }

    generateRBOM(bundleManifest = {}, provenance = {}) {
        const artifacts = (bundleManifest.artifacts || []).map(a => ({
            packageId: a.packageId,
            packageName: a.packageName,
            filename: a.filename,
            sha256: a.sha256,
            sizeMB: a.sizeMB,
            audience: a.audience
        }));

        const rbomData = {
            release: bundleManifest.version || '2026.3.1-LTS',
            sourceSnapshot: '01_source_snapshot.zip',
            provenanceHash: provenance.provenanceHash || 'N/A',
            gitCommit: provenance.gitCommit || 'N/A',
            buildId: provenance.buildId || 'N/A',
            artifactsCount: artifacts.length,
            generatedArtifacts: artifacts,
            generatedAt: new Date().toISOString()
        };

        const rbomHash = crypto.createHash('sha256')
            .update(JSON.stringify(rbomData))
            .digest('hex');

        return {
            ...rbomData,
            rbomHash
        };
    }

    verifyCrossPackageDerivation(snapshotPaths = [], derivedPaths = []) {
        const normSnapshots = snapshotPaths.map(p => path.normalize(p).toLowerCase().replace(/\\/g, '/'));
        const missingFromSnapshot = [];

        for (const d of derivedPaths) {
            const normD = path.normalize(d).toLowerCase().replace(/\\/g, '/');
            if (normD.includes('/tmp/') || normD.startsWith('tmp/') || normD.includes('sanitized')) {
                continue;
            }
            const isCovered = normSnapshots.some(snap => {
                if (snap === normD) return true;
                if (snap.endsWith('/') && normD.startsWith(snap)) return true;
                if (!snap.endsWith('/') && normD.startsWith(snap + '/')) return true;
                return false;
            });
            if (!isCovered) {
                missingFromSnapshot.push(d);
            }
        }

        return {
            derivedValid: missingFromSnapshot.length === 0,
            missingFromSnapshot,
            checkedCount: derivedPaths.length
        };
    }

    verifyEmbeddedRBOM(zipFilePath) {
        if (!fs.existsSync(zipFilePath)) {
            return { valid: false, reason: `File not found: ${zipFilePath}` };
        }
        const buf = fs.readFileSync(zipFilePath);
        const hasRBOM = buf.includes('RBOM.json');
        const hasProvenance = buf.includes('RELEASE_PROVENANCE.json');
        const hasReleaseManifestYaml = buf.includes('release_manifest.yaml');
        const hasPlatformRegistryYaml = buf.includes('platform_registry.yaml');
        const hasCapabilityRegistryYaml = buf.includes('capability_registry.yaml');
        const hasGovernanceRegistryYaml = buf.includes('governance_registry.yaml');

        const valid = hasRBOM && hasProvenance && hasReleaseManifestYaml && hasPlatformRegistryYaml && hasCapabilityRegistryYaml && hasGovernanceRegistryYaml;

        return {
            valid,
            hasRBOM,
            hasProvenance,
            hasReleaseManifestYaml,
            hasPlatformRegistryYaml,
            hasCapabilityRegistryYaml,
            hasGovernanceRegistryYaml,
            zipFile: path.basename(zipFilePath)
        };
    }

    verifyEmbeddedRBOMPresence(releaseDir) {
        if (!fs.existsSync(releaseDir)) {
            return { valid: false, reason: `Directory not found: ${releaseDir}`, results: [] };
        }
        const files = fs.readdirSync(releaseDir).filter(f => /^(0[1-7]_|eaorcs_external_audit)/.test(f) && f.endsWith('.zip'));
        const results = [];
        let allValid = files.length > 0;

        for (const file of files) {
            const res = this.verifyEmbeddedRBOM(path.join(releaseDir, file));
            results.push(res);
            if (!res.valid) {
                allValid = false;
            }
        }

        return {
            valid: allValid,
            checkedCount: files.length,
            results
        };
    }

    verifyDetachedSignatures(releaseDir, options = {}) {
        let sigExportDir = options.signaturesDir;
        if (!sigExportDir) {
            const tmpDir = path.join(releaseDir, '..', 'tmp', 'signatures_export');
            if (fs.existsSync(tmpDir)) {
                sigExportDir = tmpDir;
            } else {
                sigExportDir = releaseDir;
            }
        }

        const sigFile = path.join(sigExportDir, 'artifact_signatures.json');
        const keyFile = path.join(sigExportDir, 'public_key.pem');

        if (!fs.existsSync(sigFile) || !fs.existsSync(keyFile)) {
            return {
                valid: false,
                reason: `Signature files missing (sigFile: ${fs.existsSync(sigFile)}, keyFile: ${fs.existsSync(keyFile)})`,
                signaturesChecked: 0,
                details: []
            };
        }

        const pubKeyPem = fs.readFileSync(keyFile, 'utf8');
        const sigData = JSON.parse(fs.readFileSync(sigFile, 'utf8'));
        const signaturesMap = sigData.signatures || {};

        const details = [];
        let allValid = Object.keys(signaturesMap).length > 0;

        for (const [artName, rec] of Object.entries(signaturesMap)) {
            const artPath = path.join(releaseDir, artName);
            if (!fs.existsSync(artPath)) {
                details.push({ filename: artName, status: 'MISSING_FILE', valid: false });
                allValid = false;
                continue;
            }

            const fileBuf = fs.readFileSync(artPath);
            const sha256 = crypto.createHash('sha256').update(fileBuf).digest('hex');
            const shaMatches = sha256 === rec.sha256;

            const sigBuf = Buffer.from(rec.signatureHex, 'hex');
            const sigValid = crypto.verify(null, fileBuf, pubKeyPem, sigBuf);

            const recordValid = shaMatches && sigValid;
            if (!recordValid) allValid = false;

            details.push({
                filename: artName,
                sha256Matches: shaMatches,
                signatureValid: sigValid,
                valid: recordValid
            });
        }

        return {
            valid: allValid,
            signaturesChecked: details.length,
            details
        };
    }

    verifyBundleIntegrity(releaseDir) {
        const manifestPath = path.join(releaseDir, 'MANIFEST.json');
        const checksumPath = path.join(releaseDir, 'SHA256SUMS');
        const provenancePath = path.join(releaseDir, 'RELEASE_PROVENANCE.json');
        const rbomPath = path.join(releaseDir, 'RBOM.json');

        const checks = [];
        let valid = true;

        const requiredFiles = [manifestPath, checksumPath, provenancePath, rbomPath];
        for (const rf of requiredFiles) {
            const exists = fs.existsSync(rf);
            checks.push({ name: path.basename(rf), present: exists });
            if (!exists) valid = false;
        }

        if (fs.existsSync(manifestPath) && fs.existsSync(checksumPath)) {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            const shaContent = fs.readFileSync(checksumPath, 'utf8');

            for (const art of manifest.artifacts || []) {
                const artPath = path.join(releaseDir, art.filename);
                if (fs.existsSync(artPath)) {
                    const buf = fs.readFileSync(artPath);
                    const hash = crypto.createHash('sha256').update(buf).digest('hex');
                    const hashMatches = shaContent.includes(hash);
                    checks.push({ name: art.filename, hashMatches });
                    if (!hashMatches) valid = false;
                } else {
                    checks.push({ name: art.filename, present: false });
                    valid = false;
                }
            }
        }

        const embeddedRbomCheck = this.verifyEmbeddedRBOMPresence(releaseDir);
        checks.push({ name: 'embedded_rbom_presence', valid: embeddedRbomCheck.valid, details: embeddedRbomCheck });
        if (!embeddedRbomCheck.valid) valid = false;

        const detachedSigCheck = this.verifyDetachedSignatures(releaseDir);
        checks.push({ name: 'detached_signatures', valid: detachedSigCheck.valid, details: detachedSigCheck });
        if (!detachedSigCheck.valid) valid = false;

        return {
            valid,
            checks,
            verifiedAt: new Date().toISOString()
        };
    }
}

module.exports = ReleaseBundleVerificationEngine;

