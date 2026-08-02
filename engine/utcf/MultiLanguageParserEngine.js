/******************************************************************************
 * Project        : EAORCS Platform
 * Module         : Multi-Language UTCF Parser Framework
 * File           : MultiLanguageParserEngine.js
 * Version        : 1.0.0
 * Author         : Ujomor Systems & Enterprise Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance Authority
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Enterprise Architecture Controlled
 * - ISO 27001 / SOC 2 / OWASP ASVS / NIST Compliant
 * - Universal Technology Coverage Framework Standard Enforced
 * - Protocol Frozen & Polyglot Parsing Enforced
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

const fs = require('fs');
const path = require('path');

/**
 * UTCF Polyglot Parser Framework.
 * Performs AST and structural extraction across 9 programming languages:
 * Java, Python, Go, Rust, C#, PHP, Kotlin, Swift, and TypeScript.
 */
class MultiLanguageParserEngine {
    constructor(options = {}) {
        this.options = Object.assign({
            strictLanguageDetection: true,
            includeLineNumbers: true
        }, options);

        this.supportedLanguages = [
            { id: 'java', name: 'Java', extensions: ['.java'] },
            { id: 'python', name: 'Python', extensions: ['.py', '.pyw'] },
            { id: 'go', name: 'Go', extensions: ['.go'] },
            { id: 'rust', name: 'Rust', extensions: ['.rs'] },
            { id: 'csharp', name: 'C#', extensions: ['.cs'] },
            { id: 'php', name: 'PHP', extensions: ['.php'] },
            { id: 'kotlin', name: 'Kotlin', extensions: ['.kt', '.kts'] },
            { id: 'swift', name: 'Swift', extensions: ['.swift'] },
            { id: 'typescript', name: 'TypeScript', extensions: ['.ts', '.tsx', '.js', '.jsx'] }
        ];

        this.extensionMap = new Map();
        for (const lang of this.supportedLanguages) {
            for (const ext of lang.extensions) {
                this.extensionMap.set(ext, lang.id);
            }
        }
    }

    /**
     * Returns list of 9 supported languages and metadata.
     * @returns {Array<Object>} List of supported languages.
     */
    getSupportedLanguages() {
        return this.supportedLanguages.map(l => ({
            id: l.id,
            name: l.name,
            extensions: l.extensions
        }));
    }

    /**
     * Detects programming language based on file extension.
     * @param {string} filePath - Path to file.
     * @returns {string} Supported language identifier.
     */
    detectLanguage(filePath) {
        if (!filePath || typeof filePath !== 'string') {
            throw new Error('Invalid file path: filePath must be a non-empty string');
        }

        const ext = path.extname(filePath).toLowerCase();
        if (this.extensionMap.has(ext)) {
            return this.extensionMap.get(ext);
        }

        if (this.options.strictLanguageDetection) {
            throw new Error(`Unsupported file extension '${ext}' for language detection on '${filePath}'`);
        }

        return 'unknown';
    }

    /**
     * Parses a source code file and produces a normalized AST representation.
     * @param {string} filePath - Path to source code file.
     * @param {string} [codeContent=null] - Optional pre-loaded code content string.
     * @returns {Object} Normalized AST structure.
     */
    parseSourceFile(filePath, codeContent = null) {
        const language = this.detectLanguage(filePath);

        let sourceCode = codeContent;
        if (sourceCode === null || sourceCode === undefined) {
            if (!fs.existsSync(filePath)) {
                throw new Error(`Source file not found at path: ${filePath}`);
            }
            sourceCode = fs.readFileSync(filePath, 'utf8');
        }

        return this.extractAST(language, sourceCode, filePath);
    }

    /**
     * Extracts normalized AST components (classes, functions, imports, annotations, exports) for a given language.
     * @param {string} language - Target language identifier.
     * @param {string} codeContent - Code content string.
     * @param {string} [filePath=''] - Optional file path reference.
     * @returns {Object} Normalized AST structure.
     */
    extractAST(language, codeContent, filePath = '') {
        const lang = (language || '').toLowerCase();
        if (!codeContent && codeContent !== '') {
            throw new Error('Invalid code content: codeContent must be a string');
        }

        const normalizedAST = {
            language: lang,
            filePath,
            classes: [],
            functions: [],
            imports: [],
            annotations: [],
            exports: []
        };

        const lines = codeContent.split(/\r?\n/);

        switch (lang) {
            case 'java':
                this._extractJava(lines, normalizedAST);
                break;
            case 'python':
                this._extractPython(lines, normalizedAST);
                break;
            case 'go':
                this._extractGo(lines, normalizedAST);
                break;
            case 'rust':
                this._extractRust(lines, normalizedAST);
                break;
            case 'csharp':
                this._extractCSharp(lines, normalizedAST);
                break;
            case 'php':
                this._extractPHP(lines, normalizedAST);
                break;
            case 'kotlin':
                this._extractKotlin(lines, normalizedAST);
                break;
            case 'swift':
                this._extractSwift(lines, normalizedAST);
                break;
            case 'typescript':
            case 'javascript':
                this._extractTypeScript(lines, normalizedAST);
                break;
            default:
                throw new Error(`Language '${language}' is not supported by UTCF MultiLanguageParserEngine`);
        }

        return normalizedAST;
    }

    // -------------------------------------------------------------------------
    // Language Extractors
    // -------------------------------------------------------------------------

    _extractJava(lines, ast) {
        lines.forEach((line, idx) => {
            const lineNum = idx + 1;
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return;

            // Imports
            const importMatch = trimmed.match(/^import\s+(?:static\s+)?([\w.]+);/);
            if (importMatch) {
                ast.imports.push({ module: importMatch[1], alias: null, line: lineNum });
            }

            // Annotations
            const annMatch = trimmed.match(/^@([A-Z]\w*)(?:\((.*?)\))?/);
            if (annMatch) {
                ast.annotations.push({ name: annMatch[1], target: null, line: lineNum });
            }

            // Classes / Interfaces / Enums / Records
            const classMatch = trimmed.match(/(?:public|protected|private|static|final|abstract|\s)*\b(class|interface|enum|record)\s+([A-Z]\w*)/);
            if (classMatch) {
                const isPublic = trimmed.includes('public');
                const item = { name: classMatch[2], type: classMatch[1], visibility: isPublic ? 'public' : 'package-private', line: lineNum };
                ast.classes.push(item);
                if (isPublic) {
                    ast.exports.push({ name: item.name, type: item.type, line: lineNum });
                }
            }

            // Functions / Methods
            const funcMatch = trimmed.match(/(?:public|protected|private|static|final|synchronized|abstract|\s)+([\w<>\[\]\?]+)\s+([a-z_]\w*)\s*\(([^)]*)\)/);
            if (funcMatch && !['if', 'for', 'while', 'switch', 'catch'].includes(funcMatch[2])) {
                const isPublic = trimmed.includes('public');
                ast.functions.push({
                    name: funcMatch[2],
                    returnType: funcMatch[1],
                    params: funcMatch[3] ? funcMatch[3].split(',').map(p => p.trim()) : [],
                    visibility: isPublic ? 'public' : 'private',
                    line: lineNum
                });
            }
        });
    }

    _extractPython(lines, ast) {
        lines.forEach((line, idx) => {
            const lineNum = idx + 1;
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) return;

            // Imports
            const importMatch = trimmed.match(/^import\s+([\w., ]+)/);
            if (importMatch) {
                ast.imports.push({ module: importMatch[1].trim(), alias: null, line: lineNum });
            }
            const fromImportMatch = trimmed.match(/^from\s+([\w.]+)\s+import\s+([\w, *()]+)/);
            if (fromImportMatch) {
                ast.imports.push({ module: `${fromImportMatch[1]}.${fromImportMatch[2].trim()}`, alias: null, line: lineNum });
            }

            // Decorators (Annotations)
            const decMatch = trimmed.match(/^@([a-zA-Z_][\w.]*)(?:\((.*?)\))?/);
            if (decMatch) {
                ast.annotations.push({ name: decMatch[1], target: null, line: lineNum });
            }

            // Classes
            const classMatch = trimmed.match(/^class\s+([A-Za-z_]\w*)(?:\(([^)]*)\))?:/);
            if (classMatch) {
                const item = { name: classMatch[1], type: 'class', bases: classMatch[2] || null, line: lineNum };
                ast.classes.push(item);
                if (!item.name.startsWith('_')) {
                    ast.exports.push({ name: item.name, type: 'class', line: lineNum });
                }
            }

            // Functions
            const funcMatch = trimmed.match(/^def\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)(?:\s*->\s*([^:]+))?:/);
            if (funcMatch) {
                const item = {
                    name: funcMatch[1],
                    params: funcMatch[2] ? funcMatch[2].split(',').map(p => p.trim()) : [],
                    returnType: funcMatch[3] ? funcMatch[3].trim() : null,
                    line: lineNum
                };
                ast.functions.push(item);
                if (!item.name.startsWith('_')) {
                    ast.exports.push({ name: item.name, type: 'function', line: lineNum });
                }
            }
        });
    }

    _extractGo(lines, ast) {
        let inImportBlock = false;

        lines.forEach((line, idx) => {
            const lineNum = idx + 1;
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('//')) {
                const commentAnnMatch = trimmed.match(/\/\/\s*@([a-zA-Z_]\w*)|go:(\w+)/);
                if (commentAnnMatch) {
                    ast.annotations.push({ name: commentAnnMatch[1] || commentAnnMatch[2], target: null, line: lineNum });
                }
                return;
            }

            // Imports
            if (trimmed === 'import (') {
                inImportBlock = true;
                return;
            }
            if (inImportBlock) {
                if (trimmed === ')') {
                    inImportBlock = false;
                    return;
                }
                const match = trimmed.match(/(?:(\w+)\s+)?"([^"]+)"/);
                if (match) {
                    ast.imports.push({ module: match[2], alias: match[1] || null, line: lineNum });
                }
                return;
            }
            const singleImport = trimmed.match(/^import\s+(?:(\w+)\s+)?"([^"]+)"/);
            if (singleImport) {
                ast.imports.push({ module: singleImport[2], alias: singleImport[1] || null, line: lineNum });
            }

            // Structs / Interfaces (Classes equivalent)
            const typeMatch = trimmed.match(/^type\s+([A-Z]\w*)\s+(struct|interface)/);
            if (typeMatch) {
                const item = { name: typeMatch[1], type: typeMatch[2], line: lineNum };
                ast.classes.push(item);
                ast.exports.push({ name: item.name, type: item.type, line: lineNum });
            }

            // Functions
            const funcMatch = trimmed.match(/^func\s+(?:\([^)]+\)\s+)?([A-Za-z_]\w*)\s*\(([^)]*)\)(?:\s*(?:\([^)]*\)|[^\s{]+))?/);
            if (funcMatch) {
                const name = funcMatch[1];
                const isExported = /^[A-Z]/.test(name);
                const item = {
                    name,
                    params: funcMatch[2] ? funcMatch[2].split(',').map(p => p.trim()) : [],
                    visibility: isExported ? 'exported' : 'unexported',
                    line: lineNum
                };
                ast.functions.push(item);
                if (isExported) {
                    ast.exports.push({ name, type: 'function', line: lineNum });
                }
            }
        });
    }

    _extractRust(lines, ast) {
        lines.forEach((line, idx) => {
            const lineNum = idx + 1;
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('//')) return;

            // Imports (use statements)
            const useMatch = trimmed.match(/^use\s+([^;]+);/);
            if (useMatch) {
                ast.imports.push({ module: useMatch[1].trim(), alias: null, line: lineNum });
            }

            // Attributes (Annotations)
            const attrMatch = trimmed.match(/^#!?\[([^\]]+)\]/);
            if (attrMatch) {
                ast.annotations.push({ name: attrMatch[1].trim(), target: null, line: lineNum });
            }

            // Structs / Enums / Traits / Unions
            const typeMatch = trimmed.match(/(?:pub(?:\(crate\))?\s+)?(struct|enum|trait|union)\s+([A-Za-z_]\w*)/);
            if (typeMatch) {
                const isPub = trimmed.startsWith('pub');
                const item = { name: typeMatch[2], type: typeMatch[1], visibility: isPub ? 'public' : 'private', line: lineNum };
                ast.classes.push(item);
                if (isPub) {
                    ast.exports.push({ name: item.name, type: item.type, line: lineNum });
                }
            }

            // Functions
            const fnMatch = trimmed.match(/(?:pub(?:\(crate\))?\s+)?(?:async\s+)?(?:const\s+)?fn\s+([a-z_]\w*)\s*(?:<[^>]+>)?\s*\(([^)]*)\)(?:\s*->\s*([^{\s]+))?/);
            if (fnMatch) {
                const isPub = trimmed.startsWith('pub');
                const item = {
                    name: fnMatch[1],
                    params: fnMatch[2] ? fnMatch[2].split(',').map(p => p.trim()) : [],
                    returnType: fnMatch[3] ? fnMatch[3].trim() : '()',
                    visibility: isPub ? 'public' : 'private',
                    line: lineNum
                };
                ast.functions.push(item);
                if (isPub) {
                    ast.exports.push({ name: item.name, type: 'function', line: lineNum });
                }
            }
        });
    }

    _extractCSharp(lines, ast) {
        lines.forEach((line, idx) => {
            const lineNum = idx + 1;
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('//')) return;

            // Imports (using)
            const usingMatch = trimmed.match(/^using\s+([^;]+);/);
            if (usingMatch) {
                ast.imports.push({ module: usingMatch[1].trim(), alias: null, line: lineNum });
            }

            // Attributes
            const attrMatch = trimmed.match(/^\[([A-Z]\w*)(?:\((.*?)\))?\]/);
            if (attrMatch) {
                ast.annotations.push({ name: attrMatch[1], target: null, line: lineNum });
            }

            // Classes / Structs / Interfaces / Enums / Records
            const classMatch = trimmed.match(/(?:public|protected|private|internal|abstract|sealed|static|\s)*\b(class|struct|interface|enum|record)\s+([A-Z]\w*)/);
            if (classMatch) {
                const isPublic = trimmed.includes('public');
                const item = { name: classMatch[2], type: classMatch[1], visibility: isPublic ? 'public' : 'internal', line: lineNum };
                ast.classes.push(item);
                if (isPublic) {
                    ast.exports.push({ name: item.name, type: item.type, line: lineNum });
                }
            }

            // Functions / Methods
            const funcMatch = trimmed.match(/(?:public|protected|private|internal|static|async|virtual|override|abstract|\s)+([\w<>\[\]\?]+)\s+([A-Z]\w*)\s*\(([^)]*)\)/);
            if (funcMatch && !['Class', 'Struct', 'If', 'For', 'While'].includes(funcMatch[2])) {
                const isPublic = trimmed.includes('public');
                ast.functions.push({
                    name: funcMatch[2],
                    returnType: funcMatch[1],
                    params: funcMatch[3] ? funcMatch[3].split(',').map(p => p.trim()) : [],
                    visibility: isPublic ? 'public' : 'private',
                    line: lineNum
                });
            }
        });
    }

    _extractPHP(lines, ast) {
        lines.forEach((line, idx) => {
            const lineNum = idx + 1;
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*')) return;

            // Attributes / Annotations (PHP 8 #[Attribute])
            const attrMatch = trimmed.match(/^#\[([^\]]+)\]/);
            if (attrMatch) {
                ast.annotations.push({ name: attrMatch[1], target: null, line: lineNum });
                return;
            }

            // Skip standard shell-style comment starting with #
            if (trimmed.startsWith('#')) return;

            // Imports (use)
            const useMatch = trimmed.match(/^use\s+([^;]+);/);
            if (useMatch) {
                ast.imports.push({ module: useMatch[1].trim(), alias: null, line: lineNum });
            }

            // Classes / Traits / Interfaces
            const classMatch = trimmed.match(/(?:abstract|final|readonly|\s)*\b(class|interface|trait|enum)\s+([A-Za-z_]\w*)/);
            if (classMatch) {
                const item = { name: classMatch[2], type: classMatch[1], line: lineNum };
                ast.classes.push(item);
                ast.exports.push({ name: item.name, type: item.type, line: lineNum });
            }

            // Functions
            const funcMatch = trimmed.match(/(?:public|protected|private|static|\s)*function\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)/);
            if (funcMatch) {
                const isPublic = !trimmed.includes('private') && !trimmed.includes('protected');
                const item = {
                    name: funcMatch[1],
                    params: funcMatch[2] ? funcMatch[2].split(',').map(p => p.trim()) : [],
                    visibility: isPublic ? 'public' : 'private',
                    line: lineNum
                };
                ast.functions.push(item);
                if (isPublic) {
                    ast.exports.push({ name: item.name, type: 'function', line: lineNum });
                }
            }
        });
    }

    _extractKotlin(lines, ast) {
        lines.forEach((line, idx) => {
            const lineNum = idx + 1;
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('//')) return;

            // Imports
            const importMatch = trimmed.match(/^import\s+([\w.]+)(?:\s+as\s+(\w+))?/);
            if (importMatch) {
                ast.imports.push({ module: importMatch[1], alias: importMatch[2] || null, line: lineNum });
            }

            // Annotations
            const annMatch = trimmed.match(/^@([A-Z]\w*)(?:\((.*?)\))?/);
            if (annMatch) {
                ast.annotations.push({ name: annMatch[1], target: null, line: lineNum });
            }

            // Classes / Objects / Interfaces
            const classMatch = trimmed.match(/(?:public|protected|private|internal|open|abstract|sealed|data|enum|inner|\s)*\b(class|interface|object|enum class)\s+([A-Z]\w*)/);
            if (classMatch) {
                const isPrivate = trimmed.includes('private');
                const item = { name: classMatch[2], type: classMatch[1], visibility: isPrivate ? 'private' : 'public', line: lineNum };
                ast.classes.push(item);
                if (!isPrivate) {
                    ast.exports.push({ name: item.name, type: item.type, line: lineNum });
                }
            }

            // Functions
            const funcMatch = trimmed.match(/(?:public|protected|private|internal|override|open|suspend|inline|operator|\s)*fun\s+(?:<[^>]+>\s+)?([a-zA-Z_]\w*)\s*\(([^)]*)\)/);
            if (funcMatch) {
                const isPrivate = trimmed.includes('private');
                const item = {
                    name: funcMatch[1],
                    params: funcMatch[2] ? funcMatch[2].split(',').map(p => p.trim()) : [],
                    visibility: isPrivate ? 'private' : 'public',
                    line: lineNum
                };
                ast.functions.push(item);
                if (!isPrivate) {
                    ast.exports.push({ name: item.name, type: 'function', line: lineNum });
                }
            }
        });
    }

    _extractSwift(lines, ast) {
        lines.forEach((line, idx) => {
            const lineNum = idx + 1;
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('//')) return;

            // Imports
            const importMatch = trimmed.match(/^import\s+([A-Za-z_]\w*)/);
            if (importMatch) {
                ast.imports.push({ module: importMatch[1], alias: null, line: lineNum });
            }

            // Attributes (Annotations)
            const attrMatch = trimmed.match(/^@([A-Za-z_]\w*)(?:\((.*?)\))?/);
            if (attrMatch) {
                ast.annotations.push({ name: attrMatch[1], target: null, line: lineNum });
            }

            // Classes / Structs / Enums / Protocols
            const classMatch = trimmed.match(/(?:public|open|private|fileprivate|internal|final|\s)*\b(class|struct|enum|protocol|extension)\s+([A-Z]\w*)/);
            if (classMatch) {
                const isPublic = trimmed.includes('public') || trimmed.includes('open');
                const item = { name: classMatch[2], type: classMatch[1], visibility: isPublic ? 'public' : 'internal', line: lineNum };
                ast.classes.push(item);
                if (isPublic) {
                    ast.exports.push({ name: item.name, type: item.type, line: lineNum });
                }
            }

            // Functions
            const funcMatch = trimmed.match(/(?:public|open|private|fileprivate|internal|static|class|override|\s)*func\s+([a-zA-Z_]\w*)\s*(?:<[^>]+>)?\s*\(([^)]*)\)/);
            if (funcMatch) {
                const isPublic = trimmed.includes('public') || trimmed.includes('open');
                const item = {
                    name: funcMatch[1],
                    params: funcMatch[2] ? funcMatch[2].split(',').map(p => p.trim()) : [],
                    visibility: isPublic ? 'public' : 'internal',
                    line: lineNum
                };
                ast.functions.push(item);
                if (isPublic) {
                    ast.exports.push({ name: item.name, type: 'function', line: lineNum });
                }
            }
        });
    }

    _extractTypeScript(lines, ast) {
        lines.forEach((line, idx) => {
            const lineNum = idx + 1;
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*')) return;

            // Imports
            const importMatch = trimmed.match(/^import\s+(?:{[^}]+}|[^{}\n]+)\s+from\s+['"]([^'"]+)['"]/);
            if (importMatch) {
                ast.imports.push({ module: importMatch[1], alias: null, line: lineNum });
            }
            const reqMatch = trimmed.match(/(?:const|let|var)\s+.*?=\s*require\(['"]([^'"]+)['"]\)/);
            if (reqMatch) {
                ast.imports.push({ module: reqMatch[1], alias: null, line: lineNum });
            }

            // Decorators (Annotations)
            const decMatch = trimmed.match(/^@([A-Za-z_]\w*)(?:\((.*?)\))?/);
            if (decMatch) {
                ast.annotations.push({ name: decMatch[1], target: null, line: lineNum });
            }

            // Classes / Interfaces / Types / Enums
            const classMatch = trimmed.match(/(?:export\s+)?(?:default\s+)?(?:abstract\s+)?\b(class|interface|type|enum)\s+([A-Z]\w*)/);
            if (classMatch) {
                const isExported = trimmed.startsWith('export');
                const item = { name: classMatch[2], type: classMatch[1], visibility: isExported ? 'exported' : 'internal', line: lineNum };
                ast.classes.push(item);
                if (isExported) {
                    ast.exports.push({ name: item.name, type: item.type, line: lineNum });
                }
            }

            // Functions & Methods
            const funcMatch = trimmed.match(/(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z_]\w*)\s*(?:<[^>]+>)?\s*\(([^)]*)\)/);
            const arrowMatch = trimmed.match(/(?:export\s+)?(?:const|let|var)\s+([a-zA-Z_]\w*)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>/);
            const methodMatch = trimmed.match(/(?:public|private|protected|static|async|\s)+([a-zA-Z_]\w*)\s*\(([^)]*)\)/);
            const fn = funcMatch || arrowMatch || (methodMatch && !['if', 'for', 'while', 'switch', 'constructor'].includes(methodMatch[1]) ? methodMatch : null);
            if (fn) {
                const isExported = trimmed.startsWith('export');
                const item = {
                    name: fn[1],
                    params: fn[2] ? fn[2].split(',').map(p => p.trim()) : [],
                    visibility: isExported ? 'exported' : 'internal',
                    line: lineNum
                };
                ast.functions.push(item);
                if (isExported) {
                    ast.exports.push({ name: item.name, type: 'function', line: lineNum });
                }
            }
        });
    }
}

module.exports = MultiLanguageParserEngine;
