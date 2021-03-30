const express = require('express')
const router = express.Router()
const requestController = require('../controllers/request')

router.post('/request', requestController.request) //controller for request creation.

module.exports = router
