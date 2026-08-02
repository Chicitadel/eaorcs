# EAORCS Environment Requirements Specification

## 1. Runtime Environment Specifications
- **Node.js**: Version 18.0.0 or higher required (LTS versions 18.x, 20.x, or 22.x recommended).
- **Package Manager**: npm (bundled with Node.js) or standard shell scripts.
- **External Dependencies**: Zero (0) external third-party npm packages required. System operates 100% on Node.js core built-in modules (`fs`, `path`, `crypto`, `os`, `child_process`, `assert`).

## 2. Certified Operating Systems & Profiles
1. **Linux (Ubuntu 22.04 LTS / Debian 12 / RHEL 9)**: x64, arm64 | POSIX shell (bash/sh) | Path sep: `/`
2. **Windows Server 2022 / Windows 10/11**: x64 | PowerShell (pwsh) or cmd | Path sep: `\`
3. **macOS 14 Sonoma / Ventura**: x64, arm64 (Apple Silicon) | zsh/bash | Path sep: `/`
4. **Docker Container (node:20-alpine)**: x64, arm64 | Alpine sh | Path sep: `/`
5. **Kubernetes Pod (EKS/AKS/GKE)**: x64, arm64 | sh | Path sep: `/`
6. **Shared Hosting (cPanel / Apache / Passenger)**: x64 | bash | Path sep: `/`
7. **Cloud Functions (AWS Lambda / GCF / Azure Fn)**: x64, arm64 | sh | Path sep: `/`

## 3. Resource Requirements
- **CPU**: 1 vCPU minimum (x64 or arm64 architecture).
- **RAM**: 512 MB minimum available memory (1 GB recommended).
- **Disk Space**: 50 MB free disk space for repository artifacts, evidence logs, and baselines.
- **Network**: Offline runtime capability (zero external API connectivity required during validation).

## 4. Permission Requirements
- Read permission to repository tree (`products/eaorcs/`).
- Write permission to system temporary directory (`os.tmpdir()`).
- Write permission to local artifact directories (`docs/`, `evidence/`, `audits/`, `baselines/`).
