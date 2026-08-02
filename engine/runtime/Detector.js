/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Runtime Subsystem / Deep Host Detector
 * File           : Detector.js
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

const fs = require('fs');
const os = require('os');

class Detector {
  constructor(config = {}) {
    this.config = config;
  }

  detect() {
    if (this.config.force_environment) {
      return {
        host: this.config.force_environment,
        source: 'configuration',
        confidence: 1.0,
        metadata: { forced: true }
      };
    }

    // 1. Kubernetes Clusters (EKS, AKS, GKE, Generic K8s)
    if (process.env.KUBERNETES_SERVICE_HOST || fs.existsSync('/var/run/secrets/kubernetes.io')) {
      let subHost = 'Kubernetes';
      if (process.env.AWS_EXECUTION_ENV || process.env.EKS_CLUSTER_NAME) subHost = 'EKS';
      else if (process.env.AKS_ARM_CLIENT_ID || process.env.AZURE_HTTP_USER_AGENT || process.env.AKS_CLUSTER_NAME) subHost = 'AKS';
      else if (process.env.GKE_CLUSTER_NAME || process.env.GKE_SERVICE_ACCOUNT) subHost = 'GCP';

      return {
        host: subHost,
        source: 'auto-detection',
        confidence: 0.98,
        metadata: {
          kubernetes: true,
          serviceHost: process.env.KUBERNETES_SERVICE_HOST || null,
          subHost
        }
      };
    }

    // 2. AWS Cloud & ECS Container Service
    if (process.env.AWS_EXECUTION_ENV || process.env.ECS_CONTAINER_METADATA_URI || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      const isEcs = Boolean(
        (process.env.AWS_EXECUTION_ENV && process.env.AWS_EXECUTION_ENV.includes('ECS')) ||
        process.env.ECS_CONTAINER_METADATA_URI ||
        process.env.ECS_CONTAINER_METADATA_URI_V4
      );
      return {
        host: isEcs ? 'ECS' : 'AWS',
        source: 'auto-detection',
        confidence: 0.95,
        metadata: {
          awsRegion: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'unknown',
          ecs: isEcs
        }
      };
    }

    // 3. Azure Cloud & App Service
    if (process.env.WEBSITE_SITE_NAME || process.env.AZURE_REGION || process.env.FUNCTIONS_WORKER_RUNTIME) {
      return {
        host: 'Azure',
        source: 'auto-detection',
        confidence: 0.95,
        metadata: {
          siteName: process.env.WEBSITE_SITE_NAME || null,
          azureRegion: process.env.AZURE_REGION || process.env.LOCATION || null
        }
      };
    }

    // 4. GCP Cloud (Cloud Run, App Engine, GCE)
    if (process.env.GAE_APPLICATION || process.env.K_SERVICE || process.env.GCP_PROJECT_ID || fs.existsSync('/etc/gcp_instance')) {
      return {
        host: 'GCP',
        source: 'auto-detection',
        confidence: 0.95,
        metadata: {
          service: process.env.K_SERVICE || process.env.GAE_SERVICE || null,
          projectId: process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || null
        }
      };
    }

    // 5. Docker Container Isolation
    if (fs.existsSync('/.dockerenv') || process.env.DOCKER_CONTAINER) {
      return {
        host: 'Docker',
        source: 'auto-detection',
        confidence: 0.90,
        metadata: { dockerenv: true }
      };
    }

    // 6. Web Servers & Shared Hosting Control Panels
    const docRoot = process.env.DOCUMENT_ROOT || '';
    const serverSoftware = process.env.SERVER_SOFTWARE || '';

    // cPanel Control Panel
    if (docRoot.includes('cpanel') || docRoot.includes('public_html') || fs.existsSync('/usr/local/cpanel')) {
      return {
        host: 'cPanel',
        source: 'auto-detection',
        confidence: 0.90,
        metadata: { controlPanel: 'cPanel' }
      };
    }

    // Plesk Control Panel
    if (fs.existsSync('/usr/local/psa') || docRoot.includes('plesk')) {
      return {
        host: 'Plesk',
        source: 'auto-detection',
        confidence: 0.90,
        metadata: { controlPanel: 'Plesk' }
      };
    }

    // LiteSpeed Web Server
    if (serverSoftware.toLowerCase().includes('litespeed') || fs.existsSync('/usr/local/lsws') || process.env.LSWS_HOME) {
      return {
        host: 'LiteSpeed',
        source: 'auto-detection',
        confidence: 0.88,
        metadata: { webServer: 'LiteSpeed' }
      };
    }

    // Microsoft IIS Web Server
    if (process.env.APP_POOL_ID || serverSoftware.toLowerCase().includes('microsoft-iis')) {
      return {
        host: 'IIS',
        source: 'auto-detection',
        confidence: 0.85,
        metadata: { webServer: 'IIS' }
      };
    }

    // Apache HTTP Server
    if (serverSoftware.toLowerCase().includes('apache')) {
      return {
        host: 'Apache',
        source: 'auto-detection',
        confidence: 0.80,
        metadata: { webServer: 'Apache' }
      };
    }

    // Nginx Web Server
    if (serverSoftware.toLowerCase().includes('nginx')) {
      return {
        host: 'Nginx',
        source: 'auto-detection',
        confidence: 0.80,
        metadata: { webServer: 'Nginx' }
      };
    }

    // 7. Bare Metal vs Virtual Private Server (VPS)
    const memMb = Math.round(os.totalmem() / (1024 * 1024));
    const cpusCount = os.cpus().length;
    const isBareMetal = cpusCount >= 16 && memMb >= 32768;

    return {
      host: isBareMetal ? 'BareMetal' : 'VPS',
      source: 'auto-detection',
      confidence: 0.75,
      metadata: { cpus: cpusCount, totalMemoryMb: memMb }
    };
  }
}

module.exports = Detector;
