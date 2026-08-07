/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Customer Success Dossier Freeze Test
 * File           : eaorcs_corp_customer_success_dossier.test.js
 * Version        : 2026.3.1-LTS
 * Author         : Ujomor Systems & Enterprise Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-07
 * Last Modified  : 2026-08-07
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 * - Corporate Policy Governed
 *
 * CORP: Layer D Customer Success
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('[EAORCS Layer D Test] Verifying Customer Success Dossier deliverables...');

const rootDir = path.resolve(__dirname, '../../../../');
const customerSuccessDir = path.join(rootDir, 'customer_success');

assert.strictEqual(fs.existsSync(customerSuccessDir), true, 'Customer Success directory must exist');

const requiredFiles = [
    {
        filename: 'Customer_Journey.md',
        keywords: ['Customer Success Journey', 'Onboarding & Readiness Evaluation', 'Stage 1', 'Stage 6', 'ISO 27001']
    },
    {
        filename: 'Installation_and_Activation.md',
        keywords: ['Installation & Activation Guide', 'SHA-256 Checksum', 'Cryptographic License Activation', 'EAORCS.js']
    },
    {
        filename: 'Health_Check_and_Diagnostics.md',
        keywords: ['Health Check & Diagnostics', 'EAORCS.getHealthStatus()', 'HEALTHY', 'DEGRADED', 'Troubleshooting Runbooks']
    },
    {
        filename: 'License_Renewal_and_Upgrade.md',
        keywords: ['License Renewal & Upgrade Guide', 'Bronze', 'Sovereign', 'Zero-Downtime Hot-Swap', 'Upgrade Pathways']
    },
    {
        filename: 'Offboarding_Guide.md',
        keywords: ['Customer Offboarding', 'NIST SP 800-88', 'Cryptographic Zeroization', 'Certificate of Decommissioning']
    }
];

for (const item of requiredFiles) {
    const filePath = path.join(customerSuccessDir, item.filename);
    assert.strictEqual(fs.existsSync(filePath), true, `File ${item.filename} must exist in customer_success directory`);

    const content = fs.readFileSync(filePath, 'utf8');

    // Header validation
    assert.ok(content.includes('Universal Autonomous AI Governance Operating System (UAIGOS)'), `${item.filename} must contain UAIGOS header`);
    assert.ok(content.includes('Ujomor Systems & Enterprise Governance Authority'), `${item.filename} must reference corporate author`);

    // Keyword verification
    for (const keyword of item.keywords) {
        assert.ok(content.includes(keyword), `${item.filename} must contain required section/keyword: '${keyword}'`);
    }

    console.log(`  [PASS] Verified ${item.filename} header & content integrity.`);
}

console.log('[EAORCS Layer D Test] Customer Success Dossier verification PASSED successfully.\n');
