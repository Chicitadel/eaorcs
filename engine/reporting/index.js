/******************************************************************************
 * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
 * Module         : EAORCS Reporting Engine Package Index (Stream 2)
 * File           : engine/reporting/index.js
 * Version        : 2026.1-LTS (v1.0.0-FROZEN)
 * Author         : Enterprise Systems Engineering & Governance Authority
 * Organization   : Enterprise Governance & Systems Engineering
 * Created Date   : 2026-08-06
 * Last Modified  : 2026-08-06
 * Classification : GOVERNMENT | ENTERPRISE | RESTRICTED
 *
 * Governance:
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
 * - Technical Operations Authority
 *
 * Copyright (c) 2026 Enterprise Governance & Systems Engineering
 * All Rights Reserved.
 ******************************************************************************/

'use strict';

const { ReportProfileEngine, PROFILE_IDS } = require('./ReportProfileEngine');
const { DynamicWidgetRegistry, EMPHASIS_LEVELS, CLASSIFICATIONS, DOMAINS } = require('./DynamicWidgetRegistry');
const ReportBundleCompiler = require('./ReportBundleCompiler');
const ReportMetadataRegistry = require('./ReportMetadataRegistry');
const DynamicBrandingService = require('./DynamicBrandingService');

module.exports = {
    ReportProfileEngine,
    PROFILE_IDS,
    DynamicWidgetRegistry,
    EMPHASIS_LEVELS,
    CLASSIFICATIONS,
    DOMAINS,
    ReportBundleCompiler,
    ReportMetadataRegistry,
    DynamicBrandingService
};
