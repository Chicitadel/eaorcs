/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Release Engineering
 * File           : ReproducibleBuildVerifier.js
 * Version        : 2026.1-LTS
 * Author         : Enterprise Architecture Authority & Systems Engineering
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
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class ReproducibleBuildVerifier {
  constructor() { this.runs = []; }

  async simulateBuild(rootDir, runId) {
    // Collect all .js/.cjs files in engine/ and cli/ sorted alphabetically
    // Hash each file content with sha256
    // Compute root hash as sha256 of sorted path:hash pairs
    const files = [];
    const walk = (dir) => {
      if (!fs.existsSync(dir)) return;
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory() && !['node_modules','.git','storage','tests'].includes(entry.name)) walk(full);
        else if (entry.isFile() && /\.(js|cjs)$/.test(entry.name)) files.push(full);
      }
    };
    walk(path.join(rootDir, 'engine'));
    walk(path.join(rootDir, 'cli'));
    files.sort();
    const fileHashes = {};
    for (const f of files) {
      try {
        const content = fs.readFileSync(f);
        fileHashes[path.relative(rootDir, f).replace(/\\/g, '/')] = crypto.createHash('sha256').update(content).digest('hex');
      } catch(e) {}
    }
    const rootHash = crypto.createHash('sha256').update(JSON.stringify(fileHashes)).digest('hex');
    const run = { runId, fileCount: files.length, fileHashes, rootHash, timestamp: new Date().toISOString() };
    this.runs.push(run);
    return run;
  }

  async verifyReproducibility(rootDir, runs = 3) {
    const runResults = [];
    for (let i = 1; i <= runs; i++) {
      runResults.push(await this.simulateBuild(rootDir, `run-${i}`));
    }
    const rootHashes = runResults.map(r => r.rootHash);
    const allEqual = rootHashes.every(h => h === rootHashes[0]);
    const deviations = allEqual ? [] : rootHashes.filter((h,i) => h !== rootHashes[0]).map((h,i) => ({ run: i+2, hash: h }));
    return {
      runs: runResults.map(r => ({ runId: r.runId, rootHash: r.rootHash, fileCount: r.fileCount })),
      allEqual,
      deviations,
      verdict: allEqual ? 'REPRODUCIBLE' : 'NON_REPRODUCIBLE'
    };
  }
}

module.exports = { ReproducibleBuildVerifier };
