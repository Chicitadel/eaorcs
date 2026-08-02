/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : tests/release
 * File           : run_five_stream_release_suite.js
 * Version        : 2026.1.0-RC1
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-02
 * Last Modified  : 2026-08-02
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
const FiveStreamReleaseOrchestrator = require('../../engine/release/FiveStreamReleaseOrchestrator');

const testR1 = require('./stream_r1_release_engineering.test.js');
const testR2 = require('./stream_r2_production_operations.test.js');
const testR3 = require('./stream_r3_commercialization.test.js');
const testR4 = require('./stream_r4_external_assurance.test.js');
const testR5 = require('./stream_r5_customer_experience.test.js');

async function runReleaseSuite() {
    console.log('================================================================================');
    console.log('  RUNNING FIVE-STREAM RELEASE ENGINEERING SUITE (STREAMS R1-R5)');
    console.log('================================================================================\n');

    await testR1();
    await testR2();
    await testR3();
    await testR4();
    await testR5();

    console.log('\nRunning test for FiveStreamReleaseOrchestrator...');
    const orchestrator = new FiveStreamReleaseOrchestrator();
    const result = await orchestrator.execute();

    assert.strictEqual(result.phase, 'RELEASE_STREAMS_R1_R5');
    assert.strictEqual(result.passedStreams, 5);
    assert.strictEqual(result.releaseEngineeringScorePercent, 100.0);

    console.log('\n✅ ALL 5 RELEASE ENGINEERING STREAMS PASSED SUCCESSFULLY!');
}

if (require.main === module) {
    runReleaseSuite().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = runReleaseSuite;
