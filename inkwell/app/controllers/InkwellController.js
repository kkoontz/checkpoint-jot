import { BODY_PREVIEW_LENGTH, JOT_COLORS } from '../constants/jotConfig.js'
import { AppState } from '../AppState.js'
import { jotsService } from '../services/JotsService.js'
import { escapeHtml } from '../utils/escapeHtml.js'
import { countWords, formatCreatedAt, formatUpdatedAt } from '../utils/formatDates.js'
import { getFormData } from '../utils/FormHandler.js'

export class InkwellController {
  #createForm = null
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
      <label class="ink-swatch" style="--swatch: ${color.value}" title="${color.label}">
        <input type="radio" name="color" value="${color.value}" ${index === 0 ? 'checked required' : ''}>
        <span class="ink-swatch-label">${color.label}</span>
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
    if (id) jotsService.setActiveJot(id)
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
    const first = form.querySelector('input[name="color"]')
    if (first instanceof HTMLInputElement) first.checked = true
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
    if (body instanceof HTMLTextAreaElement) {
      jotsService.updateJot(active.id, body.value)
    }
  }

  #deleteActiveJot() {
    const active = AppState.activeJot
    if (!active) return
    if (!window.confirm(`Delete "${active.title}"? This cannot be undone.`)) return
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
      listEl.innerHTML = '<p class="ink-empty-list">Your library is empty — add your first jot above.</p>'
      return
    }

    listEl.innerHTML = jots.map(jot => this.#cardTemplate(jot)).join('')
  }

  #cardTemplate(jot) {
    const isActive = AppState.activeJot?.id === jot.id
    const preview = (jot.body || '').trim().slice(0, BODY_PREVIEW_LENGTH)

    return `
      <article
        class="ink-card ${isActive ? 'is-active' : ''}"
        data-jot-id="${jot.id}"
        role="listitem"
        tabindex="0"
        aria-current="${isActive ? 'true' : 'false'}"
        style="--accent: ${escapeHtml(jot.color)}"
      >
        <div class="ink-card-top">
          <h3 class="ink-card-title">${escapeHtml(jot.title)}</h3>
          <time datetime="${escapeHtml(jot.createdAt)}">${formatCreatedAt(jot.createdAt)}</time>
        </div>
        <p class="ink-card-preview">${preview ? escapeHtml(preview) : 'No content yet'}</p>
      </article>
    `
  }

  drawActiveJot() {
    const workspace = document.getElementById('jot-workspace')
    if (!workspace) return

    const jot = AppState.activeJot
    if (!jot) {
      workspace.innerHTML = `
        <div class="ink-stage-empty">
          <div class="ink-stage-empty-inner">
            <span class="ink-stage-icon" aria-hidden="true">📜</span>
            <h2>Choose a jot</h2>
            <p>Pick one from your library, or compose something new.</p>
          </div>
        </div>
      `
      return
    }

    workspace.innerHTML = `
      <article class="ink-sheet" style="--accent: ${escapeHtml(jot.color)}">
        <header class="ink-sheet-header">
          <div class="ink-sheet-titles">
            <p class="ink-sheet-eyebrow">Editing</p>
            <h2 class="ink-sheet-title">${escapeHtml(jot.title)}</h2>
          </div>
          <div class="ink-sheet-meta">
            <span><strong>Created</strong> ${formatCreatedAt(jot.createdAt)}</span>
            <span><strong>Updated</strong> ${formatUpdatedAt(jot.updatedAt)}</span>
          </div>
          <div class="ink-sheet-actions">
            <button type="button" id="delete-jot" class="ink-btn ink-btn--ghost">Delete</button>
            <button type="button" id="save-jot" class="ink-btn ink-btn--primary">Save changes</button>
          </div>
        </header>
        <div class="ink-sheet-body">
          <textarea id="jot-body" class="ink-editor" rows="18" placeholder="Write freely…">${escapeHtml(jot.body)}</textarea>
          <footer class="ink-sheet-footer">
            <p id="word-count" class="ink-word-count">${countWords(jot.body)} words</p>
          </footer>
        </div>
      </article>
    `
  }
}
