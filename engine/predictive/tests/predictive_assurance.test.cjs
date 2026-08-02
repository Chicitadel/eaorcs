/******************************************************************************
 * Project        : EAORCS
 * Module         : Predictive Assurance Tests
 * File           : predictive_assurance.test.cjs
 * Version        : 1.0.0
 * Author         : System Engineering
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
const CyberWeather = require('../CyberWeather.cjs');
const ReleaseProbability = require('../ReleaseProbability.cjs');
const TrendForecaster = require('../TrendForecaster.cjs');
const ConfidenceModel = require('../ConfidenceModel.cjs');

function runTests() {
    console.log('[TEST] Starting Predictive Assurance (P2-C) Test Suite...');

    try {
        // Test 1: CyberWeather
        const cw = new CyberWeather();
        const forecast = cw.getForecast();
        assert.ok(forecast.vectors, 'CyberWeather should return vectors object');
        assert.ok(forecast.vectors.network, 'CyberWeather should include network vector');
        assert.ok(forecast.vectors.endpoint, 'CyberWeather should include endpoint vector');
        assert.ok(forecast.vectors.identity, 'CyberWeather should include identity vector');
        assert.ok(forecast.vectors.application, 'CyberWeather should include application vector');
        assert.ok(forecast.vectors.data, 'CyberWeather should include data vector');
        assert.strictEqual(forecast.overall_severity, 'LOW', 'Default severity should be LOW');
        console.log('       [PASSED] CyberWeather Forecast');

        // Test 2: ReleaseProbability
        const rp = new ReleaseProbability();
        const prob = rp.calculate();
        assert.ok(prob.p_success > 0 && prob.p_success <= 1, 'P_success should be between 0 and 1');
        assert.ok(prob.p_rollback >= 0 && prob.p_rollback <= 1, 'P_rollback should be between 0 and 1');
        assert.ok(Math.abs((prob.p_success + prob.p_rollback) - 1.0) < 0.001, 'P_success + P_rollback should equal 1');
        assert.strictEqual(prob.recommendation, 'PROCEED', 'Default recommendation should be PROCEED');
        console.log('       [PASSED] Release Probability');

        // Test 3: TrendForecaster
        const tf = new TrendForecaster();
        const trend = tf.forecast([]);
        assert.strictEqual(trend.trend, 'STABLE', 'Default trend should be STABLE');
        assert.strictEqual(trend.horizon, '7d', 'Default horizon should be 7d');
        console.log('       [PASSED] Trend Forecaster');

        // Test 4: ConfidenceModel
        const cm = new ConfidenceModel();
        const conf = cm.evaluate({});
        assert.ok(conf.confidence_score > 0, 'Confidence score should be greater than 0');
        assert.strictEqual(conf.data_quality, 'HIGH', 'Default data quality should be HIGH');
        console.log('       [PASSED] Confidence Model');

        console.log('[TEST] All Predictive Assurance tests passed successfully.');
    } catch (err) {
        console.error('[FAILED] Test suite failed:', err.message);
        process.exit(1);
    }
}

if (require.main === module) {
    runTests();
}

module.exports = { runTests };
