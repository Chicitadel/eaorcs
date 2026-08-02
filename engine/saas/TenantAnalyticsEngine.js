/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS SaaS Product Analytics & Operational Metrics Engine (Stream 6)
 * File           : engine/saas/TenantAnalyticsEngine.js
 * Version        : 2026.1-LTS
 * Author         : Ujomor Systems Engineering & Governance Authority
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
 * - Corporate Policy Governed
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 * - OSAP v1.1 / v2.0
 *
 * Signatures:
 * - Enterprise Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

/**
 * Operational Maturity Levels (Levels 1 to 5)
 */
const MATURITY_LEVELS = Object.freeze({
  LEVEL_1: {
    level: 1,
    key: 'INITIAL',
    name: 'Initial / Reactive',
    description: 'Ad-hoc compliance scanning, high manual overhead, reactive vulnerability patching.'
  },
  LEVEL_2: {
    level: 2,
    key: 'MANAGED',
    name: 'Managed / Repeatable',
    description: 'Standard policy baseline, basic automated CI scanning, scheduled compliance reporting.'
  },
  LEVEL_3: {
    level: 3,
    key: 'DEFINED',
    name: 'Defined / Standardized',
    description: 'Enforced architecture & security gates, integrated OSAP/W3C DIDs, automated evidence logging.'
  },
  LEVEL_4: {
    level: 4,
    key: 'QUANTITATIVELY_MANAGED',
    name: 'Quantitatively Managed / Data-Driven',
    description: 'Real-time telemetry, automated drift detection, predictable SLAs, zero-trust enforcement.'
  },
  LEVEL_5: {
    level: 5,
    key: 'OPTIMIZING',
    name: 'Optimizing / Autonomous',
    description: 'Autonomous self-healing compliance, continuous policy updates, zero-touch governance.'
  }
});

/**
 * Compliance Grade Mapping Helper
 * @param {number} score (0 - 100)
 * @returns {string} Grade ('A+', 'A', 'B', 'C', 'D', 'F')
 */
function calculateComplianceGrade(score) {
  const s = Math.max(0, Math.min(100, Number(score) || 0));
  if (s >= 95) return 'A+';
  if (s >= 90) return 'A';
  if (s >= 80) return 'B';
  if (s >= 70) return 'C';
  if (s >= 60) return 'D';
  return 'F';
}

/**
 * TenantAnalyticsEngine
 * Aggregates multi-tenant compliance metrics, tracks adoption telemetry, evaluates 5-level operational maturity,
 * forecasts adoption velocity/churn, and generates executive/operational dashboard reports.
 */
class TenantAnalyticsEngine {
  /**
   * @param {Object} options 
   * @param {Object} [options.tenantManager] Optional instance of TenantManager
   * @param {number} [options.maxHistoryPerTenant=1000] Maximum historical entries retained per tenant
   */
  constructor(options = {}) {
    this.tenantManager = options.tenantManager || null;
    this.maxHistoryPerTenant = options.maxHistoryPerTenant || 1000;

    /** @type {Map<string, Array<Object>>} */
    this.telemetryStore = new Map();

    /** @type {Map<string, Array<Object>>} */
    this.complianceStore = new Map();

    /** @type {Map<string, Object>} */
    this.tenantProfiles = new Map();
  }

  // =========================================================================
  // 1. TENANT PROFILE & INGESTION MANAGEMENT
  // =========================================================================

  /**
   * Registers or updates a tenant profile within the analytics engine.
   * @param {string} tenantId 
   * @param {Object} profile 
   * @returns {Object} Updated profile
   */
  registerTenantProfile(tenantId, profile = {}) {
    if (!tenantId || typeof tenantId !== 'string') {
      throw new Error('Tenant profile registration requires a valid tenantId string');
    }

    const existing = this.tenantProfiles.get(tenantId) || {
      tenantId,
      name: tenantId,
      tier: 'Enterprise',
      industry: 'Technology',
      registeredAt: new Date().toISOString()
    };

    const updated = {
      ...existing,
      ...profile,
      tenantId,
      updatedAt: new Date().toISOString()
    };

    this.tenantProfiles.set(tenantId, updated);
    if (!this.telemetryStore.has(tenantId)) this.telemetryStore.set(tenantId, []);
    if (!this.complianceStore.has(tenantId)) this.complianceStore.set(tenantId, []);

    return updated;
  }

  /**
   * Ingests a raw telemetry event for a tenant.
   * @param {string} tenantId 
   * @param {Object} eventData 
   * @returns {Object} Ingested event record
   */
  ingestTelemetry(tenantId, eventData = {}) {
    if (!tenantId) throw new Error('ingestTelemetry requires tenantId');
    if (!this.tenantProfiles.has(tenantId)) {
      this.registerTenantProfile(tenantId);
    }

    const eventRecord = {
      eventId: eventData.eventId || `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      eventType: eventData.eventType || 'USER_ACTION',
      timestamp: eventData.timestamp || new Date().toISOString(),
      userId: eventData.userId || 'usr_anonymous',
      featureId: eventData.featureId || 'core_dashboard',
      durationMs: Number(eventData.durationMs) || 0,
      status: eventData.status || 'SUCCESS',
      metadata: eventData.metadata || {}
    };

    const store = this.telemetryStore.get(tenantId);
    store.push(eventRecord);

    if (store.length > this.maxHistoryPerTenant) {
      store.shift();
    }

    return eventRecord;
  }

  /**
   * Ingests compliance scan results / audit evaluation for a tenant.
   * @param {string} tenantId 
   * @param {Object} scanData 
   * @returns {Object} Ingested compliance record
   */
  ingestComplianceMetrics(tenantId, scanData = {}) {
    if (!tenantId) throw new Error('ingestComplianceMetrics requires tenantId');
    if (!this.tenantProfiles.has(tenantId)) {
      this.registerTenantProfile(tenantId);
    }

    const controlsTotal = Number(scanData.controlsTotal) || 100;
    const controlsPassed = Number(scanData.controlsPassed) || 0;
    const controlsFailed = Number(scanData.controlsFailed) || Math.max(0, controlsTotal - controlsPassed);
    const score = scanData.score !== undefined ? Number(scanData.score) : Math.round((controlsPassed / (controlsTotal || 1)) * 100);

    const record = {
      scanId: scanData.scanId || `scan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: scanData.timestamp || new Date().toISOString(),
      score: Math.max(0, Math.min(100, score)),
      controlsTotal,
      controlsPassed,
      controlsFailed,
      frameworks: scanData.frameworks || {
        ISO_27001: { passed: Math.round(controlsPassed * 0.25), total: Math.round(controlsTotal * 0.25) },
        SOC_2: { passed: Math.round(controlsPassed * 0.25), total: Math.round(controlsTotal * 0.25) },
        OWASP_ASVS: { passed: Math.round(controlsPassed * 0.25), total: Math.round(controlsTotal * 0.25) },
        NIST: { passed: Math.round(controlsPassed * 0.25), total: Math.round(controlsTotal * 0.25) }
      },
      vulnerabilities: scanData.vulnerabilities || {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      },
      evidenceCount: Number(scanData.evidenceCount) || 0,
      automationRate: Math.max(0, Math.min(100, Number(scanData.automationRate) || 85)),
      mttrHours: Number(scanData.mttrHours) || 24
    };

    const store = this.complianceStore.get(tenantId);
    store.push(record);

    if (store.length > this.maxHistoryPerTenant) {
      store.shift();
    }

    return record;
  }

  // =========================================================================
  // 2. MULTI-TENANT COMPLIANCE METRICS AGGREGATOR
  // =========================================================================

  /**
   * Aggregates compliance metrics across a specific tenant or globally across all tenants.
   * @param {string|null} [targetTenantId=null] If null or 'GLOBAL', aggregates all tenants.
   * @param {Object} [filterOptions={}] 
   * @returns {Object} Aggregated compliance metrics report
   */
  aggregateComplianceMetrics(targetTenantId = null, filterOptions = {}) {
    const isGlobal = !targetTenantId || targetTenantId === 'GLOBAL';
    const tenantIds = isGlobal ? Array.from(this.complianceStore.keys()) : [targetTenantId];

    let totalScans = 0;
    let sumScore = 0;
    let totalControls = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    let totalEvidence = 0;
    let sumAutomation = 0;
    let sumMttr = 0;

    const vulnerabilities = { critical: 0, high: 0, medium: 0, low: 0 };
    const frameworkTotals = {};
    const tenantBreakdowns = [];

    for (const tid of tenantIds) {
      const records = this.complianceStore.get(tid) || [];
      if (records.length === 0) continue;

      let tenantSumScore = 0;
      let tenantControlsTotal = 0;
      let tenantControlsPassed = 0;
      let tenantControlsFailed = 0;

      for (const rec of records) {
        totalScans++;
        sumScore += rec.score;
        totalControls += rec.controlsTotal;
        totalPassed += rec.controlsPassed;
        totalFailed += rec.controlsFailed;
        totalEvidence += rec.evidenceCount;
        sumAutomation += rec.automationRate;
        sumMttr += rec.mttrHours;

        tenantSumScore += rec.score;
        tenantControlsTotal += rec.controlsTotal;
        tenantControlsPassed += rec.controlsPassed;
        tenantControlsFailed += rec.controlsFailed;

        // Vulnerability accumulator
        vulnerabilities.critical += rec.vulnerabilities.critical || 0;
        vulnerabilities.high += rec.vulnerabilities.high || 0;
        vulnerabilities.medium += rec.vulnerabilities.medium || 0;
        vulnerabilities.low += rec.vulnerabilities.low || 0;

        // Framework accumulator
        if (rec.frameworks) {
          for (const [fwKey, fwVal] of Object.entries(rec.frameworks)) {
            if (!frameworkTotals[fwKey]) {
              frameworkTotals[fwKey] = { passed: 0, total: 0 };
            }
            frameworkTotals[fwKey].passed += fwVal.passed || 0;
            frameworkTotals[fwKey].total += fwVal.total || 0;
          }
        }
      }

      const avgTenantScore = Math.round((tenantSumScore / records.length) * 100) / 100;
      tenantBreakdowns.push({
        tenantId: tid,
        scansCount: records.length,
        averageScore: avgTenantScore,
        grade: calculateComplianceGrade(avgTenantScore),
        controlsPassed: tenantControlsPassed,
        controlsTotal: tenantControlsTotal,
        passRate: tenantControlsTotal > 0 ? Math.round((tenantControlsPassed / tenantControlsTotal) * 10000) / 100 : 0
      });
    }

    const averageComplianceScore = totalScans > 0 ? Math.round((sumScore / totalScans) * 100) / 100 : 0;
    const overallPassRate = totalControls > 0 ? Math.round((totalPassed / totalControls) * 10000) / 100 : 0;

    // Framework breakdown percentage computation
    const frameworkBreakdown = {};
    for (const [fwKey, fwVal] of Object.entries(frameworkTotals)) {
      const passRate = fwVal.total > 0 ? Math.round((fwVal.passed / fwVal.total) * 10000) / 100 : 0;
      frameworkBreakdown[fwKey] = {
        passed: fwVal.passed,
        total: fwVal.total,
        passRate,
        status: passRate >= 90 ? 'COMPLIANT' : passRate >= 75 ? 'PARTIALLY_COMPLIANT' : 'NON_COMPLIANT'
      };
    }

    return {
      scope: isGlobal ? 'GLOBAL' : targetTenantId,
      tenantsCount: tenantIds.length,
      totalScansEvaluated: totalScans,
      averageComplianceScore,
      complianceGrade: calculateComplianceGrade(averageComplianceScore),
      overallPassRate,
      controlsSummary: {
        total: totalControls,
        passed: totalPassed,
        failed: totalFailed
      },
      vulnerabilitySummary: vulnerabilities,
      frameworkBreakdown,
      evidenceLineageTotal: totalEvidence,
      averageAutomationRate: totalScans > 0 ? Math.round((sumAutomation / totalScans) * 100) / 100 : 0,
      averageMttrHours: totalScans > 0 ? Math.round((sumMttr / totalScans) * 100) / 100 : 0,
      tenantBreakdowns
    };
  }

  // =========================================================================
  // 3. TENANT ADOPTION TELEMETRIST & VELOCITY FORECASTING
  // =========================================================================

  /**
   * Evaluates tenant adoption telemetry and activity breadth.
   * @param {string} tenantId 
   * @param {Object} [options={}] 
   * @returns {Object} Adoption telemetry assessment
   */
  evaluateAdoption(tenantId, options = {}) {
    if (!tenantId) throw new Error('evaluateAdoption requires tenantId');
    const events = this.telemetryStore.get(tenantId) || [];

    const uniqueUsers = new Set();
    const uniqueFeatures = new Set();
    let totalDurationMs = 0;

    const now = Date.now();
    const dayMs = 86400000;
    const dauUsers = new Set();
    const mauUsers = new Set();

    for (const evt of events) {
      const evtTime = new Date(evt.timestamp).getTime();
      const ageMs = now - evtTime;

      uniqueUsers.add(evt.userId);
      uniqueFeatures.add(evt.featureId);
      totalDurationMs += evt.durationMs || 0;

      if (ageMs <= dayMs) {
        dauUsers.add(evt.userId);
      }
      if (ageMs <= 30 * dayMs) {
        mauUsers.add(evt.userId);
      }
    }

    const dau = dauUsers.size;
    const mau = mauUsers.size || uniqueUsers.size || 1;
    const dauMauRatio = Math.round((dau / mau) * 10000) / 100;

    // Feature breadth & velocity score
    const featureCount = uniqueFeatures.size;
    const eventCount = events.length;
    const featureAdoptionVelocity = Math.round((featureCount * 10 + Math.min(eventCount, 500) * 0.1) * 100) / 100;

    // Weighted adoption score (0 - 100)
    const userEngagementScore = Math.min(100, (mau * 10) + (dauMauRatio * 0.5));
    const featureBreadthScore = Math.min(100, featureCount * 12.5);
    const activityVolumeScore = Math.min(100, eventCount * 0.5);

    const adoptionScore = Math.round(
      (userEngagementScore * 0.4) + (featureBreadthScore * 0.4) + (activityVolumeScore * 0.2)
    );

    return {
      tenantId,
      totalEvents: eventCount,
      uniqueUsersCount: uniqueUsers.size,
      dau,
      mau,
      dauMauRatio,
      featuresUsedCount: featureCount,
      featuresUsedList: Array.from(uniqueFeatures),
      totalDurationMs,
      featureAdoptionVelocity,
      adoptionScore: Math.max(0, Math.min(100, adoptionScore)),
      engagementTier: adoptionScore >= 80 ? 'HIGH' : adoptionScore >= 50 ? 'MEDIUM' : 'LOW'
    };
  }

  /**
   * Forecasts tenant adoption velocity, projected usage growth, and retention/churn risk.
   * @param {string} tenantId 
   * @param {Object} [options={}] 
   * @returns {Object} Forecast & retention risk evaluation
   */
  forecastAdoptionVelocity(tenantId, options = {}) {
    if (!tenantId) throw new Error('forecastAdoptionVelocity requires tenantId');
    const adoption = this.evaluateAdoption(tenantId, options);
    const events = this.telemetryStore.get(tenantId) || [];
    const complianceRecs = this.complianceStore.get(tenantId) || [];

    // Calculate event velocity growth rate comparing recent events vs older events
    const now = Date.now();
    const halfWindowMs = 15 * 86400000;

    let recentEventsCount = 0;
    let olderEventsCount = 0;

    for (const evt of events) {
      const ageMs = now - new Date(evt.timestamp).getTime();
      if (ageMs <= halfWindowMs) {
        recentEventsCount++;
      } else if (ageMs <= 30 * 86400000) {
        olderEventsCount++;
      }
    }

    let growthRate = 0;
    if (olderEventsCount > 0) {
      growthRate = Math.round(((recentEventsCount - olderEventsCount) / olderEventsCount) * 10000) / 100;
    } else if (recentEventsCount > 0) {
      growthRate = 25.0; // Default healthy baseline growth rate for new active tenant
    }

    // Velocity Score (0 - 100)
    const velocityScore = Math.min(100, Math.max(0, Math.round(50 + growthRate)));

    // Growth projections
    const currentUsers = adoption.mau || 1;
    const projected30DayUsers = Math.max(1, Math.round(currentUsers * (1 + growthRate / 100)));
    const projected60DayUsers = Math.max(1, Math.round(currentUsers * (1 + (growthRate / 100) * 1.8)));
    const projected90DayUsers = Math.max(1, Math.round(currentUsers * (1 + (growthRate / 100) * 2.5)));

    const currentScanVol = complianceRecs.length;
    const projected30DayScanVolume = Math.max(1, Math.round(currentScanVol * (1 + Math.max(-0.2, growthRate / 100))));

    // Retention & Churn Risk calculation
    const riskFactors = [];
    let churnScore = 0;

    if (adoption.dauMauRatio < 10) {
      churnScore += 35;
      riskFactors.push('Low daily active user engagement (DAU/MAU < 10%)');
    }
    if (growthRate < -15) {
      churnScore += 30;
      riskFactors.push(`Declining activity velocity (${growthRate}% growth)`);
    }
    if (adoption.featuresUsedCount <= 2) {
      churnScore += 25;
      riskFactors.push('Low feature adoption breadth (2 or fewer features utilized)');
    }
    if (complianceRecs.length === 0) {
      churnScore += 20;
      riskFactors.push('No compliance scans executed yet');
    }

    const churnProbability = Math.round((Math.min(100, churnScore) / 100) * 100) / 100;
    const riskLevel = churnProbability >= 0.6 ? 'HIGH' : churnProbability >= 0.3 ? 'MEDIUM' : 'LOW';

    const recommendations = [];
    if (riskLevel === 'HIGH') {
      recommendations.push('Trigger customer success onboarding intervention.');
      recommendations.push('Provide automated policy template setup guide.');
    } else if (riskLevel === 'MEDIUM') {
      recommendations.push('Recommend expanding feature adoption to OSAP evidence logging.');
    } else {
      recommendations.push('Maintain current operational cadence and propose autonomous CI/CD integration.');
    }

    return {
      tenantId,
      adoptionScore: adoption.adoptionScore,
      velocityScore,
      historicalGrowthRate: growthRate,
      projections: {
        users30Day: projected30DayUsers,
        users60Day: projected60DayUsers,
        users90Day: projected90DayUsers,
        scanVolume30Day: projected30DayScanVolume
      },
      retentionRisk: {
        riskLevel,
        churnProbability,
        riskFactors,
        recommendations
      }
    };
  }

  // =========================================================================
  // 4. OPERATIONAL MATURITY EVALUATOR (LEVELS 1 - 5)
  // =========================================================================

  /**
   * Evaluates the 5-level operational maturity for a tenant.
   * @param {string} tenantId 
   * @returns {Object} Operational maturity evaluation report
   */
  evaluateOperationalMaturity(tenantId) {
    if (!tenantId) throw new Error('evaluateOperationalMaturity requires tenantId');
    const compAgg = this.aggregateComplianceMetrics(tenantId);
    const adoption = this.evaluateAdoption(tenantId);

    const compScore = compAgg.averageComplianceScore || 0;
    const autoScore = compAgg.averageAutomationRate || 0;
    const adoptScore = adoption.adoptionScore || 0;
    const evidenceScore = Math.min(100, compAgg.evidenceLineageTotal * 5);
    const mttrScore = Math.max(0, 100 - (compAgg.averageMttrHours * 2));

    // Calculate sub-scores (0 - 100)
    const subScores = {
      compliance: Math.round(compScore),
      automation: Math.round(autoScore),
      adoption: Math.round(adoptScore),
      governanceAndEvidence: Math.round(evidenceScore),
      operationalSla: Math.round(mttrScore)
    };

    // Overall weighted score (0 - 100)
    const weightedScore = Math.round(
      (subScores.compliance * 0.30) +
      (subScores.automation * 0.25) +
      (subScores.governanceAndEvidence * 0.20) +
      (subScores.adoption * 0.15) +
      (subScores.operationalSla * 0.10)
    );

    // Convert to 1.00 - 5.00 level score
    const exactMaturityScore = Math.round((1 + (weightedScore / 100) * 4) * 100) / 100;

    let maturityObj;
    if (exactMaturityScore >= 4.5) {
      maturityObj = MATURITY_LEVELS.LEVEL_5;
    } else if (exactMaturityScore >= 3.8) {
      maturityObj = MATURITY_LEVELS.LEVEL_4;
    } else if (exactMaturityScore >= 3.0) {
      maturityObj = MATURITY_LEVELS.LEVEL_3;
    } else if (exactMaturityScore >= 2.0) {
      maturityObj = MATURITY_LEVELS.LEVEL_2;
    } else {
      maturityObj = MATURITY_LEVELS.LEVEL_1;
    }

    const strengths = [];
    const gaps = [];
    const recommendations = [];

    if (subScores.compliance >= 85) strengths.push('High compliance pass rate across active frameworks');
    else gaps.push('Compliance pass rate below 85% benchmark');

    if (subScores.automation >= 80) strengths.push('Extensive automation rate in scan execution');
    else gaps.push('Low automation rate — reliance on manual scanning');

    if (subScores.governanceAndEvidence >= 75) strengths.push('Strong evidence lineage and audit logging');
    else gaps.push('Insufficient evidence logging for audit traceability');

    if (maturityObj.level < 5) {
      recommendations.push(`Next level target: [Level ${maturityObj.level + 1}]. Focus on closing identified gaps.`);
    } else {
      recommendations.push('Sustain autonomous Level 5 optimization and zero-touch compliance.');
    }

    return {
      tenantId,
      maturityLevel: maturityObj.level,
      levelKey: maturityObj.key,
      levelName: maturityObj.name,
      description: maturityObj.description,
      maturityScore: exactMaturityScore,
      weightedScore,
      subScores,
      strengths,
      gaps,
      recommendations
    };
  }

  // =========================================================================
  // 5. COMPLIANCE SCORE DASHBOARD REPORTER & EXPORTS
  // =========================================================================

  /**
   * Generates a comprehensive operational & compliance dashboard report.
   * @param {Object} [options={}] 
   * @returns {Object} Dashboard payload
   */
  generateDashboard(options = {}) {
    const globalAgg = this.aggregateComplianceMetrics(null);
    const tenantIds = Array.from(this.tenantProfiles.keys());

    const tenantMetrics = [];
    const maturityDistribution = {
      level1: 0,
      level2: 0,
      level3: 0,
      level4: 0,
      level5: 0
    };

    let totalMaturitySum = 0;
    const highRiskTenants = [];

    for (const tid of tenantIds) {
      const mat = this.evaluateOperationalMaturity(tid);
      const forecast = this.forecastAdoptionVelocity(tid);
      const profile = this.tenantProfiles.get(tid);

      totalMaturitySum += mat.maturityScore;
      maturityDistribution[`level${mat.maturityLevel}`]++;

      if (forecast.retentionRisk.riskLevel === 'HIGH') {
        highRiskTenants.push(tid);
      }

      tenantMetrics.push({
        tenantId: tid,
        name: profile ? profile.name : tid,
        tier: profile ? profile.tier : 'Enterprise',
        complianceScore: mat.subScores.compliance,
        grade: calculateComplianceGrade(mat.subScores.compliance),
        maturityLevel: mat.maturityLevel,
        maturityName: mat.levelName,
        adoptionScore: forecast.adoptionScore,
        retentionRisk: forecast.retentionRisk.riskLevel,
        churnProbability: forecast.retentionRisk.churnProbability
      });
    }

    const avgPlatformMaturity = tenantIds.length > 0
      ? Math.round((totalMaturitySum / tenantIds.length) * 100) / 100
      : 1.0;

    return {
      title: 'EAORCS Product Analytics & Operational Metrics Dashboard',
      generatedAt: new Date().toISOString(),
      summary: {
        totalTenants: tenantIds.length,
        activeTenants: tenantIds.length,
        globalComplianceScore: globalAgg.averageComplianceScore,
        platformComplianceGrade: globalAgg.complianceGrade,
        overallPassRate: globalAgg.overallPassRate,
        averagePlatformMaturity: avgPlatformMaturity,
        maturityDistribution,
        highRiskTenantsCount: highRiskTenants.length,
        highRiskTenants
      },
      frameworkMatrix: globalAgg.frameworkBreakdown,
      vulnerabilities: globalAgg.vulnerabilitySummary,
      tenantMetrics,
      recommendations: [
        'Enforce automated CI/CD compliance gates for Level 1 and Level 2 tenants.',
        'Expand evidence logging for tenants progressing from Level 3 to Level 4.',
        'Engage high retention-risk tenants with proactive onboarding assistance.'
      ]
    };
  }

  /**
   * Exports dashboard report as a formatted JSON string.
   * @param {Object} [options={}] 
   * @returns {string} JSON output
   */
  exportDashboardJSON(options = {}) {
    const dashboard = this.generateDashboard(options);
    return JSON.stringify(dashboard, null, 2);
  }

  /**
   * Exports dashboard report as a human-readable Markdown summary report.
   * @param {Object} [options={}] 
   * @returns {string} Markdown formatted summary
   */
  exportDashboardSummary(options = {}) {
    const dash = this.generateDashboard(options);
    const s = dash.summary;

    let md = `# EAORCS Product Analytics & Operational Metrics Report\n`;
    md += `**Generated At**: ${dash.generatedAt}\n\n`;
    md += `## 1. Executive Summary\n`;
    md += `- **Total Tenants**: ${s.totalTenants}\n`;
    md += `- **Global Compliance Score**: ${s.globalComplianceScore}% (Grade: **${s.platformComplianceGrade}**)\n`;
    md += `- **Average Platform Maturity**: Level ${s.averagePlatformMaturity} / 5.00\n`;
    md += `- **High Retention Risk Tenants**: ${s.highRiskTenantsCount}\n\n`;

    md += `## 2. Operational Maturity Distribution\n`;
    md += `- Level 1 (Initial / Reactive): ${s.maturityDistribution.level1}\n`;
    md += `- Level 2 (Managed / Repeatable): ${s.maturityDistribution.level2}\n`;
    md += `- Level 3 (Defined / Standardized): ${s.maturityDistribution.level3}\n`;
    md += `- Level 4 (Quantitatively Managed): ${s.maturityDistribution.level4}\n`;
    md += `- Level 5 (Optimizing / Autonomous): ${s.maturityDistribution.level5}\n\n`;

    md += `## 3. Regulatory Framework Matrix\n`;
    for (const [fw, data] of Object.entries(dash.frameworkMatrix)) {
      md += `- **${fw}**: ${data.passRate}% pass rate (${data.passed}/${data.total} controls) - Status: ${data.status}\n`;
    }

    md += `\n## 4. Tenant Metrics Summary\n`;
    md += `| Tenant ID | Name | Compliance Score | Grade | Maturity | Adoption Score | Risk |\n`;
    md += `|-----------|------|------------------|-------|----------|----------------|------|\n`;
    for (const t of dash.tenantMetrics) {
      md += `| ${t.tenantId} | ${t.name} | ${t.complianceScore}% | ${t.grade} | Level ${t.maturityLevel} | ${t.adoptionScore} | ${t.retentionRisk} |\n`;
    }

    return md;
  }

  /**
   * Exports an OpenAPI 3.0.3 spec for the Analytics & Operational Metrics APIs.
   * @returns {Object} OpenAPI 3.0.3 specification
   */
  exportOpenApiMetricsSpec() {
    return {
      openapi: '3.0.3',
      info: {
        title: 'EAORCS Product Analytics & Operational Metrics API',
        version: '2026.1.0-LTS',
        description: 'Multi-tenant compliance metrics aggregation, adoption telemetry, operational maturity evaluation, and dashboard reporting API.'
      },
      paths: {
        '/analytics/telemetry': {
          post: {
            summary: 'Ingest tenant adoption telemetry event',
            operationId: 'ingestTelemetry',
            responses: {
              '200': { description: 'Telemetry ingested successfully' }
            }
          }
        },
        '/analytics/compliance': {
          post: {
            summary: 'Ingest tenant compliance metrics scan',
            operationId: 'ingestComplianceMetrics',
            responses: {
              '200': { description: 'Compliance scan metrics ingested' }
            },
            get: {
              summary: 'Retrieve aggregated multi-tenant compliance metrics',
              operationId: 'aggregateComplianceMetrics',
              responses: {
                '200': { description: 'Aggregated compliance report' }
              }
            }
          }
        },
        '/analytics/maturity/{tenantId}': {
          get: {
            summary: 'Evaluate tenant 5-level operational maturity',
            operationId: 'evaluateOperationalMaturity',
            parameters: [
              { name: 'tenantId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: {
              '200': { description: 'Operational maturity evaluation report' }
            }
          }
        },
        '/analytics/dashboard': {
          get: {
            summary: 'Generate comprehensive operational dashboard payload',
            operationId: 'generateDashboard',
            responses: {
              '200': { description: 'Operational dashboard payload' }
            }
          }
        }
      }
    };
  }
}

module.exports = {
  TenantAnalyticsEngine,
  MATURITY_LEVELS,
  calculateComplianceGrade
};
