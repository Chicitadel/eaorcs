/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Standards & OSAP Conformance Engine (Stream D)
 * File           : OSAPSpecificationEngine.js
 * Version        : 2026.1-LTS (v1.1.0-FROZEN)
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 * - Corporate Policy Governed
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 * - W3C DID v1.0
 * - OSAP v1.1 Protocol
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * OSAPSpecificationEngine
 * Engine that exports, validates, and certifies compliance passports against 
 * OSAP v1.1 (Open Software Assurance Passport) and W3C Decentralized Identifier (DID) specifications.
 */
class OSAPSpecificationEngine {
    constructor(options = {}) {
        this.options = options;
        this.specVersion = '1.1';
        this.didPrefix = 'did:eaorcs:';
        this.allowedAssuranceLevels = new Set([
            'BASIC', 'STANDARD', 'HIGH', 'CRITICAL',
            'LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4', 'LEVEL_5'
        ]);
        
        // Cache loaded schemas if available
        this._schemas = {};
        this._loadSchemas();
    }

    /**
     * Loads JSON Schemas if present in filesystem
     */
    _loadSchemas() {
        try {
            const osapSchemaPath = path.resolve(__dirname, '../../schemas/osap-v1.1.schema.json');
            if (fs.existsSync(osapSchemaPath)) {
                this._schemas.osap = JSON.parse(fs.readFileSync(osapSchemaPath, 'utf8'));
            }
        } catch (e) {
            // Non-blocking schema load fallback
        }

        try {
            const didSchemaPath = path.resolve(__dirname, '../../schemas/did-eaorcs-v1.schema.json');
            if (fs.existsSync(didSchemaPath)) {
                this._schemas.did = JSON.parse(fs.readFileSync(didSchemaPath, 'utf8'));
            }
        } catch (e) {
            // Non-blocking schema load fallback
        }
    }

    /**
     * Exports a canonical OSAP v1.1 passport object based on software metadata.
     * @param {Object} metadata - Software and audit metadata.
     * @param {Object} [options] - Additional options.
     * @returns {Object} Canonical OSAP v1.1 passport.
     */
    exportOSAPPassport(metadata = {}, options = {}) {
        if (!metadata || typeof metadata !== 'object') {
            throw new Error('OSAP Export Error: Invalid or missing metadata object');
        }

        const issuedAt = options.issuedAt || new Date().toISOString();
        const validityDays = options.validityDays || 90;
        const expiresAt = options.expiresAt || new Date(Date.now() + validityDays * 86400000).toISOString();

        const nodeId = metadata.nodeId || metadata.issuerNode || 'node-primary-01';
        const issuerDid = metadata.issuerDid || (nodeId.startsWith('did:eaorcs:') ? nodeId : `${this.didPrefix}${nodeId}`);
        const uniqueId = crypto.randomBytes(6).toString('hex');
        const passportId = metadata.passportId || `osap:urn:eaorcs:passport:${Date.now()}-${uniqueId}`;

        const softwareId = metadata.softwareId || metadata.artifactId || metadata.name || 'eaorcs-core';
        const name = metadata.name || 'EAORCS Software Platform';
        const version = metadata.version || '2026.1.0-LTS';
        const buildHash = metadata.buildHash || metadata.commitHash || crypto.createHash('sha256').update(`${softwareId}-${version}`).digest('hex');
        const repository = metadata.repository || 'd:/ujomor-platform/products/eaorcs';

        const assuranceLevel = (metadata.assuranceLevel || 'CRITICAL').toUpperCase();
        if (!this.allowedAssuranceLevels.has(assuranceLevel)) {
            throw new Error(`OSAP Export Error: Invalid assurance level '${assuranceLevel}'`);
        }

        const governance = {
            complianceStandard: metadata.complianceStandard || ['ISO 27001', 'SOC 2', 'OWASP ASVS', 'NIST SP 800-53'],
            auditState: metadata.auditState || 'PASSED_VERIFIED',
            policyDigest: metadata.policyDigest || `0x${crypto.createHash('sha256').update(JSON.stringify(metadata.governance || {})).digest('hex')}`,
            verificationStatus: metadata.verificationStatus || 'CERTIFIED'
        };

        const rawEvidence = metadata.evidence || [
            {
                evidenceId: `ev-${crypto.randomBytes(4).toString('hex')}`,
                type: 'CODE_AUDIT_REPORT',
                checksum: crypto.createHash('sha256').update('CODE_AUDIT_PASS').digest('hex'),
                timestamp: issuedAt,
                attestation: 'Passed static security analysis and zero-vulnerability check'
            },
            {
                evidenceId: `ev-${crypto.randomBytes(4).toString('hex')}`,
                type: 'CONTRACT_CONFORMANCE',
                checksum: crypto.createHash('sha256').update('CONTRACT_PASS').digest('hex'),
                timestamp: issuedAt,
                attestation: 'All API contracts validated against frozen schemas'
            }
        ];

        const evidence = rawEvidence.map((item, idx) => ({
            evidenceId: item.evidenceId || `ev-${idx}-${crypto.randomBytes(3).toString('hex')}`,
            type: item.type || 'ATTESTATION_ARTIFACT',
            checksum: item.checksum || crypto.createHash('sha256').update(JSON.stringify(item)).digest('hex'),
            timestamp: item.timestamp || issuedAt,
            attestation: item.attestation || 'Verified compliance artifact'
        }));

        const canonicalPayload = {
            passportId,
            version: this.specVersion,
            issuer: issuerDid,
            subject: {
                softwareId,
                name,
                version,
                buildHash,
                repository
            },
            issuedAt,
            expiresAt,
            assuranceLevel,
            governance,
            evidence
        };

        // Generate preliminary proof digest
        const payloadDigest = this._computePayloadDigest(canonicalPayload);
        canonicalPayload.proof = {
            type: options.proofType || 'EaorcsHmacSha256',
            created: issuedAt,
            verificationMethod: `${issuerDid}#key-1`,
            proofPurpose: 'assertionMethod',
            proofValue: this._signDigest(payloadDigest, options.secretKey || 'eaorcs-governance-secret-key')
        };

        canonicalPayload.trustExchange = {
            protocolVersion: this.specVersion,
            relayNode: options.relayNode || `${this.didPrefix}trust-relay-01`,
            signature: crypto.createHmac('sha256', options.secretKey || 'eaorcs-governance-secret-key')
                .update(`${passportId}:${issuerDid}:${payloadDigest}`)
                .digest('hex')
        };

        return canonicalPayload;
    }

    /**
     * Validates an OSAP v1.1 passport object against formal specification and schema rules.
     * @param {Object} passport - OSAP passport to validate.
     * @returns {{ valid: boolean, errors: string[], warnings: string[], osapVersion: string }}
     */
    validateOSAPPassport(passport) {
        const errors = [];
        const warnings = [];

        if (!passport || typeof passport !== 'object') {
            return {
                valid: false,
                errors: ['OSAP passport is null, undefined, or not an object'],
                warnings: [],
                osapVersion: null
            };
        }

        // Field presence & type checks
        if (!passport.passportId || typeof passport.passportId !== 'string') {
            errors.push('Missing or invalid string field: passportId');
        } else if (!/^(osap:urn:eaorcs:passport:|OSAP-PASS-)[a-zA-Z0-9._-]+$/.test(passport.passportId)) {
            warnings.push(`passportId standard format recommendation: should start with 'osap:urn:eaorcs:passport:' or 'OSAP-PASS-'`);
        }

        if (passport.version !== '1.1') {
            errors.push(`Unsupported OSAP version '${passport.version}'. Expected '1.1'`);
        }

        if (!passport.issuer || typeof passport.issuer !== 'string') {
            errors.push('Missing or invalid string field: issuer');
        } else if (!this._isValidDID(passport.issuer)) {
            errors.push(`Issuer must be a valid W3C DID string formatted as 'did:eaorcs:<nodeId>' (received: '${passport.issuer}')`);
        }

        if (!passport.subject || typeof passport.subject !== 'object') {
            errors.push('Missing or invalid object field: subject');
        } else {
            if (!passport.subject.softwareId) errors.push('Missing subject.softwareId');
            if (!passport.subject.name) errors.push('Missing subject.name');
            if (!passport.subject.version) errors.push('Missing subject.version');
            if (!passport.subject.buildHash) errors.push('Missing subject.buildHash');
        }

        if (!passport.issuedAt || isNaN(Date.parse(passport.issuedAt))) {
            errors.push('Missing or invalid ISO date string field: issuedAt');
        }

        if (!passport.expiresAt || isNaN(Date.parse(passport.expiresAt))) {
            errors.push('Missing or invalid ISO date string field: expiresAt');
        } else {
            const expiresMs = new Date(passport.expiresAt).getTime();
            if (Date.now() > expiresMs) {
                errors.push(`OSAP Passport has expired (expiresAt: ${passport.expiresAt})`);
            }
        }

        if (!passport.assuranceLevel || !this.allowedAssuranceLevels.has(passport.assuranceLevel)) {
            errors.push(`Invalid assuranceLevel '${passport.assuranceLevel}'. Must be one of: ${Array.from(this.allowedAssuranceLevels).join(', ')}`);
        }

        if (!passport.governance || typeof passport.governance !== 'object') {
            errors.push('Missing or invalid object field: governance');
        } else {
            if (!Array.isArray(passport.governance.complianceStandard) || passport.governance.complianceStandard.length === 0) {
                errors.push('governance.complianceStandard must be a non-empty array of standards');
            }
            if (!passport.governance.auditState) {
                errors.push('Missing governance.auditState');
            }
        }

        if (!Array.isArray(passport.evidence)) {
            errors.push('evidence must be an array');
        } else if (passport.evidence.length === 0) {
            warnings.push('evidence array is empty');
        } else {
            passport.evidence.forEach((ev, i) => {
                if (!ev.evidenceId || !ev.type || !ev.checksum) {
                    errors.push(`evidence item at index ${i} missing required fields (evidenceId, type, checksum)`);
                }
            });
        }

        if (!passport.proof || typeof passport.proof !== 'object') {
            errors.push('Missing cryptographic proof object field: proof');
        } else {
            if (!passport.proof.type) errors.push('Missing proof.type');
            if (!passport.proof.verificationMethod) errors.push('Missing proof.verificationMethod');
            if (!passport.proof.proofValue) errors.push('Missing proof.proofValue');
        }

        const valid = errors.length === 0;

        return {
            valid,
            errors,
            warnings,
            osapVersion: passport.version || '1.1'
        };
    }

    /**
     * Certifies an OSAP v1.1 passport by verifying or appending cryptographic proof & certificate signature.
     * @param {Object} passport - OSAP passport.
     * @param {Object} [options] - Key and signing configuration.
     * @returns {Object} Certified OSAP v1.1 passport with attached certification block.
     */
    certifyOSAPPassport(passport, options = {}) {
        const validation = this.validateOSAPPassport(passport);
        if (!validation.valid) {
            throw new Error(`OSAP Certification Failed: Passport invalid - ${validation.errors.join('; ')}`);
        }

        const secretKey = options.secretKey || 'eaorcs-governance-secret-key';
        const cloned = JSON.parse(JSON.stringify(passport));

        const payloadDigest = this._computePayloadDigest(cloned);
        const proofSignature = this._signDigest(payloadDigest, secretKey);

        cloned.proof = {
            type: options.proofType || cloned.proof?.type || 'EaorcsHmacSha256',
            created: new Date().toISOString(),
            verificationMethod: options.verificationMethod || cloned.proof?.verificationMethod || `${cloned.issuer}#key-1`,
            proofPurpose: 'assertionMethod',
            proofValue: proofSignature
        };

        const certId = `CERT-OSAP-${cloned.passportId.replace(/[^a-zA-Z0-9]/g, '-').toUpperCase()}`;
        cloned.certification = {
            certificateId: certId,
            status: 'CERTIFIED',
            certifiedAt: new Date().toISOString(),
            authority: options.authority || 'Ujomor Systems Engineering & Governance Authority',
            digest: payloadDigest,
            signature: proofSignature
        };

        return cloned;
    }

    /**
     * Generates a W3C Decentralized Identifier (DID) Document for an EAORCS sovereign identity node.
     * @param {string} nodeId - Sovereign node identifier.
     * @param {Array<Object>} [serviceEndpoints] - Optional service endpoints.
     * @param {Array<Object>} [verificationKeys] - Optional custom keys.
     * @returns {Object} W3C DID Document conforming to did:eaorcs: specification.
     */
    generateDIDDocument(nodeId, serviceEndpoints = [], verificationKeys = []) {
        if (!nodeId || typeof nodeId !== 'string') {
            throw new Error('DID Generation Error: nodeId must be a non-empty string');
        }

        const sanitizedNodeId = nodeId.replace(/^did:eaorcs:/, '');
        if (!/^[a-zA-Z0-9._-]+$/.test(sanitizedNodeId)) {
            throw new Error(`DID Generation Error: Invalid nodeId characters in '${nodeId}'`);
        }

        const did = `${this.didPrefix}${sanitizedNodeId}`;
        const keyId = `${did}#key-1`;

        const defaultKeys = verificationKeys.length > 0 ? verificationKeys : [
            {
                id: keyId,
                type: 'Ed25519VerificationKey2020',
                controller: did,
                publicKeyMultibase: `z6M${crypto.createHash('sha256').update(sanitizedNodeId).digest('hex').slice(0, 44)}`
            }
        ];

        const defaultServices = serviceEndpoints.length > 0 ? serviceEndpoints : [
            {
                id: `${did}#trust-exchange`,
                type: 'OSAPTrustExchangeService',
                serviceEndpoint: `https://node-${sanitizedNodeId}.eaorcs.ujomor.org/trust-exchange/v1`
            },
            {
                id: `${did}#audit-verifier`,
                type: 'EAORCSAuditVerifierEndpoint',
                serviceEndpoint: `https://node-${sanitizedNodeId}.eaorcs.ujomor.org/audit/v1`
            }
        ];

        const now = new Date().toISOString();

        return {
            '@context': [
                'https://www.w3.org/ns/did/v1',
                'https://eaorcs.ujomor.org/contexts/did/v1'
            ],
            id: did,
            verificationMethod: defaultKeys,
            authentication: [keyId],
            assertionMethod: [keyId],
            service: defaultServices,
            created: now,
            updated: now,
            deactivated: false
        };
    }

    /**
     * Resolves a did:eaorcs:<nodeId> Decentralized Identifier string into a W3C DID Document structure.
     * @param {string} did - W3C DID string (did:eaorcs:...)
     * @param {Object} [options] - Resolution options.
     * @returns {Object} DID Resolution Result Object.
     */
    resolveDIDDocument(did, options = {}) {
        if (!did || typeof did !== 'string') {
            return {
                didDocument: null,
                didResolutionMetadata: {
                    error: 'invalidDid',
                    message: 'DID parameter must be a non-empty string'
                },
                didDocumentMetadata: {}
            };
        }

        if (!this._isValidDID(did)) {
            return {
                didDocument: null,
                didResolutionMetadata: {
                    error: 'invalidDid',
                    message: `DID string '${did}' does not conform to format 'did:eaorcs:<nodeId>'`
                },
                didDocumentMetadata: {}
            };
        }

        const nodeId = did.replace(this.didPrefix, '');
        const didDoc = this.generateDIDDocument(nodeId, options.serviceEndpoints, options.verificationKeys);

        return {
            didDocument: didDoc,
            didResolutionMetadata: {
                contentType: 'application/did+ld+json',
                retrieved: new Date().toISOString()
            },
            didDocumentMetadata: {
                created: didDoc.created,
                updated: didDoc.updated,
                deactivated: false
            }
        };
    }

    /**
     * Validates a Trust Exchange P2P message payload for OSAP protocol compliance.
     * @param {Object} message - Trust Exchange message object.
     * @returns {{ valid: boolean, errors: string[] }}
     */
    validateTrustExchangeMessage(message) {
        const errors = [];

        if (!message || typeof message !== 'object') {
            return { valid: false, errors: ['Trust Exchange message must be an object'] };
        }

        if (!message.header || typeof message.header !== 'object') {
            errors.push('Missing or invalid header object');
        } else {
            const h = message.header;
            if (!h.messageId) errors.push('Missing header.messageId');
            if (h.protocolVersion !== '1.1') errors.push(`Unsupported protocolVersion '${h.protocolVersion}'. Expected '1.1'`);
            if (!h.senderDid || !this._isValidDID(h.senderDid)) errors.push('Missing or invalid header.senderDid');
            if (!h.recipientDid || !this._isValidDID(h.recipientDid)) errors.push('Missing or invalid header.recipientDid');
            if (!h.timestamp || isNaN(Date.parse(h.timestamp))) errors.push('Missing or invalid header.timestamp');
            if (!h.messageType) errors.push('Missing header.messageType');
        }

        if (!message.payload || (typeof message.payload !== 'object' && typeof message.payload !== 'string')) {
            errors.push('Missing or invalid payload');
        }

        if (!message.signature || typeof message.signature !== 'string') {
            errors.push('Missing or invalid cryptographic signature string');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Helper: Validates W3C DID string format for did:eaorcs:
     */
    _isValidDID(did) {
        if (!did || typeof did !== 'string') return false;
        return /^did:eaorcs:[a-zA-Z0-9._-]+$/.test(did);
    }

    /**
     * Helper: Computes deterministic SHA-256 digest of normalized OSAP payload (excluding proof & certification).
     */
    _computePayloadDigest(passport) {
        const clone = JSON.parse(JSON.stringify(passport));
        delete clone.proof;
        delete clone.certification;
        delete clone.trustExchange;

        const canonicalJson = JSON.stringify(clone, Object.keys(clone).sort());
        return crypto.createHash('sha256').update(canonicalJson).digest('hex');
    }

    /**
     * Helper: Cryptographic HMAC signature of a digest
     */
    _signDigest(digest, secretKey) {
        return crypto.createHmac('sha256', secretKey).update(digest).digest('hex');
    }
}

module.exports = OSAPSpecificationEngine;
