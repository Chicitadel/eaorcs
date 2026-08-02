/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Audit Engine Kernel Runner (v6.1 Universal IDE Framework)
 * File           : index.cjs
 * Version        : 2026.1-LTS (v6.1 Universal IDE Framework)
 * Author         : Architectural Governance Council & Ujomor Systems Engineering
 * Organization   : Chicitadel / Air Roofers SASU
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | RESTRICTED
 ******************************************************************************/

// Core Engine Components
const ExecutionGraph = require('./ExecutionGraph.cjs');
const AnalyzerRegistry = require('./AnalyzerRegistry.cjs');
const RuleRegistry = require('./RuleRegistry.cjs');
const SecurityAnalyzer = require('./analyzers/SecurityAnalyzer.cjs');
const FindingModel = require('./policy/FindingModel.cjs');
const PolicyEngine = require('./policy/PolicyEngine.cjs');
const EvidenceBundle = require('./certification/EvidenceBundle.cjs');
const ProvenanceGraph = require('./certification/ProvenanceGraph.cjs');
const ExecutionManifest = require('./certification/ExecutionManifest.cjs');
const ReplayEngine = require('./certification/ReplayEngine.cjs');
const PrrScorecard = require('./certification/PrrScorecard.cjs');
const PrrEvaluator = require('./certification/PrrEvaluator.cjs');

// Architecture & Realignment Modules
const ArchitectureManager = require('./architecture/ArchitectureManager.cjs');
const FreezeGovernanceEngine = require('./validation/FreezeGovernanceEngine.cjs');
const TrustGraphEngine = require('./trust/TrustGraphEngine.cjs');
const OsapExtensionEngine = require('./sdk/OsapExtensionEngine.cjs');
const OutcomeGraphEngine = require('./twin/OutcomeGraphEngine.cjs');
const UtcfCoverageEngine = require('./analyzers/UtcfCoverageEngine.cjs');
const MarketplacePluginEngine = require('./plugin/MarketplacePluginEngine.cjs');
const TrustEventLedger = require('./events/TrustEventLedger.cjs');
const PepStreamTracker = require('./execution/PepStreamTracker.cjs');
const PlatformComplianceAuditor = require('./audit/PlatformComplianceAuditor.cjs');

// Continuous & Federated Attestation Modules
const MetricClassifier = require('./trust/MetricClassifier.cjs');
const CmmEvaluator = require('./trust/CmmEvaluator.cjs');
const TrustDecayEngine = require('./trust/TrustDecayEngine.cjs');
const TrustDriftDetector = require('./trust/TrustDriftDetector.cjs');
const AttestationSourceRegistry = require('./trust/AttestationSourceRegistry.cjs');
const AiGovernanceTracker = require('./ai/AiGovernanceTracker.cjs');
const ProfileBundleLoader = require('./policy/ProfileBundleLoader.cjs');
const ObservatoryDashboard = require('./audit/ObservatoryDashboard.cjs');
const ImmutabilityEngine = require('./storage/ImmutabilityEngine.cjs');
const ChainOfCustodyTracker = require('./certification/ChainOfCustodyTracker.cjs');
const MultiSigAttestationEngine = require('./security/MultiSigAttestationEngine.cjs');
const TimestampAuthority = require('./security/TimestampAuthority.cjs');
const IncrementalCertificationEngine = require('./execution/IncrementalCertificationEngine.cjs');
const HumanReviewEngine = require('./policy/HumanReviewEngine.cjs');
const ComplianceStandardMapper = require('./compliance/ComplianceStandardMapper.cjs');
const ExternalAttestationVerifier = require('./trust/ExternalAttestationVerifier.cjs');
const FederatedBundleExporter = require('./certification/FederatedBundleExporter.cjs');
const TrustDecompositionEngine = require('./trust/TrustDecompositionEngine.cjs');
const CapabilityVsEvidenceEngine = require('./certification/CapabilityVsEvidenceEngine.cjs');
const EvidenceConfidenceEngine = require('./trust/EvidenceConfidenceEngine.cjs');
const ObservationTypeClassifier = require('./trust/ObservationTypeClassifier.cjs');
const LspDapAnalyzer = require('./analyzers/LspDapAnalyzer.cjs');
const ProductionTelemetryCollector = require('./telemetry/ProductionTelemetryCollector.cjs');

// Tiered Evidence & Tier-1 Release Standard Modules
const EvidenceTierClassifier = require('./certification/EvidenceTierClassifier.cjs');
const UniversalIdeRegistry = require('./analyzers/UniversalIdeRegistry.cjs');
const ApiProtocolsAnalyzer = require('./analyzers/ApiProtocolsAnalyzer.cjs');
const PackageManagerAnalyzer = require('./analyzers/PackageManagerAnalyzer.cjs');
const ScmEcosystemAnalyzer = require('./analyzers/ScmEcosystemAnalyzer.cjs');
const CiCdEcosystemAnalyzer = require('./analyzers/CiCdEcosystemAnalyzer.cjs');
const ContainerOrchestrationAnalyzer = require('./analyzers/ContainerOrchestrationAnalyzer.cjs');
const OsCompatibilityAnalyzer = require('./analyzers/OsCompatibilityAnalyzer.cjs');
const DatabaseCompatibilityAnalyzer = require('./analyzers/DatabaseCompatibilityAnalyzer.cjs');
const CloudEcosystemAnalyzer = require('./analyzers/CloudEcosystemAnalyzer.cjs');
const CheckpointEvidenceManifest = require('./certification/CheckpointEvidenceManifest.cjs');
const GaPassportV2Compiler = require('./certification/GaPassportV2Compiler.cjs');
const SupplyChainAuditor = require('./analyzers/SupplyChainAuditor.cjs');
const ConfigDriftAuditor = require('./analyzers/ConfigDriftAuditor.cjs');
const DbMigrationCertifier = require('./analyzers/DbMigrationCertifier.cjs');
const UpgradeCompatibilityCertifier = require('./analyzers/UpgradeCompatibilityCertifier.cjs');
const RuntimeChaosCertifier = require('./analyzers/RuntimeChaosCertifier.cjs');
const SecurityHardeningCertifier = require('./analyzers/SecurityHardeningCertifier.cjs');
const ObservabilityCertifier = require('./analyzers/ObservabilityCertifier.cjs');
const DisasterRecoveryCertifier = require('./analyzers/DisasterRecoveryCertifier.cjs');
const CommercialReadinessCertifier = require('./analyzers/CommercialReadinessCertifier.cjs');
const ProductionOperationsCertifier = require('./analyzers/ProductionOperationsCertifier.cjs');

// Universal IDE Integration Framework Pillar Modules (v6.1)
const IdeAdapterLayer = require('./ide/IdeAdapterLayer.cjs');
const UniversalIdeMatrix = require('./ide/UniversalIdeMatrix.cjs');
const LspDapBridgeEngine = require('./sdk/LspDapBridgeEngine.cjs');

module.exports = {
    ExecutionGraph,
    AnalyzerRegistry,
    RuleRegistry,
    SecurityAnalyzer,
    FindingModel,
    PolicyEngine,
    EvidenceBundle,
    ProvenanceGraph,
    ExecutionManifest,
    ReplayEngine,
    PrrScorecard,
    PrrEvaluator,
    ArchitectureManager,
    FreezeGovernanceEngine,
    TrustGraphEngine,
    OsapExtensionEngine,
    OutcomeGraphEngine,
    UtcfCoverageEngine,
    MarketplacePluginEngine,
    TrustEventLedger,
    PepStreamTracker,
    PlatformComplianceAuditor,
    MetricClassifier,
    CmmEvaluator,
    TrustDecayEngine,
    TrustDriftDetector,
    AttestationSourceRegistry,
    AiGovernanceTracker,
    ProfileBundleLoader,
    ObservatoryDashboard,
    ImmutabilityEngine,
    ChainOfCustodyTracker,
    MultiSigAttestationEngine,
    TimestampAuthority,
    IncrementalCertificationEngine,
    HumanReviewEngine,
    ComplianceStandardMapper,
    ExternalAttestationVerifier,
    FederatedBundleExporter,
    TrustDecompositionEngine,
    CapabilityVsEvidenceEngine,
    EvidenceConfidenceEngine,
    ObservationTypeClassifier,
    LspDapAnalyzer,
    ProductionTelemetryCollector,
    EvidenceTierClassifier,
    UniversalIdeRegistry,
    ApiProtocolsAnalyzer,
    PackageManagerAnalyzer,
    ScmEcosystemAnalyzer,
    CiCdEcosystemAnalyzer,
    ContainerOrchestrationAnalyzer,
    OsCompatibilityAnalyzer,
    DatabaseCompatibilityAnalyzer,
    CloudEcosystemAnalyzer,
    CheckpointEvidenceManifest,
    GaPassportV2Compiler,
    SupplyChainAuditor,
    ConfigDriftAuditor,
    DbMigrationCertifier,
    UpgradeCompatibilityCertifier,
    RuntimeChaosCertifier,
    SecurityHardeningCertifier,
    ObservabilityCertifier,
    DisasterRecoveryCertifier,
    CommercialReadinessCertifier,
    ProductionOperationsCertifier,
    IdeAdapterLayer,
    UniversalIdeMatrix,
    LspDapBridgeEngine
};
