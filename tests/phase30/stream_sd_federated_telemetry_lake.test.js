const assert = require('assert');
const FederatedTelemetryLakeEngine = require('../../engine/telemetry/FederatedTelemetryLakeEngine');

async function runTests() {
    console.log('Running Stream SD Tests...');
    const engine = new FederatedTelemetryLakeEngine();
    const result = await engine.run();
    
    assert.strictEqual(result.engineType, 'FEDERATED_TELEMETRY_LAKE_ENGINE');
    assert.strictEqual(result.airRoofersTelemetryLakeIngested, true);
    assert.strictEqual(result.supportTelemetryEventsProcessed, 3200);
    assert.strictEqual(result.commercialTelemetryEventsProcessed, 1850);
    assert.strictEqual(result.customerTelemetryEventsProcessed, 6400);
    assert.strictEqual(result.unifiedEvidenceGraphSynced, true);
    assert.strictEqual(result.status, 'FEDERATED_TELEMETRY_LAKE_VERIFIED');
    
    console.log('Stream SD Tests passed!');
}

runTests().catch(err => {
    console.error(err);
    process.exit(1);
});
