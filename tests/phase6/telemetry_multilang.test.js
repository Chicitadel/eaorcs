/******************************************************************************
 * Project        : EAORCS Platform
 * Module         : Phase 6 Telemetry & Multi-Language Verification Suite
 * File           : telemetry_multilang.test.js
 * Version        : 1.0.0
 * Author         : Ujomor Systems & Enterprise Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance Authority
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | TEST SUITE
 *
 * Governance:
 * - Architecture Authority Approved
 * - Security Reviewed & ISO 27001 / SOC 2 / OWASP ASVS / NIST Compliant
 * - Automated Qualification Suite Enforced
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance Authority
 * All Rights Reserved.
 ******************************************************************************/

const assert = require('assert');
const path = require('path');
const fs = require('fs');

const IntentTelemetryCorrelationEngine = require('../../engine/telemetry/IntentTelemetryCorrelationEngine');
const MultiLanguageParserEngine = require('../../engine/utcf/MultiLanguageParserEngine');

async function runTestSuite() {
    console.log('================================================================');
    console.log('  EAORCS PHASE 6 — TELEMETRY & MULTI-LANG UTCF TEST SUITE');
    console.log('================================================================\n');

    let totalTests = 0;
    let passedTests = 0;

    function runTest(testName, testFn) {
        totalTests++;
        try {
            testFn();
            passedTests++;
            console.log(`  [PASS] Test ${totalTests}: ${testName}`);
        } catch (err) {
            console.error(`  [FAIL] Test ${totalTests}: ${testName}`);
            console.error(`         Error: ${err.message}`);
            throw err;
        }
    }

    // =========================================================================
    // SECTION 1: Telemetry Intent Correlation Engine Tests
    // =========================================================================
    console.log('--- SECTION 1: IntentTelemetryCorrelationEngine Verification ---');

    const telemetryEngine = new IntentTelemetryCorrelationEngine({
        strictSlaEnforcement: true
    });

    runTest('Register Requirement SLAs', () => {
        const sla1 = telemetryEngine.registerRequirementSla('REQ-AUTH-001', {
            maxLatencyMs: 150,
            maxErrorRatePct: 0.5,
            minThroughputRps: 50,
            maxCpuPercent: 80,
            maxMemoryMb: 512,
            allowedStatusCodes: [200, 201],
            targetUptimePct: 99.9,
            description: 'Authentication Service SLA'
        });

        const sla2 = telemetryEngine.registerRequirementSla('REQ-PAY-002', {
            maxLatencyMs: 300,
            maxErrorRatePct: 0.1,
            minThroughputRps: 100,
            maxCpuPercent: 75,
            maxMemoryMb: 1024,
            allowedStatusCodes: [200, 202],
            targetUptimePct: 99.95,
            description: 'Payment Processing Service SLA'
        });

        assert.strictEqual(sla1.reqId, 'REQ-AUTH-001');
        assert.strictEqual(sla1.maxLatencyMs, 150);
        assert.strictEqual(sla2.reqId, 'REQ-PAY-002');
        assert.strictEqual(telemetryEngine.slaRequirements.size, 2);
    });

    runTest('Ingest Production Telemetry Metrics', () => {
        // Compliant metric for REQ-AUTH-001
        const m1 = telemetryEngine.ingestTelemetryMetric({
            reqId: 'REQ-AUTH-001',
            latencyMs: 120,
            errorRatePct: 0.1,
            throughputRps: 60,
            cpuPercent: 45,
            memoryMb: 256,
            statusCode: 200,
            uptimePct: 99.99
        });

        // Violating metric for REQ-PAY-002 (latency & error rate exceeded)
        const m2 = telemetryEngine.ingestTelemetryMetric({
            reqId: 'REQ-PAY-002',
            latencyMs: 450, // exceeds 300ms
            errorRatePct: 2.5, // exceeds 0.1%
            throughputRps: 120,
            cpuPercent: 85, // exceeds 75%
            memoryMb: 512,
            statusCode: 500, // disallowed status code
            uptimePct: 99.90
        });

        assert.ok(m1.metricId.startsWith('metric_'));
        assert.ok(m2.metricId.startsWith('metric_'));
        assert.strictEqual(telemetryEngine.telemetryMetrics.length, 2);
    });

    runTest('Correlate Intent with Telemetry & Detect SLA Violations', () => {
        const summary = telemetryEngine.correlateIntentWithTelemetry();

        assert.strictEqual(summary.totalRequirements, 2);
        assert.strictEqual(summary.compliantRequirements, 1);
        assert.strictEqual(summary.violatedRequirements, 1);
        assert.strictEqual(summary.overallComplianceScorePct, 50);

        const violations = telemetryEngine.getSlaViolations();
        assert.ok(violations.length >= 3, `Expected at least 3 violations, got ${violations.length}`);

        const latencyViolations = telemetryEngine.getSlaViolations({ type: 'LATENCY_EXCEEDED' });
        assert.strictEqual(latencyViolations.length, 1);
        assert.strictEqual(latencyViolations[0].reqId, 'REQ-PAY-002');
    });

    runTest('Export Integrity-Hashed Telemetry Report', () => {
        const report = telemetryEngine.exportCorrelationReport();

        assert.ok(report.reportId.startsWith('RPT-INTENT-TEL-'));
        assert.strictEqual(report.summary.totalRequirements, 2);
        assert.ok(report.integrity);
        assert.strictEqual(report.integrity.algorithm, 'sha256');
        assert.ok(report.integrity.hash.length === 64);
        assert.ok(report.integrity.signature.startsWith('SIG-EAORCS-'));
    });

    // =========================================================================
    // SECTION 2: Multi-Language UTCF Parser Framework Tests
    // =========================================================================
    console.log('\n--- SECTION 2: MultiLanguageParserEngine Polyglot Parsing Verification ---');

    const parser = new MultiLanguageParserEngine();

    runTest('Verify 9 Supported Languages Metadata', () => {
        const supported = parser.getSupportedLanguages();
        assert.strictEqual(supported.length, 9);

        const langIds = supported.map(s => s.id);
        const expectedLangs = ['java', 'python', 'go', 'rust', 'csharp', 'php', 'kotlin', 'swift', 'typescript'];
        for (const expected of expectedLangs) {
            assert.ok(langIds.includes(expected), `Missing expected language '${expected}' in UTCF supported list`);
        }
    });

    runTest('Detect Language by File Path Extensions', () => {
        assert.strictEqual(parser.detectLanguage('App.java'), 'java');
        assert.strictEqual(parser.detectLanguage('/src/script.py'), 'python');
        assert.strictEqual(parser.detectLanguage('main.go'), 'go');
        assert.strictEqual(parser.detectLanguage('lib.rs'), 'rust');
        assert.strictEqual(parser.detectLanguage('Program.cs'), 'csharp');
        assert.strictEqual(parser.detectLanguage('index.php'), 'php');
        assert.strictEqual(parser.detectLanguage('Service.kt'), 'kotlin');
        assert.strictEqual(parser.detectLanguage('ViewController.swift'), 'swift');
        assert.strictEqual(parser.detectLanguage('component.ts'), 'typescript');
    });

    // Language 1: Java
    runTest('Parse Java Source Code', () => {
        const javaCode = `
package com.ujomor.service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    @Override
    public User getUserById(String id) {
        return null;
    }
}
`;
        const ast = parser.extractAST('java', javaCode, 'UserService.java');
        assert.strictEqual(ast.language, 'java');
        assert.strictEqual(ast.imports.length, 2);
        assert.strictEqual(ast.imports[0].module, 'java.util.List');
        assert.strictEqual(ast.classes.length, 1);
        assert.strictEqual(ast.classes[0].name, 'UserService');
        assert.strictEqual(ast.classes[0].type, 'class');
        assert.strictEqual(ast.functions.length, 1);
        assert.strictEqual(ast.functions[0].name, 'getUserById');
        assert.strictEqual(ast.annotations.length, 2);
        assert.strictEqual(ast.annotations[0].name, 'Service');
        assert.strictEqual(ast.exports.length, 1);
        assert.strictEqual(ast.exports[0].name, 'UserService');
    });

    // Language 2: Python
    runTest('Parse Python Source Code', () => {
        const pyCode = `
import os
from datetime import datetime

@task_decorator
class DataPipeline:
    def execute_batch(self, payload):
        pass

def run_job():
    pass
`;
        const ast = parser.extractAST('python', pyCode, 'pipeline.py');
        assert.strictEqual(ast.language, 'python');
        assert.strictEqual(ast.imports.length, 2);
        assert.strictEqual(ast.classes.length, 1);
        assert.strictEqual(ast.classes[0].name, 'DataPipeline');
        assert.strictEqual(ast.functions.length, 2);
        assert.strictEqual(ast.functions[0].name, 'execute_batch');
        assert.strictEqual(ast.annotations.length, 1);
        assert.strictEqual(ast.annotations[0].name, 'task_decorator');
        assert.strictEqual(ast.exports.length, 3);
    });

    // Language 3: Go
    runTest('Parse Go Source Code', () => {
        const goCode = `
package main

import (
    "fmt"
    "net/http"
)

// @Router
type Server struct {
    Port int
}

func StartServer(port int) error {
    return nil
}
`;
        const ast = parser.extractAST('go', goCode, 'server.go');
        assert.strictEqual(ast.language, 'go');
        assert.strictEqual(ast.imports.length, 2);
        assert.strictEqual(ast.classes.length, 1);
        assert.strictEqual(ast.classes[0].name, 'Server');
        assert.strictEqual(ast.classes[0].type, 'struct');
        assert.strictEqual(ast.functions.length, 1);
        assert.strictEqual(ast.functions[0].name, 'StartServer');
        assert.strictEqual(ast.exports.length, 2);
    });

    // Language 4: Rust
    runTest('Parse Rust Source Code', () => {
        const rustCode = `
use std::path::Path;
use std::fs::File;

#[derive(Debug)]
pub struct ConfigManager {
    pub path: String,
}

pub async fn load_config() -> Result<(), String> {
    Ok(())
}
`;
        const ast = parser.extractAST('rust', rustCode, 'config.rs');
        assert.strictEqual(ast.language, 'rust');
        assert.strictEqual(ast.imports.length, 2);
        assert.strictEqual(ast.classes.length, 1);
        assert.strictEqual(ast.classes[0].name, 'ConfigManager');
        assert.strictEqual(ast.functions.length, 1);
        assert.strictEqual(ast.functions[0].name, 'load_config');
        assert.strictEqual(ast.annotations.length, 1);
        assert.strictEqual(ast.exports.length, 2);
    });

    // Language 5: C#
    runTest('Parse C# Source Code', () => {
        const csCode = `
using System;
using System.Threading.Tasks;

[ApiController]
public class AuthController
{
    [HttpPost]
    public IActionResult Login(string username)
    {
        return null;
    }
}
`;
        const ast = parser.extractAST('csharp', csCode, 'AuthController.cs');
        assert.strictEqual(ast.language, 'csharp');
        assert.strictEqual(ast.imports.length, 2);
        assert.strictEqual(ast.classes.length, 1);
        assert.strictEqual(ast.classes[0].name, 'AuthController');
        assert.strictEqual(ast.functions.length, 1);
        assert.strictEqual(ast.functions[0].name, 'Login');
        assert.strictEqual(ast.annotations.length, 2);
        assert.strictEqual(ast.exports.length, 1);
    });

    // Language 6: PHP
    runTest('Parse PHP Source Code', () => {
        const phpCode = `<?php
namespace App\\Controllers;

use App\\Services\\PaymentGateway;

#[Route("/api/orders")]
class OrderController {
    public function createOrder($cart) {
        return true;
    }
}
`;
        const ast = parser.extractAST('php', phpCode, 'OrderController.php');
        assert.strictEqual(ast.language, 'php');
        assert.strictEqual(ast.imports.length, 1);
        assert.strictEqual(ast.classes.length, 1);
        assert.strictEqual(ast.classes[0].name, 'OrderController');
        assert.strictEqual(ast.functions.length, 1);
        assert.strictEqual(ast.functions[0].name, 'createOrder');
        assert.strictEqual(ast.annotations.length, 1);
        assert.strictEqual(ast.exports.length, 2);
    });

    // Language 7: Kotlin
    runTest('Parse Kotlin Source Code', () => {
        const ktCode = `
package com.ujomor.model

import kotlinx.coroutines.flow.Flow

@Entity
data class UserEntity(val id: String)

fun fetchUser(id: String): Flow<UserEntity>? {
    return null
}
`;
        const ast = parser.extractAST('kotlin', ktCode, 'UserEntity.kt');
        assert.strictEqual(ast.language, 'kotlin');
        assert.strictEqual(ast.imports.length, 1);
        assert.strictEqual(ast.classes.length, 1);
        assert.strictEqual(ast.classes[0].name, 'UserEntity');
        assert.strictEqual(ast.functions.length, 1);
        assert.strictEqual(ast.functions[0].name, 'fetchUser');
        assert.strictEqual(ast.annotations.length, 1);
        assert.strictEqual(ast.exports.length, 2);
    });

    // Language 8: Swift
    runTest('Parse Swift Source Code', () => {
        const swiftCode = `
import Foundation
import UIKit

@objc
public class NetworkManager {
    public func fetchData() {
    }
}
`;
        const ast = parser.extractAST('swift', swiftCode, 'NetworkManager.swift');
        assert.strictEqual(ast.language, 'swift');
        assert.strictEqual(ast.imports.length, 2);
        assert.strictEqual(ast.classes.length, 1);
        assert.strictEqual(ast.classes[0].name, 'NetworkManager');
        assert.strictEqual(ast.functions.length, 1);
        assert.strictEqual(ast.functions[0].name, 'fetchData');
        assert.strictEqual(ast.annotations.length, 1);
        assert.strictEqual(ast.exports.length, 2);
    });

    // Language 9: TypeScript
    runTest('Parse TypeScript Source Code', () => {
        const tsCode = `
import { Component } from '@angular/core';

@Injectable()
export class AnalyticsService {
    public logEvent(name: string): void {}
}

export const processMetrics = async (data: any) => {};
`;
        const ast = parser.extractAST('typescript', tsCode, 'AnalyticsService.ts');
        assert.strictEqual(ast.language, 'typescript');
        assert.strictEqual(ast.imports.length, 1);
        assert.strictEqual(ast.classes.length, 1);
        assert.strictEqual(ast.classes[0].name, 'AnalyticsService');
        assert.strictEqual(ast.functions.length, 2);
        assert.strictEqual(ast.annotations.length, 1);
        assert.strictEqual(ast.exports.length, 2);
    });

    console.log('\n================================================================');
    console.log(`  PHASE 6 TEST SUITE COMPLETED: ${passedTests}/${totalTests} TESTS PASSED (100%)`);
    console.log('================================================================\n');

    return { totalTests, passedTests };
}

if (require.main === module) {
    runTestSuite().catch(err => {
        console.error('Test Suite Failed:', err);
        process.exit(1);
    });
}

module.exports = runTestSuite;
