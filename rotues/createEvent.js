const express = require('express')
const router = express.Router()
const createController = require('../controllers/createEvent')
const { route } = require('./authenticate')

router.post('/createEvent', createController.create) //controller for event creation


module.exports = router