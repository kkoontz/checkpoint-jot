/** @readonly — Inkwell edition palette */
export const JOT_COLORS = Object.freeze([
  { value: '#c45c3e', label: 'Terracotta' },
  { value: '#7d9b76', label: 'Sage' },
  { value: '#5c6b8a', label: 'Slate' },
  { value: '#9b6b9e', label: 'Plum' },
  { value: '#d4a24c', label: 'Honey' },
  { value: '#4a8fad', label: 'Ocean' }
])

export const TITLE_MIN_LENGTH = 3
export const TITLE_MAX_LENGTH = 15
export const BODY_PREVIEW_LENGTH = 72
export const STORAGE_KEY = 'jots'

export const COLOR_VALUES = new Set(JOT_COLORS.map(c => c.value))
