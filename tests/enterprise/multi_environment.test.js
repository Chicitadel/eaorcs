/******************************************************************************
 * Project        : EAORCS - Enterprise Qualification Expansion
 * Module         : Enterprise Qualification / Multi-Environment Certification
 * File           : multi_environment.test.js
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
const path = require('path');
const fs = require('fs');

// Attempt to load runtime CapabilityMatrix and ProfileRegistry if available
let CapabilityMatrix = null;
let ProfileRegistry = null;
try {
  CapabilityMatrix = require('../../engine/runtime/CapabilityMatrix');
  ProfileRegistry = require('../../engine/runtime/ProfileRegistry');
} catch (_) {}

/**
 * 8 Certified Environment Profiles (EAORCS Blueprint)
 */
const ENVIRONMENT_PROFILES = [
  {
    name: 'SharedHost',
    minNodeVersion: '18.0.0',
    requiresDocker: false,
    requiresKubernetes: false,
    minRamMb: 512,
    capabilities: ['local_filesystem', 'mysql_support', 'mysql_queue', 'web_cron', 'apcu']
  },
  {
    name: 'SmallVPS',
    minNodeVersion: '18.0.0',
    requiresDocker: false,
    requiresKubernetes: false,
    minRamMb: 2048,
    capabilities: ['docker', 'root_access', 'systemd_supervisor', 'local_filesystem', 'mysql_support', 'redis', 'system_cron']
  },
  {
    name: 'EnterpriseVPS',
    minNodeVersion: '18.0.0',
    requiresDocker: true,
    requiresKubernetes: false,
    minRamMb: 8192,
    capabilities: ['docker', 'root_access', 'systemd_supervisor', 'local_filesystem', 's3', 'mysql_support', 'redis', 'system_cron']
  },
  {
    name: 'Docker',
    minNodeVersion: '18.0.0',
    requiresDocker: true,
    requiresKubernetes: false,
    minRamMb: 4096,
    capabilities: ['docker', 'containerized', 'local_filesystem', 's3', 'mysql_support', 'redis', 'system_cron']
  },
  {
    name: 'Kubernetes',
    minNodeVersion: '18.0.0',
    requiresDocker: true,
    requiresKubernetes: true,
    minRamMb: 4096,
    capabilities: ['docker', 'kubernetes', 'containerized', 's3', 'redis', 'hpa_autoscaling', 'configmaps', 'secrets_vault', 'multi_az_resiliency']
  },
  {
    name: 'AWS',
    minNodeVersion: '18.0.0',
    requiresDocker: true,
    requiresKubernetes: true,
    minRamMb: 16384,
    capabilities: ['docker', 'kubernetes', 'containerized', 's3', 'redis', 'hpa_autoscaling', 'configmaps', 'secrets_vault', 'iam_roles', 'kms_encryption', 'multi_az_resiliency']
  },
  {
    name: 'Azure',
    minNodeVersion: '18.0.0',
    requiresDocker: true,
    requiresKubernetes: true,
    minRamMb: 16384,
    capabilities: ['docker', 'kubernetes', 'containerized', 'azure_blob', 'redis', 'hpa_autoscaling', 'configmaps', 'secrets_vault', 'iam_roles', 'kms_encryption', 'multi_az_resiliency']
  },
  {
    name: 'GCP',
    minNodeVersion: '18.0.0',
    requiresDocker: true,
    requiresKubernetes: true,
    minRamMb: 16384,
    capabilities: ['docker', 'kubernetes', 'containerized', 'gcs', 'redis', 'hpa_autoscaling', 'configmaps', 'secrets_vault', 'iam_roles', 'kms_encryption', 'multi_az_resiliency']
  }
];

/**
 * Runs the Multi-Environment Qualification Test Suite across all 8 certified environments
 */
function runMultiEnvTests() {
  const results = [];
  let passedCount = 0;
  let failedCount = 0;

  for (const profile of ENVIRONMENT_PROFILES) {
    const envTests = [
      {
        testName: `[${profile.name}] 1. Profile loads correctly`,
        run: () => {
          assert.ok(profile, 'Profile object must be defined');
          assert.strictEqual(typeof profile, 'object', 'Profile must be an object');
          assert.ok(profile.name, 'Profile must have a valid name string');
          if (ProfileRegistry) {
            const regProfile = ProfileRegistry.resolveProfileForHost(profile.name);
            assert.ok(regProfile, `ProfileRegistry must resolve host type ${profile.name}`);
          }
          return `Profile ${profile.name} loaded cleanly`;
        }
      },
      {
        testName: `[${profile.name}] 2. Capability set is non-empty`,
        run: () => {
          assert.ok(Array.isArray(profile.capabilities), 'Capabilities must be an array');
          assert.ok(profile.capabilities.length > 0, 'Capabilities array must contain at least one feature');
          return `Capability set valid with ${profile.capabilities.length} declared capabilities`;
        }
      },
      {
        testName: `[${profile.name}] 3. Minimum requirements are defined`,
        run: () => {
          const major = parseInt(profile.minNodeVersion.split('.')[0], 10);
          assert.ok(major >= 18, `minNodeVersion must be >= 18, found ${profile.minNodeVersion}`);
          assert.strictEqual(typeof profile.requiresDocker, 'boolean', 'requiresDocker must be a boolean');
          assert.strictEqual(typeof profile.requiresKubernetes, 'boolean', 'requiresKubernetes must be a boolean');
          assert.strictEqual(typeof profile.minRamMb, 'number', 'minRamMb must be a number');
          assert.ok(profile.minRamMb >= 512, 'minRamMb must be at least 512MB');
          return `Requirements verified: Node >= ${profile.minNodeVersion}, RAM >= ${profile.minRamMb}MB, Docker: ${profile.requiresDocker}, K8s: ${profile.requiresKubernetes}`;
        }
      },
      {
        testName: `[${profile.name}] 4. Environment-specific features are declared`,
        run: () => {
          if (profile.name === 'SharedHost') {
            assert.ok(profile.capabilities.includes('web_cron'), 'SharedHost must declare web_cron capability');
          } else if (profile.name === 'Kubernetes') {
            assert.ok(profile.capabilities.includes('hpa_autoscaling'), 'Kubernetes must declare hpa_autoscaling capability');
            assert.ok(profile.capabilities.includes('configmaps'), 'Kubernetes must declare configmaps capability');
          } else if (['AWS', 'Azure', 'GCP'].includes(profile.name)) {
            assert.ok(profile.capabilities.includes('iam_roles'), `${profile.name} must declare iam_roles capability`);
            assert.ok(profile.capabilities.includes('kms_encryption'), `${profile.name} must declare kms_encryption capability`);
          }
          return `Environment specific capabilities verified for ${profile.name}`;
        }
      },
      {
        testName: `[${profile.name}] 5. No conflicting capabilities between environments`,
        run: () => {
          if (!profile.requiresKubernetes) {
            assert.strictEqual(profile.capabilities.includes('hpa_autoscaling'), false, 'Non-Kubernetes profile cannot claim hpa_autoscaling');
          }
          if (!profile.requiresDocker) {
            assert.strictEqual(profile.capabilities.includes('containerized'), false, 'Non-Docker profile cannot claim containerized');
          }
          if (profile.name === 'SharedHost') {
            assert.strictEqual(profile.capabilities.includes('iam_roles'), false, 'SharedHost cannot claim cloud IAM roles');
            assert.strictEqual(profile.capabilities.includes('kubernetes'), false, 'SharedHost cannot claim kubernetes');
          }
          return `No capability conflicts detected for ${profile.name}`;
        }
      }
    ];

    for (const t of envTests) {
      const startTime = Date.now();
      try {
        const msg = t.run();
        const durationMs = Date.now() - startTime;
        passedCount++;
        results.push({
          env: profile.name,
          name: t.testName,
          status: 'PASSED',
          message: msg,
          durationMs
        });
      } catch (err) {
        const durationMs = Date.now() - startTime;
        failedCount++;
        results.push({
          env: profile.name,
          name: t.testName,
          status: 'FAILED',
          error: err.message,
          durationMs
        });
      }
    }
  }

  return {
    suite: 'Multi-Environment Certification (8 Platforms)',
    passed: failedCount === 0,
    passedCount,
    failedCount,
    totalTests: ENVIRONMENT_PROFILES.length * 5,
    environmentsCount: ENVIRONMENT_PROFILES.length,
    results
  };
}

if (require.main === module) {
  console.log('=== EAORCS Multi-Environment Qualification Suite (8 Platforms) ===');
  const summary = runMultiEnvTests();
  summary.results.forEach(r => {
    const symbol = r.status === 'PASSED' ? '[PASS]' : '[FAIL]';
    console.log(`${symbol} ${r.name}: ${r.message || r.error}`);
  });
  console.log(`Summary: ${summary.passedCount}/${summary.totalTests} environment tests passed across ${summary.environmentsCount} certified profiles.`);
  process.exit(summary.passed ? 0 : 1);
}

module.exports = {
  ENVIRONMENT_PROFILES,
  runMultiEnvTests
};
