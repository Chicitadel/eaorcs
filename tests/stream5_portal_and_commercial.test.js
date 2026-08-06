/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : tests
 * File           : tests/stream5_portal_and_commercial.test.js
 * Version        : 2026.2.0-LTS
 * Author         : Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
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
 * - NIST SP 800-53
 * - EU AI Act
 * - DORA
 * - NIS2
 * - SLSA Level 4
 *
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const { PersonaWorkspaceEngine, PERSONA_DEFINITIONS } = require('../engine/portal/PersonaWorkspaceEngine.js');
const { CommercialReadinessGovernor, DOMAIN_DEFINITIONS } = require('../engine/enterprise/CommercialReadinessGovernor.js');

const EXPECTED_PERSONA_ROLES = [
  'CEO',
  'CIO',
  'CTO',
  'EnterpriseArchitect',
  'SecurityArchitect',
  'ComplianceOfficer',
  'Auditor',
  'Developer',
  'PlatformEngineer',
  'ProductOwner',
  'Procurement',
  'BoardMember'
];

const EXPECTED_COMMERCIAL_DOMAINS = [
  'tenantIsolation',
  'whiteLabelBranding',
  'pluggableReportTemplates',
  'configurableScoringModels',
  'featureFlags',
  'licensingTiers',
  'usageMetering',
  'auditLogging',
  'localization',
  'accessibility',
  'apiVersioning',
  'upgradeCompatibility',
  'extensionSdk',
  'backupAndRestore',
  'disasterRecovery'
];

async function testPersonaWorkspaceEngine() {
  console.log('[Test 1] Testing PersonaWorkspaceEngine...');
  const engine = new PersonaWorkspaceEngine();

  // 1. Supported personas list
  const personasList = engine.getSupportedPersonas();
  assert.strictEqual(personasList.length, 12, 'Must support exactly 12 roles');

  for (const roleId of EXPECTED_PERSONA_ROLES) {
    const def = engine.getPersonaDefinition(roleId);
    assert.ok(def, `Persona definition for ${roleId} must exist`);
    assert.strictEqual(def.id, roleId);
    assert.ok(def.name, `Persona ${roleId} must have a name`);
    assert.ok(def.kpis && def.kpis.length >= 3, `Persona ${roleId} must have at least 3 KPIs`);
    assert.ok(def.terminology && Object.keys(def.terminology).length > 0, `Persona ${roleId} must have custom terminology map`);
    assert.ok(def.layoutEmphasis && def.layoutEmphasis.primaryPanes, `Persona ${roleId} must have layout emphasis`);
    assert.ok(def.shortcuts && def.shortcuts.length >= 3, `Persona ${roleId} must have shortcuts`);
  }

  // 2. Workspace generation with graph data
  const sampleGraph = {
    nodes: [
      { id: 'node-1', category: 'Security', tags: ['ZeroTrust'], label: 'Auth Gateway' },
      { id: 'node-2', category: 'Code', tags: ['Quality'], label: 'Parser Engine' },
      { id: 'node-3', category: 'Governance', tags: ['ISO27001'], label: 'Access Policy' }
    ],
    edges: [
      { source: 'node-1', target: 'node-3', relation: 'ENFORCES' }
    ],
    metrics: {
      'kpi-ceo-1': 99.1,
      'kpi-cto-1': 10.5
    }
  };

  const ceoWorkspace = engine.getWorkspace('CEO', sampleGraph);
  assert.strictEqual(ceoWorkspace.personaId, 'CEO');
  assert.strictEqual(ceoWorkspace.kpis[0].value, 99.1, 'KPI value should be hydrated from graph metrics');
  assert.ok(ceoWorkspace.integrityHash, 'Workspace must produce integrity hash');

  // 3. UI Dashboard View Rendering
  const devDashboard = engine.renderDashboardView('Developer', sampleGraph);
  assert.strictEqual(devDashboard.viewTitle, 'Software Developer Workspace');
  assert.ok(devDashboard.sections.length >= 3, 'Dashboard view must have multiple panel sections');

  // 4. Evidence Graph Filtering
  const filteredGraph = engine.filterEvidenceGraph('SecurityArchitect', sampleGraph);
  assert.ok(filteredGraph.nodes, 'Filtered graph must contain nodes');

  // 5. Workflow Shortcut Execution
  const shortcutRes = engine.executeShortcut('Auditor', 'sc-aud-1');
  assert.ok(shortcutRes.executionId, 'Shortcut execution must return execution ID');

  // 6. Terminology translation
  const translatedTerm = engine.translateTerm('CEO', 'techDebt');
  assert.strictEqual(translatedTerm, 'Operational Risk Index');

  // 7. Custom persona registration
  engine.registerCustomPersona({
    id: 'DevSecOpsLead',
    name: 'DevSecOps Lead',
    kpis: [{ id: 'kpi-custom-1', name: 'Pipeline Vulnerability Gating', unit: '%', target: 100, defaultVal: 100 }],
    shortcuts: [{ id: 'sc-custom-1', label: 'Scan Pipeline', action: 'scan_pipeline' }],
    terminology: { techDebt: 'Pipeline Debt' }
  });
  const customDef = engine.getPersonaDefinition('DevSecOpsLead');
  assert.strictEqual(customDef.name, 'DevSecOps Lead');

  // 8. Integrity check
  const integrity = engine.verifyWorkspaceIntegrity();
  assert.strictEqual(integrity.status, 'PASS');

  console.log('✓ PersonaWorkspaceEngine tests passed successfully!\n');
}

async function testCommercialReadinessGovernor() {
  console.log('[Test 2] Testing CommercialReadinessGovernor...');
  const governor = new CommercialReadinessGovernor();

  // 1. Supported domain count
  const domains = governor.getSupportedDomains();
  assert.strictEqual(domains.length, 15, 'Must support 15 enterprise commercial readiness domains');

  for (const domainKey of EXPECTED_COMMERCIAL_DOMAINS) {
    const res = governor.evaluateReadinessDomain(domainKey);
    assert.ok(res, `Domain ${domainKey} evaluation must return valid object`);
    assert.strictEqual(res.domainId, domainKey);
    assert.ok(res.checks && res.checks.length >= 4, `Domain ${domainKey} must have at least 4 required checks`);
    assert.strictEqual(res.score, 100, `Default heuristic score for ${domainKey} should be 100%`);
  }

  // 2. Full domain evaluation summary
  const summary = governor.evaluateAllDomains();
  assert.strictEqual(summary.overallStatus, 'COMMERCIALLY_READY');
  assert.strictEqual(summary.overallScore, 100);
  assert.strictEqual(summary.totalDomains, 15);

  // 3. Procurement checklist generation
  const checklist = governor.generateProcurementChecklist();
  assert.ok(checklist.reportId, 'Checklist must contain reportId');
  assert.strictEqual(checklist.readinessScore, 100);
  assert.strictEqual(checklist.governancePassed, true);
  assert.ok(checklist.attestationSignature, 'Checklist must be cryptographically signed');

  // 4. Commercial readiness certificate issuing
  const certificate = governor.generateCommercialReadinessCertificate();
  assert.ok(certificate.certificateId.startsWith('CERT-COMM-READINESS-'));
  assert.strictEqual(certificate.commercialReadinessScore, '100%');
  assert.ok(certificate.digitalSignature, 'Certificate must have digital signature');
  assert.strictEqual(certificate.standardsCompliance.length, 7);

  // 5. Custom check evaluator registration
  governor.registerCustomCheck('tenant_context_propagation', (state) => {
    return { passed: true, detail: 'Custom tenant context propagation engine verified.' };
  });

  const customEvalRes = governor.evaluateReadinessDomain('tenantIsolation');
  assert.strictEqual(customEvalRes.checks[0].detail, 'Custom tenant context propagation engine verified.');

  // 6. Domain Status Summary Matrix
  const matrix = governor.getDomainStatusSummary();
  assert.strictEqual(Object.keys(matrix).length, 15);

  // 7. Governor integrity self-check
  const integrity = governor.verifyGovernorIntegrity();
  assert.strictEqual(integrity.status, 'PASS');
  assert.strictEqual(integrity.domainCount, 15);

  console.log('✓ CommercialReadinessGovernor tests passed successfully!\n');
}

async function runAllStream5Tests() {
  console.log('================================================================');
  console.log('       EAORCS STREAM 5 SUITE — PORTAL & COMMERCIAL GOVERNOR    ');
  console.log('================================================================\n');

  await testPersonaWorkspaceEngine();
  await testCommercialReadinessGovernor();

  console.log('================================================================');
  console.log('  ALL STREAM 5 SUITE TESTS PASSED 100% CLEANLY!');
  console.log('================================================================');
}

if (require.main === module) {
  runAllStream5Tests().catch(err => {
    console.error('Test run failed:', err);
    process.exit(1);
  });
}

module.exports = {
  runAllStream5Tests
};
