/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS AI Governance Engine Test Suite
 * File           : AIGovernanceEngine.test.js
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
 * CORP: Layer I — AI Governance Test Verification
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
const path = require('path');
const fs = require('fs');
const AIGovernanceEngine = require('../../engine/governance/AIGovernanceEngine');

function runAIGovernanceEngineTests() {
    console.log('================================================================');
    console.log('  TEST SUITE: AIGovernanceEngine (Layer I)');
    console.log('================================================================\n');

    const testTmpDir = path.join(__dirname, '../../tmp', 'test_ai_gov');
    const testYamlPath = path.join(testTmpDir, 'model_inventory.yaml');

    const engine = new AIGovernanceEngine({
        modelInventoryPath: testYamlPath
    });

    // Test 1: Generate AI Governance Report
    console.log('[1/4] Testing generateAiGovernanceReport()...');
    const report = engine.generateAiGovernanceReport({}, { modelInventoryPath: testYamlPath });

    assert.ok(report.reportId.startsWith('AIGR-'), 'Report ID must start with AIGR-');
    assert.ok(report.timestamp, 'Timestamp must be present');
    assert.ok(report.modelInventory, 'Model inventory must be included');
    assert.strictEqual(report.modelInventory.totalModels, 2, 'Should have 2 baseline models');
    assert.ok(report.promptGovernance, 'Prompt governance section present');
    assert.ok(report.evaluationDatasets, 'Evaluation datasets section present');
    assert.ok(report.humanApprovalWorkflows, 'Human approval workflows section present');
    assert.ok(report.explainabilityReports, 'Explainability reports section present');
    assert.ok(report.aiRiskRegister, 'AI risk register section present');
    assert.strictEqual(report.overallComplianceStatus.certified, true);
    console.log(`  ✓ AI Governance Report generated successfully (${report.reportId})`);

    // Test 2: Verify model_inventory.yaml creation & sync
    console.log('\n[2/4] Testing model_inventory.yaml file serialization & filesystem sync...');
    assert.ok(fs.existsSync(testYamlPath), `YAML file must exist at ${testYamlPath}`);
    const yamlContent = fs.readFileSync(testYamlPath, 'utf8');
    assert.ok(yamlContent.includes('MODEL-UAIGOS-GOV-V3'), 'YAML must contain modelId');
    assert.ok(yamlContent.includes('euAiActRiskTier: "HIGH_RISK"'), 'YAML must include EU AI Act risk tier');

    const parsedModels = engine.parseModelInventoryYaml(yamlContent);
    assert.ok(parsedModels.length >= 2, `Parsed models count should be >= 2, got ${parsedModels.length}`);
    console.log('  ✓ model_inventory.yaml successfully created, formatted, and parsed');

    // Test 3: Register new model & re-generate report
    console.log('\n[3/4] Testing registerModel, registerPromptTemplate, and risk registration...');
    engine.registerModel({
        modelId: 'MODEL-CUSTOM-VISION-01',
        modelName: 'Enterprise Vision Inspection Engine',
        provider: 'Ujomor Vision Lab',
        version: '1.0.0',
        parameters: '8B',
        modality: 'Vision / Multimodal',
        euAiActRiskTier: 'LIMITED_RISK',
        status: 'APPROVED',
        complianceStatus: 'FULLY_COMPLIANT'
    });

    engine.registerPromptTemplate({
        promptId: 'PROMPT-VISION-001',
        name: 'Roof Surface Damage Classification Prompt',
        status: 'ACTIVE'
    });

    engine.recordRiskItem({
        riskId: 'AIRISK-002',
        category: 'DATA_BIAS',
        euAiActClassification: 'Minimal Risk',
        description: 'Over-representation of sunny lighting conditions in test images',
        impactScore: 2,
        likelihoodScore: 3,
        inherentRiskLevel: 'MEDIUM',
        residualRiskLevel: 'LOW'
    });

    const updatedReport = engine.generateAiGovernanceReport({}, { modelInventoryPath: testYamlPath });
    assert.strictEqual(updatedReport.modelInventory.totalModels, 3, 'Model count should now be 3');
    assert.strictEqual(updatedReport.aiRiskRegister.totalRiskEntries, 2, 'Risk entries count should now be 2');
    console.log('  ✓ Dynamic model, prompt, and risk registration verified');

    // Test 4: Cleanup temporary test artifacts
    console.log('\n[4/4] Cleaning up test artifacts...');
    if (fs.existsSync(testYamlPath)) {
        fs.unlinkSync(testYamlPath);
    }
    if (fs.existsSync(testTmpDir)) {
        fs.rmdirSync(testTmpDir);
    }
    console.log('  ✓ Cleanup complete');

    console.log('\n================================================================');
    console.log('  SUCCESS: AIGovernanceEngine tests passed (100%)');
    console.log('================================================================\n');
}

runAIGovernanceEngineTests();
