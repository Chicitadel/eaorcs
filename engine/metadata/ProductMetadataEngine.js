/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Product Metadata Engine
 * File           : ProductMetadataEngine.js
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
 * CORP: Stream 2 — Documentation Governance & Engines
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

class ProductMetadataEngine {
    constructor() {
        this.STANDARD_17_FIELDS = [
            'id',
            'name',
            'version',
            'framework_version',
            'lifecycle_state',
            'federated_domain',
            'registry_endpoint',
            'governanceAuthority',
            'organization',
            'owner',
            'bounded_context',
            'schema_version',
            'capabilities',
            'contract_bindings',
            'sbom_attestation',
            'governance_policies',
            'cli'
        ];
    }

    /**
     * Lightweight pure Node.js YAML/JSON parser for product and architecture descriptors.
     */
    _parseYAML(input) {
        if (typeof input === 'object' && input !== null) {
            return input;
        }

        let content = input;
        if (typeof input === 'string' && fs.existsSync(input)) {
            content = fs.readFileSync(input, 'utf8');
        }

        if (typeof content !== 'string') {
            throw new Error('Invalid input: expected file path or YAML/JSON string');
        }

        // Try JSON parse first
        try {
            return JSON.parse(content);
        } catch (_) {
            // Fallthrough to simple YAML parsing
        }

        const result = {};
        const lines = content.split(/\r?\n/);
        let currentParent = result;
        let stack = [{ indent: 0, obj: result }];

        for (let rawLine of lines) {
            // Ignore full-line comments and empty lines
            const commentIdx = rawLine.indexOf('#');
            let line = rawLine;
            if (commentIdx !== -1) {
                // simple check for comment outside quotes
                const before = rawLine.slice(0, commentIdx);
                if ((before.match(/"/g) || []).length % 2 === 0 && (before.match(/'/g) || []).length % 2 === 0) {
                    line = before;
                }
            }
            if (!line.trim()) continue;

            const indent = line.search(/\S/);
            const trimmed = line.trim();

            while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
                stack.pop();
            }
            currentParent = stack[stack.length - 1].obj;

            // Check list item
            if (trimmed.startsWith('- ')) {
                const itemVal = trimmed.slice(2).trim();
                const cleanVal = itemVal.replace(/^["']|["']$/g, '');
                if (Array.isArray(currentParent)) {
                    currentParent.push(cleanVal);
                } else if (typeof currentParent === 'object') {
                    if (!currentParent._items) currentParent._items = [];
                    currentParent._items.push(cleanVal);
                }
                continue;
            }

            // Key-Value pair
            const colonIdx = trimmed.indexOf(':');
            if (colonIdx !== -1) {
                const key = trimmed.slice(0, colonIdx).trim();
                const rawVal = trimmed.slice(colonIdx + 1).trim();

                if (!rawVal) {
                    // Nested object or list
                    const childObj = {};
                    currentParent[key] = childObj;
                    stack.push({ indent: indent + 2, obj: childObj });
                } else {
                    let parsedVal = rawVal.replace(/^["']|["']$/g, '');
                    if (parsedVal === 'true') parsedVal = true;
                    else if (parsedVal === 'false') parsedVal = false;
                    else if (!isNaN(parsedVal) && parsedVal !== '') parsedVal = Number(parsedVal);

                    currentParent[key] = parsedVal;
                }
            }
        }

        return result;
    }

    /**
     * Parses and validates product.yaml or product.manifest.yaml.
     */
    parseProductDescriptor(filePath) {
        const rawParsed = this._parseYAML(filePath);
        const validation = this.validateProductSchema(rawParsed);

        return {
            parsed: rawParsed,
            validation,
            passed: validation.valid
        };
    }

    /**
     * Parses and validates architecture.yaml.
     */
    parseArchitectureDescriptor(filePath) {
        const parsed = this._parseYAML(filePath);
        const errors = [];

        const requiredFields = ['name', 'version', 'modules', 'facade', 'hierarchy'];
        for (const field of requiredFields) {
            if (parsed[field] === undefined && (!parsed.architecture || parsed.architecture[field] === undefined)) {
                errors.push(`Missing required architecture field: '${field}'`);
            }
        }

        return {
            architecture: parsed,
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Schema validation against standard 17-field product schema.
     */
    validateProductSchema(descriptor) {
        if (!descriptor || typeof descriptor !== 'object') {
            return {
                valid: false,
                missingFields: [...this.STANDARD_17_FIELDS],
                errors: ['Descriptor must be an object'],
                evaluatedFieldsCount: 17
            };
        }

        // Flatten nested product block if present
        const flat = Object.assign({}, descriptor, descriptor.product || {});

        const missingFields = [];
        const errors = [];

        for (const field of this.STANDARD_17_FIELDS) {
            const val = flat[field];
            if (val === undefined || val === null || val === '') {
                missingFields.push(field);
                errors.push(`Missing standard field: '${field}'`);
            }
        }

        return {
            valid: missingFields.length === 0,
            missingFields,
            errors,
            evaluatedFieldsCount: 17,
            descriptor: flat
        };
    }

    /**
     * Exports unified machine-readable platform catalog.
     */
    exportProductCatalog(descriptors = []) {
        const items = Array.isArray(descriptors) ? descriptors : [descriptors];
        const productEntries = [];

        for (const item of items) {
            const parsed = typeof item === 'string' ? this._parseYAML(item) : item;
            const validation = this.validateProductSchema(parsed);
            const flat = validation.descriptor || parsed;

            productEntries.push({
                productId: flat.id || 'unknown',
                name: flat.name || 'Unknown Product',
                version: flat.version || '0.0.0',
                frameworkVersion: flat.framework_version || '1.0.0',
                lifecycleState: flat.lifecycle_state || 'DEVELOPMENT',
                federatedDomain: flat.federated_domain || null,
                registryEndpoint: flat.registry_endpoint || null,
                governanceAuthority: flat.governanceAuthority || null,
                organization: flat.organization || null,
                owner: flat.owner || null,
                capabilitiesCount: Array.isArray(flat.capabilities) ? flat.capabilities.length : 0,
                validSchema: validation.valid,
                missingFieldsCount: validation.missingFields ? validation.missingFields.length : 0
            });
        }

        return {
            catalogVersion: '2026.3.1-LTS',
            exportedAt: new Date().toISOString(),
            totalProducts: productEntries.length,
            validProductsCount: productEntries.filter(p => p.validSchema).length,
            products: productEntries
        };
    }
}

module.exports = ProductMetadataEngine;
