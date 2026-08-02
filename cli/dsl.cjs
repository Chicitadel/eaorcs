/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System
 * Module         : Assurance DSL Engine - CLI Integration
 * File           : dsl.cjs
 * Version        : 1.0.0
 * Author         : Human Author
 * Classification : ENTERPRISE
 ******************************************************************************/

const fs = require('fs');
const AssureRuntime = require('../dsl/AssureRuntime.cjs');

function handleCompile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }
  const script = fs.readFileSync(filePath, 'utf-8');
  const runtime = new AssureRuntime();
  try {
    runtime.loadScript(script);
    console.log("Compilation successful.");
  } catch (err) {
    console.error(`Compilation failed: ${err.message}`);
    process.exit(1);
  }
}

function handleRun(filePath, policyName, contextJson) {
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }
  const script = fs.readFileSync(filePath, 'utf-8');
  const runtime = new AssureRuntime();
  try {
    runtime.loadScript(script);
    const context = JSON.parse(contextJson);
    const result = runtime.execute(policyName, context);
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error(`Execution failed: ${err.message}`);
    process.exit(1);
  }
}

const args = process.argv.slice(2);
if (args[0] === 'dsl') {
  if (args[1] === 'compile') {
    handleCompile(args[2]);
  } else if (args[1] === 'run') {
    handleRun(args[2], args[3], args[4]);
  } else {
    console.log("Usage: node cli/dsl.cjs dsl compile <file.assure>");
    console.log("Usage: node cli/dsl.cjs dsl run <file.assure> <policy_name> '<context_json>'");
  }
}

module.exports = { handleCompile, handleRun };
