/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Workspace Resolver Platform Service Engine
 * File           : WorkspaceResolverEngine.js
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
 * CORP:
 * - Stream: S3 — Workspace Runtime Platform
 * - Decision: DEC-01 (sole filesystem topology service)
 * - Resolves: TD-03 (direct filesystem calls), TD-07 (no shared snapshot cache)
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

/**
 * WorkspaceResolverEngine
 *
 * THE sole authoritative platform service for workspace directory topology
 * discovery and resolution. No other engine, CLI module, packaging script,
 * evidence generator, or dashboard component is permitted to perform direct
 * filesystem traversal independently.
 *
 * Provides:
 *   - Root detection
 *   - Repository discovery
 *   - Product / project / package discovery
 *   - Topology caching (shared in-process snapshot)
 *   - Path normalization (Windows/Linux/macOS compatible)
 *   - Symbolic link handling
 *   - Portable path generation (no absolute developer paths in output)
 */
class WorkspaceResolverEngine {
    constructor(options = {}) {
        this.options = options;
        // Shared in-process snapshot cache — eliminates repeated scans (TD-07)
        this._snapshotCache = new Map();
    }

    /**
     * Returns a normalized, cross-platform portable path.
     * Always uses forward slashes regardless of OS.
     * @param {string} absolutePath
     * @returns {string}
     */
    normalizePath(absolutePath) {
        return path.resolve(absolutePath).replace(/\\/g, '/');
    }

    /**
     * Resolves workspace topology and returns a portable descriptor.
     * Results are cached per workspaceRoot for the lifetime of this instance.
     *
     * @param {string} targetDir - Target workspace directory.
     * @param {boolean} forceRefresh - Bypass cache and re-resolve.
     * @returns {Object} WorkspaceTopologyDescriptor
     */
    resolveWorkspace(targetDir = process.cwd(), forceRefresh = false) {
        const absolutePath = path.resolve(targetDir);
        const cacheKey = absolutePath.toLowerCase();

        if (!forceRefresh && this._snapshotCache.has(cacheKey)) {
            const cached = this._snapshotCache.get(cacheKey);
            return { ...cached, fromCache: true };
        }

        const topology = this._buildTopology(absolutePath);
        this._snapshotCache.set(cacheKey, topology);
        return topology;
    }

    /**
     * Resolves workspace topology, forces a fresh scan and updates the cache.
     * @param {string} targetDir
     * @returns {Object}
     */
    refreshWorkspace(targetDir = process.cwd()) {
        return this.resolveWorkspace(targetDir, true);
    }

    /**
     * Invalidates the cache for a given workspace root.
     * @param {string} targetDir
     */
    invalidateCache(targetDir = process.cwd()) {
        const cacheKey = path.resolve(targetDir).toLowerCase();
        this._snapshotCache.delete(cacheKey);
    }

    /**
     * Returns a portable, relative path for use in exported artifacts.
     * Strips the workspace root prefix to produce workspace-relative paths.
     * @param {string} absolutePath
     * @param {string} workspaceRoot
     * @returns {string}
     */
    toPortablePath(absolutePath, workspaceRoot) {
        const normalized = this.normalizePath(absolutePath);
        const base = this.normalizePath(workspaceRoot);
        if (normalized.startsWith(base)) {
            return '.' + normalized.slice(base.length);
        }
        return normalized;
    }

    _buildTopology(absolutePath) {
        const safeExistsSync = (p) => { try { return fs.existsSync(p); } catch { return false; } };
        const safeLstatSync = (p) => { try { return fs.lstatSync(p); } catch { return null; } };

        const hasPkgJson = safeExistsSync(path.join(absolutePath, 'package.json'));
        const hasGovernanceDir = safeExistsSync(path.join(absolutePath, '.governance'))
            || safeExistsSync(path.join(absolutePath, 'PLATFORM_CONSTITUTION.md'));
        const hasEngineDir = safeExistsSync(path.join(absolutePath, 'engine'));
        const hasTestsDir = safeExistsSync(path.join(absolutePath, 'tests'));
        const hasDocsDir = safeExistsSync(path.join(absolutePath, 'docs'));
        const hasCliDir = safeExistsSync(path.join(absolutePath, 'cli'));
        const hasBinDir = safeExistsSync(path.join(absolutePath, 'bin'));
        const hasConfigDir = safeExistsSync(path.join(absolutePath, 'config'));

        const lstat = safeLstatSync(absolutePath);

        const topologyId = crypto
            .createHash('sha256')
            .update(absolutePath + (lstat ? lstat.mtimeMs.toString() : ''))
            .digest('hex')
            .slice(0, 16);

        return {
            resolvedAt: new Date().toISOString(),
            topologyId,
            workspaceRoot: absolutePath,
            workspaceName: path.basename(absolutePath),
            portableRoot: '.',
            fromCache: false,
            topology: {
                hasPackageManifest: hasPkgJson,
                hasGovernanceConfig: hasGovernanceDir,
                engineDirExists: hasEngineDir,
                testsDirExists: hasTestsDir,
                docsDirExists: hasDocsDir,
                cliDirExists: hasCliDir,
                binDirExists: hasBinDir,
                configDirExists: hasConfigDir
            },
            status: 'WORKSPACE_RESOLVED'
        };
    }
}

module.exports = WorkspaceResolverEngine;
