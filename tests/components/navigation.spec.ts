import { describe, expect, it } from 'vitest'
import router from '@/router'

describe('legacy record links', () => {
  it('redirects old addresses to the corresponding record filters', () => {
    const working = router.resolve('/working').matched
    const finished = router.resolve('/finish').matched
    expect(working[working.length - 1].redirect).toEqual({ name: 'records', query: { filter: 'working' } })
    expect(finished[finished.length - 1].redirect).toEqual({ name: 'records', query: { filter: 'finished' } })
  })
})
