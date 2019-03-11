const express = require("express");
const router = express.Router();
const crypt = require("bcrypt-nodejs");
const Patient = require("../models/patient");
const Doctor = require("../models/doctor");

function generateHash(password) {
    return crypt.hashSync(password, crypt.genSaltSync(8), null);
}

router.post("/patient", function (req, res) {
    req.checkBody("username", "Invalid username").notEmpty().trim();
    req.checkBody("password", "Invalid password").notEmpty().trim();
    req.checkBody("email", "Invalid email ID").trim().isEmail().normalizeEmail();
    req.checkBody("name", "Invalid name").notEmpty().trim();
    req.checkBody("dob", "Invalid dob").notEmpty().trim();
    req.checkBody("phone", "Invalid phone").notEmpty().trim();
    // Todo: validate dob and phone
    const errors = req.validationErrors();
    if (errors) {
        let error_msgs = errors.map(function (err) {
            return err.msg;
        });
        res.json({success: false, error: error_msgs});
        return;
    }
    let new_user = {
        username: req.body.username,
        password: generateHash(req.body.password),
        email: req.body.email,
        name: req.body.name,
        dob: req.body.dob,
        phone: req.body.phone,
    };
    if (!new_user.username.match(/^[0-9a-z]+$/)) {
        res.json({success: false, error: "invalid username"});
        return;
    }
    // Todo: add more checks
    let patient = Patient(new_user);
    patient.save((err) => {
        if (err) {
            res.json({success: false, error: "username/email/phone already registered"});
            return;
        }
        res.json({success: true, patient: {...new_user, password: undefined}});
    });
});

router.post("/doctor", function (req, res) {
    req.checkBody("username", "Invalid username").notEmpty().trim();
    req.checkBody("password", "Invalid password").notEmpty().trim();
    req.checkBody("email", "Invalid email ID").trim().isEmail().normalizeEmail();
    req.checkBody("dob", "Invalid dob").notEmpty().trim();
    req.checkBody("phone", "Invalid phone").notEmpty().trim();
    // Todo: validate dob & phone
    req.checkBody("qualifications", "Invalid qualifications").notEmpty().trim();
    req.checkBody("specializations", "Invalid specializations").notEmpty().trim();
    const errors = req.validationErrors();
    if (errors) {
        let error_msgs = errors.map(function (err) {
            return err.msg;
        });
        res.json({success: false, error: error_msgs});
        return;
    }
    let new_user = {
        username: req.body.username,
        password: generateHash(req.body.password),
        email: req.body.email,
        name: req.body.name,
        dob: req.body.dob,
        phone: req.body.phone,
        qualifications: req.body.qualifications,
        specializations: req.body.specializations,
    };
    if (!new_user.username.match(/^[0-9a-z]+$/)) {
        res.json({success: false, error: "invalid username"});
        return;
    }
    // Todo: add more checks
    let doctor = Doctor(new_user);
    doctor.save((err) => {
        if (err) {
            res.json({success: false, error: "username/email/phone already registered"});
            return;
        }
        res.json({success: true, doctor: {...new_user, password: undefined}});
    });
});

module.exports = router;
