/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Platform Registry Engine
 * File           : PlatformRegistryEngine.js
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

/**
 * Pure JavaScript YAML Serializer
 */
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

/**
 * Pure JavaScript Lightweight Line-Indentation YAML Parser
 */
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

class PlatformRegistryEngine {
    constructor(options = {}) {
        this.options = options;
    }

    /**
     * Scans product descriptors in workspace and builds platform_registry.yaml object.
     * @param {string} [workspaceRoot] 
     * @returns {object} platform_registry.yaml object
     */
    buildPlatformRegistry(workspaceRoot) {
        const root = workspaceRoot ? path.resolve(workspaceRoot) : path.resolve(__dirname, '../../..');
        const productDescriptors = [];

        // Known candidate files to inspect in workspace
        const candidateFiles = [
            'product.yaml',
            'product.manifest.yaml',
            'eaorcs.config.yaml',
            'airroofers.workspace.yaml',
            'federation.manifest.yaml',
            'distribution_manifest.yaml',
            'package.json'
        ];

        // Also search subdirectories for descriptors
        function scanDir(dirPath, depth = 0) {
            if (depth > 3 || !fs.existsSync(dirPath)) return;
            const entries = fs.readdirSync(dirPath, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    if (['node_modules', '.git', 'dist', 'tmp', 'scratch', 'coverage'].includes(entry.name)) continue;
                    scanDir(path.join(dirPath, entry.name), depth + 1);
                } else if (entry.isFile()) {
                    if (entry.name === 'product.yaml' || entry.name === 'product.manifest.yaml' || entry.name.endsWith('.workspace.yaml')) {
                        const fullPath = path.join(dirPath, entry.name);
                        if (!candidateFiles.includes(fullPath)) {
                            candidateFiles.push(fullPath);
                        }
                    }
                }
            }
        }

        scanDir(root);

        const productsMap = new Map();
        const domainsSet = new Set();
        const ownersSet = new Set();
        const lifecyclesSet = new Set();
        const releaseChannelsSet = new Set();

        for (const fileItem of candidateFiles) {
            const fullPath = path.isAbsolute(fileItem) ? fileItem : path.join(root, fileItem);
            if (!fs.existsSync(fullPath)) continue;

            const fileContent = fs.readFileSync(fullPath, 'utf8');
            let parsed = null;
            if (fullPath.endsWith('.json')) {
                try { parsed = JSON.parse(fileContent); } catch (e) { parsed = null; }
            } else if (fullPath.endsWith('.yaml') || fullPath.endsWith('.yml')) {
                parsed = parseYaml(fileContent);
            }

            if (!parsed || typeof parsed !== 'object') continue;

            // Product extraction
            const prodObj = parsed.product || parsed;
            const id = prodObj.id || parsed.name || (fullPath.endsWith('package.json') ? parsed.name : null);
            if (!id || typeof id !== 'string') continue;

            const name = prodObj.name || parsed.name || id;
            const owner = prodObj.owner || parsed.owner || prodObj.organization || 'Ujomor Systems & Enterprise Governance Authority';
            const domain = prodObj.federated_domain || prodObj.domain || (parsed.canonical_domain_bindings && parsed.canonical_domain_bindings.products) || 'eaorcs.airroofers.eu';
            const lifecycle = prodObj.lifecycle_state || prodObj.maturity || parsed.maturity || 'GA';
            const releaseChannel = (prodObj.distribution && prodObj.distribution.channel) || prodObj.release_profile || parsed.release_profile || 'AIRROOFERS_ENTERPRISE_DISTRIBUTION';
            const version = prodObj.version || parsed.api_version || parsed.version || '2026.3.1-LTS';
            const boundedContext = prodObj.bounded_context || parsed.bounded_context || 'Autonomous AI Governance & Regulatory Certification';

            domainsSet.add(domain);
            ownersSet.add(owner);
            lifecyclesSet.add(lifecycle);
            releaseChannelsSet.add(releaseChannel);

            if (parsed.canonical_domain_bindings && typeof parsed.canonical_domain_bindings === 'object') {
                for (const dVal of Object.values(parsed.canonical_domain_bindings)) {
                    if (typeof dVal === 'string' && dVal.startsWith('http')) {
                        domainsSet.add(dVal.replace(/^https?:\/\//, ''));
                    }
                }
            }

            const prodEntry = {
                id,
                name,
                domain,
                owner,
                lifecycle,
                release_channels: [releaseChannel],
                bounded_context: boundedContext,
                version,
                descriptor_file: path.relative(root, fullPath).replace(/\\/g, '/')
            };

            if (productsMap.has(id)) {
                const existing = productsMap.get(id);
                if (!existing.release_channels.includes(releaseChannel)) {
                    existing.release_channels.push(releaseChannel);
                }
            } else {
                productsMap.set(id, prodEntry);
            }
        }

        // If no products parsed, generate standard default entry
        if (productsMap.size === 0) {
            const defaultProd = {
                id: 'eaorcs',
                name: 'Enterprise Autonomous Operational Readiness & Certification System',
                domain: 'eaorcs.airroofers.eu',
                owner: 'Ujomor Systems & Enterprise Governance Authority',
                lifecycle: 'PRODUCTION_LTS',
                release_channels: ['AIRROOFERS_ENTERPRISE_DISTRIBUTION'],
                bounded_context: 'Software Trust Engine, Autonomous Auditability & Runtime Regulatory Assurance',
                version: '2026.3.1-LTS',
                descriptor_file: 'product.yaml'
            };
            productsMap.set('eaorcs', defaultProd);
            domainsSet.add(defaultProd.domain);
            ownersSet.add(defaultProd.owner);
            lifecyclesSet.add(defaultProd.lifecycle);
            releaseChannelsSet.add(defaultProd.release_channels[0]);
        }

        const registry = {
            registry_version: '2026.3.1-LTS',
            generated_at: new Date().toISOString(),
            total_products: productsMap.size,
            products: Array.from(productsMap.values()),
            domains: Array.from(domainsSet),
            owners: Array.from(ownersSet),
            lifecycles: Array.from(lifecyclesSet),
            release_channels: Array.from(releaseChannelsSet)
        };

        return registry;
    }

    /**
     * Exports platform registry object as YAML or JSON.
     * @param {object} registry 
     * @param {string} [outputPath] 
     * @returns {string} formatted content
     */
    exportRegistry(registry, outputPath) {
        if (!registry) {
            throw new Error('Registry object must be provided');
        }
        let content = '';
        if (outputPath && outputPath.endsWith('.json')) {
            content = JSON.stringify(registry, null, 2);
        } else {
            content = `# EAORCS Platform Registry Definition\n# Generated: ${new Date().toISOString()}\n\n` + toYaml(registry);
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

    static buildPlatformRegistry(workspaceRoot) {
        return new PlatformRegistryEngine().buildPlatformRegistry(workspaceRoot);
    }

    static exportRegistry(registry, outputPath) {
        return new PlatformRegistryEngine().exportRegistry(registry, outputPath);
    }
}

module.exports = PlatformRegistryEngine;
module.exports.PlatformRegistryEngine = PlatformRegistryEngine;
