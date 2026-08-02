/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Traceability Engine (Stream C)
 * File           : TestMatrix.js
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
 * TestMatrix - Acceptance Criteria Test Coverage Matrix
 */
class TestMatrix {
    constructor(options = {}) {
        this.options = {
            baseDir: options.baseDir || process.cwd(),
            ...options
        };

        // Key: `${reqId}:${criterionId}` -> criterion test record
        this.criteria = new Map();
    }

    _makeKey(reqId, criterionId) {
        return `${String(reqId || '').trim()}:${String(criterionId || '').trim()}`;
    }

    /**
     * Registers a requirement acceptance criterion.
     * @param {string} reqId - Requirement ID (e.g. 'REQ-AUDIT-001')
     * @param {string} criterionId - Acceptance Criterion ID (e.g. 'AC-01')
     * @param {string} description - Criterion description
     * @param {object} metadata - Additional metadata
     */
    registerCriterion(reqId, criterionId, description = '', metadata = {}) {
        if (!reqId || !criterionId) {
            throw new TypeError('reqId and criterionId are required');
        }

        const key = this._makeKey(reqId, criterionId);
        const existing = this.criteria.get(key) || {
            key,
            reqId: String(reqId).trim(),
            criterionId: String(criterionId).trim(),
            description: String(description || '').trim(),
            category: metadata.category || 'FUNCTIONAL',
            status: 'UNTESTED',
            tests: [],
            createdAt: new Date().toISOString()
        };

        if (description) existing.description = String(description).trim();
        if (metadata.category) existing.category = metadata.category;

        existing.updatedAt = new Date().toISOString();
        this.criteria.set(key, existing);
        return { ...existing };
    }

    /**
     * Maps an acceptance criterion to a physical test file and test name.
     * @param {string} reqId - Requirement ID
     * @param {string} criterionId - Criterion ID
     * @param {string} testFile - Test file path (e.g., 'tests/spec/traceability_drift.test.js')
     * @param {string} testName - Name/title of the test suite or test case
     * @param {string} testStatus - Test result status ('PASSED', 'FAILED', 'SKIPPED')
     * @returns {object} Updated criterion mapping record
     */
    mapCriteriaToTest(reqId, criterionId, testFile, testName = '', testStatus = 'PASSED') {
        if (!reqId || !criterionId) {
            throw new TypeError('reqId and criterionId are required');
        }

        const key = this._makeKey(reqId, criterionId);
        if (!this.criteria.has(key)) {
            // Auto-register criterion if missing
            this.registerCriterion(reqId, criterionId, `Acceptance criterion ${criterionId} for ${reqId}`);
        }

        const criterion = this.criteria.get(key);
        const normTestFile = String(testFile || '').replace(/\\/g, '/').trim();
        const normTestName = String(testName || '').trim();
        const normStatus = String(testStatus || 'PASSED').toUpperCase().trim();

        // Find or append test record
        let existingTest = criterion.tests.find(t => t.testFile === normTestFile && t.testName === normTestName);
        if (existingTest) {
            existingTest.status = normStatus;
            existingTest.updatedAt = new Date().toISOString();
        } else {
            criterion.tests.push({
                testFile: normTestFile,
                testName: normTestName,
                status: normStatus,
                linkedAt: new Date().toISOString()
            });
        }

        // Compute overall criterion status
        if (criterion.tests.length > 0) {
            const hasFailures = criterion.tests.some(t => t.status === 'FAILED');
            const hasPasses = criterion.tests.some(t => t.status === 'PASSED');
            if (hasFailures) {
                criterion.status = 'FAILED';
            } else if (hasPasses) {
                criterion.status = 'PASSED';
            } else {
                criterion.status = 'SKIPPED';
            }
        } else {
            criterion.status = 'UNTESTED';
        }

        criterion.updatedAt = new Date().toISOString();
        return { ...criterion };
    }

    /**
     * Retrieves all registered acceptance criteria that have NO linked tests or are marked UNTESTED.
     * @returns {object[]} List of untested criteria records
     */
    getUntestedCriteria() {
        const untested = [];
        for (const [, criterion] of this.criteria) {
            if (criterion.status === 'UNTESTED' || criterion.tests.length === 0) {
                untested.push({
                    reqId: criterion.reqId,
                    criterionId: criterion.criterionId,
                    description: criterion.description,
                    category: criterion.category,
                    status: criterion.status
                });
            }
        }
        return untested;
    }

    /**
     * Evaluates comprehensive acceptance criteria test coverage stats.
     * @returns {object} Coverage summary statistics
     */
    evaluateTestCoverage() {
        const totalCriteria = this.criteria.size;
        if (totalCriteria === 0) {
            return {
                totalCriteria: 0,
                testedCriteria: 0,
                untestedCriteria: 0,
                passedCriteria: 0,
                failedCriteria: 0,
                coveragePercent: 0,
                passRatePercent: 0,
                details: []
            };
        }

        let testedCount = 0;
        let untestedCount = 0;
        let passedCount = 0;
        let failedCount = 0;

        const details = [];

        for (const [, criterion] of this.criteria) {
            const isTested = criterion.tests.length > 0 && criterion.status !== 'UNTESTED';
            if (isTested) {
                testedCount++;
                if (criterion.status === 'PASSED') passedCount++;
                if (criterion.status === 'FAILED') failedCount++;
            } else {
                untestedCount++;
            }

            details.push({
                reqId: criterion.reqId,
                criterionId: criterion.criterionId,
                description: criterion.description,
                status: criterion.status,
                testCount: criterion.tests.length,
                tests: [...criterion.tests]
            });
        }

        const coveragePercent = Math.round((testedCount / totalCriteria) * 10000) / 100;
        const passRatePercent = testedCount > 0 ? Math.round((passedCount / testedCount) * 10000) / 100 : 0;

        return {
            totalCriteria,
            testedCriteria: testedCount,
            untestedCriteria: untestedCount,
            passedCriteria: passedCount,
            failedCriteria: failedCount,
            coveragePercent,
            passRatePercent,
            untestedList: this.getUntestedCriteria(),
            details
        };
    }

    /**
     * Exports raw test matrix state
     */
    exportMatrix() {
        const list = [];
        for (const [, item] of this.criteria) {
            list.push({ ...item });
        }
        return {
            version: '2026.1.0',
            exportedAt: new Date().toISOString(),
            criteria: list
        };
    }

    /**
     * Imports test matrix state
     */
    importMatrix(data) {
        if (!data || !Array.isArray(data.criteria)) {
            throw new Error('Invalid import format: expected object with criteria array');
        }

        for (const item of data.criteria) {
            if (item && item.reqId && item.criterionId) {
                this.registerCriterion(item.reqId, item.criterionId, item.description, item);
                if (Array.isArray(item.tests)) {
                    for (const t of item.tests) {
                        this.mapCriteriaToTest(item.reqId, item.criterionId, t.testFile, t.testName, t.status);
                    }
                }
            }
        }
        return this.criteria.size;
    }
}

module.exports = TestMatrix;
