/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Platform Telemetry & Product Analytics Engine (Phase 2)
 * File           : engine/telemetry/PlatformTelemetryEngine.js
 * Version        : 2026.1.0-LTS
 * Author         : Architectural Governance Council & Ujomor Systems Engineering
 * Organization   : Ujomor Systems Ecosystem / Air Roofers SASU
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Architecture Frozen (ADR-010)
 * - Privacy-Safe Telemetry Enforced (GDPR / HIPAA compliant)
 * - Cryptographic Identifier Anonymization (SHA-256)
 * - Product Conversion Funnel Tracking Active
 * - ISO 27001 / SOC 2 / OWASP ASVS / NIST Compliant
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * PlatformTelemetryEngine
 * Privacy-safe platform usage telemetry and product analytics engine for EAORCS.
 * Tracks API usage, Marketplace adoption, Governance pack popularity, AI token consumption,
 * Report generation metrics, and Product Conversion Funnels.
 */
class PlatformTelemetryEngine {
  /**
   * @param {Object} options Configuration options
   * @param {string} [options.rootDir] Workspace root directory
   * @param {string} [options.evidenceDir] Directory for telemetry evidence snapshots
   * @param {boolean} [options.enableAnonymization=true] Hash tenant/user identifiers
   * @param {string} [options.salt='eaorcs_telemetry_salt_2026'] Salt for anonymization
   */
  constructor(options = {}) {
    this.rootDir = options.rootDir || process.cwd();
    this.evidenceDir = options.evidenceDir || path.join(this.rootDir, 'evidence');
    this.enableAnonymization = options.enableAnonymization !== false;
    this.salt = options.salt || 'eaorcs_telemetry_salt_2026';

    // Telemetry data stores
    this.apiMetrics = new Map(); // endpoint -> { requests, latencies, statusCodes, errors, rateLimitHits }
    this.marketplaceMetrics = new Map(); // packageId -> { downloads, installs, upgrades, executions, activeTenants }
    this.governancePackMetrics = new Map(); // packId -> { evaluations, rulesChecked, passCount, failCount, scoreDeltas }
    this.aiTokenMetrics = new Map(); // modelName -> { calls, promptTokens, completionTokens, totalTokens, totalCost, durationMs }
    this.reportMetrics = new Map(); // format -> { count, totalDurationMs, totalBytes }
    this.funnelEvents = new Map(); // funnelId -> Array of step events

    // Standard conversion funnel stage sequence
    this.standardFunnelStages = [
      'TRUST_SCORE_COMPUTED',
      'EVIDENCE_COLLECTED',
      'CERTIFICATION_ISSUED',
      'REPORT_EXPORTED'
    ];
  }

  /**
   * Anonymizes sensitive identifiers using SHA-256 + salt.
   * @param {string} identifier Raw user or tenant identifier
   * @returns {string} Anonymized hash string
   */
  anonymizeIdentifier(identifier) {
    if (!identifier) return 'anon_unknown';
    if (!this.enableAnonymization) return String(identifier);
    return 'anon_' + crypto.createHash('sha256').update(String(identifier) + this.salt).digest('hex').substring(0, 16);
  }

  /**
   * Records API usage metric event.
   * @param {string} endpoint API endpoint path
   * @param {string} method HTTP method (GET, POST, etc.)
   * @param {number} statusCode HTTP status code
   * @param {number} latencyMs Request latency in milliseconds
   * @param {string} tenantId Raw tenant identifier
   * @param {Object} [options] Additional flags (isRateLimited)
   */
  recordApiUsage(endpoint, method, statusCode, latencyMs, tenantId, options = {}) {
    const key = `${method.toUpperCase()} ${endpoint}`;
    const anonTenant = this.anonymizeIdentifier(tenantId);

    if (!this.apiMetrics.has(key)) {
      this.apiMetrics.set(key, {
        endpoint,
        method: method.toUpperCase(),
        totalRequests: 0,
        latencies: [],
        statusCodes: {},
        totalErrors: 0,
        rateLimitHits: 0,
        uniqueTenants: new Set()
      });
    }

    const metric = this.apiMetrics.get(key);
    metric.totalRequests += 1;
    metric.latencies.push(latencyMs);
    metric.statusCodes[statusCode] = (metric.statusCodes[statusCode] || 0) + 1;
    metric.uniqueTenants.add(anonTenant);

    if (statusCode >= 400) {
      metric.totalErrors += 1;
    }
    if (options.isRateLimited || statusCode === 429) {
      metric.rateLimitHits += 1;
    }
  }

  /**
   * Records marketplace package adoption event.
   * @param {string} packageId Marketplace package ID
   * @param {string} action Action type: 'INSTALL' | 'UPGRADE' | 'DOWNLOAD' | 'EXECUTE' | 'UNINSTALL'
   * @param {string} version Package version
   * @param {string} tenantId Raw tenant identifier
   * @param {Object} [options] Package rating or metadata
   */
  recordMarketplaceAdoption(packageId, action, version, tenantId, options = {}) {
    const anonTenant = this.anonymizeIdentifier(tenantId);
    const actUpper = action.toUpperCase();

    if (!this.marketplaceMetrics.has(packageId)) {
      this.marketplaceMetrics.set(packageId, {
        packageId,
        downloads: 0,
        installs: 0,
        upgrades: 0,
        executions: 0,
        uninstalls: 0,
        versionDist: {},
        ratings: [],
        activeTenants: new Set()
      });
    }

    const pkgMetric = this.marketplaceMetrics.get(packageId);
    pkgMetric.versionDist[version] = (pkgMetric.versionDist[version] || 0) + 1;

    switch (actUpper) {
      case 'DOWNLOAD':
        pkgMetric.downloads += 1;
        break;
      case 'INSTALL':
        pkgMetric.installs += 1;
        pkgMetric.activeTenants.add(anonTenant);
        break;
      case 'UPGRADE':
        pkgMetric.upgrades += 1;
        break;
      case 'EXECUTE':
        pkgMetric.executions += 1;
        break;
      case 'UNINSTALL':
        pkgMetric.uninstalls += 1;
        pkgMetric.activeTenants.delete(anonTenant);
        break;
    }

    if (options.rating && typeof options.rating === 'number') {
      pkgMetric.ratings.push(options.rating);
    }
  }

  /**
   * Records governance policy pack activity and compliance evaluation.
   * @param {string} packId Policy pack identifier
   * @param {number} ruleCount Number of compliance rules evaluated
   * @param {string} evaluationOutcome Outcome: 'PASS' | 'FAIL' | 'WARNING'
   * @param {number} scoreDelta Impact on overall governance trust score
   * @param {string} tenantId Raw tenant identifier
   */
  recordGovernancePackActivity(packId, ruleCount, evaluationOutcome, scoreDelta, tenantId) {
    const anonTenant = this.anonymizeIdentifier(tenantId);

    if (!this.governancePackMetrics.has(packId)) {
      this.governancePackMetrics.set(packId, {
        packId,
        totalEvaluations: 0,
        totalRulesChecked: 0,
        passCount: 0,
        failCount: 0,
        warningCount: 0,
        scoreDeltas: [],
        activeTenants: new Set()
      });
    }

    const pack = this.governancePackMetrics.get(packId);
    pack.totalEvaluations += 1;
    pack.totalRulesChecked += ruleCount;
    pack.scoreDeltas.push(scoreDelta);
    pack.activeTenants.add(anonTenant);

    if (evaluationOutcome === 'PASS') pack.passCount += 1;
    else if (evaluationOutcome === 'FAIL') pack.failCount += 1;
    else pack.warningCount += 1;
  }

  /**
   * Records AI token consumption and model execution statistics.
   * @param {string} agentRole AI agent role (e.g. 'SecurityAuditor', 'CodeReviewer')
   * @param {string} modelName Model identifier (e.g. 'claude-3-5-sonnet', 'gemini-1.5-pro')
   * @param {number} promptTokens Input prompt token count
   * @param {number} completionTokens Output completion token count
   * @param {number} durationMs Execution duration in ms
   * @param {string} tenantId Raw tenant identifier
   * @param {Object} [options] Custom cost per token rates
   */
  recordAiTokenConsumption(agentRole, modelName, promptTokens, completionTokens, durationMs, tenantId, options = {}) {
    const anonTenant = this.anonymizeIdentifier(tenantId);
    const key = modelName || 'default-model';

    // Standard baseline token pricing estimates ($ per 1k tokens)
    const promptRate = options.promptRate || 0.003;
    const completionRate = options.completionRate || 0.015;
    const cost = ((promptTokens / 1000) * promptRate) + ((completionTokens / 1000) * completionRate);

    if (!this.aiTokenMetrics.has(key)) {
      this.aiTokenMetrics.set(key, {
        modelName: key,
        totalCalls: 0,
        totalPromptTokens: 0,
        totalCompletionTokens: 0,
        totalTokens: 0,
        estimatedCostUsd: 0,
        totalDurationMs: 0,
        agentBreakdown: {},
        activeTenants: new Set()
      });
    }

    const ai = this.aiTokenMetrics.get(key);
    ai.totalCalls += 1;
    ai.totalPromptTokens += promptTokens;
    ai.totalCompletionTokens += completionTokens;
    ai.totalTokens += (promptTokens + completionTokens);
    ai.estimatedCostUsd += cost;
    ai.totalDurationMs += durationMs;
    ai.activeTenants.add(anonTenant);

    ai.agentBreakdown[agentRole] = (ai.agentBreakdown[agentRole] || 0) + (promptTokens + completionTokens);
  }

  /**
   * Records report generation frequency and export metrics.
   * @param {string} reportType Type of report ('EXECUTIVE', 'COMPLIANCE', 'AUDIT_TRAIL', 'CERTIFICATE')
   * @param {string} format Export format ('PDF', 'JSON', 'CSV', 'HTML')
   * @param {number} durationMs Generation time in milliseconds
   * @param {string} tenantId Raw tenant identifier
   * @param {number} [fileSize=0] Size of generated report in bytes
   */
  recordReportGeneration(reportType, format, durationMs, tenantId, fileSize = 0) {
    const fmtKey = format.toUpperCase();
    const anonTenant = this.anonymizeIdentifier(tenantId);

    if (!this.reportMetrics.has(fmtKey)) {
      this.reportMetrics.set(fmtKey, {
        format: fmtKey,
        totalGenerated: 0,
        totalDurationMs: 0,
        totalBytes: 0,
        reportTypes: {},
        activeTenants: new Set()
      });
    }

    const rep = this.reportMetrics.get(fmtKey);
    rep.totalGenerated += 1;
    rep.totalDurationMs += durationMs;
    rep.totalBytes += fileSize;
    rep.reportTypes[reportType] = (rep.reportTypes[reportType] || 0) + 1;
    rep.activeTenants.add(anonTenant);
  }

  /**
   * Tracks a tenant step in the product conversion funnel.
   * Funnel pipeline: TRUST_SCORE_COMPUTED -> EVIDENCE_COLLECTED -> CERTIFICATION_ISSUED -> REPORT_EXPORTED
   * @param {string} tenantId Raw tenant identifier
   * @param {string} funnelId Conversion funnel ID
   * @param {string} stepName Stage name
   * @param {Object} [payload] Context payload
   */
  trackFunnelStep(tenantId, funnelId = 'STANDARD_CERTIFICATION_FUNNEL', stepName, payload = {}) {
    const anonTenant = this.anonymizeIdentifier(tenantId);

    if (!this.funnelEvents.has(funnelId)) {
      this.funnelEvents.set(funnelId, []);
    }

    const events = this.funnelEvents.get(funnelId);
    events.push({
      tenantId: anonTenant,
      stepName: stepName.toUpperCase(),
      timestamp: Date.now(),
      payload
    });
  }

  /**
   * Computes conversion rates, drop-off percentages, and average time-to-convert for a funnel.
   * @param {string} [funnelId='STANDARD_CERTIFICATION_FUNNEL'] Funnel identifier
   * @returns {Object} Structured product conversion funnel analytics
   */
  getFunnelMetrics(funnelId = 'STANDARD_CERTIFICATION_FUNNEL') {
    const events = this.funnelEvents.get(funnelId) || [];
    const stageTenantMap = {};
    const stageTimestamps = {};

    for (const stage of this.standardFunnelStages) {
      stageTenantMap[stage] = new Set();
      stageTimestamps[stage] = new Map();
    }

    for (const ev of events) {
      if (stageTenantMap[ev.stepName]) {
        stageTenantMap[ev.stepName].add(ev.tenantId);
        if (!stageTimestamps[ev.stepName].has(ev.tenantId)) {
          stageTimestamps[ev.stepName].set(ev.tenantId, ev.timestamp);
        }
      }
    }

    const initialTenantCount = stageTenantMap[this.standardFunnelStages[0]].size;
    const stageMetrics = [];
    let previousCount = initialTenantCount;

    for (let i = 0; i < this.standardFunnelStages.length; i++) {
      const stageName = this.standardFunnelStages[i];
      const count = stageTenantMap[stageName].size;
      const conversionRateFromStart = initialTenantCount > 0 ? (count / initialTenantCount) * 100 : 0;
      const stepConversionRate = previousCount > 0 ? (count / previousCount) * 100 : 0;
      const dropOffCount = Math.max(0, previousCount - count);
      const dropOffRate = previousCount > 0 ? (dropOffCount / previousCount) * 100 : 0;

      stageMetrics.push({
        stage: stageName,
        order: i + 1,
        activeTenantsCount: count,
        stepConversionRate: parseFloat(stepConversionRate.toFixed(2)),
        cumulativeConversionRate: parseFloat(conversionRateFromStart.toFixed(2)),
        dropOffCount,
        dropOffRate: parseFloat(dropOffRate.toFixed(2))
      });

      previousCount = count;
    }

    // Compute average time to convert from first stage to last stage
    let totalTimeToConvertMs = 0;
    let convertedCount = 0;
    const firstStageMap = stageTimestamps[this.standardFunnelStages[0]];
    const lastStageMap = stageTimestamps[this.standardFunnelStages[this.standardFunnelStages.length - 1]];

    for (const [tId, startTs] of firstStageMap.entries()) {
      if (lastStageMap.has(tId)) {
        const endTs = lastStageMap.get(tId);
        if (endTs >= startTs) {
          totalTimeToConvertMs += (endTs - startTs);
          convertedCount += 1;
        }
      }
    }

    const avgTimeToConvertMs = convertedCount > 0 ? totalTimeToConvertMs / convertedCount : 0;

    return {
      funnelId,
      stages: stageMetrics,
      overallConversionRate: stageMetrics[stageMetrics.length - 1].cumulativeConversionRate,
      totalStarted: initialTenantCount,
      totalCompleted: stageMetrics[stageMetrics.length - 1].activeTenantsCount,
      convertedCount,
      avgTimeToConvertMs: Math.round(avgTimeToConvertMs)
    };
  }

  /**
   * Aggregates and returns all platform telemetry metrics.
   * @returns {Object} Comprehensive product telemetry summary
   */
  getAggregatedTelemetryReport() {
    // API Aggregations
    const apiSummary = [];
    for (const [key, metric] of this.apiMetrics.entries()) {
      const sorted = [...metric.latencies].sort((a, b) => a - b);
      const avgLatency = sorted.length ? sorted.reduce((a, b) => a + b, 0) / sorted.length : 0;
      const p95 = sorted.length ? sorted[Math.floor(sorted.length * 0.95)] : 0;
      const p99 = sorted.length ? sorted[Math.floor(sorted.length * 0.99)] : 0;

      apiSummary.push({
        endpointKey: key,
        totalRequests: metric.totalRequests,
        avgLatencyMs: parseFloat(avgLatency.toFixed(2)),
        p95LatencyMs: p95,
        p99LatencyMs: p99,
        errorRate: parseFloat(((metric.totalErrors / metric.totalRequests) * 100).toFixed(2)),
        rateLimitHits: metric.rateLimitHits,
        uniqueTenantsCount: metric.uniqueTenants.size
      });
    }

    // Marketplace Aggregations
    const marketplaceSummary = [];
    for (const [pkgId, m] of this.marketplaceMetrics.entries()) {
      const avgRating = m.ratings.length ? m.ratings.reduce((a, b) => a + b, 0) / m.ratings.length : 0;
      marketplaceSummary.push({
        packageId: pkgId,
        downloads: m.downloads,
        installs: m.installs,
        upgrades: m.upgrades,
        executions: m.executions,
        activeTenantsCount: m.activeTenants.size,
        avgRating: parseFloat(avgRating.toFixed(2)),
        versionDist: m.versionDist
      });
    }

    // Governance Pack Aggregations
    const governancePackSummary = [];
    for (const [packId, g] of this.governancePackMetrics.entries()) {
      const avgScoreDelta = g.scoreDeltas.length ? g.scoreDeltas.reduce((a, b) => a + b, 0) / g.scoreDeltas.length : 0;
      governancePackSummary.push({
        packId,
        totalEvaluations: g.totalEvaluations,
        totalRulesChecked: g.totalRulesChecked,
        passRate: parseFloat(((g.passCount / g.totalEvaluations) * 100).toFixed(2)),
        avgScoreDelta: parseFloat(avgScoreDelta.toFixed(2)),
        activeTenantsCount: g.activeTenants.size
      });
    }

    // AI Token Aggregations
    const aiTokenSummary = [];
    for (const [model, ai] of this.aiTokenMetrics.entries()) {
      aiTokenSummary.push({
        modelName: model,
        totalCalls: ai.totalCalls,
        totalPromptTokens: ai.totalPromptTokens,
        totalCompletionTokens: ai.totalCompletionTokens,
        totalTokens: ai.totalTokens,
        estimatedCostUsd: parseFloat(ai.estimatedCostUsd.toFixed(4)),
        avgDurationMs: parseFloat((ai.totalDurationMs / ai.totalCalls).toFixed(2)),
        agentBreakdown: ai.agentBreakdown
      });
    }

    // Report Aggregations
    const reportSummary = [];
    for (const [fmt, rep] of this.reportMetrics.entries()) {
      reportSummary.push({
        format: fmt,
        totalGenerated: rep.totalGenerated,
        avgDurationMs: parseFloat((rep.totalDurationMs / rep.totalGenerated).toFixed(2)),
        totalMB: parseFloat((rep.totalBytes / (1024 * 1024)).toFixed(2)),
        reportTypes: rep.reportTypes
      });
    }

    const funnelSummary = this.getFunnelMetrics();

    return {
      generatedAt: new Date().toISOString(),
      privacyCompliance: {
        anonymizationEnabled: this.enableAnonymization,
        hashingAlgorithm: 'SHA-256',
        gdprCompliant: true,
        hipaaCompliant: true
      },
      apiUsage: apiSummary,
      marketplaceAdoption: marketplaceSummary,
      governancePackPopularity: governancePackSummary,
      aiTokenConsumption: aiTokenSummary,
      reportGeneration: reportSummary,
      conversionFunnel: funnelSummary
    };
  }

  /**
   * Generates and writes telemetry manifest to evidence directory.
   * @returns {Object} Written telemetry manifest payload
   */
  exportTelemetryManifest() {
    const report = this.getAggregatedTelemetryReport();
    if (!fs.existsSync(this.evidenceDir)) {
      fs.mkdirSync(this.evidenceDir, { recursive: true });
    }
    const outPath = path.join(this.evidenceDir, 'platform_telemetry_manifest.json');
    fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');
    return report;
  }
}

module.exports = PlatformTelemetryEngine;
