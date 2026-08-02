/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System
 * Module         : Assurance DSL Engine - Tests
 * File           : assure_dsl.test.cjs
 * Version        : 1.0.0
 * Author         : Human Author
 * Classification : ENTERPRISE
 ******************************************************************************/

const assert = require('assert');
const AssureRuntime = require('../dsl/AssureRuntime.cjs');
const AssureLexer = require('../dsl/AssureLexer.cjs');
const AssureParser = require('../dsl/AssureParser.cjs');

const testScript = `
policy "AgeVerification" {
  require age >= 18;
  deny "User must be 18 or older";
}

policy "StatusCheck" {
  require status == "active";
  deny "Status must be active";
}
`;

function runTests() {
  console.log("Running Assurance DSL Engine tests...");

  try {
    const lexer = new AssureLexer(testScript);
    const tokens = lexer.tokenize();
    assert.ok(tokens.length > 0, "Lexer should produce tokens");

    const parser = new AssureParser(tokens);
    const ast = parser.parse();
    assert.strictEqual(ast.type, 'Program', "AST root should be Program");
    assert.strictEqual(ast.policies.length, 2, "Should parse 2 policies");

    const runtime = new AssureRuntime();
    runtime.loadScript(testScript);

    // Test AgeVerification
    let result = runtime.execute("AgeVerification", { age: 20 });
    assert.strictEqual(result.success, true, "Age 20 should pass");

    result = runtime.execute("AgeVerification", { age: 16 });
    assert.strictEqual(result.success, false, "Age 16 should fail");
    assert.strictEqual(result.reason, "User must be 18 or older");

    // Test StatusCheck
    result = runtime.execute("StatusCheck", { status: "active" });
    assert.strictEqual(result.success, true, "Status active should pass");

    result = runtime.execute("StatusCheck", { status: "inactive" });
    assert.strictEqual(result.success, false, "Status inactive should fail");
    assert.strictEqual(result.reason, "Status must be active");

    console.log("All Assurance DSL tests passed deterministically!");
  } catch (err) {
    console.error("Test failed:", err.message);
    process.exit(1);
  }
}

runTests();
