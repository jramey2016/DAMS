const express = require('express')
const router = express.Router()
const authenticateController = require ('../controllers/authenticate')

router.post('/register', authenticateController.registration) //can only access this through a post in the HTML file
 
router.post('/login', authenticateController.login) //controller for log in authentification.

router.get('/logout', authenticateController.logout) //logout controller

router.post('/forgot', authenticateController.forgot) //controller for forgotten password

router.post('/updateEvent', authenticateController.updateEvent) //controller to update an event

router.post('/updateEventConfirm', authenticateController.updateEventConfirm) //controller to complete updating an event.

router.post('/delEvent', authenticateController.delEvent) //controller for when a user would like to delte an event

router.post('/delPledge', authenticateController.delPledge) //controller for donor to delete thier pledge

router.post('/delRequest', authenticateController.delRequest) //controller for recipient to delete thier request

router.post('/searchrecepPQ', authenticateController.searchrecepPQ) //controller to search pledgeQ on the recipient side

router.post('/searchdonorQ', authenticateController.searchdonorQ) //controller to search donorQ on the admin side.

router.post('/searchdonorRQ', authenticateController.searchdonorRQ) //controoler to search requestQ on the donor side.

router.post('/searchrequestQ',authenticateController.searchrequestQ) //controller to search requestQ on the admin side.

router.post('/deleteRA', authenticateController.deleteRA) //controller for admin to delete a request.

router.post('/deletePA', authenticateController.deletePA) //controller for admin to delete a pledge.

router.post('/recepConnect', authenticateController.recepConnect) //receipient is connecting to a donors pledge.

router.post('/acceptPledge', authenticateController.acceptPledge) //for recipient to accept the pledge.

router.post('/donorConnect', authenticateController.donorConnect) //for the donor to accept the request. 

router.post('/acceptRequest', authenticateController.acceptRequest) //for the donor to accept the request.


module.exports = router