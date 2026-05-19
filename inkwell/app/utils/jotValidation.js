import {
  COLOR_VALUES,
  TITLE_MAX_LENGTH,
  TITLE_MIN_LENGTH
} from '../constants/jotConfig.js'

/**
 * @param {unknown} title
 * @returns {{ valid: boolean, trimmed: string, message?: string }}
 */
export function validateTitle(title) {
  const trimmed = String(title ?? '').trim()
  if (trimmed.length < TITLE_MIN_LENGTH) {
    return {
      valid: false,
      trimmed,
      message: `Title must be at least ${TITLE_MIN_LENGTH} characters.`
    }
  }
  if (trimmed.length > TITLE_MAX_LENGTH) {
    return {
      valid: false,
      trimmed,
      message: `Title must be ${TITLE_MAX_LENGTH} characters or fewer.`
    }
  }
  return { valid: true, trimmed }
}

/**
 * @param {unknown} color
 * @returns {boolean}
 */
export function isAllowedColor(color) {
  return COLOR_VALUES.has(color)
}
