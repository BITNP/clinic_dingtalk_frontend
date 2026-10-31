import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

import { describe, expect, it } from 'vitest'

const SRC = join(process.cwd(), 'src')
const FORBIDDEN = [
  '/api/wechat',
  '/api/announcement/',
  '/api/campus/',
  '/api/date/',
  'wechat/finish',
  'wechat/working'
]
const EXTENSIONS = new Set(['.ts', '.vue', '.js'])

function sourceFiles(directory: string): string[] {
  const files: string[] = []
  for (const entry of readdirSync(directory)) {
    const fullPath = join(directory, entry)
    if (statSync(fullPath).isDirectory()) {
      files.push(...sourceFiles(fullPath))
    } else if (EXTENSIONS.has(entry.slice(entry.lastIndexOf('.')))) {
      files.push(fullPath)
    }
  }
  return files
}

describe('legacy API guard', () => {
  it('does not call any legacy customer endpoint', () => {
    const offenders: string[] = []

    for (const file of sourceFiles(SRC)) {
      const text = readFileSync(file, 'utf8')
      for (const pattern of FORBIDDEN) {
        if (text.includes(pattern)) {
          offenders.push(`${relative(process.cwd(), file)}: ${pattern}`)
        }
      }
    }

    expect(offenders).toEqual([])
  })
})
