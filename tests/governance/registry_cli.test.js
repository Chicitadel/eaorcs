/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : Registry CLI Interface Test Suite
 * File           : registry_cli.test.js
 * Version        : 2026.1.0-LTS
 * Author         : Air Roofers Architecture Authority & Ujomor Systems
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
const { executeRegistryCli, parseArgs } = require('../../cli/eaorcs-registry-cli');

function createTempWorkspace() {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'eaorcs-cli-test-'));
    return tmpDir;
}

function cleanupTempWorkspace(tmpDir) {
    if (tmpDir && fs.existsSync(tmpDir)) {
        try {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        } catch (e) {
            // Ignore Windows file lock
        }
    }
}

function runRegistryCliTests() {
    const results = [];

    // Test 1: parseArgs utility
    try {
        const parsed = parseArgs(['audit', 'reset', '--clean', '--reason=test archive', '--edition', 'enterprise', '-v']);
        assert.deepStrictEqual(parsed.positional, ['audit', 'reset']);
        assert.strictEqual(parsed.flags.clean, true);
        assert.strictEqual(parsed.flags.reason, 'test archive');
        assert.strictEqual(parsed.flags.edition, 'enterprise');
        assert.strictEqual(parsed.flags.v, true);

        results.push({ test: 'parseArgs command line argument parser', passed: true });
    } catch (err) {
        results.push({ test: 'parseArgs command line argument parser', passed: false, error: err.message });
    }

    // Test 2: eaorcs registry status command across editions
    try {
        const resComm = executeRegistryCli(['status', '--edition=community'], { silent: true });
        assert.strictEqual(resComm.success, true);
        assert.strictEqual(resComm.edition, 'COMMUNITY');
        assert.ok(resComm.tables.statusTable.includes('COMMUNITY'));

        const resEnt = executeRegistryCli(['status', '--edition=enterprise'], { silent: true });
        assert.strictEqual(resEnt.success, true);
        assert.strictEqual(resEnt.edition, 'ENTERPRISE');
        assert.ok(resEnt.tables.statusTable.includes('ENTERPRISE'));

        results.push({ test: 'eaorcs registry status command execution across editions', passed: true });
    } catch (err) {
        results.push({ test: 'eaorcs registry status command execution across editions', passed: false, error: err.message });
    }

    // Test 3: eaorcs audit reset command
    const ws3 = createTempWorkspace();
    const origCwd = process.cwd();
    try {
        process.chdir(ws3);
        const res = executeRegistryCli(['audit', 'reset', '--clean'], { silent: true });
        assert.strictEqual(res.success, true);
        assert.strictEqual(res.result.mode, 'CLEAN_AUDIT');
        assert.strictEqual(res.result.success, true);

        results.push({ test: 'eaorcs audit reset [--clean]', passed: true });
    } catch (err) {
        results.push({ test: 'eaorcs audit reset [--clean]', passed: false, error: err.message });
    } finally {
        process.chdir(origCwd);
        cleanupTempWorkspace(ws3);
    }

    // Test 4: eaorcs registry archive and entitlement gating
    const ws4 = createTempWorkspace();
    try {
        process.chdir(ws4);

        // Community edition should block archive
        const resBlocked = executeRegistryCli(['registry', 'archive', '--edition=community'], { silent: true });
        assert.strictEqual(resBlocked.success, false);
        assert.ok(resBlocked.error.includes('archive'));

        // Professional edition should allow archive
        const resAllowed = executeRegistryCli(['registry', 'archive', '--reason=CLI Test Snapshot', '--edition=professional'], { silent: true });
        assert.strictEqual(resAllowed.success, true);
        assert.ok(resAllowed.result.snapshotId);
        assert.strictEqual(resAllowed.result.reason, 'CLI Test Snapshot');

        results.push({ test: 'eaorcs registry archive [--reason=<msg>] entitlement gating', passed: true });
    } catch (err) {
        results.push({ test: 'eaorcs registry archive [--reason=<msg>] entitlement gating', passed: false, error: err.message });
    } finally {
        process.chdir(origCwd);
        cleanupTempWorkspace(ws4);
    }

    // Test 5: eaorcs registry rollback and confirmation checks for destructive resets
    const ws5 = createTempWorkspace();
    try {
        process.chdir(ws5);

        // Create initial archive under Enterprise edition
        const archiveRes = executeRegistryCli(['registry', 'archive', '--reason=Pre-Rollback State', '--edition=enterprise'], { silent: true });
        assert.strictEqual(archiveRes.success, true);
        const snapId = archiveRes.result.snapshotId;

        // Perform rollback
        const rollbackRes = executeRegistryCli(['registry', 'rollback', `--snapshot=${snapId}`, '--edition=enterprise'], { silent: true });
        assert.strictEqual(rollbackRes.success, true);
        assert.strictEqual(rollbackRes.result.snapshotId, snapId);

        // Test destructive reset confirmation block
        const unconfirmedRes = executeRegistryCli(['registry', 'reset', '--mode=hard', '--edition=enterprise'], { silent: true });
        assert.strictEqual(unconfirmedRes.success, false);
        assert.strictEqual(unconfirmedRes.error, 'Confirmation required');

        // Test confirmed destructive reset
        const confirmedRes = executeRegistryCli(['registry', 'reset', '--mode=hard', '--confirm', '--edition=enterprise'], { silent: true });
        assert.strictEqual(confirmedRes.success, true);
        assert.strictEqual(confirmedRes.result.mode, 'HARD_RESET');

        results.push({ test: 'eaorcs registry rollback and destructive reset confirmation checks', passed: true });
    } catch (err) {
        results.push({ test: 'eaorcs registry rollback and destructive reset confirmation checks', passed: false, error: err.message });
    } finally {
        process.chdir(origCwd);
        cleanupTempWorkspace(ws5);
    }

    // Test 6: eaorcs registry verify integrity check
    const ws6 = createTempWorkspace();
    try {
        process.chdir(ws6);
        const verifyRes = executeRegistryCli(['registry', 'verify'], { silent: true });
        assert.strictEqual(verifyRes.success, true);
        assert.strictEqual(verifyRes.result.valid, true);

        results.push({ test: 'eaorcs registry verify integrity check', passed: true });
    } catch (err) {
        results.push({ test: 'eaorcs registry verify integrity check', passed: false, error: err.message });
    } finally {
        process.chdir(origCwd);
        cleanupTempWorkspace(ws6);
    }

    return results;
}

if (require.main === module) {
    const results = runRegistryCliTests();
    console.log(results);
}

module.exports = { runRegistryCliTests };
