/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Kernel / Plugin Engine Registry
 * File           : PluginEngineRegistry.js
 * Version        : 2026.2-LTS
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : ENTERPRISE | GOVERNMENT
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
 * Copyright (c) 2026 Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

/**
 * PluginEngineRegistry
 * Pluggable engine microkernel architecture enforcing manifest validation,
 * dynamic engine discovery, dependency DAG resolution, permission checks,
 * and sandboxed isolation context.
 */
class PluginEngineRegistry {
  /**
   * Initialize Plugin Engine Registry
   * @param {Object} [options={}] Configuration options
   */
  constructor(options = {}) {
    this.engines = new Map(); // engineId -> EngineRecord
    this.options = {
      strictMode: options.strictMode !== false,
      allowUnsigned: options.allowUnsigned !== false,
      ...options
    };
  }

  /**
   * Validate Engine Manifest structure and types
   * Validates: name, version, dependencies, permissions, events, commands, uiPanels, api, lifecycle, capabilities
   * @param {Object} manifest Engine manifest definition
   * @returns {Object} Clean, normalized manifest object
   */
  validateManifest(manifest) {
    if (!manifest || typeof manifest !== 'object') {
      throw new Error('[PluginEngineRegistry] Invalid manifest: Must be an object.');
    }

    const {
      name,
      version = '1.0.0',
      dependencies = {},
      permissions = [],
      events = [],
      commands = [],
      uiPanels = [],
      api = {},
      lifecycle = {},
      capabilities = []
    } = manifest;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw new Error('[PluginEngineRegistry] Manifest validation error: "name" is required and must be a non-empty string.');
    }

    // Standardize dependencies map
    let normalizedDependencies = {};
    if (Array.isArray(dependencies)) {
      for (const dep of dependencies) {
        if (typeof dep === 'string') {
          normalizedDependencies[dep] = '*';
        } else if (dep && typeof dep === 'object' && dep.name) {
          normalizedDependencies[dep.name] = dep.version || '*';
        }
      }
    } else if (dependencies && typeof dependencies === 'object') {
      normalizedDependencies = { ...dependencies };
    }

    // Standardize collections
    const normalizedPermissions = Array.isArray(permissions) ? [...permissions] : [];
    const normalizedEvents = Array.isArray(events) ? [...events] : [];
    const normalizedCommands = Array.isArray(commands)
      ? [...commands]
      : (typeof commands === 'object' && commands !== null ? Object.keys(commands) : []);
    const normalizedUiPanels = Array.isArray(uiPanels) ? [...uiPanels] : [];
    const normalizedApi = (api && typeof api === 'object') ? { ...api } : {};
    const normalizedLifecycle = (lifecycle && typeof lifecycle === 'object') ? { ...lifecycle } : {};
    const normalizedCapabilities = Array.isArray(capabilities) ? [...capabilities] : [];

    const id = manifest.id || name.trim();

    return {
      id,
      name: name.trim(),
      version: String(version),
      dependencies: normalizedDependencies,
      permissions: normalizedPermissions,
      events: normalizedEvents,
      commands: normalizedCommands,
      uiPanels: normalizedUiPanels,
      api: normalizedApi,
      lifecycle: normalizedLifecycle,
      capabilities: normalizedCapabilities,
      metadata: manifest.metadata || {}
    };
  }

  /**
   * Dynamically register engine with manifest and implementation instance
   * @param {Object} rawManifest 
   * @param {Object} [engineInstance=null] 
   * @returns {Object} Validated engine manifest
   */
  registerEngine(rawManifest, engineInstance = null) {
    const manifest = this.validateManifest(rawManifest);
    const engineId = manifest.id;

    if (this.engines.has(engineId) && this.options.strictMode) {
      // Allow re-registration in non-strict or update record
    }

    const defaultInstance = {
      name: manifest.name,
      init: async () => {},
      boot: async () => {},
      shutdown: async () => {}
    };

    const targetInstance = engineInstance || defaultInstance;
    const sandbox = this.createSandbox(engineId, targetInstance, manifest);

    const record = {
      id: engineId,
      name: manifest.name,
      manifest,
      instance: targetInstance,
      sandbox,
      status: 'REGISTERED',
      registeredAt: new Date().toISOString()
    };

    this.engines.set(engineId, record);
    return manifest;
  }

  /**
   * Unregister engine by ID
   * @param {string} engineId 
   * @returns {boolean} True if removed
   */
  unregisterEngine(engineId) {
    return this.engines.delete(engineId);
  }

  /**
   * Retrieve engine record by ID
   * @param {string} engineId 
   * @returns {Object|null}
   */
  getEngine(engineId) {
    return this.engines.get(engineId) || null;
  }

  /**
   * Retrieve all registered engines
   * @returns {Array<Object>}
   */
  getAllEngines() {
    return Array.from(this.engines.values());
  }

  /**
   * Update engine lifecycle status
   * @param {string} engineId 
   * @param {string} status ('REGISTERED'|'INITIALIZED'|'STARTED'|'STOPPED'|'FAILED'|'UNLOADED')
   */
  setEngineStatus(engineId, status) {
    const record = this.getEngine(engineId);
    if (record) {
      record.status = status;
    }
  }

  /**
   * Resolve dependency DAG (Directed Acyclic Graph) using topological sorting
   * @returns {Array<string>} Engine IDs ordered for initialization/boot
   */
  resolveDependencyDAG() {
    const inDegree = new Map();
    const adjList = new Map();
    const allEngineIds = Array.from(this.engines.keys());

    for (const id of allEngineIds) {
      inDegree.set(id, 0);
      adjList.set(id, []);
    }

    for (const [id, record] of this.engines.entries()) {
      const deps = Object.keys(record.manifest.dependencies || {});
      for (const depId of deps) {
        if (!this.engines.has(depId)) {
          if (this.options.strictMode) {
            throw new Error(`[PluginEngineRegistry] Unsatisfied dependency: Engine '${id}' requires missing engine '${depId}'.`);
          }
          continue;
        }
        adjList.get(depId).push(id);
        inDegree.set(id, (inDegree.get(id) || 0) + 1);
      }
    }

    const queue = [];
    for (const [id, degree] of inDegree.entries()) {
      if (degree === 0) {
        queue.push(id);
      }
    }

    const bootOrder = [];
    while (queue.length > 0) {
      const current = queue.shift();
      bootOrder.push(current);

      const neighbors = adjList.get(current) || [];
      for (const neighbor of neighbors) {
        inDegree.set(neighbor, inDegree.get(neighbor) - 1);
        if (inDegree.get(neighbor) === 0) {
          queue.push(neighbor);
        }
      }
    }

    if (bootOrder.length !== allEngineIds.length) {
      const unresolved = allEngineIds.filter(id => !bootOrder.includes(id));
      throw new Error(`[PluginEngineRegistry] Circular dependency detected in engines: ${unresolved.join(', ')}`);
    }

    return bootOrder;
  }

  /**
   * Verify if an engine holds a specific permission scope
   * @param {string} engineId 
   * @param {string} permissionRequired 
   * @returns {boolean}
   */
  checkPermission(engineId, permissionRequired) {
    const record = this.getEngine(engineId);
    if (!record) return false;

    const permissions = record.manifest.permissions || [];
    if (permissions.includes('*') || permissions.includes('system:admin') || permissions.includes('ALL')) {
      return true;
    }

    return permissions.some(perm => {
      if (perm === permissionRequired) return true;
      if (perm.endsWith('*')) {
        const prefix = perm.slice(0, -1);
        return permissionRequired.startsWith(prefix);
      }
      return false;
    });
  }

  /**
   * Create an isolated sandbox environment around the engine instance
   * @param {string} engineId 
   * @param {Object} engineInstance 
   * @param {Object} manifest 
   * @returns {Object} Sandboxed Proxy instance
   */
  createSandbox(engineId, engineInstance, manifest) {
    const self = this;
    return new Proxy(engineInstance, {
      get(target, prop, receiver) {
        const value = Reflect.get(target, prop, receiver);

        if (typeof value === 'function') {
          return async function (...args) {
            // Permission boundary verification
            if (typeof prop === 'string') {
              if (prop.startsWith('write') || prop.startsWith('mutate') || prop.startsWith('update')) {
                if (!self.checkPermission(engineId, 'WRITE_STATE') &&
                    !self.checkPermission(engineId, 'WRITE_EVIDENCE') &&
                    !self.checkPermission(engineId, 'STATE_MUTATION')) {
                  throw new Error(`[EngineSandbox] Access Denied: Engine '${engineId}' lacks state mutation permission.`);
                }
              } else if (prop.startsWith('execute') || prop.startsWith('dispatch')) {
                if (!self.checkPermission(engineId, 'EXECUTE_COMMAND') &&
                    !self.checkPermission(engineId, 'DISPATCH_COMMAND')) {
                  throw new Error(`[EngineSandbox] Access Denied: Engine '${engineId}' lacks command execution permission.`);
                }
              }
            }

            try {
              return await value.apply(target, args);
            } catch (err) {
              self.setEngineStatus(engineId, 'FAILED');
              throw new Error(`[EngineSandbox] Error in engine '${engineId}' method '${String(prop)}': ${err.message}`);
            }
          };
        }

        return value;
      }
    });
  }
}

module.exports = PluginEngineRegistry;
