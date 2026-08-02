/******************************************************************************
 * Project        : EAORCS
 * Module         : Documentation
 * File           : configuration-reference.md
 * Version        : 2026.1.0-lts
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-02
 * Last Modified  : 2026-08-02
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
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
 * - NIST SP 800-53
 *
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance
 * All Rights Reserved.
 ******************************************************************************/

![EAORCS Logo](../../assets/branding/eaorcs_logo.png)

# EAORCS Configuration Reference

**Standard**: Universal Autonomous AI Governance Operating System (UAIGOS 3.0.0)  
**Authority**: Ujomor Systems Engineering & Governance Authority  
**Classification**: GOVERNMENT | ENTERPRISE | RESTRICTED  

---

## 1. Executive Summary

This reference manual specifies the complete configuration semantics for the Enterprise Autonomous Observability & Regulatory Compliance System (EAORCS). The primary configuration vector is `eaorcs.config.yaml`, which can be overridden dynamically by environment variables for containerized deployments.

---

## 2. Core Configuration File (`eaorcs.config.yaml`)

The `eaorcs.config.yaml` file defines the baseline operational state of the system.

### 2.1 Complete YAML Schema Example

```yaml
version: "2026.1.0-lts"
environment: "production"

security:
  zero_trust_enabled: true
  slsa_enforcement_level: 4
  tls:
    enabled: true
    min_version: "TLSv1.3"
  crypto:
    default_algorithm: "Ed25519"

telemetry:
  enabled: true
  retention_days: 90
  export_format: "otlp"
  metrics_interval_ms: 15000

audit:
  strict_mode: true
  thresholds:
    max_critical_cve: 0
    max_high_cve: 0
  evidence_retention: "permanent"

profiles:
  - name: "development"
    debug_logging: true
    telemetry: false
  - name: "production"
    debug_logging: false
    telemetry: true
  - name: "airgap"
    offline_mode: true
    external_sync: false
```

---

## 3. Environment Variable Overrides

All YAML keys can be overridden at runtime using environment variables prefixed with `EAORCS_`.

| YAML Path | Environment Variable | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `environment` | `EAORCS_ENVIRONMENT` | `production` | Active runtime profile. |
| `security.zero_trust_enabled` | `EAORCS_SEC_ZERO_TRUST` | `true` | Enforces mandatory mutual TLS (mTLS) across all contexts. |
| `security.slsa_enforcement_level` | `EAORCS_SEC_SLSA_LEVEL` | `4` | Determines strictness of supply chain checks. |
| `telemetry.enabled` | `EAORCS_TELEMETRY_ENABLED` | `true` | Toggles export of OpenTelemetry data. |
| `telemetry.retention_days` | `EAORCS_TELEMETRY_RETENTION` | `90` | Number of days to retain logs in `storage/telemetry/`. |
| `audit.strict_mode` | `EAORCS_AUDIT_STRICT` | `true` | If true, fails deployment on any governance violation. |

---

## 4. Operational Profiles

EAORCS operates dynamically based on the designated deployment profile. 

### 4.1 `development` Profile
Optimized for local engineering and debugging.
- **Security Validation**: Relaxed (Permits self-signed certificates).
- **Telemetry**: Disabled by default to save disk space.
- **Logging**: Debug level output in terminal.

### 4.2 `staging` Profile
Mirror of production, used for final QA validation.
- **Security Validation**: Strict.
- **Telemetry**: Enabled (Exported to staging sinks).
- **Logging**: Info level.

### 4.3 `production` Profile
Optimized for high availability, compliance, and resilience.
- **Security Validation**: Maximum (SLSA Level 4, Zero Trust mTLS).
- **Telemetry**: Fully Enabled.
- **Logging**: Structured JSON format only (Warning/Error levels).

### 4.4 `airgap` Profile
Optimized for classified government networks disconnected from the internet.
- **Security Validation**: Maximum.
- **External Connections**: Disabled (No outbound internet checks).
- **Dependency Sync**: Disabled (Uses local mirrors).

---

## 5. Security & Cryptography Settings

### 5.1 TLS Enforcement
EAORCS mandates `TLSv1.3` for all external web communications and internal microservice communication when zero-trust is enabled. `TLSv1.2` and below are strictly prohibited.

### 5.2 Cryptographic Signatures
All legal documents, evidence bundles, and audit reports generated in the `storage/evidence/` and `release/` directories are cryptographically signed using the **Ed25519** elliptic curve algorithm to ensure non-repudiation.

---

## 6. Audit & Threshold Configuration

The `audit.thresholds` section determines the acceptable risk tolerance for the environment.
- `max_critical_cve`: Must remain `0`. Any critical finding halts the EAORCS pipeline.
- `max_high_cve`: Must remain `0` for production environments.

*Any modification to audit thresholds requires sign-off from the Ujomor Systems Engineering & Governance Authority.*
