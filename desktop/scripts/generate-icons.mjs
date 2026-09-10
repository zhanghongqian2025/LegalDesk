import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const desktopRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const source = await readFile(resolve(desktopRoot, 'build', 'icon.svg'))
await sharp(source).resize(1024, 1024).png().toFile(resolve(desktopRoot, 'build', 'icon.png'))
console.log('LegalDesk desktop icon generated')
