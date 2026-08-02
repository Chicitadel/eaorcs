/******************************************************************************
 * Project        : EAORCS Platform Realization
 * Module         : Developer Platform / DevX
 * File           : cli/index.js
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

const dcpCli = require('./dcp_cli');
const onboardCli = require('./onboard_cli');

const args = process.argv.slice(2);
const command = args[0];

function showHelp() {
  console.log(`
EAORCS Developer Platform CLI (UAIGOS 3.0.0)

Usage: eaorcs <command> [options]

Commands:
  onboard         Onboard a new product (eaorcs onboard <product-path>)
  dcp             Distributed Compute Protocol (DCP) operations
  verify          Verify architecture and protocols
  pack            Package the application artifact
  passport        Manage security passports and identities
  dri             Directly Responsible Individual management
  constitution    View and validate system constitution
  help            Show this help message
`);
}

switch (command) {
  case 'onboard':
    const productPath = args[1];
    onboardCli.executeOnboard(productPath);
    break;
  case 'dcp':
    console.log('Running eaorcs dcp command...');
    dcpCli.executeDcp();
    break;
  case 'verify':
    if (args.includes('--onboard')) {
        console.log('Verifying EAORCS architecture and protocols with --onboard flag...');
    } else {
        console.log('Verifying EAORCS architecture and protocols...');
    }
    break;
  case 'pack':
    console.log('Packaging the EAORCS application artifact...');
    break;
  case 'passport':
    console.log('Managing security passports...');
    break;
  case 'dri':
    console.log('DRI operations...');
    break;
  case 'constitution':
    console.log('Validating system constitution...');
    break;
  case 'help':
  default:
    showHelp();
    break;
}
