/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Decentralized Identity Bridge Engine
 * File           : engine/trust/DecentralizedIdentityBridge.js
 * Version        : 2026.1.0-LTS
 * Author         : Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
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
 * - NIST
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const crypto = require('crypto');

class DecentralizedIdentityBridge {
  constructor() {
    this.didDocuments = new Map();
    this.verifiableCredentials = new Map();
  }

  createDidDocument(entityId, publicKey) {
    if (!entityId || !publicKey) throw new Error('entityId and publicKey required');
    const did = `did:eaorcs:${entityId}`;
    const keyId = `${did}#keys-1`;

    const didDoc = {
      '@context': ['https://www.w3.org/ns/did/v1'],
      id: did,
      verificationMethod: [{
        id: keyId,
        type: 'RsaVerificationKey2020',
        controller: did,
        publicKeyPem: publicKey
      }],
      authentication: [keyId],
      assertionMethod: [keyId],
      created: new Date().toISOString()
    };

    this.didDocuments.set(did, didDoc);
    return didDoc;
  }

  issueVerifiableCredential(issuerDid, subjectDid, claims, privateKey) {
    if (!issuerDid || !subjectDid || !claims || !privateKey) {
      throw new Error('issuerDid, subjectDid, claims, and privateKey are required');
    }

    const vcId = `vc:eaorcs:${crypto.randomBytes(6).toString('hex')}`;
    const issuanceDate = new Date().toISOString();

    const credentialSubject = {
      id: subjectDid,
      ...claims
    };

    const vcBody = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      id: vcId,
      type: ['VerifiableCredential', 'SoftwareTrustCredential'],
      issuer: issuerDid,
      issuanceDate,
      credentialSubject
    };

    const canonical = JSON.stringify(vcBody, Object.keys(vcBody).sort());
    const signer = crypto.createSign('SHA256');
    signer.update(canonical);
    const jws = signer.sign(privateKey, 'hex');

    const fullVc = {
      ...vcBody,
      proof: {
        type: 'RsaSignature2020',
        created: issuanceDate,
        verificationMethod: `${issuerDid}#keys-1`,
        proofPurpose: 'assertionMethod',
        jws
      }
    };

    this.verifiableCredentials.set(vcId, fullVc);
    return fullVc;
  }

  verifyVerifiableCredential(vcDocument) {
    if (!vcDocument || !vcDocument.proof || !vcDocument.proof.jws) {
      return { valid: false, reason: 'INVALID_VC_PROOF' };
    }

    const issuerDid = vcDocument.issuer;
    const didDoc = this.didDocuments.get(issuerDid);
    if (!didDoc) return { valid: false, reason: 'ISSUER_DID_NOT_FOUND' };

    try {
      const body = { ...vcDocument };
      delete body.proof;

      const canonical = JSON.stringify(body, Object.keys(body).sort());
      const verifier = crypto.createVerify('SHA256');
      verifier.update(canonical);
      const pubKey = didDoc.verificationMethod[0].publicKeyPem;
      const valid = verifier.verify(pubKey, vcDocument.proof.jws, 'hex');
      return { valid, vcId: vcDocument.id, issuer: issuerDid };
    } catch (e) {
      return { valid: false, reason: e.message };
    }
  }

  resolveDid(didString) {
    return this.didDocuments.get(didString) || null;
  }
}

module.exports = { DecentralizedIdentityBridge };
