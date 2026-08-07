/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS GA Gates & Digital Twin Master Readiness Test Suite
 * File           : eaorcs_corp_ga_gates_and_twin.test.js
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
 * CORP: Workstreams 2 & 5 — GA Gates (GA-0 to GA-3) & Master Integration
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
const path = require('path');
const fs = require('fs');

const PlatformDigitalTwinEngine = require('../../engine/platform/PlatformDigitalTwinEngine.js');
const PilotValidationEngine = require('../../engine/validation/PilotValidationEngine.js');
const MeasuredOperationsEngine = require('../../engine/telemetry/MeasuredOperationsEngine.js');
const GeneralAvailabilityGateEngine = require('../../engine/governance/GeneralAvailabilityGateEngine.js');

const workspaceRoot = path.resolve(__dirname, '../../');

async function runGAGatesAndTwinTests() {
    console.log('================================================================');
    console.log('  EAORCS GA GATES & DIGITAL TWIN MASTER READINESS SUITE');
    console.log('  Master Integration: Digital Twin, Pilot, Operations & GA Gates');
    console.log('================================================================\n');

    // Section 1: Platform Digital Twin Engine Verification
    console.log('[Digital Twin] Testing PlatformDigitalTwinEngine...');
    const twinEngine = new PlatformDigitalTwinEngine({ workspaceRoot });
    const twinModel = twinEngine.buildDigitalTwin(workspaceRoot);

    assert.ok(twinModel.twinId.startsWith('TWIN-PLATFORM-'), 'Twin ID must have standard prefix');
    assert.strictEqual(twinModel.version, '2026.3.1-LTS', 'Twin version must match LTS release');
    assert.strictEqual(twinModel.summary.totalDimensions, 10, 'Must cover 10 system dimensions');
    assert.strictEqual(twinModel.summary.overallHealth, 'HEALTHY', 'Overall health must be HEALTHY');
    assert.strictEqual(twinModel.summary.readinessScore, 100.0, 'Readiness score must be 100%');
    assert.ok(twinModel.digitalTwinHash, 'Digital twin hash must be present');

    const mutationReport = twinEngine.getStateMutationReport();
    assert.ok(mutationReport.reportId.startsWith('REPORT-MUTATION-'), 'Mutation report ID must have standard prefix');
    assert.strictEqual(mutationReport.readinessMetrics.overallReadiness, 100.0, 'Overall readiness must be 100%');
    assert.strictEqual(mutationReport.complianceStatus.lawsCompliant, true, '14 Constitutional Laws must be compliant');
    assert.ok(mutationReport.mutationHash, 'Mutation hash must be present');

    const yamlResult = twinEngine.exportDigitalTwinYaml(path.join(workspaceRoot, 'tmp', 'digital_twin.yaml'));
    assert.strictEqual(yamlResult.success, true, 'YAML export must succeed');
    assert.ok(fs.existsSync(yamlResult.filePath), 'digital_twin.yaml file must exist');
    assert.ok(yamlResult.bytesWritten > 0, 'YAML file bytes written must be > 0');
    assert.ok(yamlResult.yamlHash, 'YAML hash must be present');
    console.log('    ✓ Platform Digital Twin Engine verified (10 dimensions, YAML export & mutation report).');

    // Section 2: Pilot Validation Engine Verification
    console.log('[Pilot Validation] Testing PilotValidationEngine...');
    const pilotEngine = new PilotValidationEngine();
    
    const deployResults = pilotEngine.runCleanRoomDeployments();
    assert.strictEqual(deployResults.passed, true, 'Clean room deployments must pass');
    assert.strictEqual(deployResults.totalEnvironments, 7, 'Must test 7 target environments');
    assert.strictEqual(deployResults.passedCount, 7, 'All 7 environments must pass');
    assert.ok(deployResults.aggregateEvidenceHash, 'Aggregate evidence hash must be present');

    const rollbackResults = pilotEngine.runPluginActivationRollbackTest();
    assert.strictEqual(rollbackResults.passed, true, 'Plugin activation and rollback test must pass');
    assert.strictEqual(rollbackResults.phases.length, 5, 'Must evaluate all 5 test phases');
    assert.strictEqual(rollbackResults.zeroDowntimeVerified, true, 'Zero downtime upgrade must be verified');
    assert.strictEqual(rollbackResults.rollbackVerified, true, 'Rollback state hash match must be verified');
    console.log('    ✓ Pilot Validation Engine verified (7 environments clean-room & 5-phase rollback).');

    // Section 3: Measured Operations Engine Verification
    console.log('[Measured Operations] Testing MeasuredOperationsEngine...');
    const opsEngine = new MeasuredOperationsEngine({ tenantId: 'EAORCS-TEST-TENANT-001' });

    const journeyResult = opsEngine.runCustomerPilotJourney({ stopOnError: true });
    assert.strictEqual(journeyResult.status, 'SUCCESS', 'Customer pilot journey must complete with SUCCESS');
    assert.strictEqual(journeyResult.totalSteps, 12, 'Must execute all 12 journey steps');
    assert.strictEqual(journeyResult.completedSteps, 12, 'All 12 steps must pass');
    assert.strictEqual(journeyResult.summary.overallStatus, 'SUCCESSFUL_PILOT_VERIFICATION', 'Journey summary status must be SUCCESSFUL_PILOT_VERIFICATION');

    const metricsReport = opsEngine.getObservedVsProjectedMetrics();
    assert.ok(metricsReport.reportId.startsWith('MOM-'), 'Metrics report ID must have standard prefix');
    assert.strictEqual(metricsReport.SLACompliance.uptimeStatus, 'EXCEEDED', 'Uptime SLA status must be EXCEEDED');
    assert.strictEqual(metricsReport.SLACompliance.latencyStatus, 'OPTIMAL', 'Latency SLA status must be OPTIMAL');
    assert.ok(metricsReport.readinessScorePercentage >= 99.0, 'Readiness score percentage must be >= 99%');
    console.log('    ✓ Measured Operations Engine verified (12-step customer journey & SLA metrics).');

    // Section 4: General Availability Gate Engine Verification
    console.log('[GA Gates] Testing GeneralAvailabilityGateEngine...');
    const gaEngine = new GeneralAvailabilityGateEngine({ workspaceRoot });
    const gaDecision = gaEngine.evaluateGAGates(workspaceRoot);

    assert.ok(gaDecision.decisionId.startsWith('GA-DECISION-'), 'Decision ID must have standard prefix');
    assert.strictEqual(gaDecision.overallDecision, 'APPROVED', 'Overall GA decision must be APPROVED');
    assert.strictEqual(gaDecision.verdict, 'GA_RELEASE_APPROVED', 'Verdict must be GA_RELEASE_APPROVED');
    assert.strictEqual(gaDecision.readinessScorePercentage, 100.0, 'Readiness score must be 100%');
    assert.strictEqual(gaDecision.gateSummary.passedCount, 4, 'All 4 GA gates must pass');

    assert.strictEqual(gaDecision.gates['GA-0'].status, 'PASSED', 'GA-0 Architecture & Governance Freeze must pass');
    assert.strictEqual(gaDecision.gates['GA-1'].status, 'PASSED', 'GA-1 Internal Qualification Suite must pass');
    assert.strictEqual(gaDecision.gates['GA-2'].status, 'PASSED', 'GA-2 Independent External Validation must pass');
    assert.strictEqual(gaDecision.gates['GA-3'].status, 'APPROVED', 'GA-3 Commercial Launch & Customer Pilot must be approved');

    assert.ok(fs.existsSync(path.join(workspaceRoot, 'release', 'ga_gate_decision.json')), 'ga_gate_decision.json must exist in release/');
    assert.ok(fs.existsSync(path.join(workspaceRoot, 'tmp', 'ga_gate_decision.json')), 'ga_gate_decision.json must exist in tmp/');
    console.log('    ✓ General Availability Gate Engine verified (GA-0 to GA-3 sequential gates passed & ga_gate_decision.json emitted).');

    console.log('\n================================================================');
    console.log('  GA GATES & DIGITAL TWIN MASTER READINESS CERTIFICATION PASSED');
    console.log('================================================================\n');
}

if (require.main === module) {
    runGAGatesAndTwinTests().catch(err => {
        console.error('GA gates and twin test failed:', err);
        process.exit(1);
    });
}

module.exports = runGAGatesAndTwinTests;
