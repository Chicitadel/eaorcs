const MarketplaceIntelligenceEngine = require('../../engine/marketplace/MarketplaceIntelligenceEngine');

async function runTest() {
    console.log("Running stream_sg_marketplace_intelligence test...");
    const engine = new MarketplaceIntelligenceEngine();
    const result = await engine.run();
    if (result.status === 'MARKETPLACE_INTELLIGENCE_VERIFIED') {
        console.log("Test passed!");
        process.exit(0);
    } else {
        console.error("Test failed!");
        process.exit(1);
    }
}

runTest();
