/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Baseline Comparison Engine (Stream 1)
 * File           : BaselineComparisonEngine.js
 * Version        : 2026.1-LTS (v1.0.0-FROZEN)
 * Author         : Architectural Governance Council & Ujomor Systems Engineering
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
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
 * Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const crypto = require('crypto');
const { AuditManifestEngine } = require('./AuditManifestEngine');

/**
 * Baseline comparison verdict constants.
 */
const VERDICTS = Object.freeze({
    PASS: 'PASS',
    IMPROVED: 'IMPROVED',
    DEGRADED: 'DEGRADED',
    CRITICAL_REGRESSION: 'CRITICAL_REGRESSION',
    UNCHANGED: 'UNCHANGED'
});

/**
 * Drift severity thresholds.
 */
const DRIFT_SEVERITIES = Object.freeze({
    NONE: 'NONE',
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL'
});

/**
 * BaselineComparisonEngine
 * Compares an audit run against a baseline release or previous audit run,
 * producing detailed score diffs, security deltas, performance deltas, and file lineage drift deltas.
 */
class BaselineComparisonEngine {
    /**
     * Constructs a BaselineComparisonEngine instance.
     * @param {Object} [options={}] Configuration and tolerance thresholds.
     * @param {number} [options.criticalScoreDropThreshold=5.0] Maximum score drop before critical verdict.
     * @param {number} [options.degradedScoreDropThreshold=1.0] Score drop before degraded verdict.
     * @param {AuditManifestEngine} [options.manifestEngine] Manifest engine helper instance.
     */
    constructor(options = {}) {
        this.options = options;
        this.criticalScoreDropThreshold = options.criticalScoreDropThreshold ?? 5.0;
        this.degradedScoreDropThreshold = options.degradedScoreDropThreshold ?? 1.0;
        this.manifestEngine = options.manifestEngine || new AuditManifestEngine();
    }

    /**
     * Compares an audit run manifest against a baseline release manifest.
     * @param {Object|string} currentRun Manifest object or file path for the current audit run.
     * @param {Object|string} baselineRun Manifest object or file path for the baseline audit run.
     * @param {Object} [overrideOptions={}] Runtime comparison options.
     * @returns {Object} Complete baseline comparison report.
     */
    compareRuns(currentRun, baselineRun, overrideOptions = {}) {
        const currentManifest = this.manifestEngine.readManifest(currentRun);
        const baselineManifest = this.manifestEngine.readManifest(baselineRun);

        const opts = { ...this.options, ...overrideOptions };

        const scoreDiff = this.compareScore(
            currentManifest.summary || {},
            baselineManifest.summary || {}
        );

        const securityDelta = this.computeSecurityDelta(
            currentManifest.summary?.security_findings || currentManifest.summary?.categories?.security,
            baselineManifest.summary?.security_findings || baselineManifest.summary?.categories?.security,
            currentManifest,
            baselineManifest
        );

        const performanceDelta = this.computePerformanceDelta(
            currentManifest.summary?.performance_metrics || currentManifest.summary?.categories?.performance,
            baselineManifest.summary?.performance_metrics || baselineManifest.summary?.categories?.performance,
            currentManifest,
            baselineManifest
        );

        const driftDelta = this.computeDriftDelta(currentManifest, baselineManifest);

        const verdict = this.evaluateVerdict(scoreDiff, securityDelta, performanceDelta, driftDelta, opts);

        const comparisonReport = {
            comparison_id: `comp_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
            timestamp: new Date().toISOString(),
            current_run_id: currentManifest.run_id,
            baseline_run_id: baselineManifest.run_id,
            project_id: currentManifest.project_id,
            tenant_id: currentManifest.tenant_id,
            environment: currentManifest.environment,
            verdict,
            score_diff: scoreDiff,
            security_delta: securityDelta,
            performance_delta: performanceDelta,
            drift_delta: driftDelta,
            governance_summary: {
                baseline_timestamp: baselineManifest.timestamp,
                current_timestamp: currentManifest.timestamp,
                rule_version_sync: driftDelta.rule_version_changes.length === 0,
                plugin_hash_sync: driftDelta.plugin_hash_changes.length === 0,
                lineage_intact: driftDelta.drift_severity === DRIFT_SEVERITIES.NONE
            }
        };

        return Object.freeze(comparisonReport);
    }

    /**
     * Compares score summaries between current run and baseline run.
     * @param {Object} currentSummary Current run summary metrics.
     * @param {Object} baselineSummary Baseline run summary metrics.
     * @returns {Object} Score difference breakdown.
     */
    compareScore(currentSummary = {}, baselineSummary = {}) {
        const currentOverall = typeof currentSummary.overall_score === 'number' ? currentSummary.overall_score : 100.0;
        const baselineOverall = typeof baselineSummary.overall_score === 'number' ? baselineSummary.overall_score : 100.0;
        
        const scoreDelta = parseFloat((currentOverall - baselineOverall).toFixed(2));
        const pctChange = baselineOverall !== 0 
            ? parseFloat(((scoreDelta / baselineOverall) * 100).toFixed(2))
            : 0.0;

        const currentCats = currentSummary.categories || {};
        const baselineCats = baselineSummary.categories || {};
        
        const categoryDiffs = {};
        const allCatKeys = new Set([...Object.keys(currentCats), ...Object.keys(baselineCats)]);
        
        for (const cat of allCatKeys) {
            const currVal = typeof currentCats[cat] === 'number' ? currentCats[cat] : (typeof currentCats[cat] === 'object' ? currentCats[cat].score ?? 100 : 100);
            const baseVal = typeof baselineCats[cat] === 'number' ? baselineCats[cat] : (typeof baselineCats[cat] === 'object' ? baselineCats[cat].score ?? 100 : 100);
            categoryDiffs[cat] = parseFloat((currVal - baseVal).toFixed(2));
        }

        const passedRulesDiff = (currentSummary.passed_rules || 0) - (baselineSummary.passed_rules || 0);
        const failedRulesDiff = (currentSummary.failed_rules || 0) - (baselineSummary.failed_rules || 0);
        const warningRulesDiff = (currentSummary.warning_rules || 0) - (baselineSummary.warning_rules || 0);

        return {
            current_score: currentOverall,
            baseline_score: baselineOverall,
            score_delta: scoreDelta,
            percentage_change: pctChange,
            category_diffs: categoryDiffs,
            rules_diff: {
                passed_delta: passedRulesDiff,
                failed_delta: failedRulesDiff,
                warning_delta: warningRulesDiff
            }
        };
    }

    /**
     * Computes security finding differences and security health status.
     * @param {Object|number} currentSec Current security metric or finding object.
     * @param {Object|number} baselineSec Baseline security metric or finding object.
     * @param {Object} [currentManifest] Full current manifest.
     * @param {Object} [baselineManifest] Full baseline manifest.
     * @returns {Object} Security delta summary.
     */
    computeSecurityDelta(currentSec, baselineSec, currentManifest = {}, baselineManifest = {}) {
        const currScore = typeof currentSec === 'number' ? currentSec : (currentSec?.score ?? 100.0);
        const baseScore = typeof baselineSec === 'number' ? baselineSec : (baselineSec?.score ?? 100.0);
        const scoreDelta = parseFloat((currScore - baseScore).toFixed(2));

        const currCounts = typeof currentSec === 'object' && currentSec?.severities ? currentSec.severities : {
            CRITICAL: currentSec?.critical || 0,
            HIGH: currentSec?.high || 0,
            MEDIUM: currentSec?.medium || 0,
            LOW: currentSec?.low || 0
        };

        const baseCounts = typeof baselineSec === 'object' && baselineSec?.severities ? baselineSec.severities : {
            CRITICAL: baselineSec?.critical || 0,
            HIGH: baselineSec?.high || 0,
            MEDIUM: baselineSec?.medium || 0,
            LOW: baselineSec?.low || 0
        };

        const severityDiff = {
            CRITICAL: (currCounts.CRITICAL || 0) - (baseCounts.CRITICAL || 0),
            HIGH: (currCounts.HIGH || 0) - (baseCounts.HIGH || 0),
            MEDIUM: (currCounts.MEDIUM || 0) - (baseCounts.MEDIUM || 0),
            LOW: (currCounts.LOW || 0) - (baseCounts.LOW || 0)
        };

        let status = 'STABLE';
        if (severityDiff.CRITICAL > 0 || severityDiff.HIGH > 0) {
            status = 'CRITICAL_VULNERABILITY_ADDED';
        } else if (scoreDelta < -2.0) {
            status = 'DEGRADED';
        } else if (scoreDelta > 0.0 || (severityDiff.CRITICAL < 0 || severityDiff.HIGH < 0)) {
            status = 'IMPROVED';
        }

        return {
            current_security_score: currScore,
            baseline_security_score: baseScore,
            security_score_delta: scoreDelta,
            severity_diff: severityDiff,
            new_critical_vulnerabilities: Math.max(0, severityDiff.CRITICAL),
            new_high_vulnerabilities: Math.max(0, severityDiff.HIGH),
            status
        };
    }

    /**
     * Computes performance metric differences between current and baseline runs.
     * @param {Object|number} currentPerf Current performance metrics.
     * @param {Object|number} baselinePerf Baseline performance metrics.
     * @param {Object} [currentManifest] Full current manifest.
     * @param {Object} [baselineManifest] Full baseline manifest.
     * @returns {Object} Performance delta summary.
     */
    computePerformanceDelta(currentPerf, baselinePerf, currentManifest = {}, baselineManifest = {}) {
        const currScore = typeof currentPerf === 'number' ? currentPerf : (currentPerf?.score ?? 100.0);
        const baseScore = typeof baselinePerf === 'number' ? baselinePerf : (baselinePerf?.score ?? 100.0);
        const scoreDelta = parseFloat((currScore - baseScore).toFixed(2));

        const currentBytes = currentManifest.summary?.total_bytes || 0;
        const baselineBytes = baselineManifest.summary?.total_bytes || 0;
        const bytesDelta = currentBytes - baselineBytes;

        const currentFiles = currentManifest.summary?.total_files || 0;
        const baselineFiles = baselineManifest.summary?.total_files || 0;
        const filesDelta = currentFiles - baselineFiles;

        let status = 'STABLE';
        if (scoreDelta < -5.0) {
            status = 'DEGRADED';
        } else if (scoreDelta > 2.0) {
            status = 'IMPROVED';
        }

        return {
            current_performance_score: currScore,
            baseline_performance_score: baseScore,
            performance_score_delta: scoreDelta,
            total_bytes_delta: bytesDelta,
            total_files_delta: filesDelta,
            status
        };
    }

    /**
     * Computes lineage and file drift delta between current and baseline manifests.
     * @param {Object} currentManifest Current manifest object.
     * @param {Object} baselineManifest Baseline manifest object.
     * @returns {Object} Drift delta summary.
     */
    computeDriftDelta(currentManifest, baselineManifest) {
        const currFilesMap = currentManifest.checksums?.files_sha256 || {};
        const baseFilesMap = baselineManifest.checksums?.files_sha256 || {};

        const currFileKeys = Object.keys(currFilesMap);
        const baseFileKeys = Object.keys(baseFilesMap);

        const addedFiles = currFileKeys.filter(f => !Object.prototype.hasOwnProperty.call(baseFilesMap, f));
        const removedFiles = baseFileKeys.filter(f => !Object.prototype.hasOwnProperty.call(currFilesMap, f));
        
        const modifiedFiles = [];
        let unchangedCount = 0;

        for (const file of currFileKeys) {
            if (Object.prototype.hasOwnProperty.call(baseFilesMap, file)) {
                if (currFilesMap[file] !== baseFilesMap[file]) {
                    modifiedFiles.push({
                        file,
                        current_hash: currFilesMap[file],
                        baseline_hash: baseFilesMap[file]
                    });
                } else {
                    unchangedCount++;
                }
            }
        }

        const currRootHash = currentManifest.checksums?.root_sha256 || '';
        const baseRootHash = baselineManifest.checksums?.root_sha256 || '';
        const rootChecksumChanged = currRootHash !== baseRootHash;

        // Compare Rulepack Versions
        const currRules = currentManifest.rule_versions || {};
        const baseRules = baselineManifest.rule_versions || {};
        const ruleVersionChanges = [];
        const allRules = new Set([...Object.keys(currRules), ...Object.keys(baseRules)]);

        for (const ruleId of allRules) {
            const currV = currRules[ruleId] || 'ABSENT';
            const baseV = baseRules[ruleId] || 'ABSENT';
            if (currV !== baseV) {
                ruleVersionChanges.push({
                    rule_id: ruleId,
                    from_version: baseV,
                    to_version: currV
                });
            }
        }

        // Compare Plugin Hashes
        const currPlugins = currentManifest.plugin_hashes || {};
        const basePlugins = baselineManifest.plugin_hashes || {};
        const pluginHashChanges = [];
        const allPlugins = new Set([...Object.keys(currPlugins), ...Object.keys(basePlugins)]);

        for (const pluginId of allPlugins) {
            const currH = currPlugins[pluginId] || 'ABSENT';
            const baseH = basePlugins[pluginId] || 'ABSENT';
            if (currH !== baseH) {
                pluginHashChanges.push({
                    plugin_id: pluginId,
                    from_hash: baseH,
                    to_hash: currH
                });
            }
        }

        // Evaluate Drift Severity
        let driftSeverity = DRIFT_SEVERITIES.NONE;
        if (pluginHashChanges.length > 0 || ruleVersionChanges.some(r => r.from_version === 'ABSENT')) {
            driftSeverity = DRIFT_SEVERITIES.HIGH;
        } else if (modifiedFiles.length > 10 || removedFiles.length > 5) {
            driftSeverity = DRIFT_SEVERITIES.MEDIUM;
        } else if (addedFiles.length > 0 || modifiedFiles.length > 0 || removedFiles.length > 0) {
            driftSeverity = DRIFT_SEVERITIES.LOW;
        }

        return {
            added_files: addedFiles,
            removed_files: removedFiles,
            modified_files: modifiedFiles,
            unchanged_files_count: unchangedCount,
            root_checksum_changed: rootChecksumChanged,
            rule_version_changes: ruleVersionChanges,
            plugin_hash_changes: pluginHashChanges,
            drift_severity: driftSeverity
        };
    }

    /**
     * Evaluates final verdict for comparison report.
     * @param {Object} scoreDiff Score diff result.
     * @param {Object} securityDelta Security delta result.
     * @param {Object} performanceDelta Performance delta result.
     * @param {Object} driftDelta Drift delta result.
     * @param {Object} options Tolerance thresholds options.
     * @returns {string} Verdict string.
     */
    evaluateVerdict(scoreDiff, securityDelta, performanceDelta, driftDelta, options = {}) {
        const critThreshold = options.criticalScoreDropThreshold ?? this.criticalScoreDropThreshold;
        const degThreshold = options.degradedScoreDropThreshold ?? this.degradedScoreDropThreshold;

        if (securityDelta.status === 'CRITICAL_VULNERABILITY_ADDED' || securityDelta.new_critical_vulnerabilities > 0) {
            return VERDICTS.CRITICAL_REGRESSION;
        }

        if (scoreDiff.score_delta < -critThreshold) {
            return VERDICTS.CRITICAL_REGRESSION;
        }

        if (scoreDiff.score_delta < -degThreshold || performanceDelta.status === 'DEGRADED') {
            return VERDICTS.DEGRADED;
        }

        if (scoreDiff.score_delta > degThreshold || securityDelta.status === 'IMPROVED') {
            return VERDICTS.IMPROVED;
        }

        if (
            scoreDiff.score_delta === 0 &&
            !driftDelta.root_checksum_changed &&
            driftDelta.rule_version_changes.length === 0 &&
            driftDelta.plugin_hash_changes.length === 0
        ) {
            return VERDICTS.UNCHANGED;
        }

        return VERDICTS.PASS;
    }
}

BaselineComparisonEngine.VERDICTS = VERDICTS;
BaselineComparisonEngine.DRIFT_SEVERITIES = DRIFT_SEVERITIES;

module.exports = {
    BaselineComparisonEngine,
    VERDICTS,
    DRIFT_SEVERITIES
};
