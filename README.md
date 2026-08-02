<p align="center">
  <img src="assets/branding/eaorcs_logo_256.png" alt="EAORCS Logo" width="160" height="160" />
</p>

<h1 align="center">EAORCS — Enterprise Autonomous Observability & Regulatory Compliance System</h1>

<p align="center">
  <b>Release 2026.1.0-GA Implementation Baseline</b><br />
  <i>Official Software Trust Platform for the Air Roofers Ecosystem</i>
</p>

<p align="center">
  <a href="#certification-status"><img src="https://img.shields.io/badge/Certification-15%2F15%20PASS-success?style=for-the-badge" alt="Certification Pass" /></a>
  <a href="#maturity-score"><img src="https://img.shields.io/badge/Maturity-98.5%2F100-blue?style=for-the-badge" alt="Maturity 98.5" /></a>
  <a href="#baseline-status"><img src="https://img.shields.io/badge/Architecture-GA%20BASELINE%20CLOSED-cyan?style=for-the-badge" alt="Baseline Closed" /></a>
  <a href="#slsa-level"><img src="https://img.shields.io/badge/Supply%20Chain-SLSA%20Level%204-emerald?style=for-the-badge" alt="SLSA Level 4" /></a>
</p>

---

## Overview

**EAORCS** (Enterprise Autonomous Operation & Regulatory Compliance System) is an enterprise-grade autonomous compliance, evidence, and observability platform designed for high-assurance environments.

- **Architecture Status**: GA Baseline Closed (`2026.1.0-GA`)
- **Governance Authority**: Ujomor Systems Engineering & Governance Authority
- **Primary Brand Emblem**: `assets/branding/eaorcs_logo.png` (1254x1254, 512, 256, 128, 64, 32, 16)
- **Legal Registry**: 8 Ed25519-signed core legal documents (`legal/registry.json`)

---

## Quick Start & Installation

```bash
# Run installer & directory setup with brand verification
node bin/eaorcs_installer.js install

# Run environment & diagnostic check
node bin/eaorcs_installer.js doctor

# Run full 15-suite GA readiness certification pipeline
node bin/ga_readiness_certification.js

# Run Nine-Stream GA Intelligence Suite
node tests/ga/run_ga_intelligence_suite.js
```

---

## Documentation & Manuals

- 📖 **[User Manual](docs/user-manual/USER_MANUAL.md)** — Platform navigation, dashboard metrics, compliance monitoring
- 📑 **[API Reference Manual](docs/api-manual/API_REFERENCE_MANUAL.md)** — OpenAPI 3.0.3, AsyncAPI, and GraphQL endpoints
- 🛠️ **[Administrator Guide](docs/administrator-guide/ADMIN_GUIDE.md)** — Installation, RBAC, high-availability, backup
- 💻 **[Developer Guide](docs/developer-guide/DEVELOPER_GUIDE.md)** — SDK integration, custom adapters, plugin development
- 🚀 **[Production Deployment Guide](docs/deployment-guide/PRODUCTION_DEPLOYMENT_GUIDE.md)** — Kubernetes, Helm, canary rollouts
- 🛡️ **[Security Architecture Guide](docs/security-guide/SECURITY_ARCHITECTURE_GUIDE.md)** — Zero-trust model, Ed25519 signatures, SLSA Level 4
- 📜 **[GA Baseline Closure Declaration](docs/governance/GA_BASELINE_CLOSURE_DECLARATION.md)** — Formal architecture freeze declaration
- 📋 **[Future Work Policy](docs/governance/FUTURE_WORK_POLICY.md)** — Semantic versioning policy & change categories

---

## Audit & Verification Deliverables

- 📦 **Audit ZIP Package**: `release/eaorcs_pep_audit_package.zip` (2,234 verified entries, 64.64 MB)
- 📊 **External Audit Report**: `docs/audits/PHASE_12_PEP_EXTERNAL_AUDIT_REPORT.md`
- 🏷️ **Machine-Readable Attestation**: `release/GA_BASELINE_CLOSURE_ATTESTATION.json`

---

## License & Governance

Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.  
Classified: **GOVERNMENT | ENTERPRISE | RESTRICTED**
