/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Governance Registry Engine
 * File           : GovernanceRegistryEngine.js
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
 * CORP: Stream 2 — Platform, Capability & Governance Registries
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

const fs = require('fs');
const path = require('path');

function toYaml(data, indent = 0) {
    const pad = ' '.repeat(indent);
    if (data === null || data === undefined) return 'null';
    if (typeof data === 'boolean' || typeof data === 'number') return String(data);
    if (typeof data === 'string') {
        if (data.includes('\n') || data.includes(': ') || data.includes('#') || data.includes('"') || data.includes("'") || data.includes('{') || data.includes('}') || data.startsWith('- ')) {
            return JSON.stringify(data);
        }
        return data || '""';
    }
    if (Array.isArray(data)) {
        if (data.length === 0) return '[]';
        return data.map(item => {
            if (typeof item === 'object' && item !== null) {
                const inner = toYaml(item, indent + 2).trimStart();
                return `${pad}- ${inner}`;
            } else {
                return `${pad}- ${toYaml(item, 0)}`;
            }
        }).join('\n');
    }
    if (typeof data === 'object') {
        const keys = Object.keys(data);
        if (keys.length === 0) return '{}';
        return keys.map(key => {
            const val = data[key];
            if (val === null || val === undefined) {
                return `${pad}${key}: null`;
            }
            if (typeof val === 'object') {
                if (Array.isArray(val)) {
                    if (val.length === 0) return `${pad}${key}: []`;
                    return `${pad}${key}:\n${toYaml(val, indent + 2)}`;
                } else {
                    if (Object.keys(val).length === 0) return `${pad}${key}: {}`;
                    return `${pad}${key}:\n${toYaml(val, indent + 2)}`;
                }
            } else {
                return `${pad}${key}: ${toYaml(val, 0)}`;
            }
        }).join('\n');
    }
    return String(data);
}

class GovernanceRegistryEngine {
    constructor(options = {}) {
        this.options = options;
    }

    /**
     * Scans governance standards in docDir / repository and builds governance_registry.yaml object.
     * @param {string} [docDir] 
     * @returns {object} governance_registry.yaml object
     */
    buildGovernanceRegistry(docDir) {
        const root = path.resolve(__dirname, '../../..');
        const targetDir = docDir ? path.resolve(docDir) : root;

        const constitutionalLaws = [
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
        ];

        // Standard governance catalog definitions
        const catalog = [
            {
                id: 'ISO_27001',
                name: 'ISO/IEC 27001 Information Security Management Standard',
                category: 'SECURITY',
                level: 'Level 3: Enterprise Architecture Standards',
                version: '2022',
                status: 'ACTIVE',
                superseded_by: null,
                file_path: '00_engineering_guide/standards/Release_Engineering_Standard.md'
            },
            {
                id: 'SOC_2',
                name: 'SOC 2 Type II Security & Confidentiality Trust Services Criteria',
                category: 'AUDIT',
                level: 'Level 3: Enterprise Architecture Standards',
                version: '2026.1',
                status: 'ACTIVE',
                superseded_by: null,
                file_path: '00_engineering_guide/standards/Release_Engineering_Standard.md'
            },
            {
                id: 'OWASP_ASVS',
                name: 'OWASP Application Security Verification Standard (Level 3)',
                category: 'SECURITY',
                level: 'Level 3: Enterprise Architecture Standards',
                version: '4.0.3',
                status: 'ACTIVE',
                superseded_by: null,
                file_path: '00_engineering_guide/standards/Release_Engineering_Standard.md'
            },
            {
                id: 'NIST_SP_800_161',
                name: 'NIST SP 800-161 Cybersecurity Supply Chain Risk Management',
                category: 'SUPPLY_CHAIN',
                level: 'Level 3: Enterprise Architecture Standards',
                version: 'Rev 1',
                status: 'ACTIVE',
                superseded_by: null,
                file_path: '00_engineering_guide/standards/Release_Engineering_Standard.md'
            },
            {
                id: 'SLSA_LEVEL_4',
                name: 'Supply-chain Levels for Software Artifacts Level 4 Specification',
                category: 'PROVENANCE',
                level: 'Level 3: Enterprise Architecture Standards',
                version: '1.0',
                status: 'ACTIVE',
                superseded_by: null,
                file_path: 'product.manifest.yaml'
            },
            {
                id: 'EU_AI_ACT',
                name: 'EU Artificial Intelligence Act High-Risk AI Governance Framework',
                category: 'REGULATORY',
                level: 'Level 0: Corporate Governance',
                version: '2024/1689',
                status: 'ACTIVE',
                superseded_by: null,
                file_path: 'product.yaml'
            },
            {
                id: 'DORA_NIS2',
                name: 'Digital Operational Resilience Act & NIS2 Cybersecurity Directive',
                category: 'REGULATORY',
                level: 'Level 0: Corporate Governance',
                version: '2024',
                status: 'ACTIVE',
                superseded_by: null,
                file_path: 'product.yaml'
            },
            {
                id: 'OSAP_V2',
                name: 'Open Software Attestation Protocol v2.0 Specification',
                category: 'ATTESTATION',
                level: 'Level 2: EAORCS Governance Blueprint',
                version: '2.0.0',
                status: 'ACTIVE',
                superseded_by: null,
                file_path: 'schemas/osap-core-v2.json'
            },
            {
                id: 'DPA_PDA_V1_1_FROZEN',
                name: 'Distribution Governance Protocol DPA/PDA v1.1.0-FROZEN',
                category: 'DISTRIBUTION',
                level: 'Level 2: EAORCS Governance Blueprint',
                version: '1.1.0-FROZEN',
                status: 'ACTIVE',
                superseded_by: null,
                file_path: 'product.manifest.yaml'
            },
            {
                id: 'AR-STD-PKG-017',
                name: 'Air Roofers Enterprise Packaging Standard 017',
                category: 'PACKAGING',
                level: 'Level 3: Enterprise Architecture Standards',
                version: '1.7.0',
                status: 'ACTIVE',
                superseded_by: null,
                file_path: 'product.yaml'
            },
            {
                id: 'UAIGOS_14_LAWS',
                name: 'UAIGOS 14 Constitutional Governance Laws',
                category: 'CONSTITUTIONAL',
                level: 'Level 1: UAIGOS Constitution',
                version: '2026.3-FROZEN',
                status: 'ACTIVE',
                superseded_by: null,
                file_path: 'PLATFORM_CONSTITUTION.md'
            },
            // Legacy / Superseded / Deprecated Standards
            {
                id: 'DPA_PDA_V1',
                name: 'Distribution Governance Protocol DPA/PDA v1.0 Legacy Draft',
                category: 'DISTRIBUTION',
                level: 'Level 2: EAORCS Governance Blueprint',
                version: '1.0.0',
                status: 'SUPERSEDED',
                superseded_by: 'DPA_PDA_V1_1_FROZEN',
                reason: 'Superseded by v1.1.0-FROZEN Master Specification',
                file_path: 'docs/historical/DPA_PDA_v1.0.md'
            },
            {
                id: 'ISO_27001_2013',
                name: 'ISO/IEC 27001:2013 Information Security Management (Legacy Revision)',
                category: 'SECURITY',
                level: 'Level 3: Enterprise Architecture Standards',
                version: '2013',
                status: 'SUPERSEDED',
                superseded_by: 'ISO_27001',
                reason: 'Superseded by ISO/IEC 27001:2022 Update',
                file_path: 'docs/historical/ISO_27001_2013.md'
            },
            {
                id: 'NIST_SP_800_53_REV4',
                name: 'NIST SP 800-53 Revision 4 Security Controls (Legacy Baseline)',
                category: 'SECURITY',
                level: 'Level 3: Enterprise Architecture Standards',
                version: 'Rev 4',
                status: 'DEPRECATED',
                superseded_by: 'NIST_SP_800_161',
                reason: 'Deprecated in favor of NIST SP 800-161 Rev 1 Supply Chain Controls',
                file_path: 'docs/historical/NIST_800_53_rev4.md'
            }
        ];

        // Scan docDir if files exist to enrich standard references
        const standardsMap = new Map();
        for (const std of catalog) {
            standardsMap.set(std.id, { ...std });
        }

        // Scan markdown files in targetDir for standard references & deprecated tags
        function scanDocs(dirPath, depth = 0) {
            if (depth > 3 || !fs.existsSync(dirPath)) return;
            const entries = fs.readdirSync(dirPath, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    if (['node_modules', '.git', 'dist', 'tmp'].includes(entry.name)) continue;
                    scanDocs(path.join(dirPath, entry.name), depth + 1);
                } else if (entry.isFile() && entry.name.endsWith('.md')) {
                    const filePath = path.join(dirPath, entry.name);
                    const relPath = path.relative(root, filePath).replace(/\\/g, '/');
                    const content = fs.readFileSync(filePath, 'utf8');

                    // Check for DEPRECATED or SUPERSEDED standard headers in docs
                    if (content.includes('STATUS: SUPERSEDED') || content.includes('Status: Deprecated')) {
                        const baseName = entry.name.replace('.md', '');
                        const stdId = baseName.toUpperCase().replace(/[^A-Z0-9_]/g, '_');
                        if (!standardsMap.has(stdId)) {
                            standardsMap.set(stdId, {
                                id: stdId,
                                name: baseName.replace(/_/g, ' '),
                                category: 'DOCUMENTATION',
                                level: 'Level 6: Implementation Guides',
                                version: '1.0',
                                status: content.includes('SUPERSEDED') ? 'SUPERSEDED' : 'DEPRECATED',
                                superseded_by: 'CURRENT_SPECIFICATION',
                                reason: 'Marked deprecated in document header',
                                file_path: relPath
                            });
                        }
                    }
                }
            }
        }

        scanDocs(targetDir);

        const standardsList = Array.from(standardsMap.values());
        const activeCount = standardsList.filter(s => s.status === 'ACTIVE').length;
        const supersededCount = standardsList.filter(s => s.status === 'SUPERSEDED' || s.status === 'DEPRECATED' || s.superseded_by).length;

        const registry = {
            registry_version: '2026.3.1-LTS',
            generated_at: new Date().toISOString(),
            total_standards: standardsList.length,
            active_standards_count: activeCount,
            superseded_standards_count: supersededCount,
            constitutional_laws: constitutionalLaws,
            standards: standardsList
        };

        return registry;
    }

    /**
     * Detects superseded and deprecated standards from governance registry.
     * @param {object|string} registryOrDir 
     * @returns {Array<object>} list of superseded/deprecated standards
     */
    detectSupersededStandards(registryOrDir) {
        let registry = registryOrDir;
        if (!registry || typeof registry === 'string') {
            registry = this.buildGovernanceRegistry(registryOrDir);
        }

        if (!registry || !Array.isArray(registry.standards)) {
            return [];
        }

        return registry.standards.filter(std => {
            return std.status === 'SUPERSEDED' ||
                   std.status === 'DEPRECATED' ||
                   (std.superseded_by !== null && std.superseded_by !== undefined);
        });
    }

    /**
     * Exports governance registry as YAML or JSON.
     * @param {object} registry 
     * @param {string} [outputPath] 
     * @returns {string} content
     */
    exportRegistry(registry, outputPath) {
        if (!registry) {
            throw new Error('Registry object must be provided');
        }
        let content = '';
        if (outputPath && outputPath.endsWith('.json')) {
            content = JSON.stringify(registry, null, 2);
        } else {
            content = `# EAORCS Governance Registry Definition\n# Generated: ${new Date().toISOString()}\n\n` + toYaml(registry);
        }

        if (outputPath) {
            const dir = path.dirname(path.resolve(outputPath));
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(outputPath, content, 'utf8');
        }

        return content;
    }

    static buildGovernanceRegistry(docDir) {
        return new GovernanceRegistryEngine().buildGovernanceRegistry(docDir);
    }

    static detectSupersededStandards(registry) {
        return new GovernanceRegistryEngine().detectSupersededStandards(registry);
    }

    static exportRegistry(registry, outputPath) {
        return new GovernanceRegistryEngine().exportRegistry(registry, outputPath);
    }
}

module.exports = GovernanceRegistryEngine;
module.exports.GovernanceRegistryEngine = GovernanceRegistryEngine;
