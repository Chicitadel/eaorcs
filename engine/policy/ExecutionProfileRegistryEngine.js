/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Execution Policy Profile Registry Architecture
 * File           : ExecutionProfileRegistryEngine.js
 * Version        : 2026.3.0-LTS
 * Author         : Ujomor Systems & Enterprise Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-07
 * Last Modified  : 2026-08-07
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
 *
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

class ExecutionProfileRegistryEngine {
    constructor(options = {}) {
        this.options = options;
        this.presets = new Map();
        this._initializeDefaultPresets();
    }

    _initializeDefaultPresets() {
        // 1. Conservative Preset
        this.registerPreset('Conservative', {
            description: 'Maximum manual control; asks developer approval for all plan, generate, modify, package, and release stages.',
            stages: {
                OBSERVE: 'AUTO',
                RECOMMEND: 'AUTO',
                PLAN: 'ASK',
                GENERATE: 'ASK',
                MODIFY: 'ASK',
                PACKAGE: 'ASK',
                RELEASE: 'ASK'
            }
        });

        // 2. Balanced Preset (Default for commercial teams)
        this.registerPreset('Balanced', {
            description: 'Balanced developer experience; planning and recommendations are automatic, file modifications and release require consent.',
            stages: {
                OBSERVE: 'AUTO',
                RECOMMEND: 'AUTO',
                PLAN: 'AUTO',
                GENERATE: 'ASK',
                MODIFY: 'ASK',
                PACKAGE: 'ASK',
                RELEASE: 'ASK'
            }
        });

        // 3. Autonomous Preset (Agentic environments)
        this.registerPreset('Autonomous', {
            description: 'Fully autonomous execution; automatically generates and modifies code/tests. Release controlled by policy.',
            stages: {
                OBSERVE: 'AUTO',
                RECOMMEND: 'AUTO',
                PLAN: 'AUTO',
                GENERATE: 'AUTO',
                MODIFY: 'AUTO',
                PACKAGE: 'AUTO',
                RELEASE: 'ASK'
            }
        });

        // 4. CI_CD Pipeline Preset
        this.registerPreset('CI_CD', {
            description: 'Non-interactive automated pipeline execution for CI/CD runners.',
            stages: {
                OBSERVE: 'AUTO',
                RECOMMEND: 'AUTO',
                PLAN: 'AUTO',
                GENERATE: 'AUTO',
                MODIFY: 'AUTO',
                PACKAGE: 'AUTO',
                RELEASE: 'AUTO'
            }
        });

        // 5. Review_Only Preset
        this.registerPreset('Review_Only', {
            description: 'Passive observation & advisory reviews only; prohibits modifications or releases.',
            stages: {
                OBSERVE: 'AUTO',
                RECOMMEND: 'AUTO',
                PLAN: 'DISABLED',
                GENERATE: 'DISABLED',
                MODIFY: 'DISABLED',
                PACKAGE: 'DISABLED',
                RELEASE: 'DISABLED'
            }
        });
    }

    registerPreset(name, profileData) {
        if (!name || typeof name !== 'string') {
            throw new Error('Invalid preset name');
        }
        this.presets.set(name, profileData);
    }

    getPreset(name) {
        return this.presets.get(name) || this.presets.get('Balanced');
    }

    listPresets() {
        const list = [];
        for (const [name, data] of this.presets.entries()) {
            list.push({ name, description: data.description, stages: data.stages });
        }
        return list;
    }
}

module.exports = ExecutionProfileRegistryEngine;
