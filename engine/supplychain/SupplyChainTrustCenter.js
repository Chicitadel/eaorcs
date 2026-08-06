/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Supply Chain Trust Center
 * File           : SupplyChainTrustCenter.js
 * Version        : 2026.3.0-RC1
 * Author         : Supply Chain Security & Platform Assurance Authority
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Architecture Authority Approved — ENHANCEMENT (Foundation-Locked)
 * - Surfaces existing SBOM/supply chain signals into an executive-facing workspace
 *
 * Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const crypto = require('crypto');

const SLSA_LEVELS = Object.freeze({ 0: 'NONE', 1: 'BASIC', 2: 'SCRIPTED', 3: 'HERMETIC', 4: 'REPRODUCIBLE' });
const LICENSE_TYPES = Object.freeze({ PERMISSIVE: 'PERMISSIVE', COPYLEFT: 'COPYLEFT', PROPRIETARY: 'PROPRIETARY', UNKNOWN: 'UNKNOWN' });
const CVE_SEVERITY = Object.freeze({ CRITICAL: 9.0, HIGH: 7.0, MEDIUM: 4.0, LOW: 0.1 });

/**
 * SupplyChainTrustCenter
 *
 * First-class executive-facing supply chain workspace.
 * Consolidates dependency provenance, SBOM quality, signing status,
 * SLSA level, package freshness, license obligations, CVE exposure,
 * and remediation recommendations into one auditable surface.
 */
class SupplyChainTrustCenter {
  constructor(options = {}) {
    this.options = options;
    this._components = new Map();  // componentId -> Component record
    this._cveRegistry = new Map(); // cveId -> CVE record
  }

  /**
   * Registers a software component for supply chain tracking.
   * @param {object} component - Component descriptor
   */
  registerComponent(component) {
    const required = ['name', 'version', 'type'];
    for (const f of required) {
      if (!component[f]) throw new Error(`SupplyChainTrustCenter: '${f}' is required.`);
    }

    const id = `comp-${crypto.createHash('sha256').update(`${component.name}:${component.version}`).digest('hex').slice(0, 12)}`;
    const record = {
      id,
      name:           component.name,
      version:        component.version,
      type:           component.type,         // direct | transitive | dev | peer
      registry:       component.registry || 'npm',
      license:        component.license || 'UNKNOWN',
      licenseType:    this._classifyLicense(component.license || 'UNKNOWN'),
      isSigned:       component.isSigned !== undefined ? component.isSigned : false,
      signatureValid: component.signatureValid !== undefined ? component.signatureValid : false,
      slsaLevel:      component.slsaLevel !== undefined ? component.slsaLevel : 0,
      publishedAt:    component.publishedAt || null,
      isEOL:          component.isEOL || false,
      isAbandoned:    component.isAbandoned || false,  // No release in 24+ months
      provenance:     component.provenance || null,
      sha256:         component.sha256 || null,
      cves:           [],
      registeredAt:   new Date().toISOString(),
    };

    record.freshnessScore = this._computeFreshness(record);
    this._components.set(id, record);
    return { ...record };
  }

  /**
   * Records a CVE against a registered component.
   */
  recordCVE(componentId, cve) {
    const component = this._getComponent(componentId);
    if (!cve.cveId || !cve.cvssScore) throw new Error('SupplyChainTrustCenter: cveId and cvssScore are required.');

    const record = {
      cveId:         cve.cveId,
      cvssScore:     cve.cvssScore,
      severity:      cve.cvssScore >= 9.0 ? 'CRITICAL' : cve.cvssScore >= 7.0 ? 'HIGH' : cve.cvssScore >= 4.0 ? 'MEDIUM' : 'LOW',
      description:   cve.description || '',
      patchVersion:  cve.patchVersion || null,
      publishedAt:   cve.publishedAt || new Date().toISOString(),
      componentId,
      componentName: component.name,
      componentVersion: component.version,
    };

    this._cveRegistry.set(cve.cveId, record);
    component.cves.push(cve.cveId);
    return record;
  }

  /**
   * Computes the overall SBOM quality score for a tenant.
   * Measures completeness, accuracy, signing coverage, and SLSA coverage.
   * @returns {object} SBOM quality assessment
   */
  getSBOMQualityScore() {
    const components = [...this._components.values()];
    if (components.length === 0) return { score: 0, grade: 'F', assessedComponents: 0 };

    const total = components.length;
    const signed = components.filter(c => c.isSigned && c.signatureValid).length;
    const hasProvenance = components.filter(c => !!c.provenance).length;
    const hasLicense = components.filter(c => c.license && c.license !== 'UNKNOWN').length;
    const hasSha = components.filter(c => !!c.sha256).length;
    const slsaL3Plus = components.filter(c => c.slsaLevel >= 3).length;

    const completeness = Math.round(((hasLicense + hasSha + hasProvenance) / (total * 3)) * 100);
    const signingCoverage = Math.round((signed / total) * 100);
    const slsaCoverage = Math.round((slsaL3Plus / total) * 100);

    const score = Math.round((completeness * 0.4) + (signingCoverage * 0.4) + (slsaCoverage * 0.2));
    const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';

    return { score, grade, assessedComponents: total, completeness, signingCoverage, slsaCoverage };
  }

  /**
   * Returns a complete supply chain trust dashboard.
   * Executive-facing consolidated view of all supply chain signals.
   */
  getDashboard() {
    const components = [...this._components.values()];
    const cves = [...this._cveRegistry.values()];

    // CVE exposure
    const criticalCVEs = cves.filter(c => c.severity === 'CRITICAL');
    const highCVEs = cves.filter(c => c.severity === 'HIGH');

    // Signing status
    const signed = components.filter(c => c.isSigned && c.signatureValid).length;
    const unsigned = components.filter(c => !c.isSigned).length;
    const expiredSignature = components.filter(c => c.isSigned && !c.signatureValid).length;

    // License obligations
    const licenseBreakdown = { PERMISSIVE: 0, COPYLEFT: 0, PROPRIETARY: 0, UNKNOWN: 0 };
    for (const c of components) licenseBreakdown[c.licenseType]++;

    // Package health
    const eolComponents = components.filter(c => c.isEOL);
    const abandonedComponents = components.filter(c => c.isAbandoned);

    // SLSA distribution
    const slsaDistribution = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    for (const c of components) slsaDistribution[c.slsaLevel]++;

    // Remediation recommendations (ranked by risk)
    const recommendations = this._generateRemediation(components, criticalCVEs, eolComponents, abandonedComponents);

    return {
      generatedAt: new Date().toISOString(),
      totalComponents: components.length,
      sbomQuality: this.getSBOMQualityScore(),
      cveExposure: {
        total: cves.length,
        critical: criticalCVEs.length,
        high: highCVEs.length,
        medium: cves.filter(c => c.severity === 'MEDIUM').length,
        low: cves.filter(c => c.severity === 'LOW').length,
        criticalDetails: criticalCVEs,
      },
      signingStatus: { signed, unsigned, expiredSignature },
      slsaDistribution,
      licenseObligations: licenseBreakdown,
      packageHealth: {
        eolCount: eolComponents.length,
        abandonedCount: abandonedComponents.length,
        eolComponents: eolComponents.map(c => ({ name: c.name, version: c.version })),
      },
      recommendations,
    };
  }

  /**
   * Returns the freshness report — stale and EOL package overview.
   */
  getFreshnessReport() {
    return [...this._components.values()].map(c => ({
      id: c.id,
      name: c.name,
      version: c.version,
      publishedAt: c.publishedAt,
      freshnessScore: c.freshnessScore,
      isEOL: c.isEOL,
      isAbandoned: c.isAbandoned,
      freshnessLabel: c.freshnessScore >= 80 ? 'FRESH' : c.freshnessScore >= 50 ? 'AGING' : 'STALE',
    })).sort((a, b) => a.freshnessScore - b.freshnessScore);
  }

  getEngineStatus() {
    return { initialized: true, totalComponents: this._components.size, totalCVEs: this._cveRegistry.size };
  }

  _classifyLicense(license) {
    if (!license || license === 'UNKNOWN') return LICENSE_TYPES.UNKNOWN;
    const l = license.toUpperCase();
    if (/GPL|LGPL|AGPL|MPL|EUPL|CDDL/.test(l)) return LICENSE_TYPES.COPYLEFT;
    if (/COMMERCIAL|PROPRIETARY|EULA/.test(l)) return LICENSE_TYPES.PROPRIETARY;
    return LICENSE_TYPES.PERMISSIVE;
  }

  _computeFreshness(record) {
    if (!record.publishedAt) return 50;
    const ageMs = Date.now() - new Date(record.publishedAt).getTime();
    const ageDays = ageMs / (86400 * 1000);
    if (record.isEOL || record.isAbandoned) return 10;
    if (ageDays <= 90) return 100;
    if (ageDays <= 180) return 85;
    if (ageDays <= 365) return 70;
    if (ageDays <= 730) return 50;
    return 20;
  }

  _generateRemediation(components, criticalCVEs, eolComponents, abandonedComponents) {
    const recs = [];
    if (criticalCVEs.length > 0) {
      recs.push({
        priority: 1,
        severity: 'CRITICAL',
        action: `Patch or replace ${criticalCVEs.length} component(s) with critical CVEs immediately.`,
        affectedComponents: criticalCVEs.map(c => `${c.componentName}@${c.componentVersion}`),
      });
    }
    if (eolComponents.length > 0) {
      recs.push({
        priority: 2,
        severity: 'HIGH',
        action: `Upgrade ${eolComponents.length} end-of-life component(s) to supported versions.`,
        affectedComponents: eolComponents.map(c => `${c.name}@${c.version}`),
      });
    }
    if (abandonedComponents.length > 0) {
      recs.push({
        priority: 3,
        severity: 'MEDIUM',
        action: `Evaluate ${abandonedComponents.length} abandoned component(s) for replacement.`,
        affectedComponents: abandonedComponents.map(c => `${c.name}@${c.version}`),
      });
    }
    const unsignedCount = components.filter(c => !c.isSigned).length;
    if (unsignedCount > 0) {
      recs.push({
        priority: 4,
        severity: 'MEDIUM',
        action: `Enforce signing for ${unsignedCount} unsigned component(s) to improve supply chain integrity.`,
      });
    }
    return recs;
  }

  _getComponent(id) {
    const c = this._components.get(id);
    if (!c) throw new Error(`SupplyChainTrustCenter: Component '${id}' not found.`);
    return c;
  }
}

module.exports = SupplyChainTrustCenter;
module.exports.SupplyChainTrustCenter = SupplyChainTrustCenter;
