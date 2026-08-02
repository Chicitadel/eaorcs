/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Quality / Security Qualification Engine
 * File           : DependencyAuditor.js
 * Version        : 2026.1.0-LTS
 * Author         : Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
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

class DependencyAuditor {
  auditPackageJson(pkgPath = 'package.json') {
    const fullPath = path.resolve(process.cwd(), pkgPath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`package.json not found at ${fullPath}`);
    }
    const pkg = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    const checks = [
      {
        id: 'DEP-01',
        name: 'Zero production npm dependencies',
        check: () => {
          const deps = Object.keys(pkg.dependencies || {}).length;
          return { pass: deps === 0, detail: `${deps} production dependencies found` };
        }
      },
      {
        id: 'DEP-02',
        name: 'No unsafe script patterns',
        check: () => {
          const scripts = JSON.stringify(pkg.scripts || {});
          const unsafe = ['curl', 'wget', 'bash -c', 'eval', 'exec('].filter(p => scripts.includes(p));
          return { pass: unsafe.length === 0, detail: unsafe.length ? `Found: ${unsafe.join(', ')}` : 'No unsafe patterns' };
        }
      },
      {
        id: 'DEP-03',
        name: 'No wildcard version ranges',
        check: () => {
          const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
          const wildcards = Object.entries(allDeps).filter(([,v]) => v === '*' || v === 'latest');
          return { pass: wildcards.length === 0, detail: wildcards.length ? `Found: ${wildcards.map(([k])=>k).join(', ')}` : 'None' };
        }
      },
      {
        id: 'DEP-04',
        name: 'License field present',
        check: () => ({ pass: !!pkg.license, detail: pkg.license || 'MISSING' })
      },
      {
        id: 'DEP-05',
        name: 'Author field present',
        check: () => ({ pass: !!pkg.author, detail: String(pkg.author || 'MISSING') })
      }
    ];
    return checks.map(c => ({ ...c, result: c.check() }));
  }

  verifySbomIntegrity(sbomPath = 'docs/sbom_2026.1.0-lts.json') {
    const fullPath = path.resolve(process.cwd(), sbomPath);
    if (!fs.existsSync(fullPath)) return { exists: false, valid: false, componentCount: 0, detail: 'SBOM file does not exist' };
    try {
      const sbom = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      const count = (sbom.components || sbom.packages || []).length;
      return { exists: true, valid: true, componentCount: count, detail: `${count} components in SBOM` };
    } catch(e) {
      return { exists: true, valid: false, componentCount: 0, detail: e.message };
    }
  }
}

module.exports = DependencyAuditor;
