/******************************************************************************
 * Project        : Air Roofers Platform Ecosystem
 * Module         : Global Product Registry & Packaging Configurator
 * File           : engine/packaging/AirRoofersProductRegistry.js
 * Version        : 2026.3.0-LTS
 * Author         : Enterprise Architecture & Security Governance Board
 * Organization   : Air Roofers Governance Directorate
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
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
 * Copyright (c) 2026 Air Roofers Governance Directorate
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

/**
 * Registry defining supported Air Roofers products, editions, capabilities, and distribution constraints.
 */
class AirRoofersProductRegistry {
  static get products() {
    return {
      EAORCS: {
        id: 'EAORCS',
        name: 'Enterprise Autonomous Operational Readiness & Certification System',
        code: 'eaorcs',
        defaultEdition: 'Enterprise',
        supportedEditions: ['Community', 'Professional', 'Enterprise', 'Sovereign'],
        capabilities: ['cap.governance.core', 'cap.audit.gate', 'cap.passport.dual', 'cap.policy.engine'],
        prohibitedPatterns: ['/engine', '/kernel', '/governance', '/tests', '/specifications', '/blueprints', '*.map', '*.test.js']
      },
      CiviScore: {
        id: 'CiviScore',
        name: 'Civic Infrastructure Integrity & Trust Scoring Engine',
        code: 'civiscore',
        defaultEdition: 'Enterprise',
        supportedEditions: ['Community', 'Professional', 'Enterprise', 'Sovereign'],
        capabilities: ['cap.trust.scoring', 'cap.civic.ledger', 'cap.audit.gate'],
        prohibitedPatterns: ['/engine', '/kernel', '/tests', '*.map', '*.test.js']
      },
      Affiantor: {
        id: 'Affiantor',
        name: 'Autonomous Legal Affidavits & Evidence Provenance Platform',
        code: 'affiantor',
        defaultEdition: 'Enterprise',
        supportedEditions: ['Professional', 'Enterprise', 'Sovereign'],
        capabilities: ['cap.evidence.provenance', 'cap.legal.attestation', 'cap.audit.gate'],
        prohibitedPatterns: ['/engine', '/kernel', '/tests', '*.map', '*.test.js']
      },
      Mandatag: {
        id: 'Mandatag',
        name: 'Regulatory Mandate Tracking & Compliance Tagging Engine',
        code: 'mandatag',
        defaultEdition: 'Professional',
        supportedEditions: ['Community', 'Professional', 'Enterprise'],
        capabilities: ['cap.mandate.tagging', 'cap.compliance.tracker'],
        prohibitedPatterns: ['/engine', '/kernel', '/tests', '*.map', '*.test.js']
      },
      AeroBill: {
        id: 'AeroBill',
        name: 'Commercial Aviation & Tariff Billing Engine',
        code: 'aerobill',
        defaultEdition: 'Enterprise',
        supportedEditions: ['Professional', 'Enterprise', 'Sovereign'],
        capabilities: ['cap.billing.tariff', 'cap.aviation.audit'],
        prohibitedPatterns: ['/engine', '/kernel', '/tests', '*.map', '*.test.js']
      },
      GovInsight: {
        id: 'GovInsight',
        name: 'Governmental Policy Analytics & Performance Intelligence',
        code: 'govinsight',
        defaultEdition: 'Sovereign',
        supportedEditions: ['Enterprise', 'Sovereign'],
        capabilities: ['cap.gov.analytics', 'cap.policy.intelligence'],
        prohibitedPatterns: ['/engine', '/kernel', '/tests', '*.map', '*.test.js']
      },
      NaijaGovOS: {
        id: 'NaijaGovOS',
        name: 'Federated National Public Sector Governance Operating System',
        code: 'naijagovos',
        defaultEdition: 'Sovereign',
        supportedEditions: ['Sovereign'],
        capabilities: ['cap.national.govos', 'cap.federated.sovereign'],
        prohibitedPatterns: ['/engine', '/kernel', '/tests', '*.map', '*.test.js']
      }
    };
  }

  static getProduct(productId) {
    const product = this.products[productId];
    if (!product) {
      throw new Error(`AirRoofersProductRegistry: Unsupported or unregistered product '${productId}'`);
    }
    return product;
  }

  static validateEdition(productId, edition) {
    const product = this.getProduct(productId);
    if (!product.supportedEditions.includes(edition)) {
      throw new Error(`AirRoofersProductRegistry: Product '${productId}' does not support edition '${edition}'. Supported: ${product.supportedEditions.join(', ')}`);
    }
    return true;
  }
}

module.exports = AirRoofersProductRegistry;
