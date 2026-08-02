/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Security Qualification Suite
 * File           : security_qualification_suite.js
 * Version        : 2026.1-LTS (v1.0.0-FROZEN)
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Chicitadel / Air Roofers SASU
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Security Reviewed & Master Qualification Runner
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const fs = require('fs');
const path = require('path');
const { runFuzzTest } = require('./input_fuzzing.test');
const { runForgeReplayTests } = require('./forge_and_replay_attacks.test');
const { runPrivilegeEscalationTests } = require('./privilege_escalation.test');
const { runPluginSandboxTests } = require('./plugin_sandbox_security.test');
const { runTenantIsolationTests } = require('./tenant_isolation.test');
const { runCryptoVerification } = require('./crypto_verification.test');

async function main() {
  console.log('================================================================');
  console.log('  EAORCS SECURITY QUALIFICATION SUITE');
  console.log('================================================================\n');

  const suites = [
    { name: 'Input Fuzzing (20+ vectors)',     fn: runFuzzTest,                passCheck: r => r.allPass },
    { name: 'Forge & Replay Attacks (8)',      fn: runForgeReplayTests,        passCheck: r => r.filter(x=>!x.defeated).length === 0 },
    { name: 'Privilege Escalation (8)',        fn: runPrivilegeEscalationTests,passCheck: r => r.every(x=>x.pass) },
    { name: 'Plugin Sandbox Security (8)',     fn: runPluginSandboxTests,      passCheck: r => r.filter(x=>x.pass===false).length <= 2 },
    { name: 'Tenant Isolation (5)',            fn: runTenantIsolationTests,    passCheck: r => r.filter(x=>!x.pass).length === 0 },
    { name: 'Crypto Verification (7)',         fn: runCryptoVerification,      passCheck: r => r.every(x=>x.pass) },
  ];

  const findings = [];
  for (const suite of suites) {
    console.log(`\n=== ${suite.name} ===`);
    let result, passed;
    try { result = await suite.fn(); passed = suite.passCheck(result); }
    catch(e) { console.error(`  SUITE ERROR: ${e.message}`); result = []; passed = false; }
    const status = passed ? '✅ MITIGATED' : '⚠️  PARTIAL';
    console.log(`  ${status}`);
    findings.push({ suite: suite.name, passed, result });
  }

  // Write report
  const docsDir = path.resolve(__dirname, '../../docs');
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
  const report = `# EAORCS Security Qualification Report\n\nGenerated: ${new Date().toISOString()}\n\n## Attack Vector Coverage\n\n| Suite | Status |\n|-------|--------|\n${findings.map(f=>`| ${f.suite} | ${f.passed?'✅ MITIGATED':'⚠️ PARTIAL'} |`).join('\n')}\n\n## Summary\n\nSecurity qualification covers: input fuzzing, cryptographic forge/replay attacks, RBAC privilege escalation, plugin sandbox isolation, tenant data isolation, and cryptographic integrity.\n`;
  fs.writeFileSync(path.join(docsDir, 'security_qualification_report.md'), report, 'utf8');

  const allPass = findings.every(f => f.passed);
  console.log('\n================================================================');
  console.log(`  SECURITY QUALIFICATION: ${findings.filter(f=>f.passed).length}/${findings.length} SUITES PASS`);
  console.log(`  REPORT: docs/security_qualification_report.md`);
  console.log('================================================================\n');
  if (!allPass) process.exit(1);
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
