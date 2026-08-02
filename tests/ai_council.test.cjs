/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System
 * Module         : EAORCS / Tests
 * File           : ai_council.test.cjs
 * Version        : 1.0.0
 * Author         : Human Engineering Team
 * Organization   : Ujomor
 * Created Date   : 2026-07-31
 * Last Modified  : 2026-07-31
 * Classification : GOVERNMENT | ENTERPRISE | INTERNAL
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
 * Copyright (c) 2026 Ujomor
 * All Rights Reserved.
 ******************************************************************************/

const assert = require('assert');
const AiCouncilEngine = require('../engine/ai/AiCouncilEngine.cjs');
const ConsensusProtocol = require('../engine/ai/ConsensusProtocol.cjs');
const { SpecialistAgent } = require('../engine/ai/SpecialistAgents.cjs');

async function runTests() {
    console.log('Running AI Council Tests...');

    // Test 1: Specialist Agent Initialization
    try {
        const agent = new SpecialistAgent('TestAgent', 'Test', 1.0);
        assert.strictEqual(agent.name, 'TestAgent');
        assert.strictEqual(agent.domain, 'Test');
        assert.strictEqual(agent.priorityWeight, 1.0);
        console.log('✅ Test 1 Passed: Specialist Agent Initialization');
    } catch (e) {
        console.error('❌ Test 1 Failed', e);
    }

    // Test 2: Consensus Protocol Math
    try {
        const protocol = new ConsensusProtocol(0.7);
        const mockVotes = [
            { agent: 'A1', approval: true, weight: 1.0 },
            { agent: 'A2', approval: true, weight: 2.0 },
            { agent: 'A3', approval: false, weight: 1.0 }
        ];
        const result = protocol.calculateConsensus(mockVotes);
        // Total weight = 4.0, Approval weight = 3.0. Ratio = 0.75 >= 0.7 -> true
        assert.strictEqual(result.reachedConsensus, true);
        assert.strictEqual(result.totalWeight, 4.0);
        assert.strictEqual(result.approvalWeight, 3.0);
        console.log('✅ Test 2 Passed: Consensus Protocol Math (Approved)');
    } catch (e) {
        console.error('❌ Test 2 Failed', e);
    }
    
    // Test 3: Consensus Protocol Math (Rejected)
    try {
        const protocol = new ConsensusProtocol(0.8);
        const mockVotes = [
            { agent: 'A1', approval: true, weight: 1.0 },
            { agent: 'A2', approval: true, weight: 2.0 },
            { agent: 'A3', approval: false, weight: 1.0 }
        ];
        const result = protocol.calculateConsensus(mockVotes);
        // Total weight = 4.0, Approval weight = 3.0. Ratio = 0.75 < 0.8 -> false
        assert.strictEqual(result.reachedConsensus, false);
        console.log('✅ Test 3 Passed: Consensus Protocol Math (Rejected)');
    } catch (e) {
        console.error('❌ Test 3 Failed', e);
    }

    // Test 4: AI Council Engine Orchestration
    try {
        const engine = new AiCouncilEngine();
        const result = await engine.evaluateProposal({ title: 'Migration to Cloud' });
        assert.ok(result.consensus);
        assert.strictEqual(result.votes.length, 11);
        console.log('✅ Test 4 Passed: AI Council Engine Orchestration completed evaluating 11 agents');
    } catch (e) {
        console.error('❌ Test 4 Failed', e);
    }
}

if (require.main === module) {
    runTests().then(() => console.log('All tests completed.'));
}

module.exports = { runTests };
