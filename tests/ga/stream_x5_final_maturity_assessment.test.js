'use strict';
const assert = require('assert');
const FinalMaturityAssessmentEngine = require('../../engine/governance/FinalMaturityAssessmentEngine');

async function testStreamX5() {
  const result = await new FinalMaturityAssessmentEngine().run();
  assert.strictEqual(result.status, 'PASS', 'FinalMaturityAssessmentEngine: expected PASS');
  assert.strictEqual(result.baselineClosed, true, 'Expected baseline closed');
  assert.strictEqual(result.implementationComplete, true, 'Expected implementation complete');
  assert.strictEqual(result.overallImplementationMaturityScore, 98.5, 'Expected maturity score 98.5');
  assert.strictEqual(result.masterSuitesPassed, 15, 'Expected 15/15 suites passed');
  assert.strictEqual(result.gaIntelligenceScorePercent, 100.0, 'Expected 100% GA intelligence score');
  assert.strictEqual(result.frozenComponents.length, 7, 'Expected 7 frozen components');
  assert.strictEqual(result.verdict, 'EAORCS_2026_1_0_GA_IMPLEMENTATION_BASELINE_CLOSED', 'Expected closure verdict');
  console.log('  ✅ Stream X5 — Final Maturity Assessment: PASS');
  console.log(`     Release: ${result.release} | Maturity: ${result.overallImplementationMaturityScore}/100 | Baseline: CLOSED`);
}

module.exports = { testStreamX5 };
if (require.main === module) testStreamX5().catch(console.error);
