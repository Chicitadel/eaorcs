/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System
 * Module         : GenomeEngine Tests
 * File           : genome.test.cjs
 * Version        : 1.0.0
 * Author         : Human Author
 * Organization   : Corporate Governance
 * Created Date   : 2026-07-31
 * Last Modified  : 2026-07-31
 * Classification : ENTERPRISE
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
 * Copyright (c) 2026 Corporate Governance
 * All Rights Reserved.
 ******************************************************************************/

const assert = require('assert');
const GenomeEngine = require('../engine/genome/GenomeEngine.cjs');
const CarbonIntelligence = require('../engine/genome/CarbonIntelligence.cjs');
const MaturityVector = require('../engine/genome/MaturityVector.cjs');

describe('Genome Engine Suite', () => {
  const mockData = {
    metadata: { ageInMonths: 24 },
    metrics: { testCoverage: 95, automationLevel: 90 },
    infrastructure: { pue: 1.1, computeEfficiency: 85, renewableEnergy: 100, idleWaste: 2 }
  };

  it('should calculate 12-dimensional genome vector', () => {
    const engine = new GenomeEngine();
    const vector = engine.calculateGenomeVector(mockData);
    
    const expectedKeys = [
      'maturity', 'reliability', 'scalability', 'maintainability', 
      'security', 'compliance', 'dx', 'techDebtVelocity', 
      'performance', 'observability', 'resilience', 'innovationIndex'
    ];
    
    for (const key of expectedKeys) {
      assert.ok(vector[key] !== undefined, `Missing dimension: ${key}`);
    }
    
    assert.strictEqual(vector.maturity, 89); // 24 + 95*0.4 + 90*0.3 = 24 + 38 + 27 = 89
  });

  it('should calculate carbon intelligence (Green Score)', () => {
    const carbon = new CarbonIntelligence();
    const score = carbon.calculateGreenScore(mockData);
    
    // Math: 100*0.5 + 85*0.3 - (1.1-1.0)*50 - 2 = 50 + 25.5 - 5 - 2 = 68.5 -> round 69
    assert.strictEqual(score, 69);
  });

  it('should generate complete genome profile', () => {
    const engine = new GenomeEngine();
    const profile = engine.generateProfile(mockData);
    
    assert.ok(profile.timestamp);
    assert.ok(profile.vector);
    assert.strictEqual(profile.carbonIntelligence, 69);
    assert.ok(typeof profile.overallHealth === 'number');
  });
});
