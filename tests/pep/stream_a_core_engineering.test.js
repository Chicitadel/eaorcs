/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : PEP Stream A — Core Engineering & Blueprint Parity Test Suite
 * File           : tests/pep/stream_a_core_engineering.test.js
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

const assert = require('assert');
const KernelOptimizationEngine = require('../../engine/kernel/KernelOptimizationEngine');

async function runStreamACoreEngineeringTests() {
  console.log('================================================================================');
  console.log('  PEP STREAM A: CORE ENGINEERING & KERNEL PERFORMANCE TEST SUITE');
  console.log('  Target Release: 2026.1.0-LTS');
  console.log('================================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  const engine = new KernelOptimizationEngine({
    batchTimeoutMs: 5,
    maxBatchSize: 50,
    latencySlaMs: 10
  });

  // --- Test 1: Event Loop Batching ---
  totalTests++;
  try {
    console.log('[TEST 1] Verifying Event Loop Batching (batchEvents)...');
    
    // Batch batch of 10 events
    const events = Array.from({ length: 10 }, (_, i) => ({ id: i + 1, type: 'KERNEL_EVENT', data: `payload_${i}` }));
    
    const batchPromise = engine.batchEvents(events, async (batch) => {
      return batch.map(evt => ({ ...evt, status: 'PROCESSED', processedBy: 'KernelOptimizationEngine' }));
    });

    const results = await batchPromise;
    assert.strictEqual(results.length, 10, 'Should process all 10 batched events');
    assert.strictEqual(results[0].status, 'PROCESSED', 'Event status should be updated by batch processor');
    assert.strictEqual(results[0].processedBy, 'KernelOptimizationEngine', 'Processor attribution should match');

    // Test maxBatchSize auto-flush trigger
    const bulkEvents = Array.from({ length: 50 }, (_, i) => ({ id: 100 + i, type: 'BULK_EVENT' }));
    const bulkResults = await engine.batchEvents(bulkEvents);
    assert.strictEqual(bulkResults.length, 50, 'Auto-flushed batch should process all 50 events');

    console.log('  [PASS] Event Loop Batching verified successfully.');
    passedTests++;
  } catch (err) {
    console.error('  [FAIL] Event Loop Batching failed:', err.message);
  }

  // --- Test 2: Memory Pool Management ---
  totalTests++;
  try {
    console.log('[TEST 2] Verifying Memory Pool Management (manageMemoryPool)...');

    // Create custom memory pool
    const createResult = engine.manageMemoryPool('create', 'taskPool', {
      capacity: 100,
      factory: () => ({ id: null, payload: null, allocatedAt: 0 })
    });
    assert.strictEqual(createResult.created, true, 'Memory pool should be created');

    // Allocate items from pool
    const item1 = engine.manageMemoryPool('allocate', 'taskPool');
    item1.id = 'task_1';
    item1.payload = { data: 'test_payload' };

    const item2 = engine.manageMemoryPool('allocate', 'taskPool');
    item2.id = 'task_2';

    let poolStats = engine.manageMemoryPool('stats', 'taskPool');
    assert.strictEqual(poolStats.allocatedCount, 2, 'Allocated count should equal 2');
    assert.strictEqual(poolStats.availableCount, 98, 'Available count should equal 98');

    // Release item back to pool
    const releaseStatus = engine.manageMemoryPool('release', 'taskPool', { item: item1 });
    assert.strictEqual(releaseStatus, true, 'Item release should succeed');
    assert.strictEqual(item1.id, null, 'Released object properties should be cleaned');

    poolStats = engine.manageMemoryPool('stats', 'taskPool');
    assert.strictEqual(poolStats.allocatedCount, 1, 'Allocated count should drop to 1 after release');
    assert.strictEqual(poolStats.availableCount, 99, 'Available count should rise to 99 after release');
    assert.strictEqual(poolStats.totalAllocations, 2, 'Total allocations counter verified');
    assert.strictEqual(poolStats.totalReleases, 1, 'Total releases counter verified');

    console.log('  [PASS] Memory Pool Allocation & Release verified successfully.');
    passedTests++;
  } catch (err) {
    console.error('  [FAIL] Memory Pool Management failed:', err.message);
  }

  // --- Test 3: Latency SLA Tracking ---
  totalTests++;
  try {
    console.log('[TEST 3] Verifying Latency SLA Tracking (trackExecutionLatency)...');

    // Measure fast synchronous operation (<10ms SLA)
    const trackedResult = await engine.trackExecutionLatency('kernel.fastTask', async () => {
      let sum = 0;
      for (let i = 0; i < 1000; i++) sum += i;
      return sum;
    });
    assert.strictEqual(trackedResult, 499500, 'Tracked execution function should return computed result');

    // Measure explicit duration
    const metricRecord = engine.trackExecutionLatency('kernel.simulatedOperation', 2.45, { scope: 'test' });
    assert.strictEqual(metricRecord.slaMet, true, '2.45ms duration should meet sub-10ms SLA threshold');
    assert.strictEqual(metricRecord.slaThresholdMs, 10, 'SLA threshold should default to 10ms');

    const metrics = engine.getMetrics();
    assert(metrics.stats.slaComplianceRate >= 99.0, 'SLA compliance rate should be near 100%');

    console.log('  [PASS] Execution Latency SLA Tracking verified successfully.');
    passedTests++;
  } catch (err) {
    console.error('  [FAIL] Latency SLA Tracking failed:', err.message);
  }

  // --- Test 4: Sub-10ms Performance Benchmarking ---
  totalTests++;
  try {
    console.log('[TEST 4] Verifying Sub-10ms Performance Benchmarking (benchmarkPerformance)...');

    const benchmarkReport = await engine.benchmarkPerformance(async (index) => {
      // High performance microtask operation
      Math.sqrt(index * 42.5);
    }, 1000, { latencySlaMs: 10 });

    console.log(`    Iterations     : ${benchmarkReport.iterations}`);
    console.log(`    Total Duration : ${benchmarkReport.totalDurationMs} ms`);
    console.log(`    Ops / Second   : ${benchmarkReport.opsPerSecond}`);
    console.log(`    Average Latency: ${benchmarkReport.avgLatencyMs} ms`);
    console.log(`    P95 Latency    : ${benchmarkReport.p95LatencyMs} ms`);
    console.log(`    SLA Met (<10ms): ${benchmarkReport.slaMet}`);

    assert.strictEqual(benchmarkReport.iterations, 1000, 'Benchmark iterations count should match');
    assert.strictEqual(benchmarkReport.slaMet, true, 'Average per-op latency must satisfy sub-10ms SLA target');
    assert(benchmarkReport.avgLatencyMs < 10.0, 'Average latency must be strictly sub-10ms');
    assert(benchmarkReport.opsPerSecond > 50000, 'High-throughput execution should exceed 50,000 ops/sec');

    console.log('  [PASS] Sub-10ms Performance Benchmarking verified successfully.');
    passedTests++;
  } catch (err) {
    console.error('  [FAIL] Sub-10ms Performance Benchmarking failed:', err.message);
  }

  // --- Test 5: Kernel Stability & Metrics Aggregation ---
  totalTests++;
  try {
    console.log('[TEST 5] Verifying Kernel Stability & Metrics Aggregation...');

    const systemMetrics = engine.getMetrics();
    assert.strictEqual(systemMetrics.status, 'HEALTHY', 'Engine status should report HEALTHY');
    assert(systemMetrics.stats.totalEventsBatched >= 60, 'Batched event counter should accumulate correctly');
    assert(systemMetrics.stats.totalMemoryAllocations >= 2, 'Memory allocation count accumulated');

    // Verify engine reset behavior
    engine.reset();
    const resetMetrics = engine.getMetrics();
    assert.strictEqual(resetMetrics.stats.totalEventsBatched, 0, 'Reset should zero out batched events counter');
    assert.strictEqual(resetMetrics.totalLatencyRecords, 0, 'Reset should clear latency records log');

    console.log('  [PASS] Kernel Stability & Metrics Aggregation verified successfully.');
    passedTests++;
  } catch (err) {
    console.error('  [FAIL] Kernel Stability verification failed:', err.message);
  }

  console.log('\n================================================================================');
  console.log(`  STREAM A SUMMARY: ${passedTests}/${totalTests} Tests Passed (${((passedTests / totalTests) * 100).toFixed(0)}% Pass Rate)`);
  console.log('================================================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

if (require.main === module) {
  runStreamACoreEngineeringTests().catch(err => {
    console.error('Fatal execution error in Stream A test suite:', err);
    process.exit(1);
  });
}

module.exports = runStreamACoreEngineeringTests;
