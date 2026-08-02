/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS AI Precision & Recall Benchmark Suite
 * File           : AiPrecisionRecallBenchmark.js
 * Version        : 2026.1-LTS (v1.1.0)
 * Author         : Enterprise Architecture Authority & AI Benchmark Team
 * Organization   : Ujomor Systems & Enterprise Governance Authority
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | RESTRICTED
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
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance Authority
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Built-in Gold Standard Benchmark Datasets
 */
const GOLD_STANDARD_DATASETS = Object.freeze({
    'requirement_extraction_v1': [
        { id: 'REQ-001', text: 'System must encrypt data at rest using AES-256-GCM', category: 'SECURITY', isRelevant: true },
        { id: 'REQ-002', text: 'System must enforce MFA for all privileged access', category: 'SECURITY', isRelevant: true },
        { id: 'REQ-003', text: 'User interface background color should match brand hex code', category: 'UI_STYLE', isRelevant: false },
        { id: 'REQ-004', text: 'System must log all security events to immutable audit trail', category: 'AUDIT', isRelevant: true },
        { id: 'REQ-005', text: 'System latency must not exceed 100ms at p99', category: 'PERFORMANCE', isRelevant: true },
        { id: 'REQ-006', text: 'Engineering teams prefer morning standalone syncs', category: 'DEVOPS_NOTE', isRelevant: false },
        { id: 'REQ-007', text: 'System must maintain zero external npm dependencies', category: 'ARCHITECTURE', isRelevant: true },
        { id: 'REQ-008', text: 'System must support LSP 3.17 across 7 major IDE families', category: 'IDE_INTEGRATION', isRelevant: true },
        { id: 'REQ-009', text: 'Unrelated code comment describing temporary variable', category: 'NOISE', isRelevant: false },
        { id: 'REQ-010', text: 'System must compute precision, recall, and F1 metrics', category: 'BENCHMARK', isRelevant: true }
    ],
    'drift_detection_v1': [
        { id: 'DRIFT-001', requirementId: 'REQ-007', description: 'Imported third-party library lodash in core engine', expectedDrift: true },
        { id: 'DRIFT-002', requirementId: 'REQ-001', description: 'Refactored internal helper function with zero protocol change', expectedDrift: false },
        { id: 'DRIFT-003', requirementId: 'REQ-002', description: 'Bypassed authentication check on public endpoint', expectedDrift: true },
        { id: 'DRIFT-004', requirementId: 'REQ-004', description: 'Optimized log formatting string without altering audit fields', expectedDrift: false },
        { id: 'DRIFT-005', requirementId: 'REQ-008', description: 'Removed Neovim LSP adapter support from framework', expectedDrift: true }
    ],
    'security_compliance_v1': [
        { id: 'SEC-001', title: 'Hardcoded API secret token in source code', isViolation: true },
        { id: 'SEC-002', title: 'Environment variable injection for secret key', isViolation: false },
        { id: 'SEC-003', title: 'Disabled TLS certificate verification in client', isViolation: true },
        { id: 'SEC-004', title: 'Enforced HTTPS redirect on incoming requests', isViolation: false },
        { id: 'SEC-005', title: 'Insecure cryptographic algorithm MD5 used for password hashing', isViolation: true }
    ]
});

/**
 * AiPrecisionRecallBenchmark
 * Enterprise AI model evaluation suite for benchmarking requirement extraction,
 * architecture drift detection, and compliance finding precision/recall metrics.
 */
class AiPrecisionRecallBenchmark {
    constructor() {
        this.currentDataset = [];
        this.currentDatasetName = '';
        this.lastEvaluation = null;
    }

    /**
     * Loads a gold-standard evaluation dataset by name or file path.
     * @param {string} datasetName - Name of built-in dataset or path to dataset JSON file.
     * @returns {Array<Object>} Gold standard ground truth dataset records.
     */
    loadGoldStandardDataset(datasetName = 'requirement_extraction_v1') {
        if (!datasetName || typeof datasetName !== 'string') {
            datasetName = 'requirement_extraction_v1';
        }

        const normalizedName = datasetName.trim();

        // 1. Check built-in datasets
        if (GOLD_STANDARD_DATASETS[normalizedName]) {
            this.currentDataset = JSON.parse(JSON.stringify(GOLD_STANDARD_DATASETS[normalizedName]));
            this.currentDatasetName = normalizedName;
            return this.currentDataset;
        }

        // 2. Try loading from file path if file exists
        try {
            const resolvedPath = path.resolve(normalizedName);
            if (fs.existsSync(resolvedPath)) {
                const raw = fs.readFileSync(resolvedPath, 'utf-8');
                const parsed = JSON.parse(raw);
                this.currentDataset = Array.isArray(parsed) ? parsed : (parsed.dataset || parsed.items || []);
                this.currentDatasetName = path.basename(resolvedPath);
                return this.currentDataset;
            }
        } catch (err) {
            // Fallback to default
        }

        // 3. Fallback to default built-in dataset
        this.currentDataset = JSON.parse(JSON.stringify(GOLD_STANDARD_DATASETS['requirement_extraction_v1']));
        this.currentDatasetName = 'requirement_extraction_v1';
        return this.currentDataset;
    }

    /**
     * Evaluates model predictions against ground truth dataset.
     * @param {Array|Set|Object} predictionSet - Predicted items, IDs, or predictions map.
     * @param {Array|Set|Object} [groundTruthSet=null] - Optional ground truth set. Uses loaded dataset if null.
     * @returns {Object} Metric summary containing precision, recall, f1Score, accuracy, confusionMatrix.
     */
    evaluateModelPerformance(predictionSet, groundTruthSet = null) {
        let groundTruthRecords = [];

        if (Array.isArray(groundTruthSet) && groundTruthSet.length > 0) {
            groundTruthRecords = groundTruthSet;
        } else if (groundTruthSet instanceof Set) {
            groundTruthRecords = Array.from(groundTruthSet).map(id => ({ id, isRelevant: true }));
        } else if (this.currentDataset && this.currentDataset.length > 0) {
            groundTruthRecords = this.currentDataset;
        } else {
            groundTruthRecords = this.loadGoldStandardDataset('requirement_extraction_v1');
        }

        let tp = 0;
        let fp = 0;
        let fn = 0;
        let tn = 0;

        // Process ground truth item by item
        groundTruthRecords.forEach(item => {
            const id = item.id || item.requirementId || item.key;
            // Determine actual status from ground truth item fields
            const actualPositive = (
                item.isRelevant === true ||
                item.expectedDrift === true ||
                item.isViolation === true ||
                item.groundTruth === true ||
                item.positive === true
            );

            // Determine model prediction for this item
            let predictedPositive = false;

            if (predictionSet instanceof Set) {
                predictedPositive = predictionSet.has(id);
            } else if (Array.isArray(predictionSet)) {
                // If predictionSet is array of strings
                if (typeof predictionSet[0] === 'string') {
                    predictedPositive = predictionSet.includes(id);
                } else {
                    // Array of prediction objects
                    const match = predictionSet.find(p => (p.id === id || p.requirementId === id || p.key === id));
                    if (match) {
                        if (match.predictedDrift !== undefined) predictedPositive = Boolean(match.predictedDrift);
                        else if (match.expectedDrift !== undefined) predictedPositive = Boolean(match.expectedDrift);
                        else if (match.isRelevant !== undefined) predictedPositive = Boolean(match.isRelevant);
                        else if (match.isViolation !== undefined) predictedPositive = Boolean(match.isViolation);
                        else if (match.predicted !== undefined) predictedPositive = Boolean(match.predicted);
                        else if (match.positive !== undefined) predictedPositive = Boolean(match.positive);
                        else predictedPositive = true;
                    }
                }
            } else if (predictionSet && typeof predictionSet === 'object') {
                const val = predictionSet[id];
                if (typeof val === 'boolean') {
                    predictedPositive = val;
                } else if (val && typeof val === 'object') {
                    predictedPositive = val.isRelevant !== false && val.predicted !== false;
                }
            }

            // Categorize in Confusion Matrix
            if (actualPositive && predictedPositive) {
                tp++;
            } else if (!actualPositive && predictedPositive) {
                fp++;
            } else if (actualPositive && !predictedPositive) {
                fn++;
            } else {
                tn++;
            }
        });

        // Save last evaluation metrics data
        this.lastEvaluation = { tp, fp, fn, tn, total: tp + fp + fn + tn };

        return this.computeMetrics();
    }

    /**
     * Computes statistical precision, recall, F1-score, accuracy, and confusion matrix.
     * @param {Object} [evaluationData=null] - Optional evaluation counts object { tp, fp, fn, tn }.
     * @returns {Object} { precision, recall, f1Score, accuracy, confusionMatrix }
     */
    computeMetrics(evaluationData = null) {
        const data = evaluationData || this.lastEvaluation || { tp: 0, fp: 0, fn: 0, tn: 0, total: 0 };
        const { tp, fp, fn, tn } = data;

        const precision = (tp + fp) > 0 ? tp / (tp + fp) : 0;
        const recall = (tp + fn) > 0 ? tp / (tp + fn) : 0;
        const f1Score = (precision + recall) > 0 ? (2 * precision * recall) / (precision + recall) : 0;
        const total = (tp + fp + fn + tn) || (data.total || 0);
        const accuracy = total > 0 ? (tp + tn) / total : 0;

        return {
            precision: Number(precision.toFixed(4)),
            recall: Number(recall.toFixed(4)),
            f1Score: Number(f1Score.toFixed(4)),
            accuracy: Number(accuracy.toFixed(4)),
            confusionMatrix: { tp, fp, fn, tn }
        };
    }
}

module.exports = AiPrecisionRecallBenchmark;
