const mongoose = require("mongoose");

const MessageSchema = mongoose.Schema({
    cid: {type: mongoose.Schema.Types.ObjectId, ref: "Conversation", require: true,},
    msg: {type: String, required: true,},
    from1: {type: Boolean, require: true,},
    stamp: {type: Number, required: true,},
});

module.exports = mongoose.model("Message", MessageSchema);
