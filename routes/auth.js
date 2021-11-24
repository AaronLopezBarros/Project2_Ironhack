//VARIABLES
const router         = require('express').Router()
const bcrypt         = require('bcryptjs')
const chalk          = require('chalk')

//MODELS
const User = require('../models/User.model')

//RENDER SIGNUP VIEW
router.get('/signup', (req, res, next) => {
    res.render('myUser/signup')
})

//RENDER LOGIN VIEW
router.get('/login', (req, res, next) => {
    res.render('myUser/login')
})

//POST ROUTE TO CREATE USER
router.post('/signup', async (req, res, next) => {
    const { username, password, email, repeatPassword } = req.body
    
//Check for empty fields
    if (!username || !password || !email || !repeatPassword) {
        res.render('myUser/signup', { msg: 'You need to fill all inputs'})
        return
    } 

//Compare passwords
    if (password !== repeatPassword) {
        res.render('myUser/signup', { msg: 'Password does not match'})
        return
    }

//Check password has min 8 letters
    if (password.length < 8){
        res.render('myUser/signup', { msg: 'Your password should be at least 8 characters long'})
        return
    }

//Check the user no exists   
    const userExists = await User.findOne({ username })                             
    if (userExists) {
        res.render('myUser/signup', { msg: 'This user already has an account'})
        return
    }

//Chek email
    if (/\S+@\S+\.\S+/.test(email) === false) {
        res.render('myUser/signup', { msg: 'Please put a valid e-mail'})
        return
    }
//Create User
    try{
        const hashedPassword = await bcrypt.hash(password, 10)         //Encrypt password
        const createUser     = await User.create({
            username,
            email,
            password: hashedPassword,
        })
        res.redirect('/login')
    } catch(err){
        console.log(chalk.bgRed('Error:', err))
    }
})

//POST FOR LOGIN
router.post('/login', async (req, res, next) => {
    const { username, password } = req.body

//Check for empty fields
    if (!username || !password) {
        res.render('myUser/login', { msg: 'You need to fill all inputs'})
        return
    } 

//Check the user exists   
    const userExists = await User.findOne({ username })                             
    if (!userExists) {
        res.render('myUser/login', { msg: "User doesn't exist"})
        return
    }
//Verificar si la contraseña es correcta
    const passwordMatch = await bcrypt.compare(password, userExists.password)
    if (!passwordMatch) {
        res.render('myUser/login', { msg: 'Incorrect password' })
        return
 }
//Login
    req.session.loggedUser = userExists
    console.log('SESSION ====> ,', req.session)
    res.redirect('/')
})

//POST LOGOUT
router.get('/logout', async (req, res, next) => {
    res.clearCookie('connect.sid', { path: '/' })
  
    try {
      await req.session.destroy()
      res.redirect("/")
    } catch (err) {
      next(err)
    }
  });

module.exports = router