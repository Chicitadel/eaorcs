const OperationalTrustIntelligenceEngine = require('../../engine/trust/OperationalTrustIntelligenceEngine');

async function runTest() {
    console.log('Running Operational Trust Intelligence Engine test...');
    const engine = new OperationalTrustIntelligenceEngine();
    const result = await engine.run();
    
    if (result.engineType !== 'OPERATIONAL_TRUST_INTELLIGENCE_ENGINE') {
        console.error('Invalid engineType:', result.engineType);
        process.exit(1);
    }
    
    if (result.status !== 'OPERATIONAL_TRUST_INTELLIGENCE_VERIFIED') {
        console.error('Invalid status:', result.status);
        process.exit(1);
    }

    console.log('Operational Trust Intelligence Engine test passed successfully.');
    process.exit(0);
}

runTest();
