/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Distribution Protection Architecture (DPA) / EDH Virtual Filesystem
 * File           : VirtualFilesystem.js
 * Version        : 2026.2-LTS (v1.1.0-FROZEN Master Specification)
 * Author         : Architectural Governance Council & Ujomor Systems Engineering (Ujomor Engineering Governance Authority)
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
 * Created Date   : 2026-08-02
 * Last Modified  : 2026-08-02
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Modularization Enforced
 * - Architecture Controlled
 * - Protocol Frozen
 * - AI Governed
 * - Architecture Authority Approved & FROZEN (v1.1.0-FROZEN)
 * - Security Reviewed (ISO 27001, SOC 2, OWASP ASVS, NIST SP 800-161)
 * - Security Governance & Architecture Controlled
 * - EDH Virtual Machine In-Memory Storage Guardrail Enforced
 *
 * Standards:
 * - ISO 27001 / SOC 2 / OWASP ASVS / NIST SP 800-161 / SLSA Level 4
 *
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

const crypto = require('crypto');

class VirtualFilesystem {
  constructor() {
    this.mounts = new Map([
      ['/runtime_fs', new Map()],
      ['/capability_fs', new Map()],
      ['/policy_fs', new Map()],
      ['/evidence_fs', new Map()],
      ['/marketplace_fs', new Map()]
    ]);
    this.readOnlyMounts = new Set(['/runtime_fs', '/policy_fs']);
    this.mountedCapsules = new Map();
  }

  resolvePath(vpath) {
    if (!vpath || typeof vpath !== 'string') {
      throw new Error('[VFS] Path must be a non-empty string.');
    }
    const normalized = vpath.startsWith('/') ? vpath : '/' + vpath;
    const parts = normalized.split('/').filter(Boolean);
    if (parts.length === 0) {
      throw new Error('[VFS] Invalid root path access.');
    }
    const mountPoint = '/' + parts[0];
    if (!this.mounts.has(mountPoint)) {
      throw new Error(`[VFS] Access denied. Path '${vpath}' is outside designated VFS mounts.`);
    }
    const subpath = parts.slice(1).join('/');
    return { mountPoint, subpath };
  }

  writeFile(vpath, content, metadata = {}) {
    const { mountPoint, subpath } = this.resolvePath(vpath);
    if (this.readOnlyMounts.has(mountPoint) && metadata.bypassReadOnly !== true) {
      throw new Error(`[VFS] Mount point '${mountPoint}' is read-only.`);
    }
    const mount = this.mounts.get(mountPoint);
    const buf = Buffer.isBuffer(content) ? content : Buffer.from(content);
    const checksum = crypto.createHash('sha256').update(buf).digest('hex');
    mount.set(subpath, {
      content: buf,
      metadata: {
        ...metadata,
        checksum,
        createdAt: new Date().toISOString(),
        sizeBytes: buf.length
      }
    });
    return { vpath, checksum, mountPoint };
  }

  readFile(vpath) {
    const { mountPoint, subpath } = this.resolvePath(vpath);
    const mount = this.mounts.get(mountPoint);
    if (!mount.has(subpath)) {
      throw new Error(`[VFS] File not found at '${vpath}'.`);
    }
    const entry = mount.get(subpath);
    return {
      content: entry.content,
      utf8Content: entry.content.toString('utf8'),
      metadata: entry.metadata
    };
  }

  getMetadata(vpath) {
    const { mountPoint, subpath } = this.resolvePath(vpath);
    const mount = this.mounts.get(mountPoint);
    if (!mount.has(subpath)) {
      throw new Error(`[VFS] File not found at '${vpath}'.`);
    }
    return mount.get(subpath).metadata;
  }

  hasFile(vpath) {
    try {
      const { mountPoint, subpath } = this.resolvePath(vpath);
      return this.mounts.get(mountPoint).has(subpath);
    } catch {
      return false;
    }
  }

  deleteFile(vpath) {
    const { mountPoint, subpath } = this.resolvePath(vpath);
    if (this.readOnlyMounts.has(mountPoint)) {
      throw new Error(`[VFS] Cannot delete file from read-only mount '${mountPoint}'.`);
    }
    const mount = this.mounts.get(mountPoint);
    if (mount.has(subpath)) {
      const entry = mount.get(subpath);
      if (entry && entry.content && Buffer.isBuffer(entry.content)) {
        entry.content.fill(0);
      }
      return mount.delete(subpath);
    }
    return false;
  }

  listFiles(mountPointOrPrefix = '/') {
    const results = [];
    const normalized = mountPointOrPrefix.startsWith('/') ? mountPointOrPrefix : '/' + mountPointOrPrefix;

    if (normalized === '/') {
      for (const [mp, store] of this.mounts.entries()) {
        for (const [key, entry] of store.entries()) {
          results.push({
            vpath: `${mp}/${key}`,
            mountPoint: mp,
            subpath: key,
            sizeBytes: entry.metadata.sizeBytes,
            checksum: entry.metadata.checksum,
            createdAt: entry.metadata.createdAt
          });
        }
      }
    } else {
      const { mountPoint, subpath } = this.resolvePath(normalized);
      const store = this.mounts.get(mountPoint);
      const prefix = subpath ? (subpath.endsWith('/') ? subpath : subpath + '/') : '';
      for (const [key, entry] of store.entries()) {
        if (!prefix || key.startsWith(prefix) || key === subpath) {
          results.push({
            vpath: `${mountPoint}/${key}`,
            mountPoint,
            subpath: key,
            sizeBytes: entry.metadata.sizeBytes,
            checksum: entry.metadata.checksum,
            createdAt: entry.metadata.createdAt
          });
        }
      }
    }
    return results;
  }

  mountCapsule(capsuleId, filesMap, metadata = {}) {
    if (!capsuleId || typeof capsuleId !== 'string') {
      throw new Error('[VFS] Capsule ID must be a non-empty string.');
    }
    const mountTarget = `/capability_fs/${capsuleId}`;
    for (const [relativePath, content] of Object.entries(filesMap)) {
      const targetVpath = `${mountTarget}/${relativePath}`;
      this.writeFile(targetVpath, content, { ...metadata, capsuleId, bypassReadOnly: true });
    }
    this.mountedCapsules.set(capsuleId, {
      capsuleId,
      mountTarget,
      fileCount: Object.keys(filesMap).length,
      mountedAt: new Date().toISOString(),
      metadata
    });
    return { capsuleId, mountTarget, fileCount: Object.keys(filesMap).length };
  }

  unmountCapsule(capsuleId) {
    if (!this.mountedCapsules.has(capsuleId)) {
      return false;
    }
    const capMount = this.mounts.get('/capability_fs');
    const prefix = `${capsuleId}/`;
    for (const [key, entry] of capMount.entries()) {
      if (key.startsWith(prefix) || key === capsuleId) {
        if (entry && entry.content && Buffer.isBuffer(entry.content)) {
          entry.content.fill(0);
        }
        capMount.delete(key);
      }
    }
    this.mountedCapsules.delete(capsuleId);
    return true;
  }

  listMounts() {
    const summary = {};
    for (const [mountPoint, store] of this.mounts.entries()) {
      summary[mountPoint] = {
        fileCount: store.size,
        readOnly: this.readOnlyMounts.has(mountPoint)
      };
    }
    return summary;
  }

  zeroize() {
    for (const store of this.mounts.values()) {
      for (const entry of store.values()) {
        if (entry.content && Buffer.isBuffer(entry.content)) {
          entry.content.fill(0);
        }
      }
      store.clear();
    }
    this.mountedCapsules.clear();
    return true;
  }
}

module.exports = VirtualFilesystem;
