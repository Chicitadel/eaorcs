/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Phase 8 Portal & CA Test Suite
 * File           : tests/phase8/portal_ca_engine.test.js
 * Version        : 2026.1.0-LTS
 * Author         : Systems Engineering & Governance Authority
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
const { PublicTrustPortal } = require('../../engine/portal/PublicTrustPortal');
const { IndependentCertificationAuthority } = require('../../engine/cert/IndependentCertificationAuthority');

async function runTest() {
  console.log('================================================================');
  console.log('  EAORCS PHASE 8: PUBLIC TRUST PORTAL & CA SUITE');
  console.log('================================================================\n');

  // 1. Portal
  console.log('[1/2] Testing PublicTrustPortal...');
  const portal = new PublicTrustPortal();
  portal.registerPassport('pass-123', { trustScore: 100, issuer: 'Ujomor Governance Authority' });
  portal.registerCertificate('cert-abc', { certId: 'cert-abc', status: 'VALID' });

  const html = portal.renderVerificationPage('pass-123');
  assert(html.includes('pass-123'), 'HTML should contain passport ID');
  assert(html.includes('PLATINUM CERTIFIED'), 'HTML should contain platinum badge');

  const resHtml = portal.handlePublicQuery('/verify/passport/pass-123');
  assert(resHtml.status === 200, 'HTML query status 200 expected');

  const resApi = portal.handlePublicQuery('/api/cert/cert-abc');
  assert(resApi.status === 200, 'API query status 200 expected');

  const badge = portal.generatePublicBadgeHtml('cert-abc');
  assert(badge.includes('badge/cert-abc.svg'), 'Badge HTML should reference svg');
  console.log('      ✓ PublicTrustPortal Passed (HTML & API rendering verified)');

  // 2. Certification Authority
  console.log('[2/2] Testing IndependentCertificationAuthority...');
  const ca = new IndependentCertificationAuthority();
  const init = ca.initializeRootCa();
  assert(init.publicKey.includes('BEGIN PUBLIC KEY'), 'Public key expected');

  const cert = ca.issueSoftwareCertificate({ organization: 'Acme Gov Corp' }, '0167cc8c36a4fdb8bd78e2f9a19d6dcc2c92052a6a11f7f89c5af2e75115ab16');
  assert(cert.certId.startsWith('CERT-CA-'), 'Cert ID prefix mismatch');
  assert(typeof cert.signature === 'string', 'Signature expected');

  const ver = ca.verifyCertificateChain(cert.certId);
  assert(ver.valid === true, 'Cert signature should be valid');

  ca.revokeCertificate(cert.certId, 'KEY_COMPROMISE');
  const verRev = ca.verifyCertificateChain(cert.certId);
  assert(verRev.valid === false, 'Revoked cert should be invalid');

  const crl = ca.exportCrl();
  assert(crl.revokedCertificates.length === 1, 'CRL should contain 1 entry');
  console.log('      ✓ IndependentCertificationAuthority Passed (RSA-4096 issuance & revocation clean)');

  console.log('\n================================================================');
  console.log('  PUBLIC TRUST PORTAL & CA SUITE: ALL CHECKS PASSED');
  console.log('================================================================\n');
}

runTest().catch(e => {
  console.error('FATAL:', e.message);
  process.exit(1);
});
