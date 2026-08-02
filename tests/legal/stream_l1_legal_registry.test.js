/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : tests/legal
 * File           : stream_l1_legal_registry.test.js
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
const LegalRegistryEngine = require('../../engine/legal/LegalRegistryEngine');

async function testL1() {
    console.log('Running Stream L1: Legal Registry Test...');
    const engine = new LegalRegistryEngine();
    const result = await engine.run();

    assert.strictEqual(result.streamId, 'Stream L1');
    assert.strictEqual(result.status, 'PASS');
    assert.strictEqual(result.registryLoaded, true);
    assert.strictEqual(result.totalDocuments, 8);
    assert.strictEqual(result.approvedDocuments, 8);
    assert.strictEqual(result.scorePercent, 100.0);
    console.log('✅ Stream L1 passed.');
}

if (require.main === module) {
    testL1().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = testL1;
