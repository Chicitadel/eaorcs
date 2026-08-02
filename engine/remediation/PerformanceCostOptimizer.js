/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Performance & Cost Optimizer Engine (Stream 2)
 * File           : PerformanceCostOptimizer.js
 * Version        : 2026.1-LTS (v1.0.0-FROZEN)
 * Author         : Architectural Governance Council & Ujomor Systems Engineering
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-02
 * Last Modified  : 2026-08-02
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

/**
 * PerformanceCostOptimizer
 * Calculates P95 latency savings (Redis caching, HTTP/3, Brotli compression) and
 * monthly cloud cost optimizations (idle task reduction, reserved instances, CloudFront savings).
 */
class PerformanceCostOptimizer {
    constructor(options = {}) {
        this.options = options;
    }

    /**
     * Calculates P95 latency savings across Redis, HTTP/3, and Brotli compression optimizations.
     * @param {Object} config - System performance parameters.
     * @returns {Object} Latency savings breakdown.
     */
    calculateP95LatencySavings(config = {}) {
        const baselineP95Ms = config.baselineP95Ms || 450; // default baseline latency

        // 1. Redis Caching Optimization
        const dbQueryRatio = config.dbQueryRatio || 0.65; // % of requests hitting DB
        const cacheHitRate = config.cacheHitRate || 0.85; // projected cache hit rate
        const dbQueryP95Ms = config.dbQueryP95Ms || 220;
        const redisHitP95Ms = config.redisHitP95Ms || 4;
        
        // Latency saved by caching = dbQueryRatio * cacheHitRate * (dbQueryP95Ms - redisHitP95Ms)
        const redisLatencySavingsMs = Number((dbQueryRatio * cacheHitRate * (dbQueryP95Ms - redisHitP95Ms)).toFixed(2));

        // 2. HTTP/3 (QUIC) Protocol Optimization
        // Reduces RTT connection setup + HOL blocking
        const roundTripCount = config.roundTripCount || 3;
        const averageRttMs = config.averageRttMs || 25;
        // HTTP/3 saves 1 RTT on 0-RTT handshake + eliminates TCP HOL blocking under packet loss
        const http3LatencySavingsMs = Number((1.5 * averageRttMs + (config.networkPacketLossRate || 0.02) * 100).toFixed(2));

        // 3. Brotli Compression Optimization
        // Brotli yields ~20-26% smaller text payloads than Gzip, reducing transfer latency
        const averagePayloadKb = config.averagePayloadKb || 120;
        const bandwidthMbps = config.bandwidthMbps || 50;
        const gzipCompressionRatio = 0.30;
        const brotliCompressionRatio = 0.22;
        const payloadDeltaKb = averagePayloadKb * (gzipCompressionRatio - brotliCompressionRatio);
        // Transfer time savings in ms = (payloadDeltaKb * 8 bits) / (bandwidthMbps * 1000) * 1000 ms
        const brotliLatencySavingsMs = Number(((payloadDeltaKb * 8) / bandwidthMbps).toFixed(2));

        const totalLatencySavingsMs = Number((redisLatencySavingsMs + http3LatencySavingsMs + brotliLatencySavingsMs).toFixed(2));
        const optimizedP95Ms = Math.max(10, Number((baselineP95Ms - totalLatencySavingsMs).toFixed(2)));
        const percentageImprovement = Number(((totalLatencySavingsMs / baselineP95Ms) * 100).toFixed(1));

        return {
            baselineP95Ms,
            optimizedP95Ms,
            totalLatencySavingsMs,
            percentageImprovement,
            breakdown: {
                redisCaching: {
                    savingsMs: redisLatencySavingsMs,
                    cacheHitRate: `${(cacheHitRate * 100).toFixed(0)}%`,
                    description: 'Offloads repetitive read queries to in-memory Redis cluster (4ms vs 220ms DB query).'
                },
                http3Protocol: {
                    savingsMs: http3LatencySavingsMs,
                    protocol: 'HTTP/3 (QUIC)',
                    description: 'Eliminates TCP head-of-line blocking and leverages 0-RTT connection handshake.'
                },
                brotliCompression: {
                    savingsMs: brotliLatencySavingsMs,
                    compressionGain: '24% smaller payload vs Gzip',
                    description: 'Replaces Gzip with Brotli level 6 static/dynamic compression for HTTP assets.'
                }
            }
        };
    }

    /**
     * Calculates monthly cloud infrastructure cost optimizations.
     * @param {Object} config - Infrastructure cost parameters.
     * @returns {Object} Monthly cloud cost savings breakdown.
     */
    calculateMonthlyCloudCostSavings(config = {}) {
        const currentMonthlySpend = config.currentMonthlySpend || 12500; // default monthly cloud spend

        // 1. Idle Task & Container Reclamation
        const totalContainerTasks = config.totalContainerTasks || 60;
        const idleTaskPercentage = config.idleTaskPercentage || 0.25; // 25% idle capacity
        const costPerContainerTaskMo = config.costPerContainerTaskMo || 45;
        const idleTaskSavingsMo = Number((totalContainerTasks * idleTaskPercentage * costPerContainerTaskMo).toFixed(2));

        // 2. Reserved Instances / Savings Plans
        const eligibleComputeSpendMo = config.eligibleComputeSpendMo || (currentMonthlySpend * 0.55);
        const discountRate3YearRI = config.discountRate3YearRI || 0.42; // 42% discount for 3-yr Savings Plan
        const reservedInstanceSavingsMo = Number((eligibleComputeSpendMo * discountRate3YearRI).toFixed(2));

        // 3. CloudFront Edge CDN Bandwidth Savings
        const monthlyBandwidthTB = config.monthlyBandwidthTB || 12;
        const originEgressCostPerGB = config.originEgressCostPerGB || 0.09;
        const cdnEgressCostPerGB = config.cdnEgressCostPerGB || 0.025;
        const cdnOffloadRate = config.cdnOffloadRate || 0.80; // 80% offload to edge cache
        
        const offloadedGB = monthlyBandwidthTB * 1024 * cdnOffloadRate;
        const cloudFrontSavingsMo = Number((offloadedGB * (originEgressCostPerGB - cdnEgressCostPerGB)).toFixed(2));

        const totalMonthlySavings = Number((idleTaskSavingsMo + reservedInstanceSavingsMo + cloudFrontSavingsMo).toFixed(2));
        const optimizedMonthlySpend = Number((currentMonthlySpend - totalMonthlySavings).toFixed(2));
        const totalAnnualSavings = Number((totalMonthlySavings * 12).toFixed(2));
        const savingsPercentage = Number(((totalMonthlySavings / currentMonthlySpend) * 100).toFixed(1));

        return {
            currentMonthlySpend,
            optimizedMonthlySpend,
            totalMonthlySavings,
            totalAnnualSavings,
            savingsPercentage,
            breakdown: {
                idleTaskReduction: {
                    monthlySavings: idleTaskSavingsMo,
                    reclaimedTasks: Math.round(totalContainerTasks * idleTaskPercentage),
                    description: 'Autoscaling policy adjustment & idle container task reclamation during off-peak hours.'
                },
                reservedInstances: {
                    monthlySavings: reservedInstanceSavingsMo,
                    discountRate: `${(discountRate3YearRI * 100).toFixed(0)}%`,
                    description: 'Converting baseline compute node spend to 3-Year Compute Savings Plans.'
                },
                cloudFrontSavings: {
                    monthlySavings: cloudFrontSavingsMo,
                    cdnOffloadRate: `${(cdnOffloadRate * 100).toFixed(0)}%`,
                    description: 'Edge caching static & API responses via CloudFront, reducing origin egress network costs.'
                }
            }
        };
    }

    /**
     * Generates a unified performance and financial optimization report.
     * @param {Object} systemParams 
     * @returns {Object} Full optimization report.
     */
    generateOptimizationReport(systemParams = {}) {
        const latencySavings = this.calculateP95LatencySavings(systemParams);
        const costSavings = this.calculateMonthlyCloudCostSavings(systemParams);

        return {
            reportTitle: 'EAORCS Performance & Cloud Cost Optimization Analysis',
            p95LatencySavings: latencySavings,
            monthlyCloudCostSavings: costSavings,
            executiveSummary: `Implementing proposed performance optimizations reduces P95 latency by ${latencySavings.totalLatencySavingsMs}ms (${latencySavings.percentageImprovement}% faster) while cutting monthly cloud expenditure by $${costSavings.totalMonthlySavings.toLocaleString()} (${costSavings.savingsPercentage}% spend reduction, saving $${costSavings.totalAnnualSavings.toLocaleString()} annually).`,
            generatedAt: new Date().toISOString()
        };
    }
}

module.exports = PerformanceCostOptimizer;
