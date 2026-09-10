# Security Policy

## Security model

LegalDesk is local-first, not automatically offline. Matter records, managed files, Harness sessions, audit events, and artifacts remain local by default. Explicitly selected snapshots may still be sent to the model provider configured in DeepSeek Harness. Deployers must review provider retention, training, residency, access-control, and confidentiality terms.

The initial security baseline is fail-closed:

- a matter is the mandatory storage and execution scope;
- the model receives immutable snapshots, never arbitrary host paths;
- the Harness sandbox is fixed to read-only and runtime permission switching is disabled;
- coding presets, shell, filesystem, web, skill, workflow, and subagent tools are disabled;
- a global monotonic tool guard denies any tool reintroduced under another row id;
- the final command-line overlay is applied after profile and home configuration;
- Harness telemetry is disabled;
- every output remains a draft pending human review.

`read-only`, disabled tools, and prompts are not an operating-system confidentiality boundary. Production deployment also requires controlled Harness distribution, signed artifacts, owner-only runtime directories, encrypted storage, provider egress policy, secret references, and tested backup recovery.

## Data handling

- Never commit credentials, case materials, local Harness homes, session logs, or production exports.
- Treat imported files, backup data, model output, durable events, and plugin configuration as untrusted input.
- Validate path containment after canonicalization and reject symlink escape and cross-matter references.
- Log identifiers and hashes instead of raw sensitive content where the full snapshot is not required.
- Show the selected material scope and provider before a model request.

## Dependency and plugin policy

- DeepSeek Harness is a developer-preview dependency and must be pinned to a reviewed revision or release.
- LegalDesk extends Harness through published plugin seams and does not patch the Agent Loop.
- Plugin installation and build scripts execute on the host; review and pin their source before allowing them.
- Generate a software bill of materials and license report for every production build.

## Reporting

Do not include case data, personal information, credentials, or exploit details in a public issue. Report security concerns privately to the repository maintainers and include only sanitized reproduction material.
