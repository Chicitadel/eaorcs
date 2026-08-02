const assert = require('assert');
const OperationalEvidenceFabricEngine = require('../../engine/evidence/OperationalEvidenceFabricEngine');

async function runTests() {
    console.log('Running tests for stream_sa_operational_evidence_fabric...');
    const engine = new OperationalEvidenceFabricEngine();
    const result = await engine.run();

    assert.strictEqual(result.engineType, 'OPERATIONAL_EVIDENCE_FABRIC_ENGINE');
    assert.strictEqual(result.otelTelemetryIngested, true);
    assert.strictEqual(result.prometheusMetricsProcessed, 1450);
    assert.strictEqual(result.jaegerTracesAnalyzed, 820);
    assert.strictEqual(result.k8sEventsLedgerSynced, true);
    assert.strictEqual(result.cicdProvenanceVerified, true);
    assert.strictEqual(result.immutableLedgerStatus, 'ACTIVE');
    assert.strictEqual(result.status, 'OPERATIONAL_EVIDENCE_FABRIC_VERIFIED');

    console.log('All tests passed for stream_sa_operational_evidence_fabric.');
}

runTests().catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
});
