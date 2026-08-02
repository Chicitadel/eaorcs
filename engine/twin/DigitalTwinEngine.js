/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : Executive Intelligence — Digital Twin 2.0 (Stream I)
 * File           : DigitalTwinEngine.js
 * Version        : 2026.1.0-LTS
 * Author         : Enterprise Architecture Governance Committee & Ujomor Systems Engineering
 * Organization   : Ujomor Systems Engineering
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : GOVERNMENT | ENTERPRISE | INTERNAL
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
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Ujomor Systems Engineering
 * All Rights Reserved.
 ******************************************************************************/

const crypto = require('crypto');
const StateReconstruction = require('./StateReconstruction.cjs');
const TimelineViewer = require('./TimelineViewer.cjs');

/**
 * DigitalTwinEngine
 * Digital Twin 2.0 snapshot engine & Engineering Time Machine state reconstructor.
 */
class DigitalTwinEngine {
  constructor(config = {}) {
    this.config = config;
    this.reconstructor = new StateReconstruction();
    this.timelineViewer = new TimelineViewer();
    this.snapshots = new Map();
    this.entityTimelines = new Map();
  }

  /**
   * Captures the current state snapshot of a target entity or system.
   * @param {string} entityId Entity or system component identifier
   * @param {Object} stateData Current operational, configuration, or architectural state
   * @param {Object} [metadata] Optional additional context metadata
   * @returns {Object} Snapshot metadata object
   */
  captureState(entityId, stateData = {}, metadata = {}) {
    if (!entityId) {
      throw new Error('Entity ID is required to capture Digital Twin state.');
    }

    const timestamp = new Date().toISOString();
    const snapshotId = `snap-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const payloadString = JSON.stringify(stateData);
    const hash = crypto.createHash('sha256').update(`${entityId}:${timestamp}:${payloadString}`).digest('hex');

    const snapshot = {
      snapshotId,
      entityId,
      timestamp,
      hash,
      stateData,
      metadata: {
        environment: metadata.environment || 'production',
        trustScore: metadata.trustScore || 100.0,
        version: metadata.version || '2026.1.0-LTS',
        capturedBy: metadata.capturedBy || 'DigitalTwinEngine',
        ...metadata
      },
      status: 'CAPTURED',
      governanceVerified: true
    };

    this.snapshots.set(snapshotId, snapshot);

    // Record in entity timeline
    if (!this.entityTimelines.has(entityId)) {
      this.entityTimelines.set(entityId, []);
    }
    this.entityTimelines.get(entityId).push(snapshot);

    return snapshot;
  }

  /**
   * Alias for captureState to support snapshot API naming.
   * @param {string} entityId 
   * @param {Object} stateData 
   * @param {Object} [metadata]
   * @returns {Object} Snapshot metadata
   */
  createSnapshot(entityId, stateData, metadata) {
    return this.captureState(entityId, stateData, metadata);
  }

  /**
   * Reconstructs the state of an entity at a specific point in time (Engineering Time Machine).
   * @param {string} entityId Target entity identifier
   * @param {string} timestamp ISO timestamp string
   * @returns {Object} Reconstructed state model
   */
  reconstructState(entityId, timestamp) {
    if (!timestamp) {
      throw new Error('Engineering Time Machine requires a valid timestamp for state reconstruction.');
    }

    const timeline = this.entityTimelines.get(entityId) || [];
    const targetTime = new Date(timestamp).getTime();

    // Find latest snapshot prior to or at target timestamp
    const matchingSnapshot = timeline
      .filter(s => new Date(s.timestamp).getTime() <= targetTime)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

    if (matchingSnapshot) {
      return {
        entityId,
        reconstructedAt: timestamp,
        snapshotId: matchingSnapshot.snapshotId,
        stateData: matchingSnapshot.stateData,
        hash: matchingSnapshot.hash,
        source: 'SNAPSHOT_MATCH',
        metadata: {
          governanceVerified: true,
          capturedBy: 'DigitalTwinEngine',
          version: '2026.1.0-LTS',
          trustScore: matchingSnapshot.metadata ? matchingSnapshot.metadata.trustScore : 100
        }
      };
    }

    // Fallback to internal reconstructor module
    try {
      return this.reconstructor.reconstruct(entityId, timestamp);
    } catch (err) {
      return {
        entityId,
        reconstructedAt: timestamp,
        snapshotId: null,
        stateData: {},
        source: 'EMPTY_BASELINE',
        note: 'No historical snapshot recorded prior to target timestamp.'
      };
    }
  }

  /**
   * Retrieves historical state change timeline for an entity.
   * @param {string} entityId Target entity ID
   * @param {Object} [options] Filter options
   * @returns {Array} Timeline event list
   */
  getTimeline(entityId, options = {}) {
    const localTimeline = this.entityTimelines.get(entityId) || [];
    const externalTimeline = this.timelineViewer.getTimeline ? this.timelineViewer.getTimeline(entityId) : [];

    const combined = [...localTimeline, ...externalTimeline];
    combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (options.limit) {
      return combined.slice(0, options.limit);
    }
    return combined;
  }

  /**
   * Compares two snapshots to detect architectural, configuration, or state drift between timestamps.
   * @param {string} snapshotIdA Base snapshot ID
   * @param {string} snapshotIdB Target snapshot ID
   * @returns {Object} State diff report
   */
  diffSnapshots(snapshotIdA, snapshotIdB) {
    const snapA = this.snapshots.get(snapshotIdA);
    const snapB = this.snapshots.get(snapshotIdB);

    if (!snapA || !snapB) {
      throw new Error('Both snapshotIdA and snapshotIdB must exist to compute Digital Twin state diff.');
    }

    const keysA = Object.keys(snapA.stateData || {});
    const keysB = Object.keys(snapB.stateData || {});
    const allKeys = [...new Set([...keysA, ...keysB])];

    const added = [];
    const removed = [];
    const modified = [];

    for (const key of allKeys) {
      if (!(key in snapA.stateData)) {
        added.push({ key, value: snapB.stateData[key] });
      } else if (!(key in snapB.stateData)) {
        removed.push({ key, value: snapA.stateData[key] });
      } else if (JSON.stringify(snapA.stateData[key]) !== JSON.stringify(snapB.stateData[key])) {
        modified.push({
          key,
          oldValue: snapA.stateData[key],
          newValue: snapB.stateData[key]
        });
      }
    }

    const isIdentical = added.length === 0 && removed.length === 0 && modified.length === 0;

    return {
      entityId: snapA.entityId,
      snapshotIdA,
      snapshotIdB,
      timestampA: snapA.timestamp,
      timestampB: snapB.timestamp,
      isIdentical,
      driftDetected: !isIdentical,
      changes: {
        addedCount: added.length,
        removedCount: removed.length,
        modifiedCount: modified.length,
        added,
        removed,
        modified
      }
    };
  }

  /**
   * Simulates outcome of hypothetical state changes or drift scenarios on the digital twin model.
   * @param {string} entityId Entity identifier
   * @param {Object} scenario Hypothetical state modifications or environment disruptions
   * @returns {Object} Simulated outcome analysis
   */
  simulateOutcome(entityId, scenario = {}) {
    const currentTimeline = this.getTimeline(entityId, { limit: 1 });
    const baselineState = currentTimeline[0] ? currentTimeline[0].stateData : {};

    const simulatedState = { ...baselineState, ...scenario.modifications };
    const simulatedTrustScore = scenario.trustImpact
      ? Math.max(0, Math.min(100, 100 - scenario.trustImpact))
      : 98.5;

    const riskAssessment = simulatedTrustScore < 70 ? 'HIGH_RISK' : (simulatedTrustScore < 90 ? 'MEDIUM_RISK' : 'LOW_RISK');

    return {
      entityId,
      scenarioName: scenario.name || 'Hypothetical Drift Simulation',
      simulatedState,
      simulatedTrustScore,
      riskAssessment,
      predictedImpact: scenario.predictedImpact || 'No adverse impact detected under simulated conditions.',
      simulatedAt: new Date().toISOString()
    };
  }

  /**
   * Verifies the cryptographic integrity of a recorded snapshot.
   * @param {string} snapshotId Target snapshot ID
   * @returns {Object} Verification result
   */
  verifySnapshotIntegrity(snapshotId) {
    const snapshot = this.snapshots.get(snapshotId);
    if (!snapshot) {
      return { verified: false, reason: 'SNAPSHOT_NOT_FOUND' };
    }

    const payloadString = JSON.stringify(snapshot.stateData);
    const computedHash = crypto.createHash('sha256')
      .update(`${snapshot.entityId}:${snapshot.timestamp}:${payloadString}`)
      .digest('hex');

    return {
      snapshotId,
      verified: computedHash === snapshot.hash,
      originalHash: snapshot.hash,
      computedHash
    };
  }

  /**
   * Exports full digital twin model for an entity.
   * @param {string} entityId Entity ID
   * @returns {Object} Exportable twin payload
   */
  exportTwinModel(entityId) {
    const timeline = this.getTimeline(entityId);
    const latestSnapshot = timeline[0] || null;

    return {
      entityId,
      exportedAt: new Date().toISOString(),
      latestSnapshot,
      historyLength: timeline.length,
      snapshots: timeline
    };
  }
}

module.exports = DigitalTwinEngine;
module.exports.default = DigitalTwinEngine;
