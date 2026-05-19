import { ExampleController } from "../controllers/ExampleController.js";
import { Router } from "./Router.js";


export const router = new Router([
  {
    path: '',
    controllers: [ExampleController],
    view: /*html*/`
    <div class="bg-white p-3">
      <div class="card-body">
        <p>Home Page</p>
        <button class="btn btn-dark" onclick="app.ExampleController.exampleAction()">😎</button>
      </div>
    </div>
    `
  },
  {
    path: '#/about',
    view: 'app/views/AboutView.html'
  }
])