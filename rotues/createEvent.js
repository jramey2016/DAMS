const express = require('express')
const router = express.Router()
const createController = require('../controllers/createEvent')
const authenticateController = require ('../controllers/authenticate')

router.post('/register', authenticateController.registration) //can only access this through a post in the HTML file
 
router.post('/login', authenticateController.login) //controller for log in authentification.

router.post('/createEvent', createController.create) //controller for event creation

module.exports = router