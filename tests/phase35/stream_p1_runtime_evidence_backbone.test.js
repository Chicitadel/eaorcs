'use strict';

const assert = require('assert');
const RuntimeEvidenceBackboneEngine = require('../../engine/evidence/RuntimeEvidenceBackboneEngine');

async function runTest() {
    console.log('Running test for RuntimeEvidenceBackboneEngine (Stream P1)...');
    const engine = new RuntimeEvidenceBackboneEngine();
    const result = await engine.run();

    assert.strictEqual(result.engineType, 'RUNTIME_EVIDENCE_BACKBONE_ENGINE');
    assert.strictEqual(result.liveOpenTelemetryCollectorsCount, 8);
    assert.strictEqual(result.prometheusMetricsIngestedCount, 12500);
    assert.strictEqual(result.jaegerTracesIngestedCount, 4200);
    assert.strictEqual(result.kubernetesClusterNodesMonitored, 64);
    assert.strictEqual(result.liveTelemetryFreshnessSeconds, 1.2);
    assert.strictEqual(result.runtimeEvidenceIntegrityScorePercent, 100.0);
    assert.strictEqual(result.status, 'RUNTIME_EVIDENCE_BACKBONE_VERIFIED');

    console.log('Stream P1 test passed.');
}

if (require.main === module) {
    runTest().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = runTest;
