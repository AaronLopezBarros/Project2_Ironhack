//VARIABLES
const router = require('express').Router()
const chalk    = require('chalk')
const {isLoggedIn} = require('../middleware/route-guard')

//MODELS
const User  = require('../models/User.model.js')

//ROUTE GET TO RENDER USERS PLACES
router.get('/:id/:enum', isLoggedIn, async (req, res, next) => {
    try{
        if(req.params.enum === 'alreadyVisited'){
        const user                 = await User.findById(req.params.id).populate('placesAlreadyVisited')
        const alreadyVisitedPlaces = user.placesAlreadyVisited
    
        res.render('users/alreadyVisited', { user, alreadyVisitedPlaces })
    }
        if(req.params.enum === 'toVisit'){
        const user                 = await User.findById(req.params.id).populate('placesToVisit')
        const toVisitPlaces        = user.placesToVisit
    
        res.render('users/toVisit', { user, toVisitPlaces  })
    }
    } catch(err){
        console.log(chalk.bgRed(err))
    }
    
})

//ROUTER POST FOR SEARCH OTHER USERS
router.post('/', isLoggedIn, async (req, res, next) => {
    try{
        let user = await User.find( { username: req.body.name } )
        user = user[0]
        if(user){
            res.render('users/page', { user }) 
        }
        if(!user){
            res.render('users/page', { msg: "User doesn't exist" } ) 
        }
    } catch(err){
        console.log(chalk.bgRed(err))
    }
})





module.exports = router