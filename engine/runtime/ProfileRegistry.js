/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Runtime Subsystem / Profile Registry
 * File           : ProfileRegistry.js
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

const CapabilityMatrix = require('./CapabilityMatrix');

const PROFILES = {
  SharedHosting: {
    name: 'SharedHosting',
    description: 'Constrained shared hosting (cPanel, Plesk, LiteSpeed, Apache/Nginx web hosting)',
    host: 'SharedHost',
    capabilities: CapabilityMatrix.generate('SharedHosting'),
    concurrencyLimit: 2,
    syncIntervalMs: 300000
  },
  SmallVPS: {
    name: 'SmallVPS',
    description: 'Small Virtual Private Server (1-2 vCPUs, 2GB RAM)',
    host: 'VPS',
    capabilities: CapabilityMatrix.generate('SmallVPS'),
    concurrencyLimit: 8,
    syncIntervalMs: 60000
  },
  EnterpriseVPS: {
    name: 'EnterpriseVPS',
    description: 'High performance Virtual Private Server / Dedicated BareMetal host',
    host: 'BareMetal',
    capabilities: CapabilityMatrix.generate('EnterpriseVPS'),
    concurrencyLimit: 32,
    syncIntervalMs: 15000
  },
  Docker: {
    name: 'Docker',
    description: 'Standalone Docker or Docker Compose containerized environment',
    host: 'Docker',
    capabilities: CapabilityMatrix.generate('Docker'),
    concurrencyLimit: 16,
    syncIntervalMs: 30000
  },
  Kubernetes: {
    name: 'Kubernetes',
    description: 'Cloud Native Kubernetes Cluster (EKS, AKS, GKE, or On-Prem K8s)',
    host: 'Kubernetes',
    capabilities: CapabilityMatrix.generate('Kubernetes'),
    concurrencyLimit: 64,
    syncIntervalMs: 10000
  },
  AWS: {
    name: 'AWS',
    description: 'Amazon Web Services (EC2, ECS, EKS, Lambda)',
    host: 'AWS',
    capabilities: CapabilityMatrix.generate('AWS'),
    concurrencyLimit: 64,
    syncIntervalMs: 10000
  },
  Azure: {
    name: 'Azure',
    description: 'Microsoft Azure (VM, AKS, App Service)',
    host: 'Azure',
    capabilities: CapabilityMatrix.generate('Azure'),
    concurrencyLimit: 64,
    syncIntervalMs: 10000
  },
  GCP: {
    name: 'GCP',
    description: 'Google Cloud Platform (GCE, GKE, Cloud Run)',
    host: 'GCP',
    capabilities: CapabilityMatrix.generate('GCP'),
    concurrencyLimit: 64,
    syncIntervalMs: 10000
  },
  AirGapped: {
    name: 'AirGapped',
    description: 'Zero-trust network isolated sovereign air-gapped installation',
    host: 'AirGapped',
    capabilities: CapabilityMatrix.generate('AirGapped'),
    concurrencyLimit: 16,
    syncIntervalMs: 0
  }
};

class ProfileRegistry {
  static getProfile(profileName) {
    return PROFILES[profileName] || null;
  }

  static getAllProfiles() {
    return Object.values(PROFILES);
  }

  static getNames() {
    return Object.keys(PROFILES);
  }

  static resolveProfileForHost(hostType) {
    for (const profile of Object.values(PROFILES)) {
      if (profile.host === hostType || profile.name === hostType) return profile;
    }
    if (['cPanel', 'Plesk', 'LiteSpeed', 'SharedHost'].includes(hostType)) {
      return PROFILES.SharedHosting;
    }
    if (['EKS', 'ECS'].includes(hostType)) {
      return PROFILES.AWS;
    }
    if (['AKS'].includes(hostType)) {
      return PROFILES.Azure;
    }
    if (['GKE'].includes(hostType)) {
      return PROFILES.GCP;
    }
    if (['BareMetal'].includes(hostType)) {
      return PROFILES.EnterpriseVPS;
    }
    return PROFILES.SmallVPS;
  }
}

module.exports = ProfileRegistry;
