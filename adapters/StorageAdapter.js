/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Platform Adapter Layer / Storage Adapter
 * File           : StorageAdapter.js
 * Version        : 2026.1.0-LTS
 * Author         : Ujomor Engineering & Governance Authority
 * Organization   : Ujomor Systems
 * Created Date   : 2026-08-01
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
 * Copyright (c) 2026 Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

const BaseAdapter = require('./BaseAdapter');
const fs = require('fs');
const path = require('path');

let coreSdk = null;
try {
  coreSdk = require('@airroofers/core-sdk');
} catch (e) {
  coreSdk = null;
}

class StorageAdapter extends BaseAdapter {
  constructor(endpoint = 'https://storage.airroofers.eu/api/v1', offlineMode = false, options = {}) {
    super('storage', endpoint, offlineMode);
    this.baseDir = options.baseDir || path.join(process.cwd(), 'storage', 'data');
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }

    if (coreSdk && coreSdk.StorageClient && !offlineMode) {
      this.sdkClient = new coreSdk.StorageClient({ endpoint });
    }
  }

  async write(filePath, data) {
    if (!this.offlineMode && this.sdkClient && typeof this.sdkClient.upload === 'function') {
      try {
        return await this.sdkClient.upload(filePath, data);
      } catch (err) {
        this.log(`SDK Storage upload failed, fallback to local: ${err.message}`, 'warn');
      }
    }

    const fullPath = path.join(this.baseDir, filePath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const content = typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);
    fs.writeFileSync(fullPath, content, 'utf8');

    return {
      status: 'written',
      path: filePath,
      fullPath,
      bytes: Buffer.byteLength(content)
    };
  }

  async read(filePath) {
    if (!this.offlineMode && this.sdkClient && typeof this.sdkClient.download === 'function') {
      try {
        return await this.sdkClient.download(filePath);
      } catch (err) {
        this.log(`SDK Storage download failed, fallback to local: ${err.message}`, 'warn');
      }
    }

    const fullPath = path.join(this.baseDir, filePath);
    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    try {
      return JSON.parse(content);
    } catch (e) {
      return content;
    }
  }

  async exists(filePath) {
    const fullPath = path.join(this.baseDir, filePath);
    return fs.existsSync(fullPath);
  }

  async delete(filePath) {
    const fullPath = path.join(this.baseDir, filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
    return false;
  }
}

module.exports = StorageAdapter;
