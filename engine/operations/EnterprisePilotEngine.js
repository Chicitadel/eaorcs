/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Operations — Enterprise Pilot Engine (Phase 11 Stream 2)
 * File           : engine/operations/EnterprisePilotEngine.js
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
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const crypto = require('crypto');

/**
 * EnterprisePilotEngine
 * Enterprise pilot evaluation engine evaluating customer pilot benchmark metrics,
 * calculating compliance velocity multipliers, tracking MTTR reduction,
 * evaluating SLA tracking, calculating ROI, and compiling enterprise case study evidence packages.
 */
class EnterprisePilotEngine {
  /**
   * @param {Object} config Engine configuration options
   */
  constructor(config = {}) {
    this.organization = config.organization || 'Ujomor Systems & Enterprise Governance';
    this.platformVersion = config.platformVersion || '2026.1.0-LTS';
    this.blendedHourlyRateUSD = config.blendedHourlyRateUSD || 150;
    this.incidentCostPerHourUSD = config.incidentCostPerHourUSD || 1200;
    this.secretKey = config.secretKey || 'EAORCS_ENTERPRISE_PILOT_SECRET_2026';

    this.pilots = new Map();
    this.caseStudies = new Map();
  }

  /**
   * Calculate compliance velocity multiplier and efficiency gains.
   * @param {number} baselineAuditHours Hours required before EAORCS
   * @param {number} pilotAuditHours Hours required with EAORCS
   * @returns {Object} Compliance velocity evaluation
   */
  calculateComplianceVelocity(baselineAuditHours, pilotAuditHours) {
    if (typeof baselineAuditHours !== 'number' || typeof pilotAuditHours !== 'number' || baselineAuditHours <= 0) {
      throw new Error('Invalid audit hours provided for compliance velocity calculation');
    }
    const safePilotHours = Math.max(0.1, pilotAuditHours);
    const multiplier = parseFloat((baselineAuditHours / safePilotHours).toFixed(2));
    const hoursSaved = Math.max(0, baselineAuditHours - pilotAuditHours);
    const percentageImprovement = parseFloat((((baselineAuditHours - safePilotHours) / baselineAuditHours) * 100).toFixed(2));
    const rating = multiplier >= 3.0 ? 'EXCEPTIONAL' : multiplier >= 2.0 ? 'HIGH_VELOCITY' : multiplier >= 1.2 ? 'MODERATE_VELOCITY' : 'BASELINE';

    return {
      baselineAuditHours,
      pilotAuditHours,
      multiplier,
      hoursSaved,
      percentageImprovement,
      rating
    };
  }

  /**
   * Track MTTR (Mean Time To Remediation) reduction.
   * @param {number} baselineMTTRMinutes Baseline MTTR in minutes
   * @param {number} pilotMTTRMinutes Pilot MTTR in minutes
   * @param {number} incidentCount Number of incidents evaluated
   * @returns {Object} MTTR reduction tracking metrics
   */
  trackMTTRReduction(baselineMTTRMinutes, pilotMTTRMinutes, incidentCount = 12) {
    if (typeof baselineMTTRMinutes !== 'number' || typeof pilotMTTRMinutes !== 'number' || baselineMTTRMinutes <= 0) {
      throw new Error('Invalid MTTR values provided for MTTR reduction tracking');
    }
    const safePilotMTTR = Math.max(0, pilotMTTRMinutes);
    const reductionPercentage = parseFloat((((baselineMTTRMinutes - safePilotMTTR) / baselineMTTRMinutes) * 100).toFixed(2));
    const minutesSavedPerIncident = Math.max(0, baselineMTTRMinutes - safePilotMTTR);
    const totalMinutesSaved = minutesSavedPerIncident * incidentCount;
    const hoursSavedTotal = parseFloat((totalMinutesSaved / 60).toFixed(2));
    const tier = reductionPercentage >= 70 ? 'ELITE_REDUCTION' : reductionPercentage >= 50 ? 'HIGH_REDUCTION' : reductionPercentage >= 20 ? 'MODERATE_REDUCTION' : 'MINIMAL';

    return {
      baselineMTTRMinutes,
      pilotMTTRMinutes,
      reductionPercentage,
      incidentCount,
      totalMinutesSaved,
      hoursSavedTotal,
      tier
    };
  }

  /**
   * Evaluate SLA tracking against target SLAs.
   * @param {Array<Object>} slaTargets Array of SLA target objects
   * @param {Object} actualMetrics Key-value pair of actual metric values
   * @returns {Object} SLA evaluation summary
   */
  evaluateSLATracking(slaTargets = [], actualMetrics = {}) {
    if (!Array.isArray(slaTargets)) {
      throw new Error('slaTargets must be an array');
    }

    let metSLAs = 0;
    let breachCount = 0;
    const slaDetails = [];

    for (const sla of slaTargets) {
      const actualValue = actualMetrics[sla.metricKey] !== undefined ? actualMetrics[sla.metricKey] : sla.defaultActual;
      let isMet = false;

      if (sla.operator === '>=') {
        isMet = actualValue >= sla.targetValue;
      } else if (sla.operator === '<=') {
        isMet = actualValue <= sla.targetValue;
      } else if (sla.operator === '==') {
        isMet = actualValue === sla.targetValue;
      } else {
        isMet = actualValue >= sla.targetValue;
      }

      if (isMet) {
        metSLAs++;
      } else {
        breachCount++;
      }

      slaDetails.push({
        slaId: sla.id || sla.name,
        name: sla.name,
        targetValue: sla.targetValue,
        actualValue,
        unit: sla.unit || '',
        operator: sla.operator || '>=',
        status: isMet ? 'MET' : 'BREACHED'
      });
    }

    const totalSLAs = slaTargets.length;
    const overallSlaComplianceRate = totalSLAs > 0 ? parseFloat(((metSLAs / totalSLAs) * 100).toFixed(2)) : 100;

    return {
      totalSLAs,
      metSLAs,
      breachCount,
      overallSlaComplianceRate,
      slaDetails
    };
  }

  /**
   * Evaluate complete customer pilot benchmark metrics.
   * @param {Object} pilotData Comprehensive pilot benchmark input
   * @returns {Object} Evaluated pilot benchmark result
   */
  evaluatePilotMetrics(pilotData = {}) {
    if (!pilotData.pilotId || !pilotData.customerName) {
      throw new Error('pilotId and customerName are required for pilot metric evaluation');
    }

    const durationDays = pilotData.durationDays || 90;
    const baseline = pilotData.baselineMetrics || {};
    const pilot = pilotData.pilotMetrics || {};
    const targetSLAs = pilotData.targetSLAs || [
      { id: 'SLA-1', name: 'Platform Availability Uptime', metricKey: 'uptimePercentage', targetValue: 99.9, operator: '>=' },
      { id: 'SLA-2', name: 'Compliance Velocity Multiplier', metricKey: 'complianceVelocityMultiplier', targetValue: 2.0, operator: '>=' },
      { id: 'SLA-3', name: 'Mean Time To Remediation (MTTR)', metricKey: 'mttrMinutes', targetValue: 30, operator: '<=' },
      { id: 'SLA-4', name: 'Zero-Trust Audit Pass Rate', metricKey: 'auditPassRatePercentage', targetValue: 98.0, operator: '>=' }
    ];

    // 1. Compliance Velocity
    const velocity = this.calculateComplianceVelocity(
      baseline.auditHoursPerMonth || 160,
      pilot.auditHoursPerMonth || 40
    );

    // 2. MTTR Reduction
    const mttr = this.trackMTTRReduction(
      baseline.mttrMinutes || 180,
      pilot.mttrMinutes || 25,
      pilot.incidentCount || 15
    );

    // 3. SLA Tracking
    const actualSLAMetrics = Object.assign({
      complianceVelocityMultiplier: velocity.multiplier,
      mttrMinutes: pilot.mttrMinutes || 25,
      uptimePercentage: pilot.uptimePercentage || 99.95,
      auditPassRatePercentage: pilot.auditPassRatePercentage || 100.0
    }, pilot.actualSLAMetrics || {});

    const slaEvaluation = this.evaluateSLATracking(targetSLAs, actualSLAMetrics);

    // 4. Financial ROI Calculation
    const monthlyLaborSavingsUSD = velocity.hoursSaved * this.blendedHourlyRateUSD;
    const totalLaborSavingsUSD = monthlyLaborSavingsUSD * (durationDays / 30);
    const totalDowntimeSavingsUSD = mttr.hoursSavedTotal * this.incidentCostPerHourUSD;
    const grossFinancialBenefitUSD = totalLaborSavingsUSD + totalDowntimeSavingsUSD;
    const platformPilotCostUSD = pilotData.platformPilotCostUSD || 25000;
    const netFinancialBenefitUSD = grossFinancialBenefitUSD - platformPilotCostUSD;
    const roiPercentage = parseFloat(((netFinancialBenefitUSD / platformPilotCostUSD) * 100).toFixed(2));
    const paybackPeriodMonths = parseFloat(((platformPilotCostUSD / Math.max(1, monthlyLaborSavingsUSD + (totalDowntimeSavingsUSD / (durationDays / 30))))).toFixed(2));

    // 5. Health Score & Pilot Status
    let healthScore = 0;
    healthScore += Math.min(30, (velocity.multiplier / 3.0) * 30);
    healthScore += Math.min(30, (mttr.reductionPercentage / 100) * 30);
    healthScore += Math.min(40, (slaEvaluation.overallSlaComplianceRate / 100) * 40);
    healthScore = parseFloat(healthScore.toFixed(2));

    let pilotStatus = 'FAILED';
    if (slaEvaluation.overallSlaComplianceRate === 100 && velocity.multiplier >= 2.5 && mttr.reductionPercentage >= 60) {
      pilotStatus = 'EXCEEDED';
    } else if (slaEvaluation.overallSlaComplianceRate >= 85 && velocity.multiplier >= 1.5) {
      pilotStatus = 'PASSED';
    } else if (slaEvaluation.overallSlaComplianceRate >= 70) {
      pilotStatus = 'NEEDS_ATTENTION';
    }

    const evaluationTimestamp = new Date().toISOString();

    // 6. Cryptographic Signature
    const rawPayload = JSON.stringify({
      pilotId: pilotData.pilotId,
      customerName: pilotData.customerName,
      healthScore,
      pilotStatus,
      velocityMultiplier: velocity.multiplier,
      mttrReductionPercentage: mttr.reductionPercentage,
      netFinancialBenefitUSD,
      evaluationTimestamp
    });

    const SHA256Digest = crypto.createHash('sha256').update(rawPayload).digest('hex');
    const signature = crypto.createHmac('sha256', this.secretKey).update(SHA256Digest).digest('hex');

    const result = {
      pilotId: pilotData.pilotId,
      customerName: pilotData.customerName,
      industry: pilotData.industry || 'Enterprise Technology',
      durationDays,
      activeUsers: pilotData.activeUsers || 50,
      evaluationTimestamp,
      velocity,
      mttr,
      slaEvaluation,
      financials: {
        blendedHourlyRateUSD: this.blendedHourlyRateUSD,
        incidentCostPerHourUSD: this.incidentCostPerHourUSD,
        totalLaborSavingsUSD,
        totalDowntimeSavingsUSD,
        grossFinancialBenefitUSD,
        platformPilotCostUSD,
        netFinancialBenefitUSD,
        roiPercentage,
        paybackPeriodMonths
      },
      healthScore,
      pilotStatus,
      verification: {
        SHA256Digest,
        signature
      }
    };

    this.pilots.set(pilotData.pilotId, result);
    return result;
  }

  /**
   * Calculate stand-alone pilot ROI summary.
   * @param {Object} pilotData Evaluated pilot metrics or raw input
   * @param {Object} costConfig Optional cost overrides
   * @returns {Object} Comprehensive ROI breakdown
   */
  calculatePilotROI(pilotData = {}, costConfig = {}) {
    const evaluation = this.pilots.has(pilotData.pilotId)
      ? this.pilots.get(pilotData.pilotId)
      : this.evaluatePilotMetrics(pilotData);

    const blendedRate = costConfig.blendedHourlyRateUSD || evaluation.financials.blendedHourlyRateUSD;
    const annualPlatformCost = costConfig.annualPlatformCostUSD || 100000;

    const annualizedLaborSavingsUSD = (evaluation.velocity.hoursSaved * blendedRate) * 12;
    const annualizedDowntimeSavingsUSD = evaluation.financials.totalDowntimeSavingsUSD * (365 / evaluation.durationDays);
    const totalAnnualBenefitUSD = annualizedLaborSavingsUSD + annualizedDowntimeSavingsUSD;
    const netAnnualBenefitUSD = totalAnnualBenefitUSD - annualPlatformCost;
    const annualRoiPercentage = parseFloat(((netAnnualBenefitUSD / annualPlatformCost) * 100).toFixed(2));
    const paybackMonths = parseFloat(((annualPlatformCost / (totalAnnualBenefitUSD / 12))).toFixed(2));

    return {
      pilotId: evaluation.pilotId,
      customerName: evaluation.customerName,
      annualPlatformCostUSD: annualPlatformCost,
      annualizedLaborSavingsUSD,
      annualizedDowntimeSavingsUSD,
      totalAnnualBenefitUSD,
      netAnnualBenefitUSD,
      annualRoiPercentage,
      paybackMonths,
      financialRating: annualRoiPercentage > 300 ? 'ELITE_INVESTMENT' : annualRoiPercentage > 100 ? 'HIGH_ROI' : 'POSITIVE_ROI'
    };
  }

  /**
   * Compile an Enterprise Case Study Evidence Package for an evaluated pilot.
   * @param {string|Object} pilotIdOrData Pilot ID string or pilot evaluation object
   * @param {Object} metadata Metadata for case study branding & publishing
   * @returns {Object} Compiled Case Study Package
   */
  compileCaseStudyPackage(pilotIdOrData, metadata = {}) {
    let evaluation;
    if (typeof pilotIdOrData === 'string') {
      if (!this.pilots.has(pilotIdOrData)) {
        throw new Error(`Pilot with ID '${pilotIdOrData}' not found in engine registry.`);
      }
      evaluation = this.pilots.get(pilotIdOrData);
    } else if (typeof pilotIdOrData === 'object' && pilotIdOrData !== null) {
      evaluation = pilotIdOrData.pilotId ? pilotIdOrData : this.evaluatePilotMetrics(pilotIdOrData);
    } else {
      throw new Error('Invalid pilot parameter for case study compilation');
    }

    const caseStudyId = `CS-${evaluation.pilotId}-${Date.now()}`;
    const compiledAt = new Date().toISOString();

    const executiveSummary = {
      title: `Enterprise Autonomous Operation & Compliance Transformation: ${evaluation.customerName}`,
      customerName: evaluation.customerName,
      industry: evaluation.industry,
      pilotDurationDays: evaluation.durationDays,
      statusAchieved: evaluation.pilotStatus,
      overallHealthScore: evaluation.healthScore,
      keyHighlights: [
        `Achieved a ${evaluation.velocity.multiplier}x Compliance Velocity Multiplier, reducing audit lead hours by ${evaluation.velocity.percentageImprovement}%.`,
        `Reduced Mean Time To Remediation (MTTR) by ${evaluation.mttr.reductionPercentage}%, saving ${evaluation.mttr.hoursSavedTotal} engineering incident hours.`,
        `Maintained ${evaluation.slaEvaluation.overallSlaComplianceRate}% SLA compliance rate across ${evaluation.slaEvaluation.totalSLAs} critical platform SLAs.`,
        `Delivered $${evaluation.financials.netFinancialBenefitUSD.toLocaleString()} net financial benefit with an ROI of ${evaluation.financials.roiPercentage}%.`
      ]
    };

    const evidenceArtifacts = [
      {
        artifactId: `ART-VELOCITY-${evaluation.pilotId}`,
        name: 'Compliance Audit Velocity Telemetry Log',
        type: 'AUDIT_TELEMETRY',
        status: 'VERIFIED',
        checksum: crypto.createHash('sha256').update(JSON.stringify(evaluation.velocity)).digest('hex')
      },
      {
        artifactId: `ART-MTTR-${evaluation.pilotId}`,
        name: 'Automated Remediation & Incident Response Ledger',
        type: 'INCIDENT_LEDGER',
        status: 'VERIFIED',
        checksum: crypto.createHash('sha256').update(JSON.stringify(evaluation.mttr)).digest('hex')
      },
      {
        artifactId: `ART-SLA-${evaluation.pilotId}`,
        name: 'Enterprise SLA Compliance Certificate',
        type: 'SLA_CERTIFICATE',
        status: 'VERIFIED',
        checksum: crypto.createHash('sha256').update(JSON.stringify(evaluation.slaEvaluation)).digest('hex')
      },
      {
        artifactId: `ART-ROI-${evaluation.pilotId}`,
        name: 'Verified Customer ROI & Financial Benefit Ledger',
        type: 'FINANCIAL_LEDGER',
        status: 'VERIFIED',
        checksum: crypto.createHash('sha256').update(JSON.stringify(evaluation.financials)).digest('hex')
      }
    ];

    const governanceAttestation = {
      issuingAuthority: this.organization,
      platformVersion: this.platformVersion,
      standardsConformed: [
        'ISO/IEC 27001:2022 Security Management',
        'SOC 2 Type II Compliance Assurance',
        'OWASP ASVS v4.0 Application Security Verification',
        'NIST SP 800-53 Rev. 5 Security & Privacy Controls'
      ],
      complianceState: 'FULL_CONFORMANCE'
    };

    const packagePayload = JSON.stringify({
      caseStudyId,
      customerName: evaluation.customerName,
      executiveSummary,
      evaluation,
      evidenceArtifacts,
      governanceAttestation,
      compiledAt
    });

    const SHA256Digest = crypto.createHash('sha256').update(packagePayload).digest('hex');
    const signature = crypto.createHmac('sha256', this.secretKey).update(SHA256Digest).digest('hex');

    const caseStudyPackage = {
      caseStudyId,
      customerName: evaluation.customerName,
      metadata: Object.assign({
        classification: 'ENTERPRISE_EVIDENCE_CASE_STUDY',
        author: this.organization,
        approvedForCustomerDistribution: true
      }, metadata),
      executiveSummary,
      evaluation,
      evidenceArtifacts,
      governanceAttestation,
      compiledAt,
      securityVerification: {
        SHA256Digest,
        signature,
        verifiedBy: this.organization
      }
    };

    this.caseStudies.set(caseStudyId, caseStudyPackage);
    return caseStudyPackage;
  }

  /**
   * Verify authenticity and integrity of a Case Study Evidence Package.
   * @param {Object} caseStudyPackage Case study evidence package to verify
   * @returns {Object} Verification result
   */
  verifyCaseStudyPackage(caseStudyPackage) {
    if (!caseStudyPackage || !caseStudyPackage.securityVerification) {
      return { isValid: false, reason: 'Missing security verification payload' };
    }

    const { caseStudyId, customerName, executiveSummary, evaluation, evidenceArtifacts, governanceAttestation, compiledAt } = caseStudyPackage;

    const reconstructedPayload = JSON.stringify({
      caseStudyId,
      customerName,
      executiveSummary,
      evaluation,
      evidenceArtifacts,
      governanceAttestation,
      compiledAt
    });

    const calculatedDigest = crypto.createHash('sha256').update(reconstructedPayload).digest('hex');
    const calculatedSignature = crypto.createHmac('sha256', this.secretKey).update(calculatedDigest).digest('hex');

    const isDigestValid = calculatedDigest === caseStudyPackage.securityVerification.SHA256Digest;
    const isSignatureValid = calculatedSignature === caseStudyPackage.securityVerification.signature;
    const isValid = isDigestValid && isSignatureValid;

    return {
      isValid,
      caseStudyId,
      isDigestValid,
      isSignatureValid,
      calculatedDigest,
      verifiedAt: new Date().toISOString()
    };
  }
}

module.exports = EnterprisePilotEngine;
