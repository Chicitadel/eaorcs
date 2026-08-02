/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Release Engineering
 * File           : SbomGenerator.js
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

class SbomGenerator {
  constructor(version, config = {}) {
    this.version = version;
    this.config = config;
  }

  readPackageMetadata(packageJsonPath) {
    if (fs.existsSync(packageJsonPath)) {
      return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    }
    return { name: 'eaorcs', version: this.version, license: 'Commercial' };
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
            const content = fs.readFileSync(fullPath);
            const hash = crypto.createHash('sha256').update(content).digest('hex');
            const name = path.basename(entry.name, path.extname(entry.name));
            components.push({
              filePath: relPath,
              name,
              hash
            });
          }
        }
      }
    };

    walk(rootDir);
    components.sort((a, b) => a.filePath.localeCompare(b.filePath));
    return components;
  }

  buildCycloneDxComponent(filePath, fileHash, packageMeta) {
    const name = path.basename(filePath, path.extname(filePath));
    const relPath = filePath.replace(/\\/g, '/');
    return {
      type: 'library',
      name: name,
      version: packageMeta.version || this.version,
      purl: `pkg:npm/%40eaorcs/${name}@${this.version}`,
      hashes: [{ alg: 'SHA-256', content: fileHash }],
      licenses: [{ license: { name: packageMeta.license || 'Commercial' } }],
      description: `EAORCS component: ${relPath}`
    };
  }

  async generateCycloneDxSbom() {
    const rootDir = this.config.rootDir || path.resolve(__dirname, '..');
    const pkgMeta = this.readPackageMetadata(path.join(rootDir, 'package.json'));
    const components = await this.discoverComponents(rootDir);
    const cdxComponents = components.map(c => this.buildCycloneDxComponent(c.filePath, c.hash, pkgMeta));
    const serialNumber = 'urn:uuid:' + crypto.randomBytes(16).toString('hex').replace(/(\w{8})(\w{4})(\w{4})(\w{4})(\w{12})/, '$1-$2-$3-$4-$5');
    return {
      bomFormat: 'CycloneDX',
      specVersion: '1.4',
      serialNumber,
      version: 1,
      metadata: {
        timestamp: new Date().toISOString(),
        tools: [{ vendor: 'Ujomor Systems', name: 'EAORCS Release Engine', version: this.version }],
        component: { type: 'application', name: pkgMeta.name, version: pkgMeta.version }
      },
      components: cdxComponents,
      dependencies: [{ ref: pkgMeta.name, dependsOn: cdxComponents.map(c => c.purl) }]
    };
  }

  async saveSbom(outputPath, sbom) {
    fs.writeFileSync(outputPath, JSON.stringify(sbom, null, 2), 'utf8');
    return outputPath;
  }
}

module.exports = { SbomGenerator };
