const { Router } = require('express')
const routes = new Router()
const RegisterController = require('./src/app/controllers/registerController')
require("dotenv").config()

const AccessController = require('./src/app/controllers/accessController')

routes.post(process.env.ROUTE_POST, RegisterController.store)
routes.post(process.env.TOKENS, AccessController.update)
routes.get(process.env.TOKENS, AccessController.index)


module.exports = routes
