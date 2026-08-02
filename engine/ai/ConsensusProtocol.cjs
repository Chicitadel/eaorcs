/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System
 * Module         : EAORCS / AI Engine
 * File           : ConsensusProtocol.cjs
 * Version        : 1.0.0
 * Author         : Human Engineering Team
 * Organization   : Ujomor
 * Created Date   : 2026-07-31
 * Last Modified  : 2026-07-31
 * Classification : GOVERNMENT | ENTERPRISE | INTERNAL
 *
 * Governance:
 * - AI Governed
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
 * Copyright (c) 2026 Ujomor
 * All Rights Reserved.
 ******************************************************************************/

class ConsensusProtocol {
    constructor(threshold = 0.7) {
        this.threshold = threshold;
    }

    calculateConsensus(votes) {
        let totalWeight = 0;
        let approvalWeight = 0;
        const rejections = [];
        const approvals = [];

        for (const vote of votes) {
            totalWeight += vote.weight;
            if (vote.approval) {
                approvalWeight += vote.weight;
                approvals.push(vote);
            } else {
                rejections.push(vote);
            }
        }

        const consensusRatio = totalWeight === 0 ? 0 : approvalWeight / totalWeight;
        const reachedConsensus = consensusRatio >= this.threshold;

        return {
            reachedConsensus,
            consensusRatio,
            totalWeight,
            approvalWeight,
            approvals: approvals.map(a => a.agent),
            rejections: rejections.map(r => r.agent),
            feedback: rejections.map(r => r.feedback)
        };
    }
}

module.exports = ConsensusProtocol;
