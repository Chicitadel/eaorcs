![EAORCS Logo](../../assets/branding/eaorcs_logo.png)

/******************************************************************************
 * Project        : EAORCS
 * Module         : Documentation
 * File           : KNOWLEDGE_BASE.md
 * Version        : 3.0.0
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-02
 * Last Modified  : 2026-08-02
 * Classification : ENTERPRISE
 *
 * Governance:
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance
 * All Rights Reserved.
 ******************************************************************************/

# Enterprise Autonomous Orchestration Engine (EAORCS) - Knowledge Base

This knowledge base serves as the definitive reference for the technical architecture, operational protocols, policy authoring, telemetry, and troubleshooting procedures for the EAORCS platform.

---

## 1. Platform Concepts & Architecture

### 1.1 Decomposed Trust Engine
The EAORCS architecture relies on a Decomposed Trust Engine. Trust is not implicitly granted between internal components. Instead, every interaction is validated through explicit cryptographic claims and policy gates, ensuring zero-trust principles are enforced at every boundary.

### 1.2 Bounded Contexts
The platform is strictly divided into bounded contexts, isolating domains such as Identity, Policy Enforcement, Telemetry, and Orchestration. This prevents architectural drift and ensures that changes within one domain do not unexpectedly impact others.

### 1.3 Zero-Trust Model
No entity, whether an internal service or an external client, is trusted by default. All requests must present a valid OSAP token, which is cryptographically verified before any action is authorized.

### 1.4 State Machine Determinism
Workflows within EAORCS operate as deterministic state machines. Given the same initial state and identical inputs, the system will always reach the exact same final state, eliminating race conditions and ensuring predictable orchestration.

### 1.5 Immutability of Audit Trails
All state transitions, policy evaluations, and administrative actions are logged to an append-only, immutable data store. These logs are cryptographically hashed to prevent tampering and provide a verifiable audit trail.

---

## 2. OSAP Protocol & Cryptographic Signatures

### 2.1 OSAP v1: Initial Token Specification
The foundational Open Security Assertion Protocol (OSAP) version 1 defined the basic structure for JWT-like assertions, introducing mandatory claims for identity and expiration.

### 2.2 OSAP v2: Extended Context Claims
Version 2 introduced context-aware claims, allowing tokens to carry information about the deployment environment, strict IP binding, and multi-factor authentication status.

### 2.3 OSAP v5: Distributed Tracing Integration
Version 5 integrated distributed tracing directly into the protocol, appending trace IDs and span contexts to the token headers, allowing end-to-end observability of a request's lifecycle.

### 2.4 OSAP v8: Quantum-Resistant Foundations
The latest iteration, OSAP v8, introduces structural readiness for quantum-resistant algorithms, strictly enforcing Ed25519 for current implementations while laying the groundwork for hybrid cryptographic schemes.

### 2.5 Ed25519 Keys
All internal service-to-service communication relies on Ed25519 elliptic curve cryptography. Ed25519 was selected for its high performance, small signature size, and resistance to side-channel attacks.

### 2.6 Merkle Roots for State Verification
EAORCS utilizes Merkle trees to verify the integrity of large datasets and configuration states. The Merkle root is periodically signed and broadcasted, allowing any node to verify that its state is consistent with the global truth.

---

## 3. Policy DSL Authoring

### 3.1 `.assure` File Syntax
Policies in EAORCS are written in the custom `.assure` Domain Specific Language. This language is designed to be highly readable, strongly typed, and deterministic.

### 3.2 Gate Enforcement Rules
A policy gate is defined using the `enforce` keyword. It evaluates a set of conditions against the incoming context. If any condition fails, the request is immediately denied, and an audit event is generated.

### 3.3 Custom Rule Definitions
Administrators can define reusable custom rules using the `rule` keyword. These rules can aggregate multiple conditions and be invoked by multiple gates, ensuring DRY (Don't Repeat Yourself) principles in policy authoring.

### 3.4 Temporal Constraints
Policies can include temporal constraints, restricting access based on time of day, day of the week, or a specific duration. This is crucial for managing maintenance windows and temporary access grants.

### 3.5 Contextual Attribute Matching
The DSL allows for deep inspection of the context attributes provided in the OSAP token. This enables policies that enforce strict IP whitelisting, geographic restrictions, or device compliance checks.

### 3.6 Policy Compilation and Validation
Before a policy is deployed, it must be compiled using the EAORCS CLI. The compiler performs static analysis, checking for syntax errors, logical contradictions, and potential security vulnerabilities.

---

## 4. Multi-Tenant Observability & Telemetry

### 4.1 TPS Metrics Monitoring
Transactions Per Second (TPS) is a critical health indicator. EAORCS continuously monitors TPS at the tenant, service, and endpoint levels, alerting operators to sudden spikes or drops in traffic.

### 4.2 P99 Latency Tracking
We strictly monitor the 99th percentile (P99) latency to ensure consistent performance for almost all users. Any degradation in P99 latency triggers automated diagnostic workflows.

### 4.3 Prometheus Integration
EAORCS natively exports metrics in Prometheus format. These metrics include detailed information about OSAP token validation times, policy evaluation durations, and database query latencies.

### 4.4 OpenTelemetry Tracing
Every request entering EAORCS is instrumented with OpenTelemetry. Spans are generated for each service boundary crossed, policy evaluated, and database query executed, providing a comprehensive trace of the request's execution path.

### 4.5 Tenant Isolation in Telemetry
Telemetry data is strictly segregated by tenant ID. This ensures that one tenant cannot access another tenant's metrics or traces, maintaining data privacy and compliance.

### 4.6 Log Aggregation and Structured Logging
All services emit structured logs in JSON format. These logs are aggregated into a centralized logging platform, allowing for complex queries and automated anomaly detection based on log patterns.

---

## 5. Troubleshooting & Operational Recipes

### 5.1 CLI Errors: Policy Compilation Failure
If the `eaorcs assure compile` command fails, verify that all custom rules referenced in the `.assure` file are defined. Check for syntax errors, particularly missing semicolons or unmatched braces.

### 5.2 CLI Errors: Authentication Denied
If the CLI returns an authentication error, ensure that your local OSAP token has not expired. Use `eaorcs auth login` to refresh your token. Verify that your environment variables point to the correct EAORCS environment.

### 5.3 Certificate Issues: Expired Ed25519 Key
If service-to-service communication fails with a signature verification error, check the expiration date of the Ed25519 keys. Rotate the keys using the `eaorcs pki rotate` command and ensure the new public keys are distributed.

### 5.4 Certificate Issues: Untrusted Root
If a client cannot connect to EAORCS, ensure that the client trusts the EAORCS Root CA. Provide the client with the public certificate of the Root CA and instruct them to add it to their trust store.

### 5.5 Audit Gate Failures: Context Mismatch
When a valid request is denied by a policy gate, consult the audit logs. The log will specify exactly which condition in the `.assure` file failed. Compare the incoming OSAP token claims with the policy requirements to identify the mismatch.

### 5.6 Audit Gate Failures: Rate Limiting
If legitimate traffic is being blocked with a 429 Too Many Requests status, review the rate-limiting policies configured for the affected tenant. Adjust the limits if necessary, or investigate the source of the traffic spike.

### 5.7 Node Desynchronization
If a node reports a mismatched Merkle root, it may be out of sync with the cluster. Restart the node to trigger a full state reconciliation process. If the issue persists, investigate network connectivity between the nodes.
