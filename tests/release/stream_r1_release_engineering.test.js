/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : tests/release
 * File           : stream_r1_release_engineering.test.js
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
const ReleaseEngineeringEngine = require('../../engine/release/ReleaseEngineeringEngine');

async function testR1() {
    console.log('Running test for ReleaseEngineeringEngine (Stream R1)...');
    const engine = new ReleaseEngineeringEngine();
    const result = typeof engine.run === 'function' ? await engine.run() : await engine.execute();

    assert.strictEqual(result.status, 'PASS');
    const score = result.scorePercent !== undefined ? result.scorePercent : result.score;
    assert.strictEqual(score, 100);

    console.log('Stream R1 test passed.');
}

if (require.main === module) {
    testR1().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = testR1;
