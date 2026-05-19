import { JOT_COLORS } from '../constants/jotConfig.js'
import { isAllowedColor } from '../utils/jotValidation.js'
import { generateId } from '../utils/GenerateId.js'

const DEFAULT_COLOR = JOT_COLORS[0].value

export class Jot {
  constructor(data = {}) {
    this.id = data.id || generateId()
    this.title = data.title || ''
    this.color = isAllowedColor(data.color) ? data.color : DEFAULT_COLOR
    this.body = data.body ?? ''
    const now = new Date().toISOString()
    this.createdAt = data.createdAt || now
    this.updatedAt = data.updatedAt || now
  }
}
