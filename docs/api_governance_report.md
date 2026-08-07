# EAORCS API & SDK Governance Attestation Report

**Generated Date**: 2026-08-07T07:01:54.110Z
**Author**: Air Roofers Architecture Authority / Ujomor Systems
**Overall Status**: ✅ PASSED (100% COMPLIANT)

## Summary Metrics

- **Total Governance Checks**: 33
- **Passed Checks**: 33
- **Failed Checks**: 0
- **SemVer Standard**: SemVer 2.0.0 (Enforced)
- **OpenAPI Version**: 3.0.3 (Built-in EAORCS Core 8 Endpoints)
- **Sunset Deprecation Notice Policy**: 6 Months (Enforced)
- **SDK Surface Verified**: `sdk/verifier.cjs` (`verify`, `verifyOffline`, `getVersion`)

## Detailed Governance Results Table

| Suite | Governance Check | Result | Detail |
| ----- | ---------------- | ------ | ------ |
| API Contract Governance Engine | Valid OpenAPI spec passes validation | ✅ PASS | Compliant with protocol |
| API Contract Governance Engine | Missing info.version fails validation | ✅ PASS | Compliant with protocol |
| API Contract Governance Engine | SemVer validation (2026.1.0 vs 1.0.invalid) | ✅ PASS | Compliant with protocol |
| API Contract Governance Engine | Backward incompatibility detection (removed endpoint) | ✅ PASS | Compliant with protocol |
| API Contract Governance Engine | New optional endpoint detected as NON-BREAKING | ✅ PASS | Compliant with protocol |
| API Contract Governance Engine | Sunset policy check (deprecated endpoint validation) | ✅ PASS | Compliant with protocol |
| Event & Webhook Contract Engine | All 6 canonical event schemas validate correctly | ✅ PASS | Compliant with protocol |
| Event & Webhook Contract Engine | Malformed event (missing eventType) fails | ✅ PASS | Compliant with protocol |
| Event & Webhook Contract Engine | Webhook payload with missing signature fails | ✅ PASS | Compliant with protocol |
| Event & Webhook Contract Engine | Idempotency key requirement check | ✅ PASS | Compliant with protocol |
| SDK Backward Compatibility Engine | SDK surface check against sdk/verifier.cjs | ✅ PASS | Compliant with protocol |
| SDK Backward Compatibility Engine | Protocol freeze check (valid surface passes, removed function detected) | ✅ PASS | Compliant with protocol |
| SDK Backward Compatibility Engine | Compatibility report generation | ✅ PASS | Compliant with protocol |
| Identity Discovery Engine & Runtime Context | Node.js project discovery (package.json + README.md) | ✅ PASS | Compliant with protocol |
| Identity Discovery Engine & Runtime Context | PHP Composer project discovery (composer.json) | ✅ PASS | Compliant with protocol |
| Identity Discovery Engine & Runtime Context | Java Maven project discovery (pom.xml) | ✅ PASS | Compliant with protocol |
| Identity Discovery Engine & Runtime Context | Rust Cargo project discovery (Cargo.toml) | ✅ PASS | Compliant with protocol |
| Identity Discovery Engine & Runtime Context | Flutter project discovery (pubspec.yaml) | ✅ PASS | Compliant with protocol |
| Identity Discovery Engine & Runtime Context | Dockerfile & OpenAPI discovery | ✅ PASS | Compliant with protocol |
| Identity Discovery Engine & Runtime Context | Git config discovery (.git/config) | ✅ PASS | Compliant with protocol |
| Identity Discovery Engine & Runtime Context | Anonymous / Redacted Mode | ✅ PASS | Compliant with protocol |
| Identity Discovery Engine & Runtime Context | Explicit User Overrides | ✅ PASS | Compliant with protocol |
| Identity Discovery Engine & Runtime Context | Unmapped Directory Name Fallback | ✅ PASS | Compliant with protocol |
| Identity Discovery Engine & Runtime Context | Runtime Context Export | ✅ PASS | Compliant with protocol |
| Identity Discovery Engine & Runtime Context | CommonJS Module Export & Helper Functions | ✅ PASS | Compliant with protocol |
| Registry Lifecycle Manager & Edition Engine | EditionEngine entitlement matrix gating across 4 tiers | ✅ PASS | Compliant with protocol |
| Registry Lifecycle Manager & Edition Engine | EditionGatingError handling on disallowed actions | ✅ PASS | Compliant with protocol |
| Registry Lifecycle Manager & Edition Engine | Registry snapshot archiving with SHA-256 checksum and digital signature | ✅ PASS | Compliant with protocol |
| Registry Lifecycle Manager & Edition Engine | Execution of all 4 reset modes (SOFT_RESET, CLEAN_AUDIT, HARD_RESET, FACTORY_RESET) | ✅ PASS | Compliant with protocol |
| Registry Lifecycle Manager & Edition Engine | Rollback functionality restoring exact previous state and logging audit event | ✅ PASS | Compliant with protocol |
| Registry Lifecycle Manager & Edition Engine | Checksum & digital signature integrity verification (verify()) | ✅ PASS | Compliant with protocol |
| Registry Lifecycle Manager & Edition Engine | SOVEREIGN Legal Hold enforcement blocking destructive operations and purging | ✅ PASS | Compliant with protocol |
| Registry Lifecycle Manager & Edition Engine | Snapshot retention policy purging expired files | ✅ PASS | Compliant with protocol |

## Core API Spec Coverage

The EAORCS Core Platform OpenAPI specification encompasses 8 platform endpoints:
1. `GET /api/v1/health`
2. `POST /api/v1/passports/verify`
3. `GET /api/v1/certificates/{id}`
4. `POST /api/v1/tickets`
5. `GET /api/v1/audits`
6. `POST /api/v1/licenses/renew`
7. `GET /api/v1/billing/invoices`
8. `POST /api/v1/deployments`

## Event Schemas Enforced

1. `support.ticket.created`
2. `cert.issued`
3. `audit.completed`
4. `license.renewed`
5. `billing.invoice.created`
6. `deployment.completed`

---
*Report generated automatically by UAIGOS Governance Engine.*