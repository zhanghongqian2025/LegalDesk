# Third-Party Notices

LegalDesk is built on DeepSeek Harness and its transitive open-source dependencies. DeepSeek Harness is licensed under the MIT License; its own repository and release artifacts contain the authoritative dependency notices for the pinned build.

- Project: DeepSeek Harness
- Upstream: https://github.com/deepseek-ai/deepseek-harness
- License: MIT License
- Integration: out-of-tree Bundle, Host plugins, Client plugins, and profile overlays; no core fork

The installable desktop distribution embeds Electron and its Chromium/Node.js runtime under their respective open-source licenses. Electron's license and Chromium notices are included in the packaged application resources.

- Project: Electron
- Upstream: https://github.com/electron/electron
- License: MIT License, with bundled third-party notices
- Integration: LegalDesk-owned desktop host that starts the pinned Harness runtime on loopback

LegalDesk uses `dsh-doc` and its pinned Xberg engine for local, byte-snapshot document extraction. LegalDesk does not enable its model tools or remote URL conversion; extracted text is stored as a separate derived file under the same matter boundary.

- Project: dsh-doc
- Upstream: https://github.com/Sqhao-O/dsh-docs
- License: MIT License
- Pinned version: 0.1.1

- Project: Xberg
- Upstream: https://www.npmjs.com/package/@xberg-io/xberg
- License: see the pinned package license
- Pinned version: 1.0.14

Model providers, legal datasets, extraction engines, templates, and optional plugins have separate terms. Before distribution, pin the reviewed Harness revision, generate an SBOM and complete license report, include required notices, and review every optional provider and dataset independently.
