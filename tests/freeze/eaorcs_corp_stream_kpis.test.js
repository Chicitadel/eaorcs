/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Stream KPI Tests
 * File           : eaorcs_corp_stream_kpis.test.js
 * Version        : 2026.3.1-LTS
 * Author         : Ujomor Systems & Enterprise Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-07
 * Last Modified  : 2026-08-07
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance: Security Reviewed | Architecture Controlled | Protocol Frozen
 * CORP: Recommendation B — Quantitative KPIs
 * Standards: ISO 27001 | SOC 2 | OWASP ASVS | NIST
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

const assert = require('assert');
const StreamKPIEngine = require('../../engine/operations/StreamKPIEngine');

const engine = new StreamKPIEngine();

function testConstructor() {
    const kpis = engine.listKPIs();
    assert.ok(kpis.length >= 7);
    console.log('✓ testConstructor');
}

function testRegisterStreamKPI() {
    engine.registerStreamKPI('S99', { kpiId: 'TEST_KPI', name: 'Test KPI', unit: 'ms', sloThreshold: 1000 });
    const kpi = engine.getKPI('S99', 'TEST_KPI');
    assert.ok(kpi);
    assert.strictEqual(kpi.streamId, 'S99');
    console.log('✓ testRegisterStreamKPI');
}

function testMeasureKPIFast() {
    const res = engine.measureKPI('S3', 'COLD_SCAN', () => 10);
    assert.strictEqual(res.sloPassed, true);
    console.log('✓ testMeasureKPIFast');
}

function testMeasureKPISlow() {
    const res = engine.measureKPI('S10', 'CLI_STARTUP', () => 99999);
    assert.strictEqual(res.sloPassed, false);
    console.log('✓ testMeasureKPISlow');
}

function testCheckAllSLOs() {
    const res = engine.checkAllSLOs();
    assert.strictEqual(typeof res.overallPassed, 'boolean');
    console.log('✓ testCheckAllSLOs');
}

function testGenerateKPIReport() {
    const report = engine.generateKPIReport();
    assert.ok(report.totalKPIs >= 7);
    console.log('✓ testGenerateKPIReport');
}

function testGetKPI() {
    const kpi = engine.getKPI('S3', 'COLD_SCAN');
    assert.strictEqual(kpi.kpiId, 'COLD_SCAN');
    console.log('✓ testGetKPI');
}

function testListKPIsByStream() {
    const kpis = engine.listKPIs('S3');
    assert.strictEqual(kpis.length, 2);
    console.log('✓ testListKPIsByStream');
}

testConstructor();
testRegisterStreamKPI();
testMeasureKPIFast();
testMeasureKPISlow();
testCheckAllSLOs();
testGenerateKPIReport();
testGetKPI();
testListKPIsByStream();

console.log('All StreamKPIEngine tests passed.');
