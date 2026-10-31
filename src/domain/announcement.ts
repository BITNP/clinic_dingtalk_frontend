export const ANNOUNCEMENT_TAG_LABELS: Record<string, string> = {
  normal: '普通公告',
  pinned: '置顶公告',
  tos: '免责声明',
  // Legacy spellings are accepted only for old rows during rollout.
  AN: '普通公告',
  TA: '置顶公告',
  TOS: '免责声明'
}

export type AnnouncementTagType = 'primary' | 'warning' | ''

export function announcementTagLabel(tag: string): string {
  return ANNOUNCEMENT_TAG_LABELS[tag] ?? tag
}

export function announcementTagType(tag: string): AnnouncementTagType {
  if (tag === 'pinned' || tag === 'TA') return 'warning'
  if (tag === 'tos' || tag === 'TOS') return 'primary'
  return ''
}
