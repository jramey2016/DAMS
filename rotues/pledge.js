const express = require('express')
const router = express.Router()
const pledgeController = require('../controllers/pledge')

router.post('/createEvent', pledgeController.createpledge) //controller for pledge creation


module.exports = router