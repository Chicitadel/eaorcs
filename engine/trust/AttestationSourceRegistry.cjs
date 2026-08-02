/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS External Attestation Source Registry
 * File           : AttestationSourceRegistry.cjs
 * Version        : 2026.1-LTS (v8.1 Continuous Trust)
 * Author         : Architectural Governance Council & Attestation Authority
 * Organization   : Air Roofers Platform Ecosystem / EAORCS
 * Created Date   : 2026-07-31
 * Last Modified  : 2026-07-31
 * Classification : ENTERPRISE | RESTRICTED
 ******************************************************************************/

class AttestationSourceRegistry {
    constructor() {
        this.sources = new Map();
        this.initializeDefaultSources();
    }

    initializeDefaultSources() {
        this.registerSource({
            id: 'src_internal_ci',
            type: 'Internal CI',
            name: 'Air Roofers Automated Build & Test Pipeline',
            trust_weight: 0.95,
            verification_method: 'Cryptographic Pipeline Signatures'
        });

        this.registerSource({
            id: 'src_independent_auditor',
            type: 'Independent Auditor',
            name: 'Enterprise Third-Party Security Audit Authority',
            trust_weight: 1.0,
            verification_method: 'ISO 27001 / SOC 2 Formal Attestation'
        });

        this.registerSource({
            id: 'src_customer_deployment',
            type: 'Customer Deployment',
            name: 'Production Tenant Runtime Telemetry',
            trust_weight: 0.90,
            verification_method: 'Telemetry Gateway Metrics'
        });

        this.registerSource({
            id: 'src_government_auditor',
            type: 'Government Auditor',
            name: 'EU Cybersecurity Compliance Body',
            trust_weight: 1.0,
            verification_method: 'Sovereignty & GDPR Seal Verification'
        });

        this.registerSource({
            id: 'src_certification_authority',
            type: 'Certification Authority',
            name: 'EAORCS Master Certification Body',
            trust_weight: 1.0,
            verification_method: 'Sovereign Ed25519 Root Key Signature'
        });
    }

    registerSource(source) {
        if (!source.id || !source.type || !source.name) {
            throw new Error('Invalid attestation source schema');
        }
        this.sources.set(source.id, {
            ...source,
            registered_at: new Date().toISOString()
        });
    }

    getSource(id) {
        return this.sources.get(id) || null;
    }

    listSources() {
        return Array.from(this.sources.values());
    }
}

module.exports = AttestationSourceRegistry;
