/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Project Intelligence & Engine Registry Entry Point
 * File           : index.js
 * Version        : 2026.3.0-LTS
 * Author         : Ujomor Systems & Enterprise Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-07-31
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
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

const EAORCS = require('./EAORCS');
const ProjectIntelligenceKernelEngine = require('./kernel/ProjectIntelligenceKernelEngine');
const CanonicalProjectBlueprintEngine = require('./blueprint/CanonicalProjectBlueprintEngine');
const ProductCompletionIntelligenceEngine = require('./knowledge/ProductCompletionIntelligenceEngine');
const AutonomousEngineeringPlannerEngine = require('./remediation/AutonomousEngineeringPlannerEngine');
const EngineeringKnowledgeGraphEngine = require('./traceability/EngineeringKnowledgeGraphEngine');
const EngineeringCoachEngine = require('./knowledge/EngineeringCoachEngine');
const SelfGovernanceDogfoodingEngine = require('./governance/SelfGovernanceDogfoodingEngine');

const EAORCSRuntimeEngine = require('./runtime/EAORCSRuntimeEngine');
const ExecutionPolicyEngine = require('./policy/ExecutionPolicyEngine');
const ConsentManagerEngine = require('./policy/ConsentManagerEngine');
const ExecutionProfileRegistryEngine = require('./policy/ExecutionProfileRegistryEngine');
const EngineeringTransactionEngine = require('./execution/EngineeringTransactionEngine');
const ExecutionJournalEngine = require('./execution/ExecutionJournalEngine');

const CapabilityRegistryEngine = require('./registry/CapabilityRegistryEngine');
const DependencyExecutionPlannerEngine = require('./execution/DependencyExecutionPlannerEngine');
const WorkspaceDigitalTwinEngine = require('./twin/WorkspaceDigitalTwinEngine');
const PredictiveIntelligenceEngine = require('./predictive/PredictiveIntelligenceEngine');
const ExecutableGovernanceContractEngine = require('./contract/ExecutableGovernanceContractEngine');
const FederatedWorkspaceCoordinatorEngine = require('./federation/FederatedWorkspaceCoordinatorEngine');

const StandardizedCapabilityContractEngine = require('./registry/StandardizedCapabilityContractEngine');
const EngineeringHealthDashboardEngine = require('./operations/EngineeringHealthDashboardEngine');
const GovernanceStandardsRegistryEngine = require('./governance/GovernanceStandardsRegistryEngine');

const PlatformConstitutionEngine = require('./governance/PlatformConstitutionEngine');
const EcosystemValidationProgramEngine = require('./validation/EcosystemValidationProgramEngine');
const QualityMetricsTelemetryEngine = require('./telemetry/QualityMetricsTelemetryEngine');
const RecommendationAcceptanceEngine = require('./telemetry/RecommendationAcceptanceEngine');
const PerformanceBenchmarkEngine = require('./operations/PerformanceBenchmarkEngine');
const CompatibilityMatrixEngine = require('./validation/CompatibilityMatrixEngine');
const EcosystemAssetGovernanceEngine = require('./governance/EcosystemAssetGovernanceEngine');
const ContinuousQualificationEngine = require('./validation/ContinuousQualificationEngine');

const InvocationAdaptersEngine = require('./adapters/InvocationAdaptersEngine');
const UnifiedResponseModelEngine = require('./adapters/UnifiedResponseModelEngine');
const FeatureParityGovernanceEngine = require('./governance/FeatureParityGovernanceEngine');
const DocumentationParityEngine = require('./docs/DocumentationParityEngine');

const SurfaceExperienceRegistryEngine = require('./adapters/SurfaceExperienceRegistryEngine');
const AdaptiveRenderingEngine = require('./renderers/AdaptiveRenderingEngine');
const AccessibilityParityEngine = require('./accessibility/AccessibilityParityEngine');
const PlatformCertificationMatrixEngine = require('./governance/PlatformCertificationMatrixEngine');

const InteractionContractEngine = require('./adapters/InteractionContractEngine');
const CapabilityNegotiationEngine = require('./adapters/CapabilityNegotiationEngine');
const ProgressiveDisclosureEngine = require('./renderers/ProgressiveDisclosureEngine');
const SurfaceWorkflowProfileEngine = require('./adapters/SurfaceWorkflowProfileEngine');
const OfflineContractEngine = require('./runtime/OfflineContractEngine');
const CrossSurfaceSessionEngine = require('./execution/CrossSurfaceSessionEngine');
const SurfaceTelemetryEngine = require('./telemetry/SurfaceTelemetryEngine');
const RendererRegistryEngine = require('./renderers/RendererRegistryEngine');
const FlutterSurfaceAdapter = require('./adapters/FlutterSurfaceAdapter');

const EngineeringSessionDomainEngine = require('./execution/EngineeringSessionDomainEngine');
const SessionBranchingEngine = require('./execution/SessionBranchingEngine');
const MultiUserSessionCoordinatorEngine = require('./execution/MultiUserSessionCoordinatorEngine');
const ViewModelAdapterEngine = require('./renderers/ViewModelAdapterEngine');
const InteractionNegotiationEngine = require('./adapters/InteractionNegotiationEngine');
const InteractionReplayEngine = require('./telemetry/InteractionReplayEngine');
const SurfaceLifecycleEngine = require('./adapters/SurfaceLifecycleEngine');
const StablePlatformContractsRegistryEngine = require('./contract/StablePlatformContractsRegistryEngine');

const ArchitectureFreezePolicyEngine = require('./governance/ArchitectureFreezePolicyEngine');
const EngineeringIntentEngine = require('./execution/EngineeringIntentEngine');
const EvidenceChainEngine = require('./telemetry/EvidenceChainEngine');
const ContractHierarchyEngine = require('./contract/ContractHierarchyEngine');
const DeterminismCertificationEngine = require('./validation/DeterminismCertificationEngine');
const ExecutionNodeEngine = require('./execution/ExecutionNodeEngine');
const PluginTrustModelEngine = require('./governance/PluginTrustModelEngine');

const ArchitectureDecisionRecordEngine = require('./governance/ArchitectureDecisionRecordEngine');
const FreezeGovernanceBoardEngine = require('./governance/FreezeGovernanceBoardEngine');
const OperationalKpiScorecardEngine = require('./operations/OperationalKpiScorecardEngine');

const GovernanceArtifactHierarchyEngine = require('./governance/GovernanceArtifactHierarchyEngine');
const ReleaseReadinessFrameworkEngine = require('./governance/ReleaseReadinessFrameworkEngine');

const WorkspaceResolverEngine = require('./runtime/WorkspaceResolverEngine');
const GovernanceProfileEngine = require('./governance/GovernanceProfileEngine');
const ImmutableReleaseEvidenceEngine = require('./telemetry/ImmutableReleaseEvidenceEngine');
const MultiPlatformValidationEngine = require('./validation/MultiPlatformValidationEngine');

const engineCjsExports = require('./index.cjs');

module.exports = {
    EAORCS,
    ...engineCjsExports,
    ProjectIntelligenceKernelEngine,
    CanonicalProjectBlueprintEngine,
    ProductCompletionIntelligenceEngine,
    AutonomousEngineeringPlannerEngine,
    EngineeringKnowledgeGraphEngine,
    EngineeringCoachEngine,
    SelfGovernanceDogfoodingEngine,
    EAORCSRuntimeEngine,
    ExecutionPolicyEngine,
    ConsentManagerEngine,
    ExecutionProfileRegistryEngine,
    EngineeringTransactionEngine,
    ExecutionJournalEngine,
    CapabilityRegistryEngine,
    DependencyExecutionPlannerEngine,
    WorkspaceDigitalTwinEngine,
    PredictiveIntelligenceEngine,
    ExecutableGovernanceContractEngine,
    FederatedWorkspaceCoordinatorEngine,
    StandardizedCapabilityContractEngine,
    EngineeringHealthDashboardEngine,
    GovernanceStandardsRegistryEngine,
    PlatformConstitutionEngine,
    EcosystemValidationProgramEngine,
    QualityMetricsTelemetryEngine,
    RecommendationAcceptanceEngine,
    PerformanceBenchmarkEngine,
    CompatibilityMatrixEngine,
    EcosystemAssetGovernanceEngine,
    ContinuousQualificationEngine,
    InvocationAdaptersEngine,
    UnifiedResponseModelEngine,
    FeatureParityGovernanceEngine,
    DocumentationParityEngine,
    SurfaceExperienceRegistryEngine,
    AdaptiveRenderingEngine,
    AccessibilityParityEngine,
    PlatformCertificationMatrixEngine,
    InteractionContractEngine,
    CapabilityNegotiationEngine,
    ProgressiveDisclosureEngine,
    SurfaceWorkflowProfileEngine,
    OfflineContractEngine,
    CrossSurfaceSessionEngine,
    SurfaceTelemetryEngine,
    RendererRegistryEngine,
    FlutterSurfaceAdapter,
    EngineeringSessionDomainEngine,
    SessionBranchingEngine,
    MultiUserSessionCoordinatorEngine,
    ViewModelAdapterEngine,
    InteractionNegotiationEngine,
    InteractionReplayEngine,
    SurfaceLifecycleEngine,
    StablePlatformContractsRegistryEngine,
    ArchitectureFreezePolicyEngine,
    EngineeringIntentEngine,
    EvidenceChainEngine,
    ContractHierarchyEngine,
    DeterminismCertificationEngine,
    ExecutionNodeEngine,
    PluginTrustModelEngine,
    ArchitectureDecisionRecordEngine,
    FreezeGovernanceBoardEngine,
    OperationalKpiScorecardEngine,
    GovernanceArtifactHierarchyEngine,
    ReleaseReadinessFrameworkEngine,
    WorkspaceResolverEngine,
    GovernanceProfileEngine,
    ImmutableReleaseEvidenceEngine,
    MultiPlatformValidationEngine
};
