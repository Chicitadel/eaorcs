/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Missing Requirement Generator (Stream G)
 * File           : MissingRequirementGenerator.js
 * Version        : 1.1.0
 * Author         : Enterprise Architecture Team & Ujomor Engineering
 * Organization   : Enterprise Architecture & Governance
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE
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
 * - NIST
 *
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Enterprise Architecture & Governance
 * All Rights Reserved.
 ******************************************************************************/

class MissingRequirementGenerator {
    constructor() {
        this.suggestions = [];
    }

    /**
     * Proactively analyze existing specs and generate missing non-functional, security, and compliance requirements.
     * @param {Object|Array} currentSpecs - Requirements list, blueprint JSON, or specification object.
     * @returns {Array<Object>} List of missing requirement suggestions.
     */
    suggestMissingRequirements(currentSpecs) {
        if (!currentSpecs) {
            throw new Error("Specification input must be provided for gap analysis.");
        }

        const specsText = JSON.stringify(currentSpecs).toLowerCase();
        this.suggestions = [];

        let sugIndex = 1;

        // 1. Check for Rate Limiting & Denial of Service Protection
        if (!specsText.includes('rate limit') && !specsText.includes('throttling') && !specsText.includes('dos')) {
            this.suggestions.push({
                id: `SUG-SEC-${String(sugIndex++).padStart(3, '0')}`,
                category: 'SECURITY',
                gapIdentified: 'Missing API Rate Limiting and Denial of Service (DoS) protection spec.',
                suggestedRequirement: 'The platform must enforce adaptive API rate limiting per IP and authenticated client token (e.g. max 100 req/min for standard tiers).',
                riskLevel: 'HIGH',
                rationale: 'Unrestricted API endpoints expose the infrastructure to automated abuse, brute-force attacks, and resource exhaustion.'
            });
        }

        // 2. Check for Disaster Recovery & High Availability
        if (!specsText.includes('rto') && !specsText.includes('rpo') && !specsText.includes('disaster recovery') && !specsText.includes('failover')) {
            this.suggestions.push({
                id: `SUG-RES-${String(sugIndex++).padStart(3, '0')}`,
                category: 'RESILIENCY',
                gapIdentified: 'Missing formal Disaster Recovery (RTO/RPO) and automated failover specification.',
                suggestedRequirement: 'The system must support active-passive or active-active multi-region failover with RTO < 15 minutes and RPO < 1 minute.',
                riskLevel: 'CRITICAL',
                rationale: 'Enterprise continuity mandates defined recovery metrics to prevent catastrophic data loss during cloud outage events.'
            });
        }

        // 3. Check for Data Retention and Purge Policy (GDPR / Regulatory compliance)
        if (!specsText.includes('retention') && !specsText.includes('purge') && !specsText.includes('anonymiz')) {
            this.suggestions.push({
                id: `SUG-COMP-${String(sugIndex++).padStart(3, '0')}`,
                category: 'COMPLIANCE',
                gapIdentified: 'Missing automated data retention and right-to-be-forgotten / deletion workflow.',
                suggestedRequirement: 'The data layer must implement configurable retention schedules and cryptographically verifiable data purge procedures.',
                riskLevel: 'HIGH',
                rationale: 'Regulatory mandates (GDPR, HIPAA, SOC 2) require data minimisation and verifiable data destruction capabilities.'
            });
        }

        // 4. Check for Distributed Tracing & Correlation ID Propagation
        if (!specsText.includes('correlation') && !specsText.includes('tracing') && !specsText.includes('opentelemetry')) {
            this.suggestions.push({
                id: `SUG-OBS-${String(sugIndex++).padStart(3, '0')}`,
                category: 'OBSERVABILITY',
                gapIdentified: 'Missing cross-service correlation ID propagation and distributed tracing specification.',
                suggestedRequirement: 'Every inbound request must generate or accept a W3C traceparent correlation ID that is passed through all internal service calls and log payloads.',
                riskLevel: 'MEDIUM',
                rationale: 'Without request correlation IDs, troubleshooting microservices and auditing request journeys in distributed platforms is severely impaired.'
            });
        }

        // 5. Check for Input Validation & Sanitization (OWASP ASVS)
        if (!specsText.includes('owasp') && !specsText.includes('sanitization') && !specsText.includes('schema validation')) {
            this.suggestions.push({
                id: `SUG-SEC-${String(sugIndex++).padStart(3, '0')}`,
                category: 'SECURITY',
                gapIdentified: 'Missing explicit OWASP ASVS API input schema validation requirement.',
                suggestedRequirement: 'All ingress API payloads must undergo strict JSON Schema validation and HTML/SQL injection sanitization before reaching core business domain handlers.',
                riskLevel: 'CRITICAL',
                rationale: 'Unsanitized input payloads are the root cause of injection, remote code execution, and data corruption vulnerabilities.'
            });
        }

        // 6. Check for Healthcare/PHI specific gaps if domain is healthcare
        if (specsText.includes('health') || specsText.includes('phi') || specsText.includes('patient')) {
            if (!specsText.includes('baa') && !specsText.includes('de-identification')) {
                this.suggestions.push({
                    id: `SUG-COMP-${String(sugIndex++).padStart(3, '0')}`,
                    category: 'COMPLIANCE',
                    gapIdentified: 'Missing HIPAA de-identification and BAA boundary specification for healthcare data.',
                    suggestedRequirement: 'All secondary telemetry, analytics, and non-clinical data pipelines must perform automated Safe Harbor de-identification on PHI fields.',
                    riskLevel: 'CRITICAL',
                    rationale: 'HIPAA rules mandate strict controls over PHI export and third-party processing.'
                });
            }
        }

        // 7. Check for Financial specific gaps if domain is financial
        if (specsText.includes('financial') || specsText.includes('card') || specsText.includes('payment') || specsText.includes('pci')) {
            if (!specsText.includes('dora') && !specsText.includes('four-eyes')) {
                this.suggestions.push({
                    id: `SUG-COMP-${String(sugIndex++).padStart(3, '0')}`,
                    category: 'COMPLIANCE',
                    gapIdentified: 'Missing DORA operational resilience and dual-authorization control specifications.',
                    suggestedRequirement: 'High-value financial transfers and security policy modifications must require dual-control approval (four-eyes principle).',
                    riskLevel: 'HIGH',
                    rationale: 'Financial regulation (DORA / PCI 4.0) mandates strict controls against single-point unauthorized transaction execution.'
                });
            }
        }

        return [...this.suggestions];
    }

    /**
     * Retrieve generated missing requirement suggestions.
     * @returns {Array<Object>} Copy of suggestions list.
     */
    getSuggestions() {
        return [...this.suggestions];
    }
}

module.exports = MissingRequirementGenerator;
