import path from 'node:path'

const MATTER_ID = /^[a-z0-9][a-z0-9-]{0,63}$/

export function assertMatterId(value) {
  if (typeof value !== 'string' || !MATTER_ID.test(value)) {
    throw new Error('案件标识必须由 1-64 位小写字母、数字或连字符组成，且首位不能是连字符')
  }
  return value
}

export function resolveMatterRoot(storageRoot, matterId) {
  assertAbsoluteRoot(storageRoot)
  return path.join(path.resolve(storageRoot), 'matters', assertMatterId(matterId))
}

export function resolveMatterPath(storageRoot, matterId, ...segments) {
  const matterRoot = resolveMatterRoot(storageRoot, matterId)
  for (const segment of segments) {
    const parts = typeof segment === 'string' ? segment.split(/[/\\]/) : []
    if (
      typeof segment !== 'string'
      || segment.length === 0
      || segment.includes('\0')
      || path.posix.isAbsolute(segment)
      || path.win32.isAbsolute(segment)
      || parts.some(part => part === '.' || part === '..')
    ) {
      throw new Error('案件内路径必须是非空相对路径')
    }
  }

  const candidate = path.resolve(matterRoot, ...segments)
  if (candidate !== matterRoot && !candidate.startsWith(`${matterRoot}${path.sep}`)) {
    throw new Error('案件内路径越过了当前案件边界')
  }
  return candidate
}

function assertAbsoluteRoot(storageRoot) {
  if (typeof storageRoot !== 'string' || !path.isAbsolute(storageRoot)) {
    throw new Error('LegalDesk 存储根目录必须是绝对路径')
  }
}
