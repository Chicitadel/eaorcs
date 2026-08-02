const AutonomousPlatformEvolutionEngine = require('../../engine/spec/AutonomousPlatformEvolutionEngine');

async function runTest() {
    console.log('Running Autonomous Platform Evolution Engine test...');
    const engine = new AutonomousPlatformEvolutionEngine();
    const result = await engine.run();
    
    if (result.engineType !== 'AUTONOMOUS_PLATFORM_EVOLUTION_ENGINE') {
        console.error('Invalid engineType:', result.engineType);
        process.exit(1);
    }
    
    if (result.status !== 'AUTONOMOUS_PLATFORM_EVOLUTION_VERIFIED') {
        console.error('Invalid status:', result.status);
        process.exit(1);
    }

    console.log('Autonomous Platform Evolution Engine test passed successfully.');
    process.exit(0);
}

runTest();
