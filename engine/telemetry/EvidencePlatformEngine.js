/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Evidence Platform
 * File           : EvidencePlatformEngine.js
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
 * CORP: Stream S7
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/
const crypto = require('crypto');

class EvidencePlatformEngine {
    constructor() {
        this.packages = new Map();
        this.packageTypes = [
            'ExternalAudit',
            'InternalAudit',
            'EvidenceOnly',
            'Marketplace',
            'CustomerDelivery',
            'GovernmentSubmission',
            'SBOMOnly',
            'LegalPackage'
        ];
        this.artifactTypes = [
            'ReleaseManifest',
            'QualificationReport',
            'GovernanceSnapshot',
            'WorkspaceGraph',
            'SBOM',
            'HashManifest',
            'LicenseManifest',
            'DependencyManifest',
            'DigitalSignature',
            'CertificationSummary',
            'PlatformMetadata'
        ];
    }

    createEvidencePackage(packageType, releaseId, content) {
        if (!this.packageTypes.includes(packageType)) {
            throw new Error(`Unsupported package type: ${packageType}`);
        }
        const packageId = crypto.randomUUID();
        const pkg = {
            packageId,
            packageType,
            releaseId,
            content,
            artifacts: [],
            sealed: false,
            packageHash: null
        };
        this.packages.set(packageId, pkg);
        return pkg;
    }

    addArtifact(packageId, artifactType, content) {
        const pkg = this.packages.get(packageId);
        if (!pkg) {
            throw new Error(`Package ${packageId} not found`);
        }
        if (pkg.sealed) {
            throw new Error('Cannot add artifact to sealed package');
        }
        if (!this.artifactTypes.includes(artifactType)) {
            throw new Error(`Unsupported artifact type: ${artifactType}`);
        }
        const artifactHash = crypto.createHash('sha256').update(JSON.stringify(content || {})).digest('hex');
        pkg.artifacts.push({
            artifactType,
            content,
            artifactHash
        });
        return pkg.artifacts[pkg.artifacts.length - 1];
    }

    sealPackage(packageId) {
        const pkg = this.packages.get(packageId);
        if (!pkg) {
            throw new Error(`Package ${packageId} not found`);
        }
        if (pkg.sealed) {
            return pkg.packageHash;
        }
        
        const dataToHash = {
            packageType: pkg.packageType,
            releaseId: pkg.releaseId,
            content: pkg.content,
            artifacts: pkg.artifacts.map(a => ({ type: a.artifactType, hash: a.artifactHash }))
        };
        
        pkg.packageHash = crypto.createHash('sha256').update(JSON.stringify(dataToHash)).digest('hex');
        pkg.sealed = true;
        return pkg.packageHash;
    }

    verifyPackageIntegrity(packageId) {
        const pkg = this.packages.get(packageId);
        if (!pkg) {
            throw new Error(`Package ${packageId} not found`);
        }
        if (!pkg.sealed) {
            return { valid: false, packageHash: null };
        }
        
        const dataToHash = {
            packageType: pkg.packageType,
            releaseId: pkg.releaseId,
            content: pkg.content,
            artifacts: pkg.artifacts.map(a => ({ type: a.artifactType, hash: a.artifactHash }))
        };
        
        const computedHash = crypto.createHash('sha256').update(JSON.stringify(dataToHash)).digest('hex');
        const valid = computedHash === pkg.packageHash;
        return { valid, packageHash: computedHash };
    }

    getPackageManifest(packageId) {
        const pkg = this.packages.get(packageId);
        if (!pkg) {
            throw new Error(`Package ${packageId} not found`);
        }
        return pkg;
    }

    listPackageTypes() {
        return this.packageTypes;
    }

    buildEvidenceChain(stages = []) {
        const crypto = require('crypto');
        const chain = [];
        let previousHash = '0'.repeat(64);
        for (const stage of stages) {
            const stageHash = crypto.createHash('sha256')
                .update(JSON.stringify(stage.content || {}) + previousHash)
                .digest('hex');
            chain.push({ stageId: stage.stageId, stageHash, previousHash, linkedAt: new Date().toISOString() });
            previousHash = stageHash;
        }
        return { chainLength: chain.length, genesisHash: '0'.repeat(64), terminalHash: previousHash, chain };
    }

    verifyChainIntegrity(chainResult) {
        const crypto = require('crypto');
        const { chain } = chainResult;
        if (!chain || chain.length === 0) return { valid: true, brokenAt: null, message: 'Empty chain' };
        let expectedPrev = '0'.repeat(64);
        for (const link of chain) {
            if (link.previousHash !== expectedPrev) return { valid: false, brokenAt: link.stageId };
            expectedPrev = link.stageHash;
        }
        return { valid: true, brokenAt: null, chainLength: chain.length, terminalHash: expectedPrev };
    }

    getChainProvenance(chainResult) {
        return {
            provenance: (chainResult.chain || []).map((link, i) => ({
                step: i + 1, stageId: link.stageId, linkedAt: link.linkedAt,
                stageHash: link.stageHash.slice(0, 16) + '...'
            })),
            chainLength: chainResult.chainLength,
            terminalHash: chainResult.terminalHash
        };
    }
}

module.exports = EvidencePlatformEngine;
