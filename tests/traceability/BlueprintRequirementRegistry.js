/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Blueprint Traceability / Requirement Registry
 * File           : BlueprintRequirementRegistry.js
 * Version        : 2026.1.0-LTS
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems
 * Created Date   : 2026-08-01
 * Classification : ENTERPRISE | GOVERNMENT
 * Standards      : ISO 27001, SOC 2, OWASP ASVS, NIST
 * Copyright (c) 2026 Ujomor Systems. All Rights Reserved.
 ******************************************************************************/

'use strict';

class BlueprintRequirementRegistry {
  constructor() {
    this.sections = this._buildRegistry();
  }

  _buildRegistry() {
    return [
      {
        id: 1, title: 'Executive Vision & Platform Positioning',
        mappedModules: ['engine/index.js','product.manifest.yaml','eaorcs.config.yaml'],
        mappedTests: ['tests/suite.test.js'],
        requirements: [
          { id:'1.1', text:'Platform must identify itself as EAORCS - The Software Trust Platform', criteria: 'package.json name contains eaorcs' },
          { id:'1.2', text:'Platform must declare LTS versioning', criteria: 'version string contains LTS or lts' },
          { id:'1.3', text:'Platform must expose a root index module', criteria: 'engine/index.js exports are non-empty' }
        ]
      },
      {
        id: 2, title: 'Customer Business Architecture & Value Engine',
        mappedModules: ['engine/trust/TrustScoreCalculator.js','engine/trust/RecommendationEngine.js'],
        mappedTests: ['tests/e2e_integration.test.js'],
        requirements: [
          { id:'2.1', text:'Platform computes quantified trust score from readiness, evidence, confidence', criteria: 'TrustScoreCalculator.calculateTrustScore returns numeric score >= 0' },
          { id:'2.2', text:'Platform generates prescriptive ROI-weighted remediation recommendations', criteria: 'RecommendationEngine.generateRecommendations returns array of recommendations' },
          { id:'2.3', text:'Platform supports enterprise-grade artifact identification via purl', criteria: 'Trust result includes artifactId or purl-compatible identifier' }
        ]
      },
      {
        id: 3, title: 'Outcome Graph & Enterprise ROI Engine',
        mappedModules: ['engine/predictive/RoiEngine.js'],
        mappedTests: ['tests/suite.test.js'],
        requirements: [
          { id:'3.1', text:'ROI Engine must compute financial risk avoidance value', criteria: 'RoiEngine.calculate returns roiPercentage > 0' },
          { id:'3.2', text:'ROI Engine must compute ROI multiplier > 1', criteria: 'RoiEngine result roiMultiplier > 1.0' },
          { id:'3.3', text:'ROI Engine must compute risk avoidance score with risk level', criteria: 'calculateRiskAvoidanceScore returns riskLevel string' }
        ]
      },
      {
        id: 4, title: 'The Six Enterprise Pillars of EAORCS',
        mappedModules: ['engine/trust/ReadinessEngine.js','engine/osap/OsapEngine.js','engine/runtime/HostAwarenessEngine.js'],
        mappedTests: ['tests/e2e_integration.test.js','tests/environment_certification_matrix.test.js'],
        requirements: [
          { id:'4.1', text:'Readiness Engine must evaluate readiness across 15 domains', criteria: 'ReadinessEngine is instantiable and has evaluate or assess method' },
          { id:'4.2', text:'Runtime must detect and adapt to host environment', criteria: 'HostAwarenessEngine.detectHostEnvironment returns host and capabilities' },
          { id:'4.3', text:'Platform must support 5+ deployment environments', criteria: 'SharedHost, VPS, Docker, Kubernetes, Cloud profiles all resolve capabilities' }
        ]
      },
      {
        id: 5, title: 'The Trust Fabric & OSAP',
        mappedModules: ['engine/trust/TrustFabricGraph.js','engine/osap/OsapEngine.js','engine/osap/CryptoSigner.js','sdk/verifier.cjs'],
        mappedTests: ['tests/e2e_integration.test.js','tests/subagent_beta_verification.test.cjs'],
        requirements: [
          { id:'5.1', text:'Trust Fabric Graph must be instantiable with graph methods', criteria: 'TrustFabricGraph is instantiable without error' },
          { id:'5.2', text:'OSAP Engine must compile a passport from trust data', criteria: 'OsapEngine.compilePassport returns passport object with artifactId' },
          { id:'5.3', text:'CryptoSigner must generate Ed25519 keypair', criteria: 'CryptoSigner.generateKeyPair returns { publicKey, privateKey }' },
          { id:'5.4', text:'SDK verifier must be loadable as CommonJS module', criteria: 'require sdk/verifier.cjs does not throw' }
        ]
      },
      {
        id: 6, title: 'Assurance DSL',
        mappedModules: ['dsl/AssureRuntime.cjs'],
        mappedTests: ['tests/assure_dsl.test.cjs','tests/suite.test.js'],
        requirements: [
          { id:'6.1', text:'Assurance DSL runtime must be instantiable', criteria: 'new AssureRuntime() does not throw' },
          { id:'6.2', text:'DSL runtime must expose execute method', criteria: 'typeof assureRuntime.execute === function' },
          { id:'6.3', text:'DSL runtime must support trigger handlers', criteria: 'registerTriggerHandler or loadScript is a function' }
        ]
      },
      {
        id: 7, title: 'Organizational Twin, Memory & Engineering Copilot Studio',
        mappedModules: ['engine/memory/EngineeringMemoryEngine.js'],
        mappedTests: ['tests/suite.test.js'],
        requirements: [
          { id:'7.1', text:'Engineering Memory Engine must be instantiable', criteria: 'new EngineeringMemoryEngine() does not throw' },
          { id:'7.2', text:'Memory Engine must support decision ingestion', criteria: 'ingestDecision or similar method exists' },
          { id:'7.3', text:'Memory Engine must support history query', criteria: 'getDecisionHistory or queryMemory method exists' }
        ]
      },
      {
        id: 8, title: 'Predictive & Autonomous Assurance Engine',
        mappedModules: ['engine/trust/PredictionEngine.js','engine/predictive/CyberWeatherEngine.js'],
        mappedTests: ['tests/suite.test.js'],
        requirements: [
          { id:'8.1', text:'Prediction Engine must be instantiable', criteria: 'PredictionEngine is instantiable' },
          { id:'8.2', text:'Cyber Weather Engine must compute threat forecast', criteria: 'CyberWeatherEngine.getForecast returns threatIndex >= 0' },
          { id:'8.3', text:'Cyber Weather Engine must produce nervous system signal', criteria: 'forecast.nervousSystemSignal.status is a string' }
        ]
      },
      {
        id: 9, title: 'Next-Generation Enterprise Architecture Hierarchy',
        mappedModules: ['engine/kernel/Kernel.js','engine/kernel/EventBus.js','engine/kernel/ModuleRegistry.js'],
        mappedTests: ['tests/runtime/kernel_and_subsystems.test.js'],
        requirements: [
          { id:'9.1', text:'Kernel must be instantiable as central orchestrator', criteria: 'new Kernel() or Kernel from export does not throw' },
          { id:'9.2', text:'EventBus must support publish/subscribe pattern', criteria: 'EventBus has emit/on or publish/subscribe methods' },
          { id:'9.3', text:'ModuleRegistry must support module registration', criteria: 'ModuleRegistry has register method' }
        ]
      },
      {
        id: 10, title: 'Digital Twin 2.0 & Engineering Time Machine',
        mappedModules: ['engine/twin/DigitalTwinEngine.js'],
        mappedTests: ['tests/digital_twin.test.cjs','tests/suite.test.js'],
        requirements: [
          { id:'10.1', text:'Digital Twin must capture entity state snapshots', criteria: 'captureState returns { status: CAPTURED, hash }' },
          { id:'10.2', text:'Digital Twin must reconstruct historical state', criteria: 'reconstructState returns { entityId, metadata.governanceVerified: true }' },
          { id:'10.3', text:'Digital Twin must provide timeline access', criteria: 'getTimeline method exists and returns array' }
        ]
      },
      {
        id: 11, title: 'Autonomous Engineering AI & The AI Council',
        mappedModules: ['engine/aicouncil/AiCouncilEngine.js'],
        mappedTests: ['tests/ai_council.test.cjs','tests/suite.test.js'],
        requirements: [
          { id:'11.1', text:'AI Council Engine must be instantiable', criteria: 'AiCouncilEngine is instantiable' },
          { id:'11.2', text:'AI Council must support agent registration', criteria: 'registerAgent or addAgent method exists' },
          { id:'11.3', text:'AI Council must produce consensus evaluation', criteria: 'evaluateConsensus or similar method returns result object' }
        ]
      },
      {
        id: 12, title: 'Engineering DNA, Genome & Carbon Intelligence',
        mappedModules: ['engine/genome/DigitalGenomeEngine.js'],
        mappedTests: ['tests/genome.test.cjs','tests/suite.test.js'],
        requirements: [
          { id:'12.1', text:'Digital Genome Engine must be instantiable', criteria: 'DigitalGenomeEngine is instantiable' },
          { id:'12.2', text:'Genome Engine must generate digital genome profile', criteria: 'generateGenomeProfile or similar method returns profile' },
          { id:'12.3', text:'Genome profile must contain technology fingerprint', criteria: 'profile has technology, languages, or stack field' }
        ]
      },
      {
        id: 13, title: 'Product Editions, Licensing & Pricing Matrix',
        mappedModules: ['engine/saas/SubscriptionGate.js','engine/commercial/ProductCommercialization.js'],
        mappedTests: ['tests/e2e_integration.test.js'],
        requirements: [
          { id:'13.1', text:'SubscriptionGate must gate features by tier', criteria: 'isFeatureAllowed(Enterprise, feature) returns true' },
          { id:'13.2', text:'SubscriptionGate must deny Community access to enterprise features', criteria: 'isFeatureAllowed(Community, real_time_assurance) returns false' },
          { id:'13.3', text:'Product Commercialization module must be instantiable', criteria: 'ProductCommercialization can be constructed without error' }
        ]
      },
      {
        id: 14, title: 'Universal Technology Coverage Framework (UTCF)',
        mappedModules: ['engine/utcf/UtcfEngine.js'],
        mappedTests: ['tests/utcf.test.js'],
        requirements: [
          { id:'14.1', text:'UTCF Engine must be instantiable', criteria: 'UtcfEngine is instantiable' },
          { id:'14.2', text:'UTCF must cover language adapters', criteria: 'UTCF has language adapter support (Java, PHP, .NET, Python at minimum)' },
          { id:'14.3', text:'UTCF must cover framework adapters', criteria: 'UTCF has framework adapter support' }
        ]
      },
      {
        id: 15, title: 'Marketplace Economy, Assurance SDK & Insurance',
        mappedModules: ['engine/marketplace/MarketplaceEngine.js','engine/plugin/PluginRegistry.js','sdk/verifier.cjs'],
        mappedTests: ['tests/e2e_integration.test.js'],
        requirements: [
          { id:'15.1', text:'MarketplaceEngine must be instantiable', criteria: 'MarketplaceEngine can be constructed' },
          { id:'15.2', text:'PluginRegistry must register plugins', criteria: 'register() accepts plugin and returns result' },
          { id:'15.3', text:'SDK verifier must verify OSAP passports', criteria: 'sdk/verifier.cjs loads without error' }
        ]
      },
      {
        id: 16, title: 'EAORCS Academy & Research Institute',
        mappedModules: ['docs/'],
        mappedTests: [],
        requirements: [
          { id:'16.1', text:'Documentation directory must exist', criteria: 'docs/ directory exists' },
          { id:'16.2', text:'Product manifest must be present', criteria: 'product.manifest.yaml exists' },
          { id:'16.3', text:'Config schema must be present', criteria: 'eaorcs.config.yaml exists' }
        ]
      },
      {
        id: 17, title: 'Award-Winning UX & Mobile Decision Companion',
        mappedModules: ['cli/index.js','index.html'],
        mappedTests: [],
        requirements: [
          { id:'17.1', text:'CLI must be present and executable', criteria: 'cli/index.js exists' },
          { id:'17.2', text:'Web entry point must exist', criteria: 'index.html exists and contains EAORCS' },
          { id:'17.3', text:'CLI must support audit subcommand', criteria: 'cli/index.js references audit command' }
        ]
      },
      {
        id: 18, title: 'EAORCS 10-Year Evolution Roadmap',
        mappedModules: ['product.manifest.yaml','engine/index.js'],
        mappedTests: [],
        requirements: [
          { id:'18.1', text:'Platform must declare edition support', criteria: 'product manifest or SubscriptionGate lists editions' },
          { id:'18.2', text:'Platform must declare roadmap or version stream', criteria: 'version string or config references LTS release' },
          { id:'18.3', text:'Platform index must export core engines', criteria: 'engine/index.js exports > 3 modules' }
        ]
      },
      {
        id: 19, title: 'Architectural Freeze Declaration & Early Commercial Release',
        mappedModules: ['eaorcs.config.yaml','product.manifest.yaml'],
        mappedTests: [],
        requirements: [
          { id:'19.1', text:'Product manifest must exist with version', criteria: 'product.manifest.yaml is readable and non-empty' },
          { id:'19.2', text:'OSAP passport must have been generated for release', criteria: 'osap-passport.json exists' },
          { id:'19.3', text:'Certificate must have been issued for platform', criteria: 'eaorcs-certificate.json exists' }
        ]
      },
      {
        id: 20, title: 'Air Roofers Platform Services Architecture & IAM Alignment',
        mappedModules: ['adapters/'],
        mappedTests: [],
        requirements: [
          { id:'20.1', text:'Adapters directory must exist', criteria: 'adapters/ directory exists' },
          { id:'20.2', text:'Identity adapter must be present', criteria: 'IdentityAdapter.js exists in adapters/' },
          { id:'20.3', text:'Billing adapter must be present', criteria: 'BillingAdapter.js exists in adapters/' }
        ]
      },
      {
        id: 21, title: 'Phase 1 - Product Execution Program & 8 Parallel Workstreams',
        mappedModules: ['engine/execution/','engine/ExecutionGraph.js'],
        mappedTests: ['tests/suite.test.js'],
        requirements: [
          { id:'21.1', text:'ExecutionGraph must support DAG execution', criteria: 'ExecutionGraph is importable and has run or execute method' },
          { id:'21.2', text:'Engine must declare execution manifest', criteria: 'engine/execution_manifest.yaml exists' },
          { id:'21.3', text:'Platform must support parallel workstream execution', criteria: 'ExecutionGraph supports topological ordering' }
        ]
      },
      {
        id: 22, title: 'Product Readiness Reviews & Milestone Roadmap',
        mappedModules: ['tests/suite.test.js','tests/e2e_integration.test.js','tests/environment_certification_matrix.test.js'],
        mappedTests: ['tests/suite.test.js'],
        requirements: [
          { id:'22.1', text:'Master verification suite must exist', criteria: 'tests/suite.test.js exists' },
          { id:'22.2', text:'E2E integration suite must pass all tests', criteria: 'e2e_integration.test.js runs without error' },
          { id:'22.3', text:'Environment certification suite must pass all tiers', criteria: 'environment_certification_matrix.test.js runs without error' }
        ]
      },
      {
        id: 23, title: 'Governance & Compliance Statement',
        mappedModules: ['engine/policy/PolicyPackLoader.js','engine/saas/RbacEngine.js'],
        mappedTests: ['tests/e2e_integration.test.js'],
        requirements: [
          { id:'23.1', text:'PolicyPackLoader must list built-in compliance packs', criteria: 'PolicyPackLoader.listPacks() returns array with >= 1 pack' },
          { id:'23.2', text:'RBAC must enforce role-based access', criteria: 'Owner authorized for audit:run, Viewer denied audit:delete' },
          { id:'23.3', text:'Security hardening engine must be present', criteria: 'engine/security/ directory exists with at least one file' }
        ]
      }
    ];
  }

  getSection(id) { return this.sections.find(s => s.id === id); }
  getAllSections() { return this.sections; }
  getTotalRequirements() { return this.sections.reduce((sum, s) => sum + s.requirements.length, 0); }
}

module.exports = { BlueprintRequirementRegistry };
