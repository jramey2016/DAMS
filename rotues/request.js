const express = require('express')
const router = express.Router()
const requestController = require('../controllers/request')

router.post('/request', requestController.request)

module.exports = router
