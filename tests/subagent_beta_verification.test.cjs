/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Subagent Beta Comprehensive Test Suite
 * File           : subagent_beta_verification.test.cjs
 * Version        : 2026.1-LTS
 * Author         : Enterprise Architecture Authority & Systems Engineering
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | RESTRICTED
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
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

const assert = require('assert');
const path = require('path');

const TrustFabricGraph = require('../engine/trust/TrustFabricGraph');
const TrustScoreCalculator = require('../engine/trust/TrustScoreCalculator');
const EvidenceEngine = require('../engine/trust/EvidenceEngine');
const ConfidenceEngine = require('../engine/trust/ConfidenceEngine');
const ReadinessEngine = require('../engine/trust/ReadinessEngine');
const CertificationEngine = require('../engine/trust/CertificationEngine');
const RecommendationEngine = require('../engine/trust/RecommendationEngine');
const PredictionEngine = require('../engine/trust/PredictionEngine');

const OsapEngine = require('../engine/osap/OsapEngine');
const CryptoSigner = require('../engine/osap/CryptoSigner');
const SovereignVerifier = require('../sdk/verifier.cjs');

console.log('================================================================');
console.log('  EAORCS SUBAGENT BETA: TRUST FABRIC, DATA ENGINES, OSAP & SDK  ');
console.log('================================================================\n');

let passCount = 0;
function test(title, fn) {
    try {
        fn();
        passCount++;
        console.log(`✅ [PASS] ${title}`);
    } catch (err) {
        console.error(`❌ [FAIL] ${title}`);
        console.error(err);
        process.exit(1);
    }
}

// -----------------------------------------------------------------------------
// 1. TrustFabricGraph Tests
// -----------------------------------------------------------------------------
test('1. TrustFabricGraph: Core graph initialization & 4 domain projections', () => {
    const graph = new TrustFabricGraph();
    assert.strictEqual(graph.nodes.size >= 8, true);
    assert.strictEqual(graph.edges.length >= 7, true);

    const provGraph = graph.getProvenanceGraph();
    assert.strictEqual(provGraph.nodes.size >= 2, true);

    const evidGraph = graph.getEvidenceGraph();
    assert.strictEqual(evidGraph.nodes.size >= 2, true);

    const bizGraph = graph.getBusinessGraph();
    assert.strictEqual(bizGraph.nodes.size >= 2, true);

    const depGraph = graph.getDependencyGraph();
    assert.strictEqual(depGraph.nodes.size >= 2, true);
});

test('2. TrustFabricGraph: Node/Edge CRUD, pathfinding, centrality & snapshots', () => {
    const graph = new TrustFabricGraph({ autoInitialize: false });
    graph.addNode({ id: 'A', domain: 'PROVENANCE', type: 'Source', label: 'File A', trustWeight: 0.9 });
    graph.addNode({ id: 'B', domain: 'PROVENANCE', type: 'Module', label: 'Module B', trustWeight: 0.95 });
    graph.addNode({ id: 'C', domain: 'EVIDENCE', type: 'Result', label: 'Test Result C', trustWeight: 1.0 });

    graph.addEdge('A', 'B', 'IMPORTS', 0.95);
    graph.addEdge('B', 'C', 'VERIFIED_BY', 1.0);

    const paths = graph.findPaths('A', 'C');
    assert.strictEqual(paths.length, 1);
    assert.deepStrictEqual(paths[0], ['A', 'B', 'C']);

    const centralityB = graph.calculateCentrality('B');
    assert.strictEqual(centralityB.inDegree, 1);
    assert.strictEqual(centralityB.outDegree, 1);

    const snapshotJson = graph.exportSnapshotJson();
    const importedGraph = new TrustFabricGraph({ autoInitialize: false });
    importedGraph.importSnapshot(snapshotJson);

    assert.strictEqual(importedGraph.nodes.size, 3);
    assert.strictEqual(importedGraph.edges.length, 2);

    const trustReport = importedGraph.computeGraphTrustScore();
    assert.strictEqual(trustReport.compositeTrustScore > 80, true);
});

// -----------------------------------------------------------------------------
// 2. Data-driven Trust Engine Tests
// -----------------------------------------------------------------------------
test('3. EvidenceEngine: Canonical hashing, Merkle Tree & Inclusion Proof verification', () => {
    const ee = new EvidenceEngine();
    const rawItems = [
        { id: 'E1', raw: { code: 'A1', passed: true } },
        { id: 'E2', raw: { code: 'B2', passed: true } },
        { id: 'E3', raw: { code: 'C3', passed: true } },
        { id: 'E4', raw: { code: 'D4', passed: false } }
    ];

    const bundle = ee.collectEvidence(rawItems, { collector: 'TEST_SUITE' });
    assert.strictEqual(bundle.totalItems, 4);
    assert.strictEqual(Boolean(bundle.merkleRoot), true);

    const targetHash = bundle.evidenceHashes[1];
    const proof = ee.generateProof(targetHash, bundle.tree);
    const isValidProof = ee.verifyProof(targetHash, proof, bundle.merkleRoot);
    assert.strictEqual(isValidProof, true);

    const Cev = ee.calculateEvidenceConfidence(bundle.items);
    assert.strictEqual(Cev >= 0.5 && Cev <= 1.0, true);
});

test('4. ConfidenceEngine: Statistical confidence, margin of error & Z-Score evaluation', () => {
    const ce = new ConfidenceEngine();
    const evidenceList = Array.from({ length: 15 }, (_, i) => ({
        id: `obs_${i}`,
        score: 95.0 + (i % 3),
        timestamp: new Date().toISOString()
    }));

    const confReport = ce.evaluateConfidence(evidenceList, { totalPopulation: 20 });
    assert.strictEqual(confReport.confidenceScore > 0.70, true);
    assert.strictEqual(confReport.statisticalSignificance, true);
    assert.strictEqual(confReport.marginOfError < 15.0, true);
});

test('5. ReadinessEngine: 15-domain assurance readiness & UAIGOS maturity level', () => {
    const re = new ReadinessEngine();
    const readinessReport = re.evaluateReadiness({
        findings: []
    });

    assert.strictEqual(readinessReport.evaluatedDomainsCount, 15);
    assert.strictEqual(readinessReport.readinessScore, 100.0);
    assert.strictEqual(readinessReport.maturityLevel, 'LEVEL_5_GLOBAL_AUTONOMOUS_PLATFORM');
    assert.strictEqual(readinessReport.isReadyForProduction, true);
});

test('6. TrustScoreCalculator: Trust formula, penalty calculations & tier assignment', () => {
    const tsc = new TrustScoreCalculator();

    // High performance case -> SILVER tier
    const silverResult = tsc.calculateTrustScore({
        readiness: 96.0,
        evidenceConfidence: 1.0,
        statisticalConfidence: 1.0,
        findings: [
            { severity: 'HIGH', domain: 'SECURITY_VULNERABILITIES' }
        ],
        decayDays: 0
    });
    // 96 * (0.5 + 0.3 + 0.2) - 10 = 86.0 -> SILVER
    assert.strictEqual(silverResult.tier, 'SILVER');
    assert.strictEqual(silverResult.penalties.totalPenalty, 10.0);
    assert.strictEqual(silverResult.trustScore, 86.0);

    // Ultra high case -> GOLD tier
    const goldResult = tsc.calculateTrustScore({
        readiness: 98.0,
        evidenceConfidence: 1.0,
        statisticalConfidence: 1.0,
        findings: [],
        decayDays: 0
    });
    assert.strictEqual(goldResult.tier, 'GOLD');
    assert.strictEqual(goldResult.trustScore, 98.0);
});

test('7. CertificationEngine: Software CA issuing Gold certificate with Ed25519 signature', () => {
    const signer = new CryptoSigner();
    const keys = signer.generateKeyPair();
    const ca = new CertificationEngine();

    const trustReport = {
        trustScore: 98.5,
        components: { readiness: 99.0, evidenceConfidence: 1.0, statisticalConfidence: 1.0 },
        merkleRoot: '0x1234567890abcdef'
    };

    const certManifest = ca.issueCertificate(trustReport, { name: 'EAORCS Platform Kernel' }, { privateKey: keys.privateKey });
    assert.strictEqual(certManifest.certificate.tier, 'GOLD');
    assert.strictEqual(certManifest.signatureAlgorithm, 'Ed25519');

    const verifyResult = ca.verifyCertificate(certManifest, { publicKey: keys.publicKey });
    assert.strictEqual(verifyResult.valid, true);
});

test('8. RecommendationEngine: Prescriptive recommendations with financial ROI calculations', () => {
    const rc = new RecommendationEngine();
    const auditResults = {
        findings: [
            { id: 'F1', domain: 'SECURITY_VULNERABILITIES', severity: 'CRITICAL', message: 'Critical vulnerability' },
            { id: 'F2', domain: 'TEST_COVERAGE_QUALITY', severity: 'HIGH', message: 'Low test coverage' }
        ]
    };

    const recReport = rc.generateRecommendations(auditResults, { hourlyRate: 150 });
    assert.strictEqual(recReport.recommendationsCount, 2);
    assert.strictEqual(recReport.summary.totalRemediationCost > 0, true);
    assert.strictEqual(recReport.summary.overallROI > 0, true);
});

test('9. PredictionEngine: Release risk failure probability & Go/No-Go decision', () => {
    const pe = new PredictionEngine();
    
    // Clean system -> GO
    const cleanPrediction = pe.predictReleaseRisk({ trustScore: 98.0 }, { testPassRate: 0.99 });
    assert.strictEqual(cleanPrediction.decision, 'GO');
    assert.strictEqual(cleanPrediction.riskRating, 'LOW');

    // Vulnerable system -> NO_GO
    const riskyPrediction = pe.predictReleaseRisk({
        trustScore: 65.0,
        findings: [{ severity: 'CRITICAL' }, { severity: 'CRITICAL' }]
    }, { testPassRate: 0.80 });

    assert.strictEqual(riskyPrediction.decision, 'NO_GO');
    assert.strictEqual(riskyPrediction.riskRating === 'CRITICAL' || riskyPrediction.riskRating === 'HIGH', true);
});

// -----------------------------------------------------------------------------
// 3. OSAP Engine & CryptoSigner Tests
// -----------------------------------------------------------------------------
test('10. CryptoSigner: Ed25519 RFC 8032 keypair generation, canonical JSON & signing', () => {
    const signer = new CryptoSigner();
    const keys = signer.generateKeyPair();

    const payload = { z: 1, a: 'test', b: [3, 2, 1] };
    const sigObj = signer.signPayload(payload, keys.privateKey);

    assert.strictEqual(sigObj.signatureAlgorithm, 'Ed25519');
    const isValid = signer.verifySignature(payload, sigObj.signature, keys.publicKey);
    assert.strictEqual(isValid, true);
});

test('11. OsapEngine: Passport compilation, schema migration, version negotiation & plugins', () => {
    const osap = new OsapEngine();
    
    // Passport compilation
    const passport = osap.compilePassport({
        trustReport: { trustScore: 97.5, tier: 'GOLD' },
        subject: { name: 'EAORCS Subagent Beta' }
    });

    assert.strictEqual(passport.osap_version, '2.0.0');
    assert.strictEqual(Boolean(passport.issuer.digital_signature), true);

    const valResult = osap.validatePassport(passport);
    assert.strictEqual(valResult.valid, true);

    // Schema Migration
    const legacyV1 = {
        id: 'LEGACY-001',
        trustScore: 90.0,
        appName: 'Legacy Service'
    };
    const migratedV2 = osap.migrateToV2(legacyV1);
    assert.strictEqual(migratedV2.osap_version, '2.0.0');
    assert.strictEqual(migratedV2.subject.artifact_id, 'Legacy Service');

    // Version Negotiation
    const negResult = osap.negotiateVersion('2.0.0');
    assert.strictEqual(negResult.negotiatedVersion, '2.0.0');

    // Plugin Extension
    osap.registerPlugin('SbomExtension', (pass, data) => ({ sbomId: 'SBOM-123', components: data.count }));
    const extended = osap.extendPassport(passport, 'SbomExtension', { count: 50 });
    assert.strictEqual(extended.extensions.SbomExtension.data.sbomId, 'SBOM-123');
});

// -----------------------------------------------------------------------------
// 4. Sovereign Verifier SDK Tests
// -----------------------------------------------------------------------------
test('12. SovereignVerifier SDK: Zero-cloud offline passport & certificate verification', () => {
    const verifier = new SovereignVerifier();
    const osap = new OsapEngine();
    
    const passport = osap.compilePassport({
        trustReport: { trustScore: 99.0, tier: 'GOLD' }
    });

    const passResult = verifier.verifyPassport(passport);
    assert.strictEqual(passResult.valid, true);
    assert.strictEqual(passResult.verification_mode, 'Sovereign Offline Zero-Cloud Zero-Source');

    const certResult = verifier.verifyCertificate({
        certificateId: 'EAORCS-CERT-GOLD-100',
        tier: 'GOLD',
        issuedAt: new Date().toISOString()
    });
    assert.strictEqual(certResult.valid, true);
});

console.log('\n================================================================');
console.log(`  🎉 ALL ${passCount} SUBAGENT BETA VERIFICATION TESTS PASSED SUCCESSFULLY!`);
console.log('================================================================\n');
