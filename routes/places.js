//VARIABLES
const router   = require('express').Router()
const chalk    = require('chalk')
const axios    = require('axios')
const auth_key = Buffer.from(`${process.env.API_KEY}:${process.env.SECRET_KEY}`).toString('base64')
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
            const photoSearch   = axiosCall.data.included                       //Logic to save the url of the images in a variable, because the api doesn't give it with the rest of the information.
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
    const usserLogged   = await User.findById(req.session.loggedUser._id).populate('placesToVisit')
    const toVisitPlaces = usserLogged.placesToVisit
    
    res.render('users/toVisit', { toVisitPlaces })
})                                                                                                                     //Render the profile views, and populate each of the corresponding arrays

//ROUTE ALREADY VISIT PAGE
router.get('/profile/already-visited', isLoggedIn, async (req, res, next) =>{
    const usserLogged   = await User.findById(req.session.loggedUser._id).populate('placesAlreadyVisited')
    const toVisitPlaces = usserLogged.placesAlreadyVisited
    
    res.render('users/alreadyVisited', { toVisitPlaces, })
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
    const placeSearch = await Place.find({cityId: req.params.id})
   if(placeSearch.length === 0) {                                               //The place does not exist
    const axiosCall = await axios(
        `https://api.roadgoat.com/api/v2/destinations/${req.params.id}`, {
                    
            headers: {
                'Authorization': `Basic ${auth_key}`
            }
        })
        const place = axiosCall.data.data
        let photo           = null
        if(place.relationships.photos){
            const photoId       = axiosCall.data.data.relationships.photos.data[0].id
            const photoSearch   = axiosCall.data.included                                   //Logic to save the url of the images again
             photoSearch.forEach((item) => {
                if(item.id === photoId){
                     photo = item.attributes.image.large
                }
            })
        }
        const dataToUpload = {
            name: place.attributes.long_name,
            destinationType: place.attributes.destination_type,
            population: place.attributes.population,
            averageRating: place.attributes.average_rating,
            alternateNames: place.attributes.alternate_names,
            photo: photo,
            users: [],
            cityId: req.params.id 
        } 
        const createPlace = await Place.create(dataToUpload)                                                        //Create the place
        const userLogged  = await User.findById(req.session.loggedUser._id,)
        if(req.params.enum === 'toVisit' && !userLogged.placesToVisit.includes(createPlace._id)){
            await userLogged.updateOne(
                { $push: { placesToVisit: createPlace._id } },
                { new: true }
            )
        }
        if(req.params.enum === 'alreadyVisited' && !userLogged.placesAlreadyVisited.includes(createPlace._id)){             //Check the button that the user uses and push the place to the corresponding user array, also push the user to the place array
            await userLogged.updateOne(
                { $push: { placesAlreadyVisited: createPlace._id } },
                { new: true }
            )
        }
        if(!createPlace.users.includes(userLogged._id))
            await createPlace.updateOne(
                { $push: { users: userLogged._id} },
                { new: true }
             )
            res.redirect('/profile')
            return
        }    
            
    if(placeSearch.length > 0) {                                                    //The place exists
        const userLogged = await User.findById(req.session.loggedUser._id)
        if(!placeSearch[0].users.includes(userLogged._id)){
            await placeSearch[0].updateOne(
                { $push: { users: userLogged._id} },
                { new: true }
             )
        }
        if(req.params.enum === 'toVisit' && !userLogged.placesToVisit.includes(placeSearch[0]._id)){                    //Only push to arrays without creating the location
            await userLogged.updateOne(
                { $push: { placesToVisit: placeSearch[0]._id } },
                { new: true }
            )
        }
        if(req.params.enum === 'alreadyVisited' && !userLogged.placesAlreadyVisited.includes(placeSearch[0]._id)){
            await userLogged.updateOne(
                { $push: { placesAlreadyVisited: placeSearch[0]._id } },
                { new: true }
            )
        }
        res.redirect('/profile')
            return
    }
})

//ROUTE POST DELETE PLACE
router.post('/delete/:id/:enum', async (req, res, next) => {
    const userLogged  = await User.findById(req.session.loggedUser._id)
    const placeId = req.params.id
        if(req.params.enum === 'toVisit') {
          await userLogged.updateOne(
              { $pull: { placesToVisit: placeId} },
              { new: true} )
          const deletedResult = await Place.findByIdAndUpdate(
              placeId,
              { $pull: { users: userLogged._id} },
              { new: true }
         )      
          if(deletedResult.users.length === 0){
              await Place.findByIdAndDelete(
                  placeId
              )                                                           //When the user clicks on delete, we delete the place from the corresponding array, and the user from the array of users of the place, if the place has no users in its array it is also deleted                   
          }
        }
        if(req.params.enum === 'alreadyVisited') {
            await userLogged.updateOne(
                { $pull: { placesAlreadyVisited: placeId} },
                { new: true} )
            const deletedResult = await Place.findByIdAndUpdate(
                placeId,
                { $pull: { users: userLogged._id}},
                { new: true }
            )  
            if(deletedResult.users.length === 0){
                await Place.findByIdAndDelete(
                    placeId
                )
            }
        }
    res.redirect('/profile')
})

//ROUTE UPDATE TO VISIT - ALREADY VISITED
router.post('/update/:id', async (req, res, next) => {
    const userLogged = await User.findById(req.session.loggedUser._id)
    const placeId    = req.params.id
    await userLogged.updateOne(
        { $pull: { placesToVisit: placeId } },                                  //When the user changes the status of a place, we remove the place from the to visit array and push it to the already visited array
        { new: true }
    )
    await userLogged.updateOne(
        { $push: { placesAlreadyVisited: placeId } },
        { new: true }
    )
    res.redirect('/profile')
})

module.exports = router

