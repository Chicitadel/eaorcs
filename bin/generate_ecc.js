#!/usr/bin/env node
/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Enterprise Command Center Generator CLI
 * File           : generate_ecc.js
 * Version        : 3.0.0
 * Author         : Air Roofers Governance Directorate & Engineering Board
 * Organization   : Air Roofers Platform Ecosystem / EAORCS
 * Created Date   : 2026-08-07
 * Last Modified  : 2026-08-07
 * Classification : ENTERPRISE | RESTRICTED
 ******************************************************************************/

const path = require('path');
const fs = require('fs');
const EnterpriseCommandCenterEngine = require('../engine/enterprise/EnterpriseCommandCenterEngine.js');

function run() {
    console.log('[ECC Engine] Initializing Enterprise Command Center Generator...');
    const baseDir = path.resolve(__dirname, '../');
    const engine = new EnterpriseCommandCenterEngine(baseDir);

    const targetJsonPath = path.join(baseDir, 'ecc_dashboard_state.json');
    console.log('[ECC Engine] Scanning active workspace and repository telemetry...');
    const savedPath = engine.compileAndSaveState(targetJsonPath);
    console.log(`[ECC Engine] Dynamic ECC State generated successfully at: ${savedPath}`);

    const state = JSON.parse(fs.readFileSync(savedPath, 'utf8'));
    console.log(`[ECC Engine] Organization: ${state.organization}`);
    console.log(`[ECC Engine] Mission: ${state.activeMission}`);
    console.log(`[ECC Engine] Digital Twin Nodes: ${state.digitalTwin.nodes.length}`);
    console.log(`[ECC Engine] Technical Debt Queue Items: ${state.techDebt.summary.todosCount + state.techDebt.summary.mocksCount} items`);
    console.log('[ECC Engine] ECC compilation complete.');
}

if (require.main === module) {
    run();
}

module.exports = run;
