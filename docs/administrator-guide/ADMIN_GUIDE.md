/******************************************************************************
 * Project        : EAORCS Continuous Software Assurance Platform
 * Module         : System Administrator Guide
 * File           : ADMIN_GUIDE.md
 * Version        : 2026.1-LTS
 * Author         : Architectural Governance Council & Ujomor Systems Engineering
 * Organization   : Ujomor Systems Ecosystem
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 *
 * Standards:
 * - ISO 27001
 * - SOC 2 Type II
 * - NIST SP 800-53 Rev. 5
 * - CIS Benchmarks
 *
 * Copyright (c) 2026 Ujomor Systems Ecosystem. All Rights Reserved.
 ******************************************************************************/


<p align="center">
  <img src="../assets/eaorcs_logo_256.png" alt="EAORCS Logo" width="140" height="140" />
</p>

# EAORCS System Administrator Guide
**Version 2026.1.0-GA** | **Ujomor Systems Ecosystem**

---

## Table of Contents
1. [Architecture & Deployment Models](#1-architecture--deployment-models)
2. [Prerequisites & System Requirements](#2-prerequisites--system-requirements)
3. [Installation & Setup](#3-installation--setup)
4. [Configuration Reference (`eaorcs.config.yaml`)](#4-configuration-reference-eaorcsconfigyaml)
5. [Identity Federation & SSO Configuration](#5-identity-federation--sso-configuration)
6. [Role-Based Access Control (RBAC)](#6-role-based-access-control-rbac)
7. [High Availability (HA) & Scaling](#7-high-availability-ha--scaling)
8. [Backup, Restore & Disaster Recovery](#8-backup-restore--disaster-recovery)
9. [Monitoring, Observability & Telemetry](#9-monitoring-observability--telemetry)
10. [Air-Gapped & Offline Hardening](#10-air-gapped--offline-hardening)

---

## 1. Architecture & Deployment Models

EAORCS features **Host Awareness** designed to adapt dynamically to diverse infrastructure targets:

- **SharedHost**: Minimal footprint, PHP/MySQL/File-queue fallback.
- **VPS / Bare Metal**: Systemd service, local storage, Redis cache.
- **Docker / Container**: OCI-compliant container runtime.
- **Kubernetes (K8s)**: Cloud-native Helm chart deployment with K8sCronJob schedulers.
- **Cloud Native (AWS / Azure / GCP)**: Auto-wired S3/Blob storage, Managed Redis, SQS/RabbitMQ.
- **AirGapped / Offline**: Standalone deployment with isolated cryptographic validation.

---

## 2. Prerequisites & System Requirements

### Hardware Requirements

| Deployment Tier | CPU Cores | RAM | Storage (SSD/NVMe) | Max Ingestion Rate |
| :--- | :--- | :--- | :--- | :--- |
| **Small (Dev/Staging)** | 2 vCPU | 4 GB | 50 GB | 100 events/sec |
| **Medium (Enterprise)** | 8 vCPU | 16 GB | 250 GB | 1,000 events/sec |
| **Large (High-Availability)** | 32 vCPU (Cluster) | 64 GB (Cluster) | 2 TB (SAN/S3) | 20,000 events/sec |

### Software Prerequisites
- Node.js runtime v18.0.0 or higher.
- Database: MySQL 8.0+ or PostgreSQL 14+ (or SQLite for local dev).
- Cache & Queue: Redis 6.2+ (recommended for production).
- TLS 1.3 reverse proxy (Nginx, Caddy, or AWS ALB).

---

## 3. Installation & Setup

### CLI Binary Deployment
EAORCS provides unified executable entrypoints for Linux/macOS (`bin/eaorcs`) and Windows PowerShell (`bin/eaorcs.ps1`).

```bash
# Clone or unpack enterprise release bundle
cd d:/ujomor-platform/products/eaorcs

# Install core dependencies
npm install --production

# Verify CLI installation
./bin/eaorcs --version
```

On Windows PowerShell:
```powershell
.\bin\eaorcs.ps1 --version
```

---

## 4. Configuration Reference (`eaorcs.config.yaml`)

The primary configuration file is `eaorcs.config.yaml` located at the root of the product installation directory.

### Configuration Schema Breakdown

```yaml
eaorcs:
  product_id: "com.ujomor.eaorcs"
  name: "EAORCS - The Software Trust Platform"
  version: "2026.1-LTS"
  edition: "Enterprise" # Options: Community, Professional, Enterprise, Government

host_awareness:
  auto_detect: true
  force_environment: null # Options: SharedHost, VPS, Docker, Kubernetes, AWS, Azure, GCP, AirGapped

runtime_abstractions:
  storage:
    provider: "auto" # Options: auto, s3, azure_blob, local, mysql
    fallback: "local"
    local_path: "./storage/data"
    mysql_table: "eaorcs_storage"

  cache:
    provider: "auto" # Options: auto, redis, apcu, file
    fallback: "file"
    file_path: "./storage/cache"

  queue:
    provider: "auto" # Options: auto, redis, rabbitmq, sqs, database
    fallback: "database"
    db_table: "eaorcs_jobs"

  scheduler:
    provider: "auto" # Options: auto, k8s_cron, cloudwatch, cron, webcron
    fallback: "webcron"

platform_adapters:
  identity_endpoint: "https://identity.airroofers.eu/api/v1"
  billing_endpoint: "https://billing.airroofers.eu/api/v1"
  licensing_endpoint: "https://licensing.airroofers.eu/api/v1"
  telemetry_endpoint: "https://telemetry.airroofers.eu/api/v1"
  support_endpoint: "https://support.airroofers.eu/api/v1"
  offline_mode: false
  allow_local_verification: true
```

---

## 5. Identity Federation & SSO Configuration

EAORCS integrates with enterprise Identity Providers (IdP) such as Keycloak, Okta, Azure AD, and PingIdentity.

### OIDC Configuration Example
Update `.governance/policies/identity.config.json`:
```json
{
  "identity_provider": "OpenIDConnect",
  "issuer_uri": "https://sso.enterprise.com/auth/realms/ujomor",
  "client_id": "eaorcs-platform",
  "client_secret_env": "EAORCS_OIDC_CLIENT_SECRET",
  "scopes": ["openid", "profile", "email", "roles"],
  "user_claim_mapping": {
    "sub": "user_id",
    "email": "email",
    "roles": "realm_access.roles"
  }
}
```

---

## 6. Role-Based Access Control (RBAC)

RBAC policies are enforced across all 9 architecture layers.

### Managing Roles via CLI
```bash
# Grant auditor access to user
eaorcs rbac grant --user "auditor@enterprise.com" --role "Auditor" --scope "global"

# Revoke permission
eaorcs rbac revoke --user "temp-user@enterprise.com" --role "SystemAdmin"
```

---

## 7. High Availability (HA) & Scaling

For HA environments, deploy EAORCS as stateless API worker nodes behind a Layer 7 Load Balancer:

```
                  +------------------------+
                  |  Layer 7 Load Balancer |
                  +-----------+------------+
                              |
         +--------------------+--------------------+
         |                                         |
+--------v-------+                        +--------v-------+
| EAORCS Node 01 |                        | EAORCS Node 02 |
+--------+-------+                        +--------+-------+
         |                                         |
         +--------------------+--------------------+
                              |
               +--------------v---------------+
               | Shared Redis / PostgreSQL DB |
               +------------------------------+
```

1. Set `storage.provider: s3` or `azure_blob`.
2. Set `cache.provider: redis`.
3. Set `queue.provider: redis` or `rabbitmq`.

---

## 8. Backup, Restore & Disaster Recovery

### Data Backup Strategy
Daily backups must capture three critical components:
1. **Database / Ledger Store**: Dump `eaorcs_storage` and `eaorcs_jobs` tables.
2. **Evidence Vault Files**: Synchronize `./storage/data` directory to offsite backup.
3. **Cryptographic Key Vault**: Backup Ed25519 private keys stored in `/config/keys/`.

### Backup Execution Command
```bash
# Create full backup bundle
eaorcs backup create --output /backups/eaorcs-backup-20260801.tgz --include-keys

# Restore from backup bundle
eaorcs restore --input /backups/eaorcs-backup-20260801.tgz --force
```

---

## 9. Monitoring, Observability & Telemetry

EAORCS exposes native OpenTelemetry metrics and structured audit logs.

### Prometheus Metrics Endpoint
Endpoint: `GET /metrics` (Protected by admin token)

Key Metrics Exposed:
- `eaorcs_sti_score_gauge`: Current Software Trust Index score.
- `eaorcs_evidence_ingested_total`: Counter of ingested evidence payloads.
- `eaorcs_audit_execution_duration_seconds`: Histogram of audit run execution times.
- `eaorcs_policy_evaluation_failures_total`: Counter of compliance drift detections.

---

## 10. Air-Gapped & Offline Hardening

To configure EAORCS for completely disconnected/classified networks:

1. Edit `eaorcs.config.yaml`:
   ```yaml
   platform_adapters:
     offline_mode: true
     allow_local_verification: true
   ```
2. Import local validation public keys into `./config/trusted_keys.pem`.
3. Disables outbound telemetry and licensing phone-home calls.

---
*For critical administrative support, contact Ujomor Systems Operations at `ops@airroofers.eu`.*
