import { Pop } from "./Pop.js";

export class EventEmitter {
  _listeners = {}

  /**
   * @param {string } event property you are listening to for a change
   * @param {function} fn function to be invoked when event listener is triggered
   * @param {any} thisContext
   */
  on(event, fn, thisContext = null) {
    try {
      if (typeof fn != 'function') { return; }
      if (!(event in this)) {
        throw new Error(`Unable to register listener for state event '${event}'`)
      }
      this._listeners[event] = Array.isArray(this._listeners[event]) ? this._listeners[event] : [];
      this._listeners[event] = this._listeners[event] || [];
      // @ts-ignore
      fn.ctx = thisContext;
      this._listeners[event].push(fn);
    } catch (error) {
      let available = this.getListenable(this)
      Pop.error(error, undefined, 'Check the web dev console for more details')
      console.warn(`'${event}' is not a valid event for '.on', event must be one of the following defined by the state:`, available);
      console.error(error)
    }
  }
  /**
   * @param {string | number} event
   * @param {function} fn
   */
  off(event, fn) {
    this._listeners[event] = Array.isArray(this._listeners[event]) ? this._listeners[event] : [];
    const i = this._listeners[event].indexOf(fn);
    if (i === -1) { return; }
    this._listeners[event].splice(i, 1);
  }
  /**
   * @param {string | number | symbol} event
   * @param {any} [payload]
   */
  emit(event, payload) {
    this._listeners[event] = this._listeners[event] || [];
    let length = this._listeners[event].length;
    for (let i = 0; i < length; i++) {
      let fn = this._listeners[event][i];
      fn.ctx
        ? fn.call(fn.ctx, payload)
        : fn(payload);
    }
  }

  /**
   * Removes all listeners from a specified event
   */
  clear(event) {
    delete this._listeners[event]
  }
  /**
   * Removes all listeners
   */
  clearAll() {
    this._listeners = {}
  }

  getListenable(context) {
    let keys = Object.keys(context)
    let hide = ['on', 'clear', 'clearAll', 'emit', 'off', '_listeners', 'getListenable']
    return keys.filter(k => !hide.includes(k))
  }
}
