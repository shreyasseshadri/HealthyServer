const mongoose = require('mongoose');

const DoctorSchema = mongoose.Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true,},
    email: {type: String, required: true, unique: true,},
    name: {type: String, required: true,},
    dob: {type: String, required: true,},
    phone: {type: String, required: true, unique: true,},
    qualifications: {type: String, required: true,},
    specializations: {type: String, required: true,},
});

module.exports = mongoose.model('Doctor', DoctorSchema);
