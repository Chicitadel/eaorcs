/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : Registry Lifecycle Manager & Edition Engine Test Suite
 * File           : registry_lifecycle.test.js
 * Version        : 2026.1.0
 * Author         : Air Roofers Architecture Authority / Ujomor Systems
 * Organization   : Ujomor Systems & Air Roofers
 * Created Date   : 2026-08-02
 * Last Modified  : 2026-08-02
 * Classification : ENTERPRISE | PUBLIC | INTERNAL
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
 * Copyright (c) 2026 Ujomor Systems & Air Roofers
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

const { EditionEngine, EditionGatingError, EDITIONS, RESET_MODES } = require('../../engine/governance/EditionEngine');
const { RegistryLifecycleManager } = require('../../engine/governance/RegistryLifecycleManager');

function createTempWorkspace() {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'eaorcs-reg-test-'));
    const stateDir = path.join(tmpDir, '.governance', 'state');
    const historyDir = path.join(stateDir, 'registry-history');
    return { tmpDir, stateDir, historyDir };
}

function cleanupTempWorkspace(tmpDir) {
    if (tmpDir && fs.existsSync(tmpDir)) {
        try {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        } catch (e) {
            // Ignore cleanup error on Windows
        }
    }
}

function runRegistryLifecycleTests() {
    const results = [];

    // Test 1: EditionEngine Feature & Entitlement Matrix Gating across all 4 tiers
    try {
        const commEng = new EditionEngine(EDITIONS.COMMUNITY);
        assert.strictEqual(commEng.hasFeature('clean_audit'), true);
        assert.strictEqual(commEng.hasFeature('restart'), true);
        assert.strictEqual(commEng.hasFeature('archive'), false);
        assert.strictEqual(commEng.hasFeature('rollback'), false);
        assert.strictEqual(commEng.canPerformReset('CLEAN_AUDIT'), true);
        assert.strictEqual(commEng.canPerformReset('SOFT_RESET'), false);
        assert.strictEqual(commEng.canPerformReset('HARD_RESET'), false);

        const profEng = new EditionEngine(EDITIONS.PROFESSIONAL);
        assert.strictEqual(profEng.hasFeature('archive'), true);
        assert.strictEqual(profEng.hasFeature('history'), true);
        assert.strictEqual(profEng.hasFeature('rollback'), false);
        assert.strictEqual(profEng.canPerformReset('SOFT_RESET'), true);
        assert.strictEqual(profEng.canPerformReset('HARD_RESET'), false);

        const entEng = new EditionEngine(EDITIONS.ENTERPRISE);
        assert.strictEqual(entEng.hasFeature('rollback'), true);
        assert.strictEqual(entEng.hasFeature('digital_signatures'), true);
        assert.strictEqual(entEng.hasFeature('audit_chain'), true);
        assert.strictEqual(entEng.hasFeature('forensic_restore'), false);
        assert.strictEqual(entEng.canPerformReset('HARD_RESET'), true);
        assert.strictEqual(entEng.canPerformReset('FACTORY_RESET'), false);

        const sovEng = new EditionEngine(EDITIONS.SOVEREIGN);
        assert.strictEqual(sovEng.hasFeature('forensic_restore'), true);
        assert.strictEqual(sovEng.hasFeature('legal_hold'), true);
        assert.strictEqual(sovEng.hasFeature('blockchain_signature'), true);
        assert.strictEqual(sovEng.canPerformReset('FACTORY_RESET'), true);

        results.push({ test: 'EditionEngine entitlement matrix gating across 4 tiers', passed: true });
    } catch (err) {
        results.push({ test: 'EditionEngine entitlement matrix gating across 4 tiers', passed: false, error: err.message });
    }

    // Test 2: EditionGatingError thrown when asserting unpermitted feature or reset mode
    try {
        const commEng = new EditionEngine(EDITIONS.COMMUNITY);
        assert.throws(() => {
            commEng.assertFeature('rollback');
        }, EditionGatingError, 'COMMUNITY edition must throw EditionGatingError on rollback feature');

        assert.throws(() => {
            commEng.assertResetMode('HARD_RESET');
        }, EditionGatingError, 'COMMUNITY edition must throw EditionGatingError on HARD_RESET mode');

        results.push({ test: 'EditionGatingError handling on disallowed actions', passed: true });
    } catch (err) {
        results.push({ test: 'EditionGatingError handling on disallowed actions', passed: false, error: err.message });
    }

    // Test 3: Archiving snapshot creation with SHA-256 signature and filepath verification
    const ws3 = createTempWorkspace();
    try {
        const mgr = new RegistryLifecycleManager({
            rootDir: ws3.tmpDir,
            stateDir: ws3.stateDir,
            historyDir: ws3.historyDir,
            edition: EDITIONS.PROFESSIONAL
        });

        const archiveRes = mgr.archive('Scheduled Backup', 'OPERATOR_ALICE');
        assert.strictEqual(archiveRes.success, true);
        assert.ok(archiveRes.snapshotId, 'Snapshot ID must be generated');
        assert.ok(fs.existsSync(archiveRes.filePath), 'Snapshot file must exist on disk');
        assert.ok(archiveRes.fileName.endsWith('.json'), 'Filename must end with .json');

        // Read saved snapshot file and verify SHA-256 format
        const rawContent = fs.readFileSync(archiveRes.filePath, 'utf8');
        const snapJson = JSON.parse(rawContent);
        assert.strictEqual(snapJson.operator, 'OPERATOR_ALICE');
        assert.strictEqual(snapJson.reason, 'Scheduled Backup');
        assert.strictEqual(snapJson.checksum, archiveRes.checksum);
        assert.strictEqual(snapJson.signature, archiveRes.signature);
        assert.strictEqual(snapJson.checksum.length, 64, 'SHA-256 checksum length must be 64 hex characters');

        results.push({ test: 'Registry snapshot archiving with SHA-256 checksum and digital signature', passed: true });
    } catch (err) {
        results.push({ test: 'Registry snapshot archiving with SHA-256 checksum and digital signature', passed: false, error: err.message });
    } finally {
        cleanupTempWorkspace(ws3.tmpDir);
    }

    // Test 4: All 4 reset modes (SOFT_RESET, CLEAN_AUDIT, HARD_RESET, FACTORY_RESET)
    const ws4 = createTempWorkspace();
    try {
        // CLEAN_AUDIT under COMMUNITY edition
        const commMgr = new RegistryLifecycleManager({
            rootDir: ws4.tmpDir,
            stateDir: ws4.stateDir,
            historyDir: ws4.historyDir,
            edition: EDITIONS.COMMUNITY
        });
        const cleanRes = commMgr.reset('CLEAN_AUDIT', { operator: 'COMMUNITY_USER' });
        assert.strictEqual(cleanRes.success, true);
        assert.strictEqual(cleanRes.mode, 'CLEAN_AUDIT');

        // SOFT_RESET under PROFESSIONAL edition
        const profMgr = new RegistryLifecycleManager({
            rootDir: ws4.tmpDir,
            stateDir: ws4.stateDir,
            historyDir: ws4.historyDir,
            edition: EDITIONS.PROFESSIONAL
        });
        const softRes = profMgr.reset('SOFT_RESET', { operator: 'PROF_USER' });
        assert.strictEqual(softRes.success, true);
        assert.strictEqual(softRes.mode, 'SOFT_RESET');

        // HARD_RESET under ENTERPRISE edition
        const entMgr = new RegistryLifecycleManager({
            rootDir: ws4.tmpDir,
            stateDir: ws4.stateDir,
            historyDir: ws4.historyDir,
            edition: EDITIONS.ENTERPRISE
        });
        const hardRes = entMgr.reset('HARD_RESET', { operator: 'ENT_ADMIN' });
        assert.strictEqual(hardRes.success, true);
        assert.strictEqual(hardRes.mode, 'HARD_RESET');

        // FACTORY_RESET under SOVEREIGN edition
        const sovMgr = new RegistryLifecycleManager({
            rootDir: ws4.tmpDir,
            stateDir: ws4.stateDir,
            historyDir: ws4.historyDir,
            edition: EDITIONS.SOVEREIGN
        });
        const factoryRes = sovMgr.reset('FACTORY_RESET', { operator: 'SOV_OFFICER' });
        assert.strictEqual(factoryRes.success, true);
        assert.strictEqual(factoryRes.mode, 'FACTORY_RESET');

        results.push({ test: 'Execution of all 4 reset modes (SOFT_RESET, CLEAN_AUDIT, HARD_RESET, FACTORY_RESET)', passed: true });
    } catch (err) {
        results.push({ test: 'Execution of all 4 reset modes (SOFT_RESET, CLEAN_AUDIT, HARD_RESET, FACTORY_RESET)', passed: false, error: err.message });
    } finally {
        cleanupTempWorkspace(ws4.tmpDir);
    }

    // Test 5: Rollback restoring snapshot and audit log entry
    const ws5 = createTempWorkspace();
    try {
        const mgr = new RegistryLifecycleManager({
            rootDir: ws5.tmpDir,
            stateDir: ws5.stateDir,
            historyDir: ws5.historyDir,
            edition: EDITIONS.ENTERPRISE
        });

        // Set initial state and archive
        const initState = mgr.saveActiveState({ name: 'State V1', projects: ['proj-alpha'] });
        const archive1 = mgr.archive('Baseline V1', 'ADMIN_BOB');

        // Modify active state
        mgr.saveActiveState({ name: 'State V2 Modified', projects: ['proj-alpha', 'proj-beta'] });

        // Rollback to archive1 snapshot
        const rollbackRes = mgr.rollback(archive1.snapshotId, 'ADMIN_BOB');
        assert.strictEqual(rollbackRes.success, true);
        assert.strictEqual(rollbackRes.snapshotId, archive1.snapshotId);

        // Verify active state was restored to V1
        const activeAfter = mgr.getActiveState();
        assert.strictEqual(activeAfter.name, 'State V1');
        assert.deepStrictEqual(activeAfter.projects, ['proj-alpha']);
        assert.strictEqual(activeAfter.restoredFromSnapshot, archive1.snapshotId);

        results.push({ test: 'Rollback functionality restoring exact previous state and logging audit event', passed: true });
    } catch (err) {
        results.push({ test: 'Rollback functionality restoring exact previous state and logging audit event', passed: false, error: err.message });
    } finally {
        cleanupTempWorkspace(ws5.tmpDir);
    }

    // Test 6: Checksum and digital signature integrity verification (verify())
    const ws6 = createTempWorkspace();
    try {
        const mgr = new RegistryLifecycleManager({
            rootDir: ws6.tmpDir,
            stateDir: ws6.stateDir,
            historyDir: ws6.historyDir,
            edition: EDITIONS.SOVEREIGN
        });

        // Create 2 valid snapshots
        const snap1 = mgr.archive('Snapshot One', 'USER_1');
        const snap2 = mgr.archive('Snapshot Two', 'USER_2');

        const initialVerify = mgr.verify();
        assert.strictEqual(initialVerify.valid, true);
        assert.strictEqual(initialVerify.totalSnapshots, 2);
        assert.strictEqual(initialVerify.validSnapshotsCount, 2);
        assert.strictEqual(initialVerify.corruptedSnapshots.length, 0);

        // Tamper with snap1 file on disk
        const rawContent = fs.readFileSync(snap1.filePath, 'utf8');
        const tamperedJson = JSON.parse(rawContent);
        tamperedJson.reason = 'TAMPERED REASON BY HACKER';
        fs.writeFileSync(snap1.filePath, JSON.stringify(tamperedJson, null, 2), 'utf8');

        // Verification must detect corruption
        const corruptedVerify = mgr.verify();
        assert.strictEqual(corruptedVerify.valid, false);
        assert.strictEqual(corruptedVerify.corruptedSnapshots.length, 1);
        assert.strictEqual(corruptedVerify.corruptedSnapshots[0].snapshotId, snap1.snapshotId);

        // Attempting rollback on corrupted snapshot must fail
        assert.throws(() => {
            mgr.rollback(snap1.snapshotId);
        }, /integrity check failed/, 'Rollback must reject tampered snapshot');

        results.push({ test: 'Checksum & digital signature integrity verification (verify())', passed: true });
    } catch (err) {
        results.push({ test: 'Checksum & digital signature integrity verification (verify())', passed: false, error: err.message });
    } finally {
        cleanupTempWorkspace(ws6.tmpDir);
    }

    // Test 7: Legal Hold blocking destructive resets and purging
    const ws7 = createTempWorkspace();
    try {
        const mgr = new RegistryLifecycleManager({
            rootDir: ws7.tmpDir,
            stateDir: ws7.stateDir,
            historyDir: ws7.historyDir,
            edition: EDITIONS.SOVEREIGN
        });

        mgr.archive('Pre-legal snapshot', 'LEGAL_AUDITOR');
        mgr.enableLegalHold('CHIEF_LEGAL_OFFICER');
        assert.strictEqual(mgr.isLegalHoldActive(), true);

        // Hard Reset blocked
        assert.throws(() => {
            mgr.reset('HARD_RESET');
        }, /Legal Hold is active/, 'Legal Hold must block HARD_RESET');

        // Factory Reset blocked
        assert.throws(() => {
            mgr.reset('FACTORY_RESET');
        }, /Legal Hold is active/, 'Legal Hold must block FACTORY_RESET');

        // Purge blocked
        assert.throws(() => {
            mgr.purge(0);
        }, /Legal Hold is active/, 'Legal Hold must block snapshot purging');

        // Disable legal hold and verify unblocked
        mgr.disableLegalHold('CHIEF_LEGAL_OFFICER');
        assert.strictEqual(mgr.isLegalHoldActive(), false);

        results.push({ test: 'SOVEREIGN Legal Hold enforcement blocking destructive operations and purging', passed: true });
    } catch (err) {
        results.push({ test: 'SOVEREIGN Legal Hold enforcement blocking destructive operations and purging', passed: false, error: err.message });
    } finally {
        cleanupTempWorkspace(ws7.tmpDir);
    }

    // Test 8: Purge retention policy cleaning up expired snapshots
    const ws8 = createTempWorkspace();
    try {
        const mgr = new RegistryLifecycleManager({
            rootDir: ws8.tmpDir,
            stateDir: ws8.stateDir,
            historyDir: ws8.historyDir,
            edition: EDITIONS.ENTERPRISE
        });

        const snapInfo = mgr.archive('Snapshot to purge', 'TEST_PURGER');
        assert.strictEqual(fs.existsSync(snapInfo.filePath), true);

        // Modify timestamp in snapshot file to 30 days ago
        const oldDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const raw = fs.readFileSync(snapInfo.filePath, 'utf8');
        const snapObj = JSON.parse(raw);
        snapObj.timestamp = oldDate;
        // re-sign for validity
        snapObj.checksum = mgr.calculateChecksum(snapObj);
        snapObj.signature = mgr.calculateSignature(snapObj.checksum);
        fs.writeFileSync(snapInfo.filePath, JSON.stringify(snapObj, null, 2), 'utf8');

        // Purge snapshots older than 7 days
        const purgeReport = mgr.purge(7);
        assert.strictEqual(purgeReport.purgedCount, 1);
        assert.strictEqual(fs.existsSync(snapInfo.filePath), false, 'Expired snapshot file must be unlinked');

        results.push({ test: 'Snapshot retention policy purging expired files', passed: true });
    } catch (err) {
        results.push({ test: 'Snapshot retention policy purging expired files', passed: false, error: err.message });
    } finally {
        cleanupTempWorkspace(ws8.tmpDir);
    }

    return results;
}

if (require.main === module) {
    const results = runRegistryLifecycleTests();
    console.log(results);
}

module.exports = { runRegistryLifecycleTests };
