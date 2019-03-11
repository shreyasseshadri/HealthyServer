const express = require('express');
const router = express.Router();
const crypt = require('bcrypt-nodejs');
const Patient = require('../models/patient');
const Doctor = require('../models/doctor');

function generateHash(password) {
    return crypt.hashSync(password, crypt.genSaltSync(8), null);
}

router.post('/patient', function (req, res) {

});

router.post('/doctor', function (req, res) {
    
});

module.exports = router;
