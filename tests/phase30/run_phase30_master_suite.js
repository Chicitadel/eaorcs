const Phase30FederatedTrustOrchestrator = require('../../engine/audit/Phase30FederatedTrustOrchestrator');
const { spawnSync } = require('child_process');
const path = require('path');

async function runMasterSuite() {
    console.log('Running Phase 30 Master Suite...');
    
    const tests = [
        'stream_sg_federated_knowledge_graph.test.js',
        'stream_sh_operational_trust_intelligence.test.js',
        'stream_si_autonomous_platform_evolution.test.js'
    ];
    
    for (const testFile of tests) {
        console.log(`\nExecuting ${testFile}...`);
        const result = spawnSync('node', [path.join(__dirname, testFile)], { stdio: 'inherit' });
        if (result.status !== 0) {
            console.error(`Test ${testFile} failed with status ${result.status}`);
            process.exit(1);
        }
    }
    
    console.log('\nExecuting Master Orchestrator...');
    const orchestrator = new Phase30FederatedTrustOrchestrator();
    const result = await orchestrator.run();
    
    if (result.phase30Verdict !== 'PHASE_30_FEDERATED_OPERATIONAL_INTELLIGENCE_ECOSYSTEM_TRUST_COMPLETE') {
        console.error('Invalid verdict:', result.phase30Verdict);
        process.exit(1);
    }
    
    console.log(JSON.stringify(result, null, 2));
    console.log('\nPhase 30 Master Suite executed successfully.');
    process.exit(0);
}

runMasterSuite();
