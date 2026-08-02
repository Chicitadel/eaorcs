/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : tests/phase37
 * File           : run_phase37_master_suite.js
 * Version        : 2026.1.0-LTS
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const Phase37OperationalProofOrchestrator = require('../../engine/audit/Phase37OperationalProofOrchestrator');

const testT1 = require('./stream_t1_production_telemetry_verification.test.js');
const testT2 = require('./stream_t2_clean_room_reproducibility.test.js');
const testT3 = require('./stream_t3_multi_environment_validation.test.js');
const testT4 = require('./stream_t4_contract_evolution.test.js');
const testT5 = require('./stream_t5_supply_chain_attestation.test.js');
const testT6 = require('./stream_t6_operational_acceptance.test.js');
const testT7 = require('./stream_t7_customer_pilot_verification.test.js');
const testT8 = require('./stream_t8_procurement_evidence.test.js');
const testT9 = require('./stream_t9_continuous_release_governance.test.js');

async function runMasterSuite() {
    console.log('================================================================================');
    console.log('  RUNNING PHASE 37 MASTER SUITE: OPERATIONAL PROOF & CLEAN-ROOM REPRODUCIBILITY');
    console.log('================================================================================\n');

    await testT1();
    await testT2();
    await testT3();
    await testT4();
    await testT5();
    await testT6();
    await testT7();
    await testT8();
    await testT9();

    console.log('Running test for Phase37OperationalProofOrchestrator...');
    const orchestrator = new Phase37OperationalProofOrchestrator();
    const result = await orchestrator.run();

    assert.strictEqual(result.phase, 'PHASE_37');
    assert.strictEqual(result.passedStreams, 9);
    assert.strictEqual(result.operationalProofScorePercent, 100.0);

    console.log('\n✅ ALL 9 STREAMS PASSED FOR PHASE 37 OPERATIONAL PROOF & CLEAN-ROOM REPRODUCIBILITY!');
}

if (require.main === module) {
    runMasterSuite().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = runMasterSuite;
