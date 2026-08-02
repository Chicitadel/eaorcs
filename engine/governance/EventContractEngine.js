/******************************************************************************
 * Project        : EAORCS Governance Platform
 * Module         : API & SDK Governance Engine
 * File           : EventContractEngine.js
 * Version        : 2026.1.0
 * Author         : Air Roofers Architecture Authority / Ujomor Systems
 * Organization   : Ujomor Systems & Air Roofers
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | PUBLIC | INTERNAL
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
 * Copyright (c) 2026 Ujomor Systems & Air Roofers
 * All Rights Reserved.
 ******************************************************************************/

/**
 * 6 Canonical Event Schemas definition
 */
const CANONICAL_EVENT_SCHEMAS = {
    'support.ticket.created': {
        required: ['eventType', 'ticketId', 'tenantId', 'severity', 'correlationId', 'timestamp']
    },
    'cert.issued': {
        required: ['eventType', 'certId', 'projectId', 'tier', 'issuedAt', 'expiresAt']
    },
    'audit.completed': {
        required: ['eventType', 'auditId', 'projectId', 'score', 'findings', 'completedAt']
    },
    'license.renewed': {
        required: ['eventType', 'licenseKey', 'tenantId', 'plan', 'renewedAt', 'expiresAt']
    },
    'billing.invoice.created': {
        required: ['eventType', 'invoiceId', 'tenantId', 'amount', 'currency', 'dueDate']
    },
    'deployment.completed': {
        required: ['eventType', 'deploymentId', 'version', 'environment', 'completedAt']
    }
};

class EventContractEngine {
    /**
     * Get list of canonical event types
     * @returns {string[]}
     */
    static getCanonicalEventTypes() {
        return Object.keys(CANONICAL_EVENT_SCHEMAS);
    }

    /**
     * Validates event against canonical schema
     * @param {Object} event
     * @returns {{ valid: boolean, errors: string[] }}
     */
    static validateEvent(event) {
        const errors = [];

        if (!event || typeof event !== 'object') {
            return { valid: false, errors: ['Event payload must be a non-null object'] };
        }

        if (!event.eventType || typeof event.eventType !== 'string') {
            return { valid: false, errors: ["Missing or invalid required field 'eventType'"] };
        }

        const schema = CANONICAL_EVENT_SCHEMAS[event.eventType];
        if (!schema) {
            return { valid: false, errors: [`Unknown or unsupported eventType '${event.eventType}'`] };
        }

        for (const reqField of schema.required) {
            if (event[reqField] === undefined || event[reqField] === null) {
                errors.push(`Missing required field '${reqField}' for eventType '${event.eventType}'`);
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Validates webhook payload for required top-level envelope fields: id, eventType, timestamp, signature, data
     * @param {Object} payload
     * @returns {{ valid: boolean, errors: string[] }}
     */
    static validateWebhookPayload(payload) {
        const errors = [];

        if (!payload || typeof payload !== 'object') {
            return { valid: false, errors: ['Webhook payload must be a non-null object'] };
        }

        const requiredFields = ['id', 'eventType', 'timestamp', 'signature', 'data'];
        for (const field of requiredFields) {
            if (payload[field] === undefined || payload[field] === null || payload[field] === '') {
                errors.push(`Webhook payload missing required field '${field}'`);
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Verifies delivery guarantee / idempotency key present in webhook payload
     * @param {Object} payload
     * @returns {{ guaranteed: boolean, idempotencyKey: string|null, reason?: string }}
     */
    static verifyDeliveryGuarantee(payload) {
        if (!payload || typeof payload !== 'object') {
            return { guaranteed: false, idempotencyKey: null, reason: 'Invalid payload object' };
        }

        const idempotencyKey = payload.idempotencyKey ||
            payload['x-idempotency-key'] ||
            payload.idempotency_key ||
            payload.idempotencyId ||
            (payload.headers && (payload.headers['idempotency-key'] || payload.headers['x-idempotency-key']));

        if (!idempotencyKey) {
            return {
                guaranteed: false,
                idempotencyKey: null,
                reason: 'Missing idempotency key (idempotencyKey or x-idempotency-key)'
            };
        }

        return {
            guaranteed: true,
            idempotencyKey: String(idempotencyKey)
        };
    }
}

module.exports = {
    EventContractEngine,
    CANONICAL_EVENT_SCHEMAS
};
