const TrustFabric2Engine = require('../../engine/trust/TrustFabric2Engine');

async function runTest() {
    console.log("Running TrustFabric2Engine test...");
    const engine = new TrustFabric2Engine();
    const result = await engine.run();
    if (result.status === 'TRUST_FABRIC_2_VERIFIED' && result.compositeTrustScoreGrade === 'AAA') {
        console.log("TrustFabric2Engine test passed.");
        process.exit(0);
    } else {
        console.error("TrustFabric2Engine test failed.", result);
        process.exit(1);
    }
}

runTest();
