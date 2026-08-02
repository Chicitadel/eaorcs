/******************************************************************************
 * Project        : EAORCS Platform
 * Module         : Operational Trust Controller
 * File           : engine/trust/OperationalTrustController.js
 * Version        : 2026.1.0-LTS
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems
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
 * Copyright (c) 2026 Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const crypto = require('crypto');
const EventEmitter = require('events');
const LiveTrustOperationsSuite = require('./LiveTrustOperationsSuite');
const { CATransparencyLogEngine, CA_LOG_EVENT_TYPES } = require('./CATransparencyLogEngine');
const { KeyCeremonyOrchestrator, CeremonyState, CustodianRole } = require('./KeyCeremonyOrchestrator');
const TrustScoreCalculator = require('./TrustScoreCalculator');

/**
 * OperationalTrustController
 * Platform Operations & Live Trust Controller performing:
 * 1. Live append-only transparency log auditing
 * 2. Merkle tree inclusion proof export (`exportMerkleProofs`) and verification
 * 3. Real-time Certificate Revocation List (CRL) generation and publication
 * 4. Active key ceremony rotation monitoring and execution
 * 5. Composite Trust Health Score calculation and health reporting
 */
class OperationalTrustController extends EventEmitter {
  /**
   * @param {Object} [options] Configuration options
   * @param {string} [options.controllerId] Identifier for this controller instance
   * @param {LiveTrustOperationsSuite} [options.suite] Optional underlying LiveTrustOperationsSuite instance
   * @param {CATransparencyLogEngine} [options.transparencyLog] Optional transparency log instance
   * @param {KeyCeremonyOrchestrator} [options.keyOrchestrator] Optional key ceremony orchestrator instance
   * @param {TrustScoreCalculator} [options.scoreCalculator] Optional trust score calculator instance
   * @param {Object} [options.issuerInfo] Certificate authority issuer metadata
   * @param {Object} [options.signingKeys] Keypair { privateKey, publicKey } for signing CRLs & log entries
   */
  constructor(options = {}) {
    super();

    this.controllerId = options.controllerId || `op-trust-controller-${crypto.randomBytes(4).toString('hex')}`;

    // Initialize or bind underlying operational suite
    this.suite = options.suite || new LiveTrustOperationsSuite(options);

    // Direct access convenience getters
    this.issuerInfo = this.suite.issuerInfo;
    this.signingKeys = this.suite.signingKeys;

    // Operation tracking histories
    this.auditHistory = [];
    this.crlHistory = [];
    this.rotationHistory = [];

    // Relay underlying suite events to controller listeners
    this._bindSuiteEvents();
  }

  /**
   * Binds and forwards events from the underlying operational suite
   * @private
   */
  _bindSuiteEvents() {
    this.suite.on('audit:completed', (summary) => this.emit('audit:completed', summary));
    this.suite.on('crl:generated', (crl) => this.emit('crl:generated', crl));
    this.suite.on('certificate:revoked', (record) => this.emit('certificate:revoked', record));
    this.suite.on('ceremony:verified', (result) => this.emit('ceremony:verified', result));
    this.suite.on('key:rotated', (summary) => this.emit('key:rotated', summary));
    this.suite.on('health:reported', (report) => this.emit('health:reported', report));
  }

  /**
   * Returns the primary transparency log instance
   * @returns {CATransparencyLogEngine}
   */
  get transparencyLog() {
    return this.suite.transparencyLog;
  }

  /**
   * Returns the primary key ceremony orchestrator instance
   * @returns {KeyCeremonyOrchestrator}
   */
  get keyOrchestrator() {
    return this.suite.keyOrchestrator;
  }

  /**
   * Returns the primary trust score calculator instance
   * @returns {TrustScoreCalculator}
   */
  get scoreCalculator() {
    return this.suite.scoreCalculator;
  }

  // ===========================================================================
  // 1. LIVE TRANSPARENCY LOG AUDITING
  // ===========================================================================

  /**
   * Audits the transparency log for index continuity, hash chain integrity,
   * digital entry signatures, and Merkle tree inclusion proofs.
   *
   * @param {CATransparencyLogEngine} [logInstance] Optional target transparency log
   * @param {Object} [options] Audit configuration options
   * @returns {Object} Comprehensive audit summary
   */
  auditTransparencyLog(logInstance = null, options = {}) {
    const summary = this.suite.auditTransparencyLog(logInstance, options);
    this.auditHistory.push(summary);
    return summary;
  }

  /**
   * Starts periodic continuous background transparency log auditing
   * @param {number} [intervalMs=5000] Audit interval in milliseconds
   */
  startContinuousAuditing(intervalMs = 5000) {
    this.suite.startContinuousAuditing(intervalMs);
  }

  /**
   * Stops periodic continuous background transparency log auditing
   */
  stopContinuousAuditing() {
    this.suite.stopContinuousAuditing();
  }

  // ===========================================================================
  // 2. MERKLE TREE INCLUSION PROOF EXPORT (`exportMerkleProofs`)
  // ===========================================================================

  /**
   * Exports Merkle tree inclusion proofs for target entry indices or all log entries.
   *
   * @param {Array<number>|number|Object|string} [entryIndices=null]
   *        - Array of target entry indices, e.g. [0, 1, 3]
   *        - Single index number, e.g. 2
   *        - Range object, e.g. { start: 0, end: 5 }
   *        - null / 'all' for all log entries
   * @param {Object} [options] Options for proof export
   * @param {CATransparencyLogEngine} [options.logInstance] Target transparency log instance
   * @param {boolean} [options.verifyExportedProofs=true] Validate each exported proof against Merkle root
   * @returns {Object} Structured Merkle proof export bundle
   */
  exportMerkleProofs(entryIndices = null, options = {}) {
    const targetLog = options.logInstance || this.transparencyLog;
    const entries = targetLog.getEntries();
    const merkleRoot = targetLog.getMerkleRoot();
    const verifyExported = options.verifyExportedProofs !== false;

    let targetList = [];

    if (entryIndices === null || entryIndices === 'all') {
      targetList = entries.map((_, i) => i);
    } else if (typeof entryIndices === 'number') {
      targetList = [entryIndices];
    } else if (Array.isArray(entryIndices)) {
      targetList = entryIndices;
    } else if (typeof entryIndices === 'object' && entryIndices.start !== undefined && entryIndices.end !== undefined) {
      const start = Math.max(0, entryIndices.start);
      const end = Math.min(entries.length - 1, entryIndices.end);
      for (let i = start; i <= end; i++) {
        targetList.push(i);
      }
    } else {
      targetList = entries.map((_, i) => i);
    }

    const exportedProofs = [];

    for (const idx of targetList) {
      if (idx < 0 || idx >= entries.length) {
        throw new Error(`OperationalTrustController.exportMerkleProofs: Index ${idx} out of log bounds (0-${entries.length - 1})`);
      }

      const entry = entries[idx];
      const proof = targetLog.getInclusionProof(idx);
      const leafHash = CATransparencyLogEngine.hashLeaf(entry.hash);
      const isVerified = verifyExported
        ? CATransparencyLogEngine.verifyInclusionProof(entry.hash, proof, merkleRoot)
        : true;

      exportedProofs.push({
        index: entry.index,
        entryHash: entry.hash,
        leafHash,
        eventType: entry.eventType,
        timestamp: entry.timestamp,
        signature: entry.signature,
        proof,
        verified: isVerified
      });
    }

    const exportBundle = {
      exportId: `proof-export-${crypto.randomBytes(4).toString('hex')}`,
      exportedAt: new Date().toISOString(),
      controllerId: this.controllerId,
      logId: targetLog.logId,
      merkleRoot,
      totalLogEntries: entries.length,
      proofCount: exportedProofs.length,
      allProofsVerified: exportedProofs.every(p => p.verified),
      proofs: exportedProofs
    };

    this.emit('proofs:exported', exportBundle);
    return exportBundle;
  }

  /**
   * Verifies an exported Merkle tree inclusion proof against a known Merkle Root
   * @param {string} entryOrLeafHash Entry hash or Leaf hash
   * @param {Array<{position: string, hash: string}>} proof Proof path
   * @param {string} merkleRoot Target Merkle Root hash
   * @returns {boolean} True if proof validly computes to merkleRoot
   */
  verifyMerkleProof(entryOrLeafHash, proof, merkleRoot) {
    return CATransparencyLogEngine.verifyInclusionProof(entryOrLeafHash, proof, merkleRoot);
  }

  // ===========================================================================
  // 3. CERTIFICATE REVOCATION LIST (CRL) GENERATION & PUBLISHING
  // ===========================================================================

  /**
   * Revokes a certificate by serial number and logs revocation event
   * @param {string} serialNumber Target certificate serial number
   * @param {string} [reason='KEY_COMPROMISE'] Revocation reason
   * @param {string} [revocationDate] ISO date string
   * @returns {Object} Revocation record
   */
  revokeCertificate(serialNumber, reason = 'KEY_COMPROMISE', revocationDate = null) {
    return this.suite.revokeCertificate(serialNumber, reason, revocationDate);
  }

  /**
   * Checks if a certificate serial number is currently revoked
   * @param {string} serialNumber Certificate serial number
   * @returns {boolean} True if revoked
   */
  isCertificateRevoked(serialNumber) {
    return this.suite.isCertificateRevoked(serialNumber);
  }

  /**
   * Generates a signed real-time X.509 CRL object
   * @param {number} [validityHours=24] CRL validity duration in hours
   * @returns {Object} Structured CRL object with PEM payload
   */
  generateCRL(validityHours = 24) {
    return this.suite.generateRealTimeCRL(validityHours);
  }

  /**
   * Generates and publishes a signed CRL to a distribution endpoint point
   * @param {Object} [publicationOptions] Publication metadata
   * @param {string} [publicationOptions.distributionPoint] CRL distribution URI
   * @param {number} [publicationOptions.validityHours=24] Validity hours
   * @returns {Object} Published CRL bundle
   */
  publishCRL(publicationOptions = {}) {
    const crl = this.generateCRL(publicationOptions.validityHours || 24);
    const distributionPoint = publicationOptions.distributionPoint || `https://crl.eaorcs.enterprise/live/${this.issuerInfo.caId || 'default'}.crl`;

    const publishedRecord = {
      publicationId: `crl-pub-${crypto.randomBytes(4).toString('hex')}`,
      publishedAt: new Date().toISOString(),
      crlNumber: crl.body.crlNumber,
      issuer: crl.body.issuer,
      thisUpdate: crl.body.thisUpdate,
      nextUpdate: crl.body.nextUpdate,
      totalRevokedCount: crl.body.totalRevokedCount,
      distributionPoint,
      merkleRoot: crl.body.merkleRoot,
      signature: crl.signature,
      signatureAlgorithm: crl.header.signatureAlgorithm,
      crlPem: crl.crlPem
    };

    this.crlHistory.push(publishedRecord);
    this.emit('crl:published', publishedRecord);
    return publishedRecord;
  }

  // ===========================================================================
  // 4. ACTIVE KEY CEREMONY ROTATION MONITORING
  // ===========================================================================

  /**
   * Verifies state and custodian readiness of active key ceremony
   * @param {KeyCeremonyOrchestrator} [orchestratorInstance] Optional target key ceremony orchestrator
   * @returns {Object} Key ceremony verification report
   */
  verifyActiveKeyCeremony(orchestratorInstance = null) {
    return this.suite.verifyActiveKeyCeremony(orchestratorInstance);
  }

  /**
   * Monitors active key ceremony status, threshold M of N custodian check-in,
   * and calculates key ceremony operational readiness.
   *
   * @param {KeyCeremonyOrchestrator} [orchestratorInstance] Target key ceremony orchestrator
   * @returns {Object} Detailed key ceremony monitoring status
   */
  monitorKeyCeremonyStatus(orchestratorInstance = null) {
    const orch = orchestratorInstance || this.keyOrchestrator;
    const report = orch.exportCeremonyReport();

    const thresholdM = report.config?.thresholdM || 0;
    const totalN = report.config?.totalN || 0;
    const checkedInCount = report.checkedInCustodiansCount || 0;
    const isQuorumMet = thresholdM > 0 && checkedInCount >= thresholdM;

    const completionPercentage = totalN > 0 ? Number(((checkedInCount / totalN) * 100).toFixed(2)) : 0;

    const monitoringStatus = {
      monitoredAt: new Date().toISOString(),
      ceremonyId: report.ceremonyId,
      state: report.state,
      thresholdM,
      totalN,
      checkedInCustodiansCount: checkedInCount,
      isQuorumMet,
      completionPercentage,
      activeKeyInfo: this.suite.activeKeyInfo || { keyId: orch.generatedKeys?.keyId || 'INITIAL_ROOT_KEY' },
      lastRotationAt: this.suite.activeKeyInfo?.rotatedAt || null,
      rotationCount: this.rotationHistory.length,
      health: isQuorumMet ? 'HEALTHY' : (report.state === CeremonyState.COMPLETED ? 'HEALTHY' : 'PENDING_QUORUM')
    };

    this.emit('ceremony:monitored', monitoringStatus);
    return monitoringStatus;
  }

  /**
   * Initiates and executes active key ceremony rotation cycle
   * @param {Object} [rotationOptions] Rotation parameters
   * @returns {Object} Key rotation summary
   */
  rotateKeyCeremony(rotationOptions = {}) {
    const rotationSummary = this.suite.rotateKeyCeremony(rotationOptions);
    this.rotationHistory.push(rotationSummary);
    return rotationSummary;
  }

  // ===========================================================================
  // 5. TRUST SCORE HEALTH REPORTING
  // ===========================================================================

  /**
   * Calculates comprehensive Trust Health Score and health classification
   * @param {Object} [metricsOverride] Optional metric overrides
   * @returns {Object} Trust health score report
   */
  calculateTrustHealthScore(metricsOverride = {}) {
    return this.suite.calculateTrustScoreHealth(metricsOverride);
  }

  // ===========================================================================
  // 6. CONSOLIDATED OPERATIONAL TRUST CHECK
  // ===========================================================================

  /**
   * Executes consolidated end-to-end operational trust check:
   * - Continuous transparency log audit & Merkle proof export
   * - Real-time CRL generation & publication verification
   * - Key ceremony rotation monitoring
   * - Composite trust score health calculation
   *
   * @returns {Object} Consolidated operational trust report
   */
  runOperationalTrustCheck() {
    const logAudit = this.auditTransparencyLog(null, { sampleProofs: true });
    const proofExport = this.exportMerkleProofs(null, { verifyExportedProofs: true });
    const crlPublication = this.publishCRL();
    const ceremonyMonitoring = this.monitorKeyCeremonyStatus();
    const healthReport = this.calculateTrustHealthScore();

    const overallPassed = logAudit.passed &&
      proofExport.allProofsVerified &&
      crlPublication.totalRevokedCount >= 0 &&
      healthReport.healthStatus !== 'CRITICAL';

    const operationalReport = {
      controllerId: this.controllerId,
      timestamp: new Date().toISOString(),
      overallPassed,
      operationalState: overallPassed ? 'OPERATIONAL' : 'DEGRADED_OR_CRITICAL',
      logAuditSummary: {
        passed: logAudit.passed,
        totalEntries: logAudit.totalEntries,
        merkleRoot: logAudit.merkleRoot
      },
      proofExportSummary: {
        proofCount: proofExport.proofCount,
        allProofsVerified: proofExport.allProofsVerified,
        merkleRoot: proofExport.merkleRoot
      },
      crlSummary: {
        crlNumber: crlPublication.crlNumber,
        totalRevoked: crlPublication.totalRevokedCount,
        distributionPoint: crlPublication.distributionPoint,
        nextUpdate: crlPublication.nextUpdate
      },
      keyCeremonySummary: {
        ceremonyId: ceremonyMonitoring.ceremonyId,
        state: ceremonyMonitoring.state,
        isQuorumMet: ceremonyMonitoring.isQuorumMet,
        health: ceremonyMonitoring.health,
        activeKeyId: ceremonyMonitoring.activeKeyInfo?.keyId
      },
      healthReportSummary: {
        healthStatus: healthReport.healthStatus,
        trustScore: healthReport.trustScore,
        tier: healthReport.tier,
        penalties: healthReport.penalties
      }
    };

    this.emit('operations:checked', operationalReport);
    return operationalReport;
  }
}

module.exports = OperationalTrustController;
