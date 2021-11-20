//Middleware for .env
require('dotenv/config')

//Import Mongo connection
require('./db/index')

//Variables
const PORT     = process.env.Port || 3000
const express  = require('express')
const app      = express()
const hbs      = require('hbs')
const mongoose = require('mongoose')
const chalk    = require('chalk')
const cookieParser = require("cookie-parser")

//Middleware for hbs
app.set('view engine', 'hbs')
app.set('views', __dirname + '/views')

//Middleware de body parser
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

//Middleware for static files
app.use(express.static(__dirname + '/public'))

//Middleware de sessions
require("./config/session.config")(app)

//Routes🚀
app.use('/', require('./routes/home'))
app.use('/', require('./routes/auth'))

//App listener
app.listen(PORT, () => {
    console.log(chalk.bgGreen(`Server running in port ${PORT}`))
})