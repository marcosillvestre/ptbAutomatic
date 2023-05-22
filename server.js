const app = require('./')
const day = new Date()
const currentDay = day.toLocaleString()
const port = process.env.PORT ?? 3333
app.listen(port, () => console.log(`server running on port ${port} at ${currentDay}`))