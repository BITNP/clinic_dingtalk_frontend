import { describe, expect, it } from 'vitest'

import { buildApiPath, buildRequestPath } from '@/api/client'

describe('buildApiPath', () => {
  it('joins the API base and a relative endpoint', () => {
    expect(buildApiPath('/tickets/working', '/api')).toBe('/api/tickets/working')
  })

  it('does not create double slashes', () => {
    expect(buildApiPath('/tickets/working', '/api/')).toBe('/api/tickets/working')
    expect(buildApiPath('tickets/working', '/api/')).toBe('/api/tickets/working')
  })

  it('keeps query strings intact', () => {
    expect(buildApiPath('/tickets/finished?page=2', '/api')).toBe(
      '/api/tickets/finished?page=2'
    )
  })
})

describe('buildRequestPath', () => {
  it('serializes axios params into the proxy url header', () => {
    expect(
      buildRequestPath({
        url: '/service-dates',
        params: { active: true, pageSize: 100 }
      })
    ).toBe('/api/service-dates?active=true&pageSize=100')
  })

  it('keeps existing query strings and appends params', () => {
    expect(
      buildRequestPath({
        url: '/tickets/finished?page=2',
        params: { pageSize: 20 }
      })
    ).toBe('/api/tickets/finished?page=2&pageSize=20')
  })
})
