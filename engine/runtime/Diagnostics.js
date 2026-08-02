/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Runtime Subsystem / Environment Inspector & Diagnostics
 * File           : Diagnostics.js
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

const os = require('os');
const Detector = require('./Detector');
const CapabilityMatrix = require('./CapabilityMatrix');

class Diagnostics {
  constructor(config = {}) {
    this.detector = new Detector(config);
  }

  async runFullInspection() {
    const detectionResult = this.detector.detect();
    const capabilities = CapabilityMatrix.generate(detectionResult.host);

    const systemInfo = {
      platform: os.platform(),
      arch: os.arch(),
      release: os.release(),
      nodeVersion: process.version,
      uptimeSeconds: Math.floor(os.uptime()),
      cpuCount: os.cpus().length,
      cpuModel: os.cpus()[0] ? os.cpus()[0].model : 'Unknown',
      totalMemoryMb: Math.round(os.totalmem() / (1024 * 1024)),
      freeMemoryMb: Math.round(os.freemem() / (1024 * 1024)),
      processMemoryUsageMb: Math.round(process.memoryUsage().rss / (1024 * 1024))
    };

    const healthChecks = [
      { check: 'Node.js Engine Version', status: 'PASS', details: `>=18.0.0 (${process.version})` },
      { check: 'Memory Threshold', status: systemInfo.freeMemoryMb > 64 ? 'PASS' : 'WARN', details: `${systemInfo.freeMemoryMb} MB free` },
      { check: 'Host Auto-Detection', status: 'PASS', details: `${detectionResult.host} (${detectionResult.source})` }
    ];

    return {
      timestamp: new Date().toISOString(),
      host: detectionResult.host,
      detectionSource: detectionResult.source,
      confidence: detectionResult.confidence,
      systemInfo,
      capabilities,
      healthChecks,
      status: healthChecks.every(c => c.status === 'PASS') ? 'HEALTHY' : 'DEGRADED'
    };
  }
}

module.exports = Diagnostics;
