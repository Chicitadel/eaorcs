/******************************************************************************
 * Project        : Air Roofers Platform Ecosystem
 * Module         : AGPA Global Build & Packaging Pipeline Script
 * File           : ci/agpa-build-pipeline.js
 * Version        : 2026.3.0-LTS
 * Author         : Enterprise Architecture & Security Governance Board
 * Organization   : Air Roofers Governance Directorate
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : ENTERPRISE
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
 * Copyright (c) 2026 Air Roofers Governance Directorate
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const AirRoofersPackagingEngine = require('../engine/packaging/AirRoofersPackagingEngine');

function runPipeline() {
  const args = process.argv.slice(2);
  let product = 'EAORCS';
  let edition = 'Enterprise';

  for (const arg of args) {
    if (arg.startsWith('--product=')) {
      product = arg.split('=')[1];
    } else if (arg.startsWith('--edition=')) {
      edition = arg.split('=')[1];
    }
  }

  const engine = new AirRoofersPackagingEngine();
  return engine.packageProduct(product, edition);
}

if (require.main === module) {
  try {
    runPipeline();
  } catch (err) {
    console.error(`[AGPA BUILD PIPELINE ERROR] ${err.message}`);
    process.exit(1);
  }
}

module.exports = runPipeline;
