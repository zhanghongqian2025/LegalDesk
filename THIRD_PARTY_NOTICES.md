# Third-Party Notices

LegalDesk depends on third-party open-source software. The dependency manifests and lock files are the authoritative inventory for a particular build; deployers should generate and review a software bill of materials before production distribution.

## Pi

- Project: Pi Agent
- Upstream: https://github.com/earendil-works/pi
- Package used by the integration: `@earendil-works/pi-coding-agent`
- Compatible version for LegalDesk 0.2: `0.84.1`
- License: MIT License

Pi is not copied or forked into this repository. LegalDesk invokes a user- or administrator-installed Pi runtime through an adapter. Pi remains the copyright of its respective contributors and is provided under its own MIT license and notices.

## Other dependencies

LegalDesk also uses Tauri, React, Rust crates, npm packages, SQLite/rusqlite and related transitive dependencies under their respective licenses. Nothing in the LegalDesk MIT License replaces or limits those third-party terms.

Before distributing an application bundle:

1. Build from the reviewed lock files.
2. Produce a complete dependency and license report for that build.
3. Include all notices required by the resolved versions.
4. Verify that optional model providers, local models, templates, extensions and legal datasets have separate compatible terms.
