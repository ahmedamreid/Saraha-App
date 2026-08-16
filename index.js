import 'dotenv/config'
import crypto from 'node:crypto'
import path from 'node:path'
import express from 'express'
import session from 'express-session'
import mongoSession from 'connect-mongodb-session'
import cors from 'cors'
import { dbConnection } from "./database/dbConnection.js";
import homeRouter from './src/modules/home/home.routes.js';
import messageRouter from './src/modules/message/message.routes.js';
import loginRouter from './src/modules/login/login.routes.js';
import registerRouter from './src/modules/register/register.routes.js';
import userRouter from './src/modules/user/user.routes.js';

/*
 * These are registered after the imports above have already been evaluated
 * (ES modules hoist imports), so they cannot catch a module-load failure.
 * Nothing above this line should throw at import time.
 */
process.on('uncaughtException', (error) => {
    console.error('Caught exception:', error);
})
process.on('unhandledRejection', (error) => {
    console.error('Caught rejection:', error);
})

const app = express()
const port = process.env.PORT || 3980

let MongoDBStore = mongoSession(session)

/*
 * Constructing the store with an undefined uri throws, so only build it when
 * the variable is present. Without it the app still boots and can report the
 * real problem instead of crashing the whole function.
 */
let store
if (process.env.MONGODB_URI) {
    store = new MongoDBStore({
        uri: process.env.MONGODB_URI,
        collection: 'mySessions'
    });
    store.on('error', (error) => {
        console.error('Session store error:', error);
    });
} else {
    console.error('MONGODB_URI is not set - sessions will not persist.');
}

let sessionSecret = process.env.SESSION_SECRET
if (!sessionSecret) {
    /* A random per-boot secret: sessions drop on restart, but no fixed
     * secret ends up committed or shared across deployments. */
    sessionSecret = crypto.randomBytes(32).toString('hex')
    console.error('SESSION_SECRET is not set - using a temporary random secret.');
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Absolute paths: the serverless working directory is not the project root */
app.set("views", path.join(process.cwd(), "views"));
app.use("/public", express.static(path.join(process.cwd(), "public")));

app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    ...(store ? { store } : {}),
    cookie: {
        maxAge: 7200000
    }
}))

app.use(cors())

/* Connect lazily, per request, instead of as an import side effect */
app.use(async (req, res, next) => {
    try {
        await dbConnection()
        next()
    } catch (error) {
        next(error)
    }
})

app.use(homeRouter)
app.use(loginRouter)
app.use(registerRouter)
app.use(messageRouter)
app.use(userRouter)
app.use('*', (req, res) => {
    res.status(404).render("error.ejs", { session: null })
})

/* Anything thrown in a handler lands here instead of killing the function */
app.use((error, req, res, next) => {
    console.error('Request failed:', error);
    res.status(500).render("error.ejs", { session: null })
})

/* Vercel imports the app as a handler; only listen when running locally */
if (!process.env.VERCEL) {
    app.listen(port, () => console.log(`Example app listening on port ${port}!`))
}

export default app
