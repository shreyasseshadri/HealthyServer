const express = require("express");
const router = express.Router();
const Patient = require("../models/patient");
const Doctor = require("../models/doctor");

router.post("/patient", function (req, res, next) {
    req.checkBody("username", "Invalid username").notEmpty().trim();
    const errors = req.validationErrors();
    if (errors) {
        let error_msgs = errors.map(function (err) {
            return err.msg;
        });
        res.json({success: false, error: error_msgs});
        return;
    }
    Patient.findOne({username: req.body.username}, {password: false, _id: false, __v: false}, (err, doc) => {
        if (err != null || doc == null) {
            res.json({success: false, error: "Invalid username"});
            return;
        }
        res.json({success: true, patient: doc.toObject(),});
    });
});

router.post("/doctor", function (req, res, next) {
    req.checkBody("username", "Invalid username").notEmpty().trim();
    const errors = req.validationErrors();
    if (errors) {
        let error_msgs = errors.map(function (err) {
            return err.msg;
        });
        res.json({success: false, error: error_msgs});
        return;
    }
    Doctor.findOne({username: req.body.username}, {password: false, _id: false, __v: false}, (err, doc) => {
        if (err != null || doc == null) {
            res.json({success: false, error: "Invalid username"});
            return;
        }
        res.json({success: true, doctor: doc.toObject(),});
    });
});


router.post("/doctors", function (req, res, next) {
    const errors = req.validationErrors();
    if (errors) {
        let error_msgs = errors.map(function (err) {
            return err.msg;
        });
        res.json({success: false, error: error_msgs});
        return;
    }
    Doctor.find({}, {password: false, _id: false, __v: false}, (err, docs) => {
        if (err != null || docs == null) {
            res.json({success: false, error: "Request failed"});
            return;
        }
        res.json({success: true, doctors: docs});
    });
});
module.exports = router;
