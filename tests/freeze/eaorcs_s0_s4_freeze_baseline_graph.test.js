/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Streams S0-S4 Baseline, Registries & Knowledge Graph Test
 * File           : eaorcs_s0_s4_freeze_baseline_graph.test.js
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
 * CORP: Streams S0, S1, S2, S3, S4 Verification Suite
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

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../../../../');
const eaorcsDir = path.resolve(__dirname, '../../');

const PlatformKnowledgeGraphEngine = require('../../engine/docs/PlatformKnowledgeGraphEngine');

async function runS0ToS4Verification() {
  console.log('================================================================');
  console.log('  EAORCS STREAMS S0-S4 VERIFICATION SUITE');
  console.log('  Testing: Baseline, Frozen Decisions, Product Descriptors,');
  console.log('           Knowledge Graph & Generated Architecture Doc');
  console.log('================================================================\n');

  // 1. Verify ARCHITECTURE_BASELINE.md
  console.log('[1] Verifying ARCHITECTURE_BASELINE.md...');
  const baselinePath = path.join(rootDir, '00_engineering_guide', 'ARCHITECTURE_BASELINE.md');
  assert.ok(fs.existsSync(baselinePath), 'ARCHITECTURE_BASELINE.md must exist');
  const baselineContent = fs.readFileSync(baselinePath, 'utf8');
  assert.ok(baselineContent.includes('Universal Autonomous AI Governance Operating System (UAIGOS)'), 'Must contain UAIGOS corporate header');
  assert.ok(baselineContent.includes('REL-2026.3.1-LTS'), 'Must reference target release REL-2026.3.1-LTS');
  assert.ok(baselineContent.includes('IMMUTABLE & ARCHITECTURE FROZEN'), 'Must declare immutable frozen status');
  console.log('    ✓ ARCHITECTURE_BASELINE.md verified.');

  // 2. Verify frozen.decisions.yaml
  console.log('\n[2] Verifying frozen.decisions.yaml...');
  const frozenPath = path.join(rootDir, '.governance', 'state', 'frozen.decisions.yaml');
  assert.ok(fs.existsSync(frozenPath), 'frozen.decisions.yaml must exist');
  const frozenContent = fs.readFileSync(frozenPath, 'utf8');
  assert.ok(frozenContent.includes('Universal Autonomous AI Governance Operating System (UAIGOS)'), 'Must contain UAIGOS corporate header');
  assert.ok(frozenContent.includes('ARCHITECTURE_FREEZE: TRUE'), 'Must contain ARCHITECTURE_FREEZE: TRUE');
  assert.ok(frozenContent.includes('PROTOCOL_FREEZE: TRUE'), 'Must contain PROTOCOL_FREEZE: TRUE');
  assert.ok(frozenContent.includes('GOVERNANCE_FREEZE: TRUE'), 'Must contain GOVERNANCE_FREEZE: TRUE');
  assert.ok(frozenContent.includes('PACKAGING_FREEZE: TRUE'), 'Must contain PACKAGING_FREEZE: TRUE');
  console.log('    ✓ frozen.decisions.yaml verified.');

  // 3. Verify Product Descriptors (capabilities.yaml, release.yaml, deployment.yaml)
  console.log('\n[3] Verifying Product Descriptors (capabilities.yaml, release.yaml, deployment.yaml)...');
  const descriptors = [
    { file: 'capabilities.yaml', required: ['com.airroofers.eaorcs', '2026.3.1-LTS', 'schema_version'] },
    { file: 'release.yaml', required: ['REL-2026.3.1-LTS', 'COMMERCIAL_ENTERPRISE_GA', 'signatures'] },
    { file: 'deployment.yaml', required: ['PLATFORM-AIRROOFERS-2026', 'DISTRIBUTED_EXECUTION_NODES', 'eaorcs.airroofers.eu'] }
  ];

  descriptors.forEach(({ file, required }) => {
    const descPath = path.join(eaorcsDir, file);
    assert.ok(fs.existsSync(descPath), `${file} must exist at ${descPath}`);
    const content = fs.readFileSync(descPath, 'utf8');
    assert.ok(content.includes('Universal Autonomous AI Governance Operating System (UAIGOS)'), `${file} must contain UAIGOS corporate header`);
    required.forEach(term => {
      assert.ok(content.includes(term), `${file} must contain "${term}"`);
    });
    console.log(`    ✓ ${file} verified.`);
  });

  // 4. Verify PlatformKnowledgeGraphEngine output
  console.log('\n[4] Verifying PlatformKnowledgeGraphEngine (knowledge_graph.yaml & ARCHITECTURE.md)...');
  const engine = new PlatformKnowledgeGraphEngine();
  const graph = engine.buildKnowledgeGraph(rootDir);
  assert.strictEqual(graph.platform_id, 'PLATFORM-AIRROOFERS-2026');
  assert.ok(graph.metadata.total_entities > 0, 'Knowledge graph must index entities');

  const yamlPath = engine.exportKnowledgeGraphYaml();
  assert.ok(fs.existsSync(yamlPath), 'knowledge_graph.yaml must exist');
  const yamlContent = fs.readFileSync(yamlPath, 'utf8');
  assert.ok(yamlContent.includes('Universal Autonomous AI Governance Operating System (UAIGOS)'), 'knowledge_graph.yaml must contain corporate header');

  const archPath = engine.generateArchitectureMarkdown();
  assert.ok(fs.existsSync(archPath), 'docs/generated/ARCHITECTURE.md must exist');
  const archContent = fs.readFileSync(archPath, 'utf8');
  assert.ok(archContent.includes('Universal Autonomous AI Governance Operating System (UAIGOS)'), 'ARCHITECTURE.md must contain corporate header');
  assert.ok(archContent.includes('flowchart TD'), 'ARCHITECTURE.md must contain Mermaid diagram');
  assert.ok(archContent.includes('ASCII Representation'), 'ARCHITECTURE.md must contain ASCII representation');
  console.log('    ✓ PlatformKnowledgeGraphEngine outputs verified.');

  console.log('\n================================================================');
  console.log('  ALL STREAMS S0-S4 VERIFICATION TESTS PASSED SUCCESSFULLY! 🚀');
  console.log('================================================================\n');
}

if (require.main === module) {
  runS0ToS4Verification().catch(err => {
    console.error('Test execution error:', err.message || err);
    process.exit(1);
  });
}

module.exports = runS0ToS4Verification;
