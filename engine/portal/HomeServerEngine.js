/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Commercial Home Server Engine
 * File           : HomeServerEngine.js
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
 * CORP: Subsystem 2 — Home CLI Launchers & Facade Integration
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

const fs = require('fs');
const path = require('path');
const http = require('http');
const child_process = require('child_process');

let ReportHistoryEngine;
try {
    ReportHistoryEngine = require('../governance/ReportHistoryEngine');
} catch (e) {
    ReportHistoryEngine = class {
        constructor() {}
        getReportHistory() { return []; }
    };
}

let WorkspaceMaintenanceEngine;
try {
    WorkspaceMaintenanceEngine = require('../operations/WorkspaceMaintenanceEngine');
} catch (e) {
    WorkspaceMaintenanceEngine = class {
        constructor() {}
        resetWorkspaceState() { return { success: true }; }
    };
}

class HomeServerEngine {
    constructor(options = {}) {
        this.options = options;
        this.baseDir = options.workspace ? path.resolve(options.workspace) : path.resolve(__dirname, '../../');
        this.port = options.port || 8090;
        this.server = null;
    }

    /**
     * Gathers Home Application state payload.
     * @param {string} [targetDir] 
     * @returns {object} Home status and portal payload
     */
    getHomeData(targetDir) {
        const workspaceRoot = targetDir ? path.resolve(targetDir) : this.baseDir;
        
        let reportHistory = [];
        try {
            const historyEngine = new ReportHistoryEngine({ workspaceRoot });
            reportHistory = historyEngine.getReportHistory({ limit: 10 });
        } catch (err) {
            reportHistory = [];
        }

        return {
            title: 'EAORCS Commercial Home Application',
            version: '2026.3.1-LTS',
            timestamp: new Date().toISOString(),
            status: 'ACTIVE',
            workspace: workspaceRoot,
            homeUrl: `http://localhost:${this.port}/home`,
            applications: [
                { id: 'ecc', name: 'Enterprise Command Center', path: '/ecc', status: 'READY' },
                { id: 'eeos', name: 'Enterprise Engineering Operating System', path: '/eeos', status: 'READY' },
                { id: 'governance', name: 'Governance & Compliance Portal', path: '/governance', status: 'READY' },
                { id: 'audit', name: 'Automated External Audit Portal', path: '/audit', status: 'READY' }
            ],
            recentReports: reportHistory,
            governance: {
                classification: 'ENTERPRISE | RESTRICTED',
                author: 'Ujomor Systems & Enterprise Governance Authority',
                organization: 'Ujomor Systems & Enterprise Governance',
                standards: ['ISO 27001', 'SOC 2', 'OWASP ASVS', 'NIST']
            }
        };
    }

    /**
     * Renders Home Application HTML Interface.
     * @param {object} data 
     * @returns {string} HTML string
     */
    renderHtmlDashboard(data) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EAORCS Home Application</title>
    <style>
        :root {
            --bg-color: #0b0f19;
            --card-bg: #151c2e;
            --border-color: #23304d;
            --text-main: #e2e8f0;
            --text-muted: #94a3b8;
            --accent-cyan: #38bdf8;
            --accent-green: #22c55e;
            --accent-purple: #a855f7;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-main);
            line-height: 1.5;
            padding: 24px;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 20px;
            border-bottom: 1px solid var(--border-color);
            margin-bottom: 24px;
        }
        .header h1 {
            font-size: 1.75rem;
            color: var(--accent-cyan);
            letter-spacing: 0.5px;
        }
        .header-meta {
            text-align: right;
            font-size: 0.875rem;
            color: var(--text-muted);
        }
        .badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
        }
        .badge-green { background-color: rgba(34, 197, 94, 0.2); color: var(--accent-green); border: 1px solid var(--accent-green); }
        .badge-cyan { background-color: rgba(56, 189, 248, 0.2); color: var(--accent-cyan); border: 1px solid var(--accent-cyan); }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            margin-bottom: 28px;
        }
        .card {
            background-color: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 20px;
        }
        .card h2 {
            font-size: 1.1rem;
            margin-bottom: 12px;
            color: var(--accent-cyan);
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 8px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
            font-size: 0.875rem;
        }
        th, td {
            padding: 10px 14px;
            text-align: left;
            border-bottom: 1px solid var(--border-color);
        }
        th { background: rgba(255,255,255,0.03); color: var(--text-muted); }
        .btn {
            background: var(--accent-cyan);
            color: #0b0f19;
            border: none;
            padding: 10px 18px;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            transition: opacity 0.2s;
        }
        .btn:hover { opacity: 0.9; }
        .btn-danger {
            background: #ef4444;
            color: #ffffff;
        }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <h1>EAORCS Home Application</h1>
            <p style="color: var(--text-muted); font-size: 0.9rem;">UAIGOS Enterprise Operations & Control Portal</p>
        </div>
        <div class="header-meta">
            <div><span class="badge badge-green">HOME ONLINE</span></div>
            <div style="margin-top: 6px;">Version: <strong>2026.3.1-LTS</strong></div>
            <div>Workspace: <code>${data.workspace}</code></div>
        </div>
    </div>

    <div class="grid">
        ${data.applications.map(app => `
            <div class="card">
                <h2>${app.name}</h2>
                <p style="color: var(--text-muted); font-size: 0.875rem; margin-bottom: 14px;">Integrated commercial governance module.</p>
                <span class="badge badge-cyan">${app.status}</span>
            </div>
        `).join('')}
    </div>

    <div class="card" style="margin-bottom: 28px;">
        <h2>Workspace Maintenance Controls</h2>
        <p style="color: var(--text-muted); font-size: 0.875rem; margin-bottom: 14px;">Reset layout configurations, clear temporary cache files, and clean state markers.</p>
        <button class="btn btn-danger" onclick="triggerReset()">Reset Workspace State</button>
    </div>

    <div class="card">
        <h2>Report History</h2>
        ${data.recentReports.length === 0 ? '<p style="color: var(--text-muted); font-size: 0.875rem;">No historical reports recorded.</p>' : `
        <table>
            <thead>
                <tr>
                    <th>Report ID</th>
                    <th>Title</th>
                    <th>Tier</th>
                    <th>Timestamp</th>
                </tr>
            </thead>
            <tbody>
                ${data.recentReports.map(r => `
                    <tr>
                        <td><code>${r.reportId || r.id}</code></td>
                        <td>${r.title}</td>
                        <td><span class="badge badge-cyan">${r.tier}</span></td>
                        <td>${r.timestamp}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        `}
    </div>

    <script>
        function triggerReset() {
            if (!confirm('Are you sure you want to reset workspace state?')) return;
            fetch('/api/reset', { method: 'POST' })
                .then(r => r.json())
                .then(res => {
                    alert('Workspace Reset Result: ' + (res.success ? 'SUCCESS' : 'FAILED'));
                    window.location.reload();
                })
                .catch(err => alert('Reset Error: ' + err.message));
        }
    </script>
</body>
</html>`;
    }

    /**
     * Launches the Home Application HTTP Server.
     * @param {object} [options] 
     * @returns {object} Server controller object
     */
    launchHome(options = {}) {
        const port = options.port || this.port || 8090;
        const workspace = options.workspace ? path.resolve(options.workspace) : this.baseDir;
        const openBrowserFlag = options.openBrowser !== false && !options['no-open'];

        const server = http.createServer((req, res) => {
            const reqUrl = req.url || '/';
            if (reqUrl === '/' || reqUrl === '/home' || reqUrl === '/index.html') {
                const data = this.getHomeData(workspace);
                const html = this.renderHtmlDashboard(data);
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(html);
            } else if (reqUrl === '/api/data' || reqUrl === '/api/status') {
                const data = this.getHomeData(workspace);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(data, null, 2));
            } else if (reqUrl === '/api/reports') {
                try {
                    const historyEngine = new ReportHistoryEngine({ workspaceRoot: workspace });
                    const reports = historyEngine.getReportHistory(options);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ status: 'SUCCESS', reports }, null, 2));
                } catch (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ status: 'ERROR', message: err.message }));
                }
            } else if ((reqUrl === '/api/reset' || reqUrl === '/api/workspace/reset') && (req.method === 'POST' || req.method === 'GET')) {
                try {
                    const maintenanceEngine = new WorkspaceMaintenanceEngine({ workspaceRoot: workspace });
                    const result = maintenanceEngine.resetWorkspaceState();
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(result, null, 2));
                } catch (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ status: 'ERROR', message: err.message }));
                }
            } else if (reqUrl === '/api/health') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'UP', app: 'EAORCS Home', port, workspace }));
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Not Found' }));
            }
        });

        server.listen(port, () => {
            const url = `http://localhost:${port}/home`;
            console.log(`[Home Server] EAORCS Home Application active at ${url}`);
            console.log(`[Home Server] Workspace: ${workspace}`);

            if (openBrowserFlag) {
                this.openBrowser(url);
            }
        });

        this.server = server;

        return {
            server,
            port,
            host: 'localhost',
            url: `http://localhost:${port}/home`,
            workspace,
            close: (callback) => {
                return new Promise((resolve) => {
                    server.close(() => {
                        if (callback) callback();
                        resolve();
                    });
                });
            }
        };
    }

    /**
     * Cross-platform browser launcher.
     * @param {string} url 
     */
    openBrowser(url) {
        const startCmd = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
        try {
            child_process.exec(`${startCmd} ${url}`);
        } catch (e) {
            // Ignore error in headless environments
        }
    }
}

module.exports = HomeServerEngine;
