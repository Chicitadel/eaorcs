/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Commercial Evidence Index Test Suite
 * File           : eaorcs_commercial_evidence_index_engine.test.js
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
 * CORP: Layer A Verification - Commercial Evidence Indexing Stream
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
const { generateEvidenceIndex, CommercialEvidenceIndexEngine } = require('../../engine/evidence/CommercialEvidenceIndexEngine');

async function runCommercialEvidenceIndexEngineTests() {
  console.log('================================================================');
  console.log('  EAORCS COMMERCIAL EVIDENCE INDEX ENGINE VERIFICATION');
  console.log('================================================================\n');

  const workspaceRoot = path.resolve(__dirname, '../../../../');
  console.log(`[1] Executing generateEvidenceIndex for workspace: ${workspaceRoot}`);

  const result = generateEvidenceIndex(workspaceRoot);

  assert.strictEqual(result.success, true, 'Engine execution must succeed');
  assert.ok(result.totalRecordCount >= 9, 'Must generate evidence records across at least 9 categories');

  console.log(`[2] Verifying generated manifest & index files...`);
  assert.ok(fs.existsSync(result.manifestJsonPath), `EVIDENCE_MANIFEST.json must exist at ${result.manifestJsonPath}`);
  assert.ok(fs.existsSync(result.evidenceIndexYamlPath), `evidence_index.yaml must exist at ${result.evidenceIndexYamlPath}`);

  console.log(`[3] Validating JSON Manifest Structure...`);
  const manifestData = JSON.parse(fs.readFileSync(result.manifestJsonPath, 'utf8'));

  assert.strictEqual(manifestData.manifestVersion, '2026.3.1-LTS');
  assert.strictEqual(manifestData.header.project, 'Universal Autonomous AI Governance Operating System (UAIGOS)');
  assert.strictEqual(manifestData.header.author, 'Ujomor Systems & Enterprise Governance Authority');

  const requiredCategories = [
    'security',
    'performance',
    'packaging',
    'licensing',
    'governance',
    'architecture',
    'marketplace',
    'deployment',
    'validation'
  ];

  console.log(`[4] Verifying 9 Core Categories in Manifest...`);
  for (const category of requiredCategories) {
    assert.ok(manifestData.categories[category], `Category ${category} must be present in manifest`);
    assert.ok(Array.isArray(manifestData.categories[category]), `Category ${category} records must be an array`);
    assert.ok(manifestData.categories[category].length > 0, `Category ${category} must contain at least 1 record`);

    const record = manifestData.categories[category][0];
    assert.ok(record.id, `Record in ${category} must have a UUID`);
    assert.ok(record.sha256, `Record in ${category} must have a SHA-256 digest`);
    assert.strictEqual(record.sha256.length, 64, `SHA-256 hash must be 64 characters hex string`);
    assert.ok(record.ownerClaim, `Record in ${category} must have an owner claim`);
    assert.ok(record.timestamp, `Record in ${category} must have a timestamp`);
    assert.ok(record.expiration && record.expiration.expiresAt, `Record in ${category} must have expiration parameters`);
    assert.strictEqual(record.expiration.status, 'ACTIVE');
  }

  console.log(`[5] Verifying YAML Index Content...`);
  const yamlContent = fs.readFileSync(result.evidenceIndexYamlPath, 'utf8');
  assert.ok(yamlContent.includes('Universal Autonomous AI Governance Operating System (UAIGOS)'));
  assert.ok(yamlContent.includes('manifestVersion: 2026.3.1-LTS'));

  console.log('\n----------------------------------------------------------------');
  console.log(`  PASSED: All Commercial Evidence Index Engine Tests Succeeded!`);
  console.log(`  Total Records Indexed: ${result.totalRecordCount}`);
  console.log('----------------------------------------------------------------\n');
}

runCommercialEvidenceIndexEngineTests().catch(err => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
