# EAORCS Turnkey Enterprise Demo Workspace

![EAORCS Logo](../../assets/branding/eaorcs_logo.png)

**Authority**: Ujomor Systems Engineering & Governance Authority  
**Standard**: Universal Autonomous AI Governance Operating System (UAIGOS 3.0.0)  
**Classification**: GOVERNMENT | ENTERPRISE | RESTRICTED  

---

## 1. Overview

This directory contains a turnkey, self-contained demonstration environment for **EAORCS** (Enterprise Autonomous Observability & Regulatory Compliance System).

It demonstrates:
- Decomposed Trust Engine scoring & readiness evaluation.
- Synthetic multi-tenant telemetry datasets (Financial, Defense, Healthcare, SaaS).
- EAORCS Assurance Policy DSL (`policies/security_governance.assure`).
- One-click certificate issuance (`eaorcs-certificate.json`).
- Sovereign OSAP v2.0 Passport compilation (`osap-passport.json`).
- Interactive glassmorphic Web Observatory Dashboard (`index.html`).

---

## 2. Quickstart Execution

To run the complete demonstration pipeline:

```powershell
# Navigate to demo workspace
cd demos/eaorcs-enterprise-demo

# Run the turnkey demonstration script
node run_demo.js
```

---

## 3. Web Observatory Dashboard

Open `index.html` in any modern web browser to inspect:
- Decomposed Trust Scorecard (Gold Tier).
- Multi-Tenant Sector Performance Metrics.
- Regulatory Compliance Audit Trail (ISO 27001, SOC 2, OWASP, NIST, SLSA Level 4).
