const axios = require("axios");
require('dotenv').config()

const encoded = (Buffer.from(`${process.env.CONTA_AZUL_CLIENTID}:${process.env.CONTA_AZUL_CLIENT_SECRET}`).toString('base64'));

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

var CronJob = require('cron').CronJob;
var job = new CronJob(
    '0 */50 * * * *',
    function () {
        refresh()
    },
    null,
    true,
    'America/Los_Angeles'
);

//👆👆 this dude makes this 👇👇 function runs every 50min

async function refresh() {
    const headers = {
        "Authorization": `Basic ${encoded}`,
        "Content-Type": "application/json"
    }
    const db = await prisma.conec.findMany({ where: { id: 1 } })

    const body = {
        "grant_type": "refresh_token",
        "refresh_token": `${db[0]?.refresh_token}`
    }


    await axios.post("https://api.contaazul.com/oauth2/token",
        body, { headers }).then(async data => {
            await prisma.conec.update({
                where: { id: 1 },
                data: {
                    access_token: data.data.access_token,
                    refresh_token: data.data.refresh_token
                }
            }
            )
        })
        .catch(err => console.log(err.response?.data))
}

//this 👆👆 part saves on a database the access and refresh_token