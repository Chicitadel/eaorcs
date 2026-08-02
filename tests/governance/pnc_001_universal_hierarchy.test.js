/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : PNC-001 Platform Neutrality & 10-Tier Universal Hierarchy Test Suite
 * File           : pnc_001_universal_hierarchy.test.js
 * Version        : 2026.1-LTS (v1.0.0-FROZEN)
 * Author         : Architectural Governance Council & Ujomor Systems Engineering
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-02
 * Last Modified  : 2026-08-02
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 * - PNC-001 Platform Neutrality Compliant
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
const fs = require('fs');
const path = require('path');
const os = require('os');

const {
    ProjectRegistry,
    HIERARCHY_TIERS,
    TIER_LEVELS
} = require('../../engine/governance/ProjectRegistry');

const {
    TechnologyDetector,
    NodeJsAdapter,
    JavaAdapter,
    GoAdapter,
    PythonAdapter,
    RustAdapter,
    PhpAdapter,
    DotNetAdapter,
    DockerAdapter,
    IacAdapter
} = require('../../engine/governance/TechnologyDetector');

function runPnc001AndHierarchyTests() {
    console.log('=== Running Stream 1: PNC-001 Contract & Universal Resource Hierarchy Tests ===\n');
    const results = [];
    const tmpDir = path.join(os.tmpdir(), `eaorcs_pnc_test_${Date.now()}`);

    if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
    }

    // TEST 1: CommonJS module exports requirement check
    try {
        assert.ok(ProjectRegistry, 'ProjectRegistry should be exported cleanly');
        assert.ok(Array.isArray(HIERARCHY_TIERS), 'HIERARCHY_TIERS should be exported');
        assert.strictEqual(HIERARCHY_TIERS.length, 11, 'HIERARCHY_TIERS should have 11 entries (10 Tiers + Certificate)');
        assert.ok(TechnologyDetector, 'TechnologyDetector should be exported cleanly');
        results.push({ test: 'CommonJS modules clean require export check', passed: true });
    } catch (err) {
        results.push({ test: 'CommonJS modules clean require export check', passed: false, error: err.message });
    }

    // TEST 2: 10-Tier Universal Hierarchy Registration & Ancestor Lineage Path
    try {
        const registry = new ProjectRegistry({ loadDefaults: false });

        // Tier 1: Tenant
        const tenant = registry.registerResourceNode({
            id: 'tenant_global_01',
            tier: 'Tenant',
            name: 'Global Enterprise Tenant',
            tenantId: 'global-ent'
        });

        // Tier 2: Organization
        const org = registry.registerResourceNode({
            id: 'org_aerospace_01',
            tier: 'Organization',
            name: 'Aerospace Engineering Org',
            tenantId: 'global-ent',
            parentId: tenant.id
        });

        // Tier 3: Portfolio
        const portfolio = registry.registerResourceNode({
            id: 'portfolio_defense_01',
            tier: 'Portfolio',
            name: 'Defense & Autonomous Systems Portfolio',
            tenantId: 'global-ent',
            parentId: org.id
        });

        // Tier 4: Program
        const program = registry.registerResourceNode({
            id: 'program_uav_01',
            tier: 'Program',
            name: 'Unmanned Aerial Vehicle Systems Program',
            tenantId: 'global-ent',
            parentId: portfolio.id
        });

        // Tier 5: Project
        const project = registry.registerResourceNode({
            id: 'proj_flight_ctrl_01',
            tier: 'Project',
            name: 'Flight Control Avionics Engine',
            tenantId: 'global-ent',
            parentId: program.id
        });

        // Tier 6: Repository
        const repo = registry.registerResourceNode({
            id: 'repo_avionics_core',
            tier: 'Repository',
            name: 'Avionics Core C++ Repository',
            tenantId: 'global-ent',
            parentId: project.id
        });

        // Tier 7: Specification
        const spec = registry.registerResourceNode({
            id: 'spec_safety_adr_01',
            tier: 'Specification',
            name: 'FAA Safety Compliance ADR',
            tenantId: 'global-ent',
            parentId: repo.id
        });

        // Tier 8: Release
        const release = registry.registerResourceNode({
            id: 'rel_v2026_1_0',
            tier: 'Release',
            name: 'Avionics Release v2026.1.0-LTS',
            tenantId: 'global-ent',
            parentId: spec.id
        });

        // Tier 9: Audit Run
        const auditRun = registry.registerResourceNode({
            id: 'run_audit_991',
            tier: 'AuditRun',
            name: 'Avionics DO-178C Certification Run',
            tenantId: 'global-ent',
            parentId: release.id
        });

        // Tier 10: Evidence
        const evidence = registry.registerResourceNode({
            id: 'evid_bundle_991',
            tier: 'Evidence',
            name: 'Tamper-Evident Test & Telemetry Bundle',
            tenantId: 'global-ent',
            parentId: auditRun.id
        });

        // Tier 11: Certificate
        const cert = registry.registerResourceNode({
            id: 'cert_faa_compliance',
            tier: 'Certificate',
            name: 'FAA DO-178C Level A Certificate',
            tenantId: 'global-ent',
            parentId: evidence.id
        });

        assert.strictEqual(cert.tier, 'Certificate');
        assert.strictEqual(cert.tierLevel, 11);

        const hierarchy = registry.getResourceHierarchy(cert.id);
        assert.strictEqual(hierarchy.ancestors.length, 10, 'Certificate node should have exactly 10 ancestors');
        assert.strictEqual(hierarchy.ancestors[0].id, tenant.id, 'Top ancestor must be Tenant');
        assert.strictEqual(hierarchy.ancestors[4].id, project.id, 'Fifth ancestor must be Project');

        const pathStr = registry.buildUniversalHierarchyPath(cert.id);
        assert.ok(pathStr.startsWith('/Tenant:tenant_global_01/Organization:org_aerospace_01/'), 'Path string should reflect full 10-tier lineage');

        const val = registry.validateHierarchyLineage(cert.id);
        assert.strictEqual(val.valid, true, 'Strict hierarchy lineage validation should pass');

        results.push({ test: '10-Tier Universal Hierarchy registration and full lineage path verification', passed: true });
    } catch (err) {
        results.push({ test: '10-Tier Universal Hierarchy registration and full lineage path verification', passed: false, error: err.message });
    }

    // TEST 3: Auto-provisioning of missing parent lineage
    try {
        const registry = new ProjectRegistry({ loadDefaults: false });
        const proj = registry.registerResourceNode({
            id: 'proj_auto_test_01',
            tier: 'Project',
            name: 'Auto Parent Test Project',
            tenantId: 'autotenant'
        });

        const hierarchy = registry.getResourceHierarchy(proj.id);
        assert.ok(hierarchy, 'Hierarchy should exist');
        assert.strictEqual(hierarchy.ancestors.length, 4, 'Auto-provisioning should generate Tenant -> Org -> Portfolio -> Program ancestors');
        assert.strictEqual(hierarchy.ancestors[0].tier, 'Tenant');
        assert.strictEqual(hierarchy.ancestors[1].tier, 'Organization');
        assert.strictEqual(hierarchy.ancestors[2].tier, 'Portfolio');
        assert.strictEqual(hierarchy.ancestors[3].tier, 'Program');

        results.push({ test: 'Auto-provisioning missing parent lineage up to Tenant', passed: true });
    } catch (err) {
        results.push({ test: 'Auto-provisioning missing parent lineage up to Tenant', passed: false, error: err.message });
    }

    // TEST 4: TechnologyDetector Multi-Runtime Marker Profile Scanning
    try {
        const detector = new TechnologyDetector();

        // 1. Create a dummy Node.js + Docker repository
        const nodeDir = path.join(tmpDir, 'node_sample');
        fs.mkdirSync(nodeDir, { recursive: true });
        fs.writeFileSync(path.join(nodeDir, 'package.json'), JSON.stringify({
            name: 'sample-app',
            version: '1.0.0',
            engines: { node: '>=18.0.0' },
            dependencies: { express: '^4.18.2', typescript: '^5.0.0' }
        }, null, 2), 'utf8');
        fs.writeFileSync(path.join(nodeDir, 'package-lock.json'), '{}', 'utf8');
        fs.writeFileSync(path.join(nodeDir, 'Dockerfile'), 'FROM node:18-alpine\nWORKDIR /app\n', 'utf8');

        const profileNode = detector.detectTechnologyProfile(nodeDir);
        assert.strictEqual(profileNode.primaryLanguage, 'JavaScript/TypeScript', 'Primary language should be detected as JS/TS');
        assert.strictEqual(profileNode.containerized, true, 'Containerized flag should be true due to Dockerfile');
        assert.ok(profileNode.repoMarkers.includes('package.json'), 'package.json marker should be detected');
        assert.ok(profileNode.repoMarkers.includes('Dockerfile'), 'Dockerfile marker should be detected');

        // 2. Create a dummy Go + Terraform repository
        const goDir = path.join(tmpDir, 'go_sample');
        fs.mkdirSync(goDir, { recursive: true });
        fs.writeFileSync(path.join(goDir, 'go.mod'), 'module example.com/service\n\ngo 1.22\n', 'utf8');
        fs.writeFileSync(path.join(goDir, 'main.go'), 'package main\nfunc main() {}\n', 'utf8');
        fs.writeFileSync(path.join(goDir, 'main.tf'), 'resource "aws_s3_bucket" "b" {}\n', 'utf8');

        const profileGo = detector.detectTechnologyProfile(goDir);
        assert.strictEqual(profileGo.primaryLanguage, 'Go', 'Primary language should be detected as Go');
        assert.ok(profileGo.infrastructure.includes('Terraform'), 'IaC tool Terraform should be detected');

        // 3. Create a dummy Python repository
        const pyDir = path.join(tmpDir, 'python_sample');
        fs.mkdirSync(pyDir, { recursive: true });
        fs.writeFileSync(path.join(pyDir, 'requirements.txt'), 'fastapi==0.100.0\nuvicorn==0.22.0\n', 'utf8');
        fs.writeFileSync(path.join(pyDir, 'app.py'), 'from fastapi import FastAPI\n', 'utf8');

        const profilePy = detector.detectTechnologyProfile(pyDir);
        assert.strictEqual(profilePy.primaryLanguage, 'Python', 'Primary language should be detected as Python');

        results.push({ test: 'TechnologyDetector multi-runtime marker profile scanning', passed: true });
    } catch (err) {
        results.push({ test: 'TechnologyDetector multi-runtime marker profile scanning', passed: false, error: err.message });
    }

    // TEST 5: Custom Adapter Registration in TechnologyDetector
    try {
        const detector = new TechnologyDetector();
        detector.registerAdapter({
            id: 'adapter_custom_solidity',
            name: 'Solidity Smart Contract Adapter',
            category: 'RUNTIME',
            detect(targetDir, fileList) {
                const found = fileList.filter(f => f.endsWith('.sol') || path.basename(f) === 'hardhat.config.js');
                if (found.length === 0) return null;
                return {
                    id: this.id,
                    name: this.name,
                    category: this.category,
                    language: 'Solidity',
                    confidence: 0.95,
                    markersFound: found,
                    details: { smartContract: true }
                };
            }
        });

        const solDir = path.join(tmpDir, 'solidity_sample');
        fs.mkdirSync(solDir, { recursive: true });
        fs.writeFileSync(path.join(solDir, 'Token.sol'), 'pragma solidity ^0.8.0;\ncontract Token {}\n', 'utf8');

        const profileSol = detector.detectTechnologyProfile(solDir);
        assert.strictEqual(profileSol.primaryLanguage, 'Solidity', 'Custom adapter should detect Solidity');

        results.push({ test: 'TechnologyDetector custom adapter registration', passed: true });
    } catch (err) {
        results.push({ test: 'TechnologyDetector custom adapter registration', passed: false, error: err.message });
    }

    // Cleanup temp directory
    try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
        // Ignore cleanup errors
    }

    // Output Test Summary
    console.log('\n--- Test Summary ---');
    let passedCount = 0;
    for (const r of results) {
        if (r.passed) {
            console.log(` [PASS] ${r.test}`);
            passedCount++;
        } else {
            console.log(` [FAIL] ${r.test}: ${r.error}`);
        }
    }
    console.log(`\nPassed ${passedCount} / ${results.length} tests.`);

    if (passedCount < results.length) {
        process.exit(1);
    }
}

if (require.main === module) {
    runPnc001AndHierarchyTests();
}

module.exports = { runPnc001AndHierarchyTests };
