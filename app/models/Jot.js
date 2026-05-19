import { generateId } from '../utils/GenerateId.js'

export class Jot {
  constructor(data = {}) {
    this.id = data.id || generateId()
    this.title = data.title || ''
    this.color = data.color || '#20b2aa'
    this.body = data.body ?? ''
    const now = new Date().toISOString()
    this.createdAt = data.createdAt || now
    this.updatedAt = data.updatedAt || now
  }
}
