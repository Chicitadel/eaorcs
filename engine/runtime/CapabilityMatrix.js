/******************************************************************************
 * Project        : EAORCS - The Software Trust Platform
 * Module         : Runtime Subsystem / Capability Matrix Generator
 * File           : CapabilityMatrix.js
 * Version        : 2026.1.1-LTS
 * Author         : Ujomor Systems Engineering & Governance Authority
 * Organization   : Ujomor Systems
 * Created Date   : 2026-08-01
 * Last Modified  : 2026-08-01
 * Classification : ENTERPRISE | GOVERNMENT
 * Standards      : ISO 27001, SOC 2, OWASP ASVS, NIST
 * Copyright (c) 2026 Ujomor Systems. All Rights Reserved.
 ******************************************************************************/

const PROFILES = {
  SHARED_HOST: {
    docker: false, kubernetes: false, containerized: false,
    root_access: false, systemd_supervisor: false,
    filesystem_storage: true, local_filesystem: true, s3: false,
    mysql_support: true, redis_support: false, redis: false, mysql_queue: true,
    web_cron: true, system_cron: false, apcu: true,
    hpa_autoscaling: false, configmaps: false, secrets_vault: false,
    iam_roles: false, kms_encryption: false, multi_az_resiliency: false,
    memory_limit_mb: 512, memoryLimitMb: 512,
    storageDriver: 'LocalFilesystem', cacheDriver: 'FileCache',
    queueDriver: 'DatabaseQueue', schedulerDriver: 'WebCron'
  },
  VPS: {
    docker: true, kubernetes: false, containerized: false,
    root_access: true, systemd_supervisor: true,
    filesystem_storage: true, local_filesystem: true, s3: false,
    mysql_support: true, redis_support: true, redis: true, mysql_queue: true,
    web_cron: false, system_cron: true, apcu: true,
    hpa_autoscaling: false, configmaps: false, secrets_vault: false,
    iam_roles: false, kms_encryption: false, multi_az_resiliency: false,
    memory_limit_mb: 2048, memoryLimitMb: 2048,
    storageDriver: 'LocalFilesystem', cacheDriver: 'FileCache',
    queueDriver: 'DatabaseQueue', schedulerDriver: 'SystemCron'
  },
  ENTERPRISE_VPS: {
    docker: true, kubernetes: false, containerized: false,
    root_access: true, systemd_supervisor: true,
    filesystem_storage: true, local_filesystem: true, s3: true,
    mysql_support: true, redis_support: true, redis: true, mysql_queue: true,
    web_cron: false, system_cron: true, apcu: true,
    hpa_autoscaling: false, configmaps: false, secrets_vault: false,
    iam_roles: false, kms_encryption: false, multi_az_resiliency: false,
    memory_limit_mb: 8192, memoryLimitMb: 8192,
    storageDriver: 'LocalFilesystem', cacheDriver: 'RedisCache',
    queueDriver: 'RedisQueue', schedulerDriver: 'SystemCron'
  },
  DOCKER: {
    docker: true, kubernetes: false, containerized: true,
    root_access: false, systemd_supervisor: false,
    filesystem_storage: true, local_filesystem: true, s3: true,
    mysql_support: true, redis_support: true, redis: true, mysql_queue: true,
    web_cron: false, system_cron: true, apcu: false,
    hpa_autoscaling: false, configmaps: false, secrets_vault: false,
    iam_roles: false, kms_encryption: false, multi_az_resiliency: false,
    memory_limit_mb: 4096, memoryLimitMb: 4096,
    storageDriver: 'LocalFilesystem', cacheDriver: 'RedisCache',
    queueDriver: 'RedisQueue', schedulerDriver: 'SystemCron'
  },
  KUBERNETES: {
    docker: true, kubernetes: true, containerized: true,
    root_access: false, systemd_supervisor: false,
    filesystem_storage: true, local_filesystem: true, s3: true,
    mysql_support: true, redis_support: true, redis: true, mysql_queue: true,
    web_cron: false, system_cron: false, apcu: false,
    hpa_autoscaling: true, configmaps: true, secrets_vault: true,
    iam_roles: false, kms_encryption: false, multi_az_resiliency: true,
    memory_limit_mb: 4096, memoryLimitMb: 4096,
    storageDriver: 'S3Storage', cacheDriver: 'RedisCache',
    queueDriver: 'RedisQueue', schedulerDriver: 'K8sCronJob'
  },
  CLOUD_AWS: {
    docker: true, kubernetes: true, containerized: true,
    root_access: false, systemd_supervisor: false,
    filesystem_storage: true, local_filesystem: false, s3: true,
    mysql_support: true, redis_support: true, redis: true, mysql_queue: true,
    web_cron: false, system_cron: false, apcu: false,
    hpa_autoscaling: true, configmaps: true, secrets_vault: true,
    iam_roles: true, kms_encryption: true, multi_az_resiliency: true,
    memory_limit_mb: 16384, memoryLimitMb: 16384,
    storageDriver: 'S3Storage', cacheDriver: 'RedisCache',
    queueDriver: 'RedisQueue', schedulerDriver: 'CloudWatchScheduler'
  },
  CLOUD_AZURE: {
    docker: true, kubernetes: true, containerized: true,
    root_access: false, systemd_supervisor: false,
    filesystem_storage: true, local_filesystem: false, s3: true,
    mysql_support: true, redis_support: true, redis: true, mysql_queue: true,
    web_cron: false, system_cron: false, apcu: false,
    hpa_autoscaling: true, configmaps: true, secrets_vault: true,
    iam_roles: true, kms_encryption: true, multi_az_resiliency: true,
    memory_limit_mb: 16384, memoryLimitMb: 16384,
    storageDriver: 'AzureBlobStorage', cacheDriver: 'RedisCache',
    queueDriver: 'ServiceBusQueue', schedulerDriver: 'AzureScheduler'
  },
  CLOUD_GCP: {
    docker: true, kubernetes: true, containerized: true,
    root_access: false, systemd_supervisor: false,
    filesystem_storage: true, local_filesystem: false, s3: true,
    mysql_support: true, redis_support: true, redis: true, mysql_queue: true,
    web_cron: false, system_cron: false, apcu: false,
    hpa_autoscaling: true, configmaps: true, secrets_vault: true,
    iam_roles: true, kms_encryption: true, multi_az_resiliency: true,
    memory_limit_mb: 16384, memoryLimitMb: 16384,
    storageDriver: 'GcsStorage', cacheDriver: 'RedisCache',
    queueDriver: 'PubSubQueue', schedulerDriver: 'CloudScheduler'
  },
  AIR_GAPPED: {
    docker: true, kubernetes: true, containerized: true,
    root_access: true, systemd_supervisor: true,
    filesystem_storage: true, local_filesystem: true, s3: false,
    mysql_support: true, redis_support: true, redis: true, mysql_queue: true,
    web_cron: false, system_cron: true, apcu: true,
    hpa_autoscaling: false, configmaps: true, secrets_vault: true,
    iam_roles: false, kms_encryption: true, multi_az_resiliency: false,
    air_gapped: true, airGapped: true,
    memory_limit_mb: 8192, memoryLimitMb: 8192,
    storageDriver: 'LocalFilesystem', cacheDriver: 'RedisCache',
    queueDriver: 'DatabaseQueue', schedulerDriver: 'SystemCron'
  }
};

const HOST_MAP = {
  SharedHost: 'SHARED_HOST', SharedHosting: 'SHARED_HOST',
  cPanel: 'SHARED_HOST', Plesk: 'SHARED_HOST', LiteSpeed: 'SHARED_HOST',
  VPS: 'VPS', SmallVPS: 'VPS', Apache: 'VPS', Nginx: 'VPS', IIS: 'VPS',
  EnterpriseVPS: 'ENTERPRISE_VPS', BareMetal: 'ENTERPRISE_VPS',
  Docker: 'DOCKER', ECS: 'DOCKER',
  Kubernetes: 'KUBERNETES', EKS: 'KUBERNETES', AKS: 'KUBERNETES', GKE: 'KUBERNETES',
  Cloud_AWS: 'CLOUD_AWS', AWS: 'CLOUD_AWS',
  Cloud_Azure: 'CLOUD_AZURE', Azure: 'CLOUD_AZURE',
  Cloud_GCP: 'CLOUD_GCP', GCP: 'CLOUD_GCP',
  AirGapped: 'AIR_GAPPED'
};

class CapabilityMatrix {
  static generate(hostType) {
    const profileKey = HOST_MAP[hostType] || 'SHARED_HOST';
    return Object.assign({}, PROFILES[profileKey]);
  }
}

module.exports = CapabilityMatrix;
