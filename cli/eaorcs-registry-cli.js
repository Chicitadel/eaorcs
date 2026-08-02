/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Registry & Lifecycle CLI Interface
 * File           : eaorcs-registry-cli.js
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
const { RegistryLifecycleManager } = require('../engine/governance/RegistryLifecycleManager');
const { EditionEngine, EDITIONS, RESET_MODES, EditionGatingError } = require('../engine/governance/EditionEngine');

/**
 * Parse CLI command line arguments.
 * Supports flags (--flag, --key=val, --key val, -f) and positional arguments.
 * @param {string[]} args 
 * @returns {{ flags: Object, positional: string[] }}
 */
function parseArgs(args) {
    const flags = {};
    const positional = [];

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith('--')) {
            const keyVal = arg.slice(2);
            if (keyVal.includes('=')) {
                const [k, ...vParts] = keyVal.split('=');
                flags[k] = vParts.join('=');
            } else {
                if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
                    flags[keyVal] = args[i + 1];
                    i++;
                } else {
                    flags[keyVal] = true;
                }
            }
        } else if (arg.startsWith('-')) {
            const keyVal = arg.slice(1);
            flags[keyVal] = true;
        } else {
            positional.push(arg);
        }
    }

    return { flags, positional };
}

/**
 * Renders a key-value ASCII table block.
 * @param {string} title Header title
 * @param {Array<[string, string]>} rows Key-value pairs
 * @returns {string}
 */
function renderTable(title, rows) {
    let maxKeyLen = title ? title.length : 15;
    let maxValLen = 20;

    for (const [k, v] of rows) {
        if (k.length > maxKeyLen) maxKeyLen = k.length;
        const strVal = String(v);
        if (strVal.length > maxValLen) maxValLen = strVal.length;
    }

    maxKeyLen = Math.min(Math.max(maxKeyLen, 25), 35);
    maxValLen = Math.min(Math.max(maxValLen, 45), 65);

    const totalWidth = maxKeyLen + maxValLen + 7;
    const border = '+' + '-'.repeat(totalWidth - 2) + '+';
    const subBorder = '+' + '-'.repeat(maxKeyLen + 2) + '+' + '-'.repeat(maxValLen + 3) + '+';

    const out = [];
    out.push(border);
    if (title) {
        const paddedTitle = title.padEnd(totalWidth - 4, ' ');
        out.push(`| ${paddedTitle} |`);
        out.push(border);
    }

    for (const [k, v] of rows) {
        const keyStr = String(k).padEnd(maxKeyLen, ' ');
        const valStr = String(v).padEnd(maxValLen, ' ');
        out.push(`| ${keyStr} | ${valStr} |`);
    }
    out.push(subBorder);

    return out.join('\n');
}

/**
 * Renders a multi-column ASCII grid table.
 * @param {string} title Header title
 * @param {string[]} headers Column header labels
 * @param {Array<Array<string>>} rows Table rows
 * @returns {string}
 */
function renderGridTable(title, headers, rows) {
    const colWidths = headers.map(h => h.length);
    for (const row of rows) {
        row.forEach((cell, idx) => {
            const cellLen = String(cell).length;
            if (cellLen > (colWidths[idx] || 0)) {
                colWidths[idx] = cellLen;
            }
        });
    }

    const paddedWidths = colWidths.map(w => Math.min(Math.max(w + 2, 10), 50));
    const totalWidth = paddedWidths.reduce((acc, w) => acc + w + 1, 1);

    const border = '+' + paddedWidths.map(w => '-'.repeat(w)).join('+') + '+';

    const out = [];
    out.push(border);
    if (title) {
        out.push(`| ${title.padEnd(totalWidth - 3, ' ')} |`);
        out.push(border);
    }

    const headerLine = '|' + headers.map((h, i) => ` ${h.padEnd(paddedWidths[i] - 1, ' ')}`).join('|') + '|';
    out.push(headerLine);
    out.push(border);

    for (const row of rows) {
        const line = '|' + row.map((cell, i) => ` ${String(cell).padEnd(paddedWidths[i] - 1, ' ')}`).join('|') + '|';
        out.push(line);
    }
    out.push(border);

    return out.join('\n');
}

/**
 * Print CLI help menu.
 */
function printHelp() {
    console.log(`
EAORCS Governance Registry & Lifecycle Management CLI (UAIGOS 3.0.0)

Usage:
  eaorcs audit reset [--clean] [--soft]
  eaorcs registry reset [--mode=clean|soft|hard|factory] [--confirm]
  eaorcs registry archive [--reason=<msg>]
  eaorcs registry rollback [--snapshot=<id>]
  eaorcs registry verify
  eaorcs registry status [--edition=community|professional|enterprise|sovereign]

Commands:
  audit reset       Reset audit run count and transient audit state
  registry reset    Perform registry lifecycle reset (modes: clean, soft, hard, factory)
  registry archive  Archive current registry state into signed historical snapshot
  registry rollback Restore active registry state from a historical snapshot
  registry verify   Assert cryptographic checksums and HMAC digital signatures
  registry status   Display active registry state, edition entitlements and integrity summary

Options:
  --edition=<tier>  Set active edition context (community|professional|enterprise|sovereign)
  --mode=<mode>     Set reset mode (clean|soft|hard|factory)
  --reason=<msg>    Set audit reason description for archiving
  --snapshot=<id>   Specify snapshot ID for rollback operation
  --confirm         Confirm execution of destructive reset operations (hard|factory)
  --clean           Clean audit restart flag (default for audit reset)
  --soft            Soft reset flag (preserves state, clears cache)
  --help, -h        Display CLI help menu
`);
}

/**
 * Format and print Edition Entitlement Gating Error.
 * @param {Error|EditionGatingError} err 
 * @param {string} attemptedAction 
 */
function handleEditionError(err, attemptedAction) {
    const rows = [
        ['Attempted Action', attemptedAction],
        ['Current Edition', err.currentEdition || 'COMMUNITY'],
        ['Required Edition', err.requiredEdition || 'ENTERPRISE'],
        ['Gating Violation', err.message],
        ['Resolution', `Upgrade to EAORCS ${err.requiredEdition || 'ENTERPRISE'} edition or pass --edition=${(err.requiredEdition || 'enterprise').toLowerCase()} flag.`]
    ];
    console.error(renderTable('EAORCS EDITION PERMISSION DENIED', rows));
}

/**
 * Primary CLI execution function.
 * @param {string[]} [rawArgs=process.argv.slice(2)] 
 * @param {Object} [options={}]
 * @param {boolean} [options.silent=false]
 * @returns {Object} Command execution result
 */
function executeRegistryCli(rawArgs = process.argv.slice(2), options = {}) {
    const { flags, positional } = parseArgs(rawArgs);

    if (positional.length === 0 && (flags.help || flags.h)) {
        printHelp();
        return { success: true, command: 'help' };
    }

    // Determine target command routing
    let mainCmd = positional[0] ? positional[0].toLowerCase() : 'status';
    let subCmd = positional[1] ? positional[1].toLowerCase() : '';

    // Handle prefixed invocation e.g. "eaorcs registry status"
    if (mainCmd === 'eaorcs') {
        mainCmd = subCmd || 'status';
        subCmd = positional[2] ? positional[2].toLowerCase() : '';
    }

    if (flags.help || flags.h || mainCmd === 'help') {
        printHelp();
        return { success: true, command: 'help' };
    }

    // Resolve active edition tier
    let rawEdition = flags.edition || process.env.EAORCS_EDITION || EDITIONS.COMMUNITY;
    let normalizedEdition;
    try {
        normalizedEdition = EditionEngine.normalizeEdition(rawEdition);
    } catch (e) {
        console.error(`Error: ${e.message}`);
        if (!options.silent) process.exit(1);
        return { success: false, error: e.message };
    }

    const manager = new RegistryLifecycleManager({
        rootDir: process.cwd(),
        edition: normalizedEdition
    });

    try {
        // 1. Audit Reset Command: eaorcs audit reset [--clean] [--soft]
        if (mainCmd === 'audit' || (mainCmd === 'registry' && subCmd === 'audit')) {
            const targetSub = mainCmd === 'audit' ? subCmd : (positional[2] ? positional[2].toLowerCase() : '');
            if (targetSub && targetSub !== 'reset') {
                throw new Error(`Unknown audit subcommand: '${targetSub}'. Supported: 'eaorcs audit reset'`);
            }

            const resetMode = flags.soft ? RESET_MODES.SOFT_RESET : RESET_MODES.CLEAN_AUDIT;
            const resetRes = manager.reset(resetMode, { operator: 'CLI_OPERATOR' });

            const tableRows = [
                ['Reset Mode', resetRes.mode],
                ['Execution Status', resetRes.success ? 'SUCCESS' : 'FAILED'],
                ['Timestamp', resetRes.timestamp],
                ['Active Edition', manager.editionEngine.getEdition()],
                ['Operator', resetRes.operator],
                ['Description', resetRes.description]
            ];

            const tableStr = renderTable('EAORCS AUDIT RESET EXECUTED SUCCESSFULLY', tableRows);
            if (!options.silent) console.log(tableStr);
            return { success: true, command: 'audit_reset', result: resetRes, table: tableStr };
        }

        // 2. Registry Reset Command: eaorcs registry reset [--mode=clean|soft|hard|factory] [--confirm]
        if ((mainCmd === 'registry' && subCmd === 'reset') || (mainCmd === 'reset')) {
            let selectedMode = RESET_MODES.CLEAN_AUDIT;

            const modeMap = {
                'CLEAN': RESET_MODES.CLEAN_AUDIT,
                'CLEAN_AUDIT': RESET_MODES.CLEAN_AUDIT,
                'SOFT': RESET_MODES.SOFT_RESET,
                'SOFT_RESET': RESET_MODES.SOFT_RESET,
                'HARD': RESET_MODES.HARD_RESET,
                'HARD_RESET': RESET_MODES.HARD_RESET,
                'FACTORY': RESET_MODES.FACTORY_RESET,
                'FACTORY_RESET': RESET_MODES.FACTORY_RESET
            };

            if (flags.mode) {
                const normKey = String(flags.mode).toUpperCase().trim().replace(/[\s-]+/g, '_');
                selectedMode = modeMap[normKey] || normKey;
            } else if (flags.soft) {
                selectedMode = RESET_MODES.SOFT_RESET;
            } else if (flags.clean) {
                selectedMode = RESET_MODES.CLEAN_AUDIT;
            } else if (flags.hard) {
                selectedMode = RESET_MODES.HARD_RESET;
            } else if (flags.factory) {
                selectedMode = RESET_MODES.FACTORY_RESET;
            }

            // Destructive modes confirmation check
            if ((selectedMode === RESET_MODES.HARD_RESET || selectedMode === RESET_MODES.FACTORY_RESET) && !flags.confirm) {
                const errRows = [
                    ['Target Reset Mode', selectedMode],
                    ['Execution Status', 'BLOCKED'],
                    ['Active Edition', manager.editionEngine.getEdition()],
                    ['Reason', `Destructive mode '${selectedMode}' requires --confirm flag to execute.`],
                    ['Resolution', `Re-run with: eaorcs registry reset --mode=${selectedMode.toLowerCase()} --confirm`]
                ];
                const errTable = renderTable('EAORCS REGISTRY RESET CONFIRMATION REQUIRED', errRows);
                if (!options.silent) console.error(errTable);
                if (!options.silent) process.exit(1);
                return { success: false, command: 'registry_reset', error: 'Confirmation required', table: errTable };
            }

            const resetRes = manager.reset(selectedMode, { operator: 'CLI_OPERATOR', confirm: Boolean(flags.confirm) });

            const tableRows = [
                ['Target Mode', resetRes.mode],
                ['Execution Status', resetRes.success ? 'SUCCESS' : 'FAILED'],
                ['Timestamp', resetRes.timestamp],
                ['Active Edition', manager.editionEngine.getEdition()],
                ['Operator', resetRes.operator],
                ['Description', resetRes.description]
            ];

            const tableStr = renderTable('EAORCS REGISTRY RESET COMPLETED', tableRows);
            if (!options.silent) console.log(tableStr);
            return { success: true, command: 'registry_reset', result: resetRes, table: tableStr };
        }

        // 3. Registry Archive Command: eaorcs registry archive [--reason=<msg>]
        if ((mainCmd === 'registry' && subCmd === 'archive') || (mainCmd === 'archive')) {
            const reason = flags.reason || flags.msg || 'CLI Registry Archive';
            const archiveRes = manager.archive(reason, 'CLI_OPERATOR');

            const tableRows = [
                ['Snapshot ID', archiveRes.snapshotId],
                ['File Name', archiveRes.fileName],
                ['Timestamp', archiveRes.timestamp],
                ['Reason', archiveRes.reason],
                ['Active Edition', manager.editionEngine.getEdition()],
                ['SHA-256 Checksum', archiveRes.checksum],
                ['Digital Signature', archiveRes.signature.slice(0, 32) + '...']
            ];

            const tableStr = renderTable('EAORCS REGISTRY ARCHIVE SNAPSHOT CREATED', tableRows);
            if (!options.silent) console.log(tableStr);
            return { success: true, command: 'registry_archive', result: archiveRes, table: tableStr };
        }

        // 4. Registry Rollback Command: eaorcs registry rollback [--snapshot=<id>]
        if ((mainCmd === 'registry' && subCmd === 'rollback') || (mainCmd === 'rollback')) {
            const snapshotId = flags.snapshot || flags.id || (mainCmd === 'rollback' ? subCmd : positional[2]);
            if (!snapshotId) {
                const errRows = [
                    ['Action', 'registry rollback'],
                    ['Status', 'FAILED'],
                    ['Reason', 'Missing required --snapshot=<id> argument.'],
                    ['Usage', 'eaorcs registry rollback --snapshot=<snapshot_id>']
                ];
                const errTable = renderTable('EAORCS REGISTRY ROLLBACK ERROR', errRows);
                if (!options.silent) console.error(errTable);
                if (!options.silent) process.exit(1);
                return { success: false, command: 'registry_rollback', error: 'Missing snapshot id', table: errTable };
            }

            const rollbackRes = manager.rollback(snapshotId, 'CLI_OPERATOR');

            const tableRows = [
                ['Restored Snapshot', rollbackRes.snapshotId],
                ['Restored At', rollbackRes.restoredAt],
                ['Operator', rollbackRes.operator],
                ['Active Edition', manager.editionEngine.getEdition()],
                ['Registry Name', rollbackRes.restoredState.name || 'EAORCS Governance Registry'],
                ['Registry Status', rollbackRes.restoredState.status || 'ACTIVE']
            ];

            const tableStr = renderTable('EAORCS REGISTRY ROLLBACK COMPLETED SUCCESSFULLY', tableRows);
            if (!options.silent) console.log(tableStr);
            return { success: true, command: 'registry_rollback', result: rollbackRes, table: tableStr };
        }

        // 5. Registry Verify Command: eaorcs registry verify
        if ((mainCmd === 'registry' && subCmd === 'verify') || (mainCmd === 'verify')) {
            const verifyReport = manager.verify();

            const tableRows = [
                ['Active Registry Integrity', verifyReport.activeRegistryValid ? 'VALID (PASSED)' : 'INVALID (CORRUPTED)'],
                ['Total Snapshots Scanned', String(verifyReport.totalSnapshots)],
                ['Valid Snapshots Count', String(verifyReport.validSnapshotsCount)],
                ['Corrupted Snapshots Count', String(verifyReport.corruptedSnapshots.length)],
                ['Cryptographic Signature Protocol', 'SHA-256 HMAC (Frozen)'],
                ['Overall Integrity Status', verifyReport.valid ? 'PASSED (SECURE)' : 'FAILED (CORRUPTED)']
            ];

            const tableStr = renderTable('EAORCS REGISTRY & SNAPSHOT INTEGRITY VERIFICATION REPORT', tableRows);
            if (!options.silent) console.log(tableStr);

            if (verifyReport.corruptedSnapshots.length > 0) {
                const headers = ['Snapshot ID', 'File', 'Corrupted Reason'];
                const rows = verifyReport.corruptedSnapshots.map(c => [c.snapshotId, c.file, c.reason]);
                const errGrid = renderGridTable('CORRUPTED SNAPSHOT DETAILED LOG', headers, rows);
                if (!options.silent) console.error('\n' + errGrid);
            }

            return { success: verifyReport.valid, command: 'registry_verify', result: verifyReport, table: tableStr };
        }

        // 6. Registry Status Command: eaorcs registry status [--edition=community|professional|enterprise|sovereign]
        if ((mainCmd === 'registry' && subCmd === 'status') || mainCmd === 'status' || mainCmd === 'registry') {
            const activeState = manager.getActiveState();
            const verifyReport = manager.verify();
            const currentEd = manager.editionEngine.getEdition();
            const entitlements = manager.editionEngine.getEntitlements();

            // Table 1: Registry Master Status
            const statusRows = [
                ['Registry ID', activeState.registryId || 'REG-EAORCS-001'],
                ['Registry Name', activeState.name || 'EAORCS Master Governance Registry'],
                ['Registry Version', activeState.version || '2026.1.0'],
                ['Registry Status', activeState.status || 'ACTIVE'],
                ['Active Edition Tier', currentEd],
                ['Legal Hold Status', manager.isLegalHoldActive() ? 'ACTIVE (SOVEREIGN)' : 'INACTIVE'],
                ['Audit Run Count', String(activeState.auditRunCount || 0)],
                ['Last Reset Mode', activeState.lastReset ? activeState.lastReset.mode : 'NONE'],
                ['Last Reset Timestamp', activeState.lastReset ? activeState.lastReset.timestamp : 'N/A']
            ];

            const statusTable = renderTable('EAORCS REGISTRY MASTER STATUS', statusRows);

            // Table 2: Edition Entitlements Matrix
            const entitlementHeaders = ['Feature / Capability', 'Min Edition Required', 'Active Tier Status'];
            const allFeatures = Object.entries(EditionEngine.FEATURE_MIN_EDITIONS);
            const entitlementRows = allFeatures.map(([feat, reqEd]) => {
                const allowed = EditionEngine.satisfiesEdition(currentEd, reqEd);
                return [
                    feat,
                    reqEd,
                    allowed ? 'ENABLED' : `GATED (Requires ${reqEd})`
                ];
            });

            const entitlementGrid = renderGridTable(`EDITION CAPABILITIES & ENTITLEMENTS MATRIX [ACTIVE: ${currentEd}]`, entitlementHeaders, entitlementRows);

            // Table 3: Snapshot History & Integrity Summary
            const historyCount = fs.existsSync(manager.historyDir) ? fs.readdirSync(manager.historyDir).filter(f => f.endsWith('.json')).length : 0;
            const historyRows = [
                ['Total History Snapshots', String(historyCount)],
                ['Active State Checksum Valid', verifyReport.activeRegistryValid ? 'YES' : 'NO'],
                ['Snapshot Checksums Valid', verifyReport.corruptedSnapshots.length === 0 ? 'YES' : 'NO'],
                ['Overall Cryptographic Integrity', verifyReport.valid ? 'PASSED (VERIFIED)' : 'FAILED (CORRUPTED)']
            ];
            const historyTable = renderTable('REGISTRY SNAPSHOT HISTORY & INTEGRITY SUMMARY', historyRows);

            if (!options.silent) {
                console.log(statusTable + '\n');
                console.log(entitlementGrid + '\n');
                console.log(historyTable);
            }

            return {
                success: true,
                command: 'registry_status',
                activeState,
                edition: currentEd,
                entitlements,
                verifyReport,
                tables: { statusTable, entitlementGrid, historyTable }
            };
        }

        throw new Error(`Unknown CLI command: '${mainCmd} ${subCmd}'. Use 'eaorcs --help' to see available commands.`);

    } catch (err) {
        if (err instanceof EditionGatingError) {
            handleEditionError(err, `${mainCmd} ${subCmd}`.trim());
        } else {
            console.error(`Error: ${err.message}`);
        }
        if (!options.silent) process.exit(1);
        return { success: false, error: err.message };
    }
}

// Auto-execute CLI if script is run directly from terminal
if (require.main === module) {
    executeRegistryCli();
}

module.exports = {
    executeRegistryCli,
    parseArgs,
    renderTable,
    renderGridTable,
    printHelp,
    RegistryLifecycleManager,
    EditionEngine,
    EDITIONS,
    RESET_MODES,
    EditionGatingError
};
