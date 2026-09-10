import { createHash } from 'node:crypto'
import { createReadStream, existsSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const release = new URL('../release/', import.meta.url)
const supported = new Set(['.dmg', '.exe', '.pkg', '.zip'])

if (!existsSync(release)) throw new Error('release directory does not exist')

const files = readdirSync(release)
  .filter(name => supported.has(name.slice(name.lastIndexOf('.'))))
  .sort()

if (files.length === 0) throw new Error('no installer artifacts found')

const lines = []
for (const name of files) {
  const hash = createHash('sha256')
  for await (const chunk of createReadStream(join(release.pathname, name))) hash.update(chunk)
  lines.push(`${hash.digest('hex')}  ${name}`)
}

writeFileSync(new URL('SHA256SUMS', release), `${lines.join('\n')}\n`)
console.log(`Wrote SHA256SUMS for ${files.length} artifacts.`)
