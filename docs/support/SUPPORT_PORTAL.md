![EAORCS Logo](../../assets/branding/eaorcs_logo.png)

/******************************************************************************
 * Project        : Air Roofers Subsystem Ecosystem (airroofers.eu)
 * Module         : Support Subsystem Blueprint Alignment
 * File           : SUPPORT_PORTAL.md
 * Version        : 3.0.0
 * Author         : Air Roofers Architecture Authority
 * Organization   : Chicitadel / Air Roofers SASU
 * Created Date   : 2026-08-02
 * Last Modified  : 2026-08-02
 * Classification : ENTERPRISE | INTERNAL | SOVEREIGN
 *
 * Governance:
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 *
 * Copyright (c) 2026 Chicitadel / Air Roofers SASU
 * All Rights Reserved.
 ******************************************************************************/

# EAORCS Enterprise Support Portal — Support Subsystem Integration (`support.airroofers.eu`)

Welcome to the EAORCS Enterprise Support Portal. This document outlines the support tiers, Service Level Agreements (SLAs), ticket submission processes, and escalation matrices aligned with the **Air Roofers Support Domain Blueprint (`blueprint_support_airroofers.eu.md`)**.

## Enterprise Support Overview & Tier Mappings

Chicitadel / Air Roofers SASU provides dedicated support to ensure the stability, security, and performance of your EAORCS deployment via the federated platform gateway. Support is categorized into three main tiers:

1.  **Standard Tier**: Provides access to the knowledge base, community forums, and email-based support with standard response times.
2.  **Premium Tier**: Includes all Standard benefits, plus faster response times, priority bug fixes, and access to a named Technical Account Manager (TAM) during business hours.
3.  **Elite Tier**: Our highest level of support, offering 24/7/365 coverage, dedicated TAMs, guaranteed SLAs, and proactive system health monitoring.

## Severity Matrix & SLA Guarantees

Our Service Level Agreements (SLAs) are strictly enforced based on the severity of the reported issue.

### Sev-1 (Critical Outage)
*   **Definition**: A catastrophic failure causing a complete loss of core functionality. Production systems are down, and no workaround exists.
*   **Initial Response**: 15 minutes
*   **Resolution Target (RTO)**: 4 hours
*   **Updates**: Every 30 minutes until resolution.

### Sev-2 (Major Degradation)
*   **Definition**: A significant impact on operations. Core functionality is severely degraded, but the system remains partially operational, or a temporary workaround is available.
*   **Initial Response**: 1 hour
*   **Resolution Target (RTO)**: 12 hours
*   **Updates**: Every 2 hours until resolution.

### Sev-3 (Minor Issue)
*   **Definition**: A minor loss of functionality or a localized issue that does not broadly impact production operations.
*   **Initial Response**: 4 hours
*   **Resolution Target (RTO)**: As scheduled in the next maintenance window or patch release.
*   **Updates**: Daily until resolution.

### Sev-4 (General Query)
*   **Definition**: General questions, feature requests, or documentation inquiries that do not involve a system failure.
*   **Initial Response**: 24 hours
*   **Resolution Target (RTO)**: N/A
*   **Updates**: As appropriate.

## Ticket Submission Grammar & API Endpoint

To ensure rapid categorization and routing, all automated ticket submissions must adhere to the standard Air Roofers Support Domain contract schema and be submitted via our central Support API endpoint.

### API Endpoint
`POST https://support.airroofers.eu/v1/support/tickets/submit`

### Submission Grammar (JSON Schema Envelope)

```json
{
  "tenant_id": "string (Required)",
  "workspace_id": "string (Required - Scoped tenant workspace)",
  "osap_token": "string (Required for authorization)",
  "severity": "enum [SEV-1, SEV-2, SEV-3, SEV-4] (Required)",
  "capability_id": "string (Required - e.g., 'CAP-EAORCS-01', 'CAP-EAORCS-03')",
  "description": "string (Required - Detailed description of the issue)",
  "steps_to_reproduce": "array of strings (Required for Sev-2 and Sev-3)",
  "impact_assessment": "string (Required for Sev-1 and Sev-2)",
  "logs_attached": "boolean (Required)",
  "trace_id": "string (Optional - Highly recommended for tracing)"
}
```

### Example Submission

```bash
curl -X POST https://support.airroofers.eu/v1/support/tickets/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <OSAP_TOKEN>" \
  -d '{
    "tenant_id": "tnt-prod-8842",
    "workspace_id": "ws-sec-01",
    "severity": "SEV-1",
    "capability_id": "CAP-EAORCS-03",
    "description": "Policy compiler failing globally on all .assure files with error code 500.",
    "steps_to_reproduce": ["Run eaorcs assure compile on any valid policy file"],
    "impact_assessment": "Unable to deploy any new security policies.",
    "logs_attached": true,
    "trace_id": "trace-8f92a1b"
  }'
```

## Escalation Matrix & Dedicated TAM Contacts

If an SLA is breached or an issue requires immediate executive attention, clients should follow the escalation matrix below.

1.  **Level 1: Support Engineer (Triage)**
    *   Handles initial response and troubleshooting.
2.  **Level 2: Senior Reliability Engineer**
    *   Engaged automatically if Sev-1 resolution exceeds 1 hour or Sev-2 exceeds 4 hours.
3.  **Level 3: Technical Account Manager (TAM)**
    *   Premium and Elite Tier clients can directly contact their assigned TAM for escalations.
    *   **TAM Contact Info**: Provided securely during onboarding via `support.airroofers.eu`.
4.  **Level 4: Director of Enterprise Support**
    *   Engaged for any Sev-1 issue exceeding the 4-hour RTO.
    *   **Contact Portal**: https://support.airroofers.eu/escalations

