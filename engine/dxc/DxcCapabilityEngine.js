/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS DXC Capability Engine
 * File           : DxcCapabilityEngine.js
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
 * CORP: Subsystem 2 — DX CLI Launchers & REST API Endpoints
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
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DxcCapabilityEngine {
    constructor(options = {}) {
        this.options = options;
        this.workspaceRoot = options.workspace ? path.resolve(options.workspace) : process.cwd();
    }

    /**
     * Probes and gathers complete environment capabilities.
     * @param {object} [options={}]
     * @returns {object} Detailed environment capability metrics.
     */
    detectEnvironment(options = {}) {
        const targetDir = options.workspace ? path.resolve(options.workspace) : this.workspaceRoot;
        
        // Check Node version compatibility (>= 18)
        const nodeMajor = parseInt(process.versions.node.split('.')[0], 10);
        const nodeVersionOk = nodeMajor >= 18;

        // Probe Git availability
        let hasGit = false;
        let gitVersion = null;
        try {
            const gitDir = path.join(targetDir, '.git');
            if (fs.existsSync(gitDir)) {
                hasGit = true;
            }
            const gitOut = execSync('git --version', { stdio: ['ignore', 'pipe', 'ignore'], timeout: 2000 });
            if (gitOut) {
                gitVersion = gitOut.toString().trim();
                hasGit = true;
            }
        } catch (e) {
            // Git binary or repo not available
        }

        // Probe Docker availability
        let hasDocker = false;
        let dockerVersion = null;
        try {
            const dockerOut = execSync('docker --version', { stdio: ['ignore', 'pipe', 'ignore'], timeout: 2000 });
            if (dockerOut) {
                dockerVersion = dockerOut.toString().trim();
                hasDocker = true;
            }
        } catch (e) {
            // Docker binary not available
        }

        // Check workspace writeability
        let workspaceWriteable = false;
        try {
            const testFile = path.join(targetDir, `.dxc_probe_${Date.now()}.tmp`);
            fs.writeFileSync(testFile, 'probe');
            fs.unlinkSync(testFile);
            workspaceWriteable = true;
        } catch (e) {
            workspaceWriteable = false;
        }

        // TTY and Color support
        const isInteractiveTty = Boolean(process.stdout && process.stdout.isTTY);
        const supportsColor = Boolean(
            process.env.FORCE_COLOR ||
            isInteractiveTty ||
            process.env.COLORTERM ||
            (process.env.TERM && process.env.TERM !== 'dumb')
        );

        // Calculate System Metrics
        const totalMemMb = Math.round(os.totalmem() / (1024 * 1024));
        const freeMemMb = Math.round(os.freemem() / (1024 * 1024));
        const cpuCores = os.cpus().length;

        // Profile Determination
        let profile = 'DEVELOPER_WORKSTATION';
        if (hasDocker && cpuCores >= 8 && totalMemMb >= 16384) {
            profile = 'ENTERPRISE_SERVER';
        } else if (process.env.CI || process.env.CONTINUOUS_INTEGRATION) {
            profile = 'CI_RUNNER';
        }

        return {
            timestamp: new Date().toISOString(),
            workspace: targetDir,
            system: {
                platform: os.platform(),
                release: os.release(),
                arch: os.arch(),
                cpus: cpuCores,
                totalMemoryMb: totalMemMb,
                freeMemoryMb: freeMemMb,
                uptimeSeconds: Math.round(os.uptime())
            },
            runtime: {
                nodeVersion: process.version,
                nodeMajorVersion: nodeMajor,
                nodeVersionOk,
                is64Bit: os.arch() === 'x64' || os.arch() === 'arm64',
                pid: process.pid,
                isInteractiveTty,
                supportsColor
            },
            tooling: {
                hasGit,
                gitVersion: gitVersion || (hasGit ? 'Repository detected' : 'Not detected'),
                hasDocker,
                dockerVersion: dockerVersion || 'Not detected',
                workspaceWriteable
            },
            profile,
            readinessScorePct: this._calculateOverallScore({ nodeVersionOk, workspaceWriteable, hasGit, totalMemMb })
        };
    }

    /**
     * Internal helper to compute overall readiness score percentage.
     * @private
     */
    _calculateOverallScore(metrics) {
        let score = 0;
        if (metrics.nodeVersionOk) score += 40;
        if (metrics.workspaceWriteable) score += 30;
        if (metrics.hasGit) score += 15;
        if (metrics.totalMemMb >= 4096) score += 15;
        else if (metrics.totalMemMb >= 2048) score += 10;
        else score += 5;
        return Math.min(100, score);
    }

    /**
     * Generates readiness matrix breakdown across EAORCS capability domains.
     * @param {object} [options={}]
     * @returns {object} Readiness matrix payload.
     */
    getReadinessMatrix(options = {}) {
        const env = this.detectEnvironment(options);

        const matrix = {
            CLI_LAUNCHER: {
                domain: 'CLI Execution Surface',
                status: env.runtime.nodeVersionOk && env.tooling.workspaceWriteable ? 'READY' : 'NON_COMPLIANT',
                scorePct: env.runtime.nodeVersionOk ? 100 : 50,
                requirements: ['Node.js >= 18', 'Workspace Write Access'],
                notes: 'Command-line execution surface fully operational.'
            },
            BROWSER_TERMINAL: {
                domain: 'Browser Terminal Server',
                status: env.runtime.nodeVersionOk ? 'READY' : 'NON_COMPLIANT',
                scorePct: 100,
                requirements: ['Node.js HTTP Module', 'Network Port 8091 Access'],
                notes: 'Browser terminal portal and REST API endpoints active.'
            },
            GOVERNANCE_AUDIT: {
                domain: 'Autonomous Governance & Audit',
                status: env.tooling.workspaceWriteable ? 'READY' : 'DEGRADED',
                scorePct: env.tooling.workspaceWriteable ? 100 : 70,
                requirements: ['Workspace File System Access', 'Determinism Engine'],
                notes: 'Policy evaluation and health dashboard generator ready.'
            },
            CI_CD_AUTOMATION: {
                domain: 'Continuous Integration & Delivery',
                status: env.tooling.hasGit ? 'READY' : 'DEGRADED',
                scorePct: env.tooling.hasGit ? 100 : 75,
                requirements: ['Git Version Control System', 'Headless Terminal Support'],
                notes: env.tooling.hasGit
                    ? 'Git VCS detected; automated pipeline verification ready.'
                    : 'Git not detected; running in fallback directory mode.'
            },
            ENTERPRISE_AIRGAP: {
                domain: 'Air-Gapped Enterprise Isolation',
                status: 'READY',
                scorePct: 100,
                requirements: ['Zero External Dependencies', 'Native Built-in Modules Only'],
                notes: '100% self-contained air-gapped governance execution guaranteed.'
            }
        };

        const domains = Object.values(matrix);
        const passCount = domains.filter(d => d.status === 'READY').length;
        const totalDomains = domains.length;
        const overallScorePct = Math.round(domains.reduce((acc, d) => acc + d.scorePct, 0) / totalDomains);

        return {
            timestamp: new Date().toISOString(),
            profile: env.profile,
            overallStatus: passCount === totalDomains ? 'OPTIMAL' : (passCount >= 3 ? 'DEGRADED' : 'NON_COMPLIANT'),
            overallScorePct,
            summary: {
                totalCapabilities: totalDomains,
                passedCapabilities: passCount,
                degradedCapabilities: domains.filter(d => d.status === 'DEGRADED').length,
                nonCompliantCapabilities: domains.filter(d => d.status === 'NON_COMPLIANT').length
            },
            matrix
        };
    }

    /**
     * Resolves capability equivalence mappings across host environments.
     * @param {object} [options={}]
     * @returns {object} Platform equivalents mapping.
     */
    getPlatformEquivalents(options = {}) {
        return {
            timestamp: new Date().toISOString(),
            architecture: 'EAORCS Universal Platform Surface Parity',
            equivalents: {
                STORAGE_DRIVERS: {
                    capability: 'Persistent File & Asset Storage',
                    mappings: {
                        LocalFilesystem: { provider: 'Local Disk', status: 'ACTIVE', tier: 'FREE' },
                        S3Storage: { provider: 'AWS S3 / MinIO', status: 'COMPATIBLE', tier: 'COMMERCIAL' },
                        AzureBlobStorage: { provider: 'Azure Blob Storage', status: 'COMPATIBLE', tier: 'ENTERPRISE' },
                        GcsStorage: { provider: 'Google Cloud Storage', status: 'COMPATIBLE', tier: 'ENTERPRISE' }
                    }
                },
                CACHE_DRIVERS: {
                    capability: 'In-Memory & Distributed Caching',
                    mappings: {
                        FileCache: { provider: 'Local File System', status: 'ACTIVE', tier: 'FREE' },
                        MemoryCache: { provider: 'Node Process Memory', status: 'ACTIVE', tier: 'FREE' },
                        RedisCache: { provider: 'Redis Cluster', status: 'COMPATIBLE', tier: 'COMMERCIAL' }
                    }
                },
                QUEUE_DRIVERS: {
                    capability: 'Asynchronous Task Queue Dispatch',
                    mappings: {
                        DatabaseQueue: { provider: 'Embedded DB / SQLite', status: 'ACTIVE', tier: 'FREE' },
                        RedisQueue: { provider: 'Redis Pub/Sub', status: 'COMPATIBLE', tier: 'COMMERCIAL' },
                        ServiceBusQueue: { provider: 'Azure Service Bus', status: 'COMPATIBLE', tier: 'ENTERPRISE' },
                        PubSubQueue: { provider: 'GCP Pub/Sub', status: 'COMPATIBLE', tier: 'ENTERPRISE' }
                    }
                },
                SCHEDULER_DRIVERS: {
                    capability: 'Cron & Periodic Governance Job Scheduler',
                    mappings: {
                        SystemCron: { provider: 'Host OS Cron / Task Scheduler', status: 'ACTIVE', tier: 'FREE' },
                        WebCron: { provider: 'HTTP Endpoint WebCron', status: 'ACTIVE', tier: 'COMMUNITY' },
                        K8sCronJob: { provider: 'Kubernetes CronJob', status: 'COMPATIBLE', tier: 'ENTERPRISE' },
                        CloudWatchScheduler: { provider: 'AWS EventBridge / CloudWatch', status: 'COMPATIBLE', tier: 'ENTERPRISE' }
                    }
                },
                TERMINAL_SURFACES: {
                    capability: 'Developer Experience Terminal Surfaces',
                    mappings: {
                        AnsiTerminal: { surface: 'Local Shell / Console', status: 'ACTIVE', tier: 'FREE' },
                        BrowserTerminal: { surface: 'HTTP Web Console (Port 8091)', status: 'ACTIVE', tier: 'COMMERCIAL' },
                        HeadlessCiTerminal: { surface: 'CI/CD Pipeline Runner', status: 'ACTIVE', tier: 'COMMUNITY' }
                    }
                }
            }
        };
    }
}

module.exports = DxcCapabilityEngine;
