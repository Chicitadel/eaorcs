/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Kernel / Enterprise Event Bus
 * File           : EnterpriseEventBus.js
 * Version        : 2026.2.0-LTS
 * Author         : Enterprise Architecture & Security Engineering Authority
 * Organization   : Ujomor Systems
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : ENTERPRISE | GOVERNMENT
 *
 * Governance:
 * - Enterprise Governed
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 * - Compliance Audit Ready
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST SP 800-53
 *
 * Copyright (c) 2026 Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const { EventEmitter } = require('events');

/**
 * Core Event Topics defined across the Enterprise Architecture & Trust Engine.
 */
const CORE_TOPICS = Object.freeze({
  REPOSITORY_UPDATED: 'RepositoryUpdated',
  DISCOVERY_COMPLETE: 'DiscoveryComplete',
  ARCHITECTURE_CHANGED: 'ArchitectureChanged',
  POLICY_EVALUATION: 'PolicyEvaluation',
  TRUST_SCORE_UPDATED: 'TrustScoreUpdated',
  EVIDENCE_CREATED: 'EvidenceCreated',
  COMPLIANCE_UPDATED: 'ComplianceUpdated',
  NOTIFICATIONS: 'Notifications',
  DASHBOARD_REFRESH: 'DashboardRefresh',
  DIGITAL_TWIN_UPDATED: 'DigitalTwinUpdated'
});

/**
 * Enterprise Event Bus
 * Pub/Sub streaming event bus supporting asynchronous event-driven architecture,
 * subscriber registration, event replay, trace ID correlation, dead-letter queues,
 * and event history ledger.
 */
class EnterpriseEventBus {
  /**
   * @param {Object} [options]
   * @param {number} [options.maxHistoryLength=1000] Maximum history ledger entries.
   * @param {number} [options.maxDLQSize=500] Maximum dead-letter queue entries.
   */
  constructor(options = {}) {
    this.maxHistoryLength = options.maxHistoryLength || 1000;
    this.maxDLQSize = options.maxDLQSize || 500;
    
    /** @type {Map<string, Set<Object>>} */
    this.subscriptions = new Map();
    
    /** @type {Array<Object>} */
    this.historyLedger = [];
    
    /** @type {Array<Object>} */
    this.deadLetterQueue = [];
    
    /** @type {string|null} */
    this.activeTraceId = null;
    
    this.subIdCounter = 0;
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(200);

    // Pre-initialize core topics in map
    Object.values(CORE_TOPICS).forEach((topic) => {
      this.subscriptions.set(topic, new Set());
    });
  }

  /**
   * Set active correlation trace context.
   * @param {string} traceId
   */
  setTraceContext(traceId) {
    this.activeTraceId = traceId;
  }

  /**
   * Clear active correlation trace context.
   */
  clearTraceContext() {
    this.activeTraceId = null;
  }

  /**
   * Register a subscriber for a topic or wildcard.
   * @param {string} topic Topic name or '*' for all topics.
   * @param {Function} handler Callback function (evt) => void|Promise<void>.
   * @param {Object} [options]
   * @param {string} [options.subscriberId] Unique subscriber identifier.
   * @param {number} [options.priority=10] Execution priority.
   * @param {boolean} [options.once=false] Auto-unsubscribe after first execution.
   * @returns {Object} Subscription handle with unsubscribe method.
   */
  subscribe(topic, handler, options = {}) {
    if (typeof handler !== 'function') {
      throw new Error(`[EnterpriseEventBus] Subscriber handler for topic '${topic}' must be a function.`);
    }

    if (!topic || typeof topic !== 'string') {
      throw new Error('[EnterpriseEventBus] Subscription topic must be a valid non-empty string.');
    }

    if (!this.subscriptions.has(topic)) {
      this.subscriptions.set(topic, new Set());
    }

    const subId = options.subscriberId || `sub_${++this.subIdCounter}_${Date.now()}`;
    const subscription = {
      id: subId,
      topic,
      handler,
      priority: options.priority || 10,
      once: options.once || false,
      createdAt: new Date().toISOString()
    };

    const topicSubs = this.subscriptions.get(topic);
    topicSubs.add(subscription);

    const unsubscribe = () => this.unsubscribe(topic, subId);

    return {
      id: subId,
      topic,
      unsubscribe
    };
  }

  /**
   * Alias for subscribe.
   */
  on(topic, handler, options = {}) {
    return this.subscribe(topic, handler, options);
  }

  /**
   * Subscribe once to a topic.
   */
  once(topic, handler, options = {}) {
    return this.subscribe(topic, handler, { ...options, once: true });
  }

  /**
   * Unsubscribe a handler or subscriber ID from a topic.
   * @param {string} topic
   * @param {string|Function} target Subscriber ID or handler function.
   * @returns {boolean} True if removed.
   */
  unsubscribe(topic, target) {
    if (!this.subscriptions.has(topic)) {
      return false;
    }

    const topicSubs = this.subscriptions.get(topic);
    let removed = false;

    for (const sub of topicSubs) {
      if (sub.id === target || sub.handler === target) {
        topicSubs.delete(sub);
        removed = true;
      }
    }

    return removed;
  }

  /**
   * Publish an event to a topic asynchronously or synchronously.
   * @param {string} topic Topic name.
   * @param {Object} payload Event data payload.
   * @param {Object} [options] Event metadata overrides.
   * @returns {Object} Published event envelope.
   */
  publish(topic, payload = {}, options = {}) {
    if (!topic || typeof topic !== 'string') {
      throw new Error('[EnterpriseEventBus] Cannot publish event without a valid topic string.');
    }

    const timestamp = new Date().toISOString();
    const eventId = options.eventId || `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const traceId = options.traceId || this.activeTraceId || `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const event = Object.freeze({
      eventId,
      topic,
      payload: Object.freeze(payload ? { ...payload } : {}),
      timestamp,
      traceId,
      correlationId: options.correlationId || null,
      source: options.source || 'EnterpriseKernel',
      version: options.version || '1.0'
    });

    // Record in history ledger
    this.recordInLedger(event);

    // Route event to matching subscribers
    const matchingSubs = this.getMatchingSubscribers(topic);

    // Sort by priority descending
    matchingSubs.sort((a, b) => b.priority - a.priority);

    for (const sub of matchingSubs) {
      try {
        const result = sub.handler(event);
        if (result && typeof result.then === 'function') {
          result.catch((err) => this.handleSubscriberError(event, sub, err));
        }
      } catch (err) {
        this.handleSubscriberError(event, sub, err);
      }

      if (sub.once) {
        this.unsubscribe(sub.topic, sub.id);
      }
    }

    // Emit via Node EventEmitter for external listeners if attached
    this.emitter.emit(topic, event);
    this.emitter.emit('*', event);

    return event;
  }

  /**
   * Alias for publish.
   */
  emit(topic, payload, options) {
    return this.publish(topic, payload, options);
  }

  /**
   * Internal error handler for failed subscriber dispatches. Moves failed events to DLQ.
   */
  handleSubscriberError(event, subscriber, error) {
    const dlqEntry = {
      dlqId: `dlq_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      event,
      subscriberId: subscriber.id,
      topic: subscriber.topic,
      errorMessage: error ? error.message : 'Unknown subscriber error',
      errorStack: error ? error.stack : null,
      failedAt: new Date().toISOString(),
      retryCount: 0
    };

    this.deadLetterQueue.push(dlqEntry);

    if (this.deadLetterQueue.length > this.maxDLQSize) {
      this.deadLetterQueue.shift();
    }
  }

  /**
   * Record event in history ledger with bounded size.
   */
  recordInLedger(event) {
    this.historyLedger.push(event);
    if (this.historyLedger.length > this.maxHistoryLength) {
      this.historyLedger.shift();
    }
  }

  /**
   * Retrieve subscribers matching a topic (including wildcard '*' and pattern matches).
   */
  getMatchingSubscribers(topic) {
    const matches = [];

    // Exact topic matches
    if (this.subscriptions.has(topic)) {
      matches.push(...Array.from(this.subscriptions.get(topic)));
    }

    // Wildcard matches
    if (this.subscriptions.has('*')) {
      matches.push(...Array.from(this.subscriptions.get('*')));
    }

    // Prefix wildcard e.g., 'Repository.*'
    for (const [subTopic, subs] of this.subscriptions.entries()) {
      if (subTopic.endsWith('*') && subTopic.length > 1) {
        const prefix = subTopic.slice(0, -1);
        if (topic.startsWith(prefix)) {
          matches.push(...Array.from(subs));
        }
      }
    }

    return matches;
  }

  /**
   * Replay historical events matching filter options.
   * @param {Object} [filter]
   * @param {string} [filter.topic] Filter by topic or '*'
   * @param {string} [filter.traceId] Filter by correlation trace ID
   * @param {string|Date} [filter.startTime] Filter events after start time
   * @param {string|Date} [filter.endTime] Filter events before end time
   * @param {Function} [filter.callback] Replay callback for each event
   * @returns {Array<Object>} List of replayed events
   */
  replay(filter = {}) {
    const events = this.getLedger(filter);

    if (typeof filter.callback === 'function') {
      events.forEach((evt) => {
        try {
          filter.callback(evt);
        } catch (err) {
          // Swallow replay callback errors or log
        }
      });
    } else {
      events.forEach((evt) => {
        const matchingSubs = this.getMatchingSubscribers(evt.topic);
        matchingSubs.forEach((sub) => {
          try {
            sub.handler(evt);
          } catch (err) {
            this.handleSubscriberError(evt, sub, err);
          }
        });
      });
    }

    return events;
  }

  /**
   * Retrieve event history ledger entries filtered by criteria.
   * @param {Object} [filter]
   * @returns {Array<Object>}
   */
  getLedger(filter = {}) {
    let result = [...this.historyLedger];

    if (filter.topic && filter.topic !== '*') {
      result = result.filter((e) => e.topic === filter.topic);
    }

    if (filter.traceId) {
      result = result.filter((e) => e.traceId === filter.traceId);
    }

    if (filter.startTime) {
      const startMs = new Date(filter.startTime).getTime();
      result = result.filter((e) => new Date(e.timestamp).getTime() >= startMs);
    }

    if (filter.endTime) {
      const endMs = new Date(filter.endTime).getTime();
      result = result.filter((e) => new Date(e.timestamp).getTime() <= endMs);
    }

    if (typeof filter.limit === 'number' && filter.limit > 0) {
      result = result.slice(-filter.limit);
    }

    return result;
  }

  /**
   * Alias for getLedger.
   */
  getHistory(filter) {
    return this.getLedger(filter);
  }

  /**
   * Retrieve current dead-letter queue entries.
   * @returns {Array<Object>}
   */
  getDLQ() {
    return [...this.deadLetterQueue];
  }

  /**
   * Retry processing failed events from DLQ.
   * @param {Function} [retryHandler] Custom handler or default re-dispatch.
   * @returns {number} Count of successfully retried events.
   */
  retryDLQ(retryHandler) {
    const queueToProcess = [...this.deadLetterQueue];
    this.deadLetterQueue = [];
    let successCount = 0;

    for (const dlqEntry of queueToProcess) {
      dlqEntry.retryCount += 1;
      let success = false;

      try {
        if (typeof retryHandler === 'function') {
          retryHandler(dlqEntry.event, dlqEntry);
          success = true;
        } else {
          const matchingSubs = this.getMatchingSubscribers(dlqEntry.event.topic);
          const sub = matchingSubs.find((s) => s.id === dlqEntry.subscriberId);
          if (sub) {
            sub.handler(dlqEntry.event);
            success = true;
          }
        }
      } catch (err) {
        dlqEntry.errorMessage = err.message;
        dlqEntry.failedAt = new Date().toISOString();
      }

      if (success) {
        successCount++;
      } else {
        this.deadLetterQueue.push(dlqEntry);
      }
    }

    return successCount;
  }

  /**
   * Clear dead-letter queue.
   */
  clearDLQ() {
    this.deadLetterQueue = [];
  }

  /**
   * Get list of registered topics (core topics + actively subscribed topics).
   * @returns {Array<string>}
   */
  getTopics() {
    const activeTopics = new Set([...Object.values(CORE_TOPICS), ...this.subscriptions.keys()]);
    return Array.from(activeTopics);
  }

  /**
   * Clear all subscribers, history, and DLQ.
   */
  reset() {
    this.subscriptions.clear();
    this.historyLedger = [];
    this.deadLetterQueue = [];
    this.activeTraceId = null;
    Object.values(CORE_TOPICS).forEach((topic) => {
      this.subscriptions.set(topic, new Set());
    });
  }
}

// Export Constants and Class
EnterpriseEventBus.CORE_TOPICS = CORE_TOPICS;
module.exports = EnterpriseEventBus;
