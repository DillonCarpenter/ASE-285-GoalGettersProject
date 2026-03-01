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

const db = await getDB();
const posts = getPostsCollection();
const counter = getCounterCollection();

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

app.get('/', async function (req, resp) {
  try {
    if(!req.session.userId) return resp.redirect('/login');
    resp.render("write.ejs");
    
  } catch (e) {
    console.error(e);
  }
});


app.post('/add', async function (req, resp) {
  try {
    await runAddPost(req, resp);
    resp.redirect('/');          // single response
    console.log(resp.locals);
  } catch (e) {
    console.error(e);
    resp.status(500).send('Error');
  }
});

app.get('/list', function (req, resp) {
  runListGet(req, resp);
});

app.delete('/delete', async function(req, resp){
    req.body._id = parseInt(req.body._id); // the body._id is stored in string, so change it into an int value
    console.log(req.body._id);
    try {
        const posts = db.collection(POSTS)
        const res = await posts.deleteOne(req.body); 

        console.log('Delete complete')
        resp.send('Delete complete')
    }
    catch (e) {
        console.error(e);
    } 
});

app.get('/detail/:id', async function (req, resp) {
  try {
    let res = await posts.findOne({ _id: parseInt(req.params.id) })
    // req.params.id contains the value of id
    console.log('app.get.detail: Update complete')
    console.log({ data: res });
    if (res != null) {
      resp.render('detail.ejs', { data: res })
    }
    else {
      console.log(error);
      resp.status(500).send({ error: 'result is null' })
    }
  }
  catch (error) {
    console.log(error)
    resp.status(500).send({ error: 'Error from db.collection().findOne()' })
  }
})

app.get('/edit/:id', async function (req, resp) {
  console.log(req.params)
  try { 
    let res = await posts.findOne({ _id: parseInt(req.params.id) })
    console.log({ data: res })
    if (res != null) {
      resp.render('edit.ejs', { data: res })
    }
    else {
      resp.status(500).send({ error: 'result is null' })
    }
  }
  catch (error) {
    console.log(error)
    resp.status(500).send({ error: 'Error from db.collection().findOne()' })
  }
});

  
app.put('/edit', async function (req, resp) {
  try {
    await posts.updateOne(
      { _id: parseInt(req.body.id) },
      { $set: { title: req.body.title, date: req.body.date} }
    );
    
    console.log('app.put.edit: Update complete');
    resp.redirect('/list');    // ✅ Correct
  } catch (e) {
    console.error(e);
    resp.status(500).send('Update error');
  }
});


// API for JSON

app.get('/listjson', async function (req, resp) {
  try {
    const res = await posts.find().toArray();
    resp.send(res)
  } catch (e) {
    console.error(e);
  }
});
app.get('/login',(req, res) => {
  if(req.session.userId) return res.redirect('/');
  res.render("login");
});
app.get('/signup',(req, res)=>{
  res.render('signup')
});
//start of login route blocks; may need to be moved
app.post("/login", async (req, resp) =>{
  try{
      const {username,password} = req.body;
      
      const find_user = await User.findOne({username});
      if(!find_user) return resp.status(400).json({message: "Error: User Not Found."});
      const isMatch = await bcrypt.compare(password, find_user.password);
      if(!isMatch) return resp.status(400).json({message: "Error: Invalid credentials."});
      req.session.userId = find_user._id;
      resp.json({ message: "Login successful" });

  } catch (e) {
      console.error(e);
      resp.status(500).json({ error: "Not successful." });
  }
});

app.post("/signup", async (req, resp)=>{
    const {username,password} = req.body;
    const hashPass = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      password: hashPass
    });
    await newUser.save();
    console.log("User created.");
    resp.json({message: "User created."})
});

//end of login blocks