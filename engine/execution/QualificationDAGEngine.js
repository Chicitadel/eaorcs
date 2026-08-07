/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Qualification DAG Engine
 * File           : QualificationDAGEngine.js
 * Version        : 2026.3.1-LTS
 * Author         : Ujomor Systems & Enterprise Governance Authority
 * Organization   : Ujomor Systems & Enterprise Governance
 * Created Date   : 2026-08-07
 * Last Modified  : 2026-08-07
 * Classification : ENTERPRISE | RESTRICTED
 *
 * Governance:
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 * - Corporate Policy Governed
 *
 * CORP: Stream S4
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
 ******************************************************************************/

class QualificationDAGEngine {
    constructor() {
        this.streams = new Map();
        this.statuses = new Map();
        
        // Pre-register default streams
        this.registerStream('S_TRACEABILITY', 'Traceability', [], async () => true);
        this.registerStream('S_ARCHITECTURE', 'Architecture', [], async () => true);
        this.registerStream('S_SECURITY', 'Security', ['S_TRACEABILITY'], async () => true);
        this.registerStream('S_GOVERNANCE', 'Governance', ['S_ARCHITECTURE'], async () => true);
        this.registerStream('S_COMMERCIAL', 'Commercial', ['S_SECURITY', 'S_GOVERNANCE'], async () => true);
        this.registerStream('S_RELEASE', 'Release', ['S_COMMERCIAL'], async () => true);
    }

    registerStream(streamId, name, dependencies, executorFn) {
        this.streams.set(streamId, { id: streamId, name, dependencies, executorFn });
        this.statuses.set(streamId, 'PENDING');
    }

    buildDAG() {
        return Array.from(this.streams.values());
    }

    detectCycles() {
        const visited = new Set();
        const recursionStack = new Set();
        const cycles = [];

        const dfs = (nodeId) => {
            if (recursionStack.has(nodeId)) {
                cycles.push(nodeId);
                return true;
            }
            if (visited.has(nodeId)) return false;

            visited.add(nodeId);
            recursionStack.add(nodeId);

            const stream = this.streams.get(nodeId);
            if (stream) {
                for (const dep of stream.dependencies) {
                    if (dfs(dep)) return true;
                }
            }

            recursionStack.delete(nodeId);
            return false;
        };

        let hasCycles = false;
        for (const streamId of this.streams.keys()) {
            if (dfs(streamId)) {
                hasCycles = true;
                break;
            }
        }

        return { hasCycles, cycles };
    }

    getExecutionOrder() {
        const order = [];
        const visited = new Set();

        const dfs = (nodeId) => {
            if (visited.has(nodeId)) return;
            visited.add(nodeId);
            const stream = this.streams.get(nodeId);
            if (stream) {
                for (const dep of stream.dependencies) {
                    dfs(dep);
                }
            }
            order.push(nodeId);
        };

        for (const streamId of this.streams.keys()) {
            dfs(streamId);
        }

        return order;
    }

    async executeDAG(options = {}) {
        const start = Date.now();
        const order = this.getExecutionOrder();
        const passed = [];
        const failed = [];
        const skipped = [];

        for (const streamId of order) {
            const stream = this.streams.get(streamId);
            let depsPassed = true;
            for (const dep of stream.dependencies) {
                if (!passed.includes(dep)) {
                    depsPassed = false;
                    break;
                }
            }

            if (!depsPassed) {
                this.statuses.set(streamId, 'SKIPPED');
                skipped.push(streamId);
                continue;
            }

            try {
                this.statuses.set(streamId, 'RUNNING');
                const result = await stream.executorFn();
                if (result) {
                    this.statuses.set(streamId, 'PASSED');
                    passed.push(streamId);
                } else {
                    this.statuses.set(streamId, 'FAILED');
                    failed.push(streamId);
                }
            } catch (err) {
                this.statuses.set(streamId, 'FAILED');
                failed.push(streamId);
            }
        }

        return { passed, failed, skipped, totalMs: Date.now() - start };
    }

    async executeIncremental(invalidatedStreamIds, options = {}) {
        const dependents = new Set(invalidatedStreamIds);
        
        let changed = true;
        while(changed) {
            changed = false;
            for (const stream of this.streams.values()) {
                if (!dependents.has(stream.id)) {
                    for (const dep of stream.dependencies) {
                        if (dependents.has(dep)) {
                            dependents.add(stream.id);
                            changed = true;
                            break;
                        }
                    }
                }
            }
        }
        
        const originalExecutors = new Map();
        for (const stream of this.streams.values()) {
            if (!dependents.has(stream.id)) {
                originalExecutors.set(stream.id, stream.executorFn);
                stream.executorFn = async () => true; 
            }
        }
        
        const res = await this.executeDAG(options);
        
        for (const [id, fn] of originalExecutors) {
            this.streams.get(id).executorFn = fn;
        }

        return res;
    }

    getStreamStatus(streamId) {
        return this.statuses.get(streamId);
    }
}

module.exports = QualificationDAGEngine;
