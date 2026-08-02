const FederatedKnowledgeGraphEngine = require('../../engine/knowledge/FederatedKnowledgeGraphEngine');

async function runTest() {
    console.log('Running Federated Knowledge Graph Engine test...');
    const engine = new FederatedKnowledgeGraphEngine();
    const result = await engine.run();
    
    if (result.engineType !== 'FEDERATED_KNOWLEDGE_GRAPH_ENGINE') {
        console.error('Invalid engineType:', result.engineType);
        process.exit(1);
    }
    
    if (result.status !== 'FEDERATED_KNOWLEDGE_GRAPH_VERIFIED') {
        console.error('Invalid status:', result.status);
        process.exit(1);
    }

    console.log('Federated Knowledge Graph Engine test passed successfully.');
    process.exit(0);
}

runTest();
