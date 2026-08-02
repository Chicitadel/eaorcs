/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Release Engineering
 * File           : run_release.js
 * Version        : 2026.1-LTS
 * Author         : Enterprise Architecture Authority & Systems Engineering
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | RESTRICTED
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
const { ReleasePipeline } = require('./ReleasePipeline');

// Parse --version=X.Y.Z from argv
const versionArg = process.argv.find(a => a.startsWith('--version='));
const version = versionArg ? versionArg.split('=')[1] : '2026.1.0-lts';

console.log('================================================================');
console.log('  EAORCS RELEASE ENGINEERING PIPELINE');
console.log(`  Target Version: ${version}`);
console.log('================================================================');

const pipeline = new ReleasePipeline(version);
pipeline.run()
  .then(() => { process.exit(0); })
  .catch(err => { console.error('\n❌ Release pipeline failed:', err.message); console.error(err.stack); process.exit(1); });
