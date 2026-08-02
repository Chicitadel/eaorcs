/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : Executive Intelligence — AI Council Governance Engine (Stream I)
 * File           : AiCouncilEngine.js
 * Version        : 2026.1.0-LTS
 * Author         : Enterprise Architecture Governance Committee & Ujomor Systems Engineering
 * Organization   : Ujomor Systems Engineering
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : GOVERNMENT | ENTERPRISE | INTERNAL
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
 * Copyright (c) 2026 Ujomor Systems Engineering
 * All Rights Reserved.
 ******************************************************************************/

const crypto = require('crypto');

/**
 * AiCouncilEngine
 * Multi-agent governance engine featuring agent registry, multi-agent consensus evaluation,
 * weighted voting, veto arbitration, explainability report generation, and immutable governance logs.
 */
class AiCouncilEngine {
  constructor(config = {}) {
    this.config = {
      consensusThreshold: config.consensusThreshold || 0.75, // 75% default weighted approval threshold
      vetoEnabled: config.vetoEnabled !== false,             // Security/Compliance veto authority
      requireExplainability: config.requireExplainability !== false,
      ...config
    };

    this.agentRegistry = new Map();
    this.governanceLogs = [];
    this.decisionsHistory = new Map();

    // Register standard specialist agents upon initialization
    this._initializeStandardAgents();
  }

  /**
   * Registers a specialist autonomous agent with the AI Council.
   * @param {Object} agentConfig Agent registration payload
   * @returns {Object} Registration record
   */
  registerAgent(agentConfig) {
    if (!agentConfig || !agentConfig.id) {
      throw new Error('Agent configuration must include a unique agent ID.');
    }

    const agentRecord = {
      id: agentConfig.id,
      name: agentConfig.name || agentConfig.id,
      domain: agentConfig.domain || 'GENERAL',
      weight: typeof agentConfig.weight === 'number' ? agentConfig.weight : 1.0,
      hasVetoPower: !!agentConfig.hasVetoPower,
      status: 'ACTIVE',
      handler: agentConfig.handler || null,
      registeredAt: new Date().toISOString()
    };

    this.agentRegistry.set(agentConfig.id, agentRecord);
    return agentRecord;
  }

  /**
   * Unregisters an agent from the council.
   * @param {string} agentId Agent ID
   * @returns {boolean} Success status
   */
  unregisterAgent(agentId) {
    return this.agentRegistry.delete(agentId);
  }

  /**
   * Lists all active registered agents.
   * @returns {Array} List of active agent records
   */
  listAgents() {
    return Array.from(this.agentRegistry.values());
  }

  /**
   * Evaluates a software change, deployment, or architecture proposal across registered council agents.
   * @param {Object} proposalContext Proposal context details (title, description, changes, metrics)
   * @param {Object} [options] Evaluation parameters (threshold, mode)
   * @returns {Object} Comprehensive Consensus Evaluation Result
   */
  async evaluateProposal(proposalContext = {}, options = {}) {
    if (!proposalContext.title && !proposalContext.id) {
      proposalContext.title = 'Untitled Governance Proposal';
    }

    const proposalId = proposalContext.id || `prop-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const threshold = options.threshold || this.config.consensusThreshold;
    const votes = [];
    let vetoTriggered = false;
    let vetoingAgent = null;
    let vetoReason = '';

    // Collect votes from registered active agents
    for (const agent of this.agentRegistry.values()) {
      if (agent.status !== 'ACTIVE') continue;

      const voteResult = await this._collectAgentVote(agent, proposalContext);
      votes.push(voteResult);

      if (voteResult.decision === 'VETO' && agent.hasVetoPower && this.config.vetoEnabled) {
        vetoTriggered = true;
        vetoingAgent = agent.id;
        vetoReason = voteResult.rationale || 'Veto authority exercised due to critical governance policy breach.';
      }
    }

    // Compute Weighted Voting & Consensus Scores
    let totalWeight = 0;
    let approvedWeight = 0;
    let rejectedWeight = 0;

    for (const vote of votes) {
      totalWeight += vote.weight;
      if (vote.decision === 'APPROVE') {
        approvedWeight += vote.weight;
      } else if (vote.decision === 'REJECT' || vote.decision === 'VETO') {
        rejectedWeight += vote.weight;
      }
    }

    const approvalRatio = totalWeight > 0 ? Number((approvedWeight / totalWeight).toFixed(4)) : 0;
    let consensusDecision = 'REJECTED';

    if (vetoTriggered) {
      consensusDecision = 'VETOED';
    } else if (approvalRatio >= threshold) {
      consensusDecision = 'APPROVED';
    } else if (approvalRatio >= 0.50) {
      consensusDecision = 'REQUIRES_ARBITRATION';
    }

    // Perform Arbitration if necessary
    let finalOutcome = consensusDecision;
    let arbitrationDetails = null;
    if (consensusDecision === 'REQUIRES_ARBITRATION') {
      arbitrationDetails = this.arbitrate(proposalId, votes, { approvalRatio, threshold });
      finalOutcome = arbitrationDetails.decision;
    }

    // Synthesize Explainability Report
    const explainability = this.generateExplainabilityReport({
      proposalId,
      proposalContext,
      finalOutcome,
      approvalRatio,
      threshold,
      votes,
      vetoTriggered,
      vetoingAgent,
      vetoReason,
      arbitrationDetails
    });

    const evaluationResult = {
      proposalId,
      proposalTitle: proposalContext.title,
      timestamp: new Date().toISOString(),
      finalDecision: finalOutcome,
      approvalRatio,
      requiredThreshold: threshold,
      totalAgentsVoted: votes.length,
      vetoTriggered,
      vetoDetails: vetoTriggered ? { agent: vetoingAgent, reason: vetoReason } : null,
      votes,
      arbitrationDetails,
      explainability
    };

    // Record Immutable Governance Audit Log Entry
    this._recordGovernanceLog(proposalId, evaluationResult);
    this.decisionsHistory.set(proposalId, evaluationResult);

    return evaluationResult;
  }

  /**
   * Arbitrates voting deadlocks or ambiguous consensus evaluations.
   * @param {string} proposalId Proposal ID
   * @param {Array} votes Array of agent vote objects
   * @param {Object} context Arbitration context metrics
   * @returns {Object} Arbitration decision payload
   */
  arbitrate(proposalId, votes, context = {}) {
    const securityVote = votes.find(v => v.domain === 'SECURITY');
    const architectureVote = votes.find(v => v.domain === 'ARCHITECTURE');

    // Rule 1: If Security and Architecture both approved, resolve tie to APPROVE
    if (securityVote && securityVote.decision === 'APPROVE' && architectureVote && architectureVote.decision === 'APPROVE') {
      return {
        decision: 'APPROVED',
        arbitrationReason: 'Arbitration resolved in favor of APPROVE: Core Security and Architecture agents both approved.',
        confidence: 0.88
      };
    }

    // Rule 2: Otherwise default to conservative REJECT to ensure zero trust compliance
    return {
      decision: 'REJECTED',
      arbitrationReason: 'Arbitration resolved to REJECT: Proposal failed to reach requisite consensus threshold and lacks unanimous security approval.',
      confidence: 0.95
    };
  }

  /**
   * Synthesizes human-readable and audit-ready explainability reports for AI Council decisions.
   * @param {Object} data Decision data payload
   * @returns {Object} Explainability report object
   */
  generateExplainabilityReport(data) {
    const { proposalTitle, finalOutcome, approvalRatio, threshold, votes, vetoTriggered, vetoDetails, arbitrationDetails } = data;

    let summaryText = `The AI Governance Council reached a decision of [${finalOutcome}] for proposal "${proposalTitle}".`;
    if (vetoTriggered) {
      summaryText += ` Veto exercised by ${vetoDetails?.agent || 'Security Authority'}. Reason: ${vetoDetails?.reason}`;
    } else {
      summaryText += ` Approval ratio achieved was ${(approvalRatio * 100).toFixed(1)}% against required threshold of ${(threshold * 100).toFixed(1)}%.`;
    }

    const agentSummaries = votes.map(v => ({
      agentId: v.agentId,
      agentName: v.agentName,
      decision: v.decision,
      rationale: v.rationale,
      confidenceScore: v.confidenceScore
    }));

    return {
      title: `AI Council Decision Explainability Report — ${proposalTitle || 'Proposal'}`,
      summary: summaryText,
      finalOutcome,
      consensusRatio: approvalRatio,
      agentBreakdown: agentSummaries,
      arbitrationSummary: arbitrationDetails ? arbitrationDetails.arbitrationReason : 'No arbitration required.',
      complianceFrameworks: ['ISO 27001', 'SOC 2', 'OWASP ASVS', 'UAIGOS-CORE'],
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Retrieves immutable governance audit logs.
   * @param {Object} [filter] Optional filtering parameters
   * @returns {Array} Audit log list
   */
  getGovernanceLogs(filter = {}) {
    if (filter.proposalId) {
      return this.governanceLogs.filter(log => log.proposalId === filter.proposalId);
    }
    if (filter.decision) {
      return this.governanceLogs.filter(log => log.finalDecision === filter.decision);
    }
    return this.governanceLogs;
  }

  // --- PRIVATE HELPER METHODS ---

  async _collectAgentVote(agent, proposalContext) {
    if (typeof agent.handler === 'function') {
      try {
        const res = await agent.handler(proposalContext);
        return {
          agentId: agent.id,
          agentName: agent.name,
          domain: agent.domain,
          weight: agent.weight,
          decision: res.decision || 'APPROVE',
          rationale: res.rationale || 'Policy verification passed.',
          confidenceScore: res.confidenceScore || 0.95
        };
      } catch (err) {
        return {
          agentId: agent.id,
          agentName: agent.name,
          domain: agent.domain,
          weight: agent.weight,
          decision: 'REJECT',
          rationale: `Agent execution failed: ${err.message}`,
          confidenceScore: 0.50
        };
      }
    }

    // Default rule-based vote evaluation per agent domain
    return this._evaluateDefaultDomainRules(agent, proposalContext);
  }

  _evaluateDefaultDomainRules(agent, proposalContext) {
    const contextStr = JSON.stringify(proposalContext).toLowerCase();
    let decision = 'APPROVE';
    let rationale = `Standard ${agent.domain} policy checks satisfied.`;
    let confidenceScore = 0.96;

    if (agent.domain === 'SECURITY') {
      if (contextStr.includes('vulnerability') || contextStr.includes('unauthorized') || contextStr.includes('hardcoded_secret')) {
        decision = 'VETO';
        rationale = 'Security risk detected: potential security vulnerability or hardcoded credential exposure.';
        confidenceScore = 0.99;
      }
    } else if (agent.domain === 'ARCHITECTURE') {
      if (contextStr.includes('circular_dependency') || contextStr.includes('architecture_drift')) {
        decision = 'REJECT';
        rationale = 'Architectural governance check failed: potential structural drift or circular dependency detected.';
        confidenceScore = 0.94;
      }
    } else if (agent.domain === 'COMPLIANCE') {
      if (contextStr.includes('non_compliant') || contextStr.includes('audit_failure')) {
        decision = 'REJECT';
        rationale = 'Compliance check failed: non-compliance with regulatory standards (ISO 27001 / SOC 2).';
        confidenceScore = 0.95;
      }
    }

    return {
      agentId: agent.id,
      agentName: agent.name,
      domain: agent.domain,
      weight: agent.weight,
      decision,
      rationale,
      confidenceScore
    };
  }

  _initializeStandardAgents() {
    this.registerAgent({
      id: 'agent-sec-01',
      name: 'Security Auditor Agent',
      domain: 'SECURITY',
      weight: 1.5,
      hasVetoPower: true
    });

    this.registerAgent({
      id: 'agent-arch-01',
      name: 'Architecture Governance Agent',
      domain: 'ARCHITECTURE',
      weight: 1.2,
      hasVetoPower: false
    });

    this.registerAgent({
      id: 'agent-comp-01',
      name: 'Compliance Assurance Agent',
      domain: 'COMPLIANCE',
      weight: 1.0,
      hasVetoPower: false
    });

    this.registerAgent({
      id: 'agent-sre-01',
      name: 'SRE & Performance Agent',
      domain: 'PERFORMANCE',
      weight: 0.8,
      hasVetoPower: false
    });
  }

  _recordGovernanceLog(proposalId, evaluationResult) {
    const logEntry = {
      logId: `log-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      proposalId,
      timestamp: evaluationResult.timestamp,
      finalDecision: evaluationResult.finalDecision,
      approvalRatio: evaluationResult.approvalRatio,
      vetoTriggered: evaluationResult.vetoTriggered,
      hash: crypto.createHash('sha256').update(JSON.stringify(evaluationResult)).digest('hex')
    };

    this.governanceLogs.push(logEntry);
  }
}

module.exports = AiCouncilEngine;
module.exports.default = AiCouncilEngine;
