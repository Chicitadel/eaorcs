/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS UTCF Adapter Engine
 * File           : utcf_adapter_engine.js
 * Version        : 2026.1-LTS
 * Author         : Architectural Governance Council & Ujomor Systems Engineering
 * Organization   : Ujomor Systems Ecosystem
 * Created Date   : 2026-07-31
 * Last Modified  : 2026-07-31
 * Classification : ENTERPRISE | RESTRICTED
 ******************************************************************************/

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class UTCFAdapterEngine {
    constructor(registryPath = null) {
        const defaultPath = path.join(__dirname, 'utcf_registry.json');
        this.registryPath = registryPath || defaultPath;
        this.registry = this.loadRegistry();
    }

    loadRegistry() {
        try {
            if (fs.existsSync(this.registryPath)) {
                return JSON.parse(fs.readFileSync(this.registryPath, 'utf8'));
            }
        } catch (err) {
            console.error(`[UTCFAdapterEngine] Failed to load registry from ${this.registryPath}:`, err.message);
        }
        return { totalLayers: 20, layers: [] };
    }

    evaluateCoverage(workspacePath) {
        const layerResults = [];

        for (const layerDef of this.registry.layers || []) {
            const matchedAdapters = [];
            
            if (layerDef.layer === 1) { // Languages
                if (fs.existsSync(path.join(workspacePath, 'composer.json'))) matchedAdapters.push('PHP');
                if (fs.existsSync(path.join(workspacePath, 'package.json'))) matchedAdapters.push('TypeScript', 'JavaScript');
            } else if (layerDef.layer === 2) { // Frameworks
                if (fs.existsSync(path.join(workspacePath, 'public_html'))) matchedAdapters.push('Laravel / Custom MVC');
            } else if (layerDef.layer === 6) { // CI/CD
                if (fs.existsSync(path.join(workspacePath, '.github'))) matchedAdapters.push('GitHub Actions');
            } else if (layerDef.layer === 12) { // IaC
                if (fs.existsSync(path.join(workspacePath, '.deploy.yaml'))) matchedAdapters.push('Deploy Manifest');
            } else if (layerDef.layer === 18) { // Compliance
                matchedAdapters.push('ISO 27001', 'SOC 2 Type II', 'PCI DSS v4.0', 'GDPR');
            } else {
                matchedAdapters.push((layerDef.adapters && layerDef.adapters[0]) ? layerDef.adapters[0] : 'Generic Adapter');
            }

            layerResults.push({
                layer: layerDef.layer,
                name: layerDef.name,
                status: matchedAdapters.length > 0 ? 'COVERED' : 'N/A',
                activeAdapters: matchedAdapters
            });
        }

        const coveredCount = layerResults.filter(l => l.status === 'COVERED').length;
        const total = this.registry.totalLayers || 20;
        const coveragePercentage = (coveredCount / total) * 100;

        return {
            totalLayers: total,
            coveredCount,
            coveragePercentage,
            layerResults
        };
    }
}

export default UTCFAdapterEngine;
