/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Provider Framework / Filesystem Provider Driver
 * File           : FilesystemProvider.js
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
 * Copyright (c) 2026 Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

const fs = require('fs');
const path = require('path');

class FilesystemProvider {
  constructor(options = {}) {
    this.name = 'FilesystemProvider';
    this.rootPath = options.rootPath || path.join(process.cwd(), 'storage');
    if (!fs.existsSync(this.rootPath)) {
      fs.mkdirSync(this.rootPath, { recursive: true });
    }
  }

  async read(relativeFilePath) {
    const fullPath = path.join(this.rootPath, relativeFilePath);
    if (!fs.existsSync(fullPath)) return null;

    const content = fs.readFileSync(fullPath, 'utf8');
    try {
      return JSON.parse(content);
    } catch (e) {
      return content;
    }
  }

  async write(relativeFilePath, data) {
    const fullPath = path.join(this.rootPath, relativeFilePath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const content = typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);
    fs.writeFileSync(fullPath, content, 'utf8');

    return {
      status: 'written',
      path: relativeFilePath,
      bytes: Buffer.byteLength(content)
    };
  }

  async delete(relativeFilePath) {
    const fullPath = path.join(this.rootPath, relativeFilePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
    return false;
  }

  async exists(relativeFilePath) {
    const fullPath = path.join(this.rootPath, relativeFilePath);
    return fs.existsSync(fullPath);
  }

  async list(relativeDirPath = '.') {
    const fullPath = path.join(this.rootPath, relativeDirPath);
    if (!fs.existsSync(fullPath)) return [];
    return fs.readdirSync(fullPath);
  }

  async stat(relativeFilePath) {
    const fullPath = path.join(this.rootPath, relativeFilePath);
    if (!fs.existsSync(fullPath)) return null;
    const stats = fs.statSync(fullPath);
    return {
      size: stats.size,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory(),
      mtime: stats.mtime
    };
  }

  async createReadStream(relativeFilePath) {
    const fullPath = path.join(this.rootPath, relativeFilePath);
    if (!fs.existsSync(fullPath)) throw new Error(`File non-existent: ${relativeFilePath}`);
    return fs.createReadStream(fullPath);
  }

  async createWriteStream(relativeFilePath) {
    const fullPath = path.join(this.rootPath, relativeFilePath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return fs.createWriteStream(fullPath);
  }

  async isHealthy() {
    try {
      return fs.existsSync(this.rootPath);
    } catch (e) {
      return false;
    }
  }
}

module.exports = FilesystemProvider;
