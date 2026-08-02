const Phase29ContinuousTrustOrchestrator = require('../../engine/audit/Phase29ContinuousTrustOrchestrator');
const { execSync } = require('child_process');
const path = require('path');

async function runAllTests() {
    try {
        console.log("Running Stream 7 Test...");
        execSync(`node ${path.join(__dirname, 'stream_s7_trust_fabric_2.test.js')}`, { stdio: 'inherit' });
        
        console.log("Running Stream 8 Test...");
        execSync(`node ${path.join(__dirname, 'stream_s8_outcome_graph_roi.test.js')}`, { stdio: 'inherit' });
        
        console.log("Running Stream 9 Test...");
        execSync(`node ${path.join(__dirname, 'stream_s9_autonomous_product_evolution_loop.test.js')}`, { stdio: 'inherit' });
        
        console.log("Running Phase 29 Master Orchestrator...");
        const orchestrator = new Phase29ContinuousTrustOrchestrator();
        const result = await orchestrator.run();
        
        if (result.phase29Verdict === 'PHASE_29_CONTINUOUS_TRUST_INTELLIGENCE_AUTONOMOUS_EVOLUTION_COMPLETE') {
            console.log("Phase 29 Master Suite passed successfully.");
            process.exit(0);
        } else {
            console.error("Master Orchestrator failed validation.", result);
            process.exit(1);
        }
    } catch (e) {
        console.error("Master Suite failed.", e.message);
        process.exit(1);
    }
}

runAllTests();
