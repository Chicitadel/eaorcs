/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Standards Registry Engine (Stream 6)
 * File           : engine/spec/StandardsRegistryEngine.js
 * Version        : 2026.1-LTS (v1.0.0-FROZEN)
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
 * - OSAP v1.1 / v2.0
 * - OpenAPI 3.0.3
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

class StandardsRegistryEngine {
  /**
   * Initializes the Global Standards & Schema Registry Engine.
   * @param {Object} [options={}] Configuration options for registry path and schemas directory.
   */
  constructor(options = {}) {
    this.registryPath = options.registryPath || path.resolve(__dirname, '../../schemas/schema-registry.json');
    this.schemasDir = options.schemasDir || path.resolve(__dirname, '../../schemas');
    
    this.schemas = new Map(); // schemaId -> Map of version -> schemaObject
    this.didStore = new Map(); // did -> DID document
    this.catalogMeta = {
      registryVersion: '1.0.0',
      title: 'EAORCS Master Standards & Schema Registry Catalog',
      organization: 'Ujomor Systems & Enterprise Governance',
      lastUpdated: new Date().toISOString()
    };

    if (options.autoLoad !== false) {
      this.loadRegistry();
    }
  }

  /**
   * Loads the master schema catalog and registers disk schemas.
   * @param {string} [customPath] Optional override path for schema-registry.json.
   * @returns {number} Count of registered schemas.
   */
  loadRegistry(customPath) {
    const targetPath = customPath || this.registryPath;

    if (fs.existsSync(targetPath)) {
      try {
        const content = fs.readFileSync(targetPath, 'utf8');
        const catalog = JSON.parse(content);

        if (catalog.registryVersion) this.catalogMeta.registryVersion = catalog.registryVersion;
        if (catalog.title) this.catalogMeta.title = catalog.title;
        if (catalog.organization) this.catalogMeta.organization = catalog.organization;
        if (catalog.lastUpdated) this.catalogMeta.lastUpdated = catalog.lastUpdated;

        if (catalog.schemas && typeof catalog.schemas === 'object') {
          for (const [key, entry] of Object.entries(catalog.schemas)) {
            let schemaPayload = null;
            if (entry.file) {
              const schemaFilePath = path.resolve(this.schemasDir, entry.file);
              if (fs.existsSync(schemaFilePath)) {
                try {
                  schemaPayload = JSON.parse(fs.readFileSync(schemaFilePath, 'utf8'));
                } catch (e) {
                  // File exists but unparseable, continue with metadata
                }
              }
            }
            this.registerSchema(entry.id || key, schemaPayload, entry);
          }
        }
      } catch (err) {
        throw new Error(`Failed to parse schema registry file at ${targetPath}: ${err.message}`);
      }
    }

    // Auto-discover any additional schema files in schemasDir
    if (fs.existsSync(this.schemasDir)) {
      const files = fs.readdirSync(this.schemasDir);
      for (const file of files) {
        if ((file.endsWith('.json') || file.endsWith('.schema.json')) && file !== 'schema-registry.json') {
          const filePath = path.join(this.schemasDir, file);
          try {
            const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            const baseId = parsed.$id || file.replace(/(\.schema)?\.json$/, '');
            const version = parsed.version || (parsed.properties && parsed.properties.version && parsed.properties.version.const) || '1.0.0';
            
            if (!this.hasSchema(baseId, version)) {
              this.registerSchema(baseId, parsed, {
                id: baseId,
                name: parsed.title || file,
                version,
                status: 'ACTIVE',
                file,
                category: 'GENERAL'
              });
            }
          } catch (e) {
            // Ignore non-schema JSONs
          }
        }
      }
    }

    return this.schemas.size;
  }

  /**
   * Registers a schema in the registry catalog.
   * @param {string} id Schema ID or URI name (e.g. osap-v1.1, did-eaorcs-v1).
   * @param {Object|null} schemaObj JSON schema object payload.
   * @param {Object} [metadata={}] Schema catalog metadata (name, version, category, status, etc.).
   * @returns {Object} Registered schema record.
   */
  registerSchema(id, schemaObj, metadata = {}) {
    if (!id || typeof id !== 'string') {
      throw new Error('Schema registration requires a valid string ID');
    }

    const version = metadata.version || (schemaObj && schemaObj.version) || '1.0.0';
    const schemaRecord = {
      id,
      name: metadata.name || (schemaObj && schemaObj.title) || id,
      version,
      status: metadata.status || 'ACTIVE',
      file: metadata.file || null,
      schemaUri: metadata.schemaUri || (schemaObj && schemaObj.$id) || `https://eaorcs.ujomor.org/schemas/${id}.json`,
      category: metadata.category || 'GENERAL',
      description: metadata.description || (schemaObj && schemaObj.description) || '',
      schema: schemaObj || null,
      registeredAt: new Date().toISOString()
    };

    if (!this.schemas.has(id)) {
      this.schemas.set(id, new Map());
    }

    const versionMap = this.schemas.get(id);
    versionMap.set(version, schemaRecord);

    return schemaRecord;
  }

  /**
   * Checks if a schema with given ID and version exists.
   * @param {string} id Schema ID or URI.
   * @param {string} [version='latest'] Target version string.
   * @returns {boolean}
   */
  hasSchema(id, version = 'latest') {
    return this.getSchema(id, version) !== null;
  }

  /**
   * Resolves a target version string to the exact available version.
   * @param {string} id Schema ID.
   * @param {string} [versionReq='latest'] Version requirement string ('latest', '1.x', '^1.0.0', exact).
   * @returns {string|null} Resolved version string or null.
   */
  resolveVersion(id, versionReq = 'latest') {
    if (!this.schemas.has(id)) {
      // Check if ID matches an existing $id or file name in catalog
      for (const [key, vMap] of this.schemas.entries()) {
        for (const [ver, rec] of vMap.entries()) {
          if (rec.schemaUri === id || rec.file === id) {
            return this.resolveVersion(key, versionReq);
          }
        }
      }
      return null;
    }

    const versionMap = this.schemas.get(id);
    const availableVersions = Array.from(versionMap.keys());

    if (availableVersions.length === 0) return null;

    if (versionReq === 'latest') {
      return availableVersions.sort(this._compareSemVer).pop();
    }

    if (versionMap.has(versionReq)) {
      return versionReq;
    }

    // Prefix/Major resolution e.g. "1.x" or "1.1" -> "1.1.0"
    const majorPrefix = versionReq.replace(/\.x$/, '').replace(/^\^/, '');
    const matched = availableVersions.filter(v => v.startsWith(majorPrefix));
    if (matched.length > 0) {
      return matched.sort(this._compareSemVer).pop();
    }

    return null;
  }

  /**
   * Retrieves a registered schema definition by ID and version.
   * @param {string} id Schema ID, alias, or URI.
   * @param {string} [version='latest'] Version or version selector.
   * @returns {Object|null} Schema record or null if not found.
   */
  getSchema(id, version = 'latest') {
    let resolvedId = id;
    if (!this.schemas.has(resolvedId)) {
      for (const [key, vMap] of this.schemas.entries()) {
        for (const [ver, rec] of vMap.entries()) {
          if (rec.schemaUri === id || rec.file === id) {
            resolvedId = key;
            break;
          }
        }
      }
    }

    if (!this.schemas.has(resolvedId)) return null;

    const resolvedVer = this.resolveVersion(resolvedId, version);
    if (!resolvedVer) return null;

    return this.schemas.get(resolvedId).get(resolvedVer);
  }

  /**
   * Returns a list of all cataloged schema metadata entries.
   * @param {Object} [filter={}] Optional filters (category, status, query).
   * @returns {Array<Object>} List of schema records.
   */
  listSchemas(filter = {}) {
    const list = [];
    for (const [id, versionMap] of this.schemas.entries()) {
      for (const [version, rec] of versionMap.entries()) {
        if (filter.category && rec.category !== filter.category) continue;
        if (filter.status && rec.status !== filter.status) continue;
        if (filter.query) {
          const q = filter.query.toLowerCase();
          const match = rec.id.toLowerCase().includes(q) ||
                        rec.name.toLowerCase().includes(q) ||
                        rec.description.toLowerCase().includes(q);
          if (!match) continue;
        }
        list.push({
          id: rec.id,
          name: rec.name,
          version: rec.version,
          status: rec.status,
          category: rec.category,
          schemaUri: rec.schemaUri,
          description: rec.description,
          file: rec.file,
          hasPayload: rec.schema !== null
        });
      }
    }
    return list;
  }

  /**
   * Registers a W3C Decentralized Identifier (DID) document.
   * @param {Object} didDocument Valid W3C DID document.
   * @returns {Object} Validation result and registration status.
   */
  registerDidDocument(didDocument) {
    const validation = this.validateDidDocument(didDocument);
    if (!validation.valid) {
      throw new Error(`Invalid W3C DID Document: ${validation.errors.join('; ')}`);
    }

    this.didStore.set(didDocument.id, didDocument);
    return { registered: true, id: didDocument.id, didDocument };
  }

  /**
   * Resolves a W3C Decentralized Identifier (DID) URI to its DID Document.
   * @param {string} didUri Target DID URI (e.g. did:eaorcs:node-primary).
   * @returns {Object|null} W3C DID Document.
   */
  resolveDidDocument(didUri) {
    if (!didUri || typeof didUri !== 'string') {
      throw new Error('Invalid DID URI provided for resolution');
    }

    if (this.didStore.has(didUri)) {
      return this.didStore.get(didUri);
    }

    // Dynamic resolution for standard did:eaorcs:* nodes
    if (didUri.startsWith('did:eaorcs:')) {
      const nodeId = didUri.replace('did:eaorcs:', '');
      const keyHash = crypto.createHash('sha256').update(didUri).digest('hex').substring(0, 44);
      
      const generatedDoc = {
        '@context': [
          'https://www.w3.org/ns/did/v1',
          'https://w3id.org/security/suites/ed25519-2020/v1'
        ],
        id: didUri,
        verificationMethod: [
          {
            id: `${didUri}#key-1`,
            type: 'Ed25519VerificationKey2020',
            controller: didUri,
            publicKeyMultibase: `z6M${keyHash}`
          }
        ],
        authentication: [`${didUri}#key-1`],
        assertionMethod: [`${didUri}#key-1`],
        service: [
          {
            id: `${didUri}#governance-service`,
            type: 'EAORCSGovernanceNode',
            serviceEndpoint: 'https://eaorcs.ujomor.org/api/v1/governance'
          }
        ]
      };

      this.didStore.set(didUri, generatedDoc);
      return generatedDoc;
    }

    return null;
  }

  /**
   * Validates a W3C DID document object against specification rules.
   * @param {Object} didDocument Object to validate.
   * @returns {{ valid: boolean, errors: string[], warnings: string[], didDocument: Object }}
   */
  validateDidDocument(didDocument) {
    const errors = [];
    const warnings = [];

    if (!didDocument || typeof didDocument !== 'object') {
      return { valid: false, errors: ['DID Document must be a non-null object'], warnings: [], didDocument: null };
    }

    // 1. Validate @context
    if (!didDocument['@context']) {
      errors.push('DID Document is missing required "@context" property');
    } else {
      const ctx = didDocument['@context'];
      const hasW3cCtx = typeof ctx === 'string'
        ? ctx === 'https://www.w3.org/ns/did/v1'
        : Array.isArray(ctx) && ctx.includes('https://www.w3.org/ns/did/v1');
      if (!hasW3cCtx) {
        errors.push('"@context" must include "https://www.w3.org/ns/did/v1"');
      }
    }

    // 2. Validate id
    if (!didDocument.id || typeof didDocument.id !== 'string') {
      errors.push('DID Document is missing required "id" property');
    } else {
      const didPattern = /^did:[a-z0-9]+:[a-zA-Z0-9._-]+$/;
      if (!didPattern.test(didDocument.id)) {
        errors.push(`DID "id" string "${didDocument.id}" does not conform to standard W3C DID format (did:<method>:<id>)`);
      }
    }

    // 3. Validate verificationMethod
    if (didDocument.verificationMethod !== undefined) {
      if (!Array.isArray(didDocument.verificationMethod)) {
        errors.push('"verificationMethod" must be an array');
      } else {
        didDocument.verificationMethod.forEach((vm, idx) => {
          if (!vm.id || typeof vm.id !== 'string') {
            errors.push(`verificationMethod[${idx}] missing required "id"`);
          }
          if (!vm.type || typeof vm.type !== 'string') {
            errors.push(`verificationMethod[${idx}] missing required "type"`);
          }
          if (!vm.controller || typeof vm.controller !== 'string') {
            errors.push(`verificationMethod[${idx}] missing required "controller"`);
          }
          const hasKeyMaterial = vm.publicKeyJwk || vm.publicKeyMultibase || vm.publicKeyPem || vm.publicKeyBase58;
          if (!hasKeyMaterial) {
            errors.push(`verificationMethod[${idx}] must contain a public key specification (publicKeyJwk, publicKeyMultibase, publicKeyPem, etc.)`);
          }
        });
      }
    } else {
      warnings.push('DID Document contains no verificationMethod entries');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      didDocument
    };
  }

  /**
   * Validates an Open Software Assurance Passport (OSAP) object.
   * @param {Object} passport Passport payload to validate.
   * @param {string} [targetVersion='1.1'] Target OSAP version ('1.1' or '2.0').
   * @returns {{ valid: boolean, errors: string[], warnings: string[], passportId: string, version: string, trustScore: number, trustLevel: string }}
   */
  validateOsapPassport(passport, targetVersion = '1.1') {
    const errors = [];
    const warnings = [];

    if (!passport || typeof passport !== 'object') {
      return {
        valid: false,
        errors: ['OSAP passport must be a non-null object'],
        warnings: [],
        passportId: null,
        version: targetVersion,
        trustScore: 0,
        trustLevel: 'INVALID'
      };
    }

    // Handle v1.1 vs v2.0 property naming variants
    const passportId = passport.passportId || passport.passport_id;
    const version = passport.version || passport.schema_version || targetVersion;
    const issuer = passport.issuer;
    const subject = passport.subject;
    const issuedAt = passport.issuedAt || passport.issue_timestamp;

    // 1. Passport ID
    if (!passportId || typeof passportId !== 'string') {
      errors.push('OSAP passport is missing required passportId / passport_id');
    }

    // 2. Issuer
    if (!issuer) {
      errors.push('OSAP passport is missing required issuer');
    } else if (typeof issuer === 'string') {
      if (!/^did:[a-z0-9]+:[a-zA-Z0-9._-]+$/.test(issuer) && !issuer.startsWith('authority:')) {
        warnings.push('Issuer string should ideally be a valid W3C DID URI or authority string');
      }
    } else if (typeof issuer === 'object') {
      if (!issuer.organization && !issuer.authority) {
        errors.push('Issuer object must specify organization or authority');
      }
    }

    // 3. Subject Metadata
    if (!subject || typeof subject !== 'object') {
      errors.push('OSAP passport is missing required subject metadata object');
    } else {
      const softwareId = subject.softwareId || subject.product_id;
      const swVersion = subject.version;
      const buildHash = subject.buildHash || subject.commit_sha;

      if (!softwareId) errors.push('Subject metadata missing softwareId / product_id');
      if (!swVersion) errors.push('Subject metadata missing version');
      if (!buildHash) errors.push('Subject metadata missing buildHash / commit_sha');
    }

    // 4. Issue Timestamp
    if (!issuedAt) {
      errors.push('OSAP passport missing issuedAt / issue_timestamp');
    } else if (isNaN(Date.parse(issuedAt))) {
      errors.push('issuedAt / issue_timestamp must be a valid ISO 8601 UTC date string');
    }

    // Calculate trust score based on evidence completeness
    let trustScore = 70.0;
    if (errors.length === 0) {
      if (passport.proof || (issuer && issuer.digital_signature)) trustScore += 15.0;
      if (passport.evidenceLineage || passport.evidence_lineage) trustScore += 10.0;
      if (passport.assuranceLevel || (passport.trust_summary && passport.trust_summary.trust_score)) trustScore += 5.0;
    } else {
      trustScore = 0.0;
    }

    let trustLevel = 'INVALID';
    if (trustScore >= 95.0) trustLevel = 'GOLD';
    else if (trustScore >= 85.0) trustLevel = 'SILVER';
    else if (trustScore >= 70.0) trustLevel = 'BRONZE';

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      passportId: passportId || 'UNKNOWN',
      version,
      trustScore: Math.min(trustScore, 100.0),
      trustLevel
    };
  }

  /**
   * Generates and exports an OpenAPI 3.0.3 Specification for Standards Registry APIs.
   * @param {Object} [options={}] Custom title or version overrides.
   * @returns {Object} OpenAPI 3.0.3 specification object.
   */
  exportOpenApiSpec(options = {}) {
    return {
      openapi: '3.0.3',
      info: {
        title: options.title || 'EAORCS Global Standards & Schema Registry API',
        version: options.version || '2026.1.0-LTS',
        description: 'RESTful API specification for schema version lookup, W3C DID document resolution, OSAP passport validation, and OpenAPI 3.0 export.',
        contact: {
          name: 'Ujomor Systems Engineering & Governance Authority',
          url: 'https://eaorcs.ujomor.org/governance',
          email: 'governance@ujomor.org'
        },
        license: {
          name: 'Enterprise Governance Restricted License'
        }
      },
      servers: [
        {
          url: 'https://eaorcs.ujomor.org/api/v1/standards',
          description: 'Production EAORCS Sovereign Governance Node'
        },
        {
          url: 'http://localhost:8080/api/v1/standards',
          description: 'Local Development Registry Node'
        }
      ],
      paths: {
        '/schemas': {
          get: {
            summary: 'List all registered schemas in catalog',
            operationId: 'listSchemas',
            parameters: [
              { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Filter by schema category' },
              { name: 'status', in: 'query', schema: { type: 'string' }, description: 'Filter by status (FROZEN, ACTIVE)' },
              { name: 'query', in: 'query', schema: { type: 'string' }, description: 'Search term for name/id' }
            ],
            responses: {
              '200': {
                description: 'List of cataloged schema metadata records',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/SchemaCatalogEntry' }
                    }
                  }
                }
              }
            }
          },
          post: {
            summary: 'Register a new schema definition',
            operationId: 'registerSchema',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/RegisterSchemaRequest' }
                }
              }
            },
            responses: {
              '201': {
                description: 'Schema successfully registered',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/SchemaCatalogEntry' }
                  }
                }
              }
            }
          }
        },
        '/schemas/{id}': {
          get: {
            summary: 'Get registered schema by ID and version',
            operationId: 'getSchemaById',
            parameters: [
              { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Schema ID (e.g. osap-v1.1)' },
              { name: 'version', in: 'query', required: false, schema: { type: 'string', default: 'latest' }, description: 'Version requirement string' }
            ],
            responses: {
              '200': {
                description: 'Detailed schema record and payload',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/SchemaRecord' }
                  }
                }
              },
              '404': {
                description: 'Schema not found'
              }
            }
          }
        },
        '/did/resolve/{did}': {
          get: {
            summary: 'Resolve W3C DID Document',
            operationId: 'resolveDid',
            parameters: [
              { name: 'did', in: 'path', required: true, schema: { type: 'string' }, description: 'W3C DID URI string' }
            ],
            responses: {
              '200': {
                description: 'Resolved W3C DID Document',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/W3CDIDDocument' }
                  }
                }
              },
              '404': {
                description: 'DID resolution failed'
              }
            }
          }
        },
        '/did/validate': {
          post: {
            summary: 'Validate W3C DID Document format',
            operationId: 'validateDid',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/W3CDIDDocument' }
                }
              }
            },
            responses: {
              '200': {
                description: 'DID Validation outcome',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ValidationResult' }
                  }
                }
              }
            }
          }
        },
        '/osap/validate': {
          post: {
            summary: 'Validate OSAP Passport Payload',
            operationId: 'validateOsap',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { type: 'object' }
                }
              }
            },
            responses: {
              '200': {
                description: 'OSAP Passport Validation outcome',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/OsapValidationResult' }
                  }
                }
              }
            }
          }
        },
        '/export/openapi': {
          get: {
            summary: 'Export EAORCS Standards Registry OpenAPI 3.0 Spec',
            operationId: 'exportOpenApi',
            responses: {
              '200': {
                description: 'OpenAPI 3.0.3 Specification payload',
                content: {
                  'application/json': {
                    schema: { type: 'object' }
                  }
                }
              }
            }
          }
        }
      },
      components: {
        schemas: {
          SchemaCatalogEntry: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              version: { type: 'string' },
              status: { type: 'string' },
              category: { type: 'string' },
              schemaUri: { type: 'string' },
              description: { type: 'string' }
            }
          },
          RegisterSchemaRequest: {
            type: 'object',
            required: ['id', 'schema'],
            properties: {
              id: { type: 'string' },
              version: { type: 'string' },
              name: { type: 'string' },
              category: { type: 'string' },
              schema: { type: 'object' }
            }
          },
          SchemaRecord: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              version: { type: 'string' },
              status: { type: 'string' },
              schemaUri: { type: 'string' },
              schema: { type: 'object' }
            }
          },
          W3CDIDDocument: {
            type: 'object',
            required: ['@context', 'id'],
            properties: {
              '@context': { oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }] },
              id: { type: 'string' },
              verificationMethod: { type: 'array', items: { type: 'object' } },
              authentication: { type: 'array', items: { type: 'string' } }
            }
          },
          ValidationResult: {
            type: 'object',
            properties: {
              valid: { type: 'boolean' },
              errors: { type: 'array', items: { type: 'string' } },
              warnings: { type: 'array', items: { type: 'string' } }
            }
          },
          OsapValidationResult: {
            type: 'object',
            properties: {
              valid: { type: 'boolean' },
              errors: { type: 'array', items: { type: 'string' } },
              passportId: { type: 'string' },
              version: { type: 'string' },
              trustScore: { type: 'number' },
              trustLevel: { type: 'string' }
            }
          }
        }
      }
    };
  }

  /**
   * Helper comparator for semantic version strings.
   * @private
   */
  _compareSemVer(v1, v2) {
    const p1 = String(v1).split('.').map(n => parseInt(n, 10) || 0);
    const p2 = String(v2).split('.').map(n => parseInt(n, 10) || 0);
    for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
      const n1 = p1[i] || 0;
      const n2 = p2[i] || 0;
      if (n1 > n2) return 1;
      if (n1 < n2) return -1;
    }
    return 0;
  }
}

module.exports = StandardsRegistryEngine;
