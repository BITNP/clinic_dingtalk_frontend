import { describe, expect, it } from 'vitest'

import { buildApiPath } from '@/api/client'

describe('buildApiPath', () => {
  it('joins the API base and a relative endpoint', () => {
    expect(buildApiPath('/tickets/working', '/api')).toBe('/api/tickets/working')
  })

  it('does not create double slashes', () => {
    expect(buildApiPath('/tickets/working', '/api/')).toBe('/api/tickets/working')
    expect(buildApiPath('tickets/working', '/api/')).toBe('/api/tickets/working')
  })

  it('keeps query strings intact', () => {
    expect(buildApiPath('/tickets/finished?page=2', '/api')).toBe('/api/tickets/finished?page=2')
  })
})
