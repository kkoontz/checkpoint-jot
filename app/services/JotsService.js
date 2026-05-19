import { STORAGE_KEY } from '../constants/jotConfig.js'
import { AppState } from '../AppState.js'
import { Jot } from '../models/Jot.js'
import { isAllowedColor, validateTitle } from '../utils/jotValidation.js'
import { loadState, saveState } from '../utils/Store.js'

class JotsService {
  /** @returns {import('../models/Jot.js').Jot[]} */
  #getJots() {
    return Array.isArray(AppState.jots) ? AppState.jots : []
  }

  loadJots() {
    const loaded = loadState(STORAGE_KEY, Jot)
    const jots = Array.isArray(loaded) ? loaded : []
    AppState.jots = jots
    AppState.activeJot = jots[0] ?? null
  }

  /**
   * @param {{ title: string, color: string }} payload
   * @returns {{ ok: true, jot: Jot } | { ok: false, message: string }}
   */
  createJot(payload) {
    const titleResult = validateTitle(payload.title)
    if (!titleResult.valid) {
      return { ok: false, message: titleResult.message ?? 'Invalid title.' }
    }
    if (!isAllowedColor(payload.color)) {
      return { ok: false, message: 'Please choose a color for your jot.' }
    }

    const jot = new Jot({ title: titleResult.trimmed, color: payload.color })
    AppState.jots = [...this.#getJots(), jot]
    AppState.activeJot = jot
    this.#persist()
    return { ok: true, jot }
  }

  setActiveJot(id) {
    const jot = this.#getJots().find(j => j.id === id)
    if (jot) {
      AppState.activeJot = jot
    }
  }

  /**
   * @param {string} id
   * @param {string} body
   * @returns {boolean}
   */
  updateJot(id, body) {
    const jot = this.#getJots().find(j => j.id === id)
    if (!jot) return false

    jot.body = body
    jot.updatedAt = new Date().toISOString()
    AppState.jots = [...this.#getJots()]
    AppState.activeJot = jot
    this.#persist()
    return true
  }

  deleteJot(id) {
    const jots = this.#getJots().filter(j => j.id !== id)
    const wasActive = AppState.activeJot?.id === id

    AppState.jots = jots
    if (wasActive) {
      AppState.activeJot = jots[0] ?? null
    }
    this.#persist()
  }

  #persist() {
    saveState(STORAGE_KEY, this.#getJots())
  }
}

export const jotsService = new JotsService()
