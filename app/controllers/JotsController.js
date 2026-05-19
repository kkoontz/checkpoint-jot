import { AppState } from '../AppState.js'
import { jotsService } from '../services/JotsService.js'
import { countWords, formatCreatedAt, formatUpdatedAt } from '../utils/formatDates.js'
import { getFormData } from '../utils/FormHandler.js'

export const JOT_COLORS = [
  { value: '#4ade80', label: 'Green' },
  { value: '#20b2aa', label: 'Teal' },
  { value: '#8f7de8', label: 'Purple' },
  { value: '#fb923c', label: 'Orange' },
  { value: '#f472b6', label: 'Pink' },
  { value: '#60a5fa', label: 'Blue' }
]

export class JotsController {
  constructor() {
    jotsService.loadJots()
    this._setupAppStateListeners()
    this._setupEventListeners()
    this.drawAll()
  }

  _setupAppStateListeners() {
    AppState.on('jots', () => this.drawSidebar())
    AppState.on('activeJot', () => this.drawActiveJot())
  }

  _setupEventListeners() {
    document.getElementById('create-jot-form')?.addEventListener('submit', (e) => {
      e.preventDefault()
      const data = getFormData(e.target)
      const ok = jotsService.createJot({ title: data.title, color: data.color })
      if (ok) {
        e.target.reset()
        const firstColor = e.target.querySelector('input[name="color"]')
        if (firstColor) firstColor.checked = true
        this.drawAll()
      }
    })

    document.getElementById('jots-list')?.addEventListener('click', (e) => {
      const card = e.target.closest('[data-jot-id]')
      if (!card) return
      jotsService.setActiveJot(card.dataset.jotId)
      this.drawSidebar()
      this.drawActiveJot()
    })

    document.getElementById('jot-workspace')?.addEventListener('click', (e) => {
      if (e.target.closest('#save-jot')) {
        this._saveActiveJot()
      }
      if (e.target.closest('#delete-jot')) {
        this._deleteActiveJot()
      }
    })

    document.getElementById('jot-workspace')?.addEventListener('input', (e) => {
      if (e.target.id === 'jot-body') {
        this._updateWordCount(e.target.value)
      }
    })
  }

  _saveActiveJot() {
    const active = AppState.activeJot
    if (!active) return
    const body = document.getElementById('jot-body')?.value ?? ''
    jotsService.updateJot(active.id, body)
    this.drawAll()
  }

  _deleteActiveJot() {
    const active = AppState.activeJot
    if (!active) return
    const confirmed = window.confirm(`Delete "${active.title}"? This cannot be undone.`)
    if (!confirmed) return
    jotsService.deleteJot(active.id)
    this.drawAll()
  }

  _updateWordCount(text) {
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

    const n = (AppState.jots ?? []).length
    countEl.textContent = `${n} Jot${n === 1 ? '' : 's'}`

    if (!n) {
      listEl.innerHTML = '<p class="jot-list-empty">No jots yet. Create one above.</p>'
      return
    }

    listEl.innerHTML = (AppState.jots ?? []).map(jot => {
      const active = AppState.activeJot?.id === jot.id
      const preview = (jot.body || '').trim().slice(0, 60)
      return `
        <article class="jot-card ${active ? 'is-active' : ''}" data-jot-id="${jot.id}" role="button" tabindex="0">
          <span class="jot-card-accent" style="background-color: ${jot.color}"></span>
          <div class="jot-card-body">
            <h3 class="jot-card-title">${this._escape(jot.title)}</h3>
            <time class="jot-card-date">${formatCreatedAt(jot.createdAt)}</time>
            <p class="jot-card-preview">${this._escape(preview) || '&nbsp;'}</p>
          </div>
        </article>
      `
    }).join('')
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
          <h1 class="jot-detail-title">${this._escape(jot.title)}</h1>
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
        <textarea id="jot-body" class="jot-editor" rows="16" placeholder="Start writing...">${this._escape(jot.body)}</textarea>
        <p id="word-count" class="jot-word-count">${countWords(jot.body)} words</p>
      </div>
    `
  }

  _escape(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }
}
