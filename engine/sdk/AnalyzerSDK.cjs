/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Analyzer SDK
 * File           : AnalyzerSDK.cjs
 * Version        : 2026.1-LTS (v1.0.0-FROZEN)
 * Author         : Architectural Governance Council & Ujomor Systems Engineering
 * Organization   : Chicitadel / Air Roofers SASU
 * Created Date   : 2026-07-31
 * Last Modified  : 2026-07-31
 * Classification : ENTERPRISE | RESTRICTED
 ******************************************************************************/

class AnalyzerSDK {
    constructor(analyzerId, version) {
        this.analyzerId = analyzerId;
        this.version = version;
        this.supportedLanguages = [];
    }

    setSupportedLanguages(languages) {
        this.supportedLanguages = languages;
    }

    analyze(filePaths) {
        throw new Error("analyze() must be implemented by subclass");
    }

    emitFinding(finding) {
        return {
            analyzerId: this.analyzerId,
            timestamp: new Date().toISOString(),
            ...finding
        };
    }
}

module.exports = AnalyzerSDK;
