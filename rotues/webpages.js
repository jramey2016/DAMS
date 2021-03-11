const express = require('express')
const { route } = require('./authenticate')
const router = express.Router()
const authenticateController = require('../controllers/authenticate')

router.get('/',(req,res) => {
    res.render('index') 
}) //set up a route to main page.

router.get('/register',(req,res) => {
    res.render('register') 
}) //set up a route to main page.

router.get('/login', (req,res) => {
    res.render('login')
}) //set up router to the login page.

router.get('/admin', authenticateController.isLoggedIn, (req,res) => { //need middle ware authentification
    if(req.user){
        res.render('admin', {
            user: req.user //we can now have thier name, password, etc. passed through different routes
        }) 
    }else{
        res.redirect('login')
    }
    
}) //set up router to the admin page

router.get('/donor',authenticateController.isLoggedIn, (req,res) => {
    if(req.user){
    res.render('donor', {
        user: req.user
    })
    }else{
        res.redirect('login')
    }
}) //set up router to the donor page

router.get('/recipient', authenticateController.isLoggedIn, (req,res) =>{ //middle for autentification
    if(req.user){
        res.render('recipient', {
            user: req.user
        }) 
    } else{
        res.redirect('login')
    }
    
}) //set up router to the recipient page

router.get('/learn', (req,res) => {
    res.render('learn')
})

router.get('/createEvent', (req,res) => {
    res.render('createEvent')
})//set up router for admin to create an event

module.exports = router