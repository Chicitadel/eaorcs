/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Unified Public Facade API Architecture
 * File           : EAORCS.js
 * Version        : 2026.3.0-LTS
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

const path = require('path');
const ProjectIntelligenceKernelEngine = require('./kernel/ProjectIntelligenceKernelEngine');
const EAORCSRuntimeEngine = require('./runtime/EAORCSRuntimeEngine');
const EngineeringHealthDashboardEngine = require('./operations/EngineeringHealthDashboardEngine');
const CommandCenterServerEngine = require('./operations/CommandCenterServerEngine');
const PlatformConstitutionEngine = require('./governance/PlatformConstitutionEngine');
const EcosystemValidationProgramEngine = require('./validation/EcosystemValidationProgramEngine');
const PerformanceBenchmarkEngine = require('./operations/PerformanceBenchmarkEngine');
const InvocationAdaptersEngine = require('./adapters/InvocationAdaptersEngine');
const FeatureParityGovernanceEngine = require('./governance/FeatureParityGovernanceEngine');
const ExecutionPolicyEngine = require('./policy/ExecutionPolicyEngine');
const EngineeringTransactionEngine = require('./execution/EngineeringTransactionEngine');
const ExecutionJournalEngine = require('./execution/ExecutionJournalEngine');
const AdaptiveRenderingEngine = require('./renderers/AdaptiveRenderingEngine');
const CrossSurfaceSessionEngine = require('./execution/CrossSurfaceSessionEngine');
const CapabilityNegotiationEngine = require('./adapters/CapabilityNegotiationEngine');
const SurfaceTelemetryEngine = require('./telemetry/SurfaceTelemetryEngine');

const SessionBranchingEngine = require('./execution/SessionBranchingEngine');
const InteractionReplayEngine = require('./telemetry/InteractionReplayEngine');
const StablePlatformContractsRegistryEngine = require('./contract/StablePlatformContractsRegistryEngine');

const ArchitectureFreezePolicyEngine = require('./governance/ArchitectureFreezePolicyEngine');
const EngineeringIntentEngine = require('./execution/EngineeringIntentEngine');
const EvidenceChainEngine = require('./telemetry/EvidenceChainEngine');
const DeterminismCertificationEngine = require('./validation/DeterminismCertificationEngine');

const ArchitectureDecisionRecordEngine = require('./governance/ArchitectureDecisionRecordEngine');
const FreezeGovernanceBoardEngine = require('./governance/FreezeGovernanceBoardEngine');
const OperationalKpiScorecardEngine = require('./operations/OperationalKpiScorecardEngine');

const GovernanceArtifactHierarchyEngine = require('./governance/GovernanceArtifactHierarchyEngine');
const ReleaseReadinessFrameworkEngine = require('./governance/ReleaseReadinessFrameworkEngine');

const WorkspaceResolverEngine = require('./runtime/WorkspaceResolverEngine');
const GovernanceProfileEngine = require('./governance/GovernanceProfileEngine');
const ImmutableReleaseEvidenceEngine = require('./telemetry/ImmutableReleaseEvidenceEngine');
const MultiPlatformValidationEngine = require('./validation/MultiPlatformValidationEngine');

const ReportHistoryEngine = require('./governance/ReportHistoryEngine');
const WorkspaceMaintenanceEngine = require('./operations/WorkspaceMaintenanceEngine');
const HomeServerEngine = require('./portal/HomeServerEngine');
const BrowserTerminalServerEngine = require('./portal/BrowserTerminalServerEngine');


/**
 * EAORCS Unified Public Facade API
 * 
 * Exposes a small, stable, decoupled API for external consumers, IDE extensions, CI pipelines, and plugins.
 * Encapsulates internal engine complexity behind unified facade methods.
 */
class EAORCS {
    static attach(targetDir, options = {}) {
        const runtime = new EAORCSRuntimeEngine({ ...options, projectRoot: targetDir });
        return runtime.attachRepository(targetDir);
    }

    static analyze(targetDir, options = {}) {
        const kernel = new ProjectIntelligenceKernelEngine(options);
        const state = kernel.executeLifecycle(targetDir);
        return {
            projectId: state.canonicalBlueprint.id,
            projectName: state.canonicalBlueprint.name,
            overallScorePct: state.completionAssessment.overallScorePct,
            confidenceMetrics: state.completionAssessment.confidenceMetrics,
            requirementsCount: state.canonicalBlueprint.functionalRequirements.length
        };
    }

    static plan(targetDir, options = {}) {
        const kernel = new ProjectIntelligenceKernelEngine(options);
        const state = kernel.executeLifecycle(targetDir);
        return state.executionPlan;
    }

    static execute(targetDir, options = {}) {
        const kernel = new ProjectIntelligenceKernelEngine(options);
        return kernel.executeLifecycle(targetDir);
    }

    static audit(targetDir, options = {}) {
        const kernel = new ProjectIntelligenceKernelEngine(options);
        const state = kernel.executeLifecycle(targetDir);
        const dashboardEngine = new EngineeringHealthDashboardEngine(options);
        return dashboardEngine.generateDashboard(state);
    }

    static package(targetDir, options = {}) {
        const kernel = new ProjectIntelligenceKernelEngine(options);
        const state = kernel.executeLifecycle(targetDir);
        return {
            packagingReady: state.domains.deliveryIntelligence.packagingReady,
            packagingScorePct: state.completionAssessment.dimensions.packagingPct
        };
    }

    static release(targetDir, options = {}) {
        const kernel = new ProjectIntelligenceKernelEngine(options);
        const state = kernel.executeLifecycle(targetDir);
        return state.domains.deliveryIntelligence;
    }

    static simulate(targetDir, options = {}) {
        const runtime = new EAORCSRuntimeEngine({ ...options, projectRoot: targetDir, mode: 'Simulation' });
        return runtime.handleEvent({ type: 'SIMULATION_TRIGGER', path: targetDir });
    }

    static health(targetDir, options = {}) {
        return EAORCS.audit(targetDir, options);
    }

    static coach(targetDir, options = {}) {
        const kernel = new ProjectIntelligenceKernelEngine(options);
        const state = kernel.executeLifecycle(targetDir);
        return state.domains.engineeringIntelligence;
    }

    static explain(stage, context = {}, options = {}) {
        const policyEngine = new ExecutionPolicyEngine(options);
        return policyEngine.resolveDecision(stage, context);
    }

    static rollback(options = {}) {
        const txEngine = new EngineeringTransactionEngine(options);
        return txEngine.rollbackTransaction();
    }

    static replay(journalId, options = {}) {
        const journalEngine = new ExecutionJournalEngine(options);
        return journalEngine.replayJournal(journalId);
    }

    static benchmark(options = {}) {
        const benchEngine = new PerformanceBenchmarkEngine(options);
        return benchEngine.runPerformanceCertification();
    }

    static verifyConstitution(targetDir, options = {}) {
        const kernel = new ProjectIntelligenceKernelEngine(options);
        const state = kernel.executeLifecycle(targetDir);
        const constitutionEngine = new PlatformConstitutionEngine(options);
        return constitutionEngine.verifyConstitutionCompliance(state);
    }

    static validateEcosystem(workspaceRoot, options = {}) {
        const valEngine = new EcosystemValidationProgramEngine(options);
        return valEngine.validateEcosystem(workspaceRoot);
    }

    static executeAdapter(capabilityId, adapterType, context = {}, options = {}) {
        const kernel = new ProjectIntelligenceKernelEngine(options);
        const adapterEngine = new InvocationAdaptersEngine(options);
        return adapterEngine.executeAdapter(kernel, adapterType, context);
    }

    static renderNative(unifiedModel, rendererType, options = {}) {
        const renderEngine = new AdaptiveRenderingEngine(options);
        return renderEngine.render(unifiedModel, rendererType);
    }

    static resumeSession(sessionId, newSurface, options = {}) {
        const crossSession = new CrossSurfaceSessionEngine(options);
        return crossSession.resumeSession(sessionId, newSurface);
    }

    static forkSession(parentSessionId, branchName = 'experiment', options = {}) {
        const branchEngine = new SessionBranchingEngine(options);
        return branchEngine.forkSession(parentSessionId, branchName);
    }

    static mergeSession(sourceSessionId, targetSessionId, options = {}) {
        const branchEngine = new SessionBranchingEngine(options);
        return branchEngine.mergeSession(sourceSessionId, targetSessionId);
    }

    static replayInteraction(sequenceId, options = {}) {
        const replayEngine = new InteractionReplayEngine(options);
        return replayEngine.replayInteractionSequence(sequenceId);
    }

    static verifyStableContracts(options = {}) {
        const contractsRegistry = new StablePlatformContractsRegistryEngine(options);
        return contractsRegistry.verifyStableContracts();
    }

    static verifyFreezePolicy(options = {}) {
        const freezeEngine = new ArchitectureFreezePolicyEngine(options);
        return freezeEngine.verifyFreezePolicy();
    }

    static createIntent(title, description = '', targetWorkspace = process.cwd(), options = {}) {
        const intentEngine = new EngineeringIntentEngine(options);
        return intentEngine.createIntent(title, description, targetWorkspace);
    }

    static appendEvidenceBlock(dataPayload, options = {}) {
        const chainEngine = new EvidenceChainEngine(options);
        return chainEngine.appendEvidenceBlock(dataPayload);
    }

    static verifyDeterminism(projectRoot = process.cwd(), level = 3, options = {}) {
        const detEngine = new DeterminismCertificationEngine(options);
        return detEngine.verifyExecutionDeterminism(projectRoot, level);
    }

    static recordADR(adrPayload = {}, options = {}) {
        const adrEngine = new ArchitectureDecisionRecordEngine(options);
        return adrEngine.recordADR(adrPayload);
    }

    static submitFreezeProposal(proposalPayload = {}, options = {}) {
        const boardEngine = new FreezeGovernanceBoardEngine(options);
        return boardEngine.evaluateProposal(proposalPayload);
    }

    static getOperationalKpis(options = {}) {
        const kpiEngine = new OperationalKpiScorecardEngine(options);
        return kpiEngine.generateKpiScorecard();
    }

    static verifyGovernanceHierarchy(options = {}) {
        const hierarchyEngine = new GovernanceArtifactHierarchyEngine(options);
        return hierarchyEngine.verifyGovernanceHierarchy();
    }

    static getReleaseReadiness(options = {}) {
        const releaseEngine = new ReleaseReadinessFrameworkEngine(options);
        return releaseEngine.verifyReleaseReadiness();
    }

    static resolveWorkspace(targetDir = process.cwd(), options = {}) {
        const wsResolver = new WorkspaceResolverEngine(options);
        return wsResolver.resolveWorkspace(targetDir);
    }

    static getGovernanceProfile(profileId = 'PROFILE-ENTERPRISE', options = {}) {
        const profileEngine = new GovernanceProfileEngine(options);
        return profileEngine.resolveProfile(profileId);
    }

    static generateReleaseEvidencePackage(kernelState = {}, releaseManifest = {}, options = {}) {
        const evidEngine = new ImmutableReleaseEvidenceEngine(options);
        return evidEngine.generateEvidencePackage(kernelState, releaseManifest);
    }

    static validateMultiPlatform(options = {}) {
        const mpEngine = new MultiPlatformValidationEngine(options);
        return mpEngine.validatePlatformMatrix();
    }

    static launchCommandCenter(options = {}) {
        const serverEngine = new CommandCenterServerEngine(options);
        return serverEngine.launchCommandCenter(options);
    }

    static getCommandCenterData(options = {}) {
        const workspaceDir = options.workspace || process.cwd();
        const serverEngine = new CommandCenterServerEngine(options);
        return serverEngine.getCommandCenterData(workspaceDir);
    }

    static launchEEOS(options = {}) {
        const serverEngine = new CommandCenterServerEngine(options);
        return serverEngine.launchCommandCenter(options);
    }

    static getEEOSData(options = {}) {
        const workspaceDir = options.workspace || process.cwd();
        const serverEngine = new CommandCenterServerEngine(options);
        const data = serverEngine.getCommandCenterData(workspaceDir);
        if (options.role) {
            data.role = options.role;
        }
        return data;
    }

    static launchHome(options = {}) {
        const homeEngine = new HomeServerEngine(options);
        return homeEngine.launchHome(options);
    }

    static getReportHistory(options = {}) {
        const workspaceRoot = options.workspace || process.cwd();
        const historyEngine = new ReportHistoryEngine({ workspaceRoot });
        return historyEngine.getReportHistory(options);
    }

    static resetWorkspace(options = {}) {
        const workspaceRoot = options.workspace || process.cwd();
        const maintenanceEngine = new WorkspaceMaintenanceEngine({ workspaceRoot });
        return maintenanceEngine.resetWorkspaceState();
    }

    static getCommandRegistry(options = {}) {
        const terminalEngine = new BrowserTerminalServerEngine(options);
        return terminalEngine.getCommandRegistry();
    }

    static buildCliCommand(opts = {}) {
        const terminalEngine = new BrowserTerminalServerEngine(opts);
        return terminalEngine.buildCliCommand(opts);
    }

    static evaluateCliLicense(cmd, tier = 'COMMERCIAL', options = {}) {
        const terminalEngine = new BrowserTerminalServerEngine(options);
        return terminalEngine.evaluateCliLicense(cmd, tier);
    }

    static launchBrowserTerminal(options = {}) {
        const terminalEngine = new BrowserTerminalServerEngine(options);
        return terminalEngine.launchTerminalServer(options);
    }

    static detectEnvironmentCapabilities(options = {}) {
        const DxcCapabilityEngine = require('./dxc/DxcCapabilityEngine');
        const engine = new DxcCapabilityEngine(options);
        return {
            environment: engine.detectEnvironment(options),
            matrix: engine.getReadinessMatrix(options),
            equivalents: engine.getPlatformEquivalents(options)
        };
    }

    static getDocumentationIntelligence(options = {}) {
        const DocumentationIntelligenceEngine = require('./portal/DocumentationIntelligenceEngine');
        const engine = new DocumentationIntelligenceEngine(options);
        if (options.coverage) {
            return engine.getCoverage(options);
        } else if (options.missing) {
            return engine.getMissingDocumentation(options);
        } else if (options.graph) {
            return engine.getKnowledgeGraph(options);
        } else if (options.document) {
            return engine.getDocument(options.document, options);
        } else if (options.generate) {
            return engine.generateDocumentation(options);
        }
        return engine.getOverview(options);
    }

    static getDualModeSession(options = {}) {
        const DualModeSessionEngine = require('./session/DualModeSessionEngine');
        const engine = new DualModeSessionEngine(options);
        return engine.getSessionStatus(options);
    }

    static authenticateSession(options = {}) {
        const DualModeSessionEngine = require('./session/DualModeSessionEngine');
        const engine = new DualModeSessionEngine(options);
        return engine.authenticateSession(options);
    }
}

module.exports = EAORCS;

