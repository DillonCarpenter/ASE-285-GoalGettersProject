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
    await posts.updateOne(
      { _id: id },
      { $set: { title: req.body.title, date: req.body.date, category: req.body.category } }
    );
    console.log('app.put.edit: Update complete')
    resp.redirect('/list')
  });


  return router;
}
