/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Registry Reset & Orchestration Engine Server Routes
 * File           : registry-routes.js
 * Version        : 2026.2.0-LTS
 * Author         : Enterprise Architecture Governance Council & Systems Engineering
 * Organization   : Ujomor Systems & Air Roofers Platform Ecosystem
 * Created Date   : 2026-08-02
 * Last Modified  : 2026-08-02
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 * - PNC-001 Platform Neutrality Compliant
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
 * Copyright (c) 2026 Ujomor Systems & Air Roofers Platform Ecosystem
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const { RegistryOrchestrator } = require('../governance/RegistryOrchestrator');

/**
 * Parses JSON request body for raw HTTP request listeners.
 * @param {Object} req 
 * @returns {Promise<Object>}
 */
function parseJsonBody(req) {
    return new Promise((resolve) => {
        if (req.body && typeof req.body === 'object') {
            return resolve(req.body);
        }
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                resolve({});
            }
        });
        req.on('error', () => resolve({}));
    });
}

/**
 * Sends JSON response.
 * @param {Object} res 
 * @param {number} statusCode 
 * @param {Object} payload 
 */
function sendJson(res, statusCode, payload) {
    res.statusCode = statusCode;
    if (res.setHeader) {
        res.setHeader('Content-Type', 'application/json');
    }
    res.end(JSON.stringify(payload));
}

/**
 * Main HTTP request handler for Registry Orchestration endpoints.
 * Handles both REST and RPC invocations for 1-click UI reset execution.
 * 
 * @param {Object} req Node HTTP Request / Express Request
 * @param {Object} res Node HTTP Response / Express Response
 * @param {RegistryOrchestrator} [orchestratorInstance] 
 * @returns {Promise<boolean>} Handled flag
 */
async function handleRegistryRequest(req, res, orchestratorInstance = null) {
    const orchestrator = orchestratorInstance || new RegistryOrchestrator();
    const url = req.url || '';
    const method = (req.method || 'GET').toUpperCase();

    // 1. POST /api/registry/reset/clean-audit
    if (method === 'POST' && url.startsWith('/api/registry/reset/clean-audit')) {
        const body = await parseJsonBody(req);
        const isStreaming = url.includes('stream=true') || (req.headers && req.headers['accept'] === 'text/event-stream');

        if (isStreaming) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            const onProgress = (progress) => {
                res.write(`data: ${JSON.stringify(progress)}\n\n`);
            };

            try {
                const result = await orchestrator.executeCleanAudit(body, onProgress);
                res.write(`data: ${JSON.stringify({ status: 'COMPLETED', result })}\n\n`);
                res.end();
            } catch (err) {
                res.write(`data: ${JSON.stringify({ status: 'ERROR', error: err.message })}\n\n`);
                res.end();
            }
            return true;
        } else {
            try {
                const result = await orchestrator.executeCleanAudit(body);
                sendJson(res, 200, { status: 'SUCCESS', result });
            } catch (err) {
                sendJson(res, 500, { status: 'ERROR', message: err.message });
            }
            return true;
        }
    }

    // 2. POST /api/registry/reset/soft
    if (method === 'POST' && url.startsWith('/api/registry/reset/soft')) {
        const body = await parseJsonBody(req);
        try {
            const result = await orchestrator.executeSoftReset(body);
            sendJson(res, 200, { status: 'SUCCESS', result });
        } catch (err) {
            sendJson(res, 500, { status: 'ERROR', message: err.message });
        }
        return true;
    }

    // 3. POST /api/registry/archive
    if (method === 'POST' && url.startsWith('/api/registry/archive')) {
        const body = await parseJsonBody(req);
        try {
            const snapshot = await orchestrator.executeArchiveSnapshot(body);
            sendJson(res, 200, { status: 'SUCCESS', snapshot });
        } catch (err) {
            sendJson(res, 500, { status: 'ERROR', message: err.message });
        }
        return true;
    }

    // 4. POST /api/registry/rollback
    if (method === 'POST' && url.startsWith('/api/registry/rollback')) {
        const body = await parseJsonBody(req);
        const snapshotId = body.snapshotId || (url.split('/').pop() !== 'rollback' ? url.split('/').pop() : null);
        try {
            const rollback = await orchestrator.executeRollback(snapshotId, body);
            sendJson(res, 200, { status: 'SUCCESS', rollback });
        } catch (err) {
            sendJson(res, 500, { status: 'ERROR', message: err.message });
        }
        return true;
    }

    // 5. GET /api/registry/snapshots
    if (method === 'GET' && url.startsWith('/api/registry/snapshots')) {
        try {
            const snapshots = orchestrator.listSnapshots();
            sendJson(res, 200, { status: 'SUCCESS', snapshots });
        } catch (err) {
            sendJson(res, 500, { status: 'ERROR', message: err.message });
        }
        return true;
    }

    // 6. GET /api/registry/status
    if (method === 'GET' && url.startsWith('/api/registry/status')) {
        try {
            const status = orchestrator.getStatus();
            sendJson(res, 200, { status: 'SUCCESS', state: status });
        } catch (err) {
            sendJson(res, 500, { status: 'ERROR', message: err.message });
        }
        return true;
    }

    // 7. GET /api/registry/reset/progress
    if (method === 'GET' && url.startsWith('/api/registry/reset/progress')) {
        const progress = orchestrator.getProgress();
        sendJson(res, 200, { status: 'SUCCESS', progress });
        return true;
    }

    // 8. POST /api/registry/rpc Endpoint
    if (method === 'POST' && url.startsWith('/api/registry/rpc')) {
        const body = await parseJsonBody(req);
        const rpcMethod = body.method;
        const params = body.params || {};

        try {
            let result;
            switch (rpcMethod) {
                case 'executeCleanAudit':
                case 'cleanAudit':
                    result = await orchestrator.executeCleanAudit(params);
                    break;
                case 'executeSoftReset':
                case 'softReset':
                    result = await orchestrator.executeSoftReset(params);
                    break;
                case 'executeArchiveSnapshot':
                case 'archiveSnapshot':
                    result = await orchestrator.executeArchiveSnapshot(params);
                    break;
                case 'executeRollback':
                case 'rollback':
                    result = await orchestrator.executeRollback(params.snapshotId, params);
                    break;
                case 'listSnapshots':
                    result = orchestrator.listSnapshots();
                    break;
                case 'getStatus':
                    result = orchestrator.getStatus();
                    break;
                default:
                    return sendJson(res, 400, { status: 'ERROR', message: `Unknown RPC method: ${rpcMethod}` });
            }
            sendJson(res, 200, { status: 'SUCCESS', result });
        } catch (err) {
            sendJson(res, 500, { status: 'ERROR', message: err.message });
        }
        return true;
    }

    return false;
}

/**
 * Creates Express-compatible router if express is present.
 * @param {RegistryOrchestrator} [orchestratorInstance] 
 * @returns {Function} Express router
 */
function createRegistryRouter(orchestratorInstance = null) {
    let express;
    try {
        express = require('express');
    } catch (e) {
        express = null;
    }

    if (express) {
        const router = express.Router();
        const orchestrator = orchestratorInstance || new RegistryOrchestrator();

        router.post('/reset/clean-audit', async (req, res) => {
            await handleRegistryRequest(req, res, orchestrator);
        });

        router.post('/reset/soft', async (req, res) => {
            await handleRegistryRequest(req, res, orchestrator);
        });

        router.post('/archive', async (req, res) => {
            await handleRegistryRequest(req, res, orchestrator);
        });

        router.post('/rollback', async (req, res) => {
            await handleRegistryRequest(req, res, orchestrator);
        });

        router.get('/snapshots', async (req, res) => {
            await handleRegistryRequest(req, res, orchestrator);
        });

        router.get('/status', async (req, res) => {
            await handleRegistryRequest(req, res, orchestrator);
        });

        router.get('/reset/progress', async (req, res) => {
            await handleRegistryRequest(req, res, orchestrator);
        });

        router.post('/rpc', async (req, res) => {
            await handleRegistryRequest(req, res, orchestrator);
        });

        return router;
    }

    // Fallback standard router function
    return function routerFallback(req, res, next) {
        handleRegistryRequest(req, res, orchestratorInstance).then((handled) => {
            if (!handled && typeof next === 'function') {
                next();
            }
        });
    };
}

module.exports = {
    handleRegistryRequest,
    createRegistryRouter
};
