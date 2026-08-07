/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Dynamic Capability Registry Architecture
 * File           : CapabilityRegistryEngine.js
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

function parseYaml(text) {
    if (!text || typeof text !== 'string') return {};
    try {
        const rawLines = text.split(/\r?\n/);
        const parsedLines = [];
        for (const rawLine of rawLines) {
            let line = rawLine;
            let inQuote = false;
            let quoteChar = '';
            for (let i = 0; i < line.length; i++) {
                const ch = line[i];
                if ((ch === '"' || ch === "'") && (i === 0 || line[i - 1] !== '\\')) {
                    if (!inQuote) { inQuote = true; quoteChar = ch; }
                    else if (quoteChar === ch) { inQuote = false; }
                } else if (ch === '#' && !inQuote) {
                    line = line.slice(0, i);
                    break;
                }
            }
            if (line.trim().length > 0) {
                const indent = line.search(/\S/);
                parsedLines.push({ indent, content: line.trim() });
            }
        }

        let cursor = 0;

        function parseLevel(minIndent) {
            let result = null;
            let isArray = false;

            while (cursor < parsedLines.length) {
                const { indent, content } = parsedLines[cursor];
                if (indent < minIndent) break;

                if (content.startsWith('- ')) {
                    if (result === null) { result = []; isArray = true; }
                    const itemContent = content.slice(2).trim();
                    cursor++;
                    if (itemContent.includes(':')) {
                        const colonIdx = itemContent.indexOf(':');
                        const key = itemContent.slice(0, colonIdx).trim().replace(/^['"]|['"]$/g, '');
                        const val = itemContent.slice(colonIdx + 1).trim().replace(/^['"]|['"]$/g, '');
                        const obj = {};
                        if (val) {
                            obj[key] = parseVal(val);
                        } else if (cursor < parsedLines.length && parsedLines[cursor].indent > indent) {
                            obj[key] = parseLevel(parsedLines[cursor].indent);
                        } else {
                            obj[key] = null;
                        }

                        while (cursor < parsedLines.length && parsedLines[cursor].indent > indent) {
                            const nextLine = parsedLines[cursor];
                            if (nextLine.content.startsWith('- ')) break;
                            if (nextLine.content.includes(':')) {
                                const cIdx = nextLine.content.indexOf(':');
                                const k = nextLine.content.slice(0, cIdx).trim().replace(/^['"]|['"]$/g, '');
                                const v = nextLine.content.slice(cIdx + 1).trim().replace(/^['"]|['"]$/g, '');
                                cursor++;
                                if (v) {
                                    obj[k] = parseVal(v);
                                } else if (cursor < parsedLines.length && parsedLines[cursor].indent > nextLine.indent) {
                                    obj[k] = parseLevel(parsedLines[cursor].indent);
                                } else {
                                    obj[k] = null;
                                }
                            } else {
                                cursor++;
                            }
                        }
                        result.push(obj);
                    } else if (itemContent) {
                        result.push(parseVal(itemContent));
                    } else if (cursor < parsedLines.length && parsedLines[cursor].indent > indent) {
                        result.push(parseLevel(parsedLines[cursor].indent));
                    } else {
                        result.push(null);
                    }
                } else if (content.includes(':')) {
                    if (result === null) { result = {}; isArray = false; }
                    const colonIdx = content.indexOf(':');
                    const key = content.slice(0, colonIdx).trim().replace(/^['"]|['"]$/g, '');
                    const val = content.slice(colonIdx + 1).trim().replace(/^['"]|['"]$/g, '');
                    cursor++;
                    if (val) {
                        result[key] = parseVal(val);
                    } else if (cursor < parsedLines.length && parsedLines[cursor].indent > indent) {
                        result[key] = parseLevel(parsedLines[cursor].indent);
                    } else {
                        result[key] = null;
                    }
                } else {
                    cursor++;
                }
            }
            return result !== null ? result : {};
        }

        function parseVal(v) {
            if (!v) return null;
            if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
                return v.slice(1, -1);
            }
            if (v === 'true') return true;
            if (v === 'false') return false;
            if (v === 'null' || v === '~') return null;
            if (!isNaN(v) && v !== '') return Number(v);
            return v;
        }

        return parseLevel(0) || {};
    } catch (e) {
        return {};
    }
}

class CapabilityRegistryEngine {
    constructor(options = {}) {
        this.options = options;
        this.capabilities = new Map();
        this._registerBuiltInCapabilities();
    }

    _registerBuiltInCapabilities() {
        const builtIns = [
            { id: 'cap.blueprint', name: 'Blueprint Capability', bounded_context: 'INTELLIGENCE', category: 'INTELLIGENCE', version: '2026.3.0', lifecycle: 'GA', dependsOn: [], produces: ['canonicalBlueprint'] },
            { id: 'cap.requirements', name: 'Requirements Capability', bounded_context: 'INTELLIGENCE', category: 'INTELLIGENCE', version: '2026.3.0', lifecycle: 'GA', dependsOn: ['cap.blueprint'], produces: ['functionalRequirements'] },
            { id: 'cap.architecture', name: 'Architecture Conformance Capability', bounded_context: 'GOVERNANCE', category: 'GOVERNANCE', version: '2026.3.0', lifecycle: 'GA', dependsOn: ['cap.blueprint'], produces: ['adrs'] },
            { id: 'cap.knowledgeGraph', name: 'Knowledge Graph Capability', bounded_context: 'TRACEABILITY', category: 'TRACEABILITY', version: '2026.3.0', lifecycle: 'GA', dependsOn: ['cap.blueprint', 'cap.requirements'], produces: ['knowledgeGraph'] },
            { id: 'cap.coach', name: 'Engineering Coach Capability', bounded_context: 'ADVISORY', category: 'ADVISORY', version: '2026.3.0', lifecycle: 'GA', dependsOn: ['cap.knowledgeGraph'], produces: ['coachAdvisory'] },
            { id: 'cap.completion', name: 'Completion Intelligence Capability', bounded_context: 'COMPLETION', category: 'COMPLETION', version: '2026.3.0', lifecycle: 'GA', dependsOn: ['cap.blueprint', 'cap.requirements'], produces: ['completionReport'] },
            { id: 'cap.planner', name: 'Autonomous Planner Capability', bounded_context: 'REMEDIATION', category: 'REMEDIATION', version: '2026.3.0', lifecycle: 'GA', dependsOn: ['cap.completion'], produces: ['executionPlan'] },
            { id: 'cap.packaging', name: 'Distribution Packaging Capability', bounded_context: 'DELIVERY', category: 'DELIVERY', version: '2026.3.0', lifecycle: 'GA', dependsOn: ['cap.completion'], produces: ['packagingManifest'] },
            { id: 'cap.federation', name: 'Ecosystem Federation Capability', bounded_context: 'FEDERATION', category: 'FEDERATION', version: '2026.3.0', lifecycle: 'GA', dependsOn: ['cap.packaging'], produces: ['federationRegistration'] }
        ];

        for (const cap of builtIns) {
            this.registerCapability(cap);
        }
    }

    registerCapability(descriptor) {
        if (!descriptor || !descriptor.id || !descriptor.name) {
            throw new Error('Invalid capability descriptor provided');
        }
        const normalized = {
            id: descriptor.id,
            name: descriptor.name,
            bounded_context: descriptor.bounded_context || descriptor.category || 'General',
            lifecycle: descriptor.lifecycle || 'GA',
            version: descriptor.version || '2026.3.0',
            endpoint: descriptor.endpoint || null,
            security_level: descriptor.security_level || 'HIGH',
            sla_tier: descriptor.sla_tier || 'ENTERPRISE',
            dependencies: descriptor.dependencies || descriptor.dependsOn || [],
            product_id: descriptor.product_id || 'eaorcs',
            release_version: descriptor.release_version || '2026.3.1-LTS',
            registeredAt: descriptor.registeredAt || new Date().toISOString()
        };
        this.capabilities.set(descriptor.id, normalized);
        return normalized;
    }

    getCapability(id) {
        return this.capabilities.get(id);
    }

    listCapabilities() {
        return Array.from(this.capabilities.values());
    }

    /**
     * Extracts exported capabilities and builds capability_registry.yaml object.
     * @param {string} [workspaceRoot] 
     * @returns {object} capability_registry.yaml object
     */
    buildCapabilityRegistry(workspaceRoot) {
        const root = workspaceRoot ? path.resolve(workspaceRoot) : path.resolve(__dirname, '../../..');

        // Scan manifest files & json configs for capabilities
        const candidateFiles = [
            path.join(root, 'product.manifest.yaml'),
            path.join(root, 'product.yaml'),
            path.join(root, 'config', 'airroofers-capability-registry.json'),
            path.join(root, 'eaorcs.config.yaml')
        ];

        let contractBindings = {};

        for (const filePath of candidateFiles) {
            if (!fs.existsSync(filePath)) continue;

            const content = fs.readFileSync(filePath, 'utf8');
            let parsed = null;
            if (filePath.endsWith('.json')) {
                try { parsed = JSON.parse(content); } catch (e) { parsed = null; }
            } else {
                parsed = parseYaml(content);
            }

            if (!parsed || typeof parsed !== 'object') continue;

            if (parsed.contract_bindings && typeof parsed.contract_bindings === 'object') {
                contractBindings = { ...contractBindings, ...parsed.contract_bindings };
            }

            const capsList = parsed.capabilities || (parsed.product && parsed.product.capabilities);
            if (Array.isArray(capsList)) {
                for (const item of capsList) {
                    if (item && item.id && item.name) {
                        this.registerCapability({
                            ...item,
                            product_id: parsed.product ? parsed.product.id : 'eaorcs',
                            release_version: parsed.product ? parsed.product.version : '2026.3.1-LTS'
                        });
                    }
                }
            }
        }

        const caps = Array.from(this.capabilities.values());
        const boundedContexts = Array.from(new Set(caps.map(c => c.bounded_context)));

        const registry = {
            registry_version: '2026.3.1-LTS',
            generated_at: new Date().toISOString(),
            total_capabilities: caps.length,
            bounded_contexts: boundedContexts,
            contract_bindings: contractBindings,
            capabilities: caps
        };

        return registry;
    }

    /**
     * Returns product and release bindings for a capability ID.
     * @param {string} capabilityId 
     * @returns {object} bindings object
     */
    getCapabilityBindings(capabilityId) {
        if (!capabilityId) {
            throw new Error('Capability ID must be specified');
        }

        let cap = this.capabilities.get(capabilityId);
        if (!cap) {
            // Case insensitive fallback check
            for (const item of this.capabilities.values()) {
                if (item.id.toLowerCase() === capabilityId.toLowerCase()) {
                    cap = item;
                    break;
                }
            }
        }

        if (!cap) {
            // If not found in built-ins, try scanning default workspace
            this.buildCapabilityRegistry();
            cap = this.capabilities.get(capabilityId);
        }

        if (!cap) {
            return {
                capabilityId,
                bound: false,
                message: `Capability ${capabilityId} is not bound to any product release.`
            };
        }

        return {
            capabilityId: cap.id,
            bound: true,
            product: {
                id: cap.product_id || 'eaorcs',
                name: 'Enterprise Autonomous Operational Readiness & Certification System',
                version: cap.release_version || '2026.3.1-LTS',
                bounded_context: cap.bounded_context
            },
            release: {
                profile: 'COMMERCIAL_ENTERPRISE_GA',
                channel: 'AIRROOFERS_ENTERPRISE_DISTRIBUTION',
                lifecycle: cap.lifecycle || 'GA',
                version: cap.version || '2026.3.1-LTS'
            },
            bindings: {
                endpoint: cap.endpoint || null,
                security_level: cap.security_level || 'HIGH',
                sla_tier: cap.sla_tier || 'MISSION_CRITICAL',
                dependencies: cap.dependencies || []
            }
        };
    }

    /**
     * Exports capability registry as YAML or JSON.
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
            content = `# EAORCS Capability Registry Definition\n# Generated: ${new Date().toISOString()}\n\n` + toYaml(registry);
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

    static buildCapabilityRegistry(workspaceRoot) {
        const instance = new CapabilityRegistryEngine();
        return instance.buildCapabilityRegistry(workspaceRoot);
    }

    static getCapabilityBindings(capabilityId, workspaceRoot) {
        const instance = new CapabilityRegistryEngine();
        instance.buildCapabilityRegistry(workspaceRoot);
        return instance.getCapabilityBindings(capabilityId);
    }

    static exportRegistry(registry, outputPath) {
        return new CapabilityRegistryEngine().exportRegistry(registry, outputPath);
    }
}

module.exports = CapabilityRegistryEngine;
module.exports.CapabilityRegistryEngine = CapabilityRegistryEngine;
