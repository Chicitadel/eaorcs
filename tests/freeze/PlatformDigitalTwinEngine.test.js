/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Platform Digital Twin Engine Test Suite
 * File           : PlatformDigitalTwinEngine.test.js
 * Version        : 2026.3.1-LTS
 * Author         : Ujomor Systems & Enterprise Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-07
 * Last Modified  : 2026-08-07
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 * - Corporate Policy Governed
 *
 * CORP: Stream S18 - Platform Digital Twin Engine Verification
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const PlatformDigitalTwinEngine = require('../../engine/platform/PlatformDigitalTwinEngine');

function runPlatformDigitalTwinEngineTests() {
    console.log('================================================================');
    console.log('  TEST SUITE: PlatformDigitalTwinEngine (Stream S18)');
    console.log('================================================================\n');

    const workspaceRoot = path.resolve(__dirname, '../../');
    const engine = new PlatformDigitalTwinEngine({ workspaceRoot });

    // Test 1: buildDigitalTwin(workspaceRoot)
    console.log('[1/4] Testing buildDigitalTwin(workspaceRoot)...');
    const twin = engine.buildDigitalTwin(workspaceRoot);

    assert.ok(twin, 'Digital twin model should be generated');
    assert.ok(twin.twinId.startsWith('TWIN-PLATFORM-'), 'Twin ID should start with TWIN-PLATFORM-');
    assert.strictEqual(twin.version, '2026.3.1-LTS');
    assert.ok(twin.digitalTwinHash, 'Digital twin hash should be present');
    assert.strictEqual(twin.summary.totalDimensions, 10, 'Total dimensions must be 10');

    const expectedDimensions = [
        'products', 'capabilities', 'dependencies', 'governance',
        'security', 'deployments', 'licenses', 'evidence', 'operations', 'marketplace'
    ];

    for (const dim of expectedDimensions) {
        assert.ok(twin.dimensions[dim], `Dimension [${dim}] must be present in twin model`);
        assert.ok(Array.isArray(twin.dimensions[dim].items), `Dimension [${dim}] must contain items array`);
    }

    assert.ok(twin.graph, 'Twin graph must be present');
    assert.ok(twin.graph.nodes.length > 0, 'Twin graph should contain nodes');
    assert.ok(twin.graph.edges.length > 0, 'Twin graph should contain edges');
    console.log(`  ✓ Twin built successfully with ID [${twin.twinId}] linking 10 dimensions and ${twin.graph.nodes.length} graph nodes.`);

    // Test 2: getStateMutationReport()
    console.log('\n[2/4] Testing getStateMutationReport()...');
    const report = engine.getStateMutationReport();

    assert.ok(report, 'State mutation report should be returned');
    assert.ok(report.reportId.startsWith('REPORT-MUTATION-'), 'Report ID must start with REPORT-MUTATION-');
    assert.strictEqual(report.readinessMetrics.overallReadiness, 100.0);
    assert.strictEqual(report.readinessMetrics.productionReadiness, 100.0);
    assert.strictEqual(report.readinessMetrics.commercialReadiness, 100.0);
    assert.strictEqual(report.complianceStatus.lawsCompliant, true);
    assert.strictEqual(report.complianceStatus.constitutionalLaws, '14/14 Laws Frozen & Verified');
    assert.strictEqual(report.procurementStatus.licenseStatus, 'ACTIVE_LICENSED');
    assert.ok(report.mutationHash, 'Mutation report hash should be present');
    assert.ok(Array.isArray(report.realTimeMutations), 'realTimeMutations should be an array');
    console.log(`  ✓ State mutation report generated with reportId [${report.reportId}] & 100% readiness scores.`);

    // Test 3: exportDigitalTwinYaml(outputPath)
    console.log('\n[3/4] Testing exportDigitalTwinYaml(outputPath)...');
    const testYamlPath = path.join(workspaceRoot, 'tests', 'freeze', 'temp_digital_twin.yaml');
    const exportResult = engine.exportDigitalTwinYaml(testYamlPath);

    assert.strictEqual(exportResult.success, true, 'Export result success should be true');
    assert.strictEqual(exportResult.filePath, testYamlPath);
    assert.ok(fs.existsSync(testYamlPath), 'Exported YAML file must exist on disk');
    assert.ok(exportResult.bytesWritten > 0, 'Bytes written must be greater than 0');
    assert.ok(exportResult.yamlHash, 'YAML hash should be calculated');

    const fileContent = fs.readFileSync(testYamlPath, 'utf8');
    assert.ok(fileContent.includes('twinId:'), 'YAML content must contain twinId');
    assert.ok(fileContent.includes('version: 2026.3.1-LTS'), 'YAML content must contain version');
    assert.ok(fileContent.includes('dimensions:'), 'YAML content must contain dimensions');

    // Clean up temp file
    fs.unlinkSync(testYamlPath);
    console.log(`  ✓ YAML export verified at [${exportResult.filePath}] (${exportResult.bytesWritten} bytes).`);

    // Test 4: Default exportDigitalTwinYaml() path
    console.log('\n[4/4] Testing default exportDigitalTwinYaml()...');
    const defaultYamlPath = path.join(workspaceRoot, 'digital_twin.yaml');
    const defaultExportResult = engine.exportDigitalTwinYaml();

    assert.strictEqual(defaultExportResult.success, true);
    assert.strictEqual(defaultExportResult.filePath, defaultYamlPath);
    assert.ok(fs.existsSync(defaultYamlPath));
    console.log(`  ✓ Default digital_twin.yaml exported successfully to workspace root.`);

    console.log('\n================================================================');
    console.log('  ALL TESTS PASSED SUCCESSFULLY! (4/4)');
    console.log('================================================================\n');
}

runPlatformDigitalTwinEngineTests();
