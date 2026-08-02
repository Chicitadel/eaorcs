/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Standards & Interoperability (Phase 11 Stream 4)
 * File           : engine/spec/OSAPConformanceSuite.js
 * Version        : 2026.1.0-LTS
 * Author         : Ujomor Systems Engineering & Governance Authority
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
 * Signatures:
 * - Enterprise Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const OSAPSpecificationEngine = require('./OSAPSpecificationEngine');
const StandardsRegistryEngine = require('./StandardsRegistryEngine');

/**
 * OSAPConformanceSuite
 * Comprehensive Standards & Interoperability Conformance Suite providing:
 * 1. OSAP v1.1 Passport validation & verification
 * 2. W3C Decentralized Identifier (DID) document creation & resolution
 * 3. Schema registry lookup & version matching engine
 */
class OSAPConformanceSuite {
  /**
   * Initializes the Conformance Suite.
   * @param {Object} [options={}] Configuration options.
   */
  constructor(options = {}) {
    this.options = options;
    this.specVersion = '1.1';
    this.didPrefix = 'did:eaorcs:';
    
    // Core Engine Integrations
    this.specEngine = new OSAPSpecificationEngine(options);
    this.registryEngine = new StandardsRegistryEngine({
      registryPath: options.registryPath || path.resolve(__dirname, '../../schemas/schema-registry.json'),
      schemasDir: options.schemasDir || path.resolve(__dirname, '../../schemas'),
      autoLoad: true
    });

    // In-Memory W3C DID Document Registry Store
    this.didRegistry = new Map();
    this._initializeDefaultDids();
  }

  /**
   * Initializes default seed W3C DIDs for sovereign nodes.
   * @private
   */
  _initializeDefaultDids() {
    const seedNodes = [
      { nodeId: 'node-primary-01', name: 'Primary Sovereign Authority Node' },
      { nodeId: 'trust-relay-01', name: 'Global Trust Exchange Relay Node' },
      { nodeId: 'audit-verifier-01', name: 'Enterprise Audit Verifier Node' }
    ];

    for (const seed of seedNodes) {
      const doc = this.createDidDocument(seed.nodeId, [
        {
          keyId: 'key-1',
          type: 'Ed25519VerificationKey2020',
          publicKeyPem: '-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...seed...\n-----END PUBLIC KEY-----'
        }
      ], [
        {
          serviceId: 'trust-exchange',
          type: 'OSAPTrustExchangeService',
          serviceEndpoint: `https://trust.${seed.nodeId}.eaorcs.internal/v1`
        }
      ]);
      this.didRegistry.set(doc.id, doc);
    }
  }

  // =========================================================================
  // 1. OSAP v1.1 PASSPORT CONFORMANCE & VALIDATION
  // =========================================================================

  /**
   * Validates an OSAP v1.1 Passport against formal protocol conformance specifications.
   * @param {Object} passport - The passport object to validate.
   * @param {Object} [options={}] - Validation options (e.g. secretKey, checkExpiration).
   * @returns {Object} Conformance result containing valid flag, errors, warnings, and metadata.
   */
  validatePassport(passport, options = {}) {
    const result = {
      valid: true,
      errors: [],
      warnings: [],
      passportId: null,
      version: null,
      assuranceLevel: null,
      issuer: null,
      proofVerified: false,
      digest: null
    };

    if (!passport || typeof passport !== 'object') {
      result.valid = false;
      result.errors.push('Passport payload must be a non-null object');
      return result;
    }

    result.passportId = passport.passportId || null;
    result.version = passport.version || null;
    result.assuranceLevel = passport.assuranceLevel || null;
    result.issuer = passport.issuer || null;

    // 1. Required fields check
    const requiredFields = [
      'passportId', 'version', 'issuer', 'subject',
      'issuedAt', 'expiresAt', 'assuranceLevel',
      'governance', 'evidence', 'proof'
    ];

    for (const field of requiredFields) {
      if (passport[field] === undefined || passport[field] === null) {
        result.valid = false;
        result.errors.push(`Missing required root property '${field}'`);
      }
    }

    if (!result.valid) return result;

    // 2. Version constraint check (OSAP v1.1)
    if (passport.version !== '1.1') {
      result.valid = false;
      result.errors.push(`Invalid OSAP version '${passport.version}'. Expected '1.1'`);
    }

    // 3. Passport ID pattern check
    const passportIdRegex = /^(osap:urn:eaorcs:passport:|OSAP-PASS-)[a-zA-Z0-9._-]+$/;
    if (!passportIdRegex.test(passport.passportId)) {
      result.valid = false;
      result.errors.push(`Passport ID '${passport.passportId}' violates OSAP URI pattern`);
    }

    // 4. Issuer DID format check
    if (!/^did:eaorcs:[a-zA-Z0-9._-]+$/.test(passport.issuer)) {
      result.valid = false;
      result.errors.push(`Issuer '${passport.issuer}' must be a valid W3C DID string (did:eaorcs:<nodeId>)`);
    }

    // 5. Subject validation
    const { subject } = passport;
    if (!subject || typeof subject !== 'object') {
      result.valid = false;
      result.errors.push("Property 'subject' must be a valid object");
    } else {
      const subjectRequired = ['softwareId', 'name', 'version', 'buildHash'];
      for (const sReq of subjectRequired) {
        if (!subject[sReq]) {
          result.valid = false;
          result.errors.push(`Subject is missing required field '${sReq}'`);
        }
      }
    }

    // 6. Timestamps validation
    const issuedDate = new Date(passport.issuedAt);
    const expiresDate = new Date(passport.expiresAt);

    if (isNaN(issuedDate.getTime())) {
      result.valid = false;
      result.errors.push(`Invalid 'issuedAt' timestamp string: ${passport.issuedAt}`);
    }
    if (isNaN(expiresDate.getTime())) {
      result.valid = false;
      result.errors.push(`Invalid 'expiresAt' timestamp string: ${passport.expiresAt}`);
    }

    if (!isNaN(issuedDate.getTime()) && !isNaN(expiresDate.getTime())) {
      if (issuedDate.getTime() > expiresDate.getTime()) {
        result.valid = false;
        result.errors.push("'issuedAt' timestamp cannot be later than 'expiresAt'");
      }

      if (options.checkExpiration !== false) {
        const now = Date.now();
        if (now > expiresDate.getTime()) {
          result.valid = false;
          result.errors.push(`Passport has expired on ${passport.expiresAt}`);
        }
      }
    }

    // 7. Assurance level verification
    const allowedLevels = new Set([
      'BASIC', 'STANDARD', 'HIGH', 'CRITICAL',
      'LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4', 'LEVEL_5'
    ]);
    if (!allowedLevels.has(passport.assuranceLevel)) {
      result.valid = false;
      result.errors.push(`Invalid assurance level '${passport.assuranceLevel}'`);
    }

    // 8. Governance structure check
    if (!passport.governance || typeof passport.governance !== 'object') {
      result.valid = false;
      result.errors.push("Property 'governance' must be an object");
    } else {
      if (!Array.isArray(passport.governance.complianceStandard) || passport.governance.complianceStandard.length === 0) {
        result.valid = false;
        result.errors.push("Governance 'complianceStandard' must be a non-empty array");
      }
      if (!passport.governance.auditState) {
        result.valid = false;
        result.errors.push("Governance 'auditState' verdict is required");
      }
    }

    // 9. Evidence manifest check
    if (!Array.isArray(passport.evidence)) {
      result.valid = false;
      result.errors.push("Property 'evidence' must be an array");
    } else {
      passport.evidence.forEach((item, idx) => {
        if (!item.evidenceId || !item.type || !item.checksum) {
          result.valid = false;
          result.errors.push(`Evidence item at index ${idx} missing required fields (evidenceId, type, checksum)`);
        }
      });
    }

    // 10. Cryptographic Proof & Signature Verification
    if (!passport.proof || typeof passport.proof !== 'object') {
      result.valid = false;
      result.errors.push("Property 'proof' must be a valid proof object");
    } else {
      const { proof } = passport;
      if (!proof.type || !proof.verificationMethod || !proof.proofValue) {
        result.valid = false;
        result.errors.push('Proof object missing required attributes (type, verificationMethod, proofValue)');
      } else {
        const secretKey = options.secretKey || 'eaorcs-governance-secret-key';
        const signatureValid = this.verifyPassportSignature(passport, secretKey);
        result.proofVerified = signatureValid;
        
        if (!signatureValid) {
          result.warnings.push('Proof signature mismatch against provided secret key');
        }
      }
    }

    result.digest = this.computePayloadDigest(passport);
    return result;
  }

  /**
   * Generates a fully conformant OSAP v1.1 passport.
   * @param {Object} subjectData - Software metadata (name, version, buildHash, softwareId).
   * @param {string} issuerDid - Issuing W3C DID.
   * @param {Object} [options={}] - Creation options.
   * @returns {Object} Conforming OSAP v1.1 passport object.
   */
  generatePassport(subjectData, issuerDid, options = {}) {
    const metadata = {
      ...subjectData,
      issuerDid: issuerDid || `did:eaorcs:${subjectData.nodeId || 'node-primary-01'}`
    };
    return this.specEngine.exportOSAPPassport(metadata, options);
  }

  /**
   * Verifies the cryptographic HMAC / digest signature of an OSAP passport.
   * @param {Object} passport - OSAP passport object.
   * @param {string} secretKey - Cryptographic secret key used for HMAC signature.
   * @returns {boolean} True if signature is cryptographically valid.
   */
  verifyPassportSignature(passport, secretKey) {
    if (!passport || !passport.proof || !passport.proof.proofValue) return false;
    const digest = this.computePayloadDigest(passport);
    const expectedSignature = crypto.createHmac('sha256', secretKey).update(digest).digest('hex');
    return passport.proof.proofValue === expectedSignature;
  }

  /**
   * Computes deterministic SHA-256 digest of normalized OSAP payload.
   * @param {Object} passport - OSAP passport object.
   * @returns {string} Hexadecimal SHA-256 hash string.
   */
  computePayloadDigest(passport) {
    const clone = JSON.parse(JSON.stringify(passport));
    delete clone.proof;
    delete clone.certification;
    delete clone.trustExchange;

    const canonicalJson = JSON.stringify(clone, Object.keys(clone).sort());
    return crypto.createHash('sha256').update(canonicalJson).digest('hex');
  }

  // =========================================================================
  // 2. W3C DECENTRALIZED IDENTIFIER (DID) DOCUMENT RESOLUTION
  // =========================================================================

  /**
   * Creates a W3C Decentralized Identifier (DID) document for an EAORCS node.
   * @param {string} nodeId - Node identifier string (e.g. 'node-primary-01').
   * @param {Array<Object>} [keys=[]] - Key definitions for verification methods.
   * @param {Array<Object>} [services=[]] - Published service endpoints.
   * @returns {Object} W3C DID Document conforming to W3C DID v1.0.
   */
  createDidDocument(nodeId, keys = [], services = []) {
    const did = nodeId.startsWith('did:eaorcs:') ? nodeId : `${this.didPrefix}${nodeId}`;
    const timestamp = new Date().toISOString();

    const verificationMethods = keys.length > 0 ? keys.map((k, idx) => ({
      id: `${did}#${k.keyId || `key-${idx + 1}`}`,
      type: k.type || 'Ed25519VerificationKey2020',
      controller: did,
      ...(k.publicKeyJwk ? { publicKeyJwk: k.publicKeyJwk } : {}),
      ...(k.publicKeyPem ? { publicKeyPem: k.publicKeyPem } : {}),
      ...(k.publicKeyMultibase ? { publicKeyMultibase: k.publicKeyMultibase } : {})
    })) : [
      {
        id: `${did}#key-1`,
        type: 'Ed25519VerificationKey2020',
        controller: did,
        publicKeyPem: '-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...default...\n-----END PUBLIC KEY-----'
      }
    ];

    const serviceEndpoints = services.length > 0 ? services.map((s, idx) => ({
      id: `${did}#${s.serviceId || `service-${idx + 1}`}`,
      type: s.type || 'OSAPTrustExchangeService',
      serviceEndpoint: s.serviceEndpoint || `https://${nodeId}.eaorcs.internal/service`
    })) : [
      {
        id: `${did}#service-1`,
        type: 'OSAPTrustExchangeService',
        serviceEndpoint: `https://${nodeId}.eaorcs.internal/v1/trust`
      }
    ];

    const didDoc = {
      '@context': [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/suites/ed25519-2020/v1'
      ],
      id: did,
      verificationMethod: verificationMethods,
      authentication: verificationMethods.map(m => m.id),
      assertionMethod: verificationMethods.map(m => m.id),
      service: serviceEndpoints,
      created: timestamp,
      updated: timestamp,
      deactivated: false
    };

    return didDoc;
  }

  /**
   * Registers a W3C DID document into the internal resolution registry.
   * @param {Object} didDocument - DID Document to register.
   * @returns {boolean} True if successfully registered.
   */
  registerDidDocument(didDocument) {
    const validation = this.validateDidDocument(didDocument);
    if (!validation.valid) {
      throw new Error(`DID Registration Error: ${validation.errors.join('; ')}`);
    }
    this.didRegistry.set(didDocument.id, didDocument);
    return true;
  }

  /**
   * Resolves a W3C Decentralized Identifier string to its DID Document.
   * @param {string} did - Target DID string (e.g. 'did:eaorcs:node-primary-01').
   * @returns {Object} W3C DID Resolution result payload.
   */
  resolveDidDocument(did) {
    const normalizedDid = did && did.startsWith('did:eaorcs:') ? did : `${this.didPrefix}${did}`;
    const doc = this.didRegistry.get(normalizedDid) || null;

    if (!doc) {
      return {
        didDocument: null,
        didResolutionMetadata: {
          contentType: 'application/did+ld+json',
          retrievedAt: new Date().toISOString(),
          error: 'notFound',
          message: `DID '${normalizedDid}' not registered in EAORCS Sovereign Registry`
        },
        didDocumentMetadata: {
          deactivated: false
        }
      };
    }

    return {
      didDocument: doc,
      didResolutionMetadata: {
        contentType: 'application/did+ld+json',
        retrievedAt: new Date().toISOString(),
        error: null
      },
      didDocumentMetadata: {
        deactivated: !!doc.deactivated,
        versionId: '1',
        updated: doc.updated || doc.created
      }
    };
  }

  /**
   * Validates a W3C DID Document against structural and schema rules.
   * @param {Object} didDocument - DID document to validate.
   * @returns {Object} Validation verdict object.
   */
  validateDidDocument(didDocument) {
    const result = { valid: true, errors: [], warnings: [] };

    if (!didDocument || typeof didDocument !== 'object') {
      result.valid = false;
      result.errors.push('DID document must be an object');
      return result;
    }

    // Required fields per did-eaorcs-v1 schema
    if (!didDocument['@context']) {
      result.valid = false;
      result.errors.push("Missing required field '@context'");
    }

    if (!didDocument.id || typeof didDocument.id !== 'string') {
      result.valid = false;
      result.errors.push("Missing required field 'id'");
    } else if (!/^did:eaorcs:[a-zA-Z0-9._-]+$/.test(didDocument.id)) {
      result.valid = false;
      result.errors.push(`DID 'id' format invalid: ${didDocument.id}`);
    }

    if (!Array.isArray(didDocument.verificationMethod) || didDocument.verificationMethod.length === 0) {
      result.valid = false;
      result.errors.push("Missing or empty 'verificationMethod' array");
    } else {
      didDocument.verificationMethod.forEach((vm, idx) => {
        if (!vm.id || !vm.type || !vm.controller) {
          result.valid = false;
          result.errors.push(`verificationMethod[${idx}] missing required fields (id, type, controller)`);
        }
      });
    }

    if (!Array.isArray(didDocument.authentication)) {
      result.valid = false;
      result.errors.push("Missing required 'authentication' array");
    }

    if (!Array.isArray(didDocument.assertionMethod)) {
      result.valid = false;
      result.errors.push("Missing required 'assertionMethod' array");
    }

    if (!didDocument.created) {
      result.valid = false;
      result.errors.push("Missing required field 'created'");
    }

    return result;
  }

  // =========================================================================
  // 3. SCHEMA REGISTRY VERSION MATCHING & LOOKUP
  // =========================================================================

  /**
   * Matches a schema version query against registered schema versions.
   * @param {string} schemaId - Schema ID (e.g. 'osap-v1.1', 'did-eaorcs-v1').
   * @param {string} [versionQuery='latest'] - Version expression ('latest', '1.1.0', '^1.0.0', '~1.1.0', '1.x').
   * @returns {string|null} Best matching version string or null.
   */
  matchSchemaVersion(schemaId, versionQuery = 'latest') {
    const schemaEntry = this.registryEngine.schemas.get(schemaId);
    if (!schemaEntry) return null;

    const availableVersions = Array.from(schemaEntry.keys());
    if (availableVersions.length === 0) return null;

    if (versionQuery === 'latest' || versionQuery === '*' || !versionQuery) {
      return this._getHighestVersion(availableVersions);
    }

    // Exact match
    if (availableVersions.includes(versionQuery)) {
      return versionQuery;
    }

    // Caret matching: ^1.0.0 matches 1.x.x where major is equal
    if (versionQuery.startsWith('^')) {
      const target = versionQuery.slice(1);
      const [major] = target.split('.');
      const candidateMatches = availableVersions.filter(v => v.split('.')[0] === major);
      return this._getHighestVersion(candidateMatches);
    }

    // Tilde matching: ~1.1.0 matches 1.1.x where major and minor are equal
    if (versionQuery.startsWith('~')) {
      const target = versionQuery.slice(1);
      const [major, minor] = target.split('.');
      const candidateMatches = availableVersions.filter(v => {
        const parts = v.split('.');
        return parts[0] === major && parts[1] === minor;
      });
      return this._getHighestVersion(candidateMatches);
    }

    // Wildcard matching e.g. "1.x" or "1.X"
    if (versionQuery.includes('x') || versionQuery.includes('X')) {
      const prefix = versionQuery.split('.')[0];
      const candidateMatches = availableVersions.filter(v => v.split('.')[0] === prefix);
      return this._getHighestVersion(candidateMatches);
    }

    // Partial version e.g. "1.1"
    const candidateMatches = availableVersions.filter(v => v.startsWith(versionQuery));
    if (candidateMatches.length > 0) {
      return this._getHighestVersion(candidateMatches);
    }

    return null;
  }

  /**
   * Helper to retrieve highest semver string from an array.
   * @private
   */
  _getHighestVersion(versions) {
    if (!versions || versions.length === 0) return null;
    return versions.sort((a, b) => {
      const pa = a.split('.').map(n => parseInt(n, 10) || 0);
      const pb = b.split('.').map(n => parseInt(n, 10) || 0);
      for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
        const na = pa[i] || 0;
        const nb = pb[i] || 0;
        if (na !== nb) return nb - na;
      }
      return 0;
    })[0];
  }

  /**
   * Retrieves schema definition and metadata from the schema registry catalog.
   * @param {string} schemaId - Registered schema ID (e.g., 'osap-v1.1', 'did-eaorcs-v1').
   * @param {string} [versionQuery='latest'] - Version search criteria.
   * @returns {Object|null} Schema detail object or null if not found.
   */
  lookupSchema(schemaId, versionQuery = 'latest') {
    const matchedVersion = this.matchSchemaVersion(schemaId, versionQuery);
    if (!matchedVersion) return null;

    const schemaRecord = this.registryEngine.getSchema(schemaId, matchedVersion);
    if (!schemaRecord) return null;

    const catalogList = this.registryEngine.listSchemas();
    const meta = catalogList.find(s => s.id === schemaId && s.version === matchedVersion) || {};

    return {
      schemaId,
      version: matchedVersion,
      status: meta.status || schemaRecord.status || 'ACTIVE',
      file: meta.file || schemaRecord.file || null,
      schemaUri: meta.schemaUri || schemaRecord.schemaUri || null,
      category: meta.category || schemaRecord.category || 'GENERAL',
      schemaObj: schemaRecord.schema || schemaRecord
    };
  }

  /**
   * Validates a target data payload against a registered schema version.
   * @param {Object} data - Payload data object.
   * @param {string} schemaId - Target schema identifier.
   * @param {string} [versionQuery='latest'] - Version query.
   * @returns {Object} Validation verdict object.
   */
  validateAgainstSchema(data, schemaId, versionQuery = 'latest') {
    const schemaDetails = this.lookupSchema(schemaId, versionQuery);
    if (!schemaDetails) {
      return {
        valid: false,
        errors: [`Schema '${schemaId}' matching version '${versionQuery}' not found in registry`],
        schemaId,
        matchedVersion: null
      };
    }

    if (schemaId === 'osap-v1.1') {
      const res = this.validatePassport(data);
      return {
        valid: res.valid,
        errors: res.errors,
        schemaId,
        matchedVersion: schemaDetails.version
      };
    }

    if (schemaId === 'did-eaorcs-v1') {
      const res = this.validateDidDocument(data);
      return {
        valid: res.valid,
        errors: res.errors,
        schemaId,
        matchedVersion: schemaDetails.version
      };
    }

    // Generic JSON schema check against required properties if available
    const errors = [];
    const schema = schemaDetails.schemaObj;

    if (!data || typeof data !== 'object') {
      return {
        valid: false,
        errors: ['Target data payload must be a non-null object'],
        schemaId,
        matchedVersion: schemaDetails.version
      };
    }

    if (schema && Array.isArray(schema.required)) {
      for (const reqField of schema.required) {
        if (data[reqField] === undefined || data[reqField] === null) {
          errors.push(`Missing required field '${reqField}' defined in schema '${schemaId}'`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      schemaId,
      matchedVersion: schemaDetails.version
    };
  }

  /**
   * Lists all cataloged schemas in the registry with optional category filtering.
   * @param {string} [category] - Optional category filter.
   * @returns {Array<Object>} List of registered schema catalog items.
   */
  listRegisteredSchemas(category) {
    const list = this.registryEngine.listSchemas();
    if (!category) return list;
    return list.filter(item => item.category === category);
  }

  // =========================================================================
  // 4. SUITE EXECUTION & AUDIT REPORT GENERATION
  // =========================================================================

  /**
   * Executes a complete end-to-end conformance test suite run.
   * @param {Object} [inputs={}] Optional inputs for testing.
   * @returns {Object} Detailed audit report with metrics and conformance status.
   */
  runConformanceSuite(inputs = {}) {
    const report = {
      suiteName: 'EAORCS Phase 11 Stream 4 Standards & Interoperability Suite',
      executedAt: new Date().toISOString(),
      status: 'PASSED',
      metrics: {
        totalChecks: 0,
        passedChecks: 0,
        failedChecks: 0,
        osapConformancePct: 100,
        didResolutionPct: 100,
        schemaMatchingPct: 100
      },
      details: []
    };

    function recordCheck(category, checkName, passed, error = null) {
      report.metrics.totalChecks++;
      if (passed) {
        report.metrics.passedChecks++;
      } else {
        report.metrics.failedChecks++;
        report.status = 'FAILED';
      }
      report.details.push({ category, checkName, passed, error });
    }

    // 1. OSAP Passport Conformance Checks
    const passport = inputs.passport || this.generatePassport(
      { softwareId: 'eaorcs-core', name: 'EAORCS Core Platform', version: '2026.1.0-LTS', buildHash: crypto.randomBytes(32).toString('hex') },
      'did:eaorcs:node-primary-01'
    );
    const osapResult = this.validatePassport(passport);
    recordCheck('OSAP_CONFORMANCE', 'Passport Structure & Required Fields', osapResult.valid, osapResult.errors.join('; '));
    recordCheck('OSAP_CONFORMANCE', 'Passport Proof Signature Verification', osapResult.proofVerified, 'Proof signature mismatch');

    // 2. DID Creation and Resolution Checks
    const testDidDoc = this.createDidDocument('test-node-99');
    this.registerDidDocument(testDidDoc);
    const resolved = this.resolveDidDocument('test-node-99');
    recordCheck('DID_INTEROPERABILITY', 'W3C DID Document Validation', this.validateDidDocument(testDidDoc).valid);
    recordCheck('DID_INTEROPERABILITY', 'W3C DID Document Resolution', resolved.didDocument !== null && resolved.didResolutionMetadata.error === null);

    // 3. Schema Registry Version Matching Checks
    const matchedOSAP = this.matchSchemaVersion('osap-v1.1', '^1.0.0');
    recordCheck('SCHEMA_REGISTRY', 'Schema Version Matching (^1.0.0)', matchedOSAP === '1.1.0');
    const matchedDID = this.matchSchemaVersion('did-eaorcs-v1', '~1.0.0');
    recordCheck('SCHEMA_REGISTRY', 'Schema Version Matching (~1.0.0)', matchedDID === '1.0.0');

    // Compute metrics
    const total = report.metrics.totalChecks;
    const passed = report.metrics.passedChecks;
    const pct = total > 0 ? Math.round((passed / total) * 100) : 100;
    report.metrics.osapConformancePct = pct;
    report.metrics.didResolutionPct = pct;
    report.metrics.schemaMatchingPct = pct;

    return report;
  }
}

module.exports = OSAPConformanceSuite;
