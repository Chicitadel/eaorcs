/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Enterprise Documentation & Knowledge Base Engine
 * File           : engine/portal/EnterpriseDocPortalEngine.js
 * Version        : 2026.1.0-LTS
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
const URL = require('url').URL;

/**
 * Standard Supported Enterprise Roles
 */
const SUPPORTED_ROLES = [
  'Developers',
  'Architects',
  'Security',
  'Compliance',
  'Operations',
  'Support',
  'Procurement'
];

/**
 * Canonicalizes role input string to standard title-case role name
 * @param {string} roleInput 
 * @returns {string} Standard role name or 'Developers' default
 */
function normalizeRole(roleInput) {
  if (!roleInput || typeof roleInput !== 'string') return 'Developers';
  const clean = roleInput.trim().toLowerCase();
  if (clean.startsWith('dev')) return 'Developers';
  if (clean.startsWith('arch')) return 'Architects';
  if (clean.startsWith('sec')) return 'Security';
  if (clean.startsWith('comp')) return 'Compliance';
  if (clean.startsWith('op')) return 'Operations';
  if (clean.startsWith('supp')) return 'Support';
  if (clean.startsWith('proc')) return 'Procurement';
  
  // Direct match lookup
  const match = SUPPORTED_ROLES.find(r => r.toLowerCase() === clean);
  return match || 'Developers';
}

/**
 * Enterprise Documentation & Knowledge Base Portal Engine
 */
class EnterpriseDocPortalEngine {
  /**
   * @param {Object} options Configuration options
   */
  constructor(options = {}) {
    this.options = options;
    this.portalName = options.portalName || 'EAORCS Enterprise Documentation & Knowledge Base Portal';
    this.version = options.version || '2026.1.0-LTS';
    this.baseUrl = options.baseUrl || 'https://docs.eaorcs.org';
    this.apiBaseUrl = options.apiBaseUrl || 'https://api.eaorcs.org/v1';
    this.organization = options.organization || 'Ujomor Systems & Enterprise Governance';
    this.supportedRoles = [...SUPPORTED_ROLES];
  }

  /**
   * Generates role-based documentation bundles for specified enterprise roles
   * @param {string} role Role name ('Developers', 'Architects', 'Security', 'Compliance', 'Operations', 'Support', 'Procurement', or 'all')
   * @param {Object} customOptions Custom options or metadata overrides
   * @returns {Object} Role documentation bundle or collection of bundles
   */
  generateRoleDocs(role = 'all', customOptions = {}) {
    const isAll = !role || String(role).trim().toLowerCase() === 'all';
    
    if (isAll) {
      const allBundles = {};
      for (const r of this.supportedRoles) {
        allBundles[r] = this._buildSingleRoleBundle(r, customOptions);
      }
      return {
        portalName: this.portalName,
        version: this.version,
        generatedAt: new Date().toISOString(),
        organization: this.organization,
        supportedRoles: this.supportedRoles,
        bundles: allBundles
      };
    }

    const canonicalRole = normalizeRole(role);
    return this._buildSingleRoleBundle(canonicalRole, customOptions);
  }

  /**
   * Internal builder for a specific role documentation bundle
   * @private
   */
  _buildSingleRoleBundle(role, customOptions = {}) {
    const timestamp = new Date().toISOString();

    switch (role) {
      case 'Developers':
        return this._buildDevelopersBundle(timestamp, customOptions);
      case 'Architects':
        return this._buildArchitectsBundle(timestamp, customOptions);
      case 'Security':
        return this._buildSecurityBundle(timestamp, customOptions);
      case 'Compliance':
        return this._buildComplianceBundle(timestamp, customOptions);
      case 'Operations':
        return this._buildOperationsBundle(timestamp, customOptions);
      case 'Support':
        return this._buildSupportBundle(timestamp, customOptions);
      case 'Procurement':
        return this._buildProcurementBundle(timestamp, customOptions);
      default:
        return this._buildDevelopersBundle(timestamp, customOptions);
    }
  }

  _buildDevelopersBundle(timestamp, opts) {
    const sections = [
      {
        id: 'developer-overview',
        title: 'System Overview & Integration Hub',
        content: `# System Overview & Integration Hub\n\nWelcome to the EAORCS Developer Portal. This documentation guides developers through integrating with the EAORCS Platform APIs, SDKs, and event-driven webhooks.\n\n- Quick Link: [Authentication Guide](#developer-authentication)\n- Quick Link: [SDK Reference Manual](#developer-sdk-reference)\n- Quick Link: [Error Handling Guide](#developer-error-handling)\n- External Reference: [OpenAPI Playground](https://api.eaorcs.org/v1/playground)\n- Related Spec: [Architecture Overview](../architecture/overview.md)`
      },
      {
        id: 'developer-authentication',
        title: 'Authentication & Security Tokens',
        content: `# Authentication & Security Tokens\n\nEAORCS requires strict Zero-Trust authentication using OAuth2 JWT Bearer tokens or mTLS X.509 client certificates.\n\n- Header Format: \`Authorization: Bearer <JWT_TOKEN>\`\n- API Key Header: \`X-EAORCS-API-KEY: <API_KEY>\`\n- Quick Link: [System Overview](#developer-overview)\n- External Endpoint: [OAuth Token Endpoint](https://api.eaorcs.org/v1/oauth/token)`
      },
      {
        id: 'developer-sdk-reference',
        title: 'SDK Quickstart & Package Registry',
        content: `# SDK Quickstart & Package Registry\n\nOfficial SDK packages are published for Node.js, Python, Go, and Java.\n\n\`\`\`bash\nnpm install @eaorcs/sdk-node@2026.1.0-lts\npip install eaorcs-sdk==2026.1.0\ngo get github.com/eaorcs/sdk-go@v2026.1.0\n\`\`\`\n\n- External Registry: [NPM Package Catalog](https://registry.eaorcs.org/packages/@eaorcs/sdk-node)`
      },
      {
        id: 'developer-error-handling',
        title: 'Error Handling & Standard Status Codes',
        content: `# Error Handling & Standard Status Codes\n\nAll API error responses follow RFC 7807 Problem Details for HTTP APIs.\n\n- Status 400: \`INVALID_PAYLOAD\`\n- Status 401: \`UNAUTHORIZED_ACCESS\`\n- Status 403: \`POLICY_VIOLATION\`\n- Related Guide: [Support Triage Matrix](../support/triage.md)`
      }
    ];

    return this._formatBundle('Developers', 'EAORCS Developer Integration & SDK Reference Manual', sections, timestamp, opts);
  }

  _buildArchitectsBundle(timestamp, opts) {
    const sections = [
      {
        id: 'architect-topology',
        title: 'System Topology & Component Architecture',
        content: `# System Topology & Component Architecture\n\nThe EAORCS system architecture is designed as a modular, fault-domain isolated, autonomous enterprise application platform.\n\n- Section Link: [Data Persistence Layer](#architect-persistence)\n- Section Link: [Zero-Trust Boundary](#architect-zero-trust)\n- External Reference: [Architecture Portal](https://docs.eaorcs.org/architecture/topology)\n- Related Document: [Security Specification](../security/spec.md)`
      },
      {
        id: 'architect-persistence',
        title: 'Data Persistence & Event Bus Messaging',
        content: `# Data Persistence & Event Bus Messaging\n\nData integrity is assured using immutable event sourcing and distributed consensus engines.\n\n- Event Stream: \`eaorcs.events.audit.v1\`\n- Relational Persistence: PostgreSQL 16 with Row Level Security (RLS)\n- Section Link: [High Availability](#architect-scalability)`
      },
      {
        id: 'architect-zero-trust',
        title: 'Zero-Trust Security & Bounded Contexts',
        content: `# Zero-Trust Security & Bounded Contexts\n\nStrict domain boundaries enforce least-privilege context separation across all subsystems.\n\n- Policy Freeze Standard: UAIGOS-2026\n- External Standard: [NIST SP 800-207 Zero Trust](https://csrc.nist.gov/publications/detail/sp/800-207/final)`
      },
      {
        id: 'architect-scalability',
        title: 'Scalability & SLA Performance Targets',
        content: `# Scalability & SLA Performance Targets\n\nEngineered for 99.999% availability with active-active multi-region deployment topologies.\n\n- Target Latency: P99 < 50ms\n- Related Guide: [Operations Manual](../operations/runbook.md)`
      }
    ];

    return this._formatBundle('Architects', 'EAORCS Enterprise System Architecture & Blueprint Manual', sections, timestamp, opts);
  }

  _buildSecurityBundle(timestamp, opts) {
    const sections = [
      {
        id: 'security-crypto',
        title: 'Cryptographic Standards & Key Lifecycle',
        content: `# Cryptographic Standards & Key Lifecycle\n\nEAORCS mandates approved enterprise cryptographic algorithms:\n\n- Symmetric Encryption: AES-256-GCM\n- Key Derivation: Argon2id\n- Signatures: Ed25519 / RSA-4096\n- Hashing: SHA-256 / SHA-512\n\n- Link: [Threat Matrix](#security-threat-matrix)\n- External Standard: [OWASP ASVS v4.0](https://owasp.org/www-project-application-security-verification-standard)`
      },
      {
        id: 'security-threat-matrix',
        title: 'Threat Model & Security Mitigation',
        content: `# Threat Model & Security Mitigation\n\nComprehensive STRIDE and DREAD threat modeling is integrated directly into CI/CD pipelines.\n\n- Link: [RBAC Policy Engine](#security-rbac)\n- External Spec: [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)`
      },
      {
        id: 'security-rbac',
        title: 'Identity & RBAC/ABAC Access Control',
        content: `# Identity & RBAC/ABAC Access Control\n\nAccess decisions are evaluated in real-time by the Policy Engine using Attribute-Based Access Control (ABAC).\n\n- Policy Model: Deny-by-default\n- Link: [Audit Logging](#security-audit-trail)`
      },
      {
        id: 'security-audit-trail',
        title: 'Audit Logging & SIEM Integration',
        content: `# Audit Logging & SIEM Integration\n\nAll security-relevant events produce cryptographically hashed audit trails for SIEM export.\n\n- Format: CEF / Syslog / OpenTelemetry\n- Related Document: [Compliance Mapping](../compliance/mapping.md)`
      }
    ];

    return this._formatBundle('Security', 'EAORCS Enterprise Security Architecture & Threat Governance Manual', sections, timestamp, opts);
  }

  _buildComplianceBundle(timestamp, opts) {
    const sections = [
      {
        id: 'compliance-regulatory',
        title: 'Regulatory Framework Mapping',
        content: `# Regulatory Framework Mapping\n\nEAORCS provides continuous regulatory compliance verification mapped to international standards:\n\n- ISO/IEC 27001:2022 Control Annex A\n- SOC 2 Type II Security, Availability, & Confidentiality\n- EU GDPR Article 32 Security of Processing\n- NIST SP 800-53 Rev 5\n\n- Link: [Automated Evidence Engine](#compliance-evidence)\n- External Portal: [ISO Certification Verification](https://certs.eaorcs.org/iso27001.pdf)`
      },
      {
        id: 'compliance-evidence',
        title: 'Automated Evidence Collection Engine',
        content: `# Automated Evidence Collection Engine\n\nContinuous automated harvesting of immutable cryptographic evidence bundles.\n\n- Link: [Assurance Audit Trails](#compliance-audit-assurance)`
      },
      {
        id: 'compliance-audit-assurance',
        title: 'Continuous Assurance Audit Trails',
        content: `# Continuous Assurance Audit Trails\n\nAudit trails are immutable, time-stamped, and verifiable via public key cryptography.\n\n- Related Document: [Procurement Disclosure](../procurement/disclosure.md)`
      }
    ];

    return this._formatBundle('Compliance', 'EAORCS Regulatory Compliance & Continuous Assurance Governance', sections, timestamp, opts);
  }

  _buildOperationsBundle(timestamp, opts) {
    const sections = [
      {
        id: 'operations-deployment',
        title: 'Deployment Topologies & Helm Orchestration',
        content: `# Deployment Topologies & Helm Orchestration\n\nDeployment strategies support Kubernetes (k8s), Bare Metal, and Cloud-native environments.\n\n- Helm Repository: \`https://charts.eaorcs.org\`\n- Link: [Monitoring & Telemetry](#operations-monitoring)\n- External Reference: [Operations Registry](https://registry.eaorcs.org/ops)`
      },
      {
        id: 'operations-monitoring',
        title: 'Telemetry, Prometheus Metrics & OpenTelemetry',
        content: `# Telemetry, Prometheus Metrics & OpenTelemetry\n\nFull observability stack with pre-configured Grafana dashboards and Prometheus alerts.\n\n- Endpoint: \`/metrics\`\n- Link: [Disaster Recovery Playbook](#operations-disaster-recovery)`
      },
      {
        id: 'operations-disaster-recovery',
        title: 'Disaster Recovery & High Availability Playbooks',
        content: `# Disaster Recovery & High Availability Playbooks\n\nAutomated failover procedure with RPO = 0 and RTO < 60 seconds.\n\n- Related Document: [Architecture Topology](../architecture/topology.md)`
      }
    ];

    return this._formatBundle('Operations', 'EAORCS Operations, Telemetry & Site Reliability Engineering Manual', sections, timestamp, opts);
  }

  _buildSupportBundle(timestamp, opts) {
    const sections = [
      {
        id: 'support-triage',
        title: 'Level 1-3 Incident Triage Matrix',
        content: `# Level 1-3 Incident Triage Matrix\n\nStructured escalation workflow for resolving production incidents quickly.\n\n- Severity 1 (Critical): 15-minute response SLA\n- Severity 2 (High): 1-hour response SLA\n- Link: [Diagnostic CLI Tools](#support-diagnostic-cli)\n- Related Document: [Developer Quickstart](../developer/quickstart.md)`
      },
      {
        id: 'support-diagnostic-cli',
        title: 'Diagnostic CLI & System Status Diagnostics',
        content: `# Diagnostic CLI & System Status Diagnostics\n\nUse the \`eaorcs\` CLI to diagnose subsystem health and host environment parity.\n\n\`\`\`bash\neaorcs host-detect\neaorcs audit run --strict\n\`\`\`\n- Link: [Error Code Catalog](#support-error-catalog)`
      },
      {
        id: 'support-error-catalog',
        title: 'System Error Code Catalog',
        content: `# System Error Code Catalog\n\nComplete list of error codes, root causes, and recommended recovery procedures.\n\n- Code \`ERR_EAORCS_POLICY_VIOLATION\`: Policy check failed.\n- Code \`ERR_EAORCS_AUTH_EXPIRED\`: Bearer token expired.`
      }
    ];

    return this._formatBundle('Support', 'EAORCS Support Operations & Technical Incident Triage Guide', sections, timestamp, opts);
  }

  _buildProcurementBundle(timestamp, opts) {
    const sections = [
      {
        id: 'procurement-licensing',
        title: 'Enterprise Licensing & Subscription Models',
        content: `# Enterprise Licensing & Subscription Models\n\nFlexible licensing models including On-Premises Enterprise Commercial and Managed SaaS.\n\n- Link: [Service Level Agreements](#procurement-sla)\n- External Reference: [Enterprise Pricing Portal](https://eaorcs.org/pricing)`
      },
      {
        id: 'procurement-sla',
        title: 'Service Level Agreements (SLAs & XLAs)',
        content: `# Service Level Agreements (SLAs & XLAs)\n\nGuaranteed uptime commitments and response time SLAs backed by contractual financial credits.\n\n- Link: [Software Bill of Materials](#procurement-sbom)`
      },
      {
        id: 'procurement-sbom',
        title: 'Software Bill of Materials (SBOM) & Third-Party Audit',
        content: `# Software Bill of Materials (SBOM) & Third-Party Audit\n\nMachine-readable SPDX and CycloneDX SBOM manifests generated per build artifact.\n\n- Related Document: [Compliance Certification](../compliance/iso25010.json)`
      }
    ];

    return this._formatBundle('Procurement', 'EAORCS Enterprise Procurement, Licensing & SLA Specification', sections, timestamp, opts);
  }

  /**
   * Helper to structure and format a role documentation bundle
   * @private
   */
  _formatBundle(role, title, sections, timestamp, customOpts) {
    const tableOfContents = sections.map(s => ({
      id: s.id,
      title: s.title,
      anchor: `#${s.id}`
    }));

    const markdownParts = [];
    markdownParts.push(`# ${title}`);
    markdownParts.push(`\n**Role Persona**: ${role}  `);
    markdownParts.push(`**Version**: ${customOpts.version || this.version}  `);
    markdownParts.push(`**Generated At**: ${timestamp}  `);
    markdownParts.push(`**Classification**: RESTRICTED / ENTERPRISE  \n`);
    markdownParts.push(`## Table of Contents\n`);
    for (const tocItem of tableOfContents) {
      markdownParts.push(`- [${tocItem.title}](${tocItem.anchor})`);
    }
    markdownParts.push(`\n--- \n`);

    for (const sec of sections) {
      markdownParts.push(sec.content);
      markdownParts.push(`\n`);
    }

    const fullMarkdown = markdownParts.join('\n');

    return {
      role,
      title,
      version: customOpts.version || this.version,
      generatedAt: timestamp,
      classification: 'RESTRICTED / ENTERPRISE',
      portalName: this.portalName,
      organization: this.organization,
      sections,
      tableOfContents,
      markdownContent: fullMarkdown,
      metadata: {
        sectionsCount: sections.length,
        characterCount: fullMarkdown.length,
        bundleHash: crypto.createHash('sha256').update(fullMarkdown).digest('hex')
      }
    };
  }

  /**
   * Validates Markdown link integrity across documentation content, bundles, or markdown text
   * @param {string|Object} target Markdown text string or Role documentation bundle object
   * @param {Object} options Options for link checking (e.g. checkFilesystem)
   * @returns {Object} Link integrity validation report
   */
  validateMarkdownLinks(target, options = {}) {
    let markdownText = '';
    let bundleRole = 'Unknown';

    if (typeof target === 'string') {
      markdownText = target;
    } else if (target && typeof target === 'object') {
      if (target.markdownContent) {
        markdownText = target.markdownContent;
      } else if (target.sections && Array.isArray(target.sections)) {
        markdownText = target.sections.map(s => s.content).join('\n\n');
      } else if (target.bundles) {
        const parts = [];
        for (const key of Object.keys(target.bundles)) {
          parts.push(target.bundles[key].markdownContent || '');
        }
        markdownText = parts.join('\n\n');
      }
      if (target.role) bundleRole = target.role;
    }

    // Extract all headers for anchor validation
    const headerRegex = /^#+\s+(.+)$/gm;
    const existingAnchors = new Set();
    let headerMatch;
    while ((headerMatch = headerRegex.exec(markdownText)) !== null) {
      const headerText = headerMatch[1].trim();
      const slug = this._slugifyHeader(headerText);
      existingAnchors.add(slug);
    }
    
    // Also include explicitly defined section IDs if present in object target
    if (typeof target === 'object' && target.sections) {
      for (const sec of target.sections) {
        if (sec.id) existingAnchors.add(sec.id.toLowerCase());
      }
    }

    // Regex for markdown links: [text](href)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const validLinks = [];
    const brokenLinks = [];
    const warnings = [];

    const lines = markdownText.split('\n');
    let lineNum = 1;

    for (const line of lines) {
      let match;
      linkRegex.lastIndex = 0;
      while ((match = linkRegex.exec(line)) !== null) {
        const text = match[1].trim();
        const href = match[2].trim();

        const result = this._checkSingleLink(text, href, existingAnchors, lineNum, options);
        if (result.valid) {
          validLinks.push(result);
        } else {
          brokenLinks.push(result);
        }
      }
      lineNum++;
    }

    const totalLinks = validLinks.length + brokenLinks.length;
    const isValid = brokenLinks.length === 0;

    return {
      valid: isValid,
      bundleRole,
      totalLinks,
      validLinksCount: validLinks.length,
      brokenLinksCount: brokenLinks.length,
      validLinks,
      brokenLinks,
      warnings,
      checkedAt: new Date().toISOString()
    };
  }

  /**
   * Alias for validateMarkdownLinks for protocol consistency
   */
  validateLinkIntegrity(target, options = {}) {
    return this.validateMarkdownLinks(target, options);
  }

  /**
   * Internal link checker for individual href targets
   * @private
   */
  _checkSingleLink(text, href, existingAnchors, lineNum, options) {
    if (!href || href === '') {
      return {
        valid: false,
        text,
        target: href,
        type: 'empty',
        reason: 'Empty link target',
        line: lineNum
      };
    }

    // Internal Anchor Link
    if (href.startsWith('#')) {
      const anchor = href.substring(1).toLowerCase();
      const exists = existingAnchors.has(anchor);
      return {
        valid: exists,
        text,
        target: href,
        type: 'anchor',
        reason: exists ? 'Anchor found' : `Anchor '#${anchor}' not found in document headers`,
        line: lineNum
      };
    }

    // Scheme-based URL (e.g. http://, https://, ftp://, or invalid htptp://)
    if (href.includes('://')) {
      try {
        const parsed = new URL(href);
        const isValidScheme = ['http:', 'https:'].includes(parsed.protocol);
        return {
          valid: isValidScheme,
          text,
          target: href,
          type: 'external',
          reason: isValidScheme ? 'Valid URL syntax' : `Unsupported URL protocol '${parsed.protocol}'`,
          line: lineNum
        };
      } catch (err) {
        return {
          valid: false,
          text,
          target: href,
          type: 'external',
          reason: `Invalid URL format: ${err.message}`,
          line: lineNum
        };
      }
    }

    // Mailto link
    if (href.startsWith('mailto:')) {
      return {
        valid: true,
        text,
        target: href,
        type: 'mailto',
        reason: 'Valid mailto target',
        line: lineNum
      };
    }

    // Relative File path link (e.g. ../architecture/overview.md or ./spec.md)
    const isRelativeFile = href.endsWith('.md') || href.endsWith('.json') || href.endsWith('.pdf') || href.includes('/');
    if (isRelativeFile) {
      return {
        valid: true,
        text,
        target: href,
        type: 'relative',
        reason: 'Valid relative path format',
        line: lineNum
      };
    }

    return {
      valid: true,
      text,
      target: href,
      type: 'other',
      reason: 'Target verified',
      line: lineNum
    };
  }

  /**
   * Helper to slugify heading text into anchor name
   * @private
   */
  _slugifyHeader(headerText) {
    return headerText
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }

  /**
   * Exports OpenAPI specification configured for interactive API Playgrounds
   * @param {Object} customOptions Custom options or OpenAPI metadata overrides
   * @returns {Object} OpenAPI JSON Specification object
   */
  exportOpenApiPlaygroundSpecs(customOptions = {}) {
    const title = customOptions.title || 'EAORCS Platform OpenAPI Interactive Playground Spec';
    const description = customOptions.description || 'Enterprise Autonomous Operation & Regulatory Compliance System API Playground Specification.';
    const version = customOptions.version || this.version;
    const apiBase = customOptions.apiBaseUrl || this.apiBaseUrl;

    return {
      openapi: '3.0.3',
      info: {
        title,
        description,
        version,
        termsOfService: `${this.baseUrl}/terms`,
        contact: {
          name: 'Ujomor Systems Engineering & Governance Authority',
          url: `${this.baseUrl}/support`,
          email: 'support@eaorcs.org'
        },
        license: {
          name: 'Commercial / Enterprise License',
          url: `${this.baseUrl}/license`
        }
      },
      servers: [
        {
          url: apiBase,
          description: 'Production API Gateway Server'
        },
        {
          url: 'https://sandbox-api.eaorcs.org/v1',
          description: 'Interactive API Sandbox Environment'
        }
      ],
      paths: {
        '/health': {
          get: {
            summary: 'Subsystem Health Check',
            description: 'Returns real-time health and operational metrics for all EAORCS subsystems.',
            operationId: 'getHealthStatus',
            tags: ['System Operations'],
            responses: {
              '200': {
                description: 'System health report',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/HealthReport' }
                  }
                }
              }
            }
          }
        },
        '/audit/run': {
          post: {
            summary: 'Trigger Compliance Audit',
            description: 'Initiates a compliance audit across specified target modules.',
            operationId: 'runAudit',
            tags: ['Audit Engine'],
            security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AuditRequest' }
                }
              }
            },
            responses: {
              '200': {
                description: 'Audit execution results',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/AuditResult' }
                  }
                }
              }
            }
          }
        },
        '/governance/policies': {
          get: {
            summary: 'List Active Governance Policies',
            description: 'Retrieves all frozen policies enforced by the Policy Engine.',
            operationId: 'listPolicies',
            tags: ['Governance'],
            security: [{ BearerAuth: [] }],
            responses: {
              '200': {
                description: 'Active policy bundle',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/PolicyBundle' }
                  }
                }
              }
            }
          }
        },
        '/evidence/collect': {
          post: {
            summary: 'Harvest Evidence Bundle',
            description: 'Harvests cryptographically signed Level A evidence bundles.',
            operationId: 'collectEvidence',
            tags: ['Compliance & Evidence'],
            security: [{ BearerAuth: [] }],
            responses: {
              '200': {
                description: 'Cryptographically signed evidence bundle',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/EvidenceBundle' }
                  }
                }
              }
            }
          }
        },
        '/identity/verify': {
          post: {
            summary: 'Verify Identity Passport',
            description: 'Verifies the cryptographic signature of an OSAP identity passport.',
            operationId: 'verifyIdentity',
            tags: ['Identity & Trust'],
            security: [{ BearerAuth: [] }],
            responses: {
              '200': {
                description: 'Passport verification report',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/PassportVerification' }
                  }
                }
              }
            }
          }
        }
      },
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'OAuth2 JWT Bearer Token'
          },
          ApiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'X-EAORCS-API-KEY',
            description: 'Enterprise API Key'
          },
          OAuth2: {
            type: 'oauth2',
            description: 'OAuth2 Authorization Code & Client Credentials Flow',
            flows: {
              clientCredentials: {
                tokenUrl: `${apiBase}/oauth/token`,
                scopes: {
                  'audit:read': 'Read audit logs and reports',
                  'audit:write': 'Trigger automated audits',
                  'compliance:admin': 'Manage governance policies'
                }
              }
            }
          }
        },
        schemas: {
          HealthReport: {
            type: 'object',
            properties: {
              status: { type: 'string', example: 'HEALTHY' },
              version: { type: 'string', example: '2026.1.0-LTS' },
              uptimeSeconds: { type: 'number', example: 86400 },
              subsystems: { type: 'object' }
            }
          },
          AuditRequest: {
            type: 'object',
            required: ['targetRepository'],
            properties: {
              targetRepository: { type: 'string', example: 'd:/ujomor-platform/products/eaorcs' },
              strictMode: { type: 'boolean', example: true }
            }
          },
          AuditResult: {
            type: 'object',
            properties: {
              auditId: { type: 'string', example: 'aud-2026-001' },
              score: { type: 'number', example: 100 },
              violations: { type: 'array', items: { type: 'object' } }
            }
          },
          PolicyBundle: {
            type: 'object',
            properties: {
              bundleId: { type: 'string', example: 'pol-bundle-main' },
              rulesCount: { type: 'integer', example: 24 }
            }
          },
          EvidenceBundle: {
            type: 'object',
            properties: {
              hash: { type: 'string', example: 'e3b0c44298fc1c149afbf4c8996fb924' },
              signature: { type: 'string', example: 'sig-ed25519-abc123xyz' }
            }
          },
          PassportVerification: {
            type: 'object',
            properties: {
              valid: { type: 'boolean', example: true },
              passportId: { type: 'string', example: 'pass-2026-lts' }
            }
          }
        }
      },
      'x-playground-config': {
        interactive: true,
        enableTryItOut: true,
        defaultSandboxKey: 'eaorcs_demo_sandbox_key_2026',
        supportedCodeGenerators: ['curl', 'javascript', 'python', 'go', 'java'],
        theme: 'enterprise-slate',
        corsOrigins: ['*']
      }
    };
  }

  /**
   * Alias for exportOpenApiPlaygroundSpecs
   */
  exportOpenApiSpecs(customOptions = {}) {
    return this.exportOpenApiPlaygroundSpecs(customOptions);
  }

  /**
   * Alias for exportOpenApiPlaygroundSpecs
   */
  generateOpenApiPlaygroundSpec(customOptions = {}) {
    return this.exportOpenApiPlaygroundSpecs(customOptions);
  }

  /**
   * Searches knowledge base role bundles for matching query terms
   * @param {string} query Search query string
   * @param {string|null} role Optional role to scope search
   * @returns {Array} List of matching search result objects
   */
  searchKnowledgeBase(query, role = null) {
    if (!query || typeof query !== 'string') return [];
    const term = query.trim().toLowerCase();
    const results = [];

    const targetRoles = role && role !== 'all' ? [normalizeRole(role)] : this.supportedRoles;

    for (const r of targetRoles) {
      const bundle = this._buildSingleRoleBundle(r);
      for (const section of bundle.sections) {
        const titleMatch = section.title.toLowerCase().includes(term);
        const contentMatch = section.content.toLowerCase().includes(term);

        if (titleMatch || contentMatch) {
          results.push({
            role: r,
            sectionId: section.id,
            sectionTitle: section.title,
            matchType: titleMatch ? 'title' : 'content',
            snippet: section.content.substring(0, 150) + '...'
          });
        }
      }
    }

    return results;
  }

  /**
   * Renders role doc bundle into HTML string with styling and navigation
   * @param {string} role Role name
   * @returns {string} Styled HTML document string
   */
  exportBundleAsHtml(role = 'Developers') {
    const bundle = this.generateRoleDocs(role);
    const sectionsHtml = bundle.sections.map(s => `
      <section id="${s.id}">
        <h2>${s.title}</h2>
        <div class="content"><pre>${s.content}</pre></div>
      </section>
    `).join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${bundle.title}</title>
  <style>
    body { font-family: 'Segoe UI', system-ui, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 2rem; }
    h1 { color: #38bdf8; border-bottom: 2px solid #334155; padding-bottom: 0.5rem; }
    h2 { color: #818cf8; }
    a { color: #38bdf8; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .toc { background: #1e293b; padding: 1rem; border-radius: 8px; margin-bottom: 2rem; }
    .content { background: #1e293b; padding: 1rem; border-radius: 8px; margin-top: 0.5rem; }
    pre { white-space: pre-wrap; font-family: monospace; color: #e2e8f0; }
  </style>
</head>
<body>
  <h1>${bundle.title}</h1>
  <p><strong>Persona:</strong> ${bundle.role} | <strong>Version:</strong> ${bundle.version}</p>
  <div class="toc">
    <h3>Table of Contents</h3>
    <ul>
      ${bundle.tableOfContents.map(t => `<li><a href="${t.anchor}">${t.title}</a></li>`).join('')}
    </ul>
  </div>
  ${sectionsHtml}
</body>
</html>`;
  }
}

// Support both commonjs require options
EnterpriseDocPortalEngine.EnterpriseDocPortalEngine = EnterpriseDocPortalEngine;
module.exports = EnterpriseDocPortalEngine;
