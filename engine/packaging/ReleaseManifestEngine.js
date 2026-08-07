/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Master Release Manifest Engine
 * File           : ReleaseManifestEngine.js
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
 * CORP: Stream 1 — Master Release Manifest & Customer Trimming
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

function toYaml(data, indentLevel = 0) {
    const indent = ' '.repeat(indentLevel);
    if (data === null || data === undefined) return 'null\n';
    if (typeof data === 'boolean' || typeof data === 'number') return `${data}\n`;
    if (typeof data === 'string') {
        if (data.includes('\n')) {
            return `|\n` + data.split('\n').map(line => indent + '  ' + line).join('\n') + '\n';
        }
        if (/[ \t:#{}[\]&*?|<>=!%@`]/.test(data) || data === '' || !isNaN(Number(data))) {
            return `"${data.replace(/"/g, '\\"')}"\n`;
        }
        return `${data}\n`;
    }
    if (Array.isArray(data)) {
        if (data.length === 0) return '[]\n';
        let res = '\n';
        for (const item of data) {
            if (typeof item === 'object' && item !== null) {
                const itemYaml = toYaml(item, indentLevel + 2);
                const lines = itemYaml.trim().split('\n');
                res += `${indent}- ${lines[0]}\n`;
                for (let i = 1; i < lines.length; i++) {
                    res += `${indent}  ${lines[i]}\n`;
                }
            } else {
                res += `${indent}- ${toYaml(item, 0)}`;
            }
        }
        return res;
    }
    if (typeof data === 'object') {
        const keys = Object.keys(data);
        if (keys.length === 0) return '{}\n';
        let res = indentLevel === 0 ? '' : '\n';
        for (const key of keys) {
            const val = data[key];
            if (val === undefined) continue;
            if (typeof val === 'object' && val !== null && !Array.isArray(val) && Object.keys(val).length > 0) {
                res += `${indent}${key}:${toYaml(val, indentLevel + 2)}`;
            } else if (Array.isArray(val)) {
                res += `${indent}${key}:${toYaml(val, indentLevel)}`;
            } else {
                res += `${indent}${key}: ${toYaml(val, indentLevel)}`;
            }
        }
        return res;
    }
    return `${String(data)}\n`;
}

class ReleaseManifestEngine {
    generateMasterReleaseManifest(config = {}) {
        const releaseId = config.releaseId || 'REL-2026.3.1-LTS';
        const buildId = config.buildId || `BUILD-${Date.now()}`;
        const gitCommit = config.gitCommit || 'c9b4e870e9ec48ef';

        let provenance = config.provenance;
        if (!provenance) {
            const now = new Date().toISOString();
            const provenanceData = {
                releaseId,
                buildId,
                gitCommit,
                architectureVersion: config.architectureVersion || '3.0.0',
                constitutionVersion: config.constitutionVersion || '1.4.0',
                contractRegistryVersion: config.contractRegistryVersion || '2026.3.1',
                generatedAt: now,
                canonicalSourceSnapshot: '01_source_snapshot.zip',
                governanceAuthority: config.governanceAuthority || 'Ujomor Systems & Enterprise Governance Board'
            };
            const provenanceHash = crypto.createHash('sha256')
                .update(JSON.stringify(provenanceData))
                .digest('hex');
            provenance = {
                ...provenanceData,
                provenanceHash
            };
        }

        const registryReferences = config.registryReferences || {
            platformRegistry: 'platform_registry.yaml',
            capabilityRegistry: 'capability_registry.yaml',
            governanceRegistry: 'governance_registry.yaml'
        };

        const governanceSeals = config.governanceSeals || {
            lawsCertifiedCount: 14,
            architectureStatus: 'FROZEN',
            securityReview: 'PASSED',
            corporatePolicy: 'GOVERNED',
            seals: ['ISO-27001', 'SOC-2', 'OWASP-ASVS', 'NIST']
        };

        const artifacts = config.artifacts || [];

        return {
            releaseId,
            buildId,
            gitCommit,
            provenance,
            artifacts,
            registryReferences,
            governanceSeals
        };
    }

    deriveRBOM(masterManifest) {
        if (!masterManifest) {
            throw new Error('Master release manifest is required to derive RBOM');
        }
        const artifacts = masterManifest.artifacts || [];
        const rbomData = {
            release: masterManifest.releaseId || '2026.3.1-LTS',
            sourceSnapshot: '01_source_snapshot.zip',
            provenanceHash: masterManifest.provenance ? masterManifest.provenance.provenanceHash : 'N/A',
            gitCommit: masterManifest.gitCommit || 'N/A',
            buildId: masterManifest.buildId || 'N/A',
            artifactsCount: artifacts.length,
            generatedArtifacts: artifacts.map(a => ({
                packageId: a.packageId,
                packageName: a.packageName,
                filename: a.filename,
                sha256: a.sha256,
                sizeMB: a.sizeMB,
                audience: a.audience
            })),
            generatedAt: (masterManifest.provenance && masterManifest.provenance.generatedAt) || new Date().toISOString()
        };

        const rbomHash = crypto.createHash('sha256')
            .update(JSON.stringify(rbomData))
            .digest('hex');

        return {
            ...rbomData,
            rbomHash
        };
    }

    deriveManifest(masterManifest) {
        if (!masterManifest) {
            throw new Error('Master release manifest is required to derive MANIFEST');
        }
        const artifacts = masterManifest.artifacts || [];
        const version = masterManifest.releaseId ? masterManifest.releaseId.replace(/^REL-/, '') : '2026.3.1-LTS';
        const generatedAt = (masterManifest.provenance && masterManifest.provenance.generatedAt) || new Date().toISOString();
        const releaseDate = generatedAt.split('T')[0];
        const governanceAuthority = (masterManifest.provenance && masterManifest.provenance.governanceAuthority) || 'Ujomor Systems & Enterprise Governance Board';
        const provenanceHash = masterManifest.provenance ? masterManifest.provenance.provenanceHash : 'N/A';
        const lawsCertified = (masterManifest.governanceSeals && masterManifest.governanceSeals.lawsCertifiedCount) || 14;

        return {
            releaseId: masterManifest.releaseId,
            projectName: 'EAORCS Governance Platform',
            version,
            releaseDate,
            generatedAt,
            governanceAuthority,
            provenanceHash,
            lawsCertified,
            decisionRegistry: 'DEC-01 through DEC-13',
            artifactsCount: artifacts.length,
            artifacts,
            registryReferences: masterManifest.registryReferences || {},
            governanceSeals: masterManifest.governanceSeals || {}
        };
    }

    deriveProvenance(masterManifest) {
        if (!masterManifest || !masterManifest.provenance) {
            throw new Error('Master release manifest with valid provenance is required to derive RELEASE_PROVENANCE');
        }
        return masterManifest.provenance;
    }

    exportReleaseManifestYaml(masterManifest, outputPath) {
        if (!masterManifest) {
            throw new Error('Master release manifest is required for export');
        }
        const yamlContent = toYaml(masterManifest);
        if (outputPath) {
            const dir = path.dirname(outputPath);
            fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(outputPath, yamlContent, 'utf8');
        }
        return yamlContent;
    }

    exportPlatformRegistryYaml(outputPath) {
        const platformRegistry = {
            platformName: 'EAORCS Platform',
            version: '2026.3.1-LTS',
            constitutionVersion: '1.4.0',
            architectureVersion: '3.0.0',
            layers: [
                'Workspace',
                'Engineering Intent',
                'Engineering Session',
                'Execution Graph',
                'Transaction',
                'Evidence'
            ],
            contracts: [
                'CONTRACT-FACADE',
                'CONTRACT-CAPABILITY',
                'CONTRACT-INTERACTION',
                'CONTRACT-RESPONSE-MODEL',
                'CONTRACT-SESSION',
                'CONTRACT-JOURNAL',
                'CONTRACT-RENDERER',
                'CONTRACT-GOVERNANCE',
                'CONTRACT-SURFACE-PROFILE'
            ],
            generatedAt: new Date().toISOString()
        };
        const yamlContent = toYaml(platformRegistry);
        if (outputPath) {
            const dir = path.dirname(outputPath);
            fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(outputPath, yamlContent, 'utf8');
        }
        return yamlContent;
    }

    exportCapabilityRegistryYaml(outputPath) {
        const capabilityRegistry = {
            version: '2026.3.1-LTS',
            capabilities: [
                { id: 'cap.blueprint', name: 'Blueprint Capability', category: 'INTELLIGENCE', version: '2026.3.1' },
                { id: 'cap.requirements', name: 'Requirements Capability', category: 'INTELLIGENCE', version: '2026.3.1' },
                { id: 'cap.architecture', name: 'Architecture Conformance Capability', category: 'GOVERNANCE', version: '2026.3.1' },
                { id: 'cap.knowledgeGraph', name: 'Knowledge Graph Capability', category: 'TRACEABILITY', version: '2026.3.1' },
                { id: 'cap.coach', name: 'Engineering Coach Capability', category: 'ADVISORY', version: '2026.3.1' },
                { id: 'cap.completion', name: 'Completion Intelligence Capability', category: 'COMPLETION', version: '2026.3.1' },
                { id: 'cap.planner', name: 'Autonomous Planner Capability', category: 'REMEDIATION', version: '2026.3.1' },
                { id: 'cap.packaging', name: 'Distribution Packaging Capability', category: 'DELIVERY', version: '2026.3.1' },
                { id: 'cap.federation', name: 'Ecosystem Federation Capability', category: 'FEDERATION', version: '2026.3.1' }
            ],
            generatedAt: new Date().toISOString()
        };
        const yamlContent = toYaml(capabilityRegistry);
        if (outputPath) {
            const dir = path.dirname(outputPath);
            fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(outputPath, yamlContent, 'utf8');
        }
        return yamlContent;
    }

    exportGovernanceRegistryYaml(outputPath) {
        const governanceRegistry = {
            version: '2026.3.1-LTS',
            governanceAuthority: 'Ujomor Systems & Enterprise Governance Board',
            lawsCertifiedCount: 14,
            laws: [
                'Law 1: Single Public Facade',
                'Law 2: Deterministic Execution',
                'Law 3: Explainable Decisions',
                'Law 4: Auditable Evidence',
                'Law 5: Reversible Modifications',
                'Law 6: Backward Compliance',
                'Law 7: Explicit Capability Contracts',
                'Law 8: Zero Hidden Side-Effects',
                'Law 9: No AI-Only Dependency',
                'Law 10: Reproducible Outcomes',
                'Law 11: Platform Parity',
                'Law 12: Native Surface Experience',
                'Law 13: Interaction Continuity',
                'Law 14: Rendering Neutrality'
            ],
            standards: ['ISO 27001', 'SOC 2', 'OWASP ASVS', 'NIST'],
            decisionRegistry: 'DEC-01 through DEC-13',
            generatedAt: new Date().toISOString()
        };
        const yamlContent = toYaml(governanceRegistry);
        if (outputPath) {
            const dir = path.dirname(outputPath);
            fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(outputPath, yamlContent, 'utf8');
        }
        return yamlContent;
    }
}

// Attach static shortcuts to class
ReleaseManifestEngine.generateMasterReleaseManifest = function(config) {
    return (new ReleaseManifestEngine()).generateMasterReleaseManifest(config);
};
ReleaseManifestEngine.deriveRBOM = function(masterManifest) {
    return (new ReleaseManifestEngine()).deriveRBOM(masterManifest);
};
ReleaseManifestEngine.deriveManifest = function(masterManifest) {
    return (new ReleaseManifestEngine()).deriveManifest(masterManifest);
};
ReleaseManifestEngine.deriveProvenance = function(masterManifest) {
    return (new ReleaseManifestEngine()).deriveProvenance(masterManifest);
};
ReleaseManifestEngine.exportReleaseManifestYaml = function(masterManifest, outputPath) {
    return (new ReleaseManifestEngine()).exportReleaseManifestYaml(masterManifest, outputPath);
};
ReleaseManifestEngine.exportPlatformRegistryYaml = function(outputPath) {
    return (new ReleaseManifestEngine()).exportPlatformRegistryYaml(outputPath);
};
ReleaseManifestEngine.exportCapabilityRegistryYaml = function(outputPath) {
    return (new ReleaseManifestEngine()).exportCapabilityRegistryYaml(outputPath);
};
ReleaseManifestEngine.exportGovernanceRegistryYaml = function(outputPath) {
    return (new ReleaseManifestEngine()).exportGovernanceRegistryYaml(outputPath);
};

module.exports = ReleaseManifestEngine;
