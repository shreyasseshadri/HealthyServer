const express = require("express");
const router = express.Router();
const Conversation = require("../models/conversation");
const Message = require("../models/message");
const Patient = require("../models/patient");
const Doctor = require("../models/doctor");

const conn = {}, conversationCache = {};

router.ws("/", function (ws, req) {
    if (!req.isAuthenticated()) {
        ws.terminate();
        return;
    }
    ws.user = req.user;
    // Todo: Handle multiple ws per user with array if needed
    conn[ws.user.username] = ws;
    ws.on("message", function (ws, msg) {
        process(ws, msg);
    }.bind(null, ws));
    ws.on("error", function () {
    });
    ws.on("close", function (ws, event) {
        if (conn[ws.user.username] != null) {
            delete conn[ws.user.username];
        }
    }.bind(null, ws));
});

function process(ws, msg) {
    let cmd = null;
    try {
        cmd = JSON.parse(msg);
    } catch (e) {
        ws.send(JSON.stringify({type: "err", msg: "Illegal msg"}));
        return;
    }
    switch (cmd.type) {
        case "chat_msg": {
            if (cmd.chat == null || cmd.chat["to"] == null || cmd.chat["msg"] == null)
                break;
            let to = cmd.chat.to, from = ws.user.username;
            let toModel = ws.user.type === "patient" ? Doctor : Patient;
            // Todo: Cache peer exist check
            toModel.findOne({username: to}, {}, (err, doc) => {
                if (err != null || doc == null)
                    return;
                let chat = {
                    to: to,
                    from: from,
                    msg: String(cmd.chat.msg),
                    stamp: Math.floor((new Date).getTime() / 1000),
                };
                if (conn[to] != null) {
                    conn[to].send(JSON.stringify({type: "chat_msg", chat: chat}));
                }
                if (conn[from] != null) {
                    conn[from].send(JSON.stringify({type: "chat_msg", chat: chat}));
                }
                let doctor = ws.user.type === "doctor" ? from : to,
                    patient = ws.user.type === "doctor" ? to : from;
                let key = doctor + " " + patient;
                if (conversationCache[key] != null) {
                    Message({
                        cid: conversationCache[key],
                        msg: chat.msg,
                        fromDoctor: doctor === from,
                        stamp: chat.stamp,
                    }).save();
                } else {
                    Conversation.findOneAndUpdate(
                        {doctor: doctor, patient: patient},
                        {},
                        {upsert: true, new: true,},
                        (err, doc) => {
                            if (err != null || doc == null)
                                return;
                            conversationCache[key] = doc._id;
                            Message({
                                cid: conversationCache[key],
                                msg: chat.msg,
                                fromDoctor: doctor === from,
                                stamp: chat.stamp,
                            }).save();
                        });
                }
            });
        }
            break;
        default:
            ws.send({type: "err", msg: "Illegal msg"});
    }
}

router.post("/conversations", function (req, res) {
    if (!req.isAuthenticated()) {
        res.json({success: false, error: "Auth error"});
        return;
    }
    Conversation.find({[req.user.type]: req.user.username},
        {_id: false},
        (err, conversations) => {
            if (err != null) {
                res.json({success: false,});
            } else {
                res.json({
                    success: true,
                    conversations: conversations || [],
                });
            }
        }
    );
});

router.post("/history", function (req, res) {
    if (!req.isAuthenticated()) {
        res.json({success: false, error: "Auth error"});
        return;
    }
    req.checkBody("peer", "Invalid peer").notEmpty().trim();
    const errors = req.validationErrors();
    if (errors) {
        let error_msgs = errors.map(function (err) {
            return err.msg;
        });
        res.json({success: false, error: error_msgs});
        return;
    }
    let doctor = req.user.type === "doctor" ? req.user.username : req.body["peer"],
        patient = req.user.type === "doctor" ? req.body["peer"] : req.user.username;
    Conversation.findOne({doctor: doctor, patient: patient},
        (err, conversation) => {
            if (err != null || conversation == null) {
                res.json({success: false,});
            } else {
                Message.find({cid: conversation._id}, (err, docs) => {
                    if (err != null || docs == null) {
                        res.json({success: true, history: []});
                    } else {
                        let history = docs.map((msg) => ({
                            to: msg.fromDoctor === true ? patient : doctor,
                            from: msg.fromDoctor === true ? doctor : patient,
                            msg: msg.msg,
                            stamp: msg.stamp,
                        }));
                        history.sort((chat1, chat2) => chat1.stamp - chat2.stamp);
                        res.json({
                            success: true,
                            history: history,
                        });
                    }
                });
            }
        });
});

module.exports = router;
