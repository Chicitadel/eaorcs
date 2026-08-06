/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Executive UI & Metadata Reporting Master Verification Suite
 * File           : executive_ui_reporting.test.js
 * Version        : 2026.2-LTS (v1.1.0-FROZEN Master Specification)
 * Author         : Architectural Governance Council & Platform Engineering
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Architecture Authority Approved & RATIFIED
 * - UAIGOS 3.0.0 & DPA/PDA v1.1.0-FROZEN Compliant
 * - ISO 27001 / SOC 2 / OWASP ASVS / NIST SP 800-161 / SLSA Level 4 Enforced
 *
 * Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const HtmlDashboardGenerator = require('../../engine/reports/HtmlDashboardGenerator');
const ReportMetadataRegistry = require('../../engine/reporting/ReportMetadataRegistry');
const DynamicBrandingService = require('../../engine/reporting/DynamicBrandingService');
const { ReportProfileEngine } = require('../../engine/reporting/ReportProfileEngine');
const { DynamicWidgetRegistry } = require('../../engine/reporting/DynamicWidgetRegistry');
const ExecutiveTrustCenter = require('../../engine/portal/ExecutiveTrustCenter');
const MarketplaceCatalogEngine = require('../../engine/marketplace/MarketplaceCatalogEngine');
const SoftwareKnowledgeGraphEngine = require('../../engine/knowledge/SoftwareKnowledgeGraphEngine');
const DigitalTwinExplorer = require('../../engine/twin/DigitalTwinExplorer');
const AiCommandCenterEngine = require('../../engine/ai/AiCommandCenterEngine');
const UniversalSearchEngine = require('../../engine/search/UniversalSearchEngine');

async function runExecutiveUiSuite() {
  console.log('\n=== TEST SUITE: Executive UI & Metadata Reporting Engine (Streams 1-6) ===');

  // 1. Stream 1: Metadata Core & White-Label Branding
  const meta = ReportMetadataRegistry.extractMetadata(process.cwd(), { projectName: 'Agnostic Enterprise Audit System' });
  assert.ok(meta.projectName);
  const branding = DynamicBrandingService.getBranding({ watermark: { text: 'INTERNAL AUDIT' } });
  assert.ok(branding);
  console.log('✅ Stream 1: ReportMetadataRegistry & DynamicBrandingService PASSED');

  // 2. Stream 2: Report Profile Engine & Dynamic Widget Registry
  const profileEngine = new ReportProfileEngine();
  const profile = profileEngine.getProfile('EXECUTIVE_SUMMARY');
  assert.ok(profile.name);
  const widgetReg = new DynamicWidgetRegistry();
  const widgets = widgetReg.getWidgetsForRole('Executive');
  assert.ok(widgets.length >= 1);
  console.log('✅ Stream 2: ReportProfileEngine & DynamicWidgetRegistry PASSED');

  // 3. Stream 3: Executive Trust Center & Marketplace Catalog
  const trustProf = ExecutiveTrustCenter.getTrustProfile('AirRoofers Banking Core');
  assert.strictEqual(trustProf.trustScore, 96);
  const catalog = MarketplaceCatalogEngine.getCatalog();
  assert.ok(catalog.categories.length >= 3);
  console.log('✅ Stream 3: ExecutiveTrustCenter & MarketplaceCatalogEngine PASSED');

  // 4. Stream 4: Software Knowledge Graph & Digital Twin Explorer
  const kg = SoftwareKnowledgeGraphEngine.buildGraph('Banking Gateway');
  assert.ok(kg.nodes.length >= 8);
  const twinExplorer = new DigitalTwinExplorer();
  const twinSnap = twinExplorer.getLivingGraph();
  assert.ok(twinSnap.timestamp);
  console.log('✅ Stream 4: SoftwareKnowledgeGraphEngine & DigitalTwinExplorer PASSED');

  // 5. Stream 5: AI Command Center & Universal Search Engine
  const aiRes = await AiCommandCenterEngine.query('Why did readiness drop?');
  assert.ok(aiRes.answer);
  const searchRes = UniversalSearchEngine.search('Requirement');
  assert.ok(searchRes.results.length >= 1);
  console.log('✅ Stream 5: AiCommandCenterEngine & UniversalSearchEngine PASSED');

  // 6. Stream 6: HtmlDashboardGenerator Executive UI Export
  const sampleReportData = {
    productName: meta.projectName || 'Agnostic Enterprise Audit System',
    driScore: 96,
    readinessConfidence: 98,
    status: 'READY',
    timestamp: new Date().toISOString(),
    passportId: 'OSAP-AGNOSTIC-2026',
    evaluations: [
      { id: 'ArchitectureMaturity', name: 'Architecture Maturity', score: 100, weight: 10, status: 'PASS' },
      { id: 'SecurityCompliance', name: 'Security Compliance', score: 98, weight: 15, status: 'PASS' }
    ]
  };

  const result = HtmlDashboardGenerator.generate(sampleReportData, process.cwd(), { runId: 'run_exec_master_001' });
  assert.ok(result.htmlPath);
  assert.ok(result.jsonPath);
  console.log('✅ Stream 6: HtmlDashboardGenerator Executive UI Export PASSED');

  console.log('🎉 ALL 6 EXECUTIVE UI & METADATA REPORTING STREAMS PASSED 100%!\n');
}

if (require.main === module) {
  runExecutiveUiSuite().catch(err => {
    console.error('❌ EXECUTIVE UI TEST SUITE FAILED:', err);
    process.exit(1);
  });
}

module.exports = { runExecutiveUiSuite };
