//Variables
const router = require('express').Router()

//Get home page
router.get('/', (req, res, next) => {
    res.render('home')
})

module.exports = router