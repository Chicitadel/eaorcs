/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Documentation Intelligence Center
 * File           : eaorcs_subsystem3_docs_center.test.js
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
 * CORP: Subsystem 3 Verification Test Suite
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

const assert = require('assert');
const fs = require('fs');
const path = require('path');

function runSubsystem3Tests() {
    console.log('[TEST] Verifying Subsystem 3: Documentation Intelligence Center UI...');

    const filePath = path.resolve(__dirname, '../../docs/docs_center.html');
    assert.strictEqual(fs.existsSync(filePath), true, 'docs_center.html MUST exist');

    const htmlContent = fs.readFileSync(filePath, 'utf8');

    // 1. Verify UAIGOS Corporate Header Block
    assert.ok(htmlContent.includes('Universal Autonomous AI Governance Operating System (UAIGOS)'), 'Must contain UAIGOS project header');
    assert.ok(htmlContent.includes('Ujomor Systems & Enterprise Governance Authority'), 'Must contain corporate author header');
    assert.ok(htmlContent.includes('Classification : ENTERPRISE | RESTRICTED'), 'Must contain classification header');
    assert.ok(htmlContent.includes('CORP: Subsystem 3'), 'Must contain CORP stream reference');

    // 2. Verify Top Navigation Bar & 9 Required Menu Items
    const requiredNav = ['Home', 'Workspace', 'Reports', 'Documentation', 'CLI Center', 'Marketplace', 'Licensing', 'Support', 'Settings'];
    requiredNav.forEach(nav => {
        assert.ok(htmlContent.includes(nav), `Top Navbar must contain navigation item: ${nav}`);
    });

    // 3. Verify Design & Typography
    assert.ok(htmlContent.includes('Inter'), 'Must include Inter font');
    assert.ok(htmlContent.includes('Outfit'), 'Must include Outfit font');
    assert.ok(htmlContent.includes('JetBrains Mono'), 'Must include JetBrains Mono font');
    assert.ok(htmlContent.includes('backdrop-filter'), 'Must include glassmorphism styling');

    // 4. Verify 25 Health & Domain Coverage Categories
    const sampleCategories = [
        'Architecture & ADRs',
        'Core Engine Facade',
        'API Reference & OpenAPI',
        'Governance & Corporate Policy',
        'Security & OWASP ASVS',
        'Operational Readiness (S0-S12)',
        'Evidence & Audit Engine',
        'CLI Command Center Reference',
        'Adapter Suites & Contracts',
        'Data Schemas & JSON-LD',
        'Infrastructure & Kubernetes',
        'Disaster Recovery & BCP',
        'Performance & Benchmarks',
        'Legal & IP Protection',
        'Licensing & Commercial Engine',
        'Telemetry & Observability',
        'Identity & RBAC Access',
        'Test Freeze & Verification',
        'Integration & Partner Guides',
        'Developer SDK & Client Libs',
        'Threat Models & STRIDE',
        'Incident Response Playbooks',
        'SLA & Enterprise Contracts',
        'End-User & Admin Manuals',
        'Release Engineering & CI/CD'
    ];
    sampleCategories.forEach(cat => {
        assert.ok(htmlContent.includes(cat), `Must include 25-category meter for: ${cat}`);
    });

    // 5. Verify VS Code Explorer & Inferred Missing Docs Drawer with "Generate Draft" AI Button
    assert.ok(htmlContent.includes('Explorer'), 'Must contain VS Code Style Explorer');
    assert.ok(htmlContent.includes('Inferred Missing Docs'), 'Must contain Inferred Missing Docs drawer');
    assert.ok(htmlContent.includes('Generate Draft'), 'Must contain "Generate Draft" AI button');

    // 6. Verify Interactive Knowledge Graph Explorer
    assert.ok(htmlContent.includes('Interactive Knowledge Graph Explorer'), 'Must contain Knowledge Graph Explorer section');
    assert.ok(htmlContent.includes('Capability → Code → API → Doc → ADR → Test → Evidence'), 'Must contain traceability node chain');

    // 7. Verify Built-in In-Browser Document Viewer
    assert.ok(htmlContent.includes('Markdown Preview'), 'Must include Markdown Preview tab');
    assert.ok(htmlContent.includes('Mermaid Diagram'), 'Must include Mermaid Diagram renderer');
    assert.ok(htmlContent.includes('OpenAPI Spec'), 'Must include OpenAPI Spec viewer');

    // 8. Verify Universal Search & Linked Sources Manager
    assert.ok(htmlContent.includes('Search Docs & APIs'), 'Must include Universal Search trigger');
    assert.ok(htmlContent.includes('Community'), 'Must include Community Source Tier');
    assert.ok(htmlContent.includes('Professional'), 'Must include Professional Source Tier');
    assert.ok(htmlContent.includes('Enterprise'), 'Must include Enterprise Source Tier');
    assert.ok(htmlContent.includes('Sovereign'), 'Must include Sovereign Source Tier');

    console.log('✅ Subsystem 3 Verification Complete: ALL 8 Exit Criteria PASSED cleanly.');
}

runSubsystem3Tests();
