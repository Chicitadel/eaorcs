/******************************************************************************
 * Project        : EAORCS Continuous Software Assurance Platform
 * Module         : API Reference Manual
 * File           : API_REFERENCE_MANUAL.md
 * Version        : 2026.1-LTS
 * Author         : Architectural Governance Council & Ujomor Systems Engineering
 * Organization   : Ujomor Systems Ecosystem
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | PUBLIC RELEASE
 *
 * Governance:
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 *
 * Standards:
 * - OpenAPI 3.0.3
 * - AsyncAPI 2.6
 * - GraphQL June 2018
 * - OAuth 2.0 / RFC 6749
 * - ISO 27001 / OWASP ASVS
 *
 * Copyright (c) 2026 Ujomor Systems Ecosystem. All Rights Reserved.
 ******************************************************************************/


<p align="center">
  <img src="../assets/eaorcs_logo_256.png" alt="EAORCS Logo" width="140" height="140" />
</p>

# EAORCS API Reference Manual
**Version 2026.1.0-GA** | **Ujomor Systems Ecosystem**

---

## Table of Contents
1. [API Architecture & Overview](#1-api-architecture--overview)
2. [Authentication & Security](#2-authentication--security)
3. [Rate Limits & Throttling](#3-rate-limits--throttling)
4. [REST API Specification (`/api/v1`)](#4-rest-api-specification-apiv1)
   - [Compliance Domain (`/api/v1/compliance`)](#compliance-domain-apiv1compliance)
   - [Evidence Domain (`/api/v1/evidence`)](#evidence-domain-apiv1evidence)
   - [Audit Domain (`/api/v1/audit`)](#audit-domain-apiv1audit)
   - [Telemetry Domain (`/api/v1/telemetry`)](#telemetry-domain-apiv1telemetry)
5. [AsyncAPI Webhooks & Real-Time Event Streams](#5-asyncapi-webhooks--real-time-event-streams)
6. [GraphQL API Reference](#6-graphql-api-reference)
7. [SDK Integration Guide](#7-sdk-integration-guide)

---

## 1. API Architecture & Overview

EAORCS exposes multi-protocol interface definitions for enterprise integration:

- **REST API**: OpenAPI 3.0.3 compliant RESTful HTTP endpoints for synchronous operations.
- **AsyncAPI / Webhooks**: AsyncAPI 2.6 event streams via WebSockets, SSE, and HTTP Webhooks.
- **GraphQL API**: Schema-driven GraphQL endpoint for complex, nested data queries.

### Standard Response Envelope
All REST API endpoints return a standardized JSON structure:

```json
{
  "success": true,
  "code": 200,
  "message": "Operation completed successfully.",
  "timestamp": "2026-08-01T23:55:00.000Z",
  "correlation_id": "req-99d82a1f-4b02-412a-84bf-3b91fa017a41",
  "data": {}
}
```

---

## 2. Authentication & Security

All API endpoints enforce Zero-Trust access control principles.

### Authentication Mechanisms

#### 1. OAuth 2.0 / OIDC Bearer Token
Include JWT Bearer token in HTTP `Authorization` header:
```http
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 2. Enterprise API Keys
For server-to-server and UTCF collector authentication:
```http
X-EAORCS-Api-Key: eaorcs_live_sec_993048a174f10a8c4b927d
X-EAORCS-Org-Id: org_ujomor_corp
```

#### 3. Mutual TLS (mTLS) & Ed25519 Request Signing
High-security endpoints require HTTP signature verification:
```http
X-EAORCS-Signature: t=1785628500,v1=9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c
```

---

## 3. Rate Limits & Throttling

Rate limits are enforced on a per-organization, per-IP basis:

| Plan / Tier | Standard Endpoints | Audit / Certify Endpoints | Webhook Delivery |
| :--- | :--- | :--- | :--- |
| **Developer / Community** | 100 req / min | 10 req / min | 50 events / sec |
| **Professional** | 1,000 req / min | 100 req / min | 500 events / sec |
| **Enterprise / Government** | 10,000 req / min | 1,000 req / min | 5,000 events / sec |

Response headers return current throttle status:
```http
X-RateLimit-Limit: 10000
X-RateLimit-Remaining: 9984
X-RateLimit-Reset: 1785628560
```

---

## 4. REST API Specification (`/api/v1`)

### Compliance Domain (`/api/v1/compliance`)

#### 1. GET `/api/v1/compliance/matrix`
Returns the active compliance matrix and control status.

- **Parameters**: `standard` (optional string, e.g. `ISO-27001`), `environment` (optional string).
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "standard": "ISO-27001-2022",
    "total_controls": 93,
    "passed_controls": 91,
    "warning_controls": 2,
    "failed_controls": 0,
    "compliance_score": 97.85,
    "controls": [
      {
        "control_id": "A.5.15",
        "title": "Access Control",
        "status": "COMPLIANT",
        "last_verified": "2026-08-01T22:30:00Z"
      }
    ]
  }
}
```

#### 2. POST `/api/v1/compliance/compile`
Compiles policy DSL rules into executable enforcement schemas.

- **Request Body**:
```json
{
  "target_layer": "UTC_LAYER_04_SECURITY",
  "dsl_content": "policy ZeroTrust { enforce mTLS == true; enforce rbac_enabled == true; }",
  "environment": "production"
}
```

---

### Evidence Domain (`/api/v1/evidence`)

#### 1. POST `/api/v1/evidence/collect`
Ingests a new cryptographic evidence payload from a UTCF adapter.

- **Request Body**:
```json
{
  "adapter_id": "utcf-k8s-security-adapter",
  "layer_id": "UTC_LAYER_12_CONTAINER_ORCHESTRATION",
  "evidence_type": "K8S_RBAC_AUDIT_LOG",
  "payload": {
    "cluster_name": "prod-eu-west-1",
    "anonymous_auth_disabled": true,
    "api_server_rbac": true
  },
  "signing_key_id": "key-ed25519-2026-01"
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "data": {
    "evidence_id": "ev-88492014-992a-4b09-b912-fa810283419a",
    "payload_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "merkle_proof": ["0x9f8a...", "0x4b2c..."],
    "timestamp": "2026-08-01T23:54:12Z"
  }
}
```

#### 2. POST `/api/v1/evidence/verify`
Executes mathematical proof verification on stored evidence.

---

### Audit Domain (`/api/v1/audit`)

#### 1. POST `/api/v1/audit/execute`
Triggers an asynchronous comprehensive compliance audit run.

- **Request Body**:
```json
{
  "audit_name": "Q3-2026-Enterprise-Security-Audit",
  "frameworks": ["ISO-27001-2022", "SOC2-TYPE-II", "OWASP-ASVS-4.0"],
  "depth": "FULL_PROOF",
  "environment": "production"
}
```

#### 2. POST `/api/v1/audit/passport`
Generates and exports an Open Software Assurance Passport (OSAP) bundle.

---

### Telemetry Domain (`/api/v1/telemetry`)

#### 1. POST `/api/v1/telemetry/events`
Pushes high-throughput operational metrics and log events.

---

## 5. AsyncAPI Webhooks & Real-Time Event Streams

EAORCS supports real-time event notifications via HTTP Webhooks.

### Supported Event Types
- `compliance.drift_detected`: Fired when a control transitions from COMPLIANT to WARNING/FAILED.
- `evidence.ingested`: Fired when a new cryptographic evidence payload is committed.
- `audit.completed`: Fired when an asynchronous audit run finishes.
- `remediation.triggered`: Fired when automated policy enforcement acts on finding.

### Webhook Verification Header
EAORCS signs webhook deliveries using HMAC-SHA256:
```http
X-EAORCS-Signature: t=1785628500,v1=5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a
```

---

## 6. GraphQL API Reference

Endpoint: `POST /graphql`

### Sample Query
```graphql
query GetSystemTrustIndex {
  softwareTrustIndex(environment: "production") {
    score
    status
    securityScore
    complianceScore
    isoQualityScore
    sbomTrustIndex
    unresolvedFindings {
      id
      severity
      title
    }
  }
}
```

---

## 7. SDK Integration Guide

The official JavaScript/Node.js SDK is packaged as `@eaorcs/sdk`.

### Node.js Integration Example
```javascript
const { EAORCSClient } = require('@eaorcs/sdk');

const client = new EAORCSClient({
  apiKey: process.env.EAORCS_API_KEY,
  endpoint: 'https://identity.airroofers.eu/api/v1',
  offlineMode: false
});

async function runComplianceCheck() {
  try {
    const matrix = await client.compliance.getMatrix({ standard: 'ISO-27001-2022' });
    console.log(`Current Compliance Score: ${matrix.compliance_score}%`);
  } catch (error) {
    console.error('API Error:', error.message);
  }
}

runComplianceCheck();
```

---
*For complete OpenAPI JSON schemas, visit `https://api.airroofers.eu/docs/openapi.json`.*
