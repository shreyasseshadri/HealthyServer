const express = require('express');
const router = express.Router();
const crypt = require('bcrypt-nodejs');

function checkPassword(password, hash) {
    return crypt.compareSync(password, hash);
}

router.post('/patient', function (req, res, next) {

});

router.post('/doctor', function (req, res, next) {

});

module.exports = router;
