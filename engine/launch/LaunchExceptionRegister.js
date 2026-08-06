/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Launch Exception Register
 * File           : LaunchExceptionRegister.js
 * Version        : 2026.3.0-RC1
 * Author         : Commercial Launch Authority & Governance Council
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Architecture Authority Approved — ENHANCEMENT (Foundation-Locked)
 * - Purpose: Prevent hidden launch debt. Nothing ships because we forgot.
 *
 * Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const crypto = require('crypto');

const EXCEPTION_SEVERITY = Object.freeze({
  CRITICAL: 'CRITICAL',
  HIGH:     'HIGH',
  MEDIUM:   'MEDIUM',
  LOW:      'LOW',
});

const EXCEPTION_STATUS = Object.freeze({
  OPEN:      'OPEN',
  ACCEPTED:  'ACCEPTED',   // Accepted risk — launch proceeds with mitigation plan
  MITIGATED: 'MITIGATED',  // Mitigation in place but not fully closed
  CLOSED:    'CLOSED',
  OVERDUE:   'OVERDUE',
});

/**
 * LaunchExceptionRegister
 *
 * Tracks all accepted launch exceptions to prevent hidden launch debt.
 * Every open exception is visible. Nothing ships because it was forgotten.
 *
 * Exceptions do NOT block launch unless they are CRITICAL or HIGH with no
 * accepted mitigation. Medium/Low exceptions may be accepted for RC1.
 */
class LaunchExceptionRegister {
  constructor(options = {}) {
    this.options = options;
    this._exceptions = new Map();
    this._auditLog = [];
    this._counter = 0;
  }

  /**
   * Registers a new launch exception.
   * @param {object} fields - Exception fields
   * @returns {object} Exception record
   */
  registerException(fields) {
    const required = ['severity', 'description', 'mitigation', 'owner', 'dueDate'];
    for (const f of required) {
      if (!fields[f]) throw new Error(`LaunchExceptionRegister: '${f}' is required.`);
    }
    if (!EXCEPTION_SEVERITY[fields.severity.toUpperCase()]) {
      throw new Error(`LaunchExceptionRegister: severity must be one of ${Object.keys(EXCEPTION_SEVERITY).join(', ')}.`);
    }

    this._counter++;
    const id = `LE-${String(this._counter).padStart(4, '0')}`;
    const record = {
      id,
      severity:    fields.severity.toUpperCase(),
      description: fields.description,
      mitigation:  fields.mitigation,
      owner:       fields.owner,
      dueDate:     fields.dueDate,
      relatedGate: fields.relatedGate || null,
      status:      EXCEPTION_STATUS.OPEN,
      notes:       [],
      registeredAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
    };

    this._exceptions.set(id, record);
    this._audit('REGISTERED', id, null, EXCEPTION_STATUS.OPEN, `Exception registered: ${fields.description}`);
    return { ...record };
  }

  /**
   * Updates the status of a launch exception.
   * @param {string} id - Exception ID (LE-XXXX)
   * @param {string} newStatus - New status
   * @param {string} note - Reason for update
   * @returns {object} Updated exception record
   */
  updateStatus(id, newStatus, note = '') {
    const record = this._getException(id);
    if (!EXCEPTION_STATUS[newStatus.toUpperCase()]) {
      throw new Error(`LaunchExceptionRegister: status must be one of ${Object.keys(EXCEPTION_STATUS).join(', ')}.`);
    }
    const previous = record.status;
    record.status = newStatus.toUpperCase();
    record.lastUpdatedAt = new Date().toISOString();
    if (note) record.notes.push({ timestamp: new Date().toISOString(), note });
    this._audit('STATUS_UPDATED', id, previous, record.status, note);
    return { ...record };
  }

  /**
   * Refreshes overdue status for all open exceptions past their due date.
   */
  refreshOverdueStatus() {
    const now = new Date();
    let count = 0;
    for (const record of this._exceptions.values()) {
      if ([EXCEPTION_STATUS.OPEN, EXCEPTION_STATUS.ACCEPTED].includes(record.status)) {
        const due = new Date(record.dueDate);
        if (due < now && record.status !== EXCEPTION_STATUS.OVERDUE) {
          record.status = EXCEPTION_STATUS.OVERDUE;
          record.lastUpdatedAt = now.toISOString();
          this._audit('OVERDUE_FLAGGED', record.id, EXCEPTION_STATUS.OPEN, EXCEPTION_STATUS.OVERDUE, 'Past due date.');
          count++;
        }
      }
    }
    return { overdueCount: count };
  }

  /**
   * Returns all non-closed exceptions.
   */
  getOpenExceptions() {
    return [...this._exceptions.values()]
      .filter(e => e.status !== EXCEPTION_STATUS.CLOSED)
      .map(e => ({ ...e }));
  }

  /**
   * Returns all overdue exceptions.
   */
  getOverdueExceptions() {
    this.refreshOverdueStatus();
    return [...this._exceptions.values()]
      .filter(e => e.status === EXCEPTION_STATUS.OVERDUE)
      .map(e => ({ ...e }));
  }

  /**
   * Generates an executive-level register summary.
   */
  generateRegisterSummary() {
    this.refreshOverdueStatus();
    const all = [...this._exceptions.values()];
    const bySeverity = {};
    const byStatus = {};

    for (const sev of Object.keys(EXCEPTION_SEVERITY)) bySeverity[sev] = 0;
    for (const sta of Object.keys(EXCEPTION_STATUS)) byStatus[sta] = 0;

    for (const ex of all) {
      bySeverity[ex.severity]++;
      byStatus[ex.status]++;
    }

    const blocked = this.isLaunchBlocked();

    return {
      generatedAt: new Date().toISOString(),
      totalExceptions: all.length,
      openExceptions: all.filter(e => e.status !== EXCEPTION_STATUS.CLOSED).length,
      bySeverity,
      byStatus,
      launchBlocked: blocked.blocked,
      blockingExceptions: blocked.blockingIds,
      entries: all.map(e => ({
        id: e.id,
        severity: e.severity,
        status: e.status,
        description: e.description,
        owner: e.owner,
        dueDate: e.dueDate,
        relatedGate: e.relatedGate,
      })),
    };
  }

  /**
   * Returns true if any CRITICAL or HIGH exceptions are OPEN/OVERDUE without an accepted mitigation.
   * @returns {{ blocked: boolean, blockingIds: string[] }}
   */
  isLaunchBlocked() {
    const blocking = [...this._exceptions.values()].filter(e =>
      [EXCEPTION_SEVERITY.CRITICAL, EXCEPTION_SEVERITY.HIGH].includes(e.severity) &&
      [EXCEPTION_STATUS.OPEN, EXCEPTION_STATUS.OVERDUE].includes(e.status)
    );
    return { blocked: blocking.length > 0, blockingIds: blocking.map(e => e.id) };
  }

  getException(id) { return { ...this._getException(id) }; }
  listExceptions(filter = {}) {
    let all = [...this._exceptions.values()];
    if (filter.severity) all = all.filter(e => e.severity === filter.severity.toUpperCase());
    if (filter.status) all = all.filter(e => e.status === filter.status.toUpperCase());
    return all.map(e => ({ ...e }));
  }
  getAuditLog() { return [...this._auditLog]; }
  getEngineStatus() {
    return { initialized: true, totalExceptions: this._exceptions.size, auditLogSize: this._auditLog.length };
  }

  _getException(id) {
    const e = this._exceptions.get(id);
    if (!e) throw new Error(`LaunchExceptionRegister: Exception '${id}' not found.`);
    return e;
  }

  _audit(event, id, from, to, note) {
    this._auditLog.push({ timestamp: new Date().toISOString(), event, id, from, to, note });
  }
}

module.exports = LaunchExceptionRegister;
module.exports.LaunchExceptionRegister = LaunchExceptionRegister;
module.exports.EXCEPTION_SEVERITY = EXCEPTION_SEVERITY;
module.exports.EXCEPTION_STATUS = EXCEPTION_STATUS;
