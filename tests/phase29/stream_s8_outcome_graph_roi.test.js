const OutcomeGraphRoiEngine = require('../../engine/commercial/OutcomeGraphRoiEngine');

async function runTest() {
    console.log("Running OutcomeGraphRoiEngine test...");
    const engine = new OutcomeGraphRoiEngine();
    const result = await engine.run();
    if (result.status === 'OUTCOME_GRAPH_ROI_VERIFIED' && result.expectedRoiMultiplier === 5.08) {
        console.log("OutcomeGraphRoiEngine test passed.");
        process.exit(0);
    } else {
        console.error("OutcomeGraphRoiEngine test failed.", result);
        process.exit(1);
    }
}

runTest();
