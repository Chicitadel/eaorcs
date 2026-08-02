/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Cross-Domain Integration Verification / AdapterComplianceEngine
 * File           : AdapterComplianceEngine.js
 * Version        : 1.0.0
 * Author         : Air Roofers Architecture Authority / Ujomor Systems
 * Organization   : Ujomor Systems / Air Roofers
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
 * Copyright (c) 2026 Ujomor Systems / Air Roofers
 * All Rights Reserved.
 ******************************************************************************/

const fs = require('fs');
const path = require('path');

const ADAPTER_CONTRACTS = {
  BillingAdapter: {
    endpoint: 'billing.airroofers.eu',
    headers: ['X-Correlation-ID'],
    prohibited: ['createInvoice', 'chargeCard', 'processPayment']
  },
  LicensingAdapter: {
    endpoint: 'licensing.airroofers.eu',
    headers: ['X-Correlation-ID'],
    prohibited: ['issueLicense', 'renewLicense', 'generateKey']
  },
  IdentityAdapter: {
    endpoint: 'identity.airroofers.eu',
    headers: ['Authorization'],
    prohibited: ['createUser', 'storePassword', 'modifyRole']
  },
  TelemetryAdapter: {
    endpoint: 'telemetry.airroofers.eu',
    headers: ['X-Telemetry-Key'],
    prohibited: ['scrapeMetrics', 'collectSystemStats']
  },
  SupportAdapter: {
    endpoint: 'support.airroofers.eu',
    headers: ['X-Correlation-ID'],
    prohibited: ['configureSmtp', 'sendRawEmail']
  }
};

class AdapterComplianceEngine {
  static get ADAPTER_CONTRACTS() {
    return ADAPTER_CONTRACTS;
  }

  constructor() {
    this.contracts = ADAPTER_CONTRACTS;
  }

  checkAdapter(adapterInput, contractKey) {
    const contract = this.contracts[contractKey];
    if (!contract) {
      return {
        adapter: contractKey,
        status: 'FAIL',
        violations: [`Unknown adapter contract key: ${contractKey}`],
        endpoint_found: false,
        correlation_id_present: false
      };
    }

    let content = '';

    if (typeof adapterInput === 'string') {
      if (fs.existsSync(adapterInput)) {
        try {
          content = fs.readFileSync(adapterInput, 'utf8');
        } catch (err) {
          return {
            adapter: contractKey,
            status: 'FAIL',
            violations: [`Failed to read adapter file: ${err.message}`],
            endpoint_found: false,
            correlation_id_present: false
          };
        }
      } else {
        const isPathLike = !adapterInput.includes('\n') &&
                           !adapterInput.includes('class ') &&
                           !adapterInput.includes('const ') &&
                           !adapterInput.includes('function ') &&
                           (adapterInput.endsWith('.js') || adapterInput.endsWith('.ts') || adapterInput.endsWith('.cjs') || adapterInput.endsWith('.mjs'));

        if (isPathLike) {
          // Path provided but file does not exist -> missing adapter treated as WARN
          return {
            adapter: contractKey,
            status: 'WARN',
            violations: [],
            endpoint_found: false,
            correlation_id_present: false,
            missing: true
          };
        } else {
          content = adapterInput;
        }
      }
    } else {
      return {
        adapter: contractKey,
        status: 'FAIL',
        violations: ['Invalid adapter input provided.'],
        endpoint_found: false,
        correlation_id_present: false
      };
    }

    const endpoint_found = content.toLowerCase().includes(contract.endpoint.toLowerCase());
    const correlation_id_present = contract.headers.some(header => content.includes(header)) || content.includes('X-Correlation-ID');

    const violations = [];
    for (const kw of contract.prohibited) {
      if (content.includes(kw)) {
        violations.push(`Prohibited pattern found: '${kw}'`);
      }
    }

    const status = violations.length > 0 ? 'FAIL' : 'PASS';

    return {
      adapter: contractKey,
      status,
      violations,
      endpoint_found,
      correlation_id_present
    };
  }

  validateAllAdapters(adapterBasePaths = ['adapters', 'engine/adapters']) {
    const results = [];
    let passCount = 0;
    let failCount = 0;
    let warnCount = 0;

    for (const contractKey of Object.keys(this.contracts)) {
      let foundPath = null;
      for (const basePath of adapterBasePaths) {
        const candidate = path.isAbsolute(basePath)
          ? path.join(basePath, `${contractKey}.js`)
          : path.resolve(process.cwd(), basePath, `${contractKey}.js`);

        if (fs.existsSync(candidate)) {
          foundPath = candidate;
          break;
        }
      }

      if (foundPath) {
        const result = this.checkAdapter(foundPath, contractKey);
        results.push(result);
        if (result.status === 'PASS') passCount++;
        else if (result.status === 'FAIL') failCount++;
        else warnCount++;
      } else {
        const warnResult = {
          adapter: contractKey,
          status: 'WARN',
          violations: [],
          endpoint_found: false,
          correlation_id_present: false,
          missing: true
        };
        results.push(warnResult);
        warnCount++;
      }
    }

    return {
      results,
      totalChecked: Object.keys(this.contracts).length,
      passCount,
      failCount,
      warnCount
    };
  }
}

module.exports = AdapterComplianceEngine;
module.exports.AdapterComplianceEngine = AdapterComplianceEngine;
module.exports.ADAPTER_CONTRACTS = ADAPTER_CONTRACTS;
