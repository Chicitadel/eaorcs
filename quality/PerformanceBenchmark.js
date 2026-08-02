/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Stream Gamma — Phase 4 Performance Qualification Engine
 * File           : PerformanceBenchmark.js
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

const crypto = require('crypto');

// Shared Fixture Data for High-Precision Benchmarks
const MOCK_EVIDENCE = { completeness: 0.95, accuracy: 0.98, freshness: 0.90, verifiability: 1.0 };
const MOCK_1KB_BUFFER = Buffer.alloc(1024);

const MOCK_PASSPORT = {
  passportId: 'OSAP-2026-LTS-001',
  issuer: 'Ujomor Governance Authority',
  status: 'ACTIVE',
  securityClass: 'RESTRICTED',
  timestamp: '2026-08-01T12:00:00Z',
  signature: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
};
const MOCK_PASSPORT_STR = JSON.stringify(MOCK_PASSPORT);

const MOCK_MANIFEST = Array.from({ length: 90 }, (_, i) => ({
  id: `REQ-BP-${i + 1}`,
  name: `Requirement ${i + 1}`,
  category: 'GOVERNANCE',
  status: 'COMPLIANT'
}));

const MOCK_26_HASHES = Array.from({ length: 26 }, (_, i) =>
  crypto.createHash('sha256').update(`leaf-hash-seed-${i}`).digest('hex')
);

function computeMerkleRoot(hashes) {
  if (!hashes || hashes.length === 0) return '';
  let currentLevel = [...hashes];
  while (currentLevel.length > 1) {
    const nextLevel = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      if (i + 1 < currentLevel.length) {
        const combined = currentLevel[i] + currentLevel[i + 1];
        nextLevel.push(crypto.createHash('sha256').update(combined).digest('hex'));
      } else {
        const combined = currentLevel[i] + currentLevel[i];
        nextLevel.push(crypto.createHash('sha256').update(combined).digest('hex'));
      }
    }
    currentLevel = nextLevel;
  }
  return currentLevel[0];
}

class PerformanceBenchmark {
  /**
   * Run benchmark for a given function with warmup, pure batch timing, and latency sampling.
   * @param {Function} fn - The operation to benchmark
   * @param {number} iterations - Number of iterations to measure (default: 1000)
   * @returns {Object} { timingsNs: number[], batchNs: number, iterations: number }
   */
  time(fn, iterations = 1000) {
    // Warm up: run fn 2000 times to trigger JIT optimization & C++ binding warmup
    for (let i = 0; i < 2000; i++) {
      fn();
    }

    // Measure pure batch execution duration
    const tBatchStart = process.hrtime.bigint();
    for (let i = 0; i < iterations; i++) {
      fn();
    }
    const tBatchEnd = process.hrtime.bigint();
    const batchNs = Number(tBatchEnd - tBatchStart);

    // Measure nanosecond per-iteration latencies for P50/P95/P99 distribution analysis
    const sampleCount = Math.min(1000, iterations);
    const timingsNs = new Array(sampleCount);
    for (let i = 0; i < sampleCount; i++) {
      const t0 = process.hrtime.bigint();
      fn();
      const t1 = process.hrtime.bigint();
      timingsNs[i] = Number(t1 - t0);
    }

    return { timingsNs, batchNs, iterations };
  }

  /**
   * Compute percentile value from sorted array of numbers.
   * @param {number[]} sorted - Array of sorted numbers
   * @param {number} p - Percentile rank (0 - 100)
   * @returns {number} Value at the target percentile
   */
  computePercentile(sorted, p) {
    if (!sorted || sorted.length === 0) return 0;
    const idx = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, idx)];
  }

  /**
   * Compute statistical metrics from timing result object.
   * @param {Object|number[]} timingData - Object with timingsNs, batchNs, iterations or array of timings
   * @returns {Object} Calculated stats (min, max, mean, p50, p95, p99 in µs, throughput in ops/s)
   */
  computeStats(timingData) {
    let timingsNs;
    let batchNs;
    let iterations;

    if (Array.isArray(timingData)) {
      timingsNs = timingData;
      batchNs = timingsNs.reduce((sum, t) => sum + t, 0);
      iterations = timingsNs.length;
    } else if (timingData && timingData.timingsNs) {
      timingsNs = timingData.timingsNs;
      batchNs = timingData.batchNs || timingsNs.reduce((sum, t) => sum + t, 0);
      iterations = timingData.iterations || timingsNs.length;
    } else {
      return {
        min: 0, max: 0, mean: 0, p50: 0, p95: 0, p99: 0, throughput: 0, unit: 'ops/s', latencyUnit: 'µs'
      };
    }

    const sorted = [...timingsNs].sort((a, b) => a - b);
    const count = sorted.length;
    const totalSampleNs = sorted.reduce((sum, t) => sum + t, 0);

    const min = Number((sorted[0] / 1000).toFixed(3));
    const max = Number((sorted[count - 1] / 1000).toFixed(3));
    const mean = Number((totalSampleNs / count / 1000).toFixed(3));

    const p50 = Number((this.computePercentile(sorted, 50) / 1000).toFixed(3));
    const p95 = Number((this.computePercentile(sorted, 95) / 1000).toFixed(3));
    const p99 = Number((this.computePercentile(sorted, 99) / 1000).toFixed(3));

    // Throughput calculated using pure wall-clock batch duration across total iterations
    const totalTimeSec = batchNs / 1e9;
    const throughput = Math.round(iterations / (totalTimeSec || 1e-9));

    return {
      min,
      max,
      mean,
      p50,
      p95,
      p99,
      throughput,
      unit: 'ops/s',
      latencyUnit: 'µs'
    };
  }

  /**
   * Measure heap memory usage delta across iterations.
   * @param {Function} fn - Operation to execute
   * @param {number} iterations - Number of executions
   * @returns {Object} Heap usage statistics
   */
  measureMemory(fn, iterations = 1000) {
    if (global.gc) global.gc();
    const before = process.memoryUsage().heapUsed;

    for (let i = 0; i < iterations; i++) {
      fn();
    }

    const after = process.memoryUsage().heapUsed;
    if (global.gc) global.gc();

    const delta = Math.max(0, after - before);
    const deltaPerOp = Number((delta / iterations).toFixed(2));

    return {
      before,
      after,
      delta,
      deltaPerOp,
      unit: 'bytes'
    };
  }

  // --- Benchmark Target Operations ---

  static trustScoreOperation() {
    return Object.values(MOCK_EVIDENCE).reduce((s, v) => s + v, 0) / 4;
  }

  static sha256Operation() {
    if (typeof crypto.hash === 'function') {
      return crypto.hash('sha256', MOCK_1KB_BUFFER, 'hex');
    }
    return crypto.createHash('sha256').update(MOCK_1KB_BUFFER).digest('hex');
  }

  static jsonValidationOperation() {
    return JSON.parse(MOCK_PASSPORT_STR);
  }

  static requirementLookupOperation() {
    return MOCK_MANIFEST.find(r => r.id === 'REQ-BP-45');
  }

  static merkleRootOperation() {
    return computeMerkleRoot(MOCK_26_HASHES);
  }
}

module.exports = PerformanceBenchmark;
