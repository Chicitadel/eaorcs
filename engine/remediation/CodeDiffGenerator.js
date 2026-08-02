/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Code Diff Generator Engine (Stream 2)
 * File           : CodeDiffGenerator.js
 * Version        : 2026.1-LTS (v1.0.0-FROZEN)
 * Author         : Architectural Governance Council & Ujomor Systems Engineering
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
 * CodeDiffGenerator
 * Generates structured Before vs After code replacement snippets with technical rationale,
 * unified diffs, and specific automated fixes for common security, performance, and compliance issues.
 */
class CodeDiffGenerator {
    constructor(options = {}) {
        this.options = options;
        this.defaultAllowedOrigin = options.allowedOrigin || 'https://trusted.domain.com';
    }

    /**
     * Formats a line-by-line unified diff block string.
     * @param {string} before 
     * @param {string} after 
     * @param {string} filename 
     * @returns {string} Unified diff string.
     */
    formatUnifiedDiff(before = '', after = '', filename = 'file.ext') {
        const beforeLines = before.split('\n');
        const afterLines = after.split('\n');

        let diffText = `--- a/${filename}\n+++ b/${filename}\n@@ -1,${beforeLines.length} +1,${afterLines.length} @@\n`;

        beforeLines.forEach(line => {
            diffText += `-${line}\n`;
        });
        afterLines.forEach(line => {
            diffText += `+${line}\n`;
        });

        return diffText;
    }

    /**
     * Generates a generic structured code diff.
     * @param {Object} params 
     * @returns {Object} Structured diff object.
     */
    generateDiff(params = {}) {
        const findingId = params.findingId || params.id || `DIFF-${Date.now()}`;
        const filePath = params.filePath || params.file || 'src/main/App.java';
        const lineNumber = params.lineNumber || params.line || 1;
        const language = params.language || 'javascript';
        const beforeSnippet = params.beforeSnippet || params.before || '';
        const afterSnippet = params.afterSnippet || params.after || '';
        const technicalRationale = params.technicalRationale || params.rationale || 'Code refactoring required to comply with governance standards.';

        const diffText = this.formatUnifiedDiff(beforeSnippet, afterSnippet, filePath);

        return {
            findingId,
            filePath,
            lineNumber,
            language,
            beforeSnippet,
            afterSnippet,
            diffText,
            technicalRationale,
            generatedAt: new Date().toISOString()
        };
    }

    /**
     * Generates Before/After code replacement for @CrossOrigin("*") or wildcards.
     * @param {Object} options 
     * @returns {Object} Structured diff.
     */
    generateCORSFix(options = {}) {
        const filePath = options.filePath || 'src/main/java/com/ujomor/api/GatewayController.java';
        const targetOrigin = options.allowedOrigin || this.defaultAllowedOrigin;
        const allowedMethods = options.allowedMethods || ['GET', 'POST', 'PUT', 'DELETE'];
        const language = options.language || 'java';

        let beforeSnippet = options.beforeSnippet;
        let afterSnippet = options.afterSnippet;

        if (!beforeSnippet || !afterSnippet) {
            if (language === 'java') {
                beforeSnippet = `@CrossOrigin(origins = "*", allowedHeaders = "*")\n@RestController\npublic class GatewayController {`;
                afterSnippet = `@CrossOrigin(origins = "${targetOrigin}", allowedHeaders = {"Authorization", "Content-Type"}, allowCredentials = "true")\n@RestController\npublic class GatewayController {`;
            } else {
                beforeSnippet = `app.use(cors({ origin: '*' }));`;
                afterSnippet = `app.use(cors({\n    origin: ['${targetOrigin}'],\n    methods: [${allowedMethods.map(m => `'${m}'`).join(', ')}],\n    credentials: true\n}));`;
            }
        }

        const technicalRationale = `Replacing wildcard (*) CORS configuration with explicit domain '${targetOrigin}' and strictly enumerated headers prevents arbitrary cross-origin data exfiltration and credential misuse.`;

        return this.generateDiff({
            findingId: options.findingId || 'FIX-CORS-001',
            filePath,
            lineNumber: options.lineNumber || 14,
            language,
            beforeSnippet,
            afterSnippet,
            technicalRationale
        });
    }

    /**
     * Generates Before/After SQL query replacement replacing SELECT * with column list.
     * @param {string} tableName 
     * @param {Array<string>} columns 
     * @param {string} whereClause 
     * @param {Object} options 
     * @returns {Object} Structured diff.
     */
    generateSelectStarFix(tableName = 'users', columns = ['id', 'username', 'email', 'created_at'], whereClause = 'WHERE status = \'ACTIVE\'', options = {}) {
        const filePath = options.filePath || 'src/repository/UserRepository.sql';
        const colsString = columns.join(', ');

        const beforeSnippet = `SELECT * FROM ${tableName}${whereClause ? ' ' + whereClause : ''};`;
        const afterSnippet = `SELECT ${colsString} FROM ${tableName}${whereClause ? ' ' + whereClause : ''};`;

        const technicalRationale = `Replacing 'SELECT *' with explicit column projection (${colsString}) reduces database payload memory overhead by up to 60%, avoids fetching unneeded blob/text fields, and enables index-only scan execution plans.`;

        return this.generateDiff({
            findingId: options.findingId || 'FIX-SQL-001',
            filePath,
            lineNumber: options.lineNumber || 42,
            language: 'sql',
            beforeSnippet,
            afterSnippet,
            technicalRationale
        });
    }

    /**
     * Generates Before/After code snippets adding CSP nonces to script tags or response headers.
     * @param {Object} options 
     * @returns {Object} Structured diff.
     */
    generateCSPNonceFix(options = {}) {
        const filePath = options.filePath || 'src/templates/index.html';
        const nonceVariable = options.nonceVariable || 'res.locals.cspNonce';
        const sampleNonce = options.sampleNonce || 'rAnd0m1z3dN0nc3Value';

        let beforeSnippet = options.beforeSnippet;
        let afterSnippet = options.afterSnippet;

        if (!beforeSnippet || !afterSnippet) {
            beforeSnippet = `<!-- HTML Template -->\n<script src="/static/app.js"></script>\n<script>\n    console.log("Inline initialization script");\n</script>`;
            afterSnippet = `<!-- HTML Template -->\n<script src="/static/app.js" nonce="${nonceVariable}"></script>\n<script nonce="${nonceVariable}">\n    console.log("Inline initialization script");\n</script>`;
        }

        const technicalRationale = `Adding dynamic cryptographic nonces ('nonce-${sampleNonce}') to all inline and external script elements ensures script execution is restricted to cryptographically verified sources, effectively mitigating XSS vulnerabilities.`;

        return this.generateDiff({
            findingId: options.findingId || 'FIX-CSP-001',
            filePath,
            lineNumber: options.lineNumber || 18,
            language: 'html',
            beforeSnippet,
            afterSnippet,
            technicalRationale
        });
    }

    /**
     * Generates Before/After header configuration snippets.
     * @param {string} headerName 
     * @param {string} headerValue 
     * @param {Object} options 
     * @returns {Object} Structured diff.
     */
    generateHeaderFix(headerName = 'Strict-Transport-Security', headerValue = 'max-age=31536000; includeSubDomains; preload', options = {}) {
        const filePath = options.filePath || 'src/middleware/securityHeaders.js';
        
        const beforeSnippet = options.beforeSnippet || `// Express security middleware\napp.use((req, res, next) => {\n    next();\n});`;
        const afterSnippet = options.afterSnippet || `// Express security middleware\napp.use((req, res, next) => {\n    res.setHeader('${headerName}', '${headerValue}');\n    next();\n});`;

        const technicalRationale = `Enforcing HTTP header '${headerName}: ${headerValue}' strengthens transport security layer and prevents downgrade / sniffing attacks.`;

        return this.generateDiff({
            findingId: options.findingId || 'FIX-HDR-001',
            filePath,
            lineNumber: options.lineNumber || 10,
            language: 'javascript',
            beforeSnippet,
            afterSnippet,
            technicalRationale
        });
    }
}

module.exports = CodeDiffGenerator;
