require('dotenv').config()
const yup = require('yup')

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

class AccessController {

    async index(req, res) {
        const db = await prisma.conec.findMany({
            where: { id: 1 }
        })
        return res.status(201).json(db[0])
    }



}
module.exports = new AccessController()
