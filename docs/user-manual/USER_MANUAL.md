/******************************************************************************
 * Project        : EAORCS Continuous Software Assurance Platform
 * Module         : Enterprise User Manual
 * File           : USER_MANUAL.md
 * Version        : 2026.1-LTS
 * Author         : Architectural Governance Council & Ujomor Systems Engineering
 * Organization   : Ujomor Systems Ecosystem
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | PUBLIC RELEASE
 *
 * Governance:
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST SP 800-53 / 800-218 (SSDF)
 * - ISO/IEC 25010
 *
 * Copyright (c) 2026 Ujomor Systems Ecosystem. All Rights Reserved.
 ******************************************************************************/


<p align="center">
  <img src="../assets/eaorcs_logo_256.png" alt="EAORCS Logo" width="140" height="140" />
</p>

# EAORCS Enterprise User Manual
**Version 2026.1.0-GA** | **Ujomor Systems Ecosystem**

---

## Table of Contents
1. [Executive Summary & Platform Overview](#1-executive-summary--platform-overview)
2. [Architecture & Governance Model](#2-architecture--governance-model)
3. [User Interface & Navigation Map](#3-user-interface--navigation-map)
4. [Dashboard Metrics & Trust Index Analytics](#4-dashboard-metrics--trust-index-analytics)
5. [Continuous Compliance Monitoring](#5-continuous-compliance-monitoring)
6. [Cryptographic Evidence Verification & Chain of Custody](#6-cryptographic-evidence-verification--chain-of-custody)
7. [Audit Reporting & OSAP Passport Generation](#7-audit-reporting--osap-passport-generation)
8. [Remediation Workflows & Automated Governance](#8-remediation-workflows--automated-governance)
9. [Enterprise Roles & Access Controls](#9-enterprise-roles--access-controls)
10. [Troubleshooting & Frequently Asked Questions](#10-troubleshooting--frequently-asked-questions)

---

## 1. Executive Summary & Platform Overview

The **Enterprise Autonomous Operation & Resilience Compliance System (EAORCS)** is an enterprise-grade, continuous software assurance platform designed to provide real-time governance, cryptographic auditability, and automated policy enforcement across complex multi-cloud and hybrid software environments.

EAORCS transforms compliance from a periodic manual audit headache into a continuous, real-time, mathematical proof of system integrity.

### Key Capabilities
- **Continuous Compliance Engine**: Automated monitoring against major international frameworks (ISO 27001, SOC 2 Type II, OWASP ASVS 4.0, NIST SP 800-218 SSDF, GDPR, and PCI-DSS 4.0).
- **Cryptographic Chain of Custody**: Every build artifact, configuration change, code commit, and test result is cryptographically signed and stored in an immutable ledger with SHA-256 / Ed25519 signatures.
- **OSAP Passport Generation**: Automated compilation of Open Software Assurance Passport (OSAP) bundles for regulatory submission and client trust verification.
- **Universal Technology Coverage Framework (UTCF)**: Seamless integration across 20 distinct technical infrastructure and application layers.

---

## 2. Architecture & Governance Model

EAORCS operates on a strict **9-Layer Architecture** governing **7 Core Capability Domains** across **20 UTC Technology Layers**.

```
+-----------------------------------------------------------------------+
| LAYER 9: Executive Presentation & Regulatory Governance Reporting     |
+-----------------------------------------------------------------------+
| LAYER 8: Continuous Remediation & Policy Enforcement Engine            |
+-----------------------------------------------------------------------+
| LAYER 7: OSAP Passport & Cryptographic Certification Service          |
+-----------------------------------------------------------------------+
| LAYER 6: Audit Execution & Compliance Matrix Evaluation               |
+-----------------------------------------------------------------------+
| LAYER 5: Evidence Store, Chain of Custody & Cryptographic Verification|
+-----------------------------------------------------------------------+
| LAYER 4: Telemetry Aggregation & Event Stream Processing              |
+-----------------------------------------------------------------------+
| LAYER 3: UTCF Domain Adapters & Data Collection Streams               |
+-----------------------------------------------------------------------+
| LAYER 2: Core DSL Engine & Policy Compiler                            |
+-----------------------------------------------------------------------+
| LAYER 1: Storage, Cache, Queue & Host Abstraction Runtime             |
+-----------------------------------------------------------------------+
```

### The 7 Core Capability Domains
1. **Security & Zero Trust Governance**: Identity, authorization, encryption, and secret management.
2. **Code & Architecture Integrity**: Static analysis, dependency graphs, ADR tracking, and protocol freezes.
3. **Infrastructure & Cloud Resilience**: IaC validation, Kubernetes security posture, and multi-cloud baseline checks.
4. **Data Privacy & Governance**: Data masking, retention policies, and cross-border transport checks.
5. **Quality & ISO/IEC 25010 Verification**: Reliability, performance efficiency, maintainability, and test coverage thresholds.
6. **Supply Chain & BOM Trust**: Software Bill of Materials (SBOM) verification, SLSA Level 4 compliance, and vulnerability scanning.
7. **Operational Auditability & Lineage**: Full event tracing, change correlation, and audit logs.

---

## 3. User Interface & Navigation Map

The EAORCS Web Console is accessible via standard Web Browsers supporting modern TLS 1.3 standards.

### Navigation Hierarchy
- **Header Navigation**: Global Search, Organization Context Selector, Environment Toggle (Production / Staging / Dev), Alert Center, User Profile & API Token Management.
- **Primary Sidebar**:
  - 📊 **Dashboard**: Real-time Software Trust Index (STI), active posture, key metrics.
  - 🛡️ **Compliance Monitoring**: Active compliance frameworks, control matrices, gap analysis.
  - 📜 **Evidence Vault**: Cryptographic proofs, chain-of-custody verification tree, artifact ledger.
  - 🕵️ **Audit Center**: Audit executions, report generation, OSAP Passports, certifications.
  - 🔧 **Remediation Hub**: Automated remediation runs, rule triggers, manual review queue.
  - ⚡ **Telemetry Stream**: Live events, audit trail, metric counters, system telemetry.
  - ⚙️ **Settings & Administration**: System configuration, RBAC, identity federation, adapters.

---

## 4. Dashboard Metrics & Trust Index Analytics

The Main Dashboard provides immediate visibility into the overall health and compliance posture of your enterprise software portfolio.

### Software Trust Index (STI)
The **Software Trust Index (STI)** is a normalized score ranging from **0.00 to 100.00**, calculated dynamically based on multi-dimensional weighted metrics:

$$\text{STI} = w_s S_{\text{sec}} + w_c C_{\text{comp}} + w_q Q_{\text{iso}} + w_b B_{\text{sbom}} - P_{\text{vuln}}$$

Where:
- $S_{\text{sec}}$: Security & Zero-Trust Score (Weight: 30%)
- $C_{\text{comp}}$: Regulatory Compliance Matrix Pass Rate (Weight: 30%)
- $Q_{\text{iso}}$: ISO/IEC 25010 Quality Rating (Weight: 25%)
- $B_{\text{sbom}}$: Supply Chain & BOM Verification Index (Weight: 15%)
- $P_{\text{vuln}}$: Penalty deduction for unmitigated CVEs / non-compliances.

### ISO/IEC 25010 Quality Radar
The dashboard visualizes system quality across 8 key characteristics:
1. **Functional Suitability**: Requirement completeness and accuracy.
2. **Performance Efficiency**: Latency (p99 < 50ms), throughput, resource utilization.
3. **Compatibility**: Interoperability and co-existence.
4. **Usability**: Accessibility and error protection.
5. **Reliability**: Availability, fault tolerance, and recoverability.
6. **Security**: Confidentiality, integrity, non-repudiation, accountability.
7. **Maintainability**: Modularity, reusability, testability.
8. **Portability**: Adaptability and installability.

---

## 5. Continuous Compliance Monitoring

EAORCS continuously evaluates your applications and infrastructure against formal compliance definitions stored in `.governance/contracts/`.

### Viewing Compliance Status
1. Navigate to **Compliance Monitoring** > **Frameworks**.
2. Select a compliance standard (e.g., `ISO-27001-2022` or `SOC2-TYPE-II`).
3. Expand specific Control Domains (e.g., `A.8.25 Secure Coding Practices`).
4. View real-time status indicators:
   - 🟢 **Compliant**: 100% automated evidence verified.
   - 🟡 **Warning**: Minor control drift or upcoming credential rotation due.
   - 🔴 **Non-Compliant**: Control failure detected; automated remediation pending or manual review required.

---

## 6. Cryptographic Evidence Verification & Chain of Custody

All compliance assertions in EAORCS must be backed by cryptographic evidence.

### Evidence Structure & Provenance
Each evidence item consists of:
- **Evidence Identifier**: UUIDv4 unique key.
- **Timestamp**: UTC High-resolution ISO-8601 timestamp.
- **Source Adapter**: The UTCF adapter that collected the payload.
- **Payload Hash**: SHA-256 digest of the collected payload.
- **Merkle Tree Proof**: Cryptographic proof demonstrating inclusion in the global evidence ledger.
- **Digital Signature**: Ed25519 corporate key signature.

### Verifying Evidence via Web Console
1. Navigate to **Evidence Vault**.
2. Click **Verify Ledger Integrity**.
3. Select an Evidence Artifact or paste an Evidence Hash.
4. Click **Execute Proof Verification**.
5. The system will independently verify the Merkle root, public key signature, and payload digest, returning an immutable verification certificate.

---

## 7. Audit Reporting & OSAP Passport Generation

EAORCS enables one-click generation of audit reports and regulatory passports.

### Generating an OSAP Passport
The **Open Software Assurance Passport (OSAP)** is a cryptographically signed, machine-readable JSON/ZIP package containing all evidence, compliance matrices, SBOMs, and vulnerability attestations required by auditors.

#### Via CLI:
```bash
# Execute a full compliance audit
eaorcs audit run --environment production --output audit-results.json

# Certify the system state
eaorcs certify --config eaorcs.config.yaml --out certify-report.json

# Package into an OSAP Passport
eaorcs passport export --output osap-passport-2026.1.zip
```

#### Via Web Console:
1. Navigate to **Audit Center** > **OSAP Passport Generator**.
2. Select target environment and compliance standards.
3. Click **Generate Passport Bundle**.
4. Download the signed `.zip` package or export executive PDF summary reports.

---

## 8. Remediation Workflows & Automated Governance

When control drifts or compliance failures are detected, EAORCS can execute automated remediation policies or trigger human-in-the-loop workflows.

### Workflow Execution Modes
- **Automated Mode**: System executes predefined script/IaC remediations (e.g., revoking non-compliant IAM permissions, patching vulnerable container images).
- **Interactive Mode**: Generates an actionable ticket in Jira/GitHub Issues/ServiceNow and waits for approval.
- **Enforcement Mode**: Blocks CI/CD deployment pipelines immediately upon non-compliance detection.

To run remediation manually via CLI:
```bash
eaorcs remediation run --finding-id FINDING-2026-8841 --mode dry-run
eaorcs remediation run --finding-id FINDING-2026-8841 --mode enforce
```

---

## 9. Enterprise Roles & Access Controls

EAORCS enforces granular Role-Based Access Control (RBAC):

| Role | Dashboard | Compliance | Evidence | Audits | Remediation | System Config |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **System Administrator** | Read/Write | Read/Write | Read/Write | Read/Write | Read/Write | Read/Write |
| **Compliance Officer** | Read | Read/Write | Read | Read/Execute | Execute | Read |
| **Security Engineer** | Read | Read/Write | Read/Write | Read | Read/Execute | Read |
| **DevOps / Engineer** | Read | Read | Read | Read | Read | Read |
| **Auditor (External)** | Read | Read | Read/Verify | Read/Export | None | None |

---

## 10. Troubleshooting & Frequently Asked Questions

### Frequently Asked Questions

#### Q: How does EAORCS verify evidence without exposing sensitive secrets?
**A**: EAORCS uses zero-knowledge payload hashing (SHA-256) and token redactions at the adapter layer before evidence is ingested into the evidence store.

#### Q: Can EAORCS run in air-gapped environments?
**A**: Yes. By setting `platform_adapters.offline_mode: true` and `host_awareness.force_environment: AirGapped` in `eaorcs.config.yaml`, EAORCS performs all cryptographic validation locally using bundled local public keys.

### Common Operational Issues

#### Issue 1: "Evidence Signature Verification Failure"
- **Cause**: The public key configured in EAORCS does not match the Ed25519 signing key used by the UTCF collector adapter.
- **Solution**: Update the public key registry under `Settings` > `Security & Keys` or verify `eaorcs.config.yaml`.

#### Issue 2: "Database Queue Latency High"
- **Cause**: In high-throughput environments, the fallback database queue is overwhelmed.
- **Solution**: Upgrade queue provider in `eaorcs.config.yaml` from `database` fallback to `redis` or `rabbitmq`.

---
*For further assistance, contact Ujomor Systems Enterprise Support at `support@airroofers.eu`.*
