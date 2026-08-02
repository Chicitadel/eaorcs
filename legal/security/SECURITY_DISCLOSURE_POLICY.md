<!--
/******************************************************************************
 * Project        : EAORCS (Enterprise Autonomous Operation & Resilience Control System)
 * Module         : Legal & Security Governance
 * File           : SECURITY_DISCLOSURE_POLICY.md
 * Version        : 1.0.0
 * Author         : Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems
 * Created Date   : 2026-05-16
 * Last Modified  : 2026-05-16
 * Classification : ENTERPRISE | PUBLIC | GLOBAL SECURITY
 *
 * Governance:
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Vulnerability Managed
 *
 * Standards:
 * - ISO/IEC 29147 (Vulnerability Disclosure)
 * - ISO/IEC 30111 (Vulnerability Handling)
 * - FIRST CVSS v4.0 Standard
 * - OWASP ASVS v4.0
 *
 * Signatures:
 * - Architecture Authority
 * - Chief Information Security Officer (CISO)
 * - Governance Authority
 * - Security Response Team (PSIRT) Lead
 *
 * Copyright (c) 2026 Ujomor Systems. All Rights Reserved.
 ******************************************************************************/
-->

# Security Disclosure & Vulnerability Policy

**Document ID:** `doc-sec-01`  
**Version:** 1.0.0  
**Effective Date:** 2026-05-16  
**Governance Authority:** Ujomor Systems Engineering & Governance Authority  
**Scope:** Global Security Operations & Public Vulnerability Disclosure  

---

## 1. Security Commitment & Vulnerability Response

**Ujomor Systems** is committed to maintaining the security, integrity, and resilience of the EAORCS platform. We encourage responsible vulnerability research and vulnerability reporting from independent security researchers, customers, and partners.

---

## 2. Reporting Guidelines & Safe Harbor

### 2.1 Reporting Contact & Encrypted Submissions
Vulnerability reports should be submitted to security@ujomor.com with PGP encryption. Submissions must include:
- Technical description of the vulnerability and attack vector.
- Proof-of-Concept (PoC) code or reproducible steps.
- Estimated CVSS impact evaluation.

### 2.2 Coordinated Vulnerability Disclosure (CVD) Terms
Researchers adhering to these guidelines are granted **Safe Harbor**: Ujomor Systems will not initiate legal action against researchers acting in good faith. 

Researchers MUST:
- Refrain from accessing customer privacy data or disrupting production operations.
- Allow Ujomor Systems a ninety (90) day resolution period prior to public disclosure.

---

## 3. SLA for Vulnerability Resolution

| Severity (CVSS v4.0) | Initial Acknowledgment | Remediation Target | Hotfix Target |
| :--- | :--- | :--- | :--- |
| **Critical (9.0 - 10.0)** | < 4 Hours | < 24 Hours | < 48 Hours |
| **High (7.0 - 8.9)** | < 12 Hours | < 72 Hours | < 7 Days |
| **Medium (4.0 - 6.9)** | < 24 Hours | < 14 Days | Next Release |
| **Low (0.1 - 3.9)** | < 48 Hours | < 30 Days | Maintenance Window |

---

## 4. Software Supply Chain & Vulnerability Scanning

EAORCS releases undergo continuous automated security scanning, including:
- Static Application Security Testing (SAST).
- Software Bill of Materials (SBOM) component analysis via CycloneDX/SPDX.
- Container image signing via Cosign and Ed25519 cryptographic keys.
