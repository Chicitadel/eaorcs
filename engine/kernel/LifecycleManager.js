/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Kernel / Lifecycle Manager
 * File           : LifecycleManager.js
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

const PHASES = {
  BOOT: 'BOOT',
  INIT: 'INIT',
  READY: 'READY',
  RUNNING: 'RUNNING',
  PAUSED: 'PAUSED',
  SHUTTING_DOWN: 'SHUTTING_DOWN',
  TERMINATED: 'TERMINATED'
};

class LifecycleManager {
  constructor() {
    this.currentPhase = PHASES.BOOT;
    this.phaseHandlers = new Map();
    this.shutdownHooks = [];
    
    Object.keys(PHASES).forEach(phase => {
      this.phaseHandlers.set(phase, []);
    });
  }

  static get PHASES() {
    return PHASES;
  }

  getState() {
    return this.currentPhase;
  }

  onPhase(phase, handler) {
    if (!this.phaseHandlers.has(phase)) {
      throw new Error(`[LifecycleManager] Invalid phase '${phase}'`);
    }
    if (typeof handler !== 'function') {
      throw new Error('[LifecycleManager] Handler must be a function.');
    }
    this.phaseHandlers.get(phase).push(handler);
    return this;
  }

  async transitionTo(nextPhase) {
    if (!PHASES[nextPhase]) {
      throw new Error(`[LifecycleManager] Unknown target phase '${nextPhase}'`);
    }

    const previousPhase = this.currentPhase;
    this.currentPhase = nextPhase;

    const handlers = this.phaseHandlers.get(nextPhase) || [];
    for (const fn of handlers) {
      try {
        await fn(previousPhase, nextPhase);
      } catch (err) {
        console.error(`[LifecycleManager] Error during transition to ${nextPhase}: ${err.message}`);
      }
    }

    return this.currentPhase;
  }

  registerShutdownHook(name, hookFn) {
    if (typeof hookFn !== 'function') {
      throw new Error('[LifecycleManager] Shutdown hook must be a function.');
    }
    this.shutdownHooks.push({ name, hookFn });
    return this;
  }

  async shutdown() {
    if (this.currentPhase === PHASES.SHUTTING_DOWN || this.currentPhase === PHASES.TERMINATED) {
      return;
    }

    await this.transitionTo(PHASES.SHUTTING_DOWN);

    for (const hook of this.shutdownHooks) {
      try {
        await hook.hookFn();
      } catch (err) {
        console.error(`[LifecycleManager] Shutdown hook '${hook.name}' failed: ${err.message}`);
      }
    }

    await this.transitionTo(PHASES.TERMINATED);
  }
}

module.exports = LifecycleManager;
