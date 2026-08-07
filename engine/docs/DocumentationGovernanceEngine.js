/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Documentation Governance Engine
 * File           : DocumentationGovernanceEngine.js
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
 * CORP: Stream 2 — Documentation Governance & Engines
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

class DocumentationGovernanceEngine {
    constructor() {}

    /**
     * Helper to recursively scan markdown files in a directory or single file.
     */
    _scanMarkdownFiles(docDir) {
        let results = [];
        if (!docDir || !fs.existsSync(docDir)) return results;
        const stat = fs.statSync(docDir);
        if (stat.isFile()) {
            if (docDir.endsWith('.md')) results.push(path.resolve(docDir));
            return results;
        }
        const list = fs.readdirSync(docDir);
        for (const file of list) {
            const fullPath = path.join(docDir, file);
            const fileStat = fs.statSync(fullPath);
            if (fileStat.isDirectory()) {
                results = results.concat(this._scanMarkdownFiles(fullPath));
            } else if (file.endsWith('.md')) {
                results.push(path.resolve(fullPath));
            }
        }
        return results;
    }

    /**
     * Scans markdown files for relative links and checks target file existence.
     */
    detectBrokenReferences(docDir) {
        const mdFiles = this._scanMarkdownFiles(docDir);
        const brokenLinks = [];
        const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;

        for (const file of mdFiles) {
            const content = fs.readFileSync(file, 'utf8');
            let match;
            while ((match = linkRegex.exec(content)) !== null) {
                const linkText = match[1];
                let linkTarget = match[2].trim();

                // Skip external URLs, mailto, anchor-only links, data URIs
                if (/^(https?:\/\/|mailto:|ftp:|data:|#)/i.test(linkTarget)) {
                    continue;
                }

                // Strip anchor fragments and query params
                const targetClean = linkTarget.split('#')[0].split('?')[0];
                if (!targetClean) continue;

                // Resolve path relative to markdown file directory
                const fileDir = path.dirname(file);
                const resolvedTarget = path.resolve(fileDir, targetClean);

                if (!fs.existsSync(resolvedTarget)) {
                    brokenLinks.push({
                        file: path.relative(docDir || process.cwd(), file),
                        linkText,
                        linkTarget,
                        resolvedTarget
                    });
                }
            }
        }

        return {
            totalFilesScanned: mdFiles.length,
            brokenLinksCount: brokenLinks.length,
            brokenLinks,
            passed: brokenLinks.length === 0
        };
    }

    /**
     * Checks for duplicated constitutional/normative rules across documents.
     */
    detectNormativeRuleDuplication(docDir) {
        const mdFiles = this._scanMarkdownFiles(docDir);
        const ruleOccurrences = new Map();
        const ruleRegex = /(?:Law\s+\d+:\s*[^.\r\n]+|Rule\s+\d+:\s*[^.\r\n]+|\[CONSTITUTIONAL_RULE_[A-Z0-9_]+\])/gi;

        for (const file of mdFiles) {
            const content = fs.readFileSync(file, 'utf8');
            const relFile = path.relative(docDir || process.cwd(), file);
            let match;
            while ((match = ruleRegex.exec(content)) !== null) {
                const rawRule = match[0].trim();
                const normalizedKey = rawRule.toLowerCase().replace(/\s+/g, ' ');

                if (!ruleOccurrences.has(normalizedKey)) {
                    ruleOccurrences.set(normalizedKey, {
                        ruleText: rawRule,
                        locations: []
                    });
                }
                const entry = ruleOccurrences.get(normalizedKey);
                if (!entry.locations.includes(relFile)) {
                    entry.locations.push(relFile);
                }
            }
        }

        const duplicatedRules = [];
        for (const [key, val] of ruleOccurrences.entries()) {
            if (val.locations.length > 1) {
                duplicatedRules.push({
                    rule: val.ruleText,
                    occurrencesCount: val.locations.length,
                    files: val.locations
                });
            }
        }

        return {
            totalRulesFound: ruleOccurrences.size,
            duplicatedRulesCount: duplicatedRules.length,
            duplicatedRules,
            passed: duplicatedRules.length === 0
        };
    }

    /**
     * Checks for documents unreferenced in index.
     */
    detectOrphanDocuments(docDir, masterIndex) {
        const mdFiles = this._scanMarkdownFiles(docDir);
        let indexContent = '';
        let masterIndexPath = null;

        if (typeof masterIndex === 'string') {
            if (fs.existsSync(masterIndex)) {
                masterIndexPath = path.resolve(masterIndex);
                indexContent = fs.readFileSync(masterIndexPath, 'utf8');
            } else {
                indexContent = masterIndex;
            }
        } else if (docDir && fs.existsSync(docDir)) {
            const candidateIndex = path.join(docDir, 'README.md');
            if (fs.existsSync(candidateIndex)) {
                masterIndexPath = path.resolve(candidateIndex);
                indexContent = fs.readFileSync(masterIndexPath, 'utf8');
            }
        }

        const orphanFiles = [];
        for (const file of mdFiles) {
            if (masterIndexPath && path.resolve(file) === masterIndexPath) {
                continue;
            }
            const baseName = path.basename(file);
            const relPath = docDir ? path.relative(docDir, file).replace(/\\/g, '/') : baseName;

            if (!indexContent.includes(baseName) && !indexContent.includes(relPath)) {
                orphanFiles.push(path.relative(docDir || process.cwd(), file));
            }
        }

        return {
            totalDocsScanned: mdFiles.length,
            orphanFilesCount: orphanFiles.length,
            orphanFiles,
            passed: orphanFiles.length === 0
        };
    }

    /**
     * Checks CLI commands and API endpoints against docs.
     */
    detectDocumentationDrift(docDir, codeRegistry) {
        const mdFiles = this._scanMarkdownFiles(docDir);
        let combinedDocs = '';
        for (const file of mdFiles) {
            combinedDocs += '\n' + fs.readFileSync(file, 'utf8');
        }

        const registry = codeRegistry || {};
        const commands = registry.commands || registry.cliCommands || [];
        const endpoints = registry.endpoints || registry.apiEndpoints || [];

        const missingCommands = [];
        for (const cmd of commands) {
            const searchStr = typeof cmd === 'string' ? cmd : cmd.name || cmd.command;
            if (searchStr && !combinedDocs.includes(searchStr)) {
                missingCommands.push(searchStr);
            }
        }

        const missingEndpoints = [];
        for (const ep of endpoints) {
            const searchStr = typeof ep === 'string' ? ep : ep.path || ep.endpoint;
            if (searchStr && !combinedDocs.includes(searchStr)) {
                missingEndpoints.push(searchStr);
            }
        }

        const driftCount = missingCommands.length + missingEndpoints.length;

        return {
            totalCommandsChecked: commands.length,
            totalEndpointsChecked: endpoints.length,
            missingCommands,
            missingEndpoints,
            driftCount,
            passed: driftCount === 0
        };
    }

    /**
     * Runs all doc checks and returns qualification suite result.
     */
    runDocumentationQualificationSuite(docDir, options = {}) {
        const codeRegistry = options.codeRegistry || { commands: [], endpoints: [] };
        const masterIndex = options.masterIndex || null;

        const brokenRefRes = this.detectBrokenReferences(docDir);
        const dupRuleRes = this.detectNormativeRuleDuplication(docDir);
        const orphanRes = this.detectOrphanDocuments(docDir, masterIndex);
        const driftRes = this.detectDocumentationDrift(docDir, codeRegistry);

        const summary = {
            brokenReferences: brokenRefRes,
            ruleDuplication: dupRuleRes,
            orphanDocuments: orphanRes,
            documentationDrift: driftRes,
            executedAt: new Date().toISOString()
        };

        const passed = brokenRefRes.passed && dupRuleRes.passed && orphanRes.passed && driftRes.passed;

        const evidenceHash = crypto.createHash('sha256')
            .update(JSON.stringify({
                docDir: docDir || '',
                passed,
                brokenCount: brokenRefRes.brokenLinksCount,
                dupCount: dupRuleRes.duplicatedRulesCount,
                orphanCount: orphanRes.orphanFilesCount,
                driftCount: driftRes.driftCount
            }))
            .digest('hex');

        return {
            passed,
            evidenceHash,
            summary
        };
    }

    /**
     * Builds a Directed Acyclic Graph (DAG) of documentation dependencies (Level 0 -> Level 7).
     * @param {string} docDir 
     * @param {string|Object} [masterIndex] 
     * @returns {Object} Directed graph structure with levels, nodes, edges, adjacencyList, topologicalSort, and acyclic check.
     */
    buildDocumentationDAG(docDir, masterIndex) {
        const hierarchyLevels = [
            { level: 0, name: 'Level 0: Corporate Governance' },
            { level: 1, name: 'Level 1: UAIGOS Constitution' },
            { level: 2, name: 'Level 2: EAORCS Governance Blueprint' },
            { level: 3, name: 'Level 3: Enterprise Architecture Standards' },
            { level: 4, name: 'Level 4: Reference Architectures' },
            { level: 5, name: 'Level 5: Product-Specific ADRs' },
            { level: 6, name: 'Level 6: Implementation Guides' },
            { level: 7, name: 'Level 7: Generated Documentation' }
        ];

        const mdFiles = this._scanMarkdownFiles(docDir);
        let masterIndexPath = null;
        let masterContent = '';

        if (typeof masterIndex === 'string') {
            if (fs.existsSync(masterIndex)) {
                masterIndexPath = path.resolve(masterIndex);
                masterContent = fs.readFileSync(masterIndexPath, 'utf8');
            } else {
                masterContent = masterIndex;
            }
        }

        const nodesMap = new Map();

        const detectLevel = (filePath, content) => {
            const match = content.match(/Level\s+([0-7])/i);
            if (match) return parseInt(match[1], 10);

            const fileNorm = filePath.toLowerCase().replace(/\\/g, '/');
            if (fileNorm.includes('master_governance_index') || fileNorm.includes('corporate')) return 0;
            if (fileNorm.includes('constitution')) return 1;
            if (fileNorm.includes('blueprint') || fileNorm.includes('governance')) return 2;
            if (fileNorm.includes('standard') || fileNorm.includes('schema')) return 3;
            if (fileNorm.includes('architecture') || fileNorm.includes('ref_arch')) return 4;
            if (fileNorm.includes('adr')) return 5;
            if (fileNorm.includes('guide') || fileNorm.includes('workflow') || fileNorm.includes('integration')) return 6;
            if (fileNorm.includes('generated') || fileNorm.includes('dist') || fileNorm.includes('api')) return 7;

            return 6;
        };

        for (const file of mdFiles) {
            const relPath = docDir ? path.relative(docDir, file).replace(/\\/g, '/') : path.basename(file);
            const content = fs.readFileSync(file, 'utf8');
            const level = detectLevel(file, content);
            const titleMatch = content.match(/^#\s+(.+)$/m);
            const title = titleMatch ? titleMatch[1].trim() : path.basename(file, '.md');

            nodesMap.set(relPath, {
                id: relPath,
                file: path.resolve(file),
                title,
                level,
                levelName: hierarchyLevels[level].name
            });
        }

        if (masterIndexPath && !Array.from(nodesMap.values()).some(n => n.file === masterIndexPath)) {
            const masterRel = docDir ? path.relative(docDir, masterIndexPath).replace(/\\/g, '/') : path.basename(masterIndexPath);
            nodesMap.set(masterRel, {
                id: masterRel,
                file: masterIndexPath,
                title: 'Master Governance Index',
                level: 0,
                levelName: hierarchyLevels[0].name
            });
        }

        const edges = [];
        const adjacencyList = {};

        for (const [id, node] of nodesMap.entries()) {
            adjacencyList[id] = [];
            const content = fs.existsSync(node.file) ? fs.readFileSync(node.file, 'utf8') : '';
            const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
            let match;
            while ((match = linkRegex.exec(content)) !== null) {
                const linkTarget = match[2].trim().split('#')[0].split('?')[0];
                if (!linkTarget || /^(https?:\/\/|mailto:)/i.test(linkTarget)) continue;

                const fileDir = path.dirname(node.file);
                const resolvedTarget = path.resolve(fileDir, linkTarget);
                const targetRel = docDir ? path.relative(docDir, resolvedTarget).replace(/\\/g, '/') : path.basename(resolvedTarget);

                if (nodesMap.has(targetRel) && targetRel !== id) {
                    if (!adjacencyList[id].includes(targetRel)) {
                        adjacencyList[id].push(targetRel);
                        edges.push({
                            from: id,
                            to: targetRel,
                            fromLevel: node.level,
                            toLevel: nodesMap.get(targetRel).level
                        });
                    }
                }
            }
        }

        const inDegree = {};
        for (const id of nodesMap.keys()) {
            inDegree[id] = 0;
        }
        for (const id of nodesMap.keys()) {
            for (const neighbor of adjacencyList[id]) {
                inDegree[neighbor] = (inDegree[neighbor] || 0) + 1;
            }
        }

        const queue = [];
        for (const id of nodesMap.keys()) {
            if (inDegree[id] === 0) queue.push(id);
        }

        const topologicalSort = [];
        while (queue.length > 0) {
            const curr = queue.shift();
            topologicalSort.push(curr);
            for (const neighbor of (adjacencyList[curr] || [])) {
                inDegree[neighbor]--;
                if (inDegree[neighbor] === 0) queue.push(neighbor);
            }
        }

        const isAcyclic = topologicalSort.length === nodesMap.size;
        const nodes = Array.from(nodesMap.values());

        const levelsResult = hierarchyLevels.map(h => ({
            level: h.level,
            name: h.name,
            docs: nodes.filter(n => n.level === h.level)
        }));

        return {
            levels: levelsResult,
            nodes,
            edges,
            adjacencyList,
            isAcyclic,
            topologicalSort,
            totalNodes: nodes.length,
            totalEdges: edges.length
        };
    }

    /**
     * Generates Mermaid & ASCII capability maps, bounded context maps, and dependency diagrams.
     * @param {Object} [registry] 
     * @returns {Object} Result object containing mermaid and ascii diagrams.
     */
    generateArchitectureDiagrams(registry) {
        const reg = registry || {};

        const capabilities = reg.capabilities || [
            { id: 'CAP-01', name: 'Governance & Policy Enforcement', components: ['AutonomousPolicyEngine', 'PlatformConstitutionEngine'] },
            { id: 'CAP-02', name: 'Release Engineering & Profiling', components: ['ReleaseProfileEngine', 'EditionEngine'] },
            { id: 'CAP-03', name: 'Architecture & Decision Registry', components: ['ADRRegistryEngine', 'ApiContractEngine'] },
            { id: 'CAP-04', name: 'Documentation & Proof Assurance', components: ['DocumentationGovernanceEngine', 'EvidenceGraphEngine'] }
        ];

        const boundedContexts = reg.boundedContexts || [
            { id: 'BC-GOV', name: 'Core Governance Context', domain: 'Core', dependencies: ['BC-REL'] },
            { id: 'BC-REL', name: 'Release Profile Context', domain: 'Core', dependencies: ['BC-DOC'] },
            { id: 'BC-DOC', name: 'Documentation Context', domain: 'Supporting', dependencies: [] },
            { id: 'BC-AUD', name: 'Audit & Baseline Context', domain: 'Supporting', dependencies: ['BC-DOC'] }
        ];

        const dependencies = reg.dependencies || [
            { source: 'EAORCS Facade', target: 'ReleaseProfileEngine' },
            { source: 'EAORCS Facade', target: 'DocumentationGovernanceEngine' },
            { source: 'ReleaseProfileEngine', target: 'EditionEngine' },
            { source: 'ReleaseProfileEngine', target: 'GovernanceProfileEngine' },
            { source: 'DocumentationGovernanceEngine', target: 'ADRRegistryEngine' },
            { source: 'DocumentationGovernanceEngine', target: 'EvidenceGraphEngine' }
        ];

        let mermaidCap = 'graph TD\n    subgraph Capability_Map["EAORCS Capability Map"]\n';
        capabilities.forEach((cap, idx) => {
            const capId = `C_${idx + 1}`;
            const compList = cap.components.map(c => `"${c}"`).join(', ');
            mermaidCap += `        ${capId}["${cap.name}<br/>(${compList})"]\n`;
        });
        mermaidCap += '    end';

        let mermaidBC = 'graph LR\n    subgraph Bounded_Contexts["EAORCS Bounded Context Map"]\n';
        boundedContexts.forEach(bc => {
            mermaidBC += `        ${bc.id.replace(/[-]/g, '_')}["${bc.name} [${bc.domain}]"]\n`;
        });
        boundedContexts.forEach(bc => {
            if (Array.isArray(bc.dependencies)) {
                bc.dependencies.forEach(dep => {
                    mermaidBC += `        ${bc.id.replace(/[-]/g, '_')} --> ${dep.replace(/[-]/g, '_')}\n`;
                });
            }
        });
        mermaidBC += '    end';

        let mermaidDep = 'graph TD\n    subgraph Component_Dependencies["EAORCS Component Dependency Diagram"]\n';
        dependencies.forEach(dep => {
            const src = dep.source.replace(/[^a-zA-Z0-9_]/g, '_');
            const tgt = dep.target.replace(/[^a-zA-Z0-9_]/g, '_');
            mermaidDep += `        ${src}["${dep.source}"] --> ${tgt}["${dep.target}"]\n`;
        });
        mermaidDep += '    end';

        let asciiCap = '+-------------------------------------------------------------------+\n';
        asciiCap += '|                  EAORCS CAPABILITY MAP DIAGRAM                    |\n';
        asciiCap += '+-------------------------------------------------------------------+\n';
        capabilities.forEach(cap => {
            asciiCap += `| [${cap.id}] ${cap.name.padEnd(52, ' ')}|\n`;
            asciiCap += `|   Components: ${cap.components.join(', ').padEnd(49, ' ')}|\n`;
        });
        asciiCap += '+-------------------------------------------------------------------+';

        let asciiBC = '+-------------------------------------------------------------------+\n';
        asciiBC += '|                 EAORCS BOUNDED CONTEXT MAP                        |\n';
        asciiBC += '+-------------------------------------------------------------------+\n';
        boundedContexts.forEach(bc => {
            const depsStr = (bc.dependencies && bc.dependencies.length > 0) ? ` -> [${bc.dependencies.join(', ')}]` : '';
            asciiBC += `| [${bc.id}] ${bc.name} (${bc.domain})${depsStr.padEnd(30, ' ')}|\n`;
        });
        asciiBC += '+-------------------------------------------------------------------+';

        let asciiDep = '+-------------------------------------------------------------------+\n';
        asciiDep += '|                  EAORCS DEPENDENCY DIAGRAM                        |\n';
        asciiDep += '+-------------------------------------------------------------------+\n';
        dependencies.forEach(dep => {
            asciiDep += `| ${dep.source.padEnd(28, ' ')} ===> ${dep.target.padEnd(30, ' ')}|\n`;
        });
        asciiDep += '+-------------------------------------------------------------------+';

        return {
            mermaid: {
                capabilityMap: mermaidCap,
                boundedContextMap: mermaidBC,
                dependencyDiagram: mermaidDep
            },
            ascii: {
                capabilityMap: asciiCap,
                boundedContextMap: asciiBC,
                dependencyDiagram: asciiDep
            },
            registry: reg
        };
    }
}

module.exports = DocumentationGovernanceEngine;

