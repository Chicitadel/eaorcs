/******************************************************************************
 * Project        : Universal Autonomous Governance Operating System (UAIGOS)
 * Module         : EAORCS Provider Adapters (Stream S2)
 * File           : TelemetryProviderAdapter.js
 * Version        : 2026.1-LTS (v1.0.0-FROZEN)
 * Author         : Enterprise Architecture Council & Systems Engineering
 * Organization   : Ujomor Enterprise Systems
 * Created Date   : 2026-08-02
 * Last Modified  : 2026-08-02
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Enterprise Policy Governed
 * - Architecture Frozen (ADR-002)
 * - Security Reviewed
 * - Provider Abstraction & Branding Standard
 ******************************************************************************/

'use strict';

/**
 * TelemetryProviderAdapter
 * Unified abstraction layer for OpenTelemetry, Prometheus, and Jaeger observability backends.
 */
class TelemetryProviderAdapter {
    /**
     * @param {Object} config
     * @param {string} [config.provider='opentelemetry'] - Provider type: 'opentelemetry', 'prometheus', 'jaeger'
     * @param {string} [config.endpoint] - Telemetry collector HTTP/gRPC endpoint
     * @param {string} [config.serviceName='eaorcs-engine'] - Microservice or system tag
     * @param {string} [config.environment='production'] - Operational environment tag
     */
    constructor(config = {}) {
        this.provider = (config.provider || 'opentelemetry').toLowerCase();
        this.endpoint = config.endpoint || 'http://telemetry.eaorcs.enterprise.local:4318';
        this.serviceName = config.serviceName || 'eaorcs-engine';
        this.environment = config.environment || 'production';
        this.metricsRegistry = new Map();
        this.activeSpans = new Map();

        this._validateProvider();
    }

    _validateProvider() {
        const supported = ['opentelemetry', 'prometheus', 'jaeger'];
        if (!supported.includes(this.provider)) {
            throw new Error(`[TelemetryProviderAdapter] Unsupported provider '${this.provider}'. Supported: ${supported.join(', ')}`);
        }
    }

    getProviderName() {
        return this.provider;
    }

    /**
     * Emit a metric datapoint (Counter, Gauge, or Histogram)
     * @param {string} name - Metric key (e.g., 'eaorcs_audit_evaluations_total')
     * @param {number} value - Numerical value
     * @param {string} [type='counter'] - 'counter' | 'gauge' | 'histogram'
     * @param {Object} [tags={}] - Metric dimensions/labels
     */
    emitMetric(name, value, type = 'counter', tags = {}) {
        if (!name || typeof value !== 'number') {
            throw new Error('[TelemetryProviderAdapter] Metric name and numeric value are required.');
        }

        const metricKey = `${name}:${JSON.stringify(tags)}`;
        const existing = this.metricsRegistry.get(metricKey) || {
            name,
            type,
            value: type === 'counter' ? 0 : value,
            tags: { service: this.serviceName, env: this.environment, ...tags },
            timestamp: Date.now()
        };

        if (type === 'counter') {
            existing.value += value;
        } else {
            existing.value = value;
        }

        existing.timestamp = Date.now();
        this.metricsRegistry.set(metricKey, existing);

        return {
            status: 'emitted',
            provider: this.provider,
            metric: existing
        };
    }

    /**
     * Start a distributed tracing span
     * @param {string} spanName 
     * @param {Object} [attributes={}] 
     * @returns {Object} Span handle
     */
    startSpan(spanName, attributes = {}) {
        const spanId = `span_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        const span = {
            spanId,
            traceId: `trace_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
            name: spanName,
            startTime: Date.now(),
            attributes: {
                'service.name': this.serviceName,
                'deployment.environment': this.environment,
                ...attributes
            },
            status: 'ACTIVE'
        };

        this.activeSpans.set(spanId, span);
        return span;
    }

    /**
     * End a tracing span
     * @param {string} spanId 
     * @param {Object} [status={ code: 'OK' }] 
     * @returns {Object} Completed span summary
     */
    endSpan(spanId, status = { code: 'OK' }) {
        const span = this.activeSpans.get(spanId);
        if (!span) {
            return { error: `Span '${spanId}' not found or already ended.` };
        }

        span.endTime = Date.now();
        span.durationMs = span.endTime - span.startTime;
        span.status = status.code;
        this.activeSpans.delete(spanId);

        return {
            status: 'ended',
            provider: this.provider,
            span
        };
    }

    /**
     * Send structured governance audit telemetry event
     * @param {Object} eventData 
     */
    sendAuditLog(eventData = {}) {
        return {
            dispatched: true,
            provider: this.provider,
            service: this.serviceName,
            endpoint: this.endpoint,
            event: {
                eventId: `evt_${Date.now()}`,
                timestamp: new Date().toISOString(),
                ...eventData
            }
        };
    }

    /**
     * Export accumulated metrics in Prometheus Exposition text format or OTel JSON payload format
     * @returns {string|Object} Metric payload
     */
    exportMetrics() {
        if (this.provider === 'prometheus') {
            let prometheusFormat = `# EAORCS Engine Prometheus Metrics Output\n`;
            for (const [, metric] of this.metricsRegistry.entries()) {
                const tagStr = Object.entries(metric.tags)
                    .map(([k, v]) => `${k}="${v}"`)
                    .join(',');
                prometheusFormat += `# TYPE ${metric.name} ${metric.type}\n`;
                prometheusFormat += `${metric.name}{${tagStr}} ${metric.value}\n`;
            }
            return prometheusFormat;
        }

        // OpenTelemetry / Jaeger JSON Payload format
        const metricsList = Array.from(this.metricsRegistry.values());
        return {
            resourceMetrics: [{
                resource: {
                    attributes: [
                        { key: 'service.name', value: { stringValue: this.serviceName } },
                        { key: 'deployment.environment', value: { stringValue: this.environment } }
                    ]
                },
                metrics: metricsList,
                provider: this.provider
            }]
        };
    }
}

module.exports = TelemetryProviderAdapter;
