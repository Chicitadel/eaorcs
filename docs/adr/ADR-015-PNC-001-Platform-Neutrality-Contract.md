# ADR-015: Platform Neutrality Contract & Universal 10-Tier Resource Hierarchy (PNC-001)

- **Status**: ACCEPTED (FROZEN)
- **Date**: 2026-08-02
- **Author**: Architectural Governance Council & Ujomor Systems Engineering
- **Organization**: Ujomor Systems & Enterprise Governance
- **Classification**: GOVERNMENT | ENTERPRISE | RESTRICTED
- **Governance**: Security Reviewed, Architecture Controlled, Protocol Frozen, Modularization Enforced
- **Standards**: ISO 27001, SOC 2, OWASP ASVS, NIST

---

## 1. Context and Problem Statement

Enterprise Autonomous Operational Readiness & Certification System (EAORCS) is designed to operate across diverse enterprise environments, government platforms, multi-tenant cloud ecosystems, and heterogeneous technology stacks.

Historically, governance engines often suffer from two major architectural flaws:
1. **Domain & Brand Coupling**: Hardcoding customer-specific domain terms, business rules, or product names directly into engine source code, violating multi-tenant isolation and platform neutrality.
2. **Hierarchy Fragmentation**: Using simplistic 1-to-2 tier project structures (e.g. `Tenant -> Project`), which fail to model complex enterprise governance boundaries (such as portfolios, programs, specifications, release artifacts, audit runs, evidence bundles, and cryptographic certificates).

EAORCS requires a strict, machine-enforceable contract for platform neutrality and a unified multi-tier hierarchy to govern assets deterministically.

---

## 2. Decision Drivers

- **PNC-001 Platform Neutrality**: Need to eliminate customer domain assumptions and ensure core engines remain strictly platform-agnostic.
- **Universal Multi-Tenant Hierarchy**: Need a standardized 10-tier universal resource model to represent enterprise structures from top-level Tenant down to cryptographically signed Certificates.
- **Adapter-Driven Tech Scanning**: Need non-invasive, extensible technology profiling across diverse runtimes (Java, Node.js, Go, Python, Rust, PHP, .NET, Docker, IaC) without product-specific hardcoding.
- **Backward Compatibility**: Ensure all existing EAORCS engines, audit runners, and tests remain 100% operational.

---

## 3. Considered Options

1. **Ad-hoc Tier Structure**: Allow custom free-form metadata tags without formal hierarchy tiers. (*Rejected*: Leads to architectural drift and unvalidatable lineage).
2. **2-Tier Model (Tenant / Project)**: Simple model. (*Rejected*: Insufficient for enterprise portfolio, specification, release, and evidence lineage tracking).
3. **10-Tier Universal Resource Hierarchy with PNC-001 Adapter Abstraction**: Enforce formal 10-tier resource model in `ProjectRegistry.js` and adapter-driven `TechnologyDetector.js`. (*Selected*).

---

## 4. Decision Outcome

We formally adopt **ADR-015** and the **PNC-001 Platform Neutrality Contract**:

### 4.1 Platform Neutrality Contract (PNC-001)
- **Zero Customer Domain Assumptions**: Core engines MUST NOT hardcode customer domain terms, proprietary business logic, or product brand titles.
- **Universal Governance Resources**: All governed assets map strictly to the canonical 10-tier hierarchy.
- **Provider Adapter Abstraction**: Runtime technology detection, VCS integrations, and external toolchains interact exclusively through standardized provider adapters.

### 4.2 Universal 10-Tier Resource Hierarchy
The hierarchy follows strict, non-skipping parent-child lineage:
1. **Tenant**: Top-level multi-tenant isolation unit.
2. **Organization**: Legal or enterprise entity within a tenant.
3. **Portfolio**: Strategic investment/business portfolio.
4. **Program**: Operational program grouping related projects.
5. **Project**: Primary engineering delivery project boundary.
6. **Repository**: Codebase repository or module workspace.
7. **Specification**: Formal contract, ADR, SRS requirement, or API spec.
8. **Release**: Immutable build artifact or tagged release version.
9. **Audit Run**: Deterministic audit execution instance.
10. **Evidence**: Tamper-evident proof bundle, telemetry, and test outputs.
- **Certificate**: Cryptographically signed compliance attestation derived from Evidence.

### 4.3 Engine Implementations
1. **`ProjectRegistry.js`**: Refactored to support 10-tier hierarchy tree operations, lineage validation, parent-child relationship tracking, and disk persistence while preserving full backward compatibility.
2. **`TechnologyDetector.js`**: Introduced as an adapter-driven detector capable of discovering Java, Node.js, Go, Python, Rust, PHP, .NET, Docker, and IaC tech profiles via non-invasive marker inspection.

---

## 5. Consequences

### Positive
- Strict isolation of platform governance from customer domain specifics.
- Full end-to-end traceability from top-level Tenant down to cryptographically verifiable Certificate artifacts.
- Multi-runtime ecosystem awareness out-of-the-box.
- Zero token wastage and zero architectural drift.

### Compliance & Governance
- Verified against ISO 27001, SOC 2, OWASP ASVS, and NIST governance standards.
- Machine-validated by PNC-001 contract verifier.
