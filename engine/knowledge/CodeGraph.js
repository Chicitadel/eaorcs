/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Requirement Knowledge Graph Engine (Stream B)
 * File           : CodeGraph.js
 * Version        : 2026.1-LTS (v1.0.0-FROZEN)
 * Author         : Ujomor Systems & Enterprise Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 * - Corporate Policy Governed
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

class CodeGraph {
    constructor() {
        this.modules = new Map(); // filePath -> { path, exports, functions }
        this.codeToReq = new Map(); // filePath -> Set(reqId)
        this.reqToCode = new Map(); // reqId -> Set(filePath)
    }

    /**
     * Registers a code module in the graph.
     * @param {string} filePath File path of the module.
     * @param {Array<string>} [exports=[]] Exported symbols/functions.
     * @param {Array<string>} [functions=[]] Function names within module.
     */
    addModule(filePath, exports = [], functions = []) {
        if (!filePath || typeof filePath !== 'string') {
            throw new Error('filePath is required to addModule');
        }

        const normalizedPath = filePath.replace(/\\/g, '/');
        const moduleObj = {
            path: normalizedPath,
            exports: Array.isArray(exports) ? exports : [],
            functions: Array.isArray(functions) ? functions : []
        };

        this.modules.set(normalizedPath, moduleObj);

        if (!this.codeToReq.has(normalizedPath)) {
            this.codeToReq.set(normalizedPath, new Set());
        }

        return moduleObj;
    }

    /**
     * Connects a code module to a requirement ID.
     * @param {string} filePath Code module file path.
     * @param {string} reqId Requirement ID.
     */
    connectCodeToReq(filePath, reqId) {
        if (!filePath || !reqId) {
            throw new Error('filePath and reqId are required for connectCodeToReq');
        }

        const normalizedPath = filePath.replace(/\\/g, '/');

        if (!this.modules.has(normalizedPath)) {
            this.addModule(normalizedPath);
        }

        if (!this.codeToReq.has(normalizedPath)) {
            this.codeToReq.set(normalizedPath, new Set());
        }
        this.codeToReq.get(normalizedPath).add(reqId);

        if (!this.reqToCode.has(reqId)) {
            this.reqToCode.set(reqId, new Set());
        }
        this.reqToCode.get(reqId).add(normalizedPath);

        return { filePath: normalizedPath, reqId };
    }

    /**
     * Gets all code modules linked to a specific requirement ID.
     * @param {string} reqId Requirement ID.
     * @returns {Array<object>} Array of module objects linked to reqId.
     */
    getModulesForReq(reqId) {
        if (!reqId || !this.reqToCode.has(reqId)) return [];

        const filePaths = this.reqToCode.get(reqId);
        const result = [];

        for (const filePath of filePaths) {
            const moduleObj = this.modules.get(filePath);
            if (moduleObj) {
                result.push(moduleObj);
            }
        }

        return result;
    }

    /**
     * Gets requirement IDs linked to a specific code file path.
     * @param {string} filePath Code file path.
     * @returns {Array<string>} Array of requirement IDs.
     */
    getReqsForCode(filePath) {
        const normalizedPath = filePath.replace(/\\/g, '/');
        if (!this.codeToReq.has(normalizedPath)) return [];
        return Array.from(this.codeToReq.get(normalizedPath));
    }

    /**
     * Returns module object for a given path.
     */
    getModule(filePath) {
        const normalizedPath = filePath.replace(/\\/g, '/');
        return this.modules.get(normalizedPath) || null;
    }

    /**
     * Exports complete code structural graph representation.
     * @returns {{ modules: Array<object>, links: Array<{ codePath: string, reqId: string }> }}
     */
    exportGraph() {
        const links = [];

        for (const [codePath, reqSet] of this.codeToReq.entries()) {
            for (const reqId of reqSet) {
                links.push({
                    codePath,
                    reqId
                });
            }
        }

        return {
            modules: Array.from(this.modules.values()),
            links
        };
    }
}

module.exports = CodeGraph;
