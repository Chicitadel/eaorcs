/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Stream 4 Convergence Pipeline & Knowledge Graph Test
 * File           : eaorcs_corp_convergence_pipeline.test.js
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
 * CORP: Stream 4 Convergence Pipeline & Platform Knowledge Graph Integrator
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
const assert = require('assert');

const PlatformKnowledgeGraphEngine = require('../../engine/docs/PlatformKnowledgeGraphEngine');
const PlatformConvergenceEngine = require('../../engine/docs/PlatformConvergenceEngine');

const rootDir = path.resolve(__dirname, '../../../../');

async function runConvergencePipelineTest() {
  console.log('[EAORCS Stream 4 Convergence Test] Starting verification of Platform Knowledge Graph & Convergence Pipeline...');

  // 1. Instantiate Engines
  const kgEngine = new PlatformKnowledgeGraphEngine();
  const convEngine = new PlatformConvergenceEngine();

  // 2. Verify PlatformKnowledgeGraphEngine buildKnowledgeGraph
  console.log('-> Testing buildKnowledgeGraph...');
  const graph = kgEngine.buildKnowledgeGraph(rootDir);
  
  assert.ok(graph, 'Knowledge graph must be created');
  assert.strictEqual(graph.platform_id, 'PLATFORM-AIRROOFERS-2026', 'Platform ID MUST be globally unique PLATFORM-AIRROOFERS-2026');
  assert.ok(Array.isArray(graph.nodes), 'Graph must contain nodes array');
  assert.ok(Array.isArray(graph.edges), 'Graph must contain edges array');
  assert.ok(graph.nodes.length > 0, 'Graph must contain nodes');
  assert.ok(graph.entities.products.length >= 3, 'Must index all platform products (EAORCS, AirRoofers, Convergence)');

  // Verify unique platform_id and product_id on all nodes
  graph.nodes.forEach(node => {
    assert.strictEqual(node.platform_id, 'PLATFORM-AIRROOFERS-2026', `Node ${node.id} must have platform_id PLATFORM-AIRROOFERS-2026`);
    assert.ok(node.product_id, `Node ${node.id} must have a non-empty product_id`);
  });
  console.log('✓ Knowledge graph constructed with enforced PLATFORM-AIRROOFERS-2026 ID and entity mappings.');

  // 3. Verify queryKnowledgeGraph
  console.log('-> Testing queryKnowledgeGraph...');
  const queryResult = kgEngine.queryKnowledgeGraph('API');
  assert.ok(queryResult, 'Query result must be returned');
  assert.strictEqual(queryResult.platform_id, 'PLATFORM-AIRROOFERS-2026');
  assert.ok(Array.isArray(queryResult.standards), 'Query result must include standards');
  assert.ok(Array.isArray(queryResult.products), 'Query result must include products');
  assert.ok(Array.isArray(queryResult.adrs), 'Query result must include adrs');
  assert.ok(Array.isArray(queryResult.guides), 'Query result must include guides');

  // Verify query with product term
  const queryProd = kgEngine.queryKnowledgeGraph('EAORCS');
  assert.ok(queryProd.products.some(p => p.product_id === 'EAORCS'), 'Query for EAORCS should return EAORCS product');
  console.log('✓ Knowledge graph query engine successfully resolved referenced standards, products, ADRs, and guides.');

  // 4. Verify exportKnowledgeGraphYaml
  console.log('-> Testing exportKnowledgeGraphYaml...');
  const exportPath = path.join(rootDir, 'dist', 'knowledge_graph.yaml');
  kgEngine.exportKnowledgeGraphYaml(exportPath);
  assert.ok(fs.existsSync(exportPath), `Exported knowledge_graph.yaml must exist at ${exportPath}`);

  const yamlContent = fs.readFileSync(exportPath, 'utf8');
  assert.ok(yamlContent.includes('UAIGOS'), 'Exported YAML must include corporate header');
  assert.ok(yamlContent.includes('PLATFORM-AIRROOFERS-2026'), 'Exported YAML must contain PLATFORM-AIRROOFERS-2026');
  console.log('✓ exportKnowledgeGraphYaml successfully exported knowledge_graph.yaml with corporate header.');

  // 5. Verify PlatformConvergenceEngine & Universal ZIP Embedding
  console.log('-> Testing Universal ZIP Embedding...');
  const zipPath = path.join(rootDir, 'dist', 'test_universal_bundle.zip');
  const zipResult = convEngine.createUniversalZipBundle(rootDir, zipPath);
  assert.ok(fs.existsSync(zipPath), `Universal ZIP bundle must exist at ${zipPath}`);
  assert.strictEqual(zipResult.status, 'EMBEDDED');

  const zipBuf = fs.readFileSync(zipPath);
  assert.strictEqual(zipBuf.readUInt32LE(0), 0x04034b50, 'Universal ZIP file must begin with valid PKZip local header signature (0x04034b50)');
  console.log('✓ Universal ZIP embedding verified with valid PKZip binary headers.');

  // 6. Verify Customer Doc Trimming
  console.log('-> Testing Customer Doc Trimming...');
  const sampleDoc = `# Public Feature Guide\n<!-- INTERNAL_ONLY confidential internal notes -->\nThis is customer facing content.\n<!-- CONFIDENTIAL confidential section -->\nINTERNAL_NOTE: Do not share.\nFinal public sentence.`;
  const trimmed = convEngine.trimCustomerDocContent(sampleDoc);

  assert.ok(!trimmed.includes('INTERNAL_ONLY'), 'Trimmed doc must not contain INTERNAL_ONLY comments');
  assert.ok(!trimmed.includes('CONFIDENTIAL'), 'Trimmed doc must not contain CONFIDENTIAL comments');
  assert.ok(!trimmed.includes('INTERNAL_NOTE:'), 'Trimmed doc must not contain INTERNAL_NOTE lines');
  assert.ok(trimmed.includes('This is customer facing content.'), 'Trimmed doc must preserve customer content');
  assert.ok(trimmed.includes('Final public sentence.'), 'Trimmed doc must preserve public sentences');

  const docResult = convEngine.trimCustomerDocumentation(rootDir);
  assert.strictEqual(docResult.status, 'TRIMMED');
  console.log('✓ Customer documentation trimming verified with zero internal leakage.');

  // 7. Verify bin/ Taxonomy
  console.log('-> Testing bin/ Taxonomy...');
  const binResult = convEngine.verifyAndGenerateBinTaxonomy(rootDir);
  assert.strictEqual(binResult.status, 'VERIFIED');

  const binFiles = ['eaorcs', 'eaorcs.cmd', 'eaorcs.ps1'];
  binFiles.forEach(fileName => {
    const fullBinPath = path.join(rootDir, 'bin', fileName);
    assert.ok(fs.existsSync(fullBinPath), `bin/ file MUST exist: ${fileName}`);
    const binContent = fs.readFileSync(fullBinPath, 'utf8');
    assert.ok(binContent.includes('EAORCS'), `bin file ${fileName} must reference EAORCS entrypoint`);
  });
  console.log('✓ bin/ taxonomy verified with CLI executable launchers.');

  // 8. Test Execute Full Pipeline
  console.log('-> Testing executePipeline...');
  const pipelineResult = convEngine.executePipeline(rootDir);
  assert.strictEqual(pipelineResult.status, 'CONVERGED');
  assert.strictEqual(pipelineResult.platformId, 'PLATFORM-AIRROOFERS-2026');
  console.log('✓ Full Platform Convergence Pipeline executed successfully.');

  console.log('\n[EAORCS Stream 4 Convergence Test] ALL CONVERGENCE PIPELINE TESTS PASSED SUCCESSFULLY! 🚀');
}

module.exports = runConvergencePipelineTest;

if (require.main === module) {
  runConvergencePipelineTest().catch(err => {
    console.error('Convergence pipeline test failed:', err);
    process.exit(1);
  });
}
