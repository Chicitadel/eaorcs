const assert = require('assert');
const EngineeringIntelligenceKnowledgeGraphEngine = require('../../engine/knowledge/EngineeringIntelligenceKnowledgeGraphEngine');

async function test() {
    const engine = new EngineeringIntelligenceKnowledgeGraphEngine();
    const result = await engine.run();

    assert.strictEqual(result.engineType, 'ENGINEERING_INTELLIGENCE_KNOWLEDGE_GRAPH_ENGINE');
    assert.strictEqual(result.reqsToCodeNodesCount, 1840);
    assert.strictEqual(result.testsToCiNodesCount, 1250);
    assert.strictEqual(result.releasesToIncidentsNodesCount, 620);
    assert.strictEqual(result.fixesToCustomerOutcomeNodesCount, 480);
    assert.strictEqual(result.permanentEngineeringMemoryActive, true);
    assert.strictEqual(result.status, 'ENGINEERING_INTELLIGENCE_KNOWLEDGE_GRAPH_VERIFIED');
    
    console.log('Stream 7 test passed');
}

test().catch(err => {
    console.error(err);
    process.exit(1);
});
