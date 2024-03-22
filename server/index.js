const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const mongoose = require("mongoose")
const registerRoutes = require("./routes/userRoutes")

const app = express()
require("dotenv").config()

app.use(cors())
app.use(bodyParser.json())

app.use("/api/auth", registerRoutes)

mongoose.connect(process.env.MONGO_URL).then(() => {
  console.log("DB connection successful")
}).catch((e) => {
  console.log(e.message)
})

const server = app.listen(process.env.PORT, () => {
  console.log(`Server started on Port ${process.env.PORT}`)
})

