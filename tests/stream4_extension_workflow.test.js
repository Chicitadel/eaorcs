/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Stream 4 Platform Extension & Visual Workflow Test Suite
 * File           : tests/stream4_extension_workflow.test.js
 * Version        : 2026.2.0-LTS
 * Author         : Enterprise Architecture & Security Governance Team
 * Organization   : EAORCS Platform Engineering
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
 * Copyright (c) 2026 EAORCS Platform Engineering. All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');

const {
  PlatformExtensionSdk,
  SDK_VERSION,
  checkCompatibility,
  ExtensionHooks,
  PolicyContractValidator,
  ExtensionManifestBuilder
} = require('../sdk/PlatformExtensionSdk');

const {
  VisualWorkflowDesignerEngine,
  VisualWorkflowComposer,
  NodeExecutionEngine,
  StepProgressTracker,
  WorkflowNode,
  WorkflowEdge,
  NODE_STATES,
  NODE_CATEGORIES
} = require('../engine/workflow/VisualWorkflowDesignerEngine');

async function runStream4TestSuite() {
  console.log('================================================================================');
  console.log('  EAORCS STREAM 4: PLATFORM EXTENSION SDK & VISUAL WORKFLOW DESIGNER SUITE');
  console.log('================================================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      passed++;
      console.log(`  ✅ [PASS] ${name}`);
    } catch (err) {
      failed++;
      console.error(`  ❌ [FAIL] ${name}`);
      console.error(`     Error: ${err.message}\n${err.stack}`);
    }
  }

  // ---------------------------------------------------------------------------
  // SECTION 1: UAIGOS Header Governance & Zero AI Keywords Audit
  // ---------------------------------------------------------------------------
  console.log('[SECTION 1] UAIGOS Header & Zero AI Keyword Audit');

  await test('Header & Zero AI Keyword Audit on Stream 4 files', () => {
    const targetFiles = [
      path.resolve(__dirname, '../sdk/PlatformExtensionSdk.js'),
      path.resolve(__dirname, '../engine/workflow/VisualWorkflowDesignerEngine.js')
    ];

    const aiKeywords = ['ai generated', 'ai agent', 'chatgpt', 'copilot', 'anthropic', 'openai'];

    for (const filePath of targetFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      assert.ok(content.includes('/******************************************************************************'), `${path.basename(filePath)} missing governance header`);
      assert.ok(content.includes('Enterprise Architecture & Security Governance Team'), `${path.basename(filePath)} missing Author header`);
      assert.ok(content.includes('EAORCS Platform Engineering'), `${path.basename(filePath)} missing Organization header`);

      aiKeywords.forEach(kw => {
        assert.strictEqual(
          content.toLowerCase().includes(kw),
          false,
          `Prohibited AI keyword "${kw}" found in ${path.basename(filePath)}`
        );
      });
    }
  });

  // ---------------------------------------------------------------------------
  // SECTION 2: Platform Extension SDK (@eaorcs/sdk)
  // ---------------------------------------------------------------------------
  console.log('\n[SECTION 2] Platform Extension SDK (@eaorcs/sdk)');

  await test('SDK Version Compatibility Check', () => {
    const resSame = checkCompatibility('2026.2.0-LTS');
    assert.strictEqual(resSame.compatible, true);

    const resMinorLower = checkCompatibility('2026.1.0-LTS');
    assert.strictEqual(resMinorLower.compatible, true);

    const resMajorDiff = checkCompatibility('2027.1.0-LTS');
    assert.strictEqual(resMajorDiff.compatible, false);
    assert.strictEqual(resMajorDiff.reason.includes('Major version mismatch'), true);
  });

  await test('Extension Hooks Lifecycle & Context Mutation', async () => {
    const hooks = new ExtensionHooks();

    hooks.registerHook('pre-scan', async (ctx) => {
      return { preScanExecuted: true, scannedPath: ctx.targetPath };
    }, { priority: 1, name: 'h1' });

    hooks.registerHook('pre-scan', async (ctx) => {
      return { securityVerified: true };
    }, { priority: 2, name: 'h2' });

    const list = hooks.listHooks();
    assert.ok(list['pre-scan']);
    assert.strictEqual(list['pre-scan'].length, 2);

    const result = await hooks.triggerHook('pre-scan', { targetPath: '/usr/app' });
    assert.strictEqual(result.executedCount, 2);
    assert.strictEqual(result.finalContext.preScanExecuted, true);
    assert.strictEqual(result.finalContext.securityVerified, true);
  });

  await test('Extension Manifest Builder', () => {
    const builder = new ExtensionManifestBuilder();
    const manifest = builder
      .setName('Governance Pack ISO27001')
      .setVersion('2.1.0')
      .setType('governance-pack')
      .setDescription('Automated ISO 27001 compliance rules pack')
      .setAuthor('Security Governance Team')
      .setPermissions(['READ_REPO', 'EVALUATE_RULES'])
      .addDependency('@eaorcs/core', '^2026.2.0')
      .addHook('on-policy-evaluation', './hooks/iso_eval.js')
      .build();

    assert.strictEqual(manifest.name, 'Governance Pack ISO27001');
    assert.strictEqual(manifest.type, 'governance-pack');
    assert.strictEqual(typeof manifest.checksum, 'string');
    assert.strictEqual(manifest.checksum.length, 64);
  });

  await test('Policy Contract Validator', () => {
    const validContract = {
      id: 'contract_iso_27001',
      version: '1.0.0',
      enforcementAction: 'BLOCK',
      rules: [
        { id: 'rule_sec_01', severity: 'CRITICAL', description: 'Zero hardcoded secrets' }
      ]
    };

    const validResult = PolicyContractValidator.validate(validContract);
    assert.strictEqual(validResult.valid, true);
    assert.notStrictEqual(validResult.canonicalContract, null);

    const invalidContract = { id: 123 };
    const invalidResult = PolicyContractValidator.validate(invalidContract);
    assert.strictEqual(invalidResult.valid, false);
    assert.strictEqual(invalidResult.errors.length > 0, true);
  });

  await test('Category Extension Builders', () => {
    const sdk = new PlatformExtensionSdk();

    const govPack = sdk.createGovernancePack('pack_01').setName('ISO Pack').build();
    assert.strictEqual(govPack.type, 'governance-pack');

    const reportTmpl = sdk.createReportTemplate('tmpl_01').addSection('Summary', 'audit.summary').build();
    assert.strictEqual(reportTmpl.type, 'report-template');

    const widget = sdk.createCustomWidget('w_01').setComponent('TrustMeter').build();
    assert.strictEqual(widget.type, 'custom-widget');

    const aiSkill = sdk.createAISkill('skill_01').setPromptTemplate('Audit code for OWASP top 10').build();
    assert.strictEqual(aiSkill.type, 'ai-skill');

    const mktPkg = sdk.createMarketplacePackage('mkt_01').setPricing('ENTERPRISE').build();
    assert.strictEqual(mktPkg.type, 'marketplace-package');

    const policyEngine = sdk.createPolicyEngine('pe_01').build();
    assert.strictEqual(policyEngine.type, 'policy-engine');

    const connector = sdk.createConnector('conn_jira').addEndpoint('issues', 'https://jira.internal').build();
    assert.strictEqual(connector.type, 'connector');

    const scoringAlgo = sdk.createCustomScoringAlgorithm('score_v1').addMetric('coverage', 0.4).build();
    assert.strictEqual(scoringAlgo.type, 'custom-scoring-algorithm');
  });

  // ---------------------------------------------------------------------------
  // SECTION 3: Visual Governance Workflow Designer Engine
  // ---------------------------------------------------------------------------
  console.log('\n[SECTION 3] Visual Governance Workflow Designer Engine');

  await test('Standard 8-Step Governance Pipeline Creation', () => {
    const engine = VisualWorkflowDesignerEngine.createStandardPipeline();
    const nodes = engine.composer.getNodes();
    const edges = engine.composer.getEdges();

    assert.strictEqual(nodes.length, 8);
    assert.strictEqual(edges.length, 7);

    const expectedSequence = [
      'Repository Scan',
      'Architecture Discovery',
      'Generate SBOM',
      'Evaluate Policies',
      'Generate Evidence',
      'Approve',
      'Deploy',
      'Notify'
    ];

    const actualLabels = nodes.map(n => n.label);
    assert.deepStrictEqual(actualLabels, expectedSequence);
  });

  await test('DAG Graph Validation (Topology, Kahn Algorithm, Cycle Detection)', () => {
    const composer = new VisualWorkflowComposer();
    composer.addNode({ id: 'n1', label: 'Node 1' });
    composer.addNode({ id: 'n2', label: 'Node 2' });
    composer.addEdge('n1', 'n2');

    const validRes = composer.validateGraph();
    assert.strictEqual(validRes.valid, true);
    assert.deepStrictEqual(validRes.topologicalOrder, ['n1', 'n2']);

    // Introduce cycle
    composer.addEdge('n2', 'n1');
    const cycleRes = composer.validateGraph();
    assert.strictEqual(cycleRes.valid, false);
    assert.strictEqual(cycleRes.errors.some(e => e.includes('Cycle detected')), true);
  });

  await test('Node Execution Engine Pipeline Execution', async () => {
    const engine = VisualWorkflowDesignerEngine.createStandardPipeline();
    const result = await engine.executeWorkflow({ targetDir: path.resolve(__dirname, '../') });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.summary.completedSteps, 8);
    assert.strictEqual(result.summary.failedSteps, 0);
    assert.strictEqual(result.summary.status, 'COMPLETED');

    assert.strictEqual(result.nodeOutputs['node_repo_scan'].step, 'repo_scan');
    assert.strictEqual(result.nodeOutputs['node_evaluate_policies'].complianceScore, 100.0);
    assert.strictEqual(result.nodeOutputs['node_generate_evidence'].evidenceTier, 'PLATINUM');
    assert.strictEqual(result.nodeOutputs['node_approve'].approved, true);
  });

  await test('Step Progress Tracker Event Emission', async () => {
    const engine = VisualWorkflowDesignerEngine.createStandardPipeline();
    const eventsTriggered = [];

    engine.tracker.on('workflow:start', (data) => eventsTriggered.push('workflow:start'));
    engine.tracker.on('step:start', (data) => eventsTriggered.push(`step:start:${data.nodeId}`));
    engine.tracker.on('step:complete', (data) => eventsTriggered.push(`step:complete:${data.nodeId}`));
    engine.tracker.on('workflow:complete', (data) => eventsTriggered.push('workflow:complete'));

    await engine.executeWorkflow();

    assert.strictEqual(eventsTriggered.includes('workflow:start'), true);
    assert.strictEqual(eventsTriggered.includes('step:start:node_repo_scan'), true);
    assert.strictEqual(eventsTriggered.includes('step:complete:node_notify'), true);
    assert.strictEqual(eventsTriggered.includes('workflow:complete'), true);
  });

  await test('JSON Workflow Import / Export Serialization', () => {
    const engine = VisualWorkflowDesignerEngine.createStandardPipeline();
    const exportData = engine.exportToJSON();

    assert.strictEqual(typeof exportData.json, 'string');
    assert.strictEqual(exportData.object.nodes.length, 8);
    assert.strictEqual(exportData.object.nodes[0].position.x, 100);

    const newEngine = new VisualWorkflowDesignerEngine();
    const importRes = newEngine.importFromJSON(exportData.json);

    assert.strictEqual(importRes.success, true);
    assert.strictEqual(importRes.nodesCount, 8);
    assert.strictEqual(importRes.edgesCount, 7);

    const reExported = newEngine.exportToJSON();
    assert.strictEqual(reExported.checksum, exportData.checksum);
  });

  console.log('\n================================================================================');
  console.log(`  STREAM 4 SUITE SUMMARY: Passed ${passed}/${passed + failed} tests`);
  console.log('================================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runStream4TestSuite().catch(err => {
    console.error('Stream 4 Test Suite Error:', err);
    process.exit(1);
  });
}

module.exports = { runStream4TestSuite };
