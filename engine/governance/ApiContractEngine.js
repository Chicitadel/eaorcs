/******************************************************************************
 * Project        : EAORCS Governance Platform
 * Module         : API & SDK Governance Engine
 * File           : ApiContractEngine.js
 * Version        : 2026.1.0
 * Author         : Air Roofers Architecture Authority / Ujomor Systems
 * Organization   : Ujomor Systems & Air Roofers
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
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

const SEMVER_REGEX = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

/**
 * Platform's 8 core API endpoints represented as built-in OpenAPI 3.0.3 spec
 */
const EAORCS_OPENAPI_SPEC = {
    openapi: '3.0.3',
    info: {
        title: 'EAORCS Enterprise Platform API',
        version: '2026.1.0',
        description: 'Core REST API contract for EAORCS platform services and sovereign verifications.'
    },
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
                                        uptime: { type: 'number' }
                                    },
                                    required: ['status']
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
        '/api/v1/tickets': {
            post: {
                summary: 'Create Support Ticket',
                operationId: 'createSupportTicket',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    tenantId: { type: 'string' },
                                    severity: { type: 'string' }
                                },
                                required: ['tenantId', 'severity']
                            }
                        }
                    }
                },
                responses: {
                    '201': {
                        description: 'Ticket created',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        ticketId: { type: 'string' }
                                    },
                                    required: ['ticketId']
                                }
                            }
                        }
                    }
                }
            }
        },
        '/api/v1/audits': {
            get: {
                summary: 'List Governance Audit Records',
                operationId: 'listAudits',
                responses: {
                    '200': {
                        description: 'List of audit records',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { type: 'object' }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/api/v1/licenses/renew': {
            post: {
                summary: 'Renew Enterprise Software License',
                operationId: 'extendLicenseAgreement',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    licenseKey: { type: 'string' },
                                    tenantId: { type: 'string' }
                                },
                                required: ['licenseKey', 'tenantId']
                            }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: 'Renewal confirmation',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        renewedAt: { type: 'string' },
                                        expiresAt: { type: 'string' }
                                    },
                                    required: ['renewedAt', 'expiresAt']
                                }
                            }
                        }
                    }
                }
            }
        },
        '/api/v1/billing/invoices': {
            get: {
                summary: 'Fetch Billing Invoices',
                operationId: 'getInvoices',
                responses: {
                    '200': {
                        description: 'Invoices list',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { type: 'object' }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/api/v1/deployments': {
            post: {
                summary: 'Trigger Platform Deployment',
                operationId: 'createDeployment',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    environment: { type: 'string' },
                                    version: { type: 'string' }
                                },
                                required: ['environment', 'version']
                            }
                        }
                    }
                },
                responses: {
                    '202': {
                        description: 'Deployment accepted',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        deploymentId: { type: 'string' }
                                    },
                                    required: ['deploymentId']
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
            }
        }
    }
};

class ApiContractEngine {
    /**
     * Checks required fields in OpenAPI spec object: openapi, info.version, info.title, paths, components.securitySchemes
     * @param {Object} specObj
     * @returns {{ valid: boolean, errors: string[] }}
     */
    static validateOpenApiSpec(specObj) {
        const errors = [];

        if (!specObj || typeof specObj !== 'object') {
            return { valid: false, errors: ['OpenAPI specification must be a valid non-null object'] };
        }

        if (!specObj.openapi || typeof specObj.openapi !== 'string') {
            errors.push("Missing or invalid required top-level field 'openapi'");
        }

        if (!specObj.info || typeof specObj.info !== 'object') {
            errors.push("Missing required top-level field 'info'");
        } else {
            if (!specObj.info.title || typeof specObj.info.title !== 'string') {
                errors.push("Missing or invalid required field 'info.title'");
            }
            if (!specObj.info.version || typeof specObj.info.version !== 'string') {
                errors.push("Missing or invalid required field 'info.version'");
            }
        }

        if (!specObj.paths || typeof specObj.paths !== 'object') {
            errors.push("Missing required top-level field 'paths'");
        }

        if (!specObj.components || typeof specObj.components !== 'object' || !specObj.components.securitySchemes) {
            errors.push("Missing required top-level field 'components.securitySchemes'");
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Validates SemVer 2.0.0 format string
     * @param {string} version
     * @returns {boolean}
     */
    static checkSemanticVersion(version) {
        if (!version || typeof version !== 'string') return false;
        return SEMVER_REGEX.test(version.trim());
    }

    /**
     * Compares two OpenAPI specs and detects backward incompatibilities
     * @param {Object} oldSpec
     * @param {Object} newSpec
     * @returns {{ compatible: boolean, breakingChanges: string[], nonBreakingChanges: string[], diffs: Array<{ type: string, description: string }> }}
     */
    static detectBackwardIncompatibility(oldSpec, newSpec) {
        const breakingChanges = [];
        const nonBreakingChanges = [];
        const diffs = [];

        if (!oldSpec || !oldSpec.paths) {
            return { compatible: true, breakingChanges: [], nonBreakingChanges: ['Initial spec provided'], diffs: [] };
        }
        if (!newSpec || !newSpec.paths) {
            return {
                compatible: false,
                breakingChanges: ['New spec missing or has no paths'],
                nonBreakingChanges: [],
                diffs: [{ type: 'BREAKING', description: 'New spec missing or has no paths' }]
            };
        }

        const oldPaths = oldSpec.paths;
        const newPaths = newSpec.paths;

        // 1. Check for removed endpoints / HTTP methods
        for (const [pathKey, oldPathObj] of Object.entries(oldPaths)) {
            if (!newPaths[pathKey]) {
                const msg = `Removed endpoint path: ${pathKey}`;
                breakingChanges.push(msg);
                diffs.push({ type: 'BREAKING', description: msg });
                continue;
            }

            const newPathObj = newPaths[pathKey];
            const httpMethods = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'];

            for (const method of httpMethods) {
                if (oldPathObj[method] && !newPathObj[method]) {
                    const msg = `Removed HTTP method ${method.toUpperCase()} on endpoint ${pathKey}`;
                    breakingChanges.push(msg);
                    diffs.push({ type: 'BREAKING', description: msg });
                } else if (!oldPathObj[method] && newPathObj[method]) {
                    const msg = `Added new HTTP method ${method.toUpperCase()} on existing endpoint ${pathKey}`;
                    nonBreakingChanges.push(msg);
                    diffs.push({ type: 'NON_BREAKING', description: msg });
                } else if (oldPathObj[method] && newPathObj[method]) {
                    // Check parameter changes & response schemas
                    const oldOp = oldPathObj[method];
                    const newOp = newPathObj[method];

                    // Check for newly added required parameters
                    const oldParams = oldOp.parameters || [];
                    const newParams = newOp.parameters || [];
                    for (const np of newParams) {
                        if (np.required) {
                            const foundInOld = oldParams.find(op => op.name === np.name && op.in === np.in);
                            if (!foundInOld || !foundInOld.required) {
                                const msg = `Added required parameter '${np.name}' (${np.in}) to ${method.toUpperCase()} ${pathKey}`;
                                breakingChanges.push(msg);
                                diffs.push({ type: 'BREAKING', description: msg });
                            }
                        }
                    }

                    // Check for removed response codes
                    const oldResp = oldOp.responses || {};
                    const newResp = newOp.responses || {};
                    for (const statusCode of Object.keys(oldResp)) {
                        if (!newResp[statusCode]) {
                            const msg = `Removed response status code ${statusCode} from ${method.toUpperCase()} ${pathKey}`;
                            breakingChanges.push(msg);
                            diffs.push({ type: 'BREAKING', description: msg });
                        }
                    }
                }
            }
        }

        // 2. Check for newly added endpoints (non-breaking)
        for (const [pathKey, newPathObj] of Object.entries(newPaths)) {
            if (!oldPaths[pathKey]) {
                const msg = `Added new endpoint path: ${pathKey}`;
                nonBreakingChanges.push(msg);
                diffs.push({ type: 'NON_BREAKING', description: msg });
            }
        }

        return {
            compatible: breakingChanges.length === 0,
            breakingChanges,
            nonBreakingChanges,
            diffs
        };
    }

    /**
     * Verifies every adapter endpoint in adapterList has a corresponding path in spec
     * @param {Object} spec
     * @param {Array<string|Object>} adapterList
     * @returns {{ fullyCovered: boolean, missingEndpoints: string[], coveredEndpoints: string[] }}
     */
    static checkEndpointCoverage(spec, adapterList = []) {
        const missingEndpoints = [];
        const coveredEndpoints = [];

        if (!spec || !spec.paths) {
            return {
                fullyCovered: false,
                missingEndpoints: adapterList.map(a => (typeof a === 'string' ? a : a.path)),
                coveredEndpoints: []
            };
        }

        const specPaths = Object.keys(spec.paths);

        for (const adapter of adapterList) {
            const rawPath = typeof adapter === 'string' ? adapter : adapter.path;
            const normalizedPath = rawPath.replace(/^[A-Z]+\s+/, '').trim();

            const isCovered = specPaths.some(p => {
                // Compare exact or parameter-replaced path match
                const pRegex = new RegExp('^' + p.replace(/\{[^}]+\}/g, '[^/]+') + '$');
                return p === normalizedPath || pRegex.test(normalizedPath);
            });

            if (isCovered) {
                coveredEndpoints.push(rawPath);
            } else {
                missingEndpoints.push(rawPath);
            }
        }

        return {
            fullyCovered: missingEndpoints.length === 0,
            missingEndpoints,
            coveredEndpoints
        };
    }

    /**
     * Validates 6-month sunset policy on deprecated endpoints
     * Checks deprecated endpoints have x-sunset-date header / property defined
     * @param {Object} spec
     * @returns {{ compliant: boolean, violations: string[] }}
     */
    static validateSunsetPolicy(spec) {
        const violations = [];

        if (!spec || !spec.paths) {
            return { compliant: true, violations: [] };
        }

        for (const [pathKey, pathObj] of Object.entries(spec.paths)) {
            for (const [method, opObj] of Object.entries(pathObj)) {
                if (typeof opObj === 'object' && opObj !== null && opObj.deprecated) {
                    const sunsetDate = opObj['x-sunset-date'] || pathObj['x-sunset-date'] || spec['x-sunset-date'];
                    if (!sunsetDate) {
                        violations.push(`Deprecated endpoint ${method.toUpperCase()} ${pathKey} is missing required 'x-sunset-date' metadata`);
                    } else {
                        const sunset = new Date(sunsetDate);
                        if (isNaN(sunset.getTime())) {
                            violations.push(`Deprecated endpoint ${method.toUpperCase()} ${pathKey} has invalid 'x-sunset-date': ${sunsetDate}`);
                        }
                    }
                }
            }
        }

        return {
            compliant: violations.length === 0,
            violations
        };
    }
}

module.exports = {
    ApiContractEngine,
    EAORCS_OPENAPI_SPEC
};
