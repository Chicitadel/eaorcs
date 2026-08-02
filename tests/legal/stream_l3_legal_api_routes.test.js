/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : tests/legal
 * File           : stream_l3_legal_api_routes.test.js
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
const LegalRoutes = require('../../api/legal/LegalRoutes');

async function testL3() {
    console.log('Running Stream L3: Legal API Routes Test...');
    const routes = new LegalRoutes();

    const docsRes = routes.getDocuments();
    assert.strictEqual(docsRes.status, 200);
    assert.strictEqual(docsRes.data.length, 8);

    const latestRes = routes.getLatest();
    assert.strictEqual(latestRes.status, 200);
    assert.ok(latestRes.version);

    const termsRes = routes.getTerms();
    assert.strictEqual(termsRes.status, 200);
    assert.strictEqual(termsRes.data.id, 'doc-trm-01');

    const privacyRes = routes.getPrivacy();
    assert.strictEqual(privacyRes.status, 200);
    assert.strictEqual(privacyRes.data.id, 'doc-prv-01');

    const licensesRes = routes.getLicenses();
    assert.strictEqual(licensesRes.status, 200);
    assert.strictEqual(licensesRes.data.id, 'doc-lic-01');

    const sigsRes = routes.getSignatures();
    assert.strictEqual(sigsRes.status, 200);
    assert.strictEqual(sigsRes.data.length, 8);

    console.log('✅ Stream L3 passed.');
}

if (require.main === module) {
    testL3().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = testL3;
