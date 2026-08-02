/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : Executive Intelligence — Cyber Weather & Nervous System (Stream I)
 * File           : CyberWeatherEngine.js
 * Version        : 2026.1.0-LTS
 * Author         : Enterprise Architecture Governance Committee & Ujomor Systems Engineering
 * Organization   : Ujomor Systems Engineering
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : GOVERNMENT | ENTERPRISE | INTERNAL
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
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Ujomor Systems Engineering
 * All Rights Reserved.
 ******************************************************************************/

const CyberWeather = require('./CyberWeather.cjs');

/**
 * CyberWeatherEngine
 * 5-Vector Cyber Weather Threat Forecasting Model and Digital Nervous System for EAORCS Executive Intelligence.
 */
class CyberWeatherEngine {
  constructor(config = {}) {
    this.config = config;
    this.coreModel = new CyberWeather();
    this.threatVectors = ['network', 'endpoint', 'identity', 'application', 'data'];
    this.telemetryBuffer = [];
  }

  /**
   * Generates a 5-vector cyber weather threat forecast.
   * @param {Object} context Environmental telemetry context
   * @returns {Object} Forecast details
   */
  getForecast(context = {}) {
    const baseForecast = this.coreModel ? this.coreModel.getForecast(context) : this._generateDefaultBaseForecast(context);

    // Analyze 5 vectors in detail
    const evaluatedVectors = {};
    for (const vector of this.threatVectors) {
      evaluatedVectors[vector] = this.analyzeVector(vector, context[vector] || context);
    }

    // Enhance with Digital Nervous System predictive analytics
    const nervousSystemSignal = this.evaluateDigitalNervousSystem(context);
    const overallThreatIndex = Number((this._calculateThreatIndex(evaluatedVectors) + nervousSystemSignal.riskModifier).toFixed(2));

    let severity = 'LOW';
    let stormCategory = 'CALM';
    if (overallThreatIndex > 8.0) {
      severity = 'CRITICAL';
      stormCategory = 'CATEGORY_5_STORM';
    } else if (overallThreatIndex > 6.0) {
      severity = 'HIGH';
      stormCategory = 'SEVERE_STORM';
    } else if (overallThreatIndex > 3.5) {
      severity = 'MEDIUM';
      stormCategory = 'HIGH_WIND';
    } else if (overallThreatIndex > 2.0) {
      severity = 'LOW';
      stormCategory = 'MODERATE';
    }

    return {
      timestamp: baseForecast.timestamp || new Date().toISOString(),
      threatIndex: overallThreatIndex,
      overall_severity: severity,
      stormCategory,
      vectors: evaluatedVectors,
      nervousSystemSignal,
      prescriptiveMitigations: this.getPrescriptiveMitigations({ severity, vectors: evaluatedVectors, nervousSystemSignal })
    };
  }

  /**
   * Analyzes specific threat vector telemetry (network, endpoint, identity, application, data).
   * @param {string} vectorName Vector key
   * @param {Object} vectorTelemetry Telemetry data
   * @returns {Object} Evaluated vector posture
   */
  analyzeVector(vectorName, vectorTelemetry = {}) {
    const riskScore = typeof vectorTelemetry.riskScore === 'number'
      ? vectorTelemetry.riskScore
      : (typeof vectorTelemetry.threatLevel === 'number' ? vectorTelemetry.threatLevel : 1.2);

    const trend = vectorTelemetry.trend || (riskScore > 4.0 ? 'ESCALATING' : 'STABLE');
    const anomalyCount = vectorTelemetry.anomalies || vectorTelemetry.anomalyCount || 0;

    let vectorStatus = 'HEALTHY';
    if (riskScore > 7.0 || anomalyCount > 10) vectorStatus = 'CRITICAL_ALERT';
    else if (riskScore > 4.0 || anomalyCount > 3) vectorStatus = 'ELEVATED';

    return {
      vector: vectorName,
      riskScore: Number(riskScore.toFixed(2)),
      trend,
      anomalyCount,
      vectorStatus,
      confidence: vectorTelemetry.confidence || 0.95,
      evaluatedAt: new Date().toISOString()
    };
  }

  /**
   * Evaluates digital nervous system telemetry pulse across distributed nodes.
   * @param {Object} telemetry Context or telemetry snapshot
   * @returns {Object} Digital nervous system signal status
   */
  evaluateDigitalNervousSystem(telemetry = {}) {
    const activeNodes = telemetry.activeNodes || 100;
    const latencyMs = telemetry.averageLatencyMs || telemetry.latencyMs || 45;
    const errorRate = telemetry.errorRate || 0.002;
    const telemetryFriction = telemetry.telemetryFriction || 0.01;

    const isDegraded = errorRate > 0.05 || latencyMs > 500 || telemetryFriction > 0.25;
    const nervousHealth = isDegraded ? 'DEGRADED' : 'HEALTHY';
    const riskModifier = isDegraded ? 1.8 : 0.0;

    const nervousSignal = {
      status: nervousHealth,
      activeNodes,
      latencyMs,
      errorRate,
      telemetryFriction,
      riskModifier,
      pulseTimestamp: new Date().toISOString()
    };

    // Store in internal telemetry buffer
    this.telemetryBuffer.push(nervousSignal);
    if (this.telemetryBuffer.length > 50) this.telemetryBuffer.shift();

    return nervousSignal;
  }

  /**
   * Predicts cyber threat storm progression across temporal horizons (e.g. 24h, 48h, 7d).
   * @param {number} horizonHours Forecast time horizon in hours
   * @param {Object} [currentTelemetry] Telemetry snapshot
   * @returns {Object} Threat storm prediction report
   */
  predictThreatStorm(horizonHours = 24, currentTelemetry = {}) {
    const currentForecast = this.getForecast(currentTelemetry);
    const growthRate = currentForecast.overall_severity === 'CRITICAL' ? 1.25 : 1.05;

    const projectedThreatIndex = Number((Math.min(10.0, currentForecast.threatIndex * Math.pow(growthRate, horizonHours / 24))).toFixed(2));

    let projectedStormCategory = 'CALM';
    if (projectedThreatIndex > 8.0) projectedStormCategory = 'CATEGORY_5_STORM';
    else if (projectedThreatIndex > 6.0) projectedStormCategory = 'SEVERE_STORM';
    else if (projectedThreatIndex > 3.5) projectedStormCategory = 'HIGH_WIND';
    else if (projectedThreatIndex > 2.0) projectedStormCategory = 'MODERATE';

    return {
      forecastHorizonHours: horizonHours,
      currentThreatIndex: currentForecast.threatIndex,
      projectedThreatIndex,
      currentStormCategory: currentForecast.stormCategory,
      projectedStormCategory,
      confidenceScore: 0.92,
      recommendedPreemptiveActions: projectedThreatIndex > 6.0
        ? ['Enable strict rate-limiting on endpoint gateways', 'Trigger proactive ADR architecture drift audit', 'Isolate suspicious identity session tokens']
        : ['Maintain standard digital nervous system baseline monitoring']
    };
  }

  /**
   * Generates prescriptive mitigation playbooks based on cyber weather forecast.
   * @param {Object} forecastResult Forecast object
   * @returns {Array} List of prescriptive mitigation playbooks
   */
  getPrescriptiveMitigations(forecastResult = {}) {
    const recs = [];
    const severity = forecastResult.severity || forecastResult.overall_severity;
    const vectors = forecastResult.vectors || {};
    const nervous = forecastResult.nervousSystemSignal || {};

    if (severity === 'CRITICAL' || severity === 'HIGH') {
      recs.push({
        priority: 'P1_URGENT',
        vector: 'NETWORK_IDENTITY',
        action: 'Enforce strict API zero-trust validation, WebAuthn MFA, and dynamic rate limiting across all ingress points.'
      });
      recs.push({
        priority: 'P1_URGENT',
        vector: 'APPLICATION',
        action: 'Initiate automated architecture drift scan via DriftAnalytics engine and lock deployment pipelines.'
      });
    }

    if (vectors.data && vectors.data.riskScore > 5.0) {
      recs.push({
        priority: 'P2_HIGH',
        vector: 'DATA',
        action: 'Activate AES-256-GCM data payload encryption verification and restrict egress data transfer channels.'
      });
    }

    if (nervous.status === 'DEGRADED') {
      recs.push({
        priority: 'P2_HIGH',
        vector: 'NERVOUS_SYSTEM',
        action: 'Digital nervous system telemetry degraded. Scale telemetry collection nodes and isolate failing endpoints.'
      });
    }

    if (recs.length === 0) {
      recs.push({
        priority: 'P4_ROUTINE',
        vector: 'ALL',
        action: 'Maintain baseline digital nervous system continuous monitoring. All 5 threat vectors operate within acceptable governance parameters.'
      });
    }

    return recs;
  }

  // --- PRIVATE HELPER METHODS ---

  _calculateThreatIndex(vectors = {}) {
    let sum = 0;
    let count = 0;
    for (const key of Object.keys(vectors)) {
      if (vectors[key] && typeof vectors[key].riskScore === 'number') {
        sum += vectors[key].riskScore;
        count++;
      }
    }
    return count > 0 ? sum / count : 1.5;
  }

  _generateDefaultBaseForecast() {
    return {
      timestamp: new Date().toISOString(),
      vectors: {
        network: { riskScore: 1.2 },
        endpoint: { riskScore: 1.5 },
        identity: { riskScore: 1.1 },
        application: { riskScore: 1.3 },
        data: { riskScore: 1.0 }
      }
    };
  }
}

module.exports = CyberWeatherEngine;
module.exports.default = CyberWeatherEngine;
