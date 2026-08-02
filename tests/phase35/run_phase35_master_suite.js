'use strict';

const assert = require('assert');
const Phase35LiveEvidenceOrchestrator = require('../../engine/audit/Phase35LiveEvidenceOrchestrator');

const testP1 = require('./stream_p1_runtime_evidence_backbone.test.js');
const testP2 = require('./stream_p2_blueprint_compiler.test.js');
const testP3 = require('./stream_p3_continuous_contract_intelligence.test.js');
const testP4 = require('./stream_p4_product_intelligence.test.js');
const testP5 = require('./stream_p5_commercial_intelligence.test.js');
const testP6 = require('./stream_p6_autonomous_procurement.test.js');
const testP7 = require('./stream_p7_enterprise_knowledge_graph.test.js');
const testP8 = require('./stream_p8_continuous_runtime_certification.test.js');
const testP9 = require('./stream_p9_product_accelerator.test.js');

async function runMasterSuite() {
    console.log('================================================================================');
    console.log('  RUNNING PHASE 35 MASTER SUITE: LIVE RUNTIME EVIDENCE & CERTIFICATION PLATFORM');
    console.log('================================================================================\n');

    await testP1();
    await testP2();
    await testP3();
    await testP4();
    await testP5();
    await testP6();
    await testP7();
    await testP8();
    await testP9();

    console.log('Running test for Phase35LiveEvidenceOrchestrator...');
    const orchestrator = new Phase35LiveEvidenceOrchestrator();
    const result = await orchestrator.run();

    assert.strictEqual(result.phase, 'PHASE_35');
    assert.strictEqual(result.totalStreams, 9);
    assert.strictEqual(result.passedStreams, 9);
    assert.strictEqual(result.liveEvidenceCertificationScorePercent, 100.0);
    assert.strictEqual(result.overallStatus, 'LIVE_RUNTIME_EVIDENCE_PRODUCTION_BACKED_CERTIFICATION_PLATFORM_COMPLETE');
    assert.strictEqual(result.phase35Verdict, 'PHASE_35_LIVE_RUNTIME_EVIDENCE_PRODUCTION_BACKED_CERTIFICATION_PLATFORM_COMPLETE');

    console.log('\n✅ ALL 9 STREAMS PASSED FOR PHASE 35 LIVE RUNTIME EVIDENCE & CERTIFICATION PLATFORM!');
}

if (require.main === module) {
    runMasterSuite().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = runMasterSuite;
