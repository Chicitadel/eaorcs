/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Kernel, Adapters, Providers & Runtime Subsystems Test Suite
 * File           : kernel_and_subsystems.test.js
 * Version        : 2026.1.0-LTS
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | GOVERNMENT
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
 * Copyright (c) 2026 Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

const Kernel = require('../../engine/kernel/Kernel');
const ServiceLocator = require('../../engine/kernel/ServiceLocator');
const FilesystemProvider = require('../../engine/providers/FilesystemProvider');
const MysqlProvider = require('../../engine/providers/MysqlProvider');
const RedisProvider = require('../../engine/providers/RedisProvider');
const CronProvider = require('../../engine/providers/CronProvider');
const DockerProvider = require('../../engine/providers/DockerProvider');
const KubernetesProvider = require('../../engine/providers/KubernetesProvider');
const AwsProvider = require('../../engine/providers/AwsProvider');
const AzureProvider = require('../../engine/providers/AzureProvider');
const GcpProvider = require('../../engine/providers/GcpProvider');

const StorageAdapter = require('../../adapters/StorageAdapter');
const SupportAdapter = require('../../adapters/SupportAdapter');
const BillingAdapter = require('../../adapters/BillingAdapter');
const LicensingAdapter = require('../../adapters/LicensingAdapter');
const TelemetryAdapter = require('../../adapters/TelemetryAdapter');

const Detector = require('../../engine/runtime/Detector');
const CapabilityMatrix = require('../../engine/runtime/CapabilityMatrix');
const ProfileRegistry = require('../../engine/runtime/ProfileRegistry');
const MigrationPlanner = require('../../engine/runtime/MigrationPlanner');
const Diagnostics = require('../../engine/runtime/Diagnostics');

async function runTests() {
  console.log('=== TEST SUITE: Stream A.5 (Kernel & Streaming Event Bus) ===');

  // Test 1: Kernel Boot & Container Resolution
  const kernel = new Kernel({ environment: 'test', debug: true });
  await kernel.boot();
  console.log(`[KERNEL TEST] State: ${kernel.getLifecycleState()}`);
  if (kernel.getLifecycleState() !== 'RUNNING') {
    throw new Error('Kernel lifecycle boot failed');
  }

  // Test ServiceLocator
  const resolvedKernel = ServiceLocator.get('kernel');
  if (resolvedKernel !== kernel) {
    throw new Error('ServiceLocator resolution failed');
  }

  // Test EventBus & Streaming Event Bus
  let eventFired = false;
  kernel.onEvent('test:event', (payload) => {
    eventFired = payload.status === 'OK';
  });
  await kernel.emitEvent('test:event', { status: 'OK' });
  if (!eventFired) throw new Error('EventBus emission test failed');

  // Streaming Event Bus Test
  const stream = kernel.createEventStream('stream:*');
  let streamedEventReceived = false;
  stream.on('data', (packet) => {
    if (packet.event === 'stream:test' && packet.payload.hello === 'world') {
      streamedEventReceived = true;
    }
  });

  await kernel.emitEvent('stream:test', { hello: 'world' });
  await new Promise(r => setTimeout(r, 50));
  if (!streamedEventReceived) throw new Error('Streaming event bus test failed');
  stream.destroyStream();

  // Test CapabilityRegistry & FeatureFlags
  kernel.setCapabilities({ docker: true, redis: true });
  if (!kernel.getCapability('docker')) throw new Error('CapabilityRegistry failed');

  kernel.featureFlags.setFlag('ai_council', true);
  if (!kernel.isFeatureEnabled('ai_council')) throw new Error('FeatureFlags test failed');

  // Test EDH Hypervisor & VirtualFilesystem Integration
  const hypervisor = kernel.getHypervisor();
  const vfs = kernel.getVfs();
  if (!hypervisor || !vfs) throw new Error('Hypervisor or VFS resolution failed from Kernel');

  const locHypervisor = ServiceLocator.get('hypervisor');
  const locVfs = ServiceLocator.get('vfs');
  if (locHypervisor !== hypervisor || locVfs !== vfs) throw new Error('ServiceLocator hypervisor/vfs resolution failed');

  // Verify VFS mounts
  const mounts = vfs.listMounts();
  const expectedMounts = ['/runtime_fs', '/capability_fs', '/policy_fs', '/evidence_fs', '/marketplace_fs'];
  for (const m of expectedMounts) {
    if (!mounts[m]) throw new Error(`VFS missing required mount point: ${m}`);
  }

  // Test Read-Only enforcement
  let roErrorThrown = false;
  try {
    vfs.writeFile('/runtime_fs/forbidden.txt', 'test');
  } catch (err) {
    roErrorThrown = err.message.includes('read-only');
  }
  if (!roErrorThrown) throw new Error('VFS read-only enforcement failed');

  // Test Capsule Mounting
  const capsuleId = 'capsule-test-01';
  vfs.mountCapsule(capsuleId, { 'index.js': 'module.exports = { ok: true };' });
  const readCapFile = vfs.readFile(`/capability_fs/${capsuleId}/index.js`);
  if (!readCapFile.utf8Content.includes('ok: true')) throw new Error('VFS capsule mounting test failed');
  vfs.unmountCapsule(capsuleId);

  // Test Capability Token Issuance & Single-Use Enforcement
  const token = hypervisor.issueCapabilityToken('cap-sec-audit', 'tenant-001');
  if (!token || !token.tokenId) throw new Error('Hypervisor capability token issuance failed');

  const capExecResult = hypervisor.executeCapability(token.tokenId, { scope: 'full' });
  if (!capExecResult || capExecResult.status !== 'SUCCESS') throw new Error('Hypervisor capability execution failed');

  // Second execution of single-use token MUST fail
  let singleUseErrorThrown = false;
  try {
    hypervisor.executeCapability(token.tokenId, { scope: 'full' });
  } catch (err) {
    singleUseErrorThrown = err.message.includes('single-use constraint');
  }
  if (!singleUseErrorThrown) throw new Error('Hypervisor single-use token constraint failed');

  // Test Token Revocation
  const tokenToRevoke = hypervisor.issueCapabilityToken('cap-revoke-test', 'tenant-001');
  hypervisor.revokeCapabilityToken(tokenToRevoke.tokenId);
  let revokeErrorThrown = false;
  try {
    hypervisor.executeCapability(tokenToRevoke.tokenId);
  } catch (err) {
    revokeErrorThrown = err.message.includes('Invalid or revoked');
  }
  if (!revokeErrorThrown) throw new Error('Hypervisor token revocation test failed');

  console.log('✅ STREAM A (EDH HYPERVISOR & VFS ENGINE) TESTS PASSED\n');

  console.log('=== TEST SUITE: Stream B (Complete Cloud & Host Provider Drivers) ===');

  // FilesystemProvider
  const fsProvider = new FilesystemProvider({ rootPath: './storage/scratch_test' });
  await fsProvider.write('test_fs.txt', 'hello filesystem');
  const readTxt = await fsProvider.read('test_fs.txt');
  if (readTxt !== 'hello filesystem') throw new Error('FilesystemProvider test failed');
  await fsProvider.delete('test_fs.txt');

  // MysqlProvider & RedisProvider
  const mysqlProvider = new MysqlProvider();
  const mysqlRes = await mysqlProvider.query('SELECT 1');
  if (!mysqlRes || !mysqlRes.rows) throw new Error('MysqlProvider test failed');

  const redisProvider = new RedisProvider();
  await redisProvider.set('k1', 'v1');
  const val1 = await redisProvider.get('k1');
  if (val1 !== 'v1') throw new Error('RedisProvider test failed');

  // CronProvider, DockerProvider, KubernetesProvider
  const cronProvider = new CronProvider();
  let cronRan = false;
  cronProvider.schedule('test_job', '* * * * *', () => { cronRan = true; });
  await cronProvider.triggerNow('test_job');
  if (!cronRan) throw new Error('CronProvider test failed');
  cronProvider.stopAll();

  const dockerProvider = new DockerProvider();
  const containers = await dockerProvider.listContainers();
  if (!Array.isArray(containers)) throw new Error('DockerProvider test failed');

  const k8sProvider = new KubernetesProvider();
  const pods = await k8sProvider.listPods();
  if (!Array.isArray(pods)) throw new Error('KubernetesProvider test failed');

  // AWS Provider Driver
  const awsProvider = new AwsProvider({ bucket: 'eaorcs-test-bucket' });
  const awsUpload = await awsProvider.uploadFile('test.json', { ok: true });
  if (!awsUpload || awsUpload.status !== 'uploaded') throw new Error('AwsProvider upload test failed');
  const awsRead = await awsProvider.downloadFile('test.json');
  if (!awsRead || awsRead.ok !== true) throw new Error('AwsProvider download test failed');

  // Azure Provider Driver
  const azureProvider = new AzureProvider({ containerName: 'eaorcs-test-container' });
  const azureUpload = await azureProvider.uploadBlob('blob.json', { ok: true });
  if (!azureUpload || azureUpload.status !== 'uploaded') throw new Error('AzureProvider upload test failed');
  const azureRead = await azureProvider.downloadBlob('blob.json');
  if (!azureRead || azureRead.ok !== true) throw new Error('AzureProvider download test failed');

  // GCP Provider Driver
  const gcpProvider = new GcpProvider({ bucketName: 'eaorcs-test-gcs' });
  const gcpUpload = await gcpProvider.uploadObject('obj.json', { ok: true });
  if (!gcpUpload || gcpUpload.status !== 'uploaded') throw new Error('GcpProvider upload test failed');
  const gcpRead = await gcpProvider.downloadObject('obj.json');
  if (!gcpRead || gcpRead.ok !== true) throw new Error('GcpProvider download test failed');

  // Adapters
  const storageAdapter = new StorageAdapter(undefined, true);
  await storageAdapter.write('adapter_test.json', { status: 'OK' });
  const readAdapter = await storageAdapter.read('adapter_test.json');
  if (!readAdapter || readAdapter.status !== 'OK') throw new Error('StorageAdapter test failed');
  await storageAdapter.delete('adapter_test.json');

  const supportAdapter = new SupportAdapter(undefined, true);
  const ticketRes = await supportAdapter.createSupportTicket('Bug in System', 'Details here');
  if (!ticketRes || ticketRes.status !== 'created_local') throw new Error('SupportAdapter test failed');

  const billingAdapter = new BillingAdapter(undefined, true);
  const billRes = await billingAdapter.recordMeteredEvent('tenant1', 'audits', 5);
  if (!billRes || billRes.status !== 'queued_local') throw new Error('BillingAdapter test failed');

  const licensingAdapter = new LicensingAdapter(undefined, true);
  const licRes = await licensingAdapter.verifyLicenseKey('EAORCS-ENT-XYZ');
  if (!licRes || licRes.edition !== 'Enterprise') throw new Error('LicensingAdapter test failed');

  const telemetryAdapter = new TelemetryAdapter(undefined, true);
  const telemRes = await telemetryAdapter.sendAuditMetrics({ trustScore: 98 });
  if (!telemRes || telemRes.status !== 'recorded_offline') throw new Error('TelemetryAdapter test failed');

  console.log('✅ STREAM B PROVIDERS & ADAPTERS TESTS PASSED\n');

  console.log('=== TEST SUITE: Stream C (Runtime & Host Awareness) ===');

  // Detector & CapabilityMatrix
  const detector = new Detector({ force_environment: 'SharedHost' });
  const detectRes = detector.detect();
  if (detectRes.host !== 'SharedHost') throw new Error('Detector test failed');

  // Test LiteSpeed Environment Detection
  process.env.SERVER_SOFTWARE = 'LiteSpeed/V8.1';
  const lwsDetector = new Detector();
  const lwsRes = lwsDetector.detect();
  delete process.env.SERVER_SOFTWARE;
  if (lwsRes.host !== 'LiteSpeed') throw new Error('LiteSpeed detection test failed');

  const caps = CapabilityMatrix.generate('SharedHost');
  if (caps.docker !== false || caps.memoryLimitMb !== 512) throw new Error('CapabilityMatrix test failed');

  // ProfileRegistry
  const profileNames = ProfileRegistry.getNames();
  const expectedProfiles = ['SharedHosting', 'SmallVPS', 'EnterpriseVPS', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'AirGapped'];
  for (const name of expectedProfiles) {
    if (!profileNames.includes(name)) {
      throw new Error(`ProfileRegistry missing required profile: ${name}`);
    }
  }

  // Zero-Downtime MigrationPlanner
  const planner = new MigrationPlanner('SharedHosting', 'Kubernetes');
  const plan = planner.generatePlan();
  console.log(`[MIGRATION PLANNER TEST] Generated plan: ${plan.id}, steps: ${plan.executionSteps.length}`);
  if (!plan || plan.executionSteps.length === 0) throw new Error('MigrationPlanner test failed');

  const execRes = await planner.executePlan(plan);
  if (!execRes || execRes.status !== 'SUCCESS') throw new Error('MigrationPlanner execution test failed');

  // Diagnostics
  const diagnostics = new Diagnostics({ force_environment: 'SharedHost' });
  const diagReport = await diagnostics.runFullInspection();
  console.log(`[DIAGNOSTICS TEST] Status: ${diagReport.status}, Host: ${diagReport.host}`);
  if (!diagReport || diagReport.status !== 'HEALTHY') throw new Error('Diagnostics test failed');

  console.log('✅ STREAM C RUNTIME SUBSYSTEM TESTS PASSED\n');

  await kernel.shutdown();
  console.log('🎉 ALL SUITE TESTS COMPLETED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error(`FATAL TEST ERROR: ${err.message}\n${err.stack}`);
  process.exit(1);
});
