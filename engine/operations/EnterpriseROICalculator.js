/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Operations — Enterprise ROI Calculation Engine (Stream B)
 * File           : engine/operations/EnterpriseROICalculator.js
 * Version        : 2026.1.0-LTS
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | GOVERNMENT | RESTRICTED
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

/**
 * EnterpriseROICalculator
 * Enterprise ROI calculation engine measuring compliance efficiency gains,
 * resource utilization savings, risk mitigation value, and operational metrics.
 */
class EnterpriseROICalculator {
  /**
   * @param {Object} defaultConfig Optional baseline ROI assumptions
   */
  constructor(defaultConfig = {}) {
    this.defaults = Object.assign({
      blendedHourlyRateUSD: 150,
      annualPlatformCostUSD: 180000,
      initialImplementationCostUSD: 75000
    }, defaultConfig);
  }

  /**
   * Calculate compliance efficiency gains resulting from EAORCS automation.
   * @param {Object} inputs Custom inputs
   * @returns {Object} Compliance efficiency metrics
   */
  calculateComplianceEfficiencyGains(inputs = {}) {
    const hourlyRate = inputs.blendedHourlyRateUSD || this.defaults.blendedHourlyRateUSD;
    const auditHoursSavedPerMonth = inputs.automatedAuditHoursSavedPerMonth !== undefined ? inputs.automatedAuditHoursSavedPerMonth : 160;
    const evidenceCollectionHoursSavedPerMonth = inputs.evidenceCollectionHoursSavedPerMonth !== undefined ? inputs.evidenceCollectionHoursSavedPerMonth : 120;
    const reportingHoursSavedPerMonth = inputs.reportingHoursSavedPerMonth !== undefined ? inputs.reportingHoursSavedPerMonth : 80;

    const totalMonthlyHoursSaved = auditHoursSavedPerMonth + evidenceCollectionHoursSavedPerMonth + reportingHoursSavedPerMonth;
    const totalAnnualHoursSaved = totalMonthlyHoursSaved * 12;

    const monthlySavingsUSD = totalMonthlyHoursSaved * hourlyRate;
    const annualSavingsUSD = totalAnnualHoursSaved * hourlyRate;

    return {
      monthlyHoursSaved: totalMonthlyHoursSaved,
      annualHoursSaved: totalAnnualHoursSaved,
      monthlySavingsUSD,
      annualSavingsUSD,
      hourlyRateUSD: hourlyRate,
      breakdown: {
        auditAutomationUSD: auditHoursSavedPerMonth * 12 * hourlyRate,
        evidenceCollectionUSD: evidenceCollectionHoursSavedPerMonth * 12 * hourlyRate,
        reportingAutomationUSD: reportingHoursSavedPerMonth * 12 * hourlyRate
      }
    };
  }

  /**
   * Calculate compute and cloud resource utilization savings.
   * @param {Object} inputs Infrastructure cost metrics
   * @returns {Object} Resource savings metrics
   */
  calculateResourceSavings(inputs = {}) {
    const legacyMonthlyCost = inputs.legacyClusterMonthlyCostUSD !== undefined ? inputs.legacyClusterMonthlyCostUSD : 45000;
    const optimizedMonthlyCost = inputs.optimizedClusterMonthlyCostUSD !== undefined ? inputs.optimizedClusterMonthlyCostUSD : 28000;
    const wasteReductionMonthly = inputs.cloudWasteReductionMonthlyUSD !== undefined ? inputs.cloudWasteReductionMonthlyUSD : 6500;

    const directMonthlySavings = (legacyMonthlyCost - optimizedMonthlyCost) + wasteReductionMonthly;
    const annualSavingsUSD = directMonthlySavings * 12;

    const optimizationPercentage = parseFloat((((legacyMonthlyCost - optimizedMonthlyCost) / legacyMonthlyCost) * 100).toFixed(2));

    return {
      monthlySavingsUSD: directMonthlySavings,
      annualSavingsUSD,
      legacyClusterMonthlyCostUSD: legacyMonthlyCost,
      optimizedClusterMonthlyCostUSD: optimizedMonthlyCost,
      optimizationPercentage,
      cloudWasteReductionAnnualUSD: wasteReductionMonthly * 12
    };
  }

  /**
   * Calculate risk mitigation and penalty avoidance value.
   * @param {Object} inputs Exposure and risk reduction estimates
   * @returns {Object} Risk mitigation value metrics
   */
  calculateRiskMitigationValue(inputs = {}) {
    const fineExposure = inputs.annualComplianceFineExposureUSD !== undefined ? inputs.annualComplianceFineExposureUSD : 2500000;
    const riskReductionPercent = inputs.complianceRiskReductionPercent !== undefined ? inputs.complianceRiskReductionPercent : 92;
    const breachCostAvoidance = inputs.securityBreachCostAvoidanceUSD !== undefined ? inputs.securityBreachCostAvoidanceUSD : 1200000;
    const zeroTrustFactor = inputs.zeroTrustEnforcementFactor !== undefined ? inputs.zeroTrustEnforcementFactor : 0.85;

    const fineAvoidanceValue = fineExposure * (riskReductionPercent / 100);
    const securityRiskValue = breachCostAvoidance * zeroTrustFactor;

    const totalAnnualRiskMitigationValueUSD = fineAvoidanceValue + securityRiskValue;

    return {
      fineAvoidanceValueUSD: fineAvoidanceValue,
      securityRiskValueUSD: securityRiskValue,
      totalAnnualRiskMitigationValueUSD,
      complianceRiskReductionPercent: riskReductionPercent,
      zeroTrustFactor
    };
  }

  /**
   * Calculate operational incident reduction and MTTR improvements.
   * @param {Object} inputs Operational telemetry inputs
   * @returns {Object} Operational efficiency metrics
   */
  calculateOperationalMetrics(inputs = {}) {
    const preMTTR = inputs.preDeploymentMTTRHours !== undefined ? inputs.preDeploymentMTTRHours : 14.5;
    const postMTTR = inputs.postDeploymentMTTRHours !== undefined ? inputs.postDeploymentMTTRHours : 0.75;
    const incidentCount = inputs.incidentCountPerYear !== undefined ? inputs.incidentCountPerYear : 24;
    const downtimeCostPerHour = inputs.downtimeCostPerHourUSD !== undefined ? inputs.downtimeCostPerHourUSD : 50000;

    const mttrReductionPercent = parseFloat((((preMTTR - postMTTR) / preMTTR) * 100).toFixed(2));
    const hoursSavedPerIncident = preMTTR - postMTTR;
    const totalDowntimeHoursSavedAnnual = hoursSavedPerIncident * incidentCount;

    const annualOperationalSavingsUSD = totalDowntimeHoursSavedAnnual * downtimeCostPerHour;

    return {
      preDeploymentMTTRHours: preMTTR,
      postDeploymentMTTRHours: postMTTR,
      mttrReductionPercent,
      totalDowntimeHoursSavedAnnual,
      annualOperationalSavingsUSD
    };
  }

  /**
   * Compute comprehensive ROI, Net Financial Value, Payback Period, and Multipliers.
   * @param {Object} config Custom values or overrides
   * @returns {Object} Complete enterprise ROI audit report
   */
  computeComprehensiveROI(config = {}) {
    const platformCost = config.annualPlatformCostUSD !== undefined ? config.annualPlatformCostUSD : this.defaults.annualPlatformCostUSD;
    const implementationCost = config.initialImplementationCostUSD !== undefined ? config.initialImplementationCostUSD : this.defaults.initialImplementationCostUSD;

    const complianceGains = this.calculateComplianceEfficiencyGains(config.complianceInputs || {});
    const resourceSavings = this.calculateResourceSavings(config.resourceInputs || {});
    const riskMitigation = this.calculateRiskMitigationValue(config.riskInputs || {});
    const operationalMetrics = this.calculateOperationalMetrics(config.operationalInputs || {});

    const totalAnnualValueCreatedUSD =
      complianceGains.annualSavingsUSD +
      resourceSavings.annualSavingsUSD +
      riskMitigation.totalAnnualRiskMitigationValueUSD +
      operationalMetrics.annualOperationalSavingsUSD;

    const firstYearTotalCostUSD = platformCost + implementationCost;
    const netFirstYearSavingsUSD = totalAnnualValueCreatedUSD - firstYearTotalCostUSD;
    const netRecurringAnnualSavingsUSD = totalAnnualValueCreatedUSD - platformCost;

    const roiPercentage = parseFloat(((netFirstYearSavingsUSD / firstYearTotalCostUSD) * 100).toFixed(2));

    const monthlyValueCreated = totalAnnualValueCreatedUSD / 12;
    const paybackPeriodMonths = parseFloat((firstYearTotalCostUSD / monthlyValueCreated).toFixed(2));

    const efficiencyMultiplier = parseFloat((totalAnnualValueCreatedUSD / platformCost).toFixed(2));

    return {
      summary: {
        totalAnnualValueCreatedUSD,
        firstYearTotalCostUSD,
        netFirstYearSavingsUSD,
        netRecurringAnnualSavingsUSD,
        roiPercentage,
        paybackPeriodMonths,
        efficiencyMultiplier
      },
      categoryBreakdown: {
        complianceEfficiencyUSD: complianceGains.annualSavingsUSD,
        resourceUtilizationUSD: resourceSavings.annualSavingsUSD,
        riskMitigationValueUSD: riskMitigation.totalAnnualRiskMitigationValueUSD,
        operationalDowntimeSavedUSD: operationalMetrics.annualOperationalSavingsUSD
      },
      detailedMetrics: {
        complianceGains,
        resourceSavings,
        riskMitigation,
        operationalMetrics
      },
      auditTimestamp: new Date().toISOString()
    };
  }
}

module.exports = EnterpriseROICalculator;
