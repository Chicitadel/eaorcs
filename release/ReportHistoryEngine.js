/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Report History Engine
 * File           : ReportHistoryEngine.js
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
 * CORP: Subsystem 1 — Report History Engine
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

/**
 * Retention Policy constants in milliseconds.
 * - Community: 30 days
 * - Professional: 365 days
 * - Enterprise: Unlimited (Infinity)
 * - Sovereign: Unlimited (Infinity)
 */
const RETENTION_POLICIES = {
    Community: 30 * 24 * 60 * 60 * 1000,
    Professional: 365 * 24 * 60 * 60 * 1000,
    Enterprise: Infinity,
    Sovereign: Infinity
};

class ReportHistoryEngine {
    /**
     * Initializes the Report History Engine.
     * @param {Object} config Configuration options
     * @param {string} [config.workspaceRoot] Path to EAORCS root directory
     * @param {string} [config.reportsDir] Custom path to reports directory
     */
    constructor(config = {}) {
        this.workspaceRoot = config.workspaceRoot || path.resolve(__dirname, '../../');
        this.reportsDir = config.reportsDir || path.join(this.workspaceRoot, 'reports');
        this.indexFilePath = path.join(this.reportsDir, 'index.json');
        this.historyDir = path.join(this.reportsDir, 'history');
        this.retentionPolicies = Object.assign({}, RETENTION_POLICIES, config.retentionPolicies || {});

        this._ensureDirectories();
    }

    /**
     * Ensures required directories exist on disk.
     * @private
     */
    _ensureDirectories() {
        if (!fs.existsSync(this.reportsDir)) {
            fs.mkdirSync(this.reportsDir, { recursive: true });
        }
        if (!fs.existsSync(this.historyDir)) {
            fs.mkdirSync(this.historyDir, { recursive: true });
        }
    }

    /**
     * Loads the central reports index file.
     * @private
     * @returns {Object} Central index structure
     */
    _loadIndex() {
        if (!fs.existsSync(this.indexFilePath)) {
            return { reports: [], lastUpdated: new Date().toISOString() };
        }
        try {
            const raw = fs.readFileSync(this.indexFilePath, 'utf8');
            const data = JSON.parse(raw);
            if (!Array.isArray(data.reports)) {
                data.reports = [];
            }
            return data;
        } catch (err) {
            return { reports: [], lastUpdated: new Date().toISOString() };
        }
    }

    /**
     * Saves the central reports index file atomically.
     * @private
     * @param {Object} indexData Central index structure
     */
    _saveIndex(indexData) {
        this._ensureDirectories();
        indexData.lastUpdated = new Date().toISOString();
        const content = JSON.stringify(indexData, null, 2);
        const tempPath = `${this.indexFilePath}.${crypto.randomBytes(4).toString('hex')}.tmp`;
        fs.writeFileSync(tempPath, content, 'utf8');
        fs.renameSync(tempPath, this.indexFilePath);
    }

    /**
     * Formats a date object into YYYY, MM, DD, HHMMSS components.
     * @private
     * @param {Date} date Date instance
     * @returns {Object} Date path components
     */
    _formatDateComponents(date) {
        const yyyy = date.getUTCFullYear().toString();
        const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(date.getUTCDate()).padStart(2, '0');
        const hh = String(date.getUTCHours()).padStart(2, '0');
        const min = String(date.getUTCMinutes()).padStart(2, '0');
        const ss = String(date.getUTCSeconds()).padStart(2, '0');
        return {
            yyyy,
            mm,
            dd,
            hhmmss: `${hh}${min}${ss}`
        };
    }

    /**
     * Archives a report into standard timestamped history and updates index.json.
     * Archive Path format: reports/history/YYYY/MM/DD/report_HHMMSS.json
     * 
     * @param {Object} reportData Data payload for the report
     * @param {string|Object} [tierOrOptions='Community'] Tier name ('Community', 'Professional', 'Enterprise', 'Sovereign') or options object
     * @returns {Object} Metadata record of the archived report
     */
    archiveReport(reportData = {}, tierOrOptions = 'Community') {
        let tier = 'Community';
        let customOptions = {};

        if (typeof tierOrOptions === 'string') {
            tier = tierOrOptions;
        } else if (typeof tierOrOptions === 'object' && tierOrOptions !== null) {
            customOptions = tierOrOptions;
            tier = customOptions.tier || reportData.tier || 'Community';
        } else if (reportData.tier) {
            tier = reportData.tier;
        }

        if (!this.retentionPolicies.hasOwnProperty(tier)) {
            tier = 'Community';
        }

        const now = customOptions.timestamp ? new Date(customOptions.timestamp) : new Date();
        const { yyyy, mm, dd, hhmmss } = this._formatDateComponents(now);

        const relativeDirPath = path.join('reports', 'history', yyyy, mm, dd);
        const absoluteDirPath = path.join(this.historyDir, yyyy, mm, dd);
        if (!fs.existsSync(absoluteDirPath)) {
            fs.mkdirSync(absoluteDirPath, { recursive: true });
        }

        let filename = `report_${hhmmss}.json`;
        let absoluteFilePath = path.join(absoluteDirPath, filename);

        // Handle collision within same second
        if (fs.existsSync(absoluteFilePath)) {
            const hex = crypto.randomBytes(2).toString('hex');
            filename = `report_${hhmmss}_${hex}.json`;
            absoluteFilePath = path.join(absoluteDirPath, filename);
        }

        const relativeFilePath = path.join(relativeDirPath, filename).replace(/\\/g, '/');

        const reportId = reportData.reportId || reportData.id || `REP-${now.getTime()}-${crypto.randomBytes(3).toString('hex')}`;
        const title = reportData.title || reportData.name || customOptions.title || `Report ${reportId}`;

        const payload = {
            reportId,
            title,
            tier,
            timestamp: now.toISOString(),
            data: reportData,
            metadata: {
                archivedAt: new Date().toISOString(),
                retentionPolicy: tier,
                relativeFilePath
            }
        };

        const jsonString = JSON.stringify(payload, null, 2);
        fs.writeFileSync(absoluteFilePath, jsonString, 'utf8');

        const indexRecord = {
            id: reportId,
            reportId,
            title,
            tier,
            timestamp: now.toISOString(),
            filePath: relativeFilePath,
            fullPath: absoluteFilePath,
            sizeBytes: Buffer.byteLength(jsonString, 'utf8')
        };

        const indexData = this._loadIndex();
        // Update or append
        const existingIdx = indexData.reports.findIndex(r => r.reportId === reportId);
        if (existingIdx >= 0) {
            indexData.reports[existingIdx] = indexRecord;
        } else {
            indexData.reports.push(indexRecord);
        }
        this._saveIndex(indexData);

        if (!customOptions.skipRetention) {
            this.enforceRetentionPolicy(tier);
        }

        return indexRecord;
    }

    /**
     * Enforces retention policy limits for all archived reports or a specific tier.
     * Expired report files are purged from disk and removed from index.json.
     * 
     * @param {string} [targetTier] Optional tier to restrict enforcement
     * @returns {Object} Summary of retention enforcement
     */
    enforceRetentionPolicy(targetTier = null) {
        const indexData = this._loadIndex();
        const now = Date.now();
        const purgedReports = [];
        const remainingReports = [];

        for (const record of indexData.reports) {
            const tier = record.tier || 'Community';
            if (targetTier && tier !== targetTier) {
                remainingReports.push(record);
                continue;
            }

            const retentionMs = this.retentionPolicies[tier] !== undefined 
                ? this.retentionPolicies[tier] 
                : RETENTION_POLICIES.Community;

            if (retentionMs === Infinity) {
                remainingReports.push(record);
                continue;
            }

            const recordTime = new Date(record.timestamp).getTime();
            const ageMs = now - recordTime;

            if (ageMs > retentionMs) {
                // Purge file
                let fullPath = record.fullPath;
                if (!fullPath && record.filePath) {
                    fullPath = path.join(this.workspaceRoot, record.filePath);
                }
                if (fullPath && fs.existsSync(fullPath)) {
                    try {
                        fs.unlinkSync(fullPath);
                    } catch (e) {
                        // ignore deletion errors
                    }
                }
                purgedReports.push(record);
            } else {
                remainingReports.push(record);
            }
        }

        if (purgedReports.length > 0) {
            indexData.reports = remainingReports;
            this._saveIndex(indexData);
        }

        return {
            purgedCount: purgedReports.length,
            purgedReports,
            remainingCount: remainingReports.length
        };
    }

    /**
     * Retrieves report history records from index.json matching optional criteria.
     * Automatically applies retention enforcement.
     * 
     * @param {Object} [options={}] Filter options
     * @param {string} [options.tier] Filter by retention tier
     * @param {string} [options.startDate] Filter start ISO date string
     * @param {string} [options.endDate] Filter end ISO date string
     * @param {string} [options.query] Substring search on title/reportId
     * @param {number} [options.limit] Maximum records to return
     * @returns {Array<Object>} List of report metadata records
     */
    getReportHistory(options = {}) {
        if (!options.skipRetention) {
            this.enforceRetentionPolicy(options.tier || null);
        }
        const indexData = this._loadIndex();
        let records = indexData.reports || [];

        if (options.tier) {
            records = records.filter(r => r.tier === options.tier);
        }

        if (options.startDate) {
            const startMs = new Date(options.startDate).getTime();
            records = records.filter(r => new Date(r.timestamp).getTime() >= startMs);
        }

        if (options.endDate) {
            const endMs = new Date(options.endDate).getTime();
            records = records.filter(r => new Date(r.timestamp).getTime() <= endMs);
        }

        if (options.query) {
            const q = options.query.toLowerCase();
            records = records.filter(r => 
                (r.title && r.title.toLowerCase().includes(q)) || 
                (r.reportId && r.reportId.toLowerCase().includes(q))
            );
        }

        // Sort descending by timestamp
        records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        if (typeof options.limit === 'number' && options.limit > 0) {
            records = records.slice(0, options.limit);
        }

        return records;
    }

    /**
     * Loads a historical report from disk by reportId or filepath.
     * 
     * @param {string} reportId Unique ID of report or relative/absolute file path
     * @returns {Object|null} Full report payload or null if not found
     */
    loadHistoricalReport(reportId) {
        if (!reportId) return null;

        const indexData = this._loadIndex();
        const record = indexData.reports.find(r => r.reportId === reportId || r.id === reportId || r.filePath === reportId);

        let targetPath = null;

        if (record) {
            if (record.fullPath && fs.existsSync(record.fullPath)) {
                targetPath = record.fullPath;
            } else if (record.filePath) {
                const resolved = path.resolve(this.workspaceRoot, record.filePath);
                if (fs.existsSync(resolved)) {
                    targetPath = resolved;
                }
            }
        }

        // Fallback direct path check if reportId is a file path
        if (!targetPath) {
            const directPath = path.isAbsolute(reportId) ? reportId : path.resolve(this.workspaceRoot, reportId);
            if (fs.existsSync(directPath)) {
                targetPath = directPath;
            }
        }

        if (!targetPath || !fs.existsSync(targetPath)) {
            return null;
        }

        try {
            const content = fs.readFileSync(targetPath, 'utf8');
            return JSON.parse(content);
        } catch (err) {
            return null;
        }
    }
}

module.exports = ReportHistoryEngine;
