/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS ADR Registry Tests
 * File           : eaorcs_corp_adr_registry.test.js
 * Version        : 2026.3.1-LTS
 * Author         : Ujomor Systems & Enterprise Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-07
 * Last Modified  : 2026-08-07
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance: Security Reviewed | Architecture Controlled | Protocol Frozen
 * CORP: Recommendation C — Formal ADR schema
 * Standards: ISO 27001 | SOC 2 | OWASP ASVS | NIST
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

const assert = require('assert');
const ADRRegistryEngine = require('../../engine/governance/ADRRegistryEngine');

const engine = new ADRRegistryEngine();

function testConstructor() {
    const adrs = engine.listADRs();
    assert.strictEqual(adrs.length, 11);
    console.log('✓ testConstructor');
}

function testRegisterADRValid() {
    const record = {
        status: 'Proposed',
        context: 'C', decision: 'D', alternatives: 'A', consequences: 'C',
        supersededBy: null, evidence: 'E', owner: 'O', effectiveDate: '2026-08-07'
    };
    const res = engine.registerADR('DEC-99', record);
    assert.strictEqual(res.valid, true);
    console.log('✓ testRegisterADRValid');
}

function testRegisterADRMissing() {
    const res = engine.registerADR('DEC-98', { status: 'Proposed' });
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.length > 0);
    console.log('✓ testRegisterADRMissing');
}

function testValidateSchema() {
    const record = {
        status: 'Proposed',
        context: 'C', decision: 'D', alternatives: 'A', consequences: 'C',
        supersededBy: null, evidence: 'E', owner: 'O', effectiveDate: '2026-08-07'
    };
    const res = engine.validateADRSchema(record);
    assert.strictEqual(res.valid, true);
    console.log('✓ testValidateSchema');
}

function testUpdateStatusValid() {
    const res = engine.updateADRStatus('DEC-99', 'Accepted');
    assert.strictEqual(res.allowed, true);
    assert.strictEqual(res.toStatus, 'Accepted');
    console.log('✓ testUpdateStatusValid');
}

function testUpdateStatusBlocked() {
    assert.throws(() => {
        engine.updateADRStatus('DEC-99', 'Accepted'); // Cannot go from Accepted to Accepted or already there
    });
    
    // Test Rejected to Accepted
    engine.updateADRStatus('DEC-99', 'Rejected');
    assert.throws(() => {
        engine.updateADRStatus('DEC-99', 'Accepted');
    });
    console.log('✓ testUpdateStatusBlocked');
}

function testListFilter() {
    const adrs = engine.listADRs({ status: 'Accepted' });
    assert.ok(adrs.length >= 11); // the original 11 are accepted
    assert.ok(adrs.every(a => a.status === 'Accepted'));
    console.log('✓ testListFilter');
}

function testSearch() {
    const adrs = engine.searchADRs('filesystem');
    assert.ok(adrs.length > 0);
    console.log('✓ testSearch');
}

function testExport() {
    const jsonStr = engine.exportADRRegistry('json');
    assert.doesNotThrow(() => JSON.parse(jsonStr));
    
    const mdStr = engine.exportADRRegistry('markdown');
    assert.ok(mdStr.includes('##'));
    console.log('✓ testExport');
}

function testGetHistory() {
    const hist = engine.getADRHistory('DEC-01');
    assert.ok(Array.isArray(hist.history));
    console.log('✓ testGetHistory');
}

testConstructor();
testRegisterADRValid();
testRegisterADRMissing();
testValidateSchema();
testUpdateStatusValid();
testUpdateStatusBlocked();
testListFilter();
testSearch();
testExport();
testGetHistory();

console.log('All ADRRegistryEngine tests passed.');
