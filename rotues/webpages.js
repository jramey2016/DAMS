const express = require('express')
const { route } = require('./authenticate')
const router = express.Router()
const authenticateController = require('../controllers/authenticate')
const { decodeBase64 } = require('bcryptjs')
const mysql = require("mysql")
const e = require('express')

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
}) //set up a route to the registration page.

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

router.get('/donor',authenticateController.is_LoggedIn_As_Donor, (req,res) => { //donor's home page, middleware will be used on all of the users accounts dispatch cookies and verify role.
    if(req.user){
        var id_val = req.user.id
    DB.query('SELECT * FROM pledge WHERE usersid = ?', id_val, (error, results) => { //get specific information pertainning to that user.
        res.render('donor', {
            user: req.user,
            pledge: results
          })
    })}else{
        res.redirect('login')
    }
}) //set up router to the donor page

router.get('/recipient', authenticateController.is_LoggedIn_As_Recipient, (req,res) =>{ //recipiends homepage
    if(req.user){
        var id_val = req.user.id
    DB.query('SELECT * FROM request WHERE usersid = ?', id_val, (error,results) =>{ //get specific request information pertaining to that user
        res.render('recipient', {
            user: req.user,
            pledge: results
    })
    })} else{
        res.redirect('login')
    }
    
}) //set up router to the recipient page

router.get('/learn', (req,res) => { 
    res.render('learn')
}) //set up router for the home page

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
}) //router for the view event page.

router.get('/pledge', authenticateController.is_LoggedIn_As_Donor, (req,res) => { //page for donors to make pledges
    if(req.user){
        res.render('pledge', {
            user: req.user
        })
    }else{
        res.redirect('login')
    }
}) //set up router for donor to create pledges

router.get('/request', authenticateController.is_LoggedIn_As_Recipient, (req,res) => { //route for recipient to make request
    if(req.user){
        res.render('request', {
            user: req.user
        })
    }else{
        res.redirect('login')
    }
}) //set up router for recipients to male requests

router.get('/forgot', (req,res) => {
    res.render('forgot')
}) //set up router for the forgot password page.

router.get('/change', (req,res) => {
    res.render('change')
})// change password screeen once the user has verified security quesitons.

//////////////////////////////////////////////////////
router.get('/donorQ', authenticateController.is_LoggedIn_As_Admin, (req,res) => {
if(req.user){
    DB.query('SELECT * FROM pledge where usersid', (error, results) => {
        if(req.user){
            res.render('donorQ', {pledge: results})
        }
    } )
}else{
    res.redirect('login')
}
})
/////////////////////////////////////////////////////

/////////////////////////////////////////////////////////
router.get('/requestQ', authenticateController.is_LoggedIn_As_Admin, (req,res) => {
    if(req.user){
    DB.query('SELECT * FROM request where usersid', (error,results) => {
            res.render('requestQ', {request: results}) 
    })
}else{
    res.redirect('login')
}
} )
////////////////////////////////////////////////////////


module.exports = router

