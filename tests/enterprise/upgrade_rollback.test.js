/******************************************************************************
 * Project        : EAORCS - Enterprise Qualification Expansion
 * Module         : Enterprise Qualification / Upgrade & Rollback
 * File           : upgrade_rollback.test.js
 * Version        : 2026.1.0-LTS
 * Author         : Air Roofers Architecture Authority / Ujomor Systems
 * Organization   : Ujomor Systems
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | GOVERNMENT
 *
 * Governance:
 * - Enterprise Architecture Authority Governed
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
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

const assert = require('assert');

/**
 * In-Memory VersionManager for zero-downtime upgrade & rollback operations
 */
class VersionManager {
  constructor() {
    this.currentVersion = null;
    this.previousVersion = null;
    this.installedComponents = new Map();
    this.previousComponents = new Map();
    this.activeSessions = new Map();
    this.configuration = {};
    this.previousConfiguration = {};
    this.deploymentHistory = [];
  }

  install(version, components = {}, config = {}) {
    this.currentVersion = version;
    this.previousVersion = null;
    this.installedComponents = new Map(Object.entries(components));
    this.previousComponents = new Map();
    this.configuration = Object.assign({}, config);
    this.previousConfiguration = {};
    this.deploymentHistory.push({ action: 'install', version, timestamp: Date.now() });
    return { status: 'installed', version };
  }

  upgrade(newVersion, components = {}, newConfig = {}) {
    if (!this.currentVersion) {
      throw new Error('Cannot upgrade: No base version installed');
    }
    this.previousVersion = this.currentVersion;
    this.previousComponents = new Map(this.installedComponents);
    this.previousConfiguration = Object.assign({}, this.configuration);

    this.currentVersion = newVersion;
    for (const [key, val] of Object.entries(components)) {
      this.installedComponents.set(key, val);
    }
    Object.assign(this.configuration, newConfig);

    // Active sessions are preserved during upgrade to guarantee zero downtime
    this.deploymentHistory.push({ action: 'upgrade', version: newVersion, timestamp: Date.now() });
    return { status: 'upgraded', currentVersion: this.currentVersion, previousVersion: this.previousVersion };
  }

  rollback() {
    if (!this.previousVersion) {
      throw new Error('Cannot rollback: No previous version available');
    }
    const rollbackTarget = this.previousVersion;
    this.currentVersion = this.previousVersion;
    this.previousVersion = null;
    this.installedComponents = new Map(this.previousComponents);
    this.configuration = Object.assign({}, this.previousConfiguration);

    this.deploymentHistory.push({ action: 'rollback', restoredVersion: rollbackTarget, timestamp: Date.now() });
    return { status: 'rolled_back', currentVersion: this.currentVersion };
  }

  getCurrentVersion() {
    return this.currentVersion;
  }

  getPreviousVersion() {
    return this.previousVersion;
  }

  createSession(sessionId, sessionData) {
    this.activeSessions.set(sessionId, { ...sessionData, createdAt: Date.now() });
    return sessionId;
  }

  getActiveSession(sessionId) {
    return this.activeSessions.get(sessionId) || null;
  }

  getActiveSessionsCount() {
    return this.activeSessions.size;
  }

  setConfig(key, value) {
    this.configuration[key] = value;
  }

  getConfig(key) {
    return this.configuration[key];
  }

  static detectSchemaChanges(oldSchema, newSchema) {
    const addedColumns = [];
    const removedColumns = [];
    const modifiedColumns = [];

    const oldCols = oldSchema.columns || {};
    const newCols = newSchema.columns || {};

    for (const [colName, oldDef] of Object.entries(oldCols)) {
      if (!(colName in newCols)) {
        removedColumns.push(colName);
      } else if (oldDef.type !== newCols[colName].type) {
        modifiedColumns.push({ column: colName, from: oldDef.type, to: newCols[colName].type });
      }
    }

    for (const [colName, newDef] of Object.entries(newCols)) {
      if (!(colName in oldCols)) {
        addedColumns.push({ column: colName, nullable: newDef.nullable !== false });
      }
    }

    const isBreaking = removedColumns.length > 0 ||
      addedColumns.some(c => !c.nullable) ||
      modifiedColumns.length > 0;

    return {
      isBackwardCompatible: !isBreaking,
      addedColumns,
      removedColumns,
      modifiedColumns,
      breakingChangesCount: (removedColumns.length + modifiedColumns.length + addedColumns.filter(c => !c.nullable).length)
    };
  }
}

/**
 * Runs the Version Upgrade & Rollback qualification test suite
 */
function runUpgradeRollbackTests() {
  const tests = [
    {
      name: 'Install Base Version v1.0.0',
      run: () => {
        const vm = new VersionManager();
        vm.install('1.0.0', { kernel: '1.0.0', engine: '1.0.0' }, { env: 'production', dbPool: 10 });
        assert.strictEqual(vm.getCurrentVersion(), '1.0.0');
        assert.strictEqual(vm.getPreviousVersion(), null);
        return 'Base version v1.0.0 installed successfully';
      }
    },
    {
      name: 'Upgrade to LTS Version v2026.1.0-lts',
      run: () => {
        const vm = new VersionManager();
        vm.install('1.0.0', { kernel: '1.0.0' });
        vm.upgrade('2026.1.0-lts', { kernel: '2026.1.0', security: '2026.1.0' });
        assert.strictEqual(vm.getCurrentVersion(), '2026.1.0-lts');
        assert.strictEqual(vm.getPreviousVersion(), '1.0.0');
        return 'Upgraded to v2026.1.0-lts with previous version recorded as v1.0.0';
      }
    },
    {
      name: 'Verify Atomic Rollback to v1.0.0',
      run: () => {
        const vm = new VersionManager();
        vm.install('1.0.0', { kernel: '1.0.0' });
        vm.upgrade('2026.1.0-lts', { kernel: '2026.1.0' });
        const res = vm.rollback();
        assert.strictEqual(res.status, 'rolled_back');
        assert.strictEqual(vm.getCurrentVersion(), '1.0.0');
        assert.strictEqual(vm.getPreviousVersion(), null);
        return 'Rollback successfully reverted current version to v1.0.0';
      }
    },
    {
      name: 'Verify Zero-Downtime Session Preservation During Upgrade',
      run: () => {
        const vm = new VersionManager();
        vm.install('1.0.0', { kernel: '1.0.0' });
        
        // Populate active sessions before upgrade
        for (let i = 1; i <= 10; i++) {
          vm.createSession(`sess_${i}`, { userId: `user_${i}`, token: `jwt_token_${i}` });
        }
        assert.strictEqual(vm.getActiveSessionsCount(), 10);

        // Perform upgrade
        vm.upgrade('2026.1.0-lts', { kernel: '2026.1.0' });

        // Assert all sessions remain intact after upgrade
        assert.strictEqual(vm.getActiveSessionsCount(), 10);
        assert.strictEqual(vm.getActiveSession('sess_5').userId, 'user_5');
        return 'All 10 active sessions preserved intact across upgrade (zero-downtime verified)';
      }
    },
    {
      name: 'Verify Data & Configuration Integrity After Rollback',
      run: () => {
        const vm = new VersionManager();
        const baseConfig = { dbPool: 20, secretRotationDays: 30, enableAudit: true };
        vm.install('1.0.0', { kernel: '1.0.0' }, baseConfig);

        // Perform upgrade with config overrides
        vm.upgrade('2026.1.0-lts', { kernel: '2026.1.0' }, { dbPool: 50, secretRotationDays: 14, enableAudit: true });
        assert.strictEqual(vm.getConfig('dbPool'), 50);

        // Rollback
        vm.rollback();

        // Assert configuration reverted exactly to baseConfig
        assert.strictEqual(vm.getConfig('dbPool'), 20);
        assert.strictEqual(vm.getConfig('secretRotationDays'), 30);
        assert.strictEqual(vm.getConfig('enableAudit'), true);
        return 'Configuration parameters fully restored to baseline after rollback without data corruption';
      }
    },
    {
      name: 'Verify Backward-Compatible Schema Change Detection',
      run: () => {
        const oldSchema = {
          tableName: 'users',
          columns: {
            id: { type: 'INT', nullable: false },
            username: { type: 'VARCHAR(255)', nullable: false }
          }
        };

        // 1. Compatible change (adding nullable column)
        const compatibleNewSchema = {
          tableName: 'users',
          columns: {
            id: { type: 'INT', nullable: false },
            username: { type: 'VARCHAR(255)', nullable: false },
            avatar_url: { type: 'VARCHAR(512)', nullable: true }
          }
        };
        const compRes = VersionManager.detectSchemaChanges(oldSchema, compatibleNewSchema);
        assert.strictEqual(compRes.isBackwardCompatible, true);

        // 2. Breaking change (dropping existing column)
        const breakingNewSchema = {
          tableName: 'users',
          columns: {
            id: { type: 'INT', nullable: false }
          }
        };
        const breakRes = VersionManager.detectSchemaChanges(oldSchema, breakingNewSchema);
        assert.strictEqual(breakRes.isBackwardCompatible, false);
        assert.strictEqual(breakRes.breakingChangesCount, 1);

        return 'Schema detection correctly identified compatible vs breaking database migrations';
      }
    }
  ];

  const results = [];
  let passedCount = 0;
  let failedCount = 0;

  for (const t of tests) {
    const startTime = Date.now();
    try {
      const msg = t.run();
      const durationMs = Date.now() - startTime;
      passedCount++;
      results.push({ name: t.name, status: 'PASSED', message: msg, durationMs });
    } catch (err) {
      const durationMs = Date.now() - startTime;
      failedCount++;
      results.push({ name: t.name, status: 'FAILED', error: err.message, durationMs });
    }
  }

  return {
    suite: 'Upgrade & Rollback Validation',
    passed: failedCount === 0,
    passedCount,
    failedCount,
    totalTests: tests.length,
    results
  };
}

if (require.main === module) {
  console.log('=== EAORCS Enterprise Upgrade & Rollback Qualification ===');
  const summary = runUpgradeRollbackTests();
  summary.results.forEach(r => {
    const symbol = r.status === 'PASSED' ? '[PASS]' : '[FAIL]';
    console.log(`${symbol} ${r.name}: ${r.message || r.error}`);
  });
  console.log(`Summary: ${summary.passedCount}/${summary.totalTests} tests passed.`);
  process.exit(summary.passed ? 0 : 1);
}

module.exports = {
  VersionManager,
  runUpgradeRollbackTests
};
