/******************************************************************************
 * Project        : EAORCS
 * Module         : Documentation
 * File           : output-schemas.md
 * Version        : 2026.1.0-lts
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-02
 * Last Modified  : 2026-08-02
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
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
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance
 * All Rights Reserved.
 ******************************************************************************/

![EAORCS Logo](../../assets/branding/eaorcs_logo.png)

# EAORCS Output Schemas

**Standard**: Universal Autonomous AI Governance Operating System (UAIGOS 3.0.0)  
**Authority**: Ujomor Systems Engineering & Governance Authority  
**Classification**: GOVERNMENT | ENTERPRISE | RESTRICTED  

---

## 1. Executive Summary

This document details the exact JSON Schema definitions and structural examples for the core machine-readable artifacts produced by the Enterprise Autonomous Observability & Regulatory Compliance System (EAORCS).

---

## 2. GA Baseline Closure Attestation

**File Path**: `release/GA_BASELINE_CLOSURE_ATTESTATION.json`

This schema validates the cryptographic finality of a software release package, proving that all 15 master qualification suites passed.

### 2.1 JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "GABaselineClosureAttestation",
  "type": "object",
  "properties": {
    "releaseVersion": {
      "type": "string"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "authority": {
      "type": "string"
    },
    "suitesPassed": {
      "type": "integer",
      "minimum": 15,
      "maximum": 15
    },
    "archiveHashSha256": {
      "type": "string"
    },
    "signatureEd25519": {
      "type": "string"
    }
  },
  "required": ["releaseVersion", "timestamp", "authority", "suitesPassed", "archiveHashSha256", "signatureEd25519"]
}
```

### 2.2 Example Payload

```json
{
  "releaseVersion": "2026.1.0-lts",
  "timestamp": "2026-08-02T12:00:00Z",
  "authority": "Ujomor Systems Engineering & Governance Authority",
  "suitesPassed": 15,
  "archiveHashSha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "signatureEd25519": "e7b8...a9f2"
}
```

---

## 3. OSAP Passport

**File Path**: `osap-passport.json` and `docs/osap_passport_2026.1.0-lts.json`

The Open Software Assurance Profile (OSAP) Passport provides an interoperable summary of the software's security pedigree and supply chain risk.

### 3.1 JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "OSAPPassport",
  "type": "object",
  "properties": {
    "productName": { "type": "string" },
    "vendor": { "type": "string" },
    "slsaLevel": { "type": "integer" },
    "sbomIncluded": { "type": "boolean" },
    "vulnerabilityScan": {
      "type": "object",
      "properties": {
        "critical": { "type": "integer" },
        "high": { "type": "integer" }
      }
    }
  },
  "required": ["productName", "vendor", "slsaLevel", "sbomIncluded", "vulnerabilityScan"]
}
```

### 3.2 Example Payload

```json
{
  "productName": "EAORCS",
  "vendor": "Ujomor Systems & Enterprise Governance",
  "slsaLevel": 4,
  "sbomIncluded": true,
  "vulnerabilityScan": {
    "critical": 0,
    "high": 0
  }
}
```

---

## 4. ISO/IEC 25010 Performance Certificate

**File Path**: `ISO_IEC_25010_Performance_Certificate.json`

Validates that the software meets enterprise performance, reliability, and security requirements according to the ISO/IEC 25010 standard.

### 4.1 JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ISO25010Certificate",
  "type": "object",
  "properties": {
    "standard": { "type": "string" },
    "certificationDate": { "type": "string", "format": "date" },
    "metrics": {
      "type": "object",
      "properties": {
        "performanceEfficiency": { "type": "string" },
        "reliability": { "type": "string" },
        "security": { "type": "string" },
        "maintainability": { "type": "string" }
      }
    }
  }
}
```

### 4.2 Example Payload

```json
{
  "standard": "ISO/IEC 25010:2023",
  "certificationDate": "2026-08-02",
  "metrics": {
    "performanceEfficiency": "PASS - RTO < 10s",
    "reliability": "PASS - 99.999% Uptime SLA",
    "security": "PASS - Zero Trust Verified",
    "maintainability": "PASS - Modular Architecture"
  }
}
```

---

## 5. Legal Registry

**File Path**: `legal/registry.json`

Tracks the status and cryptographic signatures of all legally binding governance documents within the repository.

### 5.1 JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "LegalRegistry",
  "type": "object",
  "properties": {
    "registryId": { "type": "string" },
    "lastUpdated": { "type": "string", "format": "date-time" },
    "documents": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "documentId": { "type": "string" },
          "title": { "type": "string" },
          "hash": { "type": "string" },
          "signature": { "type": "string" }
        },
        "required": ["documentId", "title", "hash", "signature"]
      }
    }
  }
}
```

### 5.2 Example Payload

```json
{
  "registryId": "REG-EAORCS-2026-GA",
  "lastUpdated": "2026-08-02T12:00:00Z",
  "documents": [
    {
      "documentId": "DOC-GOV-001",
      "title": "GA Baseline Closure Declaration",
      "hash": "a1b2c3d4e5...",
      "signature": "sig_ed25519_..."
    }
  ]
}
```

---

## 6. Evidence Bundle

**File Path**: `docs/evidence_bundle_2026.1.0-lts.json`

Aggregates raw telemetry, security scanner outputs, and test results into a single verifiable compliance package.

### 6.1 JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "EvidenceBundle",
  "type": "object",
  "properties": {
    "bundleVersion": { "type": "string" },
    "generatedAt": { "type": "string", "format": "date-time" },
    "evidenceItems": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "source": { "type": "string" },
          "type": { "type": "string" },
          "result": { "type": "string" }
        }
      }
    }
  }
}
```

### 6.2 Example Payload

```json
{
  "bundleVersion": "2026.1.0-lts",
  "generatedAt": "2026-08-02T12:00:00Z",
  "evidenceItems": [
    {
      "source": "Infrastructure Scanner",
      "type": "Terraform Misconfiguration Check",
      "result": "PASS (0 Findings)"
    },
    {
      "source": "API Contract Scanner",
      "type": "OpenAPI Conformance",
      "result": "PASS (100% Match)"
    }
  ]
}
```
