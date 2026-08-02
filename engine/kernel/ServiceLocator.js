/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Kernel / Service Locator
 * File           : ServiceLocator.js
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

let containerInstance = null;

class ServiceLocator {
  static setContainer(container) {
    containerInstance = container;
  }

  static getContainer() {
    return containerInstance;
  }

  static get(serviceName) {
    if (!containerInstance) {
      throw new Error('[ServiceLocator] Container has not been set in ServiceLocator.');
    }
    return containerInstance.resolve(serviceName);
  }

  static has(serviceName) {
    if (!containerInstance) return false;
    return containerInstance.has(serviceName);
  }

  static reset() {
    containerInstance = null;
  }
}

module.exports = ServiceLocator;
