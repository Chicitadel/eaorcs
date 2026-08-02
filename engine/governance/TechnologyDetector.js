/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Adapter-Driven Technology Profile Detector
 * File           : TechnologyDetector.js
 * Version        : 2026.1-LTS (v1.0.0-PNC-001)
 * Author         : Architectural Governance Council & Ujomor Systems Engineering
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-02
 * Last Modified  : 2026-08-02
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
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
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Directories excluded from recursive marker scanning.
 */
const DEFAULT_EXCLUDED_DIRS = new Set([
    'node_modules',
    '.git',
    'vendor',
    'target',
    'dist',
    'build',
    'out',
    '.idea',
    '.vscode',
    'tmp',
    'temp'
]);

/**
 * Built-in Node.js Technology Adapter.
 */
const NodeJsAdapter = {
    id: 'adapter_nodejs',
    name: 'Node.js Runtime & Ecosystem Adapter',
    category: 'RUNTIME',
    markers: ['package.json', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', '.nvmrc', 'bower.json'],
    detect(targetDir, fileList) {
        const found = fileList.filter(f => this.markers.includes(path.basename(f)));
        if (found.length === 0) return null;

        const details = {
            runtime: 'Node.js',
            buildTool: 'npm',
            dependencies: [],
            frameworks: [],
            nodeVersion: null
        };

        const pkgPath = fileList.find(f => path.basename(f) === 'package.json');
        if (pkgPath) {
            try {
                const raw = fs.readFileSync(path.join(targetDir, pkgPath), 'utf8');
                const pkg = JSON.parse(raw);
                if (pkg.engines && pkg.engines.node) {
                    details.nodeVersion = pkg.engines.node;
                }
                const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
                const frameworksList = ['express', 'react', 'vue', 'angular', 'next', 'nuxt', 'nest', 'fastify', 'koa', 'typescript'];
                for (const fw of frameworksList) {
                    if (allDeps[fw]) {
                        details.frameworks.push(fw);
                    }
                }
                if (fileList.some(f => path.basename(f) === 'yarn.lock')) details.buildTool = 'yarn';
                else if (fileList.some(f => path.basename(f) === 'pnpm-lock.yaml')) details.buildTool = 'pnpm';
            } catch {
                // Keep default details if package.json parse fails
            }
        }

        return {
            id: this.id,
            name: this.name,
            category: this.category,
            language: 'JavaScript/TypeScript',
            confidence: Math.min(1.0, 0.5 + (found.length * 0.2)),
            markersFound: found,
            details
        };
    }
};

/**
 * Built-in Java Technology Adapter.
 */
const JavaAdapter = {
    id: 'adapter_java',
    name: 'Java Runtime & Build Ecosystem Adapter',
    category: 'RUNTIME',
    markers: ['pom.xml', 'build.gradle', 'build.gradle.kts', 'settings.gradle', '.sdkmanrc', 'mvnw', 'gradlew'],
    detect(targetDir, fileList) {
        const found = fileList.filter(f => this.markers.includes(path.basename(f)) || f.endsWith('.java'));
        if (found.length === 0) return null;

        const details = {
            runtime: 'Java',
            buildTool: 'Maven',
            javaVersion: null,
            frameworks: []
        };

        if (fileList.some(f => path.basename(f).includes('gradle'))) {
            details.buildTool = 'Gradle';
        }

        const pomPath = fileList.find(f => path.basename(f) === 'pom.xml');
        if (pomPath) {
            try {
                const content = fs.readFileSync(path.join(targetDir, pomPath), 'utf8');
                if (content.includes('spring-boot')) details.frameworks.push('Spring Boot');
                if (content.includes('quarkus')) details.frameworks.push('Quarkus');
                if (content.includes('micronaut')) details.frameworks.push('Micronaut');
                const match = content.match(/<java\.version>(.*?)<\/java\.version>/);
                if (match) details.javaVersion = match[1];
            } catch {
                // Ignore parse errors
            }
        }

        return {
            id: this.id,
            name: this.name,
            category: this.category,
            language: 'Java',
            confidence: Math.min(1.0, 0.5 + (found.length * 0.2)),
            markersFound: found,
            details
        };
    }
};

/**
 * Built-in Go Technology Adapter.
 */
const GoAdapter = {
    id: 'adapter_go',
    name: 'Go Language & Module Ecosystem Adapter',
    category: 'RUNTIME',
    markers: ['go.mod', 'go.sum', 'Gopkg.toml', 'Gopkg.lock', 'main.go'],
    detect(targetDir, fileList) {
        const found = fileList.filter(f => this.markers.includes(path.basename(f)) || f.endsWith('.go'));
        if (found.length === 0) return null;

        const details = {
            runtime: 'Go',
            buildTool: 'go',
            goVersion: null
        };

        const goModPath = fileList.find(f => path.basename(f) === 'go.mod');
        if (goModPath) {
            try {
                const content = fs.readFileSync(path.join(targetDir, goModPath), 'utf8');
                const match = content.match(/^go\s+([0-9\.]+)/m);
                if (match) details.goVersion = match[1];
            } catch {
                // Ignore parse errors
            }
        }

        return {
            id: this.id,
            name: this.name,
            category: this.category,
            language: 'Go',
            confidence: Math.min(1.0, 0.6 + (found.length * 0.2)),
            markersFound: found,
            details
        };
    }
};

/**
 * Built-in Python Technology Adapter.
 */
const PythonAdapter = {
    id: 'adapter_python',
    name: 'Python Runtime & Packaging Ecosystem Adapter',
    category: 'RUNTIME',
    markers: ['requirements.txt', 'pyproject.toml', 'Pipfile', 'setup.py', 'environment.yml', 'poetry.lock', 'tox.ini'],
    detect(targetDir, fileList) {
        const found = fileList.filter(f => this.markers.includes(path.basename(f)) || f.endsWith('.py'));
        if (found.length === 0) return null;

        const details = {
            runtime: 'Python',
            buildTool: 'pip',
            frameworks: []
        };

        if (fileList.some(f => path.basename(f) === 'poetry.lock')) details.buildTool = 'poetry';
        else if (fileList.some(f => path.basename(f) === 'Pipfile')) details.buildTool = 'pipenv';

        const reqPath = fileList.find(f => path.basename(f) === 'requirements.txt' || path.basename(f) === 'pyproject.toml');
        if (reqPath) {
            try {
                const content = fs.readFileSync(path.join(targetDir, reqPath), 'utf8').toLowerCase();
                const frameworksList = ['django', 'flask', 'fastapi', 'pytorch', 'tensorflow', 'pandas', 'scipy'];
                for (const fw of frameworksList) {
                    if (content.includes(fw)) details.frameworks.push(fw);
                }
            } catch {
                // Ignore parse errors
            }
        }

        return {
            id: this.id,
            name: this.name,
            category: this.category,
            language: 'Python',
            confidence: Math.min(1.0, 0.5 + (found.length * 0.2)),
            markersFound: found,
            details
        };
    }
};

/**
 * Built-in Rust Technology Adapter.
 */
const RustAdapter = {
    id: 'adapter_rust',
    name: 'Rust Systems Ecosystem Adapter',
    category: 'RUNTIME',
    markers: ['Cargo.toml', 'Cargo.lock', 'rust-toolchain', 'rust-toolchain.toml'],
    detect(targetDir, fileList) {
        const found = fileList.filter(f => this.markers.includes(path.basename(f)) || f.endsWith('.rs'));
        if (found.length === 0) return null;

        const details = {
            runtime: 'Rust',
            buildTool: 'cargo',
            edition: null
        };

        const cargoPath = fileList.find(f => path.basename(f) === 'Cargo.toml');
        if (cargoPath) {
            try {
                const content = fs.readFileSync(path.join(targetDir, cargoPath), 'utf8');
                const match = content.match(/edition\s*=\s*"([^"]+)"/);
                if (match) details.edition = match[1];
            } catch {
                // Ignore parse errors
            }
        }

        return {
            id: this.id,
            name: this.name,
            category: this.category,
            language: 'Rust',
            confidence: Math.min(1.0, 0.6 + (found.length * 0.2)),
            markersFound: found,
            details
        };
    }
};

/**
 * Built-in PHP Technology Adapter.
 */
const PhpAdapter = {
    id: 'adapter_php',
    name: 'PHP Web Ecosystem Adapter',
    category: 'RUNTIME',
    markers: ['composer.json', 'composer.lock', 'artisan', 'symfony.lock'],
    detect(targetDir, fileList) {
        const found = fileList.filter(f => this.markers.includes(path.basename(f)) || f.endsWith('.php'));
        if (found.length === 0) return null;

        const details = {
            runtime: 'PHP',
            buildTool: 'composer',
            frameworks: []
        };

        if (fileList.some(f => path.basename(f) === 'artisan')) details.frameworks.push('Laravel');
        if (fileList.some(f => path.basename(f) === 'symfony.lock')) details.frameworks.push('Symfony');

        return {
            id: this.id,
            name: this.name,
            category: this.category,
            language: 'PHP',
            confidence: Math.min(1.0, 0.5 + (found.length * 0.2)),
            markersFound: found,
            details
        };
    }
};

/**
 * Built-in .NET / C# Technology Adapter.
 */
const DotNetAdapter = {
    id: 'adapter_dotnet',
    name: '.NET Enterprise Ecosystem Adapter',
    category: 'RUNTIME',
    markers: ['global.json', 'NuGet.config'],
    detect(targetDir, fileList) {
        const projFile = fileList.find(f => f.endsWith('.csproj') || f.endsWith('.fsproj') || f.endsWith('.sln'));
        const found = fileList.filter(f => this.markers.includes(path.basename(f)) || f.endsWith('.csproj') || f.endsWith('.fsproj') || f.endsWith('.sln') || f.endsWith('.cs'));
        if (found.length === 0) return null;

        const details = {
            runtime: '.NET',
            buildTool: 'dotnet',
            targetFramework: null
        };

        if (projFile && projFile.endsWith('.csproj')) {
            try {
                const content = fs.readFileSync(path.join(targetDir, projFile), 'utf8');
                const match = content.match(/<TargetFramework>(.*?)<\/TargetFramework>/);
                if (match) details.targetFramework = match[1];
            } catch {
                // Ignore parse errors
            }
        }

        return {
            id: this.id,
            name: this.name,
            category: this.category,
            language: 'C#/.NET',
            confidence: Math.min(1.0, 0.6 + (found.length * 0.2)),
            markersFound: found,
            details
        };
    }
};

/**
 * Built-in Docker & Containerization Adapter.
 */
const DockerAdapter = {
    id: 'adapter_docker',
    name: 'Containerization & Docker Adapter',
    category: 'CONTAINER',
    markers: ['Dockerfile', 'docker-compose.yml', 'docker-compose.yaml', '.dockerignore', 'Containerfile', 'compose.yaml'],
    detect(targetDir, fileList) {
        const found = fileList.filter(f => this.markers.includes(path.basename(f)) || path.basename(f).startsWith('Dockerfile'));
        if (found.length === 0) return null;

        const details = {
            containerized: true,
            baseImage: null
        };

        const dockerfilePath = fileList.find(f => path.basename(f).startsWith('Dockerfile') || path.basename(f) === 'Containerfile');
        if (dockerfilePath) {
            try {
                const content = fs.readFileSync(path.join(targetDir, dockerfilePath), 'utf8');
                const match = content.match(/^FROM\s+([^\s]+)/m);
                if (match) details.baseImage = match[1];
            } catch {
                // Ignore parse errors
            }
        }

        return {
            id: this.id,
            name: this.name,
            category: this.category,
            language: 'Container',
            confidence: 1.0,
            markersFound: found,
            details
        };
    }
};

/**
 * Built-in Infrastructure as Code (IaC) Adapter.
 */
const IacAdapter = {
    id: 'adapter_iac',
    name: 'Infrastructure as Code Adapter',
    category: 'INFRASTRUCTURE',
    markers: ['main.tf', 'Chart.yaml', 'k8s', 'helm', 'terraform'],
    detect(targetDir, fileList) {
        const found = fileList.filter(f => f.endsWith('.tf') || path.basename(f) === 'Chart.yaml' || f.includes('k8s/') || f.includes('helm/'));
        if (found.length === 0) return null;

        const tools = [];
        if (fileList.some(f => f.endsWith('.tf'))) tools.push('Terraform');
        if (fileList.some(f => path.basename(f) === 'Chart.yaml' || f.includes('helm/'))) tools.push('Helm');
        if (fileList.some(f => f.includes('k8s/'))) tools.push('Kubernetes');

        return {
            id: this.id,
            name: this.name,
            category: this.category,
            language: 'IaC',
            confidence: 0.9,
            markersFound: found,
            details: { infrastructureTools: tools }
        };
    }
};

/**
 * TechnologyDetector
 * Adapter-driven technology profile detector that non-invasively scans repository marker files
 * for Node.js, Java, Go, Python, Rust, PHP, .NET, Docker, and IaC ecosystems without hardcoding
 * customer product names or domain assumptions.
 */
class TechnologyDetector {
    /**
     * Constructs a TechnologyDetector instance.
     * @param {Object} [options={}] Options.
     * @param {Array<Object>} [options.customAdapters=[]] Custom adapter detectors.
     */
    constructor(options = {}) {
        this.adapters = new Map();

        // Register default adapters
        this.registerAdapter(NodeJsAdapter);
        this.registerAdapter(JavaAdapter);
        this.registerAdapter(GoAdapter);
        this.registerAdapter(PythonAdapter);
        this.registerAdapter(RustAdapter);
        this.registerAdapter(PhpAdapter);
        this.registerAdapter(DotNetAdapter);
        this.registerAdapter(DockerAdapter);
        this.registerAdapter(IacAdapter);

        if (Array.isArray(options.customAdapters)) {
            for (const adapter of options.customAdapters) {
                this.registerAdapter(adapter);
            }
        }
    }

    /**
     * Registers a technology adapter.
     * @param {Object} adapter Adapter instance matching adapter schema.
     */
    registerAdapter(adapter) {
        if (!adapter || typeof adapter !== 'object' || !adapter.id || typeof adapter.detect !== 'function') {
            throw new Error('Adapter must be an object with an id string and a detect() function');
        }
        this.adapters.set(adapter.id, adapter);
    }

    /**
     * Removes a registered adapter.
     * @param {string} adapterId Adapter ID string.
     * @returns {boolean} True if removed.
     */
    unregisterAdapter(adapterId) {
        return this.adapters.delete(adapterId);
    }

    /**
     * Returns all registered adapters.
     * @returns {Array<Object>} Array of registered adapters.
     */
    getRegisteredAdapters() {
        return Array.from(this.adapters.values());
    }

    /**
     * Recursively scans directory to gather file paths.
     * @param {string} dir Directory path.
     * @param {number} maxDepth Maximum depth level.
     * @param {number} currentDepth Current depth level.
     * @returns {Array<string>} Relative file paths.
     * @private
     */
    _collectFiles(dir, maxDepth = 2, currentDepth = 0) {
        let results = [];
        if (!fs.existsSync(dir)) return results;

        try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                if (DEFAULT_EXCLUDED_DIRS.has(entry.name)) continue;

                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    if (currentDepth < maxDepth) {
                        results = results.concat(this._collectFiles(fullPath, maxDepth, currentDepth + 1));
                    }
                } else if (entry.isFile()) {
                    results.push(path.relative(dir, fullPath));
                }
            }
        } catch {
            // Ignore unreadable directories
        }
        return results;
    }

    /**
     * Scans a target repository directory and generates a comprehensive TechnologyProfile.
     * @param {string} targetDir Target repository directory path.
     * @param {Object} [options={}] Scanning options.
     * @param {number} [options.maxDepth=2] Max directory traversal depth.
     * @returns {Object} Comprehensive technology profile.
     */
    detectTechnologyProfile(targetDir, options = {}) {
        const resolvedDir = path.resolve(targetDir || process.cwd());
        const maxDepth = typeof options.maxDepth === 'number' ? options.maxDepth : 2;

        const fileList = this._collectFiles(resolvedDir, maxDepth, 0);

        const detectedRuntimes = [];
        let primaryAdapterMatch = null;
        let highestConfidence = 0.0;
        let isContainerized = false;
        const infrastructureTools = [];
        const buildToolsSet = new Set();
        const repoMarkers = new Set();

        for (const adapter of this.adapters.values()) {
            try {
                const match = adapter.detect(resolvedDir, fileList);
                if (match && match.confidence > 0) {
                    detectedRuntimes.push(match);

                    for (const m of match.markersFound) {
                        repoMarkers.add(m);
                    }

                    if (match.category === 'CONTAINER') {
                        isContainerized = true;
                    }

                    if (match.category === 'INFRASTRUCTURE' && match.details && Array.isArray(match.details.infrastructureTools)) {
                        for (const tool of match.details.infrastructureTools) {
                            infrastructureTools.push(tool);
                        }
                    }

                    if (match.details && match.details.buildTool) {
                        buildToolsSet.add(match.details.buildTool);
                    }

                    if (match.category === 'RUNTIME' && match.confidence > highestConfidence) {
                        highestConfidence = match.confidence;
                        primaryAdapterMatch = match;
                    }
                }
            } catch {
                // Protect core scan against failing third-party adapters
            }
        }

        const primaryLanguage = primaryAdapterMatch ? primaryAdapterMatch.language : (detectedRuntimes[0] ? detectedRuntimes[0].language : 'Unknown');

        return Object.freeze({
            targetDir: resolvedDir,
            primaryLanguage,
            detectedRuntimes,
            containerized: isContainerized,
            infrastructure: [...new Set(infrastructureTools)],
            buildTools: Array.from(buildToolsSet),
            repoMarkers: Array.from(repoMarkers),
            scannedFilesCount: fileList.length,
            scannedAt: new Date().toISOString()
        });
    }
}

TechnologyDetector.NodeJsAdapter = NodeJsAdapter;
TechnologyDetector.JavaAdapter = JavaAdapter;
TechnologyDetector.GoAdapter = GoAdapter;
TechnologyDetector.PythonAdapter = PythonAdapter;
TechnologyDetector.RustAdapter = RustAdapter;
TechnologyDetector.PhpAdapter = PhpAdapter;
TechnologyDetector.DotNetAdapter = DotNetAdapter;
TechnologyDetector.DockerAdapter = DockerAdapter;
TechnologyDetector.IacAdapter = IacAdapter;

module.exports = {
    TechnologyDetector,
    NodeJsAdapter,
    JavaAdapter,
    GoAdapter,
    PythonAdapter,
    RustAdapter,
    PhpAdapter,
    DotNetAdapter,
    DockerAdapter,
    IacAdapter
};
