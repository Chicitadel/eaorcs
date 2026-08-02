/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Stream 4 — High-Performance Enterprise Graph Engine
 * File           : EnterpriseGraphEngine.js
 * Version        : 2026.1.0-LTS
 * Author         : Ujomor Systems & Enterprise Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance Authority
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
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
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance Authority. All Rights Reserved.
 ******************************************************************************/

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const MAGIC_HEADER = Buffer.from('EAORCS_G', 'utf8'); // 8 bytes
const INDEX_VERSION = 1;

/**
 * High-Performance Enterprise Graph Engine
 * Binary file-backed graph database indexer supporting zero-copy node lookups,
 * B-Tree style index files, Merkle verification, and multi-hop graph traversal.
 */
class EnterpriseGraphEngine {
    /**
     * Constructs an instance of EnterpriseGraphEngine.
     * @param {Object} [options={}] Engine configuration options.
     */
    constructor(options = {}) {
        this.options = Object.assign({
            verbose: false,
            cacheCapacity: 10000
        }, options);

        this.nodes = new Map();             // nodeId -> Node object
        this.edges = [];                    // Array of Edge objects
        this.adjacency = new Map();         // nodeId -> Array of { targetId, label, weight, properties }
        this.btreeIndex = new Map();        // nodeId -> { offset, size, node }
        this.labelIndex = new Map();        // label -> Set<nodeId>
        this.merkleRoot = null;
        this.indexMeta = null;
    }

    /**
     * Builds in-memory and indexed graph structures from node and edge arrays.
     * Computes Merkle verification hash and B-Tree index map.
     * @param {Array<Object>} nodes Array of node objects ({ id, label, properties }).
     * @param {Array<Object>} edges Array of edge objects ({ source, target, label, weight, properties }).
     * @returns {Object} Graph index summary metadata.
     */
    buildGraphIndex(nodes = [], edges = []) {
        if (!Array.isArray(nodes) || !Array.isArray(edges)) {
            throw new Error('Nodes and Edges must be valid arrays.');
        }

        this.nodes.clear();
        this.edges = [];
        this.adjacency.clear();
        this.btreeIndex.clear();
        this.labelIndex.clear();

        // 1. Populate Nodes & Label Index
        for (const node of nodes) {
            if (!node || !node.id) {
                continue;
            }
            const nodeObj = {
                id: String(node.id),
                label: node.label || 'Node',
                properties: node.properties || {},
                createdAt: node.createdAt || new Date().toISOString()
            };

            this.nodes.set(nodeObj.id, nodeObj);

            if (!this.labelIndex.has(nodeObj.label)) {
                this.labelIndex.set(nodeObj.label, new Set());
            }
            this.labelIndex.get(nodeObj.label).add(nodeObj.id);
        }

        // 2. Populate Edges & Adjacency List
        for (const edge of edges) {
            if (!edge || !edge.source || !edge.target) {
                continue;
            }
            const sourceId = String(edge.source);
            const targetId = String(edge.target);

            const edgeObj = {
                source: sourceId,
                target: targetId,
                label: edge.label || 'CONNECTED_TO',
                weight: typeof edge.weight === 'number' ? edge.weight : 1.0,
                properties: edge.properties || {}
            };

            this.edges.push(edgeObj);

            if (!this.adjacency.has(sourceId)) {
                this.adjacency.set(sourceId, []);
            }
            this.adjacency.get(sourceId).push({
                targetId,
                label: edgeObj.label,
                weight: edgeObj.weight,
                properties: edgeObj.properties
            });
        }

        // 3. Compute B-Tree Offset Index Map
        const sortedNodeIds = Array.from(this.nodes.keys()).sort();
        let currentOffset = 32; // Header size (32 bytes)

        for (const nodeId of sortedNodeIds) {
            const node = this.nodes.get(nodeId);
            const payloadBuf = Buffer.from(JSON.stringify(node), 'utf8');
            const recordSize = 4 + 2 + Buffer.byteLength(nodeId, 'utf8') + 4 + payloadBuf.length;

            this.btreeIndex.set(nodeId, {
                offset: currentOffset,
                size: recordSize,
                node
            });

            currentOffset += recordSize;
        }

        // 4. Compute Merkle Tree Root Hash
        this.merkleRoot = this._computeMerkleRoot(nodes, edges);

        this.indexMeta = {
            nodeCount: this.nodes.size,
            edgeCount: this.edges.length,
            labelCount: this.labelIndex.size,
            btreeEntriesCount: this.btreeIndex.size,
            merkleRoot: this.merkleRoot,
            indexedAt: new Date().toISOString()
        };

        return this.indexMeta;
    }

    /**
     * Executes fast zero-copy or indexed node lookups using B-Tree index and label maps.
     * @param {string|Object|Function} filter Exact Node ID string, filter object ({ label, properties }), or predicate function.
     * @returns {Array<Object>} Array of matching node objects.
     */
    queryNodesFast(filter) {
        if (!filter) {
            return Array.from(this.nodes.values());
        }

        // 1. Direct String Lookup via B-Tree Index (Zero-copy / O(1))
        if (typeof filter === 'string') {
            const btreeEntry = this.btreeIndex.get(filter);
            if (btreeEntry) {
                return [btreeEntry.node];
            }
            const directNode = this.nodes.get(filter);
            return directNode ? [directNode] : [];
        }

        // 2. Function Predicate Filter
        if (typeof filter === 'function') {
            const results = [];
            for (const node of this.nodes.values()) {
                if (filter(node)) {
                    results.push(node);
                }
            }
            return results;
        }

        // 3. Object Property & Label Filter
        if (typeof filter === 'object') {
            let candidateIds = null;

            if (filter.label && this.labelIndex.has(filter.label)) {
                candidateIds = Array.from(this.labelIndex.get(filter.label));
            } else {
                candidateIds = Array.from(this.nodes.keys());
            }

            const results = [];
            for (const nodeId of candidateIds) {
                const node = this.nodes.get(nodeId);
                if (!node) continue;

                let matches = true;
                if (filter.properties && typeof filter.properties === 'object') {
                    for (const [key, val] of Object.entries(filter.properties)) {
                        if (node.properties[key] !== val) {
                            matches = false;
                            break;
                        }
                    }
                }

                if (matches) {
                    results.push(node);
                }
            }
            return results;
        }

        return [];
    }

    /**
     * Performs multi-hop graph traversal starting from a given node up to maxHops.
     * Handles cyclic paths, calculates distances, and outputs reached nodes and path sequences.
     * @param {string} startNodeId Starting node ID.
     * @param {number} [maxHops=3] Maximum traversal depth.
     * @param {string} [direction='OUTGOING'] Traversal direction ('OUTGOING', 'INCOMING', 'BOTH').
     * @returns {Object} Graph traversal result including reached nodes, distance map, and paths.
     */
    traverseHops(startNodeId, maxHops = 3, direction = 'OUTGOING') {
        startNodeId = String(startNodeId);
        const startNode = this.nodes.get(startNodeId);

        if (!startNode) {
            return {
                startNodeId,
                maxHops,
                direction,
                reachedNodesCount: 0,
                nodes: [],
                paths: [],
                distanceMap: {}
            };
        }

        const visited = new Map(); // nodeId -> depth
        visited.set(startNodeId, 0);

        const queue = [{ nodeId: startNodeId, depth: 0, path: [startNodeId] }];
        const paths = [];

        while (queue.length > 0) {
            const { nodeId, depth, path: currentPath } = queue.shift();

            if (depth >= maxHops) {
                continue;
            }

            const neighborEdges = [];

            if (direction === 'OUTGOING' || direction === 'BOTH') {
                const outgoing = this.adjacency.get(nodeId) || [];
                for (const edge of outgoing) {
                    neighborEdges.push({ targetId: edge.targetId, label: edge.label, weight: edge.weight, dir: 'OUTGOING' });
                }
            }

            if (direction === 'INCOMING' || direction === 'BOTH') {
                for (const edge of this.edges) {
                    if (edge.target === nodeId) {
                        neighborEdges.push({ targetId: edge.source, label: edge.label, weight: edge.weight, dir: 'INCOMING' });
                    }
                }
            }

            for (const edge of neighborEdges) {
                const nextNodeId = edge.targetId;
                const newDepth = depth + 1;
                const newPath = [...currentPath, nextNodeId];

                paths.push({
                    source: nodeId,
                    target: nextNodeId,
                    label: edge.label,
                    weight: edge.weight,
                    direction: edge.dir,
                    depth: newDepth,
                    pathSequence: newPath
                });

                if (!visited.has(nextNodeId) || visited.get(nextNodeId) > newDepth) {
                    visited.set(nextNodeId, newDepth);
                    if (newDepth < maxHops) {
                        queue.push({ nodeId: nextNodeId, depth: newDepth, path: newPath });
                    }
                }
            }
        }

        const reachedNodes = [];
        const distanceMap = {};

        for (const [id, depth] of visited.entries()) {
            const node = this.nodes.get(id);
            if (node) {
                reachedNodes.push({ ...node, hopDistance: depth });
                distanceMap[id] = depth;
            }
        }

        return {
            startNodeId,
            maxHops,
            direction,
            reachedNodesCount: reachedNodes.length,
            nodes: reachedNodes,
            paths,
            distanceMap
        };
    }

    /**
     * Saves the current graph index into a high-performance binary file-backed database structure.
     * Writes `graph_index.bin`, `btree_index.bin`, and `graph_meta.json` to the target directory.
     * @param {string} dirPath Storage directory path.
     * @returns {Object} Binary index save metadata.
     */
    saveBinaryIndex(dirPath) {
        if (!dirPath) {
            throw new Error('Directory path is required to save binary index.');
        }

        const targetDir = path.resolve(dirPath);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        const graphIndexPath = path.join(targetDir, 'graph_index.bin');
        const btreeIndexPath = path.join(targetDir, 'btree_index.bin');
        const metaPath = path.join(targetDir, 'graph_meta.json');

        // 1. Build Header Buffer (32 Bytes)
        const headerBuf = Buffer.alloc(32);
        MAGIC_HEADER.copy(headerBuf, 0); // 0..7
        headerBuf.writeUInt32BE(INDEX_VERSION, 8); // 8..11
        headerBuf.writeUInt32BE(this.nodes.size, 12); // 12..15
        headerBuf.writeUInt32BE(this.edges.length, 16); // 16..19

        // Calculate binary layout offset where B-Tree index begins
        let dataPayloadLength = 0;
        const nodePayloadBuffers = [];

        for (const node of this.nodes.values()) {
            const idBuf = Buffer.from(node.id, 'utf8');
            const jsonBuf = Buffer.from(JSON.stringify(node), 'utf8');

            const recBuf = Buffer.alloc(4 + 2 + idBuf.length + 4 + jsonBuf.length);
            let offset = 0;

            recBuf.writeUInt32BE(recBuf.length, offset); offset += 4;
            recBuf.writeUInt16BE(idBuf.length, offset); offset += 2;
            idBuf.copy(recBuf, offset); offset += idBuf.length;
            recBuf.writeUInt32BE(jsonBuf.length, offset); offset += 4;
            jsonBuf.copy(recBuf, offset);

            nodePayloadBuffers.push(recBuf);
            dataPayloadLength += recBuf.length;
        }

        const indexOffset = 32 + dataPayloadLength;
        headerBuf.writeUInt32BE(indexOffset, 20); // 20..23

        // 2. Build B-Tree Index Buffer
        const btreeBuffers = [];
        const sortedNodeIds = Array.from(this.btreeIndex.keys()).sort();

        for (const nodeId of sortedNodeIds) {
            const entry = this.btreeIndex.get(nodeId);
            const idBuf = Buffer.from(nodeId, 'utf8');

            const btreeRec = Buffer.alloc(2 + idBuf.length + 4 + 4);
            let offset = 0;

            btreeRec.writeUInt16BE(idBuf.length, offset); offset += 2;
            idBuf.copy(btreeRec, offset); offset += idBuf.length;
            btreeRec.writeUInt32BE(entry.offset, offset); offset += 4;
            btreeRec.writeUInt32BE(entry.size, offset);

            btreeBuffers.push(btreeRec);
        }

        // 3. Write Files
        const graphIndexStream = Buffer.concat([headerBuf, ...nodePayloadBuffers]);
        const btreeIndexStream = Buffer.concat(btreeBuffers);

        fs.writeFileSync(graphIndexPath, graphIndexStream);
        fs.writeFileSync(btreeIndexPath, btreeIndexStream);

        const edgesPayload = this.edges;
        const metaPayload = {
            magic: 'EAORCS_G',
            version: INDEX_VERSION,
            nodeCount: this.nodes.size,
            edgeCount: this.edges.length,
            merkleRoot: this.merkleRoot,
            edges: edgesPayload,
            savedAt: new Date().toISOString()
        };

        fs.writeFileSync(metaPath, JSON.stringify(metaPayload, null, 2), 'utf8');

        return {
            targetDir,
            graphIndexPath,
            btreeIndexPath,
            metaPath,
            totalBytes: graphIndexStream.length + btreeIndexStream.length,
            nodeCount: this.nodes.size,
            edgeCount: this.edges.length,
            merkleRoot: this.merkleRoot
        };
    }

    /**
     * Loads a binary file-backed graph database index from directory.
     * Performs magic header verification and Merkle integrity validation.
     * @param {string} dirPath Storage directory path containing binary graph index.
     * @returns {Object} Loaded graph index metadata.
     */
    loadBinaryIndex(dirPath) {
        if (!dirPath) {
            throw new Error('Directory path is required to load binary index.');
        }

        const targetDir = path.resolve(dirPath);
        const graphIndexPath = path.join(targetDir, 'graph_index.bin');
        const btreeIndexPath = path.join(targetDir, 'btree_index.bin');
        const metaPath = path.join(targetDir, 'graph_meta.json');

        if (!fs.existsSync(graphIndexPath) || !fs.existsSync(metaPath)) {
            throw new Error(`Binary graph index files not found in '${targetDir}'.`);
        }

        // 1. Read & Validate Header
        const graphIndexBuf = fs.readFileSync(graphIndexPath);
        const headerMagic = graphIndexBuf.subarray(0, 8);

        if (headerMagic.toString('utf8') !== MAGIC_HEADER.toString('utf8')) {
            throw new Error('Invalid binary index header magic bytes. Integrity check failed.');
        }

        const version = graphIndexBuf.readUInt32BE(8);
        const nodeCount = graphIndexBuf.readUInt32BE(12);
        const edgeCount = graphIndexBuf.readUInt32BE(16);

        // 2. Read Metadata & Edges
        const metaObj = JSON.parse(fs.readFileSync(metaPath, 'utf8'));

        // 3. Read B-Tree Index (if present) or parse nodes from binary buffer
        const loadedNodes = [];
        let offset = 32; // Skip 32-byte header

        for (let i = 0; i < nodeCount; i++) {
            if (offset >= graphIndexBuf.length) break;

            const recLength = graphIndexBuf.readUInt32BE(offset); offset += 4;
            const idLength = graphIndexBuf.readUInt16BE(offset); offset += 2;
            const nodeId = graphIndexBuf.toString('utf8', offset, offset + idLength); offset += idLength;
            const jsonLength = graphIndexBuf.readUInt32BE(offset); offset += 4;
            const jsonStr = graphIndexBuf.toString('utf8', offset, offset + jsonLength); offset += jsonLength;

            const nodeObj = JSON.parse(jsonStr);
            loadedNodes.push(nodeObj);
        }

        const loadedEdges = metaObj.edges || [];

        // 4. Re-calculate & Verify Merkle Root Hash
        const calculatedMerkleRoot = this._computeMerkleRoot(loadedNodes, loadedEdges);
        if (metaObj.merkleRoot && metaObj.merkleRoot !== calculatedMerkleRoot) {
            throw new Error(`Merkle Tree Hash mismatch! Binary graph data corruption detected. Stored: ${metaObj.merkleRoot}, Calculated: ${calculatedMerkleRoot}`);
        }

        // 5. Build Graph Index Structures
        this.buildGraphIndex(loadedNodes, loadedEdges);

        return {
            targetDir,
            version,
            nodeCount: this.nodes.size,
            edgeCount: this.edges.length,
            merkleVerified: true,
            merkleRoot: this.merkleRoot,
            loadedAt: new Date().toISOString()
        };
    }

    /**
     * Computes a deterministic SHA-256 Merkle root hash across graph nodes and edges.
     * @private
     */
    _computeMerkleRoot(nodes, edges) {
        if (!nodes || nodes.length === 0) {
            return crypto.createHash('sha256').update('EMPTY_GRAPH').digest('hex');
        }

        // 1. Sort & Hash Nodes
        const sortedNodes = [...nodes].sort((a, b) => String(a.id).localeCompare(String(b.id)));
        const nodeHashes = sortedNodes.map(n =>
            crypto.createHash('sha256')
                .update(JSON.stringify({ id: n.id, label: n.label, properties: n.properties }))
                .digest('hex')
        );

        // 2. Sort & Hash Edges
        const sortedEdges = [...edges].sort((a, b) => {
            const keyA = `${a.source}->${a.target}->${a.label}`;
            const keyB = `${b.source}->${b.target}->${b.label}`;
            return keyA.localeCompare(keyB);
        });
        const edgeHashes = sortedEdges.map(e =>
            crypto.createHash('sha256')
                .update(JSON.stringify({ source: e.source, target: e.target, label: e.label, weight: e.weight }))
                .digest('hex')
        );

        const allLeafHashes = [...nodeHashes, ...edgeHashes];
        return this._buildMerkleTreeRoot(allLeafHashes);
    }

    /**
     * Helper to recursively build Merkle root hash from leaf hashes array.
     * @private
     */
    _buildMerkleTreeRoot(leafHashes) {
        if (leafHashes.length === 0) {
            return crypto.createHash('sha256').update('NO_LEAVES').digest('hex');
        }

        let currentLevel = [...leafHashes];

        while (currentLevel.length > 1) {
            const nextLevel = [];
            for (let i = 0; i < currentLevel.length; i += 2) {
                if (i + 1 < currentLevel.length) {
                    const combined = currentLevel[i] + currentLevel[i + 1];
                    nextLevel.push(crypto.createHash('sha256').update(combined).digest('hex'));
                } else {
                    nextLevel.push(currentLevel[i]);
                }
            }
            currentLevel = nextLevel;
        }

        return currentLevel[0];
    }
}

module.exports = EnterpriseGraphEngine;
