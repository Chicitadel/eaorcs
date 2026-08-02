'use strict';

const assert = require('assert');
const Phase36LiveProductionOrchestrator = require('../../engine/audit/Phase36LiveProductionOrchestrator');

const testS1 = require('./stream_s1_live_connector_verification.test.js');
const testS2 = require('./stream_s2_evidence_provenance_chain.test.js');
const testS3 = require('./stream_s3_independent_reproducibility.test.js');
const testS4 = require('./stream_s4_end_to_end_integration.test.js');
const testS5 = require('./stream_s5_runtime_resilience_chaos.test.js');
const testS6 = require('./stream_s6_security_attestation.test.js');
const testS7 = require('./stream_s7_commercial_procurement_verification.test.js');
const testS8 = require('./stream_s8_operational_observability_dashboard.test.js');
const testS9 = require('./stream_s9_automated_launch_certification.test.js');

async function runMasterSuite() {
    console.log('================================================================================');
    console.log('  RUNNING PHASE 36 MASTER SUITE: LIVE PRODUCTION VALIDATION & REPRODUCIBILITY');
    console.log('================================================================================\n');

    await testS1();
    await testS2();
    await testS3();
    await testS4();
    await testS5();
    await testS6();
    await testS7();
    await testS8();
    await testS9();

    console.log('Running test for Phase36LiveProductionOrchestrator...');
    const orchestrator = new Phase36LiveProductionOrchestrator();
    const result = await orchestrator.run();

    assert.strictEqual(result.phase, 'PHASE_36');
    assert.strictEqual(result.totalStreams, 9);
    assert.strictEqual(result.passedStreams, 9);
    assert.strictEqual(result.liveProductionValidationScorePercent, 100.0);
    assert.strictEqual(result.overallStatus, 'LIVE_PRODUCTION_OPERATIONAL_VALIDATION_REPRODUCIBILITY_PLATFORM_COMPLETE');
    assert.strictEqual(result.phase36Verdict, 'PHASE_36_LIVE_PRODUCTION_OPERATIONAL_VALIDATION_REPRODUCIBILITY_PLATFORM_COMPLETE');

    console.log('\n✅ ALL 9 STREAMS PASSED FOR PHASE 36 LIVE PRODUCTION VALIDATION & REPRODUCIBILITY!');
}

if (require.main === module) {
    runMasterSuite().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = runMasterSuite;
