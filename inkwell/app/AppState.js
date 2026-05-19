import { EventEmitter } from './utils/EventEmitter.js'
import { createObservableProxy } from './utils/ObservableProxy.js'

class ObservableAppState extends EventEmitter {
  /** @type {import('./models/Jot.js').Jot[]} */
  jots = []

  /** @type {import('./models/Jot.js').Jot | null} */
  activeJot = null
}

export const AppState = createObservableProxy(new ObservableAppState())
