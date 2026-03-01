import express from 'express';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import session from 'express-session';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';

import { getDB, getPostsCollection, getCounterCollection, POSTS } from './util/db.js';
import { runListGet, runAddPost } from './util/util.js'
import path from 'path'
import { fileURLToPath } from 'url'
import {User} from "./util/user.js"

// routes
import { createApiRouter } from './routes/api.js';
import { createRouter } from './routes/router.js';

const db = await getDB();

const app = express();

// recreate __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(session({ // Auth information, do not move
  secret: "supersecretkey",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.use(async (req, res, next) => { //middleware for the User's username so that it can be referenced in other pages
    if (req.session.userId) {
        res.locals.currentUser = await User.findById(req.session.userId);
    }
    next();
});

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json()); // Will remove if I find it elsewhere
app.use(express.urlencoded({ extended: true }))
app.use('/public', express.static('public'));

// added styles folder to serve static CSS files
app.use('/styles', express.static(path.join(__dirname, 'views/styles')));

app.use(methodOverride('_method'))

// static files: We might need this
//app.use(express.static(path.join(__dirname, 'public')))

app.use('/api', createApiRouter(db));
app.use('/', createRouter(db));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

console.log("Connecting to Mongo...");
try{
  await mongoose.connect(process.env.CONNECTION_STRING);
  console.log("Mongo Connected!");
} catch(e){
  console.error("Connection failed: ",e);
}
app.listen(5500, function () {
  console.log('listening on 5500')
});
