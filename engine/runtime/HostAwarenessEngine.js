/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Host Awareness Engine
 * File           : HostAwarenessEngine.js
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

const Detector = require('./Detector');
const CapabilityMatrix = require('./CapabilityMatrix');

class HostAwarenessEngine {
  constructor(config = {}) {
    this.config = config;
    this.detector = new Detector(config);
    this.detectedHost = null;
    this.capabilities = {};
  }

  detectHostEnvironment() {
    const res = this.detector.detect();
    this.detectedHost = res.host;
    this.capabilities = CapabilityMatrix.generate(res.host);

    return {
      host: this.detectedHost,
      capabilities: this.capabilities,
      source: res.source
    };
  }

  resolveCapabilities(hostType) {
    return CapabilityMatrix.generate(hostType);
  }
}

module.exports = HostAwarenessEngine;
