/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Kernel / Plugin Manager
 * File           : PluginManager.js
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

const fs = require('fs');
const path = require('path');

class PluginManager {
  constructor(kernel = null) {
    this.kernel = kernel;
    this.plugins = new Map();
  }

  setKernel(kernel) {
    this.kernel = kernel;
  }

  registerPlugin(plugin) {
    const name = plugin.name || plugin.id;
    if (!name) {
      throw new Error('[PluginManager] Plugin must have a valid name or id property.');
    }

    const pluginEntry = {
      name,
      version: plugin.version || '1.0.0',
      instance: plugin,
      active: false,
      capabilities: plugin.capabilities || []
    };

    this.plugins.set(name, pluginEntry);
    return pluginEntry;
  }

  async activatePlugin(name) {
    if (!this.plugins.has(name)) {
      throw new Error(`[PluginManager] Plugin '${name}' is not registered.`);
    }

    const pluginEntry = this.plugins.get(name);
    if (pluginEntry.active) return pluginEntry;

    if (typeof pluginEntry.instance.activate === 'function') {
      await pluginEntry.instance.activate(this.kernel);
    }

    pluginEntry.active = true;
    return pluginEntry;
  }

  async deactivatePlugin(name) {
    if (!this.plugins.has(name)) return;

    const pluginEntry = this.plugins.get(name);
    if (!pluginEntry.active) return pluginEntry;

    if (typeof pluginEntry.instance.deactivate === 'function') {
      await pluginEntry.instance.deactivate(this.kernel);
    }

    pluginEntry.active = false;
    return pluginEntry;
  }

  getPlugin(name) {
    return this.plugins.get(name);
  }

  listPlugins() {
    return Array.from(this.plugins.values()).map(p => ({
      name: p.name,
      version: p.version,
      active: p.active,
      capabilities: p.capabilities
    }));
  }

  loadPluginsFromDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) return [];

    const files = fs.readdirSync(dirPath);
    const loaded = [];

    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      if (file.endsWith('.js') || file.endsWith('.cjs')) {
        try {
          const PluginClass = require(fullPath);
          const instance = typeof PluginClass === 'function' ? new PluginClass() : PluginClass;
          const entry = this.registerPlugin(instance);
          loaded.push(entry);
        } catch (err) {
          console.error(`[PluginManager] Failed to load plugin from '${fullPath}': ${err.message}`);
        }
      }
    }

    return loaded;
  }
}

module.exports = PluginManager;
