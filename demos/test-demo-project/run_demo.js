const path = require('path');
const fs = require('fs');

// Resolve EAORCS root engine
const rootEaorcs = path.resolve(__dirname, '../../');
const HostAwarenessEngine = require(path.join(rootEaorcs, 'engine/runtime/HostAwarenessEngine'));
const TrustScoreCalculator = require(path.join(rootEaorcs, 'engine/trust/TrustScoreCalculator'));
const ReadinessEngine = require(path.join(rootEaorcs, 'engine/trust/ReadinessEngine'));
const CertificationEngine = require(path.join(rootEaorcs, 'engine/trust/CertificationEngine'));
const EvidenceEngine = require(path.join(rootEaorcs, 'engine/trust/EvidenceEngine'));
const OsapEngine = require(path.join(rootEaorcs, 'engine/osap/OsapEngine'));

async function runDemo() {
    console.log('\n===============================================================');
    console.log(' EAORCS ENTERPRISE DEMO PROJECT EXECUTION ENGINE');
    console.log(' Ujomor Systems Engineering & Governance Authority');
    console.log('===============================================================\n');

    // Step 1: Host Detection
    console.log('[1/5] Detecting Host Environment...');
    const hostEngine = new HostAwarenessEngine();
    const hostInfo = hostEngine.detectHostEnvironment();
    console.log(`  ✓ Host Environment : ${hostInfo.host}`);
    console.log(`  ✓ Capabilities     : ${JSON.stringify(hostInfo.capabilities)}`);

    // Step 2: Load Multi-Tenant Telemetry
    console.log('\n[2/5] Loading Synthetic Multi-Tenant Telemetry Datasets...');
    const telemetryPath = path.join(__dirname, 'datasets/multi_tenant_telemetry.json');
    const telemetryData = JSON.parse(fs.readFileSync(telemetryPath, 'utf8'));
    console.log(`  ✓ Loaded Sectors: ${Object.keys(telemetryData.sectors).join(', ')}`);

    // Step 3: Decomposed Trust Engine Audit
    console.log('\n[3/5] Executing Decomposed Trust Engine Scan...');
    const readinessEng = new ReadinessEngine();
    const evidenceEng = new EvidenceEngine();
    const trustCalc = new TrustScoreCalculator();

    const sampleFindings = [
        { id: 'FND-DEMO-01', domain: 'ARCHITECTURE_INTEGRITY', status: 'PASSED', severity: 'LOW' },
        { id: 'FND-DEMO-02', domain: 'SECURITY_VULNERABILITIES', status: 'PASSED', severity: 'CRITICAL' },
        { id: 'FND-DEMO-03', domain: 'COMPLIANCE_GOVERNANCE', status: 'PASSED', severity: 'HIGH' },
        { id: 'FND-DEMO-04', domain: 'PROTOCOL_FREEZE', status: 'PASSED', severity: 'MEDIUM' }
    ];

    const evidenceBundle = evidenceEng.collectEvidence(sampleFindings, { workspace: __dirname });
    const readinessEval = readinessEng.evaluateReadiness({ findings: sampleFindings });
    const trustReport = trustCalc.calculateTrustScore({
        readiness: readinessEval.readinessScore,
        evidenceConfidence: 0.98,
        statisticalConfidence: 0.97,
        findings: sampleFindings
    });

    console.log(`  ✓ Trust Score     : ${trustReport.trustScore}/100 (${trustReport.tier})`);
    console.log(`  ✓ Readiness Score : ${readinessEval.readinessScore}/100 (${readinessEval.maturityLevel})`);
    console.log(`  ✓ Merkle Root     : ${evidenceBundle.merkleRoot}`);

    // Step 4: Issue Trust Certificate
    console.log('\n[4/5] Issuing EAORCS Trust Certificate...');
    const certEng = new CertificationEngine();
    const certResult = certEng.issueCertificate(trustReport, { name: 'EAORCS Enterprise Demo Workspace', version: '2026.1.0' });
    const certPath = path.join(__dirname, 'eaorcs-certificate.json');
    fs.writeFileSync(certPath, JSON.stringify(certResult, null, 2), 'utf8');
    console.log(`  ✓ Issued Certificate : ${certResult.certificate.certificateId} (${certResult.certificate.tier})`);
    console.log(`  ✓ Saved Artifact     : ${certPath}`);

    // Step 5: Export OSAP Passport
    console.log('\n[5/5] Compiling OSAP v2.0 Passport...');
    const osapEngine = new OsapEngine();
    const passport = osapEngine.compilePassport({
        trustReport,
        subject: { artifactId: 'eaorcs-enterprise-demo', version: '2026.1.0' }
    });
    const passportPath = path.join(__dirname, 'osap-passport.json');
    fs.writeFileSync(passportPath, JSON.stringify(passport, null, 2), 'utf8');
    console.log(`  ✓ Passport ID   : ${passport.passport_id}`);
    console.log(`  ✓ Ed25519 Sig   : ${passport.issuer.digital_signature.substring(0, 32)}...`);
    console.log(`  ✓ Saved Artifact : ${passportPath}`);

    console.log('\n===============================================================');
    console.log(' ✅ EAORCS ENTERPRISE DEMO EXECUTION PASSED PERFECTLY!');
    console.log(' Launch Web Observatory Dashboard: Open index.html in browser');
    console.log('===============================================================\n');
}

runDemo().catch(err => {
    console.error('FATAL DEMO RUN ERROR:', err);
    process.exit(1);
});
