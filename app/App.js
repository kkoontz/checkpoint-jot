import { JotsController } from './controllers/JotsController.js'

class App {
  jotsController = new JotsController()
}

window['app'] = new App()
