const assert = require('assert');
const UnifiedApiContractGraphEngine = require('../../engine/contract/UnifiedApiContractGraphEngine');

async function testUnifiedApiContractGraphEngine() {
    try {
        const engine = new UnifiedApiContractGraphEngine();
        const result = await engine.run();
        assert.strictEqual(result.engineType, 'UNIFIED_API_CONTRACT_GRAPH_ENGINE');
        assert.strictEqual(result.blueprintToPlatformContractLinksCount, 140);
        assert.strictEqual(result.openApiToAsyncApiLinksCount, 65);
        assert.strictEqual(result.sdkToRuntimeLinksCount, 320);
        assert.strictEqual(result.unifiedContractGraphScorePercent, 99.8);
        assert.strictEqual(result.status, 'UNIFIED_API_CONTRACT_GRAPH_VERIFIED');
        console.log('stream_sc_unified_api_contract_graph.test.js: PASS');
        process.exit(0);
    } catch (err) {
        console.error('stream_sc_unified_api_contract_graph.test.js: FAIL', err);
        process.exit(1);
    }
}

testUnifiedApiContractGraphEngine();
