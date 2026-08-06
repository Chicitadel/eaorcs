/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Marketplace Catalog Engine
 * File           : engine/marketplace/MarketplaceCatalogEngine.js
 * Version        : 2026.1.0-LTS
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
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const crypto = require('crypto');

/**
 * Marketplace Catalog Engine
 * Provides enterprise governance packs, industry blueprints, compliance packs,
 * governance policies, AI reasoning models, and enterprise connectors.
 */
class MarketplaceCatalogEngine {
  /**
   * @param {Object} options Configuration options
   */
  constructor(options = {}) {
    this.options = options;
    this.catalogVersion = options.catalogVersion || '2026.1.0-LTS';

    // Store custom registered catalog extensions
    this.customCatalogItems = new Map();

    // Built-in Enterprise Catalog Items
    this.builtInCatalog = this._initBuiltInCatalog();
  }

  /**
   * Initializes built-in catalog sections
   * @private
   */
  _initBuiltInCatalog() {
    return {
      governancePacks: [
        {
          id: 'pack-iso-27001',
          name: 'ISO 27001:2022 Security & Governance Pack',
          category: 'GOVERNANCE_PACKS',
          version: '2026.1.0',
          standards: ['ISO 27001:2022'],
          description: 'Comprehensive policy set covering Annex A controls, risk management, and ISMS audit workflows.',
          rulesCount: 42,
          publisher: 'EAORCS Governance Authority',
          tierRequired: 'Enterprise',
          signature: 'SHA256:a1b2c3d4e5f67890iso27001sig',
          tags: ['security', 'iso27001', 'isms', 'compliance']
        },
        {
          id: 'pack-soc2-type2',
          name: 'SOC 2 Type II Trust Services Governance Pack',
          category: 'GOVERNANCE_PACKS',
          version: '2026.1.0',
          standards: ['SOC 2 Type II'],
          description: 'Trust Services Criteria policy pack for Security, Availability, Processing Integrity, Confidentiality, and Privacy.',
          rulesCount: 38,
          publisher: 'EAORCS Governance Authority',
          tierRequired: 'Enterprise',
          signature: 'SHA256:b2c3d4e5f678901soc2type2sig',
          tags: ['soc2', 'trust-services', 'audit']
        },
        {
          id: 'pack-dora-resilience',
          name: 'DORA Digital Operational Resilience Pack',
          category: 'GOVERNANCE_PACKS',
          version: '2026.1.0',
          standards: ['DORA (EU 2022/2554)'],
          description: 'Operational resilience governance for ICT risk management, testing, third-party risk, and incident reporting.',
          rulesCount: 35,
          publisher: 'European Financial Regulatory Council',
          tierRequired: 'Enterprise Premium',
          signature: 'SHA256:c3d4e5f6789012doraresiliencesig',
          tags: ['dora', 'financial', 'resilience', 'eu-regulatory']
        },
        {
          id: 'pack-nis2-security',
          name: 'NIS2 Cybersecurity Risk Management Pack',
          category: 'GOVERNANCE_PACKS',
          version: '2026.1.0',
          standards: ['NIS2 Directive (EU 2022/2555)'],
          description: 'Cybersecurity risk management and incident disclosure requirements for essential and important entities.',
          rulesCount: 29,
          publisher: 'ENISA Governance Board',
          tierRequired: 'Enterprise',
          signature: 'SHA256:d4e5f67890123nis2securitysig',
          tags: ['nis2', 'cybersecurity', 'infrastructure']
        },
        {
          id: 'pack-eu-ai-act',
          name: 'EU AI Act High-Risk AI Governance Pack',
          category: 'GOVERNANCE_PACKS',
          version: '2026.1.0',
          standards: ['EU AI Act (2024/1689)'],
          description: 'Mandatory risk management, data governance, technical documentation, transparency, and human oversight for high-risk AI.',
          rulesCount: 31,
          publisher: 'EU AI Governance Observatory',
          tierRequired: 'Enterprise AI Governance',
          signature: 'SHA256:e5f6789012345euaiactsig',
          tags: ['eu-ai-act', 'ai-governance', 'ethics', 'risk-management']
        },
        {
          id: 'pack-fedramp-high',
          name: 'FedRAMP High Baseline Security Governance Pack',
          category: 'GOVERNANCE_PACKS',
          version: '2026.1.0',
          standards: ['FedRAMP High', 'NIST SP 800-53 Rev 5'],
          description: 'Federal cloud security governance baseline for sensitive federal agency workloads.',
          rulesCount: 64,
          publisher: 'US Federal Cloud Security Board',
          tierRequired: 'Government Sovereign',
          signature: 'SHA256:f678901234567fedramphighsig',
          tags: ['fedramp', 'government', 'nist', 'us-federal']
        }
      ],
      industryBlueprints: [
        {
          id: 'blueprint-fintech',
          name: 'Financial Services & FinTech Regulatory Blueprint',
          category: 'INDUSTRY_BLUEPRINTS',
          version: '2026.1.0',
          industry: 'Financial Services / FinTech',
          standards: ['PCI-DSS v4.0', 'DORA', 'SOC 2', 'ISO 27001'],
          description: 'Pre-configured architecture blueprint featuring ledger transaction isolation, HSM integration, and fraud audit trails.',
          publisher: 'Global Banking & FinTech Architecture Council',
          tierRequired: 'Enterprise Financial',
          signature: 'SHA256:bp1fintecharchitectureblueprint',
          tags: ['banking', 'fintech', 'pci-dss', 'payments']
        },
        {
          id: 'blueprint-healthcare',
          name: 'Healthcare & Life Sciences Compliance Blueprint',
          category: 'INDUSTRY_BLUEPRINTS',
          version: '2026.1.0',
          industry: 'Healthcare / BioTech',
          standards: ['HIPAA Privacy & Security', 'FDA 21 CFR Part 11', 'GDPR Health Data'],
          description: 'HIPAA-compliant ePHI data isolation, zero-knowledge consent verification, and audit trace framework.',
          publisher: 'Life Sciences Governance Alliance',
          tierRequired: 'Enterprise Health',
          signature: 'SHA256:bp2healthcarecomplianceblueprint',
          tags: ['healthcare', 'hipaa', 'fda', 'ephi']
        },
        {
          id: 'blueprint-automotive',
          name: 'Autonomous Automotive & Embedded Systems Blueprint',
          category: 'INDUSTRY_BLUEPRINTS',
          version: '2026.1.0',
          industry: 'Automotive / Mobility',
          standards: ['ISO 26262 Functional Safety', 'ISO/SAE 21434 Cybersecurity'],
          description: 'Functional safety and vehicle cybersecurity governance blueprint for connected autonomous drive systems.',
          publisher: 'Automotive Cyber Alliance',
          tierRequired: 'Enterprise Automotive',
          signature: 'SHA256:bp3automotivefunctionalblueprint',
          tags: ['automotive', 'iso26262', 'cybersecurity', 'embedded']
        },
        {
          id: 'blueprint-gov-defense',
          name: 'Defense & Federal Government Cloud Blueprint',
          category: 'INDUSTRY_BLUEPRINTS',
          version: '2026.1.0',
          industry: 'Defense & Public Sector',
          standards: ['DoD Impact Level 5/6', 'CMMC 2.0 Level 3', 'NIST SP 800-171'],
          description: 'Air-gapped and hybrid sovereign cloud architecture blueprint with cryptographic zero-trust boundaries.',
          publisher: 'Defense Security Engineering Board',
          tierRequired: 'Government Sovereign',
          signature: 'SHA256:bp4govdefensecloudblueprint',
          tags: ['defense', 'cmmc', 'dod', 'sovereign-cloud']
        },
        {
          id: 'blueprint-energy-crit',
          name: 'Energy & Critical Infrastructure Resilience Blueprint',
          category: 'INDUSTRY_BLUEPRINTS',
          version: '2026.1.0',
          industry: 'Energy & Utilities',
          standards: ['NERC CIP', 'IEC 62443', 'NIS2'],
          description: 'OT/ICS grid protection, industrial SCADA safety governance, and rapid cyber threat containment blueprint.',
          publisher: 'Critical Infrastructure Resilience Council',
          tierRequired: 'Enterprise Critical Infrastructure',
          signature: 'SHA256:bp5energycriticalresilienceblueprint',
          tags: ['energy', 'scada', 'nerc-cip', 'critical-infrastructure']
        }
      ],
      compliancePacks: [
        {
          id: 'compliance-continuous-audit',
          name: 'Continuous Automated Audit & Evidence Pack',
          category: 'COMPLIANCE_PACKS',
          version: '2026.1.0',
          description: 'Automates continuous evidence gathering, cryptographically signs audit logs, and streams to external auditor portals.',
          publisher: 'EAORCS Compliance Systems',
          tierRequired: 'Enterprise',
          signature: 'SHA256:cp1continuousauditpack',
          tags: ['continuous-audit', 'evidence-automation', 'logging']
        },
        {
          id: 'compliance-zero-trust',
          name: 'Zero-Trust Architecture Enforcement Pack',
          category: 'COMPLIANCE_PACKS',
          version: '2026.1.0',
          description: 'Enforces mTLS identity, microsegmentation policies, and continuous API token validation.',
          publisher: 'Zero Trust Engineering Group',
          tierRequired: 'Enterprise',
          signature: 'SHA256:cp2zerotrustpack',
          tags: ['zero-trust', 'mtls', 'microsegmentation']
        },
        {
          id: 'compliance-data-sovereignty',
          name: 'Cross-Border Data Sovereignty & GDPR Pack',
          category: 'COMPLIANCE_PACKS',
          version: '2026.1.0',
          description: 'Strict geo-fencing rules, data residency controls, and automated Right-To-Be-Forgotten execution workflows.',
          publisher: 'EU Data Protection Council',
          tierRequired: 'Global Enterprise',
          signature: 'SHA256:cp3datasovereigntypack',
          tags: ['gdpr', 'data-residency', 'sovereignty']
        },
        {
          id: 'compliance-supply-chain-security',
          name: 'SLSA Level 4 & SBOM Supply Chain Security Pack',
          category: 'COMPLIANCE_PACKS',
          version: '2026.1.0',
          description: 'Verifies build provenance, inspects binary artifacts against SPDX/CycloneDX SBOMs, and blocks unauthorized packages.',
          publisher: 'Supply Chain Security Initiative',
          tierRequired: 'Enterprise',
          signature: 'SHA256:cp4supplychainsecuritypack',
          tags: ['slsa', 'sbom', 'supply-chain', 'provenance']
        }
      ],
      policies: [
        {
          id: 'policy-arch-governance',
          name: 'Architectural Decision & Drift Governance Policy',
          category: 'POLICIES',
          version: '2026.1.0',
          type: 'ARCHITECTURE_POLICY',
          enforcementLevel: 'STRICT_BLOCKING',
          description: 'Monitors runtime dependency graphs against frozen ADR decision states and blocks unauthorized module coupling.',
          publisher: 'Enterprise Architecture Board',
          signature: 'SHA256:pol1archgovernancepolicy'
        },
        {
          id: 'policy-secrets-isolation',
          name: 'Zero-Trust Secrets Management & Cryptographic Isolation Policy',
          category: 'POLICIES',
          version: '2026.1.0',
          type: 'SECURITY_POLICY',
          enforcementLevel: 'STRICT_BLOCKING',
          description: 'Prohibits cleartext credentials, hardcoded keys, and un-rotated tokens; enforces HSM secret injection.',
          publisher: 'Corporate Information Security Office',
          signature: 'SHA256:pol2secretsisolationpolicy'
        },
        {
          id: 'policy-microservice-bound',
          name: 'Microservice Bounded Context & Isolation Policy',
          category: 'POLICIES',
          version: '2026.1.0',
          type: 'ARCHITECTURE_POLICY',
          enforcementLevel: 'WARNING_AUDIT',
          description: 'Validates API contract boundaries between microservices and prevents cross-domain database mutations.',
          publisher: 'Enterprise Architecture Board',
          signature: 'SHA256:pol3microserviceboundpolicy'
        },
        {
          id: 'policy-crypto-enforcement',
          name: 'Universal Cryptographic Proof & Signature Enforcement Policy',
          category: 'POLICIES',
          version: '2026.1.0',
          type: 'CRYPTOGRAPHIC_POLICY',
          enforcementLevel: 'STRICT_BLOCKING',
          description: 'Requires all release artifacts, state transitions, and API mutations to carry valid Ed25519 or RSA-4096 signatures.',
          publisher: 'Cryptographic Security Taskforce',
          signature: 'SHA256:pol4cryptoenforcementpolicy'
        }
      ],
      aiModels: [
        {
          id: 'aimodel-regulatory-reasoning-v3',
          name: 'EAORCS Regulatory Reasoning Engine LLM (v3.4)',
          category: 'AI_MODELS',
          version: '3.4.0',
          modelType: 'REASONING_LLM',
          parameters: '70B Fine-Tuned Domain Specialist',
          description: 'Specialized LLM trained on international regulatory frameworks, legal compliance texts, and security standards.',
          publisher: 'EAORCS AI Research Institute',
          tierRequired: 'Enterprise AI Suite',
          signature: 'SHA256:ai1regulatoryreasoningllm'
        },
        {
          id: 'aimodel-drift-detection-transformer',
          name: 'Architecture & Trust Drift Detection Transformer',
          category: 'AI_MODELS',
          version: '2.1.0',
          modelType: 'TRANSFORMER_ANOMALY_DETECTOR',
          parameters: '12B Sequence Model',
          description: 'Real-time neural anomaly model detecting structural code drift, parameter anomaly, and trust score decay.',
          publisher: 'EAORCS AI Research Institute',
          tierRequired: 'Enterprise',
          signature: 'SHA256:ai2driftdetectiontransformer'
        },
        {
          id: 'aimodel-code-auditor',
          name: 'Real-Time Autonomous Code Compliance Auditor Model',
          category: 'AI_MODELS',
          version: '1.8.0',
          modelType: 'CODE_AUDIT_LLM',
          parameters: '34B Code Reasoning Specialist',
          description: 'Scans source code diffs in CI/CD pipelines to enforce UAIGOS headers, vulnerability fixes, and zero-trust patterns.',
          publisher: 'EAORCS AI Research Institute',
          tierRequired: 'Developer & Enterprise',
          signature: 'SHA256:ai3codeauditormodel'
        }
      ],
      connectors: [
        {
          id: 'connector-github-enterprise',
          name: 'GitHub Enterprise CI/CD Compliance Bridge',
          category: 'CONNECTORS',
          version: '2026.1.0',
          targetSystem: 'GitHub Enterprise Server & Cloud',
          protocol: 'REST / Webhooks / GraphQL',
          description: 'Automates Pull Request governance checks, blocks non-compliant merges, and injects signed provenance status badges.',
          publisher: 'EAORCS Integration Engineering',
          tierRequired: 'Standard / Enterprise',
          signature: 'SHA256:conn1githubenterprisebridge'
        },
        {
          id: 'connector-aws-securityhub',
          name: 'AWS Security Hub & GuardDuty Integration Connector',
          category: 'CONNECTORS',
          version: '2026.1.0',
          targetSystem: 'AWS Security Hub / GuardDuty',
          protocol: 'AWS SDK v3 / EventBridge',
          description: 'Ingests cloud security findings into the EAORCS evidence ledger and exports compliance attestations to Security Hub.',
          publisher: 'Cloud Security Integration Team',
          tierRequired: 'Enterprise Cloud',
          signature: 'SHA256:conn2awssecurityhubconnector'
        },
        {
          id: 'connector-azure-sentinel',
          name: 'Azure Sentinel & Security Center Compliance Bridge',
          category: 'CONNECTORS',
          version: '2026.1.0',
          targetSystem: 'Microsoft Azure Sentinel SIEM',
          protocol: 'Azure Monitor Logs API',
          description: 'Streams real-time EAORCS cryptographic audit events to Azure Sentinel for SIEM threat analysis.',
          publisher: 'Cloud Security Integration Team',
          tierRequired: 'Enterprise Cloud',
          signature: 'SHA256:conn3azuresentinelbridge'
        },
        {
          id: 'connector-servicenow-grc',
          name: 'ServiceNow GRC & Integrated Risk Management Connector',
          category: 'CONNECTORS',
          version: '2026.1.0',
          targetSystem: 'ServiceNow GRC / IRM',
          protocol: 'ServiceNow Table API / Scripted REST',
          description: 'Synchronizes risk posture, continuous control testing, and audit evidence with ServiceNow GRC dashboards.',
          publisher: 'Enterprise GRC Connectors Team',
          tierRequired: 'Enterprise GRC',
          signature: 'SHA256:conn4servicenowgrcconnector'
        },
        {
          id: 'connector-jira-compliance',
          name: 'Jira Enterprise Compliance & Audit Issue Sync',
          category: 'CONNECTORS',
          version: '2026.1.0',
          targetSystem: 'Atlassian Jira Software & Service Management',
          protocol: 'Jira REST API v3',
          description: 'Automatically creates remediating engineering tickets when compliance rules or trust score decays occur.',
          publisher: 'EAORCS Integration Engineering',
          tierRequired: 'Standard / Enterprise',
          signature: 'SHA256:conn5jiracompliancesync'
        }
      ]
    };
  }

  /**
   * Returns entire catalog grouped by section
   * @returns {Object}
   */
  getCatalog() {
    const customList = Array.from(this.customCatalogItems.values());

    return {
      version: this.catalogVersion,
      timestamp: new Date().toISOString(),
      summary: {
        totalGovernancePacks: this.builtInCatalog.governancePacks.length,
        totalIndustryBlueprints: this.builtInCatalog.industryBlueprints.length,
        totalCompliancePacks: this.builtInCatalog.compliancePacks.length,
        totalPolicies: this.builtInCatalog.policies.length,
        totalAIModels: this.builtInCatalog.aiModels.length,
        totalConnectors: this.builtInCatalog.connectors.length,
        totalCustomItems: customList.length
      },
      categories: [
        { name: 'Governance Packs', items: this.builtInCatalog.governancePacks },
        { name: 'Industry Blueprints', items: this.builtInCatalog.industryBlueprints },
        { name: 'Compliance Packs', items: this.builtInCatalog.compliancePacks },
        { name: 'Policies', items: this.builtInCatalog.policies },
        { name: 'AI Models', items: this.builtInCatalog.aiModels },
        { name: 'Connectors', items: this.builtInCatalog.connectors }
      ],
      governancePacks: this.builtInCatalog.governancePacks,
      industryBlueprints: this.builtInCatalog.industryBlueprints,
      compliancePacks: this.builtInCatalog.compliancePacks,
      policies: this.builtInCatalog.policies,
      aiModels: this.builtInCatalog.aiModels,
      connectors: this.builtInCatalog.connectors,
      customCatalogItems: customList
    };
  }

  /**
   * Returns Governance Packs with optional filtering
   * @param {Object} filter Options like standard, tierRequired, tag
   * @returns {Array<Object>}
   */
  getGovernancePacks(filter = {}) {
    return this._applyFilter(this.builtInCatalog.governancePacks, filter);
  }

  /**
   * Returns Industry Blueprints with optional filtering
   * @param {Object} filter Options like industry, standard, tag
   * @returns {Array<Object>}
   */
  getIndustryBlueprints(filter = {}) {
    return this._applyFilter(this.builtInCatalog.industryBlueprints, filter);
  }

  /**
   * Returns Compliance Packs with optional filtering
   * @param {Object} filter Options like tag, tierRequired
   * @returns {Array<Object>}
   */
  getCompliancePacks(filter = {}) {
    return this._applyFilter(this.builtInCatalog.compliancePacks, filter);
  }

  /**
   * Returns Governance Policies with optional filtering
   * @param {Object} filter Options like type, enforcementLevel
   * @returns {Array<Object>}
   */
  getPolicies(filter = {}) {
    return this._applyFilter(this.builtInCatalog.policies, filter);
  }

  /**
   * Returns AI Models with optional filtering
   * @param {Object} filter Options like modelType
   * @returns {Array<Object>}
   */
  getAIModels(filter = {}) {
    return this._applyFilter(this.builtInCatalog.aiModels, filter);
  }

  /**
   * Returns Connectors with optional filtering
   * @param {Object} filter Options like targetSystem, protocol
   * @returns {Array<Object>}
   */
  getConnectors(filter = {}) {
    return this._applyFilter(this.builtInCatalog.connectors, filter);
  }

  /**
   * Finds an item by ID across all categories
   * @param {string} itemId Item ID to search for
   * @returns {Object|null} Item or null if not found
   */
  getItemById(itemId) {
    if (this.customCatalogItems.has(itemId)) {
      return this.customCatalogItems.get(itemId);
    }

    const categories = [
      this.builtInCatalog.governancePacks,
      this.builtInCatalog.industryBlueprints,
      this.builtInCatalog.compliancePacks,
      this.builtInCatalog.policies,
      this.builtInCatalog.aiModels,
      this.builtInCatalog.connectors
    ];

    for (const cat of categories) {
      const found = cat.find(item => item.id === itemId);
      if (found) return found;
    }

    return null;
  }

  /**
   * Performs search across the catalog
   * @param {string} query Search keyword
   * @param {Object} options Search options
   * @returns {Array<Object>} Matches found
   */
  searchCatalog(query = '', options = {}) {
    const term = query.toLowerCase().trim();
    const allItems = [
      ...this.builtInCatalog.governancePacks,
      ...this.builtInCatalog.industryBlueprints,
      ...this.builtInCatalog.compliancePacks,
      ...this.builtInCatalog.policies,
      ...this.builtInCatalog.aiModels,
      ...this.builtInCatalog.connectors,
      ...Array.from(this.customCatalogItems.values())
    ];

    if (!term) return allItems;

    return allItems.filter(item => {
      const nameMatch = item.name && item.name.toLowerCase().includes(term);
      const descMatch = item.description && item.description.toLowerCase().includes(term);
      const idMatch = item.id && item.id.toLowerCase().includes(term);
      const tagMatch = Array.isArray(item.tags) && item.tags.some(t => t.toLowerCase().includes(term));
      const stdMatch = Array.isArray(item.standards) && item.standards.some(s => s.toLowerCase().includes(term));

      return nameMatch || descMatch || idMatch || tagMatch || stdMatch;
    });
  }

  /**
   * Registers a new catalog item dynamically
   * @param {string} category One of GOVERNANCE_PACKS, INDUSTRY_BLUEPRINTS, COMPLIANCE_PACKS, POLICIES, AI_MODELS, CONNECTORS
   * @param {Object} itemData Properties of the catalog item
   * @returns {Object} Registered item record with signature
   */
  registerCatalogItem(category, itemData) {
    if (!itemData || !itemData.id || !itemData.name) {
      throw new Error('Invalid catalog item payload: id and name are required.');
    }

    const payloadString = JSON.stringify(itemData);
    const signature = `SHA256:${crypto.createHash('sha256').update(payloadString).digest('hex')}`;

    const registeredRecord = {
      ...itemData,
      category: category || itemData.category || 'CUSTOM_EXTENSIONS',
      registeredAt: new Date().toISOString(),
      signature
    };

    this.customCatalogItems.set(itemData.id, registeredRecord);
    return registeredRecord;
  }

  /**
   * Simulates installation / activation of a catalog item
   * @param {string} itemId Item ID to install
   * @param {Object} targetConfig Configuration details for installation
   * @returns {Object} Installation summary record
   */
  installCatalogItem(itemId, targetConfig = {}) {
    const item = this.getItemById(itemId);
    if (!item) {
      throw new Error(`Catalog item '${itemId}' not found.`);
    }

    const installationId = `inst_${crypto.randomBytes(8).toString('hex')}`;
    const timestamp = new Date().toISOString();

    return {
      installationId,
      itemId: item.id,
      itemName: item.name,
      category: item.category,
      status: 'ACTIVATED',
      targetEnvironment: targetConfig.environment || 'PRODUCTION',
      installedAt: timestamp,
      verificationSignature: `SHA256:${crypto.createHash('sha256').update(`${installationId}_${itemId}_${timestamp}`).digest('hex')}`
    };
  }

  /**
   * Exports full catalog manifest as formatted JSON or Object
   * @param {string} format 'json' or 'object'
   * @returns {string|Object}
   */
  exportCatalogManifest(format = 'json') {
    const catalogData = this.getCatalog();
    if (format === 'json') {
      return JSON.stringify(catalogData, null, 2);
    }
    return catalogData;
  }

  /**
   * Static method aliases for quick non-instantiated calls
   */
  static getCatalog() {
    return new MarketplaceCatalogEngine().getCatalog();
  }

  static getGovernancePacks(filter) {
    return new MarketplaceCatalogEngine().getGovernancePacks(filter);
  }

  static getIndustryBlueprints(filter) {
    return new MarketplaceCatalogEngine().getIndustryBlueprints(filter);
  }

  static getCompliancePacks(filter) {
    return new MarketplaceCatalogEngine().getCompliancePacks(filter);
  }

  static getPolicies(filter) {
    return new MarketplaceCatalogEngine().getPolicies(filter);
  }

  static getAIModels(filter) {
    return new MarketplaceCatalogEngine().getAIModels(filter);
  }

  static getConnectors(filter) {
    return new MarketplaceCatalogEngine().getConnectors(filter);
  }

  static getItemById(itemId) {
    return new MarketplaceCatalogEngine().getItemById(itemId);
  }

  static searchCatalog(query, options) {
    return new MarketplaceCatalogEngine().searchCatalog(query, options);
  }

  /**
   * Internal helper for filtering arrays
   * @private
   */
  _applyFilter(list, filter) {
    if (!filter || Object.keys(filter).length === 0) return list;

    return list.filter(item => {
      for (const [key, val] of Object.entries(filter)) {
        if (Array.isArray(item[key])) {
          if (!item[key].includes(val)) return false;
        } else if (item[key] !== val) {
          return false;
        }
      }
      return true;
    });
  }
}

module.exports = MarketplaceCatalogEngine;
