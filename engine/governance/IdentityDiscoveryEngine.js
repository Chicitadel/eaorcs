/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Identity Discovery Engine & Runtime Context (Stream 1)
 * File           : IdentityDiscoveryEngine.js
 * Version        : 2026.1-LTS (v1.0.0-FROZEN)
 * Author         : Architectural Governance Council & Ujomor Systems Engineering
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
 * Created Date   : 2026-08-02
 * Last Modified  : 2026-08-02
 * Classification : ENTERPRISE | RESTRICTED
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
 * Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Known product mapping dictionary for standardized product identities.
 */
const KNOWN_PRODUCT_MAPPINGS = Object.freeze({
    'akpati': 'Akpati',
    'akpati-engine': 'Akpati',
    'akpati-platform': 'Akpati',
    'civiscore': 'CiviScore',
    'civi-score': 'CiviScore',
    'civi_score': 'CiviScore',
    'airroofers': 'Air Roofers Platform',
    'air-roofers': 'Air Roofers Platform',
    'air-roofers-platform': 'Air Roofers Platform',
    'eaorcs': 'EAORCS Platform',
    'eaorcs-engine': 'EAORCS'
});

class IdentityDiscoveryEngine {
    constructor(options = {}) {
        this.options = options;
    }

    /**
     * Format raw product name using known mappings or Title Case formatting.
     * @param {string} rawName 
     * @returns {string}
     */
    static normalizeProductName(rawName) {
        if (!rawName || typeof rawName !== 'string') return '';
        const clean = rawName.trim();
        const lower = clean.toLowerCase();
        if (KNOWN_PRODUCT_MAPPINGS[lower]) {
            return KNOWN_PRODUCT_MAPPINGS[lower];
        }
        // If already Title Case or mixed case with spaces/capitals, preserve it
        if (/[A-Z]/.test(clean) && clean.includes(' ')) {
            return clean;
        }
        // Convert kebab-case / snake_case to Title Case
        return clean
            .replace(/^@[\w-]+\//, '') // strip npm scope if any
            .replace(/[-_]+/g, ' ')
            .replace(/\b\w/g, char => char.toUpperCase());
    }

    /**
     * Format organization name.
     * @param {string} rawOrg 
     * @returns {string}
     */
    static normalizeOrganization(rawOrg) {
        if (!rawOrg || typeof rawOrg !== 'string') return '';
        let clean = rawOrg.trim();
        clean = clean.replace(/^@/, '');
        if (KNOWN_PRODUCT_MAPPINGS[clean.toLowerCase()]) {
            return KNOWN_PRODUCT_MAPPINGS[clean.toLowerCase()];
        }
        if (clean.toLowerCase().includes('ujomor')) {
            return 'Ujomor Engineering';
        }
        if (clean.toLowerCase().includes('airroofers') || clean.toLowerCase().includes('air-roofers')) {
            return 'Air Roofers Platform Ecosystem';
        }
        return clean.replace(/[-_]+/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
    }

    /**
     * Dynamically scan repository files and discover product identity.
     * @param {string} targetDir 
     * @param {Object} options 
     * @returns {Object} Identity discovery result
     */
    static discover(targetDir = process.cwd(), options = {}) {
        const absDir = path.resolve(targetDir);
        const detectionSources = [];

        // Check for Anonymous / Redacted mode
        if (options.anonymous) {
            return {
                productName: 'Anonymous',
                organization: 'Redacted',
                repository: 'Hidden',
                version: options.version || '0.0.0-redacted',
                confidence: 1.0,
                detectionSources: ['AnonymousMode']
            };
        }

        let detectedProductName = '';
        let detectedOrg = '';
        let detectedRepo = '';
        let detectedVersion = '';
        let rawConfidence = 0.0;

        // 1. Scan Git config (.git/config)
        const gitConfigPath = path.join(absDir, '.git', 'config');
        if (fs.existsSync(gitConfigPath)) {
            try {
                const gitContent = fs.readFileSync(gitConfigPath, 'utf8');
                const remoteMatch = gitContent.match(/\[remote\s+"origin"\][\s\S]*?url\s*=\s*(.+)/);
                if (remoteMatch) {
                    const url = remoteMatch[1].trim();
                    const repoMatch = url.match(/[:\/]([^\/]+)\/([^\/\s]+?)(?:\.git)?$/);
                    if (repoMatch) {
                        detectedOrg = repoMatch[1];
                        detectedRepo = repoMatch[2];
                        detectedProductName = IdentityDiscoveryEngine.normalizeProductName(detectedRepo);
                        detectionSources.push('Git');
                        rawConfidence += 0.30;
                    }
                }
            } catch (err) {
                // Ignore parse errors
            }
        }

        // 2. Scan package.json
        const pkgPath = path.join(absDir, 'package.json');
        if (fs.existsSync(pkgPath)) {
            try {
                const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
                if (pkg.name) {
                    const nameStr = pkg.name;
                    if (nameStr.startsWith('@')) {
                        const parts = nameStr.split('/');
                        detectedOrg = detectedOrg || parts[0].replace('@', '');
                        detectedRepo = detectedRepo || parts[1];
                        detectedProductName = detectedProductName || IdentityDiscoveryEngine.normalizeProductName(parts[1]);
                    } else {
                        detectedRepo = detectedRepo || nameStr;
                        detectedProductName = detectedProductName || IdentityDiscoveryEngine.normalizeProductName(nameStr);
                    }
                }
                if (pkg.productName) {
                    detectedProductName = pkg.productName;
                }
                if (pkg.version) {
                    detectedVersion = detectedVersion || pkg.version;
                }
                if (pkg.author) {
                    const authorStr = typeof pkg.author === 'string' ? pkg.author : (pkg.author.name || '');
                    if (authorStr) detectedOrg = detectedOrg || authorStr;
                }
                detectionSources.push('package.json');
                rawConfidence += 0.40;
            } catch (err) {
                // Ignore parse errors
            }
        }

        // 3. Scan composer.json
        const composerPath = path.join(absDir, 'composer.json');
        if (fs.existsSync(composerPath)) {
            try {
                const comp = JSON.parse(fs.readFileSync(composerPath, 'utf8'));
                if (comp.name) {
                    const parts = comp.name.split('/');
                    if (parts.length === 2) {
                        detectedOrg = detectedOrg || parts[0];
                        detectedRepo = detectedRepo || parts[1];
                        detectedProductName = detectedProductName || IdentityDiscoveryEngine.normalizeProductName(parts[1]);
                    } else {
                        detectedRepo = detectedRepo || comp.name;
                        detectedProductName = detectedProductName || IdentityDiscoveryEngine.normalizeProductName(comp.name);
                    }
                }
                if (comp.version) {
                    detectedVersion = detectedVersion || comp.version;
                }
                if (Array.isArray(comp.authors) && comp.authors[0] && comp.authors[0].name) {
                    detectedOrg = detectedOrg || comp.authors[0].name;
                }
                detectionSources.push('composer.json');
                rawConfidence += 0.40;
            } catch (err) {
                // Ignore parse errors
            }
        }

        // 4. Scan pom.xml
        const pomPath = path.join(absDir, 'pom.xml');
        if (fs.existsSync(pomPath)) {
            try {
                const pomContent = fs.readFileSync(pomPath, 'utf8');
                const groupMatch = pomContent.match(/<groupId>(.*?)<\/groupId>/);
                const artifactMatch = pomContent.match(/<artifactId>(.*?)<\/artifactId>/);
                const versionMatch = pomContent.match(/<version>(.*?)<\/version>/);
                const nameMatch = pomContent.match(/<name>(.*?)<\/name>/);

                if (groupMatch) detectedOrg = detectedOrg || groupMatch[1];
                if (artifactMatch) {
                    detectedRepo = detectedRepo || artifactMatch[1];
                    detectedProductName = detectedProductName || IdentityDiscoveryEngine.normalizeProductName(artifactMatch[1]);
                }
                if (nameMatch) {
                    detectedProductName = nameMatch[1];
                }
                if (versionMatch) {
                    detectedVersion = detectedVersion || versionMatch[1];
                }
                detectionSources.push('pom.xml');
                rawConfidence += 0.40;
            } catch (err) {
                // Ignore parse errors
            }
        }

        // 5. Scan Cargo.toml
        const cargoPath = path.join(absDir, 'Cargo.toml');
        if (fs.existsSync(cargoPath)) {
            try {
                const cargoContent = fs.readFileSync(cargoPath, 'utf8');
                const nameMatch = cargoContent.match(/name\s*=\s*"([^"]+)"/);
                const versionMatch = cargoContent.match(/version\s*=\s*"([^"]+)"/);
                const authorsMatch = cargoContent.match(/authors\s*=\s*\[\s*"([^"]+)"/);

                if (nameMatch) {
                    detectedRepo = detectedRepo || nameMatch[1];
                    detectedProductName = detectedProductName || IdentityDiscoveryEngine.normalizeProductName(nameMatch[1]);
                }
                if (versionMatch) {
                    detectedVersion = detectedVersion || versionMatch[1];
                }
                if (authorsMatch) {
                    const authorStr = authorsMatch[1].replace(/<.*?>/, '').trim();
                    detectedOrg = detectedOrg || authorStr;
                }
                detectionSources.push('Cargo.toml');
                rawConfidence += 0.40;
            } catch (err) {
                // Ignore parse errors
            }
        }

        // 6. Scan pubspec.yaml
        const pubspecPath = path.join(absDir, 'pubspec.yaml');
        if (fs.existsSync(pubspecPath)) {
            try {
                const pubContent = fs.readFileSync(pubspecPath, 'utf8');
                const nameMatch = pubContent.match(/^name:\s*([^\r\n]+)/m);
                const versionMatch = pubContent.match(/^version:\s*([^\r\n]+)/m);

                if (nameMatch) {
                    const nameStr = nameMatch[1].trim();
                    detectedRepo = detectedRepo || nameStr;
                    detectedProductName = detectedProductName || IdentityDiscoveryEngine.normalizeProductName(nameStr);
                }
                if (versionMatch) {
                    detectedVersion = detectedVersion || versionMatch[1].trim();
                }
                detectionSources.push('pubspec.yaml');
                rawConfidence += 0.40;
            } catch (err) {
                // Ignore parse errors
            }
        }

        // 7. Scan Dockerfile
        const dockerPath = path.join(absDir, 'Dockerfile');
        if (fs.existsSync(dockerPath)) {
            try {
                const dockerContent = fs.readFileSync(dockerPath, 'utf8');
                const titleMatch = dockerContent.match(/LABEL\s+.*?(?:name|org.opencontainers.image.title)="([^"]+)"/i);
                const vendorMatch = dockerContent.match(/LABEL\s+.*?(?:vendor|maintainer|org.opencontainers.image.vendor)="([^"]+)"/i);
                const versionMatch = dockerContent.match(/LABEL\s+.*?(?:version|org.opencontainers.image.version)="([^"]+)"/i);

                if (titleMatch) detectedProductName = detectedProductName || titleMatch[1];
                if (vendorMatch) detectedOrg = detectedOrg || vendorMatch[1];
                if (versionMatch) detectedVersion = detectedVersion || versionMatch[1];

                detectionSources.push('Dockerfile');
                rawConfidence += 0.15;
            } catch (err) {
                // Ignore parse errors
            }
        }

        // 8. Scan README.md
        const readmePath = path.join(absDir, 'README.md');
        if (fs.existsSync(readmePath)) {
            try {
                const readmeContent = fs.readFileSync(readmePath, 'utf8');
                const headerMatch = readmeContent.match(/^#\s+(.+)$/m);
                if (headerMatch) {
                    const cleanHeader = headerMatch[1].replace(/[`*#]/g, '').trim();
                    if (cleanHeader && !detectedProductName) {
                        detectedProductName = IdentityDiscoveryEngine.normalizeProductName(cleanHeader);
                    }
                }
                detectionSources.push('README.md');
                rawConfidence += 0.15;
            } catch (err) {
                // Ignore parse errors
            }
        }

        // 9. Scan OpenAPI specs
        const openApiCandidates = [
            'openapi.json', 'openapi.yaml', 'swagger.json', 'swagger.yaml',
            path.join('api', 'openapi.json'), path.join('api', 'openapi.yaml')
        ];
        for (const candidate of openApiCandidates) {
            const specPath = path.join(absDir, candidate);
            if (fs.existsSync(specPath)) {
                try {
                    const specContent = fs.readFileSync(specPath, 'utf8');
                    const titleMatch = specContent.match(/title:\s*["']?([^"'\r\n]+)["']?/i) || specContent.match(/"title"\s*:\s*"([^"]+)"/i);
                    const verMatch = specContent.match(/version:\s*["']?([^"'\r\n]+)["']?/i) || specContent.match(/"version"\s*:\s*"([^"]+)"/i);
                    if (titleMatch) {
                        detectedProductName = detectedProductName || IdentityDiscoveryEngine.normalizeProductName(titleMatch[1]);
                    }
                    if (verMatch) {
                        detectedVersion = detectedVersion || verMatch[1];
                    }
                    detectionSources.push('OpenAPI');
                    rawConfidence += 0.15;
                    break;
                } catch (err) {
                    // Ignore parse errors
                }
            }
        }

        // Fallbacks if unmapped
        const dirName = path.basename(absDir);
        const finalRepo = options.repository || detectedRepo || dirName;
        let finalProductName = options.productName || detectedProductName || IdentityDiscoveryEngine.normalizeProductName(dirName);
        let finalOrg = options.organization || IdentityDiscoveryEngine.normalizeOrganization(detectedOrg) || 'Unspecified Organization';
        let finalVersion = options.version || detectedVersion || '1.0.0';

        // Check user overrides
        if (options.productName || options.organization || options.repository || options.version) {
            detectionSources.push('UserOverride');
            rawConfidence += 0.20;
        }

        // Calculate final confidence score
        if (detectionSources.length === 0) {
            rawConfidence = 0.40;
        }
        
        let confidence = Math.min(0.992, Math.round(rawConfidence * 1000) / 1000);
        if (options.productName && options.organization) {
            confidence = 1.0;
        }

        return {
            productName: finalProductName,
            organization: finalOrg,
            repository: finalRepo,
            version: finalVersion,
            confidence: Number(confidence.toFixed(3)),
            detectionSources: Array.from(new Set(detectionSources))
        };
    }

    /**
     * Synonym static wrapper for discover.
     */
    static discoverIdentity(targetDir, options = {}) {
        return this.discover(targetDir, options);
    }

    /**
     * Returns identity along with system runtime context.
     * @param {string} targetDir 
     * @param {Object} options 
     */
    static getRuntimeContext(targetDir = process.cwd(), options = {}) {
        const identity = this.discover(targetDir, options);
        return {
            identity,
            runtime: {
                nodeVersion: process.version,
                platform: process.platform,
                arch: process.arch,
                pid: process.pid,
                cwd: path.resolve(targetDir),
                timestamp: new Date().toISOString()
            }
        };
    }

    /**
     * Instance wrapper for discover.
     * @param {string} targetDir 
     * @param {Object} options 
     */
    discover(targetDir = process.cwd(), options = {}) {
        return IdentityDiscoveryEngine.discover(targetDir, { ...this.options, ...options });
    }

    getRuntimeContext(targetDir = process.cwd(), options = {}) {
        return IdentityDiscoveryEngine.getRuntimeContext(targetDir, { ...this.options, ...options });
    }
}

function discoverIdentity(targetDir, options = {}) {
    return IdentityDiscoveryEngine.discover(targetDir, options);
}

module.exports = {
    IdentityDiscoveryEngine,
    discoverIdentity,
    KNOWN_PRODUCT_MAPPINGS
};
