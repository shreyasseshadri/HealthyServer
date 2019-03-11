const express = require("express");
const router = express.Router();
const crypt = require("bcrypt-nodejs");
const Patient = require("../models/patient");
const Doctor = require("../models/doctor");

function checkPassword(password, hash) {
    return crypt.compareSync(password, hash);
}

router.post("/patient", function (req, res, next) {
    req.checkBody("username", "Invalid username").notEmpty().trim();
    req.checkBody("password", "Invalid password").notEmpty().trim();
    const errors = req.validationErrors();
    if (errors) {
        let error_msgs = errors.map(function (err) {
            return err.msg;
        });
        res.json({success: false, error: error_msgs});
        return;
    }
    Patient.findOne({username: req.body.username}, (err, doc) => {
        if (err != null || doc == null || !checkPassword(req.body.password, doc.password)) {
            res.json({success: false, error: "invalid username/password"});
            return;
        }
        res.json({
            success: true, patient: Object.assign(doc.toObject(), {
                password: undefined, _id: undefined, __v: undefined
            })
        });
    });
});

router.post("/doctor", function (req, res, next) {
    req.checkBody("username", "Invalid username").notEmpty().trim();
    req.checkBody("password", "Invalid password").notEmpty().trim();
    const errors = req.validationErrors();
    if (errors) {
        let error_msgs = errors.map(function (err) {
            return err.msg;
        });
        res.json({success: false, error: error_msgs});
        return;
    }
    Doctor.findOne({username: req.body.username}, (err, doc) => {
        if (err != null || doc == null || !checkPassword(req.body.password, doc.password)) {
            res.json({success: false, error: "invalid username/password"});
            return;
        }
        res.json({
            success: true, doctor: Object.assign(doc.toObject(), {
                password: undefined, _id: undefined, __v: undefined
            })
        });
    });
});

module.exports = router;
