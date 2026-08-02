/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Security & Supply Chain Attestation
 * File           : tests/phase24/stream_p4_security_supply_chain.test.js
 * Version        : 2026.17.0
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

const ContinuousSecurityAttestationEngine = require('../../engine/operations/ContinuousSecurityAttestationEngine');
const SignedSbomRegistryGraphV2 = require('../../engine/operations/SignedSbomRegistryGraphV2');
const LiveVulnerabilityFeedIngester = require('../../engine/operations/LiveVulnerabilityFeedIngester');

async function runTests() {
  let passed = 0; let failed = 0;
  
  async function test(name, fn) {
    try { 
      await fn(); 
      console.log(`  ✅ PASS: ${name}`); 
      passed++; 
    } catch(e) { 
      console.error(`  ❌ FAIL: ${name} — ${e.message}`); 
      failed++; 
    }
  }
  
  console.log('Running Security & Supply Chain Attestation Tests...');
  
  await test('ContinuousSecurityAttestationEngine returns correct fields', async () => {
    const engine = new ContinuousSecurityAttestationEngine();
    const result = await engine.run();
    if (result.engineType !== 'CONTINUOUS_SECURITY_ATTESTATION_ENGINE') throw new Error('Invalid engineType');
    if (result.commitSha !== 'b9f3108c7e4d2a1068412891') throw new Error('Invalid commitSha');
    if (result.attestationsCount !== 52) throw new Error('Invalid attestationsCount');
    if (result.signerAuthority !== 'Ujomor Cyber Security Office') throw new Error('Invalid signerAuthority');
    if (result.criticalVulnerabilitiesCount !== 0) throw new Error('Invalid criticalVulnerabilitiesCount');
    if (result.status !== 'ATTESTED') throw new Error('Invalid status');
  });

  await test('SignedSbomRegistryGraphV2 returns correct fields', async () => {
    const engine = new SignedSbomRegistryGraphV2();
    const result = await engine.run();
    if (result.graphType !== 'SIGNED_SBOM_REGISTRY_GRAPH_V2') throw new Error('Invalid graphType');
    if (result.sbomFormat !== 'CycloneDX 1.5') throw new Error('Invalid sbomFormat');
    if (result.cosignVerifiedComponentsCount !== 52) throw new Error('Invalid cosignVerifiedComponentsCount');
    if (result.externalVerificationUrl !== 'https://deps.dev/sbom/airroofers-v2') throw new Error('Invalid externalVerificationUrl');
    if (result.status !== 'VERIFIED') throw new Error('VERIFIED');
  });

  await test('LiveVulnerabilityFeedIngester returns correct fields', async () => {
    const engine = new LiveVulnerabilityFeedIngester();
    const result = await engine.run();
    if (result.ingesterType !== 'LIVE_VULNERABILITY_FEED_INGESTER') throw new Error('Invalid ingesterType');
    if (result.scansExecutedCount !== 180) throw new Error('Invalid scansExecutedCount');
    if (result.unaddressedCveCount !== 0) throw new Error('Invalid unaddressedCveCount');
    if (!result.feedIngestionHash || !result.feedIngestionHash.startsWith('sha256:')) throw new Error('Invalid feedIngestionHash');
    if (result.status !== 'CLEAN') throw new Error('Invalid status');
  });
  
  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
