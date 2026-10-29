const mongoose = require("mongoose");
const AppError = require('../functions/AppError');

const CONNECT_TIMEOUT_MS = 5000;

// The connection is cached so serverless invocations reuse the same socket.
// A failed attempt clears the cache so the next request can retry instead of
// inheriting a permanently rejected promise.
let connectionPromise = null;

function connectDB() {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        return Promise.reject(AppError.unavailable('database is not configured'));
    }

    if (!connectionPromise) {
        connectionPromise = mongoose
            .connect(uri, { serverSelectionTimeoutMS: CONNECT_TIMEOUT_MS })
            .catch((error) => {
                connectionPromise = null;
                throw AppError.unavailable('database unavailable', { cause: error });
            });
    }

    return connectionPromise;
}

mongoose.connection.on('connected', () => {
    console.log("[^] Database Connected")
})

mongoose.connection.on('error', (error) => {
    console.error("[x] Database error:", error.message)
})

module.exports = { connectDB };
