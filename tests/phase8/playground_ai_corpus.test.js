/******************************************************************************
 * Project        : EAORCS - Enterprise Autonomous Operation & Regulatory Compliance System
 * Module         : Phase 8 Playground & AI Corpus Test Suite
 * File           : tests/phase8/playground_ai_corpus.test.js
 * Version        : 2026.1.0-LTS
 * Author         : Systems Engineering & Governance Authority
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
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

'use strict';

const assert = require('assert');
const { DeveloperPlaygroundPortal } = require('../../engine/portal/DeveloperPlaygroundPortal');
const { PeerReviewedAiCorpus } = require('../../engine/ai/PeerReviewedAiCorpus');

async function runTest() {
  console.log('================================================================');
  console.log('  EAORCS PHASE 8: DEVELOPER PLAYGROUND & AI CORPUS SUITE');
  console.log('================================================================\n');

  // 1. Playground
  console.log('[1/2] Testing DeveloperPlaygroundPortal...');
  const portal = new DeveloperPlaygroundPortal();
  const ui = portal.renderPlaygroundUi();
  assert(ui.includes('Developer Playground'), 'UI HTML should render title');

  const exec = portal.executePlaygroundCode('javascript', 'const x = 1;');
  assert(exec.status === 'SUCCESS', 'Execution status should be SUCCESS');

  const pyCode = portal.generateClientCode('python', 'https://api.test/v1');
  assert(pyCode.includes('import requests'), 'Python code should include requests import');

  const examples = portal.getPlaygroundExamples();
  assert(examples.length >= 2, 'Examples array length >= 2 expected');
  console.log('      ✓ DeveloperPlaygroundPortal Passed (SDK generator & execution clean)');

  // 2. AI Corpus
  console.log('[2/2] Testing PeerReviewedAiCorpus...');
  const corpus = new PeerReviewedAiCorpus();
  const ds = corpus.registerCorpusDataset('gold-500', { samples: Array.from({ length: 500 }, (_, i) => ({ id: i })) }, [
    { reviewer: 'MIT AI Lab', verdict: 'APPROVED' },
    { reviewer: 'Stanford Research', verdict: 'APPROVED' },
    { reviewer: 'ETH Zurich', verdict: 'APPROVED' }
  ]);
  assert(ds.sampleCount === 500, 'Sample count mismatch');

  const consensus = corpus.verifyCorpusConsensus('gold-500');
  assert(consensus.consensus === true, 'Peer review consensus should be true');
  assert(consensus.approvalRatio === 1, 'Approval ratio should be 100%');
  console.log('      ✓ PeerReviewedAiCorpus Passed (500-sample corpus & peer consensus clean)');

  console.log('\n================================================================');
  console.log('  DEVELOPER PLAYGROUND & AI CORPUS SUITE: ALL CHECKS PASSED');
  console.log('================================================================\n');
}

runTest().catch(e => {
  console.error('FATAL:', e.message);
  process.exit(1);
});
