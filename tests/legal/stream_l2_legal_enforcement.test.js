/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : tests/legal
 * File           : stream_l2_legal_enforcement.test.js
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
const LegalEnforcementEngine = require('../../engine/legal/LegalEnforcementEngine');

async function testL2() {
    console.log('Running Stream L2: Legal Enforcement Test...');
    const engine = new LegalEnforcementEngine();
    const result = await engine.run();

    assert.strictEqual(result.streamId, 'Stream L2');
    assert.strictEqual(result.status, 'PASS');
    assert.strictEqual(result.eulaEnforcementActive, true);
    assert.strictEqual(result.privacyDPAVerified, true);
    assert.strictEqual(result.slaTermsEnforced, true);
    assert.strictEqual(result.auditTrailLoggingEnabled, true);
    assert.strictEqual(result.enforcementScorePercent, 100.0);
    console.log('✅ Stream L2 passed.');
}

if (require.main === module) {
    testL2().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = testL2;
