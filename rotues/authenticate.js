const express = require('express')
const router = express.Router()
const authenticateController = require ('../controllers/authenticate')

router.post('/register', authenticateController.registration) //can only access this through a post in the HTML file
 
router.post('/login', authenticateController.login) //controller for log in authentification.

router.get('/logout', authenticateController.logout) //logout controller

router.post('/forgot', authenticateController.forgot) //controller for forgotten password

router.post('/updateEvent', authenticateController.updateEvent) //controller to update an event

router.post('/delEvent', authenticateController.delEvent) //controller for when a user would like to delte an event

router.post('/delPledge', authenticateController.delPledge) //controller for donor to delete thier pledge

router.post('/updatePledge', authenticateController.updatePledge) //controller for donor to update thier pledge

router.post('/delRequest', authenticateController.delRequest) //controller for recipient to delete thier request

router.post('/editRequest', authenticateController.editRequest) //conotroller for recipient to edit thier request

module.exports = router