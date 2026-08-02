const fs = require('fs');
const path = require('path');
const SecurityAnalyzer = require('./SecurityAnalyzer.cjs');

function runTest() {
    const analyzer = new SecurityAnalyzer();
    
    // Create a dummy file with vulnerabilities
    const testFile = path.resolve(__dirname, 'dummy_test_file.js');
    fs.writeFileSync(testFile, `
function login(req, res) {
    const api_key = "12345678901234567890";
    const hash = crypto.createHash('md5').update('pwd').digest('hex');
    const query = "SELECT * FROM users WHERE username = '" + req.body.username + "'";
}
    `, 'utf8');

    const findings = analyzer.analyze([testFile]);
    
    console.log("Analysis Findings:");
    console.log(JSON.stringify(findings, null, 2));

    // Cleanup
    if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
    }
}

runTest();
