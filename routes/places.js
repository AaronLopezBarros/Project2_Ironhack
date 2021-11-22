//Variables
const router   = require('express').Router()
const chalk    = require('chalk')
const axios    = require('axios')
const auth_key = Buffer.from(`06158c46a81fe6ca54de872a59d59bec:2c9853ff551e804fa5592a697f4661b1`).toString('base64')

//Models
const User  = require('../models/User.model.js')
const Place = require('../models/Place.model.js')

//Render places view
router.get('/places', async (req, res, next) => {
   res.render('places/places')
})

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
//POST route for search places
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

//Post create place
router.post('/create/:id/:enum', async (req, res, next) => {
    const place = await Place.findOne({cityId: req.params.id})
    if(place) {
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
    if(!place) {
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