/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Specification Intelligence Engine (Stream A)
 * File           : BlueprintDiscoveryEngine.js
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

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SUPPORTED_EXTENSIONS = new Set([
    '.md', '.json', '.yaml', '.yml', '.openapi', '.graphql', '.bpmn', '.puml'
]);

const IGNORED_DIRS = new Set([
    'node_modules', '.git', '.vscode', '.idea', 'dist', 'build', 'coverage', '.cache'
]);

class BlueprintDiscoveryEngine {
    constructor(options = {}) {
        this.options = options;
    }

    /**
     * Recursively scans directory for specification files and categorizes them.
     * @param {string} dirPath Directory path to scan.
     * @returns {{ specs: Array<{ path: string, type: string, title: string, size: number, hash: string }>, total: number }}
     */
    discoverSpecifications(dirPath) {
        if (!dirPath || typeof dirPath !== 'string') {
            throw new Error('Invalid directory path provided to discoverSpecifications');
        }

        const absolutePath = path.resolve(dirPath);
        if (!fs.existsSync(absolutePath)) {
            throw new Error(`Directory does not exist: ${absolutePath}`);
        }

        const specs = [];
        this._scanDirectory(absolutePath, dirPath, specs);

        return {
            specs,
            total: specs.length
        };
    }

    /**
     * Static helper for direct invocation.
     */
    static discoverSpecifications(dirPath) {
        return new BlueprintDiscoveryEngine().discoverSpecifications(dirPath);
    }

    _scanDirectory(currentPath, baseDir, specs) {
        let entries = [];
        try {
            entries = fs.readdirSync(currentPath, { withFileTypes: true });
        } catch (err) {
            return; // Skip directories with permission errors
        }

        for (const entry of entries) {
            const entryPath = path.join(currentPath, entry.name);

            if (entry.isDirectory()) {
                if (!IGNORED_DIRS.has(entry.name.toLowerCase())) {
                    this._scanDirectory(entryPath, baseDir, specs);
                }
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase();
                if (SUPPORTED_EXTENSIONS.has(ext)) {
                    try {
                        const specInfo = this._processFile(entryPath, baseDir);
                        if (specInfo) {
                            specs.push(specInfo);
                        }
                    } catch (err) {
                        // Resilient defensive processing: skip unreadable files
                    }
                }
            }
        }
    }

    _processFile(filePath, baseDir) {
        const stats = fs.statSync(filePath);
        const content = fs.readFileSync(filePath, 'utf8');

        const fileHash = crypto.createHash('sha256').update(content).digest('hex');
        const specType = this.categorize(filePath, content);
        const title = this._extractTitle(filePath, content);
        const relativePath = path.relative(baseDir, filePath).replace(/\\/g, '/');

        return {
            path: relativePath || filePath,
            absolutePath: filePath,
            type: specType,
            title,
            size: stats.size,
            hash: fileHash
        };
    }

    /**
     * Categorizes a specification file based on path, extension, and content heuristics.
     */
    categorize(filePath, content = '') {
        const ext = path.extname(filePath).toLowerCase();
        const fullLower = filePath.toLowerCase();
        const baseLower = path.basename(filePath).toLowerCase();

        if (ext === '.openapi' || fullLower.includes('openapi') || fullLower.includes('swagger')) {
            return 'OPENAPI';
        }
        if (ext === '.graphql' || fullLower.includes('graphql')) {
            return 'GRAPHQL';
        }
        if (ext === '.bpmn' || fullLower.includes('bpmn')) {
            return 'BPMN';
        }
        if (fullLower.includes('figma')) {
            return 'FIGMA';
        }
        if (baseLower.includes('srs') || fullLower.includes('requirement')) {
            return 'SRS';
        }
        if (baseLower.includes('prd')) {
            return 'PRD';
        }
        if (baseLower.includes('brd')) {
            return 'BRD';
        }
        if (baseLower.includes('adr') || baseLower.includes('architecture_decision') || baseLower.includes('decision')) {
            return 'ADR';
        }

        // Heuristic analysis of content head
        const contentHead = content.slice(0, 2000).toLowerCase();

        if (contentHead.includes('openapi:') || contentHead.includes('"openapi":') || contentHead.includes('swagger:')) {
            return 'OPENAPI';
        }
        if (contentHead.includes('type query') || contentHead.includes('type mutation') || contentHead.includes('schema {')) {
            return 'GRAPHQL';
        }
        if (contentHead.includes('<bpmn:') || contentHead.includes('<definitions')) {
            return 'BPMN';
        }
        if (contentHead.includes('software requirements specification') || contentHead.includes('srs')) {
            return 'SRS';
        }
        if (contentHead.includes('product requirements document') || contentHead.includes('prd')) {
            return 'PRD';
        }
        if (contentHead.includes('business requirements document') || contentHead.includes('brd')) {
            return 'BRD';
        }
        if (contentHead.includes('architecture decision record') || contentHead.includes('adr-') || contentHead.includes('# adr')) {
            return 'ADR';
        }

        if (ext === '.puml') return 'ADR';
        return 'SRS';
    }

    _extractTitle(filePath, content) {
        const lines = content.split(/\r?\n/);
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('# ')) {
                return trimmed.replace(/^#\s+/, '').trim();
            }
        }
        return path.basename(filePath, path.extname(filePath));
    }
}

module.exports = BlueprintDiscoveryEngine;
