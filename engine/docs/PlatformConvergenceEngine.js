/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Platform Convergence Engine
 * File           : PlatformConvergenceEngine.js
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
 * CORP: Stream 4 Platform Convergence Pipeline
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
const zlib = require('zlib');
const PlatformKnowledgeGraphEngine = require('./PlatformKnowledgeGraphEngine');

class PlatformConvergenceEngine {
  constructor(options = {}) {
    this.options = options;
    this.knowledgeGraphEngine = new PlatformKnowledgeGraphEngine();
  }

  /**
   * Execute platform convergence pipeline across workspace.
   * @param {string} workspaceRoot
   * @returns {Object} Pipeline result
   */
  executePipeline(workspaceRoot) {
    const root = workspaceRoot || path.resolve(__dirname, '../../../../');
    
    // 1. Build and verify Knowledge Graph
    const graph = this.knowledgeGraphEngine.buildKnowledgeGraph(root);

    // 2. Trim Customer Documentation
    const trimmedDocs = this.trimCustomerDocumentation(root);

    // 3. Verify & Generate bin/ Taxonomy
    const binTaxonomy = this.verifyAndGenerateBinTaxonomy(root);

    // 4. Create Universal ZIP Bundle
    const zipResult = this.createUniversalZipBundle(root);

    return {
      status: 'CONVERGED',
      platformId: graph.platform_id,
      knowledgeGraph: graph.metadata,
      customerDocs: trimmedDocs,
      binTaxonomy: binTaxonomy,
      universalZip: zipResult,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Create Universal ZIP bundle with embedded platform assets.
   * @param {string} workspaceRoot
   * @param {string} outputPath Optional target zip path
   * @returns {Object} Bundle summary
   */
  createUniversalZipBundle(workspaceRoot, outputPath = null) {
    const root = workspaceRoot || path.resolve(__dirname, '../../../../');
    const targetZip = outputPath || path.join(root, 'dist', 'universal_platform_bundle.zip');

    const distDir = path.dirname(targetZip);
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }

    const filesToEmbed = [
      { name: 'manifest.json', content: JSON.stringify({ platform: 'PLATFORM-AIRROOFERS-2026', version: '2026.3.1-LTS' }, null, 2) },
      { name: 'bin/eaorcs', content: '#!/usr/bin/env node\nconsole.log("EAORCS Platform CLI v2026.3.1-LTS");\n' },
      { name: 'docs/CUSTOMER_GUIDE.md', content: '# Universal Autonomous Platform Guide\n' }
    ];

    const archiveBuffer = this._buildSimpleZipBuffer(filesToEmbed);
    fs.writeFileSync(targetZip, archiveBuffer);

    return {
      bundlePath: targetZip,
      embeddedCount: filesToEmbed.length,
      bytes: archiveBuffer.length,
      status: 'EMBEDDED'
    };
  }

  /**
   * Trims internal notes, confidential sections, and draft tags for customer doc output.
   * @param {string} workspaceRoot
   * @returns {Object} Trimming metrics
   */
  trimCustomerDocumentation(workspaceRoot) {
    const root = workspaceRoot || path.resolve(__dirname, '../../../../');
    const sourceDir = path.join(root, '00_engineering_guide');
    const targetDir = path.join(root, 'dist', 'customer_docs');

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    let totalProcessed = 0;
    let totalTrimmed = 0;

    if (fs.existsSync(sourceDir)) {
      const processDirectory = (dir, targetSub) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const srcPath = path.join(dir, entry.name);
          const tgtPath = path.join(targetSub, entry.name);

          if (entry.isDirectory()) {
            fs.mkdirSync(tgtPath, { recursive: true });
            processDirectory(srcPath, tgtPath);
          } else if (entry.isFile() && entry.name.endsWith('.md')) {
            totalProcessed++;
            const content = fs.readFileSync(srcPath, 'utf8');
            const trimmed = this.trimCustomerDocContent(content);
            if (trimmed !== content) totalTrimmed++;
            fs.writeFileSync(tgtPath, trimmed, 'utf8');
          }
        }
      };

      processDirectory(sourceDir, targetDir);
    }

    return {
      sourceDir,
      targetDir,
      totalProcessed,
      totalTrimmed,
      status: 'TRIMMED'
    };
  }

  /**
   * Helper to trim doc content string by removing internal notes and tags.
   * @param {string} content
   * @returns {string} Sanitized content
   */
  trimCustomerDocContent(content) {
    if (!content) return '';
    return content
      .replace(/<!--\s*INTERNAL_ONLY[\s\S]*?-->/gi, '')
      .replace(/<!--\s*CONFIDENTIAL[\s\S]*?-->/gi, '')
      .replace(/<!--\s*INTERNAL NOTE[\s\S]*?-->/gi, '')
      .replace(/^.*INTERNAL_NOTE.*$/gm, '')
      .replace(/^.*CONFIDENTIAL_NOTE.*$/gm, '');
  }

  /**
   * Verifies and constructs standard taxonomy in bin/ directory.
   * @param {string} workspaceRoot
   * @returns {Object} Taxonomy verification status
   */
  verifyAndGenerateBinTaxonomy(workspaceRoot) {
    const root = workspaceRoot || path.resolve(__dirname, '../../../../');
    const binDir = path.join(root, 'bin');

    if (!fs.existsSync(binDir)) {
      fs.mkdirSync(binDir, { recursive: true });
    }

    const taxonomy = [
      { name: 'eaorcs', type: 'sh', content: '#!/usr/bin/env node\nrequire("../engine/EAORCS.js");\n' },
      { name: 'eaorcs.cmd', type: 'cmd', content: '@IF EXIST "%~dp0\\node.exe" ( "%~dp0\\node.exe" "%~dp0\\..\\engine\\EAORCS.js" %* ) ELSE ( node "%~dp0\\..\\engine\\EAORCS.js" %* )\n' },
      { name: 'eaorcs.ps1', type: 'ps1', content: 'node "$PSScriptRoot/../engine/EAORCS.js" @args\n' }
    ];

    const generated = [];
    taxonomy.forEach(item => {
      const itemPath = path.join(binDir, item.name);
      if (!fs.existsSync(itemPath)) {
        fs.writeFileSync(itemPath, item.content, 'utf8');
      }
      generated.push(item.name);
    });

    return {
      binDir,
      taxonomy: generated,
      status: 'VERIFIED'
    };
  }

  /**
   * Construct raw PKZip structure buffer for universal zip embedding.
   */
  _buildSimpleZipBuffer(files) {
    const localHeaders = [];
    const centralDirectoryHeaders = [];
    let currentOffset = 0;

    for (const file of files) {
      const filenameBuf = Buffer.from(file.name, 'utf8');
      const contentBuf = Buffer.from(file.content, 'utf8');
      const compressedContent = zlib.deflateRawSync(contentBuf);
      
      const crc = this._crc32(contentBuf);

      // Local Header
      const localHeader = Buffer.alloc(30 + filenameBuf.length);
      localHeader.writeUInt32LE(0x04034b50, 0); // Signature
      localHeader.writeUInt16LE(20, 4); // Version needed
      localHeader.writeUInt16LE(0, 6);  // General flags
      localHeader.writeUInt16LE(8, 8);  // Compression method: Deflate
      localHeader.writeUInt16LE(0, 10); // Time
      localHeader.writeUInt16LE(0, 12); // Date
      localHeader.writeUInt32LE(crc, 14); // CRC32
      localHeader.writeUInt32LE(compressedContent.length, 18); // Compressed size
      localHeader.writeUInt32LE(contentBuf.length, 22); // Uncompressed size
      localHeader.writeUInt16LE(filenameBuf.length, 26); // Filename length
      localHeader.writeUInt16LE(0, 28); // Extra field length
      filenameBuf.copy(localHeader, 30);

      // Central Directory Header
      const cdHeader = Buffer.alloc(46 + filenameBuf.length);
      cdHeader.writeUInt32LE(0x02014b50, 0); // Signature
      cdHeader.writeUInt16LE(20, 4); // Made by
      cdHeader.writeUInt16LE(20, 6); // Version needed
      cdHeader.writeUInt16LE(0, 8);  // Flags
      cdHeader.writeUInt16LE(8, 10); // Compression method
      cdHeader.writeUInt16LE(0, 12); // Time
      cdHeader.writeUInt16LE(0, 14); // Date
      cdHeader.writeUInt32LE(crc, 16); // CRC32
      cdHeader.writeUInt32LE(compressedContent.length, 20); // Compressed size
      cdHeader.writeUInt32LE(contentBuf.length, 24); // Uncompressed size
      cdHeader.writeUInt16LE(filenameBuf.length, 28); // Filename length
      cdHeader.writeUInt16LE(0, 30); // Extra field length
      cdHeader.writeUInt16LE(0, 32); // File comment length
      cdHeader.writeUInt16LE(0, 34); // Disk start
      cdHeader.writeUInt16LE(0, 36); // Internal attr
      cdHeader.writeUInt32LE(0, 38); // External attr
      cdHeader.writeUInt32LE(currentOffset, 42); // Local header offset
      filenameBuf.copy(cdHeader, 46);

      localHeaders.push(Buffer.concat([localHeader, compressedContent]));
      centralDirectoryHeaders.push(cdHeader);

      currentOffset += localHeader.length + compressedContent.length;
    }

    const localData = Buffer.concat(localHeaders);
    const cdData = Buffer.concat(centralDirectoryHeaders);

    // End of Central Directory Record (EOCD)
    const eocd = Buffer.alloc(22);
    eocd.writeUInt32LE(0x06054b50, 0); // Signature
    eocd.writeUInt16LE(0, 4); // Disk num
    eocd.writeUInt16LE(0, 6); // CD Disk num
    eocd.writeUInt16LE(files.length, 8); // Disk entries
    eocd.writeUInt16LE(files.length, 10); // Total entries
    eocd.writeUInt32LE(cdData.length, 12); // CD size
    eocd.writeUInt32LE(currentOffset, 16); // CD offset
    eocd.writeUInt16LE(0, 20); // Comment length

    return Buffer.concat([localData, cdData, eocd]);
  }

  _crc32(buf) {
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      const byte = buf[i];
      let c = (crc ^ byte) & 0xff;
      for (let j = 0; j < 8; j++) {
        c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      }
      crc = (crc >>> 8) ^ c;
    }
    return (crc ^ -1) >>> 0;
  }
}

module.exports = PlatformConvergenceEngine;
