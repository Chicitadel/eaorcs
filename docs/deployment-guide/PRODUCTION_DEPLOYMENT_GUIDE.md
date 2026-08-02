<!--
==============================================================================
 Project        : EAORCS Enterprise Platform
 Module         : Operations & Infrastructure
 File           : PRODUCTION_DEPLOYMENT_GUIDE.md
 Version        : 3.0.0
 Author         : Principal Operations Architect & Infrastructure Security Board
 Organization   : Ujomor Platform Engineering
 Created Date   : 2026-08-01
 Last Modified  : 2026-08-01
 Classification : ENTERPRISE / RESTRICTED

 Governance:
 - Enterprise Security Reviewed
 - Architecture Controlled
 - Protocol Frozen
 - Production Operations Standardized

 Standards:
 - ISO/IEC 27001:2022 Annex A.8.19
 - NIST SP 800-145 / 800-53 Rev. 5
 - SOC 2 Type II Availability & Security Criteria

 Signatures:
 - Infrastructure Authority : Operations Review Board
 - Security Authority       : Enterprise CISO Office
 - Architecture Authority   : Platform Architecture Steering Committee
 - Deployment Authority     : Global Release Engineering

 Copyright (c) 2026 Ujomor Platform Engineering. All Rights Reserved.
==============================================================================
-->

# EAORCS Enterprise Edition: Production Deployment Guide

## 1. Executive Summary & Architecture Overview

The Enterprise Autonomous Orchestration & Resiliency Control System (EAORCS) is engineered for high-throughput, mission-critical environments requiring continuous operation, zero data loss, and strict cryptographic auditability.

This guide defines the standardized infrastructure requirements, automated deployment pipelines, zero-trust network boundaries, and continuous delivery patterns required to operate EAORCS Enterprise Edition in multi-region Kubernetes environments.

```
                  +-------------------------------------------------------+
                  |              Global Anycast Ingress L7                |
                  +-------------------------------------------------------+
                                              | mTLS 1.3
                                              v
                  +-------------------------------------------------------+
                  |         Istio Service Mesh Gateway (eBPF)             |
                  +-------------------------------------------------------+
                                              |
                     +------------------------+------------------------+
                     | mTLS SPIFFE/SPIRE                               | mTLS SPIFFE/SPIRE
                     v                                                 v
   +------------------------------------+             +------------------------------------+
   |   EAORCS Control Engine (Active)   |             |   EAORCS Control Engine (Standby)  |
   |   - Pod Disruption Budget: Min 2   |             |   - Pod Disruption Budget: Min 2   |
   |   - HSM / Vault Integration        |             |   - HSM / Vault Integration        |
   +------------------------------------+             +------------------------------------+
                     |                                                 |
                     +------------------------+------------------------+
                                              | Zero-Trust Cilium Policy
                                              v
   +---------------------------------------------------------------------------------------+
   |                        Distributed Consensus & Persistence Layer                      |
   |   - Sync Multi-Region PostgreSQL Cluster (RPO=0s)                                    |
   |   - Distributed Raft Event Log with Ed25519 Signature Verification                   |
   +---------------------------------------------------------------------------------------+
```

---

## 2. Infrastructure Requirements & Prerequisites

### 2.1 Minimum Kubernetes Cluster Specifications

| Component | Minimum Specification (Per Region) | Recommended Production Spec |
| :--- | :--- | :--- |
| **Kubernetes Version** | `v1.30.0` or higher | `v1.31.x` LTS |
| **Node Architecture** | 3 Workers (`x86_64` or `arm64`) | 6+ Multi-AZ Workers (`x86_64`) |
| **CPU / Memory per Node** | 8 vCPU / 32 GB RAM | 16 vCPU / 64 GB ECC RAM |
| **Container Runtime** | `containerd` v1.7+ with `seccomp` | `containerd` with hardened `AppArmor/seccomp` |
| **CNI Plugin** | Cilium v1.15+ (eBPF Strict Mode) | Cilium v1.16+ with High-Bandwidth eBPF |
| **Storage Class** | NVMe-backed CSI with Encryption at Rest | NVMe Direct-Attached CSI (FIPS 140-3 Cryptography) |

---

## 3. Helm Chart Configuration & Deployment Manifests

### 3.1 Standard Production `values.yaml`

```yaml
global:
  environment: production
  clusterName: eaorcs-prod-us-east-1
  domain: eaorcs.enterprise.internal

replicaCount: 3

image:
  repository: registry.enterprise.internal/eaorcs/control-engine
  tag: "v3.0.0"
  pullPolicy: IfNotPresent
  digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"

resources:
  limits:
    cpu: "4000m"
    memory: "8Gi"
  requests:
    cpu: "2000m"
    memory: "4Gi"

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 12
  targetCPUUtilizationPercentage: 70
  targetMemoryUtilizationPercentage: 75

podDisruptionBudget:
  minAvailable: 2

securityContext:
  allowPrivilegeEscalation: false
  readOnlyRootFilesystem: true
  runAsNonRoot: true
  runAsUser: 10001
  runAsGroup: 10001
  capabilities:
    drop:
      - ALL
  seccompProfile:
    type: RuntimeDefault

hsm:
  enabled: true
  provider: PKCS11
  endpoint: "hsm-cluster.security.internal:1111"
  slotId: 0
  keyLabel: "eaorcs-master-ed25519"
  pinSecretName: "eaorcs-hsm-credentials"

persistence:
  syncReplication: true
  rpoMode: ZeroDataLoss
  primaryUrlSecret: "eaorcs-db-primary-dsn"
  replicaUrlSecret: "eaorcs-db-replica-dsn"
```

### 3.2 Helm Release Execution

```bash
helm upgrade --install eaorcs-core ./charts/eaorcs-core \
  --namespace eaorcs-system \
  --create-namespace \
  --values ./charts/eaorcs-core/values-production.yaml \
  --atomic \
  --timeout 5m0s
```

---

## 4. Zero-Trust Network Security & Microsegmentation

EAORCS enforces strict microsegmentation using Cilium eBPF network policies. All default ingress and egress traffic is blocked unless explicitly whitelisted.

```yaml
apiVersion: cilium.io/v2
kind: CiliumNetworkPolicy
metadata:
  name: eaorcs-engine-zero-trust
  namespace: eaorcs-system
spec:
  endpointSelector:
    matchLabels:
      app.kubernetes.io/name: eaorcs-control-engine
  ingress:
    # Allow mTLS ingress from API Gateway on port 8443
    - fromEndpoints:
        - matchLabels:
            app.kubernetes.io/name: eaorcs-ingress-gateway
      toPorts:
        - ports:
            - port: "8443"
              protocol: TCP
  egress:
    # Allow database access to PostgreSQL cluster on port 5432
    - toEndpoints:
        - matchLabels:
            app.kubernetes.io/name: postgresql-ha
      toPorts:
        - ports:
            - port: "5432"
              protocol: TCP
    # Allow HSM network token validation on port 1111
    - toCIDRSet:
        - cidr: "10.240.12.0/24"
      toPorts:
        - ports:
            - port: "1111"
              protocol: TCP
    # Allow DNS Resolution
    - toEndpoints:
        - matchLabels:
            k8s-app: kube-dns
      toPorts:
        - ports:
            - port: "53"
              protocol: UDP
          rules:
            dns:
              - matchPattern: "*"
```

---

## 5. Hardware Security Module (HSM) & TLS Key Management

EAORCS integrates with Cloud & On-Premises Hardware Security Modules (PKCS#11 / AWS CloudHSM / HashiCorp Vault Secrets Engine) for zero-trust private key custody.

```
       +-------------------------------------------------------------------+
       |                    EAORCS Execution Engine                        |
       +-------------------------------------------------------------------+
                                         |
                                         | PKCS#11 API (No Raw Key Exposure)
                                         v
       +-------------------------------------------------------------------+
       |          FIPS 140-3 Level 3 Hardware Security Module (HSM)        |
       |                                                                   |
       |  +---------------------------+     +---------------------------+  |
       |  |  Ed25519 Signing Key Pair  |     |   TLS 1.3 Private Key     |  |
       |  |  (Non-Exportable)         |     |   (Hardware Enclave)      |  |
       |  +---------------------------+     +---------------------------+  |
       +-------------------------------------------------------------------+
```

### Key Management Lifecycle Rules:
1. **Private Key Non-Exportability**: Ed25519 root authority keys MUST NOT exist in software RAM or persistent disk; all signature generation is offloaded via PKCS#11 RPC.
2. **TLS 1.3 Certificate Rotation**: Automated 30-day TLS cert renewal via `cert-manager` using HashiCorp Vault ACME / CA backend.
3. **Key Destruction & Compromise Protocol**: Immediate revocation via OCSP Stapling and CRL publishing to global API gateways within < 60 seconds.

---

## 6. GitOps CI/CD Pipeline Integration

Production updates strictly adhere to GitOps principles driven by ArgoCD and signed Git commits (`pgp`/`smime`).

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: eaorcs-production-cluster
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: default
  source:
    repoURL: 'https://git.enterprise.internal/eaorcs/infrastructure-manifests.git'
    targetRevision: HEAD
    path: environments/production
  destination:
    server: 'https://kubernetes.default.svc'
    namespace: eaorcs-system
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
      - Validate=true
      - PruneLast=true
```

---

## 7. Progressive Delivery & Canary Rollouts

EAORCS utilizes Flagger and Istio to perform progressive automated canary deployments. New container image releases are routed through automated error-rate and latency validation steps.

```yaml
apiVersion: flagger.app/v1beta1
kind: Canary
metadata:
  name: eaorcs-control-engine
  namespace: eaorcs-system
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: eaorcs-control-engine
  service:
    port: 8443
    targetPort: 8443
  analysis:
    interval: 30s
    threshold: 5
    maxWeight: 50
    stepWeight: 10
    metrics:
      - name: request-success-rate
        thresholdRange:
          min: 99.99
        interval: 1m
      - name: request-duration
        thresholdRange:
          max: 150
        interval: 1m
    webhooks:
      - name: load-test
        type: rollout
        url: http://flagger-tester.eaorcs-system/
        metadata:
          cmd: "hey -z 1m -q 1000 -m GET https://eaorcs-canary.eaorcs-system:8443/healthz"
```

---

## 8. Disaster Recovery, High Availability & Rollback Procedures

### 8.1 Disaster Recovery Objective Matrix

| Parameter | Operational Guarantee | Verification Engine |
| :--- | :--- | :--- |
| **Recovery Point Objective (RPO)** | **`0 seconds`** (Zero Data Loss) | Synchronous multi-region PostgreSQL quorum + Raft WAL sync |
| **Recovery Time Objective (RTO)** | **`< 10 seconds`** | Automated failover via eBPF dynamic ingress rerouting |
| **Active Replicas** | `N+2 Multi-AZ` | Kubernetes PodDisruptionBudget (`minAvailable: 2`) |

### 8.2 Automated Rollback Procedure

When Canary analysis triggers an abort or an operator initiates an emergency rollback, EAORCS executes the following deterministic 10-second rollback sequence:

```
[ T=0s ] Canary anomaly detected (Success rate < 99.99% or Error latency > 150ms).
   |
[ T+1s ] Flagger/Istio resets traffic split: 100% Active Production, 0% Canary Pods.
   |
[ T+3s ] ArgoCD marks sync status as Degraded and halts active pipeline execution.
   |
[ T+5s ] Stateful consensus log verifies no un-signed transactions occurred on Canary nodes.
   |
[ T+8s ] Canary Pod deployment scaled to 0 replicas; alerts dispatched to PagerDuty.
   |
[ T+10s] System state fully restored and verified under operational steady state (RTO < 10s).
```

### 8.3 Manual Emergency Rollback Command

```bash
# Force immediate traffic diversion back to previous stable release
kubectl flagger rollback canary/eaorcs-control-engine -n eaorcs-system

# Verify zero uncommitted state in consensus log
eaorcs-ctl audit verify-state-consistency --namespace eaorcs-system
```

---
*End of Production Deployment Guide — Enterprise Operations Standard v3.0.0*
