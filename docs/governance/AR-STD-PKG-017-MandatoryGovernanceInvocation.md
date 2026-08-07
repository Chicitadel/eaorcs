# AR-STD-PKG-017 — Mandatory Governance Invocation Standard

**Document Identifier:** AR-STD-PKG-017  
**Version:** 3.0.0-LTS  
**Classification:** Enterprise Standard  
**Effective Date:** 2026-08-07  
**Author:** Enterprise Architecture & Security Governance Board  
**Organization:** Air Roofers Governance Directorate  

---

## 1. Purpose & Scope

This engineering standard establishes **AGPA as a mandatory platform governance kernel and architectural invariant**. 

Direct invocation of packaging, signing, distribution, versioning, or publication components outside the AGPA Governance Kernel is prohibited across all engineering repositories, products, platform subsystems, shared packages, and customer projects.

---

## 2. Immutable Governance Rules

1. **Default-Deny Execution:** All artifact generation, release packaging, and distribution operations fail by default unless routed through the AGPA Governance Kernel.
2. **Multi-Layer Enforcement:** Governance controls are enforced across Engineering (scaffolding), Build (compilation/optimization), CI/CD (release gating), Repository (branch protection), Distribution (publishing registry), Marketplace, and Audit.
3. **Controlled Exceptions:** Un-governed bypasses are strictly prohibited. Emergency operational bypasses require formal authorization via `GovernanceKernelGateEngine` with named approvers, explicit operational justification, time-bound expiration tokens, and immutable Exception Certificates.
4. **Immutable Evidence Chain:** Every execution generates a full cryptographic evidence trail: Policy Snapshot $\rightarrow$ Validation Report $\rightarrow$ Security Scan $\rightarrow$ SBOM $\rightarrow$ Digital Passport $\rightarrow$ Signatures $\rightarrow$ Execution Certificate.

---

## 3. Compliance & Enforcement

Violations of this standard will result in automated CI/CD pipeline rejection and release gate suspension. All exception certificates are permanently recorded in the enterprise audit ledger.
