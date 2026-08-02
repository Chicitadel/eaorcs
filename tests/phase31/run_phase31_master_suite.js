const assert = require('assert');
const { execSync } = require('child_process');
const Phase31LivePlatformIntelligenceOrchestrator = require('../../engine/audit/Phase31LivePlatformIntelligenceOrchestrator');
const path = require('path');

async function runTests() {
    try {
        console.log('Running test for Stream 7...');
        execSync(`node "${path.join(__dirname, 'stream_s7_engineering_intelligence_knowledge_graph.test.js')}"`, { stdio: 'inherit' });
        
        console.log('Running test for Stream 8...');
        execSync(`node "${path.join(__dirname, 'stream_s8_autonomous_quality_intelligence.test.js')}"`, { stdio: 'inherit' });
        
        console.log('Running test for Stream 9...');
        execSync(`node "${path.join(__dirname, 'stream_s9_ecosystem_intelligence_kernel.test.js')}"`, { stdio: 'inherit' });

        console.log('Running master orchestrator...');
        const orchestrator = new Phase31LivePlatformIntelligenceOrchestrator();
        const result = await orchestrator.run();

        assert.strictEqual(result.phase, 'PHASE_31');
        assert.strictEqual(result.totalStreams, 9);
        assert.strictEqual(result.passedStreams, 9);
        assert.strictEqual(result.livePlatformAssuranceScorePercent, 100.0);
        assert.strictEqual(result.overallStatus, 'LIVE_PLATFORM_INTELLIGENCE_ECOSYSTEM_OPERATIONAL_ASSURANCE_COMPLETE');
        assert.strictEqual(result.phase31Verdict, 'PHASE_31_LIVE_PLATFORM_INTELLIGENCE_ECOSYSTEM_OPERATIONAL_ASSURANCE_COMPLETE');

        console.log('Phase 31 Master Orchestrator test passed');
        process.exit(0);
    } catch (err) {
        console.error('Test suite failed:', err);
        process.exit(1);
    }
}

runTests();
