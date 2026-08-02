/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Decomposed Trust Engine
 * File           : EvidenceEngine.js
 * Version        : 2026.1-LTS
 * Author         : Enterprise Architecture Authority & Systems Engineering
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
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
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

const crypto = require('crypto');

/**
 * EvidenceEngine
 * Immutable evidence collector, canonical serializer, Merkle Tree builder,
 * proof generator, and cryptographic hash verifier.
 */
class EvidenceEngine {
    constructor(options = {}) {
        this.algorithm = options.algorithm || 'sha256';
    }

    /**
     * Compute canonical SHA-256 hash of an object or buffer
     * @param {*} data - Raw evidence object or primitive
     * @returns {string} Hex hash string
     */
    hashEvidence(data) {
        const canonicalJson = this.canonicalize(data);
        return crypto.createHash(this.algorithm).update(canonicalJson, 'utf8').digest('hex');
    }

    /**
     * Deterministic JSON stringify for payload canonicalization
     * @param {*} obj
     * @returns {string}
     */
    canonicalize(obj) {
        if (obj === null || typeof obj !== 'object') {
            return JSON.stringify(obj);
        }
        if (Array.isArray(obj)) {
            return '[' + obj.map(item => this.canonicalize(item)).join(',') + ']';
        }
        const sortedKeys = Object.keys(obj).sort();
        const parts = sortedKeys.map(key => `${JSON.stringify(key)}:${this.canonicalize(obj[key])}`);
        return '{' + parts.join(',') + '}';
    }

    /**
     * Process and collect raw evidence array into normalized, hashed evidence records
     * @param {Array<Object>} rawItems - List of evidence input items
     * @param {Object} [context] - Context metadata (collector, workspace, executionId)
     * @returns {Object} Hashed evidence bundle
     */
    collectEvidence(rawItems = [], context = {}) {
        const timestamp = new Date().toISOString();
        const normalizedItems = rawItems.map((item, index) => {
            const rawContent = item.raw || item.data || item;
            const itemHash = this.hashEvidence(rawContent);

            return {
                id: item.id || `EVID-${index + 1}-${itemHash.substring(0, 8)}`,
                domain: item.domain || 'GENERAL',
                type: item.type || 'OBSERVATION',
                source: item.source || context.collector || 'EAORCS_AUDIT_KERNEL',
                timestamp: item.timestamp || timestamp,
                status: item.status || 'VERIFIED',
                confidence: item.confidence ?? 1.0,
                hash: itemHash,
                content: rawContent
            };
        });

        const hashes = normalizedItems.map(item => item.hash);
        const merkleTree = this.buildMerkleTree(hashes);

        return {
            executionId: context.executionId || `EXEC-${Date.now()}`,
            timestamp,
            totalItems: normalizedItems.length,
            merkleRoot: merkleTree.root,
            evidenceHashes: hashes,
            items: normalizedItems,
            tree: merkleTree
        };
    }

    /**
     * Constructs a binary Merkle Tree from an array of hex hashes
     * @param {Array<string>} hashes
     * @returns {Object} Merkle Tree structure with levels and root hash
     */
    buildMerkleTree(hashes = []) {
        if (!Array.isArray(hashes)) hashes = [];
        if (hashes.length === 0) {
            const emptyHash = crypto.createHash(this.algorithm).update('').digest('hex');
            return { root: emptyHash, merkleRoot: emptyHash, levels: [[emptyHash]] };
        }

        let currentLevel = hashes.map(item => {
            if (typeof item === 'string' && /^[0-9a-fA-F]{64}$/.test(item)) return item;
            return this.hashEvidence(item);
        });
        const levels = [currentLevel];

        while (currentLevel.length > 1) {
            const nextLevel = [];
            for (let i = 0; i < currentLevel.length; i += 2) {
                const left = currentLevel[i];
                const right = (i + 1 < currentLevel.length) ? currentLevel[i + 1] : left; // Duplicate odd last node
                const parentHash = crypto.createHash(this.algorithm)
                    .update(left + right, 'hex')
                    .digest('hex');
                nextLevel.push(parentHash);
            }
            levels.push(nextLevel);
            currentLevel = nextLevel;
        }

        const root = levels[levels.length - 1][0];
        return {
            root,
            merkleRoot: root,
            levels
        };
    }

    /**
     * Generate Merkle inclusion proof for a specific evidence hash
     * @param {string} targetHash - Target evidence hash
     * @param {Object} merkleTree - Tree object returned by buildMerkleTree
     * @returns {Array<Object>} Array of proof steps { position: 'left'|'right', hash: string }
     */
    generateProof(targetHash, merkleTree) {
        if (!merkleTree || !merkleTree.levels || merkleTree.levels.length === 0) {
            return [];
        }

        const levels = merkleTree.levels;
        let index = levels[0].indexOf(targetHash);
        if (index === -1) return [];

        const proof = [];
        for (let l = 0; l < levels.length - 1; l++) {
            const level = levels[l];
            const isRightNode = index % 2 === 1;
            const siblingIndex = isRightNode ? index - 1 : index + 1;

            if (siblingIndex < level.length) {
                proof.push({
                    position: isRightNode ? 'left' : 'right',
                    hash: level[siblingIndex]
                });
            } else {
                // Odd last node duplicated itself
                proof.push({
                    position: 'right',
                    hash: level[index]
                });
            }
            index = Math.floor(index / 2);
        }

        return proof;
    }

    /**
     * Cryptographically verify a Merkle inclusion proof against a known root
     * @param {string} targetHash - Hash of the target item
     * @param {Array<Object>} proof - Proof array generated by generateProof
     * @param {string} rootHash - Expected Merkle Root Hash
     * @returns {boolean} True if proof is valid
     */
    verifyProof(targetHash, proof = [], rootHash = '') {
        if (!targetHash || !rootHash) return false;

        let computedHash = targetHash;
        for (const step of proof) {
            let combined;
            if (step.position === 'left') {
                combined = step.hash + computedHash;
            } else {
                combined = computedHash + step.hash;
            }
            computedHash = crypto.createHash(this.algorithm)
                .update(combined, 'hex')
                .digest('hex');
        }

        return computedHash.toLowerCase() === rootHash.toLowerCase();
    }

    /**
     * Compute evidence confidence factor Cev (0.0 - 1.0)
     * Based on attestation source authority, verification status, and hash integrity
     * @param {Array<Object>} items - Evidence items
     * @returns {number} Cev factor
     */
    calculateEvidenceConfidence(items = []) {
        if (!items || items.length === 0) return 0.5;

        const scores = items.map(item => {
            let sourceWeight = 0.8;
            if (item.source?.includes('SECURITY_SCANNER') || item.source?.includes('KERNEL')) sourceWeight = 1.0;
            else if (item.source?.includes('MANUAL')) sourceWeight = 0.6;

            const statusWeight = item.status === 'VERIFIED' ? 1.0 : item.status === 'PARTIAL' ? 0.7 : 0.3;
            const integrityWeight = item.hash ? 1.0 : 0.5;

            return sourceWeight * statusWeight * integrityWeight;
        });

        const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
        return Number(Math.max(0.0, Math.min(1.0, avgScore)).toFixed(4));
    }
}

module.exports = EvidenceEngine;
