'use strict';
/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Phase 19 Master Suite
 * File           : tests/phase19/run_phase19_master_suite.js
 * Version        : 2026.17.0
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
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

// O1
const LiveProductionConnector = require('../../engine/connectors/LiveProductionConnector');
const ServiceHealthProbe = require('../../engine/connectors/ServiceHealthProbe');
const EvidenceIngestionPipeline = require('../../engine/connectors/EvidenceIngestionPipeline');

// O2
const BuildEvidencePublisher = require('../../engine/cicd/BuildEvidencePublisher');
const DeploymentEvidenceRecorder = require('../../engine/cicd/DeploymentEvidenceRecorder');
const PipelineAuditTrailEngine = require('../../engine/cicd/PipelineAuditTrailEngine');

// O3
const ExternalAuditorAccessEngine = require('../../engine/audit/ExternalAuditorAccessEngine');
const ProvenanceVerificationPortal = require('../../engine/audit/ProvenanceVerificationPortal');
const AuditorReportExporter = require('../../engine/audit/AuditorReportExporter');

// O4
const PilotInstrumentationEngine = require('../../engine/pilot/PilotInstrumentationEngine');
const TenantUsageCollector = require('../../engine/pilot/TenantUsageCollector');
const PilotHealthMonitor = require('../../engine/pilot/PilotHealthMonitor');

// O5
const EvidencePackageGenerator = require('../../engine/procurement/EvidencePackageGenerator');
const DueDiligenceReporter = require('../../engine/procurement/DueDiligenceReporter');
const RfpEvidenceBundler = require('../../engine/procurement/RfpEvidenceBundler');

// O6
const SbomExternalVerifier = require('../../engine/supplychain/SbomExternalVerifier');
const DependencyAttestationEngine = require('../../engine/supplychain/DependencyAttestationEngine');
const SignatureVerificationChain = require('../../engine/supplychain/SignatureVerificationChain');

// O7
const EvidenceDriftDetector = require('../../engine/governance/EvidenceDriftDetector');
const PolicyViolationMonitor = require('../../engine/governance/PolicyViolationMonitor');
const OperationalRegressionEngine = require('../../engine/governance/OperationalRegressionEngine');

// O8
const CommercialHealthAnalytics = require('../../engine/commercial/CommercialHealthAnalytics');
const RenewalRiskEngine = require('../../engine/commercial/RenewalRiskEngine');
const CustomerHealthConnector = require('../../engine/commercial/CustomerHealthConnector');

// O9
const ContinuousReadinessScoreEngine = require('../../engine/readiness/ContinuousReadinessScoreEngine');
const OperationalReadinessDashboard = require('../../engine/readiness/OperationalReadinessDashboard');
const Phase19OperationalAdoptionOrchestrator = require('../../engine/audit/Phase19OperationalAdoptionOrchestrator');

const STREAMS = [
  { id: 'O1', name: 'Live Production Connectors', engines: [LiveProductionConnector, ServiceHealthProbe, EvidenceIngestionPipeline] },
  { id: 'O2', name: 'CI/CD Evidence Automation', engines: [BuildEvidencePublisher, DeploymentEvidenceRecorder, PipelineAuditTrailEngine] },
  { id: 'O3', name: 'External Auditor Integration', engines: [ExternalAuditorAccessEngine, ProvenanceVerificationPortal, AuditorReportExporter] },
  { id: 'O4', name: 'Customer Pilot Instrumentation', engines: [PilotInstrumentationEngine, TenantUsageCollector, PilotHealthMonitor] },
  { id: 'O5', name: 'Procurement Evidence Portal', engines: [EvidencePackageGenerator, DueDiligenceReporter, RfpEvidenceBundler] },
  { id: 'O6', name: 'Supply Chain Verification', engines: [SbomExternalVerifier, DependencyAttestationEngine, SignatureVerificationChain] },
  { id: 'O7', name: 'Governance Analytics', engines: [EvidenceDriftDetector, PolicyViolationMonitor, OperationalRegressionEngine] },
  { id: 'O8', name: 'Commercial Operations Analytics', engines: [CommercialHealthAnalytics, RenewalRiskEngine, CustomerHealthConnector] },
  { id: 'O9', name: 'Continuous Readiness Dashboard', engines: [ContinuousReadinessScoreEngine, OperationalReadinessDashboard, Phase19OperationalAdoptionOrchestrator] }
];

async function runTests() {
  let passed = 0; let failed = 0;
  
  console.log(`
┌────────────────────────────────────────────────────────┐
│        PHASE 19 MASTER SUITE - OPERATIONAL ADOPTION    │
│            CONTINUOUS READINESS VALIDATION             │
└────────────────────────────────────────────────────────┘
`);

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch(e) {
      console.error(`  ❌ FAIL: ${name} — ${e.message}`);
      failed++;
    }
  }

  for (const stream of STREAMS) {
    console.log(`\n▶ Validating Stream ${stream.id}: ${stream.name}`);
    for (const Engine of stream.engines) {
      await test(`Verify ${Engine.name} operational compliance`, async () => {
        const engine = new Engine();
        const res = await engine.run();

        const checkFields = (obj) => {
          if (!obj || typeof obj !== 'object') return false;
          if (obj.externallyVerifiable === true) return true;
          if (obj.independentlyVerifiable === true) return true;
          if ('externalVerificationUrl' in obj) return true;
          for (const key of Object.keys(obj)) {
            if (checkFields(obj[key])) return true;
          }
          return false;
        };
        
        if (!res.dataSource || res.dataSource === 'SIMULATION') {
          throw new Error('Invalid dataSource, must be LIVE_EVIDENCE_SYSTEM or similar non-simulation data');
        }
        
        if (res.status === 'FAILED') {
          throw new Error('Status cannot be FAILED');
        }
        
        if (!checkFields(res)) {
          throw new Error('Engine must be externally/independently verifiable');
        }

        // O9 specific checks
        if (Engine === ContinuousReadinessScoreEngine) {
          if (res.compositeReadinessScore < 98) throw new Error('compositeReadinessScore must be >= 98');
          if (res.milestoneBasedScoring !== false) throw new Error('milestoneBasedScoring must be false');
        }
        
        if (Engine === OperationalReadinessDashboard) {
          if (res.alertsActive !== 0) throw new Error('alertsActive must be 0');
          if (res.milestoneGates !== false) throw new Error('milestoneGates must be false');
          if (res.overallStatus !== 'OPERATIONAL_READY') throw new Error('overallStatus must be OPERATIONAL_READY');
        }
        
        if (Engine === Phase19OperationalAdoptionOrchestrator) {
          if (res.phase19Verdict !== 'PHASE_19_OPERATIONAL_ADOPTION_COMPLETE') throw new Error('Invalid phase19Verdict');
          if (res.passedStreams !== 8) throw new Error('passedStreams must be 8');
        }
      });
    }
  }

  console.log(`\n=================================================`);
  console.log(`Summary: Total streams ${STREAMS.length}`);
  console.log(`Results: ${passed} passed, ${failed} failed (Total Tests: ${passed + failed})`);
  
  if (failed > 0) {
    console.log(`Final verdict: FAILED`);
    process.exit(1);
  } else {
    console.log(`Final verdict: PHASE_19_OPERATIONAL_ADOPTION_COMPLETE`);
    process.exit(0);
  }
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
