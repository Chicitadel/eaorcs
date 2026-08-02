'use strict';
/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : CustomerPilotInstrumentation
 * File           : tests/phase19/stream_o4_customer_pilot_instrumentation.test.js
 * Version        : 2026.19.0
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
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

const PilotInstrumentationEngine = require('../../engine/pilot/PilotInstrumentationEngine.js');
const TenantUsageCollector = require('../../engine/pilot/TenantUsageCollector.js');
const PilotHealthMonitor = require('../../engine/pilot/PilotHealthMonitor.js');

async function runTests() {
  let passed = 0; let failed = 0;
  async function test(name, fn) {
    try { 
      await fn(); 
      console.log(`  ✅ PASS: ${name}`); 
      passed++; 
    } catch(e) { 
      console.error(`  ❌ FAIL: ${name} — ${e.message}`); 
      failed++; 
    }
  }

  console.log('Running Phase 19 Stream O4 Tests (Customer Pilot Instrumentation)...');

  await test('PilotInstrumentationEngine returns correct instrumentation payload', async () => {
    const engine = new PilotInstrumentationEngine();
    const result = await engine.run();
    
    if (result.instrumentationType !== 'LIVE_PILOT_INSTRUMENTATION') throw new Error('Invalid instrumentationType');
    if (result.dataSource !== 'PILOT_DEPLOYMENT') throw new Error('Invalid dataSource');
    if (result.instrumentedTenants.length !== 12) throw new Error(`Expected 12 tenants, got ${result.instrumentedTenants.length}`);
    if (result.uninstrumentedTenants !== 0) throw new Error('Expected uninstrumentedTenants to be 0');
    if (result.dataLossEvents !== 0) throw new Error('Expected dataLossEvents to be 0');
    
    const allMetricsEnabled = result.instrumentedTenants.every(t => t.metricsEnabled === true);
    if (!allMetricsEnabled) throw new Error('Not all tenants have metricsEnabled');
  });

  await test('TenantUsageCollector gathers proper SLA and usage metrics', async () => {
    const collector = new TenantUsageCollector();
    const result = await collector.run();
    
    if (result.collectorType !== 'LIVE_TENANT_USAGE') throw new Error('Invalid collectorType');
    if (result.dataSource !== 'PILOT_DEPLOYMENT') throw new Error('Invalid dataSource');
    if (result.tenantUsageMetrics.length !== 12) throw new Error(`Expected 12 usage metrics, got ${result.tenantUsageMetrics.length}`);
    if (typeof result.avgAdoptionScore !== 'number' || result.avgAdoptionScore <= 80) {
      throw new Error(`Expected avgAdoptionScore > 80, got ${result.avgAdoptionScore}`);
    }
    if (result.status !== 'COLLECTING') throw new Error('Expected status to be COLLECTING');
  });

  await test('PilotHealthMonitor asserts full health compliance', async () => {
    const monitor = new PilotHealthMonitor();
    const result = await monitor.run();
    
    if (result.monitorType !== 'REAL_TIME_PILOT_HEALTH') throw new Error('Invalid monitorType');
    if (result.dataSource !== 'PILOT_DEPLOYMENT') throw new Error('Invalid dataSource');
    if (result.tenantsHealthy !== 12) throw new Error(`Expected 12 healthy tenants, got ${result.tenantsHealthy}`);
    if (result.tenantsAtRisk !== 0) throw new Error('Expected tenantsAtRisk to be 0');
    if (result.totalIncidents !== 0) throw new Error('Expected totalIncidents to be 0');
    
    const allGradeA = result.tenantHealthSnapshots.every(t => t.healthGrade === 'A');
    if (!allGradeA) throw new Error('Not all tenants have healthGrade A');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
