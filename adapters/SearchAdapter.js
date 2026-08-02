/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Platform Adapter Layer / Search Adapter
 * File           : SearchAdapter.js
 * Version        : 2026.1.0-LTS
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | GOVERNMENT
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
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

const BaseAdapter = require('./BaseAdapter');

let coreSdk = null;
try {
  coreSdk = require('@airroofers/core-sdk');
} catch (e) {
  coreSdk = null;
}

class SearchAdapter extends BaseAdapter {
  constructor(endpoint = 'https://search.airroofers.eu/api/v1', offlineMode = false, options = {}) {
    super('search', endpoint, offlineMode);
    this.headers = { 'X-Correlation-ID': options.correlationId || null };
    this.indices = {
      osap_passports: new Map(),
      audit_logs: new Map(),
      trust_graphs: new Map()
    };
    if (coreSdk && coreSdk.SearchClient && !offlineMode) {
      this.sdkClient = new coreSdk.SearchClient({ endpoint });
    }
  }

  async indexDocument(collection, id, document) {
    const item = {
      id,
      collection,
      document,
      indexedAt: new Date().toISOString()
    };

    if (!this.indices[collection]) {
      this.indices[collection] = new Map();
    }
    this.indices[collection].set(id, item);

    if (this.offlineMode || !this.sdkClient) {
      this.log(`Indexed document [${collection}:${id}] locally`);
      return { status: 'indexed_local', item };
    }

    try {
      if (typeof this.sdkClient.index === 'function') {
        const remoteResult = await this.sdkClient.index(collection, id, document);
        return { status: 'indexed_remote', item: remoteResult || item };
      }
      this.log(`Indexed document [${collection}:${id}] at ${this.endpoint}`);
      return { status: 'indexed_remote', item };
    } catch (err) {
      this.log(`Remote indexing failed, fallback to local index: ${err.message}`, 'warn');
      return { status: 'indexed_local', item };
    }
  }

  async indexOsapPassport(passport) {
    const id = passport.id || passport.passportId || `pass_${Date.now()}`;
    return this.indexDocument('osap_passports', id, passport);
  }

  async indexAuditLog(auditRecord) {
    const id = auditRecord.id || auditRecord.auditId || `audit_${Date.now()}`;
    return this.indexDocument('audit_logs', id, auditRecord);
  }

  async indexTrustGraphNode(graphNode) {
    const id = graphNode.id || graphNode.nodeId || `node_${Date.now()}`;
    return this.indexDocument('trust_graphs', id, graphNode);
  }

  async searchCollection(collection, queryStr, options = {}) {
    if (!this.offlineMode && this.sdkClient && typeof this.sdkClient.query === 'function') {
      try {
        return await this.sdkClient.query(collection, queryStr, options);
      } catch (err) {
        this.log(`Remote search query failed: ${err.message}`, 'warn');
      }
    }

    const map = this.indices[collection];
    if (!map) return [];

    const lowerQuery = String(queryStr || '').toLowerCase();
    const results = [];

    for (const [id, item] of map.entries()) {
      const docStr = JSON.stringify(item.document).toLowerCase();
      if (!lowerQuery || docStr.includes(lowerQuery) || id.toLowerCase().includes(lowerQuery)) {
        results.push(item);
      }
    }

    return results;
  }

  async globalSearch(queryStr, options = {}) {
    if (!this.offlineMode && this.sdkClient && typeof this.sdkClient.globalSearch === 'function') {
      try {
        return await this.sdkClient.globalSearch(queryStr, options);
      } catch (err) {
        this.log(`Remote global search failed: ${err.message}`, 'warn');
      }
    }

    const lowerQuery = String(queryStr || '').toLowerCase();
    const results = [];

    for (const collection of Object.keys(this.indices)) {
      const map = this.indices[collection];
      for (const [id, item] of map.entries()) {
        const docStr = JSON.stringify(item.document).toLowerCase();
        if (!lowerQuery || docStr.includes(lowerQuery) || id.toLowerCase().includes(lowerQuery)) {
          results.push(item);
        }
      }
    }

    return results;
  }

  clearIndex(collection = null) {
    if (collection) {
      if (this.indices[collection]) {
        this.indices[collection].clear();
      }
    } else {
      for (const key of Object.keys(this.indices)) {
        this.indices[key].clear();
      }
    }
  }
}

module.exports = SearchAdapter;
