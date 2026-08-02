/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Stream E — Capability System & Brokerage Comprehensive Test Suite
 * File           : tests/streams_e_capability_brokerage.test.js
 * Version        : 2026.2-LTS (v1.1.0-FROZEN Master Specification)
 * Author         : Ujomor Engineering Governance Authority
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
 * Created Date   : 2026-08-02
 * Last Modified  : 2026-08-02
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Architecture Authority Approved & FROZEN (v1.1.0-FROZEN)
 * - Security Reviewed (ISO 27001, SOC 2, OWASP ASVS, NIST SP 800-161, DORA, NIS2, EU Data Act)
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 *
 * Standards:
 * - EAORCS Blueprint v1.0
 * - DPA/PDA v1.1.0-FROZEN
 * - ISO 27001 / SOC 2 / OWASP ASVS / NIST SP 800-161 / SLSA Level 4
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
const CapabilityContractValidator = require('../engine/kernel/CapabilityContractValidator');
const CapabilityBrokerEngine = require('../engine/kernel/CapabilityBrokerEngine');

function runCapabilityBrokerageTests() {
  console.log('================================================================================');
  console.log('  EAORCS STREAM E — CAPABILITY CONTRACT VALIDATOR & BROKER ENGINE VERIFICATION');
  console.log('================================================================================\n');

  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      passed++;
      console.log(`  ✅ [PASS] ${name}`);
    } catch (err) {
      failed++;
      console.error(`  ❌ [FAIL] ${name}`);
      console.error(`     Error: ${err.message}\n${err.stack}`);
    }
  }

  // --- PART 1: CapabilityContractValidator Tests ---

  test('Validator: Core contract metadata validation (valid payload)', () => {
    const validContract = {
      capability_id: 'cap.auth.mfa',
      version: '1.2.0',
      display_name: 'Multi-Factor Authentication Capability',
      owner_domain: 'SECURITY',
      security_level: 'CLASS_C_PROTECTED',
      ip_classification: 'LEVEL_3_DECLARATIVE'
    };

    const res = CapabilityContractValidator.validate(validContract);
    assert.strictEqual(res.valid, true, 'Valid contract payload should pass');
    assert.strictEqual(res.capability_id, 'cap.auth.mfa');
    assert.strictEqual(res.errors.length, 0);
  });

  test('Validator: Core contract metadata validation (missing fields)', () => {
    const invalidContract = {
      version: '1.0.0',
      display_name: 'Incomplete Capability'
    };

    const res = CapabilityContractValidator.validate(invalidContract);
    assert.strictEqual(res.valid, false, 'Invalid contract payload should fail');
    assert.ok(res.errors.some(e => e.includes('capability_id')), 'Should flag missing capability_id');
    assert.ok(res.errors.some(e => e.includes('owner_domain')), 'Should flag missing owner_domain');
  });

  test('Validator: Interface Schema Validation', () => {
    const contractWithInterface = {
      capability_id: 'cap.data.encryption',
      version: '1.0.0',
      display_name: 'Data Encryption Engine',
      owner_domain: 'SECURITY',
      security_level: 'CLASS_C_PROTECTED',
      ip_classification: 'LEVEL_3_DECLARATIVE',
      interfaces: {
        methods: [
          { name: 'encryptData', inputs: { plaintext: 'string' }, outputs: { ciphertext: 'string' } },
          { name: 'decryptData', inputs: { ciphertext: 'string' }, outputs: { plaintext: 'string' } }
        ]
      }
    };

    const res = CapabilityContractValidator.validate(contractWithInterface);
    assert.strictEqual(res.valid, true, 'Contract with valid interface schema should pass');

    const badInterfaceRes = CapabilityContractValidator.validateInterfaceSchema([
      { inputs: {} } // missing name
    ]);
    assert.strictEqual(badInterfaceRes.valid, false);
    assert.ok(badInterfaceRes.errors.some(e => e.includes("missing required 'name'")));
  });

  test('Validator: Dependency Graph Validation & Cycle Detection', () => {
    const dependencies = [
      { capability_id: 'cap.base.logger', min_version: '1.0.0' },
      { capability_id: 'cap.auth.core', min_version: '2.0.0' }
    ];

    const depRes = CapabilityContractValidator.validateDependencyGraph(dependencies);
    assert.strictEqual(depRes.valid, true);

    // Test Circular Dependency Detection
    const graphMap = new Map();
    graphMap.set('cap.A', ['cap.B']);
    graphMap.set('cap.B', ['cap.C']);
    graphMap.set('cap.C', ['cap.A']);

    const cycleRes = CapabilityContractValidator.validateDependencyGraph(
      [{ capability_id: 'cap.B' }],
      { currentCapabilityId: 'cap.A', dependencyGraphMap: graphMap }
    );
    assert.strictEqual(cycleRes.valid, false, 'Circular dependency must be caught');
    assert.ok(cycleRes.errors.some(e => e.includes('Circular dependency detected')));
  });

  test('Validator: State Machine Specification Validation', () => {
    const validStateMachine = {
      initial_state: 'IDLE',
      states: ['IDLE', 'RUNNING', 'COMPLETED', 'FAILED'],
      transitions: [
        { from: 'IDLE', to: 'RUNNING', event: 'START' },
        { from: 'RUNNING', to: 'COMPLETED', event: 'FINISH' },
        { from: 'RUNNING', to: 'FAILED', event: 'ERROR' }
      ]
    };

    const smRes = CapabilityContractValidator.validateStateMachine(validStateMachine);
    assert.strictEqual(smRes.valid, true, 'Valid state machine should pass');

    const invalidStateMachine = {
      initial_state: 'UNKNOWN_STATE',
      states: ['IDLE', 'RUNNING'],
      transitions: [
        { from: 'IDLE', to: 'NON_EXISTENT', event: 'STEP' }
      ]
    };

    const invalidSmRes = CapabilityContractValidator.validateStateMachine(invalidStateMachine);
    assert.strictEqual(invalidSmRes.valid, false, 'Invalid state machine should fail');
    assert.ok(invalidSmRes.errors.some(e => e.includes("Initial state 'UNKNOWN_STATE' is not defined")));
    assert.ok(invalidSmRes.errors.some(e => e.includes("unknown 'to' state 'NON_EXISTENT'")));
  });

  test('Validator: Breaking Change Rules', () => {
    const prevContract = {
      capability_id: 'cap.api.gateway',
      version: '1.5.0',
      display_name: 'API Gateway Capability',
      owner_domain: 'INFRASTRUCTURE',
      security_level: 'CLASS_C_PROTECTED',
      ip_classification: 'LEVEL_3_DECLARATIVE',
      interfaces: {
        methods: [{ name: 'routeRequest' }, { name: 'filterIp' }]
      }
    };

    const newContractWithRemovedMethod = {
      capability_id: 'cap.api.gateway',
      version: '1.6.0', // minor bump, but removed filterIp
      display_name: 'API Gateway Capability',
      owner_domain: 'INFRASTRUCTURE',
      security_level: 'CLASS_C_PROTECTED',
      ip_classification: 'LEVEL_3_DECLARATIVE',
      interfaces: {
        methods: [{ name: 'routeRequest' }]
      }
    };

    const breakingRes = CapabilityContractValidator.validateBreakingChanges(prevContract, newContractWithRemovedMethod);
    assert.strictEqual(breakingRes.isBreaking, true, 'Removing method without major version bump is breaking');
    assert.ok(breakingRes.violations.some(v => v.includes("method 'filterIp' was removed")));
  });

  // --- PART 2: CapabilityBrokerEngine Tests ---

  const broker = new CapabilityBrokerEngine();

  test('BrokerEngine: Contract Registration & Storage', () => {
    const contractPayload = {
      capability_id: 'cap.storage.s3',
      version: '2.1.0',
      display_name: 'Object Storage Capability',
      owner_domain: 'STORAGE',
      security_level: 'CLASS_C_PROTECTED',
      ip_classification: 'LEVEL_3_DECLARATIVE',
      scopes: ['s3:read', 's3:write', 's3:delete']
    };

    const registered = broker.registerContract(contractPayload);
    assert.strictEqual(registered.capability_id, 'cap.storage.s3');
    assert.strictEqual(broker.hasCapability('cap.storage.s3'), true);
    assert.ok(broker.getContract('cap.storage.s3'));
  });

  test('BrokerEngine: Token Issuance & Verification', () => {
    const token = broker.requestExecutionToken('cap.storage.s3', 'tenant-alpha-001', {
      scope: ['s3:read', 's3:write'],
      ttlSeconds: 600
    });

    assert.ok(token.tokenId.startsWith('broker-token-'));
    assert.strictEqual(token.capabilityId, 'cap.storage.s3');
    assert.strictEqual(token.tenantId, 'tenant-alpha-001');
    assert.ok(token.signature, 'Token signature must exist');

    const verifyRes = broker.verifyToken(token.tokenId);
    assert.strictEqual(verifyRes.valid, true, 'Issued token should be valid');
    assert.strictEqual(verifyRes.token.capabilityId, 'cap.storage.s3');
  });

  test('BrokerEngine: Entitlement Enforcement (Valid Case)', () => {
    const token = broker.requestExecutionToken('cap.storage.s3', 'tenant-alpha-001', {
      scope: ['s3:read', 's3:write'],
      securityLevel: 'CLASS_C_PROTECTED'
    });

    const enforceRes = broker.enforceEntitlement(token.tokenId, 'cap.storage.s3', 'tenant-alpha-001', {
      requiredScope: 's3:read',
      minSecurityLevel: 'CLASS_B_INTERNAL'
    });

    assert.strictEqual(enforceRes.granted, true, 'Entitlement check should succeed');
    assert.strictEqual(enforceRes.tokenPayload.capabilityId, 'cap.storage.s3');
  });

  test('BrokerEngine: Entitlement Enforcement (Single-Use Token Consumption)', () => {
    const singleUseToken = broker.requestExecutionToken('cap.storage.s3', 'tenant-alpha-001', {
      singleUse: true
    });

    // First enforcement -> Granted & Consumed
    const firstEnforce = broker.enforceEntitlement(singleUseToken.tokenId, 'cap.storage.s3', 'tenant-alpha-001');
    assert.strictEqual(firstEnforce.granted, true);
    assert.strictEqual(firstEnforce.consumed, true);

    // Second enforcement -> Rejected (TOKEN_ALREADY_USED)
    const secondEnforce = broker.enforceEntitlement(singleUseToken.tokenId, 'cap.storage.s3', 'tenant-alpha-001');
    assert.strictEqual(secondEnforce.granted, false);
    assert.strictEqual(secondEnforce.reason, 'TOKEN_ALREADY_USED');
  });

  test('BrokerEngine: Entitlement Enforcement (Tenant & Scope Mismatches)', () => {
    const token = broker.requestExecutionToken('cap.storage.s3', 'tenant-alpha-001', {
      scope: ['s3:read']
    });

    const wrongTenant = broker.enforceEntitlement(token.tokenId, 'cap.storage.s3', 'tenant-beta-999');
    assert.strictEqual(wrongTenant.granted, false);
    assert.ok(wrongTenant.reason.includes('TENANT_MISMATCH'));

    const missingScope = broker.enforceEntitlement(token.tokenId, 'cap.storage.s3', 'tenant-alpha-001', {
      requiredScope: 's3:admin_override'
    });
    assert.strictEqual(missingScope.granted, false);
    assert.ok(missingScope.reason.includes('SCOPE_INSUFFICIENT'));
  });

  test('BrokerEngine: Contract Delegation & Sub-scoping', () => {
    const parentToken = broker.requestExecutionToken('cap.storage.s3', 'tenant-parent-org', {
      scope: ['s3:read', 's3:write', 's3:delete'],
      maxDelegationDepth: 2,
      delegable: true
    });

    // Delegate to child tenant with sub-scope
    const childToken = broker.delegateCapability(parentToken.tokenId, 'tenant-sub-branch', {
      scope: ['s3:read']
    });

    assert.strictEqual(childToken.tenantId, 'tenant-sub-branch');
    assert.strictEqual(childToken.parentTokenId, parentToken.tokenId);
    assert.strictEqual(childToken.delegationDepth, 1);
    assert.deepStrictEqual(childToken.scope, ['s3:read']);

    // Attempt delegating scope beyond parent -> Throws Error
    assert.throws(() => {
      broker.delegateCapability(parentToken.tokenId, 'tenant-sub-branch', {
        scope: ['s3:admin_root']
      });
    }, /exceeds parent scope/);
  });

  test('BrokerEngine: Recursive Token Revocation', () => {
    const parentToken = broker.requestExecutionToken('cap.storage.s3', 'tenant-parent-org', { delegable: true });
    const childToken = broker.delegateCapability(parentToken.tokenId, 'tenant-child-1');
    const grandChildToken = broker.delegateCapability(childToken.tokenId, 'tenant-child-2');

    // Revoke parent token
    const revokeRes = broker.revokeToken(parentToken.tokenId, 'COMPLIANCE_AUDIT');
    assert.strictEqual(revokeRes.revoked, true);
    assert.strictEqual(revokeRes.revokedCount, 3, 'Parent, child, and grandchild must all be revoked');

    // Verification of child & grandchild must fail
    assert.strictEqual(broker.verifyToken(parentToken.tokenId).valid, false);
    assert.strictEqual(broker.verifyToken(childToken.tokenId).valid, false);
    assert.strictEqual(broker.verifyToken(grandChildToken.tokenId).valid, false);
  });

  console.log('\n--------------------------------------------------------------------------------');
  console.log(`Stream E Results: ${passed}/${passed + failed} Passed.`);
  console.log('================================================================================\n');

  if (failed === 0) {
    console.log('🎉 STREAM E CAPABILITY & BROKERAGE SUITE: ALL TESTS PASSED CLEANLY.\n');
  } else {
    console.error('❌ STREAM E SUITE FAILED: One or more assertions failed.\n');
    process.exit(1);
  }
}

runCapabilityBrokerageTests();
