import { describe, expect, it } from 'vitest'

import { announcementTagLabel, announcementTagType } from '@/domain/announcement'

describe('announcement tags', () => {
  it('maps the new backend tags', () => {
    expect(announcementTagLabel('normal')).toBe('普通公告')
    expect(announcementTagLabel('pinned')).toBe('置顶公告')
    expect(announcementTagLabel('tos')).toBe('免责声明')
  })

  it('accepts legacy spellings during rollout', () => {
    expect(announcementTagLabel('AN')).toBe('普通公告')
    expect(announcementTagLabel('TA')).toBe('置顶公告')
    expect(announcementTagLabel('TOS')).toBe('免责声明')
  })

  it('gives pinned and tos announcements distinct tag styles', () => {
    expect(announcementTagType('pinned')).toBe('warning')
    expect(announcementTagType('tos')).toBe('primary')
    expect(announcementTagType('normal')).toBe('')
  })
})
