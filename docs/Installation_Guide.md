<!--
/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Documentation
 * File           : Installation_Guide.md
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

# EAORCS Installation & Setup Guide

## System Prerequisites
- **Node.js**: v18.0.0 or later (v20 LTS recommended)
- **Operating System**: Linux, macOS, or Windows Server 2022+
- **Architecture**: x86_64 or arm64

## Installation

### Standard Package Installation
```bash
# Extract the customer release archive
tar -xzf 03_customer_release.zip -C /opt/eaorcs

# Navigate to application directory
cd /opt/eaorcs

# Verify installation health
node bin/eaorcs.js --version
```

### Verification
Run the system health check to ensure all runtime dependencies and signatures are intact:
```bash
node bin/eaorcs.js doctor
```

## Governance & Security Certification
This installation bundle is signed with Ed25519 corporate seals under ISO 27001, SOC 2, OWASP ASVS, and NIST frameworks.
