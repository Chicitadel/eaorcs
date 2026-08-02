const EvidenceBackedLaunchGovernanceEngine = require('../../engine/governance/EvidenceBackedLaunchGovernanceEngine');

async function runTest() {
    console.log("Running stream_sh_evidence_backed_governance test...");
    const engine = new EvidenceBackedLaunchGovernanceEngine();
    const result = await engine.run();
    if (result.status === 'EVIDENCE_BACKED_LAUNCH_GOVERNANCE_VERIFIED') {
        console.log("Test passed!");
        process.exit(0);
    } else {
        console.error("Test failed!");
        process.exit(1);
    }
}

runTest();
