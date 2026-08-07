/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS DXC Verification Suite
 * File           : eaorcs_dxc.test.js
 * Version        : 2026.3.1-LTS
 * Author         : Ujomor Systems & Enterprise Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-07
 * Last Modified  : 2026-08-07
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 * - Corporate Policy Governed
 *
 * CORP: Subsystem 2 — DX CLI Launchers & REST API Endpoints Verification
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const path = require('path');
const http = require('http');
const { execSync } = require('child_process');

const EAORCS = require('../../engine/EAORCS');
const DxcCapabilityEngine = require('../../engine/dxc/DxcCapabilityEngine');
const BrowserTerminalServerEngine = require('../../engine/portal/BrowserTerminalServerEngine');
const { parseArgs } = require('../../bin/commercial/eaorcs_dxc.js');


async function testDxcCapabilityEngine() {
    console.log('Testing DxcCapabilityEngine direct methods...');
    const engine = new DxcCapabilityEngine({ workspace: __dirname });

    const env = engine.detectEnvironment();
    assert(env.system.platform, 'Environment should return platform');
    assert(env.runtime.nodeVersion, 'Environment should return node version');
    assert(typeof env.readinessScorePct === 'number', 'Environment should return readinessScorePct');

    const matrix = engine.getReadinessMatrix();
    assert(matrix.matrix.CLI_LAUNCHER, 'Matrix should contain CLI_LAUNCHER');
    assert(matrix.matrix.BROWSER_TERMINAL, 'Matrix should contain BROWSER_TERMINAL');
    assert(matrix.matrix.ENTERPRISE_AIRGAP, 'Matrix should contain ENTERPRISE_AIRGAP');
    assert(typeof matrix.overallScorePct === 'number', 'Matrix should return overallScorePct');

    const equivalents = engine.getPlatformEquivalents();
    assert(equivalents.equivalents.STORAGE_DRIVERS, 'Equivalents should contain STORAGE_DRIVERS');
    assert(equivalents.equivalents.TERMINAL_SURFACES, 'Equivalents should contain TERMINAL_SURFACES');

    console.log('✓ DxcCapabilityEngine tests passed.');
}

async function testEAORCSFacade() {
    console.log('Testing EAORCS.detectEnvironmentCapabilities facade...');
    const result = EAORCS.detectEnvironmentCapabilities({ workspace: __dirname });

    assert(result.environment, 'Facade should return environment');
    assert(result.matrix, 'Facade should return matrix');
    assert(result.equivalents, 'Facade should return equivalents');
    assert(result.environment.runtime.nodeVersion, 'Facade environment contains nodeVersion');

    console.log('✓ EAORCS facade tests passed.');
}

async function testCliArgs() {
    console.log('Testing eaorcs_dxc CLI argument parsing...');
    const opts1 = parseArgs(['--json', '-w', '/tmp']);
    assert.strictEqual(opts1.json, true, 'JSON flag should be set');
    assert.strictEqual(opts1.workspace, path.resolve('/tmp'), 'Workspace should be resolved');

    const opts2 = parseArgs(['--matrix', '-h']);
    assert.strictEqual(opts2.matrix, true, 'Matrix flag should be set');
    assert.strictEqual(opts2.help, true, 'Help flag should be set');

    console.log('✓ CLI argument parsing tests passed.');
}

async function testCliExecution() {
    console.log('Testing eaorcs_dxc.js CLI process execution...');
    const binPath = path.resolve(__dirname, '../../bin/commercial/eaorcs_dxc.js');
    
    const outputJson = execSync(`node "${binPath}" --json`, { encoding: 'utf8' });
    const parsed = JSON.parse(outputJson);
    assert.strictEqual(parsed.status, 'SUCCESS', 'CLI --json should output status SUCCESS');
    assert(parsed.environment, 'CLI output should contain environment');
    assert(parsed.matrix, 'CLI output should contain matrix');
    assert(parsed.equivalents, 'CLI output should contain equivalents');

    const outputMatrix = execSync(`node "${binPath}" --matrix`, { encoding: 'utf8' });
    assert(outputMatrix.includes('READINESS MATRIX BREAKDOWN'), 'CLI --matrix should print matrix header');

    console.log('✓ CLI process execution tests passed.');
}

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        http.get(url, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function testRestEndpoints() {
    console.log('Testing BrowserTerminalServerEngine DXC REST API Endpoints...');
    const serverEngine = new BrowserTerminalServerEngine({ port: 8097 });
    const controller = serverEngine.launchTerminalServer({ port: 8097 });

    try {
        const envRes = await fetchJson('http://localhost:8097/api/dxc/environment');
        assert.strictEqual(envRes.status, 'SUCCESS', '/api/dxc/environment status should be SUCCESS');
        assert(envRes.environment.system.platform, '/api/dxc/environment should return system platform');

        const matrixRes = await fetchJson('http://localhost:8097/api/dxc/matrix');
        assert.strictEqual(matrixRes.status, 'SUCCESS', '/api/dxc/matrix status should be SUCCESS');
        assert(matrixRes.matrix.matrix.CLI_LAUNCHER, '/api/dxc/matrix should contain CLI_LAUNCHER');

        const equivRes = await fetchJson('http://localhost:8097/api/dxc/equivalents');
        assert.strictEqual(equivRes.status, 'SUCCESS', '/api/dxc/equivalents status should be SUCCESS');
        assert(equivRes.equivalents.equivalents.STORAGE_DRIVERS, '/api/dxc/equivalents should contain STORAGE_DRIVERS');

        console.log('✓ REST API Endpoints tests passed.');
    } finally {
        await controller.close();
    }
}

async function runAllTests() {
    console.log('====================================================');
    console.log(' EAORCS DXC SUBSYSTEM 2 VERIFICATION SUITE');
    console.log('====================================================');
    await testDxcCapabilityEngine();
    await testEAORCSFacade();
    await testCliArgs();
    await testCliExecution();
    await testRestEndpoints();
    console.log('====================================================');
    console.log(' ALL SUITE 2 TESTS COMPLETED SUCCESSFULLY! [PASSED]');
    console.log('====================================================');
}

runAllTests().then(() => {
    process.exit(0);
}).catch(err => {
    console.error('Test Suite Failed:', err);
    process.exit(1);
});

