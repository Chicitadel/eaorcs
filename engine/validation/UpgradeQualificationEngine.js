/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Upgrade Qualification Engine
 * File           : UpgradeQualificationEngine.js
 * Version        : 2026.3.1-LTS
 * Author         : Ujomor Systems & Enterprise Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-07
 * Last Modified  : 2026-08-07
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance: Security Reviewed | Architecture Controlled | Protocol Frozen
 * Standards: ISO 27001 | SOC 2 | OWASP ASVS | NIST
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const crypto = require('crypto');

class UpgradeQualificationEngine {
    constructor() {
        this.versions = new Map();
        this.results = new Map();
        this._registerDefaultVersions();
    }

    _registerDefaultVersions() {
        const defaults = [
            { version: 'v2026.1.0', releaseDate: '2026-01-15', schemaVersion: 1 },
            { version: 'v2026.2.0', releaseDate: '2026-03-01', schemaVersion: 2 },
            { version: 'v2026.3.0', releaseDate: '2026-06-01', schemaVersion: 3 },
            { version: 'v2026.3.1-LTS', releaseDate: '2026-08-07', schemaVersion: 3 }
        ];
        for (const item of defaults) {
            this.versions.set(item.version, item);
        }
    }

    registerVersion(version, releaseDate, schemaVersion) {
        this.versions.set(version, { version, releaseDate, schemaVersion });
        return { registered: true, version };
    }

    buildUpgradePath(fromVersion, toVersion) {
        const verKeys = Array.from(this.versions.keys());
        const fromIdx = verKeys.indexOf(fromVersion);
        const toIdx = verKeys.indexOf(toVersion);

        if (fromIdx === -1 || toIdx === -1) {
            return { error: `Version not found in path: ${fromVersion} -> ${toVersion}` };
        }

        if (fromIdx > toIdx) {
            return { error: `Downgrade path requested: ${fromVersion} to ${toVersion}` };
        }

        const path = verKeys.slice(fromIdx, toIdx + 1);
        return {
            fromVersion,
            toVersion,
            path,
            stepCount: path.length - 1
        };
    }

    validateUpgradePath(fromVersion, toVersion) {
        const res = this.buildUpgradePath(fromVersion, toVersion);
        if (res.error) {
            return { valid: false, path: [], unqualifiedSteps: [res.error] };
        }

        return {
            valid: true,
            path: res.path,
            unqualifiedSteps: []
        };
    }

    runUpgradeScenario(fromVersion, toVersion, migrationFn) {
        const start = Date.now();
        let passed = true;

        if (migrationFn) {
            try {
                const fnRes = migrationFn(fromVersion, toVersion);
                passed = fnRes ? fnRes.success !== false : true;
            } catch (e) {
                passed = false;
            }
        }

        const durationMs = Date.now() - start;

        return {
            passed,
            fromVersion,
            toVersion,
            durationMs,
            stepsCompleted: [fromVersion, toVersion],
            dataLoss: false
        };
    }

    recordUpgradeResult(fromVersion, toVersion, result) {
        const key = `${fromVersion}->${toVersion}`;
        const rec = { key, fromVersion, toVersion, result, recordedAt: new Date().toISOString() };
        this.results.set(key, rec);
        return { recorded: true, key, recordedAt: rec.recordedAt };
    }

    getUpgradeMatrix() {
        const verKeys = Array.from(this.versions.keys());
        const matrix = {};

        for (const f of verKeys) {
            matrix[f] = {};
            for (const t of verKeys) {
                const fIdx = verKeys.indexOf(f);
                const tIdx = verKeys.indexOf(t);
                if (fIdx === tIdx) matrix[f][t] = 'SAME';
                else if (fIdx < tIdx) matrix[f][t] = 'QUALIFIED';
                else matrix[f][t] = 'NOT_QUALIFIED';
            }
        }

        return {
            versions: verKeys,
            matrix
        };
    }

    generateUpgradeReport(fromVersion, toVersion) {
        const pathRes = this.validateUpgradePath(fromVersion, toVersion);
        const evidenceHash = crypto.createHash('sha256')
            .update(JSON.stringify({ fromVersion, toVersion, pathRes }))
            .digest('hex');

        return {
            reportId: crypto.randomBytes(8).toString('hex'),
            fromVersion,
            toVersion,
            path: pathRes.path,
            qualified: pathRes.valid,
            evidenceHash
        };
    }
}

module.exports = UpgradeQualificationEngine;
