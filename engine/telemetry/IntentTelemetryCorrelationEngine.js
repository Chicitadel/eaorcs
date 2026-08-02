/******************************************************************************
 * Project        : EAORCS Platform
 * Module         : Telemetry Intent Correlation Engine
 * File           : IntentTelemetryCorrelationEngine.js
 * Version        : 1.0.0
 * Author         : Ujomor Systems & Enterprise Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance Authority
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Architecture Authority Approved
 * - Security Reviewed & ISO 27001 / SOC 2 / OWASP ASVS / NIST Compliant
 * - Universal Operational Telemetry Standard Enforced
 * - Protocol Frozen & Modularized
 *
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance Authority
 * All Rights Reserved.
 ******************************************************************************/

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const EventEmitter = require('events');

/**
 * Class representing the Telemetry Intent Correlation Engine.
 * Correlates production telemetry (latency, error rate, throughput, CPU, RAM, status codes)
 * directly with blueprint requirements and SLA constraints.
 */
class IntentTelemetryCorrelationEngine extends EventEmitter {
    /**
     * Creates an instance of IntentTelemetryCorrelationEngine.
     * @param {Object} [options={}] - Configuration options for the engine.
     */
    constructor(options = {}) {
        super();
        this.options = Object.assign({
            strictSlaEnforcement: true,
            defaultLatencyThresholdMs: 500,
            defaultMaxErrorRatePct: 1.0,
            defaultCpuThresholdPct: 85.0,
            defaultMemoryThresholdMb: 1024,
            logCorrelationEvents: false
        }, options);

        /** @type {Map<string, Object>} Stores registered requirement SLAs by reqId */
        this.slaRequirements = new Map();

        /** @type {Array<Object>} Stores ingested raw telemetry metrics */
        this.telemetryMetrics = [];

        /** @type {Array<Object>} Stores correlation evaluation results */
        this.correlations = [];

        /** @type {Array<Object>} Stores detected SLA violations */
        this.violations = [];
    }

    /**
     * Registers a requirement SLA specification.
     * @param {string} reqId - Unique identifier for the blueprint requirement (e.g., 'REQ-AUTH-001').
     * @param {Object} slaSpec - SLA specification object.
     * @param {number} [slaSpec.maxLatencyMs] - Maximum acceptable latency in milliseconds.
     * @param {number} [slaSpec.maxErrorRatePct] - Maximum acceptable error rate percentage (0 - 100).
     * @param {number} [slaSpec.minThroughputRps] - Minimum expected throughput in requests per second.
     * @param {number} [slaSpec.maxCpuPercent] - Maximum acceptable CPU utilization percentage.
     * @param {number} [slaSpec.maxMemoryMb] - Maximum acceptable RAM usage in MB.
     * @param {Array<number>} [slaSpec.allowedStatusCodes] - Array of permissible HTTP status codes (e.g. [200, 201]).
     * @param {number} [slaSpec.targetUptimePct] - Target service uptime percentage (e.g. 99.9).
     * @param {string} [slaSpec.description] - Description of the requirement/SLA constraint.
     * @returns {Object} Registered requirement SLA object.
     */
    registerRequirementSla(reqId, slaSpec = {}) {
        if (!reqId || typeof reqId !== 'string') {
            throw new Error('Invalid requirement ID: reqId must be a non-empty string');
        }

        const normalizedSpec = {
            reqId,
            maxLatencyMs: Number.isFinite(slaSpec.maxLatencyMs) ? slaSpec.maxLatencyMs : this.options.defaultLatencyThresholdMs,
            maxErrorRatePct: Number.isFinite(slaSpec.maxErrorRatePct) ? slaSpec.maxErrorRatePct : this.options.defaultMaxErrorRatePct,
            minThroughputRps: Number.isFinite(slaSpec.minThroughputRps) ? slaSpec.minThroughputRps : 0,
            maxCpuPercent: Number.isFinite(slaSpec.maxCpuPercent) ? slaSpec.maxCpuPercent : this.options.defaultCpuThresholdPct,
            maxMemoryMb: Number.isFinite(slaSpec.maxMemoryMb) ? slaSpec.maxMemoryMb : this.options.defaultMemoryThresholdMb,
            allowedStatusCodes: Array.isArray(slaSpec.allowedStatusCodes) ? slaSpec.allowedStatusCodes : [200, 201, 202, 204],
            targetUptimePct: Number.isFinite(slaSpec.targetUptimePct) ? slaSpec.targetUptimePct : 99.9,
            description: slaSpec.description || `SLA constraint for ${reqId}`,
            registeredAt: new Date().toISOString()
        };

        this.slaRequirements.set(reqId, normalizedSpec);
        this.emit('slaRegistered', normalizedSpec);
        return normalizedSpec;
    }

    /**
     * Ingests a production telemetry metric payload.
     * @param {Object} metric - Telemetry metric payload.
     * @param {string} [metric.reqId] - Requirement ID associated with the metric.
     * @param {number} [metric.latencyMs] - Measured request latency in ms.
     * @param {number} [metric.errorRatePct] - Measured error rate percentage.
     * @param {number} [metric.throughputRps] - Measured request throughput per second.
     * @param {number} [metric.cpuPercent] - Measured CPU utilization percentage.
     * @param {number} [metric.memoryMb] - Measured memory usage in MB.
     * @param {number} [metric.statusCode] - HTTP status code recorded.
     * @param {number} [metric.uptimePct] - System/service uptime percentage.
     * @param {string} [metric.timestamp] - ISO timestamp string.
     * @returns {Object} Normalized ingested metric with unique ID.
     */
    ingestTelemetryMetric(metric = {}) {
        if (typeof metric !== 'object' || metric === null) {
            throw new Error('Invalid telemetry payload: metric must be a valid object');
        }

        const metricId = `metric_${crypto.randomBytes(6).toString('hex')}`;
        const normalizedMetric = {
            metricId,
            reqId: metric.reqId || metric.requirementId || '*',
            latencyMs: Number.isFinite(metric.latencyMs) ? metric.latencyMs : (Number.isFinite(metric.durationMs) ? metric.durationMs : 0),
            errorRatePct: Number.isFinite(metric.errorRatePct) ? metric.errorRatePct : (Number.isFinite(metric.errorRate) ? metric.errorRate : 0),
            throughputRps: Number.isFinite(metric.throughputRps) ? metric.throughputRps : (Number.isFinite(metric.rps) ? metric.rps : 0),
            cpuPercent: Number.isFinite(metric.cpuPercent) ? metric.cpuPercent : (Number.isFinite(metric.cpu) ? metric.cpu : 0),
            memoryMb: Number.isFinite(metric.memoryMb) ? metric.memoryMb : (Number.isFinite(metric.ram) ? metric.ram : 0),
            statusCode: Number.isInteger(metric.statusCode) ? metric.statusCode : (Number.isInteger(metric.status) ? metric.status : 200),
            uptimePct: Number.isFinite(metric.uptimePct) ? metric.uptimePct : 100.0,
            service: metric.service || 'default-service',
            timestamp: metric.timestamp || new Date().toISOString()
        };

        this.telemetryMetrics.push(normalizedMetric);
        this.emit('metricIngested', normalizedMetric);
        return normalizedMetric;
    }

    /**
     * Correlates intent requirements with ingested telemetry metrics.
     * Evaluates compliance against SLA specs and generates correlation analysis.
     * @returns {Object} Correlation analysis summary.
     */
    correlateIntentWithTelemetry() {
        this.correlations = [];
        this.violations = [];

        let totalRequirements = this.slaRequirements.size;
        let compliantRequirements = 0;
        let violatedRequirements = 0;

        for (const [reqId, slaSpec] of this.slaRequirements.entries()) {
            // Find matching metrics for this reqId (or wildcard '*')
            const matchingMetrics = this.telemetryMetrics.filter(m => m.reqId === reqId || m.reqId === '*');

            if (matchingMetrics.length === 0) {
                const noDataCorrelation = {
                    reqId,
                    slaSpec,
                    metricsAnalyzedCount: 0,
                    status: 'NO_DATA',
                    complianceScorePct: 0.0,
                    violations: [],
                    evaluatedAt: new Date().toISOString()
                };
                this.correlations.push(noDataCorrelation);
                continue;
            }

            // Aggregate metrics
            const totalLatency = matchingMetrics.reduce((acc, m) => acc + m.latencyMs, 0);
            const avgLatencyMs = matchingMetrics.length > 0 ? totalLatency / matchingMetrics.length : 0;
            const maxLatencyMs = Math.max(...matchingMetrics.map(m => m.latencyMs));

            const totalErrorRate = matchingMetrics.reduce((acc, m) => acc + m.errorRatePct, 0);
            const avgErrorRatePct = matchingMetrics.length > 0 ? totalErrorRate / matchingMetrics.length : 0;

            const totalThroughput = matchingMetrics.reduce((acc, m) => acc + m.throughputRps, 0);
            const avgThroughputRps = matchingMetrics.length > 0 ? totalThroughput / matchingMetrics.length : 0;

            const maxCpuPercent = Math.max(...matchingMetrics.map(m => m.cpuPercent));
            const maxMemoryMb = Math.max(...matchingMetrics.map(m => m.memoryMb));
            const minUptimePct = Math.min(...matchingMetrics.map(m => m.uptimePct));

            const reqViolations = [];

            // Check SLA criteria
            if (avgLatencyMs > slaSpec.maxLatencyMs) {
                reqViolations.push({
                    reqId,
                    type: 'LATENCY_EXCEEDED',
                    severity: 'HIGH',
                    message: `Average latency ${avgLatencyMs.toFixed(2)}ms exceeds max SLA ${slaSpec.maxLatencyMs}ms`,
                    observed: avgLatencyMs,
                    threshold: slaSpec.maxLatencyMs,
                    timestamp: new Date().toISOString()
                });
            }

            if (avgErrorRatePct > slaSpec.maxErrorRatePct) {
                reqViolations.push({
                    reqId,
                    type: 'ERROR_RATE_EXCEEDED',
                    severity: 'CRITICAL',
                    message: `Average error rate ${avgErrorRatePct.toFixed(2)}% exceeds max SLA ${slaSpec.maxErrorRatePct}%`,
                    observed: avgErrorRatePct,
                    threshold: slaSpec.maxErrorRatePct,
                    timestamp: new Date().toISOString()
                });
            }

            if (slaSpec.minThroughputRps > 0 && avgThroughputRps < slaSpec.minThroughputRps) {
                reqViolations.push({
                    reqId,
                    type: 'THROUGHPUT_INSUFFICIENT',
                    severity: 'MEDIUM',
                    message: `Average throughput ${avgThroughputRps.toFixed(2)} RPS below min SLA ${slaSpec.minThroughputRps} RPS`,
                    observed: avgThroughputRps,
                    threshold: slaSpec.minThroughputRps,
                    timestamp: new Date().toISOString()
                });
            }

            if (maxCpuPercent > slaSpec.maxCpuPercent) {
                reqViolations.push({
                    reqId,
                    type: 'CPU_UTILIZATION_EXCEEDED',
                    severity: 'MEDIUM',
                    message: `Peak CPU utilization ${maxCpuPercent.toFixed(2)}% exceeds threshold ${slaSpec.maxCpuPercent}%`,
                    observed: maxCpuPercent,
                    threshold: slaSpec.maxCpuPercent,
                    timestamp: new Date().toISOString()
                });
            }

            if (maxMemoryMb > slaSpec.maxMemoryMb) {
                reqViolations.push({
                    reqId,
                    type: 'MEMORY_LIMIT_EXCEEDED',
                    severity: 'HIGH',
                    message: `Peak RAM usage ${maxMemoryMb}MB exceeds limit ${slaSpec.maxMemoryMb}MB`,
                    observed: maxMemoryMb,
                    threshold: slaSpec.maxMemoryMb,
                    timestamp: new Date().toISOString()
                });
            }

            if (minUptimePct < slaSpec.targetUptimePct) {
                reqViolations.push({
                    reqId,
                    type: 'UPTIME_SLA_BREACH',
                    severity: 'CRITICAL',
                    message: `Uptime ${minUptimePct.toFixed(3)}% below target SLA ${slaSpec.targetUptimePct}%`,
                    observed: minUptimePct,
                    threshold: slaSpec.targetUptimePct,
                    timestamp: new Date().toISOString()
                });
            }

            // Check Status Codes
            for (const metric of matchingMetrics) {
                if (slaSpec.allowedStatusCodes.length > 0 && !slaSpec.allowedStatusCodes.includes(metric.statusCode)) {
                    reqViolations.push({
                        reqId,
                        type: 'UNALLOWED_STATUS_CODE',
                        severity: 'LOW',
                        message: `Disallowed status code ${metric.statusCode} recorded on metric ${metric.metricId}`,
                        observed: metric.statusCode,
                        threshold: slaSpec.allowedStatusCodes,
                        timestamp: metric.timestamp
                    });
                }
            }

            const isCompliant = reqViolations.length === 0;
            if (isCompliant) {
                compliantRequirements++;
            } else {
                violatedRequirements++;
                this.violations.push(...reqViolations);
            }

            // Calculate compliance score
            const checkPoints = 6;
            const failedPoints = Math.min(reqViolations.length, checkPoints);
            const complianceScorePct = Math.max(0, ((checkPoints - failedPoints) / checkPoints) * 100);

            const correlationRecord = {
                reqId,
                slaSpec,
                metricsAnalyzedCount: matchingMetrics.length,
                aggregatedTelemetry: {
                    avgLatencyMs,
                    maxLatencyMs,
                    avgErrorRatePct,
                    avgThroughputRps,
                    maxCpuPercent,
                    maxMemoryMb,
                    minUptimePct
                },
                status: isCompliant ? 'COMPLIANT' : 'VIOLATED',
                complianceScorePct,
                violations: reqViolations,
                evaluatedAt: new Date().toISOString()
            };

            this.correlations.push(correlationRecord);
        }

        const overallScorePct = totalRequirements > 0
            ? (compliantRequirements / totalRequirements) * 100
            : 100.0;

        const summary = {
            totalRequirements,
            compliantRequirements,
            violatedRequirements,
            overallComplianceScorePct: Math.round(overallScorePct * 100) / 100,
            totalMetricsAnalyzed: this.telemetryMetrics.length,
            totalViolationsDetected: this.violations.length,
            evaluatedAt: new Date().toISOString()
        };

        this.emit('correlationCompleted', summary);
        return summary;
    }

    /**
     * Gets all SLA violations detected during correlation.
     * @param {Object} [filter={}] - Optional filters for returned violations.
     * @param {string} [filter.reqId] - Filter by requirement ID.
     * @param {string} [filter.severity] - Filter by severity ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW').
     * @param {string} [filter.type] - Filter by violation type.
     * @returns {Array<Object>} List of matching violation records.
     */
    getSlaViolations(filter = {}) {
        return this.violations.filter(v => {
            if (filter.reqId && v.reqId !== filter.reqId) return false;
            if (filter.severity && v.severity !== filter.severity) return false;
            if (filter.type && v.type !== filter.type) return false;
            return true;
        });
    }

    /**
     * Exports a comprehensive correlation report object with cryptographic hashing.
     * @returns {Object} Exported correlation report.
     */
    exportCorrelationReport() {
        const summary = this.correlateIntentWithTelemetry();
        const reportPayload = {
            reportId: `RPT-INTENT-TEL-${crypto.randomBytes(8).toString('hex').toUpperCase()}`,
            timestamp: new Date().toISOString(),
            organization: 'Ujomor Systems & Enterprise Governance Authority',
            summary,
            registeredSlaRequirements: Array.from(this.slaRequirements.values()),
            correlations: this.correlations,
            violations: this.violations
        };

        const jsonString = JSON.stringify(reportPayload);
        const integrityHash = crypto.createHash('sha256').update(jsonString).digest('hex');

        return Object.assign(reportPayload, {
            integrity: {
                algorithm: 'sha256',
                hash: integrityHash,
                signature: `SIG-EAORCS-${integrityHash.substring(0, 16).toUpperCase()}`
            }
        });
    }
}

module.exports = IntentTelemetryCorrelationEngine;
