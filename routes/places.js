//VARIABLES
const router   = require('express').Router()
const chalk    = require('chalk')
const axios    = require('axios')
const auth_key = Buffer.from(`06158c46a81fe6ca54de872a59d59bec:2c9853ff551e804fa5592a697f4661b1`).toString('base64')
const {isLoggedIn} = require('../middleware/route-guard')


//MODELS
const User  = require('../models/User.model.js')
const Place = require('../models/Place.model.js')

//RENDER PLACES VIEW
router.get('/places', async (req, res, next) => {
   res.render('places/places')
})

//SEARCH PLACE INFO AND RENDER VIEW
router.get('/places/:id', async (req, res, next) => {
    try{
        const axiosCall = await axios(
            `https://api.roadgoat.com/api/v2/destinations/${req.params.id}`,
            {
                headers: {
                    'Authorization': `Basic ${auth_key}`
                }
            }) 
        const place = axiosCall.data.data
        if(place.relationships.photos){
            const photoId       = place.relationships.photos.data[0].id
            const photoSearch   = axiosCall.data.included
            let photo           = {}
              photoSearch.forEach((item) => {
                  if(item.id === photoId){
                      photo = item.attributes.image.large
                  }
              })
              res.render('places/placeInfo', { place, photo })
        } else {
            res.render('places/placeInfo', { place })
        }

        
    } catch(err){
        console.log(chalk.bgRed(err))
    }
   
})

//ROUTE TO VISIT PAGE
router.get('/profile/to-visit', isLoggedIn, async (req, res, next) =>{
    const usserLogged   = await User.findById(req.session.loggedUser._id).populate('places')
    const toVisitPlaces = []
    usserLogged.places.forEach((place) => {
        if(place.status === 'toVisit'){
            toVisitPlaces.push(place)
        }
    })
    res.render('users/toVisit', { toVisitPlaces })
})

//ROUTE ALREADY VISIT PAGE
router.get('/profile/already-visited', isLoggedIn, async (req, res, next) =>{
    const usserLogged   = await User.findById(req.session.loggedUser._id).populate('places')
    const toVisitPlaces = []
    usserLogged.places.forEach((place) => {
        if(place.status === 'alreadyVisited'){
            toVisitPlaces.push(place)
        }
    })
    res.render('users/alreadyVisited', { toVisitPlaces })
})

//POST ROUTE FOR SEARCH PLACES
router.post('/places', async (req, res, next) => {
    try{
        const axiosCall = await axios(
        `https://api.roadgoat.com/api/v2/destinations/auto_complete?q=${req.body.name}`,
        {
        headers: {
            'Authorization': `Basic ${auth_key}`
        }
    })
    const places = axiosCall.data.data
    res.render('places/places', { places })
    } catch(err){
        console.log(chalk.bgRed(err))
    }
    
})

//POST CREATE PLACE
router.post('/create/:id/:enum', isLoggedIn, async (req, res, next) => {
    const place = await Place.findOne({cityId: req.params.id})
    if(place && place.status === req.params.enum ) {
        const userLogged  = await User.findById(req.session.loggedUser._id,)
        if(!userLogged.places.includes(place._id)){
            userLogged.updateOne(
                { $push: { places: place._id } },
                { new: true }
            )
            await place.updateOne(
                { $push: { users: userLogged._id} },
                { new: true }
            )
        }
        
        res.redirect('/profile')
        return
    } 
    if(!place) {    //|| (place && place.status !== req.params.enum)
        const axiosCall = await axios(
            `https://api.roadgoat.com/api/v2/destinations/${req.params.id}`,
            {
                headers: {
                    'Authorization': `Basic ${auth_key}`
                }
            })
        const place = axiosCall.data.data
        if(place.relationships.photos){
            const photoId       = axiosCall.data.data.relationships.photos.data[0].id
            const photoSearch   = axiosCall.data.included
            let photo           = ''
              photoSearch.forEach((item) => {
                  if(item.id === photoId){
                      photo = item.attributes.image.large
                  }
              })
             const dataToUpload = {
                 name: place.attributes.long_name,
                 destinationType: place.attributes.destination_type,
                 population: place.attributes.population,
                 averageRating: place.attributes.average_rating,
                 alternateNames: place.attributes.alternate_names,
                 photo: photo,
                 users: [],
                 status: req.params.enum,
                 cityId: req.params.id 
             } 
             const createPlace = await Place.create(dataToUpload)
             const userLogged  = await User.findByIdAndUpdate(
                req.session.loggedUser._id,
                { $push: { places: createPlace._id } },
                { new: true }
            )
             await createPlace.updateOne(
                 { $push: { users: userLogged._id} },
                 { new: true }
             )
             res.redirect('/profile')
            return
        }
   }
})

module.exports = router