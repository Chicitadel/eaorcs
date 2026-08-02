/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Performance Telemetry Baseline Recorder
 * File           : performance_baseline.cjs
 * Version        : 2026.1-LTS (v1.0.0-FROZEN)
 * Author         : Platform Maintainer & Operations
 * Organization   : Chicitadel / Air Roofers SASU
 * Created Date   : 2026-07-31
 * Last Modified  : 2026-07-31
 * Classification : ENTERPRISE | RESTRICTED
 ******************************************************************************/

const fs = require('fs');
const path = require('path');
const ExecutionGraph = require('../ExecutionGraph.cjs');
const AnalyzerRegistry = require('../AnalyzerRegistry.cjs');
const SecurityAnalyzer = require('../analyzers/SecurityAnalyzer.cjs');
const EvidenceBundle = require('../certification/EvidenceBundle.cjs');
const ReplayEngine = require('../certification/ReplayEngine.cjs');
const ExecutionManifest = require('../certification/ExecutionManifest.cjs');

async function recordPerformanceBaseline() {
    console.log('================================================================');
    console.log('  EAORCS PERFORMANCE TELEMETRY BASELINE RECORDER');
    console.log('================================================================\n');

    const targetDir = path.resolve(__dirname, '../../../');
    const startMemory = process.memoryUsage().heapUsed;
    const t0 = Date.now();

    const registry = new AnalyzerRegistry();
    registry.register(new SecurityAnalyzer());

    const graph = new ExecutionGraph();
    const tDiscoveryStart = Date.now();
    const result = await graph.execute(targetDir, registry.list());
    const tDiscoveryEnd = Date.now();

    const tEvidenceStart = Date.now();
    const evidenceBundle = new EvidenceBundle();
    evidenceBundle.createEvidence('security.v1', { hash: result.graph_hash });
    const tEvidenceEnd = Date.now();

    const tReplayStart = Date.now();
    const manifest = new ExecutionManifest('exec_perf', { targetDir });
    manifest.recordStep('step_1', 'graph', { hash: result.graph_hash }, { status: 'SUCCEEDED' });
    manifest.completeExecution('SUCCEEDED');
    
    const replayEngine = new ReplayEngine();
    const replayResult = replayEngine.verifyDeterminism(manifest.getManifest());
    const tReplayEnd = Date.now();

    const tEnd = Date.now();
    const peakMemoryMb = ((process.memoryUsage().heapUsed - startMemory) / (1024 * 1024)).toFixed(2);

    const baselineData = {
        timestamp: new Date().toISOString(),
        target_directory: targetDir,
        discovered_files_count: result.discovered_files_count,
        graph_execution_time_ms: tDiscoveryEnd - tDiscoveryStart,
        evidence_generation_time_ms: tEvidenceEnd - tEvidenceStart,
        replay_duration_ms: tReplayEnd - tReplayStart,
        total_pipeline_duration_ms: tEnd - t0,
        peak_memory_heap_mb: parseFloat(peakMemoryMb),
        replay_verified: replayResult.verified
    };

    console.log(`✓ Discovered Files Count:      ${baselineData.discovered_files_count}`);
    console.log(`✓ Graph Execution Duration:   ${baselineData.graph_execution_time_ms} ms`);
    console.log(`✓ Evidence Generation Time:   ${baselineData.evidence_generation_time_ms} ms`);
    console.log(`✓ Replay Verification Time:   ${baselineData.replay_duration_ms} ms`);
    console.log(`✓ Total Pipeline Duration:    ${baselineData.total_pipeline_duration_ms} ms`);
    console.log(`✓ Peak Heap Memory Delta:     ${baselineData.peak_memory_heap_mb} MB`);

    const outputPath = path.resolve(__dirname, 'performance_baseline.json');
    fs.writeFileSync(outputPath, JSON.stringify(baselineData, null, 2), 'utf8');
    console.log(`\n✓ Performance baseline emitted to: ${outputPath}`);

    console.log('\n================================================================');
    console.log('  PERFORMANCE BASELINE RECORDING: COMPLETED');
    console.log('================================================================\n');

    return baselineData;
}

if (require.main === module) {
    recordPerformanceBaseline().catch(err => {
        console.error('Performance Baseline Error:', err);
        process.exit(1);
    });
}

module.exports = recordPerformanceBaseline;
