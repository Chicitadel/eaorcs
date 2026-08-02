/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS OSAP & Interoperability Engine
 * File           : CryptoSigner.js
 * Version        : 2026.1-LTS
 * Author         : Enterprise Architecture Authority & Cryptographic Governance
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
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 * - Ed25519 (RFC 8032)
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

const crypto = require('crypto');

/**
 * CryptoSigner
 * Cryptographic payload signing and verification engine supporting:
 * - Ed25519 (RFC 8032) asymmetric keypair generation, signing & verification
 * - Deterministic JSON canonicalization
 * - SHA-256 / SHA-512 payload hashing
 */
class CryptoSigner {
    constructor(options = {}) {
        this.algorithm = options.algorithm || 'ed25519';
    }

    /**
     * Generate fresh Ed25519 cryptographic key pair
     * @returns {Object} Keypair in PEM format { publicKey, privateKey }
     */
    generateKeyPair() {
        const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
        });
        return { publicKey, privateKey };
    }

    /**
     * Deterministic JSON serialization for canonical signing payloads
     * @param {*} data
     * @returns {string}
     */
    canonicalize(data) {
        if (data === null || typeof data !== 'object') {
            return JSON.stringify(data);
        }
        if (Array.isArray(data)) {
            return '[' + data.map(item => this.canonicalize(item)).join(',') + ']';
        }
        const sortedKeys = Object.keys(data).sort();
        const parts = sortedKeys.map(key => `${JSON.stringify(key)}:${this.canonicalize(data[key])}`);
        return '{' + parts.join(',') + '}';
    }

    /**
     * Hash data payload
     * @param {*} payload
     * @param {string} [algo='sha256']
     * @returns {string} Hex hash string
     */
    hashPayload(payload, algo = 'sha256') {
        const canonical = typeof payload === 'string' ? payload : this.canonicalize(payload);
        return crypto.createHash(algo).update(canonical, 'utf8').digest('hex');
    }

    /**
     * Sign payload using Ed25519 private key (or fallback key)
     * @param {*} payload - Object or string to sign
     * @param {string|KeyObject} privateKeyPem - Ed25519 Private Key in PEM format
     * @returns {Object} Signature metadata { signature, signatureAlgorithm, publicKey }
     */
    signPayload(payload, privateKeyPem) {
        const canonicalString = typeof payload === 'string' ? payload : this.canonicalize(payload);
        const payloadBuffer = Buffer.from(canonicalString, 'utf8');

        if (!privateKeyPem) {
            // Generate temporary ephemeral key pair for signing if none supplied
            const keys = this.generateKeyPair();
            privateKeyPem = keys.privateKey;
        }

        const signatureBuffer = crypto.sign(null, payloadBuffer, privateKeyPem);
        const signatureHex = signatureBuffer.toString('hex');

        return {
            signature: signatureHex,
            signatureAlgorithm: 'Ed25519',
            canonicalHash: crypto.createHash('sha256').update(canonicalString).digest('hex'),
            signedAt: new Date().toISOString()
        };
    }

    /**
     * Verify Ed25519 signature of payload against public key
     * @param {*} payload - Signed object or string
     * @param {string} signatureHex - Signature string in hex format
     * @param {string|KeyObject} publicKeyPem - Ed25519 Public Key in PEM format
     * @returns {boolean} True if signature is cryptographically valid
     */
    verifySignature(payload, signatureHex, publicKeyPem) {
        if (!payload || !signatureHex || !publicKeyPem) return false;

        try {
            const canonicalString = typeof payload === 'string' ? payload : this.canonicalize(payload);
            const payloadBuffer = Buffer.from(canonicalString, 'utf8');
            const signatureBuffer = Buffer.from(signatureHex, 'hex');

            return crypto.verify(null, payloadBuffer, publicKeyPem, signatureBuffer);
        } catch (err) {
            return false;
        }
    }
}

module.exports = CryptoSigner;
