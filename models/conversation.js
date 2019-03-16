const mongoose = require("mongoose");

// Note: peer1 < peer2
// Todo: Partition conversations according to date
const ConversationSchema = mongoose.Schema({
    peer1: {type: String, required: true},
    peer2: {type: String, required: true},
});

module.exports = mongoose.model("Conversation", ConversationSchema);
