import express from "express";
import { ObjectId } from "mongodb";
import { getPostsCollection, getCounterCollection } from '../util/db.js';
import { runAddPost, runListGet } from "../util/util.js";

export function createRouter(db) {
  const router = express.Router();
  const posts = getPostsCollection();
  const counter = getCounterCollection();

  const parseObjectId = (value) => {
    if (!ObjectId.isValid(value)) return null;
    return new ObjectId(value);
  };

  router.get('/', function (_, resp) {
    try {
      resp.render('index.ejs')
    } catch (e) {
      console.error(e);
    }
  });

  router.post('/add', async function (req, resp) {
    try {
      await runAddPost(req);
      // Changed inital redirect to list page
      resp.redirect('/list');
    } catch (e) {
      console.error(e);
      resp.status(500).send('Error');
    }
  });

  router.get('/list', function (req, resp) {
    runListGet(req, resp);
  });



  router.patch("/toggle-complete", async (req, resp) => {
    const id = parseObjectId(req.body._id);
    if (!id) return resp.status(400).send({ error: "invalid id" });

    try {
      const post = await posts.findOne({ _id: id });
      if (!post) return resp.status(404).send({ error: "not found" });

      const next = !post.completed;

      await posts.updateOne(
        { _id: id },
        { $set: { completed: next } }
      );

      resp.json({ ok: true, completed: next });
    } catch (e) {
      console.error(e);
      resp.status(500).send({ error: "toggle error" });
    }
  });


  router.delete('/delete', async function (req, resp) {
    const id = parseObjectId(req.body._id);
    if (!id) {
      resp.status(400).send({ error: 'invalid id' });
      return;
    }
    try {
      await posts.deleteOne({ _id: id });

      const query = { name: 'Total Post' };
      const stage = { $inc: { totalPost: -1 } };
      await counter.updateOne(query, stage);

      console.log('Delete complete')
      resp.send('Delete complete')
    }
    catch (e) {
      console.error(e);
    }
  });

  router.get('/detail/:id', async function (req, resp) {
    const id = parseObjectId(req.params.id);
    if (!id) {
      resp.status(400).send({ error: 'invalid id' });
      return;
    }
    try {
      let res = await posts.findOne({ _id: id })
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

  router.put('/edit', async function (req, resp) {
    const id = parseObjectId(req.body.id);
    if (!id) {
      resp.status(400).send({ error: 'invalid id' });
      return;
    }

    const allowed = new Set(["School", "Work", "Personal", "Others"]);
    const category = (req.body.category || "").trim();
    if (!allowed.has(category)) {
      return resp.status(400).send({ error: "invalid category" });
    }

    await posts.updateOne(
      { _id: id },
      { $set: { title: req.body.title, date: req.body.date, category } }
    );

    console.log('app.put.edit: Update complete');
    resp.redirect('/list');
  });
  
  // API for JSON
  
  router.get('/listjson', async function (req, resp) {
    try {
      const res = await posts.find().toArray();
      resp.send(res)
    } catch (e) {
      console.error(e);
    }
  });
  router.get('/login',(req, res) => {
    if(req.session.userId) return res.redirect('/');
    res.render("login");
  });
  router.get('/signup',(req, res)=>{
    res.render('signup')
  });
  //start of login route blocks; may need to be moved
  router.post("/login", async (req, resp) =>{
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
  
  router.post("/signup", async (req, resp)=>{
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

  return router;
}
