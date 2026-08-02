'use strict';

const assert = require('assert');
const Phase34GlobalEcosystemOrchestrator = require('../../engine/audit/Phase34GlobalEcosystemOrchestrator');

const testSA = require('./stream_sa_global_cryptographic_provenance_ledger.test.js');
const testSB = require('./stream_sb_ecosystem_digital_twin_network.test.js');
const testSC = require('./stream_sc_zero_trust_traceability_fabric.test.js');
const testSD = require('./stream_sd_autonomous_federation_control_plane.test.js');
const testSE = require('./stream_se_enterprise_unit_economics.test.js');
const testSF = require('./stream_sf_automated_external_audit_portal.test.js');
const testSG = require('./stream_sg_self_healing_blueprint_intelligence.test.js');
const testSH = require('./stream_sh_continuous_production_quality_governance.test.js');
const testSI = require('./stream_si_airroofers_global_operations_kernel.test.js');

async function runMasterSuite() {
    console.log('================================================================================');
    console.log('  RUNNING PHASE 34 MASTER SUITE: GLOBAL AUTONOMOUS ECOSYSTEM GOVERNANCE OS');
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

    console.log('Running test for Phase34GlobalEcosystemOrchestrator...');
    const orchestrator = new Phase34GlobalEcosystemOrchestrator();
    const result = await orchestrator.run();

    assert.strictEqual(result.phase, 'PHASE_34');
    assert.strictEqual(result.totalStreams, 9);
    assert.strictEqual(result.passedStreams, 9);
    assert.strictEqual(result.globalEcosystemAssuranceScorePercent, 100.0);
    assert.strictEqual(result.overallStatus, 'GLOBAL_AUTONOMOUS_ECOSYSTEM_GOVERNANCE_ZERO_TRUST_OPERATING_SYSTEM_COMPLETE');
    assert.strictEqual(result.phase34Verdict, 'PHASE_34_GLOBAL_AUTONOMOUS_ECOSYSTEM_GOVERNANCE_ZERO_TRUST_OPERATING_SYSTEM_COMPLETE');

    console.log('\n✅ ALL 9 STREAMS PASSED FOR PHASE 34 GLOBAL AUTONOMOUS ECOSYSTEM GOVERNANCE OS!');
}

if (require.main === module) {
    runMasterSuite().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = runMasterSuite;
