import { describe, expect, it, vi } from 'vitest'

import { fetchAllPages } from '@/api/pagination'
import type { Page } from '@/api/types'

function page<T>(items: T[], total: number, pageNumber: number, pageSize = 2): Page<T> {
  return { items, total, page: pageNumber, pageSize }
}

describe('fetchAllPages', () => {
  it('walks pages until the reported total is reached', async () => {
    const fetchPage = vi
      .fn<(page: number, pageSize: number) => Promise<Page<number>>>()
      .mockResolvedValueOnce(page([1, 2], 3, 1))
      .mockResolvedValueOnce(page([3], 3, 2))

    await expect(fetchAllPages(fetchPage)).resolves.toEqual([1, 2, 3])
    expect(fetchPage).toHaveBeenCalledTimes(2)
    expect(fetchPage).toHaveBeenNthCalledWith(1, 1, 100)
    expect(fetchPage).toHaveBeenNthCalledWith(2, 2, 100)
  })

  it('stops when an empty page is returned', async () => {
    const fetchPage = vi
      .fn<(page: number, pageSize: number) => Promise<Page<number>>>()
      .mockResolvedValueOnce(page([1, 2], 100, 1))
      .mockResolvedValueOnce(page([], 100, 2))

    await expect(fetchAllPages(fetchPage)).resolves.toEqual([1, 2])
    expect(fetchPage).toHaveBeenCalledTimes(2)
  })

  it('rejects an invalid response shape', async () => {
    const fetchPage = vi
      .fn<(page: number, pageSize: number) => Promise<Page<number>>>()
      .mockResolvedValueOnce({ items: null, total: 0, page: 1, pageSize: 100 } as never)

    await expect(fetchAllPages(fetchPage)).rejects.toThrow('接口返回格式不正确')
  })
})
