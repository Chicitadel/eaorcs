/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : Spec Test Suite for AI Engineering & Industry Constitutions
 * File           : ai_interview_constitutions.test.js
 * Version        : 1.1.0
 * Author         : Enterprise Architecture Team & Ujomor Engineering
 * Organization   : Enterprise Architecture & Governance
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE
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
 * Copyright (c) 2026 Enterprise Architecture & Governance
 * All Rights Reserved.
 ******************************************************************************/

const assert = require('assert');
const path = require('path');
const fs = require('fs');

// Imports under test
const EngineeringInterviewEngine = require('../../engine/ai/EngineeringInterviewEngine');
const BlueprintGenerator = require('../../engine/ai/BlueprintGenerator');
const RequirementGenerator = require('../../engine/ai/RequirementGenerator');
const MissingRequirementGenerator = require('../../engine/ai/MissingRequirementGenerator');
const IndustryConstitutionRegistry = require('../../engine/marketplace/IndustryConstitutionRegistry');

async function runTestSuite() {
    console.log("==========================================================");
    console.log("EAORCS Stream G & H End-to-End Spec Test Suite Execution");
    console.log("==========================================================\n");

    let totalTests = 0;
    let passedTests = 0;

    function test(name, fn) {
        totalTests++;
        try {
            fn();
            passedTests++;
            console.log(`  ✓ [PASS] ${name}`);
        } catch (err) {
            console.error(`  ✗ [FAIL] ${name}`);
            console.error(`    Error: ${err.message}`);
            if (err.stack) console.error(`    ${err.stack.split('\n')[1]}`);
        }
    }

    // -------------------------------------------------------------
    // Test Group 1: EngineeringInterviewEngine
    // -------------------------------------------------------------
    console.log("Test Group 1: EngineeringInterviewEngine");

    test("1.1 Initialization and startInterview()", () => {
        const engine = new EngineeringInterviewEngine();
        assert.strictEqual(engine.status, 'IDLE');

        const session = engine.startInterview("Telemedicine Platform");
        assert.strictEqual(session.topic, "Telemedicine Platform");
        assert.strictEqual(session.status, "IN_PROGRESS");
        assert.strictEqual(session.totalQuestions, 6);
        assert.ok(session.currentQuestion);
        assert.strictEqual(session.currentQuestion.id, "Q1_VISION");
    });

    test("1.2 Answer processing and dynamic question expansion", () => {
        const engine = new EngineeringInterviewEngine();
        engine.startInterview("Telemedicine Platform");

        // Answer Q1
        const res1 = engine.processAnswer("Build a high-availability telemedicine portal for patients and doctors.");
        assert.strictEqual(res1.status, 'IN_PROGRESS');
        assert.strictEqual(res1.completed, false);
        assert.strictEqual(res1.nextQuestion.id, 'Q2_BOUNDED_CONTEXTS');

        // Answer Q2
        engine.processAnswer("Patient Records, Video Consultation Service, Billing & Invoicing, Telemetry");

        // Answer Q3 with HIPAA keyword (triggers dynamic question)
        engine.processAnswer("PHI data classification required with HIPAA compliance and AES-256 encryption.");

        const questions = engine.getGeneratedQuestions();
        const hipaaQ = questions.find(q => q.id === 'Q_DYNAMIC_HIPAA');
        assert.ok(hipaaQ, "Dynamic HIPAA follow-up question should be injected when answer mentions HIPAA");

        // Finish remaining questions
        engine.processAnswer("P95 latency < 100ms, 99.99% availability, RTO < 15 mins");
        engine.processAnswer("Kubernetes on AWS GovCloud");
        engine.processAnswer("ISO 27001, HIPAA, FedRAMP Moderate");

        // Process dynamic question
        const finalRes = engine.processAnswer("Yes, BAA with AWS is executed and immutable audit trail is configured.");
        assert.strictEqual(finalRes.status, 'COMPLETED');
        assert.strictEqual(finalRes.completed, true);

        const transcript = engine.exportTranscript();
        assert.strictEqual(transcript.topic, "Telemedicine Platform");
        assert.strictEqual(transcript.status, "COMPLETED");
        assert.strictEqual(transcript.answeredCount, transcript.totalQuestions);
    });

    // -------------------------------------------------------------
    // Test Group 2: BlueprintGenerator
    // -------------------------------------------------------------
    console.log("\nTest Group 2: BlueprintGenerator");

    test("2.1 Synthesis of JSON & Markdown Blueprint from transcript", () => {
        const interviewEngine = new EngineeringInterviewEngine();
        interviewEngine.startInterview("GovCloud Logistics Gateway");
        interviewEngine.processAnswer("Secure logistics tracking for government defense transport.");
        interviewEngine.processAnswer("Shipment Registry, Fleet Tracking, Authentication Engine");
        interviewEngine.processAnswer("Secret & Classified Transport Logs, PKI Authentication");
        interviewEngine.processAnswer("High throughput 10k RPS, sub-50ms latency");
        interviewEngine.processAnswer("Multi-Region On-Premises & AWS GovCloud");
        interviewEngine.processAnswer("NIST SP 800-53, ISO 27001, FedRAMP Moderate");

        const transcript = interviewEngine.exportTranscript();

        const blueprintGen = new BlueprintGenerator();
        const result = blueprintGen.generateBlueprint(transcript);

        assert.ok(result.json, "Blueprint JSON should be generated");
        assert.ok(result.markdown, "Blueprint Markdown should be generated");

        const json = result.json;
        assert.strictEqual(json.specVersion, "1.1.0");
        assert.strictEqual(json.metadata.title, "GovCloud Logistics Gateway");
        assert.ok(json.blueprintId.startsWith("EAORCS-BP-"));
        assert.strictEqual(json.systemArchitecture.boundedContexts.length, 3);
        assert.ok(json.securityAndGovernance.complianceMatrix.some(c => c.standard === 'NIST SP 800-53'));

        assert.ok(result.markdown.includes("# EAORCS Blueprint v1.1 Specifications: GovCloud Logistics Gateway"));
        assert.ok(result.markdown.includes("NIST SP 800-53"));
    });

    // -------------------------------------------------------------
    // Test Group 3: RequirementGenerator
    // -------------------------------------------------------------
    console.log("\nTest Group 3: RequirementGenerator");

    test("3.1 Requirement synthesis from high-level statement", () => {
        const reqGen = new RequirementGenerator();
        const vision = "Build a multi-tenant payment gateway supporting real-time fraud detection and automated billing.";
        
        const reqs = reqGen.synthesizeRequirements(vision);
        assert.ok(Array.isArray(reqs));
        assert.ok(reqs.length >= 4);

        const frList = reqs.filter(r => r.type === 'FUNCTIONAL');
        const trList = reqs.filter(r => r.type === 'TECHNICAL');

        assert.ok(frList.length > 0, "Should generate functional requirements");
        assert.ok(trList.length > 0, "Should generate technical requirements");

        const authTR = trList.find(r => r.title.includes('Authentication'));
        assert.ok(authTR, "Should include RBAC authentication technical requirement");
        assert.ok(authTR.acceptanceCriteria.length > 0);

        const tenancyTR = trList.find(r => r.title.includes('Multi-Tenant'));
        assert.ok(tenancyTR, "Should detect multi-tenant keyword and generate tenant isolation requirement");

        assert.deepStrictEqual(reqGen.getRequirementList(), reqs);
    });

    // -------------------------------------------------------------
    // Test Group 4: MissingRequirementGenerator
    // -------------------------------------------------------------
    console.log("\nTest Group 4: MissingRequirementGenerator");

    test("4.1 Proactive missing requirement gap analysis", () => {
        const specList = [
            { title: "User Login", description: "Allow users to log in with username and password." },
            { title: "View Patient Records", description: "Display health records for patient." }
        ];

        const missingGen = new MissingRequirementGenerator();
        const suggestions = missingGen.suggestMissingRequirements(specList);

        assert.ok(Array.isArray(suggestions));
        assert.ok(suggestions.length >= 4, "Should identify multiple missing requirements (rate limit, DR, retention, sanitization, PHI)");

        const secGap = suggestions.find(s => s.category === 'SECURITY');
        assert.ok(secGap, "Should identify missing rate limiting / DoS security spec");

        const resGap = suggestions.find(s => s.category === 'RESILIENCY');
        assert.ok(resGap, "Should identify missing Disaster Recovery RTO/RPO spec");

        const phiGap = suggestions.find(s => s.category === 'COMPLIANCE' && s.id.includes('SUG-COMP-'));
        assert.ok(phiGap, "Should identify missing HIPAA compliance/de-identification spec for healthcare patient text");

        assert.deepStrictEqual(missingGen.getSuggestions(), suggestions);
    });

    // -------------------------------------------------------------
    // Test Group 5: IndustryConstitutionRegistry & Templates
    // -------------------------------------------------------------
    console.log("\nTest Group 5: IndustryConstitutionRegistry & Sector Rulepacks");

    const templateDir = path.resolve(__dirname, '../../templates/constitutions');
    const registry = new IndustryConstitutionRegistry({ templateDir });

    test("5.1 Loading Government, Healthcare, and Financial template rulepacks", () => {
        const govPack = registry.loadConstitution('Government');
        assert.strictEqual(govPack.sector, 'Government');
        assert.ok(govPack.standards.includes('NIST SP 800-53'));
        assert.ok(govPack.rules.length >= 5);

        const hltPack = registry.loadConstitution('Healthcare');
        assert.strictEqual(hltPack.sector, 'Healthcare');
        assert.ok(hltPack.standards.includes('HIPAA Privacy & Security Rule'));
        assert.ok(hltPack.rules.length >= 5);

        const finPack = registry.loadConstitution('Financial');
        assert.strictEqual(finPack.sector, 'Financial');
        assert.ok(finPack.standards.includes('PCI-DSS 4.0'));
        assert.ok(finPack.rules.length >= 5);
    });

    test("5.2 List registered constitutions", () => {
        const list = registry.listConstitutions();
        assert.ok(Array.isArray(list));
        assert.ok(list.length >= 3);

        const sectors = list.map(item => item.sector);
        assert.ok(sectors.includes('Government'));
        assert.ok(sectors.includes('Healthcare'));
        assert.ok(sectors.includes('Financial'));
    });

    test("5.3 Validate project against Government, Healthcare, and Financial constitutions", () => {
        const projectPath = path.resolve(__dirname, '../../');

        const govReport = registry.validateProjectAgainstConstitution(projectPath, 'Government');
        assert.strictEqual(govReport.sector, 'Government');
        assert.ok(typeof govReport.score === 'number');
        assert.ok(govReport.passCount > 0);
        assert.strictEqual(govReport.failCount, 0, "Project should pass Government constitution validation without violations");

        const hltReport = registry.validateProjectAgainstConstitution(projectPath, 'Healthcare');
        assert.strictEqual(hltReport.sector, 'Healthcare');
        assert.ok(typeof hltReport.score === 'number');
        assert.strictEqual(hltReport.failCount, 0, "Project should pass Healthcare constitution validation without violations");

        const finReport = registry.validateProjectAgainstConstitution(projectPath, 'Financial');
        assert.strictEqual(finReport.sector, 'Financial');
        assert.ok(typeof finReport.score === 'number');
        assert.strictEqual(finReport.failCount, 0, "Project should pass Financial constitution validation without violations");
    });

    // -------------------------------------------------------------
    // Test Summary
    // -------------------------------------------------------------
    console.log("\n==========================================================");
    console.log(`Test Execution Summary: ${passedTests}/${totalTests} Passed (${Math.round((passedTests / totalTests) * 100)}%)`);
    console.log("==========================================================");

    if (passedTests !== totalTests) {
        process.exit(1);
    }
}

runTestSuite();
