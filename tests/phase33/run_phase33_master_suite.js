'use strict';

const assert = require('assert');
const Phase33VerifiablePlatformOrchestrator = require('../../engine/audit/Phase33VerifiablePlatformOrchestrator');

const testSA = require('./stream_sa_immutable_trust_ledger.test.js');
const testSB = require('./stream_sb_live_digital_twin.test.js');
const testSC = require('./stream_sc_runtime_traceability_fabric.test.js');
const testSD = require('./stream_sd_federation_control_plane.test.js');
const testSE = require('./stream_se_operational_economics.test.js');
const testSF = require('./stream_sf_independent_audit_engine.test.js');
const testSG = require('./stream_sg_continuous_blueprint_intelligence.test.js');
const testSH = require('./stream_sh_autonomous_engineering_governance.test.js');
const testSI = require('./stream_si_ecosystem_operations_kernel.test.js');

async function runMasterSuite() {
    console.log('================================================================================');
    console.log('  RUNNING PHASE 33 MASTER SUITE: VERIFIABLE OPERATIONAL TRUST & PLATFORM');
    console.log('================================================================================\n');

    await testSA();
    await testSB();
    await testSC();
    await testSD();
    await testSE();
    await testSF();
    await testSG();
    await testSH();
    await testSI();

    console.log('Running test for Phase33VerifiablePlatformOrchestrator...');
    const orchestrator = new Phase33VerifiablePlatformOrchestrator();
    const result = await orchestrator.run();

    assert.strictEqual(result.phase, 'PHASE_33');
    assert.strictEqual(result.totalStreams, 9);
    assert.strictEqual(result.passedStreams, 9);
    assert.strictEqual(result.verifiableTrustAssuranceScorePercent, 100.0);
    assert.strictEqual(result.overallStatus, 'VERIFIABLE_OPERATIONAL_TRUST_FEDERATED_ECOSYSTEM_PLATFORM_COMPLETE');
    assert.strictEqual(result.phase33Verdict, 'PHASE_33_VERIFIABLE_OPERATIONAL_TRUST_FEDERATED_ECOSYSTEM_PLATFORM_COMPLETE');

    console.log('\n✅ ALL 9 STREAMS PASSED FOR PHASE 33 VERIFIABLE OPERATIONAL TRUST!');
}

if (require.main === module) {
    runMasterSuite().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = runMasterSuite;
