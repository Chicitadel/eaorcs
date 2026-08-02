/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Stream 1 Workspace Registry & Audit Manifest Test Suite
 * File           : workspace_audit_manifest.test.js
 * Version        : 2026.1-LTS (v1.0.0)
 * Author         : Architectural Governance Council & Ujomor Systems Engineering
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
 * Created Date   : 2026-08-02
 * Last Modified  : 2026-08-02
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
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
 * Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

const { ProjectRegistry, ENVIRONMENTS, RISK_PROFILES } = require('../../engine/governance/ProjectRegistry');
const { AuditManifestEngine } = require('../../engine/governance/AuditManifestEngine');
const { BaselineComparisonEngine, VERDICTS } = require('../../engine/governance/BaselineComparisonEngine');

function runWorkspaceAndManifestTests() {
    console.log('=== Running Stream 1: Workspace Registry & Audit Manifest Engine Tests ===\n');
    const results = [];
    const tmpDir = path.join(os.tmpdir(), `eaorcs_test_${Date.now()}`);

    if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
    }

    // TEST 1: ProjectRegistry Default Initialization & Multi-tenant lookup
    try {
        const registry = new ProjectRegistry();
        const airRoofers = registry.getProject('proj_air_roofers_01');
        assert.ok(airRoofers, 'Air Roofers default project should exist');
        assert.strictEqual(airRoofers.tenantId, 'air-roofers');
        assert.strictEqual(airRoofers.environment, 'Prod');
        assert.strictEqual(airRoofers.riskProfile, 'ENTERPRISE');

        const akpati = registry.getProject('akpati');
        assert.ok(akpati, 'Akpati project lookup by tenant ID should work');
        assert.strictEqual(akpati.organization, 'Akpati Global');

        const civiscore = registry.getProject('civiscore');
        assert.ok(civiscore, 'CiviScore project lookup should work');
        assert.strictEqual(civiscore.riskProfile, 'HIGH');

        results.push({ test: 'ProjectRegistry initialization and default tenants lookup', passed: true });
    } catch (err) {
        results.push({ test: 'ProjectRegistry initialization and default tenants lookup', passed: false, error: err.message });
    }

    // TEST 2: Registering New Tenant & Environment Normalization
    try {
        const registry = new ProjectRegistry();
        const newProj = registry.registerProject({
            projectId: 'proj_new_tenant_99',
            name: 'Solar Skylight Inspector',
            tenantId: 'solar-roof',
            organization: 'Solar Roofers Global',
            environment: 'development', // Should normalize to 'Dev'
            riskProfile: 'HIGH',
            tags: ['solar', 'inspection']
        });

        assert.strictEqual(newProj.environment, 'Dev', 'Environment should be normalized to Dev');
        assert.strictEqual(registry.validateEnvironment('qa'), true, 'QA environment validation should pass');
        assert.strictEqual(registry.validateEnvironment('disaster-recovery'), true, 'DR environment validation should pass');
        assert.strictEqual(registry.validateEnvironment('invalid_env'), false, 'Invalid environment validation should fail');

        results.push({ test: 'Project registration and environment normalization', passed: true });
    } catch (err) {
        results.push({ test: 'Project registration and environment normalization', passed: false, error: err.message });
    }

    // TEST 3: Registry Persistence (Save & Load Storage)
    try {
        const storageFile = path.join(tmpDir, 'test_registry.json');
        const reg1 = new ProjectRegistry({ storagePath: storageFile });
        reg1.registerProject({
            projectId: 'proj_persist_01',
            name: 'Persisted Enterprise Project',
            tenantId: 'persist-tenant',
            environment: 'Staging',
            riskProfile: 'CRITICAL'
        });

        assert.ok(fs.existsSync(storageFile), 'Registry file should be created on disk');

        const reg2 = new ProjectRegistry({ storagePath: storageFile, loadDefaults: false });
        const loaded = reg2.getProject('proj_persist_01');
        assert.ok(loaded, 'Persisted project should be successfully loaded from storage');
        assert.strictEqual(loaded.riskProfile, 'CRITICAL');

        results.push({ test: 'ProjectRegistry save and load disk persistence', passed: true });
    } catch (err) {
        results.push({ test: 'ProjectRegistry save and load disk persistence', passed: false, error: err.message });
    }

    // TEST 4: AuditManifestEngine Manifest Generation & Schema Validation
    try {
        const manifestEngine = new AuditManifestEngine();
        const dummyFile = path.join(tmpDir, 'sample_code.js');
        fs.writeFileSync(dummyFile, "const fs = require('fs');\nconsole.log('Sample Code');\n", 'utf8');

        const manifest = manifestEngine.generateManifest({
            projectId: 'proj_air_roofers_01',
            targetDir: tmpDir,
            scoreSummary: {
                overall_score: 96.5,
                passed_rules: 20,
                failed_rules: 1,
                warning_rules: 2
            }
        });

        assert.ok(manifest.run_id.startsWith('run_proj_air_roofers_01_'), 'Run ID should be properly prefixed');
        assert.strictEqual(manifest.project_id, 'proj_air_roofers_01');
        assert.strictEqual(manifest.environment, 'Prod');
        assert.ok(manifest.checksums.root_sha256, 'Root SHA256 should be calculated');
        assert.ok(manifest.file_lineage.length > 0, 'File lineage should contain entries');
        assert.ok(manifest.file_lineage[0].dependencies.includes('fs'), 'Static dependency extraction should capture require("fs")');

        const val = manifestEngine.validateManifest(manifest);
        assert.strictEqual(val.valid, true, 'Manifest schema validation should succeed');

        results.push({ test: 'AuditManifestEngine manifest generation and dependency extraction', passed: true });
    } catch (err) {
        results.push({ test: 'AuditManifestEngine manifest generation and dependency extraction', passed: false, error: err.message });
    }

    // TEST 5: AuditManifestEngine Write, Read, Integrity Verification
    try {
        const manifestEngine = new AuditManifestEngine();
        const manifestPath = path.join(tmpDir, 'manifest.json');
        
        const manifest = manifestEngine.generateManifest({
            projectId: 'proj_akpati_01',
            targetDir: tmpDir
        });

        manifestEngine.writeManifest(manifest, manifestPath);
        assert.ok(fs.existsSync(manifestPath), 'manifest.json should be written to disk');

        const readBack = manifestEngine.readManifest(manifestPath);
        assert.strictEqual(readBack.run_id, manifest.run_id, 'Read manifest run_id should match original');

        const integrity = manifestEngine.verifyManifestIntegrity(readBack, tmpDir);
        assert.strictEqual(integrity.intact, true, 'Manifest file integrity verification should pass');

        results.push({ test: 'AuditManifestEngine write, read, and file integrity verification', passed: true });
    } catch (err) {
        results.push({ test: 'AuditManifestEngine write, read, and file integrity verification', passed: false, error: err.message });
    }

    // TEST 6: BaselineComparisonEngine Identical Runs (UNCHANGED Verdict)
    try {
        const manifestEngine = new AuditManifestEngine();
        const compEngine = new BaselineComparisonEngine();

        const manifest = manifestEngine.generateManifest({
            projectId: 'proj_civiscore_01',
            targetDir: tmpDir,
            scoreSummary: { overall_score: 95.0 }
        });

        const report = compEngine.compareRuns(manifest, manifest);
        assert.strictEqual(report.verdict, VERDICTS.UNCHANGED, 'Comparing manifest against itself should yield UNCHANGED verdict');
        assert.strictEqual(report.score_diff.score_delta, 0, 'Score delta should be zero');
        assert.strictEqual(report.drift_delta.root_checksum_changed, false, 'Root checksum changed should be false');

        results.push({ test: 'BaselineComparisonEngine identical runs comparison (UNCHANGED verdict)', passed: true });
    } catch (err) {
        results.push({ test: 'BaselineComparisonEngine identical runs comparison (UNCHANGED verdict)', passed: false, error: err.message });
    }

    // TEST 7: BaselineComparisonEngine Score Drop & File Drift (DEGRADED / CRITICAL_REGRESSION Verdict)
    try {
        const manifestEngine = new AuditManifestEngine();
        const compEngine = new BaselineComparisonEngine({ criticalScoreDropThreshold: 10.0 });

        const baselineManifest = manifestEngine.generateManifest({
            runId: 'run_baseline_100',
            projectId: 'proj_air_roofers_01',
            targetDir: tmpDir,
            scoreSummary: {
                overall_score: 98.0,
                categories: { security: 100, architecture: 96 }
            }
        });

        // Mutate current run with lower score and modified rule version
        const currentManifest = JSON.parse(JSON.stringify(baselineManifest));
        currentManifest.run_id = 'run_current_101';
        currentManifest.summary.overall_score = 85.0; // 13-point drop
        currentManifest.summary.categories.security = 80.0;
        currentManifest.rule_versions['SEC_RULES'] = '2.2.0';

        const report = compEngine.compareRuns(currentManifest, baselineManifest);

        assert.strictEqual(report.verdict, VERDICTS.CRITICAL_REGRESSION, 'Score drop > 10.0 should trigger CRITICAL_REGRESSION verdict');
        assert.strictEqual(report.score_diff.score_delta, -13.0, 'Score delta should be -13.0');
        assert.strictEqual(report.drift_delta.rule_version_changes.length, 1, 'Should capture rule version change');
        assert.strictEqual(report.drift_delta.rule_version_changes[0].rule_id, 'SEC_RULES');

        results.push({ test: 'BaselineComparisonEngine score drop and drift evaluation', passed: true });
    } catch (err) {
        results.push({ test: 'BaselineComparisonEngine score drop and drift evaluation', passed: false, error: err.message });
    }

    // Cleanup temp directory
    try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
        // Ignore cleanup errors
    }

    // Output Test Summary
    console.log('\n--- Test Summary ---');
    let passedCount = 0;
    for (const r of results) {
        if (r.passed) {
            console.log(` [PASS] ${r.test}`);
            passedCount++;
        } else {
            console.log(` [FAIL] ${r.test}: ${r.error}`);
        }
    }
    console.log(`\nPassed ${passedCount} / ${results.length} tests.`);

    if (passedCount < results.length) {
        process.exit(1);
    }
}

if (require.main === module) {
    runWorkspaceAndManifestTests();
}

module.exports = { runWorkspaceAndManifestTests };
