/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Kernel / Central Container
 * File           : Kernel.js
 * Version        : 2026.2-LTS (v1.1.0-FROZEN Master Specification)
 * Author         : Ujomor Engineering Governance Authority
 * Organization   : Ujomor Systems
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-02
 * Classification : ENTERPRISE | GOVERNMENT
 *
 * Governance:
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 * - EDH Hypervisor & VFS Lifecycle Integrated
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

const DependencyInjection = require('./DependencyInjection');
const EventBus = require('./EventBus');
const ModuleRegistry = require('./ModuleRegistry');
const CapabilityRegistry = require('./CapabilityRegistry');
const ConfigurationManager = require('./ConfigurationManager');
const LifecycleManager = require('./LifecycleManager');
const FeatureFlags = require('./FeatureFlags');
const PluginManager = require('./PluginManager');
const ServiceLocator = require('./ServiceLocator');
const EdhHypervisorEngine = require('../hypervisor/EdhHypervisorEngine');

class Kernel {
  constructor(initialConfig = {}) {
    this.container = new DependencyInjection();
    this.eventBus = new EventBus();
    this.moduleRegistry = new ModuleRegistry();
    this.capabilityRegistry = new CapabilityRegistry();
    this.configManager = new ConfigurationManager(initialConfig);
    this.lifecycleManager = new LifecycleManager();
    this.featureFlags = new FeatureFlags();
    this.pluginManager = new PluginManager(this);
    this.hypervisor = new EdhHypervisorEngine(initialConfig.hypervisor || {});

    // Bind kernel services in DI container
    this.container.registerInstance('kernel', this);
    this.container.registerInstance('eventBus', this.eventBus);
    this.container.registerInstance('moduleRegistry', this.moduleRegistry);
    this.container.registerInstance('capabilityRegistry', this.capabilityRegistry);
    this.container.registerInstance('configManager', this.configManager);
    this.container.registerInstance('lifecycleManager', this.lifecycleManager);
    this.container.registerInstance('featureFlags', this.featureFlags);
    this.container.registerInstance('pluginManager', this.pluginManager);
    this.container.registerInstance('hypervisor', this.hypervisor);
    this.container.registerInstance('vfs', this.hypervisor.getVfs());

    // Boot hypervisor kernel
    this.hypervisor.bootKernel();

    // Initialize ServiceLocator gateway
    ServiceLocator.setContainer(this.container);
  }

  // --- Lifecycle State Engine ---

  async boot(customConfig = {}) {
    if (this.lifecycleManager.getState() !== LifecycleManager.PHASES.BOOT) {
      return this;
    }

    if (Object.keys(customConfig).length > 0) {
      this.configManager.merge(customConfig);
    }

    await this.lifecycleManager.transitionTo(LifecycleManager.PHASES.INIT);

    // Initialize registered modules
    await this.moduleRegistry.initializeAll(this);

    await this.lifecycleManager.transitionTo(LifecycleManager.PHASES.READY);
    await this.lifecycleManager.transitionTo(LifecycleManager.PHASES.RUNNING);

    await this.eventBus.emit('kernel:booted', {
      timestamp: new Date().toISOString(),
      state: this.lifecycleManager.getState()
    });

    return this;
  }

  async pause() {
    await this.lifecycleManager.transitionTo(LifecycleManager.PHASES.PAUSED);
    await this.eventBus.emit('kernel:paused', { timestamp: new Date().toISOString() });
    return this;
  }

  async resume() {
    await this.lifecycleManager.transitionTo(LifecycleManager.PHASES.RUNNING);
    await this.eventBus.emit('kernel:resumed', { timestamp: new Date().toISOString() });
    return this;
  }

  async shutdown() {
    await this.eventBus.emit('kernel:shutdown:started');
    await this.lifecycleManager.shutdown();
    if (this.hypervisor) {
      this.hypervisor.shutdown();
    }
    await this.eventBus.emit('kernel:shutdown:completed');
  }

  getLifecycleState() {
    return this.lifecycleManager.getState();
  }

  registerShutdownHook(name, hookFn) {
    this.lifecycleManager.registerShutdownHook(name, hookFn);
    return this;
  }

  // --- Dynamic Plugin Loader API ---

  registerPlugin(plugin) {
    return this.pluginManager.registerPlugin(plugin);
  }

  loadPlugin(pluginPathOrObject) {
    if (typeof pluginPathOrObject === 'string') {
      const dir = require('path').dirname(pluginPathOrObject);
      return this.pluginManager.loadPluginsFromDirectory(dir);
    }
    return this.pluginManager.registerPlugin(pluginPathOrObject);
  }

  loadPluginsFromDirectory(dirPath) {
    return this.pluginManager.loadPluginsFromDirectory(dirPath);
  }

  async activatePlugin(name) {
    return await this.pluginManager.activatePlugin(name);
  }

  async deactivatePlugin(name) {
    return await this.pluginManager.deactivatePlugin(name);
  }

  getPlugin(name) {
    return this.pluginManager.getPlugin(name);
  }

  listPlugins() {
    return this.pluginManager.listPlugins();
  }

  // --- Streaming Event Bus API ---

  emitEvent(event, payload) {
    return this.eventBus.emit(event, payload);
  }

  emitEventSync(event, payload) {
    return this.eventBus.emitSync(event, payload);
  }

  onEvent(event, handler, priority) {
    return this.eventBus.on(event, handler, priority);
  }

  createEventStream(pattern = '*') {
    return this.eventBus.createStream(pattern);
  }

  pipeEventStream(pattern, targetWritable) {
    return this.eventBus.pipe(pattern, targetWritable);
  }

  emitEventStream(event, sourceReadableStream) {
    return this.eventBus.emitStream(event, sourceReadableStream);
  }

  // --- Dependency Injection & Services Gateway ---

  getService(serviceName) {
    return this.container.resolve(serviceName);
  }

  registerService(name, definition, options) {
    this.container.register(name, definition, options);
    return this;
  }

  registerInstance(name, instance) {
    this.container.registerInstance(name, instance);
    return this;
  }

  getCapability(key, defaultValue) {
    return this.capabilityRegistry.getCapability(key, defaultValue);
  }

  setCapabilities(capabilitiesObj) {
    this.capabilityRegistry.setCapabilities(capabilitiesObj);
    return this;
  }

  getConfig(keyPath, defaultValue) {
    return this.configManager.get(keyPath, defaultValue);
  }

  isFeatureEnabled(flagName, context) {
    return this.featureFlags.isEnabled(flagName, context);
  }

  getHypervisor() {
    return this.hypervisor;
  }

  getVfs() {
    return this.hypervisor ? this.hypervisor.getVfs() : null;
  }
}

module.exports = Kernel;
