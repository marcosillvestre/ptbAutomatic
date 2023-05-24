const { Router } = require('express')
const routes = new Router()

const RegisterController = require('./app/controllers/registerController')
require("dotenv").config()

const AccessController = require('./app/controllers/accessController')

routes.post("/cadastros", RegisterController.store)
routes.post("/access", AccessController.update)
// routes.get("/access", AccessController.index)

routes.get("/access", (req, res) => {
    return res.json("Hello World")
})

routes.get("/", (req, res) => {
    return res.json("Hello World")
})

module.exports = routes
