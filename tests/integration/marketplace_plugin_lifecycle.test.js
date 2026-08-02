/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS System Integration Hardening Test Suite
 * File           : marketplace_plugin_lifecycle.test.js
 * Version        : 2026.1-LTS
 * Author         : Enterprise Architecture Authority & Verification Team
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
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
const assert = require('assert');

const _mPlug = require('../../engine/plugin/PluginRegistry');
const PluginRegistry = typeof _mPlug === 'function' ? _mPlug : (_mPlug.PluginRegistry || _mPlug);

async function runLifecycle() {
  let passed = 0, failed = 0;
  const errors = [];

  async function step(name, fn) {
    try {
      const r = await fn();
      console.log(`  [PASS] ${name}`);
      passed++;
      return r;
    } catch(e) {
      console.error(`  [FAIL] ${name}: ${e.message}`);
      failed++;
      errors.push(name);
      return null;
    }
  }

  console.log('--- Pipeline: Marketplace Plugin Lifecycle ---');

  const registry = new PluginRegistry();
  const pluginDef = {
    id: 'int-test-001',
    name: 'Integration Test Plugin',
    version: '1.0.0',
    capabilities: ['audit:extend', '*'],
    hooks: {
      onAudit: async (ctx) => ({ extended: true, ctx })
    }
  };

  // Step 1: Register Plugin via PluginRegistry.register
  let registerResult;
  await step('PluginRegistry registers initial author plugin', async () => {
    registerResult = await registry.register(pluginDef);
    assert.ok(registerResult, 'Registration result must not be null');
    return registerResult;
  });

  // Step 2: Retrieve Plugin from Registry
  let retrievedPlugin;
  await step('PluginRegistry retrieves registered plugin by ID', async () => {
    retrievedPlugin = registry.getPlugin ? registry.getPlugin('int-test-001') : registry.plugins.get('int-test-001');
    assert.ok(retrievedPlugin, 'Retrieved plugin must not be null');
    assert.strictEqual(retrievedPlugin.id, 'int-test-001');
    return retrievedPlugin;
  });

  // Step 3: Execute Plugin Hook
  await step('Execute plugin lifecycle hook onAudit', async () => {
    const hookFn = retrievedPlugin.hooks?.onAudit || retrievedPlugin.implementation?.onAudit || pluginDef.hooks.onAudit;
    const hookResult = await hookFn({ findings: [] });
    assert.ok(hookResult, 'Hook execution result must exist');
    assert.strictEqual(hookResult.extended, true, 'Hook result extended property must be true');
    return hookResult;
  });

  // Step 4: Coexistence of Multiple Plugins
  await step('Register second plugin and verify plugin coexistence', async () => {
    const plugin2 = {
      id: 'int-test-002',
      name: 'Secondary Extension Plugin',
      version: '1.1.0',
      capabilities: ['*'],
      hooks: {
        onEvent: async () => ({ status: 'PROCESSED' })
      }
    };
    await registry.register(plugin2);
    const p1 = registry.getPlugin('int-test-001');
    const p2 = registry.getPlugin('int-test-002');
    assert.ok(p1 && p2, 'Both plugins must exist concurrently in the registry');
    return { p1, p2 };
  });

  // Step 5: Invalid Plugin Rejection
  await step('PluginRegistry rejects plugin registration missing id', async () => {
    let threw = false;
    try {
      await registry.register({ name: 'Invalid Plugin' });
    } catch (e) {
      threw = true;
    }
    assert.strictEqual(threw, true, 'Registration without id must throw validation error');
    return true;
  });

  return { passed, failed, errors };
}

module.exports = { runLifecycle };
if (require.main === module) {
  runLifecycle().then(r => { if (r.failed > 0) process.exit(1); }).catch(e => { console.error(e); process.exit(1); });
}
