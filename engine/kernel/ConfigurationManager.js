/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Kernel / Configuration Manager
 * File           : ConfigurationManager.js
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

class ConfigurationManager {
  constructor(initialConfig = {}) {
    this.config = {};
    this.frozen = false;
    this.merge(initialConfig);
  }

  merge(configObj = {}) {
    if (this.frozen) {
      throw new Error('[ConfigurationManager] Configuration is frozen and cannot be modified.');
    }
    this.config = this._deepMerge(this.config, configObj);
    return this;
  }

  loadFromFile(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`[ConfigurationManager] Config file not found: ${filePath}`);
    }
    const content = fs.readFileSync(filePath, 'utf8');
    let parsed = {};
    if (filePath.endsWith('.json')) {
      parsed = JSON.parse(content);
    } else if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) {
      // Basic fallback yaml parser or JSON fallback
      parsed = this._parseYamlSimple(content);
    }
    return this.merge(parsed);
  }

  get(keyPath, defaultValue = undefined) {
    if (!keyPath) return this.config;
    const parts = keyPath.split('.');
    let current = this.config;

    for (const part of parts) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return defaultValue;
      }
      current = current[part];
    }

    return current !== undefined ? current : defaultValue;
  }

  set(keyPath, value) {
    if (this.frozen) {
      throw new Error('[ConfigurationManager] Configuration is frozen and cannot be modified.');
    }
    const parts = keyPath.split('.');
    let current = this.config;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current) || typeof current[part] !== 'object') {
        current[part] = {};
      }
      current = current[part];
    }

    current[parts[parts.length - 1]] = value;
    return this;
  }

  has(keyPath) {
    return this.get(keyPath, undefined) !== undefined;
  }

  freeze() {
    this.frozen = true;
    Object.freeze(this.config);
    return this;
  }

  isFrozen() {
    return this.frozen;
  }

  toObject() {
    return JSON.parse(JSON.stringify(this.config));
  }

  _deepMerge(target, source) {
    const output = Object.assign({}, target);
    if (this._isObject(target) && this._isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this._isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = this._deepMerge(target[key], source[key]);
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    return output;
  }

  _isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  _parseYamlSimple(content) {
    const result = {};
    const lines = content.split('\n');
    let currentSection = null;

    for (let line of lines) {
      line = line.trim();
      if (!line || line.startsWith('#')) continue;

      if (line.includes(':')) {
        const [key, val] = line.split(':').map(s => s.trim());
        if (val) {
          result[key] = val.replace(/^["']|["']$/g, '');
        } else {
          currentSection = key;
          result[currentSection] = result[currentSection] || {};
        }
      }
    }
    return result;
  }
}

module.exports = ConfigurationManager;
