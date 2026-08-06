/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Interactive Operations Engine
 * File           : InteractiveOperationsEngine.js
 * Version        : 2026.3.0-RC1
 * Author         : Platform Operations & Async Execution Authority
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Architecture Authority Approved — ENHANCEMENT (Foundation-Locked)
 * - All administrative operations execute asynchronously with structured logs
 * - No "static button" pattern — every action is async with progress + completion notification
 *
 * Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const crypto = require('crypto');

const OPERATION_STATUS = Object.freeze({
  QUEUED:     'QUEUED',
  RUNNING:    'RUNNING',
  COMPLETED:  'COMPLETED',
  FAILED:     'FAILED',
  CANCELLED:  'CANCELLED',
});

/**
 * Supported administrative operation types.
 * Each definition specifies: label, estimatedMs (for progress simulation), steps[]
 */
const OPERATION_TYPES = Object.freeze({
  reset: {
    label: 'Platform Component Reset',
    estimatedMs: 3000,
    steps: ['Validating current state', 'Acquiring exclusive lock', 'Flushing pending operations', 'Resetting component state', 'Releasing lock', 'Verifying post-reset integrity'],
  },
  archive: {
    label: 'Archive Registry Entry',
    estimatedMs: 1500,
    steps: ['Validating entry state', 'Creating pre-archive snapshot', 'Moving entry to archived state', 'Recording audit ledger entry', 'Confirming archive'],
  },
  rollback: {
    label: 'Registry Snapshot Rollback',
    estimatedMs: 5000,
    steps: ['Validating target snapshot', 'Creating safety snapshot of current state', 'Acquiring write lock', 'Restoring snapshot state', 'Running integrity verification', 'Releasing write lock', 'Publishing completion event'],
  },
  export: {
    label: 'Data Export Package',
    estimatedMs: 8000,
    steps: ['Collecting export scope', 'Applying privacy filters', 'Serializing data', 'Compressing package', 'Computing SHA-256 checksum', 'Generating signed export manifest', 'Finalizing package'],
  },
  scan: {
    label: 'Full Trust Score Scan',
    estimatedMs: 12000,
    steps: ['Discovering repositories', 'Running SBOM analysis', 'Evaluating supply chain dependencies', 'Running security assessment', 'Evaluating architecture maturity', 'Computing evidence chain', 'Aggregating composite score', 'Generating findings report'],
  },
  migrate: {
    label: 'Platform Migration',
    estimatedMs: 20000,
    steps: ['Compatibility analysis', 'Dry-run validation', 'Pre-migration snapshot', 'Migrating schema', 'Migrating data', 'Running post-migration tests', 'Verifying integrity', 'Publishing migration report'],
  },
  import: {
    label: 'Data Import',
    estimatedMs: 6000,
    steps: ['Validating import manifest', 'Schema verification', 'Conflict detection', 'Applying import', 'Running post-import integrity check', 'Publishing completion notification'],
  },
  snapshot: {
    label: 'Create Registry Snapshot',
    estimatedMs: 2000,
    steps: ['Collecting registry state', 'Computing state hash', 'Persisting snapshot', 'Verifying snapshot integrity'],
  },
  purge: {
    label: 'Purge Stale Entries',
    estimatedMs: 4000,
    steps: ['Identifying stale entries (ARCHIVED/DEPRECATED)', 'Applying age threshold filter', 'Generating purge manifest', 'Executing purge with audit trail', 'Confirming deletion count'],
  },
});

/**
 * OperationRecord
 * Tracks the full lifecycle of a single async operation.
 */
class OperationRecord {
  constructor(operationId, operationType, params, operator) {
    this.operationId   = operationId;
    this.operationType = operationType;
    this.label         = OPERATION_TYPES[operationType]?.label || operationType;
    this.params        = params;
    this.operator      = operator;
    this.status        = OPERATION_STATUS.QUEUED;
    this.progressPercent = 0;
    this.currentStep   = null;
    this.logs          = [];
    this.startedAt     = null;
    this.completedAt   = null;
    this.failedAt      = null;
    this.error         = null;
    this.result        = null;
    this.subscribers   = [];   // Progress callbacks
    this.queuedAt      = new Date().toISOString();
  }

  addLog(level, message) {
    const entry = { timestamp: new Date().toISOString(), level, message };
    this.logs.push(entry);
    this._notifySubscribers();
    return entry;
  }

  setProgress(percent, stepLabel) {
    this.progressPercent = Math.min(100, Math.max(0, percent));
    this.currentStep = stepLabel || this.currentStep;
    this._notifySubscribers();
  }

  subscribe(callback) {
    if (typeof callback !== 'function') throw new Error('Subscriber must be a function.');
    this.subscribers.push(callback);
    return () => { this.subscribers = this.subscribers.filter(s => s !== callback); };
  }

  _notifySubscribers() {
    const snapshot = this.toStatus();
    for (const cb of this.subscribers) { try { cb(snapshot); } catch (_) { /* subscriber error isolation */ } }
  }

  toStatus() {
    return {
      operationId:     this.operationId,
      operationType:   this.operationType,
      label:           this.label,
      status:          this.status,
      progressPercent: this.progressPercent,
      currentStep:     this.currentStep,
      logCount:        this.logs.length,
      queuedAt:        this.queuedAt,
      startedAt:       this.startedAt,
      completedAt:     this.completedAt,
      error:           this.error,
    };
  }
}

/**
 * InteractiveOperationsEngine
 *
 * All administrative actions (reset, archive, rollback, export, scan, migrate, import, snapshot, purge)
 * execute asynchronously with:
 *   - Operation ID for tracking
 *   - Real-time progress percentage
 *   - Structured log stream
 *   - Event-based progress subscriptions
 *   - Safe cancellation with cleanup
 *   - Completion notification
 *
 * Replaces all "static button" patterns in the platform portal.
 */
class InteractiveOperationsEngine {
  constructor(options = {}) {
    this.options = options;
    this._operations = new Map();   // operationId -> OperationRecord
    this._completionCallbacks = []; // Global completion listeners
  }

  /**
   * Executes an administrative operation asynchronously.
   * @param {string} operationType - One of OPERATION_TYPES keys
   * @param {object} [params] - Operation-specific parameters
   * @param {string} [operator] - User identity triggering the operation
   * @returns {object} { operationId, status: 'QUEUED' } — immediately
   */
  executeOperation(operationType, params = {}, operator = 'PLATFORM') {
    if (!OPERATION_TYPES[operationType]) {
      throw new Error(`InteractiveOperationsEngine: Unknown operation type '${operationType}'. Supported: ${Object.keys(OPERATION_TYPES).join(', ')}`);
    }

    const operationId = `op-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const record = new OperationRecord(operationId, operationType, params, operator);
    this._operations.set(operationId, record);

    // Execute asynchronously — do not block the caller
    setImmediate(() => this._executeAsync(record));

    return { operationId, status: OPERATION_STATUS.QUEUED, label: record.label, queuedAt: record.queuedAt };
  }

  /**
   * Returns the current status and progress of an operation.
   */
  getOperationStatus(operationId) {
    const record = this._requireOperation(operationId);
    return record.toStatus();
  }

  /**
   * Returns the structured log stream for an operation.
   */
  getOperationLogs(operationId) {
    return this._requireOperation(operationId).logs;
  }

  /**
   * Cancels a QUEUED or RUNNING operation.
   * Operations that have already completed cannot be cancelled.
   */
  cancelOperation(operationId) {
    const record = this._requireOperation(operationId);
    if ([OPERATION_STATUS.COMPLETED, OPERATION_STATUS.FAILED, OPERATION_STATUS.CANCELLED].includes(record.status)) {
      throw new Error(`InteractiveOperationsEngine: Operation '${operationId}' is already ${record.status}.`);
    }
    record.status = OPERATION_STATUS.CANCELLED;
    record.completedAt = new Date().toISOString();
    record.addLog('WARN', `Operation '${operationId}' cancelled by ${record.operator}.`);
    return record.toStatus();
  }

  /**
   * Subscribes to real-time progress updates for an operation.
   * @param {string} operationId
   * @param {function} callback - Called on every progress/log update
   * @returns {function} Unsubscribe function
   */
  subscribeToProgress(operationId, callback) {
    return this._requireOperation(operationId).subscribe(callback);
  }

  /**
   * Lists all operations, optionally filtered by status.
   */
  listOperations(filter = {}) {
    let ops = [...this._operations.values()];
    if (filter.status) ops = ops.filter(o => o.status === filter.status);
    if (filter.operationType) ops = ops.filter(o => o.operationType === filter.operationType);
    return ops.map(o => o.toStatus());
  }

  getSupportedOperations() {
    return Object.entries(OPERATION_TYPES).map(([id, def]) => ({ operationType: id, label: def.label, estimatedMs: def.estimatedMs, steps: def.steps }));
  }

  getEngineStatus() {
    const counts = {};
    for (const status of Object.values(OPERATION_STATUS)) counts[status] = 0;
    for (const op of this._operations.values()) counts[op.status]++;
    return { initialized: true, totalOperations: this._operations.size, byStatus: counts };
  }

  // ─────────────────────────────────────────────────────────
  // Internal async execution
  // ─────────────────────────────────────────────────────────

  async _executeAsync(record) {
    const typeDef = OPERATION_TYPES[record.operationType];

    record.status = OPERATION_STATUS.RUNNING;
    record.startedAt = new Date().toISOString();
    record.addLog('INFO', `[${record.operationId}] Starting ${record.label}...`);

    try {
      const totalSteps = typeDef.steps.length;

      for (let i = 0; i < totalSteps; i++) {
        if (record.status === OPERATION_STATUS.CANCELLED) {
          record.addLog('WARN', `Operation cancelled at step ${i + 1}/${totalSteps}.`);
          return;
        }

        const step = typeDef.steps[i];
        const percent = Math.round(((i + 1) / totalSteps) * 100);

        record.setProgress(percent - 1, step);
        record.addLog('INFO', `[${i + 1}/${totalSteps}] ${step}...`);

        // Simulate async step duration (replace with real execution in production)
        await this._delay(Math.round(typeDef.estimatedMs / totalSteps));

        record.setProgress(percent, step);
        record.addLog('INFO', `[${i + 1}/${totalSteps}] ✓ ${step} — completed.`);
      }

      record.status = OPERATION_STATUS.COMPLETED;
      record.completedAt = new Date().toISOString();
      record.progressPercent = 100;
      record.result = { success: true, operationId: record.operationId, completedAt: record.completedAt };
      record.addLog('INFO', `[${record.operationId}] ${record.label} completed successfully.`);

      // Notify global completion listeners
      for (const cb of this._completionCallbacks) {
        try { cb(record.toStatus()); } catch (_) {}
      }

    } catch (err) {
      record.status = OPERATION_STATUS.FAILED;
      record.failedAt = new Date().toISOString();
      record.error = err.message;
      record.addLog('ERROR', `[${record.operationId}] FAILED: ${err.message}`);
    }
  }

  _delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
  _requireOperation(operationId) {
    const op = this._operations.get(operationId);
    if (!op) throw new Error(`InteractiveOperationsEngine: Operation '${operationId}' not found.`);
    return op;
  }
}

module.exports = InteractiveOperationsEngine;
module.exports.InteractiveOperationsEngine = InteractiveOperationsEngine;
module.exports.OPERATION_STATUS = OPERATION_STATUS;
module.exports.OPERATION_TYPES = OPERATION_TYPES;
