const Phase28OperationalEvidenceOrchestrator = require('../../engine/audit/Phase28OperationalEvidenceOrchestrator');
const { execSync } = require('child_process');
const path = require('path');

async function runTest() {
    console.log("Running master orchestrator test...");
    
    const tests = [
        'stream_sg_marketplace_intelligence.test.js',
        'stream_sh_evidence_backed_governance.test.js',
        'stream_si_autonomous_product_evolution.test.js'
    ];
    
    for (const test of tests) {
        const testPath = path.join(__dirname, test);
        try {
            console.log(`Executing ${test}...`);
            execSync(`node "${testPath}"`, { stdio: 'inherit' });
        } catch (error) {
            console.error(`Test ${test} failed`);
            process.exit(1);
        }
    }
    
    const orchestrator = new Phase28OperationalEvidenceOrchestrator();
    const result = await orchestrator.run();
    if (result.phase28Verdict === 'PHASE_28_OPERATIONAL_EVIDENCE_FABRIC_AUTONOMOUS_EVOLUTION_COMPLETE') {
        console.log("Master orchestrator test passed!");
        process.exit(0);
    } else {
        console.error("Master orchestrator test failed!");
        process.exit(1);
    }
}

runTest();
