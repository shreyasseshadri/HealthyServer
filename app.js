const createError = require("http-errors");
const express = require("express");
const expressValidator = require("express-validator");
const path = require("path");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");

const registerRouter = require("./routes/register");
const authRouter = require("./routes/auth");
const infoRouter = require("./routes/info");

mongoose.connect(process.env.MONGO_LOC, {useNewUrlParser: true});
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

const sessionConfig = {
    secret: "SECRET",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60000 * 60
    },
};

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

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(session(sessionConfig));
app.use(allowCrossDomain);
app.use("/register", registerRouter);
app.use("/auth", authRouter);
app.use("/info", infoRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

module.exports = app;
