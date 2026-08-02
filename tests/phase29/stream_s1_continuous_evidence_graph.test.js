const assert = require('assert');
const ContinuousEvidenceGraphEngine = require('../../engine/evidence/ContinuousEvidenceGraphEngine.js');

async function runTests() {
  const engine = new ContinuousEvidenceGraphEngine();
  const result = await engine.run();
  
  assert.strictEqual(result.engineType, 'CONTINUOUS_EVIDENCE_GRAPH_ENGINE');
  assert.strictEqual(result.evidenceNodesIngestedCount, 4250);
  assert.strictEqual(result.knowledgeGraphSynced, true);
  assert.strictEqual(result.trustGraphVerified, true);
  assert.strictEqual(result.cryptographicAttestationHash, 'sha256-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  assert.strictEqual(result.status, 'CONTINUOUS_EVIDENCE_GRAPH_VERIFIED');
  
  console.log('Stream 1 tests passed.');
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
