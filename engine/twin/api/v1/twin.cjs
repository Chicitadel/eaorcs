/******************************************************************************
 * Project        : airroofers.eu
 * Module         : eaorcs/engine/twin/api/v1
 * File           : twin.cjs
 * Version        : 3.0.0
 * Author         : System Engineering Team
 * Organization   : Airroofers
 * Created Date   : 2026-07-31
 * Last Modified  : 2026-07-31
 * Classification : ENTERPRISE
 *
 * Governance:
 * - AI Governed
 * - Security Reviewed
 * - Architecture Controlled
 * - Protocol Frozen
 * - Modularization Enforced
 *
 * Standards:
 * - ISO 27001
 * - SOC 2
 * - OWASP ASVS
 * - NIST
 *
 * Signatures:
 * - Architecture Authority
 * - Security Authority
 * - Governance Authority
 * - Deployment Authority
 *
 * Copyright (c) 2026 Airroofers
 * All Rights Reserved.
 ******************************************************************************/

const express = require('express');
const DigitalTwinEngine = require('../../DigitalTwinEngine.cjs');

const router = express.Router();
const engine = new DigitalTwinEngine();

/**
 * GET /v1/twin/state
 * Retrieves the current state of a digital twin entity.
 */
router.get('/state', (req, res) => {
  const { entityId } = req.query;
  if (!entityId) {
    return res.status(400).json({ error: 'entityId is required' });
  }
  
  try {
    // Current state can be thought of as reconstruction at "now"
    const now = new Date().toISOString();
    const state = engine.reconstructState(entityId, now);
    res.json(state);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /v1/twin/timeline
 * Retrieves the timeline of state changes.
 */
router.get('/timeline', (req, res) => {
  const { entityId } = req.query;
  if (!entityId) {
    return res.status(400).json({ error: 'entityId is required' });
  }

  try {
    const timeline = engine.getTimeline(entityId);
    res.json(timeline);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /v1/twin/reconstruct
 * Retrieves a point-in-time state reconstruction.
 */
router.get('/reconstruct', (req, res) => {
  const { entityId, timestamp } = req.query;
  if (!entityId || !timestamp) {
    return res.status(400).json({ error: 'entityId and timestamp are required' });
  }

  try {
    const reconstructed = engine.reconstructState(entityId, timestamp);
    res.json(reconstructed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
