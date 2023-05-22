const { Router } = require('express')
const routes = new Router()
const RegisterController = require('./src/app/controllers/registerController')
require("dotenv").config()

const AccessController = require('./src/app/controllers/accessController')

routes.post("/cadastros", RegisterController.store)
routes.post("/access", AccessController.update)
routes.get("/access", AccessController.index)


module.exports = routes
