/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Marketplace Plugin Ecosystem Sandbox Engine
 * File           : PluginEcosystemSandbox.js
 * Version        : 2026.1.0-LTS
 * Author         : Ujomor Systems & Enterprise Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : GOVERNMENT | ENTERPRISE | MARKETPLACE SECURITY
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
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const vm = require('vm');
const path = require('path');
const crypto = require('crypto');

class PluginEcosystemSandbox {
  constructor(options = {}) {
    this.options = options;
    this.descriptors = new Map();
    this.sandboxes = new Map();
    this.violations = [];
  }

  /**
   * Record a capability/security violation
   */
  _recordViolation(pluginId, hookName, type, message, detail = {}) {
    const violation = {
      id: `viol_${crypto.randomBytes(6).toString('hex')}`,
      pluginId,
      hookName: hookName || 'unknown',
      type, // 'NETWORK_VIOLATION', 'FS_VIOLATION', 'EXECUTION_VIOLATION', 'RESOURCE_EXHAUSTION'
      message,
      detail,
      timestamp: new Date().toISOString()
    };
    this.violations.push(violation);
    return violation;
  }

  /**
   * Registers a third-party marketplace plugin descriptor manifest
   * @param {Object} pluginManifest Manifest object defining plugin identity, hooks & capabilities
   */
  registerPluginDescriptor(pluginManifest) {
    if (!pluginManifest || typeof pluginManifest !== 'object') {
      throw new Error('Invalid plugin descriptor: Manifest must be an object');
    }

    const { id, name, version, publisher, hooks } = pluginManifest;
    if (!id || typeof id !== 'string') {
      throw new Error('Plugin descriptor missing required string field: "id"');
    }
    if (!name || typeof name !== 'string') {
      throw new Error('Plugin descriptor missing required string field: "name"');
    }
    if (!version || typeof version !== 'string') {
      throw new Error('Plugin descriptor missing required string field: "version"');
    }
    if (!hooks || typeof hooks !== 'object') {
      throw new Error('Plugin descriptor missing required object field: "hooks"');
    }

    const descriptor = {
      id,
      name,
      version,
      publisher: publisher || 'Unknown Publisher',
      declaredPermissions: pluginManifest.declaredPermissions || pluginManifest.capabilities || {},
      hooks,
      registeredAt: new Date().toISOString(),
      checksum: pluginManifest.checksum || crypto.createHash('sha256').update(JSON.stringify(hooks)).digest('hex')
    };

    this.descriptors.set(id, descriptor);

    return {
      registered: true,
      pluginId: id,
      name,
      version,
      hooksCount: Object.keys(hooks).length,
      status: 'ACTIVE'
    };
  }

  /**
   * Creates an isolated VM sandbox context for a registered plugin with capability permissions
   * @param {string} pluginId Registered plugin ID
   * @param {Object} permissions Capability permissions override
   */
  createPluginSandbox(pluginId, permissions = {}) {
    const descriptor = this.descriptors.get(pluginId);
    if (!descriptor) {
      throw new Error(`Cannot create sandbox: Plugin "${pluginId}" is not registered`);
    }

    // Capability resolution
    const effectiveCapabilities = {
      network: {
        allow: permissions.network?.allow ?? descriptor.declaredPermissions.network?.allow ?? false,
        allowedDomains: permissions.network?.allowedDomains ?? descriptor.declaredPermissions.network?.allowedDomains ?? []
      },
      fs: {
        allow: permissions.fs?.allow ?? descriptor.declaredPermissions.fs?.allow ?? false,
        allowedPaths: (permissions.fs?.allowedPaths ?? descriptor.declaredPermissions.fs?.allowedPaths ?? []).map(p => path.normalize(p)),
        readOnly: permissions.fs?.readOnly ?? descriptor.declaredPermissions.fs?.readOnly ?? true
      },
      execution: {
        maxExecutionTimeMs: permissions.execution?.maxExecutionTimeMs ?? descriptor.declaredPermissions.execution?.maxExecutionTimeMs ?? 2000,
        allowChildProcess: permissions.execution?.allowChildProcess ?? descriptor.declaredPermissions.execution?.allowChildProcess ?? false
      },
      memory: {
        maxHeapMb: permissions.memory?.maxHeapMb ?? descriptor.declaredPermissions.memory?.maxHeapMb ?? 50
      }
    };

    const logs = [];

    // Proxy APIs for VM sandbox
    const sandboxApi = {
      // Network Proxy
      fetch: (url, opts = {}) => {
        let parsedUrl;
        try {
          parsedUrl = new URL(url);
        } catch (e) {
          const viol = this._recordViolation(pluginId, null, 'NETWORK_VIOLATION', `Invalid URL attempted: ${url}`);
          throw new Error(`Sandbox Network Error: Invalid URL (${url})`);
        }

        if (!effectiveCapabilities.network.allow) {
          const viol = this._recordViolation(pluginId, null, 'NETWORK_VIOLATION', `Network access denied by plugin sandbox permissions`, { url, domain: parsedUrl.hostname });
          throw new Error(`Sandbox Capability Error: Network access prohibited for plugin "${pluginId}"`);
        }

        const isAllowedDomain = effectiveCapabilities.network.allowedDomains.some(domain => {
          return domain === '*' || parsedUrl.hostname === domain || parsedUrl.hostname.endsWith(`.${domain}`);
        });

        if (!isAllowedDomain) {
          const viol = this._recordViolation(pluginId, null, 'NETWORK_VIOLATION', `Network request to unapproved domain: ${parsedUrl.hostname}`, { url, domain: parsedUrl.hostname });
          throw new Error(`Sandbox Capability Error: Access to domain "${parsedUrl.hostname}" denied`);
        }

        return {
          status: 200,
          ok: true,
          json: async () => ({ status: 'mock_sandbox_response', domain: parsedUrl.hostname })
        };
      },

      // File System Proxy
      readFile: (targetPath) => {
        const normalized = path.normalize(targetPath);
        if (!effectiveCapabilities.fs.allow) {
          const viol = this._recordViolation(pluginId, null, 'FS_VIOLATION', `File system read denied by plugin sandbox permissions`, { path: normalized });
          throw new Error(`Sandbox Capability Error: FS access prohibited for plugin "${pluginId}"`);
        }

        const isAllowedPath = effectiveCapabilities.fs.allowedPaths.some(allowed => normalized.startsWith(allowed));
        if (!isAllowedPath) {
          const viol = this._recordViolation(pluginId, null, 'FS_VIOLATION', `File read outside allowed path: ${normalized}`, { path: normalized });
          throw new Error(`Sandbox Capability Error: File access to "${normalized}" denied`);
        }

        return `[Mock Content for ${normalized}]`;
      },

      writeFile: (targetPath, content) => {
        const normalized = path.normalize(targetPath);
        if (!effectiveCapabilities.fs.allow) {
          const viol = this._recordViolation(pluginId, null, 'FS_VIOLATION', `File system write denied by plugin sandbox permissions`, { path: normalized });
          throw new Error(`Sandbox Capability Error: FS access prohibited for plugin "${pluginId}"`);
        }

        if (effectiveCapabilities.fs.readOnly) {
          const viol = this._recordViolation(pluginId, null, 'FS_VIOLATION', `File write denied on read-only sandbox storage`, { path: normalized });
          throw new Error(`Sandbox Capability Error: File system is read-only for plugin "${pluginId}"`);
        }

        const isAllowedPath = effectiveCapabilities.fs.allowedPaths.some(allowed => normalized.startsWith(allowed));
        if (!isAllowedPath) {
          const viol = this._recordViolation(pluginId, null, 'FS_VIOLATION', `File write outside allowed path: ${normalized}`, { path: normalized });
          throw new Error(`Sandbox Capability Error: File write access to "${normalized}" denied`);
        }

        return true;
      },

      // Execution Proxy
      exec: (command) => {
        if (!effectiveCapabilities.execution.allowChildProcess) {
          const viol = this._recordViolation(pluginId, null, 'EXECUTION_VIOLATION', `Child process execution denied by sandbox permissions`, { command });
          throw new Error(`Sandbox Capability Error: Child process execution prohibited for plugin "${pluginId}"`);
        }
        return { stdout: `[Executed: ${command}]`, stderr: '', exitCode: 0 };
      },

      // Memory Allocation Proxy
      allocateMemory: (requestedMb) => {
        if (requestedMb > effectiveCapabilities.memory.maxHeapMb) {
          const viol = this._recordViolation(pluginId, null, 'RESOURCE_EXHAUSTION', `Memory allocation of ${requestedMb}MB exceeds maximum cap of ${effectiveCapabilities.memory.maxHeapMb}MB`);
          throw new Error(`Sandbox Resource Limit Error: Memory allocation requested (${requestedMb}MB) exceeds cap (${effectiveCapabilities.memory.maxHeapMb}MB)`);
        }
        return { allocatedMb: requestedMb, status: 'OK' };
      }
    };

    const sandboxGlobals = {
      console: {
        log: (...args) => logs.push({ level: 'LOG', text: args.join(' ') }),
        error: (...args) => logs.push({ level: 'ERROR', text: args.join(' ') }),
        warn: (...args) => logs.push({ level: 'WARN', text: args.join(' ') })
      },
      sandboxApi,
      JSON,
      Math,
      Date,
      Buffer,
      Array,
      Object,
      String,
      Number,
      Boolean,
      RegExp,
      Error,
      setTimeout: () => {},
      clearTimeout: () => {}
    };

    const context = vm.createContext(sandboxGlobals);

    const sandboxEntry = {
      pluginId,
      context,
      permissions: effectiveCapabilities,
      logs,
      createdAt: new Date().toISOString()
    };

    this.sandboxes.set(pluginId, sandboxEntry);

    return {
      sandboxId: pluginId,
      initialized: true,
      effectiveCapabilities
    };
  }

  /**
   * Safely executes a registered plugin hook inside its isolated sandbox
   * @param {string} pluginId Registered plugin ID
   * @param {string} hookName Name of hook declared in manifest
   * @param {Object} payload Input payload for hook execution
   */
  executePluginHook(pluginId, hookName, payload = {}) {
    const startTime = Date.now();

    const descriptor = this.descriptors.get(pluginId);
    if (!descriptor) {
      return {
        success: false,
        pluginId,
        hookName,
        error: `Plugin "${pluginId}" is not registered`
      };
    }

    let sandboxEntry = this.sandboxes.get(pluginId);
    if (!sandboxEntry) {
      this.createPluginSandbox(pluginId);
      sandboxEntry = this.sandboxes.get(pluginId);
    }

    const hookCode = descriptor.hooks[hookName];
    if (!hookCode) {
      return {
        success: false,
        pluginId,
        hookName,
        error: `Hook "${hookName}" is not defined on plugin "${pluginId}"`
      };
    }

    const maxTimeout = sandboxEntry.permissions.execution.maxExecutionTimeMs;

    try {
      let scriptCode;
      if (typeof hookCode === 'function') {
        scriptCode = `(${hookCode.toString()})(payload, sandboxApi)`;
      } else if (typeof hookCode === 'string') {
        scriptCode = hookCode.trim();
        if (!scriptCode.includes('payload') && !scriptCode.includes('sandboxApi')) {
          scriptCode = `(function(payload, sandboxApi) { ${scriptCode} })(payload, sandboxApi)`;
        }
      } else {
        throw new Error(`Unsupported hook format for "${hookName}"`);
      }

      // Bind payload into context
      sandboxEntry.context.payload = payload;

      const result = vm.runInContext(scriptCode, sandboxEntry.context, {
        timeout: maxTimeout,
        displayErrors: true
      });

      const durationMs = Date.now() - startTime;

      return {
        success: true,
        pluginId,
        hookName,
        durationMs,
        result
      };
    } catch (err) {
      const durationMs = Date.now() - startTime;

      // Handle timeout error specifically
      let violation;
      if (err.code === 'ERR_SCRIPT_EXECUTION_TIMEOUT' || err.message.includes('timed out')) {
        violation = this._recordViolation(
          pluginId,
          hookName,
          'RESOURCE_EXHAUSTION',
          `Plugin execution timed out after ${maxTimeout}ms`,
          { timeoutMs: maxTimeout }
        );
      } else {
        // Find if a violation was recorded during sandboxApi proxy call
        const recentViolations = this.violations.filter(v => v.pluginId === pluginId);
        violation = recentViolations[recentViolations.length - 1];
      }

      return {
        success: false,
        pluginId,
        hookName,
        durationMs,
        error: err.message,
        violation: violation || null
      };
    }
  }

  /**
   * Retrieves all recorded sandbox security violations (or filtered by pluginId)
   * @param {string|null} pluginId Optional plugin ID filter
   */
  getSandboxViolations(pluginId = null) {
    if (pluginId) {
      return this.violations.filter(v => v.pluginId === pluginId);
    }
    return [...this.violations];
  }

  /**
   * Resets or clears stored violations
   */
  clearViolations() {
    this.violations = [];
  }
}

module.exports = PluginEcosystemSandbox;
