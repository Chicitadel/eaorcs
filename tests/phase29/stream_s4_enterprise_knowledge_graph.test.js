const EnterpriseKnowledgeGraphEngine = require('../../engine/knowledge/EnterpriseKnowledgeGraphEngine.js');
const assert = require('assert');

async function test() {
    const engine = new EnterpriseKnowledgeGraphEngine();
    const result = await engine.run();
    assert.strictEqual(result.engineType, 'ENTERPRISE_KNOWLEDGE_GRAPH_ENGINE');
    assert.strictEqual(result.requirementsToCodeLinksCount, 1540);
    assert.strictEqual(result.testsToEvidenceLinksCount, 980);
    assert.strictEqual(result.customersToRoiLinksCount, 420);
    assert.strictEqual(result.unifiedKnowledgeQueryable, true);
    assert.strictEqual(result.engineeringMemoryRecordsCount, 5200);
    assert.strictEqual(result.status, 'ENTERPRISE_KNOWLEDGE_GRAPH_VERIFIED');
    console.log("Stream 4: Enterprise Knowledge Graph tests passed.");
}

test().catch(err => {
    console.error(err);
    process.exit(1);
});
