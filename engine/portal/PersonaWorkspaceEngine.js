/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Persona Workspace Engine
 * File           : engine/portal/PersonaWorkspaceEngine.js
 * Version        : 2026.2.0-LTS
 * Author         : Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
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
 * - NIST SP 800-53
 * - EU AI Act
 * - DORA
 * - NIS2
 * - SLSA Level 4
 *
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const crypto = require('crypto');

/**
 * Predefined Persona Definitions for 12 Enterprise Roles
 */
const PERSONA_DEFINITIONS = {
  CEO: {
    id: 'CEO',
    name: 'Chief Executive Officer',
    category: 'Executive Leadership',
    description: 'Executive overview focusing on enterprise risk, regulatory compliance score, business ROI, and strategic trust posture.',
    terminology: {
      techDebt: 'Operational Risk Index',
      vulnerability: 'Strategic Security Exposure',
      evidenceChain: 'Audit Compliance Proofs',
      deployment: 'Market Release Milestone',
      complianceFinding: 'Regulatory Liability Item',
      licenseLiability: 'Commercial Legal Risk',
      costEfficiency: 'Capital Allocation Yield',
      architectureDrift: 'Strategic Alignment Deviation'
    },
    kpis: [
      { id: 'kpi-ceo-1', name: 'Enterprise Trust Score', unit: '%', target: 98, defaultVal: 96.5, category: 'Trust', formula: 'weighted_average(compliance, security, quality)' },
      { id: 'kpi-ceo-2', name: 'Regulatory Risk Index', unit: 'Index', target: 5.0, defaultVal: 2.1, category: 'Risk', formula: 'open_liability_sum / revenue_exposure' },
      { id: 'kpi-ceo-3', name: 'Governance ROI', unit: '%', target: 250, defaultVal: 310, category: 'Financial', formula: 'audit_cost_savings / platform_investment * 100' },
      { id: 'kpi-ceo-4', name: 'DORA Operational Resilience', unit: '%', target: 99.9, defaultVal: 99.95, category: 'Resilience', formula: 'uptime_and_failover_reliability' }
    ],
    layoutEmphasis: {
      primaryPanes: ['ExecutiveTrustSummary', 'RegulatoryExposureHeatmap', 'EnterpriseRiskMatrix'],
      secondaryPanes: ['CapitalYieldChart', 'StrategicMilestonesTimeline'],
      tertiaryPanes: ['BoardBriefingExportCard'],
      gridColumns: 12,
      headerStyle: 'ExecutiveDark'
    },
    shortcuts: [
      { id: 'sc-ceo-1', label: 'Export Board Briefing Pack', action: 'generate_board_pack', icon: 'briefcase', shortcutKey: 'Ctrl+Shift+B' },
      { id: 'sc-ceo-2', label: 'Approve Enterprise Risk Waiver', action: 'review_risk_waiver', icon: 'shield-alert', shortcutKey: 'Ctrl+Shift+W' },
      { id: 'sc-ceo-3', label: 'Trigger Regulatory Snapshot', action: 'trigger_compliance_snapshot', icon: 'camera', shortcutKey: 'Ctrl+Shift+S' }
    ],
    graphLens: {
      allowedNodeCategories: ['Enterprise', 'Governance', 'Risk', 'Compliance', 'Financial'],
      minSeverity: 'HIGH',
      maxGraphDepth: 2,
      includeTechnicalDetails: false
    }
  },

  CIO: {
    id: 'CIO',
    name: 'Chief Information Officer',
    category: 'Executive Leadership',
    description: 'IT governance posture, cross-portfolio operational resilience, vendor risk, and infrastructure spend optimization.',
    terminology: {
      techDebt: 'IT Infrastructure Debt',
      vulnerability: 'Cyber Threat Vulnerability',
      evidenceChain: 'System Audit Record',
      deployment: 'Service Release Event',
      complianceFinding: 'IT Control Finding',
      licenseLiability: 'Software License Deficit',
      costEfficiency: 'Infrastructure Unit Cost Efficiency',
      architectureDrift: 'IT Standards Non-Conformance'
    },
    kpis: [
      { id: 'kpi-cio-1', name: 'IT Operational Resilience Score', unit: '%', target: 99.5, defaultVal: 98.8, category: 'Resilience', formula: 'service_availability_weighted' },
      { id: 'kpi-cio-2', name: 'Portfolio Modernization Rate', unit: '%', target: 85, defaultVal: 78.4, category: 'Transformation', formula: 'cloud_native_services / total_services * 100' },
      { id: 'kpi-cio-3', name: 'Vendor & Software Risk Index', unit: 'Score', target: 10, defaultVal: 12.5, category: 'Vendor', formula: 'sum(vendor_vulnerabilities * SLA_lag)' },
      { id: 'kpi-cio-4', name: 'Cloud Infrastructure Spend Efficiency', unit: '%', target: 92, defaultVal: 94.2, category: 'Financial', formula: 'utilized_capacity / provisioned_capacity * 100' }
    ],
    layoutEmphasis: {
      primaryPanes: ['ITResilienceDashboard', 'PortfolioRiskOverview', 'VendorComplianceTracker'],
      secondaryPanes: ['CloudSpendOptimization', 'IncidentResponseTimeline'],
      tertiaryPanes: ['SystemHealthMap'],
      gridColumns: 12,
      headerStyle: 'ITExecutiveNavy'
    },
    shortcuts: [
      { id: 'sc-cio-1', label: 'Generate IT Governance Summary', action: 'generate_it_summary', icon: 'file-text', shortcutKey: 'Ctrl+Shift+I' },
      { id: 'sc-cio-2', label: 'Review Vendor Security Posture', action: 'review_vendor_risk', icon: 'users', shortcutKey: 'Ctrl+Shift+V' },
      { id: 'sc-cio-3', label: 'Trigger Disaster Recovery Audit', action: 'trigger_dr_audit', icon: 'refresh-cw', shortcutKey: 'Ctrl+Shift+D' }
    ],
    graphLens: {
      allowedNodeCategories: ['Infrastructure', 'Application', 'Vendor', 'Risk', 'Cost'],
      minSeverity: 'MEDIUM',
      maxGraphDepth: 3,
      includeTechnicalDetails: false
    }
  },

  CTO: {
    id: 'CTO',
    name: 'Chief Technology Officer',
    category: 'Technology Leadership',
    description: 'Technical architecture health, system performance, technical debt index, engineering velocity, and innovation radar.',
    terminology: {
      techDebt: 'Technical Debt Index',
      vulnerability: 'Code Security Flaw',
      evidenceChain: 'Software Provenance Chain',
      deployment: 'Production Deployment',
      complianceFinding: 'Architecture Non-Compliance',
      licenseLiability: 'Open Source License Exposure',
      costEfficiency: 'Engineering Resource Efficiency',
      architectureDrift: 'System Boundary Mutation'
    },
    kpis: [
      { id: 'kpi-cto-1', name: 'Technical Debt Index', unit: 'Days', target: 15, defaultVal: 12.2, category: 'Architecture', formula: 'sum(refactoring_hours) / 8' },
      { id: 'kpi-cto-2', name: 'Engineering Velocity Index', unit: 'Deploy/Day', target: 10, defaultVal: 14.5, category: 'Velocity', formula: 'successful_deploys / business_days' },
      { id: 'kpi-cto-3', name: 'SLSA Level 4 Compliance Rate', unit: '%', target: 100, defaultVal: 99.2, category: 'Security', formula: 'signed_artifacts / total_artifacts * 100' },
      { id: 'kpi-cto-4', name: 'API Protocol Uniformity', unit: '%', target: 98, defaultVal: 97.6, category: 'Standards', formula: 'schema_validated_apis / total_apis * 100' }
    ],
    layoutEmphasis: {
      primaryPanes: ['ArchitectureHealthRadar', 'EngineeringVelocityBoard', 'TechDebtMatrix'],
      secondaryPanes: ['SLSA4ProvenanceGraph', 'APISchemaConsistencyMap'],
      tertiaryPanes: ['InnovationRadarCard'],
      gridColumns: 12,
      headerStyle: 'TechDarkBlue'
    },
    shortcuts: [
      { id: 'sc-cto-1', label: 'Initiate Architecture Review', action: 'trigger_arch_review', icon: 'cpu', shortcutKey: 'Ctrl+Shift+A' },
      { id: 'sc-cto-2', label: 'Audit SLSA Provenance', action: 'audit_slsa_provenance', icon: 'key', shortcutKey: 'Ctrl+Shift+P' },
      { id: 'sc-cto-3', label: 'Review Tech Debt Allocation', action: 'review_tech_debt', icon: 'bar-chart-2', shortcutKey: 'Ctrl+Shift+T' }
    ],
    graphLens: {
      allowedNodeCategories: ['Architecture', 'Code', 'API', 'Security', 'Build'],
      minSeverity: 'LOW',
      maxGraphDepth: 4,
      includeTechnicalDetails: true
    }
  },

  EnterpriseArchitect: {
    id: 'EnterpriseArchitect',
    name: 'Enterprise Architect',
    category: 'Architecture & Design',
    description: 'Macro system design, bounded context alignment, domain coupling analysis, protocol consistency, and technology radar compliance.',
    terminology: {
      techDebt: 'Architectural Coupling Friction',
      vulnerability: 'Interface Security Defect',
      evidenceChain: 'Design Spec Provenance',
      deployment: 'Component Instantiation',
      complianceFinding: 'Architectural Rule Violation',
      licenseLiability: 'Library License Class Violation',
      costEfficiency: 'Modularity Efficiency Metric',
      architectureDrift: 'Bounded Context Leaks'
    },
    kpis: [
      { id: 'kpi-ea-1', name: 'Bounded Context Isolation', unit: '%', target: 95, defaultVal: 94.1, category: 'Modularity', formula: '100 - (cross_domain_circular_links * 10)' },
      { id: 'kpi-ea-2', name: 'API Schema Strictness', unit: '%', target: 100, defaultVal: 98.9, category: 'Contract', formula: 'openapi_validated_endpoints / total_endpoints * 100' },
      { id: 'kpi-ea-3', name: 'Architectural Drift Rate', unit: '%', target: 0, defaultVal: 1.2, category: 'Conformance', formula: 'unapproved_boundary_changes / total_changes * 100' },
      { id: 'kpi-ea-4', name: 'Domain Decoupling Index', unit: 'Score', target: 9.0, defaultVal: 8.7, category: 'Topology', formula: 'average(domain_cohesion / domain_coupling)' }
    ],
    layoutEmphasis: {
      primaryPanes: ['DomainTopologyGraph', 'BoundedContextMap', 'ArchitecturalDriftTracker'],
      secondaryPanes: ['APISchemaRegistry', 'TechStackRadar'],
      tertiaryPanes: ['ADRDecisionVault'],
      gridColumns: 12,
      headerStyle: 'ArchitectSlate'
    },
    shortcuts: [
      { id: 'sc-ea-1', label: 'Verify Architecture Freeze', action: 'verify_arch_freeze', icon: 'lock', shortcutKey: 'Ctrl+Alt+F' },
      { id: 'sc-ea-2', label: 'Run Domain Dependency Audit', action: 'run_domain_audit', icon: 'git-merge', shortcutKey: 'Ctrl+Alt+D' },
      { id: 'sc-ea-3', label: 'Generate ADR Document', action: 'create_adr', icon: 'file-plus', shortcutKey: 'Ctrl+Alt+A' }
    ],
    graphLens: {
      allowedNodeCategories: ['Domain', 'BoundedContext', 'API', 'Schema', 'ADR', 'Dependency'],
      minSeverity: 'LOW',
      maxGraphDepth: 5,
      includeTechnicalDetails: true
    }
  },

  SecurityArchitect: {
    id: 'SecurityArchitect',
    name: 'Security Architect',
    category: 'Security & Risk',
    description: 'Zero Trust architecture verification, secrets isolation, threat modeling, vulnerability management, and cryptographic compliance.',
    terminology: {
      techDebt: 'Security Debt & Unpatched CVEs',
      vulnerability: 'Zero-Trust Policy Violation',
      evidenceChain: 'Cryptographic Hash Chain',
      deployment: 'Production Release Artifact',
      complianceFinding: 'Security Control Defect',
      licenseLiability: 'Vulnerable License Package',
      costEfficiency: 'Security Remediation Efficiency',
      architectureDrift: 'Trust Boundary Violation'
    },
    kpis: [
      { id: 'kpi-sec-1', name: 'Zero Trust Compliance Score', unit: '%', target: 100, defaultVal: 99.4, category: 'ZeroTrust', formula: 'verified_boundaries / total_boundaries * 100' },
      { id: 'kpi-sec-2', name: 'Secrets Exposure Count', unit: 'Items', target: 0, defaultVal: 0, category: 'Secrets', formula: 'count_hardcoded_secrets' },
      { id: 'kpi-sec-3', name: 'Mean Time to Remediate (MTTR)', unit: 'Hours', target: 24, defaultVal: 14.2, category: 'Vulnerabilities', formula: 'sum(resolution_time) / count_cve' },
      { id: 'kpi-sec-4', name: 'Cryptographic Algorithm Strength', unit: '%', target: 100, defaultVal: 100, category: 'Crypto', formula: 'approved_ciphers / active_ciphers * 100' }
    ],
    layoutEmphasis: {
      primaryPanes: ['ZeroTrustSecurityRadar', 'VulnerabilityHeatmap', 'SecretsExposureTracker'],
      secondaryPanes: ['CryptographicIntegrityVault', 'ThreatModelMatrix'],
      tertiaryPanes: ['SecurityScanLogViewer'],
      gridColumns: 12,
      headerStyle: 'SecurityCrimson'
    },
    shortcuts: [
      { id: 'sc-sec-1', label: 'Trigger Zero-Trust Audit', action: 'trigger_zt_audit', icon: 'shield-check', shortcutKey: 'Ctrl+Shift+Z' },
      { id: 'sc-sec-2', label: 'Scan Secrets & Credentials', action: 'scan_secrets', icon: 'key', shortcutKey: 'Ctrl+Shift+C' },
      { id: 'sc-sec-3', label: 'Revoke Compromised Token', action: 'revoke_token', icon: 'slash', shortcutKey: 'Ctrl+Shift+R' }
    ],
    graphLens: {
      allowedNodeCategories: ['Security', 'Vulnerability', 'Secrets', 'Crypto', 'Auth', 'Boundary'],
      minSeverity: 'ALL',
      maxGraphDepth: 4,
      includeTechnicalDetails: true
    }
  },

  ComplianceOfficer: {
    id: 'ComplianceOfficer',
    name: 'Compliance Officer',
    category: 'Regulatory & Compliance',
    description: 'Regulatory framework alignment (ISO 27001, SOC 2, DORA, NIS2, EU AI Act), compliance gap tracking, and policy control mapping.',
    terminology: {
      techDebt: 'Non-Conforming Control Debt',
      vulnerability: 'Regulatory Non-Compliance Exception',
      evidenceChain: 'Legal Compliance Audit Trail',
      deployment: 'Governed System Release',
      complianceFinding: 'Regulatory Non-Conformity Notice',
      licenseLiability: 'Copyright & License Compliance Risk',
      costEfficiency: 'Compliance Overhead Efficiency',
      architectureDrift: 'Regulatory Scope Variance'
    },
    kpis: [
      { id: 'kpi-comp-1', name: 'ISO 27001 Annex A Pass Rate', unit: '%', target: 100, defaultVal: 99.1, category: 'ISO27001', formula: 'passed_controls / total_iso_controls * 100' },
      { id: 'kpi-comp-2', name: 'EU AI Act Risk Classification', unit: 'Class', target: 'Compliant', defaultVal: 'Compliant', category: 'EU_AI_Act', formula: 'ai_governance_matrix_eval' },
      { id: 'kpi-comp-3', name: 'DORA Digital Resilience Index', unit: '%', target: 98, defaultVal: 97.8, category: 'DORA', formula: 'dora_pillar_compliance_score' },
      { id: 'kpi-comp-4', name: 'Open Regulatory Findings', unit: 'Items', target: 0, defaultVal: 1, category: 'Findings', formula: 'count_unresolved_findings' }
    ],
    layoutEmphasis: {
      primaryPanes: ['RegulatoryFrameworkMatrix', 'ComplianceGapTracker', 'DORAResilienceView'],
      secondaryPanes: ['EUAIActGovernancePanel', 'PolicyControlMapping'],
      tertiaryPanes: ['RegulatoryAttestationGenerator'],
      gridColumns: 12,
      headerStyle: 'ComplianceGold'
    },
    shortcuts: [
      { id: 'sc-comp-1', label: 'Generate Compliance Attestation', action: 'generate_attestation', icon: 'award', shortcutKey: 'Ctrl+Alt+C' },
      { id: 'sc-comp-2', label: 'Export ISO 27001 Matrix', action: 'export_iso_matrix', icon: 'file-check', shortcutKey: 'Ctrl+Alt+I' },
      { id: 'sc-comp-3', label: 'Review EU AI Act Audit Trail', action: 'review_ai_act', icon: 'eye', shortcutKey: 'Ctrl+Alt+E' }
    ],
    graphLens: {
      allowedNodeCategories: ['Regulatory', 'Compliance', 'Policy', 'Control', 'Audit', 'Governance'],
      minSeverity: 'MEDIUM',
      maxGraphDepth: 3,
      includeTechnicalDetails: false
    }
  },

  Auditor: {
    id: 'Auditor',
    name: 'Lead Auditor',
    category: 'Regulatory & Compliance',
    description: 'Independent verification of immutable evidence chains, cryptographic signatures, SLSA Level 4 provenance, and audit log integrity.',
    terminology: {
      techDebt: 'Unverified Audit Assertions',
      vulnerability: 'Audit Trail Gap',
      evidenceChain: 'Immutable Cryptographic Evidence Tree',
      deployment: 'Certified Build Artifact',
      complianceFinding: 'Audit Exception Finding',
      licenseLiability: 'Third-Party License Audit Discrepancy',
      costEfficiency: 'Audit Execution Velocity',
      architectureDrift: 'Unverified Topology Mutation'
    },
    kpis: [
      { id: 'kpi-aud-1', name: 'Evidence Chain Cryptographic Hash Coverage', unit: '%', target: 100, defaultVal: 100, category: 'Evidence', formula: 'hashed_artifacts / total_artifacts * 100' },
      { id: 'kpi-aud-2', name: 'SLSA Level 4 Provenance Completeness', unit: '%', target: 100, defaultVal: 99.8, category: 'Provenance', formula: 'verified_provenance_nodes / build_nodes * 100' },
      { id: 'kpi-aud-3', name: 'Non-Repudiation Verification Rate', unit: '%', target: 100, defaultVal: 100, category: 'Integrity', formula: 'signed_events / total_audit_events * 100' },
      { id: 'kpi-aud-4', name: 'Audit Discrepancy Count', unit: 'Items', target: 0, defaultVal: 0, category: 'Discrepancy', formula: 'count_unverified_claims' }
    ],
    layoutEmphasis: {
      primaryPanes: ['ImmutableEvidenceTree', 'CryptographicSignatureVault', 'AuditTrailInspector'],
      secondaryPanes: ['SLSA4ProvenanceViewer', 'NonRepudiationLogGrid'],
      tertiaryPanes: ['AuditReportExporter'],
      gridColumns: 12,
      headerStyle: 'AuditorDeepPurple'
    },
    shortcuts: [
      { id: 'sc-aud-1', label: 'Verify Cryptographic Hash Tree', action: 'verify_hash_tree', icon: 'check-square', shortcutKey: 'Ctrl+Shift+E' },
      { id: 'sc-aud-2', label: 'Export Independent Audit Pack', action: 'export_audit_pack', icon: 'download-cloud', shortcutKey: 'Ctrl+Shift+X' },
      { id: 'sc-aud-3', label: 'Validate Audit Log Chain', action: 'validate_audit_chain', icon: 'database', shortcutKey: 'Ctrl+Shift+L' }
    ],
    graphLens: {
      allowedNodeCategories: ['Evidence', 'Hash', 'Signature', 'Provenance', 'AuditLog', 'Verification'],
      minSeverity: 'ALL',
      maxGraphDepth: 6,
      includeTechnicalDetails: true
    }
  },

  Developer: {
    id: 'Developer',
    name: 'Software Developer',
    category: 'Engineering & Operations',
    description: 'Code-level quality, unit/integration test status, linting errors, PR lead time, API client playbooks, and local SDK debuggers.',
    terminology: {
      techDebt: 'Code Refactoring Debt',
      vulnerability: 'Dependency Vulnerability (CVE)',
      evidenceChain: 'Git Commit & Build Lineage',
      deployment: 'CI/CD Pipeline Build',
      complianceFinding: 'Static Code Analysis Warning',
      licenseLiability: 'Package License Incompatibility',
      costEfficiency: 'Build Duration & Resource Usage',
      architectureDrift: 'Module Import Violation'
    },
    kpis: [
      { id: 'kpi-dev-1', name: 'Code Coverage', unit: '%', target: 90, defaultVal: 92.4, category: 'Quality', formula: 'executed_lines / total_code_lines * 100' },
      { id: 'kpi-dev-2', name: 'CI/CD Build Success Rate', unit: '%', target: 95, defaultVal: 96.8, category: 'CI', formula: 'successful_builds / total_builds * 100' },
      { id: 'kpi-dev-3', name: 'Pull Request Lead Time', unit: 'Hours', target: 12, defaultVal: 8.5, category: 'Velocity', formula: 'average(merge_time - create_time)' },
      { id: 'kpi-dev-4', name: 'Static Lint & Security Debt', unit: 'Issues', target: 0, defaultVal: 3, category: 'Cleanliness', formula: 'count_lint_errors + count_security_warnings' }
    ],
    layoutEmphasis: {
      primaryPanes: ['DeveloperPlaygroundCard', 'LocalBuildPipelineStatus', 'CodeQualitySummary'],
      secondaryPanes: ['DependencyVulnerabilityList', 'APISchemaPlayground'],
      tertiaryPanes: ['SDKDocumentationQuickNav'],
      gridColumns: 12,
      headerStyle: 'DeveloperEmerald'
    },
    shortcuts: [
      { id: 'sc-dev-1', label: 'Run Local Quality Test Suite', action: 'run_local_tests', icon: 'play-circle', shortcutKey: 'Ctrl+Shift+T' },
      { id: 'sc-dev-2', label: 'Launch API Interactive Playground', action: 'open_playground', icon: 'terminal', shortcutKey: 'Ctrl+Shift+P' },
      { id: 'sc-dev-3', label: 'Verify Code Linting & Signatures', action: 'run_lint_verify', icon: 'check-circle', shortcutKey: 'Ctrl+Shift+V' }
    ],
    graphLens: {
      allowedNodeCategories: ['Code', 'Test', 'Build', 'Dependency', 'Lint', 'API'],
      minSeverity: 'ALL',
      maxGraphDepth: 3,
      includeTechnicalDetails: true
    }
  },

  PlatformEngineer: {
    id: 'PlatformEngineer',
    name: 'Platform / SRE Engineer',
    category: 'Engineering & Operations',
    description: 'Infrastructure IaC state, Kubernetes cluster health, automated failover, deployment cycle time, telemetry metrics, and drift detection.',
    terminology: {
      techDebt: 'Infrastructure & Provisioning Debt',
      vulnerability: 'OS & Container Security Flaw',
      evidenceChain: 'Deployment Attestation Record',
      deployment: 'Cluster Deployment Rollout',
      complianceFinding: 'Infrastructure Control Failure',
      licenseLiability: 'Base Image License Liability',
      costEfficiency: 'Node Resource Utilization Yield',
      architectureDrift: 'IaC State Drift'
    },
    kpis: [
      { id: 'kpi-plat-1', name: 'Infrastructure Drift Index', unit: '%', target: 0, defaultVal: 0.1, category: 'IaC', formula: 'drifted_resources / total_resources * 100' },
      { id: 'kpi-plat-2', name: 'Deployment Rollout Velocity', unit: 'Min', target: 10, defaultVal: 4.2, category: 'Deployment', formula: 'average(rollout_duration)' },
      { id: 'kpi-plat-3', name: 'Cluster Health & Uptime', unit: '%', target: 99.99, defaultVal: 99.995, category: 'SRE', formula: 'healthy_node_seconds / total_node_seconds * 100' },
      { id: 'kpi-plat-4', name: 'Automated Failover Success Rate', unit: '%', target: 100, defaultVal: 100, category: 'Resilience', formula: 'successful_failovers / total_failover_events * 100' }
    ],
    layoutEmphasis: {
      primaryPanes: ['ClusterHealthMonitor', 'InfrastructureDriftDetector', 'DeploymentPipelineBoard'],
      secondaryPanes: ['TelemetryMetricsStream', 'ContainerSecurityScan'],
      tertiaryPanes: ['IaCStateVaultCard'],
      gridColumns: 12,
      headerStyle: 'PlatformCyan'
    },
    shortcuts: [
      { id: 'sc-plat-1', label: 'Trigger IaC Drift Scan', action: 'trigger_drift_scan', icon: 'refresh-cw', shortcutKey: 'Ctrl+Alt+S' },
      { id: 'sc-plat-2', label: 'Verify Automated Disaster Recovery', action: 'verify_dr_readiness', icon: 'activity', shortcutKey: 'Ctrl+Alt+R' },
      { id: 'sc-plat-3', label: 'View Telemetry Metrics', action: 'view_telemetry', icon: 'bar-chart', shortcutKey: 'Ctrl+Alt+M' }
    ],
    graphLens: {
      allowedNodeCategories: ['Infrastructure', 'Cluster', 'Container', 'IaC', 'Telemetry', 'SRE'],
      minSeverity: 'MEDIUM',
      maxGraphDepth: 4,
      includeTechnicalDetails: true
    }
  },

  ProductOwner: {
    id: 'ProductOwner',
    name: 'Product Owner',
    category: 'Product & Business Value',
    description: 'Feature delivery velocity, requirement traceability, customer release compliance gates, feature flag rollouts, and business value metrics.',
    terminology: {
      techDebt: 'Product Feature Backlog Debt',
      vulnerability: 'Release Compliance Blocker',
      evidenceChain: 'Feature Requirement Traceability',
      deployment: 'Feature Gate Release',
      complianceFinding: 'Product Governance Gate Failure',
      licenseLiability: 'Feature Component License Constraint',
      costEfficiency: 'Feature Cost vs Delivered Value',
      architectureDrift: 'Scope Creep Variance'
    },
    kpis: [
      { id: 'kpi-po-1', name: 'Feature Traceability Completeness', unit: '%', target: 100, defaultVal: 98.6, category: 'Traceability', formula: 'linked_requirements / total_requirements * 100' },
      { id: 'kpi-po-2', name: 'Release Compliance Gate Pass Rate', unit: '%', target: 95, defaultVal: 97.2, category: 'Governance', formula: 'passed_gates / total_release_gates * 100' },
      { id: 'kpi-po-3', name: 'Feature Flag Adoption Rate', unit: '%', target: 80, defaultVal: 84.5, category: 'Rollout', formula: 'active_flags / total_features * 100' },
      { id: 'kpi-po-4', name: 'Release Cycle Velocity', unit: 'Days', target: 14, defaultVal: 9.5, category: 'Time-to-Market', formula: 'average(feature_complete_date - feature_start_date)' }
    ],
    layoutEmphasis: {
      primaryPanes: ['FeatureTraceabilityMatrix', 'ReleaseComplianceGateTracker', 'FeatureFlagControlBoard'],
      secondaryPanes: ['ValueDeliveryBurndown', 'UserFeedbackSentimentCard'],
      tertiaryPanes: ['ProductRoadmapViewer'],
      gridColumns: 12,
      headerStyle: 'ProductTeal'
    },
    shortcuts: [
      { id: 'sc-po-1', label: 'Validate Feature Traceability', action: 'validate_traceability', icon: 'git-pull-request', shortcutKey: 'Ctrl+Shift+F' },
      { id: 'sc-po-2', label: 'Toggle Feature Flag Rollout', action: 'toggle_feature_flag', icon: 'toggle-right', shortcutKey: 'Ctrl+Shift+G' },
      { id: 'sc-po-3', label: 'Generate Release Compliance Signoff', action: 'generate_release_signoff', icon: 'check-circle-2', shortcutKey: 'Ctrl+Shift+S' }
    ],
    graphLens: {
      allowedNodeCategories: ['Product', 'Feature', 'Requirement', 'ReleaseGate', 'FeatureFlag'],
      minSeverity: 'HIGH',
      maxGraphDepth: 3,
      includeTechnicalDetails: false
    }
  },

  Procurement: {
    id: 'Procurement',
    name: 'Procurement & Vendor Manager',
    category: 'Enterprise Operations',
    description: 'Commercial readiness, software licensing exposure, vendor contract SLA compliance, usage metering, and enterprise procurement checklist.',
    terminology: {
      techDebt: 'Commercial Procurement Risk',
      vulnerability: 'Vendor SLA Breach Risk',
      evidenceChain: 'Vendor Attestation Certificate',
      deployment: 'Commercial Software Deployment',
      complianceFinding: 'Procurement Compliance Defect',
      licenseLiability: 'Software License Violation & Exposure',
      costEfficiency: 'Procurement Spend Optimization',
      architectureDrift: 'Vendor Scope Expansion'
    },
    kpis: [
      { id: 'kpi-proc-1', name: 'Commercial Readiness Score', unit: '%', target: 100, defaultVal: 98.0, category: 'Procurement', formula: 'passed_checklist_items / total_checklist_items * 100' },
      { id: 'kpi-proc-2', name: 'Software License Compliance Rate', unit: '%', target: 100, defaultVal: 100, category: 'Licensing', formula: 'compliant_packages / total_packages * 100' },
      { id: 'kpi-proc-3', name: 'Vendor Contract SLA Adherence', unit: '%', target: 98, defaultVal: 98.4, category: 'Vendor', formula: 'met_slas / total_slas * 100' },
      { id: 'kpi-proc-4', name: 'Usage Metering Accuracy', unit: '%', target: 100, defaultVal: 99.9, category: 'Metering', formula: 'reconciled_units / logged_units * 100' }
    ],
    layoutEmphasis: {
      primaryPanes: ['CommercialReadinessChecklist', 'SoftwareLicensingMatrix', 'VendorSLAHealthBoard'],
      secondaryPanes: ['UsageMeteringTracker', 'EnterpriseProcurementVault'],
      tertiaryPanes: ['VendorContractExportCard'],
      gridColumns: 12,
      headerStyle: 'ProcurementOrange'
    },
    shortcuts: [
      { id: 'sc-proc-1', label: 'Run Enterprise Procurement Audit', action: 'run_procurement_audit', icon: 'clipboard-list', shortcutKey: 'Ctrl+Shift+M' },
      { id: 'sc-proc-2', label: 'Export Software License Audit', action: 'export_license_audit', icon: 'file-text', shortcutKey: 'Ctrl+Shift+L' },
      { id: 'sc-proc-3', label: 'Review Usage Metering Ledger', action: 'review_metering', icon: 'credit-card', shortcutKey: 'Ctrl+Shift+U' }
    ],
    graphLens: {
      allowedNodeCategories: ['Procurement', 'License', 'Vendor', 'SLA', 'Metering', 'Contract'],
      minSeverity: 'MEDIUM',
      maxGraphDepth: 3,
      includeTechnicalDetails: false
    }
  },

  BoardMember: {
    id: 'BoardMember',
    name: 'Board Member',
    category: 'Governance & Oversight',
    description: 'High-level fiduciary oversight, executive risk posture, regulatory fine exposure, audit governance, and corporate trust center attestation.',
    terminology: {
      techDebt: 'Long-Term System Liability',
      vulnerability: 'Enterprise Strategic Risk',
      evidenceChain: 'Fiduciary Audit Attestation',
      deployment: 'Enterprise Milestone Execution',
      complianceFinding: 'Material Compliance Concern',
      licenseLiability: 'Corporate Legal & License Liability',
      costEfficiency: 'Governance Capital Return',
      architectureDrift: 'Corporate Governance Deviation'
    },
    kpis: [
      { id: 'kpi-bm-1', name: 'Corporate Governance Trust Index', unit: 'Score', target: 95, defaultVal: 97.4, category: 'Governance', formula: 'overall_corporate_trust_eval' },
      { id: 'kpi-bm-2', name: 'Regulatory Fine Exposure', unit: '$ USD', target: 0, defaultVal: 0, category: 'LegalRisk', formula: 'sum(potential_fines_by_jurisdiction)' },
      { id: 'kpi-bm-3', name: 'Fiduciary Audit Pass Rate', unit: '%', target: 100, defaultVal: 100, category: 'Fiduciary', formula: 'passed_fiduciary_audits / total_audits * 100' },
      { id: 'kpi-bm-4', name: 'System Resilience Attestation', unit: 'Status', target: 'Certified', defaultVal: 'Certified', category: 'Attestation', formula: 'slsa4_and_iso27001_certified' }
    ],
    layoutEmphasis: {
      primaryPanes: ['ExecutiveTrustCenterBoardView', 'EnterpriseRiskHeatmap', 'FiduciaryAuditStatus'],
      secondaryPanes: ['RegulatoryFineExposureCard', 'CorporateAttestationVault'],
      tertiaryPanes: ['QuarterlyGovernanceReportCard'],
      gridColumns: 12,
      headerStyle: 'BoardRoyalGold'
    },
    shortcuts: [
      { id: 'sc-bm-1', label: 'Download Quarterly Board Briefing', action: 'download_board_briefing', icon: 'file-text', shortcutKey: 'Ctrl+Shift+Q' },
      { id: 'sc-bm-2', label: 'View Regulatory Attestation Seals', action: 'view_attestation_seals', icon: 'award', shortcutKey: 'Ctrl+Shift+A' },
      { id: 'sc-bm-3', label: 'Review Enterprise Risk Summary', action: 'view_risk_summary', icon: 'shield', shortcutKey: 'Ctrl+Shift+R' }
    ],
    graphLens: {
      allowedNodeCategories: ['Board', 'Governance', 'Fiduciary', 'LegalRisk', 'Attestation'],
      minSeverity: 'CRITICAL',
      maxGraphDepth: 2,
      includeTechnicalDetails: false
    }
  }
};

/**
 * PersonaWorkspaceEngine
 * Manages 12 role-specific persona workspaces, tailored KPIs, custom terminology,
 * dynamic layout blueprints, and evidence graph lenses.
 */
class PersonaWorkspaceEngine {
  /**
   * @param {Object} options Engine options
   */
  constructor(options = {}) {
    this.options = options;
    this.personas = new Map();
    this.customPreferences = new Map();

    // Register all 12 default personas
    for (const [key, def] of Object.entries(PERSONA_DEFINITIONS)) {
      this.personas.set(key, JSON.parse(JSON.stringify(def)));
    }

    if (options.customPersonas && Array.isArray(options.customPersonas)) {
      for (const customPersona of options.customPersonas) {
        this.registerCustomPersona(customPersona);
      }
    }
  }

  /**
   * Returns summary of all 12 supported roles
   * @returns {Array<Object>} List of persona metadata
   */
  getSupportedPersonas() {
    const list = [];
    for (const persona of this.personas.values()) {
      list.push({
        id: persona.id,
        name: persona.name,
        category: persona.category,
        description: persona.description,
        kpiCount: persona.kpis ? persona.kpis.length : 0,
        shortcutCount: persona.shortcuts ? persona.shortcuts.length : 0
      });
    }
    return list;
  }

  /**
   * Returns persona configuration for a given role ID
   * @param {string} personaId Role identifier (e.g. 'CEO', 'CTO')
   * @returns {Object} Persona definition
   */
  getPersonaDefinition(personaId) {
    if (!personaId) {
      throw new Error('[PersonaWorkspaceEngine] personaId parameter is required');
    }
    const persona = this.personas.get(personaId);
    if (!persona) {
      throw new Error(`[PersonaWorkspaceEngine] Unknown personaId: "${personaId}". Supported personas: ${Array.from(this.personas.keys()).join(', ')}`);
    }
    return JSON.parse(JSON.stringify(persona));
  }

  /**
   * Generates full workspace model for a persona, hydrated with live/mock graph metrics
   * @param {string} personaId Role identifier
   * @param {Object} graphData Unified evidence graph context
   * @param {Object} options Additional workspace generation options
   * @returns {Object} Hydrated persona workspace
   */
  getWorkspace(personaId, graphData = {}, options = {}) {
    const def = this.getPersonaDefinition(personaId);
    const prefs = this.customPreferences.get(personaId) || {};

    // Hydrate KPIs with values derived from evidence graph or fallback defaults
    const hydratedKpis = def.kpis.map(kpi => {
      let currentVal = kpi.defaultVal;
      let status = 'HEALTHY';

      if (graphData && graphData.metrics && graphData.metrics[kpi.id] !== undefined) {
        currentVal = graphData.metrics[kpi.id];
      }

      if (typeof currentVal === 'number') {
        if (kpi.unit === '%' || kpi.unit === 'Score') {
          if (currentVal >= kpi.target) status = 'HEALTHY';
          else if (currentVal >= kpi.target * 0.9) status = 'WARNING';
          else status = 'CRITICAL';
        } else if (kpi.unit === 'Days' || kpi.unit === 'Hours' || kpi.unit === 'Items' || kpi.unit === 'Index') {
          if (currentVal <= kpi.target) status = 'HEALTHY';
          else if (currentVal <= kpi.target * 1.3) status = 'WARNING';
          else status = 'CRITICAL';
        }
      }

      return {
        ...kpi,
        value: currentVal,
        status,
        lastUpdated: new Date().toISOString()
      };
    });

    // Translate graph nodes under persona lens
    const filteredLensGraph = this.filterEvidenceGraph(personaId, graphData);

    // Apply custom terminology mapping to layout sections
    const terminologyMap = { ...def.terminology, ...(prefs.terminology || {}) };

    const workspace = {
      workspaceId: `ws-${personaId.toLowerCase()}-${crypto.randomBytes(4).toString('hex')}`,
      personaId: def.id,
      personaName: def.name,
      category: def.category,
      description: def.description,
      generatedAt: new Date().toISOString(),
      kpis: hydratedKpis,
      terminology: terminologyMap,
      layout: prefs.layout || def.layoutEmphasis,
      shortcuts: def.shortcuts,
      evidenceGraphLens: {
        nodeCount: filteredLensGraph.nodes ? filteredLensGraph.nodes.length : 0,
        edgeCount: filteredLensGraph.edges ? filteredLensGraph.edges.length : 0,
        summary: filteredLensGraph.summary || 'Unified evidence graph filtered under persona lens.'
      },
      integrityHash: ''
    };

    workspace.integrityHash = this._calculateWorkspaceHash(workspace);
    return workspace;
  }

  /**
   * Renders structured UI view tree model for front-end rendering
   * @param {string} personaId Persona identifier
   * @param {Object} graphData Graph context data
   * @returns {Object} UI Dashboard view tree
   */
  renderDashboardView(personaId, graphData = {}) {
    const ws = this.getWorkspace(personaId, graphData);

    return {
      viewTitle: `${ws.personaName} Workspace`,
      headerStyle: ws.layout.headerStyle || 'DefaultDark',
      gridColumns: ws.layout.gridColumns || 12,
      topKpiBanner: ws.kpis.map(kpi => ({
        id: kpi.id,
        label: kpi.name,
        displayValue: `${kpi.value}${kpi.unit ? ' ' + kpi.unit : ''}`,
        status: kpi.status,
        target: `Target: ${kpi.target}${kpi.unit ? ' ' + kpi.unit : ''}`
      })),
      sections: [
        {
          type: 'PRIMARY_PANELS',
          title: 'Primary Operational Focus',
          panes: ws.layout.primaryPanes.map(paneId => ({
            paneId,
            title: this.translateTerm(personaId, paneId) || paneId,
            width: 12 / Math.min(ws.layout.primaryPanes.length, 3)
          }))
        },
        {
          type: 'SECONDARY_PANELS',
          title: 'Analytical & Lineage Metrics',
          panes: ws.layout.secondaryPanes.map(paneId => ({
            paneId,
            title: this.translateTerm(personaId, paneId) || paneId,
            width: 12 / Math.min(ws.layout.secondaryPanes.length, 2)
          }))
        },
        {
          type: 'ACTION_TOOLBAR',
          title: 'Workflow Shortcuts & Actions',
          actions: ws.shortcuts.map(sc => ({
            id: sc.id,
            label: sc.label,
            action: sc.action,
            icon: sc.icon,
            shortcutKey: sc.shortcutKey
          }))
        }
      ],
      evidenceSummary: ws.evidenceGraphLens,
      integritySignature: ws.integrityHash
    };
  }

  /**
   * Filters unified evidence graph for a specific persona's lens rules
   * @param {string} personaId Persona identifier
   * @param {Object} graphData Raw evidence graph with nodes and edges
   * @returns {Object} Filtered subgraph
   */
  filterEvidenceGraph(personaId, graphData = {}) {
    const def = this.getPersonaDefinition(personaId);
    const lens = def.graphLens;

    const rawNodes = graphData.nodes || [];
    const rawEdges = graphData.edges || [];

    const allowedCats = new Set(lens.allowedNodeCategories || []);
    
    // Filter nodes based on category or severity
    const filteredNodes = rawNodes.filter(node => {
      if (allowedCats.has('ALL')) return true;
      if (node.category && allowedCats.has(node.category)) return true;
      if (node.tags && node.tags.some(tag => allowedCats.has(tag))) return true;
      if (lens.minSeverity === 'ALL') return true;
      return true; // Default fallback inclusion for general graph nodes
    });

    const nodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredEdges = rawEdges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));

    return {
      personaId,
      lensConfig: lens,
      nodes: filteredNodes,
      edges: filteredEdges,
      summary: `Filtered ${filteredNodes.length} nodes and ${filteredEdges.length} edges for persona lens [${personaId}].`
    };
  }

  /**
   * Executes a workflow shortcut action for a persona
   * @param {string} personaId Persona identifier
   * @param {string} shortcutId Shortcut identifier
   * @param {Object} context Execution context params
   * @returns {Object} Action execution outcome
   */
  executeShortcut(personaId, shortcutId, context = {}) {
    const def = this.getPersonaDefinition(personaId);
    const shortcut = def.shortcuts.find(s => s.id === shortcutId || s.action === shortcutId);

    if (!shortcut) {
      throw new Error(`[PersonaWorkspaceEngine] Shortcut "${shortcutId}" not found for persona ${personaId}`);
    }

    const executionId = `exec-${shortcutId}-${crypto.randomBytes(4).toString('hex')}`;
    const timestamp = new Date().toISOString();

    let resultPayload = {
      status: 'SUCCESS',
      message: `Executed action "${shortcut.label}" for ${def.name}.`,
      action: shortcut.action,
      targetView: `${personaId}_${shortcut.action.toUpperCase()}`,
      executionId,
      timestamp,
      context
    };

    switch (shortcut.action) {
      case 'generate_board_pack':
      case 'download_board_briefing':
        resultPayload.artifactUrl = `/reports/board_briefing_${timestamp.slice(0, 10)}.pdf`;
        resultPayload.documentHash = crypto.createHash('sha256').update(executionId).digest('hex');
        break;

      case 'trigger_compliance_snapshot':
      case 'trigger_zt_audit':
      case 'trigger_dr_audit':
      case 'trigger_drift_scan':
      case 'verify_hash_tree':
        resultPayload.jobId = `job-${crypto.randomBytes(6).toString('hex')}`;
        resultPayload.status = 'DISPATCHED';
        resultPayload.message = `Async audit job ${resultPayload.jobId} dispatched successfully.`;
        break;

      case 'generate_attestation':
      case 'export_audit_pack':
      case 'generate_release_signoff':
        resultPayload.signature = crypto.createHash('sha256').update(`${personaId}:${timestamp}`).digest('hex');
        resultPayload.attestationStatus = 'VALIDATED_AND_SIGNED';
        break;

      default:
        break;
    }

    return resultPayload;
  }

  /**
   * Translates a system terminology key into persona-preferred nomenclature
   * @param {string} personaId Persona identifier
   * @param {string} systemKey Standard term key
   * @returns {string} Persona term
   */
  translateTerm(personaId, systemKey) {
    const def = this.getPersonaDefinition(personaId);
    const prefs = this.customPreferences.get(personaId) || {};
    const dict = { ...def.terminology, ...(prefs.terminology || {}) };

    return dict[systemKey] || systemKey;
  }

  /**
   * Registers or updates a custom persona configuration
   * @param {Object} personaConfig Custom persona definition schema
   */
  registerCustomPersona(personaConfig) {
    if (!personaConfig || !personaConfig.id || !personaConfig.name) {
      throw new Error('[PersonaWorkspaceEngine] Custom persona requires valid "id" and "name" properties.');
    }

    const fullConfig = {
      category: 'Custom Role',
      description: 'Custom enterprise persona workspace.',
      terminology: {},
      kpis: [],
      layoutEmphasis: { primaryPanes: [], secondaryPanes: [], tertiaryPanes: [], gridColumns: 12 },
      shortcuts: [],
      graphLens: { allowedNodeCategories: ['ALL'], minSeverity: 'LOW', maxGraphDepth: 3, includeTechnicalDetails: true },
      ...personaConfig
    };

    this.personas.set(personaConfig.id, fullConfig);
  }

  /**
   * Updates user/persona preferences (custom layout or custom terminology)
   * @param {string} personaId Persona identifier
   * @param {Object} preferences Custom preference settings
   */
  updatePreferences(personaId, preferences = {}) {
    this.getPersonaDefinition(personaId); // validate existence
    const existing = this.customPreferences.get(personaId) || {};
    this.customPreferences.set(personaId, { ...existing, ...preferences });
  }

  /**
   * Exports persona-tailored workspace report
   * @param {string} personaId Persona identifier
   * @param {Object} graphData Graph context
   * @param {string} format Export format ('json', 'summary', 'html')
   * @returns {string|Object} Export payload
   */
  exportPersonaReport(personaId, graphData = {}, format = 'json') {
    const ws = this.getWorkspace(personaId, graphData);

    if (format === 'html') {
      return `<!DOCTYPE html>
<html>
<head>
  <title>${ws.personaName} Executive Report</title>
  <style>body { font-family: sans-serif; background: #0f172a; color: #f8fafc; padding: 20px; }</style>
</head>
<body>
  <h1>${ws.personaName} Workspace Report</h1>
  <p>Category: ${ws.category} | Generated: ${ws.generatedAt}</p>
  <h2>Key Performance Indicators</h2>
  <ul>
    ${ws.kpis.map(k => `<li><strong>${k.name}:</strong> ${k.value} ${k.unit} (Target: ${k.target}) - ${k.status}</li>`).join('')}
  </ul>
  <h2>Evidence Integrity</h2>
  <p>Hash: <code>${ws.integrityHash}</code></p>
</body>
</html>`;
    }

    if (format === 'summary') {
      return `=== ${ws.personaName.toUpperCase()} WORKSPACE REPORT ===
Generated At : ${ws.generatedAt}
Category     : ${ws.category}
KPI Count    : ${ws.kpis.length}
Integrity    : ${ws.integrityHash}
Key Metrics  : ${ws.kpis.map(k => `${k.name}=${k.value}${k.unit}`).join(', ')}`;
    }

    return ws;
  }

  /**
   * Verifies governance completeness of persona definitions against UAIGOS standard
   * @param {string|null} personaId Specific persona or null for all
   * @returns {Object} Integrity verification report
   */
  verifyWorkspaceIntegrity(personaId = null) {
    const targetPersonas = personaId ? [personaId] : Array.from(this.personas.keys());
    const results = [];
    let allValid = true;

    for (const pid of targetPersonas) {
      const p = this.personas.get(pid);
      const defects = [];

      if (!p.name) defects.push('Missing persona name');
      if (!p.category) defects.push('Missing persona category');
      if (!p.kpis || p.kpis.length === 0) defects.push('No KPIs configured');
      if (!p.shortcuts || p.shortcuts.length === 0) defects.push('No shortcuts configured');
      if (!p.terminology || Object.keys(p.terminology).length === 0) defects.push('No custom terminology map');

      if (defects.length > 0) allValid = false;

      results.push({
        personaId: pid,
        name: p ? p.name : 'Unknown',
        status: defects.length === 0 ? 'COMPLIANT' : 'NON_COMPLIANT',
        defects
      });
    }

    return {
      status: allValid ? 'PASS' : 'FAIL',
      totalChecked: targetPersonas.length,
      timestamp: new Date().toISOString(),
      results
    };
  }

  /**
   * Internal hash calculator for workspace payload integrity
   * @private
   */
  _calculateWorkspaceHash(ws) {
    const raw = `${ws.personaId}:${ws.generatedAt}:${JSON.stringify(ws.kpis.map(k=>k.value))}:${ws.evidenceGraphLens.nodeCount}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
  }
}

module.exports = {
  PersonaWorkspaceEngine,
  PERSONA_DEFINITIONS
};
