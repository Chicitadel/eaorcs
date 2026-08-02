const assert = require('assert');
const RuntimeEvidenceEngine = require('../../engine/evidence/RuntimeEvidenceEngine');

async function testRuntimeEvidenceEngine() {
  const engine = new RuntimeEvidenceEngine();
  const result = await engine.run();

  assert.strictEqual(result.engineType, 'RUNTIME_EVIDENCE_ENGINE');
  assert.strictEqual(result.openTelemetryIngestedCount, 4850);
  assert.strictEqual(result.prometheusMetricsIngestedCount, 1920);
  assert.strictEqual(result.jaegerTracesAnalyzedCount, 940);
  assert.strictEqual(result.k8sAuditEventsSyncedCount, 520);
  assert.strictEqual(result.productionApiEvidenceActive, true);
  assert.strictEqual(result.status, 'RUNTIME_EVIDENCE_VERIFIED');

  console.log('Stream 2: Runtime Evidence test passed');
}

testRuntimeEvidenceEngine().catch((err) => {
  console.error(err);
  process.exit(1);
});
