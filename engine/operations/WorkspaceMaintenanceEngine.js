/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Workspace Maintenance Engine
 * File           : WorkspaceMaintenanceEngine.js
 * Version        : 2026.3.1-LTS
 * Author         : Ujomor Systems & Enterprise Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-07
 * Last Modified  : 2026-08-07
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 * - Corporate Policy Governed
 *
 * CORP: Subsystem 1 — Workspace Maintenance Engine
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ReportHistoryEngine = require('../governance/ReportHistoryEngine');

class WorkspaceMaintenanceEngine {
    /**
     * Initializes the Workspace Maintenance Engine.
     * @param {Object} [config={}] Configuration options
     * @param {string} [config.workspaceRoot] Absolute path to workspace root
     * @param {ReportHistoryEngine} [config.reportHistoryEngine] Instance of ReportHistoryEngine
     */
    constructor(config = {}) {
        this.workspaceRoot = config.workspaceRoot || path.resolve(__dirname, '../../');
        this.reportsEngine = config.reportHistoryEngine || new ReportHistoryEngine({ workspaceRoot: this.workspaceRoot });
        this.configDir = path.join(this.workspaceRoot, 'config');
        this.reportsDir = path.join(this.workspaceRoot, 'reports');

        this.cacheDirs = [
            path.join(this.workspaceRoot, '.cache'),
            path.join(this.workspaceRoot, '.eaorcs_cache'),
            path.join(this.workspaceRoot, 'tmp', 'cache')
        ];
    }

    /**
     * Resets workspace layout definitions to default baseline state.
     * Clears cached layout states in config and layout cache files.
     * 
     * @returns {Object} Result of layout reset operation
     */
    resetLayout() {
        const layoutConfigPath = path.join(this.configDir, 'layout.json');
        const layoutCachePath = path.join(this.workspaceRoot, '.layout_cache');

        const defaultLayout = {
            version: '2026.3.1-LTS',
            activePreset: 'default',
            panels: {
                sidebar: { visible: true, width: 280, position: 'left' },
                terminal: { visible: true, height: 240, position: 'bottom' },
                editor: { activeTab: null, split: 'none' },
                governanceDashboard: { visible: true, collapsed: false }
            },
            theme: 'enterprise-dark',
            lastReset: new Date().toISOString()
        };

        const resetItems = [];

        try {
            if (!fs.existsSync(this.configDir)) {
                fs.mkdirSync(this.configDir, { recursive: true });
            }

            fs.writeFileSync(layoutConfigPath, JSON.stringify(defaultLayout, null, 2), 'utf8');
            resetItems.push('config/layout.json');

            if (fs.existsSync(layoutCachePath)) {
                fs.unlinkSync(layoutCachePath);
                resetItems.push('.layout_cache');
            }
        } catch (err) {
            return {
                success: false,
                timestamp: new Date().toISOString(),
                error: err.message,
                resetItems
            };
        }

        return {
            success: true,
            timestamp: new Date().toISOString(),
            action: 'resetLayout',
            resetItems,
            defaultLayout
        };
    }

    /**
     * Clears local temporary cache files and directories in the workspace.
     * 
     * @returns {Object} Summary of cleared cache directories and files
     */
    clearLocalCache() {
        const clearedDirectories = [];
        let deletedFilesCount = 0;

        for (const cacheDir of this.cacheDirs) {
            if (fs.existsSync(cacheDir)) {
                try {
                    this._deleteRecursive(cacheDir);
                    clearedDirectories.push(path.relative(this.workspaceRoot, cacheDir));
                    deletedFilesCount++;
                } catch (err) {
                    // Ignore deletion failures
                }
            }
        }

        // Clean standalone temporary files in workspace root or tmp folder
        const tmpDir = path.join(this.workspaceRoot, 'tmp');
        if (fs.existsSync(tmpDir)) {
            try {
                const entries = fs.readdirSync(tmpDir);
                for (const entry of entries) {
                    // Avoid removing test suite temp directories if currently active, only remove .tmp or .cache files
                    if (entry.endsWith('.tmp') || entry.endsWith('.cache')) {
                        const targetPath = path.join(tmpDir, entry);
                        fs.unlinkSync(targetPath);
                        deletedFilesCount++;
                    }
                }
                clearedDirectories.push('tmp');
            } catch (e) {
                // Ignore
            }
        }

        return {
            success: true,
            timestamp: new Date().toISOString(),
            action: 'clearLocalCache',
            clearedDirectories,
            deletedFilesCount
        };
    }

    /**
     * Helper to recursively delete files and directories.
     * @private
     * @param {string} targetPath Absolute path to file or directory
     */
    _deleteRecursive(targetPath) {
        if (fs.existsSync(targetPath)) {
            const stat = fs.statSync(targetPath);
            if (stat.isDirectory()) {
                const files = fs.readdirSync(targetPath);
                for (const file of files) {
                    const curPath = path.join(targetPath, file);
                    this._deleteRecursive(curPath);
                }
                fs.rmdirSync(targetPath);
            } else {
                fs.unlinkSync(targetPath);
            }
        }
    }

    /**
     * Scans for unarchived or completed reports in pending/active directories and archives them.
     * 
     * @param {Object} [options={}] Additional options for archiving
     * @param {string} [options.tier='Community'] Default retention tier for completed reports
     * @returns {Object} Result of report archiving operation
     */
    archiveCompletedReports(options = {}) {
        const tier = options.tier || 'Community';
        const pendingDirs = [
            path.join(this.reportsDir, 'pending'),
            path.join(this.reportsDir, 'active'),
            path.join(this.reportsDir, 'completed')
        ];

        const archivedReports = [];

        for (const dir of pendingDirs) {
            if (fs.existsSync(dir)) {
                try {
                    const files = fs.readdirSync(dir);
                    for (const file of files) {
                        if (file.endsWith('.json')) {
                            const fullPath = path.join(dir, file);
                            try {
                                const content = fs.readFileSync(fullPath, 'utf8');
                                const reportData = JSON.parse(content);
                                const record = this.reportsEngine.archiveReport(reportData, tier);
                                archivedReports.push(record);
                                fs.unlinkSync(fullPath);
                            } catch (e) {
                                // Skip malformed files
                            }
                        }
                    }
                } catch (e) {
                    // Ignore directory read errors
                }
            }
        }

        return {
            success: true,
            timestamp: new Date().toISOString(),
            action: 'archiveCompletedReports',
            archivedCount: archivedReports.length,
            archivedReports
        };
    }

    /**
     * Performs a comprehensive reset of workspace operational state.
     * Executes resetLayout(), clearLocalCache(), archiveCompletedReports(), and cleans state markers.
     * 
     * @returns {Object} Combined workspace reset report
     */
    resetWorkspaceState() {
        const layoutResult = this.resetLayout();
        const cacheResult = this.clearLocalCache();
        const reportsResult = this.archiveCompletedReports();

        // Clean lock/state marker files
        const stateMarkers = [
            path.join(this.workspaceRoot, '.workspace_state.json'),
            path.join(this.workspaceRoot, '.eaorcs_lock')
        ];
        const cleanedMarkers = [];

        for (const marker of stateMarkers) {
            if (fs.existsSync(marker)) {
                try {
                    fs.unlinkSync(marker);
                    cleanedMarkers.push(path.basename(marker));
                } catch (e) {
                    // Ignore
                }
            }
        }

        return {
            success: layoutResult.success && cacheResult.success && reportsResult.success,
            timestamp: new Date().toISOString(),
            action: 'resetWorkspaceState',
            cleanedMarkers,
            results: {
                layout: layoutResult,
                cache: cacheResult,
                reports: reportsResult
            }
        };
    }
}

module.exports = WorkspaceMaintenanceEngine;
