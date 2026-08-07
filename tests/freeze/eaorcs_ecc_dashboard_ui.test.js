/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Enterprise Command Center (ECC) Dashboard Test
 * File           : eaorcs_ecc_dashboard_ui.test.js
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
 * CORP: Subsystem 3 - Premium ECC UI Dashboard Test
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

console.log('=== [TEST] Running Subsystem 3: Premium ECC UI Dashboard Tests ===');

const htmlFilePath = path.join(__dirname, '..', '..', 'docs', 'ecc_dashboard.html');

// 1. File existence check
assert.strictEqual(fs.existsSync(htmlFilePath), true, 'docs/ecc_dashboard.html must exist');
const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');

// 2. UAIGOS Corporate Header Block
assert.strictEqual(htmlContent.includes('Universal Autonomous AI Governance Operating System (UAIGOS)'), true, 'Must include UAIGOS corporate header title');
assert.strictEqual(htmlContent.includes('Author         : Ujomor Systems & Enterprise Governance Authority'), true, 'Must include Ujomor Systems corporate author');
assert.strictEqual(htmlContent.includes('Copyright (c) 2026 Ujomor Systems & Enterprise Governance'), true, 'Must include copyright notice');

// 3. Workspace Scope Selector, Mission Badge, Connection Status
assert.strictEqual(htmlContent.includes('d:\\ujomor-platform\\products\\eaorcs'), true, 'Must include workspace scope option eaorcs');
assert.strictEqual(htmlContent.includes('Air Roofers Federation (airroofers.eu)'), true, 'Must include Air Roofers Federation scope');
assert.strictEqual(htmlContent.includes('MISSION: Air Roofers Federation Operational Orchestration'), true, 'Must include Mission Context badge');
assert.strictEqual(htmlContent.includes('● LIVE SYSTEM CONNECTED'), true, 'Must include Connection Status indicator');

// 4. Governed Execution CTA & Progress Drawer
assert.strictEqual(htmlContent.includes('Start Governed Execution'), true, 'Must include Start Governed Execution button');
assert.strictEqual(htmlContent.includes('triggerGovernedExecution()'), true, 'Must include Governed Execution trigger handler');
assert.strictEqual(htmlContent.includes('cicd-progress-bar') || htmlContent.includes('progress-bar-container'), true, 'Must include live progress bar');

// 5. Air Roofers Federation Topology View (8 Nodes & Health Badges)
const topologyNodes = ['Commercial', 'Developer Portal', 'Marketplace', 'Identity', 'Billing', 'CMS', 'Support', 'Products'];
topologyNodes.forEach(node => {
    assert.strictEqual(htmlContent.includes(node), true, `Topology view must include node: ${node}`);
});
assert.strictEqual(htmlContent.includes('HEALTHY'), true, 'Must include HEALTHY status badge');
assert.strictEqual(htmlContent.includes('WARNING'), true, 'Must include WARNING status badge');
assert.strictEqual(htmlContent.includes('CRITICAL'), true, 'Must include CRITICAL status badge');

// 6. Live Execution Streams Monitor (Streams A through L)
const streams = ['Stream A', 'Stream B', 'Stream C', 'Stream D', 'Stream E', 'Stream F', 'Stream G', 'Stream H', 'Stream I', 'Stream J', 'Stream K', 'Stream L'];
streams.forEach(stream => {
    assert.strictEqual(htmlContent.includes(stream), true, `Execution streams monitor must include: ${stream}`);
});

// 7. Interactive Platform Digital Twin SVG/Canvas Graph (10 Nodes)
const twinNodes = ['Products', 'Capabilities', 'Dependencies', 'Governance', 'Security', 'Deployments', 'Licenses', 'Evidence', 'Operations', 'Marketplace'];
twinNodes.forEach(node => {
    assert.strictEqual(htmlContent.includes(node), true, `Digital twin graph must include node: ${node}`);
});
assert.strictEqual(htmlContent.includes('openDigitalTwinNode'), true, 'Must include Digital Twin node interaction handler');

// 8. Technical Debt Queue (5 Categories)
const debtCategories = ['Mocks', 'Scaffolds', 'TODOs', 'Duplicate APIs', 'Undocumented APIs'];
debtCategories.forEach(cat => {
    assert.strictEqual(htmlContent.includes(cat), true, `Tech debt queue must include category tab: ${cat}`);
});

// 9. Real-time Polling & Fallback
assert.strictEqual(htmlContent.includes("fetch('/api/status')"), true, 'Must include fetch(/api/status) call');
assert.strictEqual(htmlContent.includes('setInterval(pollStatus, 5000)'), true, 'Must include 5s polling interval');
assert.strictEqual(htmlContent.includes('EMBEDDED_ECC_DATA'), true, 'Must include embedded JSON data fallback');

console.log('✓ ALL SUBSYSTEM 3 ECC UI DASHBOARD TESTS PASSED SUCCESSFULLY!');
