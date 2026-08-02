<!--
/******************************************************************************
 * Project        : EAORCS (Enterprise Autonomous Operation & Resilience Control System)
 * Module         : Legal & Terms of Service
 * File           : TERMS_OF_SERVICE.md
 * Version        : 1.0.0
 * Author         : Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems
 * Created Date   : 2026-05-16
 * Last Modified  : 2026-05-16
 * Classification : ENTERPRISE | PUBLIC | GLOBAL
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
 * - ITIL v4 Service Management
 *
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Service Delivery Authority
 *
 * Copyright (c) 2026 Ujomor Systems. All Rights Reserved.
 ******************************************************************************/
-->

# Terms of Service & SLA Guarantee

**Document ID:** `doc-trm-01`  
**Version:** 1.0.0  
**Effective Date:** 2026-05-16  
**Governance Authority:** Ujomor Systems Engineering & Governance Authority  
**Scope:** Global Enterprise Operations & Cloud Services  

---

## 1. Acceptance of Terms & Service Scope

These Terms of Service ("Terms") govern access to and usage of the EAORCS control plane, updates, API services, and associated technical support provided by **Ujomor Systems**. By deploying, configuring, or interacting with EAORCS services, Customer agrees to be bound by these Terms.

---

## 2. Service Level Agreement (SLA) & Uptime Guarantee

### 2.1 Availability Commitment
Ujomor Systems guarantees a Service Availability target of **99.99% ("Four Nines")** per calendar month for cloud-hosted control planes and key distribution endpoints, excluding scheduled maintenance windows.

### 2.2 SLA Calculation Formula
Monthly Uptime Percentage is calculated as:
$$\text{Uptime Percentage} = \frac{\text{Total Minutes in Month} - \text{Downtime Minutes}}{\text{Total Minutes in Month}} \times 100$$

### 2.3 Service Credits
If Service Availability falls below the guaranteed threshold, Customer is eligible for service credits applied against future subscription renewals:
- **< 99.99% to 99.9%**: 10% Service Credit
- **< 99.9% to 99.0%**: 25% Service Credit
- **< 99.0%**: 50% Service Credit

---

## 3. Maintenance & Update Protocols

1. **Scheduled Maintenance**: Standard system upgrades occur during announced windows with at least 7 days' advance notification. Scheduled maintenance shall not exceed 4 hours per month.
2. **Emergency Security Patches**: Critical zero-day vulnerability hotfixes (CVSS >= 9.0) may be deployed out-of-band with immediate notification to customer security contacts.

---

## 4. Acceptable Use Policy (AUP)

Customer shall not use EAORCS for:
- Any illegal or unauthorized purpose violating local or international regulations.
- Launching cyber attacks, malware propagation, or unauthorized port scanning.
- Interference with the stability, integrity, or network infrastructure of other cloud tenants.

---

## 5. Termination & Transition Assistance

Either party may terminate services for material breach following a thirty (30) day cure period. Upon termination, Ujomor Systems provides thirty (30) days of data extraction support to facilitate secure customer migration.
