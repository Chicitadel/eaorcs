/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Capability Stream 8 Test Suite — Evidence Generation
 * File           : tests/pep/stream_h_evidence_generation.test.js
 * Version        : 2026.1.0-LTS
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
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');

const EvidenceGenerator = require('../../engine/audit/EvidenceGenerator');
const CapabilityRegistry = require('../../engine/registry/CapabilityRegistry');

function runStreamHEvidenceGenerationTests() {
  console.log('--------------------------------------------------------------------------------');
  console.log(' RUNNING STREAM 8: AUTOMATED EVIDENCE GENERATION TEST SUITE');
  console.log('--------------------------------------------------------------------------------');

  const capRegistry = new CapabilityRegistry();
  const capAudit = capRegistry.auditCapabilityCoverage();
  
  console.log(`[TEST 1] Verifying Capability Registry Stream Coverage...`);
  assert.strictEqual(capAudit.totalStreamsCovered, 8, 'Capability Registry must cover 8 Capability Streams');
  assert.strictEqual(capAudit.isFullyCovered, true, 'Capability Registry must be fully covered');
  console.log(`  └─ Total Capabilities Registered: ${capAudit.totalCapabilities}`);
  console.log(`  └─ Capability Streams Covered: ${capAudit.totalStreamsCovered} / 8 ✅`);

  console.log(`\n[TEST 2] Verifying Capability Impact Traceability Chain...`);
  const impact = capRegistry.analyzeImpact('CAP-EVIDENCE-GENERATION');
  assert.strictEqual(impact.capabilityId, 'CAP-EVIDENCE-GENERATION', 'Impact analysis must resolve CAP-EVIDENCE-GENERATION');
  assert.ok(impact.traceabilityChain.evidenceArtifacts.length > 0, 'Must contain evidence artifacts');
  console.log(`  └─ Capability: ${impact.name}`);
  console.log(`  └─ Traceability Chain Verified: ${impact.traceabilityChain.blueprintRequirements.join(', ')} ✅`);

  console.log(`\n[TEST 3] Verifying Automated Evidence Generation Engine...`);
  const generator = new EvidenceGenerator();
  const summary = generator.generateAllEvidence();
  assert.strictEqual(summary.status, 'SUCCESS', 'Evidence Generation must complete with status SUCCESS');
  assert.strictEqual(summary.sbomGenerated, true, 'SBOM manifest must be generated');
  assert.strictEqual(summary.provenanceGenerated, true, 'Software provenance attestation must be generated');

  const sbomFile = path.join(generator.evidenceDir, 'sbom_manifest.json');
  const provFile = path.join(generator.evidenceDir, 'provenance.json');
  assert.ok(fs.existsSync(sbomFile), 'sbom_manifest.json must physically exist');
  assert.ok(fs.existsSync(provFile), 'provenance.json must physically exist');
  console.log(`  └─ SBOM Manifest Created: ${sbomFile} ✅`);
  console.log(`  └─ SLSA Provenance Created: ${provFile} ✅`);

  console.log('--------------------------------------------------------------------------------');
  console.log(' ✅ STREAM 8 (EVIDENCE GENERATION) TEST SUITE PASSED SUCCESSFULLY');
  console.log('--------------------------------------------------------------------------------\n');
}

if (require.main === module) {
  try {
    runStreamHEvidenceGenerationTests();
  } catch (err) {
    console.error('❌ STREAM 8 TEST SUITE FAILED:', err);
    process.exit(1);
  }
}

module.exports = { runStreamHEvidenceGenerationTests };
