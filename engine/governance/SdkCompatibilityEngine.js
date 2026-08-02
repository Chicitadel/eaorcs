/******************************************************************************
 * Project        : EAORCS Governance Platform
 * Module         : API & SDK Governance Engine
 * File           : SdkCompatibilityEngine.js
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

const fs = require('fs');
const path = require('path');

/**
 * Expected surface for sdk/verifier.cjs
 */
const EXPECTED_VERIFIER_SURFACE = {
    verify: { type: 'function', paramCount: 2 },
    verifyOffline: { type: 'function', paramCount: 2 },
    getVersion: { type: 'function', paramCount: 0 }
};

class SdkCompatibilityEngine {
    /**
     * Dynamically loads SDK at sdkPath and verifies all expected exports exist
     * @param {string} sdkPath
     * @param {Object} expectedSurface
     * @returns {{ valid: boolean, surface: Object, missingExports: string[], details: Array<{ name: string, expected: Object, actual: Object, valid: boolean }> }}
     */
    static checkSdkSurface(sdkPath, expectedSurface = EXPECTED_VERIFIER_SURFACE) {
        const resolvedPath = path.resolve(sdkPath);

        if (!fs.existsSync(resolvedPath)) {
            return {
                valid: false,
                surface: {},
                missingExports: Object.keys(expectedSurface),
                details: [{ name: 'sdkFile', expected: 'file exists', actual: 'file not found', valid: false }]
            };
        }

        let loadedModule;
        try {
            // Delete cache if reloading in tests
            delete require.cache[resolvedPath];
            loadedModule = require(resolvedPath);
        } catch (err) {
            return {
                valid: false,
                surface: {},
                missingExports: Object.keys(expectedSurface),
                details: [{ name: 'moduleLoad', expected: 'successful require', actual: err.message, valid: false }]
            };
        }

        const actualSurface = {};
        const missingExports = [];
        const details = [];

        for (const [expName, expSpec] of Object.entries(expectedSurface)) {
            const actualMember = loadedModule[expName] || (loadedModule.prototype && loadedModule.prototype[expName]);
            const actualType = typeof actualMember;
            const actualParamCount = actualType === 'function' ? actualMember.length : null;

            actualSurface[expName] = {
                type: actualType,
                paramCount: actualParamCount,
                exists: actualType !== 'undefined'
            };

            const exists = actualType === expSpec.type;
            if (!exists) {
                missingExports.push(expName);
            }

            details.push({
                name: expName,
                expected: expSpec,
                actual: actualSurface[expName],
                valid: exists
            });
        }

        return {
            valid: missingExports.length === 0,
            surface: actualSurface,
            missingExports,
            details
        };
    }

    /**
     * Compares current surface with frozen surface baseline, returning violations
     * @param {Object} currentSurface
     * @param {Object} frozenSurface
     * @returns {{ frozen: boolean, violations: string[] }}
     */
    static checkProtocolFreeze(currentSurface, frozenSurface = EXPECTED_VERIFIER_SURFACE) {
        const violations = [];

        if (!currentSurface || typeof currentSurface !== 'object') {
            return { frozen: false, violations: ['Invalid or missing current surface'] };
        }

        for (const [fnName, frozenSpec] of Object.entries(frozenSurface)) {
            const currentSpec = currentSurface[fnName];

            if (!currentSpec || !currentSpec.exists) {
                violations.push(`Protocol freeze violation: Required export '${fnName}' has been removed`);
                continue;
            }

            if (currentSpec.type !== frozenSpec.type) {
                violations.push(`Protocol freeze violation: Export '${fnName}' type changed from '${frozenSpec.type}' to '${currentSpec.type}'`);
            }

            if (frozenSpec.paramCount !== undefined && currentSpec.paramCount !== null && currentSpec.paramCount < frozenSpec.paramCount) {
                violations.push(`Protocol freeze violation: Export '${fnName}' parameter count decreased from ${frozenSpec.paramCount} to ${currentSpec.paramCount}`);
            }
        }

        return {
            frozen: violations.length === 0,
            violations
        };
    }

    /**
     * Generates a structured compatibility report
     * @param {Object} results
     * @returns {string} Markdown compatibility report
     */
    static generateCompatibilityReport(results) {
        const timestamp = new Date().toISOString();
        const validBadge = results.valid && results.frozen ? '✅ COMPLIANT' : '❌ VIOLATION DETECTED';

        let report = `# SDK Backward Compatibility & Protocol Freeze Report\n\n`;
        report += `**Generated**: ${timestamp}\n`;
        report += `**Status**: ${validBadge}\n\n`;
        report += `## Expected Surface Checks\n\n`;
        report += `| Function | Required Type | Param Count | Actual Status |\n`;
        report += `| -------- | ------------- | ----------- | ------------ |\n`;

        if (results.details && Array.isArray(results.details)) {
            for (const detail of results.details) {
                const statusStr = detail.valid ? '✅ Valid' : '❌ Missing/Invalid';
                const pCount = detail.expected.paramCount !== undefined ? detail.expected.paramCount : 'N/A';
                report += `| \`${detail.name}\` | \`${detail.expected.type}\` | \`${pCount}\` | ${statusStr} |\n`;
            }
        }

        report += `\n## Protocol Freeze Violations\n\n`;
        if (results.violations && results.violations.length > 0) {
            for (const v of results.violations) {
                report += `- ❌ ${v}\n`;
            }
        } else {
            report += `No protocol freeze violations detected. SDK surface is strictly frozen and backward compatible.\n`;
        }

        return report;
    }
}

module.exports = {
    SdkCompatibilityEngine,
    EXPECTED_VERIFIER_SURFACE
};
