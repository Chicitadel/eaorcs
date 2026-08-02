/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System
 * Module         : Assurance DSL Engine - REST APIs
 * File           : dsl.cjs
 * Version        : 1.0.0
 * Author         : Human Author
 * Classification : ENTERPRISE
 ******************************************************************************/

const express = require('express');
const router = express.Router();
const AssureRuntime = require('../../dsl/AssureRuntime.cjs');

router.post('/compile', (req, res) => {
  const { script } = req.body;
  if (!script) {
    return res.status(400).json({ error: "Script is required" });
  }

  const runtime = new AssureRuntime();
  try {
    runtime.loadScript(script);
    res.json({ success: true, message: "Compilation successful" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post('/run', (req, res) => {
  const { script, policyName, context } = req.body;
  if (!script || !policyName || !context) {
    return res.status(400).json({ error: "script, policyName, and context are required" });
  }

  const runtime = new AssureRuntime();
  try {
    runtime.loadScript(script);
    const result = runtime.execute(policyName, context);
    res.json({ success: true, result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
