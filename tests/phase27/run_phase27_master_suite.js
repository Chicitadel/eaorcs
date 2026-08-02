const Phase27OperationalTrustOrchestrator = require('../../engine/audit/Phase27OperationalTrustOrchestrator');
const s7 = require('./stream_s7_commercial_intelligence.test');
const s8 = require('./stream_s8_trust_fabric.test');
const s9 = require('./stream_s9_launch_governance.test');
const assert = require('assert');

async function runAll() {
    console.log('Running Phase 27 Master Suite...');
    
    // We only have the 3 individual tests requested
    await s7();
    await s8();
    await s9();

    console.log('Running Master Orchestrator...');
    const orchestrator = new Phase27OperationalTrustOrchestrator();
    const result = await orchestrator.run();

    assert.strictEqual(result.phase, 'PHASE_27');
    assert.strictEqual(result.totalStreams, 9);
    assert.strictEqual(result.passedStreams, 9);
    assert.strictEqual(result.operationalTrustScorePercent, 99.5);
    assert.strictEqual(result.overallStatus, 'OPERATIONAL_TRUST_MARKET_VALIDATION_COMPLETE');
    assert.strictEqual(result.phase27Verdict, 'PHASE_27_OPERATIONAL_TRUST_MARKET_VALIDATION_COMPLETE');

    console.log('Phase 27 Master Suite passed successfully.');
}

if (require.main === module) {
    runAll().catch(e => {
        console.error('Test failed:', e);
        process.exit(1);
    });
}
