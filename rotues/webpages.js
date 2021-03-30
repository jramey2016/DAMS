const express = require('express')
const { route } = require('./authenticate')
const router = express.Router()
const authenticateController = require('../controllers/authenticate')
const { decodeBase64 } = require('bcryptjs')
const mysql = require("mysql")



//connect to our database
const DB = mysql.createConnection({
    host: process.env.HOST, //connecting to local host since were working locally 
    user: process.env.USER,  //Bring in information from the env
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});
//on Browser ===> http://localhost/phpmyadmin/

router.get('/',(req,res) => {
    res.render('index') 
}) //set up a route to main page.


router.get('/register',(req,res) => {
    res.render('register') 
}) //set up a route to main page.

router.get('/login', (req,res) => {
    res.render('login')
}) //set up router to the login page.

router.get('/admin', authenticateController.is_LoggedIn_As_Admin, (req,res) => { //need middle ware authentification we will create a specific middleware to ensure user is thier specifc role for all roles.
    if(req.user){
        res.render('admin', {
            user: req.user //we can now have thier name, password, etc. passed through different routes
        }) 
    }else{
        res.redirect('login')
    }
    
}) //set up router to the admin page

router.get('/donor',authenticateController.is_LoggedIn_As_Donor, (req,res) => {
    if(req.user){
        var id_val = req.user.id
    DB.query('SELECT * FROM pledge WHERE usersid = ?', id_val, (error, results) => {
        res.render('donor', {
            user: req.user,
            pledge: results
          })
    })
    }else{
        res.redirect('login')
    }
}) //set up router to the donor page

router.get('/recipient', authenticateController.is_LoggedIn_As_Recipient, (req,res) =>{ //middle for autentification
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

router.get('/createEvent',authenticateController.is_LoggedIn_As_Admin, (req,res) => { //still need middleware only an admin should be able to view this page.
    if(req.user){
    res.render('createEvent', {
        user:req.user
    })
    }else{
        res.redirect('login')
    }
}) //set up the page for admins to create events


router.get('/viewEvent',authenticateController.is_LoggedIn_As_Admin, (req,res) => {
    if(req.user){
   DB.query('SELECT * FROM events', (error, results) =>{ //get information from database     
        res.render('viewEvent', {event: results})//set up page for users to view events 
    })
} else{
    res.redirect('login')
}
})

router.get('/pledge', authenticateController.is_LoggedIn_As_Donor, (req,res) => { //page for donors to make pledges
    if(req.user){
        res.render('pledge', {
            user: req.user
        })
    }
    else{
        res.redirect('login')
    }
})

router.get('/request', authenticateController.is_LoggedIn_As_Recipient, (req,res) => { //route for recipient to make request
    if(req.user){
        res.render('request', {
            user: req.user
        })
    }else{
        res.redirect('login')
    }
})

router.get('/forgot', (req,res) => {
    res.render('forgot')
})

module.exports = router