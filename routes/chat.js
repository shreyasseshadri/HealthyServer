const express = require("express");
const router = express.Router();
const Conv = require("../models/conversation");
const Message = require("../models/message");

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
            let chat = {
                to: to,
                from: from,
                msg: String(cmd.chat.msg),
                stamp: Math.floor((new Date).getTime() / 1000),
            };
            // Todo: check if patient-doctor pair
            if (conn[to] != null) {
                conn[to].send(JSON.stringify({type: "chat_msg", chat: chat}));
            }
            if (conn[from] != null) {
                conn[from].send(JSON.stringify({type: "chat_msg", chat: chat}));
            }
            let params = msgHelper(to, from);
            if (conversationCache[params.key] != null) {
                Message({
                    cid: conversationCache[params.key],
                    msg: chat.msg,
                    from1: params.peer1 === from,
                    stamp: chat.stamp,
                }).save();
            } else {
                // Todo: verify to-peer exists
                Conv.findOneAndUpdate(
                    {peer1: params.peer1, peer2: params.peer2},
                    {},
                    {upsert: true, new: true,},
                    (err, doc) => {
                        if (err != null || doc == null)
                            return;
                        conversationCache[params.key] = doc._id;
                        Message({
                            cid: conversationCache[params.key],
                            msg: chat.msg,
                            from1: params.peer1 === from,
                            stamp: chat.stamp,
                        }).save();
                    });
            }
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
    let params = msgHelper(req.user.username, req.body["peer"]);
    Conv.findOne({peer1: params.peer1, peer2: params.peer2}, (err, conversation) => {
        if (err != null || conversation == null) {
            res.json({success: true, history: []});
        } else {
            Message.find({cid: conversation._id}, (err, docs) => {
                if (err != null || docs == null) {
                    res.json({success: true, history: []});
                } else {
                    let history = docs.map((msg) => ({
                        to: msg.from1 === true ? params.peer2 : params.peer1,
                        from: msg.from1 === true ? params.peer1 : params.peer2,
                        msg: msg.msg,
                        stamp: msg.stamp,
                    }));
                    history.sort(function (chat1, chat2) {
                        return chat1.stamp - chat2.stamp;
                    });
                    res.json({
                        success: true,
                        history: history,
                    });
                }
            });
        }
    });
});

function msgHelper(tmp1, tmp2) {
    let ret = {
        peer1: tmp1 < tmp2 ? tmp1 : tmp2,
        peer2: tmp1 < tmp2 ? tmp2 : tmp1
    };
    ret.key = ret.peer1 + " " + ret.peer2;
    return ret;
}

module.exports = router;
