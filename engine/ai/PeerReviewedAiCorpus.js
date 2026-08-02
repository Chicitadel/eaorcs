/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Peer-Reviewed AI Corpus Engine
 * File           : engine/ai/PeerReviewedAiCorpus.js
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

const crypto = require('crypto');

class PeerReviewedAiCorpus {
  constructor() {
    this.datasets = new Map();
  }

  registerCorpusDataset(datasetId, payload, peerReviews = []) {
    if (!datasetId || !payload) throw new Error('datasetId and payload required');
    const contentHash = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');

    const dataset = {
      datasetId,
      version: '1.0.0',
      sampleCount: payload.samples ? payload.samples.length : 500,
      contentHash,
      peerReviews,
      registeredAt: new Date().toISOString(),
      payload
    };

    this.datasets.set(datasetId, dataset);
    return dataset;
  }

  getDatasetWithPeerReviews(datasetId) {
    return this.datasets.get(datasetId) || null;
  }

  listPeerReviewedDatasets() {
    return Array.from(this.datasets.values()).map(d => ({
      datasetId: d.datasetId,
      sampleCount: d.sampleCount,
      peerReviewCount: d.peerReviews.length,
      contentHash: d.contentHash
    }));
  }

  verifyCorpusConsensus(datasetId) {
    const ds = this.datasets.get(datasetId);
    if (!ds) return { consensus: false, reason: 'DATASET_NOT_FOUND' };
    if (ds.peerReviews.length < 2) return { consensus: false, reason: 'INSUFFICIENT_PEER_REVIEWS' };

    const approvals = ds.peerReviews.filter(r => r.verdict === 'APPROVED').length;
    const consensus = approvals / ds.peerReviews.length >= 0.66;
    return {
      consensus,
      approvalRatio: approvals / ds.peerReviews.length,
      totalReviews: ds.peerReviews.length,
      datasetId
    };
  }
}

module.exports = { PeerReviewedAiCorpus };
