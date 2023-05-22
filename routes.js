const { Router } = require('express')
const routes = new Router()

const express = require('express')
const app = express()

const RegisterController = require('./src/app/controllers/registerController')
require("dotenv").config()

const AccessController = require('./src/app/controllers/accessController')

routes.post("/cadastros", RegisterController.store)
routes.post("/access", AccessController.update)
routes.get("/access", AccessController.index)

app.get("/", (req, res) => {
    return res.json("ta on")
})

module.exports = routes
