'use strict';

const MarketplaceEngine = require('../../engine/marketplace/MarketplaceEngine');
const { PluginRegistry } = require('../../engine/plugin/PluginRegistry');

async function runMarketplacePurchase() {
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      passed++;
    } else {
      failed++;
      console.error(`  ❌ Assertion failed: ${message}`);
    }
  }

  // Step 1: Instantiate MarketplaceEngine
  let marketplace;
  try {
    marketplace = new MarketplaceEngine();
    assert(marketplace !== null, 'Step 1: MarketplaceEngine instantiated');
  } catch (err) {
    failed++;
    console.error(`  ❌ Step 1 failed: ${err.message}`);
  }

  // Step 2: Query catalog items
  try {
    const catalog = marketplace.getCatalog();
    assert(catalog && catalog.policy_packs.length > 0 && catalog.total_items > 0, 'Step 2: Marketplace catalog returned policy packs');
  } catch (err) {
    failed++;
    console.error(`  ❌ Step 2 failed: ${err.message}`);
  }

  // Step 3: Install artifact via MarketplaceEngine & register plugin via PluginRegistry
  const pluginRegistry = new PluginRegistry();
  const tenantId = 'tenant-mkt-001';
  const itemId = 'pack-iso-27001';

  try {
    const installRecord = marketplace.installArtifact(tenantId, itemId, 'Community');
    assert(installRecord && installRecord.status === 'ACTIVE', 'Step 3a: Marketplace artifact installed successfully');

    const manifest = {
      id: 'plugin-iso-scanner',
      name: 'ISO 27001 Automated Compliance Scanner',
      version: '1.0.0',
      author: 'Ujomor Governance Team',
      signature: 'sig_valid_iso_27001',
      capabilities: ['READ_AUDIT']
    };
    const registeredPlugin = pluginRegistry.registerPlugin(manifest, { onLoad: () => true });
    assert(registeredPlugin && registeredPlugin.status === 'ACTIVE', 'Step 3b: Purchased plugin registered in PluginRegistry');
  } catch (err) {
    failed++;
    console.error(`  ❌ Step 3 failed: ${err.message}`);
  }

  // Step 4: Verify installed items in both MarketplaceEngine and PluginRegistry
  try {
    const installed = marketplace.getInstalledArtifacts(tenantId);
    assert(installed.length === 1 && installed[0].itemId === itemId, 'Step 4a: Installed artifact found in tenant inventory');

    const pluginHandle = pluginRegistry.getPlugin('plugin-iso-scanner');
    assert(pluginHandle !== null && pluginHandle.manifest.name === 'ISO 27001 Automated Compliance Scanner', 'Step 4b: Plugin verified in PluginRegistry');
  } catch (err) {
    failed++;
    console.error(`  ❌ Step 4 failed: ${err.message}`);
  }

  // Step 5: Uninstall / Revoke artifact & unregister plugin
  try {
    const uninstallRes = marketplace.uninstallArtifact(tenantId, itemId);
    assert(uninstallRes && uninstallRes.uninstalled === true, 'Step 5a: Artifact uninstalled from MarketplaceEngine');

    const unregRes = pluginRegistry.unregisterPlugin('plugin-iso-scanner');
    assert(unregRes === true && pluginRegistry.getPlugin('plugin-iso-scanner') === null, 'Step 5b: Plugin unregistered from PluginRegistry');
  } catch (err) {
    failed++;
    console.error(`  ❌ Step 5 failed: ${err.message}`);
  }

  return { passed, failed };
}

module.exports = { runMarketplacePurchase };
