/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : LiveDeploymentValidation
 * File           : tests/phase20/stream_a_live_deployment_validation.test.js
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

const LiveDeploymentValidator = require('../../engine/validation/LiveDeploymentValidator');
const RuntimeEnvironmentVerifier = require('../../engine/validation/RuntimeEnvironmentVerifier');
const DeploymentHealthAttestor = require('../../engine/validation/DeploymentHealthAttestor');

async function runTests() {
  let passed = 0; let failed = 0;
  async function test(name, fn) {
    try { await fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
    catch(e) { console.error(`  ❌ FAIL: ${name} — ${e.message}`); failed++; }
  }

  await test('LiveDeploymentValidator returns valid deployment details', async () => {
    const validator = new LiveDeploymentValidator();
    const result = await validator.run();
    if (result.validationType !== 'LIVE_DEPLOYMENT_VALIDATION') throw new Error('Invalid validationType');
    if (result.targetRuntime !== 'PRODUCTION_KUBERNETES_CLUSTER') throw new Error('Invalid targetRuntime');
    if (result.deploymentId !== 'eaorcs-prod-2026.20.0') throw new Error('Invalid deploymentId');
    if (result.validationStatus !== 'PASSED') throw new Error('Invalid validationStatus');
    if (result.deployedServices.length !== 5) throw new Error('Expected 5 deployed services');
  });

  await test('RuntimeEnvironmentVerifier returns verified runtime environment', async () => {
    const verifier = new RuntimeEnvironmentVerifier();
    const result = await verifier.run();
    if (result.verifierType !== 'RUNTIME_ENVIRONMENT_VERIFICATION') throw new Error('Invalid verifierType');
    if (result.environmentIsolation !== 'HARDENED_ZERO_TRUST') throw new Error('Invalid environmentIsolation');
    if (result.tlsEnforcement !== 'TLS_1_3_STRICT') throw new Error('Invalid tlsEnforcement');
    if (result.secretsIsolation !== 'SECRETS_MANAGER_MUTUAL_AUTH') throw new Error('Invalid secretsIsolation');
    if (result.runtimeHealthScore !== 100) throw new Error('Invalid runtimeHealthScore');
    if (result.status !== 'VERIFIED') throw new Error('Invalid status');
  });

  await test('DeploymentHealthAttestor returns valid attestation', async () => {
    const attestor = new DeploymentHealthAttestor();
    const result = await attestor.run();
    if (result.attestorType !== 'DEPLOYMENT_HEALTH_ATTESTATION') throw new Error('Invalid attestorType');
    if (result.attestationProvider !== 'Ujomor Runtime Operations Authority') throw new Error('Invalid attestationProvider');
    if (result.signatureAlgorithm !== 'Ed25519') throw new Error('Invalid signatureAlgorithm');
    if (result.attestationValid !== true) throw new Error('Invalid attestationValid');
    if (result.status !== 'ATTESTED') throw new Error('Invalid status');
    if (result.healthAttestations.length !== 5) throw new Error('Expected 5 health attestations');
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
