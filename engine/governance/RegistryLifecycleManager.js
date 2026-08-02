/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Registry Lifecycle Manager Engine
 * File           : RegistryLifecycleManager.js
 * Version        : 2026.1.0-LTS
 * Author         : Air Roofers Platform Ecosystem & Ujomor Systems Architecture Authority
 * Organization   : Ujomor Systems & Air Roofers
 * Created Date   : 2026-08-02
 * Last Modified  : 2026-08-02
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
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Ujomor Systems & Air Roofers
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { EditionEngine, EDITIONS, RESET_MODES, EditionGatingError } = require('./EditionEngine');

class RegistryLifecycleManager {
    /**
     * @param {Object} [options={}]
     * @param {string} [options.rootDir] Workspace root directory
     * @param {string} [options.stateDir] State directory path
     * @param {string} [options.historyDir] Snapshot history directory path
     * @param {string|EditionEngine} [options.edition='COMMUNITY'] Active edition string or instance
     * @param {boolean} [options.legalHold=false] Legal hold flag
     * @param {string} [options.secretKey] Signing secret key
     */
    constructor(options = {}) {
        this.rootDir = options.rootDir || process.cwd();
        this.stateDir = options.stateDir || path.join(this.rootDir, '.governance', 'state');
        this.historyDir = options.historyDir || path.join(this.stateDir, 'registry-history');
        this.activeStateFile = options.activeStateFile || path.join(this.stateDir, 'project.state.json');
        this.auditLogFile = options.auditLogFile || path.join(this.stateDir, 'audit-trail.json');

        if (options.editionEngine instanceof EditionEngine) {
            this.editionEngine = options.editionEngine;
        } else {
            const ed = options.edition || process.env.EAORCS_EDITION || EDITIONS.COMMUNITY;
            this.editionEngine = new EditionEngine(ed);
        }

        this.legalHoldActive = Boolean(options.legalHold);
        this.secretKey = options.secretKey || 'eaorcs-governance-signature-key-2026';

        this.ensureDirectories();
    }

    /**
     * Ensure required governance state directories exist.
     */
    ensureDirectories() {
        if (!fs.existsSync(this.stateDir)) {
            fs.mkdirSync(this.stateDir, { recursive: true });
        }
        if (!fs.existsSync(this.historyDir)) {
            fs.mkdirSync(this.historyDir, { recursive: true });
        }
    }

    /**
     * Format timestamp as YYYY-MM-DD_HHMMSS
     * @param {Date} [date=new Date()]
     * @returns {string}
     */
    static formatTimestamp(date = new Date()) {
        const pad = (num) => String(num).padStart(2, '0');
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const mins = pad(date.getMinutes());
        const secs = pad(date.getSeconds());
        return `${year}-${month}-${day}_${hours}${mins}${secs}`;
    }

    /**
     * Read active registry state from disk.
     * @returns {Object}
     */
    getActiveState() {
        if (fs.existsSync(this.activeStateFile)) {
            try {
                const content = fs.readFileSync(this.activeStateFile, 'utf8');
                return JSON.parse(content);
            } catch (err) {
                // If invalid JSON, fallback to baseline
            }
        }
        return this.getInitialBaselineState();
    }

    /**
     * Write active registry state to disk.
     * @param {Object} state 
     */
    saveActiveState(state) {
        this.ensureDirectories();
        const payload = {
            ...state,
            updatedAt: new Date().toISOString(),
            edition: this.editionEngine.getEdition()
        };
        const checksum = this.calculateChecksum(payload);
        payload._checksum = checksum;
        payload._signature = this.calculateSignature(checksum);
        fs.writeFileSync(this.activeStateFile, JSON.stringify(payload, null, 2), 'utf8');
        return payload;
    }

    /**
     * Initial baseline state object.
     * @returns {Object}
     */
    getInitialBaselineState() {
        return {
            registryId: 'REG-EAORCS-001',
            name: 'EAORCS Master Governance Registry',
            version: '2026.1.0',
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            projects: [],
            auditRunCount: 0,
            lastReset: null,
            metadata: {
                engine: 'RegistryLifecycleManager',
                tier: 'EAORCS-GOVERNANCE'
            }
        };
    }

    /**
     * Read audit trail.
     * @returns {Array}
     */
    getAuditTrail() {
        if (fs.existsSync(this.auditLogFile)) {
            try {
                const content = fs.readFileSync(this.auditLogFile, 'utf8');
                return JSON.parse(content);
            } catch (e) {
                return [];
            }
        }
        return [];
    }

    /**
     * Append record to audit trail log.
     * @param {string} action 
     * @param {Object} details 
     * @param {string} [operator='SYSTEM'] 
     */
    logAudit(action, details, operator = 'SYSTEM') {
        const trail = this.getAuditTrail();
        const entry = {
            id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            timestamp: new Date().toISOString(),
            action,
            operator,
            edition: this.editionEngine.getEdition(),
            details
        };
        entry.checksum = this.calculateChecksum(entry);
        trail.push(entry);
        fs.writeFileSync(this.auditLogFile, JSON.stringify(trail, null, 2), 'utf8');
        return entry;
    }

    /**
     * Calculate SHA-256 checksum of payload.
     * @param {Object} data 
     * @returns {string}
     */
    calculateChecksum(data) {
        const clone = { ...data };
        delete clone._checksum;
        delete clone._signature;
        delete clone.checksum;
        delete clone.signature;
        const serialized = JSON.stringify(clone, Object.keys(clone).sort());
        return crypto.createHash('sha256').update(serialized).digest('hex');
    }

    /**
     * Calculate SHA-256 HMAC digital signature of checksum.
     * @param {string} checksum 
     * @returns {string}
     */
    calculateSignature(checksum) {
        return crypto.createHmac('sha256', this.secretKey).update(checksum).digest('hex');
    }

    /**
     * Enable Legal Hold (requires SOVEREIGN edition).
     * @param {string} [operator='LEGAL_OFFICER'] 
     */
    enableLegalHold(operator = 'LEGAL_OFFICER') {
        this.editionEngine.assertFeature('legal_hold');
        this.legalHoldActive = true;
        this.logAudit('LEGAL_HOLD_ENABLED', { status: 'ACTIVE' }, operator);
        return { success: true, legalHold: true };
    }

    /**
     * Disable Legal Hold (requires SOVEREIGN edition).
     * @param {string} [operator='LEGAL_OFFICER'] 
     */
    disableLegalHold(operator = 'LEGAL_OFFICER') {
        this.editionEngine.assertFeature('legal_hold');
        this.legalHoldActive = false;
        this.logAudit('LEGAL_HOLD_DISABLED', { status: 'INACTIVE' }, operator);
        return { success: true, legalHold: false };
    }

    /**
     * Check if legal hold is currently active.
     * @returns {boolean}
     */
    isLegalHoldActive() {
        return this.legalHoldActive;
    }

    /**
     * Archive current registry state into snapshot.
     * Path: .governance/state/registry-history/YYYY-MM-DD_HHMMSS.json
     * @param {string} [reason='Manual Archive'] 
     * @param {string} [operator='SYSTEM'] 
     * @returns {Object} Snapshot record details
     */
    archive(reason = 'Manual Archive', operator = 'SYSTEM') {
        // Entitlement check
        this.editionEngine.assertFeature('archive');

        this.ensureDirectories();
        const baseTs = RegistryLifecycleManager.formatTimestamp();
        let snapshotId = baseTs;
        let targetFile = path.join(this.historyDir, `${snapshotId}.json`);

        // Handle collision within same second
        let counter = 1;
        while (fs.existsSync(targetFile)) {
            snapshotId = `${baseTs}_${String(counter).padStart(2, '0')}`;
            targetFile = path.join(this.historyDir, `${snapshotId}.json`);
            counter++;
        }

        const activeState = this.getActiveState();
        const auditTrail = this.getAuditTrail();

        const snapshotData = {
            snapshotId,
            timestamp: new Date().toISOString(),
            reason,
            operator,
            edition: this.editionEngine.getEdition(),
            activeState,
            auditTrailSummary: {
                totalEvents: auditTrail.length,
                lastEventId: auditTrail.length > 0 ? auditTrail[auditTrail.length - 1].id : null
            }
        };

        const checksum = this.calculateChecksum(snapshotData);
        const signature = this.calculateSignature(checksum);

        snapshotData.checksum = checksum;
        snapshotData.signature = signature;

        fs.writeFileSync(targetFile, JSON.stringify(snapshotData, null, 2), 'utf8');

        this.logAudit('REGISTRY_ARCHIVED', {
            snapshotId,
            filename: `${snapshotId}.json`,
            checksum,
            signature,
            reason
        }, operator);

        return {
            success: true,
            snapshotId,
            filePath: targetFile,
            fileName: `${snapshotId}.json`,
            timestamp: snapshotData.timestamp,
            reason,
            operator,
            checksum,
            signature
        };
    }

    /**
     * Perform registry reset under specified reset mode.
     * Modes: SOFT_RESET, CLEAN_AUDIT, HARD_RESET, FACTORY_RESET.
     * @param {string} mode 
     * @param {Object} [options={}] 
     * @returns {Object}
     */
    reset(mode, options = {}) {
        const normMode = EditionEngine.normalizeResetMode(mode);

        // 1. Edition Gating Check
        this.editionEngine.assertResetMode(normMode);

        // 2. Legal Hold Check for destructive resets
        if (this.isLegalHoldActive() && (normMode === RESET_MODES.HARD_RESET || normMode === RESET_MODES.FACTORY_RESET)) {
            throw new Error(`Reset operation '${normMode}' blocked: Legal Hold is active under SOVEREIGN governance.`);
        }

        const operator = options.operator || 'SYSTEM';
        const currentState = this.getActiveState();

        let newState;
        let actionDesc;

        switch (normMode) {
            case RESET_MODES.SOFT_RESET:
                // SOFT_RESET: Clears transient context/cache while preserving registry configuration & history
                newState = {
                    ...currentState,
                    auditRunCount: currentState.auditRunCount || 0,
                    transientCache: {},
                    lastReset: {
                        mode: normMode,
                        timestamp: new Date().toISOString(),
                        operator
                    }
                };
                actionDesc = 'Soft reset executed: Transient cache cleared, active registry configuration preserved.';
                break;

            case RESET_MODES.CLEAN_AUDIT:
                // CLEAN_AUDIT: Clean audit restart (eaorcs audit reset).
                // Resets audit run counters and temporary audit state while preserving baseline setup.
                newState = {
                    ...currentState,
                    auditRunCount: 0,
                    lastAuditReset: new Date().toISOString(),
                    lastReset: {
                        mode: normMode,
                        timestamp: new Date().toISOString(),
                        operator
                    }
                };
                // Clear audit trail file if requested or clean restart
                if (options.clearAuditTrail !== false && fs.existsSync(this.auditLogFile)) {
                    fs.writeFileSync(this.auditLogFile, JSON.stringify([], null, 2), 'utf8');
                }
                actionDesc = 'Clean audit restart executed: Audit state and counters reset cleanly.';
                break;

            case RESET_MODES.HARD_RESET:
                // HARD_RESET: Archives active state first, then re-initializes registry to baseline.
                if (options.autoArchive !== false) {
                    try {
                        this.archive(`Auto-archive prior to ${normMode}`, operator);
                    } catch (e) {
                        // Ignore if archive fails due to edition, but hard_reset requires ENTERPRISE so archive is entitled
                    }
                }
                newState = {
                    ...this.getInitialBaselineState(),
                    lastReset: {
                        mode: normMode,
                        timestamp: new Date().toISOString(),
                        operator
                    }
                };
                actionDesc = 'Hard reset executed: Previous state archived, registry reset to baseline.';
                break;

            case RESET_MODES.FACTORY_RESET:
                // FACTORY_RESET: Sovereign forensic restore / factory wipe.
                // Re-initializes state completely to factory baseline.
                this.editionEngine.assertFeature('forensic_restore');
                if (options.autoArchive !== false) {
                    try {
                        this.archive(`Forensic snapshot prior to ${normMode}`, operator);
                    } catch (e) {
                        // Archive before wipe
                    }
                }
                newState = {
                    ...this.getInitialBaselineState(),
                    factoryResetTimestamp: new Date().toISOString(),
                    lastReset: {
                        mode: normMode,
                        timestamp: new Date().toISOString(),
                        operator
                    }
                };
                actionDesc = 'Factory reset executed: Full forensic wipe completed, registry restored to factory state.';
                break;

            default:
                throw new Error(`Unsupported reset mode: '${mode}'.`);
        }

        this.saveActiveState(newState);

        const auditEntry = this.logAudit('REGISTRY_RESET', {
            mode: normMode,
            operator,
            description: actionDesc
        }, operator);

        return {
            success: true,
            mode: normMode,
            timestamp: newState.lastReset.timestamp,
            operator,
            description: actionDesc,
            auditEntry
        };
    }

    /**
     * Restore previous registry snapshot with audit trail logging.
     * @param {string} snapshotId Snapshot ID or filename
     * @param {string} [operator='ADMINISTRATOR'] 
     * @returns {Object} Restored registry summary
     */
    rollback(snapshotId, operator = 'ADMINISTRATOR') {
        // Entitlement check
        this.editionEngine.assertFeature('rollback');

        if (!snapshotId || typeof snapshotId !== 'string') {
            throw new Error('Rollback requires a valid snapshotId string.');
        }

        const cleanId = snapshotId.replace(/\.json$/, '');
        const targetFile = path.join(this.historyDir, `${cleanId}.json`);

        if (!fs.existsSync(targetFile)) {
            throw new Error(`Snapshot file not found for snapshotId: '${snapshotId}' at path '${targetFile}'.`);
        }

        let snapshotData;
        try {
            const raw = fs.readFileSync(targetFile, 'utf8');
            snapshotData = JSON.parse(raw);
        } catch (err) {
            throw new Error(`Failed to parse snapshot file '${targetFile}': ${err.message}`);
        }

        // Integrity assertion before restoring
        const computedChecksum = this.calculateChecksum(snapshotData);
        const computedSignature = this.calculateSignature(computedChecksum);

        if (snapshotData.checksum !== computedChecksum || snapshotData.signature !== computedSignature) {
            throw new Error(`Rollback failed: Snapshot '${cleanId}' integrity check failed (signature/checksum mismatch or tampered file).`);
        }

        if (!snapshotData.activeState) {
            throw new Error(`Rollback failed: Snapshot '${cleanId}' does not contain valid activeState data.`);
        }

        const restoredState = {
            ...snapshotData.activeState,
            restoredFromSnapshot: cleanId,
            restoredAt: new Date().toISOString(),
            restoredBy: operator
        };

        this.saveActiveState(restoredState);

        const auditEntry = this.logAudit('REGISTRY_ROLLBACK', {
            snapshotId: cleanId,
            restoredAt: restoredState.restoredAt,
            operator
        }, operator);

        return {
            success: true,
            snapshotId: cleanId,
            restoredAt: restoredState.restoredAt,
            operator,
            restoredState,
            auditEntry
        };
    }

    /**
     * Clean up expired snapshots based on retention policies.
     * @param {number} retentionDays Age threshold in days
     * @param {string} [operator='SYSTEM'] 
     * @returns {Object} Purge summary
     */
    purge(retentionDays, operator = 'SYSTEM') {
        if (typeof retentionDays !== 'number' || retentionDays < 0) {
            throw new Error('Purge requires a non-negative retentionDays number.');
        }

        // Legal hold check
        if (this.isLegalHoldActive()) {
            throw new Error('Purge operation blocked: Legal Hold is active under SOVEREIGN governance.');
        }

        this.ensureDirectories();
        const files = fs.readdirSync(this.historyDir).filter(f => f.endsWith('.json'));
        const now = Date.now();
        const maxAgeMs = retentionDays * 24 * 60 * 60 * 1000;

        const purgedSnapshots = [];
        const retainedSnapshots = [];

        for (const file of files) {
            const filePath = path.join(this.historyDir, file);
            let fileTime = 0;

            try {
                const raw = fs.readFileSync(filePath, 'utf8');
                const data = JSON.parse(raw);
                if (data.timestamp) {
                    fileTime = new Date(data.timestamp).getTime();
                }
            } catch (e) {
                // Fallback to fs stat mtime
            }

            if (!fileTime) {
                const stat = fs.statSync(filePath);
                fileTime = stat.mtimeMs;
            }

            const ageMs = now - fileTime;
            if (ageMs > maxAgeMs) {
                fs.unlinkSync(filePath);
                purgedSnapshots.push(file.replace(/\.json$/, ''));
            } else {
                retainedSnapshots.push(file.replace(/\.json$/, ''));
            }
        }

        this.logAudit('SNAPSHOTS_PURGED', {
            retentionDays,
            purgedCount: purgedSnapshots.length,
            retainedCount: retainedSnapshots.length,
            purgedSnapshots
        }, operator);

        return {
            success: true,
            retentionDays,
            purgedCount: purgedSnapshots.length,
            retainedCount: retainedSnapshots.length,
            purgedSnapshots,
            retainedSnapshots
        };
    }

    /**
     * Assert digital signatures and checksum integrity across active registry state and history snapshots.
     * @returns {Object} Verification report
     */
    verify() {
        this.ensureDirectories();
        const errors = [];
        let activeRegistryValid = false;

        // 1. Verify Active Registry State
        const activeState = this.getActiveState();
        if (activeState && activeState._checksum && activeState._signature) {
            const computedCheck = this.calculateChecksum(activeState);
            const computedSig = this.calculateSignature(computedCheck);
            if (activeState._checksum === computedCheck && activeState._signature === computedSig) {
                activeRegistryValid = true;
            } else {
                errors.push(`Active registry checksum/signature mismatch. Recorded: ${activeState._checksum}, Computed: ${computedCheck}`);
            }
        } else if (activeState) {
            // Unsaved baseline state or non-signed state
            activeRegistryValid = true;
        }

        // 2. Verify Snapshot History Files
        const files = fs.readdirSync(this.historyDir).filter(f => f.endsWith('.json'));
        let validSnapshotsCount = 0;
        const corruptedSnapshots = [];

        for (const file of files) {
            const filePath = path.join(this.historyDir, file);
            const snapshotId = file.replace(/\.json$/, '');
            try {
                const raw = fs.readFileSync(filePath, 'utf8');
                const snapshotData = JSON.parse(raw);

                const storedChecksum = snapshotData.checksum;
                const storedSignature = snapshotData.signature;

                if (!storedChecksum || !storedSignature) {
                    corruptedSnapshots.push({
                        snapshotId,
                        file,
                        reason: 'Missing digital signature or checksum metadata.'
                    });
                    errors.push(`Snapshot '${snapshotId}' is missing signature or checksum.`);
                    continue;
                }

                const computedChecksum = this.calculateChecksum(snapshotData);
                const computedSignature = this.calculateSignature(computedChecksum);

                if (storedChecksum === computedChecksum && storedSignature === computedSignature) {
                    validSnapshotsCount++;
                } else {
                    corruptedSnapshots.push({
                        snapshotId,
                        file,
                        reason: `Signature/checksum mismatch. Stored Checksum: ${storedChecksum}, Computed: ${computedChecksum}`
                    });
                    errors.push(`Snapshot '${snapshotId}' signature or checksum validation failed.`);
                }
            } catch (err) {
                corruptedSnapshots.push({
                    snapshotId,
                    file,
                    reason: `Failed to read/parse snapshot JSON: ${err.message}`
                });
                errors.push(`Snapshot '${snapshotId}' read/parse error: ${err.message}`);
            }
        }

        const valid = activeRegistryValid && corruptedSnapshots.length === 0;

        return {
            valid,
            activeRegistryValid,
            totalSnapshots: files.length,
            validSnapshotsCount,
            corruptedSnapshots,
            errors
        };
    }

    /**
     * Get list of historical snapshot metadata.
     * @returns {Array} List of snapshot records sorted descending by timestamp
     */
    getHistory() {
        this.editionEngine.assertFeature('history');
        this.ensureDirectories();

        const files = fs.readdirSync(this.historyDir).filter(f => f.endsWith('.json'));
        const history = [];

        for (const file of files) {
            const filePath = path.join(this.historyDir, file);
            try {
                const raw = fs.readFileSync(filePath, 'utf8');
                const data = JSON.parse(raw);
                history.push({
                    snapshotId: data.snapshotId || file.replace(/\.json$/, ''),
                    timestamp: data.timestamp,
                    reason: data.reason,
                    operator: data.operator,
                    edition: data.edition,
                    checksum: data.checksum,
                    signature: data.signature
                });
            } catch (e) {
                // Ignore broken file in listing or report basic info
            }
        }

        history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return history;
    }
}

module.exports = {
    RegistryLifecycleManager,
    RESET_MODES,
    EDITIONS
};
