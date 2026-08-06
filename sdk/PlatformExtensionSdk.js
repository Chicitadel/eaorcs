/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Platform Extension SDK (@eaorcs/sdk)
 * File           : PlatformExtensionSdk.js
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

const crypto = require('crypto');

const SDK_VERSION = '2026.2.0-LTS';

/**
 * SDK Version Compatibility Check
 * Verifies whether required SDK version is compatible with current SDK runtime.
 *
 * @param {string} requiredVersion - Semver or version string required by extension
 * @param {string} [currentVersion=SDK_VERSION] - Current platform SDK version
 * @returns {Object} Compatibility evaluation result
 */
function checkCompatibility(requiredVersion, currentVersion = SDK_VERSION) {
  if (!requiredVersion) {
    return { compatible: true, currentVersion, requiredVersion: 'ANY', reason: 'No version requirement specified' };
  }

  const parseVer = (v) => {
    const clean = String(v).replace(/^[\^~>=<]+/, '').split('-')[0];
    const parts = clean.split('.').map(n => parseInt(n, 10) || 0);
    return { major: parts[0] || 0, minor: parts[1] || 0, patch: parts[2] || 0 };
  };

  const req = parseVer(requiredVersion);
  const cur = parseVer(currentVersion);

  let compatible = true;
  let reason = 'Compatible';

  if (req.major !== cur.major) {
    compatible = false;
    reason = `Major version mismatch: required ${requiredVersion}, current ${currentVersion}`;
  } else if (req.minor > cur.minor) {
    compatible = false;
    reason = `Minor version too high: required ${requiredVersion}, current ${currentVersion}`;
  }

  return {
    compatible,
    currentVersion,
    requiredVersion,
    reason
  };
}

/**
 * Extension Hooks Manager
 * Manages registration and lifecycle execution of platform extension points.
 */
class ExtensionHooks {
  constructor() {
    this.hooks = new Map();
  }

  /**
   * Register a handler for a given hook event
   */
  registerHook(hookName, handlerFn, options = {}) {
    if (!hookName || typeof hookName !== 'string') {
      throw new Error('Hook name must be a non-empty string');
    }
    if (typeof handlerFn !== 'function') {
      throw new Error('Hook handler must be a function');
    }

    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, []);
    }

    const handlers = this.hooks.get(hookName);
    const priority = typeof options.priority === 'number' ? options.priority : 10;
    const name = options.name || `handler_${handlers.length + 1}`;

    handlers.push({ name, handlerFn, priority });
    handlers.sort((a, b) => a.priority - b.priority);

    return { registered: true, hookName, name, priority };
  }

  /**
   * Trigger a hook and execute all registered handlers in priority order
   */
  async triggerHook(hookName, context = {}) {
    const handlers = this.hooks.get(hookName) || [];
    const results = [];
    let currentContext = { ...context };

    for (const h of handlers) {
      try {
        const result = await h.handlerFn(currentContext);
        if (result && typeof result === 'object') {
          currentContext = { ...currentContext, ...result };
        }
        results.push({ name: h.name, status: 'SUCCESS', result });
      } catch (err) {
        results.push({ name: h.name, status: 'FAILED', error: err.message });
      }
    }

    return {
      hookName,
      executedCount: handlers.length,
      finalContext: currentContext,
      results
    };
  }

  /**
   * List all registered hooks and handler metadata
   */
  listHooks() {
    const list = {};
    for (const [name, handlers] of this.hooks.entries()) {
      list[name] = handlers.map(h => ({ name: h.name, priority: h.priority }));
    }
    return list;
  }

  /**
   * Clear handlers for a specific hook or all hooks
   */
  clearHooks(hookName = null) {
    if (hookName) {
      this.hooks.delete(hookName);
    } else {
      this.hooks.clear();
    }
    return { cleared: true };
  }
}

/**
 * Policy Contract Validator
 * Validates policy contracts supplied by governance packs or custom policy engines.
 */
class PolicyContractValidator {
  static validate(contract) {
    const errors = [];
    const warnings = [];

    if (!contract || typeof contract !== 'object') {
      return { valid: false, errors: ['Contract must be an object'], warnings, canonicalContract: null };
    }

    if (!contract.id || typeof contract.id !== 'string') {
      errors.push('Missing or invalid property: id');
    }
    if (!contract.version) {
      errors.push('Missing property: version');
    }
    if (!Array.isArray(contract.rules)) {
      errors.push('Missing or invalid property: rules (must be an array)');
    } else {
      contract.rules.forEach((rule, idx) => {
        if (!rule.id) errors.push(`Rule at index ${idx} missing id`);
        if (!rule.severity) warnings.push(`Rule [${rule.id || idx}] missing severity (defaulting to WARN)`);
      });
    }

    const validEnforcements = ['BLOCK', 'WARN', 'AUDIT', 'QUARANTINE'];
    const action = contract.enforcementAction || 'BLOCK';
    if (!validEnforcements.includes(action)) {
      warnings.push(`Unknown enforcement action "${action}", using BLOCK`);
    }

    const isValid = errors.length === 0;
    const canonicalContract = isValid ? {
      id: contract.id,
      name: contract.name || contract.id,
      version: contract.version || '1.0.0',
      schemaVersion: contract.schemaVersion || '2026.2.0',
      rules: contract.rules.map(r => ({
        id: r.id,
        name: r.name || r.id,
        severity: r.severity || 'WARN',
        description: r.description || '',
        complianceMappings: r.complianceMappings || []
      })),
      enforcementAction: action,
      checksum: crypto.createHash('sha256').update(JSON.stringify(contract)).digest('hex')
    } : null;

    return {
      valid: isValid,
      errors,
      warnings,
      canonicalContract
    };
  }
}

/**
 * Extension Manifest Builder
 * Fluent API for constructing validated extension package manifests.
 */
class ExtensionManifestBuilder {
  constructor() {
    this.manifest = {
      manifestVersion: '1.0.0',
      name: '',
      version: '1.0.0',
      type: '',
      description: '',
      author: '',
      license: 'Enterprise Commercial',
      supportedSdkVersions: '^2026.2.0-LTS',
      permissions: [],
      dependencies: {},
      hooks: {},
      config: {}
    };
  }

  setName(name) {
    this.manifest.name = name;
    return this;
  }

  setVersion(version) {
    this.manifest.version = version;
    return this;
  }

  setType(type) {
    const validTypes = [
      'governance-pack',
      'report-template',
      'custom-widget',
      'ai-skill',
      'marketplace-package',
      'policy-engine',
      'connector',
      'custom-scoring-algorithm'
    ];
    if (!validTypes.includes(type)) {
      throw new Error(`Invalid extension type "${type}". Allowed types: ${validTypes.join(', ')}`);
    }
    this.manifest.type = type;
    return this;
  }

  setDescription(desc) {
    this.manifest.description = desc;
    return this;
  }

  setAuthor(author) {
    this.manifest.author = author;
    return this;
  }

  setLicense(license) {
    this.manifest.license = license;
    return this;
  }

  setPermissions(perms) {
    this.manifest.permissions = Array.isArray(perms) ? perms : [perms];
    return this;
  }

  addDependency(name, versionRange) {
    this.manifest.dependencies[name] = versionRange;
    return this;
  }

  addHook(hookName, handlerPath) {
    this.manifest.hooks[hookName] = handlerPath;
    return this;
  }

  setConfig(config) {
    this.manifest.config = { ...this.manifest.config, ...config };
    return this;
  }

  build() {
    if (!this.manifest.name) throw new Error('Extension manifest requires a name');
    if (!this.manifest.type) throw new Error('Extension manifest requires a type');
    if (!this.manifest.author) throw new Error('Extension manifest requires an author');

    const sortedKeys = Object.keys(this.manifest).sort();
    const canonicalObj = {};
    for (const k of sortedKeys) {
      canonicalObj[k] = this.manifest[k];
    }

    const canonicalJson = JSON.stringify(canonicalObj);
    const checksum = crypto.createHash('sha256').update(canonicalJson).digest('hex');

    return {
      ...this.manifest,
      checksum,
      createdAt: new Date().toISOString()
    };
  }
}

/**
 * Extension Category Builders
 */
class GovernancePackBuilder {
  constructor(id) {
    this.pack = { id, type: 'governance-pack', name: id, policies: [], frameworks: [], remediations: [] };
  }
  setName(name) { this.pack.name = name; return this; }
  addPolicy(policy) { this.pack.policies.push(policy); return this; }
  addFramework(framework) { this.pack.frameworks.push(framework); return this; }
  addRemediation(remediation) { this.pack.remediations.push(remediation); return this; }
  build() { return { ...this.pack, timestamp: new Date().toISOString() }; }
}

class ReportTemplateBuilder {
  constructor(id) {
    this.template = { id, type: 'report-template', sections: [], layout: 'STANDARD', formats: ['PDF', 'HTML', 'JSON'] };
  }
  addSection(title, binding) { this.template.sections.push({ title, binding }); return this; }
  setLayout(layout) { this.template.layout = layout; return this; }
  build() { return { ...this.template, timestamp: new Date().toISOString() }; }
}

class CustomWidgetBuilder {
  constructor(id) {
    this.widget = { id, type: 'custom-widget', component: '', props: {}, refreshIntervalMs: 5000 };
  }
  setComponent(componentName) { this.widget.component = componentName; return this; }
  setProps(props) { this.widget.props = props; return this; }
  build() { return { ...this.widget, timestamp: new Date().toISOString() }; }
}

class AISkillBuilder {
  constructor(id) {
    this.skill = { id, type: 'ai-skill', promptTemplate: '', tools: [], contextFilters: [] };
  }
  setPromptTemplate(prompt) { this.skill.promptTemplate = prompt; return this; }
  addTool(toolName) { this.skill.tools.push(toolName); return this; }
  build() { return { ...this.skill, timestamp: new Date().toISOString() }; }
}

class MarketplacePackageBuilder {
  constructor(id) {
    this.package = { id, type: 'marketplace-package', pricing: 'FREE', artifacts: [], tags: [] };
  }
  setPricing(pricing) { this.package.pricing = pricing; return this; }
  addArtifact(artifact) { this.package.artifacts.push(artifact); return this; }
  addTag(tag) { this.package.tags.push(tag); return this; }
  build() { return { ...this.package, timestamp: new Date().toISOString() }; }
}

class PolicyEngineBuilder {
  constructor(id) {
    this.engine = { id, type: 'policy-engine', evaluator: null, customRules: [] };
  }
  setEvaluator(fn) { this.engine.evaluator = fn; return this; }
  addRule(rule) { this.engine.customRules.push(rule); return this; }
  build() { return { ...this.engine, timestamp: new Date().toISOString() }; }
}

class ConnectorBuilder {
  constructor(id) {
    this.connector = { id, type: 'connector', authType: 'API_KEY', endpoints: {} };
  }
  setAuthType(type) { this.connector.authType = type; return this; }
  addEndpoint(key, url) { this.connector.endpoints[key] = url; return this; }
  build() { return { ...this.connector, timestamp: new Date().toISOString() }; }
}

class CustomScoringAlgorithmBuilder {
  constructor(id) {
    this.algo = { id, type: 'custom-scoring-algorithm', metrics: [], formula: 'WEIGHTED_AVERAGE' };
  }
  addMetric(name, weight) { this.algo.metrics.push({ name, weight }); return this; }
  setFormula(formula) { this.algo.formula = formula; return this; }
  build() { return { ...this.algo, timestamp: new Date().toISOString() }; }
}

/**
 * Platform Extension SDK Main Class (@eaorcs/sdk)
 */
class PlatformExtensionSdk {
  constructor(config = {}) {
    this.config = config;
    this.hooks = new ExtensionHooks();
    this.version = SDK_VERSION;
  }

  static checkCompatibility(requiredVersion, currentVersion = SDK_VERSION) {
    return checkCompatibility(requiredVersion, currentVersion);
  }

  static validatePolicyContract(contract) {
    return PolicyContractValidator.validate(contract);
  }

  static createManifestBuilder() {
    return new ExtensionManifestBuilder();
  }

  createGovernancePack(id) { return new GovernancePackBuilder(id); }
  createReportTemplate(id) { return new ReportTemplateBuilder(id); }
  createCustomWidget(id) { return new CustomWidgetBuilder(id); }
  createAISkill(id) { return new AISkillBuilder(id); }
  createMarketplacePackage(id) { return new MarketplacePackageBuilder(id); }
  createPolicyEngine(id) { return new PolicyEngineBuilder(id); }
  createConnector(id) { return new ConnectorBuilder(id); }
  createCustomScoringAlgorithm(id) { return new CustomScoringAlgorithmBuilder(id); }
}

module.exports = {
  PlatformExtensionSdk,
  SDK_VERSION,
  checkCompatibility,
  ExtensionHooks,
  PolicyContractValidator,
  ExtensionManifestBuilder,
  GovernancePackBuilder,
  ReportTemplateBuilder,
  CustomWidgetBuilder,
  AISkillBuilder,
  MarketplacePackageBuilder,
  PolicyEngineBuilder,
  ConnectorBuilder,
  CustomScoringAlgorithmBuilder
};
