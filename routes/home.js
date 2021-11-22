//Variables
const router = require('express').Router()

//Models
const User  = require('../models/User.model.js')

//Get home page
router.get('/', (req, res, next) => {
    res.render('home')
})

//Route to profile page
router.get('/profile', (req, res, next) => {
    res.render('users/myPage')
})

//Route to visit page
router.get('/profile/to-visit', async (req, res, next) =>{
    const usserLogged   = await User.findById(req.session.loggedUser._id).populate('places')
    const toVisitPlaces = []
    usserLogged.places.forEach((place) => {
        if(place.status === 'toVisit'){
            toVisitPlaces.push(place)
        }
    })
    console.log(toVisitPlaces)
    res.render('users/toVisit', { toVisitPlaces })
})

//Route already visited page
router.get('/profile/already-visited', (req, res, next) =>{
    res.render('users/alreadyVisited')
})

module.exports = router