const assert = require('assert');
const PerformanceTrendEngine = require('../../engine/operations/PerformanceTrendEngine');

async function testPerformanceTrendSuite() {
    console.log('--- Running PerformanceTrendEngine Tests ---');
    const engine = new PerformanceTrendEngine();

    // 1. Constructor pre-registers
    assert.strictEqual(engine.kpiRegistry.size, 5);
    console.log('[PASS] 1. Constructor pre-registered 5 KPIs');

    // 2. recordBenchmark
    const rec1 = engine.recordBenchmark('v2026.1.0', [{ kpiId: 'CLI_STARTUP', actualValue: 320, unit: 'ms' }]);
    assert.strictEqual(rec1.benchmarkCount, 1);
    console.log('[PASS] 2. Benchmark recorded');

    // 3. Historical trend length
    engine.recordBenchmark('v2026.2.0', [{ kpiId: 'CLI_STARTUP', actualValue: 270, unit: 'ms' }]);
    engine.recordBenchmark('v2026.3.0', [{ kpiId: 'CLI_STARTUP', actualValue: 185, unit: 'ms' }]);
    const trend = engine.getHistoricalTrend('CLI_STARTUP', 3);
    assert.strictEqual(trend.length, 3);
    console.log('[PASS] 3. Historical trend length verified');

    // 4. Non-null delta
    assert.strictEqual(trend[0].delta, null);
    assert.strictEqual(trend[1].delta, -50);
    assert.strictEqual(trend[2].delta, -85);
    console.log('[PASS] 4. Non-null delta values verified');

    // 5. detectRegression
    const reg = engine.detectRegression('CLI_STARTUP', 999, 500);
    assert.strictEqual(reg.isRegression, true);
    console.log('[PASS] 5. detectRegression identified threshold breach');

    // 6. generateTrendReport
    const rpt = engine.generateTrendReport();
    assert.strictEqual(rpt.kpis.length, 5);
    const cliTrend = rpt.kpis.find(k => k.kpiId === 'CLI_STARTUP');
    assert.strictEqual(cliTrend.trend, 'IMPROVING');
    console.log('[PASS] 6. generateTrendReport generated correct trend');

    // 7. exportTrendAsTable
    const table = engine.exportTrendAsTable('CLI_STARTUP');
    assert.strictEqual(typeof table, 'string');
    assert.ok(table.includes('|'));
    console.log('[PASS] 7. exportTrendAsTable generated ASCII table');

    // 8. computeReliabilityScore
    const rel = engine.computeReliabilityScore('CLI_STARTUP', 500);
    assert.strictEqual(rel.reliabilityPct, 100);
    console.log('[PASS] 8. computeReliabilityScore computed 100% score');

    console.log('All PerformanceTrendEngine tests passed.');
}

if (require.main === module) {
    testPerformanceTrendSuite().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = testPerformanceTrendSuite;
