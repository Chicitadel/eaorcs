/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Developer Experience Engine & License Guard
 * File           : DeveloperExperienceEngine.js
 * Version        : 2026.3.1-LTS
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
 * CORP: Subsystem 1 — Developer Experience Engine & License Guard
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const EnvironmentDetectionEngine = require('./EnvironmentDetectionEngine');

/**
 * Tier Hierarchy Levels
 */
const TIER_LEVELS = {
  'community': 1,
  'free': 1,
  'developer': 2,
  'pro': 2,
  'enterprise': 3,
  'business': 3,
  'sovereign': 4
};

/**
 * 9 Canonical Environments
 */
const ENVIRONMENTS = [
  'Windows CMD',
  'PowerShell',
  'Git Bash',
  'WSL',
  'Linux',
  'macOS',
  'Docker',
  'Kubernetes',
  'CI/CD'
];

/**
 * Pre-registered Core EAORCS Commands for Search & Guard
 */
const PRE_REGISTERED_COMMANDS = [
  {
    id: 'init',
    name: 'init',
    category: 'Core',
    requiredTier: 'community',
    description: 'Initialize a new EAORCS governance workspace.',
    syntax: 'eaorcs init [options]',
    tags: ['initialize', 'workspace', 'setup', 'start'],
    examples: ['eaorcs init', 'eaorcs init --profile=enterprise']
  },
  {
    id: 'workspace',
    name: 'workspace',
    category: 'Core',
    requiredTier: 'community',
    description: 'Manage and inspect active EAORCS governance workspace configuration.',
    syntax: 'eaorcs workspace [subcommand]',
    tags: ['workspace', 'config', 'inspect', 'status'],
    examples: ['eaorcs workspace status', 'eaorcs workspace list']
  },
  {
    id: 'doctor',
    name: 'doctor',
    category: 'Core',
    requiredTier: 'community',
    description: 'Run diagnostic health checks on EAORCS installation and environmental dependencies.',
    syntax: 'eaorcs doctor',
    tags: ['doctor', 'health', 'diagnostics', 'check'],
    examples: ['eaorcs doctor', 'eaorcs doctor --verbose']
  },
  {
    id: 'explain',
    name: 'explain',
    category: 'Core',
    requiredTier: 'community',
    description: 'Explain governance decisions, architectural rules, and compliance criteria.',
    syntax: 'eaorcs explain <rule-id|command>',
    tags: ['explain', 'governance', 'decision', 'rule', 'help'],
    examples: ['eaorcs explain rule-101', 'eaorcs explain certify']
  },
  {
    id: 'validate',
    name: 'validate',
    category: 'Core',
    requiredTier: 'community',
    description: 'Validate local code artifacts against baseline governance rules.',
    syntax: 'eaorcs validate [path]',
    tags: ['validate', 'lint', 'check', 'schema'],
    examples: ['eaorcs validate .', 'eaorcs validate --json']
  },
  {
    id: 'qualify',
    name: 'qualify',
    category: 'Quality',
    requiredTier: 'pro',
    description: 'Perform automated quality evaluation and benchmark verification across code modules.',
    syntax: 'eaorcs qualify [options]',
    tags: ['qualify', 'quality', 'benchmark', 'metrics'],
    examples: ['eaorcs qualify', 'eaorcs qualify --threshold=95']
  },
  {
    id: 'package',
    name: 'package',
    category: 'Distribution',
    requiredTier: 'pro',
    description: 'Build enterprise distribution artifacts and compliance-ready bundles.',
    syntax: 'eaorcs package [options]',
    tags: ['package', 'build', 'bundle', 'artifact'],
    examples: ['eaorcs package', 'eaorcs package --target=npm']
  },
  {
    id: 'sbom',
    name: 'sbom',
    category: 'Security',
    requiredTier: 'pro',
    description: 'Generate Software Bill of Materials (SBOM) in SPDX and CycloneDX formats.',
    syntax: 'eaorcs sbom generate [options]',
    tags: ['sbom', 'security', 'spdx', 'cyclonedx', 'dependencies'],
    examples: ['eaorcs sbom generate', 'eaorcs sbom generate --format=spdx-json']
  },
  {
    id: 'dashboard',
    name: 'dashboard',
    category: 'Operations',
    requiredTier: 'pro',
    description: 'Launch or connect to interactive governance dashboard UI.',
    syntax: 'eaorcs dashboard [options]',
    tags: ['dashboard', 'ui', 'operations', 'metrics'],
    examples: ['eaorcs dashboard --port=8080']
  },
  {
    id: 'topology',
    name: 'topology',
    category: 'Architecture',
    requiredTier: 'pro',
    description: 'Map architecture component topology and systemic dependency graphs.',
    syntax: 'eaorcs topology map',
    tags: ['topology', 'architecture', 'graph', 'dependencies'],
    examples: ['eaorcs topology map --format=svg']
  },
  {
    id: 'profile',
    name: 'profile',
    category: 'Architecture',
    requiredTier: 'pro',
    description: 'Manage and apply EAORCS system execution and governance profiles.',
    syntax: 'eaorcs profile [list|apply]',
    tags: ['profile', 'configuration', 'environment', 'preset'],
    examples: ['eaorcs profile list', 'eaorcs profile apply production']
  },
  {
    id: 'certify',
    name: 'certify',
    category: 'Governance',
    requiredTier: 'enterprise',
    description: 'Run full enterprise readiness certification suite against SOC 2 and ISO 27001 standards.',
    syntax: 'eaorcs certify [options]',
    tags: ['certify', 'certification', 'compliance', 'enterprise', 'soc2', 'iso27001'],
    examples: ['eaorcs certify', 'eaorcs certify --strict']
  },
  {
    id: 'evidence',
    name: 'evidence',
    category: 'Governance',
    requiredTier: 'enterprise',
    description: 'Generate cryptographically signed audit evidence ledger for regulatory submission.',
    syntax: 'eaorcs evidence generate',
    tags: ['evidence', 'audit', 'crypto', 'ledger', 'signature'],
    examples: ['eaorcs evidence generate --output=evidence.json']
  },
  {
    id: 'release',
    name: 'release',
    category: 'Release',
    requiredTier: 'enterprise',
    description: 'Execute production release pipeline, provenance verification, and freeze enforcement.',
    syntax: 'eaorcs release promote [options]',
    tags: ['release', 'pipeline', 'production', 'provenance', 'freeze'],
    examples: ['eaorcs release promote --env=production']
  },
  {
    id: 'audit',
    name: 'audit',
    category: 'Governance',
    requiredTier: 'enterprise',
    description: 'Perform enterprise-wide governance audit across security, licensing, and architecture.',
    syntax: 'eaorcs audit run',
    tags: ['audit', 'governance', 'enterprise', 'security', 'sarif'],
    examples: ['eaorcs audit run --format=sarif']
  },
  {
    id: 'marketplace',
    name: 'marketplace',
    category: 'Ecosystem',
    requiredTier: 'enterprise',
    description: 'Connect to EAORCS enterprise plugin and governance engine marketplace.',
    syntax: 'eaorcs marketplace [search|install]',
    tags: ['marketplace', 'plugins', 'extensions', 'ecosystem'],
    examples: ['eaorcs marketplace search', 'eaorcs marketplace install security-pack']
  },
  {
    id: 'sovereign-audit',
    name: 'sovereign-audit',
    category: 'Sovereign',
    requiredTier: 'sovereign',
    description: 'Perform air-gapped sovereign compliance verification with hardware HSM validation.',
    syntax: 'eaorcs sovereign-audit',
    tags: ['sovereign', 'airgap', 'hsm', 'classified', 'restricted'],
    examples: ['eaorcs sovereign-audit --hsm-slot=0']
  },
  {
    id: 'airgap-deploy',
    name: 'airgap-deploy',
    category: 'Sovereign',
    requiredTier: 'sovereign',
    description: 'Deploy offline-signed zero-telemetry bundles in completely air-gapped perimeters.',
    syntax: 'eaorcs airgap-deploy <bundle.tar.gz>',
    tags: ['airgap', 'deploy', 'sovereign', 'offline', 'zero-telemetry'],
    examples: ['eaorcs airgap-deploy bundle-v2.tar.gz']
  }
];

class DeveloperExperienceEngine {
  /**
   * @param {Object} [config]
   * @param {string} [config.defaultEnvironment] - One of 9 supported environments
   * @param {string} [config.currentTier='community'] - Active user/org license tier
   * @param {string} [config.upgradeUrl='https://eaorcs.ujomor.com/upgrade'] - Custom upgrade link
   */
  constructor(config = {}) {
    this.defaultEnvironment = this.normalizeEnvironment(config.defaultEnvironment || this._detectHostEnvironment());
    this.currentTier = this.normalizeTier(config.currentTier || 'community');
    this.upgradeUrl = config.upgradeUrl || 'https://eaorcs.ujomor.com/upgrade';

    this.environmentDetectionEngine = new EnvironmentDetectionEngine(config.environmentDetection || {});
    this.commandsIndex = new Map();
    this._initializeCommands();
  }

  /**
   * Normalize input environment string to one of the 9 canonical environments.
   * @param {string} env
   * @returns {string} Canonical environment name
   */
  normalizeEnvironment(env) {
    if (!env || typeof env !== 'string') return 'PowerShell';
    const clean = env.trim().toLowerCase();

    if (clean.includes('cmd') || clean === 'win-cmd' || clean === 'windows') {
      return 'Windows CMD';
    }
    if (clean.includes('pwsh') || clean.includes('powershell') || clean === 'ps') {
      return 'PowerShell';
    }
    if (clean.includes('git') || clean.includes('gitbash') || clean === 'bash-win') {
      return 'Git Bash';
    }
    if (clean.includes('wsl') || clean.includes('subsystem')) {
      return 'WSL';
    }
    if (clean.includes('mac') || clean.includes('darwin') || clean.includes('osx')) {
      return 'macOS';
    }
    if (clean.includes('linux') || clean.includes('ubuntu') || clean.includes('debian') || clean.includes('alpine')) {
      return 'Linux';
    }
    if (clean.includes('docker') || clean.includes('container')) {
      return 'Docker';
    }
    if (clean.includes('k8s') || clean.includes('kube') || clean.includes('kubernetes')) {
      return 'Kubernetes';
    }
    if (clean.includes('ci') || clean.includes('cd') || clean.includes('action') || clean.includes('jenkins') || clean.includes('gitlab')) {
      return 'CI/CD';
    }

    return 'PowerShell';
  }

  /**
   * Normalize tier name.
   * @param {string} tier 
   * @returns {string} Normalized tier
   */
  normalizeTier(tier) {
    if (!tier || typeof tier !== 'string') return 'community';
    const clean = tier.trim().toLowerCase();
    if (TIER_LEVELS[clean]) {
      if (clean === 'free') return 'community';
      if (clean === 'developer') return 'pro';
      if (clean === 'business') return 'enterprise';
      return clean;
    }
    return 'community';
  }

  /**
   * Internal helper to pre-populate default command search index.
   */
  _initializeCommands() {
    PRE_REGISTERED_COMMANDS.forEach(cmd => {
      this.registerCommand(cmd);
    });
  }

  /**
   * Register a new command into the search index.
   * @param {Object} commandDef 
   */
  registerCommand(commandDef) {
    if (!commandDef || !commandDef.name) {
      throw new Error('[DeveloperExperienceEngine] Invalid command definition: name is required');
    }
    const id = commandDef.id || commandDef.name.toLowerCase();
    const entry = {
      id,
      name: commandDef.name,
      category: commandDef.category || 'General',
      requiredTier: this.normalizeTier(commandDef.requiredTier || 'community'),
      description: commandDef.description || `Command ${commandDef.name}`,
      syntax: commandDef.syntax || `eaorcs ${commandDef.name}`,
      tags: Array.isArray(commandDef.tags) ? commandDef.tags : [],
      examples: Array.isArray(commandDef.examples) ? commandDef.examples : [],
      flags: Array.isArray(commandDef.flags) ? commandDef.flags : []
    };
    this.commandsIndex.set(id, entry);
  }

  /**
   * Detect running OS/host environment.
   * @returns {string} Environment name
   */
  _detectHostEnvironment() {
    if (process.platform === 'win32') {
      if (process.env.PSModulePath || process.env.PWSH) return 'PowerShell';
      return 'Windows CMD';
    } else if (process.platform === 'darwin') {
      return 'macOS';
    } else {
      return 'Linux';
    }
  }

  /**
   * Translate file path according to shell/environment syntax.
   * @param {string} filePath 
   * @param {string} targetEnv 
   * @returns {string} Translated path string
   */
  translatePath(filePath, targetEnv) {
    if (!filePath || typeof filePath !== 'string') return '';
    const env = this.normalizeEnvironment(targetEnv || this.defaultEnvironment);

    let normalized = filePath;

    if (env === 'Windows CMD' || env === 'PowerShell') {
      return normalized.replace(/\//g, '\\');
    }

    // POSIX or Unix-like environments (Git Bash, WSL, Linux, macOS, Docker, Kubernetes, CI/CD)
    normalized = normalized.replace(/\\/g, '/');

    if (env === 'Git Bash' && /^[a-zA-Z]:/.test(filePath)) {
      const drive = filePath[0].toLowerCase();
      const rest = normalized.substring(2);
      return `/${drive}${rest}`;
    }

    if (env === 'WSL' && /^[a-zA-Z]:/.test(filePath)) {
      const drive = filePath[0].toLowerCase();
      const rest = normalized.substring(2);
      return `/mnt/${drive}${rest}`;
    }

    return normalized;
  }

  /**
   * Translate environment variable syntax for specified environment.
   * @param {string} key 
   * @param {string} value 
   * @param {string} targetEnv 
   * @returns {string} Formatted env variable string
   */
  translateEnvVar(key, value, targetEnv) {
    const env = this.normalizeEnvironment(targetEnv || this.defaultEnvironment);
    const escapedVal = String(value).replace(/"/g, '\\"');

    switch (env) {
      case 'Windows CMD':
        return `set ${key}=${value}`;
      case 'PowerShell':
        return `$env:${key}="${escapedVal}"`;
      case 'Docker':
        return `-e ${key}="${escapedVal}"`;
      case 'Kubernetes':
        return `--env=${key}="${escapedVal}"`;
      case 'CI/CD':
        return `${key}: "${escapedVal}"`;
      case 'Git Bash':
      case 'WSL':
      case 'Linux':
      case 'macOS':
      default:
        return `export ${key}="${escapedVal}"`;
    }
  }

  /**
   * Chain multiple commands together for target environment.
   * @param {Array<string>} commands 
   * @param {string} targetEnv 
   * @returns {string} Chained command line
   */
  chainCommands(commands, targetEnv) {
    if (!Array.isArray(commands) || commands.length === 0) return '';
    const env = this.normalizeEnvironment(targetEnv || this.defaultEnvironment);

    switch (env) {
      case 'Windows CMD':
        return commands.join(' && ');
      case 'PowerShell':
        return commands.join('; ');
      case 'Docker':
        return `sh -c "${commands.join(' && ').replace(/"/g, '\\"')}"`;
      case 'Kubernetes':
        return `kubectl exec -it pod -- sh -c "${commands.join(' && ').replace(/"/g, '\\"')}"`;
      case 'Git Bash':
      case 'WSL':
      case 'Linux':
      case 'macOS':
      case 'CI/CD':
      default:
        return commands.join(' && ');
    }
  }

  /**
   * Build shell-aware command string across 9 environments.
   * @param {Object} options 
   * @param {string} options.command - Main command or executable
   * @param {Array<string>|Object} [options.args] - Command arguments or flag object
   * @param {Object} [options.envVars] - Key-value environment variables
   * @param {string} [options.cwd] - Working directory path
   * @param {string} [options.targetEnv] - One of 9 target environments
   * @param {boolean} [options.multiline=false] - Format with line continuation
   * @param {string} [options.containerImage] - Container image for Docker
   * @param {string} [options.podName] - Pod name for Kubernetes
   * @param {string} [options.namespace] - Kubernetes namespace
   * @returns {Object} Structured command build result
   */
  buildCommand(options = {}) {
    if (!options || !options.command) {
      throw new Error('[DeveloperExperienceEngine] options.command is required for buildCommand');
    }

    const env = this.normalizeEnvironment(options.targetEnv || this.defaultEnvironment);
    const baseCommand = options.command.trim();

    // Format arguments
    let formattedArgs = [];
    if (Array.isArray(options.args)) {
      formattedArgs = options.args;
    } else if (options.args && typeof options.args === 'object') {
      for (const [k, v] of Object.entries(options.args)) {
        if (v === true) {
          formattedArgs.push(`--${k}`);
        } else if (v !== false && v !== null && v !== undefined) {
          formattedArgs.push(`--${k}="${v}"`);
        }
      }
    }

    const argsStr = formattedArgs.length > 0 ? ' ' + formattedArgs.join(' ') : '';
    let execStr = `${baseCommand}${argsStr}`;

    // Format environment variables
    const envVarStrings = [];
    if (options.envVars && typeof options.envVars === 'object') {
      for (const [k, v] of Object.entries(options.envVars)) {
        envVarStrings.push(this.translateEnvVar(k, v, env));
      }
    }

    // Format working directory
    const formattedCwd = options.cwd ? this.translatePath(options.cwd, env) : null;

    let fullCommand = '';
    let lineContinuation = '\\';
    if (env === 'Windows CMD') lineContinuation = '^';
    if (env === 'PowerShell') lineContinuation = '`';

    // Environment specific assembly logic
    if (env === 'Docker') {
      const img = options.containerImage || 'eaorcs/engine:latest';
      const envFlags = envVarStrings.join(' ');
      const workDirFlag = formattedCwd ? `-w "${formattedCwd}" ` : '';
      const envPrefix = envFlags ? `${envFlags} ` : '';
      fullCommand = `docker run --rm ${workDirFlag}${envPrefix}${img} ${execStr}`;
    } else if (env === 'Kubernetes') {
      const pod = options.podName || 'eaorcs-pod';
      const ns = options.namespace ? `-n ${options.namespace} ` : '';
      const envPrefix = envVarStrings.length > 0 ? `${envVarStrings.join(' ')} ` : '';
      fullCommand = `kubectl exec ${ns}${pod} -- ${envPrefix}${execStr}`;
    } else if (env === 'Windows CMD') {
      const envPrefix = envVarStrings.length > 0 ? envVarStrings.join(' && ') + ' && ' : '';
      const cdPrefix = formattedCwd ? `cd /d "${formattedCwd}" && ` : '';
      fullCommand = `${cdPrefix}${envPrefix}${execStr}`;
    } else if (env === 'PowerShell') {
      const envPrefix = envVarStrings.length > 0 ? envVarStrings.join('; ') + '; ' : '';
      const cdPrefix = formattedCwd ? `Set-Location "${formattedCwd}"; ` : '';
      fullCommand = `${cdPrefix}${envPrefix}${execStr}`;
    } else if (env === 'CI/CD') {
      const cdPrefix = formattedCwd ? `cd "${formattedCwd}" && ` : '';
      fullCommand = `${cdPrefix}${execStr}`;
    } else {
      // Git Bash, WSL, Linux, macOS
      const envPrefix = envVarStrings.length > 0 ? envVarStrings.join(' ') + ' ' : '';
      const cdPrefix = formattedCwd ? `cd "${formattedCwd}" && ` : '';
      fullCommand = `${cdPrefix}${envPrefix}${execStr}`;
    }

    // Multiline formatting
    let multilineCommand = fullCommand;
    if (options.multiline) {
      if (env === 'PowerShell') {
        multilineCommand = fullCommand.replace(/; /g, `; \`\n  `);
      } else if (env === 'Windows CMD') {
        multilineCommand = fullCommand.replace(/ && /g, ` ^\n  && `);
      } else {
        multilineCommand = fullCommand.replace(/ && /g, ` \\\n  && `);
      }
    }

    return {
      targetEnvironment: env,
      executable: baseCommand.split(' ')[0],
      rawCommand: baseCommand,
      fullCommand,
      multilineCommand,
      formattedEnvVars: envVarStrings,
      formattedCwd,
      metadata: {
        envVarCount: envVarStrings.length,
        argCount: formattedArgs.length,
        hasContainerWrapper: env === 'Docker',
        hasKubernetesWrapper: env === 'Kubernetes',
        lineContinuation
      }
    };
  }

  /**
   * Search commands index using fuzzy query matching.
   * @param {string} query 
   * @param {Object} [options]
   * @param {string} [options.tier] - Filter by maximum tier accessibility
   * @param {string} [options.category] - Filter by category
   * @returns {Array<Object>} Sorted matching commands with relevance score
   */
  searchCommands(query, options = {}) {
    const q = (query || '').trim().toLowerCase();
    const targetTierLevel = options.tier ? TIER_LEVELS[this.normalizeTier(options.tier)] : 999;
    const categoryFilter = options.category ? options.category.trim().toLowerCase() : null;

    const results = [];

    for (const cmd of this.commandsIndex.values()) {
      const cmdTierLevel = TIER_LEVELS[cmd.requiredTier] || 1;
      if (cmdTierLevel > targetTierLevel) continue;
      if (categoryFilter && cmd.category.toLowerCase() !== categoryFilter) continue;

      if (!q) {
        results.push({ ...cmd, score: 100 });
        continue;
      }

      let score = 0;
      const name = cmd.name.toLowerCase();
      const cat = cmd.category.toLowerCase();
      const desc = cmd.description.toLowerCase();

      if (name === q) {
        score += 100;
      } else if (name.startsWith(q)) {
        score += 80;
      } else if (name.includes(q)) {
        score += 60;
      }

      if (cmd.tags.some(tag => tag.toLowerCase().includes(q))) {
        score += 40;
      }

      if (cat.includes(q)) {
        score += 30;
      }

      if (desc.includes(q)) {
        score += 20;
      }

      if (score > 0) {
        results.push({ ...cmd, score });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * License-aware command guard: evaluates access for a given command & tier.
   * Formats structured terminal box warning for gated features without stack traces.
   * @param {string} command 
   * @param {string} [currentTier] 
   * @returns {Object} Access evaluation result
   */
  evaluateCommandAccess(command, currentTier) {
    if (!command || typeof command !== 'string') {
      throw new Error('[DeveloperExperienceEngine] command string is required for evaluateCommandAccess');
    }

    const activeTier = this.normalizeTier(currentTier || this.currentTier);
    const userLevel = TIER_LEVELS[activeTier] || 1;

    // Resolve command ID or lookup required tier
    const cleanCmdStr = command.trim().replace(/^eaorcs\s+/, '');
    const mainCmdName = cleanCmdStr.split(' ')[0].toLowerCase();

    let cmdEntry = this.commandsIndex.get(mainCmdName);
    if (!cmdEntry) {
      // Find by partial match if exact key not found
      for (const entry of this.commandsIndex.values()) {
        if (mainCmdName.startsWith(entry.name)) {
          cmdEntry = entry;
          break;
        }
      }
    }

    // Default required tier fallback mapping if unknown command
    let requiredTier = 'community';
    if (cmdEntry) {
      requiredTier = cmdEntry.requiredTier;
    } else {
      if (['qualify', 'package', 'sbom', 'dashboard', 'topology', 'profile'].includes(mainCmdName)) {
        requiredTier = 'pro';
      } else if (['certify', 'evidence', 'release', 'audit', 'marketplace'].includes(mainCmdName)) {
        requiredTier = 'enterprise';
      } else if (['sovereign-audit', 'airgap-deploy', 'hsm-sign'].includes(mainCmdName)) {
        requiredTier = 'sovereign';
      }
    }

    const requiredLevel = TIER_LEVELS[requiredTier] || 1;
    const isAllowed = userLevel >= requiredLevel;

    if (isAllowed) {
      return {
        allowed: true,
        command: mainCmdName,
        currentTier: activeTier,
        requiredTier,
        message: `Access granted for command '${mainCmdName}' on tier '${activeTier.toUpperCase()}'.`,
        warningBox: null
      };
    }

    // Access Denied: Construct structured terminal box warning (NO STACK TRACES!)
    const uppercaseActive = activeTier.toUpperCase();
    const uppercaseReq = requiredTier.toUpperCase();
    const offlineMessage = 'Import offline license file via: eaorcs license import <path-to-license.lic>';

    const warningBox = this._formatTerminalBoxWarning({
      commandName: mainCmdName,
      currentTier: uppercaseActive,
      requiredTier: uppercaseReq,
      upgradeUrl: this.upgradeUrl,
      offlineFallback: offlineMessage
    });

    return {
      allowed: false,
      command: mainCmdName,
      currentTier: activeTier,
      requiredTier,
      warningBox,
      upgradeUrl: this.upgradeUrl,
      offlineFallback: offlineMessage,
      stackTraceIncluded: false
    };
  }

  /**
   * Helper to format a structured ASCII box warning for terminal output.
   * @param {Object} details 
   * @returns {string} Formatted terminal box string
   */
  _formatTerminalBoxWarning(details) {
    const width = 68;
    const borderHorizontal = '='.repeat(width);
    const lineDivider = '-'.repeat(width);

    const centerText = (str) => {
      const pad = Math.max(0, Math.floor((width - str.length) / 2));
      return ' '.repeat(pad) + str;
    };

    const padLine = (label, value) => {
      const line = `  ${label.padEnd(16)}: ${value}`;
      return line.padEnd(width);
    };

    return [
      `+${borderHorizontal}+`,
      `|${centerText('EAORCS LICENSE GUARD WARNING')}${' '.repeat(width - centerText('EAORCS LICENSE GUARD WARNING').length)}|`,
      `+${lineDivider}+`,
      `|${padLine('Gated Feature', details.commandName)}|`,
      `|${padLine('Current Tier', details.currentTier)}|`,
      `|${padLine('Required Tier', details.requiredTier)}|`,
      `|${padLine('Status', 'RESTRICTED — License Upgrade Required')} |`.substring(0, width + 1) + '|',
      `+${lineDivider}+`,
      `|${padLine('Upgrade Action', details.upgradeUrl)}|`,
      `|${padLine('Offline Option', details.offlineFallback)}|`,
      `+${borderHorizontal}+`
    ].join('\n');
  }

  /**
   * Detect running environment and compute capability readiness matrix.
   * @param {string} [workspaceRoot] 
   * @returns {Object} Environment detection result
   */
  detectEnvironment(workspaceRoot) {
    return this.environmentDetectionEngine.detectEnvironment(workspaceRoot);
  }

  /**
   * Generates equivalent shell command variants for specified command across 9 canonical environments.
   * @param {string} cmdStr - Command string (e.g. 'eaorcs qualify --verbose')
   * @param {Object} [options] - Additional build options (args, envVars, cwd, multiline, etc.)
   * @returns {Object} Structured object with equivalent shell commands for all environments
   */
  getEquivalentShellCommands(cmdStr, options = {}) {
    if (!cmdStr || typeof cmdStr !== 'string') {
      throw new Error('[DeveloperExperienceEngine] cmdStr string is required for getEquivalentShellCommands');
    }

    const envDetection = this.detectEnvironment(options.cwd);
    const recTab = envDetection.recommendedEnvironment;

    const environmentsMap = {};
    const canonicalMap = {};

    const envTabMapping = {
      'Windows CMD': 'win_cmd',
      'PowerShell': 'win_powershell',
      'Git Bash': 'git_bash',
      'WSL': 'wsl_ubuntu',
      'Linux': 'linux_bash',
      'macOS': 'macos_zsh',
      'Docker': 'docker_container',
      'Kubernetes': 'kubernetes',
      'CI/CD': 'cicd_runner'
    };

    for (const canonicalEnv of ENVIRONMENTS) {
      const buildRes = this.buildCommand({
        ...options,
        command: cmdStr,
        targetEnv: canonicalEnv
      });
      const tabKey = envTabMapping[canonicalEnv] || canonicalEnv.toLowerCase().replace(/\s+/g, '_');
      environmentsMap[tabKey] = buildRes.fullCommand;
      canonicalMap[canonicalEnv] = buildRes.fullCommand;
    }

    let recommendedCommand = environmentsMap[recTab] || canonicalMap['PowerShell'];

    return {
      inputCommand: cmdStr,
      recommendedEnvironment: recTab,
      recommendedCommand,
      environments: environmentsMap,
      canonicalEnvironments: canonicalMap,
      readinessMatrix: envDetection.readinessMatrix
    };
  }

  /**
   * Returns list of supported environments.
   * @returns {Array<string>} List of 9 environments
   */
  getSupportedEnvironments() {
    return [...ENVIRONMENTS];
  }
}

module.exports = DeveloperExperienceEngine;
