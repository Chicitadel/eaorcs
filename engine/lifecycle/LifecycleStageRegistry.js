/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Air Roofers Product Lifecycle Orchestration
 * File           : LifecycleStageRegistry.js
 * Version        : 2026.1-LTS (v1.0.0-FROZEN)
 * Author         : Air Roofers Architecture Authority / Ujomor Systems
 * Organization   : Air Roofers SASU / Chicitadel Platform Engineering
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Air Roofers Integration Guide Compliant
 * - ISO 27001 Audit Trail Standards
 * - Architecture Frozen (ADR-001)
 * - OSAP Passport Evidence Enabled
 ******************************************************************************/

class LifecycleStageRegistry {
    constructor() {
        this.stages = new Map();
        this._initializeDefaultStages();
    }

    _initializeDefaultStages() {
        const defaultStages = [
            {
                id: 'STAGE-01',
                name: 'Onboarding',
                description: 'Tenant registration and initial provisioning',
                preconditions: [],
                postconditions: ['tenant_id_assigned', 'workspace_created'],
                platformService: 'identity.airroofers.eu',
                rollbackHandler: 'deleteProvisioning',
                evidenceRequired: true
            },
            {
                id: 'STAGE-02',
                name: 'Identity',
                description: 'SSO provisioning and JWT claims configuration',
                preconditions: ['STAGE-01'],
                postconditions: ['sso_configured', 'jwt_claims_issued'],
                platformService: 'identity.airroofers.eu',
                rollbackHandler: 'revokeIdentityClaims',
                evidenceRequired: true
            },
            {
                id: 'STAGE-03',
                name: 'License',
                description: 'License issuance and validation via licensing service',
                preconditions: ['STAGE-02'],
                postconditions: ['license_issued', 'signature_verified'],
                platformService: 'licensing.airroofers.eu',
                rollbackHandler: 'revokeLicenseToken',
                evidenceRequired: true
            },
            {
                id: 'STAGE-04',
                name: 'Subscription',
                description: 'Plan selection via billing service',
                preconditions: ['STAGE-03'],
                postconditions: ['plan_selected', 'subscription_active'],
                platformService: 'billing.airroofers.eu',
                rollbackHandler: 'cancelSubscriptionDraft',
                evidenceRequired: true
            },
            {
                id: 'STAGE-05',
                name: 'Billing',
                description: 'Payment method setup and first invoice generation',
                preconditions: ['STAGE-04'],
                postconditions: ['payment_method_verified', 'initial_invoice_paid'],
                platformService: 'billing.airroofers.eu',
                rollbackHandler: 'voidInitialInvoice',
                evidenceRequired: true
            },
            {
                id: 'STAGE-06',
                name: 'Marketplace',
                description: 'Plugin and add-on pack activation',
                preconditions: ['STAGE-05'],
                postconditions: ['plugins_activated', 'marketplace_entitlements_bound'],
                platformService: 'marketplace.airroofers.eu',
                rollbackHandler: 'deactivatePlugins',
                evidenceRequired: true
            },
            {
                id: 'STAGE-07',
                name: 'Deployment',
                description: 'Over-The-Air (OTA) deployment via smart_deploy.sh',
                preconditions: ['STAGE-06'],
                postconditions: ['ota_deployment_completed', 'cluster_node_ready'],
                platformService: 'deploy.airroofers.eu',
                rollbackHandler: 'rollbackOtaDeployment',
                evidenceRequired: true
            },
            {
                id: 'STAGE-08',
                name: 'Telemetry',
                description: 'Health check registration and metric streaming setup',
                preconditions: ['STAGE-07'],
                postconditions: ['health_check_registered', 'metrics_stream_active'],
                platformService: 'telemetry.airroofers.eu',
                rollbackHandler: 'unregisterTelemetryStream',
                evidenceRequired: true
            },
            {
                id: 'STAGE-09',
                name: 'Support',
                description: 'Ticket channel activation and X-Correlation-ID tracing setup',
                preconditions: ['STAGE-08'],
                postconditions: ['support_channel_active', 'correlation_header_configured'],
                platformService: 'support.airroofers.eu',
                rollbackHandler: 'closeSupportChannel',
                evidenceRequired: true
            },
            {
                id: 'STAGE-10',
                name: 'Renewal',
                description: 'License renewal detection and automated evaluation',
                preconditions: ['STAGE-09'],
                postconditions: ['renewal_detected', 'license_extended'],
                platformService: 'licensing.airroofers.eu',
                rollbackHandler: 'revertLicenseExtension',
                evidenceRequired: true
            },
            {
                id: 'STAGE-11',
                name: 'Suspension',
                description: 'Account suspension on non-payment or administrative directive',
                preconditions: ['STAGE-05'],
                postconditions: ['account_suspended', 'access_restricted'],
                platformService: 'governance.airroofers.eu',
                rollbackHandler: 'unsuspendAccount',
                evidenceRequired: true
            },
            {
                id: 'STAGE-12',
                name: 'Revocation',
                description: 'License and access token revocation',
                preconditions: ['STAGE-11'],
                postconditions: ['license_revoked', 'tokens_invalidated'],
                platformService: 'licensing.airroofers.eu',
                rollbackHandler: 'restoreRevokedLicense',
                evidenceRequired: true
            },
            {
                id: 'STAGE-13',
                name: 'Retirement',
                description: 'Data export, tenant offboarding, and graceful shutdown',
                preconditions: ['STAGE-12'],
                postconditions: ['data_exported', 'tenant_decommissioned'],
                platformService: 'governance.airroofers.eu',
                rollbackHandler: 'abortRetirement',
                evidenceRequired: true
            },
            {
                id: 'STAGE-14',
                name: 'Evidence+OSAP',
                description: 'Evidence bundle creation and OSAP passport generation',
                preconditions: ['STAGE-13'],
                postconditions: ['evidence_bundle_packaged', 'osap_passport_issued'],
                platformService: 'osap.airroofers.eu',
                rollbackHandler: 'purgeEvidenceDraft',
                evidenceRequired: true
            }
        ];

        for (const stage of defaultStages) {
            this.registerStage(stage);
        }
    }

    registerStage(stage) {
        this.validateStageDefinition(stage);
        this.stages.set(stage.id, stage);
    }

    validateStageDefinition(stage) {
        if (!stage.id || typeof stage.id !== 'string') {
            throw new Error('Invalid stage: Missing or non-string "id"');
        }
        if (!stage.name || typeof stage.name !== 'string') {
            throw new Error(`Invalid stage ${stage.id}: Missing or non-string "name"`);
        }
        if (!stage.description || typeof stage.description !== 'string') {
            throw new Error(`Invalid stage ${stage.id}: Missing or non-string "description"`);
        }
        if (!Array.isArray(stage.preconditions)) {
            throw new Error(`Invalid stage ${stage.id}: "preconditions" must be an array`);
        }
        if (!Array.isArray(stage.postconditions)) {
            throw new Error(`Invalid stage ${stage.id}: "postconditions" must be an array`);
        }
        if (!stage.platformService || typeof stage.platformService !== 'string') {
            throw new Error(`Invalid stage ${stage.id}: Missing or non-string "platformService"`);
        }
        if (!stage.rollbackHandler || typeof stage.rollbackHandler !== 'string') {
            throw new Error(`Invalid stage ${stage.id}: Missing or non-string "rollbackHandler"`);
        }
    }

    getStage(stageId) {
        return this.stages.get(stageId) || null;
    }

    getAllStages() {
        return Array.from(this.stages.values());
    }

    getOrderedStages() {
        return this.getAllStages().sort((a, b) => {
            const numA = parseInt(a.id.replace('STAGE-', ''), 10);
            const numB = parseInt(b.id.replace('STAGE-', ''), 10);
            return numA - numB;
        });
    }

    getPreconditions(stageId) {
        const stage = this.getStage(stageId);
        return stage ? stage.preconditions : [];
    }

    validatePreconditions(stageId, completedStages = []) {
        const stage = this.getStage(stageId);
        if (!stage) {
            return { valid: false, missingPreconditions: [stageId], reason: `Stage ${stageId} not registered` };
        }

        const completedSet = new Set(completedStages);
        const missing = stage.preconditions.filter(preId => !completedSet.has(preId));

        return {
            valid: missing.length === 0,
            missingPreconditions: missing,
            reason: missing.length > 0 ? `Missing required preconditions: ${missing.join(', ')}` : null
        };
    }
}

module.exports = LifecycleStageRegistry;
