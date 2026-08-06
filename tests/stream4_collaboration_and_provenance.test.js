/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Stream 4 — Collaboration & Provenance Engine Verification Suite
 * File           : stream4_collaboration_and_provenance.test.js
 * Version        : 2026.1.0-LTS
 * Author         : Ujomor Systems Engineering & Enterprise Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Human Author & Corporate Governance Enforced
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
 * Signatures:
 * - Architecture Authority: Verified (Ujomor Architecture Board)
 * - Security Authority: Verified (Ujomor Security Operations)
 * - Governance Authority: Verified (Ujomor Enterprise Governance)
 * - Deployment Authority: Verified (Ujomor Release Engineering)
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');

const EnterpriseCollaborationEngine = require('../engine/collaboration/EnterpriseCollaborationEngine');
const CryptographicProvenanceChain = require('../engine/provenance/CryptographicProvenanceChain');

async function runStream4TestSuite() {
    console.log('========================================================================');
    console.log('   EAORCS Stream 4: Collaboration & Provenance Engine Qualification');
    console.log('========================================================================\n');

    let passedTests = 0;
    let totalTests = 0;

    function test(name, fn) {
        totalTests++;
        try {
            fn();
            console.log(`  [PASS] Test ${totalTests}: ${name}`);
            passedTests++;
        } catch (err) {
            console.error(`  [FAIL] Test ${totalTests}: ${name}`);
            console.error(`         ${err.stack || err.message}`);
        }
    }

    // --- PART 1: EnterpriseCollaborationEngine Tests ---
    console.log('--- Subsystem 1: EnterpriseCollaborationEngine ---');

    const tempStorage = path.join(__dirname, '../tmp/test_collaboration_state.json');
    if (fs.existsSync(tempStorage)) fs.unlinkSync(tempStorage);

    const collabEngine = new EnterpriseCollaborationEngine({
        storagePath: tempStorage,
        secretKey: 'TEST-SECRET-KEY-2026'
    });

    test('1. Discussions & Annotations Creation and Resolution', () => {
        const disc = collabEngine.createDiscussion({
            targetId: 'art_architecture_doc_001',
            targetType: 'ARCHITECTURE_DECISION_RECORD',
            author: 'alice@ujomor.com',
            title: 'ADR-042 Microservice Boundary Review',
            content: 'Please review bounded context boundaries for the Telemetry Subsystem.'
        });

        assert.strictEqual(disc.status, 'OPEN');
        assert.ok(disc.id.startsWith('disc_'));

        const ann = collabEngine.addAnnotation(disc.id, {
            author: 'bob@ujomor.com',
            selector: { lineStart: 14, lineEnd: 20, file: 'engine/telemetry/TelemetryEngine.js' },
            comment: 'Ensure rate limiting policy rules are attached.',
            severity: 'COMPLIANCE_VIOLATION'
        });

        assert.strictEqual(ann.severity, 'COMPLIANCE_VIOLATION');
        assert.strictEqual(disc.annotations.length, 1);

        const reply = collabEngine.addReply(disc.id, {
            author: 'alice@ujomor.com',
            content: 'Rate limiting policy added in PR #104.'
        });

        assert.strictEqual(disc.replies.length, 1);

        const resolved = collabEngine.resolveDiscussion(disc.id, 'carol@ujomor.com', 'Approved after PR merge');
        assert.strictEqual(resolved.status, 'RESOLVED');
        assert.strictEqual(resolved.annotations[0].status, 'RESOLVED');
    });

    test('2. Evidence Review Threads with Regulatory Controls', () => {
        const thread = collabEngine.createEvidenceReviewThread({
            evidenceId: 'ev_proof_iso27001_a12',
            reviewer: 'auditor@ujomor.com',
            controlId: 'ISO_27001_A.12.1.2',
            standard: 'ISO_27001',
            notes: 'Initial audit verification'
        });

        assert.strictEqual(thread.status, 'UNDER_REVIEW');

        const updated = collabEngine.reviewEvidence(thread.id, {
            reviewer: 'auditor@ujomor.com',
            decision: 'APPROVED',
            feedback: 'Evidence meets ISO 27001 audit proof requirements.',
            findings: []
        });

        assert.strictEqual(updated.status, 'APPROVED');
        assert.strictEqual(updated.reviewHistory.length, 2);
    });

    test('3. Dual-Control Approval Workflow & Segregation of Duties', () => {
        const req = collabEngine.createGovernanceRequest({
            requestType: 'PRODUCTION_RELEASE',
            title: 'Release v2026.2.0-LTS to Production',
            description: 'Major platform release candidate sign-off',
            requester: 'devops_lead@ujomor.com',
            targetArtifactId: 'release_v2026.2.0.tar.gz',
            payload: { buildNumber: 9948, checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' },
            requiredSignOffs: ['ARCHITECTURE', 'COMPLIANCE'],
            quorumRequired: 2
        });

        assert.strictEqual(req.status, 'PENDING_APPROVAL');

        // Test Segregation of Duties: Requester cannot approve their own request
        assert.throws(() => {
            collabEngine.submitApproval(req.id, {
                approver: 'devops_lead@ujomor.com',
                role: 'ARCHITECTURE',
                comments: 'Self approval attempt'
            });
        }, /Dual-Control Enforcement/);

        // Architecture Approver signs off
        const app1 = collabEngine.submitApproval(req.id, {
            approver: 'arch_officer@ujomor.com',
            role: 'ARCHITECTURE',
            comments: 'Architecture ADR alignment verified.'
        });
        assert.strictEqual(req.status, 'PENDING_APPROVAL'); // Needs 2 sign-offs

        // Test Segregation of Duties: Duplicate role approval rejected
        assert.throws(() => {
            collabEngine.submitApproval(req.id, {
                approver: 'another_arch@ujomor.com',
                role: 'ARCHITECTURE',
                comments: 'Duplicate role approval'
            });
        }, /Dual-Control Enforcement/);

        // Compliance Approver signs off
        const app2 = collabEngine.submitApproval(req.id, {
            approver: 'compliance_officer@ujomor.com',
            role: 'COMPLIANCE',
            comments: 'ISO 27001 & SOC 2 compliance verified.'
        });

        // Should auto-transition to APPROVED
        assert.strictEqual(req.status, 'APPROVED');

        // Execute request
        const executed = collabEngine.executeGovernanceRequest(req.id, 'deployer_service@ujomor.com');
        assert.strictEqual(executed.status, 'EXECUTED');
        assert.strictEqual(executed.executedBy, 'deployer_service@ujomor.com');
    });

    test('4. Cryptographic Digital Signature Verification & Review Queue', () => {
        const payload = { test: 'payload_data', timestamp: new Date().toISOString() };
        const sig = collabEngine.generateDigitalSignature(payload);
        assert.strictEqual(sig.algorithm, 'HMAC-SHA256');
        assert.ok(sig.signature.length > 0);

        const valid = collabEngine.verifyDigitalSignature(sig);
        assert.strictEqual(valid, true);

        const queue = collabEngine.getReviewQueue();
        assert.ok(queue.length > 0);

        const metrics = collabEngine.getMetrics();
        assert.strictEqual(metrics.dualControlEnforcementRatePercent, 100.0);
    });

    // --- PART 2: CryptographicProvenanceChain Tests ---
    console.log('\n--- Subsystem 2: CryptographicProvenanceChain ---');

    const tempProvStorage = path.join(__dirname, '../tmp/test_provenance_state.json');
    if (fs.existsSync(tempProvStorage)) fs.unlinkSync(tempProvStorage);

    const provEngine = new CryptographicProvenanceChain({
        storagePath: tempProvStorage,
        secretKey: 'TEST-PROV-SECRET-2026'
    });

    test('5. Record Provenance Chain of Custody (Genesis & Appends)', () => {
        const artifactId = 'art_core_kernel_bin';
        const content = 'const EAORCS_KERNEL = { version: "2026.1-LTS" };';

        // Step 1: Genesis block
        const b1 = provEngine.recordProvenance({
            artifactId,
            artifactName: 'EAORCS Core Kernel',
            artifactType: 'SOURCE_CODE',
            content,
            producedBy: 'alice_developer',
            action: 'CREATE',
            toolName: 'EAORCS-Compiler',
            repositoryUrl: 'git@github.com:Chicitadel/eaorcs.git',
            commitHash: 'a1b2c3d4e5f678901234567890abcdef12345678',
            policyId: 'UAIGOS-POLICY-SECURITY-1'
        });

        assert.strictEqual(b1.blockIndex, 0);
        assert.strictEqual(b1.previousHash, '0000000000000000000000000000000000000000000000000000000000000000');
        assert.ok(b1.blockHash.length === 64);

        // Step 2: Build / Transformation block
        const b2 = provEngine.recordProvenance({
            artifactId,
            artifactName: 'EAORCS Core Kernel Bundle',
            artifactType: 'COMPILED_BUNDLE',
            content: 'compiled_bundle_binary_payload_stream',
            producedBy: 'ci_builder_agent',
            action: 'BUILD',
            toolName: 'Webpack-EAORCS-Optimizer',
            repositoryUrl: 'git@github.com:Chicitadel/eaorcs.git',
            commitHash: 'a1b2c3d4e5f678901234567890abcdef12345678',
            policyId: 'UAIGOS-POLICY-BUILD-2'
        });

        assert.strictEqual(b2.blockIndex, 1);
        assert.strictEqual(b2.previousHash, b1.blockHash);
    });

    test('6. Cryptographic Chain of Custody Integrity Verification', () => {
        const artifactId = 'art_core_kernel_bin';
        const verification = provEngine.verifyChainOfCustody(artifactId);
        
        assert.strictEqual(verification.verified, true);
        assert.strictEqual(verification.chainLength, 2);
        assert.strictEqual(verification.status, 'PROVENANCE_CHAIN_VERIFIED_INTACT');

        // Check artifact content integrity
        const contentIntegrity = provEngine.verifyArtifactIntegrity(artifactId, 'compiled_bundle_binary_payload_stream');
        assert.strictEqual(contentIntegrity.intact, true);
    });

    test('7. Tamper Detection in Cryptographic Chain of Custody', () => {
        const artifactId = 'art_tamper_test';
        provEngine.recordProvenance({
            artifactId,
            content: 'Original Untampered Data',
            producedBy: 'honest_user',
            action: 'CREATE'
        });

        provEngine.recordProvenance({
            artifactId,
            content: 'Original Untampered Data Step 2',
            producedBy: 'honest_user',
            action: 'UPDATE'
        });

        // Corrupt internal chain payload to simulate tampering
        const chain = provEngine.chains.get(artifactId);
        chain[0].producedBy = 'MALICIOUS_ATTACKER_IDENTITY';

        const verification = provEngine.verifyChainOfCustody(artifactId);
        assert.strictEqual(verification.verified, false);
        assert.ok(verification.reason.includes('tampering detected') || verification.reason.includes('Digest mismatch'));
    });

    test('8. Provenance Manifest Export & System Metrics', () => {
        const artifactId = 'art_manifest_export_test';
        provEngine.recordProvenance({
            artifactId,
            artifactName: 'Security Certification Artifact',
            content: 'CERTIFICATE_PAYLOAD_BODY',
            producedBy: 'security_lead',
            action: 'SIGN'
        });

        const manifest = provEngine.exportProvenanceManifest(artifactId);
        assert.strictEqual(manifest.manifestType, 'EAORCS_CRYPTOGRAPHIC_PROVENANCE_MANIFEST_v1');
        assert.strictEqual(manifest.chainOfCustody.length, 1);
        assert.strictEqual(manifest.chainOfCustody[0].who.producedBy, 'security_lead');

        const metrics = provEngine.getSystemProvenanceMetrics();
        assert.ok(metrics.totalArtifactsTracked >= 3);
        assert.ok(metrics.totalBlocksRecorded >= 4);
    });

    // Cleanup temp files
    if (fs.existsSync(tempStorage)) fs.unlinkSync(tempStorage);
    if (fs.existsSync(tempProvStorage)) fs.unlinkSync(tempProvStorage);

    console.log(`\nStream 4 Qualification Test Summary: ${passedTests}/${totalTests} Passed.`);
    if (passedTests !== totalTests) {
        process.exit(1);
    }
}

runStream4TestSuite().catch(err => {
    console.error('Fatal error during Stream 4 test suite:', err);
    process.exit(1);
});
