const express = require("express");
const router = express.Router();
const Patient = require("../models/patient");
const Doctor = require("../models/doctor");

router.post("/self", function (req, res) {
    if (!req.isAuthenticated()) {
        res.json({success: false, error: "Auth error"});
        return;
    }
    switch (req.user.type) {
        case "patient":
            Patient.findById(req.user._id, {password: false, _id: false, __v: false}, (err, doc) => {
                if (err != null || doc == null) {
                    res.json({success: false, error: "Auth error"});
                    return;
                }
                res.json({success: true, patient: doc.toObject(),});
            });
            break;
        case "doctor":
            Doctor.findById(req.user._id, {password: false, _id: false, __v: false}, (err, doc) => {
                if (err != null || doc == null) {
                    res.json({success: false, error: "Auth error"});
                    return;
                }
                res.json({success: true, doctor: doc.toObject(),});
            });
            break;
        default:
            res.json({success: false, error: "Auth error"});
    }
});

router.post("/patient", function (req, res) {
    if (!req.isAuthenticated() || req.user.type !== "doctor") {
        res.json({success: false, error: "Auth error"});
        return;
    }
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

router.post("/doctor", function (req, res) {
    if (!req.isAuthenticated()) {
        res.json({success: false, error: "Auth error"});
        return;
    }
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


router.post("/doctors", function (req, res) {
    if (!req.isAuthenticated()) {
        res.json({success: false, error: "Auth error"});
        return;
    }
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
