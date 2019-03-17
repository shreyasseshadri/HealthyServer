const mongoose = require("mongoose");

// Todo: Partition conversations according to date
const ConversationSchema = mongoose.Schema({
    doctor: {type: String, required: true},
    patient: {type: String, required: true},
});

module.exports = mongoose.model("Conversation", ConversationSchema);
