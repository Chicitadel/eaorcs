/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Persistent Graph Database Engine
 * File           : PersistentGraphDatabase.js
 * Version        : 2026.1-LTS (v1.0.0-FROZEN)
 * Author         : Ujomor Systems & Enterprise Governance Authority
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
 * - Corporate Policy Governed
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class PersistentGraphDatabase {
    /**
     * Initializes the persistent graph database engine.
     * @param {string} [storageDir] Storage directory for persistent graph snapshots.
     */
    constructor(storageDir) {
        this.storageDir = storageDir 
            ? path.resolve(storageDir) 
            : path.resolve(__dirname, '../../storage/graphdb');
        
        // Ensure storage directory exists
        if (!fs.existsSync(this.storageDir)) {
            fs.mkdirSync(this.storageDir, { recursive: true });
        }

        this.activeSnapshot = null;
        this.nodes = [];
        this.edges = [];
    }

    /**
     * Computes a deterministic SHA-256 Merkle hash for graph nodes and edges.
     * @param {Array<object>} nodes Node list.
     * @param {Array<object>} edges Edge list.
     * @returns {string} SHA-256 hex digest.
     */
    calculateMerkleHash(nodes = [], edges = []) {
        const sortedNodes = [...nodes].sort((a, b) => (a.id || '').localeCompare(b.id || ''));
        const sortedEdges = [...edges].sort((a, b) => {
            const keyA = `${a.source || ''}->${a.type || ''}->${a.target || ''}`;
            const keyB = `${b.source || ''}->${b.type || ''}->${b.target || ''}`;
            return keyA.localeCompare(keyB);
        });

        const nodeHashes = sortedNodes.map(n => crypto.createHash('sha256').update(JSON.stringify(n)).digest('hex'));
        const edgeHashes = sortedEdges.map(e => crypto.createHash('sha256').update(JSON.stringify(e)).digest('hex'));

        const combined = nodeHashes.join('') + edgeHashes.join('');
        return crypto.createHash('sha256').update(combined).digest('hex');
    }

    /**
     * Normalizes input graph nodes/edges into flat arrays.
     * @private
     */
    _normalizeGraphElements(graphData) {
        let nodes = [];
        let edges = [];

        if (Array.isArray(graphData.nodes)) {
            nodes = graphData.nodes;
        } else if (graphData.nodes instanceof Map) {
            nodes = Array.from(graphData.nodes.values());
        } else if (graphData.nodes && typeof graphData.nodes === 'object') {
            nodes = Object.values(graphData.nodes);
        }

        if (Array.isArray(graphData.edges)) {
            edges = graphData.edges;
        } else if (graphData.edges instanceof Map) {
            edges = Array.from(graphData.edges.values());
        } else if (graphData.edges && typeof graphData.edges === 'object') {
            edges = Object.values(graphData.edges);
        }

        return { nodes, edges };
    }

    /**
     * Saves a queryable graph snapshot to persistent file storage with Merkle hash verification.
     * @param {string} snapshotId Unique snapshot identifier.
     * @param {object} graphData Graph data containing nodes and edges.
     * @returns {object} Metadata summary of the saved snapshot.
     */
    saveGraphSnapshot(snapshotId, graphData) {
        if (!snapshotId || typeof snapshotId !== 'string') {
            throw new Error('snapshotId must be a non-empty string');
        }
        if (!graphData || typeof graphData !== 'object') {
            throw new Error('graphData must be a valid object');
        }

        const { nodes, edges } = this._normalizeGraphElements(graphData);
        const merkleHash = this.calculateMerkleHash(nodes, edges);
        const timestamp = new Date().toISOString();

        const snapshotDocument = {
            snapshotId,
            version: graphData.version || '2026.1-LTS',
            timestamp,
            merkleHash,
            nodeCount: nodes.length,
            edgeCount: edges.length,
            metadata: graphData.metadata || {},
            services: graphData.services || [],
            nodes,
            edges
        };

        const filePath = path.join(this.storageDir, `snapshot_${snapshotId}.json`);
        fs.writeFileSync(filePath, JSON.stringify(snapshotDocument, null, 2), 'utf8');

        // Set active snapshot in memory
        this.activeSnapshot = snapshotDocument;
        this.nodes = nodes;
        this.edges = edges;

        return {
            snapshotId,
            filePath,
            merkleHash,
            nodeCount: nodes.length,
            edgeCount: edges.length,
            timestamp
        };
    }

    /**
     * Loads a graph snapshot from persistent storage into memory for querying.
     * @param {string} snapshotId Unique snapshot identifier.
     * @returns {object} Loaded snapshot object.
     */
    loadGraphSnapshot(snapshotId) {
        if (!snapshotId || typeof snapshotId !== 'string') {
            throw new Error('snapshotId must be a non-empty string');
        }

        const filePath = path.join(this.storageDir, `snapshot_${snapshotId}.json`);
        if (!fs.existsSync(filePath)) {
            throw new Error(`Snapshot '${snapshotId}' not found at path: ${filePath}`);
        }

        const rawContent = fs.readFileSync(filePath, 'utf8');
        const snapshot = JSON.parse(rawContent);

        this.activeSnapshot = snapshot;
        this.nodes = snapshot.nodes || [];
        this.edges = snapshot.edges || [];

        return snapshot;
    }

    /**
     * Queries nodes in the active loaded graph snapshot.
     * @param {Function} [filterFn] Filtering predicate function.
     * @returns {Array<object>} Array of matching node objects.
     */
    queryNodes(filterFn) {
        if (!this.nodes || this.nodes.length === 0) {
            return [];
        }
        if (typeof filterFn !== 'function') {
            return [...this.nodes];
        }
        return this.nodes.filter(filterFn);
    }

    /**
     * Queries edges in the active loaded graph snapshot.
     * @param {Function} [filterFn] Filtering predicate function.
     * @returns {Array<object>} Array of matching edge objects.
     */
    queryEdges(filterFn) {
        if (!this.edges || this.edges.length === 0) {
            return [];
        }
        if (typeof filterFn !== 'function') {
            return [...this.edges];
        }
        return this.edges.filter(filterFn);
    }

    /**
     * Lists all persisted graph snapshots in the storage directory.
     * @returns {Array<object>} List of snapshot metadata summaries sorted by timestamp descending.
     */
    listSnapshots() {
        if (!fs.existsSync(this.storageDir)) {
            return [];
        }

        const files = fs.readdirSync(this.storageDir);
        const snapshotFiles = files.filter(f => f.startsWith('snapshot_') && f.endsWith('.json'));

        const snapshots = [];
        for (const file of snapshotFiles) {
            const filePath = path.join(this.storageDir, file);
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                const parsed = JSON.parse(content);
                snapshots.push({
                    snapshotId: parsed.snapshotId || file.replace(/^snapshot_/, '').replace(/\.json$/, ''),
                    version: parsed.version || 'unknown',
                    timestamp: parsed.timestamp || null,
                    merkleHash: parsed.merkleHash || null,
                    nodeCount: parsed.nodeCount || (parsed.nodes ? parsed.nodes.length : 0),
                    edgeCount: parsed.edgeCount || (parsed.edges ? parsed.edges.length : 0),
                    filePath
                });
            } catch (err) {
                // Ignore malformed files gracefully
            }
        }

        return snapshots.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
    }

    /**
     * Verifies the cryptographic Merkle hash integrity of a persisted snapshot on disk.
     * @param {string} snapshotId Unique snapshot identifier.
     * @returns {object} Integrity verification result.
     */
    verifySnapshotIntegrity(snapshotId) {
        if (!snapshotId || typeof snapshotId !== 'string') {
            throw new Error('snapshotId must be a non-empty string');
        }

        const filePath = path.join(this.storageDir, `snapshot_${snapshotId}.json`);
        if (!fs.existsSync(filePath)) {
            throw new Error(`Snapshot '${snapshotId}' not found at path: ${filePath}`);
        }

        const content = fs.readFileSync(filePath, 'utf8');
        const snapshot = JSON.parse(content);

        const expectedHash = snapshot.merkleHash;
        const actualHash = this.calculateMerkleHash(snapshot.nodes || [], snapshot.edges || []);
        const isValid = expectedHash === actualHash;

        return {
            snapshotId,
            isValid,
            expectedHash,
            actualHash,
            timestamp: snapshot.timestamp,
            nodeCount: snapshot.nodeCount,
            edgeCount: snapshot.edgeCount,
            filePath
        };
    }
}

module.exports = PersistentGraphDatabase;
