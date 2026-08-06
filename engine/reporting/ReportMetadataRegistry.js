/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Reporting Engine (Stream 1)
 * File           : engine/reporting/ReportMetadataRegistry.js
 * Version        : 2026.1-LTS (v1.0.0-FROZEN)
 * Author         : Enterprise Systems Engineering & Governance Authority
 * Organization   : Ujomor Enterprise Systems
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Enterprise Governance Enforced
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
 * Copyright (c) 2026 Ujomor Enterprise Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const fs = require('fs');
const path = require('path');

/**
 * ReportMetadataRegistry
 * Dynamically extracts, manages, and validates target project model metadata
 * (project name, version, architecture type, microservice names, business domain,
 * classification, tenant configuration) from repository artifacts without any
 * hardcoded product names.
 */
class ReportMetadataRegistry {
    /**
     * @param {Object} [initialMetadata={}] Optional pre-configured metadata
     * @param {Object} [options={}] Optional configuration settings
     */
    constructor(initialMetadata = {}, options = {}) {
        this.options = {
            autoExtract: false,
            targetPath: process.cwd(),
            ...options
        };

        this.metadata = {
            projectName: initialMetadata.projectName || '',
            version: initialMetadata.version || '1.0.0',
            architectureType: initialMetadata.architectureType || 'MODULAR_MONOLITH',
            microservices: Array.isArray(initialMetadata.microservices) ? [...initialMetadata.microservices] : [],
            businessDomain: initialMetadata.businessDomain || 'Core Platform & Engineering',
            classification: initialMetadata.classification || 'ENTERPRISE',
            tenantConfiguration: {
                tenantId: 'default-tenant',
                tenantName: 'Default Tenant',
                environment: 'production',
                region: 'global-multi-region',
                deploymentTier: 'Enterprise',
                parameters: {},
                ...(initialMetadata.tenantConfiguration || {})
            },
            repositoryArtifacts: [],
            extractedAt: new Date().toISOString(),
            customAttributes: { ...(initialMetadata.customAttributes || {}) }
        };

        if (this.options.autoExtract && this.options.targetPath) {
            this.extractFromPath(this.options.targetPath);
        }
    }

    /**
     * Static helper to extract metadata from a path
     */
    static extractMetadata(targetPath = process.cwd(), overrideOptions = {}) {
        const registry = new ReportMetadataRegistry({}, overrideOptions);
        registry.extractFromPath(targetPath, overrideOptions);
        return registry.getMetadata();
    }

    /**
     * Dynamically extracts project model metadata from target directory artifacts.
     * Parses package.json, manifests, governance state, compose files, and workspace structures.
     * 
     * @param {string} [targetPath] Absolute or relative directory path to inspect
     * @param {Object} [overrideOptions] Additional extraction options
     * @returns {Object} Extracted metadata state
     */
    extractFromPath(targetPath = process.cwd(), overrideOptions = {}) {
        const rootDir = path.resolve(targetPath);
        const discoveredArtifacts = [];
        const extractedServices = new Map();

        let extractedName = '';
        let extractedVersion = '';
        let extractedArch = '';
        let extractedDomain = '';
        let extractedClassification = '';
        let extractedTenant = {};

        // 1. Inspect package.json (root)
        const packageJsonPath = path.join(rootDir, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            try {
                const pkgData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                discoveredArtifacts.push({
                    path: 'package.json',
                    type: 'npm_package_manifest',
                    size: fs.statSync(packageJsonPath).size
                });

                if (pkgData.name) {
                    extractedName = this._formatProjectName(pkgData.name);
                }
                if (pkgData.version) {
                    extractedVersion = pkgData.version;
                }
                if (pkgData.description && !extractedDomain) {
                    extractedDomain = this._inferBusinessDomain(pkgData.description);
                }

                // Check for npm/yarn/pnpm workspace packages
                const workspacePatterns = pkgData.workspaces || [];
                const packagesList = Array.isArray(workspacePatterns) ? workspacePatterns : (workspacePatterns.packages || []);
                for (const pat of packagesList) {
                    const cleanPat = pat.replace(/\/\*$/, '');
                    const subDirPath = path.join(rootDir, cleanPat);
                    if (fs.existsSync(subDirPath)) {
                        this._scanServicesDir(subDirPath, extractedServices);
                    }
                }
            } catch (e) {
                // Non-fatal parse failure
            }
        }

        // 2. Inspect Manifest Files (product.manifest.json/yaml, eaorcs.config.yaml, manifest.json)
        const manifestCandidates = [
            'product.manifest.yaml',
            'product.manifest.json',
            'eaorcs.config.yaml',
            'eaorcs.config.json',
            'distribution_manifest.yaml',
            'manifest.json'
        ];

        for (const manifestName of manifestCandidates) {
            const mPath = path.join(rootDir, manifestName);
            if (fs.existsSync(mPath)) {
                try {
                    const rawContent = fs.readFileSync(mPath, 'utf8');
                    discoveredArtifacts.push({
                        path: manifestName,
                        type: 'product_manifest',
                        size: rawContent.length
                    });

                    const parsed = manifestName.endsWith('.json') ? JSON.parse(rawContent) : this._parseYaml(rawContent);

                    if (parsed.name || parsed.project_name || parsed.projectName) {
                        extractedName = extractedName || this._formatProjectName(parsed.name || parsed.project_name || parsed.projectName);
                    }
                    if (parsed.version) {
                        extractedVersion = extractedVersion || parsed.version;
                    }
                    if (parsed.architecture_type || parsed.architectureType || parsed.architecture) {
                        extractedArch = parsed.architecture_type || parsed.architectureType || (typeof parsed.architecture === 'string' ? parsed.architecture : parsed.architecture?.maturity);
                    }
                    if (parsed.business_domain || parsed.businessDomain || parsed.domain) {
                        extractedDomain = parsed.business_domain || parsed.businessDomain || parsed.domain;
                    }
                    if (parsed.classification || parsed.security_classification) {
                        extractedClassification = parsed.classification || parsed.security_classification;
                    }
                    if (parsed.tenant || parsed.tenant_configuration || parsed.tenantConfiguration) {
                        extractedTenant = { ...extractedTenant, ...(parsed.tenant || parsed.tenant_configuration || parsed.tenantConfiguration) };
                    }
                } catch (e) {
                    // Non-fatal
                }
            }
        }

        // 3. Inspect Governance State (.governance/state/project.state.yaml)
        const govStatePath = path.join(rootDir, '.governance', 'state', 'project.state.yaml');
        if (fs.existsSync(govStatePath)) {
            try {
                const rawGov = fs.readFileSync(govStatePath, 'utf8');
                discoveredArtifacts.push({
                    path: '.governance/state/project.state.yaml',
                    type: 'uaigos_governance_state',
                    size: rawGov.length
                });

                const parsedGov = this._parseYaml(rawGov);
                if (parsedGov.project?.name) {
                    extractedName = extractedName || this._formatProjectName(parsedGov.project.name);
                }
                if (parsedGov.project?.version) {
                    extractedVersion = extractedVersion || parsedGov.project.version;
                }
                if (parsedGov.architecture?.maturity || parsedGov.architecture?.type) {
                    extractedArch = extractedArch || parsedGov.architecture.maturity || parsedGov.architecture.type;
                }
                if (parsedGov.classification) {
                    extractedClassification = extractedClassification || parsedGov.classification;
                }
                if (parsedGov.domain || parsedGov.business_domain) {
                    extractedDomain = extractedDomain || parsedGov.domain || parsedGov.business_domain;
                }
            } catch (e) {
                // Non-fatal
            }
        }

        // 4. Scan potential microservice / module directories dynamically
        const serviceDirs = ['services', 'apps', 'packages', 'modules', 'microservices', 'engine', 'adapters', 'domains'];
        for (const sDir of serviceDirs) {
            const fullSDir = path.join(rootDir, sDir);
            if (fs.existsSync(fullSDir) && fs.statSync(fullSDir).isDirectory()) {
                this._scanServicesDir(fullSDir, extractedServices);
            }
        }

        // 5. Inspect docker-compose files for service containers
        const dockerComposeCandidates = ['docker-compose.yml', 'docker-compose.yaml', 'compose.yaml'];
        for (const dcFile of dockerComposeCandidates) {
            const dcPath = path.join(rootDir, dcFile);
            if (fs.existsSync(dcPath)) {
                try {
                    const rawDc = fs.readFileSync(dcPath, 'utf8');
                    discoveredArtifacts.push({
                        path: dcFile,
                        type: 'container_orchestration',
                        size: rawDc.length
                    });
                    const parsedDc = this._parseYaml(rawDc);
                    if (parsedDc.services && typeof parsedDc.services === 'object') {
                        Object.keys(parsedDc.services).forEach(svcName => {
                            if (!extractedServices.has(svcName)) {
                                extractedServices.set(svcName, {
                                    name: this._formatName(svcName),
                                    rawName: svcName,
                                    type: 'CONTAINER_SERVICE',
                                    source: dcFile
                                });
                            }
                        });
                    }
                } catch (e) {
                    // Non-fatal
                }
            }
        }

        // 6. Infer project name fallback from root folder name if not found
        if (!extractedName) {
            const folderName = path.basename(rootDir);
            extractedName = this._formatProjectName(folderName);
        }

        // 7. Infer architecture type if not explicitly set
        if (!extractedArch) {
            if (extractedServices.size > 5) {
                extractedArch = 'MICROSERVICES';
            } else if (extractedServices.size > 1) {
                extractedArch = 'MODULAR_MONOLITH';
            } else {
                extractedArch = 'LAYERED_MONOLITH';
            }
        }

        // 8. Update internal metadata state safely
        const serviceList = Array.from(extractedServices.values());

        this.metadata = {
            ...this.metadata,
            projectName: extractedName || this.metadata.projectName || 'Enterprise Core Platform',
            version: extractedVersion || this.metadata.version || '1.0.0',
            architectureType: this._normalizeArchType(extractedArch || this.metadata.architectureType),
            microservices: serviceList.length > 0 ? serviceList : (this.metadata.microservices.length > 0 ? this.metadata.microservices : [
                { name: 'Core Engine Subsystem', rawName: 'core-engine', type: 'CORE_MODULE', source: 'auto_discovery' }
            ]),
            businessDomain: extractedDomain || this.metadata.businessDomain || 'Enterprise Systems & Governance',
            classification: (extractedClassification || this.metadata.classification || 'ENTERPRISE').toUpperCase(),
            tenantConfiguration: {
                ...this.metadata.tenantConfiguration,
                ...extractedTenant,
                ...(overrideOptions.tenantConfiguration || {})
            },
            repositoryArtifacts: discoveredArtifacts,
            extractedAt: new Date().toISOString()
        };

        return this.getMetadata();
    }

    /**
     * Registers or merges explicit metadata overrides into the registry.
     * @param {Object} metadata Partial or full metadata to update
     * @returns {Object} Updated metadata object
     */
    registerMetadata(metadata = {}) {
        if (!metadata || typeof metadata !== 'object') {
            throw new Error('ReportMetadataRegistry.registerMetadata requires a non-null object');
        }

        if (metadata.projectName) {
            this.metadata.projectName = String(metadata.projectName).trim();
        }
        if (metadata.version) {
            this.metadata.version = String(metadata.version).trim();
        }
        if (metadata.architectureType) {
            this.metadata.architectureType = this._normalizeArchType(metadata.architectureType);
        }
        if (Array.isArray(metadata.microservices)) {
            this.metadata.microservices = metadata.microservices.map(svc => {
                if (typeof svc === 'string') return { name: this._formatName(svc), rawName: svc, type: 'SERVICE' };
                return svc;
            });
        }
        if (metadata.businessDomain) {
            this.metadata.businessDomain = String(metadata.businessDomain).trim();
        }
        if (metadata.classification) {
            this.metadata.classification = String(metadata.classification).trim().toUpperCase();
        }
        if (metadata.tenantConfiguration && typeof metadata.tenantConfiguration === 'object') {
            this.metadata.tenantConfiguration = {
                ...this.metadata.tenantConfiguration,
                ...metadata.tenantConfiguration
            };
        }
        if (metadata.customAttributes && typeof metadata.customAttributes === 'object') {
            this.metadata.customAttributes = {
                ...this.metadata.customAttributes,
                ...metadata.customAttributes
            };
        }

        this.metadata.updatedAt = new Date().toISOString();
        return this.getMetadata();
    }

    /**
     * Retrieves a deep clone of the current registered project model metadata.
     * @returns {Object} Complete metadata object
     */
    getMetadata() {
        return JSON.parse(JSON.stringify(this.metadata));
    }

    /**
     * Retrieves the array of discovered or configured microservices/modules.
     * @returns {Array<Object>} List of service descriptors
     */
    getServiceList() {
        return JSON.parse(JSON.stringify(this.metadata.microservices || []));
    }

    /**
     * Alias for getServiceList for compatibility.
     * @returns {Array<Object>} List of service descriptors
     */
    getMicroservices() {
        return this.getServiceList();
    }

    /**
     * Retrieves the current tenant configuration object.
     * @returns {Object} Tenant configuration
     */
    getTenantConfig() {
        return JSON.parse(JSON.stringify(this.metadata.tenantConfiguration || {}));
    }

    /**
     * Validates current or provided metadata against enterprise standards.
     * @param {Object} [metadataToValidate] Optional metadata object to validate
     * @returns {{ valid: boolean, errors: Array<string>, warnings: Array<string> }} Validation result
     */
    validateMetadata(metadataToValidate) {
        const target = metadataToValidate || this.metadata;
        const errors = [];
        const warnings = [];

        if (!target.projectName || typeof target.projectName !== 'string' || target.projectName.trim().length === 0) {
            errors.push('projectName is required and must be a non-empty string');
        }

        if (!target.version || typeof target.version !== 'string') {
            errors.push('version is required and must be a string');
        }

        if (!target.architectureType) {
            warnings.push('architectureType not specified, defaulting to MODULAR_MONOLITH');
        }

        if (!target.classification) {
            warnings.push('classification not specified, defaulting to ENTERPRISE');
        }

        if (!target.microservices || !Array.isArray(target.microservices) || target.microservices.length === 0) {
            warnings.push('No microservices or modules registered in project model');
        }

        if (!target.tenantConfiguration || !target.tenantConfiguration.tenantId) {
            warnings.push('Tenant configuration missing tenantId');
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Exports current metadata state as formatted JSON string.
     * @param {number} [indent=2] Number of spaces for formatting
     * @returns {string} JSON output
     */
    exportAsJson(indent = 2) {
        return JSON.stringify(this.getMetadata(), null, indent);
    }

    /**
     * Exports current metadata state as formatted YAML string.
     * @returns {string} YAML output
     */
    exportAsYaml() {
        return this._toYamlString(this.getMetadata());
    }

    /**
     * JSON serialization support.
     * @returns {Object} Metadata object
     */
    toJSON() {
        return this.getMetadata();
    }

    // --------------------------------------------------------------------------
    // PRIVATE / HELPER METHODS
    // --------------------------------------------------------------------------

    /**
     * Scans directory for package.json or sub-module manifests.
     * @private
     */
    _scanServicesDir(directoryPath, servicesMap) {
        try {
            const entries = fs.readdirSync(directoryPath, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
                    const subPath = path.join(directoryPath, entry.name);
                    const subPkg = path.join(subPath, 'package.json');
                    let serviceName = this._formatName(entry.name);
                    let serviceType = 'MODULE';

                    if (fs.existsSync(subPkg)) {
                        try {
                            const pkg = JSON.parse(fs.readFileSync(subPkg, 'utf8'));
                            if (pkg.name) serviceName = this._formatName(pkg.name);
                            serviceType = pkg.dependencies?.express || pkg.dependencies?.fastify || pkg.dependencies?.nest ? 'HTTP_SERVICE' : 'MODULE';
                        } catch (e) {}
                    }

                    servicesMap.set(entry.name, {
                        name: serviceName,
                        rawName: entry.name,
                        type: serviceType,
                        path: path.relative(process.cwd(), subPath)
                    });
                }
            }
        } catch (e) {
            // Ignore directory access errors gracefully
        }
    }

    /**
     * Converts raw package/directory name to Title Case project name.
     * @private
     */
    _formatProjectName(rawName) {
        if (!rawName || typeof rawName !== 'string') return '';
        let cleaned = rawName.replace(/^@[^/]+\//, ''); // Remove @scope/
        cleaned = cleaned.replace(/[-_]+/g, ' ').trim();
        return cleaned.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }

    /**
     * Converts kebab-case or snake_case string to clean Title Case string.
     * @private
     */
    _formatName(str) {
        if (!str || typeof str !== 'string') return '';
        return str
            .replace(/^@[^/]+\//, '')
            .replace(/[-_]+/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Normalizes architecture type string to standard enum tokens.
     * @private
     */
    _normalizeArchType(archStr) {
        if (!archStr || typeof archStr !== 'string') return 'MODULAR_MONOLITH';
        const upper = archStr.toUpperCase().replace(/[-\s]+/g, '_');
        if (upper.includes('MICRO') || upper.includes('SERVICE')) return 'MICROSERVICES';
        if (upper.includes('EVENT') || upper.includes('ASYNC')) return 'EVENT_DRIVEN';
        if (upper.includes('SERVERLESS') || upper.includes('LAMBDA')) return 'SERVERLESS';
        if (upper.includes('DISTRIBUTED')) return 'DISTRIBUTED_PLATFORM';
        if (upper.includes('LAYERED')) return 'LAYERED_MONOLITH';
        return 'MODULAR_MONOLITH';
    }

    /**
     * Infers business domain from project description.
     * @private
     */
    _inferBusinessDomain(desc) {
        if (!desc || typeof desc !== 'string') return 'Core Enterprise System';
        const lower = desc.toLowerCase();
        if (lower.includes('finan') || lower.includes('payment') || lower.includes('banking') || lower.includes('tax')) return 'Financial Services & Payments';
        if (lower.includes('health') || lower.includes('clinic') || lower.includes('medical')) return 'Healthcare & Life Sciences';
        if (lower.includes('e-com') || lower.includes('retail') || lower.includes('store') || lower.includes('cart')) return 'E-Commerce & Retail';
        if (lower.includes('logist') || lower.includes('supply') || lower.includes('shipping') || lower.includes('fleet')) return 'Logistics & Supply Chain';
        if (lower.includes('insur') || lower.includes('claim')) return 'Insurance & Risk Management';
        if (lower.includes('telecom') || lower.includes('media')) return 'Telecommunications & Media';
        if (lower.includes('gov') || lower.includes('complian') || lower.includes('audit') || lower.includes('security')) return 'Enterprise Governance & Security';
        return 'Core Platform & Engineering';
    }

    /**
     * Lightweight deterministic YAML parser for basic key-value, nested maps, and string lists.
     * Avoids mandatory external npm dependencies.
     * @private
     */
    _parseYaml(content) {
        if (!content || typeof content !== 'string') return {};
        const result = {};
        const lines = content.split('\n');
        let currentParent = result;
        const stack = [{ indent: -1, obj: result }];

        for (let line of lines) {
            // Strip comments
            const commentIdx = line.indexOf('#');
            if (commentIdx !== -1) {
                line = line.substring(0, commentIdx);
            }

            if (!line.trim()) continue;

            const indent = line.search(/\S/);
            const trimmed = line.trim();

            while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
                stack.pop();
            }

            currentParent = stack[stack.length - 1].obj;

            const keyValMatch = trimmed.match(/^([a-zA-Z0-9_.-]+):\s*(.*)$/);
            if (keyValMatch) {
                const key = keyValMatch[1].trim();
                let val = keyValMatch[2].trim();

                // Strip quotes
                if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                    val = val.substring(1, val.length - 1);
                }

                if (val === 'true') val = true;
                else if (val === 'false') val = false;
                else if (val !== '' && !isNaN(val)) val = Number(val);

                if (val === '') {
                    currentParent[key] = {};
                    stack.push({ indent, obj: currentParent[key] });
                } else {
                    currentParent[key] = val;
                }
            } else if (trimmed.startsWith('- ')) {
                const itemVal = trimmed.substring(2).trim();
                const parentKeys = Object.keys(currentParent);
                const lastKey = parentKeys[parentKeys.length - 1];
                if (lastKey && !Array.isArray(currentParent[lastKey])) {
                    currentParent[lastKey] = [];
                }
                if (lastKey && Array.isArray(currentParent[lastKey])) {
                    currentParent[lastKey].push(itemVal.replace(/^["']|["']$/g, ''));
                }
            }
        }
        return result;
    }

    /**
     * Converts JavaScript object into formatted YAML string.
     * @private
     */
    _toYamlString(obj, indentLevel = 0) {
        if (obj === null || obj === undefined) return '';
        const spaces = ' '.repeat(indentLevel * 2);
        let str = '';

        if (Array.isArray(obj)) {
            for (const item of obj) {
                if (typeof item === 'object' && item !== null) {
                    str += `${spaces}-\n${this._toYamlString(item, indentLevel + 1)}`;
                } else {
                    str += `${spaces}- "${String(item)}"\n`;
                }
            }
            return str;
        }

        if (typeof obj === 'object') {
            for (const [k, v] of Object.entries(obj)) {
                if (v === null || v === undefined) continue;
                if (Array.isArray(v)) {
                    str += `${spaces}${k}:\n`;
                    for (const item of v) {
                        if (typeof item === 'object' && item !== null) {
                            str += `${spaces}  -\n${this._toYamlString(item, indentLevel + 2)}`;
                        } else {
                            str += `${spaces}  - "${String(item)}"\n`;
                        }
                    }
                } else if (typeof v === 'object') {
                    str += `${spaces}${k}:\n${this._toYamlString(v, indentLevel + 1)}`;
                } else if (typeof v === 'string') {
                    str += `${spaces}${k}: "${v}"\n`;
                } else {
                    str += `${spaces}${k}: ${v}\n`;
                }
            }
            return str;
        }

        return `${spaces}${String(obj)}\n`;
    }
}

module.exports = ReportMetadataRegistry;
module.exports.ReportMetadataRegistry = ReportMetadataRegistry;
