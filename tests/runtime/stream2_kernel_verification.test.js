/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Tests / Runtime / Stream 2 Verification
 * File           : stream2_kernel_verification.test.js
 * Version        : 2026.2.0-LTS
 * Author         : Enterprise Architecture & Security Engineering Authority
 * Organization   : Ujomor Systems
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : ENTERPRISE | GOVERNMENT
 *
 * Governance:
 * - Enterprise Governed
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST SP 800-53
 *
 * Copyright (c) 2026 Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const EnterpriseEventBus = require('../../engine/kernel/EnterpriseEventBus');
const UnifiedDomainModel = require('../../engine/kernel/UnifiedDomainModel');

console.log('=== STARTING STREAM 2 VERIFICATION SUITE ===');

// --- Test 1: EnterpriseEventBus Core Pub/Sub & Core Topics ---
{
  console.log('Running Test 1: EnterpriseEventBus Pub/Sub & Core Topics...');
  const bus = new EnterpriseEventBus();
  
  const coreTopics = EnterpriseEventBus.CORE_TOPICS;
  assert.ok(coreTopics.REPOSITORY_UPDATED === 'RepositoryUpdated');
  assert.ok(coreTopics.DIGITAL_TWIN_UPDATED === 'DigitalTwinUpdated');
  assert.ok(bus.getTopics().includes('RepositoryUpdated'));
  assert.ok(bus.getTopics().length >= 10);

  let receivedEvt = null;
  bus.subscribe('RepositoryUpdated', (evt) => {
    receivedEvt = evt;
  });

  const published = bus.publish('RepositoryUpdated', { repoId: 'eaorcs-core', commit: 'abc1234' });
  assert.strictEqual(receivedEvt, published);
  assert.strictEqual(receivedEvt.payload.repoId, 'eaorcs-core');
  assert.ok(receivedEvt.traceId.startsWith('trace_'));
  console.log('  -> Test 1 PASSED');
}

// --- Test 2: Trace Context, Wildcards & Priority ---
{
  console.log('Running Test 2: Trace Context, Wildcard & Subscriber Priority...');
  const bus = new EnterpriseEventBus();
  bus.setTraceContext('trace-custom-999');

  const executionOrder = [];
  bus.subscribe('PolicyEvaluation', () => executionOrder.push('lowPriority'), { priority: 1 });
  bus.subscribe('PolicyEvaluation', () => executionOrder.push('highPriority'), { priority: 100 });
  
  let wildcardEvt = null;
  bus.subscribe('*', (evt) => {
    wildcardEvt = evt;
  });

  bus.publish('PolicyEvaluation', { policyId: 'POL-101', status: 'COMPLIANT' });

  assert.deepStrictEqual(executionOrder, ['highPriority', 'lowPriority']);
  assert.ok(wildcardEvt !== null);
  assert.strictEqual(wildcardEvt.traceId, 'trace-custom-999');
  console.log('  -> Test 2 PASSED');
}

// --- Test 3: Dead-Letter Queue (DLQ) & Event Replay ---
{
  console.log('Running Test 3: DLQ & Replay Ledger...');
  const bus = new EnterpriseEventBus();
  
  // Faulty subscriber throws error
  bus.subscribe('EvidenceCreated', () => {
    throw new Error('Database connection failed during event handling');
  });

  bus.publish('EvidenceCreated', { evidenceId: 'EV-88' });

  const dlq = bus.getDLQ();
  assert.strictEqual(dlq.length, 1);
  assert.strictEqual(dlq[0].errorMessage, 'Database connection failed during event handling');

  // Test replay
  let replayedCount = 0;
  bus.replay({
    topic: 'EvidenceCreated',
    callback: (evt) => {
      assert.strictEqual(evt.payload.evidenceId, 'EV-88');
      replayedCount++;
    }
  });
  assert.strictEqual(replayedCount, 1);
  console.log('  -> Test 3 PASSED');
}

// --- Test 4: UnifiedDomainModel 19 Canonical Entities & Validation ---
{
  console.log('Running Test 4: 19 Canonical Domain Entities & Validation...');
  const model = new UnifiedDomainModel();
  
  const canonicalTypes = model.getCanonicalEntityTypes();
  assert.strictEqual(canonicalTypes.length, 19);
  
  const expectedList = [
    'Project', 'Repository', 'Component', 'Requirement', 'Architecture',
    'Risk', 'Evidence', 'Finding', 'Policy', 'Control',
    'Deployment', 'Certificate', 'Person', 'Organization', 'Environment',
    'Asset', 'AiModel', 'Api', 'Connector'
  ];
  
  expectedList.forEach((typeName) => {
    assert.ok(canonicalTypes.includes(typeName), `Missing canonical type: ${typeName}`);
    const entity = model.createEntity(typeName, { name: `Test ${typeName}` });
    assert.strictEqual(entity.entityType, typeName);
    assert.strictEqual(entity.type, typeName);
  });

  const validation = model.validateEntity('AiModel', { name: 'TrustBERT', accuracy: 0.98 });
  assert.strictEqual(validation.valid, true);

  console.log('  -> Test 4 PASSED');
}

// --- Test 5: Serialization, Deserialization & Relationship Mapping ---
{
  console.log('Running Test 5: Serialization, Deserialization & Relationship Mapping...');
  const model = new UnifiedDomainModel();

  const project = model.createEntity('Project', { id: 'PRJ-001', name: 'EAORCS Master' });
  const repo = model.createEntity('Repository', { id: 'REPO-001', name: 'eaorcs-repo', url: 'https://github.com/ujomor/eaorcs' });
  const policy = model.createEntity('Policy', { id: 'POL-001', name: 'Zero Trust Policy' });

  // Map relationship: Project CONTAINS Repository, Repository GOVERNED_BY Policy
  model.mapRelationship(project, 'CONTAINS', repo);
  model.mapRelationship(repo, 'GOVERNED_BY', policy);

  const relatedToProject = model.getRelatedEntities(project, 'CONTAINS');
  assert.strictEqual(relatedToProject.length, 1);
  assert.strictEqual(relatedToProject[0].id, 'REPO-001');

  // Test Serialization
  const serialized = model.serializeEntity(project);
  assert.ok(typeof serialized === 'string');

  const deserialized = model.deserializeEntity(serialized);
  assert.strictEqual(deserialized.id, 'PRJ-001');
  assert.strictEqual(deserialized.entityType, 'Project');

  // Test Snapshot Export & Import
  const snapshot = model.exportSnapshot();
  assert.ok(snapshot.entities.length >= 3);

  const newModel = new UnifiedDomainModel();
  newModel.importSnapshot(snapshot);
  assert.ok(newModel.getEntity('PRJ-001') !== null);
  console.log('  -> Test 5 PASSED');
}

console.log('🎉 ALL STREAM 2 VERIFICATION TESTS PASSED SUCCESSFULLY!');
