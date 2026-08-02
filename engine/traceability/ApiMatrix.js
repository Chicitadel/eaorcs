/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Traceability Engine (Stream C)
 * File           : ApiMatrix.js
 * Version        : 2026.1.0-LTS
 * Author         : Enterprise Architecture Governance Committee & Ujomor Systems
 * Organization   : Ujomor Systems Engineering
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : GOVERNMENT | ENTERPRISE | INTERNAL
 *
 * Governance:
 * - Corporate Governed
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
 * Copyright (c) 2026 Ujomor Systems Engineering
 * All Rights Reserved.
 ******************************************************************************/

const fs = require('fs');
const path = require('path');

/**
 * ApiMatrix - Synchronized 7-Layer API Verification Chain Validator:
 * OpenAPI -> Controller -> Service -> Repository -> DB -> Test -> Evidence
 */
class ApiMatrix {
    constructor(options = {}) {
        this.options = {
            verifyPhysicalFiles: options.verifyPhysicalFiles ?? true,
            baseDir: options.baseDir || process.cwd(),
            ...options
        };

        // Map key `${method.toUpperCase()}:${apiPath}` -> API registration object
        this.apis = new Map();

        this.LAYERS = [
            'openApi',
            'controller',
            'service',
            'repository',
            'db',
            'test',
            'evidence'
        ];
    }

    _makeKey(apiPath, method = 'GET') {
        const normPath = String(apiPath || '').trim();
        const normMethod = String(method || 'GET').toUpperCase().trim();
        return `${normMethod}:${normPath}`;
    }

    /**
     * Registers an API endpoint with its 7-layer implementation chain mapping.
     * @param {string} apiPath - Route path (e.g., '/api/v1/audits')
     * @param {string} method - HTTP method (e.g., 'POST')
     * @param {object} layers - Layer mappings { openApi, controller, service, repository, db, test, evidence }
     */
    registerApi(apiPath, method = 'GET', layers = {}) {
        if (!apiPath) {
            throw new TypeError('API path must be specified');
        }

        const key = this._makeKey(apiPath, method);
        const normMethod = String(method).toUpperCase().trim();
        const normPath = String(apiPath).trim();

        const record = this.apis.get(key) || {
            key,
            apiPath: normPath,
            method: normMethod,
            createdAt: new Date().toISOString(),
            layers: {
                openApi: null,
                controller: null,
                service: null,
                repository: null,
                db: null,
                test: null,
                evidence: null
            }
        };

        for (const layer of this.LAYERS) {
            if (layers[layer] !== undefined) {
                record.layers[layer] = layers[layer] ? String(layers[layer]).trim() : null;
            }
        }

        record.updatedAt = new Date().toISOString();
        this.apis.set(key, record);
        return this.verifyChain(normPath, normMethod);
    }

    /**
     * Links or updates a specific layer in the API chain.
     */
    linkLayer(apiPath, method, layerName, target) {
        if (!this.LAYERS.includes(layerName)) {
            throw new Error(`Invalid layer name: ${layerName}. Must be one of: ${this.LAYERS.join(', ')}`);
        }
        return this.registerApi(apiPath, method, { [layerName]: target });
    }

    /**
     * Evaluates and verifies the 7-layer verification chain for a specified API route & method.
     * @param {string} apiPath - Route path
     * @param {string} method - HTTP method
     * @returns {object} Chain status, missing layers, physical file validation
     */
    verifyChain(apiPath, method = 'GET') {
        const key = this._makeKey(apiPath, method);
        const record = this.apis.get(key);

        if (!record) {
            return {
                apiPath: String(apiPath).trim(),
                method: String(method).toUpperCase().trim(),
                found: false,
                isValid: false,
                status: 'UNREGISTERED',
                layers: {},
                missingLayers: [...this.LAYERS],
                missingFiles: [],
                disconnections: ['API is not registered in matrix']
            };
        }

        const missingLayers = [];
        const missingFiles = [];
        const disconnections = [];
        let filledCount = 0;

        for (const layer of this.LAYERS) {
            const target = record.layers[layer];
            if (!target) {
                missingLayers.push(layer);
                disconnections.push(`Missing layer definition: [${layer}]`);
            } else {
                filledCount++;

                // Check physical file existence if target appears to be a file path and verification is enabled
                if (this.options.verifyPhysicalFiles && (layer === 'controller' || layer === 'service' || layer === 'repository' || layer === 'test')) {
                    // Check if file extension exists or can be resolved
                    const cleanPath = target.split('#')[0].trim();
                    if (cleanPath.endsWith('.js') || cleanPath.endsWith('.cjs') || cleanPath.endsWith('.json') || cleanPath.endsWith('.yaml') || cleanPath.endsWith('.ts')) {
                        const fullPath = path.isAbsolute(cleanPath) ? cleanPath : path.resolve(this.options.baseDir, cleanPath);
                        if (!fs.existsSync(fullPath)) {
                            missingFiles.push({ layer, path: target });
                            disconnections.push(`Physical file missing for layer [${layer}]: ${target}`);
                        }
                    }
                }
            }
        }

        const isFullyConnected = missingLayers.length === 0 && missingFiles.length === 0;
        let status = 'CONNECTED';
        if (!isFullyConnected) {
            status = filledCount > 0 ? 'PARTIAL' : 'DISCONNECTED';
        }

        return {
            apiPath: record.apiPath,
            method: record.method,
            found: true,
            isValid: isFullyConnected,
            status,
            connectionRatePercent: Math.round((filledCount / this.LAYERS.length) * 10000) / 100,
            layers: { ...record.layers },
            missingLayers,
            missingFiles,
            disconnections
        };
    }

    /**
     * Scans all registered APIs in the matrix to detect disconnected or broken chains.
     * @returns {object[]} Array of disconnection reports per API
     */
    detectDisconnections() {
        const results = [];
        for (const [, record] of this.apis) {
            const verification = this.verifyChain(record.apiPath, record.method);
            if (!verification.isValid) {
                results.push({
                    apiPath: record.apiPath,
                    method: record.method,
                    status: verification.status,
                    connectionRatePercent: verification.connectionRatePercent,
                    missingLayers: verification.missingLayers,
                    missingFiles: verification.missingFiles,
                    disconnections: verification.disconnections,
                    severity: verification.missingLayers.includes('controller') || verification.missingLayers.includes('openApi') ? 'HIGH' : 'MEDIUM'
                });
            }
        }
        return results;
    }

    /**
     * Exports complete API Matrix breakdown and metrics.
     * @returns {object} API matrix export object
     */
    exportApiMatrix() {
        const totalApis = this.apis.size;
        let fullyConnectedCount = 0;
        let disconnectedCount = 0;
        const apisList = [];

        for (const [, record] of this.apis) {
            const verification = this.verifyChain(record.apiPath, record.method);
            if (verification.isValid) {
                fullyConnectedCount++;
            } else {
                disconnectedCount++;
            }
            apisList.push(verification);
        }

        const connectionRatePercent = totalApis > 0 ? Math.round((fullyConnectedCount / totalApis) * 10000) / 100 : 0;

        return {
            version: '2026.1.0',
            timestamp: new Date().toISOString(),
            totalApis,
            fullyConnectedApis: fullyConnectedCount,
            disconnectedApis: disconnectedCount,
            connectionRatePercent,
            apis: apisList,
            disconnections: this.detectDisconnections()
        };
    }
}

module.exports = ApiMatrix;
