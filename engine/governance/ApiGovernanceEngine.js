/******************************************************************************
 * Project        : Universal Autonomous Governance Operating System (UAGOS)
 * Module         : EAORCS API & Contract Governance Engine (Stream C)
 * File           : ApiGovernanceEngine.js
 * Version        : 2026.1.0-LTS
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
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
 * - OpenAPI 3.0.3
 *
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const crypto = require('crypto');

/**
 * Platform's Default OpenAPI 3.0.3 specification template.
 */
const DEFAULT_OPENAPI_303_SPEC = {
    openapi: '3.0.3',
    info: {
        title: 'EAORCS Enterprise Platform API',
        version: '2026.1.0',
        description: 'Core REST API contract for EAORCS platform services, sovereign verifications, and contract governance.'
    },
    servers: [
        {
            url: 'https://api.eaorcs.enterprise.internal/v1',
            description: 'Enterprise Production Cluster'
        },
        {
            url: 'https://api-staging.eaorcs.enterprise.internal/v1',
            description: 'Enterprise Staging Cluster'
        }
    ],
    security: [
        {
            BearerAuth: []
        }
    ],
    paths: {
        '/api/v1/health': {
            get: {
                summary: 'System Health Status Check',
                operationId: 'getHealthStatus',
                responses: {
                    '200': {
                        description: 'System health metrics',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        status: { type: 'string' },
                                        uptime: { type: 'number' },
                                        timestamp: { type: 'string' }
                                    },
                                    required: ['status', 'uptime']
                                }
                            }
                        }
                    }
                }
            }
        },
        '/api/v1/passports/verify': {
            post: {
                summary: 'Verify Sovereign OSAP Passport',
                operationId: 'verifyPassport',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    passport: { type: 'object' },
                                    publicKey: { type: 'string' }
                                },
                                required: ['passport']
                            }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: 'Passport verification report',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        valid: { type: 'boolean' },
                                        trust_score: { type: 'number' }
                                    },
                                    required: ['valid']
                                }
                            }
                        }
                    }
                }
            }
        },
        '/api/v1/certificates/{id}': {
            get: {
                summary: 'Get Enterprise Certificate Details',
                operationId: 'getCertificateById',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    '200': {
                        description: 'Certificate details',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        certificateId: { type: 'string' },
                                        tier: { type: 'string' }
                                    },
                                    required: ['certificateId', 'tier']
                                }
                            }
                        }
                    }
                }
            }
        },
        '/api/v1/governance/contracts': {
            get: {
                summary: 'List Registered API & Event Contracts',
                operationId: 'listContracts',
                parameters: [
                    {
                        name: 'status',
                        in: 'query',
                        required: false,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    '200': {
                        description: 'List of registered contracts',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        contracts: { type: 'array' },
                                        total: { type: 'integer' }
                                    },
                                    required: ['contracts']
                                }
                            }
                        }
                    }
                }
            },
            post: {
                summary: 'Register New Governance Contract',
                operationId: 'registerContract',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    contractId: { type: 'string' },
                                    version: { type: 'string' },
                                    spec: { type: 'object' }
                                },
                                required: ['contractId', 'version', 'spec']
                            }
                        }
                    }
                },
                responses: {
                    '201': {
                        description: 'Contract registered successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        registered: { type: 'boolean' },
                                        contractId: { type: 'string' }
                                    },
                                    required: ['registered', 'contractId']
                                }
                            }
                        }
                    }
                }
            }
        },
        '/api/v1/webhooks/subscribe': {
            post: {
                summary: 'Subscribe to Governance Event Webhooks',
                operationId: 'subscribeWebhook',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    targetUrl: { type: 'string' },
                                    events: { type: 'array' },
                                    secret: { type: 'string' }
                                },
                                required: ['targetUrl', 'events']
                            }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: 'Webhook subscription confirmed',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        subscriptionId: { type: 'string' },
                                        status: { type: 'string' }
                                    },
                                    required: ['subscriptionId', 'status']
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    components: {
        securitySchemes: {
            BearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            },
            ApiKeyAuth: {
                type: 'apiKey',
                in: 'header',
                name: 'X-EAORCS-API-KEY'
            }
        }
    }
};

/**
 * Enterprise API Governance Engine
 * Implements API contract validation, OpenAPI 3.0.3 exports, breaking change detection,
 * multi-target SDK manifest generation, and cryptographically secure webhook payload signing.
 */
class ApiGovernanceEngine {
    /**
     * Constructs an instance of ApiGovernanceEngine
     * @param {Object} [config]
     */
    constructor(config = {}) {
        this.config = config;
    }

    /**
     * Validates an API contract or OpenAPI spec against OpenAPI 3.0.3 governance standards.
     * @param {Object} contract
     * @returns {{ valid: boolean, score: number, errors: string[], warnings: string[], summary: Object }}
     */
    static validateContract(contract) {
        const errors = [];
        const warnings = [];

        if (!contract || typeof contract !== 'object') {
            return {
                valid: false,
                score: 0,
                errors: ['Contract must be a non-null object'],
                warnings: [],
                summary: { status: 'INVALID', totalPaths: 0 }
            };
        }

        // 1. OpenAPI Version Validation
        if (!contract.openapi) {
            errors.push('Missing required root property "openapi"');
        } else if (!String(contract.openapi).startsWith('3.0') && !String(contract.openapi).startsWith('3.1')) {
            errors.push(`Unsupported OpenAPI version "${contract.openapi}". Expected OpenAPI 3.0.x or 3.1.x`);
        }

        // 2. Info Section Validation
        if (!contract.info || typeof contract.info !== 'object') {
            errors.push('Missing required root section "info"');
        } else {
            if (!contract.info.title) errors.push('Missing required property "info.title"');
            if (!contract.info.version) errors.push('Missing required property "info.version"');
            if (!contract.info.description) warnings.push('Recommended property "info.description" is missing');
        }

        // 3. Paths Validation
        if (!contract.paths || typeof contract.paths !== 'object') {
            errors.push('Missing or invalid "paths" object');
        } else {
            const pathKeys = Object.keys(contract.paths);
            if (pathKeys.length === 0) {
                warnings.push('"paths" object contains no endpoint definitions');
            }

            const validMethods = new Set(['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace']);

            for (const [pathKey, pathObj] of Object.entries(contract.paths)) {
                if (!pathKey.startsWith('/')) {
                    errors.push(`Path "${pathKey}" must start with a leading slash "/"`);
                }

                if (!pathObj || typeof pathObj !== 'object') {
                    errors.push(`Invalid path item object at path "${pathKey}"`);
                    continue;
                }

                for (const [method, opObj] of Object.entries(pathObj)) {
                    if (method.startsWith('x-')) continue; // Vendor extension
                    if (!validMethods.has(method.toLowerCase())) {
                        warnings.push(`Non-standard HTTP method "${method}" at path "${pathKey}"`);
                        continue;
                    }
                    if (!opObj || typeof opObj !== 'object') {
                        errors.push(`Invalid operation object for method "${method.toUpperCase()}" at path "${pathKey}"`);
                        continue;
                    }

                    if (!opObj.responses || typeof opObj.responses !== 'object' || Object.keys(opObj.responses).length === 0) {
                        errors.push(`Operation ${method.toUpperCase()} ${pathKey} is missing required "responses" object`);
                    }

                    if (opObj.deprecated && !opObj['x-sunset-date'] && !pathObj['x-sunset-date'] && !contract['x-sunset-date']) {
                        warnings.push(`Deprecated operation ${method.toUpperCase()} ${pathKey} should specify "x-sunset-date" metadata`);
                    }
                }
            }
        }

        const totalPaths = contract.paths ? Object.keys(contract.paths).length : 0;
        const isValid = errors.length === 0;
        const score = isValid ? Math.max(0, 100 - warnings.length * 5) : Math.max(0, 50 - errors.length * 10);

        return {
            valid: isValid,
            score,
            errors,
            warnings,
            summary: {
                status: isValid ? 'VALID' : 'INVALID',
                openapiVersion: contract.openapi || 'UNKNOWN',
                title: contract.info?.title || 'UNKNOWN',
                version: contract.info?.version || 'UNKNOWN',
                totalPaths
            }
        };
    }

    /**
     * Exports a complete, validated OpenAPI 3.0.3 specification document.
     * @param {Object} [options] - Options including format ('object'|'json'|'yaml'), info, servers, paths, components
     * @returns {Object|string} Exported OpenAPI 3.0.3 specification
     */
    static exportOpenApiSpec(options = {}) {
        let spec = JSON.parse(JSON.stringify(DEFAULT_OPENAPI_303_SPEC));

        if (options.customSpec) {
            spec = JSON.parse(JSON.stringify(options.customSpec));
        } else {
            if (options.info) {
                spec.info = { ...spec.info, ...options.info };
            }
            if (options.servers) {
                spec.servers = options.servers;
            }
            if (options.paths) {
                spec.paths = { ...spec.paths, ...options.paths };
            }
            if (options.components) {
                spec.components = {
                    ...spec.components,
                    ...options.components,
                    schemas: { ...(spec.components?.schemas || {}), ...(options.components?.schemas || {}) },
                    securitySchemes: { ...(spec.components?.securitySchemes || {}), ...(options.components?.securitySchemes || {}) }
                };
            }
        }

        // Enforce OpenAPI 3.0.3 compliance
        spec.openapi = '3.0.3';

        const validation = this.validateContract(spec);
        if (!validation.valid) {
            throw new Error(`OpenAPI spec export failed validation: ${validation.errors.join('; ')}`);
        }

        const format = (options.format || 'object').toLowerCase();
        if (format === 'json') {
            return JSON.stringify(spec, null, 2);
        } else if (format === 'yaml' || format === 'yml') {
            return this.toSimpleYaml(spec);
        }

        return spec;
    }

    /**
     * Detects breaking changes between two API specification versions.
     * @param {Object} oldSpec - Baseline OpenAPI spec or path map
     * @param {Object} newSpec - Candidate OpenAPI spec or path map
     * @returns {{ isBreaking: boolean, breakingCount: number, nonBreakingCount: number, score: number, breakingChanges: Array<Object>, nonBreakingChanges: Array<Object> }}
     */
    static detectBreakingChanges(oldSpec, newSpec) {
        const breakingChanges = [];
        const nonBreakingChanges = [];

        if (!oldSpec || typeof oldSpec !== 'object' || !newSpec || typeof newSpec !== 'object') {
            return {
                isBreaking: true,
                breakingCount: 1,
                nonBreakingCount: 0,
                score: 0,
                breakingChanges: [{
                    type: 'INVALID_INPUT',
                    path: '*',
                    method: '*',
                    description: 'Both oldSpec and newSpec must be valid specification objects',
                    severity: 'CRITICAL'
                }],
                nonBreakingChanges: []
            };
        }

        const oldPaths = oldSpec.paths || {};
        const newPaths = newSpec.paths || {};
        const validMethods = new Set(['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace']);

        // 1. Evaluate removed paths and methods
        for (const [pathKey, oldPathObj] of Object.entries(oldPaths)) {
            if (!newPaths[pathKey]) {
                breakingChanges.push({
                    type: 'REMOVED_ENDPOINT_PATH',
                    path: pathKey,
                    method: '*',
                    description: `Endpoint path "${pathKey}" was removed in candidate specification`,
                    severity: 'CRITICAL'
                });
                continue;
            }

            const newPathObj = newPaths[pathKey];
            for (const [method, oldOp] of Object.entries(oldPathObj)) {
                if (!validMethods.has(method.toLowerCase())) continue;

                const newOp = newPathObj[method];
                if (!newOp) {
                    breakingChanges.push({
                        type: 'REMOVED_ENDPOINT_METHOD',
                        path: pathKey,
                        method: method.toUpperCase(),
                        description: `HTTP method ${method.toUpperCase()} for path "${pathKey}" was removed in candidate specification`,
                        severity: 'CRITICAL'
                    });
                    continue;
                }

                // 2. Evaluate parameter changes
                const oldParams = oldOp.parameters || [];
                const newParams = newOp.parameters || [];

                for (const oldParam of oldParams) {
                    const matchedNewParam = newParams.find(p => p.name === oldParam.name && p.in === oldParam.in);
                    if (!matchedNewParam) {
                        breakingChanges.push({
                            type: 'REMOVED_PARAMETER',
                            path: pathKey,
                            method: method.toUpperCase(),
                            description: `Parameter "${oldParam.name}" (in: ${oldParam.in}) was removed`,
                            severity: 'HIGH'
                        });
                    } else {
                        if (oldParam.schema?.type && matchedNewParam.schema?.type && oldParam.schema.type !== matchedNewParam.schema.type) {
                            breakingChanges.push({
                                type: 'CHANGED_PARAMETER_TYPE',
                                path: pathKey,
                                method: method.toUpperCase(),
                                description: `Parameter "${oldParam.name}" type changed from "${oldParam.schema.type}" to "${matchedNewParam.schema.type}"`,
                                severity: 'HIGH'
                            });
                        }
                    }
                }

                // 3. Evaluate newly added REQUIRED parameters
                for (const newParam of newParams) {
                    const matchedOldParam = oldParams.find(p => p.name === newParam.name && p.in === newParam.in);
                    if (!matchedOldParam && newParam.required) {
                        breakingChanges.push({
                            type: 'ADDED_REQUIRED_PARAMETER',
                            path: pathKey,
                            method: method.toUpperCase(),
                            description: `New required parameter "${newParam.name}" (in: ${newParam.in}) was added`,
                            severity: 'HIGH'
                        });
                    }
                }

                // 4. Evaluate removed response status codes
                const oldResponses = oldOp.responses || {};
                const newResponses = newOp.responses || {};

                for (const [statusCode] of Object.entries(oldResponses)) {
                    if (!newResponses[statusCode]) {
                        breakingChanges.push({
                            type: 'REMOVED_RESPONSE_CODE',
                            path: pathKey,
                            method: method.toUpperCase(),
                            description: `Response status code "${statusCode}" was removed from ${method.toUpperCase()} ${pathKey}`,
                            severity: 'MEDIUM'
                        });
                    }
                }

                // 5. Evaluate non-breaking additions & deprecation
                for (const newParam of newParams) {
                    const matchedOldParam = oldParams.find(p => p.name === newParam.name && p.in === newParam.in);
                    if (!matchedOldParam && !newParam.required) {
                        nonBreakingChanges.push({
                            type: 'ADDED_OPTIONAL_PARAMETER',
                            path: pathKey,
                            method: method.toUpperCase(),
                            description: `New optional parameter "${newParam.name}" (in: ${newParam.in}) was added`
                        });
                    }
                }

                if (newOp.deprecated && !oldOp.deprecated) {
                    nonBreakingChanges.push({
                        type: 'ENDPOINT_DEPRECATED',
                        path: pathKey,
                        method: method.toUpperCase(),
                        description: `Endpoint ${method.toUpperCase()} ${pathKey} was marked as deprecated`
                    });
                }
            }
        }

        // Check for new endpoint paths and methods (non-breaking additions)
        for (const [pathKey, newPathObj] of Object.entries(newPaths)) {
            if (!oldPaths[pathKey]) {
                nonBreakingChanges.push({
                    type: 'ADDED_ENDPOINT_PATH',
                    path: pathKey,
                    method: '*',
                    description: `New endpoint path "${pathKey}" added`
                });
                continue;
            }

            const oldPathObj = oldPaths[pathKey];
            for (const [method] of Object.entries(newPathObj)) {
                if (!validMethods.has(method.toLowerCase())) continue;
                if (!oldPathObj[method]) {
                    nonBreakingChanges.push({
                        type: 'ADDED_ENDPOINT_METHOD',
                        path: pathKey,
                        method: method.toUpperCase(),
                        description: `New HTTP method ${method.toUpperCase()} added to path "${pathKey}"`
                    });
                }
            }
        }

        const isBreaking = breakingChanges.length > 0;
        const score = isBreaking ? Math.max(0, 100 - breakingChanges.length * 20) : 100;

        return {
            isBreaking,
            breakingCount: breakingChanges.length,
            nonBreakingCount: nonBreakingChanges.length,
            score,
            breakingChanges,
            nonBreakingChanges
        };
    }

    /**
     * Builds structured SDK generation manifests for target client/server SDK languages.
     * @param {Object} [options]
     * @returns {{ timestamp: string, specTitle: string, specVersion: string, totalManifests: number, manifests: Object, manifestList: Array<Object> }}
     */
    static buildSdkManifests(options = {}) {
        const spec = options.spec || DEFAULT_OPENAPI_303_SPEC;
        const version = options.version || spec.info?.version || '2026.1.0';
        const targets = options.targetLanguages || ['typescript', 'python', 'go', 'java', 'csharp', 'rust'];

        const manifests = {};
        const manifestList = [];

        const languageConfigs = {
            typescript: {
                packageName: options.packageName || '@eaorcs/sdk-typescript',
                generatorName: 'typescript-axios',
                runtime: 'Node.js >=18 / Browser ES2022',
                buildConfig: { target: 'ES2022', module: 'CommonJS/ESM', strict: true },
                entryPoints: ['dist/index.js', 'dist/index.d.ts']
            },
            python: {
                packageName: options.packageName || 'eaorcs-sdk-python',
                generatorName: 'python-pydantic-v2',
                runtime: 'Python >=3.10',
                buildConfig: { buildSystem: 'hatchling', typeChecking: 'mypy' },
                entryPoints: ['eaorcs_sdk/__init__.py']
            },
            go: {
                packageName: options.packageName || 'github.com/eaorcs/sdk-go',
                generatorName: 'go-net-http',
                runtime: 'Go >=1.21',
                buildConfig: { module: 'github.com/eaorcs/sdk-go' },
                entryPoints: ['client.go']
            },
            java: {
                packageName: options.packageName || 'com.eaorcs.sdk',
                generatorName: 'java-okhttp-gson',
                runtime: 'Java >=17 (LTS)',
                buildConfig: { buildTool: 'Maven/Gradle', javaVersion: 17 },
                entryPoints: ['com.eaorcs.sdk.ApiClient']
            },
            csharp: {
                packageName: options.packageName || 'EAORCS.SDK',
                generatorName: 'csharp-netcore',
                runtime: '.NET 8.0',
                buildConfig: { targetFramework: 'net8.0' },
                entryPoints: ['EAORCS.SDK.Client.cs']
            },
            rust: {
                packageName: options.packageName || 'eaorcs-sdk-rust',
                generatorName: 'rust-reqwest',
                runtime: 'Rust 2021 Edition',
                buildConfig: { edition: '2021', features: ['async', 'json'] },
                entryPoints: ['src/lib.rs']
            },
            php: {
                packageName: options.packageName || 'eaorcs/sdk-php',
                generatorName: 'php-guzzle',
                runtime: 'PHP >=8.2',
                buildConfig: { composer: true },
                entryPoints: ['src/ApiClient.php']
            },
            ruby: {
                packageName: options.packageName || 'eaorcs_sdk',
                generatorName: 'ruby-faraday',
                runtime: 'Ruby >=3.2',
                buildConfig: { gem: true },
                entryPoints: ['lib/eaorcs_sdk.rb']
            }
        };

        for (const lang of targets) {
            const langLower = String(lang).toLowerCase();
            const cfg = languageConfigs[langLower] || {
                packageName: `eaorcs-sdk-${langLower}`,
                generatorName: `${langLower}-standard`,
                runtime: `${lang} runtime`,
                buildConfig: {},
                entryPoints: ['index']
            };

            const rawManifest = {
                language: langLower,
                specTitle: spec.info?.title || 'EAORCS API',
                targetVersion: version,
                packageName: cfg.packageName,
                generatorName: cfg.generatorName,
                runtimeRequirement: cfg.runtime,
                buildConfig: cfg.buildConfig,
                entryPoints: cfg.entryPoints,
                securityConfig: {
                    authSchemes: Object.keys(spec.components?.securitySchemes || { BearerAuth: {} }),
                    webhookSignatureSupport: true,
                    signatureHeader: 'x-eaorcs-signature'
                },
                generatedAt: new Date().toISOString()
            };

            const checksum = crypto
                .createHash('sha256')
                .update(JSON.stringify(rawManifest))
                .digest('hex');

            const manifest = {
                ...rawManifest,
                checksum
            };

            manifests[langLower] = manifest;
            manifestList.push(manifest);
        }

        return {
            timestamp: new Date().toISOString(),
            specTitle: spec.info?.title || 'EAORCS API',
            specVersion: version,
            totalManifests: manifestList.length,
            manifests,
            manifestList
        };
    }

    /**
     * Generates a cryptographically secure HMAC webhook signature for a payload.
     * @param {Object|string} payload
     * @param {string|Buffer} secret
     * @param {Object} [options]
     * @returns {{ signature: string, timestamp: number, eventId: string, algorithm: string, headerName: string, formattedHeader: string, payloadHash: string, verify: function }}
     */
    static signWebhookPayload(payload, secret, options = {}) {
        if (!payload) {
            throw new Error('Webhook payload is required for signature generation');
        }
        if (!secret || (typeof secret !== 'string' && !Buffer.isBuffer(secret))) {
            throw new Error('Webhook secret string or Buffer is required for signature generation');
        }

        const algorithm = options.algorithm || 'sha256';
        const timestamp = options.timestamp || Math.floor(Date.now() / 1000);
        const eventId = options.eventId || `evt_${crypto.randomBytes(12).toString('hex')}`;
        const headerName = options.signatureHeader || 'x-eaorcs-signature';

        const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
        const canonicalString = `t=${timestamp}.${payloadString}`;

        const signatureHex = crypto
            .createHmac(algorithm, secret)
            .update(canonicalString)
            .digest('hex');

        const formattedHeader = `t=${timestamp},v1=${signatureHex}`;
        const payloadHash = crypto.createHash('sha256').update(payloadString).digest('hex');

        return {
            signature: signatureHex,
            timestamp,
            eventId,
            algorithm,
            headerName,
            formattedHeader,
            payloadHash,
            verify: (headerToVerify, verifySecret = secret, toleranceSeconds = 300) => {
                return ApiGovernanceEngine.verifyWebhookSignature(payloadString, headerToVerify, verifySecret, {
                    toleranceSeconds,
                    algorithm
                });
            }
        };
    }

    /**
     * Verifies an incoming webhook signature against payload and secret in constant time.
     * @param {Object|string} payload
     * @param {string} signatureHeader - Format "t=<timestamp>,v1=<signatureHex>"
     * @param {string|Buffer} secret
     * @param {Object} [options]
     * @returns {{ valid: boolean, reason: string }}
     */
    static verifyWebhookSignature(payload, signatureHeader, secret, options = {}) {
        if (!payload || !signatureHeader || !secret) {
            return { valid: false, reason: 'MISSING_PARAMETERS' };
        }

        const algorithm = options.algorithm || 'sha256';
        const toleranceSeconds = options.toleranceSeconds || 300;

        const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);

        const parts = String(signatureHeader).split(',');
        let timestamp = null;
        let signature = null;

        for (const part of parts) {
            const [key, val] = part.split('=');
            if (!key || !val) continue;
            if (key.trim() === 't') {
                timestamp = parseInt(val.trim(), 10);
            } else if (key.trim() === 'v1') {
                signature = val.trim();
            }
        }

        if (!timestamp || !signature) {
            return { valid: false, reason: 'INVALID_HEADER_FORMAT' };
        }

        const currentSeconds = Math.floor(Date.now() / 1000);
        if (Math.abs(currentSeconds - timestamp) > toleranceSeconds) {
            return { valid: false, reason: 'TIMESTAMP_OUT_OF_TOLERANCE' };
        }

        const canonicalString = `t=${timestamp}.${payloadString}`;
        const expectedSignature = crypto
            .createHmac(algorithm, secret)
            .update(canonicalString)
            .digest('hex');

        const sigBuffer = Buffer.from(signature, 'hex');
        const expectedBuffer = Buffer.from(expectedSignature, 'hex');

        if (sigBuffer.length !== expectedBuffer.length) {
            return { valid: false, reason: 'SIGNATURE_MISMATCH' };
        }

        const isValid = crypto.timingSafeEqual(sigBuffer, expectedBuffer);
        return {
            valid: isValid,
            reason: isValid ? 'SUCCESS' : 'SIGNATURE_MISMATCH'
        };
    }

    /**
     * Serializes an object to simple YAML format for OpenAPI export.
     * @param {Object} obj
     * @param {number} indent
     * @returns {string}
     */
    static toSimpleYaml(obj, indent = 0) {
        const spacing = ' '.repeat(indent);
        let yaml = '';

        if (obj === null || obj === undefined) return 'null\n';

        if (typeof obj !== 'object') {
            if (typeof obj === 'string' && (obj.includes('\n') || obj.includes(':') || obj.includes('#'))) {
                return `"${obj.replace(/"/g, '\\"')}"\n`;
            }
            return `${obj}\n`;
        }

        if (Array.isArray(obj)) {
            if (obj.length === 0) return '[]\n';
            for (const item of obj) {
                if (typeof item === 'object' && item !== null) {
                    yaml += `${spacing}- ${this.toSimpleYaml(item, indent + 2).trimStart()}`;
                } else {
                    yaml += `${spacing}- ${this.toSimpleYaml(item, 0)}`;
                }
            }
            return yaml;
        }

        for (const [key, value] of Object.entries(obj)) {
            if (value === undefined) continue;
            if (typeof value === 'object' && value !== null && Object.keys(value).length > 0) {
                yaml += `${spacing}${key}:\n${this.toSimpleYaml(value, indent + 2)}`;
            } else if (Array.isArray(value)) {
                yaml += `${spacing}${key}:\n${this.toSimpleYaml(value, indent + 2)}`;
            } else {
                yaml += `${spacing}${key}: ${this.toSimpleYaml(value, 0)}`;
            }
        }

        return yaml;
    }

    // Instance method convenience wrappers
    validateContract(contract) {
        return ApiGovernanceEngine.validateContract(contract);
    }
    exportOpenApiSpec(options) {
        return ApiGovernanceEngine.exportOpenApiSpec(options);
    }
    detectBreakingChanges(oldSpec, newSpec) {
        return ApiGovernanceEngine.detectBreakingChanges(oldSpec, newSpec);
    }
    buildSdkManifests(options) {
        return ApiGovernanceEngine.buildSdkManifests(options);
    }
    signWebhookPayload(payload, secret, options) {
        return ApiGovernanceEngine.signWebhookPayload(payload, secret, options);
    }
    verifyWebhookSignature(payload, signatureHeader, secret, options) {
        return ApiGovernanceEngine.verifyWebhookSignature(payload, signatureHeader, secret, options);
    }
}

module.exports = ApiGovernanceEngine;
module.exports.ApiGovernanceEngine = ApiGovernanceEngine;
module.exports.DEFAULT_OPENAPI_303_SPEC = DEFAULT_OPENAPI_303_SPEC;
