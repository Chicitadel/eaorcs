const { AnalyzerSDK } = require('./AnalyzerSDK.cjs');
const { AnalyzerRegistry } = require('./AnalyzerRegistry.cjs');
const { RuleRegistry } = require('./RuleRegistry.cjs');

console.log("AnalyzerSDK loaded:", typeof AnalyzerSDK === 'function');
console.log("AnalyzerRegistry loaded:", typeof AnalyzerRegistry === 'function');
console.log("RuleRegistry loaded:", typeof RuleRegistry === 'function');

const registry = new AnalyzerRegistry();
registry.register('TestAnalyzer', '1.0.0', AnalyzerSDK);
console.log("Registered Analyzers Count:", registry.list().length);

const rules = new RuleRegistry();
rules.registerRule('TEST-001', '1.0.0', { severity: 'HIGH' });
console.log("Registered Rules Count:", rules.listRules().length);

const sdk = new AnalyzerSDK();
sdk.initialize({}).then(() => {
    console.log("SDK Initialized successfully");
    return sdk.cleanup();
}).then(() => {
    console.log("SDK Cleaned up successfully");
}).catch(err => {
    console.error("Error during SDK lifecycle:", err);
});
