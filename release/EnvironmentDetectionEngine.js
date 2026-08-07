/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS DXC Environment Detection Engine
 * File           : EnvironmentDetectionEngine.js
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

const os = require('os');
const path = require('path');

class EnvironmentDetectionEngine {
    constructor(options = {}) {
        this.options = options;
        this.workspace = options.workspace ? path.resolve(options.workspace) : process.cwd();
    }

    /**
     * Probes current host operating system and execution environment.
     * @returns {object} Probed environment details.
     */
    probeEnvironment() {
        const platform = os.platform();
        const release = os.release();
        const arch = os.arch();
        const type = os.type();
        const cpus = os.cpus() || [];
        const totalMem = os.totalmem();
        const freeMem = os.freemem();

        let osName = 'Unknown OS';
        if (platform === 'win32') osName = 'Windows';
        else if (platform === 'darwin') osName = 'macOS';
        else if (platform === 'linux') osName = 'Linux';
        else if (platform === 'freebsd') osName = 'FreeBSD';

        const hasWsl = platform === 'linux' && (release.includes('microsoft') || release.includes('WSL'));
        const availableShells = this.detectAvailableShells(platform);

        const recommendedTab = this.getRecommendedTab({ platform, osName, availableShells });

        return {
            platform,
            osName,
            release,
            arch,
            type,
            cpuCount: cpus.length,
            totalMemoryBytes: totalMem,
            freeMemoryBytes: freeMem,
            nodeVersion: process.version,
            hasWsl,
            availableShells,
            recommendedTab,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Detects shell availability based on platform.
     * @param {string} platform 
     * @returns {Array<string>} List of available shells.
     */
    detectAvailableShells(platform) {
        const shells = ['browser-terminal'];
        if (platform === 'win32') {
            shells.push('powershell', 'cmd', 'bash-wsl');
        } else if (platform === 'darwin') {
            shells.push('zsh', 'bash');
        } else if (platform === 'linux') {
            shells.push('bash', 'zsh', 'sh');
        }
        return shells;
    }

    /**
     * Determines the recommended UI/terminal tab based on environment details.
     * @param {object} envInfo 
     * @returns {string} Recommended tab name.
     */
    getRecommendedTab(envInfo = {}) {
        const platform = envInfo.platform || os.platform();
        if (platform === 'win32') {
            return 'powershell';
        } else if (platform === 'darwin') {
            return 'zsh';
        } else if (platform === 'linux') {
            return 'bash';
        }
        return 'browser-terminal';
    }

    /**
     * Computes the matrix of supported environments and capabilities.
     * @returns {object} Environment support matrix.
     */
    getEnvironmentMatrix() {
        return {
            windows: {
                platform: 'win32',
                osName: 'Windows',
                supportedShells: ['powershell', 'cmd', 'bash-wsl', 'browser-terminal'],
                defaultShell: 'powershell',
                recommendedTab: 'powershell',
                features: ['Color ANSI', 'Script Execution', 'Browser Terminal', 'CLI Launcher']
            },
            macos: {
                platform: 'darwin',
                osName: 'macOS',
                supportedShells: ['zsh', 'bash', 'browser-terminal'],
                defaultShell: 'zsh',
                recommendedTab: 'zsh',
                features: ['Color ANSI', 'POSIX Shell', 'Browser Terminal', 'CLI Launcher']
            },
            linux: {
                platform: 'linux',
                osName: 'Linux',
                supportedShells: ['bash', 'zsh', 'sh', 'browser-terminal'],
                defaultShell: 'bash',
                recommendedTab: 'bash',
                features: ['Color ANSI', 'POSIX Shell', 'Container Execution', 'Browser Terminal', 'CLI Launcher']
            }
        };
    }

    /**
     * Computes matrix mapping equivalent commands across shells.
     * @returns {object} Equivalent shell matrix.
     */
    getEquivalentShellMatrix() {
        return {
            list_files: {
                powershell: 'Get-ChildItem / dir',
                cmd: 'dir',
                bash: 'ls -la',
                zsh: 'ls -la'
            },
            change_directory: {
                powershell: 'Set-Location / cd',
                cmd: 'cd',
                bash: 'cd',
                zsh: 'cd'
            },
            environment_vars: {
                powershell: '$env:VAR',
                cmd: '%VAR%',
                bash: '$VAR',
                zsh: '$VAR'
            },
            print_working_dir: {
                powershell: 'Get-Location / pwd',
                cmd: 'cd',
                bash: 'pwd',
                zsh: 'pwd'
            },
            remove_file: {
                powershell: 'Remove-Item / del',
                cmd: 'del',
                bash: 'rm',
                zsh: 'rm'
            }
        };
    }
}

module.exports = EnvironmentDetectionEngine;
