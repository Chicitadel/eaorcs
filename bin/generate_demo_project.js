/******************************************************************************
 * Project        : Air Roofers Subsystem Ecosystem (airroofers.eu)
 * Module         : Turnkey Demo Project Generator
 * File           : bin/generate_demo_project.js
 * Version        : 2026.1.0-GA
 * Author         : Air Roofers Architecture Authority & Development Team
 * Organization   : Chicitadel / Air Roofers SASU
 * Created Date   : 2026-08-02
 * Last Modified  : 2026-08-02
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
 * - SLSA Level 4
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const fs = require('fs');
const path = require('path');

function generateDemoProject(targetDirInput) {
    const rootDir = process.cwd();
    const targetDir = path.resolve(rootDir, targetDirInput || 'demos/eaorcs-enterprise-demo');

    console.log(`\n===============================================================`);
    console.log(` EAORCS TURNKEY DEMO PROJECT GENERATOR`);
    console.log(` Target Directory: ${targetDir}`);
    console.log(`===============================================================\n`);

    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    const policiesDir = path.join(targetDir, 'policies');
    const datasetsDir = path.join(targetDir, 'datasets');
    const storageDir = path.join(targetDir, 'storage', 'evidence');

    fs.mkdirSync(policiesDir, { recursive: true });
    fs.mkdirSync(datasetsDir, { recursive: true });
    fs.mkdirSync(storageDir, { recursive: true });

    // 1. Write eaorcs.config.yaml
    const configYamlContent = `# EAORCS Enterprise Demo Configuration Profile
schemaVersion: "2026.1.0"
governanceAuthority: "Air Roofers Systems Engineering & Governance Authority"
organization: "Chicitadel / Air Roofers SASU"
environment: "DEMO_ENTERPRISE"
classification: "ENTERPRISE_GOVERNED"

audit:
  profile: "FULL_ENTERPRISE_STRICT"
  trustScoreThreshold: 90.0
  readinessThreshold: 85.0
  securitySeverityGate: "CRITICAL_ZERO_TOLERANCE"
  enableSyntheticTelemetry: true
  enableDslEvaluation: true

storage:
  driver: "FILE_SYSTEM"
  evidencePath: "./storage/evidence"
  telemetryPath: "./storage/telemetry"
  logsPath: "./storage/logs"

telemetry:
  multiTenantSectors:
    - "FINANCIAL_SERVICES"
    - "GOVERNMENT_DEFENSE"
    - "HEALTHCARE_HIPAA"
    - "ENTERPRISE_SAAS"
  metricsIntervalMs: 5000
  exportFormats: ["JSON", "PROMETHEUS", "OPEN_TELEMETRY"]

compliance:
  standards:
    - "ISO 27001:2022"
    - "SOC 2 Type II"
    - "OWASP ASVS v4.0.3"
    - "NIST SP 800-53 Rev 5"
    - "SLSA Level 4"
  signatureAlgorithm: "Ed25519"
  hashAlgorithm: "SHA-256"
`;
    fs.writeFileSync(path.join(targetDir, 'eaorcs.config.yaml'), configYamlContent, 'utf8');
    console.log(`  ✓ Written: eaorcs.config.yaml`);

    // 2. Write policies/security_governance.assure
    const assurePolicyContent = `// EAORCS Assurance Policy DSL Definition
// Authority: Air Roofers Systems Engineering & Governance Authority
// Scope: Zero-Trust Runtime Validation & Multi-Tenant Gate Certification

POLICY EnterpriseZeroTrustSecurity {
    RULE ArchitectureIntegrity {
        REQUIRE boundedContextIsolation == true
        REQUIRE circularDependencies == 0
        EVALUATE PASS
    }

    RULE CryptographicSignatures {
        REQUIRE signatureAlgorithm == "Ed25519"
        REQUIRE hashAlgorithm == "SHA-256"
        REQUIRE keyRotationDays <= 90
        EVALUATE PASS
    }

    RULE VulnerabilityManagement {
        REQUIRE criticalCVECount == 0
        REQUIRE highCVECount <= 2
        EVALUATE PASS
    }

    RULE RegulatoryCompliance {
        REQUIRE iso27001Certified == true
        REQUIRE soc2Type2Certified == true
        REQUIRE slsaLevel == 4
        EVALUATE PASS
    }

    ENFORCE GATE {
        ON_SUCCESS ISSUE_CERTIFICATE("GOLD_TIER")
        ON_FAILURE REJECT_DEPLOYMENT("GOVERNANCE_GATE_VIOLATION")
    }
}
`;
    fs.writeFileSync(path.join(policiesDir, 'security_governance.assure'), assurePolicyContent, 'utf8');
    console.log(`  ✓ Written: policies/security_governance.assure`);

    // 3. Write datasets/multi_tenant_telemetry.json
    const telemetryDataset = {
        meta: {
            generatedAt: new Date().toISOString(),
            governanceAuthority: "Ujomor Systems Engineering & Governance Authority",
            classification: "ENTERPRISE_GOVERNED",
            datasetVersion: "2026.1.0"
        },
        sectors: {
            financialServices: {
                tenantId: "TENANT-FIN-0912",
                organization: "Global Apex Financial Trust",
                trustScore: 98.4,
                readinessScore: 97.2,
                slsaLevel: 4,
                activeNodes: 128,
                telemetry: {
                    tps: 45200,
                    latencyP99Ms: 4.2,
                    availabilitySla: 99.999,
                    securityScanStatus: "CLEAN"
                },
                findings: [
                    { id: "FND-FIN-01", domain: "SECURITY", severity: "INFO", description: "TLS 1.3 cipher suite rotation scheduled", status: "VERIFIED" }
                ]
            },
            governmentDefense: {
                tenantId: "TENANT-GOV-4481",
                organization: "Sovereign Defense Systems Agency",
                trustScore: 99.1,
                readinessScore: 98.9,
                slsaLevel: 4,
                activeNodes: 256,
                telemetry: {
                    tps: 18400,
                    latencyP99Ms: 2.8,
                    availabilitySla: 100.0,
                    securityScanStatus: "AIRGAPPED_VERIFIED"
                },
                findings: [
                    { id: "FND-GOV-01", domain: "COMPLIANCE", severity: "INFO", description: "FIPS 140-3 module verification active", status: "VERIFIED" }
                ]
            },
            healthcareHipaa: {
                tenantId: "TENANT-HLT-3310",
                organization: "Apex BioHealth Network",
                trustScore: 96.8,
                readinessScore: 95.5,
                slsaLevel: 4,
                activeNodes: 64,
                telemetry: {
                    tps: 12100,
                    latencyP99Ms: 6.1,
                    availabilitySla: 99.99,
                    securityScanStatus: "CLEAN"
                },
                findings: [
                    { id: "FND-HLT-01", domain: "PRIVACY", severity: "LOW", description: "PHI anonymization audit trail verified", status: "VERIFIED" }
                ]
            },
            enterpriseSaas: {
                tenantId: "TENANT-ENT-8821",
                organization: "Ujomor Enterprise Cloud Platform",
                trustScore: 97.5,
                readinessScore: 96.0,
                slsaLevel: 4,
                activeNodes: 512,
                telemetry: {
                    tps: 120500,
                    latencyP99Ms: 8.4,
                    availabilitySla: 99.99,
                    securityScanStatus: "CLEAN"
                },
                findings: [
                    { id: "FND-ENT-01", domain: "PERFORMANCE", severity: "INFO", description: "Auto-scaling pool expanded across 4 regions", status: "VERIFIED" }
                ]
            }
        }
    };
    fs.writeFileSync(path.join(datasetsDir, 'multi_tenant_telemetry.json'), JSON.stringify(telemetryDataset, null, 2), 'utf8');
    console.log(`  ✓ Written: datasets/multi_tenant_telemetry.json`);

    // 4. Write run_demo.js
    const runDemoScriptContent = [
        "const path = require('path');",
        "const fs = require('fs');",
        "",
        "const rootEaorcs = path.resolve(__dirname, '../../');",
        "const HostAwarenessEngine = require(path.join(rootEaorcs, 'engine/runtime/HostAwarenessEngine'));",
        "const TrustScoreCalculator = require(path.join(rootEaorcs, 'engine/trust/TrustScoreCalculator'));",
        "const ReadinessEngine = require(path.join(rootEaorcs, 'engine/trust/ReadinessEngine'));",
        "const CertificationEngine = require(path.join(rootEaorcs, 'engine/trust/CertificationEngine'));",
        "const EvidenceEngine = require(path.join(rootEaorcs, 'engine/trust/EvidenceEngine'));",
        "const OsapEngine = require(path.join(rootEaorcs, 'engine/osap/OsapEngine'));",
        "",
        "async function runDemo() {",
        "    console.log('\\n===============================================================');",
        "    console.log(' EAORCS ENTERPRISE DEMO PROJECT EXECUTION ENGINE');",
        "    console.log(' Ujomor Systems Engineering & Governance Authority');",
        "    console.log('===============================================================\\n');",
        "",
        "    console.log('[1/5] Detecting Host Environment...');",
        "    const hostEngine = new HostAwarenessEngine();",
        "    const hostInfo = hostEngine.detectHostEnvironment();",
        "    console.log(`  ✓ Host Environment : ${hostInfo.host}`);",
        "",
        "    console.log('\\n[2/5] Loading Synthetic Multi-Tenant Telemetry Datasets...');",
        "    const telemetryPath = path.join(__dirname, 'datasets/multi_tenant_telemetry.json');",
        "    const telemetryData = JSON.parse(fs.readFileSync(telemetryPath, 'utf8'));",
        "    console.log(`  ✓ Loaded Sectors: ${Object.keys(telemetryData.sectors).join(', ')}`);",
        "",
        "    console.log('\\n[3/5] Executing Decomposed Trust Engine Scan...');",
        "    const readinessEng = new ReadinessEngine();",
        "    const evidenceEng = new EvidenceEngine();",
        "    const trustCalc = new TrustScoreCalculator();",
        "",
        "    const sampleFindings = [",
        "        { id: 'FND-DEMO-01', domain: 'ARCHITECTURE_INTEGRITY', status: 'PASSED', severity: 'LOW' },",
        "        { id: 'FND-DEMO-02', domain: 'SECURITY_VULNERABILITIES', status: 'PASSED', severity: 'CRITICAL' },",
        "        { id: 'FND-DEMO-03', domain: 'COMPLIANCE_GOVERNANCE', status: 'PASSED', severity: 'HIGH' },",
        "        { id: 'FND-DEMO-04', domain: 'PROTOCOL_FREEZE', status: 'PASSED', severity: 'MEDIUM' }",
        "    ];",
        "",
        "    const evidenceBundle = evidenceEng.collectEvidence(sampleFindings, { workspace: __dirname });",
        "    const readinessEval = readinessEng.evaluateReadiness({ findings: sampleFindings });",
        "    const trustReport = trustCalc.calculateTrustScore({",
        "        readiness: readinessEval.readinessScore,",
        "        evidenceConfidence: 0.98,",
        "        statisticalConfidence: 0.97,",
        "        findings: sampleFindings",
        "    });",
        "",
        "    console.log(`  ✓ Trust Score     : ${trustReport.trustScore}/100 (${trustReport.tier})`);",
        "    console.log(`  ✓ Readiness Score : ${readinessEval.readinessScore}/100 (${readinessEval.maturityLevel})`);",
        "    console.log(`  ✓ Merkle Root     : ${evidenceBundle.merkleRoot}`);",
        "",
        "    console.log('\\n[4/5] Issuing EAORCS Trust Certificate...');",
        "    const certEng = new CertificationEngine();",
        "    const certResult = await certEng.issueCertificate(trustReport, { name: 'EAORCS Enterprise Demo Workspace', version: '2026.1.0' });",
        "    const certPath = path.join(__dirname, 'eaorcs-certificate.json');",
        "    fs.writeFileSync(certPath, JSON.stringify(certResult, null, 2), 'utf8');",
        "    console.log(`  ✓ Issued Certificate : ${certResult.certificate.certificateId} (${certResult.certificate.tier})`);",
        "    console.log(`  ✓ Saved Artifact     : ${certPath}`);",
        "",
        "    console.log('\\n[5/5] Compiling OSAP v2.0 Passport...');",
        "    const osapEngine = new OsapEngine();",
        "    const passport = await osapEngine.compilePassport({",
        "        trustReport,",
        "        certification: certResult,",
        "        subject: { artifactId: 'eaorcs-enterprise-demo', version: '2026.1.0' }",
        "    });",
        "    const passportPath = path.join(__dirname, 'osap-passport.json');",
        "    fs.writeFileSync(passportPath, JSON.stringify(passport, null, 2), 'utf8');",
        "    console.log(`  ✓ Passport ID   : ${passport.passport_id}`);",
        "    console.log(`  ✓ Ed25519 Sig   : ${passport.issuer.digital_signature ? passport.issuer.digital_signature.substring(0, 32) + '...' : 'SECURE_HMAC'}`);",
        "    console.log(`  ✓ Saved Artifact : ${passportPath}`);",
        "",
        "    console.log('\\n===============================================================');",
        "    console.log(' ✅ EAORCS ENTERPRISE DEMO EXECUTION PASSED PERFECTLY!');",
        "    console.log(' Launch Web Observatory Dashboard: Open index.html in browser');",
        "    console.log('===============================================================\\n');",
        "}",
        "",
        "runDemo().catch(err => {",
        "    console.error('FATAL DEMO RUN ERROR:', err);",
        "    process.exit(1);",
        "});"
    ].join('\n');
    fs.writeFileSync(path.join(targetDir, 'run_demo.js'), runDemoScriptContent, 'utf8');
    console.log(`  ✓ Written: run_demo.js`);

    // 5. Write index.html
    const dashboardHtmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EAORCS Enterprise Observability & Compliance Observatory</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-primary: #0a0e17;
            --bg-card: rgba(18, 26, 42, 0.75);
            --border-card: rgba(0, 240, 255, 0.15);
            --accent-cyan: #00f0ff;
            --accent-gold: #f59e0b;
            --accent-emerald: #10b981;
            --accent-purple: #8b5cf6;
            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
            --text-muted: #64748b;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Outfit', sans-serif;
            background-color: var(--bg-primary);
            background-image: radial-gradient(circle at 15% 15%, rgba(0, 240, 255, 0.08) 0%, transparent 40%), radial-gradient(circle at 85% 85%, rgba(139, 92, 246, 0.08) 0%, transparent 40%);
            color: var(--text-primary);
            min-height: 100vh;
            padding: 24px;
        }
        header {
            display: flex; align-items: center; justify-content: space-between;
            padding: 20px 32px; background: var(--bg-card); backdrop-filter: blur(16px);
            border: 1px solid var(--border-card); border-radius: 16px; margin-bottom: 24px;
        }
        .brand-container { display: flex; align-items: center; gap: 20px; }
        .brand-logo { width: 56px; height: 56px; object-fit: contain; }
        .brand-title h1 {
            font-size: 22px; font-weight: 800;
            background: linear-gradient(135deg, #ffffff 0%, var(--accent-cyan) 100%);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .brand-title p { font-size: 13px; color: var(--text-secondary); font-family: 'JetBrains Mono', monospace; }
        .badge-live { display: flex; align-items: center; gap: 8px; padding: 8px 16px; background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 999px; font-size: 13px; font-weight: 600; color: var(--accent-emerald); }
        .pulse-dot { width: 8px; height: 8px; background-color: var(--accent-emerald); border-radius: 50%; box-shadow: 0 0 10px var(--accent-emerald); }
        .grid-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; margin-bottom: 24px; }
        .card-stat { background: var(--bg-card); backdrop-filter: blur(16px); border: 1px solid var(--border-card); border-radius: 16px; padding: 24px; }
        .stat-label { font-size: 13px; color: var(--text-secondary); font-weight: 500; text-transform: uppercase; margin-bottom: 8px; }
        .stat-value { font-size: 36px; font-weight: 800; font-family: 'JetBrains Mono', monospace; }
        .stat-sub { font-size: 12px; color: var(--accent-cyan); margin-top: 6px; }
        .grid-main { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }
        .card-panel { background: var(--bg-card); backdrop-filter: blur(16px); border: 1px solid var(--border-card); border-radius: 16px; padding: 24px; }
        .panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); }
        .table-custom { width: 100%; border-collapse: collapse; font-size: 14px; }
        .table-custom th { text-align: left; padding: 12px 16px; color: var(--text-secondary); border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
        .table-custom td { padding: 14px 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); font-family: 'JetBrains Mono', monospace; }
        .pill-status { padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; display: inline-block; }
        .pill-gold { background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); color: var(--accent-gold); }
        .pill-emerald { background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: var(--accent-emerald); }
        footer { margin-top: 40px; text-align: center; font-size: 13px; color: var(--text-muted); padding: 16px; border-top: 1px solid rgba(255, 255, 255, 0.05); }
    </style>
</head>
<body>
    <header>
        <div class="brand-container">
            <img src="../../assets/branding/eaorcs_logo.png" alt="EAORCS Logo" class="brand-logo" onerror="this.src='https://via.placeholder.com/56/00f0ff/0a0e17?text=EAORCS'">
            <div class="brand-title">
                <h1>EAORCS Enterprise Observability & Regulatory Compliance System</h1>
                <p>Ujomor Systems Engineering & Governance Authority | Enterprise Governance v2026.1.0</p>
            </div>
        </div>
        <div class="badge-live">
            <div class="pulse-dot"></div>
            <span>LIVE OBSERVATORY</span>
        </div>
    </header>

    <div class="grid-stats">
        <div class="card-stat">
            <div class="stat-label">Decomposed Trust Score</div>
            <div class="stat-value" style="color: var(--accent-gold);">98.4 / 100</div>
            <div class="stat-sub">GOLD TIER CERTIFIED (Ed25519 Signed)</div>
        </div>
        <div class="card-stat">
            <div class="stat-label">Readiness Index</div>
            <div class="stat-value" style="color: var(--accent-cyan);">97.2%</div>
            <div class="stat-sub">Maturity: MODULAR_MONOLITH_LEAN</div>
        </div>
        <div class="card-stat">
            <div class="stat-label">Multi-Tenant Telemetry</div>
            <div class="stat-value" style="color: var(--accent-emerald);">196.2k TPS</div>
            <div class="stat-sub">SLA: 99.999% Across 4 Sectors</div>
        </div>
        <div class="card-stat">
            <div class="stat-label">SLSA Compliance</div>
            <div class="stat-value" style="color: var(--accent-purple);">LEVEL 4</div>
            <div class="stat-sub">Zero-Trust Immutable Build Provenance</div>
        </div>
    </div>

    <div class="grid-main">
        <div class="card-panel">
            <div class="panel-header">
                <h2>Multi-Tenant Sector Observability</h2>
                <span class="pill-status pill-emerald">4 ACTIVE SECTORS</span>
            </div>
            <table class="table-custom">
                <thead>
                    <tr>
                        <th>Sector Name</th>
                        <th>Tenant ID</th>
                        <th>Trust Score</th>
                        <th>TPS</th>
                        <th>P99 Latency</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="color: var(--text-primary); font-weight: 600;">Financial Services</td>
                        <td>TENANT-FIN-0912</td>
                        <td>98.4</td>
                        <td>45,200</td>
                        <td>4.2 ms</td>
                        <td><span class="pill-status pill-gold">GOLD</span></td>
                    </tr>
                    <tr>
                        <td style="color: var(--text-primary); font-weight: 600;">Government & Defense</td>
                        <td>TENANT-GOV-4481</td>
                        <td>99.1</td>
                        <td>18,400</td>
                        <td>2.8 ms</td>
                        <td><span class="pill-status pill-gold">AIRGAP</span></td>
                    </tr>
                    <tr>
                        <td style="color: var(--text-primary); font-weight: 600;">Healthcare (HIPAA)</td>
                        <td>TENANT-HLT-3310</td>
                        <td>96.8</td>
                        <td>12,100</td>
                        <td>6.1 ms</td>
                        <td><span class="pill-status pill-emerald">PASSED</span></td>
                    </tr>
                    <tr>
                        <td style="color: var(--text-primary); font-weight: 600;">Enterprise SaaS</td>
                        <td>TENANT-ENT-8821</td>
                        <td>97.5</td>
                        <td>120,500</td>
                        <td>8.4 ms</td>
                        <td><span class="pill-status pill-emerald">PASSED</span></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="card-panel">
            <div class="panel-header">
                <h2>Regulatory Standards</h2>
            </div>
            <ul style="list-style: none; font-size: 14px;">
                <li style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between;">
                    <span>ISO 27001:2022</span>
                    <strong style="color: var(--accent-emerald);">VERIFIED</strong>
                </li>
                <li style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between;">
                    <span>SOC 2 Type II</span>
                    <strong style="color: var(--accent-emerald);">VERIFIED</strong>
                </li>
                <li style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between;">
                    <span>OWASP ASVS v4.0.3</span>
                    <strong style="color: var(--accent-emerald);">VERIFIED</strong>
                </li>
                <li style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between;">
                    <span>NIST SP 800-53 Rev 5</span>
                    <strong style="color: var(--accent-emerald);">VERIFIED</strong>
                </li>
                <li style="padding: 12px 0; display: flex; justify-content: space-between;">
                    <span>SLSA Level 4</span>
                    <strong style="color: var(--accent-emerald);">VERIFIED</strong>
                </li>
            </ul>
        </div>
    </div>

    <footer>
        Copyright &copy; 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved. | Standard: UAIGOS 3.0.0
    </footer>
</body>
</html>
`;
    fs.writeFileSync(path.join(targetDir, 'index.html'), dashboardHtmlContent, 'utf8');
    console.log(`  ✓ Written: index.html`);

    // 6. Write README.md
    const demoReadmeContent = `# EAORCS Turnkey Enterprise Demo Workspace

![EAORCS Logo](../../assets/branding/eaorcs_logo.png)

**Authority**: Ujomor Systems Engineering & Governance Authority  
**Standard**: Universal Autonomous AI Governance Operating System (UAIGOS 3.0.0)  
**Classification**: GOVERNMENT | ENTERPRISE | RESTRICTED  

---

## 1. Overview

This directory contains a turnkey, self-contained demonstration environment for **EAORCS** (Enterprise Autonomous Observability & Regulatory Compliance System).

It demonstrates:
- Decomposed Trust Engine scoring & readiness evaluation.
- Synthetic multi-tenant telemetry datasets (Financial, Defense, Healthcare, SaaS).
- EAORCS Assurance Policy DSL (\`policies/security_governance.assure\`).
- One-click certificate issuance (\`eaorcs-certificate.json\`).
- Sovereign OSAP v2.0 Passport compilation (\`osap-passport.json\`).
- Interactive glassmorphic Web Observatory Dashboard (\`index.html\`).

---

## 2. Quickstart Execution

To run the complete demonstration pipeline:

\`\`\`powershell
# Navigate to demo workspace
cd demos/eaorcs-enterprise-demo

# Run the turnkey demonstration script
node run_demo.js
\`\`\`

---

## 3. Web Observatory Dashboard

Open \`index.html\` in any modern web browser to inspect:
- Decomposed Trust Scorecard (Gold Tier).
- Multi-Tenant Sector Performance Metrics.
- Regulatory Compliance Audit Trail (ISO 27001, SOC 2, OWASP, NIST, SLSA Level 4).
`;
    fs.writeFileSync(path.join(targetDir, 'README.md'), demoReadmeContent, 'utf8');
    console.log(`  ✓ Written: README.md`);

    console.log(`\n===============================================================`);
    console.log(` ✅ DEMO PROJECT GENERATED SUCCESSFULLY AT: ${targetDir}`);
    console.log(`===============================================================\n`);
    return targetDir;
}

if (require.main === module) {
    const target = process.argv[2] || 'demos/eaorcs-enterprise-demo';
    generateDemoProject(target);
}

module.exports = { generateDemoProject };
