/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Release Engineering
 * File           : ReleaseCandidate.js
 * Version        : 2026.1-LTS
 * Author         : Enterprise Architecture Authority & Systems Engineering
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
const crypto = require('crypto');

class ReleaseCandidate {
  constructor(version, config = {}) {
    this.version = version;
    this.config = config;
    this.buildTimestamp = new Date().toISOString();
    this.buildId = `BUILD-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  }

  async discoverComponents(rootDir) {
    const components = [];
    const skipDirs = new Set(['node_modules', '.git', 'tests', 'release', 'scratch', 'storage', 'audits', 'history', 'bundles', 'current', 'docs']);

    const walk = (dir) => {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (!skipDirs.has(entry.name)) {
            walk(fullPath);
          }
        } else if (entry.isFile()) {
          if (/\.(js|cjs)$/.test(entry.name)) {
            const relPath = path.relative(rootDir, fullPath).replace(/\\/g, '/');
            const stats = fs.statSync(fullPath);
            components.push({
              path: relPath,
              size: stats.size,
              lastModified: stats.mtime.toISOString()
            });
          }
        }
      }
    };

    walk(rootDir);
    components.sort((a, b) => a.path.localeCompare(b.path));
    return components;
  }

  async hashComponents(components) {
    const rootDir = this.config.rootDir || path.resolve(__dirname, '..');
    const hashed = [];
    for (const comp of components) {
      const fullPath = path.join(rootDir, comp.path);
      const content = fs.readFileSync(fullPath);
      const hash = crypto.createHash('sha256').update(content).digest('hex');
      hashed.push({
        ...comp,
        hash
      });
    }
    return hashed;
  }

  computeReleaseHash(hashedComponents) {
    const sorted = [...hashedComponents].sort((a, b) => a.path.localeCompare(b.path));
    const concatHashes = sorted.map(c => c.hash).join('');
    return crypto.createHash('sha256').update(concatHashes).digest('hex');
  }

  async generateManifest() {
    const rootDir = this.config.rootDir || path.resolve(__dirname, '..');
    const components = await this.discoverComponents(rootDir);
    const hashed = await this.hashComponents(components);
    const releaseHash = this.computeReleaseHash(hashed);
    return {
      version: this.version,
      buildId: this.buildId,
      buildTimestamp: this.buildTimestamp,
      releaseType: 'LTS',
      componentCount: hashed.length,
      components: hashed,
      releaseHash,
      platform: { minNodeVersion: '18.0.0', supportedEnvironments: ['SharedHost','VPS','Docker','Kubernetes','Cloud_AWS','Cloud_Azure','Cloud_GCP','AirGapped'] },
      editions: ['Community','Pro','Business','Enterprise','Sovereign'],
      changeSummary: `EAORCS ${this.version} LTS — Full platform release with Trust Fabric, OSAP, UTCF, AI Council, Marketplace, SaaS, and Release Engineering.`
    };
  }

  async saveManifest(outputPath, manifest) {
    fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2), 'utf8');
    return outputPath;
  }
}

module.exports = { ReleaseCandidate };
