const express = require("express");
const router = express.Router();

const conn = {};

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
            // Todo: backup chat to DB
            if (conn[to] != null) {
                conn[to].send(JSON.stringify({type: "chat_msg", chat: chat}));
            }
            if (conn[from] != null) {
                conn[from].send(JSON.stringify({type: "chat_msg", chat: chat}));
            }
        }
            break;
        default:
            ws.send({type: "err", msg: "Illegal msg"});
    }
}

router.post("/history", function (req, res) {
    req.checkBody("peer", "Invalid peer").notEmpty().trim();
    const errors = req.validationErrors();
    if (errors) {
        let error_msgs = errors.map(function (err) {
            return err.msg;
        });
        res.json({success: false, error: error_msgs});
        return;
    }
});

module.exports = router;
