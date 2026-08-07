/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS CLI Command Registry
 * File           : CLICommandRegistryEngine.js
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
 * CORP: Stream S10
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

const STANDARD_FLAGS = [
  { name: 'json', short: 'j', description: 'Output as JSON', type: 'boolean', default: false },
  { name: 'yaml', short: 'y', description: 'Output as YAML', type: 'boolean', default: false },
  { name: 'verbose', short: 'v', description: 'Enable verbose output', type: 'boolean', default: false },
  { name: 'quiet', short: 'q', description: 'Suppress output', type: 'boolean', default: false },
  { name: 'profile', short: 'p', description: 'Use specific profile', type: 'string', default: 'default' },
  { name: 'ci', short: '', description: 'Run in CI mode', type: 'boolean', default: false },
  { name: 'dry-run', short: 'd', description: 'Simulate without making changes', type: 'boolean', default: false },
  { name: 'explain', short: 'e', description: 'Explain actions without running', type: 'boolean', default: false }
];

const PRE_REGISTERED = [
  'workspace', 'init', 'qualify', 'certify', 'evidence', 'release', 
  'package', 'sbom', 'dashboard', 'topology', 'profile', 'audit', 
  'doctor', 'validate', 'marketplace', 'explain'
];

class CLICommandRegistryEngine {
  constructor() {
    this.commands = new Map();
    this.aliases = new Map();
    this._preRegisterCommands();
  }

  _preRegisterCommands() {
    PRE_REGISTERED.forEach(cmd => {
      this.registerCommand(cmd, {
        name: cmd,
        description: `Standard ${cmd} command`,
        aliases: [cmd.substring(0, 3)],
        flags: [],
        handler: async () => {}
      });
    });
  }

  registerCommand(commandId, config) {
    const flags = [...(config.flags || []), ...STANDARD_FLAGS];
    const cmd = { ...config, flags, id: commandId };
    this.commands.set(commandId, cmd);
    
    if (config.aliases) {
      config.aliases.forEach(alias => {
        this.aliases.set(alias, commandId);
      });
    }
  }

  resolveCommand(input) {
    if (this.commands.has(input)) {
      return this.commands.get(input);
    }
    const id = this.aliases.get(input);
    if (id && this.commands.has(id)) {
      return this.commands.get(id);
    }
    return null;
  }

  getOutputFormatter(outputMode) {
    return (data) => this.formatOutput(data, outputMode);
  }

  formatOutput(data, outputMode) {
    if (outputMode === 'quiet') return '';
    if (outputMode === 'json') return JSON.stringify(data, null, 2);
    if (outputMode === 'yaml') {
      let out = '';
      for (const [k, v] of Object.entries(data)) {
        if (typeof v === 'object') {
          out += `${k}:\n  ${JSON.stringify(v)}\n`;
        } else {
          out += `${k}: ${v}\n`;
        }
      }
      return out.trim();
    }
    return String(data);
  }

  validateFlags(commandId, flags) {
    const cmd = this.commands.get(commandId);
    if (!cmd) return { valid: false, errors: ['Command not found'] };

    const errors = [];
    // Basic stub for validation
    return { valid: errors.length === 0, errors };
  }

  generateHelp(commandId) {
    const cmd = this.commands.get(commandId);
    if (!cmd) return 'Command not found';

    let help = `Command: ${cmd.name}\nDescription: ${cmd.description}\n\nFlags:\n`;
    cmd.flags.forEach(f => {
      help += `  --${f.name}${f.short ? `, -${f.short}` : ''}\t${f.description}\n`;
    });
    return help;
  }

  listCommands() {
    return Array.from(this.commands.values());
  }
}

module.exports = CLICommandRegistryEngine;
