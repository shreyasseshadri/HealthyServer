const LocalStrategy = require("passport-local").Strategy;
const Patient = require("../models/patient");
const Doctor = require("../models/doctor");
const crypt = require("bcrypt-nodejs");

function checkPassword(password, hash) {
    return crypt.compareSync(password, hash);
}

module.exports = function (passport) {
    passport.serializeUser(function (user, done) {
        done(null, JSON.stringify({type: user.type, _id: user._id}));
    });

    passport.deserializeUser(function (id, done) {
        done(null, JSON.parse(id));
    });

    passport.use("PatientAuth",
        new LocalStrategy(function (username, password, done) {
            Patient.findOne({username: username}, (err, doc) => {
                if (err)
                    return done(err);
                if (!doc || !checkPassword(password, doc.password))
                    return done(null, false);
                return done(null, Object.assign(doc.toObject(), {
                    password: undefined,
                    __v: undefined,
                    type: "patient",
                }));
            });
        })
    );

    passport.use("DoctorAuth",
        new LocalStrategy(function (username, password, done) {
            Doctor.findOne({username: username}, (err, doc) => {
                if (err)
                    return done(err);
                if (!doc || !checkPassword(password, doc.password))
                    return done(null, false);
                return done(null, Object.assign(doc.toObject(), {
                    password: undefined,
                    __v: undefined,
                    type: "doctor",
                }));
            });
        })
    );
};