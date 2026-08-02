/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Runtime Providers Test Suite
 * File           : providers.test.js
 * Version        : 2026.1-LTS
 * Organization   : Ujomor Systems Engineering
 * Classification : ENTERPRISE
 ******************************************************************************/

const StorageProvider = require('../../engine/runtime/StorageProvider');
const CacheProvider = require('../../engine/runtime/CacheProvider');
const QueueProvider = require('../../engine/runtime/QueueProvider');
const IdentityAdapter = require('../../adapters/IdentityAdapter');

async function testProviders() {
  console.log('=== TEST: Runtime Provider Drivers & Adapters ===');

  // Test StorageProvider
  const storage = new StorageProvider('LocalFilesystem', { local_path: './storage/test_data' });
  const writeRes = await storage.write('test_key.json', { status: 'OK', test: true });
  console.log(`[STORAGE TEST] Write result status: ${writeRes.status}`);
  const readRes = await storage.read('test_key.json');
  if (!readRes || readRes.status !== 'OK') throw new Error('Storage write/read verification failed');

  // Test CacheProvider
  const cache = new CacheProvider('FileCache');
  await cache.set('user_123', 'John Doe');
  const cachedValue = await cache.get('user_123');
  console.log(`[CACHE TEST] Cached value: ${cachedValue}`);
  if (cachedValue !== 'John Doe') throw new Error('Cache verification failed');

  // Test QueueProvider
  const queue = new QueueProvider('DatabaseQueue');
  const job = await queue.push('audit:execute', { target: 'airroofers.eu' });
  console.log(`[QUEUE TEST] Job pushed: ${job.id}`);
  const popped = await queue.pop();
  if (!popped || popped.id !== job.id) throw new Error('Queue verification failed');

  // Test IdentityAdapter Fallback
  const identity = new IdentityAdapter('https://identity.airroofers.eu/api/v1', true);
  const auth = await identity.authenticate('local-dev-token');
  console.log(`[IDENTITY TEST] Auth source: ${auth.source}, Authenticated: ${auth.authenticated}`);
  if (!auth.authenticated) throw new Error('Identity fallback assertion failed');

  console.log('✅ ALL RUNTIME PROVIDER & ADAPTER TESTS PASSED\n');
}

testProviders().catch(err => {
  console.error(`FATAL PROVIDER TEST FAILURE: ${err.message}`);
  process.exit(1);
});
