/******************************************************************************
 * Project        : EAORCS Platform
 * Module         : UTCF (Universal Technology Coverage Framework) Verification Suite
 * File           : utcf.test.js
 * Version        : 2026.1.0-LTS
 * Author         : Enterprise Architecture Governance Committee
 * Organization   : Ujomor Systems Engineering
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Security Reviewed & ISO 27001 Compliant
 * - Universal Technology Coverage Protocol Enforced
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Copyright (c) 2026 Ujomor Systems Engineering
 * All Rights Reserved.
 ******************************************************************************/

const assert = require('assert');
const path = require('path');
const UtcfEngine = require('../engine/utcf/UtcfEngine');
const {
    JavaAdapter, PhpAdapter, DotNetAdapter, GoAdapter, RustAdapter, PythonAdapter, TypeScriptAdapter, CppAdapter
} = require('../engine/utcf/adapters/LanguageAdapters');
const {
    SpringBootAdapter, AspNetAdapter, DjangoAdapter, LaravelAdapter, ExpressAdapter, ReactAdapter, VueAdapter, AngularAdapter, SvelteAdapter
} = require('../engine/utcf/adapters/FrameworkAdapters');
const {
    KubernetesAdapter, TerraformAdapter, HelmAdapter, DockerAdapter, AwsAdapter, AzureAdapter, GcpAdapter
} = require('../engine/utcf/adapters/CloudInfrastructureAdapters');
const {
    GitHubActionsAdapter, GitLabCiAdapter, JenkinsAdapter, AzureDevOpsAdapter, BitbucketPipelinesAdapter
} = require('../engine/utcf/adapters/CiCdAdapters');

async function runUtcfVerificationSuite() {
    console.log('================================================================');
    console.log('  EAORCS UTCF (STREAM L) MASTER VERIFICATION SUITE');
    console.log('================================================================\n');

    let passedTests = 0;
    let totalTests = 0;

    function runTest(name, fn) {
        totalTests++;
        try {
            fn();
            console.log(`  [PASS] Test ${totalTests}: ${name}`);
            passedTests++;
        } catch (err) {
            console.error(`  [FAIL] Test ${totalTests}: ${name}`);
            console.error(`         Error: ${err.message}`);
            throw err;
        }
    }

    const testProjectDir = path.resolve(__dirname, '../');

    // --------------------------------------------------------------------------
    // TEST SECTION 1: Language Adapters
    // --------------------------------------------------------------------------
    console.log('--- [SECTION 1] Language Adapters Verification ---');

    runTest('JavaAdapter Detection & Capabilities', () => {
        const adapter = new JavaAdapter();
        assert.strictEqual(adapter.id, 'java');
        assert.strictEqual(adapter.layer, 'programming_languages');
        const res = adapter.analyze(testProjectDir, ['src/Main.java', 'pom.xml']);
        assert.strictEqual(res.detected, true);
        assert.strictEqual(res.metrics.build_system, 'Maven');
        assert.ok(res.capabilities.includes('JAVA_AST_ANALYSIS'));
    });

    runTest('PhpAdapter Detection & Capabilities', () => {
        const adapter = new PhpAdapter();
        assert.strictEqual(adapter.id, 'php');
        const res = adapter.analyze(testProjectDir, ['composer.json', 'src/index.php']);
        assert.strictEqual(res.detected, true);
        assert.strictEqual(res.metrics.package_manager, 'Composer');
    });

    runTest('DotNetAdapter Detection & Capabilities', () => {
        const adapter = new DotNetAdapter();
        assert.strictEqual(adapter.id, 'dotnet');
        const res = adapter.analyze(testProjectDir, ['App.csproj', 'Program.cs']);
        assert.strictEqual(res.detected, true);
        assert.ok(res.capabilities.includes('ROSLYN_AST_ANALYSIS'));
    });

    runTest('GoAdapter Detection & Capabilities', () => {
        const adapter = new GoAdapter();
        assert.strictEqual(adapter.id, 'go');
        const res = adapter.analyze(testProjectDir, ['go.mod', 'main.go']);
        assert.strictEqual(res.detected, true);
        assert.strictEqual(res.metrics.package_manager, 'Go Modules');
    });

    runTest('RustAdapter Detection & Capabilities', () => {
        const adapter = new RustAdapter();
        assert.strictEqual(adapter.id, 'rust');
        const res = adapter.analyze(testProjectDir, ['Cargo.toml', 'src/main.rs']);
        assert.strictEqual(res.detected, true);
        assert.strictEqual(res.metrics.package_manager, 'Cargo');
    });

    runTest('PythonAdapter Detection & Capabilities', () => {
        const adapter = new PythonAdapter();
        assert.strictEqual(adapter.id, 'python');
        const res = adapter.analyze(testProjectDir, ['requirements.txt', 'app.py']);
        assert.strictEqual(res.detected, true);
        assert.ok(res.capabilities.includes('BANDIT_SECURITY_AUDIT'));
    });

    runTest('TypeScriptAdapter Detection & Capabilities', () => {
        const adapter = new TypeScriptAdapter();
        assert.strictEqual(adapter.id, 'typescript');
        const res = adapter.analyze(testProjectDir, ['package.json', 'tsconfig.json', 'index.ts']);
        assert.strictEqual(res.detected, true);
        assert.strictEqual(res.metrics.is_typescript, true);
    });

    runTest('CppAdapter Detection & Capabilities', () => {
        const adapter = new CppAdapter();
        assert.strictEqual(adapter.id, 'cpp');
        const res = adapter.analyze(testProjectDir, ['CMakeLists.txt', 'main.cpp']);
        assert.strictEqual(res.detected, true);
        assert.strictEqual(res.metrics.build_tool, 'CMake');
    });

    // --------------------------------------------------------------------------
    // TEST SECTION 2: Framework Adapters
    // --------------------------------------------------------------------------
    console.log('\n--- [SECTION 2] Framework Adapters Verification ---');

    runTest('Spring Boot, ASP.NET, Django, Laravel, Express Framework Adapters', () => {
        const spring = new SpringBootAdapter();
        assert.strictEqual(spring.detect(testProjectDir, ['application.yml']), true);

        const aspnet = new AspNetAdapter();
        assert.strictEqual(aspnet.detect(testProjectDir, ['Program.cs']), true);

        const django = new DjangoAdapter();
        assert.strictEqual(django.detect(testProjectDir, ['manage.py']), true);

        const laravel = new LaravelAdapter();
        assert.strictEqual(laravel.detect(testProjectDir, ['artisan']), true);

        const express = new ExpressAdapter();
        assert.strictEqual(express.analyze(testProjectDir, ['package.json']).detected, false);
    });

    runTest('React, Vue, Angular, Svelte Frontend Adapters', () => {
        const react = new ReactAdapter();
        assert.strictEqual(react.id, 'react');
        assert.strictEqual(react.layer, 'frontend_frameworks');

        const vue = new VueAdapter();
        assert.strictEqual(vue.id, 'vue');

        const angular = new AngularAdapter();
        assert.strictEqual(angular.detect(testProjectDir, ['angular.json']), true);

        const svelte = new SvelteAdapter();
        assert.strictEqual(svelte.id, 'svelte');
    });

    // --------------------------------------------------------------------------
    // TEST SECTION 3: Cloud & Infrastructure Adapters
    // --------------------------------------------------------------------------
    console.log('\n--- [SECTION 3] Cloud & Infrastructure Adapters Verification ---');

    runTest('Kubernetes, Terraform, Helm, Docker Adapters', () => {
        const k8s = new KubernetesAdapter();
        assert.strictEqual(k8s.detect(testProjectDir, ['deployment.yaml']), true);

        const tf = new TerraformAdapter();
        assert.strictEqual(tf.detect(testProjectDir, ['main.tf']), true);

        const helm = new HelmAdapter();
        assert.strictEqual(helm.detect(testProjectDir, ['Chart.yaml']), true);

        const docker = new DockerAdapter();
        assert.strictEqual(docker.detect(testProjectDir, ['Dockerfile']), true);
    });

    runTest('AWS, Azure, GCP Adapters', () => {
        const aws = new AwsAdapter();
        assert.strictEqual(aws.detect(testProjectDir, ['samconfig.toml']), true);

        const azure = new AzureAdapter();
        assert.strictEqual(azure.detect(testProjectDir, ['main.bicep']), true);

        const gcp = new GcpAdapter();
        assert.strictEqual(gcp.detect(testProjectDir, ['app.yaml']), true);
    });

    // --------------------------------------------------------------------------
    // TEST SECTION 4: CI/CD Adapters
    // --------------------------------------------------------------------------
    console.log('\n--- [SECTION 4] CI/CD Adapters Verification ---');

    runTest('GitHub Actions, GitLab CI, Jenkins, Azure DevOps, Bitbucket Adapters', () => {
        const gha = new GitHubActionsAdapter();
        assert.strictEqual(gha.detect(testProjectDir, ['.github/workflows/ci.yml']), true);

        const gitlab = new GitLabCiAdapter();
        assert.strictEqual(gitlab.detect(testProjectDir, ['.gitlab-ci.yml']), true);

        const jenkins = new JenkinsAdapter();
        assert.strictEqual(jenkins.detect(testProjectDir, ['Jenkinsfile']), true);

        const azdo = new AzureDevOpsAdapter();
        assert.strictEqual(azdo.detect(testProjectDir, ['azure-pipelines.yml']), true);

        const bitbucket = new BitbucketPipelinesAdapter();
        assert.strictEqual(bitbucket.detect(testProjectDir, ['bitbucket-pipelines.yml']), true);
    });

    // --------------------------------------------------------------------------
    // TEST SECTION 5: UtcfEngine Master Orchestrator across 21 Layers
    // --------------------------------------------------------------------------
    console.log('\n--- [SECTION 5] UtcfEngine Master Orchestrator & 21 Layers ---');

    runTest('UtcfEngine Catalog & 21 Layers Audit', () => {
        const engine = new UtcfEngine(testProjectDir);
        const catalog = engine.getLayerCatalog();
        assert.strictEqual(catalog.length, 21, 'Must define exactly 21 technology layers');
        assert.strictEqual(catalog[0].id, 'programming_languages');
        assert.strictEqual(catalog[20].id, 'governance_compliance');
    });

    runTest('UtcfEngine Master Analysis & Level A Evidence Bundle Export', () => {
        const engine = new UtcfEngine(testProjectDir);
        const report = engine.analyze(testProjectDir);

        assert.ok(report.overall_coverage_pct > 80, 'Coverage score should be >= 80%');
        assert.strictEqual(report.status, 'PASSED');
        assert.strictEqual(report.layer_count, 21);
        assert.ok(report.evidence_bundle);
        assert.strictEqual(report.evidence_bundle.evidence_level, 'Level A - Verified Deterministic Evidence');
        assert.ok(report.evidence_bundle.signature);
    });

    console.log('\n================================================================');
    console.log(`  PASSED ${passedTests} OF ${totalTests} UTCF VERIFICATION TESTS (100%)`);
    console.log('  STREAM L UTCF PHYSICAL CODE VERIFICATION COMPLETE!');
    console.log('================================================================\n');
}

if (require.main === module) {
    runUtcfVerificationSuite().catch(err => {
        console.error('UTCF Verification Suite Exception:', err);
        process.exit(1);
    });
}

module.exports = runUtcfVerificationSuite;
