/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Test Suite (Streams 3 & 4 - Phase 6)
 * File           : federation_persistence.test.js
 * Version        : 2026.1-LTS (v1.0.0-FROZEN)
 * Author         : Ujomor Systems & Enterprise Governance Authority
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

const fs = require('fs');
const path = require('path');
const MicroserviceFederationEngine = require('../../engine/federation/MicroserviceFederationEngine');
const PersistentGraphDatabase = require('../../engine/knowledge/PersistentGraphDatabase');

const TEST_STORAGE_DIR = path.resolve(__dirname, '../../storage/test_phase6_graphdb');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  [PASS] ${message}`);
        passCount++;
    } else {
        console.error(`  [FAIL] ${message}`);
        failCount++;
    }
}

async function runTestSuite() {
    console.log('==============================================================================');
    console.log('  EAORCS PHASE 6 TEST SUITE: FEDERATION ENGINE & GRAPH PERSISTENCE');
    console.log('==============================================================================\n');

    // Clean test storage dir before running
    if (fs.existsSync(TEST_STORAGE_DIR)) {
        fs.rmSync(TEST_STORAGE_DIR, { recursive: true, force: true });
    }

    try {
        // --------------------------------------------------------------------------
        // TEST 1: Service Registration & Microservice Topology Federation
        // --------------------------------------------------------------------------
        console.log('[TEST 1] Registering Distributed Service Repositories & Building Topology...');
        const federationEngine = new MicroserviceFederationEngine();

        const authService = federationEngine.registerServiceRepository('auth-service', '/repos/auth-service', {
            version: '2.1.0',
            domain: 'Identity & Access',
            owner: 'Security Team',
            dependencies: [],
            endpoints: [
                { id: 'POST /auth/token', method: 'POST', path: '/auth/token', reqId: 'REQ-AUTH-101' },
                { id: 'GET /auth/verify', method: 'GET', path: '/auth/verify', reqId: 'REQ-AUTH-101' }
            ],
            requirements: ['REQ-AUTH-101', 'REQ-GOV-001'],
            codeModules: [
                { path: 'src/controllers/authController.js', exports: ['issueToken', 'verifyToken'], reqId: 'REQ-AUTH-101' }
            ],
            testSuites: [
                { name: 'auth_security.test.js', testsReq: ['REQ-AUTH-101'] }
            ],
            evidence: [
                { id: 'EVID-AUTH-001', hash: 'a1b2c3d4e5f678901234567890abcdef1234567890abcdef1234567890abcdef', reqId: 'REQ-AUTH-101' }
            ]
        });

        const paymentService = federationEngine.registerServiceRepository('payment-service', '/repos/payment-service', {
            version: '1.4.2',
            domain: 'Financial Transactions',
            owner: 'FinTech Guild',
            dependencies: ['auth-service'],
            endpoints: [
                { id: 'POST /payment/charge', method: 'POST', path: '/payment/charge', reqId: 'REQ-PAY-001', calls: ['auth-service'] }
            ],
            requirements: ['REQ-PAY-001', 'REQ-GOV-001'],
            codeModules: [
                { path: 'lib/processor.js', exports: ['processCard'], reqId: 'REQ-PAY-001' }
            ],
            testSuites: [
                { name: 'payment_flow.test.js', testsReq: ['REQ-PAY-001'] }
            ],
            evidence: [
                { id: 'EVID-PAY-001', hash: 'f6e5d4c3b2a109876543210987fedcba0987654321fedcba0987654321fedcba', reqId: 'REQ-PAY-001' }
            ]
        });

        const orderService = federationEngine.registerServiceRepository('order-service', '/repos/order-service', {
            version: '3.0.1',
            domain: 'Order Management',
            owner: 'Core Platform Team',
            dependencies: ['auth-service', 'payment-service'],
            endpoints: [
                { id: 'POST /orders', method: 'POST', path: '/orders', reqId: 'REQ-ORD-001', calls: ['auth-service', 'payment-service'] }
            ],
            requirements: ['REQ-ORD-001', 'REQ-PAY-001'],
            codeModules: [
                { path: 'services/orderManager.js', exports: ['createOrder'], reqId: 'REQ-ORD-001' }
            ],
            testSuites: [
                { name: 'orders_e2e.test.js', testsReq: ['REQ-ORD-001'] }
            ],
            evidence: [
                { id: 'EVID-ORD-001', hash: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', reqId: 'REQ-ORD-001' }
            ]
        });

        assert(authService.serviceName === 'auth-service', 'auth-service registered successfully');
        assert(paymentService.serviceName === 'payment-service', 'payment-service registered successfully');
        assert(orderService.serviceName === 'order-service', 'order-service registered successfully');

        const topology = federationEngine.federateRepositories();
        assert(topology.services.length === 3, 'Federated topology contains 3 services');
        assert(topology.nodes.length > 10, `Federated topology contains ${topology.nodes.length} nodes (> 10)`);
        assert(topology.edges.length > 10, `Federated topology contains ${topology.edges.length} edges (> 10)`);
        assert(typeof topology.metadata.merkleHash === 'string' && topology.metadata.merkleHash.length === 64, 'Topology Merkle hash computed correctly');

        // --------------------------------------------------------------------------
        // TEST 2: Cross-Service Traceability Lookup
        // --------------------------------------------------------------------------
        console.log('\n[TEST 2] Executing Cross-Service Traceability Query...');
        const traceAuth = federationEngine.findCrossServiceTraceability('REQ-AUTH-101');
        assert(traceAuth.reqId === 'REQ-AUTH-101', 'Traceability returned correct reqId');
        assert(traceAuth.participatingServices.includes('auth-service'), 'Traceability identifies auth-service');
        assert(traceAuth.isFullyTraced === true, 'REQ-AUTH-101 is fully traced across code, test, and evidence');
        assert(traceAuth.coverage.score === 1.0, 'REQ-AUTH-101 has 100% coverage score');

        const tracePay = federationEngine.findCrossServiceTraceability('REQ-PAY-001');
        assert(tracePay.participatingServices.includes('payment-service'), 'Traceability identifies payment-service for REQ-PAY-001');
        assert(tracePay.participatingServices.includes('order-service'), 'Traceability identifies order-service cross-reference for REQ-PAY-001');

        // --------------------------------------------------------------------------
        // TEST 3: Persistent Graph Database - Save Graph Snapshot
        // --------------------------------------------------------------------------
        console.log('\n[TEST 3] Exporting Federated Graph & Saving Snapshot to Persistent DB...');
        const exportedGraph = federationEngine.exportFederatedGraph();
        const db = new PersistentGraphDatabase(TEST_STORAGE_DIR);

        const snap1 = db.saveGraphSnapshot('phase6_snapshot_001', exportedGraph);
        assert(snap1.snapshotId === 'phase6_snapshot_001', 'Saved snapshot with ID phase6_snapshot_001');
        assert(fs.existsSync(snap1.filePath), 'Snapshot file created on disk');
        assert(snap1.merkleHash === exportedGraph.merkleHash, 'Saved snapshot Merkle hash matches topology graph Merkle hash');

        // Save a second snapshot for history / listing test
        const snap2 = db.saveGraphSnapshot('phase6_snapshot_002', {
            version: '2026.1-LTS',
            metadata: { description: 'Second snapshot test' },
            nodes: exportedGraph.nodes,
            edges: exportedGraph.edges
        });
        assert(snap2.snapshotId === 'phase6_snapshot_002', 'Saved second snapshot with ID phase6_snapshot_002');

        // --------------------------------------------------------------------------
        // TEST 4: Persistent Graph Database - Snapshot Listing
        // --------------------------------------------------------------------------
        console.log('\n[TEST 4] Listing Persisted Snapshots...');
        const snapshotsList = db.listSnapshots();
        assert(snapshotsList.length === 2, `listSnapshots returned 2 snapshots (found ${snapshotsList.length})`);
        assert(snapshotsList.some(s => s.snapshotId === 'phase6_snapshot_001'), 'List contains phase6_snapshot_001');
        assert(snapshotsList.some(s => s.snapshotId === 'phase6_snapshot_002'), 'List contains phase6_snapshot_002');

        // --------------------------------------------------------------------------
        // TEST 5: Persistent Graph Database - Loading Snapshot & Querying
        // --------------------------------------------------------------------------
        console.log('\n[TEST 5] Loading Graph Snapshot & Executing Graph Queries...');
        const loadedSnap = db.loadGraphSnapshot('phase6_snapshot_001');
        assert(loadedSnap.snapshotId === 'phase6_snapshot_001', 'loadGraphSnapshot returned correct snapshot object');

        const serviceNodes = db.queryNodes(n => n.type === 'SERVICE');
        assert(serviceNodes.length === 3, `queryNodes filtered 3 SERVICE nodes (found ${serviceNodes.length})`);

        const endpointNodes = db.queryNodes(n => n.type === 'ENDPOINT');
        assert(endpointNodes.length === 4, `queryNodes filtered 4 ENDPOINT nodes (found ${endpointNodes.length})`);

        const crossServiceEdges = db.queryEdges(e => e.type === 'CROSS_SERVICE_DEPENDENCY');
        assert(crossServiceEdges.length >= 3, `queryEdges filtered cross-service dependency edges (found ${crossServiceEdges.length})`);

        // --------------------------------------------------------------------------
        // TEST 6: Cryptographic Merkle Hash Integrity & Tamper Detection
        // --------------------------------------------------------------------------
        console.log('\n[TEST 6] Verifying Snapshot Integrity & Tamper Detection...');
        const integrityBefore = db.verifySnapshotIntegrity('phase6_snapshot_001');
        assert(integrityBefore.isValid === true, 'Snapshot integrity verification PASSED for original snapshot');
        assert(integrityBefore.expectedHash === integrityBefore.actualHash, 'Expected Merkle hash matches actual calculated Merkle hash');

        // Tamper with snapshot file on disk
        console.log('  -> Intentionally tampering with phase6_snapshot_001 file on disk...');
        const snapFilePath = integrityBefore.filePath;
        const fileContent = JSON.parse(fs.readFileSync(snapFilePath, 'utf8'));
        fileContent.nodes[0].name = 'tampered-service-name';
        fs.writeFileSync(snapFilePath, JSON.stringify(fileContent, null, 2), 'utf8');

        const integrityAfterTamper = db.verifySnapshotIntegrity('phase6_snapshot_001');
        assert(integrityAfterTamper.isValid === false, 'Snapshot integrity verification correctly FAILED after file tampering');
        assert(integrityAfterTamper.expectedHash !== integrityAfterTamper.actualHash, 'Expected Merkle hash differs from actual calculated hash upon tampering');

        // --------------------------------------------------------------------------
        // SUMMARY
        // --------------------------------------------------------------------------
        console.log('\n==============================================================================');
        console.log(`  PHASE 6 TEST SUITE SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
        console.log('==============================================================================\n');

        if (failCount > 0) {
            process.exit(1);
        } else {
            process.exit(0);
        }

    } catch (err) {
        console.error('\n[UNHANDLED ERROR IN TEST SUITE]', err);
        process.exit(1);
    } finally {
        // Cleanup test directory after test execution
        if (fs.existsSync(TEST_STORAGE_DIR)) {
            fs.rmSync(TEST_STORAGE_DIR, { recursive: true, force: true });
        }
    }
}

runTestSuite();
