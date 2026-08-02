/******************************************************************************
 * Project        : airroofers.eu
 * Module         : eaorcs/tests
 * File           : digital_twin.test.cjs
 * Version        : 3.0.0
 * Author         : System Engineering Team
 * Organization   : Airroofers
 * Created Date   : 2026-07-31
 * Last Modified  : 2026-07-31
 * Classification : ENTERPRISE
 *
 * Governance:
 * - AI Governed
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
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Airroofers
 * All Rights Reserved.
 ******************************************************************************/

const assert = require('assert');
const DigitalTwinEngine = require('../engine/twin/DigitalTwinEngine.cjs');

describe('Digital Twin Engine 2.0 Tests', () => {
  let engine;

  beforeEach(() => {
    engine = new DigitalTwinEngine();
  });

  it('should capture current state successfully', () => {
    const result = engine.captureState('twin-1', { temp: 22 });
    assert.strictEqual(result.entityId, 'twin-1');
    assert.strictEqual(result.status, 'CAPTURED');
    assert.ok(result.snapshotId);
  });

  it('should reconstruct state for a specific timestamp (Engineering Time Machine)', () => {
    const timestamp = '2026-07-31T12:00:00Z';
    const result = engine.reconstructState('twin-2', timestamp);
    
    assert.strictEqual(result.entityId, 'twin-2');
    assert.strictEqual(result.reconstructedAt, timestamp);
    assert.strictEqual(result.metadata.governanceVerified, true);
  });

  it('should retrieve a timeline of events', () => {
    const timeline = engine.getTimeline('twin-3');
    
    assert.ok(Array.isArray(timeline));
    assert.strictEqual(timeline.length, 3);
    assert.strictEqual(timeline[0].event, 'ENTITY_CREATED');
  });

  it('should throw error when reconstructing without timestamp', () => {
    assert.throws(() => {
      engine.reconstructState('twin-4', null);
    }, /timestamp/);
  });
});
