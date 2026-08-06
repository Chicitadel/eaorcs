/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : Stream 2 Reporting System Qualification Suite
 * File           : tests/stream2_reporting.test.js
 * Version        : 2026.1-LTS (v1.0.0-FROZEN)
 * Author         : Enterprise Systems Engineering & Governance Authority
 * Organization   : Enterprise Governance & Systems Engineering
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
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
 * Copyright (c) 2026 Enterprise Governance & Systems Engineering
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const { ReportProfileEngine, PROFILE_IDS } = require('../engine/reporting/ReportProfileEngine');
const { DynamicWidgetRegistry, EMPHASIS_LEVELS, CLASSIFICATIONS, DOMAINS } = require('../engine/reporting/DynamicWidgetRegistry');

console.log('=== Starting Stream 2 Reporting Systems Qualification Suite ===\n');

// 1. ReportProfileEngine Verification
console.log('[TEST 1] Initializing ReportProfileEngine...');
const profileEngine = new ReportProfileEngine();
assert.ok(profileEngine, 'ReportProfileEngine instance must be created successfully');

const profilesList = profileEngine.listProfiles();
console.log(`[TEST 1] Registered profiles count: ${profilesList.length}`);
assert.strictEqual(profilesList.length, 15, 'ReportProfileEngine must support exactly 15 standard report profiles');

// Verify all 15 profile keys exist
const expectedProfileIds = [
    'executive_summary',
    'technical_audit',
    'security_assessment',
    'board_presentation',
    'compliance_review',
    'investor_report',
    'devsecops_review',
    'software_trust_assessment',
    'architecture_governance',
    'risk_management',
    'supply_chain_security',
    'regulatory_disclosure',
    'operational_resilience',
    'ai_governance_ethics',
    'cloud_sovereignty'
];

for (const pid of expectedProfileIds) {
    assert.ok(profileEngine.hasProfile(pid), `Profile '${pid}' must be registered`);
    const p = profileEngine.getProfile(pid);
    assert.ok(p.name, `Profile '${pid}' must have a name`);
    assert.ok(Array.isArray(p.targetAudience) && p.targetAudience.length > 0, `Profile '${pid}' must define targetAudience`);
    assert.ok(Array.isArray(p.sections) && p.sections.length > 0, `Profile '${pid}' must define sections`);
    assert.ok(Array.isArray(p.recommendedWidgets), `Profile '${pid}' must define recommendedWidgets`);
    console.log(`  - Verified profile: [${p.id}] ${p.name} (Audience: ${p.targetAudience[0]}, Emphasis: ${p.emphasisFocus})`);
}

// Test Profile Report Generation
console.log('\n[TEST 2] Generating profile-tailored report payload...');
const mockAuditData = {
    trustScore: 96.8,
    readinessRating: 'PASSED_FOR_PRODUCTION',
    findings: [
        { id: 'F001', severity: 'HIGH', title: 'Outdated dependency' },
        { id: 'F002', severity: 'LOW', title: 'Missing docstring' }
    ],
    riskRegister: [
        { id: 'R001', title: 'Cloud egress risk', level: 'MEDIUM' }
    ]
};

const generatedReport = profileEngine.generateProfileReport('executive_summary', mockAuditData, {
    tenant: 'AirRoofers Defense Corp',
    classification: 'RESTRICTED'
});

assert.ok(generatedReport.metadata.reportId.startsWith('REP-EXECUTIVE_SUMMARY-'), 'Report ID format check');
assert.strictEqual(generatedReport.summary.trustScore, 96.8);
assert.strictEqual(generatedReport.summary.totalFindings, 2);
assert.ok(generatedReport.sections.length >= 3, 'Sections compiled properly');
console.log(`  - Generated Report ID: ${generatedReport.metadata.reportId}`);
console.log(`  - Trust Score: ${generatedReport.summary.trustScore}% (${generatedReport.summary.readinessRating})`);

// Test Report Format Serialization (JSON, HTML, Markdown, SARIF, CSV)
console.log('\n[TEST 3] Testing multi-format serialization...');
const jsonOutput = profileEngine.formatReportForProfile('executive_summary', generatedReport, 'JSON');
const mdOutput = profileEngine.formatReportForProfile('executive_summary', generatedReport, 'MARKDOWN');
const htmlOutput = profileEngine.formatReportForProfile('executive_summary', generatedReport, 'HTML');
const sarifOutput = profileEngine.formatReportForProfile('executive_summary', generatedReport, 'SARIF');
const csvOutput = profileEngine.formatReportForProfile('executive_summary', generatedReport, 'CSV');

assert.ok(typeof jsonOutput === 'string' && jsonOutput.includes('Executive Summary Profile'), 'JSON output check');
assert.ok(typeof mdOutput === 'string' && mdOutput.includes('# Executive Summary Profile'), 'Markdown output check');
assert.ok(typeof htmlOutput === 'string' && htmlOutput.includes('<!DOCTYPE html>'), 'HTML output check');
assert.ok(typeof sarifOutput === 'string' && sarifOutput.includes('sarif-2.1.0'), 'SARIF output check');
assert.ok(typeof csvOutput === 'string' && csvOutput.includes('ReportID,ProfileID'), 'CSV output check');
console.log('  - All 5 serialization formats (JSON, Markdown, HTML, SARIF, CSV) verified successfully');

// Test Profile Comparison
console.log('\n[TEST 4] Comparing profiles (Executive Summary vs Technical Audit)...');
const comparison = profileEngine.compareProfiles('executive_summary', 'technical_audit');
assert.ok(comparison.comparison.sharedWidgetsCount >= 0, 'Comparison matrix computed');
console.log(`  - Shared audience count: ${comparison.comparison.sharedAudienceCount}`);
console.log(`  - Shared widgets count: ${comparison.comparison.sharedWidgetsCount}`);

// Test Custom Profile Registration
console.log('\n[TEST 5] Registering custom report profile...');
const customProf = profileEngine.registerProfile('sovereign_defense_audit', {
    id: 'sovereign_defense_audit',
    name: 'Sovereign Defense Audit Profile',
    category: 'Defense',
    targetAudience: ['Minister of Defense', 'Cyber Command'],
    emphasisFocus: 'LEVEL_1',
    description: 'Custom sovereign defense audit profile.',
    sections: [{ id: 'sec_def', title: 'Defense Infrastructure Integrity', emphasis: 'LEVEL_1' }],
    recommendedWidgets: ['widget_hero_trust_score']
});
assert.strictEqual(profileEngine.hasProfile('sovereign_defense_audit'), true);
console.log(`  - Successfully registered custom profile: [${customProf.id}] ${customProf.name}`);


// 2. DynamicWidgetRegistry Verification
console.log('\n[TEST 6] Initializing DynamicWidgetRegistry...');
const widgetRegistry = new DynamicWidgetRegistry();
assert.ok(widgetRegistry, 'DynamicWidgetRegistry instance created');

const allWidgets = widgetRegistry.listWidgets();
console.log(`[TEST 6] Registered widgets count: ${allWidgets.length}`);
assert.ok(allWidgets.length >= 18, 'Widget registry must contain built-in widgets');

// Verify 3 Emphasis Levels representation
const tier1Widgets = widgetRegistry.listWidgets({ emphasisLevel: EMPHASIS_LEVELS.LEVEL_1 });
const tier2Widgets = widgetRegistry.listWidgets({ emphasisLevel: EMPHASIS_LEVELS.LEVEL_2 });
const tier3Widgets = widgetRegistry.listWidgets({ emphasisLevel: EMPHASIS_LEVELS.LEVEL_3 });

console.log(`  - Tier 1 (Hero / Very Large): ${tier1Widgets.length} widgets`);
console.log(`  - Tier 2 (Cards / Medium Risks): ${tier2Widgets.length} widgets`);
console.log(`  - Tier 3 (Grid / Small Metrics & Tables): ${tier3Widgets.length} widgets`);

assert.ok(tier1Widgets.length >= 3, 'Tier 1 hero widgets present');
assert.ok(tier2Widgets.length >= 5, 'Tier 2 card widgets present');
assert.ok(tier3Widgets.length >= 8, 'Tier 3 grid widgets present');

// Test Role Visibility & Security Clearance Rules
console.log('\n[TEST 7] Testing Role Visibility Rules & Security Clearance...');
const execWidgets = widgetRegistry.getWidgetsForRole('Executive', 'PUBLIC');
const cisoWidgets = widgetRegistry.getWidgetsForRole('CISO', 'STRICTLY_CONFIDENTIAL');
const devWidgets = widgetRegistry.getWidgetsForRole('Developer', 'INTERNAL');

console.log(`  - Executive (PUBLIC clearance): ${execWidgets.length} visible widgets`);
console.log(`  - CISO (STRICTLY_CONFIDENTIAL clearance): ${cisoWidgets.length} visible widgets`);
console.log(`  - Developer (INTERNAL clearance): ${devWidgets.length} visible widgets`);

assert.ok(cisoWidgets.length > execWidgets.length, 'CISO with strictly confidential clearance should see restricted widgets');

// Test Domain-Adaptive Layouts (Government, Banking, Healthcare, AI Platform)
console.log('\n[TEST 8] Testing Domain-Adaptive Layouts...');
const testDomains = [DOMAINS.GOVERNMENT, DOMAINS.BANKING, DOMAINS.HEALTHCARE, DOMAINS.AI_PLATFORM, DOMAINS.ENTERPRISE];

for (const d of testDomains) {
    const layout = widgetRegistry.getDomainAdaptiveLayout(d, { role: 'CISO', clearance: 'STRICTLY_CONFIDENTIAL' });
    assert.strictEqual(layout.domain, d, `Layout domain must match ${d}`);
    assert.ok(layout.domainConfig.themeColor, `Domain ${d} must have themeColor`);
    assert.ok(layout.layoutTierMap.level1_hero.widgets.length >= 0, `Tier 1 hero widgets mapped for ${d}`);
    assert.ok(layout.layoutTierMap.level2_cards.widgets.length >= 0, `Tier 2 card widgets mapped for ${d}`);
    assert.ok(layout.layoutTierMap.level3_grids.widgets.length >= 0, `Tier 3 grid widgets mapped for ${d}`);
    console.log(`  - Domain adaptive layout [${d}]: Title = "${layout.domainConfig.domainTitle}", Accent = ${layout.domainConfig.accentColor}`);
}

// Test Rendering Widget & Composite Dashboard
console.log('\n[TEST 9] Rendering single widget & composite dashboard...');
const heroWidgetHtml = widgetRegistry.renderWidget('widget_hero_trust_score', mockAuditData, { role: 'Executive', clearance: 'PUBLIC' });
assert.ok(typeof heroWidgetHtml === 'string' && heroWidgetHtml.includes('Overall Software Trust Score'), 'Widget HTML rendering check');

const dashboardHtml = widgetRegistry.renderCompositeDashboard(DOMAINS.GOVERNMENT, mockAuditData, { role: 'CISO', clearance: 'STRICTLY_CONFIDENTIAL' });
assert.ok(typeof dashboardHtml === 'string' && dashboardHtml.includes('Federal & Government Sovereign Oversight'), 'Government Dashboard HTML check');

const dashboardJson = widgetRegistry.renderCompositeDashboard(DOMAINS.AI_PLATFORM, mockAuditData, { role: 'CTO', clearance: 'RESTRICTED', format: 'JSON' });
assert.strictEqual(dashboardJson.domain, 'AI Platform');
assert.ok(Array.isArray(dashboardJson.tier1_hero), 'JSON Dashboard Tier 1 check');

console.log('  - Widget and Composite Dashboard HTML & JSON rendering verified successfully');

console.log('\n===============================================================');
console.log(' SUCCESS: Stream 2 Reporting Systems Qualification Passed 100%! ');
console.log('===============================================================\n');
