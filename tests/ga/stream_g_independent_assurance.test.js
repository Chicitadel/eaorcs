'use strict';
const assert = require('assert');
const IndependentAssuranceEngine = require('../../engine/security/IndependentAssuranceEngine');

async function testStreamG() {
  const result = await new IndependentAssuranceEngine().run();
  assert.strictEqual(result.status, 'PASS', 'IndependentAssuranceEngine: expected PASS');
  assert.strictEqual(result.assuranceScorePercent, 100.0, 'Expected 100% assurance score');
  assert.strictEqual(result.slsaLevel, 4, 'Expected SLSA Level 4');
  console.log('  ✅ Stream G — Independent Assurance: PASS');
}

module.exports = { testStreamG };
if (require.main === module) testStreamG().catch(console.error);
