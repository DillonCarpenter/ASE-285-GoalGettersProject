import { getPostsCollection, getCounterCollection } from './db.js';
import { User } from "./user.js";

export async function runListGet(req, resp) {
  try {
    const posts = getPostsCollection();
    const res = await posts
      .find({ userId: req.session.userId })
      .sort({ _id: -1 })
      .toArray();

    const query = { posts: res };
    resp.render('list.ejs', query);
  } catch (e) {
    console.error(e);
  }
}

export async function runAddPost(req, resp) {
  try {
    const counter = getCounterCollection();
    const posts = getPostsCollection();
    const user = await User.findById(req.session.userId);
    const username = user.username;

    await counter.findOneAndUpdate(
      { name: 'count' },
      { $inc: { count: 1 } },
      { returnDocument: 'after', upsert: true }
    );

    const newPost = {
      title: req.body.title,
      description: req.body.description || "",
      date: req.body.date,
      category: req.body.category,
      completed: typeof req.body.completed === "boolean" ? req.body.completed : false,
      user: username,
      userId: req.session.userId,
      recurrence: req.body.recurrence || "none",
      recurrenceDurationValue: req.body.recurrenceDurationValue ?? null,
      recurrenceDurationUnit: req.body.recurrenceDurationUnit ?? null,
      recurrenceEndDate: req.body.recurrenceEndDate ?? null,
      nextGenerated: typeof req.body.nextGenerated === "boolean" ? req.body.nextGenerated : false
    };

    console.log(newPost);
    await posts.insertOne(newPost);
  } catch (e) {
    console.error(e);
  }
}