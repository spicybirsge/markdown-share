const mongoose = require("mongoose");

const shares = new mongoose.Schema({
    _id: String,
    title: String,
    description: String,
    content: String,
    createdAt: String,
    views: Array,
    unlisted: Boolean,
    // where the share was created: "web" for the editor, "mcp" for agent clients
    source: { type: String, default: "web" },
    // optional label for the client that created an mcp share
    clientName: String,
    // replay guard for clients that retry a create after a timeout
    idempotencyKey: String
})

// Sparse so the shares without a key (every share created so far, and every
// share created from the web editor) do not collide on a missing value.
shares.index({ idempotencyKey: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Shares", shares)
