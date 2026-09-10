import { spawn } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { createServer as createHttpServer } from 'node:http'
import { createRequire } from 'node:module'
import { createServer } from 'node:net'
import { existsSync, lstatSync, mkdirSync, readFileSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { app, BrowserWindow, dialog, Menu, Notification, shell } from 'electron'

const require = createRequire(import.meta.url)
const dshPackage = require.resolve('@deepseek-ai/dsh/package.json')
const legaldeskPackage = require.resolve('@civright/legaldesk-harness/package.json')
const dshBin = resolve(dirname(dshPackage), JSON.parse(readFileSync(dshPackage, 'utf8')).bin.dsh)
const enforcement = join(dirname(legaldeskPackage), 'enforcement.patch.yml')

let host
let mainWindow
let stopping = false
let notificationBridge

app.setName('LegalDesk')
if (!app.requestSingleInstanceLock()) app.quit()

app.on('second-instance', () => showWindow())
app.on('activate', () => showWindow())
app.on('before-quit', event => {
  if (stopping || host === undefined) return
  event.preventDefault()
  void stopHost().finally(() => app.quit())
})

void app.whenReady().then(start).catch(async error => {
  await dialog.showMessageBox({
    type: 'error',
    title: 'LegalDesk 无法启动',
    message: '本地法律工作台启动失败',
    detail: String(error?.stack ?? error),
  })
  app.exit(1)
})

async function start() {
  const paths = prepareUserData()
  const port = await reservePort()
  notificationBridge = await startNotificationBridge()
  host = spawn(process.execPath, [
    '--expose-internals',
    dshBin,
    '--profile', 'web',
    '--patch', enforcement,
    '--no-open',
    '--port', String(port),
  ], {
    cwd: paths.workspace,
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: '1',
      DSH_HOME: paths.harness,
      LEGALDESK_DATA_DIR: paths.data,
      LEGALDESK_NOTIFY_URL: notificationBridge.url,
      LEGALDESK_NOTIFY_TOKEN: notificationBridge.token,
      DSH_TELEMETRY_DISABLED: '1',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  host.stdout.on('data', chunk => process.stdout.write(chunk))
  host.stderr.on('data', chunk => process.stderr.write(chunk))
  host.once('exit', code => {
    host = undefined
    if (!stopping && code !== 0) void showHostStopped(code)
  })

  const url = `http://127.0.0.1:${port}/?legaldesk=1`
  await waitForServer(url, host)
  createWindow(url)
  installMenu(paths)
}

function prepareUserData() {
  const root = app.getPath('userData')
  const harness = join(root, 'harness')
  const data = join(root, 'data')
  const workspace = join(root, 'workspace')
  const profile = join(harness, 'profiles', 'web')
  for (const path of [root, harness, data, workspace, profile]) mkdirSync(path, { recursive: true, mode: 0o700 })
  linkLegalDeskPlugin(profile)
  writeFileSync(join(profile, 'package.json'), `${JSON.stringify({
    name: 'legaldesk-profile-web',
    private: true,
    dsh: { profile: { bundles: [
      '@deepseek-ai/dsh-base',
      '@deepseek-ai/dsh-web-app',
      '@civright/legaldesk-harness',
    ] } },
  }, null, 2)}\n`)
  if (!existsSync(join(profile, 'cordis.patch.yml'))) writeFileSync(join(profile, 'cordis.patch.yml'), '[]\n')
  writeFileSync(join(profile, 'cordis.yml'), '[]\n')
  return { root, harness, data, workspace }
}

function linkLegalDeskPlugin(profile) {
  const scope = join(profile, 'node_modules', '@civright')
  const target = dirname(legaldeskPackage)
  const link = join(scope, 'legaldesk-harness')
  mkdirSync(scope, { recursive: true, mode: 0o700 })
  try {
    const current = lstatSync(link)
    if (!current.isSymbolicLink()) throw new Error(`插件链接位置被非链接文件占用：${link}`)
    unlinkSync(link)
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
  }
  symlinkSync(target, link, process.platform === 'win32' ? 'junction' : 'dir')
}

function createWindow(url) {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 900,
    minWidth: 920,
    minHeight: 640,
    title: 'LegalDesk',
    icon: join(app.getAppPath(), 'build', 'icon.png'),
    backgroundColor: '#f7f7f5',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })
  mainWindow.loadURL(url)
  mainWindow.on('page-title-updated', event => {
    event.preventDefault()
    mainWindow?.setTitle('LegalDesk')
  })
  mainWindow.on('closed', () => { mainWindow = undefined })
}

function installMenu(paths) {
  const template = [
    ...(process.platform === 'darwin' ? [{
      label: 'LegalDesk',
      submenu: [
        { role: 'about', label: '关于 LegalDesk' },
        { type: 'separator' },
        { label: '卸载 LegalDesk…', click: () => void beginUninstall(paths) },
        { type: 'separator' },
        { role: 'quit', label: '退出 LegalDesk' },
      ],
    }] : []),
    {
      label: '文件',
      submenu: [
        { label: '打开工作台', accelerator: 'CmdOrCtrl+O', click: () => showWindow() },
        { label: '显示案件数据目录', click: () => shell.showItemInFolder(join(paths.data, 'legaldesk.sqlite')) },
        ...(process.platform === 'win32' ? [
          { type: 'separator' },
          { label: '卸载 LegalDesk…', click: () => void beginUninstall(paths) },
        ] : []),
      ],
    },
    { role: 'editMenu', label: '编辑' },
    { role: 'viewMenu', label: '显示' },
    { role: 'windowMenu', label: '窗口' },
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

async function beginUninstall(paths) {
  const result = await dialog.showMessageBox(mainWindow, {
    type: 'warning',
    title: '卸载 LegalDesk',
    message: '卸载应用时如何处理本机案件数据？',
    detail: '保留数据可以稍后重新安装继续使用；删除会把 LegalDesk 的案件、材料、运行记录和本地设置移入废纸篓。',
    buttons: ['取消', '保留数据并卸载', '删除数据并卸载'],
    defaultId: 1,
    cancelId: 0,
  })
  if (result.response === 0) return
  await stopHost()
  if (result.response === 2 && existsSync(paths.root)) await shell.trashItem(paths.root)
  if (process.platform === 'win32') {
    await shell.openExternal('ms-settings:appsfeatures')
  } else {
    const application = resolve(dirname(app.getPath('exe')), '..', '..')
    shell.showItemInFolder(application)
    await dialog.showMessageBox({
      type: 'info',
      title: '完成卸载',
      message: '请将已选中的 LegalDesk.app 移入废纸篓。',
    })
  }
  app.quit()
}

function showWindow() {
  if (mainWindow === undefined || mainWindow.isDestroyed()) return
  if (mainWindow.isMinimized()) mainWindow.restore()
  mainWindow.show()
  mainWindow.focus()
}

async function stopHost() {
  if (stopping) return
  stopping = true
  const child = host
  host = undefined
  if (child !== undefined && child.exitCode === null) {
    child.kill('SIGTERM')
    await Promise.race([
      new Promise(resolveExit => child.once('exit', resolveExit)),
      new Promise(resolveTimeout => setTimeout(resolveTimeout, 5000)),
    ])
    if (child.exitCode === null) child.kill('SIGKILL')
  }
  if (notificationBridge !== undefined) {
    await new Promise(resolveClose => notificationBridge.server.close(() => resolveClose()))
    notificationBridge = undefined
  }
}

function startNotificationBridge() {
  const token = randomBytes(32).toString('hex')
  return new Promise((resolveBridge, reject) => {
    const server = createHttpServer((req, res) => {
      const remote = req.socket.remoteAddress
      if (req.method !== 'POST' || req.url !== '/notify' || !['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(remote)
        || req.headers.authorization !== `Bearer ${token}`) {
        res.writeHead(404).end()
        return
      }
      const chunks = []; let size = 0
      req.on('data', chunk => { size += chunk.length; if (size <= 2048) chunks.push(chunk) })
      req.on('end', () => {
        try {
          if (size > 2048) throw new Error('notification payload too large')
          const body = JSON.parse(Buffer.concat(chunks).toString('utf8'))
          if (!['completed', 'failed'].includes(body.status)) throw new Error('invalid notification status')
          const message = body.status === 'completed'
            ? '法律 Agent 运行已完成，请返回工作台进行人工审核。'
            : '法律 Agent 运行未完成，请返回工作台查看运行记录。'
          if (Notification.isSupported()) new Notification({ title: 'LegalDesk', body: message, silent: false }).show()
          res.writeHead(204).end()
        } catch { res.writeHead(400).end() }
      })
      req.on('error', () => { if (!res.headersSent) res.writeHead(400).end() })
    })
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      const port = typeof address === 'object' && address !== null ? address.port : 0
      resolveBridge({ server, token, url: `http://127.0.0.1:${port}/notify` })
    })
  })
}

function reservePort() {
  return new Promise((resolvePort, reject) => {
    const server = createServer()
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      const port = typeof address === 'object' && address !== null ? address.port : 0
      server.close(error => error ? reject(error) : resolvePort(port))
    })
  })
}

async function waitForServer(url, child) {
  const deadline = Date.now() + 60000
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`DeepSeek Harness 提前退出，退出码 ${child.exitCode}`)
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {}
    await new Promise(resolveWait => setTimeout(resolveWait, 250))
  }
  throw new Error('等待本地 DeepSeek Harness 启动超时')
}

async function showHostStopped(code) {
  await dialog.showMessageBox({
    type: 'error',
    title: 'LegalDesk 已停止',
    message: '本地 DeepSeek Harness 服务意外停止',
    detail: `退出码：${code ?? 'unknown'}`,
  })
  app.quit()
}
