/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Host Awareness Test Suite
 * File           : host_awareness.test.js
 * Version        : 2026.1-LTS
 * Organization   : Ujomor Systems Engineering
 * Classification : ENTERPRISE
 ******************************************************************************/

const HostAwarenessEngine = require('../../engine/runtime/HostAwarenessEngine');

function testHostDetection() {
  console.log('=== TEST: HostAwarenessEngine Auto-Detection ===');

  // Test 1: Auto detection on local environment
  const engine1 = new HostAwarenessEngine();
  const res1 = engine1.detectHostEnvironment();
  console.log(`[TEST 1] Default Detection -> Host: ${res1.host}, Source: ${res1.source}`);
  if (!res1.host) throw new Error('Host detection failed: returned empty host');

  // Test 2: Forced SharedHost Environment
  const engine2 = new HostAwarenessEngine({ force_environment: 'SharedHost' });
  const res2 = engine2.detectHostEnvironment();
  console.log(`[TEST 2] Forced SharedHost -> Host: ${res2.host}, Docker: ${res2.capabilities.docker}`);
  if (res2.host !== 'SharedHost' || res2.capabilities.docker !== false) {
    throw new Error('Forced SharedHost capabilities assertion failed');
  }

  // Test 3: Forced Kubernetes Environment
  const engine3 = new HostAwarenessEngine({ force_environment: 'Kubernetes' });
  const res3 = engine3.detectHostEnvironment();
  console.log(`[TEST 3] Forced Kubernetes -> Host: ${res3.host}, S3: ${res3.capabilities.s3}`);
  if (res3.host !== 'Kubernetes' || res3.capabilities.s3 !== true) {
    throw new Error('Forced Kubernetes capabilities assertion failed');
  }

  console.log('✅ ALL HOST AWARENESS TESTS PASSED\n');
}

testHostDetection();
