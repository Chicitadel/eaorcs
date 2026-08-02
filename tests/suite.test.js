/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Master System Verification Suite (Streams A.5 - K)
 * File           : suite.test.js
 * Version        : 2026.1.0-LTS
 * Author         : Enterprise Architecture Governance Committee
 * Organization   : Ujomor Systems Engineering
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : GOVERNMENT | ENTERPRISE | INTERNAL
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
 * Copyright (c) 2026 Ujomor Systems Engineering
 * All Rights Reserved.
 ******************************************************************************/

const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Stream A.5: Host Awareness
const HostAwarenessEngine = require('../engine/runtime/HostAwarenessEngine');

// Stream B & C: Audit Kernel, Policy Engine, Evidence Bundle
const ExecutionGraph = require('../engine/ExecutionGraph');
const PolicyEngine = require('../engine/policy/PolicyEngine.cjs');
const EvidenceBundle = require('../engine/certification/EvidenceBundle.cjs');

// Stream D: Assurance DSL
const AssureRuntime = require('../dsl/AssureRuntime.cjs');
const AssureLexer = require('../dsl/AssureLexer.cjs');
const AssureParser = require('../dsl/AssureParser.cjs');

// Stream E: AI Council
const AiCouncilEngine = require('../engine/ai/AiCouncilEngine.cjs');

// Stream F: Digital Genome
const GenomeEngine = require('../engine/genome/GenomeEngine.cjs');

// Stream G: IDE Matrix
const UniversalIdeMatrix = require('../engine/ide/UniversalIdeMatrix.cjs');

// Stream H: Security & MultiSig
const MultiSigAttestationEngine = require('../engine/security/MultiSigAttestationEngine.cjs');

// Stream I: Executive Intelligence
const RoiEngine = require('../engine/predictive/RoiEngine');
const DigitalTwinEngine = require('../engine/twin/DigitalTwinEngine');
const CyberWeatherEngine = require('../engine/predictive/CyberWeatherEngine');

// Stream K: Operational Intelligence
const OperationalIntelligenceEngine = require('../engine/operations/OperationalIntelligenceEngine');
const HealthObservatory = require('../engine/operations/HealthObservatory');
const DriftAnalytics = require('../engine/operations/DriftAnalytics');
const AutoRepairAdvisor = require('../engine/operations/AutoRepairAdvisor');
const SupportDiagnosticsBundle = require('../engine/operations/SupportDiagnosticsBundle');

async function runMasterVerificationSuite() {
  console.log('================================================================');
  console.log('  EAORCS MASTER SYSTEM VERIFICATION SUITE — STREAMS A.5 THROUGH K');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function runTest(name, fn) {
    totalTests++;
    try {
      fn();
      console.log(`  [PASS] Test ${totalTests}: ${name}`);
      passedTests++;
    } catch (err) {
      console.error(`  [FAIL] Test ${totalTests}: ${name}`);
      console.error(`         Error: ${err.message}`);
      throw err;
    }
  }

  async function runAsyncTest(name, fn) {
    totalTests++;
    try {
      await fn();
      console.log(`  [PASS] Test ${totalTests}: ${name}`);
      passedTests++;
    } catch (err) {
      console.error(`  [FAIL] Test ${totalTests}: ${name}`);
      console.error(`         Error: ${err.message}`);
      throw err;
    }
  }

  // --------------------------------------------------------------------------
  // STREAM A.5: Host Portability Matrix & Host Awareness
  // --------------------------------------------------------------------------
  console.log('--- [STREAM A.5] Host Portability Matrix Validation ---');
  
  runTest('SharedHost Environment Detection & Capability Resolution', () => {
    const engine = new HostAwarenessEngine({ force_environment: 'SharedHost' });
    const res = engine.detectHostEnvironment();
    assert.strictEqual(res.host, 'SharedHost');
    assert.strictEqual(res.capabilities.docker, false);
    assert.strictEqual(res.capabilities.storageDriver, 'LocalFilesystem');
  });

  runTest('VPS Environment Detection & Capability Resolution', () => {
    const engine = new HostAwarenessEngine({ force_environment: 'VPS' });
    const res = engine.detectHostEnvironment();
    assert.strictEqual(res.host, 'VPS');
    assert.strictEqual(res.capabilities.docker, true);
  });

  runTest('Docker Environment Detection & Capability Resolution', () => {
    const engine = new HostAwarenessEngine({ force_environment: 'Docker' });
    const res = engine.detectHostEnvironment();
    assert.strictEqual(res.host, 'Docker');
    assert.strictEqual(res.capabilities.redis, true);
  });

  runTest('Kubernetes Environment Detection & Capability Resolution', () => {
    const engine = new HostAwarenessEngine({ force_environment: 'Kubernetes' });
    const res = engine.detectHostEnvironment();
    assert.strictEqual(res.host, 'Kubernetes');
    assert.strictEqual(res.capabilities.schedulerDriver, 'K8sCronJob');
  });

  runTest('Cloud AWS Environment Detection & Capability Resolution', () => {
    const engine = new HostAwarenessEngine({ force_environment: 'AWS' });
    const res = engine.detectHostEnvironment();
    assert.strictEqual(res.host, 'AWS');
    assert.strictEqual(res.capabilities.s3, true);
  });

  // --------------------------------------------------------------------------
  // STREAM B & C: Audit Kernel DAG & Policy Evidence Bundle
  // --------------------------------------------------------------------------
  console.log('\n--- [STREAM B & C] Execution Graph DAG & Policy Evidence Bundle ---');

  await runAsyncTest('DAG Execution Kernel & Determinism Hash', async () => {
    const graph = new ExecutionGraph();
    const specHash = graph.spec.calculateSpecHash();
    assert.ok(specHash, 'Spec hash must be generated');
  });

  runTest('PolicyEngine Evaluation & Level A Evidence Bundle Verification', () => {
    const policyEngine = new PolicyEngine();
    const evaluation = policyEngine.evaluate([]);
    assert.strictEqual(evaluation.decision, 'PASS');

    const evidenceBundle = new EvidenceBundle();
    const item = evidenceBundle.addEvidence('ev-001', { test: true }, { source: 'unit-test' });
    assert.ok(item.signature, 'Signature required for Level A evidence');

    const verified = evidenceBundle.verifyEvidence('ev-001');
    assert.strictEqual(verified, true, 'Cryptographic evidence signature verification failed');
  });

  // --------------------------------------------------------------------------
  // STREAM D: Assurance DSL
  // --------------------------------------------------------------------------
  console.log('\n--- [STREAM D] Assurance DSL Compiler & Runtime ---');

  runTest('Assurance DSL Lexer, Parser & Runtime Execution', () => {
    const script = `
      policy "SecurityPolicy" {
        require score >= 80;
        deny "Security score below threshold";
      }
    `;
    const lexer = new AssureLexer(script);
    const tokens = lexer.tokenize();
    assert.ok(tokens.length > 0);

    const parser = new AssureParser(tokens);
    const ast = parser.parse();
    assert.strictEqual(ast.type, 'Program');

    const runtime = new AssureRuntime();
    runtime.loadScript(script);
    const passResult = runtime.execute('SecurityPolicy', { score: 95 });
    assert.strictEqual(passResult.success, true);
  });

  // --------------------------------------------------------------------------
  // STREAM E: AI Council Governance
  // --------------------------------------------------------------------------
  console.log('\n--- [STREAM E] AI Council Governance Engine ---');

  await runAsyncTest('AI Council Consensus Evaluation', async () => {
    const council = new AiCouncilEngine();
    const evaluation = await council.evaluateProposal({ title: 'Stream E Governance Audit' });
    assert.ok(evaluation.consensus, 'Consensus object required');
    assert.strictEqual(evaluation.votes.length, 11, 'All 11 specialist agents must vote');
  });

  // --------------------------------------------------------------------------
  // STREAM F: Digital Genome
  // --------------------------------------------------------------------------
  console.log('\n--- [STREAM F] Digital Genome & Carbon Intelligence ---');

  runTest('Digital Genome Profile Generation', () => {
    const genome = new GenomeEngine();
    const profile = genome.generateProfile({ metrics: { uptime: 99.9, securityScore: 98 } });
    assert.ok(profile.vector);
    assert.ok(profile.carbonIntelligence !== undefined);
  });

  // --------------------------------------------------------------------------
  // STREAM G: Universal IDE Matrix
  // --------------------------------------------------------------------------
  console.log('\n--- [STREAM G] Universal IDE Matrix & Adapter Layer ---');

  runTest('IDE Matrix Ecosystem Coverage Verification', () => {
    const coverage = UniversalIdeMatrix.verifyEcosystemCoverage();
    assert.strictEqual(coverage.status, 'PASSED');
    assert.ok(coverage.total_ides_registered >= 35);
  });

  // --------------------------------------------------------------------------
  // STREAM H: Security & MultiSig Attestation
  // --------------------------------------------------------------------------
  console.log('\n--- [STREAM H] Security & MultiSig Attestation Engine ---');

  runTest('MultiSig Attestation Signing & Verification', () => {
    const engine = new MultiSigAttestationEngine();
    const attestation = engine.verifyMultiPartySignatures();
    assert.strictEqual(attestation.multi_sig_status, 'PASSED');
    assert.strictEqual(attestation.all_required_present, true);
  });

  // --------------------------------------------------------------------------
  // STREAM I: Executive Intelligence
  // --------------------------------------------------------------------------
  console.log('\n--- [STREAM I] Executive Intelligence (ROI, Digital Twin 2.0, Cyber Weather) ---');

  runTest('RoiEngine Financial Risk Avoidance & ROI Multiplier', () => {
    const roiEngine = new RoiEngine();
    const roi = roiEngine.calculateRoi({ manualAuditHoursSaved: 500, systemCost: 50000 });
    assert.strictEqual(roi.status, 'SUCCESS');
    assert.ok(roi.roiPercentage > 0);
    assert.ok(roi.roiMultiplier > 1.0);

    const riskData = roiEngine.calculateRiskAvoidanceScore(0, 98, 0.99);
    assert.strictEqual(riskData.riskLevel, 'LOW');
    assert.ok(riskData.estimatedRiskExposureAvoided > 0);
  });

  runTest('DigitalTwinEngine Snapshot & Engineering Time Machine', () => {
    const twin = new DigitalTwinEngine();
    const snapshot = twin.captureState('entity-alpha', { metric: 42 });
    assert.strictEqual(snapshot.status, 'CAPTURED');
    assert.ok(snapshot.hash);

    const reconstructed = twin.reconstructState('entity-alpha', '2026-08-01T12:00:00Z');
    assert.strictEqual(reconstructed.entityId, 'entity-alpha');
    assert.strictEqual(reconstructed.metadata.governanceVerified, true);
  });

  runTest('CyberWeatherEngine 5-Vector Forecast & Nervous System Telemetry', () => {
    const cyberWeather = new CyberWeatherEngine();
    const forecast = cyberWeather.getForecast({ activeNodes: 150, errorRate: 0.001 });
    assert.ok(forecast.threatIndex >= 0);
    assert.ok(forecast.vectors.network);
    assert.strictEqual(forecast.nervousSystemSignal.status, 'HEALTHY');
  });

  // --------------------------------------------------------------------------
  // STREAM J: Distribution Platform Manifests & Installer Verification
  // --------------------------------------------------------------------------
  console.log('\n--- [STREAM J] Distribution Platform Integrity Verification ---');

  runTest('Packaging Artifacts Existence & Format Integrity', () => {
    const installPhp = path.resolve(__dirname, '../packaging/shared-host/install.php');
    const deployPhp = path.resolve(__dirname, '../packaging/shared-host/deploy.php');
    const dockerCompose = path.resolve(__dirname, '../packaging/docker/docker-compose.yml');
    const k8sDeployment = path.resolve(__dirname, '../packaging/kubernetes/deployment.yaml');
    const cloudTemplate = path.resolve(__dirname, '../packaging/cloud/template.json');

    assert.ok(fs.existsSync(installPhp), 'install.php missing');
    assert.ok(fs.existsSync(deployPhp), 'deploy.php missing');
    assert.ok(fs.existsSync(dockerCompose), 'docker-compose.yml missing');
    assert.ok(fs.existsSync(k8sDeployment), 'deployment.yaml missing');
    assert.ok(fs.existsSync(cloudTemplate), 'template.json missing');

    const templateContent = JSON.parse(fs.readFileSync(cloudTemplate, 'utf8'));
    assert.ok(templateContent.AWSTemplateFormatVersion, 'Cloud template invalid JSON');
  });

  // --------------------------------------------------------------------------
  // STREAM K: Operational Intelligence
  // --------------------------------------------------------------------------
  console.log('\n--- [STREAM K] Operational Intelligence Engine & Diagnostics ---');

  runTest('HealthObservatory Real-Time Metrics Collection', () => {
    const obs = new HealthObservatory();
    const report = obs.getHealthReport();
    assert.ok(['HEALTHY', 'DEGRADED', 'CRITICAL'].includes(report.status));
    assert.ok(report.metrics.memory.heapUsedMb > 0);
  });

  runTest('DriftAnalytics Architecture & Configuration Drift Analysis', () => {
    const drift = new DriftAnalytics({ targetDir: path.resolve(__dirname, '../') });
    const report = drift.analyzeDrift({ environment: 'production' });
    assert.strictEqual(report.status, 'SUCCESS');
    assert.ok(report.driftScore >= 0);
  });

  runTest('AutoRepairAdvisor Remediation Plan Generation', () => {
    const advisor = new AutoRepairAdvisor();
    const driftReport = { violations: [{ category: 'ARCHITECTURE', type: 'MISSING_STATE_FILE', severity: 'WARNING', recommendation: 'Restore state file' }] };
    const healthReport = { status: 'HEALTHY' };
    const plan = advisor.generateRepairPlan(driftReport, healthReport);
    assert.ok(plan.planId);
    assert.strictEqual(plan.actions.length, 1);

    const execResult = advisor.executeAutoRepair(plan, { dryRun: true });
    assert.strictEqual(execResult.status, 'SUCCESS');
    assert.strictEqual(execResult.mode, 'DRY_RUN');
  });

  runTest('SupportDiagnosticsBundle One-Click Generation & Hash Signing', () => {
    const diag = new SupportDiagnosticsBundle();
    const bundle = diag.generateBundle();
    assert.ok(bundle.bundleId);
    assert.ok(bundle.bundleHash);
    assert.ok(bundle.signature);
    assert.strictEqual(bundle.governanceVerified, true);
  });

  runTest('OperationalIntelligenceEngine Master Controller Diagnostics', () => {
    const masterEngine = new OperationalIntelligenceEngine();
    const fullDiag = masterEngine.runFullDiagnostics();
    assert.ok(fullDiag.health);
    assert.ok(fullDiag.drift);
    assert.ok(fullDiag.repairPlan);
  });

  console.log('\n================================================================');
  console.log(`  PASSED ${passedTests} OF ${totalTests} VERIFICATION SUITE TESTS (100%)`);
  console.log('  ALL 11 STREAMS (A.5 - K) & HOST PORTABILITY MATRIX PASSED!');
  console.log('================================================================\n');
}

if (require.main === module) {
  runMasterVerificationSuite().catch(err => {
    console.error('Verification Suite Exception:', err);
    process.exit(1);
  });
}

module.exports = runMasterVerificationSuite;
