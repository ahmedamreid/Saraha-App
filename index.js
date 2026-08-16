import 'dotenv/config'
process.on('uncaughtException', (error) => {
    console.error('Caught exception:', error);
})
import path from 'node:path'
import express from 'express'
import { dbConnection } from "./database/dbConnection.js";
import homeRouter from './src/modules/home/home.routes.js';
import messageRouter from './src/modules/message/message.routes.js';
import loginRouter from './src/modules/login/login.routes.js';
import registerRouter from './src/modules/register/register.routes.js';
import userRouter from './src/modules/user/user.routes.js';
import session from 'express-session'
import mongoSession from 'connect-mongodb-session'
import cors from 'cors'
let MongoDBStore = mongoSession(session)



var store = new MongoDBStore({
    uri: process.env.MONGODB_URI,
    collection: 'mySessions'
});

store.on('error', (error) => {
    console.error('Session store error:', error);
});

const app = express()
const port = process.env.PORT || 3980
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Absolute paths: the serverless working directory is not the project root */
app.set("views", path.join(process.cwd(), "views"));
app.use("/public", express.static(path.join(process.cwd(), "public")));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store,
    cookie: {
        maxAge: 7200000
    }
}))

app.use(cors())
app.use(homeRouter)
app.use(loginRouter)
app.use(registerRouter)
app.use(messageRouter)
app.use(userRouter)
app.use('*', (req, res) => {
    res.render("error.ejs", { session: null })
})

process.on('unhandledRejection', (error) => {
    console.error('Caught rejection:', error);
})

/* Vercel imports the app as a handler; only listen when running locally */
if (!process.env.VERCEL) {
    app.listen(port, () => console.log(`Example app listening on port ${port}!`))
}

export default app
