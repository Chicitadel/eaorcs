'use strict';
const assert = require('assert');
const BlueprintConformanceEngine = require('../../engine/blueprint/BlueprintConformanceEngine');
const BlueprintDriftDetectorEngine = require('../../engine/blueprint/BlueprintDriftDetectorEngine');

async function testStreamA() {
  const conformance = await new BlueprintConformanceEngine().run();
  assert.strictEqual(conformance.status, 'PASS', 'BlueprintConformanceEngine: expected PASS');
  assert.strictEqual(conformance.blueprintAlignmentScore, 100.0, 'Expected 100% blueprint alignment');
  assert.strictEqual(conformance.divergenceDetected, false, 'Expected no divergence');

  const drift = await new BlueprintDriftDetectorEngine().run();
  assert.strictEqual(drift.status, 'PASS', 'BlueprintDriftDetectorEngine: expected PASS');
  assert.strictEqual(drift.missingRequirements, 0, 'Expected zero missing requirements');

  console.log('  ✅ Stream A — Blueprint Conformance: PASS');
}

module.exports = { testStreamA };
if (require.main === module) testStreamA().catch(console.error);
