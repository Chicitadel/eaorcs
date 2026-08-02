/******************************************************************************
 * Project        : EAORCS Platform Realization
 * Module         : Developer Platform / DevX
 * File           : cli/onboard_cli.js
 * Version        : 3.0.0
 * Author         : Architectural Governance Council & Ujomor Systems Engineering
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
 * Created Date   : 2026-08-02
 * Last Modified  : 2026-08-02
 * Classification : ENTERPRISE
 *
 * Governance:
 * - AI Governed
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
 * Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

const ProductOnboardingEngine = require('../engine/onboarding/ProductOnboardingEngine');

async function executeOnboard(productPath, options = {}) {
    if (!productPath) {
        console.error("Error: product-path is required for onboard command.");
        process.exit(1);
    }
    
    // Parse dynamic flags from process.argv if not passed directly
    const argv = process.argv;
    const outputDirIdx = argv.indexOf('--output-dir');
    const runIdIdx = argv.indexOf('--run-id');

    if (outputDirIdx !== -1 && argv[outputDirIdx + 1]) {
        options.outputDir = argv[outputDirIdx + 1];
    }
    if (runIdIdx !== -1 && argv[runIdIdx + 1]) {
        options.runId = argv[runIdIdx + 1];
    }

    console.log(`Executing EAORCS onboard for: ${productPath}`);
    const engine = new ProductOnboardingEngine(productPath, options);
    const success = await engine.runAudit();
    if (success) {
        console.log("Onboarding successful.");
    } else {
        console.log("Onboarding failed. Check passport for details.");
    }
}

module.exports = {
    executeOnboard
};

