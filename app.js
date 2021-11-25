//MIDDLEWARE FOR .ENV
require('dotenv/config')

//IMPORT MONGO CONNECTION
require('./db/index')

//VARIABLES
const PORT         = process.env.PORT || 3000
const express      = require('express')
const app          = express()
const hbs          = require('hbs')
const mongoose     = require('mongoose')
const chalk        = require('chalk')
const cookieParser = require("cookie-parser")

//MIDDLEWARE FOR HBS
app.set('view engine', 'hbs')
app.set('views', __dirname + '/views')

//MIDDLEWARE FOR BODY PARSER
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

//MIDDLEWARE FOR STATIC FILES
app.use(express.static(__dirname + '/public'))

//MIDDLEWARE OF SESSIONS
require("./config/session.config")(app)

//HELPER HBS
hbs.registerHelper('ratingFixed', (rating) => {
    return rating.toFixed(2)
})

//ROUTE FOR CHECK IS USER LOGGED
app.use((req, res, next) => {
    if (req.session.loggedUser) {
       res.locals.session = req.session
    }
    next()
  })

//ROUTES🚀
app.use('/', require('./routes/home'))
app.use('/', require('./routes/auth'))
app.use('/', require('./routes/places'))
app.use('/users', require('./routes/users'))

//APP LISTENER
app.listen(PORT, () => {
    console.log(chalk.bgGreen(`Server running in port ${PORT}`))
})