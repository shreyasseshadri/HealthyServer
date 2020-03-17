const express = require("express");
const expressValidator = require("express-validator");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.connect(process.env.MONGO_LOC, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

require("./config/passport")(passport);

const allowCrossDomain = function (req, res, next) {
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,PATCH,OPTIONS");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Authorization, credentials");
    if ("OPTIONS" === req.method) {
        res.sendStatus(200);
    } else {
        next();
    }
};
const app = express();
const httpServer = require('http').Server(app);
require("express-ws")(app, httpServer);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
    secret: process.env.SECRET,
    saveUninitialized: true,
    resave: true,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(allowCrossDomain);

const registerRouter = require("./routes/register");
const authRouter = require("./routes/auth");
const infoRouter = require("./routes/info");
const chatRouter = require("./routes/chat");
const prescriptionRouter = require("./routes/prescription");

app.use("/register", registerRouter);
app.use("/auth", authRouter);
app.use("/info", infoRouter);
app.use("/prescription", prescriptionRouter);
app.use("/chat", chatRouter);

// error handler
app.use(function (req, res) {
    res.status(404);
    res.end();
});

module.exports = {app: app, httpServer: httpServer};
