/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Open Benchmark Corpus Vault
 * File           : evidence/public_benchmark_corpus/OpenBenchmarkCorpusVault.js
 * Version        : 2026.1.0-LTS
 * Author         : Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
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

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class OpenBenchmarkCorpusVault {
  constructor(storageDir) {
    this.storageDir = storageDir || path.join(process.cwd(), 'evidence', 'public_benchmark_corpus', 'vault_data');
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
    this.indexFile = path.join(this.storageDir, 'corpus_index.json');
    this.datasets = new Map();
    this.loadIndex();
  }

  loadIndex() {
    if (fs.existsSync(this.indexFile)) {
      try {
        const raw = fs.readFileSync(this.indexFile, 'utf8');
        const list = JSON.parse(raw);
        for (const item of list) {
          this.datasets.set(item.repoId, item);
        }
      } catch (e) {
        this.datasets.clear();
      }
    }
  }

  saveIndex() {
    const list = Array.from(this.datasets.values());
    fs.writeFileSync(this.indexFile, JSON.stringify(list, null, 2), 'utf8');
  }

  storeBenchmarkDataset(repoId, datasetPayload) {
    if (!repoId || !datasetPayload) {
      throw new Error('repoId and datasetPayload are required');
    }
    const timestamp = new Date().toISOString();
    const payloadStr = JSON.stringify(datasetPayload);
    const contentHash = crypto.createHash('sha256').update(payloadStr).digest('hex');

    const entry = {
      repoId,
      timestamp,
      contentHash,
      sampleCount: datasetPayload.sampleCount || (datasetPayload.samples ? datasetPayload.samples.length : 100),
      repoType: datasetPayload.repoType || 'NodeJS/REST',
      payload: datasetPayload
    };

    const filePath = path.join(this.storageDir, `${repoId}_dataset.json`);
    fs.writeFileSync(filePath, JSON.stringify(entry, null, 2), 'utf8');

    const indexEntry = {
      repoId,
      timestamp,
      contentHash,
      sampleCount: entry.sampleCount,
      repoType: entry.repoType,
      filePath
    };

    this.datasets.set(repoId, indexEntry);
    this.saveIndex();
    return indexEntry;
  }

  getBenchmarkDataset(repoId) {
    const indexEntry = this.datasets.get(repoId);
    if (!indexEntry) return null;
    if (fs.existsSync(indexEntry.filePath)) {
      const raw = fs.readFileSync(indexEntry.filePath, 'utf8');
      return JSON.parse(raw);
    }
    return null;
  }

  listDatasets() {
    return Array.from(this.datasets.values());
  }

  verifyVaultIntegrity() {
    let valid = true;
    const verifiedList = [];
    for (const [repoId, entry] of this.datasets.entries()) {
      if (!fs.existsSync(entry.filePath)) {
        valid = false;
        verifiedList.push({ repoId, valid: false, reason: 'FILE_MISSING' });
        continue;
      }
      const raw = fs.readFileSync(entry.filePath, 'utf8');
      const parsed = JSON.parse(raw);
      const computedHash = crypto.createHash('sha256').update(JSON.stringify(parsed.payload)).digest('hex');
      const hashMatches = computedHash === entry.contentHash;
      if (!hashMatches) valid = false;
      verifiedList.push({ repoId, valid: hashMatches, hash: computedHash });
    }
    return { valid, items: verifiedList };
  }

  exportVaultArchive() {
    const all = this.listDatasets();
    const manifest = {
      vaultVersion: '2026.1.0-LTS',
      totalDatasets: all.length,
      exportedAt: new Date().toISOString(),
      merkleRoot: crypto.createHash('sha256').update(JSON.stringify(all)).digest('hex'),
      datasets: all
    };
    return manifest;
  }
}

module.exports = { OpenBenchmarkCorpusVault };
