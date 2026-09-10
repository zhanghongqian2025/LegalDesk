# LegalDesk 桌面发行

LegalDesk 桌面版使用 Electron 封装官方 `@deepseek-ai/dsh@0.1.0-rc.8` Web Profile，并固定加载 `@civright/legaldesk-harness` 和最终安全 overlay。社区 DeepSeek Harness Desktop 项目仅作为打包架构参考；本项目不宣称该桌面壳由 DeepSeek 官方发布。

## 用户体验

- macOS：打开 DMG 后拖入“应用程序”，或双击 PKG 安装；之后双击 LegalDesk 图标直接进入法律工作台。
- Windows：双击 NSIS `setup.exe`，安装器创建桌面和开始菜单快捷方式；之后双击 LegalDesk 图标启动。
- 应用内“卸载 LegalDesk…”先让用户选择保留案件数据，或把案件数据移入系统废纸篓。Windows 随后打开“已安装的应用”，macOS 定位 `LegalDesk.app` 供用户移入废纸篓。
- Windows NSIS 自带标准卸载程序，默认不删除案件数据。

## 构建

```sh
npm run desktop:install
npm run desktop:pack
npm run desktop:smoke
npm run desktop:mac
```

Windows 安装器必须在 Windows Runner 上构建，执行 `npm run desktop:win`。`.github/workflows/desktop-release.yml` 在版本 Tag 上分别使用 macOS 和 Windows 原生 Runner 生成安装包。

## 数据目录

桌面版使用 Electron `userData` 目录：macOS 为 `~/Library/Application Support/LegalDesk`，Windows 为 `%APPDATA%\\LegalDesk`。其中 `data/` 保存案件数据库和受管材料，`harness/` 保存独立 Harness Profile。升级和卸载默认保留该目录。

## 签名

面向外部用户发布前必须提供 Apple Developer ID 和 Windows Authenticode 证书。未签名构建只能用于内部验收，不能作为正式公开下载版本。
