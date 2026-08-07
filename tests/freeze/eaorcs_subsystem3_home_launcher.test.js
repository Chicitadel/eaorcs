/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Subsystem 3 Home Launcher & Navigation Test
 * File           : eaorcs_subsystem3_home_launcher.test.js
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
 * CORP: Subsystem 3 / EAORCS-CORP-S3 / HOME-LAUNCHER-TEST
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

const rootDir = path.resolve(__dirname, '../../');
const homePath = path.join(rootDir, 'docs', 'home.html');
const eeosAppPath = path.join(rootDir, 'docs', 'eeos_app.html');
const reportsIndexPath = path.join(rootDir, 'reports', 'index.json');
const docsReportsIndexPath = path.join(rootDir, 'docs', 'reports', 'index.json');

console.log('--- RUNNING SUBSYSTEM 3 VERIFICATION TEST ---');

// 1. Verify reports/index.json
assert.strictEqual(fs.existsSync(reportsIndexPath), true, 'reports/index.json must exist');
const reportsData = JSON.parse(fs.readFileSync(reportsIndexPath, 'utf8'));
assert.strictEqual(Array.isArray(reportsData.reports), true, 'reports index must contain reports array');
assert.ok(reportsData.reports.length >= 5, 'reports index must contain at least 5 reports');
console.log('✓ reports/index.json verified successfully.');

// 2. Verify docs/reports/index.json
assert.strictEqual(fs.existsSync(docsReportsIndexPath), true, 'docs/reports/index.json must exist');
console.log('✓ docs/reports/index.json verified successfully.');

// 3. Verify home.html
assert.strictEqual(fs.existsSync(homePath), true, 'docs/home.html must exist');
const homeContent = fs.readFileSync(homePath, 'utf8');

// Check corporate header
assert.ok(homeContent.includes('Universal Autonomous AI Governance Operating System (UAIGOS)'), 'home.html must include UAIGOS header');
assert.ok(homeContent.includes('Subsystem 3 / EAORCS-CORP-S3 / HOME-LAUNCHER'), 'home.html must reference Subsystem 3');

// Check Developer Profile Card
assert.ok(homeContent.includes('Ignatus Chika Ujomor'), 'home.html must include developer Ignatus Chika Ujomor');
assert.ok(homeContent.includes('Air Roofers SAS'), 'home.html must include Air Roofers SAS');

// Check Workspace Scope Card
assert.ok(homeContent.includes('Air Roofers Federation'), 'home.html must include Air Roofers Federation workspace');
assert.ok(homeContent.includes('Healthy'), 'home.html must include workspace health status');
assert.ok(homeContent.includes('96% Commercial Readiness'), 'home.html must include 96% Commercial Readiness');

// Check Core Action Buttons
assert.ok(homeContent.includes('Continue Session'), 'home.html must include Continue Session button');
assert.ok(homeContent.includes('Start Governed Execution'), 'home.html must include Start Governed Execution button');
assert.ok(homeContent.includes('Open Latest Report'), 'home.html must include Open Latest Report button');
assert.ok(homeContent.includes('Browse History'), 'home.html must include Browse History button');
assert.ok(homeContent.includes('New Workspace'), 'home.html must include New Workspace button');

// Check Navigation Bar Links
assert.ok(homeContent.includes('Reports History'), 'home.html top nav must include Reports History');
assert.ok(homeContent.includes('Digital Twin'), 'home.html top nav must include Digital Twin');
assert.ok(homeContent.includes('Marketplace'), 'home.html top nav must include Marketplace');
assert.ok(homeContent.includes('Licensing'), 'home.html top nav must include Licensing');
assert.ok(homeContent.includes('Support'), 'home.html top nav must include Support');
assert.ok(homeContent.includes('Documentation'), 'home.html top nav must include Documentation');
assert.ok(homeContent.includes('Settings'), 'home.html top nav must include Settings');

// Check License & Support Cards
assert.ok(homeContent.includes('Enterprise Professional'), 'home.html must include Enterprise Professional license card');
assert.ok(homeContent.includes('Perpetual'), 'home.html must include Perpetual license type');
assert.ok(homeContent.includes('Live Diagnostics'), 'home.html support grid must include Live Diagnostics');
assert.ok(homeContent.includes('Immutable Report Snapshot Inspector'), 'home.html must include immutable snapshot modal');

console.log('✓ docs/home.html verified successfully.');

// 4. Verify eeos_app.html
assert.strictEqual(fs.existsSync(eeosAppPath), true, 'docs/eeos_app.html must exist');
const eeosContent = fs.readFileSync(eeosAppPath, 'utf8');

assert.ok(eeosContent.includes('← Return to Home'), 'eeos_app.html must contain header link Return to Home');
assert.ok(eeosContent.includes('home.html'), 'eeos_app.html must reference home.html');
assert.ok(eeosContent.includes('Report History'), 'eeos_app.html must contain Report History inspector');

console.log('✓ docs/eeos_app.html verified successfully.');
console.log('--- ALL SUBSYSTEM 3 VERIFICATION CHECKS PASSED ---');
