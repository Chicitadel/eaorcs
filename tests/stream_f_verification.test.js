/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Tests / Stream F Integration Verification Test Suite
 * File           : stream_f_verification.test.js
 * Version        : 2026.2-LTS
 * Author         : Ujomor Engineering Governance Authority & Verification Team
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
 * Created Date   : 2026-08-02
 * Last Modified  : 2026-08-02
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 * - Ujomor Engineering Governance Authority Approved
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST SP 800-161
 *
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const AirRoofersTelemetryClient = require('../engine/integration/AirRoofersTelemetryClient');
const AirRoofersIamClient = require('../engine/integration/AirRoofersIamClient');
const AdapterComplianceEngine = require('../engine/integration/AdapterComplianceEngine');

async function runStreamFTestSuite() {
  console.log('================================================================');
  console.log('  EAORCS STREAM F - TELEMETRY & IAM INTEGRATION VERIFICATION');
  console.log('================================================================\n');

  let passedCount = 0;
  let failedCount = 0;

  function testStep(name, fn) {
    try {
      fn();
      console.log(`  ✓ [PASS] ${name}`);
      passedCount++;
    } catch (err) {
      console.error(`  ✗ [FAIL] ${name}: ${err.message}`);
      failedCount++;
    }
  }

  async function asyncTestStep(name, fn) {
    try {
      await fn();
      console.log(`  ✓ [PASS] ${name}`);
      passedCount++;
    } catch (err) {
      console.error(`  ✗ [FAIL] ${name}: ${err.message}`);
      failedCount++;
    }
  }

  // Section 1: Telemetry Client Verification
  console.log('[Section 1] AirRoofersTelemetryClient Verification...');

  testStep('1.1 Instantiation and Default Endpoint Configuration', () => {
    const client = new AirRoofersTelemetryClient();
    assert.strictEqual(client.endpoint, 'https://telemetry.airroofers.eu');
    assert.ok(client.apiKey);
  });

  testStep('1.2 Sovereign Anonymization & PII Scrubbing', () => {
    const client = new AirRoofersTelemetryClient();
    const rawPayload = {
      user: 'john_doe',
      email: 'john@example.com',
      ip: '192.168.1.50',
      password: 'secretPassword123',
      metrics: {
        executionTimeMs: 42,
        readinessScore: 98.5,
        userQuery: 'user info at 10.0.0.1 and user@domain.com'
      }
    };

    const cleanPayload = client.anonymizePayload(rawPayload);
    assert.strictEqual(cleanPayload.user, '[REDACTED_SENSITIVE_DATA]');
    assert.strictEqual(cleanPayload.email, '[REDACTED_SENSITIVE_DATA]');
    assert.strictEqual(cleanPayload.ip, '[REDACTED_SENSITIVE_DATA]');
    assert.strictEqual(cleanPayload.password, '[REDACTED_SENSITIVE_DATA]');
    assert.strictEqual(cleanPayload.metrics.executionTimeMs, 42);
    assert.strictEqual(cleanPayload.metrics.readinessScore, 98.5);
    assert.ok(cleanPayload.metrics.userQuery.includes('[REDACTED_IP]'));
    assert.ok(cleanPayload.metrics.userQuery.includes('[REDACTED_EMAIL]'));
  });

  await asyncTestStep('1.3 Telemetry Egress with X-Telemetry-Key & X-Correlation-ID', async () => {
    process.env.NODE_ENV = 'test';
    const client = new AirRoofersTelemetryClient({ endpoint: 'https://telemetry.airroofers.eu', apiKey: 'test-telemetry-key-123' });
    const result = await client.sendTelemetry({ cpuLoad: 0.15, memoryMb: 128 }, 'corr-test-999');

    assert.strictEqual(result.status, 'RECORDED_OFFLINE');
    assert.strictEqual(result.correlationId, 'corr-test-999');
    assert.strictEqual(result.headers['X-Telemetry-Key'], 'test-telemetry-key-123');
    assert.strictEqual(result.headers['X-Correlation-ID'], 'corr-test-999');
    assert.strictEqual(result.event.service, 'eaorcs-core-runtime');
  });

  await asyncTestStep('1.4 Buffer Queue & Offline Fallback', async () => {
    process.env.NODE_ENV = 'test';
    const client = new AirRoofersTelemetryClient();
    client.clearBuffer();

    await client.sendTelemetry({ step: 1 });
    await client.sendTelemetry({ step: 2 });

    const buffered = client.getBufferedTelemetry();
    assert.strictEqual(buffered.length, 2);
    assert.strictEqual(buffered[0].payload.step, 1);
    assert.strictEqual(buffered[1].payload.step, 2);

    client.clearBuffer();
    assert.strictEqual(client.getBufferedTelemetry().length, 0);
  });

  // Section 2: IAM Client Verification
  console.log('\n[Section 2] AirRoofersIamClient Verification...');

  testStep('2.1 Instantiation and Default SSO Endpoint Configuration', () => {
    const iam = new AirRoofersIamClient();
    assert.strictEqual(iam.ssoEndpoint, 'https://identity.airroofers.eu');
  });

  testStep('2.2 Mock Enterprise JWT Validation', () => {
    const iam = new AirRoofersIamClient();
    const result = iam.validateJwtClaims('mock-enterprise-token-xyz');

    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.source, 'https://identity.airroofers.eu');
    assert.strictEqual(result.claims.tier, 'ENTERPRISE');
    assert.ok(result.claims.rbac.includes('CERTIFY'));
    assert.ok(result.claims.rbac.includes('AUDIT'));
  });

  testStep('2.3 Standard JWT Claims Decoding & Verification', () => {
    const iam = new AirRoofersIamClient();

    // Construct valid sample JWT payload
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
    const payload = Buffer.from(JSON.stringify({
      sub: 'user-corp-01',
      tenantId: 'tenant-acme-ltd',
      tier: 'ENTERPRISE',
      rbac: ['EXECUTE', 'AUDIT'],
      exp: Math.floor(Date.now() / 1000) + 3600
    })).toString('base64');

    const sampleJwt = `${header}.${payload}.signatureMock`;

    const result = iam.validateJwtClaims(sampleJwt);
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.claims.sub, 'user-corp-01');
    assert.strictEqual(result.claims.tenantId, 'tenant-acme-ltd');
    assert.strictEqual(result.claims.tier, 'ENTERPRISE');
    assert.deepStrictEqual(result.claims.rbac, ['EXECUTE', 'AUDIT']);
  });

  testStep('2.4 Security Rejection of Insecure "none" Algorithm', () => {
    const iam = new AirRoofersIamClient();

    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64');
    const payload = Buffer.from(JSON.stringify({ sub: 'attacker', tier: 'ENTERPRISE' })).toString('base64');
    const insecureJwt = `${header}.${payload}.`;

    const result = iam.validateJwtClaims(insecureJwt);
    assert.strictEqual(result.valid, false);
    assert.strictEqual(result.error, 'INSECURE_ALGORITHM_NONE');
  });

  testStep('2.5 Tenant Entitlement Evaluation Matrix', () => {
    const iam = new AirRoofersIamClient();

    const communityToken = 'mock-community-token';
    const enterpriseToken = 'mock-enterprise-token';

    const communityAudit = iam.evaluateTenantEntitlement(communityToken, 'BASIC_AUDIT');
    assert.strictEqual(communityAudit.entitled, true);

    const communityCertify = iam.evaluateTenantEntitlement(communityToken, 'CERTIFY');
    assert.strictEqual(communityCertify.entitled, false);

    const enterpriseCertify = iam.evaluateTenantEntitlement(enterpriseToken, 'CERTIFY');
    assert.strictEqual(enterpriseCertify.entitled, true);
    assert.strictEqual(enterpriseCertify.tier, 'ENTERPRISE');
  });

  // Section 3: Adapter & Governance Compliance Verification
  console.log('\n[Section 3] Adapter & Governance Compliance Verification...');

  testStep('3.1 Adapter Compliance Engine Check for Telemetry & Identity', () => {
    const complianceEngine = new AdapterComplianceEngine();

    const telemetryFile = path.resolve(__dirname, '../engine/integration/AirRoofersTelemetryClient.js');
    const iamFile = path.resolve(__dirname, '../engine/integration/AirRoofersIamClient.js');

    const telemetryResult = complianceEngine.checkAdapter(telemetryFile, 'TelemetryAdapter');
    assert.strictEqual(telemetryResult.status, 'PASS', `TelemetryAdapter failed: ${JSON.stringify(telemetryResult.violations)}`);
    assert.strictEqual(telemetryResult.endpoint_found, true, 'TelemetryAdapter must reference telemetry.airroofers.eu');
    assert.strictEqual(telemetryResult.correlation_id_present, true, 'TelemetryAdapter must handle X-Correlation-ID / X-Telemetry-Key');

    const identityResult = complianceEngine.checkAdapter(iamFile, 'IdentityAdapter');
    assert.strictEqual(identityResult.status, 'PASS', `IdentityAdapter failed: ${JSON.stringify(identityResult.violations)}`);
    assert.strictEqual(identityResult.endpoint_found, true, 'IdentityAdapter must reference identity.airroofers.eu');
  });

  testStep('3.2 Mandatory Enterprise Header Standard & Zero AI Mentions', () => {
    const targetFiles = [
      path.resolve(__dirname, '../engine/integration/AirRoofersTelemetryClient.js'),
      path.resolve(__dirname, '../engine/integration/AirRoofersIamClient.js')
    ];

    for (const filePath of targetFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      const filename = path.basename(filePath);

      assert.ok(content.startsWith('/******************************************************************************'), `${filename} must start with enterprise header block`);
      assert.ok(content.includes('Governance:'), `${filename} must contain Governance block`);
      assert.ok(content.includes('Standards:'), `${filename} must contain Standards block`);
      assert.ok(content.includes('Signatures:'), `${filename} must contain Signatures block`);
      assert.ok(content.includes('Copyright (c) 2026'), `${filename} must contain copyright statement`);

      // Ensure ZERO AI generation/agent mentions
      const lowerContent = content.toLowerCase();
      assert.strictEqual(lowerContent.includes('ai governed'), false, `${filename} must not contain 'AI Governed'`);
      assert.strictEqual(lowerContent.includes('ai generated'), false, `${filename} must not contain 'AI generated'`);
      assert.strictEqual(lowerContent.includes('ai agent'), false, `${filename} must not contain 'AI agent'`);
      assert.ok(content.includes('Ujomor Engineering Governance Authority'), `${filename} must reference Ujomor Engineering Governance Authority`);
    }
  });

  console.log('\n================================================================');
  console.log(`  VERIFICATION RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('================================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runStreamFTestSuite().catch(err => {
  console.error('Test Execution Error:', err);
  process.exit(1);
});
