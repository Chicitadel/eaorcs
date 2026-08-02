/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Kernel / Module Registry
 * File           : ModuleRegistry.js
 * Version        : 2026.1.0-LTS
 * Author         : Ujomor Engineering & Governance Authority
 * Organization   : Ujomor Systems
 * Created Date   : 2026-08-01
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
 * Copyright (c) 2026 Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

class ModuleRegistry {
  constructor() {
    this.modules = new Map();
    this.initializedModules = new Set();
  }

  register(moduleName, moduleDefinition) {
    if (!moduleName || typeof moduleName !== 'string') {
      throw new Error('[ModuleRegistry] Module name must be a non-empty string.');
    }

    const mod = {
      name: moduleName,
      definition: moduleDefinition,
      enabled: true,
      dependencies: moduleDefinition.dependencies || [],
      version: moduleDefinition.version || '1.0.0',
      instance: null
    };

    this.modules.set(moduleName, mod);
    return this;
  }

  get(moduleName) {
    return this.modules.get(moduleName);
  }

  has(moduleName) {
    return this.modules.has(moduleName);
  }

  getAll() {
    return Array.from(this.modules.values());
  }

  enable(moduleName) {
    if (this.modules.has(moduleName)) {
      this.modules.get(moduleName).enabled = true;
    }
  }

  disable(moduleName) {
    if (this.modules.has(moduleName)) {
      this.modules.get(moduleName).enabled = false;
    }
  }

  isInitialized(moduleName) {
    return this.initializedModules.has(moduleName);
  }

  async initializeAll(kernel) {
    const modulesToInit = Array.from(this.modules.values()).filter(m => m.enabled);
    const sorted = this._topologicalSort(modulesToInit);

    for (const mod of sorted) {
      if (!this.initializedModules.has(mod.name)) {
        if (typeof mod.definition.init === 'function') {
          mod.instance = await mod.definition.init(kernel);
        } else if (typeof mod.definition === 'function') {
          mod.instance = await mod.definition(kernel);
        } else {
          mod.instance = mod.definition;
        }
        this.initializedModules.add(mod.name);
      }
    }

    return Array.from(this.initializedModules);
  }

  _topologicalSort(moduleList) {
    const sorted = [];
    const visited = new Set();
    const visiting = new Set();
    const modMap = new Map(moduleList.map(m => [m.name, m]));

    const visit = (mod) => {
      if (visited.has(mod.name)) return;
      if (visiting.has(mod.name)) {
        throw new Error(`[ModuleRegistry] Circular module dependency detected involving '${mod.name}'.`);
      }

      visiting.add(mod.name);
      for (const depName of mod.dependencies) {
        if (modMap.has(depName)) {
          visit(modMap.get(depName));
        }
      }
      visiting.delete(mod.name);
      visited.add(mod.name);
      sorted.push(mod);
    };

    for (const mod of moduleList) {
      if (!visited.has(mod.name)) {
        visit(mod);
      }
    }

    return sorted;
  }
}

module.exports = ModuleRegistry;
