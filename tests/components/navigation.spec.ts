import { describe, expect, it } from 'vitest'
import router from '@/router'

describe('legacy record links', () => {
  it('redirects old addresses to appointment records', () => {
    const working = router.resolve('/working').matched
    const finished = router.resolve('/finish').matched
    expect(working[working.length - 1].redirect).toEqual({ name: 'records' })
    expect(finished[finished.length - 1].redirect).toEqual({ name: 'records' })
  })
})
