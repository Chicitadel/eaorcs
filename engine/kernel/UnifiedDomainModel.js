/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Kernel / Unified Domain Model
 * File           : UnifiedDomainModel.js
 * Version        : 2026.2.0-LTS
 * Author         : Enterprise Architecture & Security Engineering Authority
 * Organization   : Ujomor Systems
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : ENTERPRISE | GOVERNMENT
 *
 * Governance:
 * - Enterprise Governed
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 * - Compliance Audit Ready
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST SP 800-53
 *
 * Copyright (c) 2026 Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

/**
 * List of the 19 Canonical First-Class Domain Entities in EAORCS.
 */
const CANONICAL_ENTITIES = Object.freeze([
  'Project',
  'Repository',
  'Component',
  'Requirement',
  'Architecture',
  'Risk',
  'Evidence',
  'Finding',
  'Policy',
  'Control',
  'Deployment',
  'Certificate',
  'Person',
  'Organization',
  'Environment',
  'Asset',
  'AiModel',
  'Api',
  'Connector'
]);

/**
 * Base Domain Entity class providing validation, serialization, and relationship management.
 */
class DomainEntity {
  /**
   * @param {string} entityType Canonical Entity Type name
   * @param {Object} [properties={}] Entity properties
   * @param {Object} [options={}] Metadata and initial relationships
   */
  constructor(entityType, properties = {}, options = {}) {
    if (!CANONICAL_ENTITIES.includes(entityType)) {
      throw new Error(`[UnifiedDomainModel] Invalid entity type '${entityType}'. Must be one of the 19 canonical entities.`);
    }

    this.entityType = entityType;
    this.type = entityType;
    this.id = properties.id || `${entityType.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    this.properties = { ...properties, id: this.id };
    this.metadata = {
      createdAt: options.createdAt || new Date().toISOString(),
      updatedAt: options.updatedAt || new Date().toISOString(),
      version: options.version || 1,
      tags: options.tags || properties.tags || []
    };

    /** @type {Map<string, Object>} */
    this.relationships = new Map();

    if (options.relationships && Array.isArray(options.relationships)) {
      options.relationships.forEach((rel) => this.addRelationship(rel.relationType, rel.targetId, rel.targetType, rel.metadata));
    }
  }

  /**
   * Set entity property.
   * @param {string} key
   * @param {*} value
   */
  set(key, value) {
    this.properties[key] = value;
    this.metadata.updatedAt = new Date().toISOString();
  }

  /**
   * Get entity property.
   * @param {string} key
   * @returns {*}
   */
  get(key) {
    return this.properties[key];
  }

  /**
   * Add a relationship link to another entity.
   * @param {string} relationType E.g. 'BELONGS_TO', 'DEPENDS_ON', 'ENFORCES', 'CONTAINS'
   * @param {string|DomainEntity} target Target entity or target entity ID
   * @param {string} [targetType] Target entity canonical type if target is an ID
   * @param {Object} [metadata={}] Optional link metadata
   */
  addRelationship(relationType, target, targetType, metadata = {}) {
    const targetId = typeof target === 'object' ? target.id : target;
    const resolvedTargetType = typeof target === 'object' ? target.entityType : (targetType || 'Unknown');
    const relKey = `${relationType}:${targetId}`;

    const relObj = {
      relKey,
      relationType,
      sourceId: this.id,
      sourceType: this.entityType,
      targetId,
      targetType: resolvedTargetType,
      metadata: { ...metadata, linkedAt: new Date().toISOString() }
    };

    this.relationships.set(relKey, relObj);
    this.metadata.updatedAt = new Date().toISOString();
    return relObj;
  }

  /**
   * Remove a relationship link.
   * @param {string} relationType
   * @param {string} targetId
   */
  removeRelationship(relationType, targetId) {
    const relKey = `${relationType}:${targetId}`;
    return this.relationships.delete(relKey);
  }

  /**
   * Get list of all relationships.
   * @param {string} [relationTypeFilter] Optional filter by relation type
   * @returns {Array<Object>}
   */
  getRelationships(relationTypeFilter) {
    const rels = Array.from(this.relationships.values());
    if (relationTypeFilter) {
      return rels.filter((r) => r.relationType === relationTypeFilter);
    }
    return rels;
  }

  /**
   * Serialize entity to plain object.
   * @returns {Object}
   */
  toJSON() {
    return {
      entityType: this.entityType,
      type: this.type,
      id: this.id,
      properties: { ...this.properties },
      metadata: { ...this.metadata },
      relationships: Array.from(this.relationships.values())
    };
  }

  /**
   * Serialize entity to JSON string.
   * @returns {string}
   */
  serialize() {
    return JSON.stringify(this.toJSON());
  }

  /**
   * Reconstruct entity instance from plain object.
   * @param {Object} data
   * @returns {DomainEntity}
   */
  static fromJSON(data) {
    if (!data || !data.entityType) {
      throw new Error('[DomainEntity] Cannot deserialize entity without valid data and entityType.');
    }

    const instance = new DomainEntity(
      data.entityType,
      data.properties || {},
      {
        createdAt: data.metadata?.createdAt,
        updatedAt: data.metadata?.updatedAt,
        version: data.metadata?.version,
        tags: data.metadata?.tags,
        relationships: data.relationships
      }
    );
    instance.id = data.id || instance.id;
    return instance;
  }
}

/**
 * Unified Domain Model Container & Registry for EAORCS.
 */
class UnifiedDomainModel {
  constructor(options = {}) {
    /** @type {Map<string, DomainEntity>} */
    this.entities = new Map();
    
    /** @type {Map<string, Array<Object>>} */
    this.relationshipGraph = new Map();

    this.options = options;
  }

  /**
   * Get list of the 19 Canonical First-Class Domain Entity names.
   * @returns {Array<string>}
   */
  getCanonicalEntityTypes() {
    return [...CANONICAL_ENTITIES];
  }

  /**
   * Check if an entity type is canonical.
   * @param {string} type
   * @returns {boolean}
   */
  isCanonicalType(type) {
    return CANONICAL_ENTITIES.includes(type);
  }

  /**
   * Factory method to create, validate, and register a domain entity.
   * @param {string} entityType Canonical entity type name
   * @param {Object} [properties={}] Entity properties
   * @param {Object} [options={}] Creation options (e.g. store: false)
   * @returns {DomainEntity} Created entity instance
   */
  createEntity(entityType, properties = {}, options = {}) {
    if (!this.isCanonicalType(entityType)) {
      throw new Error(`[UnifiedDomainModel] Unknown or un-canonical entity type '${entityType}'.`);
    }

    const validation = this.validateEntity(entityType, properties);
    if (!validation.valid && options.strict) {
      throw new Error(`[UnifiedDomainModel] Entity validation failed: ${validation.errors.join(', ')}`);
    }

    const entity = new DomainEntity(entityType, properties, options);

    if (options.store !== false) {
      this.entities.set(entity.id, entity);
    }

    return entity;
  }

  /**
   * Validate entity properties against entity schema expectations.
   * @param {string|DomainEntity} entityTypeOrInstance
   * @param {Object} [properties]
   * @returns {{ valid: boolean, errors: Array<string> }}
   */
  validateEntity(entityTypeOrInstance, properties) {
    const errors = [];
    let entityType;
    let props;

    if (typeof entityTypeOrInstance === 'object' && entityTypeOrInstance !== null) {
      entityType = entityTypeOrInstance.entityType;
      props = entityTypeOrInstance.properties;
    } else {
      entityType = entityTypeOrInstance;
      props = properties || {};
    }

    if (!this.isCanonicalType(entityType)) {
      errors.push(`Invalid entity type '${entityType}'. Must be one of the 19 canonical entity types.`);
      return { valid: false, errors };
    }

    // Common field validations
    if (props.name && typeof props.name !== 'string') {
      errors.push("Property 'name' must be a string if provided.");
    }

    if (props.id && typeof props.id !== 'string') {
      errors.push("Property 'id' must be a string if provided.");
    }

    // Specialized entity type validations
    switch (entityType) {
      case 'Project':
        if (props.status && typeof props.status !== 'string') errors.push("Project 'status' must be a string.");
        break;
      case 'Repository':
        if (props.url && typeof props.url !== 'string') errors.push("Repository 'url' must be a string URL.");
        break;
      case 'Requirement':
        if (props.priority && typeof props.priority !== 'string' && typeof props.priority !== 'number') {
          errors.push("Requirement 'priority' must be a string or number.");
        }
        break;
      case 'Policy':
        if (props.rules && !Array.isArray(props.rules) && typeof props.rules !== 'object') {
          errors.push("Policy 'rules' must be an array or object.");
        }
        break;
      case 'AiModel':
        if (props.accuracy && typeof props.accuracy !== 'number') {
          errors.push("AiModel 'accuracy' should be a numeric score.");
        }
        break;
      default:
        break;
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Retrieve stored entity by ID.
   * @param {string} id
   * @returns {DomainEntity|null}
   */
  getEntity(id) {
    return this.entities.get(id) || null;
  }

  /**
   * Delete entity by ID.
   * @param {string} id
   * @returns {boolean}
   */
  deleteEntity(id) {
    this.relationshipGraph.delete(id);
    return this.entities.delete(id);
  }

  /**
   * Establish cross-entity relationship mapping.
   * @param {string|DomainEntity} source Source entity or source ID
   * @param {string} relationType E.g., 'DEPENDS_ON', 'OWNED_BY', 'PROTECTS', 'HOSTED_ON'
   * @param {string|DomainEntity} target Target entity or target ID
   * @param {Object} [metadata={}] Optional relationship attributes
   */
  mapRelationship(source, relationType, target, metadata = {}) {
    const sourceId = typeof source === 'object' ? source.id : source;
    const targetId = typeof target === 'object' ? target.id : target;

    const sourceEntity = this.entities.get(sourceId) || (typeof source === 'object' ? source : null);
    const targetEntity = this.entities.get(targetId) || (typeof target === 'object' ? target : null);

    if (sourceEntity) {
      sourceEntity.addRelationship(relationType, targetEntity || targetId, targetEntity?.entityType, metadata);
    }

    // Maintain global relationship graph index
    if (!this.relationshipGraph.has(sourceId)) {
      this.relationshipGraph.set(sourceId, []);
    }

    const relRecord = {
      relationType,
      sourceId,
      targetId,
      sourceType: sourceEntity?.entityType || 'Unknown',
      targetType: targetEntity?.entityType || 'Unknown',
      metadata,
      createdAt: new Date().toISOString()
    };

    this.relationshipGraph.get(sourceId).push(relRecord);
    return relRecord;
  }

  /**
   * Get related entities mapped from a source entity.
   * @param {string|DomainEntity} source Entity or Entity ID
   * @param {string} [relationType] Filter by relation type
   * @returns {Array<DomainEntity>}
   */
  getRelatedEntities(source, relationType) {
    const sourceId = typeof source === 'object' ? source.id : source;
    const sourceEntity = this.entities.get(sourceId);

    if (!sourceEntity) {
      return [];
    }

    const rels = sourceEntity.getRelationships(relationType);
    return rels
      .map((r) => this.entities.get(r.targetId))
      .filter((e) => e !== undefined && e !== null);
  }

  /**
   * Query entities by filter criteria or predicate function.
   * @param {Object|Function} criteria Criteria object ({ entityType, tags, predicate }) or function
   * @returns {Array<DomainEntity>}
   */
  queryEntities(criteria) {
    const all = Array.from(this.entities.values());

    if (typeof criteria === 'function') {
      return all.filter(criteria);
    }

    if (!criteria || typeof criteria !== 'object') {
      return all;
    }

    return all.filter((entity) => {
      if (criteria.entityType && entity.entityType !== criteria.entityType) {
        return false;
      }
      if (criteria.tags && Array.isArray(criteria.tags)) {
        const entityTags = entity.metadata.tags || [];
        const hasTag = criteria.tags.some((t) => entityTags.includes(t));
        if (!hasTag) return false;
      }
      if (criteria.predicate && typeof criteria.predicate === 'function') {
        if (!criteria.predicate(entity)) return false;
      }
      return true;
    });
  }

  /**
   * Serialize single entity.
   * @param {DomainEntity} entity
   * @returns {string}
   */
  serializeEntity(entity) {
    if (!entity || typeof entity.serialize !== 'function') {
      throw new Error('[UnifiedDomainModel] Invalid entity object for serialization.');
    }
    return entity.serialize();
  }

  /**
   * Deserialize data into a DomainEntity instance.
   * @param {string|Object} data
   * @returns {DomainEntity}
   */
  deserializeEntity(data) {
    const jsonObj = typeof data === 'string' ? JSON.parse(data) : data;
    const entity = DomainEntity.fromJSON(jsonObj);
    return entity;
  }

  /**
   * Export all registered entities and graph mappings to JSON model snapshot.
   * @returns {Object}
   */
  exportSnapshot() {
    return {
      version: '2026.2.0',
      exportedAt: new Date().toISOString(),
      entities: Array.from(this.entities.values()).map((e) => e.toJSON()),
      relationshipGraph: Array.from(this.relationshipGraph.entries()).map(([sourceId, rels]) => ({
        sourceId,
        relationships: rels
      }))
    };
  }

  /**
   * Import domain model snapshot.
   * @param {Object} snapshot
   */
  importSnapshot(snapshot) {
    if (!snapshot || !Array.isArray(snapshot.entities)) {
      throw new Error('[UnifiedDomainModel] Invalid snapshot format.');
    }

    snapshot.entities.forEach((eData) => {
      const entity = DomainEntity.fromJSON(eData);
      this.entities.set(entity.id, entity);
    });

    if (Array.isArray(snapshot.relationshipGraph)) {
      snapshot.relationshipGraph.forEach(({ sourceId, relationships }) => {
        if (Array.isArray(relationships)) {
          relationships.forEach((rel) => {
            this.mapRelationship(rel.sourceId, rel.relationType, rel.targetId, rel.metadata);
          });
        }
      });
    }
  }

  /**
   * Clear entity store and relationship graph.
   */
  clear() {
    this.entities.clear();
    this.relationshipGraph.clear();
  }
}

// Export Base Class, Constants, and Main Model
UnifiedDomainModel.DomainEntity = DomainEntity;
UnifiedDomainModel.CANONICAL_ENTITIES = CANONICAL_ENTITIES;
module.exports = UnifiedDomainModel;
