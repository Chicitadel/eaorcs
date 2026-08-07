# AR-STD-REP-001 — Repository & Asset Governance Standard

**Document Identifier:** AR-STD-REP-001  
**Version:** 3.0.0-LTS  
**Classification:** Enterprise Standard  
**Effective Date:** 2026-08-07  
**Author:** Enterprise Architecture & Security Governance Board  
**Organization:** Air Roofers Governance Directorate  

---

## 1. Purpose & Layout Architecture

This standard defines the canonical repository organization and automatic asset classification hierarchy across the Air Roofers platform ecosystem.

```
D:\ujomor-platform
├── 00_engineering_guide/   # Corporate Engineering Guides & Tokenized Prompt Standards
├── governance/             # Immutable Platform Policies & Compliance Matrix
├── platform/               # Core Platform Services & Infrastructure Subsystems
├── products/               # Class A Commercial Products (EAORCS, CiviScore, Affiantor, etc.)
├── projects/               # Class D Customer Projects & Engagements (NigeriaFrance, Client-X, etc.)
├── shared/                 # Class E Reusable SDKs, Libraries, & Common Modules
├── templates/              # Platform Project & Service Scaffolding Templates
└── tooling/                # Internal Engineering Tools & Developer CLI
```

---

## 2. Asset Classification Matrix (Classes A through F)

| Asset Class | Classification Name | Directory Pattern | Governance Profile Assigned |
| :--- | :--- | :--- | :--- |
| **Class A** | Commercial Product | `products/*` | **Commercial Product Profile** (Editions, Commercial Licensing, Marketplace, Dual Passports) |
| **Class B** | Platform Subsystem | `platform/*` | **Platform Subsystem Profile** (Core Subsystem Integration, Provenance Tracking) |
| **Class C** | Platform Service | `services/*` | **Platform Service Profile** (SLA Metrics, High-Availability Deployment Gating) |
| **Class D** | Customer Project | `projects/*` | **Customer Project Profile** (Customer Identity, Contract Metadata, Acceptance Evidence, Project Passport) |
| **Class E** | Reusable Component | `shared/*`, `packages/*` | **Reusable Component Profile** (SDK Versioning, Dependency Isolation, `.airpkg`) |
| **Class F** | Knowledge Asset | `blueprints/*`, `policies/*` | **Knowledge Asset Profile** (Blueprint Immutability, Policy Cryptographic Signing) |

---

## 3. Automated Governance Inheritance

Developers do not manually select governance rules. The `RepositoryIntelligenceEngine` automatically inspects file system paths, infers asset classification, and binds the appropriate governance profile dynamically upon execution.
