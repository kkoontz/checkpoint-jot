import { BODY_PREVIEW_LENGTH, JOT_COLORS } from '../constants/jotConfig.js'
import { AppState } from '../AppState.js'
import { jotsService } from '../services/JotsService.js'
import { escapeHtml } from '../utils/escapeHtml.js'
import { countWords, formatCreatedAt, formatUpdatedAt } from '../utils/formatDates.js'
import { getFormData } from '../utils/FormHandler.js'

export class JotsController {
  /** @type {HTMLElement | null} */
  #createForm = null

  /** @type {HTMLElement | null} */
  #createError = null

  constructor() {
    this.#cacheElements()
    this.#renderColorPicker()
    jotsService.loadJots()
    this.#bindEvents()
    this.#bindAppState()
    this.drawAll()
  }

  #cacheElements() {
    this.#createForm = document.getElementById('create-jot-form')
    this.#createError = document.getElementById('create-jot-error')
  }

  #renderColorPicker() {
    const fieldset = document.getElementById('jot-color-picker')
    if (!fieldset) return

    fieldset.innerHTML = JOT_COLORS.map((color, index) => `
      <label class="color-swatch" style="--swatch: ${color.value}" title="${color.label}">
        <input type="radio" name="color" value="${color.value}" ${index === 0 ? 'checked required' : ''}>
      </label>
    `).join('')
  }

  #bindAppState() {
    AppState.on('jots', () => this.drawSidebar())
    AppState.on('activeJot', () => {
      this.drawSidebar()
      this.drawActiveJot()
    })
  }

  #bindEvents() {
    this.#createForm?.addEventListener('submit', (e) => this.#onCreateSubmit(e))

    document.getElementById('jots-list')?.addEventListener('click', (e) => {
      const card = e.target.closest('[data-jot-id]')
      if (card) this.#selectJot(card.dataset.jotId)
    })

    document.getElementById('jots-list')?.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return
      const card = e.target.closest('[data-jot-id]')
      if (!card) return
      e.preventDefault()
      this.#selectJot(card.dataset.jotId)
    })

    document.getElementById('jot-workspace')?.addEventListener('click', (e) => {
      if (e.target.closest('#save-jot')) this.#saveActiveJot()
      if (e.target.closest('#delete-jot')) this.#deleteActiveJot()
    })

    document.getElementById('jot-workspace')?.addEventListener('input', (e) => {
      if (e.target instanceof HTMLTextAreaElement && e.target.id === 'jot-body') {
        this.#updateWordCount(e.target.value)
      }
    })
  }

  #selectJot(id) {
    if (!id) return
    jotsService.setActiveJot(id)
  }

  #onCreateSubmit(event) {
    event.preventDefault()
    const form = event.target
    if (!(form instanceof HTMLFormElement)) return

    const data = getFormData(form)
    const result = jotsService.createJot({ title: data.title, color: data.color })

    if (!result.ok) {
      this.#showCreateError(result.message)
      return
    }

    this.#clearCreateError()
    form.reset()
    const firstColor = form.querySelector('input[name="color"]')
    if (firstColor instanceof HTMLInputElement) firstColor.checked = true
  }

  #showCreateError(message) {
    if (!this.#createError) return
    this.#createError.textContent = message
    this.#createError.hidden = false
  }

  #clearCreateError() {
    if (!this.#createError) return
    this.#createError.textContent = ''
    this.#createError.hidden = true
  }

  #saveActiveJot() {
    const active = AppState.activeJot
    if (!active) return
    const body = document.getElementById('jot-body')
    if (!(body instanceof HTMLTextAreaElement)) return
    jotsService.updateJot(active.id, body.value)
  }

  #deleteActiveJot() {
    const active = AppState.activeJot
    if (!active) return

    const confirmed = window.confirm(`Delete "${active.title}"? This cannot be undone.`)
    if (!confirmed) return

    jotsService.deleteJot(active.id)
  }

  #updateWordCount(text) {
    const el = document.getElementById('word-count')
    if (el) el.textContent = `${countWords(text)} words`
  }

  drawAll() {
    this.drawSidebar()
    this.drawActiveJot()
  }

  drawSidebar() {
    const countEl = document.getElementById('jot-count')
    const listEl = document.getElementById('jots-list')
    if (!countEl || !listEl) return

    const jots = Array.isArray(AppState.jots) ? AppState.jots : []
    const count = jots.length
    countEl.textContent = `${count} Jot${count === 1 ? '' : 's'}`

    if (!count) {
      listEl.innerHTML = '<p class="jot-list-empty">No jots yet. Create one above.</p>'
      return
    }

    listEl.innerHTML = jots.map(jot => this.#jotCardTemplate(jot)).join('')
  }

  /** @param {import('../models/Jot.js').Jot} jot */
  #jotCardTemplate(jot) {
    const isActive = AppState.activeJot?.id === jot.id
    const preview = (jot.body || '').trim().slice(0, BODY_PREVIEW_LENGTH)

    return `
      <article
        class="jot-card ${isActive ? 'is-active' : ''}"
        data-jot-id="${jot.id}"
        role="listitem"
        tabindex="0"
        aria-current="${isActive ? 'true' : 'false'}"
      >
        <span class="jot-card-accent" style="background-color: ${escapeHtml(jot.color)}"></span>
        <div class="jot-card-body">
          <h3 class="jot-card-title">${escapeHtml(jot.title)}</h3>
          <time class="jot-card-date" datetime="${escapeHtml(jot.createdAt)}">${formatCreatedAt(jot.createdAt)}</time>
          <p class="jot-card-preview">${preview ? escapeHtml(preview) : '&nbsp;'}</p>
        </div>
      </article>
    `
  }

  drawActiveJot() {
    const workspace = document.getElementById('jot-workspace')
    if (!workspace) return

    const jot = AppState.activeJot
    if (!jot) {
      workspace.innerHTML = `
        <div class="jot-empty">
          <p>Select a jot from the list or create a new one.</p>
        </div>
      `
      return
    }

    workspace.innerHTML = `
      <header class="jot-detail-header">
        <span class="jot-detail-icon" aria-hidden="true">🎗️</span>
        <div class="jot-detail-meta">
          <h1 class="jot-detail-title">${escapeHtml(jot.title)}</h1>
          <p class="jot-detail-dates">
            <span>Created on : ${formatCreatedAt(jot.createdAt)}</span>
            <span>Last updated : ${formatUpdatedAt(jot.updatedAt)}</span>
          </p>
        </div>
        <div class="jot-detail-actions">
          <button type="button" id="delete-jot" class="btn btn-danger">🗑 Delete</button>
          <button type="button" id="save-jot" class="btn btn-primary">💾 Save</button>
        </div>
      </header>
      <div class="jot-editor-wrap">
        <textarea id="jot-body" class="jot-editor" rows="16" placeholder="Start writing...">${escapeHtml(jot.body)}</textarea>
        <p id="word-count" class="jot-word-count">${countWords(jot.body)} words</p>
      </div>
    `
  }
}
