const AutonomousProductEvolutionEngine = require('../../engine/spec/AutonomousProductEvolutionEngine');

async function runTest() {
    console.log("Running stream_si_autonomous_product_evolution test...");
    const engine = new AutonomousProductEvolutionEngine();
    const result = await engine.run();
    if (result.status === 'AUTONOMOUS_PRODUCT_EVOLUTION_VERIFIED') {
        console.log("Test passed!");
        process.exit(0);
    } else {
        console.error("Test failed!");
        process.exit(1);
    }
}

runTest();
