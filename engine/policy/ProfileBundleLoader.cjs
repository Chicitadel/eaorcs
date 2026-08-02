/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Profile Bundle Loader
 * File           : ProfileBundleLoader.cjs
 * Version        : 2026.1-LTS (v8.1 Continuous Trust)
 * Author         : Architectural Governance Council & Policy Engine Authority
 * Organization   : Air Roofers Platform Ecosystem / EAORCS
 * Created Date   : 2026-07-31
 * Last Modified  : 2026-07-31
 * Classification : ENTERPRISE | RESTRICTED
 ******************************************************************************/

const fs = require('fs');
const path = require('path');

class ProfileBundleLoader {
    constructor(baseDir) {
        this.baseDir = baseDir || path.resolve(__dirname, '../../../');
        this.profilesDir = path.join(this.baseDir, '.governance/profiles');
    }

    loadProfile(profileName = 'enterprise') {
        const filePath = path.join(this.profilesDir, `${profileName}.policy.json`);
        if (!fs.existsSync(filePath)) {
            throw new Error(`Profile policy bundle not found: ${filePath}`);
        }
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    evaluatePassportAgainstProfile(passport, profileName = 'enterprise') {
        const profile = this.loadProfile(profileName);
        const trustScore = passport.trust_summary ? passport.trust_summary.trust_score : (passport.trust_score || 0);
        
        const scorePassed = trustScore >= profile.min_trust_score;
        const isCertified = passport.trust_summary 
            ? passport.trust_summary.certification_status === 'CERTIFIED'
            : (passport.overall_status === 'CERTIFIED' || passport.certification_status === 'CERTIFIED' || passport.ga_readiness === 100.0);

        const compliant = scorePassed && isCertified;

        return {
            profile_evaluated: profile.name,
            profile_id: profile.profile_id,
            compliant,
            trust_score: trustScore,
            required_min_trust_score: profile.min_trust_score,
            score_passed: scorePassed,
            status: compliant ? 'COMPLIANT' : 'NON_COMPLIANT',
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = ProfileBundleLoader;
