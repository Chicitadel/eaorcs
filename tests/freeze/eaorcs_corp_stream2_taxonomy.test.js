/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Stream 2 Freeze Verification Test
 * File           : eaorcs_corp_stream2_taxonomy.test.js
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
 * CORP: Stream 2 — Structured bin/ Directory Taxonomy Test Suite
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');

const eaorcsRoot = path.resolve(__dirname, '../../');
const binDir = path.join(eaorcsRoot, 'bin');

console.log('[TEST] Executing Stream 2 Structured bin/ Directory Taxonomy Freeze Tests...');

// Test 1: Validate domain subdirectories existence
console.log('[TEST 1] Verifying domain subdirectories existence...');
const expectedSubdomains = [
    'commercial',
    'engineering',
    'qualification',
    'packaging',
    'governance'
];

for (const domain of expectedSubdomains) {
    const domainPath = path.join(binDir, domain);
    assert.ok(fs.existsSync(domainPath), `Domain directory bin/${domain} must exist`);
    assert.ok(fs.statSync(domainPath).isDirectory(), `bin/${domain} must be a directory`);
}
console.log(' -> All 5 domain subdirectories verified successfully.');

// Test 2: Verify binary files existence and UAIGOS headers
console.log('[TEST 2] Verifying binary files and UAIGOS corporate headers...');
const expectedFiles = [
    { path: path.join(binDir, 'commercial', 'eaorcs.js'), type: 'js' },
    { path: path.join(binDir, 'commercial', 'eaorcs'), type: 'sh' },
    { path: path.join(binDir, 'commercial', 'eaorcs.cmd'), type: 'cmd' },
    { path: path.join(binDir, 'engineering', 'eaorcs_dev_tools.js'), type: 'js' },
    { path: path.join(binDir, 'qualification', 'eaorcs_certify.js'), type: 'js' },
    { path: path.join(binDir, 'packaging', 'eaorcs_package.js'), type: 'js' },
    { path: path.join(binDir, 'governance', 'eaorcs_doc_drift.js'), type: 'js' },
    { path: path.join(binDir, 'eaorcs.js'), type: 'js' },
    { path: path.join(binDir, 'eaorcs'), type: 'sh' },
    { path: path.join(binDir, 'eaorcs.cmd'), type: 'cmd' }
];

for (const item of expectedFiles) {
    assert.ok(fs.existsSync(item.path), `File ${path.relative(eaorcsRoot, item.path)} must exist`);
    const content = fs.readFileSync(item.path, 'utf8');
    assert.ok(content.includes('Universal Autonomous AI Governance Operating System'), `File ${path.relative(eaorcsRoot, item.path)} missing UAIGOS header`);
    assert.ok(content.includes('Ujomor Systems & Enterprise Governance'), `File ${path.relative(eaorcsRoot, item.path)} missing Author organization header`);
}
console.log(' -> All binary files and UAIGOS corporate headers verified.');

// Test 3: Test execution of commercial CLI binary & root wrapper
console.log('[TEST 3] Testing execution of commercial CLI binary and root wrapper...');
const rootWrapperRes = spawnSync(process.execPath, [path.join(binDir, 'eaorcs.js'), 'version'], { cwd: eaorcsRoot });
assert.strictEqual(rootWrapperRes.status, 0, 'Root wrapper `node bin/eaorcs.js version` must exit with 0');
assert.ok(rootWrapperRes.stdout.toString().includes('EAORCS Commercial CLI v2026.3.1-LTS'), 'Root wrapper output must contain version string');

const commCliRes = spawnSync(process.execPath, [path.join(binDir, 'commercial', 'eaorcs.js'), 'version'], { cwd: eaorcsRoot });
assert.strictEqual(commCliRes.status, 0, 'Commercial CLI `node bin/commercial/eaorcs.js version` must exit with 0');
assert.ok(commCliRes.stdout.toString().includes('EAORCS Commercial CLI v2026.3.1-LTS'), 'Commercial CLI output must contain version string');

console.log(' -> Commercial CLI binary & root wrapper execution verified.');

// Test 4: Test execution of engineering dev tools
console.log('[TEST 4] Testing engineering dev tools execution...');
const devToolsRes = spawnSync(process.execPath, [path.join(binDir, 'engineering', 'eaorcs_dev_tools.js'), 'dev-audit'], { cwd: eaorcsRoot });
assert.strictEqual(devToolsRes.status, 0, 'Dev tools audit command must exit with 0');
assert.ok(devToolsRes.stdout.toString().includes('[Dev Tools Audit] PASS'), 'Dev tools output must indicate PASS');
console.log(' -> Engineering dev tools execution verified.');

// Test 5: Test execution of qualification runner
console.log('[TEST 5] Testing qualification runner execution...');
const certifyRes = spawnSync(process.execPath, [path.join(binDir, 'qualification', 'eaorcs_certify.js'), 'verify-compliance'], { cwd: eaorcsRoot });
assert.strictEqual(certifyRes.status, 0, 'Qualification runner compliance command must exit with 0');
assert.ok(certifyRes.stdout.toString().includes('[Qualification Runner] Compliance Audit PASS'), 'Certify output must indicate compliance PASS');
console.log(' -> Qualification runner execution verified.');

// Test 6: Test execution of release packaging runner
console.log('[TEST 6] Testing release packaging runner execution...');
const packagingRes = spawnSync(process.execPath, [path.join(binDir, 'packaging', 'eaorcs_package.js'), 'list-artifacts'], { cwd: eaorcsRoot });
assert.strictEqual(packagingRes.status, 0, 'Release packaging runner list command must exit with 0');
assert.ok(packagingRes.stdout.toString().includes('[Packaging Runner] Release artifacts inventory'), 'Packaging output must list artifacts');
console.log(' -> Release packaging runner execution verified.');

// Test 7: Test execution of governance doc drift scanner
console.log('[TEST 7] Testing governance doc drift scanner execution...');
const docDriftRes = spawnSync(process.execPath, [path.join(binDir, 'governance', 'eaorcs_doc_drift.js'), 'audit-headers'], { cwd: eaorcsRoot });
assert.strictEqual(docDriftRes.status, 0, 'Doc drift scanner audit command must exit with 0');
assert.ok(docDriftRes.stdout.toString().includes('[Doc Drift Scanner] Auditing UAIGOS corporate header blocks'), 'Doc drift scanner output verified');
console.log(' -> Governance doc drift scanner execution verified.');

console.log('[PASS] Stream 2 Structured bin/ Directory Taxonomy Freeze Tests completed successfully!');
