<!--
==============================================================================
 Project        : EAORCS Enterprise Platform
 Module         : Security Architecture & Cryptography
 File           : SECURITY_ARCHITECTURE_GUIDE.md
 Version        : 3.0.0
 Author         : Chief Information Security Officer & Cryptographic Review Board
 Organization   : Ujomor Platform Engineering
 Created Date   : 2026-08-01
 Last Modified  : 2026-08-01
 Classification : ENTERPRISE / RESTRICTED

 Governance:
 - Enterprise Security Reviewed
 - Architecture Controlled
 - Cryptographic Protocols Frozen
 - SLSA Level 4 Enforced

 Standards:
 - NIST SP 800-207 (Zero Trust Architecture)
 - RFC 8032 (Ed25519) / RFC 3161 (Trusted Timestamping)
 - OWASP ASVS v4.0.3 Level 3
 - SLSA v1.0 Level 4

 Signatures:
 - Chief Information Security Officer : Security Governance Office
 - Chief Cryptographer                : Applied Cryptography Group
 - Lead Security Architect           : Platform Security Steering Group

 Copyright (c) 2026 Ujomor Platform Engineering. All Rights Reserved.
==============================================================================
-->

# EAORCS Enterprise Edition: Security Architecture & Threat Model Guide

## 1. Zero-Trust Architectural Foundations

EAORCS operates on a strict **Zero-Trust Architecture (ZTA)** governed by NIST SP 800-207 principles. Every network packet, inter-process communication (IPC), and administrative API request is continuously authenticated, authorized, and cryptographically verified.

```
       +-----------------------------------------------------------------------+
       |                   Untrusted Network / Ingress Edge                    |
       +-----------------------------------------------------------------------+
                                           |
                                           | Strict TLS 1.3 + Client Cert (mTLS)
                                           v
       +-----------------------------------------------------------------------+
       |             SPIFFE/SPIRE Workload Identity Attestation                |
       |  - Cryptographic Identity Document (SVID) issued every 60 minutes    |
       +-----------------------------------------------------------------------+
                                           |
                    +----------------------+----------------------+
                    |                                             |
                    v                                             v
   +---------------------------------+           +---------------------------------+
   |  Identity-Aware Proxy (RBAC/ABAC)|           | Hardware Security Module (HSM)  |
   |  - Deny-by-default policy engine|           | - PKCS#11 Non-exportable keys   |
   +---------------------------------+           +---------------------------------+
                    |                                             |
                    +----------------------+----------------------+
                                           |
                                           v
       +-----------------------------------------------------------------------+
       |             Cryptographically Signed Append-Only Audit Log            |
       |  - Ed25519 Signatures + RFC 3161 Trusted Time-Stamps                   |
       +-----------------------------------------------------------------------+
```

### Core Zero-Trust Pillars:
1. **Explicit Identity Verification**: Every workload presents a short-lived SPIFFE Verifiable Identity Document (SVID) bound to its container cgroup and process image digest.
2. **Least Privilege & Microsegmentation**: Fine-grained RBAC/ABAC models enforce strict action boundaries. Cross-namespace traffic is prohibited by default.
3. **Assume Breach**: Internal network boundaries maintain the same cryptographic controls as external ingress endpoints.

---

## 2. Ed25519 Cryptographic Signing & RFC 3161 Timestamping

To prevent transaction tampering and ensure legal non-repudiation, EAORCS signs all orchestration events using High-Speed High-Security Ed25519 Cryptography (RFC 8032) coupled with RFC 3161 Cryptographic Timestamps.

```
+-------------------+      +-------------------+      +-------------------+
| Transaction State | ---> | SHA-512 Hash      | ---> | Ed25519 Private   |
| Payload           |      | Computation       |      | Key (HSM Slot 0)  |
+-------------------+      +-------------------+      +-------------------+
                                                                |
                                                                v
+-------------------+      +-------------------+      +-------------------+
| RFC 3161 TSA      | <--- | Envelope Payload  | <--- | Detached Ed25519  |
| Signed Timestamp  |      | + Signature       |      | Digital Signature |
+-------------------+      +-------------------+      +-------------------+
          |
          v
+-------------------------------------------------------------------------+
| Immutable Event Record in Ledger (Tamper-Evident Digest)                |
+-------------------------------------------------------------------------+
```

### Cryptographic Specification:
- **Signature Algorithm**: Ed25519 (Edwards-curve Digital Signature Algorithm using Curve25519).
- **Digest Function**: SHA-512 (used internally within Ed25519 signature computation).
- **Key Storage**: Private key material resides exclusively inside FIPS 140-3 Level 3 Hardware Security Modules.
- **Timestamping Authority (TSA)**: RFC 3161 compliant external/internal TSA providing trusted UTC time assertions with nanosecond resolution.

---

## 3. SLSA Level 4 Supply Chain Security & Attestations

EAORCS achieves **Supply Chain Levels for Software Artifacts (SLSA) Level 4** compliance, ensuring absolute integrity from code commit to container deployment.

```
[ Developer Commit ] ---> [ Ephemeral Sealed Build Runner ] ---> [ Cosign Image Signing ]
         |                              |                                |
         v                              v                                v
 Signed Git Commit              Hermetic Hermetic Build          Sigstore OIDC Identity
 (PGP / SSH Hardware)         (No External Network Access)      Attestation Record
                                        |
                                        v
                               [ SBOM Generation ]
                               (CycloneDX & Syft)
```

### Supply Chain Controls:
- **Hermetic & Ephemeral Builds**: Build environments run in isolated, disposable pods with network isolation during compilation.
- **Software Bill of Materials (SBOM)**: Every build output generates CycloneDX JSON SBOM manifests detailing all third-party dependencies and transitive hashes.
- **Container Image Signature Verification**: The Kubernetes `Kyverno` policy engine rejects any container image whose signature cannot be verified against the official Ujomor Release Key in Sigstore/Cosign.

---

## 4. DevSecOps Security Gates & Automated Scanning

The EAORCS continuous integration pipeline enforces rigorous security gates. Builds MUST pass all automated scans prior to merging into release branches.

```
+-----------------------------------------------------------------------------------+
|                               DevSecOps Pipeline                                  |
+-----------------------------------------------------------------------------------+
   |
   +---> [ Gate 1: Gitleaks ] ---------------> Zero secrets / API keys allowed
   |
   +---> [ Gate 2: Semgrep / SonarQube ] ---> SAST: Zero Critical/High vulnerabilities
   |
   +---> [ Gate 3: Trivy / Grype ] ---------> Container & OS Vulnerability Scan
   |
   +---> [ Gate 4: OWASP ZAP / DAST ] ------> Dynamic API Fuzzing & Security Tests
   |
   +---> [ Gate 5: Cosign Integrity ] ------> Cryptographic Artifact Verification
```

### Pipeline Security Thresholds:

| Security Tool | Scan Type | Failure Condition / Blocking Threshold |
| :--- | :--- | :--- |
| **Gitleaks** | Secret Detection | Any detected secret, API key, or private key block |
| **Semgrep / SonarQube** | SAST | 1+ Critical/High severity issue or OWASP Top 10 match |
| **Trivy / Grype** | Container & Dependencies | Any unpatched `CRITICAL` or `HIGH` CVSS 4.0 issue |
| **OWASP ZAP** | DAST | Any high-risk security headers, injection, or broken auth |
| **Kyverno** | Policy Enforcement | Absence of valid SLSA provenance or Cosign signature |

---

## 5. Vulnerability Management Lifecycle & Remediation SLAs

EAORCS maintains a disciplined vulnerability management program synchronized with CISA Known Exploited Vulnerabilities (KEV) and CVSS v4.0 scoring metrics.

### Vulnerability Remediation SLA Matrix:

| CVSS v4.0 Rating | Score Range | Emergency Remediation SLA | Patch Deployment Workflow |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | `9.0 - 10.0` | **`< 24 Hours`** | Immediate hotfix release & emergency canary patch |
| **HIGH** | `7.0 - 8.9` | **`< 7 Days`** | Scheduled priority patch release |
| **MEDIUM** | `4.0 - 6.9` | **`< 30 Days`** | Standard bi-weekly maintenance release |
| **LOW** | `0.1 - 3.9` | **`< 90 Days`** | Next major/minor milestone release |

---

## 6. Threat Model & STRIDE Analysis Matrix

A comprehensive STRIDE threat model has been performed for the EAORCS core platform:

| Threat Category | Target Subsystem | Identified Threat Vector | Mitigating Architectural Control |
| :--- | :--- | :--- | :--- |
| **Spoofing** | API Endpoint | Impersonation of Control Engine node | SPIFFE/SPIRE short-lived SVIDs + TLS 1.3 mTLS mutual authentication |
| **Tampering** | Audit Trail Log | Modification of historical execution logs | Ed25519 cryptographic signing + RFC 3161 timestamping + WORM storage |
| **Repudiation** | Operator Actions | Operator denying administrative command | Mandatory hardware MFA token + session recording + signed audit payload |
| **Information Disclosure** | State Database | Unauthorized read of secrets in transit/rest | AES-256-GCM database encryption + PKCS#11 HSM secret protection |
| **Denial of Service** | Event Ingestion | Resource exhaustion via API flooding | Cilium eBPF rate-limiting + Istio Envoy token-bucket request throttling |
| **Elevation of Privilege** | Container Pod | Pod escape to host kernel | Read-only root filesystem + drop ALL Linux capabilities + non-root user 10001 |

---
*End of Security Architecture & Threat Model Guide — Enterprise Operations Standard v3.0.0*
