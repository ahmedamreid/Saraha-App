import mongoose from 'mongoose';

/*
 * Serverless functions are frozen and thawed between invocations, so a
 * connection opened on one cold start should be reused rather than reopened.
 * The cache is parked on globalThis because the module registry is not
 * guaranteed to survive across invocations, but the global object usually is.
 */
let cached = globalThis._mongoose;

if (!cached) {
    cached = globalThis._mongoose = { conn: null, promise: null };
}

export async function dbConnection() {
    if (cached.conn) return cached.conn;

    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error(
            'MONGODB_URI is not set. Add it to your .env file locally, or to the ' +
            'project Environment Variables (Production scope) on your host.'
        );
    }

    if (!cached.promise) {
        cached.promise = mongoose
            .connect(uri, { bufferCommands: false })
            .then((m) => {
                console.log('Saraha Server Connected!');
                return m;
            })
            .catch((err) => {
                /* Clear the cached promise so the next request can retry */
                cached.promise = null;
                throw err;
            });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}
