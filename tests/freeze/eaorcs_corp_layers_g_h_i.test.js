/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Layers G, H, I Combined Certification Suite
 * File           : eaorcs_corp_layers_g_h_i.test.js
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
 * CORP: Certification of Layer G (Product Lifecycle), Layer H (Commercial Intelligence), Layer I (AI Governance)
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

const ProductLifecycleEngine = require('../../engine/lifecycle/ProductLifecycleEngine');
const CommercialIntelligenceEngine = require('../../engine/telemetry/CommercialIntelligenceEngine');
const AIGovernanceEngine = require('../../engine/governance/AIGovernanceEngine');

function runLayersGHICombinedTestSuite() {
    console.log('================================================================');
    console.log('  EAORCS CORP certification SUITE: LAYERS G, H, I');
    console.log('  Layer G: Product Lifecycle');
    console.log('  Layer H: Commercial Intelligence');
    console.log('  Layer I: AI Governance');
    console.log('================================================================\n');

    // ─── Layer G: Product Lifecycle ───
    console.log('[Layer G] Verifying ProductLifecycleEngine...');
    const lifecycleEngine = new ProductLifecycleEngine();
    const stageNames = lifecycleEngine.getStageNames();
    assert.strictEqual(stageNames.length, 13);
    assert.strictEqual(stageNames[0], 'Discovery');
    assert.strictEqual(stageNames[12], 'Retirement');

    for (const name of stageNames) {
        const details = lifecycleEngine.getLifecycleStageDetails(name);
        assert.ok(details, `Details for ${name} must exist`);
        assert.ok(details.inputs.length > 0);
        assert.ok(details.outputs.length > 0);
        assert.ok(details.evidence.length > 0);
        assert.ok(details.responsibleRole.length > 0);
        assert.ok(details.exitCriteria.length > 0);
    }
    console.log('  ✓ Layer G 100% PASS: 13 stages validated with inputs, outputs, evidence, responsibleRole, exitCriteria\n');

    // ─── Layer H: Commercial Intelligence ───
    console.log('[Layer H] Verifying CommercialIntelligenceEngine...');
    const commercialEngine = new CommercialIntelligenceEngine();
    const commReport = commercialEngine.generateCommercialMetricsReport();
    assert.ok(commReport.reportId.startsWith('CIR-'));
    assert.ok(commReport.licenseMetrics.activationRatePercent > 0);
    assert.ok(commReport.licenseMetrics.renewals.renewalRatePercent > 0);
    assert.ok(commReport.downloadMetrics.totalDownloads > 0);
    assert.ok(commReport.apiUsageMetrics.totalApiCalls > 0);
    assert.strictEqual(commReport.slaComplianceMetrics.complianceStatus, 'COMPLIANT');
    assert.ok(commReport.financialStatistics.arr > 0);
    console.log('  ✓ Layer H 100% PASS: Commercial metrics report generated with activations, renewals, downloads, API usage, SLA compliance, ARR/MRR\n');

    // ─── Layer I: AI Governance ───
    console.log('[Layer I] Verifying AIGovernanceEngine...');
    const testYamlPath = path.join(__dirname, '../../tmp', 'layers_ghi_model_inventory.yaml');
    const aiGovEngine = new AIGovernanceEngine({ modelInventoryPath: testYamlPath });
    const aiReport = aiGovEngine.generateAiGovernanceReport({}, { modelInventoryPath: testYamlPath });

    assert.ok(aiReport.reportId.startsWith('AIGR-'));
    assert.ok(fs.existsSync(testYamlPath), 'model_inventory.yaml must be managed on disk');
    assert.ok(aiReport.modelInventory.totalModels >= 2);
    assert.ok(aiReport.promptGovernance.activePromptsCount >= 1);
    assert.ok(aiReport.evaluationDatasets.totalDatasetsCount >= 1);
    assert.ok(aiReport.humanApprovalWorkflows.totalSubmissions >= 1);
    assert.ok(aiReport.explainabilityReports.totalReports >= 1);
    assert.ok(aiReport.aiRiskRegister.totalRiskEntries >= 1);

    if (fs.existsSync(testYamlPath)) {
        fs.unlinkSync(testYamlPath);
    }
    console.log('  ✓ Layer I 100% PASS: AI Governance report generated with model_inventory.yaml, prompt governance, eval datasets, HITL workflows, explainability, AI risk register\n');

    console.log('================================================================');
    console.log('  EAORCS LAYERS G, H, I CERTIFICATION: 100% SUCCESSFUL');
    console.log('================================================================\n');
}

runLayersGHICombinedTestSuite();
