const assert = require('assert');
const CommercialDocumentationEngine = require('../../engine/docs/CommercialDocumentationEngine');

async function testCommercialDocsSuite() {
    console.log('--- Running CommercialDocumentationEngine Tests ---');
    const engine = new CommercialDocumentationEngine();

    // 1. generateInstallationGuide
    const inst = engine.generateInstallationGuide({ platform: 'Windows' });
    assert.strictEqual(inst.sections.length, 4);
    console.log('[PASS] 1. generateInstallationGuide generated 4 sections');

    // 2. generateAdministratorGuide
    const admin = engine.generateAdministratorGuide();
    assert.strictEqual(admin.sections.length, 4);
    console.log('[PASS] 2. generateAdministratorGuide generated 4 sections');

    // 3. generateOperationsGuide
    const ops = engine.generateOperationsGuide();
    assert.strictEqual(ops.sections.length, 5);
    console.log('[PASS] 3. generateOperationsGuide generated 5 sections');

    // 4. generateEnterpriseDeploymentGuide
    const ent = engine.generateEnterpriseDeploymentGuide('PROFILE-GOVERNMENT');
    assert.strictEqual(ent.sections.length, 4);
    assert.ok(ent.title.includes('PROFILE-GOVERNMENT'));
    console.log('[PASS] 4. generateEnterpriseDeploymentGuide customized title');

    // 5. generateSDKManual
    const sdk = engine.generateSDKManual(['Governance', 'Qualification']);
    assert.strictEqual(sdk.sections.length, 4);
    console.log('[PASS] 5. generateSDKManual included capabilities');

    // 6. generatePluginAuthorGuide
    const plug = engine.generatePluginAuthorGuide();
    assert.strictEqual(plug.sections.length, 5);
    console.log('[PASS] 6. generatePluginAuthorGuide generated 5 sections');

    // 7. generateTroubleshootingManual
    const tb = engine.generateTroubleshootingManual([{ id: 'T1', symptom: 'slow', cause: 'cache', resolution: 'clear cache' }]);
    assert.strictEqual(tb.scenarios.length, 1);
    console.log('[PASS] 7. generateTroubleshootingManual generated scenarios');

    // 8. generateUpgradeGuide
    const upg = engine.generateUpgradeGuide({});
    assert.strictEqual(upg.sections.length, 4);
    console.log('[PASS] 8. generateUpgradeGuide generated 4 sections');

    // 9. exportDocumentationBundle
    const bndl = engine.exportDocumentationBundle({ install: inst }, 'index');
    assert.strictEqual(bndl.guides.length, 1);
    console.log('[PASS] 9. exportDocumentationBundle generated index');

    // 10. validateCompletenessOf
    const valGood = engine.validateCompletenessOf(inst);
    assert.strictEqual(valGood.complete, true);
    const valBad = engine.validateCompletenessOf({});
    assert.strictEqual(valBad.complete, false);
    console.log('[PASS] 10. validateCompletenessOf validated completeness');

    console.log('All CommercialDocumentationEngine tests passed.');
}

if (require.main === module) {
    testCommercialDocsSuite().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = testCommercialDocsSuite;
