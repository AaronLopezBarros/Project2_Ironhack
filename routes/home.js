//VARIABLES
const router       = require('express').Router()
const {isLoggedIn} = require('../middleware/route-guard')

//GET HOME PAGE
router.get('/', (req, res, next) => {
    res.render('home')
})

//ROUTE TO THE PROFILE PAGE
router.get('/profile', isLoggedIn, (req, res, next) => {
    res.render('myUser/myPage')
})

module.exports = router