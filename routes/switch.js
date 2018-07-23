const express = require('express')
const Switch = require('../controllers/switches')

const router = express.Router()

router.get('/off', Switch.Off)
router.get('/on', Switch.On)
router.get('/restart', Switch.Restart)

module.exports = router
