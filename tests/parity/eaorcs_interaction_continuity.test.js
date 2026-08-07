/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Interaction Continuity & Law 13 Test Suite
 * File           : eaorcs_interaction_continuity.test.js
 * Version        : 2026.3.0-LTS
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
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

const assert = require('assert');
const path = require('path');
const {
    EAORCS,
    PlatformConstitutionEngine,
    InteractionContractEngine,
    CapabilityNegotiationEngine,
    ProgressiveDisclosureEngine,
    SurfaceWorkflowProfileEngine,
    OfflineContractEngine,
    CrossSurfaceSessionEngine,
    RendererRegistryEngine,
    FlutterSurfaceAdapter
} = require('../../engine');

async function runEAORCSInteractionContinuityTests() {
    console.log('================================================================');
    console.log('  EAORCS INTERACTION CONTINUITY & LAW 13 CERTIFICATION SUITE');
    console.log('================================================================\n');

    const projectRoot = path.resolve(__dirname, '../../');

    // 1. Test Constitution Law 13 (Interaction Continuity)
    console.log('[1] Testing Platform Constitution Law 13 Compliance...');
    const constitutionReport = EAORCS.verifyConstitution(projectRoot);

    assert.strictEqual(constitutionReport.isFullyCompliant, true);
    assert.strictEqual(constitutionReport.certifiedLawsCount, 13);
    console.log(`    ✓ Constitution Version: ${constitutionReport.constitutionVersion}`);
    console.log(`    ✓ Law 13 Certified:      ${constitutionReport.evaluations[12].name} (${constitutionReport.evaluations[12].status})`);

    // 2. Test Decoupled Interaction Contract Engine
    console.log('\n[2] Testing Decoupled Interaction Contract Layer...');
    const contractEngine = new InteractionContractEngine();
    const cliContract = contractEngine.resolveContract('SURFACE-CLI');
    const flutterContract = contractEngine.resolveContract('SURFACE-FLUTTER');

    assert.strictEqual(cliContract.interactionPattern, 'KEYBOARD_COMMAND_FIRST');
    assert.strictEqual(flutterContract.interactionPattern, 'TOUCH_GESTURE_FIRST');
    console.log(`    ✓ CLI Interaction Pattern:     ${cliContract.interactionPattern}`);
    console.log(`    ✓ Flutter Interaction Pattern: ${flutterContract.interactionPattern}`);

    // 3. Test Graceful Capability Negotiation
    console.log('\n[3] Testing Capability Negotiation Engine...');
    const textNegotied = EAORCS.negotiatePresentation('Chart', { supportsGraphics: false, supportsInteractive: true });
    const graphicNegotied = EAORCS.negotiatePresentation('Chart', { supportsGraphics: true });

    assert.strictEqual(textNegotied.mode, 'TEXT_TABLE');
    assert.strictEqual(graphicNegotied.mode, 'GRAPHICAL_CHART');
    console.log(`    ✓ Non-Graphical Surface Degraded: Chart -> ${textNegotied.mode} (${textNegotied.type})`);
    console.log(`    ✓ Graphical Surface Rendered:    Chart -> ${graphicNegotied.mode} (${graphicNegotied.type})`);

    // 4. Test Progressive Disclosure Framework
    console.log('\n[4] Testing Progressive Disclosure Engine...');
    const disclosureEngine = new ProgressiveDisclosureEngine();
    const mockModel = { summary: { projectName: 'EAORCS', overallScorePct: 92 }, recommendations: ['R1', 'R2'], evidence: { auditTrailHash: 'H1' } };

    const summaryTier = disclosureEngine.filterLevel(mockModel, 'SUMMARY');
    const detailsTier = disclosureEngine.filterLevel(mockModel, 'DETAILS');

    assert.strictEqual(summaryTier.disclosureLevel, 'SUMMARY');
    assert.strictEqual(detailsTier.disclosureLevel, 'DETAILS');
    console.log(`    ✓ Cognitive Load Managed: Summary Tier -> Score ${summaryTier.overallScorePct}% | Details Tier -> ${detailsTier.recommendations.length} Recommendations.`);

    // 5. Test Surface Workflow Profiles
    console.log('\n[5] Testing Surface Workflow Persona Profiles...');
    const profileEngine = new SurfaceWorkflowProfileEngine();
    const execProfile = profileEngine.resolveProfile('Executive');
    const archProfile = profileEngine.resolveProfile('Architect');

    assert.strictEqual(execProfile.defaultDisclosure, 'SUMMARY');
    assert.strictEqual(archProfile.defaultDisclosure, 'DETAILS');
    console.log(`    ✓ Executive Persona Profile: Disclosure='${execProfile.defaultDisclosure}'`);
    console.log(`    ✓ Architect Persona Profile: Disclosure='${archProfile.defaultDisclosure}'`);

    // 6. Test Offline-First Contract Engine
    console.log('\n[6] Testing Offline-First Contract Engine...');
    const offlineEngine = new OfflineContractEngine();
    const offlineStatus = offlineEngine.verifyOfflineContract(false);

    assert.strictEqual(offlineStatus.status, 'OFFLINE_RESILIENT');
    assert.strictEqual(offlineStatus.offlineCapabilities.journalReplaySupported, true);
    console.log(`    ✓ Offline Execution Resilient: ${offlineStatus.status} (Cached Twin & Journal Replay Active).`);

    // 7. Test Cross-Surface Session Continuity (Law 13 Implementation)
    console.log('\n[7] Testing Cross-Surface Session Continuity (Law 13)...');
    const sessionEngine = new CrossSurfaceSessionEngine();
    const session = sessionEngine.startOrGetSession('SESS-LAW13-001', { surface: 'VSCODE', projectRoot });

    const resumedResult = EAORCS.resumeSession('SESS-LAW13-001', 'CLI');
    assert.strictEqual(resumedResult.status, 'SESSION_RESUMED');
    assert.strictEqual(resumedResult.session.surfacesCount, 2);
    console.log(`    ✓ Cross-Surface Session Resumed Across: ${resumedResult.session.surfaces.join(' -> ')}`);

    // 8. Test Plugin-Based Renderer Registry
    console.log('\n[8] Testing Plugin-Based Renderer Registry...');
    const rendererRegistry = new RendererRegistryEngine();
    const renderers = rendererRegistry.listRenderers();

    assert.ok(renderers.length >= 7);
    console.log(`    ✓ Extensible Plugin Renderers Registered: ${renderers.length} (${renderers.map(r => r.name).join(', ')})`);

    // 9. Test Flutter Touch-Native Surface Adapter
    console.log('\n[9] Testing Flutter Touch-Native Surface Adapter...');
    const flutterAdapter = new FlutterSurfaceAdapter();
    const flutterWidgets = flutterAdapter.renderFlutterWidgets(mockModel, 'FlutterMobile');

    assert.strictEqual(flutterWidgets.surfaceCategory, 'FLUTTER_TOUCH_NATIVE');
    assert.strictEqual(flutterWidgets.touchGestures.swipeToApprove, true);
    console.log(`    ✓ Touch-Native Flutter Widgets Rendered: Platform '${flutterWidgets.targetPlatform}' (SwipeToApprove=${flutterWidgets.touchGestures.swipeToApprove}).`);

    console.log('\n================================================================');
    console.log('  INTERACTION CONTINUITY & LAW 13 CERTIFICATION PASSED (100% SUCCESS)');
    console.log('  SESSIONS & UX ARE CONTINUOUS, NEGOTIATED, AND DECOUPLED');
    console.log('================================================================\n');
}

if (require.main === module) {
    runEAORCSInteractionContinuityTests().catch(err => {
        console.error('Interaction Continuity Test Error:', err);
        process.exit(1);
    });
}

module.exports = runEAORCSInteractionContinuityTests;
