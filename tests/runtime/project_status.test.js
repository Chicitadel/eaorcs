/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Project Status & Exit Criteria Test Suite
 * File           : project_status.test.js
 * Version        : 2026.3.0-LTS
 * Author         : Air Roofers Platform Governance Authority
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

async function runProjectStatusSuite() {
  console.log('\n=== PROJECT STATUS & EXIT CRITERIA TEST SUITE ===\n');
  let passed = 0;
  let failed = 0;

  // 1. Verify PROJECT_STATUS.md Existence & Key Sections
  try {
    const statusPath = path.join(__dirname, '../../PROJECT_STATUS.md');
    assert.ok(fs.existsSync(statusPath), 'PROJECT_STATUS.md must exist');

    const content = fs.readFileSync(statusPath, 'utf-8');
    assert.ok(content.includes('Engineering Status'));
    assert.ok(content.includes('COMPLETE'));
    assert.ok(content.includes('PERMANENTLY FROZEN'));
    assert.ok(content.includes('Phase 5 Exit Criteria'));
    assert.ok(content.includes('Independent Penetration Test'));
    assert.ok(content.includes('TRACK A'));

    console.log('✅ 1. PROJECT_STATUS.md Verified (All Status & Exit Criteria Defined)');
    passed++;
  } catch (err) {
    console.error('❌ 1. PROJECT_STATUS.md Verification FAILED:', err.message);
    failed++;
  }

  console.log(`\n${'═'.repeat(65)}`);
  if (failed === 0) {
    console.log(`🎉 ALL ${passed} PROJECT STATUS TESTS PASSED!`);
  } else {
    console.log(`⚠️  ${passed} PASSED | ${failed} FAILED`);
  }
  console.log(`${'═'.repeat(65)}\n`);

  if (failed > 0) process.exit(1);
}

if (require.main === module) {
  runProjectStatusSuite().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { runProjectStatusSuite };
