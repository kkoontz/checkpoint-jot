import { Pop } from "./Pop.js";

/**
 * Supporting types for the router
 * NOTE Controllers must be non instantiated 
 * @typedef {Function[]} middleware
 * @typedef {Function[]} controller
 */

class Route {
  /**
   * 
   * @param {{path: string, middleware?:middleware[], controllers:controller[], view?: string, target?: string}} routeConfig 
   */
  constructor(routeConfig) {
    this.params = {}

    if (typeof routeConfig.path != 'string') {
      throw Pop.error('[ROUTE_ERROR::INVALID_ROUTE] No path was specified for route')
    }

    if (routeConfig.path.includes('/:')) {
      const parts = routeConfig.path.split('/')
      for (const part of parts) {
        if (part.startsWith(':')) {
          this.params[part.slice(1)] = ''
        }
      }
    }

    this.path = routeConfig.path
    this.target = routeConfig.target || '#router-view'
    this.middleware = Array.isArray(routeConfig.middleware) ? routeConfig.middleware : []
    this.controllers = Array.isArray(routeConfig.controllers) ? routeConfig.controllers : []
    this.view = routeConfig.view || ''
    this.template = ''
    this.loadTemplate()
  }

  async loadTemplate() {
    if (!this.view || !this.view.endsWith('.html') || this.template.startsWith('<')) {
      return ''
    }
    try {
      const res = await fetch(this.view)
      if (!res.ok) { throw new Error(res.statusText) }
      this.template = await res.text()
    } catch (error) {
      console.error(error)
      Pop.error('[ROUTE_ERROR::BAD_PATH] Unable to load template for route ' + this.path)
    }
  }

  /**
   * Cleans up controllers when the route changes.
   */
  cleanupControllers() {
    this.controllers.forEach(c => {
      try {
        // @ts-ignore
        const controller = window.app[c.name];
        if (typeof controller.cleanup === 'function') {
          // @ts-ignore
          controller.cleanup();
        }
      } catch (error) {
        console.error('[ROUTE_ERROR::CLEANUP_FAILURE]', error);
      }
    });
  }

}


export class Router {
  /**@type {Route[]} */
  routes = []

  /**@type {Route} */
  fromRoute
  /**@type {Route} */
  currentRoute

  app = {}


  /**
   * 
   * @param {*} app 
   * @param {{
   * targetElm?: string
   * routes: {view: string, path: string, controllers?: any[], target?: string, middleware?: middleware[]}[]
   * }} [options] options
   */
  constructor(app, options) {
    const { targetElm = 'main', routes = [] } = options
    this.app = app
    this.targetElm = targetElm
    // @ts-ignore
    this.routes = routes.map(r => new Route(r))
    if (this.routes.length == 0) {
      console.warn("Router Disabled, No Routes provided")
    } else {
      this.init()
    }
  }

  init() {
    // @ts-ignore
    if (this.app === undefined) return console.error('[🚨ERROR] Router must be created after app')
    window.addEventListener(
      "hashchange",
      () => this.handleRouteChange(),
      false
    );
    this.handleRouteChange()
  }

  async handleRouteChange() {
    if (this.currentRoute) {
      this.currentRoute.cleanupControllers();
    }

    const currentRoute = this.routes.find(r => {
      const match = location.hash.match(new RegExp(`^${r.path.replace(/:\w+/g, '(\\w+)')}$`));
      if (match) {
        r.params = this.extractParams(r.path, match);
        return true;
      }
      return false;
    });

    if (!currentRoute) {
      this.handleError('404 No Matching Route Found for ' + location.hash);
      return location.hash = this.currentRoute?.path || '';
    }

    this.fromRoute = this.currentRoute;
    this.currentRoute = currentRoute;

    this.handleMiddleware();
  }

  extractParams(path, match) {
    const paramNames = path.match(/:\w+/g) || [];
    return paramNames.reduce((params, paramName, index) => {
      params[paramName.substring(1)] = match[index + 1];
      return params;
    }, {});
  }

  async handleMiddleware() {
    const currentRoute = this.currentRoute
    if (currentRoute.middleware.length == 0) {
      return this.handleView()
    }
    for (const i in currentRoute.middleware) {
      try {
        const fn = currentRoute.middleware[i]
        const next = currentRoute.middleware[i + 1] || this.handleView.bind(this)
        // @ts-ignore
        await fn(next)
      } catch (e) {
        return Pop.error('[ROUTE_ERROR::MIDDLEWARE_FAILURE] ' + e.message)
      }
    }
  }

  async handleView() {
    const currentRoute = this.currentRoute
    if (currentRoute.view) {
      await currentRoute.loadTemplate()
      let template = currentRoute.template || currentRoute.view
      let target = document.querySelector(currentRoute.target || this.targetElm)

      if (!target) {
        const main = document.querySelector('main')
        main.id = 'router-view'
        target = main
      }

      if (!target) { throw new Error('Unable to mount view') }
      target.innerHTML = template
    }

    this.fromRoute?.controllers.forEach(c => {
      // @ts-ignore
      delete this.app[c.name]
    })
    currentRoute.controllers.forEach(c => {
      // @ts-ignore
      this.app[c.name] = new c()
    })

  }

  handleError(message) {
    console.error('[router-error]', message)
    Pop.error(message)

  }

}
