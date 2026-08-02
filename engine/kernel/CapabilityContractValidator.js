/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Kernel / Capability Contract Validator Schema v1.1.0-FROZEN
 * File           : CapabilityContractValidator.js
 * Version        : 2026.2-LTS (v1.1.0-FROZEN Master Specification)
 * Author         : Ujomor Engineering Governance Authority
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
 * Created Date   : 2026-08-02
 * Last Modified  : 2026-08-02
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Architecture Authority Approved & FROZEN (v1.1.0-FROZEN)
 * - Security Reviewed (ISO 27001, SOC 2, OWASP ASVS, NIST SP 800-161, DORA, NIS2, EU Data Act)
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 *
 * Standards:
 * - EAORCS Blueprint v1.0
 * - DPA/PDA v1.1.0-FROZEN
 * - ISO 27001 / SOC 2 / OWASP ASVS / NIST SP 800-161 / SLSA Level 4
 *
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

class CapabilityContractValidator {
  /**
   * Main validation entry point for capability contracts.
   * Validates core metadata, interface schemas, dependency graphs, and state machines.
   * @param {Object} contractPayload
   * @param {Object} options
   * @returns {{valid: boolean, capability_id: string|null, errors: Array<string>, warnings: Array<string>}}
   */
  static validate(contractPayload, options = {}) {
    const errors = [];
    const warnings = [];

    if (!contractPayload || typeof contractPayload !== 'object') {
      return { valid: false, capability_id: null, errors: ['Contract payload must be an object.'] };
    }

    const cc = contractPayload.capability_contract || contractPayload;

    // Core Metadata Validation
    if (!cc.capability_id || typeof cc.capability_id !== 'string' || cc.capability_id.trim() === '') {
      errors.push('capability_id is required and must be a non-empty string.');
    }
    if (!cc.version || typeof cc.version !== 'string' || cc.version.trim() === '') {
      errors.push('version is required and must be a string.');
    }
    if (!cc.display_name || typeof cc.display_name !== 'string' || cc.display_name.trim() === '') {
      errors.push('display_name is required and must be a string.');
    }
    if (!cc.owner_domain || typeof cc.owner_domain !== 'string' || cc.owner_domain.trim() === '') {
      errors.push('owner_domain is required and must be a string.');
    }
    if (!cc.security_level) {
      errors.push('security_level is required (e.g. CLASS_C_PROTECTED).');
    }
    if (!cc.ip_classification) {
      errors.push('ip_classification is required (e.g. LEVEL_3_DECLARATIVE).');
    }

    // 1. Interface Schema Validation
    if (cc.interfaces || cc.schema || cc.methods) {
      const interfaceRes = this.validateInterfaceSchema(cc.interfaces || cc.schema || cc.methods);
      errors.push(...interfaceRes.errors);
      warnings.push(...interfaceRes.warnings);
    }

    // 2. Dependency Graph Validation
    if (cc.dependencies || cc.requires || cc.dependency_graph) {
      const deps = cc.dependencies || cc.requires || cc.dependency_graph;
      const depRes = this.validateDependencyGraph(deps, options);
      errors.push(...depRes.errors);
      warnings.push(...depRes.warnings);
    }

    // 3. State Machine Validation
    if (cc.state_machine || cc.stateMachine) {
      const sm = cc.state_machine || cc.stateMachine;
      const smRes = this.validateStateMachine(sm);
      errors.push(...smRes.errors);
      warnings.push(...smRes.warnings);
    }

    return {
      valid: errors.length === 0,
      capability_id: cc.capability_id || null,
      errors,
      warnings
    };
  }

  /**
   * Validates interface schema definition (methods, parameters, return types).
   * @param {Object|Array} interfaceDef
   * @returns {{valid: boolean, errors: Array<string>, warnings: Array<string>}}
   */
  static validateInterfaceSchema(interfaceDef) {
    const errors = [];
    const warnings = [];

    if (!interfaceDef || typeof interfaceDef !== 'object') {
      errors.push('Interface schema definition must be an object or array.');
      return { valid: false, errors, warnings };
    }

    const methods = Array.isArray(interfaceDef)
      ? interfaceDef
      : (interfaceDef.methods || [interfaceDef]);

    for (let i = 0; i < methods.length; i++) {
      const m = methods[i];
      if (typeof m !== 'object' || !m) {
        errors.push(`Interface method at index ${i} must be an object.`);
        continue;
      }
      if (!m.name || typeof m.name !== 'string') {
        errors.push(`Interface method at index ${i} missing required 'name' string.`);
      }
      if (m.inputs && typeof m.inputs !== 'object') {
        errors.push(`Method '${m.name || i}' inputs schema must be an object.`);
      }
      if (m.outputs && typeof m.outputs !== 'object') {
        errors.push(`Method '${m.name || i}' outputs schema must be an object.`);
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Validates capability dependency graph for structural validity, cycles, and prohibitions.
   * @param {Array<Object|string>} dependencies
   * @param {Object} options
   * @returns {{valid: boolean, errors: Array<string>, warnings: Array<string>}}
   */
  static validateDependencyGraph(dependencies, options = {}) {
    const errors = [];
    const warnings = [];

    if (!Array.isArray(dependencies)) {
      errors.push('Dependencies must be specified as an array.');
      return { valid: false, errors, warnings };
    }

    const depIds = new Set();
    for (let i = 0; i < dependencies.length; i++) {
      const dep = dependencies[i];
      let id = '';
      if (typeof dep === 'string') {
        id = dep;
      } else if (typeof dep === 'object' && dep !== null) {
        id = dep.capability_id || dep.id;
        if (!id) {
          errors.push(`Dependency at index ${i} is missing 'capability_id' or 'id'.`);
        }
      } else {
        errors.push(`Invalid dependency structure at index ${i}.`);
      }

      if (id) {
        if (depIds.has(id)) {
          warnings.push(`Duplicate dependency ID detected: '${id}'.`);
        }
        depIds.add(id);
      }
    }

    // Circular Dependency Check if graph mapping provided in options
    if (options.dependencyGraphMap && options.currentCapabilityId) {
      const cyclePath = this._detectCycle(options.currentCapabilityId, options.dependencyGraphMap, new Set(), []);
      if (cyclePath) {
        errors.push(`Circular dependency detected: ${cyclePath.join(' -> ')}.`);
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Internal cycle detection helper for dependency graphs.
   * @private
   */
  static _detectCycle(currentId, graphMap, visited, stack) {
    if (stack.includes(currentId)) {
      return [...stack, currentId];
    }
    if (visited.has(currentId)) {
      return null;
    }
    visited.add(currentId);
    stack.push(currentId);

    const neighbors = graphMap.get(currentId) || [];
    for (const neighbor of neighbors) {
      const cycle = this._detectCycle(neighbor, graphMap, visited, stack);
      if (cycle) return cycle;
    }

    stack.pop();
    return null;
  }

  /**
   * Validates state machine specifications (initial state, states set, state transitions).
   * @param {Object} stateMachine
   * @returns {{valid: boolean, errors: Array<string>, warnings: Array<string>}}
   */
  static validateStateMachine(stateMachine) {
    const errors = [];
    const warnings = [];

    if (!stateMachine || typeof stateMachine !== 'object') {
      errors.push('State machine definition must be an object.');
      return { valid: false, errors, warnings };
    }

    const { initial_state, states, transitions } = stateMachine;

    if (!initial_state || typeof initial_state !== 'string') {
      errors.push("State machine missing required 'initial_state' string.");
    }

    const stateList = Array.isArray(states)
      ? states
      : (typeof states === 'object' && states !== null ? Object.keys(states) : []);

    if (stateList.length === 0) {
      errors.push("State machine must define non-empty 'states'.");
    }

    if (initial_state && stateList.length > 0 && !stateList.includes(initial_state)) {
      errors.push(`Initial state '${initial_state}' is not defined in states list: [${stateList.join(', ')}].`);
    }

    if (transitions) {
      if (!Array.isArray(transitions)) {
        errors.push("State machine 'transitions' must be an array.");
      } else {
        for (let i = 0; i < transitions.length; i++) {
          const t = transitions[i];
          if (!t || typeof t !== 'object') {
            errors.push(`Transition at index ${i} must be an object.`);
            continue;
          }
          if (!t.from || !t.to || !t.event) {
            errors.push(`Transition at index ${i} must specify 'from', 'to', and 'event'.`);
            continue;
          }
          if (stateList.length > 0) {
            if (!stateList.includes(t.from)) {
              errors.push(`Transition at index ${i} specifies unknown 'from' state '${t.from}'.`);
            }
            if (!stateList.includes(t.to)) {
              errors.push(`Transition at index ${i} specifies unknown 'to' state '${t.to}'.`);
            }
          }
        }
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Evaluates breaking change rules between previous and new capability contract versions.
   * @param {Object} previousContract
   * @param {Object} newContract
   * @returns {{isBreaking: boolean, violations: Array<string>}}
   */
  static validateBreakingChanges(previousContract, newContract) {
    const violations = [];

    if (!previousContract || !newContract) {
      return { isBreaking: false, violations: [] };
    }

    const prevCC = previousContract.capability_contract || previousContract;
    const newCC = newContract.capability_contract || newContract;

    // Check version backward compatibility
    const prevVersion = prevCC.version || '1.0.0';
    const newVersion = newCC.version || '1.0.0';

    const prevMajor = parseInt(prevVersion.split('.')[0], 10) || 1;
    const newMajor = parseInt(newVersion.split('.')[0], 10) || 1;

    // 1. Capability ID mismatch
    if (prevCC.capability_id !== newCC.capability_id) {
      violations.push(`Capability ID changed from '${prevCC.capability_id}' to '${newCC.capability_id}'.`);
    }

    // 2. Interface method removals without major version bump
    if (prevCC.interfaces || prevCC.methods) {
      const prevMethods = (prevCC.interfaces?.methods || prevCC.methods || []).map(m => m.name).filter(Boolean);
      const newMethods = (newCC.interfaces?.methods || newCC.methods || []).map(m => m.name).filter(Boolean);

      for (const pm of prevMethods) {
        if (!newMethods.includes(pm) && newMajor === prevMajor) {
          violations.push(`Interface method '${pm}' was removed without a major version bump (${prevVersion} -> ${newVersion}).`);
        }
      }
    }

    // 3. Security Level Degradation
    const securityLevels = ['CLASS_A_PUBLIC', 'CLASS_B_INTERNAL', 'CLASS_C_PROTECTED', 'CLASS_D_RESTRICTED', 'CLASS_S_SOVEREIGN'];
    const prevLevelIdx = securityLevels.indexOf(prevCC.security_level);
    const newLevelIdx = securityLevels.indexOf(newCC.security_level);
    if (prevLevelIdx !== -1 && newLevelIdx !== -1 && newLevelIdx < prevLevelIdx) {
      violations.push(`Security level degraded from '${prevCC.security_level}' to '${newCC.security_level}'.`);
    }

    return {
      isBreaking: violations.length > 0,
      violations
    };
  }
}

module.exports = CapabilityContractValidator;
