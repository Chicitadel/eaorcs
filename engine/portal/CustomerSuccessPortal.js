/******************************************************************************
 * Project        : Enterprise Autonomous Operational Readiness & Certification System (EAORCS)
 * Module         : Customer Success Portal Engine
 * File           : CustomerSuccessPortal.js
 * Version        : 2026.3.0-RC1
 * Author         : Customer Outcomes & Enterprise Lifecycle Authority
 * Organization   : Air Roofers Platform Ecosystem & Ujomor Systems
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Architecture Authority Approved — ENHANCEMENT (Foundation-Locked)
 * - Focuses on long-term customer adoption and renewal health outcomes
 *
 * Copyright (c) 2026 Air Roofers Platform Ecosystem & Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const crypto = require('crypto');

/**
 * CustomerSuccessPortal
 *
 * Dedicated workspace for tracking customer onboarding journeys, feature adoption,
 * training progress, composite health scores, and renewal indicators.
 */
class CustomerSuccessPortal {
  constructor(options = {}) {
    this.options = options;
    this._journeys = new Map(); // tenantId -> Journey record
  }

  /**
   * Registers a customer's onboarding & success journey.
   */
  registerTenantJourney(tenantId, edition, startDate = new Date().toISOString()) {
    if (!tenantId) throw new Error('CustomerSuccessPortal: tenantId is required.');

    const record = {
      tenantId,
      edition: (edition || 'ENTERPRISE').toUpperCase(),
      startDate,
      milestones: {
        accountActivated: true,
        repositoryConnected: false,
        firstTrustScoreGenerated: false,
        firstSBOMGenerated: false,
        firstPolicyScanCompleted: false,
        administratorTrained: false,
        executiveDashboardViewed: false,
        firstReportExported: false,
      },
      adoptionMetrics: {
        activeUsers: 1,
        activePersonas: ['ADMIN'],
        scanFrequencyWeekly: 1,
        marketplacePacksInstalled: 0,
        customPoliciesDefined: 0,
      },
      healthScore: 50, // Base initial score
      lastActivityAt: startDate,
    };

    this._journeys.set(tenantId, record);
    return { ...record };
  }

  /**
   * Records completion of a success milestone.
   */
  recordMilestone(tenantId, milestoneName) {
    const journey = this._getJourney(tenantId);
    if (!(milestoneName in journey.milestones)) {
      throw new Error(`CustomerSuccessPortal: Unknown milestone '${milestoneName}'.`);
    }

    journey.milestones[milestoneName] = true;
    journey.lastActivityAt = new Date().toISOString();
    journey.healthScore = this.recalculateHealthScore(tenantId);
    return { tenantId, milestone: milestoneName, completed: true, newHealthScore: journey.healthScore };
  }

  /**
   * Updates usage adoption metrics.
   */
  updateAdoptionMetrics(tenantId, metrics = {}) {
    const journey = this._getJourney(tenantId);
    journey.adoptionMetrics = { ...journey.adoptionMetrics, ...metrics };
    journey.lastActivityAt = new Date().toISOString();
    journey.healthScore = this.recalculateHealthScore(tenantId);
    return { tenantId, adoptionMetrics: journey.adoptionMetrics, newHealthScore: journey.healthScore };
  }

  /**
   * Recalculates composite health score (0 - 100).
   */
  recalculateHealthScore(tenantId) {
    const journey = this._getJourney(tenantId);
    const m = journey.milestones;
    const a = journey.adoptionMetrics;

    const completedMilestones = Object.values(m).filter(Boolean).length;
    const totalMilestones = Object.keys(m).length;
    const milestoneScore = Math.round((completedMilestones / totalMilestones) * 50); // Up to 50 pts

    const userScore = Math.min(20, (a.activeUsers || 1) * 4); // Up to 20 pts
    const scanScore = Math.min(15, (a.scanFrequencyWeekly || 1) * 3); // Up to 15 pts
    const featureScore = Math.min(15, (a.marketplacePacksInstalled || 0) * 5 + (a.customPoliciesDefined || 0) * 5); // Up to 15 pts

    const totalScore = Math.min(100, milestoneScore + userScore + scanScore + featureScore);
    journey.healthScore = totalScore;
    return totalScore;
  }

  /**
   * Returns indicators regarding renewal likelihood.
   */
  getRenewalIndicators(tenantId) {
    const journey = this._getJourney(tenantId);
    const score = journey.healthScore;

    let riskLevel = 'LOW';
    let recommendation = 'Account is healthy. Highlight new marketplace packs and advanced features.';

    if (score < 50) {
      riskLevel = 'HIGH';
      recommendation = 'Schedule immediate Customer Success intervention and administrator training.';
    } else if (score < 75) {
      riskLevel = 'MEDIUM';
      recommendation = 'Encourage executive dashboard adoption and quarterly governance review.';
    }

    return {
      tenantId,
      healthScore: score,
      renewalRisk: riskLevel,
      recommendation,
      milestonesCompleted: `${Object.values(journey.milestones).filter(Boolean).length}/${Object.keys(journey.milestones).length}`,
      lastActivityAt: journey.lastActivityAt,
    };
  }

  getSuccessDashboard(tenantId) {
    const journey = this._getJourney(tenantId);
    const renewal = this.getRenewalIndicators(tenantId);

    return {
      tenantId: journey.tenantId,
      edition: journey.edition,
      startDate: journey.startDate,
      healthScore: journey.healthScore,
      milestones: journey.milestones,
      adoptionMetrics: journey.adoptionMetrics,
      renewalStatus: renewal,
    };
  }

  getEngineStatus() {
    return { initialized: true, trackedJourneys: this._journeys.size };
  }

  _getJourney(tenantId) {
    const j = this._journeys.get(tenantId);
    if (!j) throw new Error(`CustomerSuccessPortal: Journey for tenant '${tenantId}' not found.`);
    return j;
  }
}

module.exports = CustomerSuccessPortal;
module.exports.CustomerSuccessPortal = CustomerSuccessPortal;
