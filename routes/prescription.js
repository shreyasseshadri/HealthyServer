const express = require("express");
const router = express.Router();
const Patient = require("../models/patient");
const Prescription = require("../models/prescription");

router.post("/issue", function (req, res) {
    if (!req.isAuthenticated() || req.user.type !== "doctor") {
        res.json({success: false, error: "Auth error"});
        return;
    }
    req.checkBody("patient", "Invalid patient username").notEmpty().trim();
    const errors = req.validationErrors();
    if (errors) {
        let error_msgs = errors.map(function (err) {
            return err.msg;
        });
        res.json({success: false, error: error_msgs});
        return;
    }
    let pre = {
        doctor: req.user.username,
        toi: Math.floor((new Date).getTime() / 1000),
        note: req.body.note,
        content: req.body.content,
    };
    Patient.findOne({username: req.body["patient"]},
        {username: true},
        (err, patient) => {
            if (err != null || patient == null) {
                res.json({success: false, err: "Patient does not exist"});
                return;
            }
            pre.patient = patient.username;
            Prescription(pre).save((err, doc) => {
                if (err != null || doc == null)
                    res.json({success: false, error: "Invalid prescription"});
                else
                    res.json({success: true, prescription: doc});
            });
        });
});

router.post("/getAll", function (req, res) {
    if (!req.isAuthenticated()) {
        res.json({success: false, error: "Auth error"});
        return;
    }
    Prescription.find({[req.user.type]: req.user.username}, (err, docs) => {
        if (err != null || docs == null)
            res.json({success: false, error: "Error fetching prescriptions", e: err});
        else {
            docs.sort((doc1, doc2) => -(doc1.toi - doc2.toi));
            res.json({success: true, prescriptions: docs});
        }
    });
});

router.post("/getById", function (req, res) {
    if (!req.isAuthenticated()) {
        res.json({success: false, error: "Auth error"});
        return;
    }
    req.checkBody("id", "Invalid id").notEmpty().trim();
    const errors = req.validationErrors();
    if (errors) {
        let error_msgs = errors.map(function (err) {
            return err.msg;
        });
        res.json({success: false, error: error_msgs});
        return;
    }
    Prescription.findById(req.body.id, (err, doc) => {
        if (err != null || doc == null)
            res.json({success: false, error: "Error fetching prescription"});
        else if (doc[req.user.type] !== req.user.username)
            res.json({success: false, error: "Not your prescription"});
        else
            res.json({success: true, prescription: doc});
    });
});


router.post("/getLatest", function (req, res) {
    if (!req.isAuthenticated()) {
        res.json({success: false, error: "Auth error"});
        return;
    }
    req.checkBody("count", "Invalid count").isNumeric();
    const errors = req.validationErrors();
    if (errors) {
        let error_msgs = errors.map(function (err) {
            return err.msg;
        });
        res.json({success: false, error: error_msgs});
        return;
    }
    Prescription
        .find({[req.user.type]: req.user.username})
        .sort("-toi")
        .limit(req.body.count)
        .exec((err, docs) => {
            if (err != null || docs == null)
                res.json({success: false, error: "Error fetching prescriptions"});
            else
                res.json({success: true, prescriptions: docs});
        });
});

module.exports = router;
