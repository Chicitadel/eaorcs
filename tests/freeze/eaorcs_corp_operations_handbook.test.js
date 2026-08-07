/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Operations Handbook Test Suite
 * File           : eaorcs_corp_operations_handbook.test.js
 * Version        : 2026.3.1-LTS
 * Author         : Ujomor Systems & Enterprise Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-07
 * Last Modified  : 2026-08-07
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 * - Corporate Policy Governed
 *
 * CORP: Stream E — Operations Handbook Verification
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

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const OperationsHandbookEngine = require('../../engine/operations/OperationsHandbookEngine');

async function testOperationsHandbookSuite() {
  console.log('--- Running OperationsHandbookEngine Tests ---');
  const engine = new OperationsHandbookEngine();

  // 1. Get Runbooks
  const runbooks = engine.getRunbooks();
  assert.ok(Array.isArray(runbooks));
  assert.ok(runbooks.length >= 4);
  assert.strictEqual(runbooks[0].id, 'RUN-OPS-001');
  console.log('[PASS] 1. getRunbooks returned SRE runbooks');

  // 2. Get Monitoring Configs
  const mon = engine.getMonitoringConfigs();
  assert.ok(Array.isArray(mon.healthEndpoints));
  assert.ok(Array.isArray(mon.prometheusMetrics));
  assert.ok(Array.isArray(mon.alertRules));
  console.log('[PASS] 2. getMonitoringConfigs returned telemetry metrics & endpoints');

  // 3. Get Incident Response Protocol
  const ir = engine.getIncidentResponseProtocol('SEV-1');
  assert.strictEqual(ir.severity, 'SEV-1');
  assert.strictEqual(ir.responseSLA, '15 minutes');
  assert.strictEqual(ir.rcaRequired, true);
  console.log('[PASS] 3. getIncidentResponseProtocol returned SEV-1 SLA & roles');

  // 4. Get Disaster Recovery Plan
  const dr = engine.getDisasterRecoveryPlan();
  assert.ok(dr.rpo.includes('15 Minutes'));
  assert.ok(dr.rto.includes('1 Hour'));
  console.log('[PASS] 4. getDisasterRecoveryPlan returned RPO & RTO requirements');

  // 5. Export Operations Handbook
  const testDocPath = path.resolve(__dirname, '../../../../OPERATIONS_HANDBOOK.md');
  const docResult = engine.exportOperationsHandbook(testDocPath);
  assert.strictEqual(docResult.success, true);
  assert.ok(fs.existsSync(docResult.filePath));
  const fileContent = fs.readFileSync(docResult.filePath, 'utf8');
  assert.ok(fileContent.includes('Site Reliability Engineering (SRE) Runbooks'));
  assert.ok(fileContent.includes('Real-Time Telemetry & Monitoring Architecture'));
  assert.ok(fileContent.includes('Disaster Recovery & Business Continuity Plan'));
  console.log('[PASS] 5. exportOperationsHandbook exported OPERATIONS_HANDBOOK.md');

  // 6. Engine Run Execution
  const runResult = await engine.run();
  assert.strictEqual(runResult.status, 'PASS');
  assert.strictEqual(runResult.streamId, 'Stream E');
  console.log('[PASS] 6. engine.run executed successfully');

  console.log('All OperationsHandbookEngine tests passed.');
}

if (require.main === module) {
  testOperationsHandbookSuite().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = testOperationsHandbookSuite;
