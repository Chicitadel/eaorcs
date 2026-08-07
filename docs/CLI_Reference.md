<!--
/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Documentation
 * File           : CLI_Reference.md
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
 * CORP: Stream 1 — Universal Package Embedding & Customer Doc Trimming
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/
-->

# EAORCS Command Line Interface (CLI) Reference

## Synopsis
`eaorcs [command] [options]`

## Commands

### `status`
Displays current EAORCS system governance status and active release profile.
```bash
node bin/eaorcs.js status
```

### `verify`
Executes bundle and artifact integrity verification checks.
```bash
node bin/eaorcs.js verify --release-dir ./release
```

### `doctor`
Performs diagnostic checks on system requirements and licensing integrity.
```bash
node bin/eaorcs.js doctor
```
