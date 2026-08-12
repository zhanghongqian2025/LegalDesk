# Security Policy

## Supported version

LegalDesk is under active development. Security fixes are applied to the latest branch only; no released version should currently be assumed suitable for production handling of confidential legal matters without an independent deployment review.

## Reporting a vulnerability

Please report vulnerabilities privately to the repository owner through GitHub's private vulnerability reporting feature when available. If that channel is unavailable, contact the maintainer through a private channel listed on their GitHub profile.

Do not open a public issue containing:

- client or case material;
- API keys, access tokens, private model endpoints, or credentials;
- a working exploit against an unpatched version;
- local paths or logs that reveal confidential matter names.

Include the affected commit or version, reproduction steps using synthetic data, impact, and any proposed mitigation. Do not test against systems or data you do not own or have permission to assess.

## Security model

LegalDesk is local-first, but not automatically offline. Case records and imported files are managed locally; selected content may still be sent to the model provider configured through Pi. Deployers are responsible for verifying provider retention, training, residency, access-control, and confidentiality terms.

Pi is treated as a powerful, untrusted subprocess rather than a security sandbox. The MVP therefore:

- pins compatibility to `@earendil-works/pi-coding-agent@0.84.1`;
- requires explicit user or administrator installation;
- starts Pi with `--no-tools --no-approve`; LegalDesk validates and snapshots only explicitly selected, managed UTF-8 text files before launch;
- disables unreviewed extensions, skills, prompt templates, themes, and context files;
- limits working and session directories to the active managed case directory;
- records agent runs and marks outputs as pending human review;
- does not grant shell access or arbitrary file writes.

Production deployments should add operating-system sandboxing, a restricted service account or container, managed credentials, egress controls, encryption, identity and authorization, audit retention, and tested backup/restore procedures.

## Dependency and build policy

The repository previously contained an unsafe root `postinstall` command that downloaded and executed an unrelated binary. Treat any checkout or machine on which dependencies were installed while that command was present as potentially affected. Recommended response:

1. Stop using the affected checkout for sensitive work.
2. Review running processes and persistence locations using trusted endpoint tooling.
3. Rotate credentials accessible to the affected user, especially source-control, package-registry, cloud, SSH, and model-provider credentials.
4. Rebuild from a known-good checkout and reviewed lock file.
5. Preserve relevant evidence before cleanup if incident response is required.

The absence of the downloaded file or a matching current process is not proof that a machine was never affected.

For routine development:

```bash
npm ci --ignore-scripts
npm run build
cargo check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml
```

CI rejects root `preinstall`, `install`, and `postinstall` scripts and installs dependencies with lifecycle scripts disabled. A future dependency that genuinely requires lifecycle execution needs a documented, separately reviewed exception; do not simply remove the guard.

## Secure development requirements

- Treat paths, imported backups, document content, Pi output, and RPC events as untrusted input.
- Reconstruct imported paths below managed roots; never trust stored absolute paths for write or delete operations.
- Never pass user content through a shell command string.
- Never persist model keys in frontend state, browser storage, logs, or exported case backups.
- Redact confidential content from diagnostics and GitHub issues.
- Require explicit human approval before an agent artifact becomes a formal work product.
- Test cancellation, abnormal process exit, malformed RPC events, symlink escape, directory traversal, and cross-case access.

## Legal and professional responsibility

Agent output can be incomplete or wrong and is not legal advice. Security controls do not make generated content substantively correct. Authorized legal professionals remain responsible for reviewing facts, sources, citations, deadlines, privilege, confidentiality, and the final use of every artifact.
