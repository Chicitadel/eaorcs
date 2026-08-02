/******************************************************************************
 * Project        : Air Roofers Subsystem Ecosystem (airroofers.eu)
 * Module         : EAORCS Commercial Strategy
 * File           : PRICING_AND_TIERS.md
 * Version        : 2026.1.0-GA
 * Author         : Air Roofers Architecture Authority
 * Organization   : Chicitadel / Air Roofers SASU
 * Created Date   : 2026-08-02
 * Last Modified  : 2026-08-02
 * Classification : PUBLIC | COMMERCIAL
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
 * Copyright (c) 2026 Chicitadel / Air Roofers SASU
 * All Rights Reserved.
 ******************************************************************************/

![EAORCS Logo](../../assets/branding/eaorcs_logo.png)

# EAORCS Commercial Strategy & License Tiers Overview

EAORCS is offered through a tiered licensing model designed to scale from individual developers building trusted open-source software to sovereign governments requiring absolute airgapped security and compliance.

## Tier Breakdown

### Community Edition
**Target Audience:** Individual developers, students, and small open-source projects.
**Price:** Free / Open Source

*   **Core Capabilities:** Local development environments, basic host detection, standard policy DSL evaluation.
*   **Deployment:** Single-node local execution.
*   **Support:** Community forums and GitHub issues.
*   **Signatures:** Basic checksum validation.

### Professional SaaS
**Target Audience:** Startups, mid-sized companies, and commercial software vendors.
**Price:** $499/month or $4,990/year (Billed Annually - Save ~16%)

*   **Core Capabilities:** Full OSAP v2.0 Passport generation, managed Web Observatory dashboard, automated external audits.
*   **Deployment:** Cloud-hosted SaaS (Multi-tenant).
*   **Support:** Standard business hours (9x5) SLA with email support.
*   **Signatures:** Ed25519 cryptographic signatures for passports.

### Enterprise Dedicated
**Target Audience:** Large enterprises, financial institutions, and regulated industries.
**Price:** $2,499/month or $24,990/year (Billed Annually)

*   **Core Capabilities:** Dedicated infrastructure, advanced telemetry, custom compliance reporting (SOC 2, ISO 27001 mappings).
*   **Deployment:** Dedicated Single-tenant Cloud or Bring-Your-Own-Cloud (BYOC).
*   **Support:** 24/7/365 Priority Support SLA with Dedicated Account Manager.
*   **Signatures:** Advanced Ed25519 signatures with hardware security module (HSM) integration options.

### Sovereign Airgap Government
**Target Audience:** Intelligence agencies, defense contractors, and sovereign national governments.
**Price:** Custom quote / Unlimited nodes

*   **Core Capabilities:** Full offline capability, custom cryptographic suites, unlimited node deployment, complete data sovereignty.
*   **Deployment:** On-Premises Airgap Installation.
*   **Support:** Dedicated Technical Account Manager (TAM), on-site deployment assistance, custom SLA.
*   **Signatures:** Post-quantum cryptography readiness, bring-your-own-keys (BYOK), custom PKI integration.

---

## Feature Comparison Matrix

| Feature | Community | Professional SaaS | Enterprise Dedicated | Sovereign Airgap |
| :--- | :---: | :---: | :---: | :---: |
| **Monitored Nodes** | 1 | Up to 50 | Up to 500 | Unlimited |
| **Audit Scans per Month** | 100 | 10,000 | Unlimited | Unlimited |
| **Support SLAs** | Community | 9x5 Standard | 24/7 Priority | Custom / Dedicated |
| **Compliance Reports** | Basic | Standard | Advanced (Custom) | Custom / Classified |
| **Ed25519 Signatures** | ❌ | ✅ | ✅ (HSM Option) | ✅ (Custom PKI) |
| **OSAP v2.0 Passports** | Basic | Full | Full | Full + Offline |
| **Web Observatory** | Local | Hosted | Dedicated | On-Premises |
| **Airgap Support** | ❌ | ❌ | ❌ | ✅ |

---

## Add-on Services

Enhance your EAORCS deployment with these specialized professional services:

1.  **Dedicated TAM (Technical Account Manager):** Ensure smooth operations and strategic alignment with a dedicated expert. (Included in Sovereign Airgap, available as an add-on for Enterprise).
2.  **Custom DSL Engine Adapters:** Development of custom policy language adapters to integrate with legacy or proprietary systems.
3.  **On-Premises Airgap Installation:** Professional deployment services for highly secure, disconnected environments. (Included in Sovereign Airgap, available for specific Enterprise requirements).

---

## Licensing & Billing Policy

*   **Billing Cycles:** Subscriptions are available on a monthly or annual basis. Annual subscriptions receive a discount.
*   **Overage Charges:** For Professional and Enterprise tiers, exceeding the allotted monitored nodes or audit scans will incur standard overage fees, billed at the end of the month.
*   **Upgrades/Downgrades:** Customers may upgrade their tier at any time (pro-rated). Downgrades take effect at the next billing cycle.
*   **License Keys:** License keys are securely provisioned via the customer portal. Airgap customers receive specialized offline provisioning mechanisms.
*   **Compliance:** All commercial usage is subject to the Ujomor Systems Enterprise End User License Agreement (EULA).
