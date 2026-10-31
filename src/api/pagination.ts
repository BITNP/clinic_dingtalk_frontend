import type { Page } from './types'

/**
 * Fetch every page of a paginated endpoint. The clinic catalogs are small, so a
 * page size of 100 gives us one request in practice while still handling larger
 * datasets correctly.
 */
export async function fetchAllPages<T>(
  fetchPage: (page: number, pageSize: number) => Promise<Page<T>>,
  pageSize = 100,
  maxPages = 50
): Promise<T[]> {
  const items: T[] = []
  let total = Number.POSITIVE_INFINITY

  for (let page = 1; page <= maxPages && items.length < total; page += 1) {
    const response = await fetchPage(page, pageSize)
    if (!Array.isArray(response.items)) {
      throw new Error('接口返回格式不正确')
    }

    items.push(...response.items)
    total = Number.isFinite(response.total) ? response.total : items.length

    if (response.items.length === 0) {
      break
    }
  }

  return items
}
