import { InkwellController } from './controllers/InkwellController.js'

class App {
  inkwellController = new InkwellController()
}

window['inkwell'] = new App()
