//Variables
const router         = require('express').Router()
const bcrypt         = require('bcryptjs')
const chalk          = require('chalk')
const { isLoggedIn } = require('../middleware/route-guard')

//Models
const User = require('../models/User.model')

//RENDER SIGNUP VIEW
router.get('/signup', (req, res, next) => {
    res.render('users/signup')
})

//RENDER LOGIN VIEW
router.get('/login', (req, res, next) => {
    res.render('users/login')
})

//POST ROUTE TO CREATE USER
router.post('/signup', async (req, res, next) => {
    const { username, password, email, repeatPassword } = req.body
    
//Check for empty fields
    if (!username || !password || !email || !repeatPassword) {
        res.render('users/signup', { msg: 'You need to fill all inputs'})
        return
    } 

//Compare passwords
    if (password !== repeatPassword) {
        res.render('users/signup', { msg: 'Password does not match'})
        return
    }

//Check password has min 8 letters
    if (password.length < 8){
        res.render('users/signup', { msg: 'Your password should be at least 8 characters long'})
        return
    }

//Check the user no exists   
    const userExists = await User.findOne({ username })                             
    if (userExists) {
        res.render('users/signup', { msg: 'This user already has an account'})
        return
    }

//Chek email
    if (/\S+@\S+\.\S+/.test(email) === false) {
        res.render('users/signup', { msg: 'Please put a valid e-mail'})
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
        res.render('users/login', { msg: 'You need to fill all inputs'})
        return
    } 

//Check the user exists   
    const userExists = await User.findOne({ username })                             
    if (!userExists) {
        res.render('users/login', { msg: "User doesn't exist"})
        return
    }
//Verificar si la contraseña es correcta
    const passwordMatch = await bcrypt.compare(password, userExists.password)
    if (!passwordMatch) {
        res.render('users/login', { msg: 'Incorrect password' })
        return
 }
//Login
    req.session.loggedUser = userExists
    console.log('SESSION ====> ,', req.session)
    res.redirect('/')
})

//POST LOGOUT
router.get('/logout', isLoggedIn, async (req, res, next) => {
    res.clearCookie('connect.sid', { path: '/' })
  
    try {
      await req.session.destroy()
      res.redirect("/")
    } catch (err) {
      next(err)
    }
  });

module.exports = router