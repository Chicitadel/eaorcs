/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Specification Intelligence Engine (Stream A)
 * File           : BlueprintParser.js
 * Version        : 2026.1-LTS (v1.0.0-FROZEN)
 * Author         : Ujomor Systems & Enterprise Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
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
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class BlueprintParser {
    constructor(options = {}) {
        this.options = options;
    }

    /**
     * Parses a specification object or raw content into a structured Blueprint AST.
     * @param {object|string} specInput Spec discovery object or file path / raw content.
     * @returns {{ id: string, title: string, type: string, sections: Array<{ title: string, content: string, level: number, bullets?: Array<string>, codeBlocks?: Array<string> }>, requirements: Array<any> }}
     */
    parseBlueprint(specInput) {
        if (!specInput) {
            throw new Error('Invalid input provided to parseBlueprint');
        }

        let content = '';
        let title = 'Specification Blueprint';
        let specType = 'SRS';
        let specPath = '';

        if (typeof specInput === 'string') {
            if (fs.existsSync(specInput)) {
                specPath = specInput;
                content = fs.readFileSync(specInput, 'utf8');
                title = path.basename(specInput, path.extname(specInput));
            } else {
                content = specInput;
            }
        } else if (typeof specInput === 'object') {
            specType = specInput.type || 'SRS';
            title = specInput.title || 'Specification Blueprint';
            specPath = specInput.absolutePath || specInput.path || '';

            if (specInput.content) {
                content = specInput.content;
            } else if (specPath && fs.existsSync(specPath)) {
                content = fs.readFileSync(specPath, 'utf8');
            } else {
                content = JSON.stringify(specInput);
            }
        }

        const astId = 'AST-' + crypto.createHash('md5').update(content || title).digest('hex').substring(0, 8).toUpperCase();

        const sections = this._parseSections(content, specType);

        return {
            id: astId,
            title,
            type: specType,
            path: specPath,
            sections,
            requirements: []
        };
    }

    /**
     * Static helper for direct invocation.
     */
    static parseBlueprint(specInput) {
        return new BlueprintParser().parseBlueprint(specInput);
    }

    _parseSections(content, specType) {
        if (!content || typeof content !== 'string') {
            return [{ title: 'Overview', content: '', level: 1, bullets: [], codeBlocks: [] }];
        }

        // Handle JSON / OpenAPI spec format
        if (specType === 'OPENAPI' || (content.trim().startsWith('{') && content.trim().endsWith('}'))) {
            try {
                const parsedJson = JSON.parse(content);
                return this._parseJsonSections(parsedJson);
            } catch (e) {
                // Fallback to text parsing if JSON parse fails
            }
        }

        const lines = content.split(/\r?\n/);
        const sections = [];
        let currentSection = {
            title: 'Overview',
            content: '',
            level: 1,
            bullets: [],
            codeBlocks: [],
            lines: []
        };

        let inCodeBlock = false;
        let currentCodeBlock = [];

        for (const line of lines) {
            const trimmed = line.trim();

            if (trimmed.startsWith('```')) {
                if (inCodeBlock) {
                    currentSection.codeBlocks.push(currentCodeBlock.join('\n'));
                    currentCodeBlock = [];
                    inCodeBlock = false;
                } else {
                    inCodeBlock = true;
                }
                currentSection.lines.push(line);
                continue;
            }

            if (inCodeBlock) {
                currentCodeBlock.push(line);
                currentSection.lines.push(line);
                continue;
            }

            const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
            if (headerMatch) {
                const headerTitle = headerMatch[2].trim();
                const level = headerMatch[1].length;

                const rawContent = currentSection.lines.join('\n').trim();
                if (rawContent || currentSection.bullets.length > 0 || currentSection.codeBlocks.length > 0) {
                    currentSection.content = rawContent;
                    delete currentSection.lines;
                    sections.push(currentSection);
                }

                currentSection = {
                    title: headerTitle,
                    content: '',
                    level,
                    bullets: [],
                    codeBlocks: [],
                    lines: []
                };
                continue;
            }

            if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s+/.test(trimmed)) {
                const bulletText = trimmed.replace(/^([-*]|\d+\.)\s+/, '').trim();
                currentSection.bullets.push(bulletText);
            }

            currentSection.lines.push(line);
        }

        const rawContent = currentSection ? currentSection.lines.join('\n').trim() : '';
        if (currentSection && (rawContent || currentSection.bullets.length > 0 || currentSection.codeBlocks.length > 0 || sections.length === 0)) {
            currentSection.content = rawContent;
            delete currentSection.lines;
            sections.push(currentSection);
        }

        return sections.length > 0 ? sections : [{ title: 'Overview', content, level: 1, bullets: [], codeBlocks: [] }];
    }

    _parseJsonSections(jsonObj) {
        const sections = [];

        if (jsonObj.info) {
            sections.push({
                title: jsonObj.info.title || 'API Information',
                content: jsonObj.info.description || JSON.stringify(jsonObj.info),
                level: 1,
                bullets: [
                    `Version: ${jsonObj.info.version || '1.0.0'}`
                ],
                codeBlocks: []
            });
        }

        if (jsonObj.paths) {
            for (const [pathUrl, methods] of Object.entries(jsonObj.paths)) {
                if (typeof methods === 'object') {
                    for (const [method, details] of Object.entries(methods)) {
                        sections.push({
                            title: `${method.toUpperCase()} ${pathUrl}`,
                            content: details.summary || details.description || `Endpoint ${method.toUpperCase()} ${pathUrl}`,
                            level: 2,
                            bullets: details.tags ? [`Tags: ${details.tags.join(', ')}`] : [],
                            codeBlocks: [JSON.stringify(details, null, 2)]
                        });
                    }
                }
            }
        }

        if (sections.length === 0) {
            for (const [key, val] of Object.entries(jsonObj)) {
                sections.push({
                    title: key,
                    content: typeof val === 'string' ? val : JSON.stringify(val, null, 2),
                    level: 1,
                    bullets: [],
                    codeBlocks: typeof val === 'object' ? [JSON.stringify(val, null, 2)] : []
                });
            }
        }

        return sections;
    }
}

module.exports = BlueprintParser;
