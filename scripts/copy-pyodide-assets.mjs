import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const src = join(root, 'node_modules', 'pyodide')
const dest = join(root, 'public', 'pyodide')

mkdirSync(dest, { recursive: true })

const assets = [
  'pyodide.asm.mjs',
  'pyodide.asm.wasm',
  'pyodide-lock.json',
  'python_stdlib.zip',
]

for (const asset of assets) {
  copyFileSync(join(src, asset), join(dest, asset))
}

console.log(`Copied ${assets.length} Pyodide assets to public/pyodide/`)
