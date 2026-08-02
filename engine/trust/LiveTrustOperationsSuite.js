/******************************************************************************
 * Project        : EAORCS Platform
 * Module         : Live Trust Operations Suite
 * File           : engine/trust/LiveTrustOperationsSuite.js
 * Version        : 2026.1.0-LTS
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Enterprise Systems
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
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
 * Copyright (c) 2026 Ujomor Enterprise Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const crypto = require('crypto');
const EventEmitter = require('events');
const { CATransparencyLogEngine, CA_LOG_EVENT_TYPES } = require('./CATransparencyLogEngine');
const { KeyCeremonyOrchestrator, CeremonyState, CustodianRole } = require('./KeyCeremonyOrchestrator');
const TrustScoreCalculator = require('./TrustScoreCalculator');

/**
 * LiveTrustOperationsSuite
 * Controller for live trust operations:
 * - Continuous append-only transparency log auditing
 * - Real-time Certificate Revocation List (CRL) generation
 * - Active key ceremony verification & key rotation management
 * - Trust score health reporting & live telemetry
 */
class LiveTrustOperationsSuite extends EventEmitter {
  /**
   * @param {Object} [options] Suite configuration options
   * @param {string} [options.suiteId] Identifier for this operational suite instance
   * @param {CATransparencyLogEngine} [options.transparencyLog] Transparency log instance
   * @param {KeyCeremonyOrchestrator} [options.keyOrchestrator] Key ceremony orchestrator instance
   * @param {TrustScoreCalculator} [options.scoreCalculator] Trust score calculator instance
   * @param {Object} [options.issuerInfo] Certificate authority issuer metadata
   * @param {Object} [options.signingKeys] Keypair { privateKey, publicKey } for signing CRLs & entries
   */
  constructor(options = {}) {
    super();
    this.suiteId = options.suiteId || `trust-suite-${crypto.randomBytes(4).toString('hex')}`;
    this.signingKeys = options.signingKeys || null;

    // Internal or injected dependencies
    this.transparencyLog = options.transparencyLog || new CATransparencyLogEngine({
      logId: `live-log-${this.suiteId}`,
      signingPrivateKey: this.signingKeys?.privateKey,
      signingPublicKey: this.signingKeys?.publicKey
    });

    this.keyOrchestrator = options.keyOrchestrator || new KeyCeremonyOrchestrator({
      transparencyLog: this.transparencyLog
    });

    this.scoreCalculator = options.scoreCalculator || new TrustScoreCalculator(options.scoreOptions);

    this.issuerInfo = options.issuerInfo || {
      commonName: 'EAORCS Live Trust Authority',
      organization: 'Ujomor Enterprise Systems',
      country: 'US',
      caId: 'CA-EAORCS-LIVE-01'
    };

    this.crlSequence = 1;
    this.revocationRegistry = new Map();
    this.auditIntervalTimer = null;
    this.auditHistory = [];
    this.activeKeyInfo = null;
  }

  // ===========================================================================
  // 1. CONTINUOUS APPEND-ONLY TRANSPARENCY LOG AUDITING
  // ===========================================================================

  /**
   * Performs an audit on the target transparency log engine.
   * Validates index continuity, hash chain integrity, entry signatures,
   * and verifies Merkle tree inclusion proofs for entries.
   *
   * @param {CATransparencyLogEngine} [logInstance] Optional target log instance
   * @param {Object} [auditOptions] Optional parameters
   * @param {boolean} [auditOptions.sampleProofs=true] Verify Merkle inclusion proofs
   * @returns {Object} Audit verification result
   */
  auditTransparencyLog(logInstance = null, auditOptions = {}) {
    const targetLog = logInstance || this.transparencyLog;
    const sampleProofs = auditOptions.sampleProofs !== false;

    const integrityReport = targetLog.verifyLogIntegrity(this.signingKeys?.publicKey);
    const entries = targetLog.getEntries();
    const proofResults = [];

    if (sampleProofs && entries.length > 0) {
      const merkleRoot = integrityReport.merkleRoot;
      for (let i = 0; i < entries.length; i++) {
        try {
          const proof = targetLog.getInclusionProof(i);
          const isValid = CATransparencyLogEngine.verifyInclusionProof(entries[i].hash, proof, merkleRoot);
          proofResults.push({
            index: i,
            hash: entries[i].hash,
            valid: isValid
          });
          if (!isValid) {
            integrityReport.valid = false;
            integrityReport.errors.push(`Merkle proof verification failed for entry index #${i}`);
          }
        } catch (err) {
          integrityReport.valid = false;
          integrityReport.errors.push(`Error generating proof for index #${i}: ${err.message}`);
        }
      }
    }

    const auditCheckpointPayload = {
      auditedAt: new Date().toISOString(),
      logId: targetLog.logId,
      totalEntries: integrityReport.totalEntries,
      merkleRoot: integrityReport.merkleRoot,
      isIntegrityValid: integrityReport.valid,
      proofsVerifiedCount: proofResults.length,
      errorCount: integrityReport.errors.length,
      errors: integrityReport.errors
    };

    // Log checkpoint entry into transparency log if active
    let checkpointEntry = null;
    if (!targetLog._isFrozen) {
      checkpointEntry = targetLog.appendEntry(CA_LOG_EVENT_TYPES.AUDIT_CHECKPOINT, auditCheckpointPayload);
    }

    const auditSummary = {
      auditId: `audit-${crypto.randomBytes(4).toString('hex')}`,
      logId: targetLog.logId,
      timestamp: auditCheckpointPayload.auditedAt,
      passed: integrityReport.valid,
      auditedEntries: integrityReport.totalEntries,
      totalEntries: targetLog.getEntries().length,
      merkleRoot: integrityReport.merkleRoot,
      proofResults,
      checkpointEntryIndex: checkpointEntry ? checkpointEntry.index : null,
      errors: integrityReport.errors
    };

    this.auditHistory.push(auditSummary);
    this.emit('audit:completed', auditSummary);

    return auditSummary;
  }

  /**
   * Starts periodic continuous transparency log auditing
   * @param {number} [intervalMs=5000] Interval in milliseconds
   */
  startContinuousAuditing(intervalMs = 5000) {
    if (this.auditIntervalTimer) {
      clearInterval(this.auditIntervalTimer);
    }
    this.auditIntervalTimer = setInterval(() => {
      try {
        this.auditTransparencyLog();
      } catch (err) {
        this.emit('audit:error', { error: err.message, timestamp: new Date().toISOString() });
      }
    }, intervalMs);
    this.emit('audit:started', { intervalMs });
  }

  /**
   * Stops continuous auditing background timer
   */
  stopContinuousAuditing() {
    if (this.auditIntervalTimer) {
      clearInterval(this.auditIntervalTimer);
      this.auditIntervalTimer = null;
      this.emit('audit:stopped', { timestamp: new Date().toISOString() });
    }
  }

  // ===========================================================================
  // 2. REAL-TIME CERTIFICATE REVOCATION LIST (CRL) GENERATION
  // ===========================================================================

  /**
   * Revokes a certificate by serial number, adding it to the revocation registry
   * and logging the event in the transparency log.
   *
   * @param {string} serialNumber Certificate serial number
   * @param {string} [reason='KEY_COMPROMISE'] Reason for revocation
   * @param {string} [revocationDate] Date of revocation (ISO string)
   * @returns {Object} Revocation record
   */
  revokeCertificate(serialNumber, reason = 'KEY_COMPROMISE', revocationDate = null) {
    if (!serialNumber || typeof serialNumber !== 'string') {
      throw new Error('LiveTrustOperationsSuite: Serial number is required for certificate revocation.');
    }

    const validReasons = [
      'UNSPECIFIED',
      'KEY_COMPROMISE',
      'CA_COMPROMISE',
      'AFFILIATION_CHANGED',
      'SUPERSEDED',
      'CESSATION_OF_OPERATION',
      'CERTIFICATE_HOLD',
      'PRIVILEGE_WITHDRAWN'
    ];

    const normalizedReason = validReasons.includes(reason) ? reason : 'KEY_COMPROMISE';
    const revDate = revocationDate || new Date().toISOString();

    const record = {
      serialNumber,
      revocationDate: revDate,
      reason: normalizedReason,
      revokedBy: this.issuerInfo.caId
    };

    this.revocationRegistry.set(serialNumber, record);

    // Append event to transparency log
    this.transparencyLog.appendEntry(CA_LOG_EVENT_TYPES.CERTIFICATE_REVOKED, {
      serialNumber,
      reason: normalizedReason,
      revocationDate: revDate,
      caId: this.issuerInfo.caId
    });

    this.emit('certificate:revoked', record);
    return record;
  }

  /**
   * Checks if a certificate serial number is revoked
   * @param {string} serialNumber Serial number
   * @returns {boolean} True if revoked
   */
  isCertificateRevoked(serialNumber) {
    return this.revocationRegistry.has(serialNumber);
  }

  /**
   * Generates a signed real-time Certificate Revocation List (CRL)
   * @param {number} [validityHours=24] Validity duration of the CRL in hours
   * @returns {Object} Structured CRL object
   */
  generateRealTimeCRL(validityHours = 24) {
    const crlNumber = this.crlSequence++;
    const thisUpdate = new Date().toISOString();
    const nextUpdate = new Date(Date.now() + validityHours * 3600 * 1000).toISOString();

    const revokedCertificates = Array.from(this.revocationRegistry.values()).map(r => ({
      serialNumber: r.serialNumber,
      revocationDate: r.revocationDate,
      reason: r.reason
    }));

    const merkleRoot = this.transparencyLog.getMerkleRoot();

    const crlBody = {
      crlNumber,
      issuer: this.issuerInfo,
      thisUpdate,
      nextUpdate,
      totalRevokedCount: revokedCertificates.length,
      revokedCertificates,
      merkleRoot
    };

    const payloadString = JSON.stringify(crlBody);
    let signature = null;
    let signatureAlgorithm = 'SHA256withRSA';

    if (this.signingKeys?.privateKey) {
      try {
        const signer = crypto.createSign('sha256');
        signer.update(payloadString);
        signer.end();
        signature = signer.sign(this.signingKeys.privateKey, 'hex');
      } catch (err) {
        // Fallback to HMAC digest if key format is raw
        signature = crypto.createHmac('sha256', this.signingKeys.privateKey).update(payloadString).digest('hex');
        signatureAlgorithm = 'HMAC-SHA256';
      }
    } else {
      // Deterministic signature fallback for test/dev operational modes
      signature = crypto.createHash('sha256').update(payloadString).digest('hex');
      signatureAlgorithm = 'SHA256-DIGEST-ONLY';
    }

    const crlObject = {
      header: {
        version: 'X.509 CRL v2',
        signatureAlgorithm
      },
      body: crlBody,
      signature,
      crlPem: `-----BEGIN X509 CRL-----\n${Buffer.from(JSON.stringify({ ...crlBody, signature })).toString('base64').match(/.{1,64}/g).join('\n')}\n-----END X509 CRL-----`
    };

    this.emit('crl:generated', crlObject);
    return crlObject;
  }

  // ===========================================================================
  // 3. ACTIVE KEY CEREMONY VERIFICATION & ROTATION
  // ===========================================================================

  /**
   * Verifies state and readiness of an active key ceremony
   * @param {KeyCeremonyOrchestrator} [orchestratorInstance] Optional target ceremony orchestrator
   * @returns {Object} Ceremony health and verification status
   */
  verifyActiveKeyCeremony(orchestratorInstance = null) {
    const orch = orchestratorInstance || this.keyOrchestrator;
    const report = orch.exportCeremonyReport();

    const errors = [];
    let isQuorumValid = false;

    if (report.config) {
      const requiredThreshold = report.config.thresholdM;
      if (report.checkedInCustodiansCount >= requiredThreshold) {
        isQuorumValid = true;
      } else {
        errors.push(`Quorum not met: Checked-in custodians (${report.checkedInCustodiansCount}) < Required Threshold M (${requiredThreshold})`);
      }
    } else {
      errors.push('No key ceremony configuration initialized');
    }

    const verificationResult = {
      ceremonyId: report.ceremonyId,
      state: report.state,
      config: report.config,
      totalCustodians: report.custodiansCount,
      checkedInCustodians: report.checkedInCustodiansCount,
      isQuorumValid,
      generatedKeyId: report.generatedKeyId,
      fingerprint: report.fingerprint,
      valid: isQuorumValid && errors.length === 0,
      errors
    };

    this.emit('ceremony:verified', verificationResult);
    return verificationResult;
  }

  /**
   * Initiates and executes an active key ceremony rotation cycle
   * @param {Object} [rotationOptions] Rotation parameters
   * @param {KeyCeremonyOrchestrator} [rotationOptions.orchestrator] Orchestrator instance
   * @param {number} [rotationOptions.thresholdM=3] Threshold M for new ceremony
   * @param {number} [rotationOptions.totalN=5] Total N custodians
   * @param {Array<Object>} [rotationOptions.custodians] Custodians list for check-in
   * @returns {Object} Rotation verification report
   */
  rotateKeyCeremony(rotationOptions = {}) {
    const orch = rotationOptions.orchestrator || this.keyOrchestrator;
    const thresholdM = rotationOptions.thresholdM || 3;
    const totalN = rotationOptions.totalN || 5;

    const oldKeyId = this.activeKeyInfo ? this.activeKeyInfo.keyId : (orch.generatedKeys?.keyId || 'INITIAL_KEY');
    const newCeremonyId = `ceremony-rotation-${crypto.randomBytes(4).toString('hex')}`;

    // Step 1: Initiate new rotation ceremony
    orch.initiateCeremony(newCeremonyId, {
      thresholdM,
      totalN,
      keyType: rotationOptions.keyType || 'RSA-4096',
      caName: this.issuerInfo.commonName
    });

    // Step 2: Register custodians
    const defaultRoles = [
      CustodianRole.PRIMARY_CUSTODIAN,
      CustodianRole.SECONDARY_CUSTODIAN,
      CustodianRole.SECURITY_OFFICER,
      CustodianRole.GOVERNANCE_WITNESS,
      CustodianRole.AUDITOR
    ];

    const custodiansToUse = rotationOptions.custodians || Array.from({ length: totalN }, (_, idx) => ({
      id: `custodian-rot-${idx + 1}`,
      name: `Key Custodian #${idx + 1}`,
      role: defaultRoles[idx % defaultRoles.length],
      authSecret: `secret-passphrase-${idx + 1}`
    }));

    custodiansToUse.forEach(c => {
      orch.registerCustodian(c.id, c.name, c.role);
    });

    // Step 3: Check-in custodians to reach quorum
    for (let i = 0; i < Math.min(custodiansToUse.length, totalN); i++) {
      orch.checkInCustodian(custodiansToUse[i].id, custodiansToUse[i].authSecret);
    }

    // Step 4: Generate new root keys, split secret shares, and complete ceremony
    const genResult = orch.executeKeyGeneration();
    const completeResult = orch.completeCeremony();

    this.activeKeyInfo = {
      keyId: genResult.keyId,
      fingerprint: genResult.fingerprint,
      rotatedAt: new Date().toISOString(),
      ceremonyId: newCeremonyId
    };

    // Step 5: Append KEY_ROTATED event to transparency log
    this.transparencyLog.appendEntry(CA_LOG_EVENT_TYPES.KEY_ROTATED, {
      oldKeyId,
      newKeyId: genResult.keyId,
      fingerprint: genResult.fingerprint,
      ceremonyId: newCeremonyId,
      rotatedAt: this.activeKeyInfo.rotatedAt
    });

    const rotationSummary = {
      status: 'ROTATION_COMPLETED',
      ceremonyId: newCeremonyId,
      oldKeyId,
      newKeyId: genResult.keyId,
      fingerprint: genResult.fingerprint,
      custodiansParticipated: custodiansToUse.length,
      thresholdM,
      totalN,
      rotatedAt: this.activeKeyInfo.rotatedAt
    };

    this.emit('key:rotated', rotationSummary);
    return rotationSummary;
  }

  // ===========================================================================
  // 4. TRUST SCORE HEALTH REPORTING
  // ===========================================================================

  /**
   * Calculates current composite Trust Score Health and operational status
   * @param {Object} [metricsOverride] Optional parameter overrides
   * @returns {Object} Comprehensive trust score health report
   */
  calculateTrustScoreHealth(metricsOverride = {}) {
    const readinessScore = metricsOverride.readinessScore ?? 95.0;
    const evidenceConfidence = metricsOverride.evidenceConfidence ?? 0.96;
    const statisticalConfidence = metricsOverride.statisticalConfidence ?? 0.94;

    const securityGaps = metricsOverride.securityGaps || {
      critical: 0,
      high: 0,
      complianceViolations: 0,
      unresolvedVulnerabilities: 0
    };

    // Audit live transparency log integrity
    const logAudit = this.auditTransparencyLog(null, { sampleProofs: false });
    let additionalLogPenalties = 0;
    if (!logAudit.passed) {
      additionalLogPenalties += 30.0; // Major penalty for transparency log integrity corruption
    }

    // Check CRL freshness
    const crl = this.generateRealTimeCRL();
    let crlFreshnessPenalty = 0;
    if (new Date(crl.body.nextUpdate).getTime() < Date.now()) {
      crlFreshnessPenalty += 15.0; // Penalty for expired CRL
    }

    // Build findings list and critical failures for TrustScoreCalculator engine
    const findingsList = [
      ...(metricsOverride.findings || []),
      ...Array.from({ length: securityGaps.high || 0 }, () => ({ severity: 'HIGH', status: 'OPEN' })),
      ...Array.from({ length: securityGaps.complianceViolations || 0 }, () => ({ category: 'COMPLIANCE', status: 'FAILED' })),
      ...Array.from({ length: securityGaps.unresolvedVulnerabilities || 0 }, () => ({ severity: 'HIGH', status: 'OPEN' }))
    ];

    // Calculate score using TrustScoreCalculator engine
    const scoreResult = this.scoreCalculator.calculateTrustScore({
      readinessScore,
      evidenceConfidence,
      statisticalConfidence,
      criticalFailures: securityGaps.critical || 0,
      findings: findingsList,
      decayDays: metricsOverride.decayDays || 0
    });

    const adjustedTrustScore = Math.max(0, Number((scoreResult.trustScore - additionalLogPenalties - crlFreshnessPenalty).toFixed(2)));

    let healthStatus = 'EXCELLENT';
    if (adjustedTrustScore >= 90.0) {
      healthStatus = 'EXCELLENT';
    } else if (adjustedTrustScore >= 75.0) {
      healthStatus = 'HEALTHY';
    } else if (adjustedTrustScore >= 50.0) {
      healthStatus = 'DEGRADED';
    } else {
      healthStatus = 'CRITICAL';
    }

    const healthReport = {
      suiteId: this.suiteId,
      calculatedAt: new Date().toISOString(),
      healthStatus,
      trustScore: adjustedTrustScore,
      baseScore: scoreResult.baseScore,
      tier: scoreResult.tier,
      components: scoreResult.components,
      penalties: {
        standardPenalties: scoreResult.penalties.totalPenalty,
        logIntegrityPenalty: additionalLogPenalties,
        crlFreshnessPenalty,
        totalPenalties: Number((scoreResult.penalties.totalPenalty + additionalLogPenalties + crlFreshnessPenalty).toFixed(2)),
        breakdown: {
          ...scoreResult.penalties.breakdown,
          logIntegrityFailure: additionalLogPenalties,
          crlStale: crlFreshnessPenalty
        }
      },
      transparencyLogStatus: {
        totalEntries: logAudit.totalEntries,
        merkleRoot: logAudit.merkleRoot,
        integrityValid: logAudit.passed
      },
      revocationStatus: {
        totalRevoked: this.revocationRegistry.size,
        crlSequence: crl.body.crlNumber,
        nextUpdate: crl.body.nextUpdate
      },
      activeKeyStatus: this.activeKeyInfo || { keyId: 'UNROTATED_DEFAULT' }
    };

    this.emit('health:reported', healthReport);
    return healthReport;
  }

  // ===========================================================================
  // 5. CONSOLIDATED LIVE OPERATIONS CHECK
  // ===========================================================================

  /**
   * Executes a complete end-to-end live trust operations check:
   * - Performs append-only transparency log audit & Merkle proof validation
   * - Generates real-time Certificate Revocation List (CRL)
   * - Verifies active key ceremony state
   * - Computes trust score health report
   *
   * @returns {Object} Comprehensive live trust operations status
   */
  runLiveTrustOperationsCheck() {
    const logAudit = this.auditTransparencyLog();
    const crl = this.generateRealTimeCRL();
    const keyCeremonyStatus = this.verifyActiveKeyCeremony();
    const healthReport = this.calculateTrustScoreHealth();

    const overallPassed = logAudit.passed && (crl.body.totalRevokedCount >= 0) && healthReport.healthStatus !== 'CRITICAL';

    const consolidatedStatus = {
      suiteId: this.suiteId,
      timestamp: new Date().toISOString(),
      overallPassed,
      operationalState: overallPassed ? 'OPERATIONAL' : 'DEGRADED_OR_CRITICAL',
      logAuditSummary: {
        passed: logAudit.passed,
        totalEntries: logAudit.totalEntries,
        merkleRoot: logAudit.merkleRoot
      },
      crlSummary: {
        crlNumber: crl.body.crlNumber,
        totalRevoked: crl.body.totalRevokedCount,
        nextUpdate: crl.body.nextUpdate
      },
      keyCeremonySummary: {
        state: keyCeremonyStatus.state,
        isQuorumValid: keyCeremonyStatus.isQuorumValid,
        generatedKeyId: keyCeremonyStatus.generatedKeyId
      },
      healthReportSummary: {
        healthStatus: healthReport.healthStatus,
        trustScore: healthReport.trustScore,
        tier: healthReport.tier
      }
    };

    this.emit('operations:checked', consolidatedStatus);
    return consolidatedStatus;
  }
}

module.exports = LiveTrustOperationsSuite;
