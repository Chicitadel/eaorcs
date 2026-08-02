# CLI Command Reference

![EAORCS Logo](../../assets/branding/eaorcs_logo.png)

**Standard**: Universal Autonomous AI Governance Operating System (UAIGOS 3.0.0)  
**Authority**: Ujomor Systems Engineering & Governance Authority  
**Organization**: Ujomor Systems & Enterprise Governance  
**Classification**: GOVERNMENT | ENTERPRISE | RESTRICTED  

---

This document provides a detailed specification of all Command Line Interface (CLI) tools within the Enterprise Autonomous Observability & Regulatory Compliance System (EAORCS).

## `bin/eaorcs.js` (and wrapper `bin/eaorcs`)

### Command Name
`node bin/eaorcs.js [command]` or `eaorcs [command]`

### Purpose
The primary execution engine and orchestrator for the EAORCS platform. It is responsible for initializing system components, managing runtime environments, and triggering diagnostic and telemetry services.

### Syntax & Grammar
```bash
node bin/eaorcs.js <subcommand> [options]
```
**Subcommands**:
- `start`: Starts the core EAORCS engine and associated listeners.
- `status`: Displays current health, node status, and telemetry insights.
- `stop`: Gracefully shuts down the EAORCS environment and stops all active processes.

### Option Matrix

| Flag / Option | Default | Environment Variable Override | Description |
| :--- | :--- | :--- | :--- |
| `--config <path>` | `eaorcs.config.yaml` | `EAORCS_CONFIG` | Path to custom configuration file. |
| `--verbose`, `-v` | `false` | `EAORCS_LOG_LEVEL=debug` | Enables detailed debug-level logging. |
| `--quiet`, `-q` | `false` | `EAORCS_LOG_LEVEL=error` | Suppresses non-error standard output. |

### Execution Examples
```bash
# Start the EAORCS engine with a specific configuration
node bin/eaorcs.js start --config /etc/eaorcs/production.yaml

# Check system status in verbose mode
node bin/eaorcs.js status --verbose

# Stop the engine gracefully
node bin/eaorcs.js stop
```

### Output Artifacts
- `storage/logs/eaorcs_runtime.log`: Operational logs produced during engine execution.
- `storage/telemetry/runtime_metrics.json`: Telemetry snapshots recorded during process lifecycle.

### Exit Status Codes
- `0`: Success (Engine started, status retrieved, or stopped successfully).
- `1`: Error (Runtime failure, missing dependencies, or invalid parameters).
- `2`: Governance Gate Violation (Configuration failed compliance audit).

### Security & Auditing
- **RBAC Requirement**: System Administrator (Admin) level access required to start/stop the engine. Read-only (Auditor) access permitted for the `status` subcommand.
- **Telemetry Logged**: Process PID, caller user, operational state changes.
- **Audit Signature**: Engine startup events are hashed and recorded in `storage/evidence/`.

---

## `bin/eaorcs_installer.js`

### Command Name
`node bin/eaorcs_installer.js <subcommand>`

### Purpose
Automates the system setup, directory initialization, brand asset deployment, and prerequisite diagnostic checks for the EAORCS platform.

### Syntax & Grammar
```bash
node bin/eaorcs_installer.js <subcommand> [options]
```
**Subcommands**:
- `install`: Provisions storage directories, configuration templates, and initializes evidence repositories.
- `doctor`: Runs diagnostic checks on system dependencies and validates brand asset integrity.

### Option Matrix

| Flag / Option | Default | Environment Variable Override | Description |
| :--- | :--- | :--- | :--- |
| `--force`, `-f` | `false` | `N/A` | Bypasses confirmation prompts during installation. |
| `--skip-diagnostics` | `false` | `N/A` | Skips prerequisite checks during the `install` phase. |

### Execution Examples
```bash
# Run installer and initialize directories
node bin/eaorcs_installer.js install

# Run system health and brand diagnostic suite
node bin/eaorcs_installer.js doctor
```

### Output Artifacts
- Provisioned directories: `storage/evidence/`, `storage/telemetry/`, `storage/logs/`.
- Configuration templates written to the current environment.

### Exit Status Codes
- `0`: Success (Installation complete or diagnostics passed).
- `1`: Error (Missing OS permissions or initialization failure).
- `2`: Governance Gate Violation (Brand assets missing or OS incompatibility).

### Security & Auditing
- **RBAC Requirement**: Host OS root/administrator level access required for directory provisioning.
- **Telemetry Logged**: Diagnostic results, installation paths, and OS environment data.
- **Audit Signature**: Not typically signed, but failure logs are written to standard error and `storage/logs/`.

---

## `bin/ga_readiness_certification.js`

### Command Name
`node bin/ga_readiness_certification.js`

### Purpose
Executes the master General Availability (GA) Readiness Certification Pipeline. It systematically runs all 15 master test suites to ensure enterprise-grade stability, legal compliance, and governance adherence.

### Syntax & Grammar
```bash
node bin/ga_readiness_certification.js [options]
```

### Option Matrix

| Flag / Option | Default | Environment Variable Override | Description |
| :--- | :--- | :--- | :--- |
| `--suite <name>` | `all` | `EAORCS_TEST_SUITE` | Run a specific test suite (e.g., `legal`, `pep`). |
| `--format <type>` | `text` | `N/A` | Output format (`text` or `json`). |

### Execution Examples
```bash
# Run full 15-suite GA readiness certification pipeline
node bin/ga_readiness_certification.js

# Run only the legal test suite
node bin/ga_readiness_certification.js --suite legal
```

### Output Artifacts
- `storage/logs/certification_run.log`: Detailed execution log of the test suites.
- `storage/evidence/GA_CERTIFICATION_RESULTS.json`: Cryptographically verifiable results matrix.

### Exit Status Codes
- `0`: Success (15/15 PASS, zero failures).
- `1`: Error (Test runner failure or syntax error).
- `2`: Governance Gate Violation (One or more suites failed).

### Security & Auditing
- **RBAC Requirement**: Release Manager or Auditor level access.
- **Telemetry Logged**: Test execution durations, failure assertions, environmental state.
- **Audit Signature**: Generates an Ed25519-signed certification payload upon successful completion.

---

## `bin/generate_audit_report.js`

### Command Name
`node bin/generate_audit_report.js`

### Purpose
Compiles evidence, test results, and compliance metrics into a human-readable, external-facing markdown audit report.

### Syntax & Grammar
```bash
node bin/generate_audit_report.js [options]
```

### Option Matrix

| Flag / Option | Default | Environment Variable Override | Description |
| :--- | :--- | :--- | :--- |
| `--output <dir>` | `docs/audits` | `EAORCS_AUDIT_OUT` | Directory to save the generated audit report. |
| `--mode <type>` | `standard` | `EAORCS_AUDIT_MODE` | Audit strictness mode (`standard` or `strict`). |

### Execution Examples
```bash
# Generate the external audit report
node bin/generate_audit_report.js

# Generate the external audit report to a specific directory
node bin/generate_audit_report.js --output /tmp/audits
```

### Output Artifacts
- `docs/audits/PHASE_12_PEP_EXTERNAL_AUDIT_REPORT.md`: Comprehensive markdown report for external auditors.

### Exit Status Codes
- `0`: Success (Audit report generated successfully).
- `1`: Error (Missing evidence files, read/write failure).
- `2`: Governance Gate Violation (Insufficient evidence to generate report).

### Security & Auditing
- **RBAC Requirement**: Auditor or Compliance Officer level access.
- **Telemetry Logged**: Report generation time, evidence files consumed.
- **Audit Signature**: Embedded signature block within the generated markdown report.

---

## `bin/create_eaorcs_package.js`

### Command Name
`node bin/create_eaorcs_package.js`

### Purpose
Assembles the standalone procurement audit ZIP package, reconciling entry counts, file sizes, and machine-readable attestations for the release payload.

### Syntax & Grammar
```bash
node bin/create_eaorcs_package.js [options]
```

### Option Matrix

| Flag / Option | Default | Environment Variable Override | Description |
| :--- | :--- | :--- | :--- |
| `--target <file>` | `release/eaorcs_pep_audit_package.zip` | `N/A` | Destination path for the ZIP package. |
| `--sign` | `false` | `EAORCS_SIGN_PACKAGE` | Apply Ed25519 signature to the ZIP archive. |

### Execution Examples
```bash
# Build standalone procurement audit ZIP package
node bin/create_eaorcs_package.js

# Build and cryptographically sign the ZIP package
node bin/create_eaorcs_package.js --sign
```

### Output Artifacts
- `release/eaorcs_pep_audit_package.zip`: Deployable audit ZIP archive.
- `release/GA_BASELINE_CLOSURE_ATTESTATION.json`: Machine-readable attestation of the release package contents.

### Exit Status Codes
- `0`: Success (ZIP package assembled and reconciled).
- `1`: Error (Compression failure, missing directories).
- `2`: Governance Gate Violation (Attestation verification failed).

### Security & Auditing
- **RBAC Requirement**: Release Manager or Platform Architect level access.
- **Telemetry Logged**: Files packaged, compression ratios, attestation generation.
- **Audit Signature**: Generates `GA_BASELINE_CLOSURE_ATTESTATION.json` and optionally signs the ZIP artifact itself.

---

## `bin/generate_demo_project.js` (and `eaorcs demo generate`)

### Command Name
`node bin/generate_demo_project.js [targetDir]` or `node cli/index.js demo generate [targetDir]`

### Purpose
Scaffolds a complete, turnkey EAORCS demonstration project workspace with multi-tenant synthetic telemetry, DSL assurance policies (`.assure`), and an interactive glassmorphic Web Observatory Dashboard.

### Syntax & Grammar
```bash
node bin/generate_demo_project.js [targetDir]
node cli/index.js demo generate [targetDir]
```

### Option Matrix

| Argument / Option | Default | Description |
| :--- | :--- | :--- |
| `targetDir` | `demos/eaorcs-enterprise-demo` | Target directory where the turnkey demo project will be generated. |

### Execution Examples
```bash
# Generate demo project in default location
node bin/generate_demo_project.js

# Generate demo project using CLI subcommand in custom folder
node cli/index.js demo generate demos/financial-compliance-demo
```

### Output Artifacts
- `eaorcs.config.yaml`: Enterprise demonstration configuration profile.
- `policies/security_governance.assure`: EAORCS Assurance Policy DSL definition.
- `datasets/multi_tenant_telemetry.json`: Synthetic multi-tenant telemetry datasets (Financial, Defense, Healthcare, SaaS).
- `run_demo.js`: One-click demonstration execution runner script.
- `index.html`: Interactive glassmorphic Web Observatory Dashboard with live metrics & brand emblem.
- `README.md`: Quickstart instructions for running the demo workspace.

### Exit Status Codes
- `0`: Success (Turnkey demo workspace generated successfully).
- `1`: Error (File system permission error or invalid target path).

### Security & Auditing
- **RBAC Requirement**: Developer or Systems Architect level access.
- **Telemetry Logged**: Demo workspace generation path and file manifests.
- **Audit Signature**: Strictly attributed to Ujomor Systems Engineering & Governance Authority.

