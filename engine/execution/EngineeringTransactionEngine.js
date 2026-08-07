/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Engineering Transaction & Rollback Architecture
 * File           : EngineeringTransactionEngine.js
 * Version        : 2026.3.0-LTS
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
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class EngineeringTransactionEngine {
    constructor(options = {}) {
        this.options = options;
        this.activeTransaction = null;
    }

    /**
     * Begins an atomic engineering transaction.
     * 
     * @param {string} description Transaction description.
     * @returns {Object} Transaction context object.
     */
    beginTransaction(description = 'Engineering Execution Transaction') {
        const txId = `TX-${crypto.createHash('md5').update(description + new Date().toISOString()).digest('hex').slice(0, 8).toUpperCase()}`;

        this.activeTransaction = {
            txId,
            description,
            startedAt: new Date().toISOString(),
            status: 'ACTIVE',
            stagedChanges: [], // Array of { filePath, originalContent, newContent }
            checkpoints: new Map()
        };

        return this.activeTransaction;
    }

    /**
     * Stages a file change within the active transaction.
     * 
     * @param {string} filePath Absolute path of target file.
     * @param {string} newContent Replacement or proposed file content.
     */
    stageFileChange(filePath, newContent) {
        if (!this.activeTransaction || this.activeTransaction.status !== 'ACTIVE') {
            throw new Error('No active transaction available for staging changes');
        }

        const absPath = path.resolve(filePath);
        let originalContent = null;

        if (fs.existsSync(absPath)) {
            try {
                originalContent = fs.readFileSync(absPath, 'utf8');
            } catch (e) {}
        }

        this.activeTransaction.stagedChanges.push({
            filePath: absPath,
            originalContent,
            newContent,
            stagedAt: new Date().toISOString()
        });

        return {
            txId: this.activeTransaction.txId,
            stagedCount: this.activeTransaction.stagedChanges.length,
            filePath: absPath
        };
    }

    /**
     * Commits all staged changes in the active transaction safely.
     */
    commitTransaction() {
        if (!this.activeTransaction || this.activeTransaction.status !== 'ACTIVE') {
            throw new Error('No active transaction available for commit');
        }

        const committedFiles = [];

        try {
            for (const change of this.activeTransaction.stagedChanges) {
                const dir = path.dirname(change.filePath);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                fs.writeFileSync(change.filePath, change.newContent, 'utf8');
                committedFiles.push(change.filePath);
            }

            this.activeTransaction.status = 'COMMITTED';
            this.activeTransaction.committedAt = new Date().toISOString();

            const result = {
                txId: this.activeTransaction.txId,
                status: 'COMMITTED',
                committedFilesCount: committedFiles.length,
                committedFiles
            };

            this.activeTransaction = null;
            return result;
        } catch (err) {
            this.rollbackTransaction();
            throw new Error(`Transaction commit failed and was rolled back: ${err.message}`);
        }
    }

    /**
     * Rolls back all staged or partial changes in the active transaction.
     */
    rollbackTransaction() {
        if (!this.activeTransaction) return null;

        const rolledBackFiles = [];

        for (const change of this.activeTransaction.stagedChanges) {
            try {
                if (change.originalContent !== null) {
                    fs.writeFileSync(change.filePath, change.originalContent, 'utf8');
                } else if (fs.existsSync(change.filePath)) {
                    fs.unlinkSync(change.filePath);
                }
                rolledBackFiles.push(change.filePath);
            } catch (e) {}
        }

        this.activeTransaction.status = 'ROLLED_BACK';
        this.activeTransaction.rolledBackAt = new Date().toISOString();

        const result = {
            txId: this.activeTransaction.txId,
            status: 'ROLLED_BACK',
            rolledBackFilesCount: rolledBackFiles.length,
            rolledBackFiles
        };

        this.activeTransaction = null;
        return result;
    }
}

module.exports = EngineeringTransactionEngine;
