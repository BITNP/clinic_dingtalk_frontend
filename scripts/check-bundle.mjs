import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'

const assetsDir = join(process.cwd(), 'dist', 'assets')
const distDir = join(process.cwd(), 'dist')

const files = readdirSync(assetsDir)
const sourceMaps = files.filter((file) => file.endsWith('.map'))
if (sourceMaps.length > 0) {
  console.error(`Production source maps found: ${sourceMaps.join(', ')}`)
  process.exit(1)
}

const modernScripts = files.filter(
  (file) => file.endsWith('.js') && !file.includes('-legacy-') && !file.includes('polyfills')
)

let totalGzip = 0
let failed = false

for (const file of modernScripts) {
  const gzip = gzipSync(readFileSync(join(assetsDir, file))).length
  totalGzip += gzip
  if (gzip > 300 * 1024) {
    console.error(`${file}: ${(gzip / 1024).toFixed(1)} KiB gzip exceeds the 300 KiB chunk budget`)
    failed = true
  }
}

const totalBudget = 700 * 1024
if (totalGzip > totalBudget) {
  console.error(
    `Modern JS total ${(totalGzip / 1024).toFixed(1)} KiB gzip exceeds the ${(
      totalBudget / 1024
    ).toFixed(0)} KiB budget`
  )
  failed = true
}

const distIndex = join(distDir, 'index.html')
if (!readFileSync(distIndex, 'utf8').includes('/lightapp/')) {
  console.error('dist/index.html does not reference the /lightapp/ asset base')
  failed = true
}

if (failed) {
  process.exit(1)
}

console.log(
  `Bundle check passed: ${modernScripts.length} modern chunks, ${(totalGzip / 1024).toFixed(
    1
  )} KiB gzip total, no source maps.`
)
