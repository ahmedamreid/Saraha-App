import 'dotenv/config'
process.on('uncaughtException', (error) => {
    console.error('Caught exception:', error);
})
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

const app = express()
const port = process.env.PORT || 3980
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/public", express.static("public")); /*For Development */
// app.set("views", path.resolve() + "/views")/*For Vercel Production */
// app.use(express.static(path.join(path.resolve(), "public"))); /*For Vercel Production */

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
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
