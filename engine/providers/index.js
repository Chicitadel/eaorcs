/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Provider Framework Index
 * File           : index.js
 * Version        : 2026.1.0-LTS
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | GOVERNMENT
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
 * Copyright (c) 2026 Ujomor Systems
 * All Rights Reserved.
 ******************************************************************************/

const FilesystemProvider = require('./FilesystemProvider');
const MysqlProvider = require('./MysqlProvider');
const RedisProvider = require('./RedisProvider');
const CronProvider = require('./CronProvider');
const DockerProvider = require('./DockerProvider');
const KubernetesProvider = require('./KubernetesProvider');
const AwsProvider = require('./AwsProvider');
const AzureProvider = require('./AzureProvider');
const GcpProvider = require('./GcpProvider');

module.exports = {
  FilesystemProvider,
  MysqlProvider,
  RedisProvider,
  CronProvider,
  DockerProvider,
  KubernetesProvider,
  AwsProvider,
  AzureProvider,
  GcpProvider
};
