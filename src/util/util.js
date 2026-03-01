import { getPostsCollection, getCounterCollection } from './db.js';
import {User} from "./user.js"



export async function runListGet(req, resp) {
  try {
    const posts = getPostsCollection();
    const res = await posts.find({ userId: req.session.userId }).toArray();
    const query = { posts: res };
    resp.render('list.ejs', query)
  } catch (e) {
    console.error(e);
  }
}

export async function runAddPost(req, resp) {
  try {
    const counter = getCounterCollection();
    const posts = getPostsCollection();
    const category = req.body.category;
    const user = await User.findById(req.session.userId);
    const username = user.username;
    
    // 1. Increase counter and get the NEW value in one atomic step
    const result = await counter.findOneAndUpdate(
      { name: 'count' },
      { $inc: { count: 1 } },
      { returnDocument: 'after', upsert: true }
    );

    const newPost = {
      title: req.body.title,
      date: req.body.date,
      category: req.body.category,
      completed: false,
      user: username,
      userId: req.session.userId
    };
    console.log(newPost);
    await posts.insertOne(newPost);

  } catch (e) {
    console.error(e);
  }
}