/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Kernel / Optimization Engine
 * File           : KernelOptimizationEngine.js
 * Version        : 2026.1.0-LTS
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | GOVERNMENT
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
 * Copyright (c) 2026 Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

class KernelOptimizationEngine {
  /**
   * Initializes the Kernel Optimization Engine.
   * @param {Object} options Configuration parameters.
   * @param {number} [options.batchTimeoutMs=5] Timeout for auto-flushing event batches.
   * @param {number} [options.maxBatchSize=100] Maximum events per batch before auto-flush.
   * @param {number} [options.latencySlaMs=10] Latency SLA threshold in milliseconds (sub-10ms benchmark).
   */
  constructor(options = {}) {
    this.batchTimeoutMs = options.batchTimeoutMs || 5;
    this.maxBatchSize = options.maxBatchSize || 100;
    this.latencySlaMs = options.latencySlaMs || 10;

    /** @type {Map<string, Object>} */
    this.memoryPools = new Map();

    /** @type {Array<Object>} */
    this.latencyRecords = [];
    this.maxLatencyRecords = 10000;

    /** @type {Array<Object>} */
    this.batchQueue = [];
    this.batchTimer = null;
    this.isProcessingBatch = false;

    this.stats = {
      totalEventsBatched: 0,
      totalBatchesProcessed: 0,
      totalMemoryAllocations: 0,
      totalMemoryReleases: 0,
      slaViolations: 0,
      slaComplianceRate: 100.0
    };
  }

  /**
   * Asynchronously batches events for high-throughput microtask/event-loop processing.
   * @param {Array<Object>|Object} events Single event object or array of events.
   * @param {Function} [processorFn] Custom processing function for batch execution.
   * @returns {Promise<Array<any>>} Promise resolving to processing results.
   */
  async batchEvents(events, processorFn = null) {
    const eventList = Array.isArray(events) ? events : [events];
    if (eventList.length === 0) {
      return [];
    }

    const defaultProcessor = async (batch) => batch.map(evt => ({
      ...evt,
      processedAt: Date.now(),
      status: 'PROCESSED'
    }));

    const activeProcessor = processorFn || defaultProcessor;

    return new Promise((resolve, reject) => {
      const batchItem = {
        events: eventList,
        processor: activeProcessor,
        resolve,
        reject,
        queuedAt: process.hrtime.bigint()
      };

      this.batchQueue.push(batchItem);
      this.stats.totalEventsBatched += eventList.length;

      const totalPendingEvents = this.batchQueue.reduce((acc, b) => acc + b.events.length, 0);

      if (totalPendingEvents >= this.maxBatchSize) {
        this._flushBatch();
      } else if (!this.batchTimer) {
        this.batchTimer = setTimeout(() => {
          this.batchTimer = null;
          this._flushBatch();
        }, this.batchTimeoutMs);
      }
    });
  }

  /**
   * Internal executor for event batch processing with latency SLA tracking.
   * @private
   */
  async _flushBatch() {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    if (this.batchQueue.length === 0 || this.isProcessingBatch) {
      return;
    }

    this.isProcessingBatch = true;
    const currentItems = [...this.batchQueue];
    this.batchQueue = [];

    const startTime = process.hrtime.bigint();

    try {
      for (const item of currentItems) {
        try {
          const results = await item.processor(item.events);
          item.resolve(results);
        } catch (err) {
          item.reject(err);
        }
      }

      this.stats.totalBatchesProcessed++;
    } finally {
      const endTime = process.hrtime.bigint();
      const durationMs = Number(endTime - startTime) / 1e6;

      this.trackExecutionLatency('kernel.batchEvents', durationMs, {
        batchCount: currentItems.length,
        eventCount: currentItems.reduce((acc, i) => acc + i.events.length, 0)
      });

      this.isProcessingBatch = false;

      // Process any remaining items queued during execution
      if (this.batchQueue.length > 0) {
        setImmediate(() => this._flushBatch());
      }
    }
  }

  /**
   * Manages high-performance memory pool allocations and reuse.
   * @param {'create'|'allocate'|'release'|'stats'|'clear'} action Operation to perform.
   * @param {string} [poolName] Name identifier of target pool.
   * @param {Object} [options] Pool management parameters.
   * @param {number} [options.capacity=1000] Default capacity for pool creation.
   * @param {Function} [options.factory] Object factory function for pre-allocation.
   * @param {Object} [options.item] Item instance to release.
   * @returns {Object|boolean} Output object or status payload.
   */
  manageMemoryPool(action, poolName = 'default', options = {}) {
    switch (action) {
      case 'create': {
        const capacity = options.capacity || 1000;
        const factory = options.factory || (() => ({ id: null, payload: null, createdAt: Date.now() }));
        const available = [];

        for (let i = 0; i < capacity; i++) {
          available.push(factory());
        }

        const pool = {
          name: poolName,
          capacity,
          factory,
          available,
          allocated: new Set(),
          totalAllocations: 0,
          totalReleases: 0
        };

        this.memoryPools.set(poolName, pool);
        return { created: true, poolName, capacity };
      }

      case 'allocate': {
        let pool = this.memoryPools.get(poolName);
        if (!pool) {
          this.manageMemoryPool('create', poolName, options);
          pool = this.memoryPools.get(poolName);
        }

        let item;
        if (pool.available.length > 0) {
          item = pool.available.pop();
        } else {
          item = pool.factory();
        }

        pool.allocated.add(item);
        pool.totalAllocations++;
        this.stats.totalMemoryAllocations++;
        return item;
      }

      case 'release': {
        const pool = this.memoryPools.get(poolName);
        if (!pool) {
          throw new Error(`Memory pool '${poolName}' does not exist.`);
        }

        const item = options.item;
        if (!item) {
          throw new Error('Memory pool release requires an options.item parameter.');
        }

        if (pool.allocated.has(item)) {
          pool.allocated.delete(item);
        }

        // Clean properties if standard object
        if (typeof item === 'object' && item !== null) {
          if ('id' in item) item.id = null;
          if ('payload' in item) item.payload = null;
        }

        pool.available.push(item);
        pool.totalReleases++;
        this.stats.totalMemoryReleases++;
        return true;
      }

      case 'stats': {
        if (poolName && this.memoryPools.has(poolName)) {
          const p = this.memoryPools.get(poolName);
          return {
            name: p.name,
            capacity: p.capacity,
            availableCount: p.available.length,
            allocatedCount: p.allocated.size,
            totalAllocations: p.totalAllocations,
            totalReleases: p.totalReleases,
            utilizationPercent: p.capacity > 0 ? Number(((p.allocated.size / p.capacity) * 100).toFixed(2)) : 0
          };
        }

        const allStats = {};
        for (const [name, p] of this.memoryPools.entries()) {
          allStats[name] = {
            capacity: p.capacity,
            availableCount: p.available.length,
            allocatedCount: p.allocated.size,
            totalAllocations: p.totalAllocations,
            totalReleases: p.totalReleases
          };
        }
        return allStats;
      }

      case 'clear': {
        if (poolName && this.memoryPools.has(poolName)) {
          this.memoryPools.delete(poolName);
        } else if (action === 'clear' && poolName === 'all') {
          this.memoryPools.clear();
        }
        return true;
      }

      default:
        throw new Error(`Invalid memory pool action '${action}'. Valid actions: create, allocate, release, stats, clear.`);
    }
  }

  /**
   * Tracks and records execution latency against configured SLA targets (sub-10ms).
   * @param {string} operationName Name of kernel operation.
   * @param {Function|number} fnOrDuration Function/Promise to measure OR pre-measured duration in milliseconds.
   * @param {Object} [metadata={}] Additional operational metadata.
   * @returns {Promise<any>|Object} Result of function or latency measurement object.
   */
  trackExecutionLatency(operationName, fnOrDuration, metadata = {}) {
    if (typeof fnOrDuration === 'function') {
      const startTime = process.hrtime.bigint();
      const execute = async () => {
        try {
          const res = await fnOrDuration();
          return res;
        } finally {
          const endTime = process.hrtime.bigint();
          const durationMs = Number(endTime - startTime) / 1e6;
          this._recordLatencyMetric(operationName, durationMs, metadata);
        }
      };
      return execute();
    }

    const durationMs = Number(fnOrDuration);
    return this._recordLatencyMetric(operationName, durationMs, metadata);
  }

  /**
   * Internal latency record logger.
   * @private
   */
  _recordLatencyMetric(operationName, durationMs, metadata = {}) {
    const slaMet = durationMs <= this.latencySlaMs;

    if (!slaMet) {
      this.stats.slaViolations++;
    }

    const record = {
      id: `lat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      operation: operationName,
      durationMs: Number(durationMs.toFixed(4)),
      slaThresholdMs: this.latencySlaMs,
      slaMet,
      timestamp: Date.now(),
      metadata
    };

    this.latencyRecords.push(record);
    if (this.latencyRecords.length > this.maxLatencyRecords) {
      this.latencyRecords.shift();
    }

    const totalRecords = this.latencyRecords.length;
    const totalMet = this.latencyRecords.filter(r => r.slaMet).length;
    this.stats.slaComplianceRate = totalRecords > 0 ? Number(((totalMet / totalRecords) * 100).toFixed(2)) : 100.0;

    return record;
  }

  /**
   * Conducts sub-10ms performance benchmarking for kernel operations.
   * @param {Function} benchmarkFn Synchronous or asynchronous operation to benchmark.
   * @param {number} [iterations=1000] Number of test iterations to execute.
   * @param {Object} [options={}] Additional benchmark options.
   * @returns {Promise<Object>} Comprehensive benchmark report object.
   */
  async benchmarkPerformance(benchmarkFn, iterations = 1000, options = {}) {
    if (typeof benchmarkFn !== 'function') {
      throw new TypeError('benchmarkPerformance requires a valid function argument.');
    }

    const slaTargetMs = options.latencySlaMs || this.latencySlaMs;
    const durationalMetrics = [];

    const overallStart = process.hrtime.bigint();

    for (let i = 0; i < iterations; i++) {
      const iterStart = process.hrtime.bigint();
      await benchmarkFn(i);
      const iterEnd = process.hrtime.bigint();
      const iterDurationMs = Number(iterEnd - iterStart) / 1e6;
      durationalMetrics.push(iterDurationMs);
    }

    const overallEnd = process.hrtime.bigint();
    const totalDurationMs = Number(overallEnd - overallStart) / 1e6;

    durationalMetrics.sort((a, b) => a - b);

    const sumLatency = durationalMetrics.reduce((a, b) => a + b, 0);
    const avgLatencyMs = sumLatency / iterations;
    const minLatencyMs = durationalMetrics[0];
    const maxLatencyMs = durationalMetrics[durationalMetrics.length - 1];
    const p50LatencyMs = durationalMetrics[Math.floor(iterations * 0.50)];
    const p95LatencyMs = durationalMetrics[Math.floor(iterations * 0.95)];
    const p99LatencyMs = durationalMetrics[Math.floor(iterations * 0.99)];
    const opsPerSecond = totalDurationMs > 0 ? Math.round((iterations / totalDurationMs) * 1000) : iterations;

    const report = {
      iterations,
      totalDurationMs: Number(totalDurationMs.toFixed(2)),
      opsPerSecond,
      avgLatencyMs: Number(avgLatencyMs.toFixed(4)),
      minLatencyMs: Number(minLatencyMs.toFixed(4)),
      maxLatencyMs: Number(maxLatencyMs.toFixed(4)),
      p50LatencyMs: Number(p50LatencyMs.toFixed(4)),
      p95LatencyMs: Number(p95LatencyMs.toFixed(4)),
      p99LatencyMs: Number(p99LatencyMs.toFixed(4)),
      slaThresholdMs: slaTargetMs,
      slaMet: avgLatencyMs <= slaTargetMs,
      timestamp: new Date().toISOString()
    };

    this.trackExecutionLatency('kernel.benchmarkPerformance', totalDurationMs, {
      iterations,
      avgLatencyMs: report.avgLatencyMs,
      opsPerSecond
    });

    return report;
  }

  /**
   * Retrieves overall engine performance metrics and status.
   * @returns {Object} Operational status metrics payload.
   */
  getMetrics() {
    const records = this.latencyRecords;
    const avgLatencyMs = records.length > 0
      ? Number((records.reduce((acc, r) => acc + r.durationMs, 0) / records.length).toFixed(4))
      : 0;

    return {
      status: 'HEALTHY',
      stats: { ...this.stats, averageLatencyMs: avgLatencyMs },
      memoryPools: this.manageMemoryPool('stats'),
      totalLatencyRecords: records.length,
      latencySlaMs: this.latencySlaMs
    };
  }

  /**
   * Resets engine state, metrics, and queues.
   */
  reset() {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    this.batchQueue = [];
    this.isProcessingBatch = false;
    this.latencyRecords = [];
    this.memoryPools.clear();
    this.stats = {
      totalEventsBatched: 0,
      totalBatchesProcessed: 0,
      totalMemoryAllocations: 0,
      totalMemoryReleases: 0,
      slaViolations: 0,
      slaComplianceRate: 100.0
    };
  }
}

module.exports = KernelOptimizationEngine;
