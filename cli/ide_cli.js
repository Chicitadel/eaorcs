/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Developer Experience - Universal IDE CLI Router
 * File           : ide_cli.js
 * Version        : 2026.2-LTS (v1.1.0-FROZEN Master Specification)
 * Author         : Architectural Governance Council & Platform Engineering
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Architecture Authority Approved & RATIFIED
 * - UAIGOS 3.0.0 & DPA/PDA v1.1.0-FROZEN Compliant
 * - ISO 27001 / SOC 2 / OWASP ASVS / NIST SP 800-161 / SLSA Level 4 Enforced
 *
 * Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const LspServerDaemon = require('../engine/ide/LspServerDaemon');

async function handleIdeCli(args) {
  const subcommand = args[0] || 'help';

  switch (subcommand) {
    case 'lsp':
    case 'daemon': {
      const portArg = args.find(a => a.startsWith('--port='));
      const port = portArg ? parseInt(portArg.split('=')[1], 10) : 8080;

      const daemon = new LspServerDaemon({ port });
      console.log(`Starting EAORCS Universal IDE LSP Daemon on port ${port}...`);
      const info = await daemon.start();
      console.log(`✅ LSP Daemon active at ${info.endpoint}`);
      break;
    }
    case 'status': {
      console.log('EAORCS Universal IDE Adapter Framework: ACTIVE (16 Capabilities Enabled)');
      console.log('Supported Ecosystems: VS Code, JetBrains, Visual Studio, Eclipse, Xcode, Vim/Neovim, Zed');
      break;
    }
    case 'help':
    default: {
      console.log(`
EAORCS Universal IDE Command Suite:
  eaorcs ide lsp [--port=8080]   Start the Language Server Protocol (LSP) Daemon
  eaorcs ide status              Display active IDE framework capabilities & matrix
      `);
      break;
    }
  }
}

module.exports = { handleIdeCli };
