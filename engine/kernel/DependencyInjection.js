/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Kernel / Dependency Injection
 * File           : DependencyInjection.js
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

class DependencyInjection {
  constructor() {
    this.services = new Map();
    this.instances = new Map();
    this.resolvingStack = new Set();
  }

  register(name, definition, options = {}) {
    const { singleton = true, dependencies = [] } = options;
    this.services.set(name, {
      name,
      definition,
      singleton,
      dependencies,
      type: typeof definition === 'function' ? 'class_or_factory' : 'instance'
    });
    // Clear cached instance if re-registering
    if (this.instances.has(name)) {
      this.instances.delete(name);
    }
    return this;
  }

  registerInstance(name, instance) {
    this.services.set(name, {
      name,
      definition: instance,
      singleton: true,
      dependencies: [],
      type: 'instance'
    });
    this.instances.set(name, instance);
    return this;
  }

  registerFactory(name, factoryFn, dependencies = []) {
    return this.register(name, factoryFn, { singleton: false, dependencies });
  }

  resolve(name) {
    if (this.instances.has(name)) {
      return this.instances.get(name);
    }

    if (!this.services.has(name)) {
      throw new Error(`[DependencyInjection] Service '${name}' is not registered in the container.`);
    }

    if (this.resolvingStack.has(name)) {
      const cycle = Array.from(this.resolvingStack).concat(name).join(' -> ');
      throw new Error(`[DependencyInjection] Circular dependency detected: ${cycle}`);
    }

    this.resolvingStack.add(name);

    try {
      const serviceObj = this.services.get(name);
      let instance;

      if (serviceObj.type === 'instance') {
        instance = serviceObj.definition;
      } else {
        const resolvedDeps = serviceObj.dependencies.map(dep => this.resolve(dep));
        if (typeof serviceObj.definition === 'function') {
          // Check if it's a constructor class or plain factory function
          const isClass = /^class\s/.test(Function.prototype.toString.call(serviceObj.definition));
          if (isClass) {
            instance = new serviceObj.definition(...resolvedDeps);
          } else {
            instance = serviceObj.definition(...resolvedDeps);
          }
        } else {
          instance = serviceObj.definition;
        }
      }

      if (serviceObj.singleton) {
        this.instances.set(name, instance);
      }

      return instance;
    } finally {
      this.resolvingStack.delete(name);
    }
  }

  has(name) {
    return this.services.has(name) || this.instances.has(name);
  }

  remove(name) {
    this.services.delete(name);
    this.instances.delete(name);
  }

  clear() {
    this.services.clear();
    this.instances.clear();
    this.resolvingStack.clear();
  }

  getRegisteredNames() {
    return Array.from(this.services.keys());
  }
}

module.exports = DependencyInjection;
