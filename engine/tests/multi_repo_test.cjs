/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Multi-Repo Heterogeneous Testing Suite
 * File           : multi_repo_test.cjs
 * Version        : 2026.1-LTS (v1.0.0-FROZEN)
 * Author         : QA & Verification Authority
 * Organization   : Chicitadel / Air Roofers SASU
 * Created Date   : 2026-07-31
 * Last Modified  : 2026-07-31
 * Classification : ENTERPRISE | RESTRICTED
 ******************************************************************************/

const fs = require('fs');
const path = require('path');
const ExecutionGraph = require('../ExecutionGraph.cjs');
const AnalyzerRegistry = require('../AnalyzerRegistry.cjs');
const SecurityAnalyzer = require('../analyzers/SecurityAnalyzer.cjs');

async function runMultiRepoTesting() {
    console.log('================================================================');
    console.log('  EAORCS MULTI-REPO HETEROGENEOUS TESTING SUITE');
    console.log('================================================================\n');

    const tempBase = path.resolve(__dirname, '../../scratch/multi_repo_test');
    if (!fs.existsSync(tempBase)) {
        fs.mkdirSync(tempBase, { recursive: true });
    }

    const repos = [
        { name: 'repo_js_small', files: { 'src/index.js': 'console.log("hello");', 'package.json': '{}' } },
        { name: 'repo_ts_monorepo', files: { 'packages/app/index.ts': 'const x = 1;', 'packages/core/db.ts': 'SELECT * FROM users' } },
        { name: 'repo_python_backend', files: { 'app/main.py': 'import os\nprint("py")', 'requirements.txt': 'flask==2.0.1' } },
        { name: 'repo_java_maven', files: { 'src/main/java/App.java': 'public class App {}', 'pom.xml': '<project></project>' } },
        { name: 'repo_go_microservice', files: { 'main.go': 'package main\nfunc main() {}', 'go.mod': 'module test' } }
    ];

    const registry = new AnalyzerRegistry();
    registry.register(new SecurityAnalyzer());
    const results = [];

    for (const repoDef of repos) {
        const repoPath = path.join(tempBase, repoDef.name);
        if (!fs.existsSync(repoPath)) {
            fs.mkdirSync(repoPath, { recursive: true });
        }

        for (const [relPath, content] of Object.entries(repoDef.files)) {
            const filePath = path.join(repoPath, relPath);
            const parentDir = path.dirname(filePath);
            if (!fs.existsSync(parentDir)) {
                fs.mkdirSync(parentDir, { recursive: true });
            }
            fs.writeFileSync(filePath, content, 'utf8');
        }

        const graph1 = new ExecutionGraph();
        const res1 = await graph1.execute(repoPath, registry.list());

        const graph2 = new ExecutionGraph();
        const res2 = await graph2.execute(repoPath, registry.list());

        const isDeterministic = res1.graph_hash === res2.graph_hash;
        console.log(`✓ ${repoDef.name}: Discovered ${res1.discovered_files_count} files | Hash: ${res1.graph_hash.substring(0, 16)}... | Replay: ${isDeterministic ? '100% MATCH' : 'FAIL'}`);

        if (!isDeterministic) {
            throw new Error(`Heterogeneous repo testing failed for ${repoDef.name}`);
        }

        results.push({ name: repoDef.name, files: res1.discovered_files_count, deterministic: true });
    }

    console.log('\n================================================================');
    console.log('  MULTI-REPO HETEROGENEOUS TESTING: 100% PASSED');
    console.log('================================================================\n');

    return results;
}

if (require.main === module) {
    runMultiRepoTesting().catch(err => {
        console.error('Multi-Repo Testing Error:', err);
        process.exit(1);
    });
}

module.exports = runMultiRepoTesting;
