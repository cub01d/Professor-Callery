const express = require('express')
const Switch = require('../controllers/switches')

const router = express.Router()

router.get('/off', Switch.Off)
router.get('/on', Switch.On)
router.get('/restart', Switch.Restart)
router.get('/', function(req, res) {
    var date = new Date(null);
    date.setSeconds(process.uptime()); // specify value for SECONDS here
    var result = date.toISOString().substr(11, 8);
    res.send(result);
});

module.exports = router
