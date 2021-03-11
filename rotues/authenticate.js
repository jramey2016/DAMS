const express = require('express')
const router = express.Router()
const authenticateController = require ('../controllers/authenticate')

router.post('/register', authenticateController.registration) //can only access this through a post in the HTML file
 
router.post('/login', authenticateController.login) //controller for log in authentification.

router.get('/logout', authenticateController.logout) //logout controller

//router.post('/createEvent',authenticateController.createEvent)
module.exports = router