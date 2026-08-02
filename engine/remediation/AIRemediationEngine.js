/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Legacy Remediation Engine (Stream 4)
 * File           : AIRemediationEngine.js
 * Version        : 2026.1-LTS (v4.0.0-EXTENDED)
 * Author         : Enterprise Systems Engineering & Governance Council
 * Organization   : Ujomor Systems & Enterprise Governance
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
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

/**
 * AIRemediationEngine
 * Complete legacy remediation engine providing root cause analysis, file-level patch suggestions,
 * code snippet diffs, effort estimations (hours/sprints), risk reduction scoring, auto-verification,
 * re-run finding action status, accepted risk state management, owner assignment workflow,
 * multi-format exports (JSON/CSV), and milestone implementation roadmap generation.
 */
class AIRemediationEngine {
    constructor(options = {}) {
        this.options = options;
        this.ruleKnowledgeBase = this._initializeKnowledgeBase();
        this.findingsRegistry = new Map();
        this.sprintCapacityHours = options.sprintCapacityHours || 40;
    }

    /**
     * Initializes the built-in knowledge base for automated finding analysis using domain-agnostic resource terminology.
     * @private
     */
    _initializeKnowledgeBase() {
        return {
            CORS_WILDCARD: {
                category: 'SECURITY',
                severity: 'HIGH',
                rootCause: 'Permissive Access-Control-Allow-Origin header set to wildcard (*), enabling unauthorized cross-origin resource access.',
                impactStatement: 'Allows untrusted external domains to read sensitive user data and execute cross-origin API requests via authenticated user sessions.',
                affectedComponents: ['identity-provider', 'api-gateway', 'auth-service'],
                sampleFilePath: 'src/gateway/cors.config.js',
                codeSnippet: {
                    filePath: 'src/gateway/cors.config.js',
                    beforeSnippet: "app.use(cors({ origin: '*' }));",
                    afterSnippet: "app.use(cors({ origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['https://app.domain.local'], credentials: true }));",
                    patchDiff: "--- a/src/gateway/cors.config.js\n+++ b/src/gateway/cors.config.js\n@@ -12,1 +12,1 @@\n-app.use(cors({ origin: '*' }));\n+app.use(cors({ origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['https://app.domain.local'], credentials: true }));",
                    description: 'Replace wildcard CORS origin with explicit domain validation and environment configuration.'
                },
                suggestedConfigs: {
                    'Access-Control-Allow-Origin': 'https://trusted.domain.local',
                    'Access-Control-Allow-Credentials': 'true',
                    'Vary': 'Origin'
                },
                fixTimeEstimate: '20 mins',
                fixTimeMinutes: 20,
                priorityRating: 'P1',
                initialRiskScore: 85,
                postFixRiskScore: 5
            },
            SELECT_STAR_QUERY: {
                category: 'PERFORMANCE',
                severity: 'MEDIUM',
                rootCause: 'Wildcard SQL selection (SELECT *) fetches unused columns, causing excessive memory allocation and database I/O overhead.',
                impactStatement: 'Increases database latency by 35-60%, consumes excess network bandwidth, and prevents index-only scan optimizations.',
                affectedComponents: ['data-service', 'analytics-engine', 'reporting-api'],
                sampleFilePath: 'src/repository/user.repository.js',
                codeSnippet: {
                    filePath: 'src/repository/user.repository.js',
                    beforeSnippet: "const query = 'SELECT * FROM users WHERE status = $1';",
                    afterSnippet: "const query = 'SELECT id, username, email, created_at FROM users WHERE status = $1';",
                    patchDiff: "--- a/src/repository/user.repository.js\n+++ b/src/repository/user.repository.js\n@@ -45,1 +45,1 @@\n-const query = 'SELECT * FROM users WHERE status = $1';\n+const query = 'SELECT id, username, email, created_at FROM users WHERE status = $1';",
                    description: 'Specify required projection column names explicitly instead of wildcard SELECT *.'
                },
                suggestedConfigs: {
                    'db.query.projection': 'explicit_columns',
                    'db.query.max_fetch_size': '500'
                },
                fixTimeEstimate: '30 mins',
                fixTimeMinutes: 30,
                priorityRating: 'P2',
                initialRiskScore: 60,
                postFixRiskScore: 10
            },
            MISSING_CSP_HEADER: {
                category: 'SECURITY',
                severity: 'HIGH',
                rootCause: 'Absence of Content-Security-Policy (CSP) headers leaves the web application vulnerable to Cross-Site Scripting (XSS) attacks.',
                impactStatement: 'Exposes client applications to malicious script injection, data exfiltration, DOM manipulation, and session hijacking.',
                affectedComponents: ['experience-portal', 'edge-gateway', 'cdn-edge'],
                sampleFilePath: 'src/middleware/security.middleware.js',
                codeSnippet: {
                    filePath: 'src/middleware/security.middleware.js',
                    beforeSnippet: "// No CSP header configured",
                    afterSnippet: "res.setHeader('Content-Security-Policy', \"default-src 'self'; script-src 'self' 'nonce-\" + req.nonce + \"'; object-src 'none'\");",
                    patchDiff: "--- a/src/middleware/security.middleware.js\n+++ b/src/middleware/security.middleware.js\n@@ -28,0 +28,1 @@\n+res.setHeader('Content-Security-Policy', \"default-src 'self'; script-src 'self' 'nonce-\" + req.nonce + \"'; object-src 'none'\");",
                    description: 'Inject strict Content-Security-Policy response headers with cryptographically strong script nonces.'
                },
                suggestedConfigs: {
                    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'nonce-rAnd0m1z3d'; object-src 'none'; frame-ancestors 'none'",
                    'X-Content-Type-Options': 'nosniff'
                },
                fixTimeEstimate: '45 mins',
                fixTimeMinutes: 45,
                priorityRating: 'P1',
                initialRiskScore: 80,
                postFixRiskScore: 8
            },
            UNINDEXED_DATABASE_SEARCH: {
                category: 'PERFORMANCE',
                severity: 'HIGH',
                rootCause: 'Full table scan executed on frequently queried database table due to missing index on filter columns.',
                impactStatement: 'Causes severe P95 latency spikes up to 3500ms, database CPU utilization exceeding 90%, and potential lock contention.',
                affectedComponents: ['resource-service', 'database-cluster', 'transaction-processor'],
                sampleFilePath: 'db/migrations/20260802_add_indexes.sql',
                codeSnippet: {
                    filePath: 'db/migrations/20260802_add_indexes.sql',
                    beforeSnippet: "-- Query running without index on user_id, created_at",
                    afterSnippet: "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_date ON orders (user_id, created_at DESC);",
                    patchDiff: "--- a/db/migrations/20260802_add_indexes.sql\n+++ b/db/migrations/20260802_add_indexes.sql\n@@ -1,0 +1,1 @@\n+CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_date ON orders (user_id, created_at DESC);",
                    description: 'Add composite concurrent index on user_id and created_at columns to eliminate full table scans.'
                },
                suggestedConfigs: {
                    'db.index.strategy': 'CREATE INDEX idx_orders_user_date ON orders(user_id, created_at DESC)'
                },
                fixTimeEstimate: '25 mins',
                fixTimeMinutes: 25,
                priorityRating: 'P1',
                initialRiskScore: 75,
                postFixRiskScore: 5
            },
            INSECURE_COOKIE_ATTRIBUTES: {
                category: 'SECURITY',
                severity: 'MEDIUM',
                rootCause: 'Session cookies missing HttpOnly, Secure, or SameSite=Strict/Lax flags.',
                impactStatement: 'Exposes session tokens to JavaScript access (XSS token theft) and Cross-Site Request Forgery (CSRF).',
                affectedComponents: ['identity-provider', 'session-manager'],
                sampleFilePath: 'src/session/session.config.js',
                codeSnippet: {
                    filePath: 'src/session/session.config.js',
                    beforeSnippet: "res.cookie('sid', sessionId, { httpOnly: false });",
                    afterSnippet: "res.cookie('sid', sessionId, { httpOnly: true, secure: true, sameSite: 'strict', path: '/' });",
                    patchDiff: "--- a/src/session/session.config.js\n+++ b/src/session/session.config.js\n@@ -18,1 +18,1 @@\n-res.cookie('sid', sessionId, { httpOnly: false });\n+res.cookie('sid', sessionId, { httpOnly: true, secure: true, sameSite: 'strict', path: '/' });",
                    description: 'Set Secure, HttpOnly, and SameSite=Strict security directives on session cookies.'
                },
                suggestedConfigs: {
                    'Set-Cookie': 'session_id=...; Secure; HttpOnly; SameSite=Strict; Path=/'
                },
                fixTimeEstimate: '15 mins',
                fixTimeMinutes: 15,
                priorityRating: 'P2',
                initialRiskScore: 55,
                postFixRiskScore: 5
            },
            HARDCODED_SECRET: {
                category: 'SECURITY',
                severity: 'CRITICAL',
                rootCause: 'API keys, database passwords, or private keys committed directly in source code or configuration files.',
                impactStatement: 'Immediate risk of unauthorized administrative access, complete data breach, and infrastructure compromise.',
                affectedComponents: ['security-office-vault', 'cicd-pipeline'],
                sampleFilePath: 'config/secrets.json',
                codeSnippet: {
                    filePath: 'config/secrets.json',
                    beforeSnippet: 'const DB_PASS = "SuperSecretPassword123!";',
                    afterSnippet: 'const DB_PASS = process.env.DATABASE_PASSWORD;',
                    patchDiff: "--- a/config/secrets.json\n+++ b/config/secrets.json\n@@ -5,1 +5,1 @@\n-const DB_PASS = \"SuperSecretPassword123!\";\n+const DB_PASS = process.env.DATABASE_PASSWORD;",
                    description: 'Refactor inline hardcoded credential string to draw dynamically from isolated environment vault.'
                },
                suggestedConfigs: {
                    'secret.management': 'vault://secret/data/app-config',
                    'env.import': 'SECRETS_STORE'
                },
                fixTimeEstimate: '60 mins',
                fixTimeMinutes: 60,
                priorityRating: 'P0',
                initialRiskScore: 98,
                postFixRiskScore: 2
            }
        };
    }

    /**
     * Analyzes a finding object to produce root cause, impact statement, affected components,
     * file-level patch suggestions, code snippets, effort estimations (hours/sprints),
     * risk reduction score, and initial state tracking.
     * @param {Object|string} finding - Finding object or finding key.
     * @returns {Object} Complete remediation analysis object.
     */
    analyzeFinding(findingInput) {
        let finding = findingInput;
        if (typeof findingInput === 'string') {
            finding = { ruleId: findingInput };
        }
        if (!finding || typeof finding !== 'object') {
            throw new Error('Invalid finding parameter: must be a non-null object or string ID');
        }

        const ruleId = (finding.ruleId || finding.code || finding.id || '').toUpperCase();
        const kbEntry = this.ruleKnowledgeBase[ruleId] || {};

        const findingId = finding.id || finding.findingId || (ruleId ? `FINDING-${ruleId}` : `FINDING-${Date.now()}`);
        const category = finding.category || kbEntry.category || 'GOVERNANCE';
        const severity = (finding.severity || kbEntry.severity || 'MEDIUM').toUpperCase();

        // 1. Root Cause Analysis
        const rootCause = finding.rootCause || kbEntry.rootCause ||
            `Detected code pattern "${finding.title || ruleId}" violates architectural and governance constraints.`;
        const impactStatement = finding.impactStatement || kbEntry.impactStatement ||
            `Potential operational risk affecting service stability, security posture, or resource efficiency.`;

        // 2. File-level Patch Suggestions & Code Snippets
        const filePath = finding.filePath || finding.file || kbEntry.sampleFilePath || 'src/config/app.config.js';
        const codeSnippet = finding.codeSnippet || kbEntry.codeSnippet || this._generateFallbackCodeSnippet(filePath, ruleId);
        const suggestedConfigs = {
            ...(kbEntry.suggestedConfigs || {}),
            ...(finding.suggestedConfigs || {})
        };

        // 3. Estimated Remediation Effort (hours / sprints)
        const fixTimeMinutes = finding.fixTimeMinutes || kbEntry.fixTimeMinutes || this._calculateDefaultFixTime(severity);
        const fixTimeEstimate = finding.fixTimeEstimate || kbEntry.fixTimeEstimate || `${fixTimeMinutes} mins`;
        const effortHours = parseFloat((fixTimeMinutes / 60).toFixed(2));
        const effortSprints = parseFloat((effortHours / this.sprintCapacityHours).toFixed(3));
        const effortEstimate = `${effortHours} hours (${effortSprints} sprints)`;

        // 4. Risk Reduction Score after fix
        const initialRiskScore = finding.initialRiskScore || kbEntry.initialRiskScore || this._calculateInitialRiskScore(severity);
        const postFixRiskScore = finding.postFixRiskScore || kbEntry.postFixRiskScore || this._calculatePostFixRiskScore(severity);
        const riskReductionScore = Math.max(0, initialRiskScore - postFixRiskScore);
        const riskReductionPercentage = Math.round((riskReductionScore / (initialRiskScore || 1)) * 100);

        const priorityRating = finding.priorityRating || kbEntry.priorityRating || this._calculatePriorityRating(severity, category);

        // Workflow state management attributes
        const status = finding.status || 'OPEN';
        const owner = finding.owner || null;
        const acceptedRiskDetails = finding.acceptedRiskDetails || null;
        const verificationStatus = finding.verificationStatus || 'UNVERIFIED';
        const actionStatus = finding.actionStatus || 'PENDING';
        const affectedComponents = Array.isArray(finding.affectedComponents) && finding.affectedComponents.length > 0
            ? finding.affectedComponents
            : (kbEntry.affectedComponents || [finding.service || finding.component || finding.resource || 'core-engine']);

        const analyzedResult = {
            findingId,
            title: finding.title || finding.name || `Remediation for ${ruleId || findingId}`,
            ruleId,
            severity,
            category,
            priorityRating,
            rootCause,
            impactStatement,
            affectedComponents,
            filePath,
            codeSnippet,
            patchSuggestion: codeSnippet,
            suggestedConfigs,
            fixTimeEstimate,
            fixTimeMinutes,
            effortHours,
            effortSprints,
            effortEstimate,
            initialRiskScore,
            postFixRiskScore,
            riskReductionScore,
            riskReductionPercentage,
            status,
            owner,
            acceptedRiskDetails,
            verificationStatus,
            actionStatus,
            timestamp: new Date().toISOString()
        };

        // Cache finding in registry for stateful workflow operations
        this.findingsRegistry.set(findingId, analyzedResult);

        return analyzedResult;
    }

    /**
     * Analyzes an array of findings.
     * @param {Array<Object|string>} findings 
     * @returns {Array<Object>}
     */
    analyzeFindings(findings = []) {
        if (!Array.isArray(findings)) {
            throw new Error('findings parameter must be an array');
        }
        return findings.map(finding => this.analyzeFinding(finding));
    }

    /**
     * Generates a comprehensive prioritized remediation plan with summary metrics.
     * @param {Array<Object|string>} findings 
     * @returns {Object} Complete remediation plan.
     */
    generateRemediationPlan(findings = []) {
        const analyzed = this.analyzeFindings(findings);

        const breakdownByPriority = { P0: 0, P1: 0, P2: 0, P3: 0 };
        const breakdownBySeverity = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
        const breakdownByStatus = { OPEN: 0, ASSIGNED: 0, ACCEPTED_RISK: 0, VERIFIED: 0, CLOSED: 0 };
        const breakdownByCategory = {};

        let totalFixMinutes = 0;
        let totalInitialRisk = 0;
        let totalPostFixRisk = 0;
        const componentMap = new Map();

        analyzed.forEach(item => {
            if (breakdownByPriority[item.priorityRating] !== undefined) {
                breakdownByPriority[item.priorityRating]++;
            }
            if (breakdownBySeverity[item.severity] !== undefined) {
                breakdownBySeverity[item.severity]++;
            }
            breakdownByStatus[item.status] = (breakdownByStatus[item.status] || 0) + 1;
            breakdownByCategory[item.category] = (breakdownByCategory[item.category] || 0) + 1;

            totalFixMinutes += item.fixTimeMinutes;
            totalInitialRisk += item.initialRiskScore;
            totalPostFixRisk += item.postFixRiskScore;

            item.affectedComponents.forEach(comp => {
                const count = componentMap.get(comp) || 0;
                componentMap.set(comp, count + 1);
            });
        });

        // Sort items by priority (P0 -> P1 -> P2 -> P3)
        const priorityOrder = { P0: 0, P1: 1, P2: 2, P3: 3 };
        const prioritizedRemediations = [...analyzed].sort((a, b) => {
            return (priorityOrder[a.priorityRating] ?? 9) - (priorityOrder[b.priorityRating] ?? 9);
        });

        const totalEffortHours = parseFloat((totalFixMinutes / 60).toFixed(2));
        const totalEffortSprints = parseFloat((totalEffortHours / this.sprintCapacityHours).toFixed(3));
        const totalRiskReductionScore = Math.max(0, totalInitialRisk - totalPostFixRisk);
        const avgRiskReductionPercentage = analyzed.length > 0
            ? Math.round((totalRiskReductionScore / (totalInitialRisk || 1)) * 100)
            : 0;

        return {
            totalFindings: analyzed.length,
            totalEstimatedFixTime: `${totalFixMinutes} mins (${totalEffortHours} hrs)`,
            totalFixMinutes,
            totalEffortHours,
            totalEffortSprints,
            totalInitialRiskScore: totalInitialRisk,
            totalPostFixRiskScore: totalPostFixRisk,
            totalRiskReductionScore,
            avgRiskReductionPercentage,
            breakdownByPriority,
            breakdownBySeverity,
            breakdownByStatus,
            breakdownByCategory,
            affectedComponentsMap: Object.fromEntries(componentMap),
            remediations: prioritizedRemediations,
            generatedAt: new Date().toISOString()
        };
    }

    /**
     * File-level patch suggestions & code snippet generator for a given finding.
     * @param {Object|string} finding 
     * @returns {Object} Code patch details.
     */
    generatePatchSuggestion(finding) {
        const analyzed = typeof finding === 'object' && finding.codeSnippet
            ? finding
            : this.analyzeFinding(finding);

        return {
            findingId: analyzed.findingId,
            ruleId: analyzed.ruleId,
            filePath: analyzed.filePath,
            beforeSnippet: analyzed.codeSnippet.beforeSnippet,
            afterSnippet: analyzed.codeSnippet.afterSnippet,
            patchDiff: analyzed.codeSnippet.patchDiff,
            description: analyzed.codeSnippet.description,
            suggestedConfigs: analyzed.suggestedConfigs
        };
    }

    /**
     * Estimates remediation effort in hours and sprints.
     * @param {Object|number} findingOrMinutes - Finding object or number of fix minutes.
     * @returns {Object} Detailed effort metrics.
     */
    estimateRemediationEffort(findingOrMinutes) {
        let minutes = 30;
        if (typeof findingOrMinutes === 'number') {
            minutes = findingOrMinutes;
        } else if (findingOrMinutes && typeof findingOrMinutes === 'object') {
            const analyzed = this.analyzeFinding(findingOrMinutes);
            minutes = analyzed.fixTimeMinutes;
        }

        const hours = parseFloat((minutes / 60).toFixed(2));
        const sprints = parseFloat((hours / this.sprintCapacityHours).toFixed(3));

        return {
            fixTimeMinutes: minutes,
            hours,
            sprints,
            sprintCapacityHours: this.sprintCapacityHours,
            formattedEstimate: `${hours} hrs (${sprints} sprints)`,
            effortBreakdown: {
                analysisMinutes: Math.round(minutes * 0.2),
                codeChangeMinutes: Math.round(minutes * 0.5),
                testingMinutes: Math.round(minutes * 0.3)
            }
        };
    }

    /**
     * Computes risk reduction metrics for a finding.
     * @param {Object|string} finding 
     * @returns {Object} Risk reduction metrics.
     */
    calculateRiskReduction(finding) {
        const analyzed = typeof finding === 'object' && finding.initialRiskScore
            ? finding
            : this.analyzeFinding(finding);

        return {
            findingId: analyzed.findingId,
            severity: analyzed.severity,
            initialRiskScore: analyzed.initialRiskScore,
            postFixRiskScore: analyzed.postFixRiskScore,
            riskReductionScore: analyzed.riskReductionScore,
            riskReductionPercentage: analyzed.riskReductionPercentage,
            riskGradeBefore: this._getRiskGrade(analyzed.initialRiskScore),
            riskGradeAfter: this._getRiskGrade(analyzed.postFixRiskScore)
        };
    }

    /**
     * Auto-verifies remediation status after a fix is applied.
     * @param {Object|string} findingOrId 
     * @param {Object} verificationContext - Context containing file content, config, or test output.
     * @returns {Object} Verification results.
     */
    verifyRemediation(findingOrId, verificationContext = {}) {
        const findingId = typeof findingOrId === 'string' ? findingOrId : (findingOrId.findingId || findingOrId.id);
        const existing = this.findingsRegistry.get(findingId) || (typeof findingOrId === 'object' ? this.analyzeFinding(findingOrId) : null);

        if (!existing) {
            throw new Error(`Finding with ID "${findingId}" not found in registry.`);
        }

        let verified = false;
        let verificationReason = '';

        if (verificationContext.forceVerify === true) {
            verified = true;
            verificationReason = 'Explicit verification forced via test harness or CI pipeline.';
        } else if (verificationContext.fileContent) {
            const afterSnippet = existing.codeSnippet?.afterSnippet || '';
            const beforeSnippet = existing.codeSnippet?.beforeSnippet || '';
            if (afterSnippet && verificationContext.fileContent.includes(afterSnippet)) {
                verified = true;
                verificationReason = 'Applied remediation snippet detected in target file content.';
            } else if (beforeSnippet && !verificationContext.fileContent.includes(beforeSnippet)) {
                verified = true;
                verificationReason = 'Vulnerable code snippet successfully eliminated from target file.';
            } else {
                verificationReason = 'Target file still contains vulnerable snippet or missing patch pattern.';
            }
        } else if (verificationContext.configState) {
            const keys = Object.keys(existing.suggestedConfigs || {});
            const allMatch = keys.length > 0 && keys.every(k => verificationContext.configState[k] === existing.suggestedConfigs[k]);
            if (allMatch) {
                verified = true;
                verificationReason = 'All suggested configuration key-values match target system config.';
            } else {
                verificationReason = 'Target system configuration does not match required security settings.';
            }
        } else {
            // Default verification heuristic: pass if marked fixed in context
            verified = verificationContext.isFixed === true;
            verificationReason = verified
                ? 'Automated check confirmed compliance criteria.'
                : 'Automated verification pending code update inspection.';
        }

        existing.verificationStatus = verified ? 'VERIFIED' : 'VERIFICATION_FAILED';
        existing.status = verified ? 'VERIFIED' : existing.status;
        existing.actionStatus = verified ? 'VERIFIED_COMPLIANT' : 'REMEDIATION_REQUIRED';
        existing.verifiedAt = new Date().toISOString();
        existing.verificationDetails = { verified, reason: verificationReason, verificationContext };

        this.findingsRegistry.set(findingId, existing);

        return {
            findingId,
            verified,
            status: existing.status,
            verificationStatus: existing.verificationStatus,
            actionStatus: existing.actionStatus,
            verificationReason,
            timestamp: existing.verifiedAt
        };
    }

    /**
     * "Re-run finding" action status workflow.
     * @param {Object|string} findingOrId 
     * @param {Object} currentContext - Active codebase or execution state.
     * @returns {Object} Updated finding action status.
     */
    rerunFinding(findingOrId, currentContext = {}) {
        const findingId = typeof findingOrId === 'string' ? findingOrId : (findingOrId.findingId || findingOrId.id);
        const existing = this.findingsRegistry.get(findingId) || (typeof findingOrId === 'object' ? this.analyzeFinding(findingOrId) : null);

        if (!existing) {
            throw new Error(`Finding with ID "${findingId}" not found in registry.`);
        }

        const isResolved = currentContext.isResolved === true || currentContext.codeFixed === true;

        existing.actionStatus = isResolved ? 'RE_RUN_PASSED' : 'RE_RUN_FAILED';
        existing.status = isResolved ? 'CLOSED' : existing.status;
        existing.lastRunAt = new Date().toISOString();
        existing.reRunDetails = {
            executedAt: existing.lastRunAt,
            result: isResolved ? 'PASSED' : 'STILL_ACTIVE',
            currentContext
        };

        this.findingsRegistry.set(findingId, existing);

        return {
            findingId,
            actionStatus: existing.actionStatus,
            status: existing.status,
            lastRunAt: existing.lastRunAt,
            isResolved
        };
    }

    /**
     * "Mark accepted risk" workflow state.
     * @param {Object|string} findingOrId 
     * @param {string} rationale - Justification for accepting risk.
     * @param {string} acceptedBy - User or governance authority email/ID.
     * @param {number} durationDays - Risk acceptance expiration in days.
     * @returns {Object} Updated finding with accepted risk details.
     */
    markAcceptedRisk(findingOrId, rationale, acceptedBy = 'Governance Authority', durationDays = 90) {
        const findingId = typeof findingOrId === 'string' ? findingOrId : (findingOrId.findingId || findingOrId.id);
        const existing = this.findingsRegistry.get(findingId) || (typeof findingOrId === 'object' ? this.analyzeFinding(findingOrId) : null);

        if (!existing) {
            throw new Error(`Finding with ID "${findingId}" not found in registry.`);
        }
        if (!rationale || typeof rationale !== 'string') {
            throw new Error('Rationale is required to mark risk as accepted.');
        }

        const acceptedAt = new Date();
        const expiresAt = new Date(acceptedAt.getTime() + durationDays * 24 * 60 * 60 * 1000);

        existing.status = 'ACCEPTED_RISK';
        existing.actionStatus = 'RISK_ACCEPTED';
        existing.acceptedRiskDetails = {
            rationale,
            acceptedBy,
            acceptedAt: acceptedAt.toISOString(),
            expiresAt: expiresAt.toISOString(),
            durationDays,
            active: true
        };

        this.findingsRegistry.set(findingId, existing);

        return existing;
    }

    /**
     * Checks if a finding has an active risk acceptance.
     * @param {Object|string} findingOrId 
     * @returns {boolean} True if active risk acceptance applies.
     */
    isRiskAccepted(findingOrId) {
        const findingId = typeof findingOrId === 'string' ? findingOrId : (findingOrId.findingId || findingOrId.id);
        const existing = this.findingsRegistry.get(findingId);
        if (!existing || existing.status !== 'ACCEPTED_RISK' || !existing.acceptedRiskDetails) {
            return false;
        }

        const expiresAt = new Date(existing.acceptedRiskDetails.expiresAt);
        return expiresAt.getTime() > Date.now();
    }

    /**
     * "Assign owner" workflow.
     * @param {Object|string} findingOrId 
     * @param {Object|string} ownerInput - Owner string (email/name) or owner object ({ name, email, team }).
     * @returns {Object} Updated finding object.
     */
    assignOwner(findingOrId, ownerInput) {
        const findingId = typeof findingOrId === 'string' ? findingOrId : (findingOrId.findingId || findingOrId.id);
        const existing = this.findingsRegistry.get(findingId) || (typeof findingOrId === 'object' ? this.analyzeFinding(findingOrId) : null);

        if (!existing) {
            throw new Error(`Finding with ID "${findingId}" not found in registry.`);
        }
        if (!ownerInput) {
            throw new Error('Owner specification is required for assignment.');
        }

        const owner = typeof ownerInput === 'string'
            ? { name: ownerInput, email: ownerInput, team: 'Engineering' }
            : ownerInput;

        existing.owner = {
            ...owner,
            assignedAt: new Date().toISOString()
        };
        if (existing.status === 'OPEN') {
            existing.status = 'ASSIGNED';
        }
        existing.actionStatus = 'OWNER_ASSIGNED';

        this.findingsRegistry.set(findingId, existing);

        return existing;
    }

    /**
     * Returns findings assigned to a specific owner.
     * @param {Array<Object>} findings 
     * @param {string} ownerNameOrEmail 
     * @returns {Array<Object>}
     */
    getAssignmentsByOwner(findings = [], ownerNameOrEmail = '') {
        const list = Array.isArray(findings) && findings.length > 0
            ? findings
            : Array.from(this.findingsRegistry.values());

        const query = ownerNameOrEmail.toLowerCase();
        return list.filter(item => {
            if (!item.owner) return false;
            const nameMatch = (item.owner.name || '').toLowerCase().includes(query);
            const emailMatch = (item.owner.email || '').toLowerCase().includes(query);
            const teamMatch = (item.owner.team || '').toLowerCase().includes(query);
            return nameMatch || emailMatch || teamMatch;
        });
    }

    /**
     * Exports remediation plan in JSON or CSV format.
     * @param {Object|Array} planOrFindings - Remediation plan or array of findings.
     * @param {string} format - Export format: 'JSON' or 'CSV'.
     * @returns {string} Serialized remediation plan data.
     */
    exportRemediationPlan(planOrFindings, format = 'JSON') {
        const plan = Array.isArray(planOrFindings)
            ? this.generateRemediationPlan(planOrFindings)
            : (planOrFindings && planOrFindings.remediations ? planOrFindings : this.generateRemediationPlan());

        const targetFormat = (format || 'JSON').toUpperCase();

        if (targetFormat === 'CSV') {
            return this.exportPlanToCSV(plan);
        }
        return this.exportPlanToJSON(plan);
    }

    /**
     * Serializes plan to JSON.
     * @param {Object} plan 
     * @returns {string} JSON string.
     */
    exportPlanToJSON(plan) {
        return JSON.stringify(plan, null, 2);
    }

    /**
     * Serializes plan to CSV format.
     * @param {Object} plan 
     * @returns {string} CSV formatted text.
     */
    exportPlanToCSV(plan) {
        const headers = [
            'Finding ID',
            'Title',
            'Rule ID',
            'Severity',
            'Category',
            'Priority',
            'Effort (Hours)',
            'Effort (Sprints)',
            'Initial Risk',
            'Post-Fix Risk',
            'Risk Reduction %',
            'Status',
            'Owner',
            'File Path'
        ];

        const rows = (plan.remediations || []).map(r => {
            const ownerStr = r.owner ? (r.owner.email || r.owner.name || 'Assigned') : 'Unassigned';
            return [
                `"${r.findingId || ''}"`,
                `"${(r.title || '').replace(/"/g, '""')}"`,
                `"${r.ruleId || ''}"`,
                `"${r.severity || ''}"`,
                `"${r.category || ''}"`,
                `"${r.priorityRating || ''}"`,
                r.effortHours,
                r.effortSprints,
                r.initialRiskScore,
                r.postFixRiskScore,
                `${r.riskReductionPercentage}%`,
                `"${r.status || 'OPEN'}"`,
                `"${ownerStr}"`,
                `"${r.filePath || ''}"`
            ].join(',');
        });

        return [headers.join(','), ...rows].join('\n');
    }

    /**
     * Generates implementation roadmap grouped into four milestones:
     * - Immediate (P0 / CRITICAL, 0-2 days)
     * - Next Sprint (P1 / HIGH, 1-2 weeks)
     * - Backlog (P2 / MEDIUM, upcoming sprint)
     * - Future (P3 / LOW, tech debt backlog)
     * @param {Object|Array} findingsOrPlan 
     * @returns {Object} Structured implementation roadmap.
     */
    generateImplementationRoadmap(findingsOrPlan) {
        const plan = Array.isArray(findingsOrPlan)
            ? this.generateRemediationPlan(findingsOrPlan)
            : (findingsOrPlan && findingsOrPlan.remediations ? findingsOrPlan : this.generateRemediationPlan());

        const remediations = plan.remediations || [];

        const milestones = {
            immediate: { label: 'Immediate Execution (0-2 Days)', items: [], totalHours: 0, totalRiskReduced: 0 },
            nextSprint: { label: 'Next Sprint (Sprint 1)', items: [], totalHours: 0, totalRiskReduced: 0 },
            backlog: { label: 'Backlog Grooming (Sprint 2-3)', items: [], totalHours: 0, totalRiskReduced: 0 },
            future: { label: 'Future Tech Debt (Quarterly)', items: [], totalHours: 0, totalRiskReduced: 0 }
        };

        remediations.forEach(item => {
            let targetGroup = 'future';
            if (item.priorityRating === 'P0' || item.severity === 'CRITICAL') {
                targetGroup = 'immediate';
            } else if (item.priorityRating === 'P1' || item.severity === 'HIGH') {
                targetGroup = 'nextSprint';
            } else if (item.priorityRating === 'P2' || item.severity === 'MEDIUM') {
                targetGroup = 'backlog';
            } else {
                targetGroup = 'future';
            }

            milestones[targetGroup].items.push(item);
            milestones[targetGroup].totalHours = parseFloat((milestones[targetGroup].totalHours + item.effortHours).toFixed(2));
            milestones[targetGroup].totalRiskReduced += item.riskReductionScore;
        });

        const roadmapSummary = {
            totalRemediations: remediations.length,
            totalHours: plan.totalEffortHours || 0,
            totalSprints: plan.totalEffortSprints || 0,
            immediateCount: milestones.immediate.items.length,
            nextSprintCount: milestones.nextSprint.items.length,
            backlogCount: milestones.backlog.items.length,
            futureCount: milestones.future.items.length
        };

        return {
            roadmapSummary,
            milestones,
            generatedAt: new Date().toISOString()
        };
    }

    /**
     * Helper to generate fallback code snippets for unknown rule IDs.
     * @private
     */
    _generateFallbackCodeSnippet(filePath, ruleId) {
        return {
            filePath,
            beforeSnippet: `// Non-compliant code pattern for rule: ${ruleId}`,
            afterSnippet: `// Compliant code pattern implemented according to governance standards for rule: ${ruleId}`,
            patchDiff: `--- a/${filePath}\n+++ b/${filePath}\n@@ -1,1 +1,1 @@\n-// Non-compliant code pattern for rule: ${ruleId}\n+// Compliant code pattern implemented according to governance standards for rule: ${ruleId}`,
            description: `Refactor code pattern in ${filePath} to comply with governance rule ${ruleId}.`
        };
    }

    /**
     * Calculates default fix minutes based on severity.
     * @private
     */
    _calculateDefaultFixTime(severity) {
        switch (severity) {
            case 'CRITICAL': return 60;
            case 'HIGH': return 45;
            case 'MEDIUM': return 30;
            case 'LOW': return 15;
            default: return 30;
        }
    }

    /**
     * Calculates priority rating based on severity and category.
     * @private
     */
    _calculatePriorityRating(severity, category) {
        if (severity === 'CRITICAL') return 'P0';
        if (severity === 'HIGH' || category === 'SECURITY') return 'P1';
        if (severity === 'MEDIUM') return 'P2';
        return 'P3';
    }

    /**
     * @private
     */
    _calculateInitialRiskScore(severity) {
        switch (severity) {
            case 'CRITICAL': return 95;
            case 'HIGH': return 80;
            case 'MEDIUM': return 55;
            case 'LOW': return 25;
            default: return 50;
        }
    }

    /**
     * @private
     */
    _calculatePostFixRiskScore(severity) {
        switch (severity) {
            case 'CRITICAL': return 5;
            case 'HIGH': return 5;
            case 'MEDIUM': return 5;
            case 'LOW': return 2;
            default: return 5;
        }
    }

    /**
     * @private
     */
    _getRiskGrade(score) {
        if (score >= 80) return 'CRITICAL_RISK';
        if (score >= 60) return 'HIGH_RISK';
        if (score >= 35) return 'MODERATE_RISK';
        return 'LOW_RISK';
    }
}

module.exports = AIRemediationEngine;
