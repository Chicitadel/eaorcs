<!--
/******************************************************************************
 * Project        : EAORCS (Enterprise Autonomous Operation & Resilience Control System)
 * Module         : Legal & Privacy / Data Protection
 * File           : DATA_PROCESSING_AGREEMENT.md
 * Version        : 1.0.0
 * Author         : Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems
 * Created Date   : 2026-05-16
 * Last Modified  : 2026-05-16
 * Classification : ENTERPRISE | EU / US / GLOBAL PRIVACY
 *
 * Governance:
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Privacy Enforced
 *
 * Standards:
 * - GDPR (EU 2016/679)
 * - CCPA / CPRA
 * - ISO 27701
 * - EU SCCs (Standard Contractual Clauses)
 *
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Data Protection Officer (DPO)
 * - Governance Authority
 *
 * Copyright (c) 2026 Ujomor Systems. All Rights Reserved.
 ******************************************************************************/
-->

# Data Processing Agreement & Privacy Policy

**Document ID:** `doc-prv-01`  
**Version:** 1.0.0  
**Effective Date:** 2026-05-16  
**Governance Authority:** Ujomor Systems Engineering & Governance Authority  
**Scope:** EU / US / Global Operations  

---

## 1. Context & Regulatory Scope

This Data Processing Agreement (DPA) and Privacy Policy establishes the contractual framework governing the processing of personal data and system telemetry by **Ujomor Systems** on behalf of enterprise customers under global privacy regulations, including the European Union General Data Protection Regulation (GDPR - EU 2016/679), California Consumer Privacy Act (CCPA/CPRA), and UK GDPR.

---

## 2. Roles & Processing Instructions

1. **Data Controller & Processor Roles**: Customer acts as Data Controller; Ujomor Systems acts as Data Processor regarding any customer-managed operational telemetry or administrative log data processed by EAORCS.
2. **Strict Purpose Limitation**: Ujomor Systems processes customer data solely in accordance with documented instructions from Customer to deliver, secure, and maintain EAORCS platform resilience.

---

## 3. Data Protection & Security Controls

### 3.1 Encryption Mandate
- **Data in Transit**: All control plane traffic, telemetry streams, and API requests must be secured using TLS 1.3 with mandatory Perfect Forward Secrecy (PFS).
- **Data at Rest**: All persistent datastores, logs, and state snapshots are encrypted using AES-256-GCM with customer-managed or HSM-backed cryptographic keys.

### 3.2 Sub-processor Governance
Ujomor Systems maintains an active inventory of authorized sub-processors. Any planned change or addition of a sub-processor requires thirty (30) days advance notice to Customer, during which Customer retains right of objection.

---

## 4. International Data Transfers

Transfers of personal data originating from the European Economic Area (EEA), United Kingdom, or Switzerland to third countries are executed under valid transfer mechanisms, including the EU Standard Contractual Clauses (SCCs - Module 2 Processor-to-Processor and Module 3 Processor-to-Subprocessor) and supplementary technical safety measures.

---

## 5. Incident Notification & Breach Protocols

Ujomor Systems will notify Customer without undue delay, and in any event within **twenty-four (24) hours**, upon confirming any security incident leading to unauthorized access, disclosure, or alteration of Customer Data. Notification includes root cause analysis, affected scopes, and corrective actions taken.
