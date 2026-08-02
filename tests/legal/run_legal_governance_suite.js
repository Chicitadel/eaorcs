/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : tests/legal
 * File           : run_legal_governance_suite.js
 * Version        : 2026.1.0-GA
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
const LegalManagementEngine = require('../../engine/legal/LegalManagementEngine');

const testL1 = require('./stream_l1_legal_registry.test.js');
const testL2 = require('./stream_l2_legal_enforcement.test.js');
const testL3 = require('./stream_l3_legal_api_routes.test.js');

async function runLegalGovernanceSuite() {
    console.log('================================================================================');
    console.log('  RUNNING LEGAL & GOVERNANCE DOCUMENTATION SUBSYSTEM SUITE');
    console.log('================================================================================\n');

    await testL1();
    await testL2();
    await testL3();

    console.log('Running test for LegalManagementEngine...');
    const engine = new LegalManagementEngine();
    const result = await engine.run();

    assert.strictEqual(result.phase, 'LEGAL_GOVERNANCE_GA');
    assert.strictEqual(result.totalStreams, 2);
    assert.strictEqual(result.passedStreams, 2);
    assert.strictEqual(result.legalManagementScorePercent, 100.0);
    assert.strictEqual(result.status, 'PASS');

    console.log('\n✅ ALL LEGAL & GOVERNANCE SUBSYSTEM TESTS PASSED SUCCESSFULLY!');
}

if (require.main === module) {
    runLegalGovernanceSuite().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = runLegalGovernanceSuite;
