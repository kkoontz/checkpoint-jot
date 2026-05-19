import { AppState } from '../AppState.js'
import { Jot } from '../models/Jot.js'
import { loadState, saveState } from '../utils/Store.js'

class JotsService {
  loadJots() {
    const jots = loadState('jots', Jot) || []
    AppState.jots = jots
    AppState.activeJot = jots.length ? jots[0] : null
  }

  createJot({ title, color }) {
    const trimmed = title?.trim() || ''
    if (trimmed.length < 3 || trimmed.length > 15) {
      return false
    }
    const jot = new Jot({ title: trimmed, color })
    AppState.jots = [...AppState.jots, jot]
    AppState.activeJot = jot
    this.saveJots()
    return true
  }

  setActiveJot(id) {
    const jot = AppState.jots.find(j => j.id === id)
    if (jot) {
      AppState.activeJot = jot
    }
  }

  updateJot(id, body) {
    const jot = AppState.jots.find(j => j.id === id)
    if (!jot) return false
    jot.body = body
    jot.updatedAt = new Date().toISOString()
    AppState.jots = [...AppState.jots]
    AppState.activeJot = jot
    this.saveJots()
    return true
  }

  deleteJot(id) {
    const wasActive = AppState.activeJot?.id === id
    AppState.jots = AppState.jots.filter(j => j.id !== id)
    if (wasActive) {
      AppState.activeJot = AppState.jots[0] || null
    }
    this.saveJots()
  }

  saveJots() {
    saveState('jots', AppState.jots)
  }
}

export const jotsService = new JotsService()
