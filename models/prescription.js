const mongoose = require("mongoose");

const PrescriptionSchema = mongoose.Schema({
    patient: {type: String, required: true,},
    doctor: {type: String, required: true,},
    toi: {type: Number, required: true,},
    content: {
        type: [{
            drug: {type: String, required: true},
            count: {type: Number, required: true},
            dosage: {type: String, enum: ["001", "010", "011", "100", "101", "110", "111",]},
            note: String,
        }],
        required: true,
        validate: {
            validator: function (arr) {
                return arr.length !== 0;
            },
            message: () => "Empty content",
        },
    },
    note: String,
});

module.exports = mongoose.model("Prescription", PrescriptionSchema);
