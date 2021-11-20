//Variables
const router   = require('express').Router()
const chalk    = require('chalk')
const axios    = require('axios')
const auth_key = Buffer.from(`06158c46a81fe6ca54de872a59d59bec:2c9853ff551e804fa5592a697f4661b1`).toString('base64')

//Models




// const axiosCall = await axios(
//     `https://api.roadgoat.com/api/v2/destinations/auto_complete?q=paris`,
//     {
//         headers: {
//             'Authorization': `Basic ${auth_key}`
//         }
//     }
// )
// console.log(axiosCall.data.data[0])

//Render places view
router.get('/places', async (req, res, next) => {
   res.render('places/places')
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
    console.log(places)
    res.render('places/places', { places })
    } catch(err){
        console.log(chalk.bgRed(err))
    }
    
})


module.exports = router