import express from "express";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import { getPostsCollection, getCounterCollection } from '../util/db.js';
import { runAddPost, runListGet } from "../util/util.js";
import { User } from "../util/user.js";

export function createRouter(db) {
  const router = express.Router();
  const posts = getPostsCollection();
  const counter = getCounterCollection();

  const requireCurrentUser = (req, res, next) => {
    if (!res.locals.currentUser) {
      return res.redirect('/login');
    }
    next();
  };

  const parseObjectId = (value) => {
    if (!ObjectId.isValid(value)) return null;
    return new ObjectId(value);
  };

  const parseSafeDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(`${dateString}T00:00:00`);
    return isNaN(date.getTime()) ? null : date;
  };

  const formatDateOnly = (date) => {
    return date.toISOString().split("T")[0];
  };

  const getNextDueDate = (currentDate, recurrence) => {
    const date = parseSafeDate(currentDate);
    if (!date) return null;

    if (recurrence === "daily") {
      date.setDate(date.getDate() + 1);
    } else if (recurrence === "weekly") {
      date.setDate(date.getDate() + 7);
    } else if (recurrence === "monthly") {
      date.setMonth(date.getMonth() + 1);
    } else {
      return null;
    }

    return formatDateOnly(date);
  };

  const getRecurrenceEndDate = (startDate, durationValue, durationUnit) => {
    const date = parseSafeDate(startDate);
    const value = Number(durationValue);

    if (!date || !value || value < 1) return null;

    if (durationUnit === "weeks") {
      date.setDate(date.getDate() + (value * 7));
    } else if (durationUnit === "months") {
      date.setMonth(date.getMonth() + value);
    } else {
      date.setFullYear(date.getFullYear() + value);
    }

    date.setDate(date.getDate() - 1);
    return formatDateOnly(date);
  };

  const shouldGenerateNextTask = (task, nextDate) => {
    if (!task.recurrence || task.recurrence === "none") return false;
    if (!nextDate) return false;
    if (!task.recurrenceEndDate) return true;

    const next = parseSafeDate(nextDate);
    const end = parseSafeDate(task.recurrenceEndDate);

    if (!next || !end) return false;
    return next.getTime() <= end.getTime();
  };

  router.get('/', requireCurrentUser, async function (req, resp) {
    try {
      if (!req.session.userId) {
        return resp.redirect("/login");
      }

      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      const userTasks = await posts
        .find({ userId: req.session.userId })
        .sort({ _id: -1 })
        .toArray();

      const todaysTasks = userTasks
        .filter((task) => {
          const taskDate = String(task.date || '').trim().slice(0, 10);
          return taskDate === today;
        })
        .slice(0, 5);

      const comingSoonTasks = userTasks
        .filter((task) => {
          const taskDate = String(task.date || '').trim().slice(0, 10);
          return taskDate > today;
        })
        .sort((a, b) => {
          const dateA = String(a.date || '').trim().slice(0, 10);
          const dateB = String(b.date || '').trim().slice(0, 10);
          if (dateA !== dateB) return dateA.localeCompare(dateB);
          return Number(a.completed) - Number(b.completed);
        })
        .slice(0, 5);

      resp.render("index", { today, todaysTasks, comingSoonTasks });
    } catch (e) {
      console.error(e);
      resp.status(500).send('Error loading home page.');
    }
  });

  router.post('/add', requireCurrentUser, async function (req, resp) {
    try {
      const {
        title,
        description,
        date,
        category,
        recurrence,
        recurrenceDurationValue,
        recurrenceDurationUnit
      } = req.body;

      const allowed = new Set(["School", "Work", "Personal", "Others"]);
      const allowedRecurrence = new Set(["none", "daily", "weekly", "monthly"]);
      const allowedDurationUnits = new Set(["weeks", "months", "years"]);
      const today = new Date().toISOString().split("T")[0];

      if (!title || !title.trim()) {
        return resp.status(400).send("Title is required.");
      }

      if (!date) {
        return resp.status(400).send("Date is required.");
      }

      if (date < today) {
        return resp.status(400).send("Date cannot be in the past.");
      }

      if (!allowed.has((category || "").trim())) {
        return resp.status(400).send("Invalid category.");
      }

      const safeRecurrence = (recurrence || "none").trim();
      if (!allowedRecurrence.has(safeRecurrence)) {
        return resp.status(400).send("Invalid recurrence.");
      }

      let safeDurationValue = null;
      let safeDurationUnit = null;
      let recurrenceEndDate = null;

      if (safeRecurrence !== "none") {
        safeDurationValue = Number(recurrenceDurationValue);
        safeDurationUnit = (recurrenceDurationUnit || "years").trim();

        if (!safeDurationValue || safeDurationValue < 1) {
          return resp.status(400).send("Recurring tasks need a valid duration.");
        }

        if (!allowedDurationUnits.has(safeDurationUnit)) {
          return resp.status(400).send("Invalid recurrence duration unit.");
        }

        recurrenceEndDate = getRecurrenceEndDate(date, safeDurationValue, safeDurationUnit);
      }

      req.body = {
        ...req.body,
        title: title.trim(),
        description: description || "",
        date,
        category: category.trim(),
        completed: false,
        recurrence: safeRecurrence,
        recurrenceDurationValue: safeDurationValue,
        recurrenceDurationUnit: safeDurationUnit,
        recurrenceEndDate,
        nextGenerated: false
      };

      await runAddPost(req);
      resp.redirect('/list');
    } catch (e) {
      console.error(e);
      resp.status(500).send('Error');
    }
  });

  router.get('/list', requireCurrentUser, function (req, resp) {
    runListGet(req, resp);
  });

  router.patch("/toggle-complete", requireCurrentUser, async (req, resp) => {
    const id = parseObjectId(req.body._id);
    if (!id) return resp.status(400).send({ error: "invalid id" });

    try {
      const post = await posts.findOne({ _id: id, userId: req.session.userId });
      if (!post) return resp.status(404).send({ error: "not found" });

      const next = !post.completed;
      let generatedTask = null;

      await posts.updateOne(
        { _id: id, userId: req.session.userId },
        { $set: { completed: next } }
      );

      if (
        next &&
        post.recurrence &&
        post.recurrence !== "none" &&
        !post.nextGenerated
      ) {
        const nextDate = getNextDueDate(post.date, post.recurrence);

        if (shouldGenerateNextTask(post, nextDate)) {
          const nextTaskBody = {
            title: post.title,
            description: post.description || "",
            date: nextDate,
            category: post.category || "Personal",
            completed: false,
            userId: req.session.userId,
            recurrence: post.recurrence,
            recurrenceDurationValue: post.recurrenceDurationValue || null,
            recurrenceDurationUnit: post.recurrenceDurationUnit || null,
            recurrenceEndDate: post.recurrenceEndDate || null,
            nextGenerated: false
          };

          await runAddPost({
            ...req,
            body: nextTaskBody
          });

          generatedTask = await posts.findOne(
            {
              userId: req.session.userId,
              title: nextTaskBody.title,
              date: nextTaskBody.date,
              category: nextTaskBody.category,
              completed: false
            },
            { sort: { _id: -1 } }
          );

          await posts.updateOne(
            { _id: id, userId: req.session.userId },
            { $set: { nextGenerated: true } }
          );
        }
      }

      resp.json({
        ok: true,
        completed: next,
        generatedTask
      });
    } catch (e) {
      console.error(e);
      resp.status(500).send({ error: "toggle error" });
    }
  });

  router.delete('/delete', requireCurrentUser, async function (req, resp) {
    const id = parseObjectId(req.body._id);
    if (!id) {
      resp.status(400).send({ error: 'invalid id' });
      return;
    }
    try {
      await posts.deleteOne({ _id: id, userId: req.session.userId });

      const query = { name: 'Total Post' };
      const stage = { $inc: { totalPost: -1 } };
      await counter.updateOne(query, stage);

      console.log('Delete complete');
      resp.send('Delete complete');
    }
    catch (e) {
      console.error(e);
      resp.status(500).send({ error: 'delete error' });
    }
  });

  router.get('/detail/:id', requireCurrentUser, async function (req, resp) {
    const id = parseObjectId(req.params.id);
    if (!id) {
      resp.status(400).send({ error: 'invalid id' });
      return;
    }
    try {
      let res = await posts.findOne({ _id: id, userId: req.session.userId });
      console.log('app.get.detail: Update complete');
      console.log({ data: res });
      if (res != null) {
        resp.render('detail.ejs', { data: res });
      }
      else {
        resp.status(500).send({ error: 'result is null' });
      }
    }
    catch (error) {
      console.log(error);
      resp.status(500).send({ error: 'Error from db.collection().findOne()' });
    }
  });

  router.put('/edit', requireCurrentUser, async function (req, resp) {
    const id = parseObjectId(req.body.id);
    if (!id) {
      return resp.status(400).send({ error: 'invalid id' });
    }

    const {
      title,
      description,
      date,
      recurrence,
      recurrenceDurationValue,
      recurrenceDurationUnit
    } = req.body;

    const allowed = new Set(["School", "Work", "Personal", "Others"]);
    const allowedRecurrence = new Set(["none", "daily", "weekly", "monthly"]);
    const allowedDurationUnits = new Set(["weeks", "months", "years"]);
    const category = (req.body.category || "").trim();
    const today = new Date().toISOString().split("T")[0];

    if (!title || !title.trim()) {
      return resp.status(400).send("Title is required.");
    }

    if (!date) {
      return resp.status(400).send("Date is required.");
    }

    if (date < today) {
      return resp.status(400).send("Date cannot be in the past.");
    }

    if (!allowed.has(category)) {
      return resp.status(400).send("Invalid category.");
    }

    const safeRecurrence = (recurrence || "none").trim();
    if (!allowedRecurrence.has(safeRecurrence)) {
      return resp.status(400).send("Invalid recurrence.");
    }

    let safeDurationValue = null;
    let safeDurationUnit = null;
    let recurrenceEndDate = null;

    if (safeRecurrence !== "none") {
      safeDurationValue = Number(recurrenceDurationValue);
      safeDurationUnit = (recurrenceDurationUnit || "years").trim();

      if (!safeDurationValue || safeDurationValue < 1) {
        return resp.status(400).send("Recurring tasks need a valid duration.");
      }

      if (!allowedDurationUnits.has(safeDurationUnit)) {
        return resp.status(400).send("Invalid recurrence duration unit.");
      }

      recurrenceEndDate = getRecurrenceEndDate(date, safeDurationValue, safeDurationUnit);
    }

    try {
      await posts.updateOne(
        { _id: id, userId: req.session.userId },
        {
          $set: {
            title: title.trim(),
            description: description || "",
            date,
            category,
            recurrence: safeRecurrence,
            recurrenceDurationValue: safeDurationValue,
            recurrenceDurationUnit: safeDurationUnit,
            recurrenceEndDate,
            nextGenerated: false
          }
        }
      );

      console.log('app.put.edit: Update complete');
      resp.redirect('/list');
    } catch (e) {
      console.error(e);
      resp.status(500).send("Error updating task.");
    }
  });

  router.get('/listjson', requireCurrentUser, async function (req, resp) {
    try {
      const res = await posts.find({ userId: req.session.userId }).toArray();
      resp.send(res);
    } catch (e) {
      console.error(e);
    }
  });

  router.get('/login', (req, res) => {
    if (req.session.userId) return res.redirect('/');
    res.render("login");
  });

  router.get('/signup', (req, res) => {
    res.render('signup');
  });

  const handleLogout = (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Logout failed.' });
      }
      res.clearCookie('connect.sid');
      res.redirect('/login');
    });
  };

  router.get('/logout', handleLogout);

  router.post("/login", async (req, resp) => {
    try {
      const { username, password } = req.body;

      const find_user = await User.findOne({ username });
      if (!find_user) return resp.status(400).json({ message: "Error: User Not Found." });
      const isMatch = await bcrypt.compare(password, find_user.password);
      if (!isMatch) return resp.status(400).json({ message: "Error: Invalid credentials." });
      req.session.userId = find_user._id;
      resp.json({ message: "Login successful" });

    } catch (e) {
      console.error(e);
      resp.status(500).json({ error: "Not successful." });
    }
  });
  
  router.post("/signup", async (req, resp)=> {
    try {
      const {username, password} = req.body;

      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return resp.status(409).json({ message: "Error: Username already exists." });
      }

      const hashPass = await bcrypt.hash(password, 10);
      const newUser = new User({
        username,
        password: hashPass
      });
      await newUser.save();
      console.log("User created.");
      resp.json({message: "User created."});
    } catch (e) {
      if (e && e.code === 11000) {
        return resp.status(409).json({ message: "Error: Username already exists." });
      }
      console.error(e);
      resp.status(500).json({ error: "Not successful." });
    }
  });

  return router;
}