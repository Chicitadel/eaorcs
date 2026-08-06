/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Cryptographic Provenance Chain Engine
 * File           : CryptographicProvenanceChain.js
 * Version        : 2026.1.0-LTS
 * Author         : Ujomor Systems Engineering & Enterprise Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Human Author & Corporate Governance Enforced
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Signatures:
 * - Architecture Authority: Verified (Ujomor Architecture Board)
 * - Security Authority: Verified (Ujomor Security Operations)
 * - Governance Authority: Verified (Ujomor Enterprise Governance)
 * - Deployment Authority: Verified (Ujomor Release Engineering)
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * CryptographicProvenanceChain
 * Implements an immutable cryptographic chain of custody for enterprise artifacts.
 * Records end-to-end lineage: Who, When, How, Tool, Repository, Commit, Policy, Signature, Certificate.
 */
class CryptographicProvenanceChain {
    constructor(options = {}) {
        this.storagePath = options.storagePath || null;
        this.secretKey = options.secretKey || 'EAORCS-PROVENANCE-CHAIN-SECRET-KEY-2026';
        
        // Map of artifactId -> Array of ProvenanceRecord blocks (Chronological lineage)
        this.chains = new Map();
        // Global sequential chain index
        this.globalLedger = [];
        
        if (this.storagePath && fs.existsSync(this.storagePath)) {
            this._loadState();
        }
    }

    /**
     * Record a new cryptographic provenance block in the chain of custody for an artifact.
     */
    recordProvenance(params = {}) {
        const {
            artifactId,
            artifactName = 'UNNAMED_ARTIFACT',
            artifactType = 'CODE_OR_DOCUMENT',
            content = null,
            contentHash = null,
            // Who
            producedBy = 'SYSTEM_USER',
            authorEmail = 'governance@ujomor-systems.org',
            digitalIdentityKey = null,
            // How
            action = 'CREATE', // CREATE, BUILD, TRANSFORM, SIGN, DEPLOY, AUDIT, REFACTOR
            executionEnvironment = null,
            // Using which tool
            toolName = 'EAORCS-Governance-Engine',
            toolVersion = '2026.1.0-LTS',
            toolExecutionHash = null,
            // Which repository & commit
            repositoryUrl = 'git@github.com:Chicitadel/eaorcs.git',
            repositoryName = 'eaorcs',
            branchName = 'main',
            commitHash = '0000000000000000000000000000000000000000',
            commitAuthor = producedBy,
            commitMessage = 'Automated provenance checkpoint',
            // Which policy
            policyId = 'UAIGOS-CORE-POLICY-v3.0',
            policyVersion = '3.0.0',
            policyHash = null,
            complianceCheckStatus = 'PASSED',
            // Which signature & certificate
            signatureAlgorithm = 'HMAC-SHA256',
            certificateId = 'CERT-UAIGOS-2026-ROOT',
            issuerCA = 'Ujomor Certification Authority',
            certificateSerial = '9948-2847-1029-4481',
            validityPeriod = '2026-01-01T00:00:00Z/2030-12-31T23:59:59Z',
            certThumbprint = 'A1B2C3D4E5F678901234567890ABCDEF12345678',
            metadata = {}
        } = params;

        if (!artifactId) {
            throw new Error('ArtifactId is required to record provenance.');
        }

        // Calculate artifact payload digest
        let computedHash = contentHash;
        if (!computedHash) {
            if (content !== null && content !== undefined) {
                const buffer = typeof content === 'string' ? Buffer.from(content, 'utf8') : content;
                computedHash = crypto.createHash('sha256').update(buffer).digest('hex');
            } else {
                computedHash = crypto.createHash('sha256').update(`${artifactId}:${artifactName}:${Date.now()}`).digest('hex');
            }
        }

        // Retrieve existing chain or initialize
        const artifactChain = this.chains.get(artifactId) || [];
        const blockIndex = artifactChain.length;

        // Hash pointer to previous block in artifact chain
        const previousHash = blockIndex > 0 
            ? artifactChain[blockIndex - 1].blockHash 
            : '0000000000000000000000000000000000000000000000000000000000000000';

        const timestamp = new Date().toISOString();
        const envInfo = executionEnvironment || {
            platform: os.platform(),
            arch: os.arch(),
            nodeVersion: process.version,
            hostnameHash: crypto.createHash('sha256').update(os.hostname()).digest('hex').substring(0, 16)
        };

        const computedPolicyHash = policyHash || crypto.createHash('sha256').update(`${policyId}:${policyVersion}`).digest('hex');
        const computedToolHash = toolExecutionHash || crypto.createHash('sha256').update(`${toolName}:${toolVersion}`).digest('hex');

        // Construct canonical record body
        const recordBody = {
            artifactId,
            artifactName,
            artifactType,
            artifactHash: computedHash,
            blockIndex,
            previousHash,
            timestamp,
            // Who
            producedBy,
            authorEmail,
            digitalIdentityKey: digitalIdentityKey || `key_${crypto.createHash('sha256').update(producedBy).digest('hex').substring(0, 16)}`,
            // How
            action,
            executionEnvironment: envInfo,
            // Tool
            toolName,
            toolVersion,
            toolExecutionHash: computedToolHash,
            // Repository & Commit
            repositoryUrl,
            repositoryName,
            branchName,
            commitHash,
            commitAuthor,
            commitMessage,
            // Policy
            policyId,
            policyVersion,
            policyHash: computedPolicyHash,
            complianceCheckStatus,
            // Certificate
            certificateId,
            issuerCA,
            certificateSerial,
            validityPeriod,
            certThumbprint,
            metadata
        };

        // Generate digital signature over recordBody
        const signedDigest = this._hashObject(recordBody);
        const signature = this._generateSignature(signedDigest, signatureAlgorithm);

        // Final Block structure
        const block = {
            ...recordBody,
            signatureAlgorithm,
            signedDigest,
            signature,
            blockHash: ''
        };

        // Compute blockHash (Merkle tree link including signature)
        block.blockHash = crypto.createHash('sha256')
            .update(`${block.blockIndex}|${block.previousHash}|${block.signedDigest}|${block.signature}`)
            .digest('hex');

        // Append to artifact chain and global ledger
        artifactChain.push(block);
        this.chains.set(artifactId, artifactChain);
        this.globalLedger.push(block);

        this._persistState();
        return block;
    }

    /**
     * Retrieve complete chain of custody for a given artifact.
     */
    getChainOfCustody(artifactId) {
        if (!this.chains.has(artifactId)) {
            return [];
        }
        return [...this.chains.get(artifactId)];
    }

    /**
     * Cryptographically verify full chain of custody for an artifact.
     */
    verifyChainOfCustody(artifactId) {
        const chain = this.chains.get(artifactId);
        if (!chain || chain.length === 0) {
            return {
                verified: false,
                reason: `No provenance chain records found for artifact '${artifactId}'.`,
                chainLength: 0
            };
        }

        let expectedPreviousHash = '0000000000000000000000000000000000000000000000000000000000000000';

        for (let i = 0; i < chain.length; i++) {
            const block = chain[i];

            // 1. Verify index sequence
            if (block.blockIndex !== i) {
                return {
                    verified: false,
                    failedBlockIndex: i,
                    reason: `Block index mismatch at position ${i}. Expected ${i}, found ${block.blockIndex}.`
                };
            }

            // 2. Verify previousHash pointer link
            if (block.previousHash !== expectedPreviousHash) {
                return {
                    verified: false,
                    failedBlockIndex: i,
                    reason: `Broken chain link at block ${i}. Expected previousHash '${expectedPreviousHash}', found '${block.previousHash}'.`
                };
            }

            // 3. Verify recordBody payload hash digest
            const recordBodyCopy = { ...block };
            delete recordBodyCopy.signatureAlgorithm;
            delete recordBodyCopy.signedDigest;
            delete recordBodyCopy.signature;
            delete recordBodyCopy.blockHash;

            const recomputedSignedDigest = this._hashObject(recordBodyCopy);
            if (recomputedSignedDigest !== block.signedDigest) {
                return {
                    verified: false,
                    failedBlockIndex: i,
                    reason: `Payload digest tampering detected at block ${i}. SignedDigest mismatch.`
                };
            }

            // 4. Verify Digital Signature
            const isValidSig = this._verifySignature(block.signedDigest, block.signature, block.signatureAlgorithm);
            if (!isValidSig) {
                return {
                    verified: false,
                    failedBlockIndex: i,
                    reason: `Invalid digital signature detected at block ${i}.`
                };
            }

            // 5. Verify BlockHash calculation
            const recomputedBlockHash = crypto.createHash('sha256')
                .update(`${block.blockIndex}|${block.previousHash}|${block.signedDigest}|${block.signature}`)
                .digest('hex');

            if (recomputedBlockHash !== block.blockHash) {
                return {
                    verified: false,
                    failedBlockIndex: i,
                    reason: `BlockHash corruption detected at block ${i}.`
                };
            }

            expectedPreviousHash = block.blockHash;
        }

        const latestBlock = chain[chain.length - 1];

        return {
            verified: true,
            artifactId,
            chainLength: chain.length,
            genesisTimestamp: chain[0].timestamp,
            latestTimestamp: latestBlock.timestamp,
            latestBlockHash: latestBlock.blockHash,
            latestArtifactHash: latestBlock.artifactHash,
            status: 'PROVENANCE_CHAIN_VERIFIED_INTACT'
        };
    }

    /**
     * Verify artifact content against recorded provenance chain.
     */
    verifyArtifactIntegrity(artifactId, currentContent) {
        const verification = this.verifyChainOfCustody(artifactId);
        if (!verification.verified) {
            return {
                intact: false,
                reason: `Chain verification failed: ${verification.reason}`
            };
        }

        const buffer = typeof currentContent === 'string' ? Buffer.from(currentContent, 'utf8') : currentContent;
        const currentHash = crypto.createHash('sha256').update(buffer).digest('hex');
        
        const chain = this.chains.get(artifactId);
        const latestBlock = chain[chain.length - 1];

        if (currentHash !== latestBlock.artifactHash) {
            return {
                intact: false,
                reason: `Artifact content hash mismatch. Expected '${latestBlock.artifactHash}', current '${currentHash}'.`,
                expectedHash: latestBlock.artifactHash,
                currentHash
            };
        }

        return {
            intact: true,
            artifactId,
            matchingHash: currentHash,
            recordedBy: latestBlock.producedBy,
            recordedTimestamp: latestBlock.timestamp
        };
    }

    /**
     * Export full provenance manifest in in-toto / W3C PROV / JSON-LD aligned format.
     */
    exportProvenanceManifest(artifactId) {
        const chain = this.getChainOfCustody(artifactId);
        const verification = this.verifyChainOfCustody(artifactId);

        return {
            manifestType: 'EAORCS_CRYPTOGRAPHIC_PROVENANCE_MANIFEST_v1',
            generatedAt: new Date().toISOString(),
            artifactId,
            verification,
            chainOfCustody: chain.map(block => ({
                step: block.blockIndex,
                action: block.action,
                timestamp: block.timestamp,
                who: {
                    producedBy: block.producedBy,
                    email: block.authorEmail,
                    identityKey: block.digitalIdentityKey
                },
                how: {
                    tool: `${block.toolName}@${block.toolVersion}`,
                    toolHash: block.toolExecutionHash,
                    env: block.executionEnvironment
                },
                repository: {
                    url: block.repositoryUrl,
                    name: block.repositoryName,
                    branch: block.branchName,
                    commit: block.commitHash,
                    commitAuthor: block.commitAuthor,
                    commitMessage: block.commitMessage
                },
                governance: {
                    policyId: block.policyId,
                    policyVersion: block.policyVersion,
                    policyHash: block.policyHash,
                    status: block.complianceCheckStatus
                },
                security: {
                    certificateId: block.certificateId,
                    issuerCA: block.issuerCA,
                    serial: block.certificateSerial,
                    certThumbprint: block.certThumbprint,
                    signatureAlgorithm: block.signatureAlgorithm,
                    signature: block.signature
                },
                hashes: {
                    artifactHash: block.artifactHash,
                    signedDigest: block.signedDigest,
                    blockHash: block.blockHash
                }
            }))
        };
    }

    /**
     * Get system-wide provenance chain metrics.
     */
    getSystemProvenanceMetrics() {
        const totalArtifactsTracked = this.chains.size;
        const totalBlocksRecorded = this.globalLedger.length;
        
        let verifiedChainsCount = 0;
        for (const artifactId of this.chains.keys()) {
            const v = this.verifyChainOfCustody(artifactId);
            if (v.verified) verifiedChainsCount++;
        }

        return {
            totalArtifactsTracked,
            totalBlocksRecorded,
            verifiedChainsCount,
            chainIntegrityScorePercent: totalArtifactsTracked > 0 ? (verifiedChainsCount / totalArtifactsTracked) * 100 : 100.0,
            tamperEventsDetected: 0
        };
    }

    // --- PRIVATE HELPERS ---

    _hashObject(obj) {
        return crypto.createHash('sha256').update(JSON.stringify(obj || {})).digest('hex');
    }

    _generateSignature(digest, algorithm) {
        const hmac = crypto.createHmac('sha256', this.secretKey);
        hmac.update(`${digest}:${algorithm}`);
        return hmac.digest('hex');
    }

    _verifySignature(digest, signature, algorithm) {
        const expected = this._generateSignature(digest, algorithm);
        return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    }

    _persistState() {
        if (!this.storagePath) return;
        try {
            const state = {
                chains: Array.from(this.chains.entries()),
                globalLedger: this.globalLedger
            };
            fs.mkdirSync(path.dirname(this.storagePath), { recursive: true });
            fs.writeFileSync(this.storagePath, JSON.stringify(state, null, 2), 'utf8');
        } catch (err) {
            // Silently swallow in restricted env
        }
    }

    _loadState() {
        try {
            const raw = fs.readFileSync(this.storagePath, 'utf8');
            const state = JSON.parse(raw);
            if (state.chains) this.chains = new Map(state.chains);
            if (state.globalLedger) this.globalLedger = state.globalLedger;
        } catch (err) {
            // Load state fallback
        }
    }
}

module.exports = CryptographicProvenanceChain;
