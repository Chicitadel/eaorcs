/******************************************************************************
 * Project        : EAORCS Governance Platform
 * Module         : Identity Discovery Engine & Runtime Context Tests
 * File           : identity_discovery.test.js
 * Version        : 2026.1.0
 * Author         : Air Roofers Architecture Authority / Ujomor Systems
 * Organization   : Ujomor Systems & Air Roofers
 * Created Date   : 2026-08-02
 * Last Modified  : 2026-08-02
 * Classification : ENTERPRISE | PUBLIC | INTERNAL
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
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Ujomor Systems & Air Roofers
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

const { IdentityDiscoveryEngine, discoverIdentity } = require('../../engine/governance/IdentityDiscoveryEngine');

/**
 * Helper to safely create temporary directory for tests.
 */
function createTempDir(prefix) {
    const tmpBase = os.tmpdir();
    const dirPath = fs.mkdtempSync(path.join(tmpBase, `eaorcs_test_${prefix}_`));
    return dirPath;
}

/**
 * Helper to remove directory recursively.
 */
function removeTempDir(dirPath) {
    if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true });
    }
}

function runIdentityDiscoveryTests() {
    const results = [];

    // Test 1: Node.js project discovery (package.json + README.md)
    let tempDir = createTempDir('node');
    try {
        fs.writeFileSync(
            path.join(tempDir, 'package.json'),
            JSON.stringify({ name: '@ujomor/akpati', version: '2.4.0', author: 'Ujomor Engineering' }),
            'utf8'
        );
        fs.writeFileSync(path.join(tempDir, 'README.md'), '# Akpati Ecosystem\nDetailed description.', 'utf8');

        const identity = IdentityDiscoveryEngine.discover(tempDir);
        assert.strictEqual(identity.productName, 'Akpati', 'Should map product name to Akpati');
        assert.strictEqual(identity.version, '2.4.0', 'Should extract version from package.json');
        assert.strictEqual(identity.organization, 'Ujomor Engineering', 'Should extract organization from author');
        assert.ok(identity.detectionSources.includes('package.json'), 'detectionSources must include package.json');
        assert.ok(identity.detectionSources.includes('README.md'), 'detectionSources must include README.md');
        assert.ok(identity.confidence > 0.5, 'Confidence score should be high for node project with multiple sources');

        results.push({ test: 'Node.js project discovery (package.json + README.md)', passed: true });
    } catch (err) {
        results.push({ test: 'Node.js project discovery (package.json + README.md)', passed: false, error: err.message });
    } finally {
        removeTempDir(tempDir);
    }

    // Test 2: PHP Composer project discovery (composer.json)
    tempDir = createTempDir('php');
    try {
        fs.writeFileSync(
            path.join(tempDir, 'composer.json'),
            JSON.stringify({ name: 'ujomor/civiscore', version: '3.1.0' }),
            'utf8'
        );

        const identity = IdentityDiscoveryEngine.discover(tempDir);
        assert.strictEqual(identity.productName, 'CiviScore', 'Should infer CiviScore product name from composer');
        assert.strictEqual(identity.version, '3.1.0', 'Should infer version 3.1.0');
        assert.ok(identity.detectionSources.includes('composer.json'), 'detectionSources must include composer.json');

        results.push({ test: 'PHP Composer project discovery (composer.json)', passed: true });
    } catch (err) {
        results.push({ test: 'PHP Composer project discovery (composer.json)', passed: false, error: err.message });
    } finally {
        removeTempDir(tempDir);
    }

    // Test 3: Java Maven project discovery (pom.xml)
    tempDir = createTempDir('java');
    try {
        const pomContent = `<?xml version="1.0" encoding="UTF-8"?>
<project>
    <groupId>com.ujomor</groupId>
    <artifactId>air-roofers-platform</artifactId>
    <version>1.5.0</version>
    <name>Air Roofers Platform</name>
</project>`;
        fs.writeFileSync(path.join(tempDir, 'pom.xml'), pomContent, 'utf8');

        const identity = IdentityDiscoveryEngine.discover(tempDir);
        assert.strictEqual(identity.productName, 'Air Roofers Platform', 'Should parse name from pom.xml');
        assert.strictEqual(identity.version, '1.5.0', 'Should parse version from pom.xml');
        assert.ok(identity.detectionSources.includes('pom.xml'), 'detectionSources must include pom.xml');

        results.push({ test: 'Java Maven project discovery (pom.xml)', passed: true });
    } catch (err) {
        results.push({ test: 'Java Maven project discovery (pom.xml)', passed: false, error: err.message });
    } finally {
        removeTempDir(tempDir);
    }

    // Test 4: Rust Cargo project discovery (Cargo.toml)
    tempDir = createTempDir('rust');
    try {
        const cargoContent = `[package]
name = "custom-rust-engine"
version = "0.9.1"
authors = ["Ujomor Systems <dev@ujomor.com>"]`;
        fs.writeFileSync(path.join(tempDir, 'Cargo.toml'), cargoContent, 'utf8');

        const identity = IdentityDiscoveryEngine.discover(tempDir);
        assert.strictEqual(identity.productName, 'Custom Rust Engine', 'Should format Title Case for Cargo package');
        assert.strictEqual(identity.version, '0.9.1', 'Should parse version from Cargo.toml');
        assert.ok(identity.detectionSources.includes('Cargo.toml'), 'detectionSources must include Cargo.toml');

        results.push({ test: 'Rust Cargo project discovery (Cargo.toml)', passed: true });
    } catch (err) {
        results.push({ test: 'Rust Cargo project discovery (Cargo.toml)', passed: false, error: err.message });
    } finally {
        removeTempDir(tempDir);
    }

    // Test 5: Flutter project discovery (pubspec.yaml)
    tempDir = createTempDir('flutter');
    try {
        const pubContent = `name: mobile_analytics_app
version: 1.2.3
description: Mobile client analytics app`;
        fs.writeFileSync(path.join(tempDir, 'pubspec.yaml'), pubContent, 'utf8');

        const identity = IdentityDiscoveryEngine.discover(tempDir);
        assert.strictEqual(identity.productName, 'Mobile Analytics App', 'Should parse product from pubspec.yaml');
        assert.strictEqual(identity.version, '1.2.3', 'Should parse version from pubspec.yaml');
        assert.ok(identity.detectionSources.includes('pubspec.yaml'), 'detectionSources must include pubspec.yaml');

        results.push({ test: 'Flutter project discovery (pubspec.yaml)', passed: true });
    } catch (err) {
        results.push({ test: 'Flutter project discovery (pubspec.yaml)', passed: false, error: err.message });
    } finally {
        removeTempDir(tempDir);
    }

    // Test 6: Dockerfile & OpenAPI discovery
    tempDir = createTempDir('docker_openapi');
    try {
        fs.writeFileSync(
            path.join(tempDir, 'Dockerfile'),
            'FROM node:18\nLABEL name="Microservice Gateway"\nLABEL version="3.0.0"',
            'utf8'
        );
        fs.writeFileSync(
            path.join(tempDir, 'openapi.json'),
            JSON.stringify({ info: { title: 'Microservice Gateway API', version: '3.0.0' } }),
            'utf8'
        );

        const identity = IdentityDiscoveryEngine.discover(tempDir);
        assert.strictEqual(identity.productName, 'Microservice Gateway', 'Should discover name from Dockerfile / OpenAPI');
        assert.strictEqual(identity.version, '3.0.0', 'Should discover version 3.0.0');
        assert.ok(identity.detectionSources.includes('Dockerfile'), 'detectionSources must include Dockerfile');
        assert.ok(identity.detectionSources.includes('OpenAPI'), 'detectionSources must include OpenAPI');

        results.push({ test: 'Dockerfile & OpenAPI discovery', passed: true });
    } catch (err) {
        results.push({ test: 'Dockerfile & OpenAPI discovery', passed: false, error: err.message });
    } finally {
        removeTempDir(tempDir);
    }

    // Test 7: Git config discovery (.git/config)
    tempDir = createTempDir('git');
    try {
        const gitDir = path.join(tempDir, '.git');
        fs.mkdirSync(gitDir);
        fs.writeFileSync(
            path.join(gitDir, 'config'),
            '[core]\n\trepositoryformatversion = 0\n[remote "origin"]\n\turl = git@github.com:Ujomor/civi-score.git',
            'utf8'
        );

        const identity = IdentityDiscoveryEngine.discover(tempDir);
        assert.strictEqual(identity.productName, 'CiviScore', 'Should discover CiviScore from git remote URL');
        assert.strictEqual(identity.repository, 'civi-score', 'Should extract repository name from git remote');
        assert.ok(identity.detectionSources.includes('Git'), 'detectionSources must include Git');

        results.push({ test: 'Git config discovery (.git/config)', passed: true });
    } catch (err) {
        results.push({ test: 'Git config discovery (.git/config)', passed: false, error: err.message });
    } finally {
        removeTempDir(tempDir);
    }

    // Test 8: Anonymous / Redacted Mode
    tempDir = createTempDir('anonymous');
    try {
        fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify({ name: 'secret-app', version: '1.0.0' }), 'utf8');

        const identity = IdentityDiscoveryEngine.discover(tempDir, { anonymous: true });
        assert.strictEqual(identity.productName, 'Anonymous', 'Anonymous mode must return productName "Anonymous"');
        assert.strictEqual(identity.organization, 'Redacted', 'Anonymous mode must return organization "Redacted"');
        assert.strictEqual(identity.repository, 'Hidden', 'Anonymous mode must return repository "Hidden"');
        assert.strictEqual(identity.confidence, 1.0, 'Anonymous mode confidence should be 1.0');
        assert.ok(identity.detectionSources.includes('AnonymousMode'), 'detectionSources must cite AnonymousMode');

        results.push({ test: 'Anonymous / Redacted Mode', passed: true });
    } catch (err) {
        results.push({ test: 'Anonymous / Redacted Mode', passed: false, error: err.message });
    } finally {
        removeTempDir(tempDir);
    }

    // Test 9: Explicit User Overrides
    tempDir = createTempDir('overrides');
    try {
        fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify({ name: 'default-app' }), 'utf8');

        const identity = IdentityDiscoveryEngine.discover(tempDir, {
            productName: 'Custom Enterprise Suite',
            organization: 'Global Security Authority'
        });
        assert.strictEqual(identity.productName, 'Custom Enterprise Suite', 'Explicit productName override must be respected');
        assert.strictEqual(identity.organization, 'Global Security Authority', 'Explicit organization override must be respected');
        assert.strictEqual(identity.confidence, 1.0, 'Full override should yield confidence 1.0');
        assert.ok(identity.detectionSources.includes('UserOverride'), 'detectionSources must cite UserOverride');

        results.push({ test: 'Explicit User Overrides', passed: true });
    } catch (err) {
        results.push({ test: 'Explicit User Overrides', passed: false, error: err.message });
    } finally {
        removeTempDir(tempDir);
    }

    // Test 10: Unmapped Directory Name Fallback
    tempDir = createTempDir('unmapped-service');
    try {
        const identity = IdentityDiscoveryEngine.discover(tempDir);
        assert.ok(identity.productName.length > 0, 'Should fall back to formatted directory name');
        assert.strictEqual(identity.confidence, 0.40, 'Unmapped fallback confidence should be 0.40');

        results.push({ test: 'Unmapped Directory Name Fallback', passed: true });
    } catch (err) {
        results.push({ test: 'Unmapped Directory Name Fallback', passed: false, error: err.message });
    } finally {
        removeTempDir(tempDir);
    }

    // Test 11: Runtime Context Export
    tempDir = createTempDir('runtime');
    try {
        const ctx = IdentityDiscoveryEngine.getRuntimeContext(tempDir);
        assert.ok(ctx.identity, 'Runtime context must contain identity object');
        assert.ok(ctx.runtime, 'Runtime context must contain runtime metadata');
        assert.ok(ctx.runtime.nodeVersion, 'Runtime context must include nodeVersion');
        assert.ok(ctx.runtime.platform, 'Runtime context must include platform');
        assert.ok(ctx.runtime.timestamp, 'Runtime context must include timestamp');

        results.push({ test: 'Runtime Context Export', passed: true });
    } catch (err) {
        results.push({ test: 'Runtime Context Export', passed: false, error: err.message });
    } finally {
        removeTempDir(tempDir);
    }

    // Test 12: CommonJS Module Export & Helper Functions
    try {
        const helperRes = discoverIdentity(process.cwd());
        assert.ok(helperRes.productName, 'discoverIdentity function export must work');

        const engineInst = new IdentityDiscoveryEngine({ anonymous: true });
        const instRes = engineInst.discover(process.cwd());
        assert.strictEqual(instRes.productName, 'Anonymous', 'Instance discovery with options must work');

        results.push({ test: 'CommonJS Module Export & Helper Functions', passed: true });
    } catch (err) {
        results.push({ test: 'CommonJS Module Export & Helper Functions', passed: false, error: err.message });
    }

    return results;
}

if (require.main === module) {
    const res = runIdentityDiscoveryTests();
    console.log(res);
}

module.exports = { runIdentityDiscoveryTests };
