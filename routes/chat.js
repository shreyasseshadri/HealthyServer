const express = require("express");
const router = express.Router();

router.ws("/", function (ws, req) {
    if (!req.isAuthenticated())
        ws.terminate();
    ws.user = req.user;
    ws.on("message", (msg) => {
        process(ws, msg);
    });
    ws.on("error", function () {
    });
    ws.on("close", function () {
    });
});

function process(ws, msg) {
    console.log(ws.user, msg)
}

module.exports = router;
