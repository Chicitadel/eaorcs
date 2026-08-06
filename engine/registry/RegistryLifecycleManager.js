/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Registry Lifecycle Manager
 * File           : RegistryLifecycleManager.js
 * Version        : 2026.3.0-RC1
 * Author         : Platform Registry & Lifecycle Governance Authority
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Architecture Authority Approved — ENHANCEMENT (Foundation-Locked)
 * - UAIGOS 3.0.0 — Registry Lifecycle Governance Enforced
 * - ISO 27001 / SOC 2 / NIST SP 800-53
 *
 * Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const crypto = require('crypto');

/**
 * RegistryEntry lifecycle states
 */
const ENTRY_STATES = Object.freeze({
  ACTIVE:    'ACTIVE',
  ARCHIVED:  'ARCHIVED',
  DEPRECATED:'DEPRECATED',
  PENDING:   'PENDING',
});

/**
 * AuditLedger
 * Immutable, append-only ledger for all registry mutations.
 */
class AuditLedger {
  constructor() {
    this._entries = [];
  }

  record(event) {
    const entry = {
      ledgerId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      eventType: event.eventType,
      targetId: event.targetId,
      operator: event.operator || 'PLATFORM',
      previousState: event.previousState || null,
      newState: event.newState || null,
      reason: event.reason || null,
      hash: crypto.createHash('sha256')
        .update(`${event.eventType}:${event.targetId}:${Date.now()}:${JSON.stringify(event.newState)}`)
        .digest('hex'),
    };
    this._entries.push(entry);
    return entry;
  }

  query(targetId) {
    return targetId ? this._entries.filter(e => e.targetId === targetId) : [...this._entries];
  }

  get size() { return this._entries.length; }
}

/**
 * RegistryLifecycleManager
 *
 * Provides governed lifecycle operations for all EAORCS registry entries:
 * engine plugins, governance packs, marketplace items, connectors, and edition modules.
 *
 * All mutations produce an immutable audit ledger entry capturing:
 * timestamp, operator, previous state, new state, and cryptographic hash.
 */
class RegistryLifecycleManager {
  constructor(options = {}) {
    this.options = options;
    this._registry = new Map();    // id -> RegistryEntry
    this._snapshots = new Map();   // snapshotId -> snapshot blob
    this._auditLedger = new AuditLedger();
  }

  // ─────────────────────────────────────────────────────────
  // Registration
  // ─────────────────────────────────────────────────────────

  /**
   * Registers a new entry in the lifecycle-managed registry.
   * @param {object} entry - Registry entry descriptor
   * @returns {object} Registered entry
   */
  register(entry) {
    if (!entry || !entry.id || !entry.name || !entry.type) {
      throw new Error('RegistryLifecycleManager: id, name, and type are required.');
    }
    if (this._registry.has(entry.id)) {
      throw new Error(`RegistryLifecycleManager: Entry '${entry.id}' already registered.`);
    }

    const record = {
      id: entry.id,
      name: entry.name,
      type: entry.type,
      version: entry.version || '1.0.0',
      state: ENTRY_STATES.ACTIVE,
      owner: entry.owner || 'PLATFORM',
      metadata: entry.metadata || {},
      registeredAt: new Date().toISOString(),
      lastModifiedAt: new Date().toISOString(),
      hash: crypto.createHash('sha256').update(`${entry.id}:${entry.name}:${entry.version || '1.0.0'}`).digest('hex'),
    };

    this._registry.set(entry.id, record);
    this._auditLedger.record({ eventType: 'REGISTERED', targetId: entry.id, newState: ENTRY_STATES.ACTIVE });
    return record;
  }

  // ─────────────────────────────────────────────────────────
  // Audit
  // ─────────────────────────────────────────────────────────

  /**
   * Performs a full registry audit, returning categorized health report.
   * @returns {object} Audit report with per-entry health status
   */
  auditRegistry() {
    const report = {
      auditId: crypto.randomUUID(),
      auditedAt: new Date().toISOString(),
      totalEntries: this._registry.size,
      byState: {},
      byType: {},
      integrityIssues: [],
      entries: [],
    };

    for (const [, entry] of this._registry) {
      // Integrity check: recompute hash
      const recomputedHash = crypto.createHash('sha256')
        .update(`${entry.id}:${entry.name}:${entry.version}`)
        .digest('hex');
      const integrityOk = recomputedHash === entry.hash;

      if (!integrityOk) {
        report.integrityIssues.push({ id: entry.id, expectedHash: entry.hash, computedHash: recomputedHash });
      }

      report.byState[entry.state] = (report.byState[entry.state] || 0) + 1;
      report.byType[entry.type] = (report.byType[entry.type] || 0) + 1;

      report.entries.push({
        id: entry.id,
        name: entry.name,
        type: entry.type,
        version: entry.version,
        state: entry.state,
        owner: entry.owner,
        integrityStatus: integrityOk ? 'OK' : 'HASH_MISMATCH',
        registeredAt: entry.registeredAt,
      });
    }

    report.overallIntegrity = report.integrityIssues.length === 0 ? 'CLEAN' : 'ISSUES_DETECTED';
    return report;
  }

  // ─────────────────────────────────────────────────────────
  // Snapshot & Rollback
  // ─────────────────────────────────────────────────────────

  /**
   * Creates a named point-in-time snapshot of the entire registry.
   * @param {string} label - Human-readable snapshot label
   * @param {string} [operator] - Operator identity
   * @returns {object} Snapshot record
   */
  createSnapshot(label, operator = 'PLATFORM') {
    if (!label) throw new Error('RegistryLifecycleManager: label is required for snapshot.');

    const snapshotId = `snap-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const blob = {
      snapshotId,
      label,
      createdAt: new Date().toISOString(),
      createdBy: operator,
      entryCount: this._registry.size,
      state: JSON.parse(JSON.stringify(Object.fromEntries(this._registry))),
    };
    blob.hash = crypto.createHash('sha256').update(JSON.stringify(blob.state)).digest('hex');

    this._snapshots.set(snapshotId, blob);
    this._auditLedger.record({
      eventType: 'SNAPSHOT_CREATED',
      targetId: snapshotId,
      operator,
      newState: { label, entryCount: blob.entryCount, hash: blob.hash },
    });

    return { snapshotId, label, createdAt: blob.createdAt, hash: blob.hash, entryCount: blob.entryCount };
  }

  /**
   * Atomically rolls back the registry to a named snapshot.
   * Pre-conditions: snapshot must exist; current state is automatically snapped before rollback.
   * @param {string} snapshotId
   * @param {string} [operator]
   * @returns {object} Rollback result
   */
  rollbackToSnapshot(snapshotId, operator = 'PLATFORM') {
    const snapshot = this._snapshots.get(snapshotId);
    if (!snapshot) throw new Error(`RegistryLifecycleManager: Snapshot '${snapshotId}' not found.`);

    // Safety: auto-snapshot current state before overwriting
    const safetySnap = this.createSnapshot(`[PRE_ROLLBACK] before ${snapshotId}`, operator);

    // Restore
    this._registry.clear();
    for (const [id, entry] of Object.entries(snapshot.state)) {
      this._registry.set(id, entry);
    }

    this._auditLedger.record({
      eventType: 'ROLLBACK_EXECUTED',
      targetId: snapshotId,
      operator,
      previousState: safetySnap.snapshotId,
      newState: { restoredLabel: snapshot.label, restoredEntryCount: snapshot.entryCount },
    });

    return {
      rolledBackTo: snapshotId,
      label: snapshot.label,
      safetySnapshotId: safetySnap.snapshotId,
      entriesRestored: this._registry.size,
    };
  }

  listSnapshots() {
    return [...this._snapshots.values()].map(s => ({
      snapshotId: s.snapshotId,
      label: s.label,
      createdAt: s.createdAt,
      hash: s.hash,
      entryCount: s.entryCount,
    }));
  }

  // ─────────────────────────────────────────────────────────
  // Archive
  // ─────────────────────────────────────────────────────────

  /**
   * Soft-archives a registry entry. The entry is preserved in the registry with state ARCHIVED.
   * @param {string} id - Entry ID
   * @param {string} reason - Required reason for archive
   * @param {string} [operator]
   * @returns {object} Archived entry
   */
  archiveEntry(id, reason, operator = 'PLATFORM') {
    if (!reason) throw new Error('RegistryLifecycleManager: reason is required for archive.');
    const entry = this._getEntry(id);
    const previousState = entry.state;
    entry.state = ENTRY_STATES.ARCHIVED;
    entry.lastModifiedAt = new Date().toISOString();
    this._auditLedger.record({ eventType: 'ARCHIVED', targetId: id, operator, previousState, newState: ENTRY_STATES.ARCHIVED, reason });
    return { ...entry };
  }

  /**
   * Marks a registry entry as deprecated.
   * @param {string} id - Entry ID
   * @param {string} reason - Deprecation notice
   * @param {string} [operator]
   */
  deprecateEntry(id, reason, operator = 'PLATFORM') {
    if (!reason) throw new Error('RegistryLifecycleManager: reason is required for deprecation.');
    const entry = this._getEntry(id);
    const previousState = entry.state;
    entry.state = ENTRY_STATES.DEPRECATED;
    entry.lastModifiedAt = new Date().toISOString();
    this._auditLedger.record({ eventType: 'DEPRECATED', targetId: id, operator, previousState, newState: ENTRY_STATES.DEPRECATED, reason });
    return { ...entry };
  }

  /**
   * Restores an archived entry to ACTIVE state.
   */
  restoreEntry(id, operator = 'PLATFORM') {
    const entry = this._getEntry(id);
    if (entry.state === ENTRY_STATES.ACTIVE) throw new Error(`RegistryLifecycleManager: Entry '${id}' is already ACTIVE.`);
    const previousState = entry.state;
    entry.state = ENTRY_STATES.ACTIVE;
    entry.lastModifiedAt = new Date().toISOString();
    this._auditLedger.record({ eventType: 'RESTORED', targetId: id, operator, previousState, newState: ENTRY_STATES.ACTIVE });
    return { ...entry };
  }

  // ─────────────────────────────────────────────────────────
  // History & Integrity
  // ─────────────────────────────────────────────────────────

  /**
   * Returns the full audit history for a registry entry.
   */
  getHistory(id) {
    return this._auditLedger.query(id);
  }

  /**
   * Verifies cryptographic integrity of all active registry entries.
   * @returns {object} Integrity verification result
   */
  verifyIntegrity() {
    const results = [];
    let passed = 0;
    let failed = 0;

    for (const [id, entry] of this._registry) {
      const expected = crypto.createHash('sha256').update(`${entry.id}:${entry.name}:${entry.version}`).digest('hex');
      const ok = expected === entry.hash;
      results.push({ id, integrityStatus: ok ? 'VERIFIED' : 'HASH_MISMATCH', expectedHash: expected, storedHash: entry.hash });
      ok ? passed++ : failed++;
    }

    return {
      verifiedAt: new Date().toISOString(),
      totalEntries: this._registry.size,
      verified: passed,
      failed,
      overallStatus: failed === 0 ? 'INTEGRITY_VERIFIED' : 'INTEGRITY_COMPROMISED',
      results,
    };
  }

  /**
   * Removes stale entries (ARCHIVED or DEPRECATED) older than the specified number of days.
   * Never deletes ACTIVE entries.
   */
  pruneStaleEntries(olderThanDays = 90, operator = 'PLATFORM') {
    const cutoff = new Date(Date.now() - olderThanDays * 86400 * 1000);
    const pruned = [];

    for (const [id, entry] of this._registry) {
      if ([ENTRY_STATES.ARCHIVED, ENTRY_STATES.DEPRECATED].includes(entry.state)) {
        const lastMod = new Date(entry.lastModifiedAt);
        if (lastMod < cutoff) {
          this._registry.delete(id);
          this._auditLedger.record({ eventType: 'PRUNED', targetId: id, operator, reason: `Stale entry older than ${olderThanDays} days` });
          pruned.push(id);
        }
      }
    }

    return { prunedCount: pruned.length, prunedIds: pruned, olderThanDays };
  }

  // ─────────────────────────────────────────────────────────
  // Accessors
  // ─────────────────────────────────────────────────────────

  getEntry(id) { return { ...this._getEntry(id) }; }
  listEntries(filter = {}) {
    let entries = [...this._registry.values()];
    if (filter.state) entries = entries.filter(e => e.state === filter.state);
    if (filter.type) entries = entries.filter(e => e.type === filter.type);
    return entries.map(e => ({ ...e }));
  }
  getAuditLog(id) { return this._auditLedger.query(id); }
  getEngineStatus() {
    return {
      initialized: true,
      totalEntries: this._registry.size,
      totalSnapshots: this._snapshots.size,
      auditLedgerSize: this._auditLedger.size,
    };
  }

  _getEntry(id) {
    const entry = this._registry.get(id);
    if (!entry) throw new Error(`RegistryLifecycleManager: Entry '${id}' not found.`);
    return entry;
  }
}

module.exports = RegistryLifecycleManager;
module.exports.RegistryLifecycleManager = RegistryLifecycleManager;
module.exports.ENTRY_STATES = ENTRY_STATES;
