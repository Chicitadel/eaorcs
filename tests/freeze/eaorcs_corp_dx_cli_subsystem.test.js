/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS DX CLI Subsystem Test Suite
 * File           : eaorcs_corp_dx_cli_subsystem.test.js
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
 * CORP: Subsystem 4 — Master Certification & Package Orchestrator / DX CLI Subsystem
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
const fs = require('fs');
const http = require('http');

const DeveloperExperienceEngine = require('../../engine/cli/DeveloperExperienceEngine');
const BrowserTerminalServerEngine = require('../../engine/portal/BrowserTerminalServerEngine');
const cliLauncher = require('../../bin/commercial/eaorcs_cli.js');

const root = path.resolve(__dirname, '../../');

async function runDxCliSubsystemTests() {
    console.log('[TEST] EAORCS DX CLI Subsystem Suite running...');

    // 1. DeveloperExperienceEngine Tests
    console.log('  -> Testing DeveloperExperienceEngine...');
    const dxEngine = new DeveloperExperienceEngine({
        defaultEnvironment: 'PowerShell',
        currentTier: 'community'
    });

    // 1.1 Shell Syntax Translation - translatePath
    assert.strictEqual(dxEngine.translatePath('C:/repo/file.txt', 'Windows CMD'), 'C:\\repo\\file.txt');
    assert.strictEqual(dxEngine.translatePath('C:/repo/file.txt', 'PowerShell'), 'C:\\repo\\file.txt');
    assert.strictEqual(dxEngine.translatePath('C:\\repo\\file.txt', 'Git Bash'), '/c/repo/file.txt');
    assert.strictEqual(dxEngine.translatePath('C:\\repo\\file.txt', 'WSL'), '/mnt/c/repo/file.txt');
    assert.strictEqual(dxEngine.translatePath('C:\\repo\\file.txt', 'Linux'), 'C:/repo/file.txt');

    // 1.2 Shell Syntax Translation - translateEnvVar
    assert.strictEqual(dxEngine.translateEnvVar('FOO', 'bar', 'Windows CMD'), 'set FOO=bar');
    assert.strictEqual(dxEngine.translateEnvVar('FOO', 'bar', 'PowerShell'), '$env:FOO="bar"');
    assert.strictEqual(dxEngine.translateEnvVar('FOO', 'bar', 'Linux'), 'export FOO="bar"');
    assert.strictEqual(dxEngine.translateEnvVar('FOO', 'bar', 'Docker'), '-e FOO="bar"');
    assert.strictEqual(dxEngine.translateEnvVar('FOO', 'bar', 'Kubernetes'), '--env=FOO="bar"');
    assert.strictEqual(dxEngine.translateEnvVar('FOO', 'bar', 'CI/CD'), 'FOO: "bar"');

    // 1.3 Shell Syntax Translation - chainCommands
    assert.strictEqual(dxEngine.chainCommands(['cmd1', 'cmd2'], 'Windows CMD'), 'cmd1 && cmd2');
    assert.strictEqual(dxEngine.chainCommands(['cmd1', 'cmd2'], 'PowerShell'), 'cmd1; cmd2');
    assert.strictEqual(dxEngine.chainCommands(['cmd1', 'cmd2'], 'Linux'), 'cmd1 && cmd2');

    // 1.4 Command Builder - buildCommand
    const cmdResult = dxEngine.buildCommand({
        command: 'eaorcs analyze',
        args: { json: true, tier: 'enterprise' },
        envVars: { NODE_ENV: 'production' },
        cwd: 'C:/project',
        targetEnv: 'PowerShell'
    });
    assert.strictEqual(cmdResult.targetEnvironment, 'PowerShell');
    assert.ok(cmdResult.fullCommand.includes('Set-Location'));
    assert.ok(cmdResult.fullCommand.includes('$env:NODE_ENV="production"'));

    const dockerCmdResult = dxEngine.buildCommand({
        command: 'eaorcs analyze',
        targetEnv: 'Docker',
        containerImage: 'eaorcs/custom:v1'
    });
    assert.strictEqual(dockerCmdResult.targetEnvironment, 'Docker');
    assert.ok(dockerCmdResult.fullCommand.includes('docker run --rm'));
    assert.ok(dockerCmdResult.fullCommand.includes('eaorcs/custom:v1'));

    // 1.5 Search Index - searchCommands
    const searchAll = dxEngine.searchCommands('');
    assert.ok(searchAll.length > 0);

    const searchInit = dxEngine.searchCommands('init');
    assert.ok(searchInit.length > 0);
    assert.strictEqual(searchInit[0].name, 'init');

    const searchFilteredCategory = dxEngine.searchCommands('', { category: 'Governance' });
    assert.ok(searchFilteredCategory.every(c => c.category === 'Governance'));

    const searchCommunityTier = dxEngine.searchCommands('', { tier: 'community' });
    assert.ok(searchCommunityTier.every(c => ['community'].includes(c.requiredTier)));

    // 1.6 License Gating & Terminal Box Formatting - evaluateCommandAccess
    const grantedAccess = dxEngine.evaluateCommandAccess('init', 'community');
    assert.strictEqual(grantedAccess.allowed, true);
    assert.strictEqual(grantedAccess.warningBox, null);

    const deniedAccess = dxEngine.evaluateCommandAccess('certify', 'community');
    assert.strictEqual(deniedAccess.allowed, false);
    assert.strictEqual(deniedAccess.stackTraceIncluded, false);
    assert.ok(deniedAccess.warningBox.includes('EAORCS LICENSE GUARD WARNING'));
    assert.ok(deniedAccess.warningBox.includes('RESTRICTED'));

    console.log('    ✓ DeveloperExperienceEngine unit tests passed.');

    // 2. BrowserTerminalServerEngine Tests
    console.log('  -> Testing BrowserTerminalServerEngine...');
    const serverEngine = new BrowserTerminalServerEngine({ workspace: root, port: 8099 });

    const registry = serverEngine.getCommandRegistry();
    assert.ok(registry.analyze);
    assert.ok(registry.certify);

    const matrix = serverEngine.getLicenseMatrix();
    assert.ok(matrix.FREE);
    assert.ok(matrix.COMMERCIAL);
    assert.ok(matrix.ENTERPRISE);

    const evalRes = serverEngine.evaluateCliLicense('certify', 'COMMERCIAL');
    assert.strictEqual(evalRes.authorized, false);

    const evalAllowed = serverEngine.evaluateCliLicense('analyze', 'COMMERCIAL');
    assert.strictEqual(evalAllowed.authorized, true);

    const buildCliRes = serverEngine.buildCliCommand({ command: 'audit', json: true, tier: 'ENTERPRISE' });
    assert.ok(buildCliRes.commandString.includes('eaorcs_cli audit'));

    const execRes = serverEngine.executeCliCommand('analyze', { tier: 'COMMERCIAL' });
    assert.strictEqual(execRes.success, true);
    assert.strictEqual(execRes.status, 'EXECUTED');

    // 2.1 HTTP Server Endpoint Verification
    const serverCtrl = serverEngine.launchTerminalServer({ port: 8099, workspace: root });

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
        const statusRes = await httpGetJson('http://localhost:8099/api/status');
        assert.strictEqual(statusRes.statusCode, 200);
        assert.strictEqual(statusRes.body.status, 'UP');

        const cmdRes = await httpGetJson('http://localhost:8099/api/cli/commands');
        assert.strictEqual(cmdRes.statusCode, 200);
        assert.ok(cmdRes.body.commands.analyze);

        const matrixRes = await httpGetJson('http://localhost:8099/api/license/matrix');
        assert.strictEqual(matrixRes.statusCode, 200);
        assert.ok(matrixRes.body.matrix.ENTERPRISE);

        const execHttpRes = await httpGetJson('http://localhost:8099/api/cli/execute?cmd=analyze&tier=COMMERCIAL');
        assert.strictEqual(execHttpRes.statusCode, 200);
        assert.strictEqual(execHttpRes.body.success, true);
    } finally {
        await serverCtrl.close();
    }

    console.log('    ✓ BrowserTerminalServerEngine REST endpoints & server tests passed.');

    // 3. CLI Launcher Tests (eaorcs_cli.js)
    console.log('  -> Testing CLI Launcher (bin/commercial/eaorcs_cli.js)...');
    const parsedArgs = cliLauncher.parseArgs(['analyze', '-t', 'ENTERPRISE', '-j']);
    assert.strictEqual(parsedArgs.command, 'analyze');
    assert.strictEqual(parsedArgs.tier, 'ENTERPRISE');
    assert.strictEqual(parsedArgs.json, true);

    const helpRun = await cliLauncher.run(['--help']);
    assert.strictEqual(helpRun.exitCode, 0);
    assert.strictEqual(helpRun.help, true);

    const execRun = await cliLauncher.run(['analyze', '-t', 'COMMERCIAL', '-j']);
    assert.strictEqual(execRun.exitCode, 0);
    assert.strictEqual(execRun.status, 'SUCCESS');

    const unauthRun = await cliLauncher.run(['certify', '-t', 'COMMERCIAL', '-j']);
    assert.strictEqual(unauthRun.exitCode, 1);
    assert.strictEqual(unauthRun.status, 'UNAUTHORIZED');

    console.log('    ✓ CLI Launcher unit tests passed.');

    // 4. License Center & CLI Center State Verification
    console.log('  -> Testing License Center & CLI Center State...');
    const licenseCenterPath = path.join(root, 'docs', 'license_center.html');
    const cliCenterPath = path.join(root, 'docs', 'cli_center.html');

    assert.ok(fs.existsSync(licenseCenterPath), 'docs/license_center.html must exist');
    assert.ok(fs.existsSync(cliCenterPath), 'docs/cli_center.html must exist');

    const licenseContent = fs.readFileSync(licenseCenterPath, 'utf8');
    assert.ok(licenseContent.includes('EAORCS') || licenseContent.includes('License'), 'license_center.html must contain License content');

    const cliCenterContent = fs.readFileSync(cliCenterPath, 'utf8');
    assert.ok(cliCenterContent.includes('cli_center.html') || cliCenterContent.includes('CLI Center'), 'cli_center.html must contain CLI Center content');

    console.log('    ✓ License Center & CLI Center HTML state verified.');

    console.log('================================================================');
    console.log('  ✓ EAORCS DX CLI Subsystem Suite PASSED');
    console.log('================================================================');
}

if (require.main === module) {
    runDxCliSubsystemTests().catch(err => {
        console.error('DX CLI Subsystem Test Error:', err);
        process.exit(1);
    });
}

module.exports = runDxCliSubsystemTests;
