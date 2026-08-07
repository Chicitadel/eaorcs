/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS DXC Environment & Matrix Test Suite
 * File           : eaorcs_corp_dxc_environment.test.js
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
 * CORP: Subsystem 4 — DXC Master Certification & Packaging
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

const EnvironmentDetectionEngine = require('../../engine/dxc/EnvironmentDetectionEngine');
const BrowserTerminalServerEngine = require('../../engine/portal/BrowserTerminalServerEngine');
const dxcLauncher = require('../../bin/commercial/eaorcs_dxc.js');

const root = path.resolve(__dirname, '../../');

async function runDxcEnvironmentTests() {
    console.log('[TEST] EAORCS DXC Environment & Matrix Suite running...');

    // 1. EnvironmentDetectionEngine Unit Tests
    console.log('  -> Testing EnvironmentDetectionEngine...');
    const envEngine = new EnvironmentDetectionEngine({ workspace: root });

    // 1.1 OS Probing
    const probe = envEngine.probeEnvironment();
    assert.ok(probe.platform, 'Probe must contain platform');
    assert.ok(probe.osName, 'Probe must contain osName');
    assert.ok(probe.arch, 'Probe must contain cpu arch');
    assert.ok(probe.nodeVersion, 'Probe must contain Node.js version');
    assert.ok(Array.isArray(probe.availableShells), 'Probe availableShells must be an array');
    assert.ok(probe.availableShells.includes('browser-terminal'), 'availableShells must include browser-terminal');
    assert.ok(probe.recommendedTab, 'Probe must specify recommendedTab');

    // 1.2 Recommended Tab Selection
    assert.strictEqual(envEngine.getRecommendedTab({ platform: 'win32' }), 'powershell');
    assert.strictEqual(envEngine.getRecommendedTab({ platform: 'darwin' }), 'zsh');
    assert.strictEqual(envEngine.getRecommendedTab({ platform: 'linux' }), 'bash');
    assert.strictEqual(envEngine.getRecommendedTab({ platform: 'sunos' }), 'browser-terminal');

    // 1.3 Matrix Computation
    const matrix = envEngine.getEnvironmentMatrix();
    assert.ok(matrix.windows, 'Matrix must contain windows entry');
    assert.ok(matrix.macos, 'Matrix must contain macos entry');
    assert.ok(matrix.linux, 'Matrix must contain linux entry');
    assert.strictEqual(matrix.windows.platform, 'win32');
    assert.strictEqual(matrix.macos.platform, 'darwin');
    assert.strictEqual(matrix.linux.platform, 'linux');

    // 1.4 Equivalent Shell Matrix
    const shellMatrix = envEngine.getEquivalentShellMatrix();
    assert.ok(shellMatrix.list_files, 'Shell matrix must include list_files');
    assert.ok(shellMatrix.change_directory, 'Shell matrix must include change_directory');
    assert.ok(shellMatrix.environment_vars, 'Shell matrix must include environment_vars');
    assert.strictEqual(shellMatrix.list_files.bash, 'ls -la');
    assert.strictEqual(shellMatrix.list_files.cmd, 'dir');

    console.log('    ✓ EnvironmentDetectionEngine unit tests passed.');

    // 2. BrowserTerminalServerEngine Endpoints (/api/dxc/environment & /api/dxc/matrix)
    console.log('  -> Testing BrowserTerminalServerEngine DXC endpoints...');
    const serverEngine = new BrowserTerminalServerEngine({ workspace: root, port: 8096 });
    const serverCtrl = serverEngine.launchTerminalServer({ port: 8096, workspace: root });

    function httpGetJson(urlStr) {
        return new Promise((resolve, reject) => {
            http.get(urlStr, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
                    } catch (e) {
                        resolve({ statusCode: res.statusCode, raw: data });
                    }
                });
            }).on('error', reject);
        });
    }

    try {
        const envEndpointRes = await httpGetJson('http://localhost:8096/api/dxc/environment');
        assert.strictEqual(envEndpointRes.statusCode, 200);
        assert.strictEqual(envEndpointRes.body.status, 'SUCCESS');
        assert.ok(envEndpointRes.body.environment.platform);
        assert.ok(envEndpointRes.body.environment.recommendedTab);

        const matrixEndpointRes = await httpGetJson('http://localhost:8096/api/dxc/matrix');
        assert.strictEqual(matrixEndpointRes.statusCode, 200);
        assert.strictEqual(matrixEndpointRes.body.status, 'SUCCESS');
        console.log('DEBUG matrixEndpointRes.body:', JSON.stringify(matrixEndpointRes.body, null, 2));
        assert.ok(matrixEndpointRes.body.matrix.windows);
        assert.ok(matrixEndpointRes.body.equivalentShells.list_files);
    } finally {
        await serverCtrl.close();
    }

    console.log('    ✓ BrowserTerminalServerEngine /api/dxc/environment and /api/dxc/matrix endpoints passed.');

    // 3. DXC Launcher Tests (eaorcs_dxc.js)
    console.log('  -> Testing DXC Launcher (bin/commercial/eaorcs_dxc.js)...');
    const parsed = dxcLauncher.parseArgs(['probe', '-j']);
    assert.strictEqual(parsed.command, 'probe');
    assert.strictEqual(parsed.json, true);

    const helpRes = await dxcLauncher.run(['--help']);
    assert.strictEqual(helpRes.exitCode, 0);
    assert.strictEqual(helpRes.help, true);

    const probeRes = await dxcLauncher.run(['probe', '-j']);
    assert.strictEqual(probeRes.exitCode, 0);
    assert.strictEqual(probeRes.status, 'SUCCESS');
    assert.ok(probeRes.result.platform);

    const matrixRes = await dxcLauncher.run(['matrix', '-j']);
    assert.strictEqual(matrixRes.exitCode, 0);
    assert.strictEqual(matrixRes.status, 'SUCCESS');
    assert.ok(matrixRes.matrix.windows);

    console.log('    ✓ DXC Launcher unit tests passed.');

    console.log('================================================================');
    console.log('  ✓ EAORCS DXC Environment & Matrix Suite PASSED');
    console.log('================================================================');
}

if (require.main === module) {
    runDxcEnvironmentTests().catch(err => {
        console.error('DXC Environment Test Error:', err);
        process.exit(1);
    });
}

module.exports = runDxcEnvironmentTests;
