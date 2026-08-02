/******************************************************************************
 * Project        : EAORCS Governance Platform
 * Module         : API & SDK Governance Engine
 * File           : event_contract.test.js
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

const assert = require('assert');
const { EventContractEngine } = require('../../engine/governance/EventContractEngine');

function runEventContractTests() {
    const results = [];

    // Test 1: All 6 canonical event schemas validate correctly
    try {
        const canonicalEvents = [
            {
                eventType: 'support.ticket.created',
                ticketId: 'TCK-1001',
                tenantId: 'TENANT-ALPHA',
                severity: 'HIGH',
                correlationId: 'CORR-9901',
                timestamp: '2026-08-01T12:00:00Z'
            },
            {
                eventType: 'cert.issued',
                certId: 'CERT-5001',
                projectId: 'PROJ-EAORCS',
                tier: 'GOLD',
                issuedAt: '2026-08-01T10:00:00Z',
                expiresAt: '2027-08-01T10:00:00Z'
            },
            {
                eventType: 'audit.completed',
                auditId: 'AUD-8802',
                projectId: 'PROJ-EAORCS',
                score: 98.5,
                findings: [],
                completedAt: '2026-08-01T11:30:00Z'
            },
            {
                eventType: 'license.renewed',
                licenseKey: 'LIC-KEY-99211',
                tenantId: 'TENANT-BETA',
                plan: 'ENTERPRISE',
                renewedAt: '2026-08-01T08:00:00Z',
                expiresAt: '2027-08-01T08:00:00Z'
            },
            {
                eventType: 'billing.invoice.created',
                invoiceId: 'INV-2026-0081',
                tenantId: 'TENANT-GAMMA',
                amount: 4999.00,
                currency: 'USD',
                dueDate: '2026-08-31'
            },
            {
                eventType: 'deployment.completed',
                deploymentId: 'DEP-20260801-01',
                version: '2026.1.0',
                environment: 'production',
                completedAt: '2026-08-01T12:30:00Z'
            }
        ];

        for (const evt of canonicalEvents) {
            const val = EventContractEngine.validateEvent(evt);
            assert.strictEqual(val.valid, true, `Event '${evt.eventType}' should validate cleanly. Errors: ${val.errors.join(', ')}`);
        }

        results.push({ test: 'All 6 canonical event schemas validate correctly', passed: true });
    } catch (err) {
        results.push({ test: 'All 6 canonical event schemas validate correctly', passed: false, error: err.message });
    }

    // Test 2: Malformed event (missing eventType) fails
    try {
        const malformedEvent = {
            ticketId: 'TCK-1001',
            tenantId: 'TENANT-ALPHA',
            timestamp: '2026-08-01T12:00:00Z'
        };

        const val = EventContractEngine.validateEvent(malformedEvent);
        assert.strictEqual(val.valid, false, 'Event missing eventType must fail validation');
        assert.ok(val.errors.some(e => e.includes('eventType')), 'Errors must mention eventType');
        results.push({ test: 'Malformed event (missing eventType) fails', passed: true });
    } catch (err) {
        results.push({ test: 'Malformed event (missing eventType) fails', passed: false, error: err.message });
    }

    // Test 3: Webhook payload with missing signature fails
    try {
        const payloadMissingSignature = {
            id: 'WH-MSG-9001',
            eventType: 'support.ticket.created',
            timestamp: '2026-08-01T12:00:00Z',
            data: { ticketId: 'TCK-1001' }
            // missing signature
        };

        const val = EventContractEngine.validateWebhookPayload(payloadMissingSignature);
        assert.strictEqual(val.valid, false, 'Webhook payload missing signature must fail validation');
        assert.ok(val.errors.some(e => e.includes('signature')), 'Errors must mention signature');
        results.push({ test: 'Webhook payload with missing signature fails', passed: true });
    } catch (err) {
        results.push({ test: 'Webhook payload with missing signature fails', passed: false, error: err.message });
    }

    // Test 4: Idempotency key requirement (verifyDeliveryGuarantee)
    try {
        const payloadWithKey = {
            id: 'WH-MSG-9002',
            eventType: 'cert.issued',
            timestamp: '2026-08-01T12:00:00Z',
            signature: 'sig_ed25519_sample_hex',
            idempotencyKey: 'IDEM-KEY-77123',
            data: { certId: 'CERT-5001' }
        };

        const guaranteeVal = EventContractEngine.verifyDeliveryGuarantee(payloadWithKey);
        assert.strictEqual(guaranteeVal.guaranteed, true, 'Payload with idempotencyKey must satisfy delivery guarantee');
        assert.strictEqual(guaranteeVal.idempotencyKey, 'IDEM-KEY-77123');

        const payloadWithoutKey = {
            id: 'WH-MSG-9003',
            eventType: 'cert.issued',
            timestamp: '2026-08-01T12:00:00Z',
            signature: 'sig_ed25519_sample_hex',
            data: { certId: 'CERT-5001' }
        };

        const missingGuaranteeVal = EventContractEngine.verifyDeliveryGuarantee(payloadWithoutKey);
        assert.strictEqual(missingGuaranteeVal.guaranteed, false, 'Payload without idempotency key must fail delivery guarantee check');
        results.push({ test: 'Idempotency key requirement check', passed: true });
    } catch (err) {
        results.push({ test: 'Idempotency key requirement check', passed: false, error: err.message });
    }

    return results;
}

if (require.main === module) {
    const res = runEventContractTests();
    console.log(res);
}

module.exports = { runEventContractTests };
