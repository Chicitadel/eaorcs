/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : Dynamic Workspace Topology & Canonical Path Resolver
 * File           : WorkspaceResolver.js
 * Version        : 2026.1-LTS (v2.0.0-FROZEN)
 * Author         : Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-07
 * Last Modified  : 2026-08-07
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Enterprise Policy Governed
 * - Zero Hardcoding Enforced
 * - Architecture Frozen (ADR-005)
 * - Security Reviewed
 * - Modularization Enforced
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
const os = require('os');

const ROOT_INDICATORS = Object.freeze([
  'eaorcs.config.yaml',
  'product.manifest.yaml',
  '.governance',
  'package.json',
  '.git'
]);

const DEFAULT_EXCLUDES = Object.freeze([
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  'scratch',
  'integration',
  'tests',
  'tmp',
  '.gemini'
]);

let _cachedTopology = null;

class WorkspaceResolver {
  /**
   * Dynamically resolves the canonical workspace root directory starting from a given directory.
   * Walks up parent directories until a root indicator file/folder is found.
   * @param {string} [startDir] Starting directory (defaults to process.cwd()).
   * @returns {string} Absolute path to workspace root.
   */
  static resolveWorkspaceRoot(startDir = process.cwd()) {
    let current = path.resolve(startDir);
    const root = path.parse(current).root;

    while (current && current !== root) {
      for (const indicator of ROOT_INDICATORS) {
        const candidate = path.join(current, indicator);
        if (fs.existsSync(candidate)) {
          return current;
        }
      }
      current = path.dirname(current);
    }

    return path.resolve(startDir);
  }

  /**
   * Resolves a relative path against the detected workspace root.
   * @param {string} relativePath Relative path snippet.
   * @param {string} [startDir] Starting search directory.
   * @returns {string} Absolute resolved path.
   */
  static resolvePath(relativePath, startDir = process.cwd()) {
    const root = WorkspaceResolver.resolveWorkspaceRoot(startDir);
    return path.resolve(root, relativePath);
  }

  /**
   * Dynamically discovers all products, projects, and packages within the workspace.
   * @param {string} [startDir] Starting search directory.
   * @returns {Array<Object>} List of discovered project descriptors.
   */
  static discoverProjects(startDir = process.cwd()) {
    const workspaceRoot = WorkspaceResolver.resolveWorkspaceRoot(startDir);
    const searchDirs = ['products', 'projects', 'packages', 'services', '.'];
    const discovered = [];
    const seenPaths = new Set();

    for (const subDir of searchDirs) {
      const targetPath = subDir === '.' ? workspaceRoot : path.join(workspaceRoot, subDir);
      if (!fs.existsSync(targetPath)) continue;

      const entries = fs.readdirSync(targetPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = subDir === '.' ? targetPath : path.join(targetPath, entry.name);

        if (seenPaths.has(fullPath)) continue;

        if (entry.isDirectory()) {
          const pkgPath = path.join(fullPath, 'package.json');
          const manifestPath = path.join(fullPath, 'product.manifest.yaml');
          const configPath = path.join(fullPath, 'eaorcs.config.yaml');

          if (fs.existsSync(pkgPath) || fs.existsSync(manifestPath) || fs.existsSync(configPath)) {
            seenPaths.add(fullPath);
            let name = entry.name;
            let version = '1.0.0';
            let category = subDir === '.' ? 'root' : subDir;

            if (fs.existsSync(pkgPath)) {
              try {
                const pkgData = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
                if (pkgData.name) name = pkgData.name;
                if (pkgData.version) version = pkgData.version;
              } catch (_) {
                // Ignore parse errors
              }
            }

            discovered.push({
              name,
              version,
              category,
              path: fullPath,
              relativeFolder: path.relative(workspaceRoot, fullPath),
              hasManifest: fs.existsSync(manifestPath),
              hasConfig: fs.existsSync(configPath)
            });
          }
        }
      }
    }

    return discovered;
  }

  /**
   * Generates or retrieves an immutable, canonical WorkspaceTopology model object.
   * @param {string} [startDir] Starting search directory.
   * @param {boolean} [forceRefresh=false] True to bypass cache.
   * @returns {Object} Immutable WorkspaceTopology model.
   */
  static getWorkspaceTopology(startDir = process.cwd(), forceRefresh = false) {
    if (_cachedTopology && !forceRefresh) {
      return _cachedTopology;
    }

    const workspaceRoot = WorkspaceResolver.resolveWorkspaceRoot(startDir);
    const allDiscovered = WorkspaceResolver.discoverProjects(startDir);

    const foundIndicators = ROOT_INDICATORS.filter(ind =>
      fs.existsSync(path.join(workspaceRoot, ind))
    );

    const topology = {
      workspaceRoot,
      resolvedAt: new Date().toISOString(),
      environment: {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        isCi: !!(process.env.CI || process.env.GITHUB_ACTIONS)
      },
      indicators: Object.freeze(foundIndicators),
      paths: Object.freeze({
        governance: path.join(workspaceRoot, '.governance'),
        docs: path.join(workspaceRoot, 'docs'),
        ciLogs: path.join(workspaceRoot, 'ci', 'logs'),
        evidence: path.join(workspaceRoot, 'evidence'),
        engine: path.join(workspaceRoot, 'engine'),
        adapters: path.join(workspaceRoot, 'adapters'),
        tests: path.join(workspaceRoot, 'tests'),
        release: path.join(workspaceRoot, 'release')
      }),
      discovered: Object.freeze({
        all: Object.freeze(allDiscovered),
        products: Object.freeze(allDiscovered.filter(d => d.category === 'products')),
        projects: Object.freeze(allDiscovered.filter(d => d.category === 'projects')),
        services: Object.freeze(allDiscovered.filter(d => d.category === 'services')),
        packages: Object.freeze(allDiscovered.filter(d => d.category === 'packages')),
        root: Object.freeze(allDiscovered.filter(d => d.category === 'root'))
      }),
      scanners: Object.freeze({
        excludes: DEFAULT_EXCLUDES
      }),
      relationships: Object.freeze({
        crossDomainValidationEnabled: true,
        boundedContextGuardActive: true,
        zeroHardcodingEnforced: true
      })
    };

    _cachedTopology = Object.freeze(topology);
    return _cachedTopology;
  }

  /**
   * Saves the structured WorkspaceTopology model to JSON output.
   * @param {string} [startDir] Starting directory.
   * @param {string} [customPath] Custom output file path.
   * @returns {string} Path to saved topology file.
   */
  static saveTopologyReport(startDir = process.cwd(), customPath = null) {
    const topology = WorkspaceResolver.getWorkspaceTopology(startDir, true);
    const docsDir = topology.paths.docs;

    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }

    const outputPath = customPath ? path.resolve(customPath) : path.join(docsDir, 'workspace_topology.json');
    fs.writeFileSync(outputPath, JSON.stringify(topology, null, 2), 'utf8');
    return outputPath;
  }

  /**
   * Returns default exclusion patterns for scanner engines.
   * @returns {Array<string>} Excludes array.
   */
  static getScannerExcludes() {
    return [...DEFAULT_EXCLUDES];
  }
}

module.exports = WorkspaceResolver;
module.exports.WorkspaceResolver = WorkspaceResolver;
module.exports.DEFAULT_EXCLUDES = DEFAULT_EXCLUDES;
module.exports.ROOT_INDICATORS = ROOT_INDICATORS;
