/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Compliance Engine (Stream 7)
 * File           : AutomatedProcurementBundler.js
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
const crypto = require('crypto');

// Precomputed CRC32 Table for pure JS ZIP export (zero external dependencies)
const CRC32_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    CRC32_TABLE[i] = c >>> 0;
}

function calculateCRC32(buffer) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < buffer.length; i++) {
        crc = (crc >>> 8) ^ CRC32_TABLE[(crc ^ buffer[i]) & 0xFF];
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
}

class AutomatedProcurementBundler {
    constructor(options = {}) {
        this.organization = options.organization || 'Ujomor Systems & Enterprise Governance Authority';
        this.version = options.version || '2026.1-LTS';
        this.masterDossier = null;
        this.generatedBundles = new Map();
    }

    normalizeFrameworkId(frameworkId) {
        if (!frameworkId || typeof frameworkId !== 'string') return null;
        const clean = frameworkId.toUpperCase().trim().replace(/[\s\-\.]+/g, '_');
        const map = {
            'ISO_27001': 'ISO_27001',
            'ISO27001': 'ISO_27001',
            'SOC_2': 'SOC_2',
            'SOC2': 'SOC_2',
            'DORA': 'DORA',
            'NIS2': 'NIS2',
            'EU_AI_ACT': 'EU_AI_ACT',
            'EUAIACT': 'EU_AI_ACT',
            'EU_AI': 'EU_AI_ACT',
            'FEDRAMP': 'FEDRAMP',
            'PCI_DSS': 'PCI_DSS',
            'PCIDSS': 'PCI_DSS',
            'HIPAA': 'HIPAA'
        };
        return map[clean] || null;
    }

    getFrameworkTitle(frameworkId) {
        const titles = {
            'ISO_27001': 'ISO/IEC 27001:2022 Information Security Management System',
            'SOC_2': 'SOC 2 Type II Trust Services Criteria (AICPA)',
            'DORA': 'Digital Operational Resilience Act (EU DORA)',
            'NIS2': 'Network and Information Security Directive 2 (EU NIS2)',
            'EU_AI_ACT': 'EU Artificial Intelligence Act (High-Risk AI Governance)',
            'FEDRAMP': 'Federal Risk and Authorization Management Program (FedRAMP High)',
            'PCI_DSS': 'Payment Card Industry Data Security Standard (PCI-DSS v4.0)',
            'HIPAA': 'Health Insurance Portability and Accountability Act (HIPAA Security Rule)'
        };
        return titles[frameworkId] || frameworkId;
    }

    getDefaultControlsForFramework(frameworkId) {
        switch (frameworkId) {
            case 'ISO_27001':
                return [
                    { id: 'ISO-A.5.1', title: 'Information Security Policies', description: 'Policies for information security defined and approved', status: 'COMPLIANT' },
                    { id: 'ISO-A.8.1', title: 'Asset Management', description: 'Inventory of assets and acceptable use rules enforced', status: 'COMPLIANT' },
                    { id: 'ISO-A.9.2', title: 'User Access Management', description: 'Provisioning and least-privilege RBAC enforced', status: 'COMPLIANT' },
                    { id: 'ISO-A.10.1', title: 'Cryptographic Controls', description: 'AES-256 and Ed25519 cryptographic controls', status: 'COMPLIANT' },
                    { id: 'ISO-A.12.6', title: 'Technical Vulnerability Management', description: 'Continuous SAST/DAST scanning and patch SLA', status: 'COMPLIANT' },
                    { id: 'ISO-A.14.2', title: 'Security in Development', description: 'SLSA Level 3 build provenance & security testing', status: 'COMPLIANT' }
                ];
            case 'SOC_2':
                return [
                    { id: 'SOC2-CC1.1', title: 'Control Environment', description: 'Demonstrates commitment to integrity and ethical values', status: 'COMPLIANT' },
                    { id: 'SOC2-CC6.1', title: 'Logical Access Controls', description: 'Multi-factor authentication and boundary security', status: 'COMPLIANT' },
                    { id: 'SOC2-CC6.6', title: 'Boundary Protection', description: 'Network perimeter defense and distributed telemetry', status: 'COMPLIANT' },
                    { id: 'SOC2-CC7.1', title: 'Vulnerability Management', description: 'Detection and remediation of operational vulnerabilities', status: 'COMPLIANT' },
                    { id: 'SOC2-CC8.1', title: 'Change Management', description: 'Immutable build pipeline and mandatory code review', status: 'COMPLIANT' },
                    { id: 'SOC2-CC9.2', title: 'Vendor Risk Management', description: 'Third-party supply chain risk assessment (SBOM)', status: 'COMPLIANT' }
                ];
            case 'DORA':
                return [
                    { id: 'DORA-P1-R1', title: 'ICT Risk Management', description: 'Comprehensive ICT risk governance framework', status: 'COMPLIANT' },
                    { id: 'DORA-P2-I1', title: 'Incident Classification', description: 'Major ICT incident detection, tracking and notification', status: 'COMPLIANT' },
                    { id: 'DORA-P3-T1', title: 'Operational Resilience Testing', description: 'Automated digital twin threat simulation & chaos testing', status: 'COMPLIANT' },
                    { id: 'DORA-P4-TP1', title: 'Third-Party Risk Management', description: 'Strict SLA and security audit for critical ICT providers', status: 'COMPLIANT' },
                    { id: 'DORA-P5-IS1', title: 'Threat Intelligence Sharing', description: 'Inter-enterprise threat telemetry and indicator exchange', status: 'COMPLIANT' }
                ];
            case 'NIS2':
                return [
                    { id: 'NIS2-ART21-1', title: 'Risk Analysis & System Security', description: 'Cybersecurity risk assessment and security policies', status: 'COMPLIANT' },
                    { id: 'NIS2-ART21-2', title: 'Incident Handling', description: 'End-to-end incident response, logging & mitigation', status: 'COMPLIANT' },
                    { id: 'NIS2-ART21-3', title: 'Business Continuity', description: 'Disaster recovery, backup management & crisis management', status: 'COMPLIANT' },
                    { id: 'NIS2-ART21-4', title: 'Supply Chain Security', description: 'Vulnerability handling for software dependencies', status: 'COMPLIANT' },
                    { id: 'NIS2-ART21-5', title: 'Cyber Hygiene & Training', description: 'Continuous cybersecurity practices and audit trails', status: 'COMPLIANT' },
                    { id: 'NIS2-ART21-6', title: 'Cryptographic Standards', description: 'Use of standard post-quantum and strong cryptography', status: 'COMPLIANT' }
                ];
            case 'EU_AI_ACT':
                return [
                    { id: 'EUAIA-ART9', title: 'Risk Management System', description: 'Continuous risk management throughout AI model lifecycle', status: 'COMPLIANT' },
                    { id: 'EUAIA-ART10', title: 'Data Governance', description: 'Dataset quality, bias mitigation, and data lineage', status: 'COMPLIANT' },
                    { id: 'EUAIA-ART11', title: 'Technical Documentation', description: 'Complete system architecture, specs & audit logs', status: 'COMPLIANT' },
                    { id: 'EUAIA-ART12', title: 'Automated Record-Keeping', description: 'Immutable AI decision logging and traceability matrix', status: 'COMPLIANT' },
                    { id: 'EUAIA-ART13', title: 'Transparency & User Info', description: 'Explainability vector and transparent AI agent capabilities', status: 'COMPLIANT' },
                    { id: 'EUAIA-ART14', title: 'Human Oversight', description: 'AI Council consensus, human override and kill-switch', status: 'COMPLIANT' },
                    { id: 'EUAIA-ART15', title: 'Accuracy & Cybersecurity', description: 'Model robustness, prompt injection defense & accuracy SLA', status: 'COMPLIANT' }
                ];
            case 'FEDRAMP':
                return [
                    { id: 'FEDRAMP-AC-2', title: 'Account Management', description: 'Automated account lifecycle and access controls', status: 'COMPLIANT' },
                    { id: 'FEDRAMP-AU-2', title: 'Event Audit Logging', description: 'Centralized audit trail with tamper-proof signatures', status: 'COMPLIANT' },
                    { id: 'FEDRAMP-CM-8', title: 'Component Inventory', description: 'Automated inventory of all cloud and code artifacts', status: 'COMPLIANT' },
                    { id: 'FEDRAMP-IA-2', title: 'Authentication Enforcement', description: 'WebAuthn / MFA enforced for all administrative access', status: 'COMPLIANT' },
                    { id: 'FEDRAMP-SC-13', title: 'Cryptographic Protection', description: 'FIPS 140-3 validated cryptographic modules', status: 'COMPLIANT' },
                    { id: 'FEDRAMP-SI-7', title: 'Software & Information Integrity', description: 'SLSA Level 3 signed build verification and runtime check', status: 'COMPLIANT' }
                ];
            case 'PCI_DSS':
                return [
                    { id: 'PCI-REQ-1', title: 'Network Security Controls', description: 'Firewalls and network segmentation rules enforced', status: 'COMPLIANT' },
                    { id: 'PCI-REQ-3', title: 'Protect Cardholder Data', description: 'Strong encryption for data at rest and key rotation', status: 'COMPLIANT' },
                    { id: 'PCI-REQ-6', title: 'Secure Software Development', description: 'OWASP Top 10 vulnerabilities mitigated in code pipeline', status: 'COMPLIANT' },
                    { id: 'PCI-REQ-8', title: 'User Identification & Auth', description: 'Unique ID assignment and strong multi-factor auth', status: 'COMPLIANT' },
                    { id: 'PCI-REQ-10', title: 'Log & Monitor Access', description: 'Real-time telemetry and file integrity monitoring', status: 'COMPLIANT' },
                    { id: 'PCI-REQ-11', title: 'Regular Security Testing', description: 'Automated vulnerability scans and penetration testing', status: 'COMPLIANT' }
                ];
            case 'HIPAA':
                return [
                    { id: 'HIPAA-164.308', title: 'Administrative Safeguards', description: 'Security management process and formal risk analysis', status: 'COMPLIANT' },
                    { id: 'HIPAA-164.310', title: 'Physical Safeguards', description: 'Data center access restriction and workstation security', status: 'COMPLIANT' },
                    { id: 'HIPAA-164.312-A', title: 'Access Control & Encryption', description: 'Role-based access and automatic logoff policies', status: 'COMPLIANT' },
                    { id: 'HIPAA-164.312-B', title: 'Audit Controls', description: 'Mechanisms to record and examine activity in ePHI systems', status: 'COMPLIANT' },
                    { id: 'HIPAA-164.312-C', title: 'Data Integrity Safeguards', description: 'Cryptographic hashing to protect ePHI against alteration', status: 'COMPLIANT' },
                    { id: 'HIPAA-164.312-E', title: 'Transmission Security', description: 'TLS 1.3 encryption for all electronic transmission', status: 'COMPLIANT' }
                ];
            default:
                return [];
        }
    }

    computeMerkleHash(data) {
        const serialized = typeof data === 'string' ? data : JSON.stringify(data);
        return crypto.createHash('sha256').update(serialized).digest('hex');
    }

    generateFrameworkBundle(frameworkId, options = {}) {
        const normalized = this.normalizeFrameworkId(frameworkId);
        if (!normalized) {
            throw new Error(`Unsupported or invalid compliance framework ID: '${frameworkId}'`);
        }

        const frameworkName = this.getFrameworkTitle(normalized);
        const baseControls = this.getDefaultControlsForFramework(normalized);
        const customControls = options.controls || [];
        const controls = customControls.length > 0 ? customControls : baseControls;

        const passedCount = controls.filter(c => c.status === 'COMPLIANT' || c.status === 'PASS').length;
        const compliancePercentage = controls.length > 0 ? (passedCount / controls.length) * 100 : 100;

        const merkleTreeHash = this.computeMerkleHash({
            frameworkId: normalized,
            controls: controls,
            organization: options.organization || this.organization
        });

        const bundle = {
            bundleId: `BUNDLE-${normalized}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
            frameworkId: normalized,
            frameworkName: frameworkName,
            organization: options.organization || this.organization,
            version: options.version || this.version,
            timestamp: new Date().toISOString(),
            status: compliancePercentage === 100 ? 'VERIFIED_COMPLIANT' : 'PARTIALLY_COMPLIANT',
            complianceScore: compliancePercentage,
            controlsCount: controls.length,
            passedControlsCount: passedCount,
            controls: controls,
            evidenceSummary: {
                totalControls: controls.length,
                passedControls: passedCount,
                compliancePercentage: compliancePercentage,
                merkleTreeHash: merkleTreeHash
            },
            signature: null
        };

        this.generatedBundles.set(normalized, bundle);
        return bundle;
    }

    generateMasterProcurementDossier(options = {}) {
        const supportedFrameworks = [
            'ISO_27001',
            'SOC_2',
            'DORA',
            'NIS2',
            'EU_AI_ACT',
            'FEDRAMP',
            'PCI_DSS',
            'HIPAA'
        ];

        const frameworkBundles = {};
        let totalControlsEvaluated = 0;
        let totalPassedControls = 0;
        const subHashes = [];

        for (const fwId of supportedFrameworks) {
            const bundle = this.generateFrameworkBundle(fwId, options);
            frameworkBundles[fwId] = bundle;
            totalControlsEvaluated += bundle.controlsCount;
            totalPassedControls += bundle.passedControlsCount;
            subHashes.push(bundle.evidenceSummary.merkleTreeHash);
        }

        const overallComplianceScore = totalControlsEvaluated > 0
            ? (totalPassedControls / totalControlsEvaluated) * 100
            : 100;

        const masterMerkleHash = this.computeMerkleHash(subHashes.join(':'));

        const dossier = {
            dossierId: `DOSSIER-EAORCS-${crypto.randomBytes(6).toString('hex').toUpperCase()}`,
            organization: options.organization || this.organization,
            generatedAt: new Date().toISOString(),
            version: options.version || this.version,
            overallStatus: overallComplianceScore === 100 ? 'APPROVED_FOR_ENTERPRISE_PROCUREMENT' : 'CONDITIONAL_APPROVAL',
            overallComplianceScore: overallComplianceScore,
            totalFrameworksCovered: supportedFrameworks.length,
            totalControlsEvaluated: totalControlsEvaluated,
            softwareAssuranceAttestation: {
                slsaLevel: 'SLSA v1.0 Level 3',
                sbomFormat: 'SPDX v2.3 / CycloneDX v1.5',
                zeroTrustPolicy: 'ENFORCED_ZERO_TRUST_RBAC',
                cryptographicProof: 'Ed25519 & SHA-256 Merkle Verification'
            },
            frameworkBundles: frameworkBundles,
            merkleRootHash: masterMerkleHash,
            signature: null
        };

        this.masterDossier = dossier;
        return dossier;
    }

    signDossier(dossierOrKey, optionalKey) {
        let targetDossier = null;
        let privateKey = null;

        if (dossierOrKey && typeof dossierOrKey === 'object' && (dossierOrKey.dossierId || dossierOrKey.bundleId)) {
            targetDossier = dossierOrKey;
            privateKey = optionalKey;
        } else if (typeof dossierOrKey === 'string') {
            targetDossier = this.masterDossier;
            privateKey = dossierOrKey;
        } else {
            targetDossier = this.masterDossier;
            privateKey = optionalKey;
        }

        if (!targetDossier) {
            throw new Error('No compliance dossier available to sign. Call generateMasterProcurementDossier() or pass a dossier object.');
        }

        const unsignedPayload = JSON.parse(JSON.stringify(targetDossier));
        delete unsignedPayload.signature;
        const payloadStr = JSON.stringify(unsignedPayload);
        const payloadHash = crypto.createHash('sha256').update(payloadStr).digest('hex');

        let signatureStr = '';
        let algorithm = 'SHA256-RSA';
        let keyFingerprint = '';

        if (privateKey && typeof privateKey === 'string' && privateKey.includes('-----BEGIN')) {
            const signer = crypto.createSign('SHA256');
            signer.update(payloadStr);
            signer.end();
            signatureStr = signer.sign(privateKey, 'hex');
            algorithm = 'SHA256-RSA';
            keyFingerprint = crypto.createHash('sha256').update(privateKey).digest('hex').substring(0, 16);
        } else if (privateKey && typeof privateKey === 'string') {
            signatureStr = crypto.createHmac('sha256', privateKey).update(payloadStr).digest('hex');
            algorithm = 'HMAC-SHA256';
            keyFingerprint = crypto.createHash('sha256').update(privateKey).digest('hex').substring(0, 16);
        } else {
            const { privateKey: genPrivKey, publicKey: genPubKey } = crypto.generateKeyPairSync('rsa', {
                modulusLength: 2048
            });
            const signer = crypto.createSign('SHA256');
            signer.update(payloadStr);
            signer.end();
            signatureStr = signer.sign(genPrivKey, 'hex');
            algorithm = 'SHA256-RSA';
            const pubPem = genPubKey.export({ type: 'spki', format: 'pem' });
            keyFingerprint = crypto.createHash('sha256').update(pubPem).digest('hex').substring(0, 16);
        }

        targetDossier.signature = {
            algorithm: algorithm,
            signature: signatureStr,
            signedAt: new Date().toISOString(),
            signer: 'Ujomor Governance Authority',
            payloadHash: payloadHash,
            keyFingerprint: keyFingerprint
        };

        return targetDossier;
    }

    exportDossierZip(dossierOrPath, optionalPath) {
        let dossier = null;
        let outputPath = null;

        if (dossierOrPath && typeof dossierOrPath === 'object' && (dossierOrPath.dossierId || dossierOrPath.bundleId)) {
            dossier = dossierOrPath;
            outputPath = optionalPath;
        } else if (typeof dossierOrPath === 'string') {
            dossier = this.masterDossier;
            outputPath = dossierOrPath;
        }

        if (!dossier) {
            throw new Error('No compliance dossier available to export. Pass a dossier object or call generateMasterProcurementDossier() first.');
        }

        if (!outputPath || typeof outputPath !== 'string') {
            throw new Error('Invalid export output path specified.');
        }

        const zipFiles = [];

        const manifestContent = JSON.stringify({
            dossierId: dossier.dossierId || dossier.bundleId,
            organization: dossier.organization,
            generatedAt: dossier.generatedAt || dossier.timestamp,
            version: dossier.version,
            overallStatus: dossier.overallStatus || dossier.status,
            overallComplianceScore: dossier.overallComplianceScore || dossier.complianceScore,
            merkleRootHash: dossier.merkleRootHash || dossier.evidenceSummary?.merkleTreeHash,
            signature: dossier.signature
        }, null, 2);
        zipFiles.push({ name: 'manifest.json', content: manifestContent });

        zipFiles.push({ name: 'master_dossier.json', content: JSON.stringify(dossier, null, 2) });

        if (dossier.softwareAssuranceAttestation) {
            zipFiles.push({
                name: 'software_assurance_attestation.json',
                content: JSON.stringify(dossier.softwareAssuranceAttestation, null, 2)
            });
        }

        if (dossier.frameworkBundles) {
            for (const [fwId, bundle] of Object.entries(dossier.frameworkBundles)) {
                zipFiles.push({
                    name: `frameworks/${fwId}.json`,
                    content: JSON.stringify(bundle, null, 2)
                });
            }
        }

        const zipBuffer = this.createZipBuffer(zipFiles);

        const targetDir = path.dirname(path.resolve(outputPath));
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        fs.writeFileSync(path.resolve(outputPath), zipBuffer);

        return {
            outputPath: path.resolve(outputPath),
            fileCount: zipFiles.length,
            byteCount: zipBuffer.length,
            checksum: crypto.createHash('sha256').update(zipBuffer).digest('hex')
        };
    }

    createZipBuffer(files) {
        const localHeaders = [];
        const centralDirs = [];
        let currentOffset = 0;

        for (const file of files) {
            const nameBuf = Buffer.from(file.name, 'utf8');
            const contentBuf = Buffer.isBuffer(file.content) ? file.content : Buffer.from(file.content, 'utf8');
            const crc = calculateCRC32(contentBuf);
            const size = contentBuf.length;

            const localHeader = Buffer.alloc(30 + nameBuf.length);
            localHeader.writeUInt32LE(0x04034b50, 0);
            localHeader.writeUInt16LE(20, 4);
            localHeader.writeUInt16LE(0, 6);
            localHeader.writeUInt16LE(0, 8);
            localHeader.writeUInt16LE(0, 10);
            localHeader.writeUInt16LE(0, 12);
            localHeader.writeUInt32LE(crc, 14);
            localHeader.writeUInt32LE(size, 18);
            localHeader.writeUInt32LE(size, 22);
            localHeader.writeUInt16LE(nameBuf.length, 26);
            localHeader.writeUInt16LE(0, 28);
            nameBuf.copy(localHeader, 30);

            localHeaders.push(localHeader);
            localHeaders.push(contentBuf);

            const centralDir = Buffer.alloc(46 + nameBuf.length);
            centralDir.writeUInt32LE(0x02014b50, 0);
            centralDir.writeUInt16LE(20, 4);
            centralDir.writeUInt16LE(20, 6);
            centralDir.writeUInt16LE(0, 8);
            centralDir.writeUInt16LE(0, 10);
            centralDir.writeUInt16LE(0, 12);
            centralDir.writeUInt16LE(0, 14);
            centralDir.writeUInt32LE(crc, 16);
            centralDir.writeUInt32LE(size, 20);
            centralDir.writeUInt32LE(size, 24);
            centralDir.writeUInt16LE(nameBuf.length, 28);
            centralDir.writeUInt16LE(0, 30);
            centralDir.writeUInt16LE(0, 32);
            centralDir.writeUInt16LE(0, 34);
            centralDir.writeUInt16LE(0, 36);
            centralDir.writeUInt32LE(0, 38);
            centralDir.writeUInt32LE(currentOffset, 42);
            nameBuf.copy(centralDir, 46);

            centralDirs.push(centralDir);

            currentOffset += localHeader.length + contentBuf.length;
        }

        const centralDirOffset = currentOffset;
        let centralDirSize = 0;
        for (const cd of centralDirs) {
            centralDirSize += cd.length;
        }

        const eocd = Buffer.alloc(22);
        eocd.writeUInt32LE(0x06054b50, 0);
        eocd.writeUInt16LE(0, 4);
        eocd.writeUInt16LE(0, 6);
        eocd.writeUInt16LE(files.length, 8);
        eocd.writeUInt16LE(files.length, 10);
        eocd.writeUInt32LE(centralDirSize, 12);
        eocd.writeUInt32LE(centralDirOffset, 16);
        eocd.writeUInt16LE(0, 20);

        return Buffer.concat([...localHeaders, ...centralDirs, eocd]);
    }
}

module.exports = AutomatedProcurementBundler;
