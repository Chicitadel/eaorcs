const assert = require('assert');
const CLICommandRegistryEngine = require('../../engine/cli/CLICommandRegistryEngine');
const SDKCapabilityRegistryEngine = require('../../engine/sdk/SDKCapabilityRegistryEngine');
const MarketplaceReadinessEngine = require('../../engine/marketplace/MarketplaceReadinessEngine');
const DashboardDataEngine = require('../../engine/ux/DashboardDataEngine');

async function runTests() {
  console.log('Running tests for EAORCS CORP Phase 4 (Commercial Surface streams)...');
  
  try {
    // S10 - CLICommandRegistryEngine
    console.log('Testing CLICommandRegistryEngine...');
    const cli = new CLICommandRegistryEngine();
    
    // 1. listCommands() returns all 16 commands
    const commands = cli.listCommands();
    assert(commands.length >= 16, 'Should have at least 16 pre-registered commands');
    
    // 2. resolveCommand('qualify') returns correct registration
    const qualifyCmd = cli.resolveCommand('qualify');
    assert(qualifyCmd && qualifyCmd.name === 'qualify', 'Should resolve command by name');
    
    // 3. resolveCommand by alias works
    const aliasCmd = cli.resolveCommand('qua');
    assert(aliasCmd && aliasCmd.name === 'qualify', 'Should resolve command by alias');
    
    // 4. formatOutput(data, 'json') returns valid JSON string
    const data = { test: 123 };
    const jsonOut = cli.formatOutput(data, 'json');
    assert.doesNotThrow(() => JSON.parse(jsonOut), 'Should produce valid JSON');
    assert(jsonOut.includes('123'), 'JSON should contain data');
    
    // 5. formatOutput(data, 'yaml') returns yaml-like string with key: value lines
    const yamlOut = cli.formatOutput(data, 'yaml');
    assert(yamlOut.includes('test: 123'), 'Should produce YAML-like output');
    
    // 6. formatOutput(data, 'quiet') returns empty or minimal output
    const quietOut = cli.formatOutput(data, 'quiet');
    assert(quietOut === '', 'Should produce empty output in quiet mode');
    
    // 7. validateFlags for known command passes
    const validRes = cli.validateFlags('qualify', { json: true });
    assert(validRes.valid === true, 'validateFlags should pass for valid flags');
    
    // 8. generateHelp returns non-empty string
    const help = cli.generateHelp('qualify');
    assert(typeof help === 'string' && help.length > 0, 'generateHelp should return non-empty string');
    console.log('CLICommandRegistryEngine OK');

    // S12 - SDKCapabilityRegistryEngine
    console.log('Testing SDKCapabilityRegistryEngine...');
    const sdk = new SDKCapabilityRegistryEngine();
    
    // 9. discoverCapabilities() returns results
    const caps = sdk.discoverCapabilities();
    assert(caps.length > 0, 'discoverCapabilities should return results');
    
    // 10. checkCompatibility returns compatible: true for matching version
    const compat = sdk.checkCompatibility('cap-0', '1.0.1');
    assert(compat.compatible === true, 'checkCompatibility should return true for matching major version');
    
    // 11. listDeprecated() runs without error
    const depr = sdk.listDeprecated();
    assert(Array.isArray(depr), 'listDeprecated should return an array');
    
    // 12. generateCompatibilityMatrix() returns matrix
    const matrix = sdk.generateCompatibilityMatrix();
    assert(Object.keys(matrix).length > 0, 'generateCompatibilityMatrix should return a matrix');
    console.log('SDKCapabilityRegistryEngine OK');

    // S9 - MarketplaceReadinessEngine
    console.log('Testing MarketplaceReadinessEngine...');
    const marketplace = new MarketplaceReadinessEngine();
    
    // 13. generateListingMetadata() returns name, version, description
    const metadata = marketplace.generateListingMetadata({ name: 'Test', version: '1.0', description: 'Desc' });
    assert(metadata.name === 'Test' && metadata.version === '1.0' && metadata.description === 'Desc', 'Metadata should match input');
    
    // 14. validateListingAssets fails when assets are missing
    const assetsValid = marketplace.validateListingAssets(['name']);
    assert(assetsValid.valid === false, 'validateListingAssets should fail if required assets are missing');
    assert(assetsValid.missing.length > 0, 'missing array should not be empty');
    
    // 15. generateCompatibilityMatrix() returns OS/runtime entries
    const mpMatrix = marketplace.generateCompatibilityMatrix();
    assert(mpMatrix.os && mpMatrix.runtime, 'Matrix should contain os and runtime entries');
    console.log('MarketplaceReadinessEngine OK');

    // S11 - DashboardDataEngine
    console.log('Testing DashboardDataEngine...');
    const dashboard = new DashboardDataEngine();
    
    // 16. getTopologyGraph() returns nodes and edges
    const graph = dashboard.getTopologyGraph('root');
    assert(graph.nodes && graph.edges, 'Graph should have nodes and edges');
    
    // 17. getGovernanceSearchIndex('Constitution') returns results
    const search = dashboard.getGovernanceSearchIndex('Constitution');
    assert(search.results && search.results.length > 0, 'Search should return results');
    
    // 18. getKPIScorecard() returns platformHealth score
    const kpi = dashboard.getKPIScorecard();
    assert(kpi.platformHealth !== undefined, 'KPI should have platformHealth');
    
    // 19. getEvidenceExplorer() returns sections array
    const explorer = dashboard.getEvidenceExplorer('pkg-1');
    assert(explorer.sections && Array.isArray(explorer.sections), 'Explorer should return sections array');
    console.log('DashboardDataEngine OK');

    console.log('\nAll tests passed successfully.');
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
}

runTests();
