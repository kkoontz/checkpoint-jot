/** @readonly */
export const JOT_COLORS = Object.freeze([
  { value: '#4ade80', label: 'Green' },
  { value: '#20b2aa', label: 'Teal' },
  { value: '#8f7de8', label: 'Purple' },
  { value: '#fb923c', label: 'Orange' },
  { value: '#f472b6', label: 'Pink' },
  { value: '#60a5fa', label: 'Blue' }
])

export const TITLE_MIN_LENGTH = 3
export const TITLE_MAX_LENGTH = 15
export const BODY_PREVIEW_LENGTH = 60
export const STORAGE_KEY = 'jots'

export const COLOR_VALUES = new Set(JOT_COLORS.map(c => c.value))
