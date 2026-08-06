/******************************************************************************
 * Project        : EAORCS Governance Platform
 * Module         : Decomposable Software Trust Scoring Engine
 * File           : DecomposableScoringEngine.js
 * Version        : 2026.1.0
 * Author         : Air Roofers Architecture Authority / Ujomor Systems
 * Organization   : Ujomor Systems & Air Roofers
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : ENTERPRISE | PUBLIC | INTERNAL
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
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Ujomor Systems & Air Roofers
 * All Rights Reserved.
 ******************************************************************************/

/**
 * ScoringNode
 * Represents an explainable, weighted node within the Software Trust Score tree hierarchy.
 */
class ScoringNode {
    /**
     * @param {Object} data Node configuration
     * @param {string} data.id Unique node identifier
     * @param {string} data.name Human-readable node name
     * @param {number} [data.score] Current score (0 - 100)
     * @param {number} [data.weight] Weight relative to siblings (0.0 - 1.0)
     * @param {Array<string>} [data.evidenceRefs] Array of evidence reference IDs
     * @param {string} [data.rationale] Rationale or narrative for current score
     * @param {Array<Object>} [data.history] Historical score changes
     * @param {number} [data.confidence] Confidence level percentage (0 - 100%)
     * @param {Object|number} [data.uncertainty] Uncertainty bounds (+/- delta or { delta, min, max })
     * @param {Array<ScoringNode|Object>} [data.children] Child sub-nodes
     */
    constructor(data = {}) {
        if (!data.id || !data.name) {
            throw new Error('ScoringNode requires both `id` and `name` properties.');
        }

        this.id = data.id;
        this.name = data.name;
        this.score = typeof data.score === 'number' ? data.score : 100;
        this.weight = typeof data.weight === 'number' ? data.weight : 1.0;
        this.evidenceRefs = Array.isArray(data.evidenceRefs) ? [...data.evidenceRefs] : [];
        this.rationale = data.rationale || 'Initial baseline assessment';
        this.history = Array.isArray(data.history) ? [...data.history] : [];
        this.confidence = typeof data.confidence === 'number' ? data.confidence : 95.0;

        // Normalize uncertainty representation
        if (typeof data.uncertainty === 'number') {
            const delta = Math.abs(data.uncertainty);
            this.uncertainty = {
                delta,
                min: Math.max(0, this.score - delta),
                max: Math.min(100, this.score + delta)
            };
        } else if (data.uncertainty && typeof data.uncertainty === 'object') {
            const delta = typeof data.uncertainty.delta === 'number' ? data.uncertainty.delta : 2.0;
            this.uncertainty = {
                delta,
                min: typeof data.uncertainty.min === 'number' ? data.uncertainty.min : Math.max(0, this.score - delta),
                max: typeof data.uncertainty.max === 'number' ? data.uncertainty.max : Math.min(100, this.score + delta)
            };
        } else {
            const defaultDelta = 2.0;
            this.uncertainty = {
                delta: defaultDelta,
                min: Math.max(0, this.score - defaultDelta),
                max: Math.min(100, this.score + defaultDelta)
            };
        }

        this.children = [];
        if (Array.isArray(data.children)) {
            for (const child of data.children) {
                this.addChild(child instanceof ScoringNode ? child : new ScoringNode(child));
            }
        }
    }

    /**
     * Adds a child sub-node
     * @param {ScoringNode} childNode 
     */
    addChild(childNode) {
        if (!(childNode instanceof ScoringNode)) {
            childNode = new ScoringNode(childNode);
        }
        this.children.push(childNode);
    }

    /**
     * Finds a sub-node recursively by ID
     * @param {string} nodeId 
     * @returns {ScoringNode|null}
     */
    findNode(nodeId) {
        if (this.id === nodeId) return this;
        for (const child of this.children) {
            const found = child.findNode(nodeId);
            if (found) return found;
        }
        return null;
    }

    /**
     * Recalculates node score, confidence, and uncertainty based on child nodes
     * @returns {number} Updated node score
     */
    recalculate() {
        if (this.children.length === 0) {
            return this.score;
        }

        let totalWeight = 0;
        let weightedScoreSum = 0;
        let weightedConfidenceSum = 0;
        let maxDelta = 0;

        for (const child of this.children) {
            const childScore = child.recalculate();
            const childWeight = child.weight;
            totalWeight += childWeight;
            weightedScoreSum += childScore * childWeight;
            weightedConfidenceSum += child.confidence * childWeight;
            if (child.uncertainty.delta > maxDelta) {
                maxDelta = child.uncertainty.delta;
            }
        }

        const normFactor = totalWeight > 0 ? totalWeight : 1.0;
        this.score = Math.round(weightedScoreSum / normFactor);
        this.confidence = Math.round((weightedConfidenceSum / normFactor) * 10) / 10;

        const delta = Math.round(maxDelta * 10) / 10;
        this.uncertainty = {
            delta,
            min: Math.max(0, Math.round((this.score - delta) * 10) / 10),
            max: Math.min(100, Math.round((this.score + delta) * 10) / 10)
        };

        // Aggregate evidence references from children without duplicates
        const childEvidence = new Set(this.evidenceRefs);
        for (const child of this.children) {
            for (const ref of child.evidenceRefs) {
                childEvidence.add(ref);
            }
        }
        this.evidenceRefs = Array.from(childEvidence);

        return this.score;
    }

    /**
     * Updates node score and logs history
     * @param {number} newScore 
     * @param {string} rationale 
     * @param {Array<string>} [evidenceRefs] 
     * @param {string} [actor] 
     */
    updateScore(newScore, rationale, evidenceRefs = [], actor = 'System') {
        const previousScore = this.score;
        this.score = Math.max(0, Math.min(100, newScore));
        
        if (rationale) {
            this.rationale = rationale;
        }

        if (Array.isArray(evidenceRefs) && evidenceRefs.length > 0) {
            const set = new Set([...this.evidenceRefs, ...evidenceRefs]);
            this.evidenceRefs = Array.from(set);
        }

        this.uncertainty.min = Math.max(0, this.score - this.uncertainty.delta);
        this.uncertainty.max = Math.min(100, this.score + this.uncertainty.delta);

        this.history.push({
            timestamp: new Date().toISOString(),
            previousScore,
            newScore: this.score,
            rationale: this.rationale,
            actor
        });
    }

    /**
     * Serializes node and children to plain JSON object
     * @returns {Object}
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            score: this.score,
            weight: this.weight,
            confidence: this.confidence,
            uncertainty: this.uncertainty,
            rationale: this.rationale,
            evidenceRefs: this.evidenceRefs,
            history: this.history,
            children: this.children.map(child => child.toJSON())
        };
    }
}

/**
 * DecomposableScoringEngine
 * Manages the Software Trust Score tree, decomposing composite score (96) into full tree hierarchy:
 * Supply Chain (98), Architecture (95), Evidence (100), Security (91), Compliance (97).
 */
class DecomposableScoringEngine {
    /**
     * @param {ScoringNode|Object} [rootNode] Custom root tree or undefined to use default baseline
     */
    constructor(rootNode) {
        if (rootNode) {
            this.root = rootNode instanceof ScoringNode ? rootNode : new ScoringNode(rootNode);
        } else {
            this.root = DecomposableScoringEngine.createDefaultTrustTree();
        }
        this.root.recalculate();
    }

    /**
     * Builds default 5-pillar Software Trust Score tree hierarchy (Composite Score = 96)
     * @returns {ScoringNode}
     */
    static createDefaultTrustTree() {
        return new ScoringNode({
            id: 'software_trust_score',
            name: 'Software Trust Score',
            weight: 1.0,
            rationale: 'Composite enterprise software trust index aggregated across 5 core pillars.',
            confidence: 96.5,
            uncertainty: { delta: 1.8, min: 94.2, max: 97.8 },
            children: [
                // Pillar 1: Supply Chain (Target Score: 98)
                {
                    id: 'supply_chain',
                    name: 'Supply Chain Trust',
                    score: 98,
                    weight: 0.20,
                    confidence: 98.0,
                    uncertainty: { delta: 1.2, min: 96.8, max: 99.2 },
                    rationale: 'Immutable dependency verification, SBOM lineage, and clean license audit.',
                    evidenceRefs: ['EVID-SC-001', 'EVID-SC-002', 'EVID-SC-003'],
                    children: [
                        {
                            id: 'dependency_integrity',
                            name: 'Dependency Integrity & Provenance',
                            score: 99,
                            weight: 0.40,
                            confidence: 99.0,
                            uncertainty: { delta: 1.0, min: 98.0, max: 100.0 },
                            rationale: 'All third-party packages locked and cryptographically verified.',
                            evidenceRefs: ['EVID-SC-001']
                        },
                        {
                            id: 'sbom_lineage',
                            name: 'Software Bill of Materials (SBOM) Lineage',
                            score: 100,
                            weight: 0.30,
                            confidence: 100.0,
                            uncertainty: { delta: 0.0, min: 100.0, max: 100.0 },
                            rationale: 'Complete CycloneDX SBOM generated and cryptographically signed.',
                            evidenceRefs: ['EVID-SC-002']
                        },
                        {
                            id: 'license_compliance',
                            name: 'Software License Compliance',
                            score: 95,
                            weight: 0.30,
                            confidence: 95.0,
                            uncertainty: { delta: 2.0, min: 93.0, max: 97.0 },
                            rationale: 'Zero copyleft license violations detected across dependency graph.',
                            evidenceRefs: ['EVID-SC-003']
                        }
                    ]
                },
                // Pillar 2: Architecture (Target Score: 95)
                {
                    id: 'architecture',
                    name: 'Architectural Governance',
                    score: 95,
                    weight: 0.20,
                    confidence: 95.0,
                    uncertainty: { delta: 2.1, min: 92.9, max: 97.1 },
                    rationale: 'Bounded context domain isolation and protocol freeze adherence.',
                    evidenceRefs: ['EVID-ARCH-001', 'EVID-ARCH-002'],
                    children: [
                        {
                            id: 'modular_isolation',
                            name: 'Modular Domain Isolation',
                            score: 96,
                            weight: 0.35,
                            confidence: 96.0,
                            uncertainty: { delta: 1.5, min: 94.5, max: 97.5 },
                            rationale: 'Strict module boundary enforcement without circular dependencies.',
                            evidenceRefs: ['EVID-ARCH-001']
                        },
                        {
                            id: 'protocol_freeze',
                            name: 'Protocol & Schema Freeze Adherence',
                            score: 95,
                            weight: 0.35,
                            confidence: 95.0,
                            uncertainty: { delta: 2.0, min: 93.0, max: 97.0 },
                            rationale: 'API contracts frozen according to semver governance rules.',
                            evidenceRefs: ['EVID-ARCH-002']
                        },
                        {
                            id: 'drift_containment',
                            name: 'Architectural Drift Containment',
                            score: 94,
                            weight: 0.30,
                            confidence: 94.0,
                            uncertainty: { delta: 2.5, min: 91.5, max: 96.5 },
                            rationale: 'Low structural entropy across governance specs and codebase.',
                            evidenceRefs: ['EVID-ARCH-002']
                        }
                    ]
                },
                // Pillar 3: Evidence (Target Score: 100)
                {
                    id: 'evidence',
                    name: 'Evidence & Verification Integrity',
                    score: 100,
                    weight: 0.20,
                    confidence: 100.0,
                    uncertainty: { delta: 0.0, min: 100.0, max: 100.0 },
                    rationale: 'Complete cryptographic proof chain and tamper-evident audit trail.',
                    evidenceRefs: ['EVID-PROOF-001', 'EVID-PROOF-002'],
                    children: [
                        {
                            id: 'proof_completeness',
                            name: 'Verification Proof Completeness',
                            score: 100,
                            weight: 0.50,
                            confidence: 100.0,
                            uncertainty: { delta: 0.0, min: 100.0, max: 100.0 },
                            rationale: '100% of required governance claims accompanied by valid proof tokens.',
                            evidenceRefs: ['EVID-PROOF-001']
                        },
                        {
                            id: 'audit_integrity',
                            name: 'Audit Log Chain Integrity',
                            score: 100,
                            weight: 0.50,
                            confidence: 100.0,
                            uncertainty: { delta: 0.0, min: 100.0, max: 100.0 },
                            rationale: 'Merkle-tree verified immutable audit log history.',
                            evidenceRefs: ['EVID-PROOF-002']
                        }
                    ]
                },
                // Pillar 4: Security (Target Score: 91)
                {
                    id: 'security',
                    name: 'Security Governance',
                    score: 91,
                    weight: 0.20,
                    confidence: 92.0,
                    uncertainty: { delta: 2.5, min: 88.5, max: 93.5 },
                    rationale: 'Zero critical vulnerabilities and enforced zero-trust access controls.',
                    evidenceRefs: ['EVID-SEC-001', 'EVID-SEC-002'],
                    children: [
                        {
                            id: 'vulnerability_severity',
                            name: 'Vulnerability Severity Index',
                            score: 90,
                            weight: 0.40,
                            confidence: 90.0,
                            uncertainty: { delta: 3.0, min: 87.0, max: 93.0 },
                            rationale: 'Zero critical CVEs; minor low-risk dependencies pending patch.',
                            evidenceRefs: ['EVID-SEC-001']
                        },
                        {
                            id: 'crypto_standards',
                            name: 'Cryptographic Standards Enforcement',
                            score: 92,
                            weight: 0.30,
                            confidence: 93.0,
                            uncertainty: { delta: 2.0, min: 90.0, max: 94.0 },
                            rationale: 'Approved AES-256-GCM / SHA-256 primitives utilized throughout.',
                            evidenceRefs: ['EVID-SEC-002']
                        },
                        {
                            id: 'zero_trust_boundaries',
                            name: 'Zero-Trust Boundary Isolation',
                            score: 91,
                            weight: 0.30,
                            confidence: 93.0,
                            uncertainty: { delta: 2.2, min: 88.8, max: 93.2 },
                            rationale: 'Least privilege RBAC/ABAC enforcement at service boundaries.',
                            evidenceRefs: ['EVID-SEC-002']
                        }
                    ]
                },
                // Pillar 5: Compliance (Target Score: 97)
                {
                    id: 'compliance',
                    name: 'Regulatory & Standards Compliance',
                    score: 97,
                    weight: 0.20,
                    confidence: 97.0,
                    uncertainty: { delta: 1.5, min: 95.5, max: 98.5 },
                    rationale: 'Full mapping and pass rate against ISO 27001, SOC 2, OWASP ASVS, NIST.',
                    evidenceRefs: ['EVID-COMP-001', 'EVID-COMP-002'],
                    children: [
                        {
                            id: 'iso27001_controls',
                            name: 'ISO/IEC 27001 Security Controls',
                            score: 98,
                            weight: 0.30,
                            confidence: 98.0,
                            uncertainty: { delta: 1.0, min: 97.0, max: 99.0 },
                            rationale: 'Operational controls fully mapped to ISO 27001 Annex A.',
                            evidenceRefs: ['EVID-COMP-001']
                        },
                        {
                            id: 'soc2_alignment',
                            name: 'SOC 2 Type II Alignment',
                            score: 96,
                            weight: 0.30,
                            confidence: 96.0,
                            uncertainty: { delta: 2.0, min: 94.0, max: 98.0 },
                            rationale: 'Trust Services Criteria (Security, Availability, Confidentiality) verified.',
                            evidenceRefs: ['EVID-COMP-001']
                        },
                        {
                            id: 'owasp_asvs_rate',
                            name: 'OWASP ASVS Verification Rate',
                            score: 97,
                            weight: 0.40,
                            confidence: 97.0,
                            uncertainty: { delta: 1.5, min: 95.5, max: 98.5 },
                            rationale: '97% pass rate on OWASP Application Security Verification Standard Level 3.',
                            evidenceRefs: ['EVID-COMP-002']
                        }
                    ]
                }
            ]
        });
    }

    /**
     * Gets root score node
     * @returns {ScoringNode}
     */
    getRootNode() {
        return this.root;
    }

    /**
     * Retrieves any node in the scoring tree by ID
     * @param {string} nodeId 
     * @returns {ScoringNode|null}
     */
    getNode(nodeId) {
        return this.root.findNode(nodeId);
    }

    /**
     * Recalculates all composite scores from bottom leaves up to root
     * @returns {number} Composite Software Trust Score
     */
    recalculateScore() {
        return this.root.recalculate();
    }

    /**
     * Updates score of a specific node and recalculates the entire tree
     * @param {string} nodeId Target node ID
     * @param {number} newScore New score value (0 - 100)
     * @param {string} [rationale] Rationale explanation
     * @param {Array<string>} [evidenceRefs] Evidence reference IDs
     * @param {string} [actor] Actor initiating change
     * @returns {Object} Update result summary
     */
    updateNodeScore(nodeId, newScore, rationale, evidenceRefs = [], actor = 'System') {
        const node = this.getNode(nodeId);
        if (!node) {
            throw new Error(`Scoring node with ID '${nodeId}' not found in tree.`);
        }

        const previousComposite = this.root.score;
        node.updateScore(newScore, rationale, evidenceRefs, actor);
        
        // Recalculate tree up to root
        const newComposite = this.recalculateScore();

        return {
            nodeId,
            previousNodeScore: node.history[node.history.length - 1].previousScore,
            newNodeScore: node.score,
            previousCompositeScore: previousComposite,
            newCompositeScore: newComposite,
            deltaComposite: Math.round((newComposite - previousComposite) * 100) / 100
        };
    }

    /**
     * Generates a comprehensive explainability report for a node or the entire tree
     * @param {string} [nodeId] Target node ID (defaults to root)
     * @returns {Object} Detailed explainability breakdown
     */
    explain(nodeId) {
        const targetNode = nodeId ? this.getNode(nodeId) : this.root;
        if (!targetNode) {
            throw new Error(`Scoring node '${nodeId}' not found.`);
        }

        const subTreeExplain = (node) => {
            return {
                id: node.id,
                name: node.name,
                score: node.score,
                weight: node.weight,
                contributionToParent: Math.round((node.score * node.weight) * 100) / 100,
                confidence: `${node.confidence}%`,
                uncertaintyBounds: `${node.score} +/- ${node.uncertainty.delta} [Range: ${node.uncertainty.min} - ${node.uncertainty.max}]`,
                rationale: node.rationale,
                evidenceRefs: node.evidenceRefs,
                changeHistoryCount: node.history.length,
                subFactors: node.children.map(child => subTreeExplain(child))
            };
        };

        return {
            timestamp: new Date().toISOString(),
            targetNodeId: targetNode.id,
            targetNodeName: targetNode.name,
            overallScore: targetNode.score,
            confidence: `${targetNode.confidence}%`,
            uncertaintyBounds: `${targetNode.score} +/- ${targetNode.uncertainty.delta} [Range: ${targetNode.uncertainty.min} - ${targetNode.uncertainty.max}]`,
            rationale: targetNode.rationale,
            evidenceReferencesCount: targetNode.evidenceRefs.length,
            evidenceRefs: targetNode.evidenceRefs,
            explainabilityTree: subTreeExplain(targetNode)
        };
    }

    /**
     * Exports full scoring tree to plain JSON object
     * @returns {Object}
     */
    exportTree() {
        return this.root.toJSON();
    }

    /**
     * Imports scoring tree from JSON object
     * @param {Object} jsonTree 
     * @returns {DecomposableScoringEngine}
     */
    static importTree(jsonTree) {
        const root = new ScoringNode(jsonTree);
        return new DecomposableScoringEngine(root);
    }
}

module.exports = {
    DecomposableScoringEngine,
    ScoringNode
};
