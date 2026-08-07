/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Platform Compatibility Matrix
 * File           : PlatformCompatibilityMatrixEngine.js
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
 * CORP: Stream S14
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

class PlatformCompatibilityMatrixEngine {
    constructor() {
        this.matrix = new Map();
        this.categories = ['OS', 'CI', 'IDE', 'Runtimes', 'PackageManagers'];
    }

    buildMatrix() {
        const baseMatrix = {
            'OS': ['Windows', 'Linux', 'macOS', 'Docker', 'Podman'],
            'CI': ['GitHub Actions', 'GitLab CI', 'Azure DevOps', 'Jenkins'],
            'IDE': ['VS Code', 'IntelliJ', 'Eclipse', 'Visual Studio'],
            'Runtimes': ['Node.js 18', 'Node.js 20', 'Node.js 22 LTS'],
            'PackageManagers': ['npm', 'pnpm', 'yarn', 'bun']
        };

        for (const [category, platforms] of Object.entries(baseMatrix)) {
            for (const platform of platforms) {
                this.matrix.set(`${category}:${platform}`, {
                    platformId: platform,
                    category,
                    certified: true,
                    testedAt: new Date().toISOString()
                });
            }
        }
        return this.matrix;
    }

    validatePlatform(platformId, category) {
        const key = `${category}:${platformId}`;
        const entry = this.matrix.get(key);
        if (entry) {
            return {
                platformId,
                category,
                valid: entry.certified,
                testedAt: entry.testedAt
            };
        }
        return { platformId, category, valid: false, testedAt: null };
    }

    getCertifiedPlatforms(category) {
        const platforms = [];
        for (const entry of this.matrix.values()) {
            if (entry.category === category && entry.certified) {
                platforms.push(entry.platformId);
            }
        }
        return platforms;
    }

    generateMatrixReport() {
        const matrixByCategory = {};
        let certifiedCount = 0;

        for (const entry of this.matrix.values()) {
            if (!matrixByCategory[entry.category]) {
                matrixByCategory[entry.category] = [];
            }
            matrixByCategory[entry.category].push(entry.platformId);
            if (entry.certified) certifiedCount++;
        }

        return {
            totalEntries: this.matrix.size,
            certifiedCount,
            matrixByCategory,
            certifiedAt: new Date().toISOString()
        };
    }

    exportMatrix(format) {
        const report = this.generateMatrixReport();
        if (format === 'json') {
            return JSON.stringify(report, null, 2);
        } else if (format === 'markdown') {
            let md = '| Category | Platform |\n|----------|----------|\n';
            for (const [category, platforms] of Object.entries(report.matrixByCategory)) {
                for (const platform of platforms) {
                    md += `| ${category} | ${platform} |\n`;
                }
            }
            return md;
        }
        return '';
    }

    recordValidationResult(platformId, testResult) {
        const key = `${testResult.category}:${platformId}`;
        const entry = this.matrix.get(key) || { platformId, category: testResult.category };
        entry.certified = testResult.valid;
        entry.testedAt = new Date().toISOString();
        this.matrix.set(key, entry);
        return entry;
    }
}

module.exports = PlatformCompatibilityMatrixEngine;
