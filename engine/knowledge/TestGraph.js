/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Requirement Knowledge Graph Engine (Stream B)
 * File           : TestGraph.js
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

class TestGraph {
    constructor() {
        this.tests = new Map(); // testPath -> { testPath, assertions }
        this.testToReq = new Map(); // testPath -> Set(reqId)
        this.reqToTest = new Map(); // reqId -> Set(testPath)
    }

    /**
     * Registers a test file/suite in the graph.
     * @param {string} testPath Path to the test file.
     * @param {Array<string>} [assertions=[]] Array of assertion descriptions or names.
     */
    addTest(testPath, assertions = []) {
        if (!testPath || typeof testPath !== 'string') {
            throw new Error('testPath is required to addTest');
        }

        const normalizedPath = testPath.replace(/\\/g, '/');
        const testObj = {
            testPath: normalizedPath,
            assertions: Array.isArray(assertions) ? assertions : []
        };

        this.tests.set(normalizedPath, testObj);

        if (!this.testToReq.has(normalizedPath)) {
            this.testToReq.set(normalizedPath, new Set());
        }

        return testObj;
    }

    /**
     * Connects a test to a requirement ID.
     * @param {string} testPath Path to test file.
     * @param {string} reqId Requirement ID.
     */
    connectTestToReq(testPath, reqId) {
        if (!testPath || !reqId) {
            throw new Error('testPath and reqId are required for connectTestToReq');
        }

        const normalizedPath = testPath.replace(/\\/g, '/');

        if (!this.tests.has(normalizedPath)) {
            this.addTest(normalizedPath);
        }

        if (!this.testToReq.has(normalizedPath)) {
            this.testToReq.set(normalizedPath, new Set());
        }
        this.testToReq.get(normalizedPath).add(reqId);

        if (!this.reqToTest.has(reqId)) {
            this.reqToTest.set(reqId, new Set());
        }
        this.reqToTest.get(reqId).add(normalizedPath);

        return { testPath: normalizedPath, reqId };
    }

    /**
     * Gets all test objects linked to a specific requirement ID.
     * @param {string} reqId Requirement ID.
     * @returns {Array<object>} Array of test objects linked to reqId.
     */
    getTestsForReq(reqId) {
        if (!reqId || !this.reqToTest.has(reqId)) return [];

        const testPaths = this.reqToTest.get(reqId);
        const result = [];

        for (const tp of testPaths) {
            const testObj = this.tests.get(tp);
            if (testObj) {
                result.push(testObj);
            }
        }

        return result;
    }

    /**
     * Gets requirements linked to a test file path.
     * @param {string} testPath Path to test file.
     * @returns {Array<string>} Array of requirement IDs.
     */
    getReqsForTest(testPath) {
        const normalizedPath = testPath.replace(/\\/g, '/');
        if (!this.testToReq.has(normalizedPath)) return [];
        return Array.from(this.testToReq.get(normalizedPath));
    }

    /**
     * Returns test object for a given path.
     */
    getTest(testPath) {
        const normalizedPath = testPath.replace(/\\/g, '/');
        return this.tests.get(normalizedPath) || null;
    }

    /**
     * Exports complete test structural graph representation.
     * @returns {{ tests: Array<object>, links: Array<{ testPath: string, reqId: string }> }}
     */
    exportGraph() {
        const links = [];

        for (const [testPath, reqSet] of this.testToReq.entries()) {
            for (const reqId of reqSet) {
                links.push({
                    testPath,
                    reqId
                });
            }
        }

        return {
            tests: Array.from(this.tests.values()),
            links
        };
    }
}

module.exports = TestGraph;
