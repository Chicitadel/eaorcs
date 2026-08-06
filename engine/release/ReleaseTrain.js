/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Release Train Governance Engine
 * File           : ReleaseTrain.js
 * Version        : 2026.3.0-RC1
 * Author         : Platform Release Engineering & Version Lifecycle Authority
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Architecture Authority Approved — ENHANCEMENT (Foundation-Locked)
 * - Uniform lifecycle for: Platform | Plugins | Governance Packs | SDK | Connectors
 *
 * Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const crypto = require('crypto');

/**
 * Release lifecycle stages in strict promotion order.
 * An artifact may only be promoted forward (no demotion).
 */
const LIFECYCLE_STAGES = Object.freeze([
  'NIGHTLY',
  'ALPHA',
  'BETA',
  'RELEASE_CANDIDATE',
  'LTS',
  'MAINTENANCE',
  'END_OF_SUPPORT',
]);

const STAGE_INDEX = Object.freeze(
  Object.fromEntries(LIFECYCLE_STAGES.map((s, i) => [s, i]))
);

/**
 * Artifact types managed by the release train.
 */
const ARTIFACT_TYPES = Object.freeze({
  PLATFORM:       'PLATFORM',
  PLUGIN:         'PLUGIN',
  GOVERNANCE_PACK:'GOVERNANCE_PACK',
  SDK:            'SDK',
  CONNECTOR:      'CONNECTOR',
  INDUSTRY_PACK:  'INDUSTRY_PACK',
  ENHANCEMENT:    'ENHANCEMENT',
});

/**
 * Gate checks required before promotion to each stage.
 */
const PROMOTION_GATES = Object.freeze({
  ALPHA:              ['unit_tests_passing', 'no_critical_security_issues'],
  BETA:               ['unit_tests_passing', 'integration_tests_passing', 'api_contract_validation'],
  RELEASE_CANDIDATE:  ['all_tests_passing', 'security_review_complete', 'performance_benchmark_passed', 'documentation_complete'],
  LTS:                ['rc_validation_complete', 'external_audit_clear', 'customer_pilot_validated'],
  MAINTENANCE:        ['lts_support_window_active'],
  END_OF_SUPPORT:     ['eos_notice_published_90_days'],
});

/**
 * ReleaseTrain
 *
 * Manages a uniform version lifecycle for every EAORCS artifact type.
 * All plugins, governance packs, SDK releases, and connectors follow
 * the identical promotion pipeline as the platform itself.
 *
 * This makes enterprise upgrades predictable and auditable.
 */
class ReleaseTrain {
  constructor(options = {}) {
    this.options = options;
    this._artifacts = new Map();
    this._promotionHistory = [];
  }

  /**
   * Registers a new artifact in the release train.
   * @param {object} artifact - Artifact descriptor
   * @returns {object} Registered artifact record
   */
  registerArtifact(artifact) {
    const required = ['name', 'type', 'version'];
    for (const f of required) {
      if (!artifact[f]) throw new Error(`ReleaseTrain: '${f}' is required.`);
    }
    if (!ARTIFACT_TYPES[artifact.type.toUpperCase()]) {
      throw new Error(`ReleaseTrain: type must be one of: ${Object.keys(ARTIFACT_TYPES).join(', ')}`);
    }
    const initialStage = artifact.stage?.toUpperCase() || 'NIGHTLY';
    if (!LIFECYCLE_STAGES.includes(initialStage)) {
      throw new Error(`ReleaseTrain: stage must be one of: ${LIFECYCLE_STAGES.join(', ')}`);
    }

    const id = `art-${crypto.randomBytes(4).toString('hex')}`;
    const record = {
      id,
      name: artifact.name,
      type: artifact.type.toUpperCase(),
      version: artifact.version,
      stage: initialStage,
      supportWindowEnds: null,
      eosDate: null,
      owner: artifact.owner || 'Platform Engineering',
      registeredAt: new Date().toISOString(),
      lastPromotedAt: null,
      promotionGatesCleared: [],
      metadata: artifact.metadata || {},
    };

    this._artifacts.set(id, record);
    this._recordPromotion(id, null, initialStage, 'Initial registration');
    return { ...record };
  }

  /**
   * Promotes an artifact to the next (or specified) lifecycle stage.
   * Gate checks are validated before promotion is allowed.
   *
   * @param {string} id - Artifact ID
   * @param {string} toStage - Target stage
   * @param {string[]} [gatesCleared] - Gate checks that have been cleared
   * @param {string} [operator]
   * @returns {object} Promotion result
   */
  promoteArtifact(id, toStage, gatesCleared = [], operator = 'PLATFORM') {
    const record = this._getArtifact(id);
    const target = toStage.toUpperCase();

    if (!LIFECYCLE_STAGES.includes(target)) {
      throw new Error(`ReleaseTrain: '${target}' is not a valid lifecycle stage.`);
    }

    const currentIndex = STAGE_INDEX[record.stage];
    const targetIndex = STAGE_INDEX[target];

    if (targetIndex <= currentIndex) {
      throw new Error(`ReleaseTrain: Cannot demote artifact '${id}' from '${record.stage}' to '${target}'.`);
    }
    if (targetIndex > currentIndex + 1) {
      throw new Error(`ReleaseTrain: Artifacts must be promoted one stage at a time. Cannot jump from '${record.stage}' to '${target}'.`);
    }

    // Gate check
    const requiredGates = PROMOTION_GATES[target] || [];
    const missingGates = requiredGates.filter(g => !gatesCleared.includes(g));
    if (missingGates.length > 0) {
      return {
        promoted: false,
        reason: 'GATES_NOT_CLEARED',
        missingGates,
        artifactId: id,
        fromStage: record.stage,
        toStage: target,
      };
    }

    const previousStage = record.stage;
    record.stage = target;
    record.lastPromotedAt = new Date().toISOString();
    record.promotionGatesCleared = [...new Set([...record.promotionGatesCleared, ...gatesCleared])];

    // Set support window on LTS promotion
    if (target === 'LTS') {
      const supportEnds = new Date();
      supportEnds.setMonth(supportEnds.getMonth() + 24);
      record.supportWindowEnds = supportEnds.toISOString().slice(0, 10);
    }

    this._recordPromotion(id, previousStage, target, `Promoted by ${operator}`);

    return {
      promoted: true,
      artifactId: id,
      name: record.name,
      version: record.version,
      fromStage: previousStage,
      toStage: target,
      promotedAt: record.lastPromotedAt,
      supportWindowEnds: record.supportWindowEnds,
    };
  }

  /**
   * Flags an artifact for end-of-support on a given date.
   * Emits a 90-day advance notice in the lifecycle report.
   */
  flagEndOfSupport(id, eosDate, operator = 'PLATFORM') {
    const record = this._getArtifact(id);
    record.eosDate = eosDate;
    this._recordPromotion(id, record.stage, record.stage, `EOS notice set for ${eosDate} by ${operator}`);
    return { id, eosDate, noticePublishedAt: new Date().toISOString() };
  }

  /**
   * Returns all artifacts at a specific lifecycle stage.
   */
  getArtifactsByStage(stage) {
    const s = stage.toUpperCase();
    if (!LIFECYCLE_STAGES.includes(s)) throw new Error(`ReleaseTrain: Invalid stage '${s}'.`);
    return [...this._artifacts.values()].filter(a => a.stage === s).map(a => ({ ...a }));
  }

  /**
   * Generates the full lifecycle matrix across all artifacts and stages.
   */
  getLifecycleReport() {
    const matrix = {};
    for (const stage of LIFECYCLE_STAGES) matrix[stage] = [];

    for (const artifact of this._artifacts.values()) {
      matrix[artifact.stage].push({
        id: artifact.id,
        name: artifact.name,
        type: artifact.type,
        version: artifact.version,
        owner: artifact.owner,
        lastPromotedAt: artifact.lastPromotedAt,
        supportWindowEnds: artifact.supportWindowEnds,
        eosDate: artifact.eosDate,
      });
    }

    return {
      generatedAt: new Date().toISOString(),
      totalArtifacts: this._artifacts.size,
      stageMatrix: matrix,
      stageSummary: Object.fromEntries(LIFECYCLE_STAGES.map(s => [s, matrix[s].length])),
    };
  }

  /**
   * Returns a summary of which artifacts are under active security support.
   */
  getSupportWindowSummary() {
    const now = new Date();
    const activeSupport = [];
    const approachingEOS = [];
    const endOfSupport = [];

    for (const artifact of this._artifacts.values()) {
      if (artifact.stage === 'END_OF_SUPPORT') {
        endOfSupport.push({ name: artifact.name, version: artifact.version });
      } else if (artifact.stage === 'LTS' || artifact.stage === 'MAINTENANCE') {
        if (artifact.supportWindowEnds) {
          const endsAt = new Date(artifact.supportWindowEnds);
          const daysLeft = Math.round((endsAt - now) / (86400 * 1000));
          if (daysLeft <= 90) {
            approachingEOS.push({ name: artifact.name, version: artifact.version, daysLeft });
          } else {
            activeSupport.push({ name: artifact.name, version: artifact.version, supportWindowEnds: artifact.supportWindowEnds });
          }
        } else {
          activeSupport.push({ name: artifact.name, version: artifact.version, supportWindowEnds: 'INDEFINITE' });
        }
      }
    }

    return { activeSupport, approachingEOS, endOfSupport };
  }

  getArtifact(id) { return { ...this._getArtifact(id) }; }
  getPromotionHistory(id) {
    return id
      ? this._promotionHistory.filter(p => p.artifactId === id)
      : [...this._promotionHistory];
  }
  getEngineStatus() {
    return {
      initialized: true,
      totalArtifacts: this._artifacts.size,
      lifecycleStages: LIFECYCLE_STAGES,
      promotionEvents: this._promotionHistory.length,
    };
  }

  _getArtifact(id) {
    const a = this._artifacts.get(id);
    if (!a) throw new Error(`ReleaseTrain: Artifact '${id}' not found.`);
    return a;
  }

  _recordPromotion(artifactId, fromStage, toStage, note) {
    this._promotionHistory.push({
      promotionId: crypto.randomUUID(),
      artifactId,
      fromStage,
      toStage,
      note,
      recordedAt: new Date().toISOString(),
    });
  }
}

module.exports = ReleaseTrain;
module.exports.ReleaseTrain = ReleaseTrain;
module.exports.LIFECYCLE_STAGES = LIFECYCLE_STAGES;
module.exports.ARTIFACT_TYPES = ARTIFACT_TYPES;
module.exports.PROMOTION_GATES = PROMOTION_GATES;
