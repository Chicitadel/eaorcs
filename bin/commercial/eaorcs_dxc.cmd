@REM /******************************************************************************
@REM  * Project        : Universal Autonomous AI Governance Operating System (UAIGOS)
@REM  * Module         : EAORCS DXC CLI Launcher (CMD)
@REM  * File           : eaorcs_dxc.cmd
@REM  * Version        : 2026.3.1-LTS
@REM  * Author         : Ujomor Systems & Enterprise Governance Authority
@REM  * Organization   : Ujomor Systems & Enterprise Governance
@REM  * Created Date   : 2026-08-07
@REM  * Last Modified  : 2026-08-07
@REM  * Classification : ENTERPRISE | RESTRICTED
@REM  *
@REM  * Governance:
@REM  * - Security Reviewed
@REM  * - Architecture Controlled
@REM  * - Protocol Frozen
@REM  * - Modularization Enforced
@REM  * - Corporate Policy Governed
@REM  *
@REM  * CORP: Subsystem 2 — DX CLI Launchers & REST API Endpoints
@REM  *
@REM  * Standards:
@REM  * - ISO 27001
@REM  * - SOC 2
@REM  * - OWASP ASVS
@REM  * - NIST
@REM  *
@REM  * Copyright (c) 2026 Ujomor Systems & Enterprise Governance. All Rights Reserved.
@REM  ******************************************************************************/
@echo off
node "%~dp0eaorcs_dxc.js" %*
