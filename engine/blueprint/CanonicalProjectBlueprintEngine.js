/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Blueprint Intelligence Architecture
 * File           : CanonicalProjectBlueprintEngine.js
 * Version        : 2026.3.0-LTS
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
const BlueprintDiscoveryEngine = require('../spec/BlueprintDiscoveryEngine');

class CanonicalProjectBlueprintEngine {
    constructor(options = {}) {
        this.options = options;
        this.discoveryEngine = options.discoveryEngine || new BlueprintDiscoveryEngine();
    }

    /**
     * Resolves the single authoritative canonical blueprint for a project directory.
     * Searches available materials, interrogates specs/manifests, and synthesizes complete baseline if needed.
     * 
     * @param {string} projectRoot Directory path of the target project.
     * @returns {Object} Canonical blueprint specification structure.
     */
    resolveCanonicalBlueprint(projectRoot) {
        if (!projectRoot || typeof projectRoot !== 'string') {
            throw new Error('Invalid projectRoot provided to resolveCanonicalBlueprint');
        }

        const absolutePath = path.resolve(projectRoot);
        if (!fs.existsSync(absolutePath)) {
            throw new Error(`Project directory does not exist: ${absolutePath}`);
        }

        // 1. Discover all candidate specification files
        const discoveryResult = this.discoveryEngine.discoverSpecifications(absolutePath);
        const discoveredSpecs = discoveryResult.specs || [];

        // 2. Interrogate project configuration manifests (eaorcs.config.yaml, product.manifest.yaml, package.json)
        const projectMetadata = this._extractProjectMetadata(absolutePath);

        // 3. Extract functional requirements, architecture decisions, and bounded contexts
        const functionalRequirements = [];
        const architectureDecisions = [];
        const boundedContexts = new Set(['CoreEngine', 'Governance', 'Packaging', 'Release']);

        for (const spec of discoveredSpecs) {
            this._parseSpecContent(spec, functionalRequirements, architectureDecisions, boundedContexts);
        }

        // 4. Synthesize baseline requirements if no specs exist or gaps are detected
        const synthesizedRequirements = this._synthesizeBaselineRequirements(
            projectMetadata,
            functionalRequirements
        );

        const allRequirements = [...functionalRequirements, ...synthesizedRequirements];

        // 5. Construct Canonical Blueprint object
        const blueprintId = `CBP-${crypto.createHash('md5').update(projectMetadata.name + projectMetadata.version).digest('hex').slice(0, 8).toUpperCase()}`;

        const canonicalBlueprint = {
            id: blueprintId,
            name: projectMetadata.name,
            version: projectMetadata.version,
            description: projectMetadata.description,
            resolvedAt: new Date().toISOString(),
            status: 'FROZEN',
            specifications: discoveredSpecs,
            boundedContexts: Array.from(boundedContexts),
            functionalRequirements: allRequirements,
            architectureDecisions: architectureDecisions.length > 0 ? architectureDecisions : [
                {
                    id: 'ADR-001',
                    title: 'Tokenized Governance-Driven Autonomous Engineering Standard',
                    status: 'ACCEPTED',
                    impacts: ['CoreEngine', 'Governance', 'Security']
                },
                {
                    id: 'ADR-002',
                    title: 'Modular Architecture & Bounded Context Isolation',
                    status: 'ACCEPTED',
                    impacts: ['Kernel', 'Adapters', 'Plugins']
                }
            ],
            qualityGates: {
                unitTestCoveragePct: 90,
                securityScansRequired: true,
                zeroTrustEnforced: true,
                auditTrailRequired: true,
                reproducibleBuildRequired: true
            },
            packagingTargets: projectMetadata.packagingTargets || ['ZIP', 'OCI', 'NPM', 'DEB'],
            confidence: {
                discoveredSpecsCount: discoveredSpecs.length,
                derivedRequirementsCount: synthesizedRequirements.length,
                totalRequirementsCount: allRequirements.length,
                origin: discoveredSpecs.length > 0 ? 'DISCOVERED_HYBRID' : 'SYNTHESIZED_BASELINE'
            }
        };

        return canonicalBlueprint;
    }

    _extractProjectMetadata(projectRoot) {
        let name = path.basename(projectRoot);
        let version = '1.0.0';
        let description = 'Autonomous Engineering Application';
        let packagingTargets = ['ZIP', 'NPM'];

        const pkgPath = path.join(projectRoot, 'package.json');
        if (fs.existsSync(pkgPath)) {
            try {
                const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
                if (pkg.name) name = pkg.name;
                if (pkg.version) version = pkg.version;
                if (pkg.description) description = pkg.description;
            } catch (e) {
                // Defensive fallback
            }
        }

        const configPath = path.join(projectRoot, 'eaorcs.config.yaml');
        if (fs.existsSync(configPath)) {
            try {
                const content = fs.readFileSync(configPath, 'utf8');
                if (content.includes('name:')) {
                    const match = content.match(/name:\s*['"]?([^'"\n]+)['"]?/);
                    if (match) name = match[1].trim();
                }
            } catch (e) {}
        }

        return { name, version, description, packagingTargets };
    }

    _parseSpecContent(spec, requirements, decisions, boundedContexts) {
        if (!spec.absolutePath || !fs.existsSync(spec.absolutePath)) return;

        try {
            const content = fs.readFileSync(spec.absolutePath, 'utf8');
            const lines = content.split(/\r?\n/);

            let currentSection = '';
            let reqIdx = requirements.length + 1;

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('#')) {
                    currentSection = trimmed.replace(/^#+\s*/, '');
                    if (currentSection.toLowerCase().includes('domain') || currentSection.toLowerCase().includes('context')) {
                        boundedContexts.add(currentSection.split(' ')[0]);
                    }
                } else if (trimmed.startsWith('- [ ]') || trimmed.startsWith('- [x]') || trimmed.startsWith('* ')) {
                    const reqTitle = trimmed.replace(/^(-\s*\[[ x]\]|\*)\s*/, '');
                    if (reqTitle.length > 5) {
                        requirements.push({
                            id: `REQ-${String(reqIdx++).padStart(3, '0')}`,
                            title: reqTitle,
                            category: spec.type || 'FUNCTIONAL',
                            section: currentSection || 'General',
                            priority: 'HIGH',
                            status: trimmed.includes('[x]') ? 'IMPLEMENTED' : 'PENDING',
                            sourceFile: spec.path
                        });
                    }
                }
            }

            if (spec.type === 'ADR') {
                decisions.push({
                    id: `ADR-${String(decisions.length + 1).padStart(3, '0')}`,
                    title: spec.title || path.basename(spec.path),
                    status: 'ACCEPTED',
                    sourceFile: spec.path
                });
            }
        } catch (e) {
            // Defensive handling
        }
    }

    _synthesizeBaselineRequirements(metadata, existingReqs) {
        const requiredCategories = [
            { id: 'REQ-BASE-001', title: 'Core Blueprint Discovery & Verification Engine', category: 'INTELLIGENCE' },
            { id: 'REQ-BASE-002', title: 'Product Completion & Gap Analysis Matrix', category: 'COMPLETION' },
            { id: 'REQ-BASE-003', title: 'Autonomous Engineering Task & Remediation Planner', category: 'REMEDIATION' },
            { id: 'REQ-BASE-004', title: 'End-to-End Engineering Knowledge & Traceability Graph', category: 'TRACEABILITY' },
            { id: 'REQ-BASE-005', title: 'Automated Governance, Policy & Compliance Attestation', category: 'GOVERNANCE' },
            { id: 'REQ-BASE-006', title: 'Continuous Observability & Runtime Telemetry Engine', category: 'OPERATIONS' },
            { id: 'REQ-BASE-007', title: 'Immutable Release Packaging & Federation Registration', category: 'PACKAGING' }
        ];

        const existingTitles = new Set(existingReqs.map(r => r.title.toLowerCase()));
        const synthesized = [];

        for (const req of requiredCategories) {
            if (!existingTitles.has(req.title.toLowerCase())) {
                synthesized.push({
                    id: req.id,
                    title: req.title,
                    category: req.category,
                    section: 'Synthesized Core Requirements',
                    priority: 'CRITICAL',
                    status: 'PENDING',
                    sourceFile: 'SYNTHESIZED'
                });
            }
        }

        return synthesized;
    }
}

module.exports = CanonicalProjectBlueprintEngine;
