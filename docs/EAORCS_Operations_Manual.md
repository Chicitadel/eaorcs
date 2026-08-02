# EAORCS ENTERPRISE LTS — OPERATIONS MANUAL

/******************************************************************************
 * Project        : Air Roofers Platform Ecosystem & Ujomor Engineering
 * Document       : EAORCS Operations & Deployment Manual
 * Version        : 2026.1-LTS (Enduring Operations Guide)
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - UAIGOS 3.0.0 Compliant
 * - Architecture Authority Approved
 ******************************************************************************/

## 1. System Operating Procedures

### 1.1 Triggering Full Platform Operational Audit
To execute the complete 33-engine platform audit suite and run the 9-layer kernel stack:

```powershell
powershell -ExecutionPolicy Bypass -File d:\ujomor-platform\airroofers.eu\kernel\run_full_platform_audit_v8.ps1
```

### 1.2 Running LTS Platform Maturity Suite
To evaluate Maturity Level (M0-M5), reliability metrics, chaos injection recovery, and formal invariant enforcement:

```powershell
powershell -ExecutionPolicy Bypass -File d:\ujomor-platform\airroofers.eu\kernel\lts_maturity_suite.ps1
```

### 1.3 Running LTS Operational Evidence & Mutation Testing
To compute the Evidence Maturity Index (EMI) and run mutation kill rate tests:

```powershell
powershell -ExecutionPolicy Bypass -File d:\ujomor-platform\airroofers.eu\kernel\run_lts_2026_1_evidence.ps1
```

---

## 2. Emergency Rollback Procedures

If an unhandled deployment failure occurs:
1. Locate the snapshot ID in `.governance/state/snapshots/{snapshot_id}`.
2. Execute snapshot restoration:
```powershell
. "d:\ujomor-platform\airroofers.eu\kernel\v7\RollbackEngine.ps1"
Restore-Snapshot -SnapshotPath "d:\ujomor-platform\airroofers.eu\.governance\state\snapshots\{snapshot_id}"
```

---

## 3. Deterministic Replay Procedure

To audit or reconstruct a previous run trajectory using its Run ID:
```powershell
. "d:\ujomor-platform\airroofers.eu\kernel\v8\DeterministicReplayEngine.ps1"
Invoke-ExecutionReplay -RunId "{RUN_ID}"
```

---

## 4. Enterprise LTS Compatibility Guarantees & Support Matrix

### 4.1 Supported Runtime Environments
- **PowerShell**: PowerShell 7.2+ Core (Cross-platform) & Windows PowerShell 5.1
- **Operating Systems**: Windows Server 2022 / Windows 11, Ubuntu 22.04 LTS / Alpine Linux
- **Language Ecosystems**: PHP 8.x (Laravel/Native), TypeScript / Node.js 20+, Dart / Flutter 3.x, Terraform / Docker IaC

### 4.2 LTS Backward Compatibility & Deprecation Policy
- **Frozen Schema Parity**: All `.governance/schemas/*.schema.json` structures maintain 100% backward compatibility within the 2026.x LTS series.
- **Deprecation Policy**: No kernel breaking API changes will occur during the 2026 LTS lifecycle. Structural changes require 12-month advance deprecation notice.
