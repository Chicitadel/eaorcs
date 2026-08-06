# Air Roofers Platform Evolution & Architecture Freeze Policy

> **Governance Authority**: Air Roofers Architecture Review Board & Governance Council  
> **Status**: RATIFIED PLATFORM POLICY  
> **Applies To**: All Air Roofers Ecosystem Products (`EAORCS`, `CiviScore`, `Akpati`, `Mandatag`, `ConsuNexia`)  
> **Effective Version**: `2026.3.0-LTS`  
> **Effective Date**: 2026-08-06

---

## 1. Purpose & Principles

This document establishes the operational rules governing code and architectural evolution for version `2026.3.0-LTS` and future release lines.

### Core Architectural Invariants:
1. **Platform Subordination**: Every product is an ecosystem capability of the Air Roofers Unified Platform, not an independent platform.
2. **Zero Shadow Implementations**: Central platform services (Identity, Billing, Licensing, Telemetry, Marketplace, Support) belong exclusively to the platform.
3. **Adapter-Only Integration**: All platform service interactions MUST pass through Platform Service Adapters and domain interfaces.

---

## 2. Change Classification Matrix

### Category A: ALLOWED (Continuous Delivery)
The following changes are permitted without ARB review:
- New ecosystem connectors (GitHub, GitLab, Jira, ServiceNow, AWS, Azure, GCP)
- Marketplace packs and extension packages
- Industry compliance packs (ISO 27001, SOC 2, PCI DSS, EU AI Act)
- Plugin engine additions
- Autonomous policy rules and governance pack updates
- UI/Portal dashboard enhancements
- Custom report templates
- Documentation updates & product analytics metrics
- Customer success onboarding workflows

### Category B: REQUIRES ARB APPROVAL (Formal ADR Exception Required)
The following changes require a formal Architecture Review Board exception with 2 approvers and a 5-day review window:
- New central platform service proposals
- Mutations to federation contracts (`federation.manifest.yaml`)
- SDK interface contract modifications
- Boot sequence handshake modifications
- Event schema mutations or topic additions
- Domain entity model modifications
- API additive structural changes

### Category C: PROHIBITED (Immutable Violation)
The following changes are **strictly prohibited** under the `2026.3.0-LTS` line:
- Shadow implementations of central platform services (local user accounts, local billing ledgers, local telemetry ingress)
- Direct HTTP service calls bypassing Platform Service Adapters
- Breaking API schema changes or removed event fields
- Circular inter-product dependencies
- Startup sequence bypass

---

## 3. Platform Invariant & Release Promotion Rule

> **Ecosystem Invariant**: Every Air Roofers product MUST publish a signed `federation.manifest.yaml` and pass automated boot handshake and contract verification before promotion to `RC` or `LTS`.

---
*Ratified by the Air Roofers Architecture Review Board — 2026-08-06*
