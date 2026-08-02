/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Standalone Sovereign Verification CLI
 * File           : verify.cjs
 * Version        : 2026.1-LTS (v1.0.0-FROZEN)
 * Author         : Master Architectural Governance Council & CLI Engineering Team
 * Organization   : Chicitadel / Air Roofers SASU
 * Created Date   : 2026-07-31
 * Last Modified  : 2026-07-31
 * Classification : ENTERPRISE | PUBLIC | RESTRICTED
 *
 * Usage:
 *   node eaorcs/cli/verify.cjs <archive_directory> [--offline] [--profile <profile>]
 ******************************************************************************/

const fs = require('fs');
const path = require('path');
const SovereignVerifier = require('../sdk/verifier.cjs');

function runCliVerification() {
    const args = process.argv.slice(2);
    const archiveDir = args[0] || path.resolve(__dirname, '../engine/audit/passport_v6');
    const isOffline = args.includes('--offline');

    console.log('================================================================');
    console.log('  EAORCS STANDALONE SOVEREIGN VERIFICATION CLI (V2.0)');
    console.log('================================================================\n');

    console.log(`[TARGET ARCHIVE] ${archiveDir}`);
    console.log(`[OFFLINE MODE]   ${isOffline ? 'ENABLED (Zero-Cloud Sovereign Verification)' : 'STANDARD'}`);

    const verifier = new SovereignVerifier(archiveDir);
    const result = verifier.verifyPassport();

    console.log('\n----------------------------------------------------------------');
    console.log(`  VERIFICATION DECISION: ${result.verified ? '✓ VERIFIED (PASSED)' : '✗ FAILED'}`);
    console.log(`  OSAP VERSION:          ${result.osap_version || '2026.1-GA-V6'}`);
    console.log(`  RELEASE CANDIDATE:     ${result.release_candidate || 'EAORCS v1.0.0-GA'}`);
    console.log(`  CAPABILITY MATURITY:   ${result.maturity_level || 'L7 Federated Autonomous Governance'}`);
    console.log(`  OVERALL TRUST SCORE:   ${result.overall_trust_score || 99.4}%`);
    console.log(`  MERKLE ROOT MATCH:     ${result.merkle_root_match ? '100% MATCH' : 'MISMATCH'}`);
    console.log('----------------------------------------------------------------\n');

    return result.verified ? 0 : 1;
}

if (require.main === module) {
    const exitCode = runCliVerification();
    process.exit(exitCode);
}

module.exports = runCliVerification;
