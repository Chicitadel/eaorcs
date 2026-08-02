'use strict';

const assert = require('assert');
const OperationalObservabilityDashboardEngine = require('../../engine/operations/OperationalObservabilityDashboardEngine');

async function runTest() {
    console.log('Running test for OperationalObservabilityDashboardEngine (Stream S8)...');
    const engine = new OperationalObservabilityDashboardEngine();
    const result = await engine.run();

    assert.strictEqual(result.engineType, 'OPERATIONAL_OBSERVABILITY_DASHBOARD_ENGINE');
    assert.strictEqual(result.activeRealtimeDashboardsCount, 16);
    assert.strictEqual(result.evidenceFreshnessLatencyMs, 850);
    assert.strictEqual(result.monitoredContractDriftVectorsCount, 128);
    assert.strictEqual(result.systemHealthScorePercent, 100.0);
    assert.strictEqual(result.status, 'OPERATIONAL_OBSERVABILITY_DASHBOARD_VERIFIED');

    console.log('Stream S8 test passed.');
}

if (require.main === module) {
    runTest().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = runTest;
