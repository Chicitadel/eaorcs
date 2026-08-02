/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Standalone Verifier & Diff CLI
 * File           : verifier_cli.cjs
 * Version        : 2026.1-LTS (v5 Federated Attestation)
 * Author         : Independent Verifier SDK Team
 * Organization   : Air Roofers Platform Ecosystem / EAORCS
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | PUBLIC | RESTRICTED
 ******************************************************************************/

const fs = require('fs');
const path = require('path');
const SovereignVerifier = require('../sdk/verifier.cjs');
const ProfileBundleLoader = require('../engine/policy/ProfileBundleLoader.cjs');

function printHelp() {
    console.log(`
EAORCS Independent Sovereign Verifier & Passport Diff CLI (v5 Federated)

Usage:
  eaorcs verify <passport.json|bundle_dir> [--offline] [--profile <name>]
  eaorcs diff <passportA.json> <passportB.json>

Options:
  --offline     Enforce 100% offline zero-cloud zero-source verification mode
  --profile     Evaluate passport compliance against profile policy bundle (developer|enterprise|government|airgapped|critical_infra)
`);
}

function runCli() {
    const args = process.argv.slice(2);
    if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
        printHelp();
        process.exit(0);
    }

    const command = args[0];

    if (command === 'verify') {
        let inputPath = args[1];
        if (!inputPath) {
            console.error(`Error: Passport file or directory must be specified.`);
            process.exit(1);
        }

        let passportPath = inputPath;
        if (fs.existsSync(inputPath) && fs.statSync(inputPath).isDirectory()) {
            passportPath = path.join(inputPath, 'passport.json');
            if (!fs.existsSync(passportPath)) {
                passportPath = path.join(inputPath, 'passport_v8.json');
            }
        }

        if (!fs.existsSync(passportPath)) {
            console.error(`Error: Target passport file not found: ${inputPath}`);
            process.exit(1);
        }

        const isOffline = args.includes('--offline');
        const profileIndex = args.indexOf('--profile');
        const profileName = profileIndex !== -1 ? args[profileIndex + 1] : 'enterprise';

        const passportData = JSON.parse(fs.readFileSync(passportPath, 'utf8'));
        const verifier = new SovereignVerifier();
        const verificationResult = verifier.verifyPassport(passportData);

        const profileLoader = new ProfileBundleLoader();
        const profileResult = profileLoader.evaluatePassportAgainstProfile(passportData, profileName);

        const output = {
            cli_mode: isOffline ? 'OFFLINE_ZERO_CLOUD_ZERO_SOURCE' : 'HYBRID',
            passport_path: passportPath,
            verification: verificationResult,
            profile_compliance: profileResult,
            overall_valid: verificationResult.valid && profileResult.compliant
        };

        console.log(JSON.stringify(output, null, 2));

        if (!output.overall_valid) {
            process.exit(1);
        }
    } else if (command === 'diff') {
        const fileA = args[1];
        const fileB = args[2];

        if (!fileA || !fs.existsSync(fileA) || !fileB || !fs.existsSync(fileB)) {
            console.error(`Error: Both passport files must exist for diff: ${fileA}, ${fileB}`);
            process.exit(1);
        }

        const passportA = JSON.parse(fs.readFileSync(fileA, 'utf8'));
        const passportB = JSON.parse(fs.readFileSync(fileB, 'utf8'));

        const scoreA = passportA.trust_summary ? passportA.trust_summary.trust_score : (passportA.trust_score || 0);
        const scoreB = passportB.trust_summary ? passportB.trust_summary.trust_score : (passportB.trust_score || 0);

        const diffResult = {
            passport_a: { path: fileA, version: passportA.osap_version || passportA.blueprint_version, trust_score: scoreA },
            passport_b: { path: fileB, version: passportB.osap_version || passportB.blueprint_version, trust_score: scoreB },
            delta_trust_score: parseFloat((scoreB - scoreA).toFixed(2)),
            improved: scoreB >= scoreA,
            timestamp: new Date().toISOString()
        };

        console.log(JSON.stringify(diffResult, null, 2));
    } else {
        console.error(`Unknown command: ${command}`);
        printHelp();
        process.exit(1);
    }
}

if (require.main === module) {
    runCli();
}

module.exports = runCli;
